



/* --- oihane-530-features --- */

/* Oihane 5.30 — additions isolated from prior UI layers. */
(function(){
 'use strict';
 // Inicializar configuración pública al arrancar por primera vez.
 // Mantener valores existentes y sesiones iniciadas en dispositivos ya configurados.
 if(!localStorage.getItem('oihane_sync_url'))localStorage.setItem('oihane_sync_url',OIHANE_SUPABASE_DEFAULT_URL);
 if(!localStorage.getItem('oihane_sync_key'))localStorage.setItem('oihane_sync_key',OIHANE_SUPABASE_PUBLISHABLE_KEY);
 // Permit zoom during a session, return to ordinary scale on next fresh launch.
 // The browser normally resets pinch zoom on document navigation; we do not disable user zoom.
 window.addEventListener('pageshow',()=>{try{document.documentElement.style.zoom='';document.body.style.zoom='';}catch(_){}});
 const clean=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').replace(/[^a-z0-9]+/g,' ').trim();
 const oldClassifier=window.classifyProductCategory;
 window.classifyProductCategory=function(name){
   let m={};try{m=JSON.parse(localStorage.getItem('oihane_product_categories')||'{}')}catch(_){ }
   const key=clean(name);if(key&&productCategories.includes(m[key]))return m[key];
   return oldClassifier(name);
 };
 window.oihaneEditShoppingProduct=function(id){
   const product=products.find(p=>String(p.id)===String(id));if(!product)return;
   const modal=document.createElement('div');modal.className='oihane-530-location';
   modal.innerHTML='<div><h2>Editar producto</h2><label>Nombre</label><input id="v530ProdName"><label>Supermercado</label><select id="v533ProdStore"></select><label>Categoría</label><select id="v530ProdCategory" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px"></select><p>Oihane recordará la categoría que asignes a este nombre cuando vuelvas a añadirlo.</p><div class="actions"><button type="button" class="primary" id="v530ProdSave">Guardar</button><button type="button" id="v530ProdCancel">Cancelar</button></div></div>';
   document.body.appendChild(modal);
   const name=modal.querySelector('#v530ProdName'),cat=modal.querySelector('#v530ProdCategory');name.value=product.title;
   productCategories.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;cat.appendChild(o)});cat.value=product.category||'Otros';const shopPick=modal.querySelector('#v533ProdStore');['Lidl',...(window.oihaneShopStores||[]),...(()=>{try{return JSON.parse(localStorage.getItem('oihane_custom_shops_v1')||'[]')}catch(_){return []}})()].filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i).forEach(st=>shopPick.add(new Option(st,st)));if(product.store&&!Array.from(shopPick.options).some(x=>x.value===product.store))shopPick.add(new Option(product.store,product.store));shopPick.value=product.store||'Lidl';
   modal.querySelector('#v530ProdCancel').onclick=()=>modal.remove();
   modal.querySelector('#v530ProdSave').onclick=()=>{
     const title=name.value.trim(),category=cat.value;if(!title)return;
     const old=clean(product.title),key=clean(title);let dict={};try{dict=JSON.parse(localStorage.getItem('oihane_product_categories')||'{}')}catch(_){ }
     dict[key]=category;localStorage.setItem('oihane_product_categories',JSON.stringify(dict));
     products.forEach(p=>{if(clean(p.title)===old||clean(p.title)===key){p.category=category;p.categoryManual=true}});
     product.title=title;product.category=category;product.categoryManual=true;product.store=modal.querySelector('#v533ProdStore')?.value||product.store;product.lists=['General',product.store];
     window.oihaneRememberShoppingAssignment?.(title,product.store,category);
     if(old&&old!==key)window.oihaneRememberShoppingAssignment?.(old,product.store,category);
     save();window.oihaneSharedShoppingChanged?.();modal.remove();renderShopping();
   };
 };
 window.oihanePickLocation=function(inputId){
   const el=document.getElementById(inputId);if(!el)return;
   const modal=document.createElement('div');modal.className='oihane-530-location';
   modal.innerHTML='<div><h2>Elegir ubicación</h2><p>Busca el lugar en Google Maps y copia la dirección o el enlace. Por seguridad, Google Maps no puede transferir automáticamente una selección a Oihane; aquí puedes confirmarla.</p><input id="v530PickedAddress" placeholder="Dirección o enlace de Google Maps"><div class="actions"><button type="button" id="v530OpenGoogle">Buscar en Google Maps ↗</button><button type="button" class="primary" id="v530SaveAddress">OK · Guardar sitio</button><button type="button" id="v530CancelAddress">Cancelar</button></div></div>';
   document.body.appendChild(modal);
   const field=modal.querySelector('#v530PickedAddress');field.value=el.value||'';
   modal.querySelector('#v530OpenGoogle').onclick=()=>window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(field.value.trim()),'_blank','noopener');
   modal.querySelector('#v530SaveAddress').onclick=()=>{el.value=field.value.trim();el.dispatchEvent(new Event('change',{bubbles:true}));modal.remove()};
   modal.querySelector('#v530CancelAddress').onclick=()=>modal.remove();
   field.focus();
 };
 document.addEventListener('click',e=>{const b=e.target.closest('[data-v520-title]');if(!b||screen!=='Recetas')return;
   setTimeout(()=>{const form=document.getElementById('v520Form');if(!form||form.querySelector('#v530RecipeDelete'))return;
     const actions=form.querySelector('.v520-actions'),itemId=b.getAttribute('data-v520-title');if(!actions)return;
     const del=document.createElement('button');del.type='button';del.id='v530RecipeDelete';del.className='delete';del.textContent='Eliminar receta';del.onclick=()=>v520Delete('Recetas',itemId);actions.appendChild(del);
   },0)
 });
 window.toggleRecipeDetails=function(id){const el=document.getElementById('recipeDetails-'+String(id));if(el){el.classList.toggle('hidden');el.scrollIntoView({block:'nearest',behavior:'smooth'})}};
 const originalAdjust=window.adjustRecipeServings;
 window.adjustRecipeServings=function(id){const r=extraItems('Recetas').find(x=>String(x.id)===String(id));if(!r)return;
   const raw=prompt('¿Para cuántas personas quieres calcular la receta?',String(r.currentServings||r.servings||2));if(raw===null)return;
   const n=Number(raw);if(!Number.isInteger(n)||n<1||n>100){alert('Indica un número entero de raciones entre 1 y 100.');return}
   const all=extraItems('Recetas');const target=all.find(x=>String(x.id)===String(id));if(!target)return;target.currentServings=String(n);if(!saveExtra('Recetas',all))return;
   renderExtraModule('Recetas');requestAnimationFrame(()=>{const el=document.getElementById('recipeDetails-'+String(id));if(el)el.classList.remove('hidden')});
 };
 const originalCalendar=window.renderCalendar;
 window.renderCalendar=function(){const r=originalCalendar.apply(this,arguments);
   const field=document.querySelector('#eventLocation');if(field&&!document.getElementById('v530CalendarMap')){
     const b=document.createElement('button');b.id='v530CalendarMap';b.type='button';b.className='small-action';b.textContent='📍 Elegir en Maps';b.onclick=()=>oihanePickLocation('eventLocation');field.insertAdjacentElement('afterend',b);
   }
   return r;
 };
 // Legacy editEvent re-renders the form, now inherits the location picker.
 const origExtra=window.renderExtraModule;
 window.renderExtraModule=function(){const r=origExtra.apply(this,arguments);const ids=['extraLocation','extraPlace','v520Location'];for(const id of ids){const field=document.getElementById(id);if(!field||field.dataset.v530Picker)continue;field.dataset.v530Picker='1';const b=document.createElement('button');b.type='button';b.textContent='📍 Seleccionar ubicación';b.className='small-action';b.style.marginTop='5px';b.onclick=()=>oihanePickLocation(id);field.insertAdjacentElement('afterend',b)}return r};
 // Attach a location chooser when a modal form is inserted later (Plans / Study etc).
 const mapObserver=new MutationObserver(()=>{for(const id of ['extraLocation','extraPlace','v520Location','v522PlanLocation']){
   const field=document.getElementById(id);if(!field||field.dataset.v530Picker)continue;
   field.dataset.v530Picker='1';const b=document.createElement('button');b.type='button';b.className='small-action';b.textContent='📍 Elegir en Maps';b.style.marginTop='5px';b.onclick=()=>oihanePickLocation(id);field.insertAdjacentElement('afterend',b);
 }});
 mapObserver.observe(document.getElementById('app'),{childList:true,subtree:true});
 // The original generic task editor has a location button. Form opening is patched above.
 // Assistant first handles queries and navigation before any legacy create intent.
 const oldAssistant=window.handleAssistantCommand;
 window.handleAssistantCommand=function(raw){
   const q=String(raw||'').trim(),t=clean(q);if(!q)return;
   const nav=t.match(/^(?:abre|abrir|muestrame|ensename|ir a|ve a|entrar en)\s+(?:el modulo de |el apartado de |la lista de |mis |las |los )?(tareas|tarea|compras|compra|calendario|agenda|recetas|estudio|guardias|planes|viajes|plantas|mas|ajustes)$/);
   if(nav){openModule(({tarea:'Tareas',tareas:'Tareas',compra:'Compras',compras:'Compras',agenda:'Calendario',guardias:'Estudio',mas:'Más',ajustes:'Más'})[nav[1]]||nav[1][0].toUpperCase()+nav[1].slice(1));return}
   const intentDate=(text)=>{
     const d=new Date();d.setHours(12,0,0,0);
     if(/\bpasado manana\b/.test(text))d.setDate(d.getDate()+2);
     else if(/\bmanana\b/.test(text))d.setDate(d.getDate()+1);
     else if(/\bhoy\b/.test(text)){}
     else {const days=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];const m=text.match(/\b(?:el )?(?:proximo )?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\b/);if(m){let dt=(days.indexOf(m[1])-d.getDay()+7)%7;if(dt===0)dt=7;d.setDate(d.getDate()+dt)}else return '';}
     return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
   };
   const day=intentDate(t);
   if(/^(?:que|cuales)\s+(?:es\s+)?(?:lo que\s+)?(?:tengo|hay|debo hacer|toca hacer|he de hacer|me toca hacer)(?:\s+(?:que\s+)?hacer)?\s*(?:para\s+)?(?:hoy|manana|pasado manana)?\??$/.test(t)||/^que tengo que hacer\s+(hoy|manana|pasado manana)$/.test(t)){
     const d=day||today();const items=events.filter(e=>e.date===d).map(e=>(e.time?e.time+' ':'')+e.title).concat(tasks.filter(x=>!x.done&&x.date===d).map(x=>'Tarea: '+x.title));
     const form=document.querySelector('#assistant'),box=document.createElement('div');box.id='assistantResult';box.className='assistant-response';box.textContent=items.length?'Para '+(d===today()?'hoy':fmt(d))+': '+items.join(' · '):'No tienes tareas ni eventos programados para '+(d===today()?'hoy':'esa fecha')+'.';document.querySelector('#assistantResult')?.remove();form?.after(box);return;
   }
   const cancel=t.match(/^(?:cancela|cancelar|elimina|eliminar|borra|borrar|quita|quitar)\s+(?:de\s+)?(?:la\s+)?(?:tarea\s+|tareas\s+|de\s+la\s+lista\s+de\s+tareas\s+)?(.+)$/);
   if(cancel){const name=cancel[1].replace(/^(?:la|el|de|que)\s+/,'').replace(/\s+(?:de|en)\s+(?:la\s+)?lista\s+de\s+tareas$/,'').trim();const match=tasks.filter(x=>!x.done).find(x=>clean(x.title)===name)||tasks.filter(x=>!x.done).find(x=>clean(x.title).includes(name));if(match){
     if(confirm('¿Eliminar la tarea «'+match.title+'»?')){tasks=tasks.filter(x=>String(x.id)!==String(match.id));save();if(screen==='Tareas')renderTasks();else if(screen==='home')home();}
     return;
   }}
   const guard=t.match(/^(?:tengo|anota|apunta|pon|programa|crea|anade|registrame)\s+(?:una\s+)?guardia\b/);
   if(guard){const when=day;const hm=q.match(/\b(?:a las?\s*)?(\d{1,2}):(\d{2})\b/);const hr=hm?String(hm[1]).padStart(2,'0')+':'+hm[2]:'';const lm=q.match(/\ben\s+([^,;.]+)/i);const loc=lm?lm[1].trim():'';
     if(!when){alert('Indica la fecha de la guardia, por ejemplo: tengo guardia mañana.');return}
     const title='Guardia';const all=extraItems('Estudio');let obj=all.find(x=>x.kind==='Guardia'&&x.date===when&&(x.time||'')===(hr||''));if(!obj){obj={id:Date.now(),title,kind:'Guardia',status:'Guardia',date:when,time:hr||'',location:loc||'',place:loc||'',mode:'Presencial',duration:'480',notes:'',created:today()};all.push(obj);saveExtra('Estudio',all)}upsertLinkedEvent('Estudio',obj);
     const box=document.createElement('div');box.id='assistantResult';box.className='assistant-response';box.textContent='Guardia añadida a Estudio y Calendario para '+fmt(when)+'.';document.querySelector('#assistantResult')?.remove();document.querySelector('#assistant')?.after(box);return;
   }
   oldAssistant(q);
 };
 const oldDeleteStudy=window.v520Delete;
 window.v520Delete=function(module,id){if(module==='Estudio'){
   if(!confirm('¿Quieres eliminar este elemento y su evento de calendario asociado?'))return;
   const all=extraItems('Estudio').filter(x=>String(x.id)!==String(id));
   if(!saveExtra('Estudio',all))return;
   events=events.filter(e=>!(e.sourceModule==='Estudio'&&String(e.sourceId)===String(id)));
   save();renderExtraModule('Estudio');return;
 }return oldDeleteStudy(module,id)};
 // Sign-in is requested on launch; never store a password. The publishable key must be configured separately.
 function showLoginOnLaunch(){
   if(document.querySelector('.oihane-530-auth'))return;
   const c=syncConfig();if(c.access)return;
   const overlay=document.createElement('div');overlay.className='oihane-530-auth';overlay.innerHTML='<div class="login"><h2>Bienvenida a Oihane</h2><p>Inicia sesión para sincronizar tus datos entre dispositivos.</p><form id="v530LoginForm"><input type="email" id="v530Email" placeholder="Correo electrónico" autocomplete="username" required><input type="password" id="v530Password" placeholder="Contraseña" autocomplete="current-password" required><div class="msg" id="v530LoginError"></div><div class="actions"><button type="submit" class="primary">Iniciar sesión</button><button type="button" id="v530Local">Entrar sin sincronizar</button></div></form></div>';
   document.body.appendChild(overlay);
   overlay.querySelector('#v530Local').onclick=()=>overlay.remove();
   overlay.querySelector('#v530LoginForm').onsubmit=async e=>{e.preventDefault();const msg=overlay.querySelector('#v530LoginError'),cfg=syncConfig();if(!cfg.key){msg.textContent='Falta la clave pública de Supabase en esta instalación. Configúrala una vez en Más → Sincronización; no introduzcas la service_role.';return}
     const email=overlay.querySelector('#v530Email').value.trim(),password=overlay.querySelector('#v530Password').value;
     try{const data=await cloudFetch('/auth/v1/token?grant_type=password',{method:'POST',auth:false,body:JSON.stringify({email,password})});if(!data.access_token)throw new Error('No se ha recibido una sesión válida');const intended=String(data.user?.id||'');const owner=localStorage.getItem('oihaneAccountOwnerV1')||localStorage.getItem('oihane_sync_user')||'';if(!intended)throw new Error('Supabase no confirmó la identidad de la cuenta');if(owner&&owner!==intended)throw new Error('Hay datos de otra cuenta guardados en este dispositivo. Para no mezclarlos, utiliza dispositivos separados hasta activar perfiles aislados.');if(!owner&&localStorage.getItem('oihane_sync_base'))throw new Error('Datos de sincronización previos sin propietario identificado. Descarga copia JSON y revísalos antes de iniciar otra cuenta.');localStorage.setItem('oihaneAccountOwnerV1',intended);localStorage.setItem('oihane_sync_access',data.access_token);localStorage.setItem('oihane_sync_refresh',data.refresh_token||'');localStorage.setItem('oihane_sync_expires',String(Date.now()+Number(data.expires_in||3600)*1000));localStorage.setItem('oihane_sync_user',data.user?.id||'');overlay.remove();queueCloudSync();}catch(err){msg.textContent='No se pudo iniciar sesión: '+String(err?.message||err)}};
 }
 window.addEventListener('load',()=>setTimeout(showLoginOnLaunch,400));
 // Remove unused empty sections in Más, preserve active Backup/Sync/Calendar/Voice settings.
 const existingOpenModule=window.openModule;
 window.openModule=function(name,seed){const r=existingOpenModule.apply(this,arguments);if(name==='Más'){
   requestAnimationFrame(()=>{const app=document.querySelector('#app');if(!app)return;app.querySelectorAll('.section-card').forEach(section=>{const title=section.querySelector('.section-card-head strong')?.textContent?.trim()||'';if(/^(INTEGRACIONES|PRIVACIDAD|PREFERENCIAS)$/i.test(title))section.remove()});});
 }return r};
})();



