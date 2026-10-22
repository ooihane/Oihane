/* Oihane 5.48.1 — Prueba experimental del modo de escucha de Oihane.
 * Usa SpeechRecognition del navegador, NO un reconocedor local certificado.
 * El proveedor del navegador puede procesar audio en sus servidores.
 * Activación EXPLÍCITA por pulsación. Se suspende cuando la PWA deja de ser visible.
 * iOS puede detener la sesión o volver a solicitar permiso al reiniciar el servicio.
 * No solicita getUserMedia por separado: así evitamos una segunda petición de permiso.
 */
(function () {
  'use strict';
  const wakeNames = new Set(['oihane','oiane','ohiane','oihana','oyane','ojane','oijane','oihanne','ohijane','oyhane']);
  function distance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old}}return row[b.length]}
  function wakeMatch(text){
    const words=[],re=/[\p{L}\p{N}]+/gu;let m;
    while((m=re.exec(text))!==null)words.push({word:m[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),start:m.index,end:m.index+m[0].length});
    for(let i=0;i+1<words.length;i++){
      if(!['oye','oi','hey'].includes(words[i].word))continue;
      const name=words[i+1].word,extra=words[i+2]?.word;
      if(wakeNames.has(name)||(name.length>=5&&name.length<=8&&distance('oihane',name)<=2))return {start:words[i].start,end:words[i+1].end};
      if(extra&&[['oi','jane'],['oi','hane'],['oy','jane'],['hoy','jane'],['hoy','ana'],['oi','ane']].some(p=>name===p[0]&&extra===p[1]))return {start:words[i].start,end:words[i+2].end};
    }
    return null;
  }
  const COMMAND_TIMEOUT_MS = 18000;
  const RETRY_WINDOW_MS = 60000;
  const MAX_RETRIES_PER_WINDOW = 3;
  const STANDBY = 'espera', COMMAND = 'orden';
  const state = {
    enabled: false, started: false, mode: STANDBY, rec: null,
    generation: 0, recentRestarts: [], restartTimer: null,
    commandTimer: null, wakeBuffer: '', message: '', lastHeard:'', pendingWakeIndex:-1,
    lastRecognitionStart:0, heardDuringRecognition:false, speaking:false,
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
    if(state.speaking)return 'Oihane respondiendo por voz…';
    return state.mode === COMMAND
      ? 'Oihane activada: di tu orden (18 segundos)'
      : (state.lastHeard?'Oihane escucha · Último: '+state.lastHeard:'Oihane: esperando Oye, Oihane');
  }
  function updateUI() {
    const button = document.getElementById('oihaneWakeToggle');
    if (button) {
      const label = state.enabled ? '🎧' : '👂';
      if (button.textContent !== label) button.textContent = label;
      button.classList.toggle('oihane-wake-active', state.enabled);
      button.setAttribute('aria-pressed', String(state.enabled));
      button.setAttribute('aria-label', state.enabled ? 'Detener escucha de Oihane' : 'Activar escucha de Oihane');
      button.title = state.enabled ? 'Detener escucha de Oihane' : 'Activar escucha por frase Oye, Oihane';
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
    state.lastHeard='';
    state.speaking=false;
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
    state.pendingWakeIndex=-1;
    if (state.commandTimer !== null) clearTimeout(state.commandTimer);
    state.commandTimer = null;
    updateUI();
  }
  function hearWake() {
    state.mode = COMMAND;
    state.wakeBuffer = '';
    state.pendingWakeIndex=-1;
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
  function finalTranscript(transcript){
    if(!state.enabled)return;
    const phrase=String(transcript||'').trim();if(!phrase)return;
    if(state.mode===COMMAND){sendCommand(phrase);return;}
    const combined=(state.wakeBuffer?state.wakeBuffer+' ':'')+phrase;
    const hit=wakeMatch(combined);
    if(hit){hearWake();const rest=combined.slice(hit.end).replace(/^[\s,.;:!?¡¿]+/,'').trim();if(rest)sendCommand(rest)}
    else state.wakeBuffer=combined.slice(-120);
  }
  function scheduleRestart(healthy){
    if(!state.enabled||!visible()||state.speaking)return;
    const now=Date.now();state.recentRestarts=state.recentRestarts.filter(t=>now-t<RETRY_WINDOW_MS);
    if(healthy)state.recentRestarts=[];
    if(state.recentRestarts.length>=MAX_RETRIES_PER_WINDOW){stop('iOS ha interrumpido la escucha varias veces. Pulsa 👂 para reactivarla.');return}
    if(!healthy)state.recentRestarts.push(now);
    const wait=healthy?350:[800,1800,3500][state.recentRestarts.length-1];
    state.restartTimer=setTimeout(()=>{state.restartTimer=null;startRecognition()},wait);
  }
  function startRecognition() {
    if (!state.enabled || !visible() || state.speaking) return;
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
    state.pendingWakeIndex=-1;
    state.heardDuringRecognition=false;
    state.lastRecognitionStart=Date.now();
    const receivedFinal = new Set();
    const current = () => state.enabled && state.generation === generation && state.rec === rec;
    rec.onstart = () => { if (current()) { state.started = true; updateUI(); } };
    rec.onresult = event => {
      if (!current()) return;
      for(let i=event.resultIndex||0;i<event.results.length;i++){
        const part=event.results[i];if(!part||receivedFinal.has(i))continue;
        const heard=String(part[0]?.transcript||'').trim();if(!heard)continue;
        state.heardDuringRecognition=true;state.lastHeard=heard.slice(-64);
        if(!part.isFinal){
          if(state.mode===STANDBY&&wakeMatch((state.wakeBuffer?state.wakeBuffer+' ':'')+heard)){
            hearWake();state.pendingWakeIndex=i;
          }
          updateUI();continue;
        }
        receivedFinal.add(i);
        if(state.pendingWakeIndex===i){
          state.pendingWakeIndex=-1;
          const combined=(state.wakeBuffer?state.wakeBuffer+' ':'')+heard,hit=wakeMatch(combined);
          if(hit){const rest=combined.slice(hit.end).replace(/^[\s,.;:!?¡¿]+/,'').trim();if(rest)sendCommand(rest)}
        }else finalTranscript(heard);
        updateUI();
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
      scheduleRestart(state.heardDuringRecognition||Date.now()-state.lastRecognitionStart>=6000);
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
    state.lastHeard = '';
    state.speaking = false;
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
  function pauseForSpeech(){
    if(!state.enabled||state.speaking)return;
    state.speaking=true;
    if(state.restartTimer!==null){clearTimeout(state.restartTimer);state.restartTimer=null}
    if(state.commandTimer!==null){clearTimeout(state.commandTimer);state.commandTimer=null}
    const old=state.rec;state.rec=null;state.started=false;state.generation++;
    if(old){try{old.abort()}catch(_){}}
    updateUI();
  }
  function resumeAfterSpeech(){
    if(!state.enabled||!state.speaking)return;
    state.speaking=false;standby();
    // Wait until iOS finishes audio playback before requesting the microphone again.
    if(visible()&&!state.restartTimer)state.restartTimer=setTimeout(()=>{state.restartTimer=null;startRecognition()},650);
  }
  window.addEventListener('oihane-voice-start',pauseForSpeech);
  window.addEventListener('oihane-voice-end',resumeAfterSpeech);
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
  window.oihaneEnsureWakeControl = mount;
  document.addEventListener('DOMContentLoaded', mount, {once: true});
  mount();
  // Exponer únicamente el estado necesario para pruebas de comportamiento.
  window.oihaneWakeState = () => ({active: state.enabled, listening: state.started, mode: state.mode});
})();
