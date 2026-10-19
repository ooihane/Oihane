



/* --- funcionalidad-11 --- */

/* Oihane 5.29.2 — reparación de la pantalla Más.
   Reubica los paneles existentes o crea los que falten; no modifica datos locales. */
(function(){
  
  const settingsMarkup = {
    backup: `<div class="integration-box" data-oihane-setting="backup"><h3>💾 Copias de seguridad y recuperación</h3><div class="integration-actions"><button class="primary" type="button" onclick="exportBackup()">Descargar copia JSON</button><button type="button" onclick="importBackup()">Restaurar / fusionar copia</button><button type="button" onclick="recoverLocalSnapshot()">Recuperar copia local</button></div><div class="integration-status" id="localBackupStatus">Comprobando instantáneas…</div></div>`,
    sync: `<div class="integration-box" data-oihane-setting="sync"><h3>☁️ Sincronización entre dispositivos</h3><div class="field"><label>Correo</label><input id="syncEmail" type="email" autocomplete="email" placeholder="Tu correo"></div><div class="field"><label>Contraseña</label><input id="syncPassword" type="password" autocomplete="current-password" placeholder="Contraseña de tu cuenta"></div><div class="field"><label>Tu nombre</label><input id="oihaneAccountDisplayName" type="text" maxlength="48" autocomplete="name" placeholder="Nombre para el saludo"></div><div class="integration-actions"><button class="primary" type="button" onclick="oihaneSyncPrimary()">Sincronizar</button><button type="button" onclick="cloudLogout()">Desconectar</button><button type="button" onclick="oihaneToggleSupabasePublicInfo()">Ver URL y clave pública</button></div><p class="hint" id="oihaneSignupHelp">¿Aún no tienes cuenta? <a href="#" onclick="event.preventDefault();cloudAuth('signup')">Crear una cuenta</a></p><div id="oihaneSupabasePublicInfo" hidden><div class="field"><label>URL de Supabase</label><input id="syncUrl" type="url" readonly></div><div class="field"><label>Clave pública</label><input id="syncKey" type="text" readonly></div></div><p class="hint oihane-sync-frequency">Sincronización automática: cada 60 segundos con Oihane abierta, al abrirla o recuperar la conexión. Los cambios se envían poco después de guardarse.</p><div class="integration-status" id="cloudStatus"></div></div>`,
    calendar: `<div class="integration-box" data-oihane-setting="calendar"><h3>📅 Calendario y avisos</h3><p>Exporta o importa eventos mediante archivos .ics. Los avisos del navegador dependen de los permisos de iOS; las notificaciones con la aplicación cerrada requieren una configuración adicional.</p><div class="integration-actions"><button class="primary" type="button" onclick="exportCalendarICS()">Exportar calendario para Apple</button><button type="button" onclick="openCalendarImport()">Importar archivo .ics</button><button type="button" onclick="requestNotificationPermission()">Activar avisos mientras Oihane está abierta</button><button class="primary" type="button" onclick="enablePushNotifications()">Activar notificaciones con Oihane cerrada</button><button type="button" onclick="testPushNotification()">Probar notificación push</button><button type="button" onclick="testNotification()">Probar aviso local</button><button type="button" onclick="showIntegrationStatus()">Estado de integraciones</button></div><div class="integration-status" id="notifStatus"></div></div>`,

  };
  function ensureSettings(){
    const app=document.querySelector('#app');
    const header=app&&app.querySelector('.module-header[data-module="Más"]');
    if(!app||!header)return;
    let wrap=app.querySelector('#oihaneSettingsRepair');
    if(!wrap){wrap=document.createElement('div');wrap.id='oihaneSettingsRepair';header.insertAdjacentElement('afterend',wrap);}
    // Reuse cards already rendered by the original module instead of duplicating them.
    const oldBoxes=[...app.querySelectorAll('.integration-box')];
    for(const box of oldBoxes){
      if(wrap.contains(box))continue;
      let key=box.querySelector('#localBackupStatus')?'backup':box.querySelector('#syncUrl')?'sync':box.querySelector('#notifStatus')?'calendar':box.querySelector('#assistantStatus')?'voice':'';
      if(key){box.dataset.oihaneSetting=key;wrap.appendChild(box);}
    }
    app.querySelectorAll('[data-oihane-setting="voice"],.integration-box:has(#assistantStatus)').forEach(el=>el.remove());
    for(const [key,markup] of Object.entries(settingsMarkup)){
      if(!wrap.querySelector(`[data-oihane-setting="${key}"]`)){
        const temp=document.createElement('div');temp.innerHTML=markup.trim();wrap.appendChild(temp.firstElementChild);
      }
    }
    // Keep settings visible above the existing Preferences / Integrations / Privacy sections.
    wrap.style.setProperty('display','grid','important');
    wrap.querySelectorAll('.integration-box').forEach(el=>{el.style.setProperty('display','block','important');el.style.setProperty('visibility','visible','important')});
    try{if(typeof restoreSettingsIntoUI==='function')restoreSettingsIntoUI()}catch(e){console.warn('No se pudieron restaurar los campos de configuración',e)}
    window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
  }
  // Punto de entrada para openModule: evita otro envoltorio global.
  window.oihaneEnsureSettings=ensureSettings;
  // If the page is already showing Más when this repair script runs, repair it in place.
  if(document.querySelector('#app .module-header[data-module="Más"]'))ensureSettings();
})();