/* --- oihane-531-forms --- */

(()=>{
 'use strict';
 const supported='#taskForm,#eventForm,#extraForm,#v518Form,#v519Form,#v520Form,form.v519-modal,form.v521-modal';
 function closeForm(form){
   const overlay=form.closest('.v519-modal-wrap,.v521-modal-wrap');
   if(overlay){overlay.remove();return;}
   const panel=form.closest('#addPanel,#v518FormPanel,#v519Panel,#v520Panel');
   if(panel){
     if(panel.id==='v519Panel' && typeof window.v519CloseForm==='function'){window.v519CloseForm();return;}
     if(panel.id==='v520Panel'){const old=form.querySelector('#v520Cancel');if(old && old!==document.activeElement){old.click();return;}}
     panel.classList.add('hidden');form.reset();return;
   }
   const overlayOther=form.closest('.oihane-530-location');
   if(overlayOther)overlayOther.remove();
 }
 function bar(){const b=document.createElement('div');b.className='oihane-531-formbar';return b;}
 function enhanceForm(form){
   if(form.dataset.oihane531Toolbar)return;
   const submit=[...form.querySelectorAll('button')].find(b=>b.type==='submit'||(b.getAttribute('type')===null && /^(guardar|añadir)/i.test(b.textContent.trim())));
   if(!submit)return;
   const existing=[...form.querySelectorAll('button')].find(b=>b!==submit && (b.type==='button'||b.getAttribute('type')==='button') && /^(cerrar|cancelar)$/i.test(b.textContent.trim()));
   const header=bar();let close=existing;
   if(!close){close=document.createElement('button');close.type='button';close.addEventListener('click',()=>closeForm(form));}
   close.textContent='Cerrar';close.classList.add('oihane-531-close');
   const previousTitle=submit.textContent.trim();submit.textContent='Guardar';submit.setAttribute('aria-label',previousTitle);
   submit.classList.add('oihane-531-save');
   header.append(close,submit);
   form.prepend(header);
   form.dataset.oihane531Toolbar='1';
   const upperClose=form.closest('#addPanel')?.querySelector(':scope > .section-head button');
   if(upperClose)upperClose.dataset.oihane531HiddenClose='1';
 }
 function enhanceStandalone(dialog){
   if(dialog.dataset.oihane531Toolbar)return;
   const save=dialog.querySelector('#v530ProdSave,#v530SaveAddress');
   if(!save)return;
   const cancel=dialog.querySelector('#v530ProdCancel,#v530CancelAddress');
   if(!cancel)return;
   const header=bar();cancel.textContent='Cerrar';cancel.classList.add('oihane-531-close');
   save.setAttribute('aria-label',save.textContent.trim());save.textContent='Guardar';save.classList.add('oihane-531-save');
   header.append(cancel,save);dialog.prepend(header);dialog.dataset.oihane531Toolbar='1';
 }
 function update(){
   document.querySelectorAll(supported).forEach(enhanceForm);
   document.querySelectorAll('.oihane-530-location > div').forEach(enhanceStandalone);
 }
 let scheduled=false;
 new MutationObserver(()=>{
   if(scheduled)return;scheduled=true;
   queueMicrotask(()=>{scheduled=false;update();});
 }).observe(document.body,{childList:true,subtree:true});
 update();
 // Existing subscribers (activated in earlier versions) should not receive local and remote alerts together.
 if('serviceWorker' in navigator && 'PushManager' in window){
   navigator.serviceWorker.ready.then(reg=>reg.pushManager.getSubscription()).then(sub=>{
     if(sub)localStorage.setItem('oihane_push_registered','1');
     else localStorage.removeItem('oihane_push_registered');
   }).catch(()=>{});
 }
})();



