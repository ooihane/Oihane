/* Oihane 5.59.25 — correcciones funcionales solicitadas. */
(function(){
 'use strict';
 if(window.__oihane55925Corrections)return;
 window.__oihane55925Corrections=true;

 const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const localToday=()=>{if(typeof today==='function')return today();const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const readExtra=name=>{try{const rows=extraItems(name);return Array.isArray(rows)?rows:[]}catch(_){return []}};
 const saveExtraSafe=(name,rows)=>typeof saveExtra==='function'&&saveExtra(name,rows);
 const currentScroll=()=>{
  const root=document.scrollingElement||document.documentElement;
  return {y:Number(window.scrollY||root.scrollTop||0),app:Number(document.getElementById('app')?.scrollTop||0)};
 };
 const restoreScroll=pos=>{
  if(!pos)return;
  try{window.scrollTo(0,pos.y);if(document.scrollingElement)document.scrollingElement.scrollTop=pos.y;const app=document.getElementById('app');if(app)app.scrollTop=pos.app}catch(_){}
 };
 function removeExtraRecord(name,id,ask=true){
  const rows=readExtra(name),item=rows.find(x=>String(x.id)===String(id));
  if(!item)return;
  if(typeof window.deleteExtra==='function'){
   if(ask){window.deleteExtra(name,item.id)}else{const oldConfirm=window.confirm;try{window.confirm=()=>true;window.deleteExtra(name,item.id)}finally{window.confirm=oldConfirm}}
  }else if(saveExtraSafe(name,rows.filter(x=>String(x.id)!==String(item.id))))window.renderExtraModule?.(name);
 }
 // Product store assignments are remembered after every successful product save.
 if(typeof save==='function'){
  const originalSave=save;
  window.save=function(){
   const result=originalSave.apply(this,arguments);
   try{
    if(typeof products!=='undefined'&&Array.isArray(products)&&typeof window.oihaneRememberShoppingAssignment==='function'){
     const prefKey='oihane_product_preferences_v1',before=localStorage.getItem(prefKey)||'{}';
     const builtin=['General','Lidl','Eroski','Mercadona','Dia'];
     let shops=[];try{const saved=JSON.parse(localStorage.getItem('oihane_custom_shops_v1')||'[]');if(Array.isArray(saved))shops=saved}catch(_){}
     for(const product of products){
      if(!product||!product.title||!product.store)continue;
      const storeName=String(product.store).trim();
      product.lists=['General',storeName];
      if(storeName.toLocaleLowerCase('es')!=='lidl')product.storeManual=true;
      if(!builtin.some(x=>x.toLocaleLowerCase('es')===storeName.toLocaleLowerCase('es'))){
       if(!shops.some(x=>String(x).toLocaleLowerCase('es')===storeName.toLocaleLowerCase('es')))shops.push(storeName);
       if(Array.isArray(window.oihaneShopStores)&&!window.oihaneShopStores.some(x=>String(x).toLocaleLowerCase('es')===storeName.toLocaleLowerCase('es')))window.oihaneShopStores.push(storeName);
       product.storeManual=true;
      }
      window.oihaneRememberShoppingAssignment(product.title,storeName,product.category||'Otros');
     }
     shops=shops.filter((x,i,a)=>typeof x==='string'&&x.trim()&&!builtin.some(b=>b.toLocaleLowerCase('es')===x.toLocaleLowerCase('es'))&&a.findIndex(y=>String(y).toLocaleLowerCase('es')===x.toLocaleLowerCase('es'))===i).slice(0,20);
     localStorage.setItem('oihane_custom_shops_v1',JSON.stringify(shops));
     localStorage.setItem('oihane_products',JSON.stringify(products));
     window.oihaneSharedShoppingChanged?.();
     if(before!==(localStorage.getItem(prefKey)||'{}')){window.queueLocalSnapshot?.();window.queueCloudSync?.()}
    }
   }catch(error){console.warn('Oihane: no se pudo actualizar la memoria de supermercados',error)}
   return result;
  };
 }
 if(typeof window.oihaneLearnShoppingAssignments==='function'){
  const originalLearn=window.oihaneLearnShoppingAssignments;
  window.oihaneLearnShoppingAssignments=function(items){
   const rows=(items||[]).map(item=>item?.storeManual?{...item,categoryManual:true}:item);
   return originalLearn.call(this,rows);
  };
 }

 // Hogar: X y check completan/eliminan el registro mediante el borrado compartido real.
 window.v519Delete=function(name,id){removeExtraRecord(name,id)};
 window.v519ToggleBought=function(id,checked){if(checked)removeExtraRecord('Hogar',id,false)};
 // Wishlist: tanto X como el check de conseguido son eliminaciones definitivas sincronizadas.
 window.v518WishlistDelete=function(id){removeExtraRecord('Wishlist',id)};
 window.oihaneMarkObtained=function(id,obtained){
  const rows=readExtra('Wishlist'),item=rows.find(x=>String(x.id)===String(id));if(!item)return;
  if(obtained){removeExtraRecord('Wishlist',id,false);return}
  item.obtained=false;if(saveExtraSafe('Wishlist',rows))window.renderExtraModule?.('Wishlist');
 };

 // Calendario > Todos: futuros primero y archivo plegable al final.
 const oldCalendarRows=window.calendarRows;
 if(typeof oldCalendarRows==='function'){
  window.calendarRows=function(){
   if(typeof calendarView==='undefined'||calendarView!=='all')return oldCalendarRows.apply(this,arguments);
   const now=localToday(),all=(typeof events!=='undefined'&&Array.isArray(events)?events:[]).filter(e=>e&&e.date);
   const order=(a,b)=>((a.date||'')+(a.time||'')).localeCompare((b.date||'')+(b.time||''));
   const future=all.filter(e=>e.date>=now).sort(order),past=all.filter(e=>e.date<now).sort((a,b)=>order(b,a));
   const row=e=>{
    const id=JSON.stringify(e.id),title=escapeHTML(e.title||'Evento');
    const date=e.date===now?'HOY':escapeHTML(typeof fmt==='function'?fmt(e.date):e.date);
    const badge=window.oihaneShareBadge?.(e)||'';
    return '<div class="item calendar-event-row" role="button" tabindex="0" aria-label="Editar '+title+'" onclick="editEvent('+id+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();editEvent('+id+')}">'+
     '<div class="event-date">'+date+(e.time?'<span class="oihane-cal-time">'+escapeHTML(e.time)+'</span>':'')+'</div>'+
     '<div class="item-main"><div class="event-title-line"><span class="item-title">'+title+'</span>'+badge+
     (e.location?'<span class="event-inline-meta">📍 '+escapeHTML(e.location)+'</span>':'')+
     (e.people?'<span class="event-inline-meta">· '+escapeHTML(e.people)+'</span>':'')+'</div>'+
     (e.notes&&!/^Plan enlazado desde Planes$/.test(e.notes)?'<div class="item-meta event-notes">'+escapeHTML(e.notes)+'</div>':'')+'</div>'+
     '<button type="button" class="shop-delete" aria-label="Eliminar '+title+'" onclick="event.stopPropagation();deleteEvent('+id+')">×</button></div>';
   };
   let html=future.length?future.map(row).join(''):'<div class="empty-list">No tienes eventos futuros programados.</div>';
   if(past.length)html+='<details class="oihane-55925-archive"><summary>Eventos pasados ('+past.length+')</summary><div class="oihane-55925-archive-list">'+past.map(row).join('')+'</div></details>';
   return html;
  };
 }

 function archivePastGuards(){
  if(typeof screen==='undefined'||screen!=='Estudio')return;
  const body=document.getElementById('v520Body');if(!body)return;
  const section=[...body.querySelectorAll('.v520-section')].find(s=>s.querySelector('h2')?.textContent.trim()==='Guardias');
  if(!section||section.querySelector('.oihane-55925-guard-archive'))return;
  const records=readExtra('Estudio'),past=[];
  for(const row of [...section.querySelectorAll('.v520-course-row')]){
   const button=row.querySelector('[data-v520-title]'),id=button?.getAttribute('data-v520-title');
   const record=records.find(x=>String(x.id)===String(id));
   if(record?.date&&record.date<localToday())past.push({row,record});
  }
  if(!past.length)return;
  const futureRows=[...section.querySelectorAll('.v520-course-row')].filter(row=>!past.some(x=>x.row===row));
  if(!futureRows.length)section.querySelector('.v520-empty')?.remove();
  past.sort((a,b)=>String(b.record.date||'').localeCompare(String(a.record.date||'')));
  const details=document.createElement('details');details.className='oihane-55925-archive oihane-55925-guard-archive';
  const summary=document.createElement('summary');summary.textContent='Guardias pasadas ('+past.length+')';
  const list=document.createElement('div');list.className='oihane-55925-archive-list';
  past.forEach(x=>list.appendChild(x.row));details.append(summary,list);section.appendChild(details);
 }

 // Regalos: checkbox de compra independiente, sin retirar el regalo de la lista.
 function decorateGiftRows(){
  if(typeof screen==='undefined'||screen!=='Regalos')return;
  const rows=readExtra('Regalos');
  document.querySelectorAll('#app .v518-line-item').forEach(line=>{
   if(line.querySelector('.oihane-55925-gift-check'))return;
   const edit=line.querySelector('[onclick*="v518GiftEdit"]');if(!edit)return;
   const match=(edit.getAttribute('onclick')||'').match(/v518GiftEdit\((.+?)\)/);if(!match)return;
   let id;try{id=JSON.parse(match[1])}catch(_){id=match[1].replace(/^['"]|['"]$/g,'')}
   const gift=rows.find(x=>String(x.id)===String(id));if(!gift)return;
   const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.className='oihane-55925-gift-check';
   checkbox.checked=Object.prototype.hasOwnProperty.call(gift,'purchased')?!!gift.purchased:['Comprado','Pedido','En camino','Entregado'].includes(gift.status);
   checkbox.setAttribute('aria-label','Marcar como comprado: '+String(gift.title||'regalo'));
   checkbox.title='Ya está comprado';
   checkbox.addEventListener('change',()=>{
    const latest=readExtra('Regalos'),target=latest.find(x=>String(x.id)===String(id));if(!target)return;
    target.purchased=checkbox.checked;
    target.purchasedAt=checkbox.checked?localToday():'';
    if(saveExtraSafe('Regalos',latest))window.renderExtraModule?.('Regalos');
   });
   const remove=line.querySelector('.delete');line.insertBefore(checkbox,remove||null);
  });
 }

 // Plantas: riego múltiple desde una sola ventana.
 function plantScrollButton(){
  if(typeof screen==='undefined'||screen!=='Plantas')return;
  const section=document.querySelector('#v519Body .v519-section');if(!section)return;
  const heading=section.querySelector('h2');if(!heading||section.querySelector('#oihane55925BulkWater'))return;
  const button=document.createElement('button');button.type='button';button.id='oihane55925BulkWater';
  button.className='oihane-55925-bulk-water';button.textContent='Plantas que he regado hoy';
  button.addEventListener('click',openBulkWaterModal);heading.insertAdjacentElement('afterend',button);
 }
 function openBulkWaterModal(){
  const plants=readExtra('Plantas').slice().sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'es'));
  if(!plants.length){alert('Todavía no tienes plantas guardadas.');return}
  const modal=document.createElement('div');modal.className='oihane-55925-modal-wrap';modal.id='oihane55925BulkWaterModal';
  const rows=plants.map(p=>{
   const id=escapeHTML(p.id),title=escapeHTML(p.title||'Planta'),room=escapeHTML(p.room||'Sin estancia');
   const done=p.lastWatered===localToday()&&Array.isArray(p.wateringHistory)&&p.wateringHistory.some(x=>x.date===localToday());
   return '<label class="oihane-55925-plant-choice"><input type="checkbox" data-plant-water-id="'+id+'" '+(done?'checked disabled':'')+'><span><strong>'+title+'</strong><small>'+room+(done?' · Riego ya registrado hoy':'')+'</small></span></label>';
  }).join('');
  modal.innerHTML='<form class="oihane-55925-modal"><h2>Plantas que he regado hoy</h2><p>Marca todas las plantas que has regado hoy. Se registrará el riego de cada una sin modificar la comprobación del suelo.</p><div class="oihane-55925-plant-choices">'+rows+'</div><div class="oihane-55925-modal-actions"><button type="button" class="small-action" data-cancel>Cancelar</button><button type="submit" class="primary">Registrar riego hoy</button></div></form>';
  document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
  modal.querySelector('[data-cancel]').onclick=()=>modal.remove();
  modal.querySelector('form').onsubmit=e=>{
   e.preventDefault();
   const ids=[...modal.querySelectorAll('[data-plant-water-id]:checked:not(:disabled)')].map(x=>x.dataset.plantWaterId);
   if(!ids.length){alert('Selecciona al menos una planta que hayas regado hoy.');return}
   const all=readExtra('Plantas');let count=0;
   for(const plant of all){if(!ids.includes(String(plant.id)))continue;const days=Math.max(1,Number(plant.waterWaitDays)||5);if(typeof window.oihanePlantLogWatering==='function')window.oihanePlantLogWatering(plant,localToday(),days);else{plant.lastWatered=localToday();plant.date='';plant.status='Bien'}count++}
   const pos=currentScroll();modal.remove();
   if(count&&saveExtraSafe('Plantas',all)){window.__oihane55925PlantRestore=pos;window.renderExtraModule?.('Plantas')}
  };
 }

 // Mantener el desplazamiento de la lista de plantas tras editar o guardar una ficha.
 const oldPlantEdit=window.v519EditPlant;
 if(typeof oldPlantEdit==='function')window.v519EditPlant=function(id){
  window.__oihane55925PlantRestore=currentScroll();
  const result=oldPlantEdit.apply(this,arguments);
  const record=readExtra('Plantas').find(x=>String(x.id)===String(id));
  const preview=document.querySelector('#v519Panel .v519-preview');
  if(preview){
   preview.replaceChildren();
   if(record?.photo){
    const token=String(id)+'-'+Date.now(),img=document.createElement('img');
    img.className='photo-preview';img.alt='Foto de '+String(record.title||'la planta');img.dataset.oihanePhotoRequest=token;preview.appendChild(img);
    const photoPromise=window.oihanePlantPhotos?.get?window.oihanePlantPhotos.get(record.photo):Promise.resolve(record.photo);
    Promise.resolve(photoPromise).then(src=>{
     if(img.isConnected&&img.dataset.oihanePhotoRequest===token&&typeof src==='string'&&src)img.src=src;
    }).catch(error=>{if(img.isConnected){img.alt='No se ha podido cargar la foto de esta planta';console.warn('Foto de planta no disponible',error)}});
   }
  }
  return result;
 };
 const oldPlantClose=window.v519CloseForm;
 if(typeof oldPlantClose==='function')window.v519CloseForm=function(){window.__oihane55925PlantRestore=null;return oldPlantClose.apply(this,arguments)};

 // Alojamiento en Viajes: datos estructurados y visibles en la ficha.
 function tripFields(){
  const modal=document.getElementById('v521Modal'),form=document.getElementById('v521TripForm');
  if(!modal||!form||form.dataset.oihane55925Accommodation)return;
  form.dataset.oihane55925Accommodation='1';
  const editId=window.__oihane55925TripEditId||'';
  const allBefore=readExtra('Viajes'),beforeIds=allBefore.map(x=>String(x.id));
  const trip=editId?allBefore.find(x=>String(x.id)===String(editId)):null,a=trip?.accommodation||{};
  form.dataset.oihane55925TripEditId=String(editId);
  form.dataset.oihane55925TripBeforeIds=JSON.stringify(beforeIds);
  const field=(label,id,value,type)=>'<div class="v521-field"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+(type||'text')+'" value="'+escapeHTML(value||'')+'"></div>';
  const block=document.createElement('div');block.className='v521-subform oihane-55925-accommodation';block.id='oihane55925Accommodation';
  block.innerHTML='<strong>Alojamiento</strong>'+
   '<div class="v521-two">'+field('Nombre del alojamiento','oihane55925StayName',a.name,'text')+field('Ubicación / dirección','oihane55925StayLocation',a.location,'text')+'</div>'+
   '<div class="v521-two">'+field('Fecha de entrada','oihane55925CheckInDate',a.checkInDate,'date')+field('Hora de entrada','oihane55925CheckInTime',a.checkInTime,'time')+'</div>'+
   '<div class="v521-two">'+field('Fecha de salida','oihane55925CheckOutDate',a.checkOutDate,'date')+field('Hora de salida','oihane55925CheckOutTime',a.checkOutTime,'time')+'</div>'+
   '<div class="v521-two">'+field('Enlace de reserva','oihane55925StayLink',a.link,'url')+field('Localizador de reserva','oihane55925StayReference',a.reference,'text')+'</div>'+
   '<label for="oihane55925StayNotes">Notas del alojamiento</label><textarea id="oihane55925StayNotes" rows="2">'+escapeHTML(a.notes||'')+'</textarea>';
  const rental=[...form.querySelectorAll('.v521-subform')].find(x=>/Coche de alquiler/i.test(x.textContent));
  if(rental)rental.before(block);else form.querySelector('.v521-actions')?.before(block);
  form.addEventListener('submit',()=>{
   const values={
    name:form.querySelector('#oihane55925StayName')?.value.trim()||'',
    location:form.querySelector('#oihane55925StayLocation')?.value.trim()||'',
    checkInDate:form.querySelector('#oihane55925CheckInDate')?.value||'',
    checkInTime:form.querySelector('#oihane55925CheckInTime')?.value||'',
    checkOutDate:form.querySelector('#oihane55925CheckOutDate')?.value||'',
    checkOutTime:form.querySelector('#oihane55925CheckOutTime')?.value||'',
    link:form.querySelector('#oihane55925StayLink')?.value.trim()||'',
    reference:form.querySelector('#oihane55925StayReference')?.value.trim()||'',
    notes:form.querySelector('#oihane55925StayNotes')?.value.trim()||''
   };
   const currentEdit=form.dataset.oihane55925TripEditId||'',initial=JSON.parse(form.dataset.oihane55925TripBeforeIds||'[]');
   const title=form.querySelector('#v521TripTitle')?.value.trim()||'',start=form.querySelector('#v521TripStart')?.value||'';
   queueMicrotask(()=>{
    const rows=readExtra('Viajes');
    let saved=currentEdit?rows.find(x=>String(x.id)===String(currentEdit)):rows.filter(x=>!initial.includes(String(x.id))&&String(x.title||'').trim()===title&&String(x.startDate||x.date||'')===start).slice(-1)[0];
    if(!saved)return;
    const has=Object.values(values).some(x=>String(x||'').trim());
    if(has)saved.accommodation=values;else delete saved.accommodation;
    if(saveExtraSafe('Viajes',rows))window.renderExtraModule?.('Viajes');
   });
  });
  window.__oihane55925TripEditId=null;
 }
 function decorateTripCards(){
  if(typeof screen==='undefined'||screen!=='Viajes')return;
  const trips=readExtra('Viajes');
  document.querySelectorAll('#app .v521-trip-card').forEach(card=>{
   if(card.querySelector('.oihane-55925-stay-card'))return;
   const edit=card.querySelector('[data-trip-edit]'),id=edit?.dataset.tripEdit;
   const trip=trips.find(x=>String(x.id)===String(id)),a=trip?.accommodation;
   if(!a||!Object.values(a).some(x=>String(x||'').trim()))return;
   const box=document.createElement('div');box.className='oihane-55925-stay-card';
   const heading=document.createElement('strong');heading.textContent='Alojamiento'+(a.name?' · '+a.name:'');box.appendChild(heading);
   if(a.location){const p=document.createElement('p');p.textContent=a.location;box.appendChild(p)}
   const dateLabel=(label,date,time)=>{if(!date&&!time)return;const p=document.createElement('p');let value=label+': ';if(date)value+=typeof fmt==='function'?fmt(date):date;if(time)value+=(date?' · ':'')+time;p.textContent=value;box.appendChild(p)};
   dateLabel('Entrada',a.checkInDate,a.checkInTime);dateLabel('Salida',a.checkOutDate,a.checkOutTime);
   if(a.reference){const p=document.createElement('p');p.textContent='Localizador: '+a.reference;box.appendChild(p)}
   if(a.link){try{const url=new URL(a.link);if(['http:','https:'].includes(url.protocol)){const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ver reserva ↗';box.appendChild(link)}}catch(_){}}
   const anchor=card.querySelector('.v521-timeline');if(anchor)anchor.insertAdjacentElement('afterend',box);else card.appendChild(box);
  });
 }

 // Pedidos: tombstone explícito en Supabase antes de quitarlo del dispositivo.
 async function removeOrderPermanently(id){
  const key='oihane_orders';let all=[];try{all=JSON.parse(localStorage.getItem(key)||'[]')}catch(_){}
  if(!Array.isArray(all))all=[];
  const item=all.find(x=>String(x.id)===String(id));if(!item)return;
  if(!confirm('¿Eliminar definitivamente el pedido «'+String(item.name||'Pedido')+'»?'))return;
  const uid=localStorage.getItem('oihane_sync_user')||'';
  try{
   const api=window.oihaneSyncRuntime?.request?.bind(window.oihaneSyncRuntime);
   const needsCloud=!!item._oihaneSharedId||!!(item.sharedWithPartner===true&&uid);
   if(needsCloud&&(!navigator.onLine||!api||!uid))throw Error('Conéctate a Internet e inicia sesión para eliminar definitivamente este pedido compartido.');
   if(needsCloud){
    const source=item._oihaneSharedSource||uid+'|'+String(item.id);
    const selector=item._oihaneSharedId?'id=eq.'+encodeURIComponent(item._oihaneSharedId):'source_key=eq.'+encodeURIComponent(source);
    const path='/rest/v1/oihane_shared_records?select=id,revision,deleted_at&module=eq.pedidos&'+selector+'&limit=1';
    const remote=await api(path,{method:'GET'}),row=Array.isArray(remote)?remote[0]:null;
    if(row&&!row.deleted_at){
     const patch=await api('/rest/v1/oihane_shared_records?id=eq.'+encodeURIComponent(row.id)+'&revision=eq.'+encodeURIComponent(row.revision)+'&select=id',{
      method:'PATCH',headers:{Prefer:'return=representation','Content-Type':'application/json'},
      body:JSON.stringify({deleted_at:new Date().toISOString(),deleted_by:uid})
     });
     if(!Array.isArray(patch)||!patch.length){
      const verify=await api(path,{method:'GET'});
      if(!Array.isArray(verify)||!verify[0]?.deleted_at)throw Error('Supabase no ha confirmado la eliminación');
     }
    }
   }
   localStorage.setItem(key,JSON.stringify(all.filter(x=>String(x.id)!==String(id))));
   window.queueLocalSnapshot?.();window.queueCloudSync?.();window.oihaneMixedChanged?.('Pedidos');
   window.renderOrders?.();
  }catch(error){alert('No se ha eliminado el pedido porque no se pudo confirmar el borrado compartido: '+String(error?.message||error))}
 }
 document.addEventListener('click',event=>{
  const order=event.target?.closest?.('[data-order-remove]');if(order){
   event.preventDefault();event.stopImmediatePropagation();void removeOrderPermanently(order.dataset.orderRemove);return;
  }
  if(typeof screen!=='undefined'&&screen==='Plantas'&&event.target?.closest?.('#v519Add'))window.__oihane55925PlantRestore=currentScroll();
  const plant=event.target?.closest?.('[data-plant-room-toggle]');if(plant&&typeof screen!=='undefined'&&screen==='Plantas')window.__oihane55925PlantRestore=currentScroll();
  if(event.target?.closest?.('[data-trip-edit]')){
   window.__oihane55925TripEditId=event.target.closest('[data-trip-edit]').dataset.tripEdit||'';
   queueMicrotask(()=>requestAnimationFrame(tripFields));
  }else if(event.target?.closest?.('#v521Add')){
   window.__oihane55925TripEditId=null;queueMicrotask(()=>requestAnimationFrame(tripFields));
  }
 },true);

 const originalRenderExtra=window.renderExtraModule;
 if(typeof originalRenderExtra==='function'){
  window.renderExtraModule=function(name){
   const wasPlant=name==='Plantas'&&typeof screen!=='undefined'&&screen==='Plantas';
   const restore=wasPlant?(window.__oihane55925PlantRestore||currentScroll()):null;
   const result=originalRenderExtra.apply(this,arguments);
   requestAnimationFrame(()=>{
    if(name==='Estudio')archivePastGuards();
    if(name==='Regalos')decorateGiftRows();
    if(name==='Plantas'){plantScrollButton();if(restore){restoreScroll(restore);window.__oihane55925PlantRestore=null}}
    if(name==='Viajes')decorateTripCards();
   });
   return result;
  };
 }
 const modalObserver=new MutationObserver(()=>{if(document.getElementById('v521Modal'))tripFields()});
 if(document.body)modalObserver.observe(document.body,{childList:true,subtree:true});
 const app=document.getElementById('app');
 if(app){
  let pending=false;
  new MutationObserver(()=>{
   if(pending)return;pending=true;
   requestAnimationFrame(()=>{pending=false;plantScrollButton();decorateGiftRows();decorateTripCards();if(typeof screen!=='undefined'&&screen==='Estudio')archivePastGuards()});
  }).observe(app,{childList:true,subtree:true});
 }
})();