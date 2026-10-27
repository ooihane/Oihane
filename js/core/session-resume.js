/* Oihane 5.59.20: conservar el modulo durante regresos cortos desde iOS. */
(function(){
 'use strict';
 const KEY='oihane_last_module_visited_v1',WINDOW=180000;
 const modules=new Set(['Compras','Calendario','Tareas','Pedidos','Hogar','Plantas',
 'Wishlist','Regalos','Recetas','Estudio','Viajes','Cultura','Planes','Trabajo','Más']);
 const owner=()=>localStorage.getItem('oihane_sync_user')||'local';
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}};
 function write(module,stamp=Date.now()){
  try{localStorage.setItem(KEY,JSON.stringify({module,stamp,owner:owner()}))}catch(_){}
 }
 const originalOpen=window.openModule;
 if(typeof originalOpen==='function'){
  window.openModule=function(module,...args){
   const result=originalOpen.call(this,module,...args);
   if(modules.has(module)&&typeof screen==='string'&&screen===module)write(module);
   return result;
  };
 }
 const originalHome=window.home;
 if(typeof originalHome==='function')window.home=function(...args){write('home');return originalHome.apply(this,args)};
 function savePosition(){
  const name=typeof screen==='string'?screen:'';
  if(modules.has(name)||name==='home')write(name);
 }
 window.addEventListener('pagehide',savePosition);
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden')savePosition();
 });
 function restore(){
  const last=read();
  if(!last||!modules.has(last.module)||last.owner!==owner()||
    Date.now()-Number(last.stamp)<0||Date.now()-Number(last.stamp)>=WINDOW)return;
  if(typeof screen==='string'&&screen!=='home')return;
  // Solo recuperar la pantalla, no abrir modales ni reejecutar formularios incompletos.
  try{window.openModule(last.module)}catch(e){console.warn('Oihane: no se pudo restaurar la ultima pantalla',e)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(restore),{once:true});
 else requestAnimationFrame(restore);
})();