/* --- oihane-533-improvements --- */

(function(){
 const names=['Compras','Calendario','Tareas','Planes','Hogar','Plantas','Wishlist','Regalos','Estudio','Recetas','Cultura','Viajes','Pedidos','Más'];
 const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 // Re-apply manual product corrections after startup migrations, and only when the stored choice differs.
 function restoreProductChoices(){
  let map={};try{map=JSON.parse(localStorage.getItem('oihane_product_categories')||'{}')}catch(_){}
  let changed=false;
  for(const p of products){const saved=map[norm(p.title)];if(saved&&productCategories.includes(saved)&&p.category!==saved){p.category=saved;p.categoryManual=true;changed=true}if(p.category==='Carne y pescado'){p.category='Carne';changed=true}}
  if(changed)save();
 }
 restoreProductChoices();
 // Put expired dated items into a recoverable local archive rather than destroying them.
 // Histórico permanente: recuperar los registros archivados por versiones anteriores.
 // La recuperación es aditiva y no modifica archivos remotos ni elimina información.
 function restoreRetiredEntries(){
  let archive={};try{archive=JSON.parse(localStorage.getItem('oihane_expired_archive_v1')||'{}')||{}}catch(e){return}
  const merge=(current,old)=>{const seen=new Set(current.map(x=>String(x.id)));let added=0;for(const x of (Array.isArray(old)?old:[])){if(!x||x.id==null||seen.has(String(x.id)))continue;current.push(x);seen.add(String(x.id));added++}return added};
  let changed=false;
  if(merge(events,archive.events)){changed=true}
  if(merge(tasks,archive.tasks)){changed=true}
  for(const mod of ['Planes','Estudio']){const values=extraItems(mod);if(merge(values,archive[mod])){saveExtra(mod,values);changed=true}}
  if(changed)save();
 }
 restoreRetiredEntries();
 function orderMap(){try{return JSON.parse(localStorage.getItem('oihane_shop_order_v1')||'{}')}catch(_){return {}}}
 window.oihaneShopHasCustomOrder=function(shop){return Array.isArray(orderMap()[shop])&&orderMap()[shop].length>0};
 window.oihaneShopSort=function(arr,shop){const keys=orderMap()[shop]||[];const rank=id=>{const n=keys.indexOf(String(id));return n===-1?Infinity:n};return arr.slice().sort((a,b)=>{const ra=rank(a.id),rb=rank(b.id);if(ra!==rb)return ra-rb;if(shop==='General'&&!keys.length){const ca=productCategories.indexOf(a.category),cb=productCategories.indexOf(b.category);return (ca<0?999:ca)-(cb<0?999:cb)}return 0});};
 window.oihaneMoveShopItem=function(id,delta){const shown=products.filter(p=>(p.lists||[]).includes(store)&&p.bought===showBought);let ids=oihaneShopSort(shown,store).map(p=>String(p.id));const at=ids.indexOf(String(id)),to=at+delta;if(at<0||to<0||to>=ids.length)return;[ids[at],ids[to]]=[ids[to],ids[at]];const all=orderMap();all[store]=ids;localStorage.setItem('oihane_shop_order_v1',JSON.stringify(all));renderShopping();};
 // A lightweight navigation strip is injected after every module render.
 let busy=false;
 let lastNavigationScroll=0;
 function apply(){
  if(busy)return;const app=document.getElementById('app');if(!app)return;
  const header=app.querySelector('.module-header,.screen-head');if(!header){app.querySelector('.oihane-533-nav')?.remove();return}
  const name=header.getAttribute('data-module')||String(header.querySelector('h1')?.textContent||'').trim().replace(/^[^a-zA-ZÁÉÍÓÚÑ]+/,'').trim();
  let nav=app.querySelector('.oihane-533-nav');if(nav&&nav.nextElementSibling===header){return}
  busy=true;if(nav)lastNavigationScroll=nav.scrollLeft;nav?.remove();nav=document.createElement('nav');nav.className='oihane-533-nav';nav.setAttribute('aria-label','Cambiar de módulo');nav.addEventListener('scroll',()=>{lastNavigationScroll=nav.scrollLeft},{passive:true});
  for(const module of names){if(module==='Estudio'&&window.oihaneIsRuben?.())continue;const button=document.createElement('button');button.type='button';button.title=module==='Más'?'Ajustes':module;button.setAttribute('aria-label',module==='Más'?'Ajustes':module);if(module===name)button.className='is-current';const icon=document.createElement('span');icon.innerHTML=typeof moduleIcon==='function'?moduleIcon(module):'•';button.appendChild(icon);button.onclick=()=>openModule(module);nav.appendChild(button)}
  app.insertBefore(nav,header);nav.scrollLeft=lastNavigationScroll;busy=false;
 }
 const watcher=new MutationObserver(()=>{if(!busy)apply()});watcher.observe(document.getElementById('app'),{childList:true,subtree:false});apply();
})();