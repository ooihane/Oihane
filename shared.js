/* Oihane 5.36.8 — primera fase de cuentas compartidas.
   Compras usa registros independientes y RLS; no accede a los JSON privados ajenos.
   En cada petición se usa la sesión autenticada actual. */
(function(){
'use strict';
const state={uid:'',link:null,ready:false,busy:false,rows:new Map(),pending:false,generation:0,lastFetch:0,lastError:'',booting:false};
let retryTimer=0;
const clone=x=>JSON.parse(JSON.stringify(x));
const plain=p=>{const obj=clone(p||{});delete obj._oihaneSharedId;delete obj._oihaneSharedSource;return obj};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const own=(obj,k)=>Object.prototype.hasOwnProperty.call(obj||{},k);
const idSource=p=>state.uid+'|'+String(p.id);
const allRows=()=>[...state.rows.values()];
const activeRows=rows=>rows.filter(row=>!row.deleted_at);
window.oihaneSharedProductsActive=false;
window.oihaneIsRuben=function(){try{const v=JSON.parse(localStorage.getItem('oihane_sync_shared_profile')||'null');return !!(v&&v.uid===localStorage.getItem('oihane_sync_user')&&v.isRuben)}catch(_){return false}};
window.oihaneCleanDisplayName=function(name){return String(name||'').trim().replace(/^[\s\"'“”«»‘’]+|[\s\"'“”«»‘’]+$/g,'').trim()};
window.oihaneGreetingName=function(){
 const uid=localStorage.getItem('oihane_sync_user')||'';
 if(!uid)return 'Oihane';
 const preferred=localStorage.getItem('oihane_display_name_'+uid);
 if(preferred&&preferred.trim())return window.oihaneCleanDisplayName(preferred);
 try{
  const v=JSON.parse(localStorage.getItem('oihane_sync_shared_profile')||'null');
  if(v&&v.uid===uid&&v.name)return window.oihaneCleanDisplayName(v.name);
 }catch(_){}
 return 'Oihane';
};
function status(message,isError){
 state.lastError=isError?message:'';
 const app=document.getElementById('app');
 if(!app||!app.querySelector('.module-header[data-module="Compras"]'))return;
 let el=document.getElementById('oihaneSharedComprasStatus');
 if(!el){el=document.createElement('p');el.id='oihaneSharedComprasStatus';el.className='hint';const first=app.querySelector('.panel');if(first)first.after(el);else app.append(el)}
 el.textContent=message;
 el.setAttribute('role',isError?'alert':'status');
}
const request=oihaneSyncRuntime.request;
async function readRows(){
 if(!state.link)throw Error('No hay una vinculación activa');
 const path='/rest/v1/oihane_shared_records?select=id,owner_id,source_key,payload,revision,deleted_at,updated_at&link_id=eq.'+
 encodeURIComponent(state.link.id)+'&module=eq.compras&order=created_at.asc&limit=1000';
 const rows=await request(path,{method:'GET'});
 if(!Array.isArray(rows))throw Error('No se ha podido leer la lista compartida');
 return rows;
}
function locate(p,rows){
 const set=rows||allRows();
 if(p._oihaneSharedId){const match=set.find(row=>row.id===p._oihaneSharedId);if(match)return match}
 const source=p._oihaneSharedSource||idSource(p);
 return set.find(row=>row.source_key===source)||null;
}
function snapshotVisible(rows){
 return activeRows(rows).map(row=>{
  const item=clone(row.payload);
  if(['Embutidos','Embutido'].includes(item.category))item.category='Quesos y embutidos';
  item._oihaneSharedId=row.id;
  item._oihaneSharedSource=row.source_key;
  return item;
 });
}
function apply(rows,extras){
 const next=snapshotVisible(rows).concat(extras||[]);
 const before=JSON.stringify(products);
 const after=JSON.stringify(next);
 state.rows=new Map(rows.map(row=>[row.id,row]));
 try{localStorage.setItem('oihane_sync_shared_baseline_'+state.uid,JSON.stringify(rows))}catch(_){}
 state.ready=true;
 window.oihaneSharedProductsActive=true;
 if(before!==after){
  products=next;
  localStorage.setItem('oihane_products',JSON.stringify(products));
  try{queueLocalSnapshot()}catch(_){}
  if(screen==='Compras')renderShopping();
 }
 status('Compras compartidas · los cambios se sincronizan entre vuestras cuentas',false);
}
function changedKeys(base,ours){
 const keys=new Set([...Object.keys(base||{}),...Object.keys(ours||{})]);
 return [...keys].filter(k=>!equal(base?.[k],ours?.[k]));
}
function remoteValueChoice(field,ours,theirs){
 return confirm('Cambios simultáneos en Compras, campo «'+field+'».\n\nTu versión: '+JSON.stringify(ours).slice(0,250)+
  '\nVersión de la otra cuenta: '+JSON.stringify(theirs).slice(0,250)+
  '\n\nAceptar = conservar tu cambio. Cancelar = conservar el de la otra cuenta.');
}
async function insertProduct(item){
 const obj=plain(item), key=idSource(item);
 const body={link_id:state.link.id,owner_id:state.uid,module:'compras',shared:true,source_key:key,payload:obj};
 const rows=await request('/rest/v1/oihane_shared_records?select=id,source_key,payload,revision,deleted_at,updated_at,owner_id',
  {method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(body)});
 if(!Array.isArray(rows)||!rows.length)throw Error('No se pudo registrar un nuevo producto compartido');
 return rows[0];
}
async function getLatest(rowId){
 const rows=await request('/rest/v1/oihane_shared_records?select=id,owner_id,source_key,payload,revision,deleted_at,updated_at&id=eq.'+encodeURIComponent(rowId)+'&limit=1',{method:'GET'});
 return Array.isArray(rows)?rows[0]:null;
}
async function updateProduct(baseRow,ours,remove){
 const original=baseRow.payload||{};
 const edits=remove?[]:changedKeys(original,plain(ours));
 if(!remove&&!edits.length)return baseRow;
 for(let attempt=0;attempt<3;attempt++){
  const current=await getLatest(baseRow.id);
  if(!current)throw Error('El producto compartido ya no es accesible');
  if(current.deleted_at&&!remove){
   if(!confirm('Este producto fue eliminado desde el otro teléfono. ¿Deseas recuperarlo con tus cambios?'))return current;
  }
  if(remove&&current.deleted_at)return current;
  if(remove&&!equal(original,current.payload) &&
    !confirm('El producto ha cambiado en el otro teléfono. ¿Quieres eliminarlo igualmente?'))return current;
  const merged=clone(current.payload||{});
  if(!remove)for(const field of edits){
   const remoteChanged=!equal(original[field],current.payload?.[field]);
   if(remoteChanged&&!equal(plain(ours)[field],current.payload?.[field])){
    if(!remoteValueChoice(field,plain(ours)[field],current.payload?.[field]))continue;
   }
   if(own(plain(ours),field))merged[field]=clone(plain(ours)[field]);
   else delete merged[field];
  }
  const update=remove?{deleted_at:new Date().toISOString(),deleted_by:state.uid}:
   {payload:merged,...(current.deleted_at?{deleted_at:null,deleted_by:null}:{})};
  const query='/rest/v1/oihane_shared_records?id=eq.'+encodeURIComponent(baseRow.id)+
    '&revision=eq.'+current.revision+'&select=id,owner_id,source_key,payload,revision,deleted_at,updated_at';
  const rows=await request(query,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(update)});
  if(Array.isArray(rows)&&rows.length)return rows[0];
 }
 throw Error('El producto cambió varias veces; inténtalo de nuevo');
}
async function flushAndRefresh(){
 if(!state.ready||!state.link||!navigator.onLine)return;
 const baseline=allRows();
 const previousVisible=activeRows(baseline);
 const local=products.slice();
 const localKnown=new Set();
 const latest=await readRows();
 const baselineBySource=new Map(baseline.map(r=>[r.source_key,r]));
 const operations=[];
 for(const item of local){
  const base=locate(item,baseline)||baselineBySource.get(idSource(item));
  if(!base){
   const source=idSource(item);
   const newlyFromOther=latest.find(r=>r.source_key===source);
   if(!newlyFromOther)operations.push(()=>insertProduct(item));
   continue;
  }
  localKnown.add(base.id);
  if(base.deleted_at)continue;
  if(!equal(base.payload,plain(item)))operations.push(()=>updateProduct(base,item,false));
 }
 // Nunca deducir una baja remota porque falte un producto local.
 for(const operation of operations)await operation();
 const newRows=operations.length?await readRows():latest;
 // Si se ha editado mientras sincronizábamos, conservar esos cambios locales pendientes.
 if(state.generation!==flushAndRefresh.startGen){
  state.rows=new Map(newRows.map(r=>[r.id,r]));
  state.pending=true;return;
 }
 apply(newRows);
}
async function sync(){
 if(state.busy||!state.ready)return;
 if(!syncConfig().access||localStorage.getItem('oihane_sync_user')!==state.uid)return;
 state.busy=true;
 try{
  flushAndRefresh.startGen=state.generation;
  await flushAndRefresh();
  state.lastFetch=Date.now();
  if(state.generation===flushAndRefresh.startGen)state.pending=false;
 }catch(error){
  state.pending=true;
  status('Compras pendientes de sincronización: '+String(error?.message||error)+'. Se han conservado en este dispositivo.',true);
 }finally{
  state.busy=false;
  if(state.pending && state.generation!==flushAndRefresh.startGen)later(900);
 }
}
function later(ms){
 clearTimeout(retryTimer);
 retryTimer=setTimeout(()=>{if(state.ready)sync();else bootstrap()},ms||900);
}
window.oihaneSharedShoppingChanged=function(){
 if(!state.ready)return;
 state.generation++;
 state.pending=true;
 later(650);
};
window.oihaneSharedShoppingTouch=function(){
 if(!state.ready)bootstrap();
 else if(Date.now()-state.lastFetch>15000)later(200);
 else if(state.lastError)status('Cambios de Compras pendientes de sincronización; reintentando…',true);
};
async function bootstrap(){
 if(state.booting||state.busy)return;
 const cfg=syncConfig(),uid=localStorage.getItem('oihane_sync_user')||'';
 if(!cfg.access||!uid)return;
 if(state.ready&&state.uid===uid)return;
 state.booting=true;
 try{
  await refreshCloudToken();
  const rows=await cloudFetch('/rest/v1/oihane_partner_links?select=id,user_a,user_b&status=eq.active&limit=1',{method:'GET'});
  const pair=Array.isArray(rows)?rows[0]:null;
  if(!pair||![pair.user_a,pair.user_b].includes(uid))return;
  const name=uid===pair.user_a?'Oihane':'Rubén';
  const oldName=window.oihaneGreetingName();
  localStorage.setItem('oihane_sync_shared_profile',JSON.stringify({uid,name,link_id:pair.id,isRuben:uid===pair.user_b}));
  state.uid=uid;state.link=pair;
  if(screen==='home')home();
  let remote=await readRows();
  // Reanudar los cambios hechos sin conexión desde la última versión sincronizada.
  const baselineKey='oihane_sync_shared_baseline_'+uid;
  let cached=[];
  try{cached=JSON.parse(localStorage.getItem(baselineKey)||'[]')}catch(_){}
  if(Array.isArray(cached)&&cached.length){
    const byId=new Map(cached.map(r=>[r.id,r]));
    const present=new Set();
    let resumed=false;
    for(const item of products){
      const base=(item._oihaneSharedId&&byId.get(item._oihaneSharedId))||
         cached.find(row=>row.source_key===(item._oihaneSharedSource||idSource(item)));
      if(!base)continue;
      present.add(base.id);
      if(!base.deleted_at&&!equal(base.payload,plain(item))){
        await updateProduct(base,item,false);resumed=true;
      }
    }
    // No reproducir eliminaciones implícitas de una caché incompleta.
    if(resumed)remote=await readRows();
  }
  // Guardar la versión previa local para recuperación. Las copias privadas de la nube no se modifican.
  const cacheKey='oihane_sync_shared_before_'+uid;
  if(!localStorage.getItem(cacheKey))try{localStorage.setItem(cacheKey,JSON.stringify(products))}catch(_){}
  const recognizedKeys=new Set(remote.map(r=>r.source_key));
  const recognizedIds=new Set(remote.map(r=>r.id));
  const extras=products.filter(p=>!recognizedIds.has(p._oihaneSharedId)&&
    !recognizedKeys.has(p._oihaneSharedSource||idSource(p)));
  apply(remote,extras);
  if(extras.length){state.generation++;later(500)}
 }catch(error){
  status('No se pudo iniciar Compras compartidas: '+String(error?.message||error)+'. Se conserva la lista local.',true);
 }finally{state.booting=false}
}
window.addEventListener('load',()=>setTimeout(bootstrap,350));
oihaneSyncRuntime.register('shared-products',reason=>{
 if(reason==='minute'){
  const uid=localStorage.getItem('oihane_sync_user')||'';
  if(state.uid&&uid!==state.uid){state.ready=false;state.link=null;state.rows.clear();window.oihaneSharedProductsActive=false}
 }
 if(document.visibilityState==='hidden')return;
 if(state.ready)later(reason==='minute'?200:reason==='focus'?150:100);
 else return bootstrap();
},{minute:true,focus:true,visible:true});
})();