



/* --- oihane-534-enhancements --- */

(function(){
 'use strict';
 const SHOPS=['General','Lidl','Eroski','Mercadona','Dia'];
 const DEFAULT_CATS=productCategories.slice();
 const STORAGE='oihane_shop_category_order_v1';
 function readOrders(){try{const data=JSON.parse(localStorage.getItem(STORAGE)||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{}}catch(_){return {}}}
 function categoriesFor(shop){
  const data=readOrders();const ordered=Array.isArray(data[shop])?data[shop]:[];
  const canonical=c=>['Embutido','Embutidos'].includes(c)?'Quesos y embutidos':c;
  return [...new Set([...ordered.map(canonical).filter(c=>typeof c==='string'&&DEFAULT_CATS.includes(c)),...DEFAULT_CATS])];
 }
 function safeValue(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function moveCategory(shop,name,delta){
  const ordered=categoriesFor(shop),at=ordered.indexOf(name),to=at+delta;
  if(at<0||to<0||to>=ordered.length)return;
  [ordered[at],ordered[to]]=[ordered[to],ordered[at]];
  const all=readOrders();all[shop]=ordered;
  try{localStorage.setItem(STORAGE,JSON.stringify(all))}catch(e){alert('No se ha podido guardar el orden: '+e.message);return}
  if(typeof window.queueCloudSync==='function')window.queueCloudSync();
  const modal=document.querySelector('.oihane-534-category-modal');if(modal)renderCategoryModal(shop,modal);
  if(typeof window.renderShopping==='function' && typeof store!=='undefined' && store===shop)window.renderShopping();
 }
 function renderCategoryModal(shop,modal){
  const list=modal.querySelector('.oihane-534-cat-items');if(!list)return;
  const cats=categoriesFor(shop);
  list.innerHTML=cats.map((cat,i)=>`<div class="oihane-534-cat-row"><span>${safeValue(cat)}</span><button type="button" data-category-shift="-1" data-category="${safeValue(cat)}" aria-label="Subir ${safeValue(cat)}" ${i===0?'disabled':''}>↑</button><button type="button" data-category-shift="1" data-category="${safeValue(cat)}" aria-label="Bajar ${safeValue(cat)}" ${i===cats.length-1?'disabled':''}>↓</button></div>`).join('');
 }
 window.oihaneOrganizeShopCategories=function(){
  const shop=typeof store!=='undefined'&&['General',...(window.oihaneShopStores||[])].includes(store)?store:'General';
  document.querySelector('.oihane-534-category-modal')?.remove();
  const wrap=document.createElement('div');wrap.className='oihane-534-category-modal';
  wrap.innerHTML=`<div class="oihane-534-category-panel" role="dialog" aria-modal="true" aria-label="Ordenar categorías de ${safeValue(shop)}"><div class="oihane-534-modal-head"><strong>Orden de pasillos · ${safeValue(shop)}</strong><button type="button" class="oihane-534-done">Cerrar</button></div><div class="oihane-534-cat-items"></div></div>`;
  wrap.querySelector('.oihane-534-done').onclick=()=>wrap.remove();
  wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove()});
  wrap.querySelector('.oihane-534-cat-items').onclick=e=>{
   const btn=e.target.closest('button[data-category-shift]');if(!btn)return;
   const category=btn.dataset.category,delta=Number(btn.dataset.categoryShift);
   const pos=wrap.querySelector('.oihane-534-cat-items').scrollTop;
   moveCategory(shop,category,delta);
   const scroll=wrap.querySelector('.oihane-534-cat-items');if(scroll)scroll.scrollTop=pos;
  };
  document.body.appendChild(wrap);renderCategoryModal(shop,wrap);
 };
 function updateGroups(){
  const list=document.querySelector('#app #productList');if(!list)return;
  const groupNodes=new Map();let category='';
  for(const node of [...list.children]){
   if(node.classList.contains('category-heading')){
    category=node.textContent.trim();node.dataset.cat=category;node.classList.add('oihane-534-category-heading');
    if(!groupNodes.has(category))groupNodes.set(category,[]);
   }
   if(category && groupNodes.has(category))groupNodes.get(category).push(node);
  }
  if(!groupNodes.size)return;
  const shop=typeof store!=='undefined'?store:'General';
  const fragment=document.createDocumentFragment();
  const full=categoriesFor(shop);
  const seen=new Set();
  for(const cat of [...full,...groupNodes.keys()]){
   if(seen.has(cat))continue;seen.add(cat);
   for(const node of groupNodes.get(cat)||[])fragment.appendChild(node);
  }
  list.appendChild(fragment);
 }
 function addCategoryButton(){
  const list=document.querySelector('#app #productList');if(!list)return;
  let control=document.querySelector('#app .oihane-534-ordercats');
  if(control)return;
  control=document.createElement('div');control.className='oihane-534-ordercats';
  control.innerHTML='<button type="button" aria-label="Ordenar categorías del supermercado">⇅ Ordenar categorías</button>';
  control.querySelector('button').onclick=window.oihaneOrganizeShopCategories;
  list.insertAdjacentElement("afterend",control);
 }
 function fixHeader(){
  const app=document.querySelector('#app');if(!app)return;
  const legacy=app.querySelector(':scope > .screen-head');
  if(legacy){
   let name=typeof screen==='string'?screen:'';
   if(!DEFAULT_MODULES.includes(name)){
    const label=legacy.querySelector('h1')?.textContent||'';
    name=DEFAULT_MODULES.find(n=>label.includes(n))||'';
   }
   if(name && typeof unifiedHeader==='function'){
    const container=document.createElement('div');container.innerHTML=unifiedHeader(name);
    const replacement=container.firstElementChild;
    if(replacement)legacy.replaceWith(replacement);
   }
  }
  const header=app.querySelector(':scope > .module-header');if(!header)return;
  const title=header.querySelector('.header-title');if(!title)return;
  const name=header.dataset.module||title.querySelector('h1')?.textContent.trim()||'';
  header.querySelectorAll('.header-kicker').forEach(x=>x.remove());
  if(!title.querySelector('.module-heading-icon') && typeof moduleIcon==='function'){
   const holder=document.createElement('span');holder.className='module-heading-icon';holder.innerHTML=moduleIcon(name);
   title.insertBefore(holder,title.querySelector('h1')||title.firstChild);
  }
 }
 const DEFAULT_MODULES=['Compras','Calendario','Tareas','Planes','Hogar','Plantas','Wishlist','Regalos','Estudio','Recetas','Cultura','Viajes','Más'];
 // Invocado desde la implementación definitiva de renderShopping, sin envoltorio.
 window.oihaneEnhanceShopping=function(){fixHeader();addCategoryButton();updateGroups();};
 let scheduled=false;
 const app=document.querySelector('#app');
 if(app){new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;fixHeader();if(document.querySelector('#app #productList')){addCategoryButton();updateGroups()}})}).observe(app,{childList:true,subtree:false});}
 fixHeader();if(document.querySelector('#app #productList')){addCategoryButton();updateGroups()}
})();