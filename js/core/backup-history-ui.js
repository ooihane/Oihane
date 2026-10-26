/* Oihane 5.59.12: copias historicas privadas con seleccion por fecha. */
(function(){
'use strict';
const modules={compras:'oihane_products',calendario:'oihane_events',tareas:'oihane_tasks',
 planes:'oihane_plans',pedidos:'oihane_orders',hogar:'oihane_home',plantas:'oihane_plants',
 recetas:'oihane_recipes',viajes:'oihane_trips',peliculas:'oihane_culture',
 series:'oihane_culture',wishlist:'oihane_wishlist'};
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rpc=(name,args={})=>oihaneSyncRuntime.request('/rest/v1/rpc/'+name,{
 method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)
});
const css=document.createElement('style');
css.textContent='#oihane-history-mask{position:fixed;inset:0;z-index:2147483647;background:#14201ed4;padding:16px;display:flex;align-items:center;justify-content:center;box-sizing:border-box}#oihane-history-dialog{box-sizing:border-box;max-width:530px;width:100%;max-height:90dvh;overflow:auto;background:#fff;color:#24372c;border-radius:20px;padding:20px;font:15px/1.5 system-ui,-apple-system,sans-serif;-webkit-overflow-scrolling:touch}#oihane-history-dialog h2{font-size:21px;margin:0 0 12px}#oihane-history-dialog .entry{border-bottom:1px solid #e4e4e4;padding:10px 0;display:flex;align-items:center;justify-content:space-between;gap:10px}#oihane-history-dialog .entry small{display:block;color:#5d6a64}#oihane-history-dialog button{border:1px solid #a8b8ae;border-radius:12px;padding:10px;background:#fff;color:#24372c}#oihane-history-dialog button:disabled{opacity:.5}';
document.head.append(css);
function convert(snapshot){
 const user=localStorage.getItem('oihane_sync_user')||'';
 const data={...(snapshot.data||{})};
 // Mantener todas las listas personales existentes: nunca reemplazar toda Cultura
 // por las tres peliculas que guardamos en la tabla granular.
 for(const row of snapshot.sharedRecords||[]){
  if(!row||row.deleted_at||!modules[row.module]||!row.payload||typeof row.payload!=='object')continue;
  const key=modules[row.module];
  const mine=row.owner_id===user;
  if(!mine&&!row.shared)continue;
  if(key==='oihane_wishlist'&&!mine)continue;
  const item={...row.payload,_oihaneSharedId:row.id,_oihaneSharedSource:row.source_key,
   _oihaneSharedOwner:row.owner_id,sharedWithPartner:row.shared===true};
  if(!Array.isArray(data[key]))data[key]=[];
  const idx=data[key].findIndex(x=>x&&String(x.id)===String(item.id));
  if(idx>=0)data[key][idx]=item;else data[key].push(item);
 }
 return {format:'oihane-backup',version:5,createdAt:snapshot.createdAt||new Date().toISOString(),
  data,appVersion:'5.59.12'};
}
async function openHistory(){
 document.getElementById('oihane-history-mask')?.remove();
 const mask=document.createElement('div');mask.id='oihane-history-mask';
 mask.innerHTML='<section role="dialog" aria-modal="true" id="oihane-history-dialog"><h2>Copias de seguridad · 7 días</h2><p>Dos copias al día, a las 00:00 y a las 12:00 (hora peninsular), aunque Oihane esté cerrada.</p><p role="status" id="oihane-history-status">Consultando copias...</p><div id="oihane-history-list"></div><p style="font-size:13px;color:#53685e">Para recuperar una copia descargada, vuelve a «Restaurar / fusionar copia» y utiliza <strong>Fusionar</strong>.</p><button type="button" id="oihane-history-close">Cerrar</button></section>';
 document.body.append(mask);
 mask.querySelector('#oihane-history-close').onclick=()=>mask.remove();
 const status=mask.querySelector('#oihane-history-status');
 try{
  const rows=await rpc('oihane_list_backup_snapshots');
  if(!Array.isArray(rows))throw Error('El servidor no ha devuelto el historial.');
  if(!rows.length){status.textContent='Todavía no hay copias históricas. Las nuevas tomas se guardarán a las 00:00 y las 12:00.';return;}
  status.textContent=rows.length+' copias disponibles';
  const body=mask.querySelector('#oihane-history-list');
  for(const row of rows){
   const entry=document.createElement('div');entry.className='entry';
   const when=String(row.slot_local||'').replace('T',' ').slice(0,19);
   const info=document.createElement('div');
   info.innerHTML='<strong>'+escapeHtml(when.slice(0,16))+'</strong><small>'+Number(row.backup_count||0)+' cuenta(s) · '+Number(row.record_count||0)+' registros</small>';
   entry.append(info);
   const btn=document.createElement('button');btn.type='button';btn.textContent='Descargar JSON';
   btn.onclick=async()=>{
    btn.disabled=true;status.textContent='Descargando copia de '+when+'...';
    try{
     const snap=await rpc('oihane_download_backup_snapshot',{p_slot_local:when});
     if(!snap||!snap.data)throw Error('La copia está incompleta.');
     const portable=convert(snap);
     const blob=new Blob([JSON.stringify(portable,null,2)],{type:'application/json'});
     const url=URL.createObjectURL(blob),link=document.createElement('a');
     link.href=url;link.download='oihane-historico-'+when.slice(0,16).replace(/[-:T ]/g,'-')+'.json';
     document.body.append(link);link.click();link.remove();
     setTimeout(()=>URL.revokeObjectURL(url),12000);
     status.textContent='Copia descargada. Usa Fusionar para recuperar solo los módulos necesarios.';
    }catch(e){status.textContent='No se pudo descargar: '+String(e?.message||e)}
    finally{btn.disabled=false;}
   };
   entry.append(btn);body.append(entry);
  }
 }catch(e){status.textContent='No se ha podido consultar el historial: '+String(e?.message||e);}
}
window.oihaneOpenBackupHistory=openHistory;
function insertButton(){
 const el=document.getElementById('localBackupStatus');
 if(!el||document.getElementById('oihane-history-open'))return;
 const btn=document.createElement('button');btn.id='oihane-history-open';btn.type='button';
 btn.textContent='Historial en la nube · 7 días';
 btn.style.cssText='margin:10px 0;padding:12px;border-radius:14px;border:1px solid #849e8c;background:#fff;color:#244b3c';
 btn.onclick=openHistory;el.insertAdjacentElement('afterend',btn);
}
document.addEventListener('DOMContentLoaded',insertButton);
const root=document.getElementById('app')||document.body;
new MutationObserver(insertButton).observe(root,{childList:true,subtree:true});
insertButton();
})();