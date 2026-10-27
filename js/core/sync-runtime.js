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

  const POLL_KEY='oihane_last_active_poll_v1';
  function lastSweep(){
    try{return Number(localStorage.getItem(POLL_KEY)||0)}catch(_){return 0}
  }
  function recordSweep(){
    try{localStorage.setItem(POLL_KEY,String(Date.now()))}catch(_){}
  }
  function trigger(reason) {
    if (document.visibilityState === 'hidden') return;
    // En iOS, volver desde otra app NO significa una nueva apertura.
    // Mantener 3 min entre comprobaciones automaticas aunque la PWA se reinicie.
    const now=Date.now(),last=lastSweep();
    if(last>0&&now-last>=0&&now-last<FREQUENCY_MS)return;
    const eligible=[...jobs.entries()].filter(([,job])=>job.triggers[reason]);
    if(!eligible.length)return;
    recordSweep();
    for(const [id] of eligible)void run(id,reason);
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
