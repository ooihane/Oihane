



/* --- oihane-5363-partner-invitations --- */

(function(){
'use strict';
var pendingKey='oihane_invite_pending_session';
try {
 var fromUrl=new URLSearchParams(location.search).get('oihane_invite');
 if(fromUrl && /^[0-9A-Fa-f]{32}$/.test(fromUrl)) {
  sessionStorage.setItem(pendingKey,fromUrl.toUpperCase());
  var nextUrl=new URL(location.href);
  nextUrl.searchParams.delete('oihane_invite');
  history.replaceState(null,'',nextUrl.pathname+nextUrl.search+nextUrl.hash);
 }
} catch(e) {}
function pendingCode(){try{return sessionStorage.getItem(pendingKey)||''}catch(e){return ''}}
function clearPending(){try{sessionStorage.removeItem(pendingKey)}catch(e){}}
async function callRpc(name,body) {
 var cfg=syncConfig();
 if(!cfg.url||!cfg.key||!cfg.access||!localStorage.getItem('oihane_sync_user')){
  throw new Error('Inicia sesión con tu cuenta personal en Ajustes → Sincronización.');
 }
 await refreshCloudToken();
 return cloudFetch('/rest/v1/rpc/'+name,{method:'POST',body:JSON.stringify(body||{})});
}
function mount(){
 var app=document.getElementById('app');
 if(!app||app.querySelector('#oihanePartnerPanel'))return;
 var panel=document.createElement('div');
 panel.className='integration-box';
 panel.id='oihanePartnerPanel';
 panel.innerHTML=
  '<h3>👥 Cuentas vinculadas</h3>'+
  ''+
  '<div class="oihane-partner-controls">'+
  '<div class="oihane-partner-status" id="oihanePartnerState">Comprobando vinculación…</div>'+
  '<button type="button" id="oihanePartnerRefresh">Actualizar estado</button>'+
  '<button type="button" class="primary" id="oihanePartnerCreate">Generar invitación (válida 24 horas)</button>'+
  '<div class="oihane-partner-generated" id="oihanePartnerGenerated" hidden>'+
  '<label>Código de invitación<input id="oihanePartnerCodeOut" readonly autocomplete="off"></label>'+
  '<label>Enlace para compartir<input id="oihanePartnerLinkOut" readonly autocomplete="off"></label>'+
  '<div class="integration-actions"><button type="button" id="oihanePartnerCopyCode">Copiar código</button><button type="button" id="oihanePartnerCopyLink">Copiar enlace</button><button type="button" id="oihanePartnerShare">Compartir</button></div>'+
  '<button type="button" id="oihanePartnerCancel">Anular esta invitación</button></div>'+
  '<label>Introducir código recibido<input id="oihanePartnerCodeIn" maxlength="40" autocapitalize="characters" autocomplete="off" placeholder="Pega el código recibido"></label>'+
  '<button type="button" class="primary" id="oihanePartnerAccept">Aceptar invitación</button>'+
  '<div class="oihane-partner-status" id="oihanePartnerMessage" role="status" aria-live="polite"></div>'+
  '</div>';
 var anchor=app.querySelector('.integration-box');
 if(anchor) anchor.parentNode.insertBefore(panel,anchor);
 else app.appendChild(panel);
 var q=function(selector){return panel.querySelector(selector)};
 if(pendingCode())q('#oihanePartnerCodeIn').value=pendingCode();
 var activeInvitationId='';
 function msg(value){q('#oihanePartnerMessage').textContent=String(value||'')}
 async function status(){
  var cfg=syncConfig();
  if(!cfg.access||!cfg.url||!cfg.key){
   q('#oihanePartnerState').textContent='No hay ninguna cuenta conectada en este dispositivo.';
   q('#oihanePartnerCreate').disabled=true;
   q('#oihanePartnerAccept').disabled=true;return;
  }
  try{
   await refreshCloudToken();
   var rows=await cloudFetch('/rest/v1/oihane_partner_links?select=id,user_a,user_b&status=eq.active&limit=1',{method:'GET'});
   var linked=Array.isArray(rows)&&rows.length>0;
   q('#oihanePartnerState').textContent=linked?'Cuenta vinculada':'Puedes invitar o aceptar una invitación.';
   q('#oihanePartnerCreate').disabled=linked;
   q('#oihanePartnerAccept').disabled=linked;
   if(linked)q('#oihanePartnerGenerated').hidden=true;
  }catch(e){q('#oihanePartnerState').textContent='No se pudo comprobar la vinculación: '+e.message;}
 }
 q('#oihanePartnerRefresh').onclick=status;
 q('#oihanePartnerCreate').onclick=async function(){
  this.disabled=true;msg('Creando invitación…');
  try{
   var result=await callRpc('oihane_invite_create',{});
   if(!result.code||!result.invitation_id)throw new Error('La respuesta de Supabase está incompleta.');
   activeInvitationId=result.invitation_id;
   var link=new URL(location.href);
   link.searchParams.set('oihane_invite',result.code);
   q('#oihanePartnerCodeOut').value=result.code;
   q('#oihanePartnerLinkOut').value=link.href;
   q('#oihanePartnerGenerated').hidden=false;
   msg('Invitación creada. Caduca en 24 horas y solo se podrá utilizar una vez.');
  }catch(e){msg('No se pudo crear: '+e.message)}
  finally{await status()}
 };
 async function copyValue(id){
  var value=q(id).value;
  if(!value)return;
  try{if(navigator.clipboard && navigator.clipboard.writeText)await navigator.clipboard.writeText(value);
   else {q(id).select();document.execCommand('copy');}
   msg('Copiado. Puedes enviárselo a tu pareja.');
  }catch(e){msg('Selecciona el texto y cópialo manualmente.')}
 }
 q('#oihanePartnerCopyCode').onclick=function(){copyValue('#oihanePartnerCodeOut')};
 q('#oihanePartnerCopyLink').onclick=function(){copyValue('#oihanePartnerLinkOut')};
 q('#oihanePartnerShare').onclick=async function(){
  var link=q('#oihanePartnerLinkOut').value;
  if(!link)return;
  try{
   if(navigator.share)await navigator.share({title:'Invitación a Oihane',url:link});
   else await copyValue('#oihanePartnerLinkOut');
  }catch(e){if(e.name!=='AbortError')msg('No se pudo compartir: '+e.message)}
 };
 q('#oihanePartnerCancel').onclick=async function(){
  if(!activeInvitationId)return;
  if(!confirm('¿Anular este código de invitación?'))return;
  try{await callRpc('oihane_invite_cancel',{p_invitation_id:activeInvitationId});
   activeInvitationId='';q('#oihanePartnerGenerated').hidden=true;msg('Invitación anulada.');
  }catch(e){msg('No se pudo anular: '+e.message)}
 };
 q('#oihanePartnerAccept').onclick=async function(){
  var code=q('#oihanePartnerCodeIn').value.replace(/[-\s]/g,'').toUpperCase();
  if(!/^[0-9A-F]{32}$/.test(code)){msg('Introduce el código completo de 32 caracteres.');return}
  if(!confirm('Vincularás tu cuenta con la persona que te ha invitado. Los datos privados seguirán sin compartirse por ahora. ¿Aceptar?'))return;
  this.disabled=true;
  try{
   await callRpc('oihane_invite_accept',{p_code:code});
   clearPending();q('#oihanePartnerCodeIn').value='';msg('Cuentas vinculadas correctamente. Los módulos compartidos siguen desactivados hasta la fase de revisión.');
  }catch(e){msg('No se pudo aceptar: '+e.message)}
  finally{await status()}
 };
 status();
}
var previous=window.renderExtraModule;
if(typeof previous==='function'){
 window.renderExtraModule=function(name,seed){var result=previous.apply(this,arguments);if(name==='Más')mount();return result};
}
if(pendingCode()){
 document.addEventListener('DOMContentLoaded',function(){
  var target=document.getElementById('app');
  if(!target)return;
  var banner=document.createElement('div');
  banner.className='integration-box';banner.id='oihaneIncomingInvitation';
  banner.innerHTML='<strong>Has recibido una invitación para vincular cuentas.</strong><p>Inicia sesión con tu propia cuenta y ábrela desde Ajustes. La invitación no comparte datos sin tu autorización.</p><button type="button" class="primary">Ir a Ajustes</button>';
  var button=banner.querySelector('button');
  button.onclick=function(){if(typeof openModule==='function')openModule('Más')};
  target.prepend(banner);
 });
}
})();
