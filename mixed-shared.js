/* Oihane 5.36.9: módulos compartidos por elemento.
 * Solo registros expresamente compartidos. Los anteriores siguen privados.
 * Cambios de Tareas/Calendario/Planes/Wishlist solo por el autor.
 * Pedidos compartidos editables por ambos; avisos siempre propios. */
(function(){
'use strict';
const defs=[
 {name:'Tareas',db:'tareas',key:'oihane_tasks',ownerOnly:true},
 {name:'Calendario',db:'calendario',key:'oihane_events',ownerOnly:true},
 {name:'Planes',db:'planes',key:'oihane_plans',ownerOnly:true},
 {name:'Pedidos',db:'pedidos',key:'oihane_orders',ownerOnly:false},
 {name:'Wishlist',db:'wishlist',key:'oihane_wishlist',ownerOnly:true}
];
const cache=new Map(defs.map(x=>[x.db,{ready:false,rows:[],busy:false,pending:false,generation:0}]));
let uid='',link=null,starting=false,lastError='';
const clone=x=>JSON.parse(JSON.stringify(x));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const diff=(a,b)=>[...new Set([...Object.keys(a||{}),...Object.keys(b||{})])].filter(k=>!same(a?.[k],b?.[k]));
const srcKey=x=>x._oihaneSharedSource||uid+'|'+String(x.id??'');
function arr(m){
 if(m.db==='tareas')return tasks.slice();
 if(m.db==='calendario')return events.slice();
 try{const x=JSON.parse(localStorage.getItem(m.key)||'[]');return Array.isArray(x)?x:[]}catch(e){return []}
}
function write(m,list){
 if(m.db==='tareas')tasks=list;
 if(m.db==='calendario')events=list;
 localStorage.setItem(m.key,JSON.stringify(list));
}
function payload(m,x){
 if(m.db==='wishlist'){
  return {id:x.id,title:x.title||'',status:x.status||'',price:x.price||'',photo:x.photo||'',
   link:x.link||'',kind:x.kind||'',created:x.created||''};
 }
 const y=clone(x);
 for(const k of ['_oihaneSharedId','_oihaneSharedSource','_oihaneSharedOwner','sharedWithPartner',
  'notify','notifyLead','departureMinutes','reminder','reminders'])delete y[k];
 return y;
}
function incoming(m,row,local){
 const data=clone(row.payload);
 const before=local.find(x=>x._oihaneSharedId===row.id||srcKey(x)===row.source_key);
 const owner=row.owner_id===uid;
 if(m.db==='tareas'||m.db==='calendario'||m.db==='planes'||m.db==='pedidos'){
  data.notify=!!before?.notify;
  data.notifyLead=before?.notifyLead||0;
  if(m.db==='calendario')data.departureMinutes=before?.departureMinutes||0;
 }
 return {...data,sharedWithPartner:row.shared!==false,_oihaneSharedId:row.id,
  _oihaneSharedSource:row.source_key,_oihaneSharedOwner:row.owner_id};
}
const find=(x,rows)=>rows.find(r=>r.id===x._oihaneSharedId||r.source_key===srcKey(x));
async function api(path,opt){await refreshCloudToken();return cloudFetch(path,opt||{method:'GET'})}
async function getRows(m){
 const path='/rest/v1/oihane_shared_records?select=id,owner_id,link_id,module,shared,source_key,payload,revision,deleted_at&link_id=eq.'+
   encodeURIComponent(link.id)+'&module=eq.'+m.db+'&limit=1000&order=created_at.asc';
 const result=await api(path,{method:'GET'});
 if(!Array.isArray(result))throw Error('No se pudo leer el módulo compartido');
 return result;
}
async function getOne(id){
 const result=await api('/rest/v1/oihane_shared_records?select=id,owner_id,link_id,module,shared,source_key,payload,revision,deleted_at&id=eq.'+encodeURIComponent(id)+'&limit=1',{method:'GET'});
 return result?.[0]||null;
}
async function create(m,x){
 return api('/rest/v1/oihane_shared_records?select=id',{method:'POST',
  headers:{Prefer:'return=representation'},body:JSON.stringify({
  link_id:link.id,owner_id:uid,module:m.db,source_key:srcKey(x),shared:true,payload:payload(m,x)})});
}
async function patch(m,base,x,remove){
 for(let round=0;round<3;round++){
  const current=await getOne(base.id);
  if(!current)return;
  if(m.ownerOnly&&current.owner_id!==uid)return;
  const requested=x?payload(m,x):null;
  const changed=remove?[]:diff(base.payload,requested);
  const edited={...clone(current.payload)};
  if(!remove)for(const key of changed){
   if(!same(base.payload[key],current.payload[key])&&!same(requested[key],current.payload[key])){
    if(!confirm('Los dos dispositivos cambiaron «'+key+'».\nAceptar: conservar tu cambio. Cancelar: conservar el otro.'))continue;
   }
   if(Object.prototype.hasOwnProperty.call(requested,key))edited[key]=clone(requested[key]);
   else delete edited[key];
  }
  let update;
  if(remove)update={deleted_at:new Date().toISOString(),deleted_by:uid};
  else update={payload:edited};
  if(x&&current.owner_id===uid&&current.shared!==(x.sharedWithPartner===true))
    update.shared=x.sharedWithPartner===true;
  if(x&&current.deleted_at&&current.owner_id===uid)update.deleted_at=null;
  if(current.deleted_at&&remove)return;
  const result=await api('/rest/v1/oihane_shared_records?id=eq.'+encodeURIComponent(base.id)+
   '&revision=eq.'+current.revision+'&select=id',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(update)});
  if(Array.isArray(result)&&result.length)return;
 }
 throw Error('Conflicto simultáneo pendiente');
}
function merge(m,rows,local){
 const knownIds=new Set(rows.map(r=>r.id)),knownKeys=new Set(rows.map(r=>r.source_key));
 const privates=local.filter(x=>!knownIds.has(x._oihaneSharedId)&&!knownKeys.has(srcKey(x))&&x.sharedWithPartner!==true);
 const active=rows.filter(r=>!r.deleted_at).filter(r=>m.db!=='wishlist'||r.owner_id===uid);
 const entries=active.map(r=>incoming(m,r,local));
 return privates.concat(entries);
}
function status(m,msg){if(screen!==m.name)return;const app=document.getElementById('app');if(!app)return;
 let node=app.querySelector('.oihane-mixed-sync-status');if(!node){node=document.createElement('p');node.className='hint oihane-mixed-sync-status';app.append(node)}node.textContent=msg}
function refresh(m){
 if(screen!==m.name)return;
 const open=document.querySelector('#v522PlanModal,#v522TaskModal,.oihane-536-order-curtain,#v518FormPanel:not(.hidden),#addPanel:not(.hidden)');
 if(open)return;
 if(typeof openModule==='function')openModule(m.name);
}
async function process(m){
 const s=cache.get(m.db);
 if(s.busy||!s.ready||!link||!uid)return;
 s.busy=true;const generation=s.generation;
 try{
  const local=arr(m),before=s.rows.slice(),matched=new Set();
  const ops=[];
  for(const x of local){
   const row=find(x,before);
   if(row){
    matched.add(row.id);
    if(row.owner_id!==uid&&m.ownerOnly)continue;
    const changes=diff(row.payload,payload(m,x));
    if(changes.length||row.shared!==(x.sharedWithPartner===true))
      ops.push(()=>patch(m,row,x,false));
   }else if(x.sharedWithPartner===true){
    ops.push(async()=>{const r=await getRows(m);if(!r.some(y=>y.source_key===srcKey(x)))await create(m,x)});
   }
  }
  for(const r of before){
   if(!matched.has(r.id)&&!r.deleted_at&&(r.owner_id===uid||!m.ownerOnly))
    ops.push(()=>patch(m,r,null,true));
  }
  for(const op of ops)await op();
  const rows=await getRows(m);
  if(s.generation!==generation){s.rows=rows;s.pending=true;return}
  const updated=merge(m,rows,arr(m));
  const changed=!same(updated,arr(m));
  s.rows=rows;s.pending=false;
  try{localStorage.setItem('oihane_mixed_baseline_'+uid+'_'+m.db,JSON.stringify(rows))}catch(_){}
  if(changed){write(m,updated);try{queueLocalSnapshot()}catch(_){}refresh(m)}
  if(m.db==='wishlist'&&screen==='Regalos')renderWishes();
 }catch(e){s.pending=true;status(m,'Sincronización pendiente: '+String(e?.message||e))}
 finally{s.busy=false}
}
async function begin(){
 if(starting||!syncConfig().access)return;
 const id=localStorage.getItem('oihane_sync_user')||'';
 if(!id)return;
 if(link&&uid===id)return;
 starting=true;
 try{
  const found=await api('/rest/v1/oihane_partner_links?select=id,user_a,user_b&status=eq.active&limit=1',{method:'GET'});
  const l=found?.[0];if(!l||![l.user_a,l.user_b].includes(id))return;
  link=l;uid=id;
  for(const m of defs){
   const s=cache.get(m.db),local=arr(m);
   let rows=await getRows(m);
   let cached=[];
   try{cached=JSON.parse(localStorage.getItem('oihane_mixed_baseline_'+uid+'_'+m.db)||'[]')}catch(_){}
   if(Array.isArray(cached)&&cached.length){
     let replay=false;
     const present=new Set();
     for(const item of local){
      const oldRow=find(item,cached);if(!oldRow)continue;
      present.add(oldRow.id);
      if(oldRow.owner_id!==uid&&m.ownerOnly)continue;
      if(diff(oldRow.payload,payload(m,item)).length||oldRow.shared!==(item.sharedWithPartner===true)){
       await patch(m,oldRow,item,false);replay=true;
      }
     }
     for(const oldRow of cached){
      if(!present.has(oldRow.id)&&!oldRow.deleted_at&&(oldRow.owner_id===uid||!m.ownerOnly)){
       await patch(m,oldRow,null,true);replay=true;
      }
     }
     if(replay)rows=await getRows(m);
   }
   s.rows=rows;s.ready=true;window.oihaneMixedKeys.add(m.key);
   // Los datos antiguos no compartidos jamás se publican automáticamente.
   const available=merge(m,rows,local);
   const toSend=local.filter(x=>x.sharedWithPartner===true&&!find(x,rows));
   const combined=available.concat(toSend);
   if(!same(arr(m),combined)){write(m,combined);refresh(m)}
   if(toSend.length){s.generation++;await process(m)}
  }
  if(screen==='Regalos')renderWishes();
  if(screen==='home'||(screen==='Estudio'&&window.oihaneIsRuben()))window.home?.();
 }catch(e){console.warn('Oihane: no se activó sincronización selectiva',e)}
 finally{starting=false}
}
window.oihanePartnerName=()=>link?(uid===link.user_a?'Rubén':'Oihane'):'mi pareja';
window.oihaneIsRuben=()=>!!(link&&uid&&uid===link.user_b);
window.oihaneMixedKeys=new Set();
window.oihaneMixedChanged=function(name){
 const m=defs.find(x=>x.name===name);if(!m)return;
 const s=cache.get(m.db);if(!s?.ready)return;
 s.generation++;s.pending=true;setTimeout(()=>process(m),900);
};
window.oihaneMixedVisit=function(name){
 if(name==='Regalos'){if(!link)begin();else setTimeout(renderWishes,60);return}
 const m=defs.find(x=>x.name===name);if(!m)return;
 if(!link)begin();else process(m);
};
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderWishes(){
 const app=document.getElementById('app');
 if(!app?.querySelector('.module-header[data-module="Regalos"]'))return;
 app.querySelector('#oihaneOtherWishes')?.remove();
 const wishlist=cache.get('wishlist');
 const gifts=wishlist.rows.filter(r=>r.owner_id!==uid&&r.shared&&!r.deleted_at);
 if(!gifts.length)return;
 const label=window.oihanePartnerName();
 const section=document.createElement('section');section.id='oihaneOtherWishes';section.className='v518-list-section';
 section.innerHTML='<h2>Wishlist de '+safe(label)+'</h2>'+gifts.map(r=>{
  const x=r.payload||{},url=String(x.link||'');
  const href=/^https?:\/\//i.test(url)?'<a class="small-action" href="'+safe(url)+'" target="_blank" rel="noopener noreferrer">Ver enlace</a>':'';
  return '<div class="v518-line-item"><span class="v518-item-name">'+safe(x.title)+'</span>'+href+'</div>';
 }).join('');
 const container=app.querySelector('.v518-compact-body')||app;container.append(section);
}
window.oihaneForeignRecord=function(x){return !!(x&&x._oihaneSharedOwner&&x._oihaneSharedOwner!==(localStorage.getItem('oihane_sync_user')||''))};

function guardAction(method,mapping){
 const original=window[method];
 if(typeof original!=='function')return;
 window[method]=function(id){
  const record=mapping().find(x=>String(x.id)===String(id));
  if(window.oihaneForeignRecord(record)){alert('Este elemento compartido solo puede modificarlo la persona que lo creó.');return}
  return original.apply(this,arguments);
 };
}
guardAction('toggleTask',()=>tasks);
guardAction('deleteTask',()=>tasks);
guardAction('completeImportantTask',()=>tasks);
guardAction('editEvent',()=>events);
guardAction('deleteEvent',()=>events);
function preventForeign(ev){
 const node=ev.target?.closest?.('[data-task-edit],[data-task-delete],[data-plan-edit],[data-plan-delete]');
 if(!node)return;
 const id=node.getAttribute('data-task-edit')||node.getAttribute('data-task-delete')||node.getAttribute('data-plan-edit')||node.getAttribute('data-plan-delete');
 const list=node.hasAttribute('data-task-edit')||node.hasAttribute('data-task-delete')?tasks:arr(defs[2]);
 const found=list.find(x=>String(x.id)===String(id));
 if(window.oihaneForeignRecord(found)){ev.stopImmediatePropagation();ev.preventDefault();alert('Este elemento solo puede modificarlo quien lo creó.')}
}
document.addEventListener('click',preventForeign,true);
const interval=async()=>{
 if(document.visibilityState==='hidden'||!syncConfig().access)return;
 if(!link||uid!==localStorage.getItem('oihane_sync_user')){link=null;uid='';for(const v of cache.values())v.ready=false;window.oihaneMixedKeys.clear();await begin();return}
 for(const m of defs)await process(m);
};
window.addEventListener('load',()=>setTimeout(begin,900));
window.addEventListener('focus',interval);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')interval()});
window.setInterval(interval,60000);
})();