/* --- funcionalidad-12 --- */

/* Oihane 5.29.3 — estado real de autenticación y controles de sesión. */
(function(){
  const syncExcluded = /^oihane_(sync_|shared_baseline|mixed_baseline|push_registered|last_version|last_upgrade_at|last_export_at|shown_reminders)/;
  function syncBox(){return document.querySelector('#syncUrl')?.closest('.integration-box')||document.querySelector('[data-oihane-setting="sync"]')||null}
  function setStatus(text){const el=document.querySelector('#cloudStatus');if(el)el.textContent=text}
  function setAuthUI(authed,email,status){
    const box=syncBox(); if(!box)return;
    const buttons=[...box.querySelectorAll('button')];
    const signup=buttons.find(b=>(b.getAttribute('onclick')||'').includes("cloudAuth('signup')"));
    const login=buttons.find(b=>(b.getAttribute('onclick')||'').includes("cloudAuth('login')"));
    const sync=buttons.find(b=>(b.getAttribute('onclick')||'').includes('syncCloudNow'));
    const logout=buttons.find(b=>(b.getAttribute('onclick')||'').includes('cloudLogout'));
    const emailInput=box.querySelector('#syncEmail');
    const passwordInput=box.querySelector('#syncPassword');
    if(signup)signup.hidden=!!authed;
    if(login)login.hidden=!!authed;
    if(logout)logout.hidden=!authed;
    if(sync)sync.disabled=!authed;
    if(emailInput&&emailInput.closest('.field'))emailInput.closest('.field').hidden=!!authed;
    if(passwordInput&&passwordInput.closest('.field'))passwordInput.closest('.field').hidden=!!authed;
    let account=box.querySelector('#oihaneCloudAccount');
    if(!account){account=document.createElement('div');account.id='oihaneCloudAccount';account.className='integration-status';const actions=box.querySelector('.integration-actions');if(actions)actions.insertAdjacentElement('beforebegin',account);else box.appendChild(account)}
    account.hidden=!authed;
    account.textContent=authed?'Cuenta conectada'+(email?' · '+email:'')+' · Sesión Supabase activa':'';
    if(status)setStatus(status);
  }
  async function verifyCloudSession(){
    const c=typeof syncConfig==='function'?syncConfig():{url:'',key:'',access:'',refresh:'',expires:0};
    if(!c.url||!c.key||!c.access){setAuthUI(false,'','Configuración guardada. Inicia sesión para sincronizar.');return false}
    setAuthUI(false,'','Comprobando la sesión de Supabase…');
    try{
      await refreshCloudToken();
      let user=await cloudFetch('/auth/v1/user',{method:'GET'});
      if(!user||!user.id)throw new Error('Supabase no devolvió una cuenta válida.');
      const owner=localStorage.getItem('oihaneAccountOwnerV1');if(owner&&owner!==user.id)throw new Error('Sesión distinta del propietario de los datos locales.');if(!owner)localStorage.setItem('oihaneAccountOwnerV1',user.id);
      localStorage.setItem('oihane_sync_user',user.id);
      setAuthUI(true,user.email,'Sesión Supabase activa.');
      return true;
    }catch(err){
      // Try one token refresh if the first user lookup failed, then verify again.
      try{
        const latest=syncConfig();
        if(latest.refresh){
          localStorage.setItem('oihane_sync_expires','0');
          await refreshCloudToken();
          const user=await cloudFetch('/auth/v1/user',{method:'GET'});
          if(user&&user.id){const owner=localStorage.getItem('oihaneAccountOwnerV1');if(owner&&owner!==user.id)throw new Error('Sesión distinta del propietario local.');if(!owner)localStorage.setItem('oihaneAccountOwnerV1',user.id);localStorage.setItem('oihane_sync_user',user.id);setAuthUI(true,user.email,'Sesión Supabase activa.');return true}
        }
      }catch(_){ }
      ['oihane_sync_access','oihane_sync_refresh','oihane_sync_expires','oihane_sync_user'].forEach(k=>localStorage.removeItem(k));
      setAuthUI(false,'','La sesión ya no es válida. Inicia sesión de nuevo; tus datos locales siguen intactos.');
      return false;
    }
  }
  const originalRestore=window.restoreSettingsIntoUI;
  if(typeof originalRestore==='function'){
    window.restoreSettingsIntoUI=function(){const result=originalRestore.apply(this,arguments);setTimeout(()=>verifyCloudSession(),0);return result};
  }
  const originalAuth=window.cloudAuth;
  if(typeof originalAuth==='function'){
    window.cloudAuth=async function(mode){await originalAuth.apply(this,arguments);if(syncConfig().access)await verifyCloudSession();else setAuthUI(false,'')};
  }
  const originalLogout=window.cloudLogout;
  if(typeof originalLogout==='function'){
    window.cloudLogout=function(){originalLogout.apply(this,arguments);setAuthUI(false,'','Sesión desconectada en este dispositivo. Los datos locales no se han borrado.')};
  }
  
  if(document.querySelector('#syncUrl'))setTimeout(verifyCloudSession,0);
})();