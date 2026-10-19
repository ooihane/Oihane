/* Oihane 5.48.1 — Prueba experimental del modo de escucha de Oihane.
 * Usa SpeechRecognition del navegador, NO un reconocedor local certificado.
 * El proveedor del navegador puede procesar audio en sus servidores.
 * Activación EXPLÍCITA por pulsación. Se suspende cuando la PWA deja de ser visible.
 * iOS puede detener la sesión o volver a solicitar permiso al reiniciar el servicio.
 * No solicita getUserMedia por separado: así evitamos una segunda petición de permiso.
 */
(function () {
  'use strict';
  const WAKE_PHRASE = /(?:^|[\s,.;:!?¡¿])oye[\s,.;:!?¡¿]+(?:oihane|oiane|ohiane|oyane)\b/i;
  const COMMAND_TIMEOUT_MS = 18000;
  const RETRY_WINDOW_MS = 60000;
  const MAX_RETRIES_PER_WINDOW = 3;
  const STANDBY = 'espera', COMMAND = 'orden';
  const state = {
    enabled: false, started: false, mode: STANDBY, rec: null,
    generation: 0, recentRestarts: [], restartTimer: null,
    commandTimer: null, wakeBuffer: '', message: '',
  };

  function visible() { return document.visibilityState !== 'hidden'; }
  function clearTimers() {
    if (state.restartTimer !== null) clearTimeout(state.restartTimer);
    if (state.commandTimer !== null) clearTimeout(state.commandTimer);
    state.restartTimer = null;
    state.commandTimer = null;
  }
  function message() {
    if (!state.enabled) return state.message || 'Oihane desactivada';
    if (!state.started) return 'Oihane: preparando micrófono…';
    return state.mode === COMMAND
      ? 'Oihane activada: di tu orden (18 segundos)'
      : 'Oihane: esperando «¡Oye, Oihane!»';
  }
  function updateUI() {
    const button = document.getElementById('oihaneWakeToggle');
    if (button) {
      const label = state.enabled ? '🎧' : '👂';
      if (button.textContent !== label) button.textContent = label;
      button.classList.toggle('oihane-wake-active', state.enabled);
      button.setAttribute('aria-pressed', String(state.enabled));
      button.setAttribute('aria-label', state.enabled ? 'Detener escucha de Oihane' : 'Activar escucha de Oihane');
      button.title = state.enabled ? 'Detener escucha de Oihane' : 'Activar escucha por frase «¡Oye, Oihane!»';
    }
    const status = document.getElementById('oihaneWakeStatus');
    if (status) {
      const next = message();
      if (status.textContent !== next) status.textContent = next;
      status.hidden = !state.enabled && !state.message;
    }
    const float = document.getElementById('oihaneWakeFloating');
    if (float) {
      float.hidden = !state.enabled || !!document.getElementById('assistant');
      const label = float.querySelector('.oihane-wake-floating-label');
      if (label) {
        const next = state.mode === COMMAND ? 'Oihane · dime la orden' : 'Oihane · escuchando';
        if (label.textContent !== next) label.textContent = next;
      }
    }
  }
  function stop(reason) {
    state.enabled = false;
    state.started = false;
    state.mode = STANDBY;
    state.wakeBuffer = '';
    state.message = reason || '';
    state.generation++;
    clearTimers();
    const rec = state.rec;
    state.rec = null;
    if (rec) { try { rec.abort(); } catch (_) {} }
    updateUI();
  }
  function standby() {
    state.mode = STANDBY;
    state.wakeBuffer = '';
    if (state.commandTimer !== null) clearTimeout(state.commandTimer);
    state.commandTimer = null;
    updateUI();
  }
  function hearWake() {
    state.mode = COMMAND;
    state.wakeBuffer = '';
    if (state.commandTimer !== null) clearTimeout(state.commandTimer);
    state.commandTimer = setTimeout(standby, COMMAND_TIMEOUT_MS);
    updateUI();
  }
  function sendCommand(command) {
    const text = String(command || '').trim().replace(/^[,.;:\s]+/, '');
    if (!text) return;
    // Volver a espera antes de ejecutar: la operación de Gemini puede tardar.
    standby();
    const input = document.getElementById('ask');
    if (input) input.value = '';
    try {
      if (typeof window.handleAssistantCommand === 'function') {
        window.handleAssistantCommand(text);
      } else if (input) {
        input.value = text;
        document.getElementById('assistant')?.requestSubmit();
      }
    } catch (error) {
      state.message = 'No he podido ejecutar esa orden. Puedes intentarlo otra vez.';
      console.warn('Oihane: comando de voz fallido', error);
    }
    updateUI();
  }
  function finalTranscript(transcript) {
    if (!state.enabled) return;
    const phrase = String(transcript || '').trim();
    if (!phrase) return;
    if (state.mode === COMMAND) { sendCommand(phrase); return; }
    // El navegador puede entregar «Oye» y «Oihane» en segmentos diferentes.
    const combined = (state.wakeBuffer ? state.wakeBuffer + ' ' : '') + phrase;
    const hit = WAKE_PHRASE.exec(combined);
    if (hit) {
      hearWake();
      const remainder = combined.slice(hit.index + hit[0].length).replace(/^[\s,.;:!?¡¿]+/, '').trim();
      if (remainder) sendCommand(remainder);
    } else {
      state.wakeBuffer = combined.slice(-120);
    }
  }
  function scheduleRestart() {
    if (!state.enabled || !visible()) return;
    const now = Date.now();
    state.recentRestarts = state.recentRestarts.filter(t => now - t < RETRY_WINDOW_MS);
    if (state.recentRestarts.length >= MAX_RETRIES_PER_WINDOW) {
      stop('iOS ha interrumpido la escucha varias veces. Pulsa 👂 para reactivarla.');
      return;
    }
    state.recentRestarts.push(now);
    const waitMs = [800, 1800, 3500][state.recentRestarts.length - 1];
    state.restartTimer = setTimeout(() => {
      state.restartTimer = null;
      startRecognition();
    }, waitMs);
  }
  function startRecognition() {
    if (!state.enabled || !visible()) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      stop('Este iPhone no ofrece reconocimiento continuo compatible. Usa el micrófono normal.');
      return;
    }
    const generation = ++state.generation;
    let rec;
    try {
      rec = new SR();
      rec.lang = 'es-ES';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
    } catch (_) {
      stop('El reconocimiento continuo no está disponible en este navegador.');
      return;
    }
    state.rec = rec;
    state.started = false;
    const receivedFinal = new Set();
    const current = () => state.enabled && state.generation === generation && state.rec === rec;
    rec.onstart = () => { if (current()) { state.started = true; updateUI(); } };
    rec.onresult = event => {
      if (!current()) return;
      for (let i = event.resultIndex || 0; i < event.results.length; i++) {
        const part = event.results[i];
        if (!part?.isFinal || receivedFinal.has(i)) continue;
        receivedFinal.add(i);
        finalTranscript(part[0]?.transcript);
      }
    };
    rec.onerror = event => {
      if (!current()) return;
      const code = event?.error || 'unknown';
      if (['not-allowed','service-not-allowed','audio-capture'].includes(code)) {
        stop('iOS ha denegado o interrumpido el micrófono. Toca 👂 para intentarlo de nuevo.');
      } else if (code !== 'no-speech' && code !== 'aborted') {
        state.message = 'El reconocimiento tuvo un problema (' + code + ').';
      }
    };
    rec.onend = () => {
      if (!current()) return;
      state.rec = null;
      state.started = false;
      updateUI();
      scheduleRestart();
    };
    try {
      rec.start();
      updateUI();
    } catch (error) {
      if (!current()) return;
      state.rec = null;
      state.started = false;
      if (state.recentRestarts.length) {
        stop('iOS no permite reiniciar el micrófono automáticamente. Pulsa 👂 para continuar.');
      } else {
        stop('No se pudo iniciar la escucha. Revisa el permiso de micrófono.');
      }
    }
  }
  function toggle() {
    if (state.enabled) { stop('Oihane desactivada.'); return; }
    if (!visible()) return;
    if (document.querySelector('.voice-toggle.voice-active')) {
      state.message = 'Termina primero el dictado manual para activar Oihane.';
      updateUI();
      return;
    }
    state.enabled = true;
    state.started = false;
    state.mode = STANDBY;
    state.message = '';
    state.wakeBuffer = '';
    state.recentRestarts = [];
    clearTimers();
    // La primera llamada ocurre dentro del evento de pulsación para respetar iOS.
    startRecognition();
  }
  function mount() {
    const assistant = document.getElementById('assistant');
    if (assistant && !document.getElementById('oihaneWakeToggle')) {
      const control = document.createElement('button');
      control.id = 'oihaneWakeToggle';
      control.type = 'button';
      control.className = 'oihane-wake-control';
      control.setAttribute('aria-pressed', 'false');
      control.addEventListener('click', toggle);
      const mic = assistant.querySelector('.voice-toggle, button[aria-label="Dictar por voz"]');
      if (mic) mic.insertAdjacentElement('afterend', control);
      else assistant.appendChild(control);
      const status = document.createElement('div');
      status.id = 'oihaneWakeStatus';
      status.className = 'oihane-wake-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      assistant.insertAdjacentElement('afterend', status);
    }
    if (!document.getElementById('oihaneWakeFloating')) {
      const float = document.createElement('button');
      float.id = 'oihaneWakeFloating';
      float.className = 'oihane-wake-floating';
      float.type = 'button';
      float.hidden = true;
      float.innerHTML = '<span aria-hidden="true">🎧</span> <span class="oihane-wake-floating-label">Oihane · escuchando</span> <strong>Detener</strong>';
      float.setAttribute('aria-label', 'Detener escucha de Oihane');
      float.addEventListener('click', () => stop('Oihane desactivada.'));
      document.body.appendChild(float);
    }
    updateUI();
  }
  const originalManualVoice = window.startVoiceInput;
  if (typeof originalManualVoice === 'function') {
    window.startVoiceInput = function () {
      if (state.enabled) stop('Escucha de Oihane detenida para utilizar el dictado manual.');
      return originalManualVoice.apply(this, arguments);
    };
  }
  // La PWA puede ir a segundo plano cuando iOS bloquea la pantalla.
  document.addEventListener('visibilitychange', () => {
    if (!visible() && state.enabled) stop('Oihane se ha detenido al salir de la aplicación. Pulsa 👂 para reactivarla.');
  });
  window.addEventListener('pagehide', () => {
    if (state.enabled) stop('Oihane se ha detenido al cerrar la aplicación.');
  });
  const app = document.getElementById('app');
  if (app && typeof MutationObserver === 'function') {
    // Reconstruir el botón si home() sustituye el contenido de #app.
    new MutationObserver(mount).observe(app, {childList: true, subtree: true});
  }
  document.addEventListener('DOMContentLoaded', mount, {once: true});
  mount();
  // Exponer únicamente el estado necesario para pruebas de comportamiento.
  window.oihaneWakeState = () => ({active: state.enabled, listening: state.started, mode: state.mode});
})();
