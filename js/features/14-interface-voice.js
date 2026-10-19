



/* --- oihane-5360-features --- */

/* Oihane 5.36.1 — pedidos refinados, títulos corregidos y arte Saint-Lazare. */
(function(){
 'use strict';
 const key='oihane_orders';
 const statuses=['Recibido','En preparación','Enviado','Recibido en el país de destino','En reparto','Pendiente de recogida','Entregado','Incidencia'];
 const statusOf=value=>value==='Registrado'?'Recibido':statuses.includes(value)?value:statuses[0];
 const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const dateLocal=()=>today();
 const load=()=>{try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a:[]}catch(_){return []}};
 function persist(items){
  try{localStorage.setItem(key,JSON.stringify(items));queueLocalSnapshot();queueCloudSync();try{window.oihaneMixedChanged?.('Pedidos')}catch(_){}return true}
  catch(e){alert('No se pudo guardar el pedido. Comprueba el espacio del dispositivo y exporta una copia JSON.');return false}
 }
 const idNew=()=>typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():'pedido-'+Date.now()+'-'+Math.floor(Math.random()*1e9);
 function safeURL(raw){try{const url=new URL(String(raw||'').trim());return url.protocol==='http:'||url.protocol==='https:'?url.href:''}catch(_){return ''}}
 const niceDate=x=>x?new Date(x+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}):'';

 function orderRow(item){
  const status=statusOf(item.status),title=escapeHTML(item.name||'Pedido sin nombre'),url=safeURL(item.trackingURL);
  const date=item.estimatedDate?niceDate(item.estimatedDate):'Sin fecha';
  const store=escapeHTML(item.store||'Sin tienda'),carrier=escapeHTML(item.carrier||'Sin transportista');
  const place=escapeHTML(item.location||((item.deliveryType||item.deliveryMode)==='Recogida'?'Punto de recogida sin indicar':'A domicilio'));
  const lookup=url?'<a class="small-action oihane-538-search" href="'+escapeHTML(url)+'" target="_blank" rel="noopener noreferrer" aria-label="Buscar seguimiento de '+title+'">Buscar</a>':'<button type="button" class="small-action oihane-538-search" disabled title="Añade un enlace de seguimiento al editar el pedido">Buscar</button>';
  return '<article class="oihane-537-order v518-line-item" data-order-row="'+escapeHTML(item.id)+'" tabindex="0" aria-label="Editar pedido '+title+'">'+
   '<div class="oihane-537-main"><div class="oihane-537-heading"><button type="button" class="v518-item-name oihane-537-name" data-order-edit="'+escapeHTML(item.id)+'">'+title+'</button><span class="oihane-537-status">'+escapeHTML(status)+'</span><span class="oihane-539-eta">Entrega: '+escapeHTML(date)+'</span></div>'+
   '<div class="oihane-537-actions">'+lookup+'<button type="button" class="delete oihane-537-delete" data-order-remove="'+escapeHTML(item.id)+'" aria-label="Eliminar '+title+'" title="Eliminar pedido">×</button></div></div>'+
   '<div class="oihane-538-meta-line" aria-label="Tienda, transportista y ubicación">'+
   '<span class="oihane-538-store" title="'+store+'">'+store+'</span> '+
   '<span class="oihane-538-carrier" title="'+carrier+'">'+carrier+'</span> '+
   '<span class="oihane-538-place" title="'+place+'">'+place+'</span></div>'+
   (item.latestUpdate?'<div class="oihane-537-meta">Actualización: '+escapeHTML(item.latestUpdate)+'</div>':'')+
   (item.notes?'<p class="oihane-537-notes">'+escapeHTML(item.notes)+'</p>':'')+'</article>';
 }
 window.renderOrders=function(){
  screen='Pedidos';
  const all=load().slice().sort((a,b)=>Number(statusOf(a.status)==='Entregado')-Number(statusOf(b.status)==='Entregado')||
     (a.estimatedDate||'9999').localeCompare(b.estimatedDate||'9999'));
  const app=document.getElementById('app');
  app.innerHTML=unifiedHeader('Pedidos')+
    '<section class="oihane-537-list v518-list-section"><div class="oihane-537-headingbar"><h2>Seguimiento</h2><button type="button" class="oihane-537-add" id="oihane536NewOrder" aria-label="Añadir pedido" title="Añadir pedido">+</button></div>'+
    (all.length?all.map(orderRow).join(''):'<p class="hint">Todavía no tienes pedidos registrados.</p>')+'</section>';
  document.getElementById('oihane536NewOrder').onclick=()=>openEditor();
  app.querySelectorAll('[data-order-edit]').forEach(b=>b.onclick=()=>openEditor(b.dataset.orderEdit));
  app.querySelectorAll('[data-order-remove]').forEach(b=>b.onclick=()=>removeOrder(b.dataset.orderRemove));
  app.querySelectorAll('[data-order-row]').forEach(row=>{
   const go=e=>{if(e.type==='click'&&e.target.closest('button,a,input,select,textarea'))return;
     if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;
     if(e.type==='keydown'&&e.target!==row)return;
     if(e.type==='keydown')e.preventDefault();
     openEditor(row.dataset.orderRow);
   };
   row.addEventListener('click',go);
   row.addEventListener('keydown',go);
  });
 };
 function removeOrder(id){const all=load();const target=all.find(o=>String(o.id)===String(id));if(!target||!confirm('¿Eliminar el pedido «'+target.name+'»?'))return;const filtered=all.filter(o=>String(o.id)!==String(id));if(persist(filtered))renderOrders()}
 function markReceived(id){const all=load(),item=all.find(o=>String(o.id)===String(id));if(!item)return;item.status='Entregado';item.deliveredAt=dateLocal();item.updatedAt=new Date().toISOString();if(persist(all))renderOrders()}
 function openEditor(id){
  const all=load(),saved=id?all.find(o=>String(o.id)===String(id)):null;
  const curtain=document.createElement('div');curtain.className='oihane-536-order-curtain';
  curtain.innerHTML='<form class="oihane-536-order-form" id="oihane536OrderForm">'+
  '<h2>'+(saved?'Editar pedido':'Añadir pedido')+'</h2>'+
  '<label>Nombre del producto o pedido *<input name="name" maxlength="180" required placeholder="Ej. Zapatillas deportivas"></label>'+
  '<label>Tienda<input name="store" maxlength="140" placeholder="Ej. Zalando"></label>'+
  '<label>Número de pedido<input name="orderNumber" maxlength="140" autocomplete="off"></label>'+
  '<label>Transportista<input name="carrier" maxlength="120" placeholder="Ej. Correos"></label>'+
  '<label>Número de seguimiento<input name="trackingNumber" maxlength="180" autocomplete="off"></label>'+
  '<label>Enlace de seguimiento<input name="trackingURL" type="url" placeholder="https://..."></label>'+
  '<div class="oihane-536-order-twocol"><label>Fecha de compra<input name="purchaseDate" type="date"></label><label>Entrega prevista<input name="estimatedDate" type="date"></label></div>'+
  '<label>Entrega<select name="deliveryType"><option value="A domicilio">A domicilio</option><option value="Recogida">Recogida</option></select></label>'+
  '<label>Ubicación<input name="location" maxlength="260" placeholder="Dirección, ciudad o punto de recogida"></label>'+
  '<label>Estado<select name="status">'+statuses.map(s=>'<option value="'+escapeHTML(s)+'">'+escapeHTML(s)+'</option>').join('')+'</select></label>'+
  '<label class="oihane-share-label"><input name="sharedWithPartner" type="checkbox"> Compartir con mi pareja</label>'+
  '<label>Última actualización<input name="latestUpdate" maxlength="220" placeholder="Ej. En reparto desde las 08:12"></label>'+
  '<label class="oihane-536-order-check"><input type="checkbox" name="notify"> Avisarme a las 09:00 del día previsto (no confirma el reparto)</label>'+
  '<label>Notas<textarea name="notes" rows="3" maxlength="2500"></textarea></label>'+
  '<div class="oihane-536-order-actions"><button class="primary" type="submit">Guardar pedido</button><button type="button" data-cancel>Cancelar</button></div></form>';
  document.body.appendChild(curtain);curtain.onclick=e=>{if(e.target===curtain)curtain.remove()};const form=curtain.querySelector('form');form.querySelector('[data-cancel]').onclick=()=>curtain.remove();
  const fields=['name','store','orderNumber','carrier','trackingNumber','trackingURL','purchaseDate','estimatedDate','deliveryType','location','status','latestUpdate','notes'];
  for(const field of fields){const inp=form.elements.namedItem(field);if(inp)inp.value=field==='status'?statusOf(saved?.status):field==='deliveryType'?(saved?.deliveryType||saved?.deliveryMode||'A domicilio'):(saved?.[field]??'')}
  form.elements.namedItem('notify').checked=!!saved?.notify;form.elements.namedItem('sharedWithPartner').checked=saved?saved.sharedWithPartner===true:true;
  form.onsubmit=e=>{
   e.preventDefault();const get=n=>String(form.elements.namedItem(n)?.value||'').trim();
   const name=get('name'),trackingURL=get('trackingURL');if(!name){alert('Escribe un nombre para el pedido.');return}
   if(trackingURL&&!safeURL(trackingURL)){alert('El enlace debe comenzar por http:// o https://.');return}
   const status=get('status');const stamp=new Date().toISOString();const record={...saved,id:saved?.id||idNew(),name,store:get('store'),orderNumber:get('orderNumber'),carrier:get('carrier'),trackingNumber:get('trackingNumber'),trackingURL:safeURL(trackingURL),purchaseDate:get('purchaseDate'),estimatedDate:get('estimatedDate'),deliveryType:get('deliveryType')==='Recogida'?'Recogida':'A domicilio',location:get('location'),status:statusOf(status),latestUpdate:get('latestUpdate'),sharedWithPartner:!!form.elements.namedItem('sharedWithPartner').checked,notify:!!form.elements.namedItem('notify').checked,notes:get('notes'),updatedAt:stamp,createdAt:saved?.createdAt||stamp,deliveredAt:status==='Entregado'?(saved?.deliveredAt||dateLocal()):''};
   const ix=all.findIndex(o=>String(o.id)===String(record.id));if(ix>=0)all[ix]=record;else all.push(record);
   if(persist(all)){curtain.remove();renderOrders()}
  };
  form.elements.namedItem('name').focus();
 }
 // Lógica de aplazamiento: no destruye tareas, conserva la fecha inicialmente elegida.
 window.oihaneRolloverTasks=function(){
  const date=dateLocal();let count=0;
  for(const t of tasks){if(!t||t.done||typeof t.date!=='string'||!/\d{4}-\d{2}-\d{2}/.test(t.date)||t.date>=date)continue;
   if(!t.originalDueDate)t.originalDueDate=t.date;
   const from=new Date(t.date+'T12:00:00'),to=new Date(date+'T12:00:00');
   const advanced=Math.max(1,Math.round((to-from)/86400000));
   t.postponedDays=(Math.max(0,Number(t.postponedDays)||0)+advanced);t.lastPostponedAt=date;t.date=date;count++;
  }
  if(count)save();return count;
 };
 const beforeHome=window.home,beforeTasks=window.renderTasks;
 if(typeof beforeHome==='function')window.home=function(){window.oihaneRolloverTasks();return beforeHome.apply(this,arguments)};
 if(typeof beforeTasks==='function')window.renderTasks=function(){window.oihaneRolloverTasks();return beforeTasks.apply(this,arguments)};
 // Los avisos coinciden con la hora seleccionada, no con «cualquier tarea pendiente».
 const phrase=(label,lead)=>{
  if(!lead)return `Es la hora de ${label}`;
  if(lead<60)return `${lead===1?'Queda':'Quedan'} ${lead} ${lead===1?'minuto':'minutos'} para ${label}`;
  const h=Math.ceil(lead/60);return `${h===1?'Queda':'Quedan'} ${lead%60?'aproximadamente ':''}${h} ${h===1?'hora':'horas'} para ${label}`;
 };
 window.oihaneNotificationPhrase=phrase;
 const atMinute=(date,hour,lead,now)=>{
  if(!date||!/^\d{2}:\d{2}$/.test(hour))return false;
  const due=new Date(`${date}T${hour}:00`);if(isNaN(+due))return false;
  const when=new Date(due.getTime()-lead*60000);
  return when.getFullYear()===now.getFullYear()&&when.getMonth()===now.getMonth()&&when.getDate()===now.getDate()&&when.getHours()===now.getHours()&&when.getMinutes()===now.getMinutes();
 };
 if(typeof reminderTimer!=='undefined'&&reminderTimer){clearInterval(reminderTimer);reminderTimer=null}
 window.scheduleForegroundReminderCheck=function(){
  const check=()=>{
   if(document.visibilityState==='hidden')return;
   const now=new Date(),date=dateLocal();
   for(const t of tasks){if(!t||t.done||!t.notify||!t.date)continue;const lead=Math.max(0,Number(t.notifyLead)||0);if(atMinute(t.date,t.time||'09:00',lead,now))showInAppReminder(phrase(t.title||'tu tarea',lead),'',`v536-t-${t.id}-${t.date}-${lead}`)}
   for(const e of events){if(!e||!e.date||!e.time)continue;const lead=Math.max(0,Number(e.notifyLead)||0);if(e.notify&&atMinute(e.date,e.time,lead,now))showInAppReminder(phrase(e.title||'tu evento',lead),'',`v536-e-${e.id}-${e.date}-${lead}`);
    const leave=Math.max(0,Number(e.departureMinutes)||0);if(leave&&atMinute(e.date,e.time,leave,now))showInAppReminder(`Es la hora de salir para ${e.title}`,'',`v536-leave-${e.id}-${e.date}-${leave}`);
   }
   if(now.getHours()===21&&now.getMinutes()===0){
    const list=tasks.filter(t=>t&&!t.done&&t.date&&t.date<=date);if(list.length){const names=list.slice(0,3).map(t=>t.title||'Tarea pendiente').join(', ');const plus=list.length>3?` y ${list.length-3} más`:'';const text=`Tienes ${list.length} ${list.length===1?'tarea pendiente':'tareas pendientes'} de hoy: ${names}${plus}`;showInAppReminder(text,'',`v536-digest-${date}`)}
   }
   if(now.getHours()===9&&now.getMinutes()===0){for(const o of load()){if(o.notify&&o.status!=='Entregado'&&o.estimatedDate===date)showInAppReminder(`Entrega prevista hoy: ${o.name}`,'',`v536-order-${o.id}-${date}`)}}
  };
  check();if(!reminderTimer)reminderTimer=setInterval(check,60000);
 };
 window.oihaneRolloverTasks();
 window.scheduleForegroundReminderCheck();
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){const changed=window.oihaneRolloverTasks();if(changed){if(screen==='home')window.home();else if(screen==='Tareas')window.renderTasks()}window.scheduleForegroundReminderCheck()}});
})();