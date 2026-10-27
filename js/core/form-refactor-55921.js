/* Oihane 5.59.21 — normalizador único de formularios, sin alterar el almacenamiento. */
(function(){
 'use strict';
 if(window.oihaneFormRefactor55921)return;
 const $=(selector,context=document)=>context.querySelector(selector);
 const $$=(selector,context=document)=>Array.from(context.querySelectorAll(selector));
 const normalize=x=>String(x||'').replace(/\s+/g,' ').trim().replace(/[:*]+$/,'');
 const readLabel=(node)=>{
  const owner=node.closest('label:not(.oihane-check-row):not(.inline-check):not(.oihane-share-label)');
  const label=owner||((node.id&&document.querySelector('label[for="'+CSS.escape(node.id)+'"]')))||
   (node.previousElementSibling?.tagName==='LABEL'?node.previousElementSibling:null);
  const existing=node.dataset.oihaneFieldTitle||node.getAttribute('aria-label');
  if(label){
   const clone=label.cloneNode(true);
   clone.querySelectorAll('input,textarea,select,button,svg,small').forEach(x=>x.remove());
   const title=normalize(clone.textContent);
   if(title)return {title,label,inside:label.contains(node)};
  }
  return {title:normalize(existing||node.getAttribute('placeholder')||node.name||node.id||'Seleccionar'),label:null,inside:false};
 };
 function selectOnlyTitle(select){
  if(select.dataset.oihaneSelectV3==='1')return;
  const info=readLabel(select);
  if(!info.title)return;
  select.dataset.oihaneSelectV3='1';
  const wrapper=document.createElement('span');
  wrapper.className='oihane-select-shell';
  wrapper.dataset.title=info.title;
  if(info.inside&&info.label?.parentNode)info.label.before(wrapper);
  else select.before(wrapper);
  wrapper.append(select);
  select.classList.add('oihane-title-only-select');
  if(info.label)info.label.classList.add('oihane-v3-replaced-label');
  const accessibility=()=>{
   const option=select.options[select.selectedIndex];
   select.setAttribute('aria-label',info.title+(option?', seleccionado: '+option.textContent.trim():''));
   wrapper.title=info.title;
  };
  select.addEventListener('change',accessibility);
  accessibility();
 }
 function inputOnlyTitle(control){
  if(control.dataset.oihaneInputV3==='1'||control.matches('input[type=hidden],input[type=checkbox],input[type=radio],input[type=submit],input[type=button]'))return;
  const info=readLabel(control);
  if(!info.title)return;
  control.dataset.oihaneInputV3='1';
  control.setAttribute('aria-label',info.title);
  const type=String(control.type||'').toLowerCase();
  const native=['date','time','datetime-local','month','week','file','color'].includes(type);
  if(!native){
   control.setAttribute('placeholder',info.title);
   if(info.label)info.label.classList.add('oihane-v3-replaced-label');
   return;
  }
  if(type==='file'){
   const holder=document.createElement('div');
   holder.className='oihane-v4-file-picker';
   const caption=document.createElement('span');
   caption.className='oihane-v4-file-caption';caption.textContent=info.title||'Foto';
   if(info.inside&&info.label?.parentNode)info.label.before(holder);
   else control.before(holder);
   holder.append(caption,control);
   control.setAttribute('aria-label',info.title||'Foto');
   control.addEventListener('change',()=>{caption.textContent=control.files?.length?'Foto seleccionada':info.title});
   if(info.label)info.label.classList.add('oihane-v3-replaced-label');
   return;
  }
  const shell=document.createElement('span');
  shell.className='oihane-native-shell';shell.dataset.title=info.title;
  if(info.inside&&info.label?.parentNode)info.label.before(shell);
  else control.before(shell);
  shell.append(control);
  control.classList.add('oihane-native-input-v3');
  if(info.label)info.label.classList.add('oihane-v3-replaced-label');
 }
 function closeOldEmptyGroups(card){
  const selectors='.oihane-form-actions-top,.v519-form-actions,.v520-actions,.v521-actions,.oihane-shop-actions,.oihane-536-order-actions,.actions';
  $$(selectors,card).forEach(group=>{
   if(group.classList.contains('oihane-dialog-header'))return;
   const children=Array.from(group.children);
   if(children.length&&children.every(child=>child.matches('.oihane-dialog-original-action,[hidden]')||child.classList.contains('hidden'))){
    group.classList.add('oihane-v3-empty-group');
   }
  });
  // Ocultar solo contenedores vacíos: conservar los que tienen campos o instrucciones.
  $$('div,section',card).forEach(node=>{
   if(node.matches('.oihane-dialog-identity,.oihane-dialog-actions,.oihane-dialog-header'))return;
   if(node.classList.contains('oihane-dialog-card'))return;
   if(node.children.length===0&&!normalize(node.textContent)&&!node.hasAttribute('role')&&
    /^(v519-form-actions|v520-actions|v521-actions|oihane-shop-actions)$/.test(node.className||''))
    node.classList.add('oihane-v3-empty-group');
  });
 }
 let editingPlantId=null;
 const originalPlantEdit=window.v519EditPlant;
 if(typeof originalPlantEdit==='function')window.v519EditPlant=function(id){
  editingPlantId=id;
  const value=originalPlantEdit.apply(this,arguments);
  requestAnimationFrame(adaptAll);
  return value;
 };
 const originalPlantClose=window.v519CloseForm;
 if(typeof originalPlantClose==='function')window.v519CloseForm=function(){
  editingPlantId=null;
  return originalPlantClose.apply(this,arguments);
 };
 function insertPlantDelete(card){
  if(!card||editingPlantId===null||editingPlantId===undefined||$('#oihanePlantModalDelete',card))return;
  const actions=$('.oihane-dialog-header .oihane-dialog-actions',card);
  if(!actions)return;
  const button=document.createElement('button');
  button.id='oihanePlantModalDelete';button.type='button';button.className='oihane-modal-delete';
  button.textContent='Eliminar';button.setAttribute('aria-label','Eliminar esta planta');
  button.addEventListener('click',()=>{
   // Reutilizar la eliminación segura ya implementada, con confirmación y controles compartidos.
   const cardButton=$$('.v519-plant-card').find(node=>{
    const cmd=node.getAttribute('onclick')||'';
    const m=cmd.match(/v519EditPlant\((.+?)\)/);
    if(!m)return false;
    try{return String(JSON.parse(m[1]))===String(editingPlantId)}
    catch(_){return m[1].replace(/^['"]|['"]$/g,'')===String(editingPlantId)}
   });
   const deletion=cardButton?.closest('.oihane-plant-wrap')?.querySelector('.oihane-plant-delete');
   if(deletion)deletion.click();
   else alert('No se ha encontrado el control de eliminación segura de esta planta. No se ha borrado nada.');
  });
  actions.prepend(button);
 }
 function adaptForms(){
  const roots=$$('.oihane-dialog-root');
  for(const root of roots){
   const card=root.matches('.oihane-dialog-card')?root:$('.oihane-dialog-card',root)||root;
   $$('select',card).forEach(select=>selectOnlyTitle(select));
   $$('input,textarea',card).forEach(control=>inputOnlyTitle(control));
   closeOldEmptyGroups(card);
   if(root.id==='v519Panel'&&typeof screen==='string'&&screen==='Plantas')insertPlantDelete(card);
   if(root.id==='v519Panel'&&typeof screen==='string'&&screen==='Hogar')card.classList.add('oihane-home-form');
  }
  const plan=$('#v522PlanModal');
  if(plan&&!plan.dataset.oihanePlanInitialFixed){
   plan.dataset.oihanePlanInitialFixed='1';
   if(!/Editar plan/i.test($('h2',plan)?.textContent||'')){
    for(const id of ['v522PlanHours','v522PlanMinutes']){const input=$('#'+id,plan);if(input)input.value=''}
   }
  }
 }
 function wishlistBlackFriday(){
  if(typeof screen!=='string'||screen!=='Wishlist')return;
  $$('#v518Body .oihane-wishlist-blackfriday').forEach(label=>{
   const checked=!!$('input[type=checkbox]',label)?.checked;
   if(checked){const tag=document.createElement('span');tag.className='oihane-wishlist-bf-tag';tag.textContent='Black Friday';label.replaceWith(tag)}
   else label.remove();
  });
 }
 function normalizePlans(){
  if(typeof screen!=='string'||screen!=='Planes')return;
  let data=[];
  try{data=JSON.parse(localStorage.getItem('oihane_plans')||'[]')}catch(_){return}
  if(!Array.isArray(data))return;
  $$('.v522-plan-card').forEach(card=>{
   const btn=$('[data-plan-edit]',card);if(!btn)return;
   const p=data.find(item=>String(item.id)===String(btn.dataset.planEdit));
   if(!p?.notes)return;
   const target=$('.v5325-plan-copy strong',card)||$('strong',btn);
   if(!target||$('.oihane-plan-inline-note',card))return;
   const note=document.createElement('span');note.className='oihane-plan-inline-note';
   note.textContent=' · '+String(p.notes).replace(/\s+/g,' ').trim();
   target.after(note);
  });
 }
 const WISH_CACHE_MS=180000;
 let wishFetchedAt=0,wishData=null,wishPending=null,wishOwner='';
 const giftVisible=()=>typeof screen==='string'&&screen==='Regalos'&&!!$('.module-header[data-module="Regalos"]');
 function displayPartnerWishes(){
  if(!giftVisible()||!Array.isArray(wishData))return;
  const current=$('#oihaneOtherWishes');
  if(current?.querySelector('.oihane-partner-wish')){
   $('#oihanePartnerWishRescue')?.remove();return;
  }
  const body=$('#v518Body')||$('#app');if(!body)return;
  let section=$('#oihanePartnerWishRescue');
  if(!section){
   section=document.createElement('section');section.id='oihanePartnerWishRescue';
   section.className='v518-person-group oihane-person-section oihane-wish-rescue';
   body.append(section);
  }
  const signature=JSON.stringify(wishData.map(row=>[row?.owner_id,row?.payload?.title,row?.payload?.price,row?.payload?.link]));
  if(section.dataset.oihaneSignature===signature)return;
  section.dataset.oihaneSignature=signature;
  section.replaceChildren();
  const heading=document.createElement('h3');
  const partner=typeof window.oihanePartnerName==='function'?window.oihanePartnerName():'tu pareja';
  heading.textContent='Wishlist de '+partner;section.append(heading);
  for(const row of wishData){
   const item=row?.payload;
   if(!item?.title)continue;
   const el=document.createElement('div');el.className='v518-line-item oihane-partner-wish';
   const title=document.createElement('span');title.textContent=String(item.title).slice(0,180);
   title.className='v518-item-name';el.append(title);
   if(item.price){const price=document.createElement('small');price.className='v518-price';price.textContent=String(item.price).slice(0,35)+' €';el.append(price)}
   if(/^https?:\/\//i.test(String(item.link||''))){
    const link=document.createElement('a');link.href=String(item.link);link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='Ver enlace';link.className='small-action';el.append(link);
   }
   section.append(el);
  }
  if(!wishData.length){const status=document.createElement('p');status.className='hint';status.textContent='No hay elementos compartidos disponibles.';section.append(status)}
 }
 async function fetchPartnerWishes(){
  if(!giftVisible()||!navigator.onLine||!localStorage.getItem('oihane_sync_access')||!window.oihaneSyncRuntime?.request)return;
  const uid=localStorage.getItem('oihane_sync_user')||'';if(!uid)return;
  if(wishOwner!==uid){wishOwner=uid;wishData=null;wishFetchedAt=0}
  if(wishPending)return wishPending;
  if(Date.now()-wishFetchedAt<WISH_CACHE_MS){displayPartnerWishes();return}
  wishPending=(async()=>{
   const api=window.oihaneSyncRuntime.request;
   let linkId='';
   try{
    const profile=JSON.parse(localStorage.getItem('oihane_sync_shared_profile')||'null');
    if(profile?.uid===uid&&typeof profile.link_id==='string')linkId=profile.link_id;
   }catch(_){}
   if(!linkId){
    const links=await api('/rest/v1/oihane_partner_links?select=id,user_a,user_b&status=eq.active&limit=1',{method:'GET',timeoutMs:20000});
    const link=Array.isArray(links)?links.find(r=>r.user_a===uid||r.user_b===uid):null;
    linkId=link?.id||'';
   }
   if(!linkId)return;
   // Nunca descargar fotos de la Wishlist ajena solo para mostrar ideas de regalos.
   const rows=await api('/rest/v1/oihane_shared_records?select=owner_id,title:payload->>title,price:payload->>price,link:payload->>link&module=eq.wishlist&link_id=eq.'+
    encodeURIComponent(linkId)+'&owner_id=neq.'+encodeURIComponent(uid)+'&shared=eq.true&deleted_at=is.null&limit=100',
    {method:'GET',timeoutMs:20000});
   if(!Array.isArray(rows))throw Error('Respuesta incompleta de la Wishlist');
   wishData=rows.filter(row=>row.owner_id!==uid&&row.title).map(row=>({
    owner_id:row.owner_id,payload:{title:row.title,price:row.price,link:row.link},shared:true
   }));
   wishFetchedAt=Date.now();
   displayPartnerWishes();
  })().catch(error=>{
   // Evitar un bucle de peticiones si la red no responde.
   wishFetchedAt=Date.now()-WISH_CACHE_MS+15000;
   console.warn('Wishlist compartida pendiente; se mantienen los datos originales:',error);
   displayPartnerWishes();
  }).finally(()=>{wishPending=null});
  return wishPending;
 }
 function adaptAll(){
  adaptForms();wishlistBlackFriday();normalizePlans();
  if(giftVisible()){displayPartnerWishes();if(!wishFetchedAt)void fetchPartnerWishes()}
 }
 let scheduled=false;
 const schedule=()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;adaptAll()});
 };
 const observer=new MutationObserver(records=>{
  if(records.some(record=>record.type==='childList'||record.attributeName==='class'||record.attributeName==='hidden'))schedule();
 });
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-module="Regalos"],.v518-plus'))setTimeout(()=>{if(giftVisible())void fetchPartnerWishes()},50);
  schedule();
 },true);
 document.addEventListener('change',schedule,true);
 window.addEventListener('focus',()=>{if(giftVisible())void fetchPartnerWishes()});
 window.oihaneFormRefactor55921=Object.freeze({version:'5.59.22',refresh:schedule,refreshPartnerWishes:fetchPartnerWishes});
 schedule();
})();
