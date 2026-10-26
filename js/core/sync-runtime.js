/* Oihane 5.44.0 — Coordinación de sincronización en primer plano.
 * Un único reloj y listeners para las cuatro sincronizaciones, sin cambiar el
 * esquema remoto, las claves locales ni los algoritmos de resolución de conflictos.
 * iOS puede suspender temporizadores cuando la PWA pasa a segundo plano.
 */
(function () {
  'use strict';
  const FREQUENCY_MS = 180_000;
  const dataKeyPattern = /^oihane_(sync_|shared_baseline|mixed_baseline|push_registered|last_version|last_upgrade_at|last_export_at|shown_reminders)/;
  const jobs = new Map();
  const running = new Map();

  function isDataKey(key) {
    return typeof key === 'string' && key.startsWith('oihane_') && !dataKeyPattern.test(key);
  }

  // Se utiliza exclusivamente para los registros que ya disponen de RLS.
  // El refresh y la petición usan las implementaciones existentes del núcleo.
  async function request(path, options) {
    await refreshCloudToken();
    return cloudFetch(path, options || {method: 'GET'});
  }

  function register(id, fn, triggers) {
    if (!id || typeof fn !== 'function' || jobs.has(id)) {
      throw new Error('Sincronización duplicada o no válida: ' + id);
    }
    jobs.set(id, {fn, triggers: {...triggers}});
  }

  function run(id, reason = 'manual') {
    const job = jobs.get(id);
    if (!job) return Promise.resolve();
    if (running.has(id)) return running.get(id);
    let pending;
    pending = Promise.resolve().then(() => job.fn(reason)).catch(error => {
      console.warn('Oihane: comprobación de ' + id + ' pendiente', error);
    }).finally(() => { if (running.get(id) === pending) running.delete(id); });
    running.set(id, pending);
    return pending;
  }

  function trigger(reason) {
    if (document.visibilityState === 'hidden') return;
    for (const [id, job] of jobs) {
      if (job.triggers[reason]) void run(id, reason);
    }
  }

  window.oihaneSyncRuntime = Object.freeze({
    frequencyMs: FREQUENCY_MS, isDataKey, request, register, run,
    registered: () => Array.from(jobs.keys())
  });
  window.addEventListener('focus', () => trigger('focus'));
  window.addEventListener('online', () => trigger('online'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') trigger('visible');
  });
  window.setInterval(() => trigger('minute'), FREQUENCY_MS);
})();
