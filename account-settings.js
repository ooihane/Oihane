/* Oihane 5.36.9: ajustes de conexión y nombre personal. */
(function(){
'use strict';
let lastProfileCheck=0;
const cleaned=x=>window.oihaneCleanDisplayName?window.oihaneCleanDisplayName(x):String(x||'').trim().replace(/^[\s\"'“”«»‘’]+|[\s\"'“”«»‘’]+$/g,'');
function currentUser(){return localStorage.getItem('oihane_sync_user')||''}
function key(){return 'oihane_display_name_'+currentUser()}
function fallback(){return typeof window.oihaneGreetingName==='function'?window.oihaneGreetingName():'Oihane'}
function displayName(){const u=currentUser();if(!u)return '';return cleaned(localStorage.getItem('oihane_display_name_'+u)||fallback())}
function showStatus(message){const el=document.getElementById('cloudStatus');if(el)el.textContent=message}
window.oihaneToggleSupabasePublicInfo=function(){
 const panel=document.getElementById('oihaneSupabasePublicInfo');if(!panel)return;
 panel.hidden=!panel.hidden;
 const u=document.getElementById('syncUrl'),k=document.getElementById('syncKey'),cfg=syncConfig();
 if(u)u.value=cfg.url;if(k)k.value=cfg.key;
};
async function pullProfile(){
 if(!currentUser()||!syncConfig().access)return;
 if(Date.now()-lastProfileCheck<10000)return;
 lastProfileCheck=Date.now();
 try{
  await refreshCloudToken();
  const rows=await cloudFetch('/rest/v1/oihane_user_profiles?select=display_name&user_id=eq.'+encodeURIComponent(currentUser())+'&limit=1',{method:'GET'});
  const name=Array.isArray(rows)?rows[0]?.display_name:null;
  if(typeof name==='string'&&name.trim()){
   const previous=displayName();
   const normalized=cleaned(name);localStorage.setItem(key(),normalized);
   const input=document.getElementById('oihaneAccountDisplayName');
   if(input&&document.activeElement!==input)input.value=normalized;
   if(previous!==normalized&&screen==='home')home();
  } else {
   const input=document.getElementById('oihaneAccountDisplayName');
   if(input&&!input.value)input.value=fallback();
  }
 }catch(e){console.warn('No se pudo recuperar el nombre de cuenta',e)}
}
async function persistName(){
 const id=currentUser(),input=document.getElementById('oihaneAccountDisplayName');
 if(!id||!input)return true;
 const name=cleaned(input.value).slice(0,48);input.value=name;
 if(!name){showStatus('Indica tu nombre para personalizar el saludo.');return false}
 if(!/^[^\x00-\x1f]{1,48}$/.test(name)){showStatus('El nombre contiene caracteres no válidos.');return false}
 try{
  await refreshCloudToken();
  await cloudFetch('/rest/v1/oihane_user_profiles?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:id,display_name:name,updated_at:new Date().toISOString()})});
  const before=displayName();
  localStorage.setItem(key(),name);
  if(before!==name&&screen==='home')home();
  return true;
 }catch(e){showStatus('El nombre aún no se guardó en Supabase: '+String(e.message||e));return false}
}
window.oihaneSyncPrimary=async function(){
 const button=document.querySelector('button[onclick="oihaneSyncPrimary()"]');
 if(button)button.disabled=true;
 try{
  if(!syncConfig().access){
   showStatus('Iniciando sesión…');
   await cloudAuth('login');
   if(!syncConfig().access)return;
   await new Promise(r=>setTimeout(r,120));
  }
  if(!(await persistName()))return;
  showStatus('Sincronizando datos…');
  await syncCloudAutomatic();
  for(const m of ['Compras','Hogar','Plantas','Recetas','Viajes','Cultura'])window.oihaneFullSharedVisit?.(m);
  showStatus('Sesión Supabase activa. Sincronización solicitada.');
 }finally{if(button)button.disabled=false}
};
document.addEventListener('change',e=>{
 if(e.target&&e.target.id==='oihaneAccountDisplayName'&&currentUser()&&syncConfig().access)persistName();
});
function refreshUI(){
 const elem=document.getElementById('oihaneAccountDisplayName');
 if(elem&&document.activeElement!==elem)elem.value=cleaned(displayName());
 const signup=document.getElementById('oihaneSignupHelp');
 if(signup)signup.hidden=!!syncConfig().access;
 if(syncConfig().access)pullProfile();
}
const oldRestore=window.restoreSettingsIntoUI;
if(typeof oldRestore==='function'){
 window.restoreSettingsIntoUI=function(){const result=oldRestore.apply(this,arguments);refreshUI();return result};
}
window.addEventListener('load',()=>setTimeout(refreshUI,1200));
oihaneSyncRuntime.register('account-profile',reason=>{
 if(reason==='minute')return refreshUI();
 if(reason==='visible')return pullProfile();
},{minute:true,visible:true});
})();