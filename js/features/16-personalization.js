/* Oihane 5.46.0 — Preferencias locales, independientes de Supabase. */
(function(){
 'use strict';
 const KEY='ui_oihane_module_layout_v1';
 const ALL=['Compras','Calendario','Tareas','Planes','Hogar','Plantas','Wishlist','Regalos','Estudio','Recetas','Cultura','Viajes','Pedidos','Más'];
 const $=id=>document.getElementById(id);
 function read(){
  let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){}
  const found=Array.isArray(stored.order)?stored.order.filter((name,i,a)=>ALL.includes(name)&&a.indexOf(name)===i):[];
  const order=[...found,...ALL.filter(x=>!found.includes(x))];
  const hidden=Array.isArray(stored.hidden)?stored.hidden.filter(name=>ALL.includes(name)&&name!=='Más'):[];
  return {order,hidden};
 }
 function save(obj){try{localStorage.setItem(KEY,JSON.stringify(obj));return true}catch(_){alert('No hay espacio para guardar esta preferencia.');return false}}
 window.oihaneConfiguredHomeModules=function(list){
  const pref=read();const lookup=new Map(list.map(x=>[x[1],x]));
  return pref.order.filter(name=>!pref.hidden.includes(name)&&lookup.has(name)).map(name=>lookup.get(name));
 };
 window.oihaneAssistantExample=function(sentence){
  const el=$('ask');if(!el)return;el.value=sentence;el.focus();el.setSelectionRange(sentence.length,sentence.length);
 };
 function draw(){
  const node=$('oihaneModulePreferences');if(!node)return;
  const prefs=read();node.replaceChildren();
  const h=document.createElement('h3');h.textContent='🎨 Personalizar los módulos';node.appendChild(h);
  const desc=document.createElement('p');desc.textContent='Elige cuáles aparecen en Home y ordénalos. Solo cambia este dispositivo; tus datos no se borran.';node.appendChild(desc);
  prefs.order.forEach((name,index)=>{
   const row=document.createElement('div');row.className='oihane-pref-row';
   const label=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.checked=!prefs.hidden.includes(name);check.disabled=name==='Más';check.setAttribute('aria-label','Mostrar '+name);
   check.addEventListener('change',()=>{const next=read();next.hidden=check.checked?next.hidden.filter(n=>n!==name):[...new Set([...next.hidden,name])];if(save(next))draw()});
   label.append(check,document.createTextNode(name==='Más'?'Ajustes':name));row.appendChild(label);
   for(const [symbol,direction] of [['↑',-1],['↓',1]]){
    const move=document.createElement('button');move.type='button';move.textContent=symbol;move.disabled=(direction<0&&index===0)||(direction>0&&index===prefs.order.length-1);move.setAttribute('aria-label',direction<0?'Subir '+name:'Bajar '+name);
    move.onclick=()=>{const next=read(),pos=next.order.indexOf(name);if(pos<0||pos+direction<0||pos+direction>=next.order.length)return;[next.order[pos],next.order[pos+direction]]=[next.order[pos+direction],next.order[pos]];if(save(next))draw()};row.appendChild(move)
   }
   node.appendChild(row);
  });
  const reset=document.createElement('button');reset.type='button';reset.className='small-action';reset.textContent='Restablecer orden y visibilidad';reset.onclick=()=>{if(confirm('¿Restablecer la organización de módulos de Home?')){localStorage.removeItem(KEY);draw()}};node.appendChild(reset);
 }
 window.oihaneOpenModulePreferences=function(){
  if(!document.querySelector('#app .module-header[data-module="Más"]'))return;
  const wrapper=$('oihaneSettingsRepair')||document.querySelector('#app');if(!wrapper)return;
  let node=$('oihaneModulePreferences');if(!node){node=document.createElement('section');node.id='oihaneModulePreferences';node.className='oihane-module-preferences';wrapper.appendChild(node)}
  draw();
 };
})();