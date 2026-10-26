/* Oihane 5.59.12: los borrados remotos requieren gesto explicito, RLS y revision. */
(function(){
'use strict';
const moduleMap={Compras:'compras',Calendario:'calendario',Tareas:'tareas',Planes:'planes',Pedidos:'pedidos',
 Hogar:'hogar',Plantas:'plantas',Recetas:'recetas',Viajes:'viajes',Cultura:'peliculas',Wishlist:'wishlist'};
const storageKeys={Compras:'oihane_products',Calendario:'oihane_events',Tareas:'oihane_tasks',
 Planes:'oihane_plans',Pedidos:'oihane_orders',Hogar:'oihane_home',Plantas:'oihane_plants',
 Recetas:'oihane_recipes',Viajes:'oihane_trips',Cultura:'oihane_culture',Wishlist:'oihane_wishlist'};
const suppressed=new Set();
const originals={};
for(const name of ['oihaneSharedShoppingChanged','oihaneFullSharedChange','oihaneMixedChanged']){
 originals[name]=window[name];
 if(typeof originals[name]==='function'){
  window[name]=function(module){
   if(suppressed.size && (!module||suppressed.has(module)||name==='oihaneSharedShoppingChanged'&&suppressed.has('Compras')))return;
   return originals[name].apply(this,arguments);
  };
 }
}
const items=key=>{try{const rows=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(rows)?rows:[]}catch(_){return []}};
const find=(name,id)=>items(storageKeys[name]).find(row=>String(row?.id)===String(id));
function baseline(name){
 const uid=localStorage.getItem('oihane_sync_user')||'';
 const db=moduleMap[name];if(!db||!uid)return [];
 const key=db==='compras'?'oihane_sync_shared_baseline_'+uid:
  ['hogar','plantas','recetas','viajes','peliculas'].includes(db)?
  'oihane_shared_baseline_'+uid+'_'+db:'oihane_mixed_baseline_'+uid+'_'+db;
 return items(key);
}
function ready(record,name){
 if(!record?._oihaneSharedId)return true;
 if(!navigator.onLine){alert('Necesitas conexion para borrar este elemento compartido. No se ha borrado.');return false;}
 if(!syncConfig().access||!syncConfig().refresh){alert('Antes de borrar un elemento compartido, inicia sesion en Oihane.');return false;}
 if(!baseline(name).some(row=>row.id===record._oihaneSharedId)){
  alert('Espera a que termine la primera sincronizacion antes de borrar este elemento compartido.');return false;
 }
 return true;
}
async function removeCloud(record,name){
 const base=baseline(name).find(r=>r.id===record._oihaneSharedId);
 if(!base?.revision){alert('No hay una revision valida para borrar este elemento.');return false;}
 try{
  const data=await oihaneSyncRuntime.request('/rest/v1/rpc/oihane_delete_shared_record',{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({p_id:base.id,p_expected_revision:base.revision})
  });
  if(typeof data!=='string'||data!==base.id)throw Error('El servidor no confirmo el borrado');
  return true;
 }catch(err){
  alert('El borrado no ha sido confirmado en la nube. Se mantendra el registro remoto para protegerlo. Motivo: '+String(err?.message||err));
  return false;
 }
}
async function afterDelete(record,name){
 try{if(record?._oihaneSharedId&&moduleMap[name])await removeCloud(record,name);}
 finally{
  try{if(name==='Compras')originals.oihaneSharedShoppingChanged?.();}catch(_){}
  try{originals.oihaneFullSharedChange?.(name);}catch(_){}
  try{originals.oihaneMixedChanged?.(name);}catch(_){}
 }
}
function wrap(name,module,getBefore,getAfter){
 const prior=window[name];if(typeof prior!=='function')return;
 window[name]=function(...args){
  const current=getBefore(...args);
  if(current?._oihaneSharedId&&!ready(current,module))return;
  suppressed.add(module);
  let result;
  try{result=prior.apply(this,args);}
  finally{suppressed.delete(module);}
  if(current?._oihaneSharedId&&!getAfter(...args))void afterDelete(current,module);
  return result;
 };
}
wrap('deleteProduct','Compras',id=>find('Compras',id),id=>find('Compras',id));
wrap('deleteTask','Tareas',id=>find('Tareas',id),id=>find('Tareas',id));
wrap('deleteEvent','Calendario',id=>find('Calendario',id),id=>find('Calendario',id));
const extra=window.deleteExtra;
if(typeof extra==='function'){
 window.deleteExtra=function(name,id,section){
  const before=storageKeys[name]?find(name,id):null;
  if(before?._oihaneSharedId&&!ready(before,name))return;
  suppressed.add(name);
  let result;
  try{result=extra.apply(this,arguments);}
  finally{suppressed.delete(name);}
  if(before?._oihaneSharedId&&!find(name,id))void afterDelete(before,name);
  return result;
 };
}
// Pedidos dispone de un manejador privado; observar solo el gesto real de borrar.
document.addEventListener('click',ev=>{
 const button=ev.target?.closest?.('[data-order-remove]');if(!button)return;
 const id=button.dataset.orderRemove,before=find('Pedidos',id);
 if(!before?._oihaneSharedId)return;
 if(!ready(before,'Pedidos')){
  ev.preventDefault();ev.stopImmediatePropagation();return;
 }
 suppressed.add('Pedidos');
 queueMicrotask(()=>{
  suppressed.delete('Pedidos');
  if(!find('Pedidos',id))void afterDelete(before,'Pedidos');
 });
},true);
})();