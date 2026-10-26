/* Oihane 5.44.0 — Lógica principal organizada y renderizadores especializados consolidados. */
/* --- funcionalidad-01 --- */

const moduleIconNames=['Compras','Calendario','Tareas','Planes','Hogar','Plantas','Wishlist','Regalos','Estudio','Recetas','Cultura','Viajes','Pedidos','Más'];
const modules=moduleIconNames.map(name=>['',name]);
/* 5.46: identifiers reflect record-level synchronization, not mere module names. */
window.oihaneShareBadge=function(item){
 const shared=!!(item&&item.sharedWithPartner===true);
 const synced=shared&&!!item?._oihaneSharedId;
 if(!shared)return '';
 const description=synced?'Compartido con mi pareja':'Pendiente de compartir con mi pareja';
 return '<span class="oihane-share-chip is-shared" title="'+description+'" aria-label="'+description+'">⇄</span>';
};

const moduleHeaders={
'Compras':{art:'Pierre-Auguste Renoir - Still Life with Melon (Nature morte au melon) - BF966 - Barnes Foundation.jpg',tint:'#dce8ef',kicker:'Elegir con calma'},
'Calendario':{art:'Museo Sorolla - 00834 - Paseo a orillas del mar.jpg',tint:'#dce8ef',kicker:'Tu tiempo, a tu ritmo'},
'Wishlist':{art:'Pierre-Auguste Renoir - Roses (Roses) - BF1168 - Barnes Foundation.jpg',tint:'#efd9cf',kicker:'Ideas que merecen la pena'},
'Regalos':{art:'Vincent van Gogh - Piles of French novels - Google Art Project.jpg',tint:'#f0dfe0',kicker:'Detalles con intención'},
'Hogar':{art:'Fenêtre ouverte, Collioure, par Henri Matisse.jpg',tint:'#efe3d2',kicker:'Un hogar a tu manera'},
'Plantas':{art:'Claude Monet - Water Lilies - 1906, Ryerson.jpg',tint:'#dfe8dc',kicker:'Pequeños cuidados'},
'Recetas':{art:'Vermeer Melkmeid.jpg',tint:'#f3e9c8',kicker:'Cocinar y disfrutar'},
'Estudio':{art:'Michelangelo - Creation of Adam (cropped).jpg',tint:'#e7e0ed',kicker:'Curiosidad en marcha'},
'Viajes':{art:'Claude Monet, Impression, soleil levant.jpg',tint:'#dce8ef',kicker:'Lugares por descubrir'},
'Pedidos':{art:'Claude Monet - La gare Saint-Lazare.jpg',tint:'#f0e4da',kicker:'De camino a casa'},
'Cultura':{art:'Artemisia Gentileschi - Judith Beheading Holofernes - WGA8563.jpg',tint:'#e7e0ed',kicker:'Arte, libros y museos'},
'Planes':{art:'Pierre-Auguste Renoir - Bal du moulin de la Galette.jpeg',tint:'#efd9cf',kicker:'Ideas para vivir'},
'Tareas':{art:'Camille Pissarro A Cowherd at Valhermeil, Auvers-sur-Oise The Metropolitan Museum of Art.jpg',tint:'#e5e9dc',kicker:'Un paso cada vez'},
'Más':{art:'Caspar David Friedrich - Wanderer above the sea of fog.jpg',tint:'#efe3d2',kicker:'Tu espacio personal'}
};
const OIHANE_PAINTING_PREVIEWS={"Compras":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Pierre-Auguste_Renoir_-_Still_Life_with_Melon_%28Nature_morte_au_melon%29_-_BF966_-_Barnes_Foundation.jpg/960px-Pierre-Auguste_Renoir_-_Still_Life_with_Melon_%28Nature_morte_au_melon%29_-_BF966_-_Barnes_Foundation.jpg","Calendario":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Museo_Sorolla_-_00834_-_Paseo_a_orillas_del_mar.jpg/960px-Museo_Sorolla_-_00834_-_Paseo_a_orillas_del_mar.jpg","Wishlist":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Pierre-Auguste_Renoir_-_Roses_%28Roses%29_-_BF1168_-_Barnes_Foundation.jpg/960px-Pierre-Auguste_Renoir_-_Roses_%28Roses%29_-_BF1168_-_Barnes_Foundation.jpg","Regalos":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Vincent_van_Gogh_-_Piles_of_French_novels_-_Google_Art_Project.jpg/960px-Vincent_van_Gogh_-_Piles_of_French_novels_-_Google_Art_Project.jpg","Hogar":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Fen%C3%AAtre_ouverte%2C_Collioure%2C_par_Henri_Matisse.jpg/960px-Fen%C3%AAtre_ouverte%2C_Collioure%2C_par_Henri_Matisse.jpg","Plantas":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/960px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg","Recetas":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Vermeer_Melkmeid.jpg/960px-Vermeer_Melkmeid.jpg","Estudio":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg","Viajes":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/960px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg","Cultura":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Artemisia_Gentileschi_-_Judith_Beheading_Holofernes_-_WGA8563.jpg/960px-Artemisia_Gentileschi_-_Judith_Beheading_Holofernes_-_WGA8563.jpg","Planes":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pierre-Auguste_Renoir_-_Bal_du_moulin_de_la_Galette.jpeg/960px-Pierre-Auguste_Renoir_-_Bal_du_moulin_de_la_Galette.jpeg","Tareas":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Camille_Pissarro_A_Cowherd_at_Valhermeil%2C_Auvers-sur-Oise_The_Metropolitan_Museum_of_Art.jpg/960px-Camille_Pissarro_A_Cowherd_at_Valhermeil%2C_Auvers-sur-Oise_The_Metropolitan_Museum_of_Art.jpg","Más":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/960px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg"};
const OIHANE_PAINTING_ORIGINALS={"Compras":"https://upload.wikimedia.org/wikipedia/commons/c/cf/Pierre-Auguste_Renoir_-_Still_Life_with_Melon_%28Nature_morte_au_melon%29_-_BF966_-_Barnes_Foundation.jpg","Calendario":"https://upload.wikimedia.org/wikipedia/commons/7/72/Museo_Sorolla_-_00834_-_Paseo_a_orillas_del_mar.jpg","Wishlist":"https://upload.wikimedia.org/wikipedia/commons/a/ad/Pierre-Auguste_Renoir_-_Roses_%28Roses%29_-_BF1168_-_Barnes_Foundation.jpg","Regalos":"https://upload.wikimedia.org/wikipedia/commons/1/1b/Vincent_van_Gogh_-_Piles_of_French_novels_-_Google_Art_Project.jpg","Hogar":"https://upload.wikimedia.org/wikipedia/commons/1/18/Fen%C3%AAtre_ouverte%2C_Collioure%2C_par_Henri_Matisse.jpg","Plantas":"https://upload.wikimedia.org/wikipedia/commons/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg","Recetas":"https://upload.wikimedia.org/wikipedia/commons/a/ad/Vermeer_Melkmeid.jpg","Estudio":"https://upload.wikimedia.org/wikipedia/commons/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg","Viajes":"https://upload.wikimedia.org/wikipedia/commons/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg","Cultura":"https://upload.wikimedia.org/wikipedia/commons/4/4e/Artemisia_Gentileschi_-_Judith_Beheading_Holofernes_-_WGA8563.jpg","Planes":"https://upload.wikimedia.org/wikipedia/commons/5/5e/Pierre-Auguste_Renoir_-_Bal_du_moulin_de_la_Galette.jpeg","Tareas":"https://upload.wikimedia.org/wikipedia/commons/4/4c/Camille_Pissarro_A_Cowherd_at_Valhermeil%2C_Auvers-sur-Oise_The_Metropolitan_Museum_of_Art.jpg","Más":"https://upload.wikimedia.org/wikipedia/commons/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg"};
OIHANE_PAINTING_PREVIEWS.Pedidos='https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet_-_The_Saint-Lazare_Station_-_Google_Art_Project.jpg?width=1200';
OIHANE_PAINTING_ORIGINALS.Pedidos='https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet_-_The_Saint-Lazare_Station_-_Google_Art_Project.jpg?width=1200';
function moduleFallbackImage(name){return OIHANE_PAINTING_ORIGINALS[name]||OIHANE_PAINTING_ORIGINALS['Más']}
function moduleHeaderImage(name){return OIHANE_PAINTING_PREVIEWS[name]||OIHANE_PAINTING_PREVIEWS['Más']}
function moduleIcon(name){
 const file=String(name==='Más'?'mas':name).toLowerCase();
 // Original approved artwork as one atomic image: no legacy SVG, tint or second background.
 return `<span class="oihane-icon-frame" data-oihane-icon="${name}"><img class="oihane-icon-foreground" src="./icons/${file}.png?v=5366" alt="" draggable="false" loading="eager"></span>`;
}

function unifiedHeader(name){const h=moduleHeaders[name]||moduleHeaders['Más'];return `<div class="module-header" style="--module-tint:${h.tint}" data-module="${name}"><img class="module-cover" src="${moduleHeaderImage(name)}" data-fallback="${moduleFallbackImage(name)}" alt="" onerror="this.onerror=null;this.src=this.dataset.fallback"><button class="back" onclick="home()" aria-label="Volver al inicio">‹</button><div class="header-title"><span class="module-heading-icon">${moduleIcon(name)}</span><h1>${name==='Más'?'Ajustes':name}</h1></div></div>`}

const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};const readStore=(key)=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}};const fmt=d=>{if(!d)return '';return new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short'})};
let tasks=readStore('oihane_tasks'), products=readStore('oihane_products').map(p=>['Embutidos','Embutido'].includes(p.category)?{...p,category:'Quesos y embutidos'}:p), events=readStore('oihane_events');let screen='home',store='Lidl',showBought=false,calendarView='all';let selectedProductIds=new Set();const productCategories=['Fruta y verdura','Carne','Pescado','Quesos y embutidos','Lácteos y huevos','Panadería','Desayuno','Picoteo','Despensa','Conservas','Arroz, pasta y legumbres','Aceites, salsas y especias','Congelados' ,'Bebidas','Bebidas alcohólicas','Dulces y postres','Limpieza','Higiene','Bebé','Mascotas','Hogar y bazar','Otros'];

// Oihane 5.30.8 — Recordatorios homogéneos (minutos desde hora prevista)
function oihaneReminderFields(prefix, item={}) {
  const minutes=Math.max(0, Number(item.notifyLead)||0);
  const presets=[0,15,60,1440];
  const chosen=presets.includes(minutes)?String(minutes):'custom';
  const custom=chosen==='custom'&&minutes>0?minutes:30;
  const customUnit=custom%1440===0?'1440':custom%60===0?'60':'1';
  const customValue=custom/Number(customUnit);
  const checked=item.notify===true;
  const options=[['0','A su hora'],['15','15 minutos antes'],['60','1 hora antes'],['1440','24 horas antes'],['custom','Personalizar…']]
    .map(([value,label])=>`<option value="${value}" ${value===chosen?'selected':''}>${label}</option>`).join('');
  return `<div class="oihane-532-reminder"><label class="v521-check"><input type="checkbox" id="${prefix}Notify" ${checked?'checked':''}> Activar aviso</label><div class="oihane-532-reminder-fields" id="${prefix}Settings" ${checked?'':'hidden'}><label for="${prefix}Lead">¿Cuándo avisarme?</label><select id="${prefix}Lead">${options}</select><div class="oihane-532-custom" id="${prefix}Custom" ${chosen==='custom'?'':'hidden'}><input id="${prefix}Value" type="number" min="1" max="43200" inputmode="numeric" value="${customValue}" aria-label="Cantidad del aviso"><select id="${prefix}Unit" aria-label="Unidad del aviso"><option value="1" ${customUnit==='1'?'selected':''}>Minutos</option><option value="60" ${customUnit==='60'?'selected':''}>Horas</option><option value="1440" ${customUnit==='1440'?'selected':''}>Días</option></select></div><small>${prefix==='v532Study'?'Indica fecha y hora para poder activar el aviso.':'Si no indicas una hora, el aviso será a las 09:00.'}</small></div></div>`;
}
function oihaneBindReminder(prefix){
  const box=document.getElementById(prefix+'Notify'),lead=document.getElementById(prefix+'Lead'),settings=document.getElementById(prefix+'Settings'),custom=document.getElementById(prefix+'Custom');
  if(!box||!lead||!settings||!custom)return;
  const update=()=>{settings.hidden=!box.checked;custom.hidden=lead.value!=='custom'};
  box.addEventListener('change',update);lead.addEventListener('change',update);update();
}
function oihaneReminderLead(prefix){
  const selected=document.getElementById(prefix+'Lead')?.value||'0';
  if(selected!=='custom')return Math.max(0,Number(selected)||0);
  const amount=Number(document.getElementById(prefix+'Value')?.value);
  const unit=Number(document.getElementById(prefix+'Unit')?.value)||1;
  if(!Number.isFinite(amount)||amount<1||!Number.isInteger(amount))throw Error('Indica un tiempo de aviso válido.');
  const minutes=amount*unit;
  if(minutes>43200)throw Error('El aviso personalizado no puede superar 30 días.');
  return minutes;
}

const save=()=>{try{localStorage.setItem('oihane_tasks',JSON.stringify(tasks));localStorage.setItem('oihane_products',JSON.stringify(products));localStorage.setItem('oihane_events',JSON.stringify(events))}catch(e){const reason=e&&e.name==='QuotaExceededError'?'El navegador ha rechazado el guardado por su límite de almacenamiento local.':'El navegador ha rechazado el guardado ('+(e&&e.name?e.name:'error')+').';alert('No se han podido guardar todos los cambios. '+reason+' No cierres ni borres los datos de Oihane; descarga una copia si la aplicación sigue disponible.');return false}try{queueLocalSnapshot()}catch(e){}try{window.oihaneSharedShoppingChanged?.()}catch(e){}try{window.oihaneMixedChanged?.('Tareas');window.oihaneMixedChanged?.('Calendario')}catch(e){}try{queueCloudSync()}catch(e){}try{scheduleForegroundReminderCheck()}catch(e){}return true};const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function home(){
 const wasInsideAnotherModule=screen!=='home';
 screen='home';let d=new Date(), greeting=d.getHours()<12?'Buenos días':d.getHours()<20?'Buenas tardes':'Buenas noches';
 const day0=today(),day1=tomorrow();const endOfAgenda=new Date(day0+'T12:00:00');endOfAgenda.setDate(endOfAgenda.getDate()+6);const day6=`${endOfAgenda.getFullYear()}-${String(endOfAgenda.getMonth()+1).padStart(2,'0')}-${String(endOfAgenda.getDate()).padStart(2,'0')}`;
 const planItems=extraItems('Planes');
 // Un evento puede estar guardado tanto en Calendario como en Planes. En Home
 // mostramos una sola entrada cuando coinciden la fecha y el título normalizado.
 const agendaKey=(title,date)=>`${date||''}|${String(title||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').replace(/[^a-z0-9]+/g,' ').trim()}`;
 const calendarKeys=new Set(events.filter(e=>e.date&&e.title).map(e=>agendaKey(e.title,e.date)));
 const uniquePlanItems=planItems.filter(p=>!p.date||!p.title||!calendarKeys.has(agendaKey(p.title,p.date)));
 const soon=[];
 // Mostrar todas las tareas pendientes de prioridad alta, tengan o no fecha, sin límite de cantidad.
 // Las de prioridad media siguen mostrándose solo cuando vencen en los próximos siete días.
 const agendaPriority=t=>{const value=t.priority??t.importance??2;return typeof value==='string'&&value.trim().toLowerCase()==='alta'?3:Number(value)||2};
 tasks.filter(t=>t&&!t.done&&(agendaPriority(t)===3||(t.date&&t.date>=day0&&t.date<=day6&&agendaPriority(t)===2))).forEach(t=>soon.push({type:'task',id:t.id,date:t.date||'',time:t.time||'',title:t.title,meta:t.location||'',priority:agendaPriority(t),label:'Tarea'}));
 events.filter(e=>e.date&&e.date>=day0&&e.date<=day6).forEach(e=>soon.push({type:'event',id:e.id,date:e.date,time:e.time||'',title:e.title,meta:e.location||'Evento',priority:Number(e.importance||2),label:'Evento'}));
 uniquePlanItems.filter(p=>!['Realizado','Sin fecha'].includes(p.status)&&p.date&&p.date>=day0&&p.date<=day6).forEach(p=>soon.push({type:'plan',id:p.id,date:p.date,time:p.time||'',title:p.title,meta:p.location||'Plan',priority:Number(p.importance||2),label:'Plan'}));
 soon.sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))||b.priority-a.priority);
 const later=[]; // La lista principal ya incluye toda la prioridad alta sin truncar resultados.
 const row=x=>{const genericMeta=['Tarea','Plan','Evento','Importante','Agendado'];const inlineMeta=[x.time,x.meta&&!genericMeta.includes(x.meta)?x.meta:''].filter(Boolean).join(' · ');const detail=inlineMeta?`<small>${esc(inlineMeta)}</small>`:'';return `<div class="home-agenda-row"><div class="home-agenda-date">${x.date===day0?'HOY':x.date===day1?'Mañana':x.date?fmt(x.date):'PENDIENTE'}</div><button class="home-agenda-copy" onclick="${x.type==='task'?`openModule('Tareas')`:x.type==='event'?`openModule('Calendario')`:`openModule('Planes')`}"><strong>${esc(x.title)}</strong>${x.type==='task'?`<span class="v522-task-priority ${Number(x.priority)===3?'v522-priority-high':'v522-priority-medium'}">${Number(x.priority)===3?'Alta':'Media'}</span>`:''}${detail}</button>${x.type==='task'?`<button class="home-agenda-check" aria-label="Completar ${esc(x.title)}" onclick="completeImportantTask(${JSON.stringify(x.id).replace(/&/g,'&amp;').replace(/\"/g,'&quot;')})">□</button>`:''}</div>`};
 const agendaCollapsed=localStorage.getItem('oihane_home_agenda_collapsed')==='1';const agendaCount=soon.length+Math.min(later.length,8);const homeMarkup=`<div class="home-greeting-row"><h1>${greeting}, ${typeof window.oihaneGreetingName==='function'?esc(window.oihaneCleanDisplayName?.(window.oihaneGreetingName())||'Oihane'):'Oihane'}</h1><div class="date">Vitoria · ${d.toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'})}</div></div><form class="assistant" id="assistant"><span class="bubble">✳️</span><input id="ask" placeholder="¿En qué te ayudo?" autocomplete="off"><button type="button" aria-label="Dictar por voz" onclick="startVoiceInput()">🎙️</button><button aria-label="Enviar">↗</button></form><section class="home-agenda ${agendaCollapsed?'is-collapsed':''}" id="homeAgenda"><div class="home-agenda-heading"><div><span class="eyebrow">Tu agenda</span><h2>Mi agenda</h2></div><button class="agenda-toggle" id="agendaToggle" aria-label="${agendaCollapsed?'Desplegar agenda':'Plegar agenda'}" aria-expanded="${!agendaCollapsed}" onclick="toggleHomeAgenda()">${agendaCollapsed?'⌄':'⌃'}</button></div><div class="home-agenda-content ${agendaCollapsed?'collapsed':''}" id="homeAgendaContent">${soon.length?soon.map(row).join(''):'<div class="home-agenda-empty">No hay eventos ni tareas pendientes durante los próximos siete días. ✨</div>'}${later.length?`<div class="home-agenda-divider"><span>Después · prioridad</span></div>${later.slice(0,8).map(row).join('')}`:''}</div></section><div class="section-head home-spaces-head"><h2>TUS ESPACIOS</h2></div><div class="grid">${(window.oihaneConfiguredHomeModules?.(modules)||modules).filter(m=>m[1]!=='Estudio'||!window.oihaneIsRuben?.()).map(m=>`<button class="module" aria-label="${m[1]==='Más'?'Ajustes':m[1]}" title="${m[1]==='Más'?'Ajustes':m[1]}" onclick="openModule('${m[1]}')"><span class="emoji" aria-hidden="true">${moduleIcon(m[1])}</span><span>${m[1]==='Más'?'Ajustes':m[1]}</span></button>`).join('')}</div>`;
 const homeContainer=document.getElementById('app');
 const priorGrid=homeContainer.querySelector(':scope > .grid');
 if(priorGrid&&homeContainer.querySelector('.home-greeting-row')){
  // Update only greeting, assistant and agenda; the live icon grid never leaves its DOM parent.
  // Avoid even parsing detached <img> tags, which can trigger network and image decode work on iOS.
  const gridStart=homeMarkup.lastIndexOf('<div class="grid">');
  if(gridStart<0){homeContainer.innerHTML=homeMarkup;}
  else{
   const next=document.createElement('template');next.innerHTML=homeMarkup.slice(0,gridStart);
   const previous=[...homeContainer.childNodes].filter(node=>node!==priorGrid);
   for(const node of previous)node.remove();
   homeContainer.insertBefore(next.content,priorGrid);
  }
 }else homeContainer.innerHTML=homeMarkup;
 if(wasInsideAnotherModule)homeContainer.scrollTop=0;
 document.querySelector('#assistant').onsubmit=e=>{e.preventDefault();const input=document.querySelector('#ask');const q=input?.value.trim();if(!q)return;const result=window.handleAssistantCommand(q);if(input)input.value='';return result}
 // Reconfigure the newly rendered assistant directly, rather than observing the
 // whole #app DOM for every navigation or text change.
 const assistantInput=document.getElementById('ask');
 if(assistantInput){
  assistantInput.setAttribute('enterkeyhint','send');
  assistantInput.addEventListener('keydown',e=>{
   if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();document.getElementById('assistant')?.requestSubmit()}
  });
 }
 window.oihaneRefreshAssistantUi?.();
}

function toggleHomeAgenda(){const section=document.querySelector('#homeAgenda'),content=document.querySelector('#homeAgendaContent'),button=document.querySelector('#agendaToggle');if(!section||!content||!button)return;const collapsed=!content.classList.contains('collapsed');content.classList.toggle('collapsed',collapsed);section.classList.toggle('is-collapsed',collapsed);button.textContent=collapsed?'⌄':'⌃';button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'Desplegar agenda':'Plegar agenda');try{localStorage.setItem('oihane_home_agenda_collapsed',collapsed?'1':'0')}catch{}}
function collectBackupData(){const data={format:'oihane-backup',version:5,createdAt:new Date().toISOString(),data:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(oihaneSyncRuntime.isDataKey(k)){try{data.data[k]=JSON.parse(localStorage.getItem(k))}catch{data.data[k]=localStorage.getItem(k)}}}data.data.oihane_tasks=tasks;data.data.oihane_products=products;data.data.oihane_events=events;
 const me=localStorage.getItem('oihane_sync_user')||'';
 for(const key of ['oihane_tasks','oihane_events','oihane_plans','oihane_orders','oihane_wishlist']){
  if(Array.isArray(data.data[key]))data.data[key]=data.data[key].filter(x=>!x?false:(!x._oihaneSharedOwner||x._oihaneSharedOwner===me));
 }
 return data}
async function exportBackup(){try{const data=collectBackupData();data.data=await window.oihanePlantPhotos.expandData(data.data);data.createdAt=new Date().toISOString();data.appVersion=document.querySelector('meta[name="oihane-version"]')?.content||'5.3.0';data.moduleKeys=Object.keys(data.data||{}).length;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='oihane-copia-'+today()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);try{localStorage.setItem('oihane_last_export_at',data.createdAt)}catch{}const status=document.querySelector('#localBackupStatus');if(status)status.textContent='Copia descargada ahora. Guarda el archivo fuera de Oihane (por ejemplo, en iCloud Drive o en tu ordenador); las instantáneas locales no sustituyen esta copia externa.';return true}catch(e){alert('No se ha podido crear la copia. Comprueba el espacio disponible en el dispositivo.');return false}}
/** Planifica las escrituras y revierte el lote si falla localStorage.
 * Se usa tanto para importar un JSON como para recuperar una instantánea local.
 * No modifica las claves de sesión ni el formato de los datos existentes.
 */
function restoreModuleDataAtomically(entries,mode='2'){
 const planned=[];
 for(const [key,incoming] of entries){
  if(!oihaneSyncRuntime.isDataKey(key)||incoming===undefined)continue;
  if(['oihane_tasks','oihane_products','oihane_events'].includes(key)&&!Array.isArray(incoming)){
   throw new Error('El módulo '+key+' no contiene una lista válida.');
  }
  const previous=localStorage.getItem(key);
  let next=incoming;
  if(mode!=='1'){
   let old=null;
   try{old=JSON.parse(previous||'null')}catch(_){}
   if(Array.isArray(old)&&Array.isArray(incoming)){
    const byId=new Map(old.map((item,i)=>[String(item?.id??'old-'+i),item]));
    incoming.forEach((item,i)=>{const id=String(item?.id??'new-'+i);if(!byId.has(id))byId.set(id,item)});
    next=[...byId.values()];
   }else if(old!==null)continue;
  }
  const serialized=JSON.stringify(next);
  if(serialized===undefined)throw new Error('Datos no serializables en '+key);
  planned.push({key,previous,serialized});
 }
 const written=[];
 try{
  for(const item of planned){localStorage.setItem(item.key,item.serialized);written.push(item)}
 }catch(error){
  for(const item of written.reverse()){
   try{if(item.previous===null)localStorage.removeItem(item.key);else localStorage.setItem(item.key,item.previous)}
   catch(rollbackError){console.error('Oihane: no se pudo revertir '+item.key,rollbackError)}
  }
  throw error;
 }
 return planned.length;
}
function importBackup(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{const file=input.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());let incoming={};if(parsed?.format==='oihane-backup'&&parsed.data&&typeof parsed.data==='object'&&!Array.isArray(parsed.data))incoming=parsed.data;else if(parsed&&typeof parsed==='object'&&(parsed.tasks||parsed.products||parsed.events||parsed.extras)){incoming.oihane_tasks=parsed.tasks;incoming.oihane_products=parsed.products;incoming.oihane_events=parsed.events;Object.entries(parsed.extras||{}).forEach(([k,v])=>incoming['oihane_'+k]=v)}else{alert('El archivo no parece una copia válida de Oihane. No se ha cambiado ningún dato.');return}const valid=Object.entries(incoming).filter(([k,v])=>k.startsWith('oihane_')&&oihaneSyncRuntime.isDataKey(k)&&v!==undefined);if(!valid.length){alert('La copia no contiene datos reconocibles de Oihane.');return}const created=parsed.createdAt?new Date(parsed.createdAt).toLocaleString('es-ES'):'fecha desconocida';const mode=prompt('Archivo: '+file.name+'\nFecha de la copia: '+created+'\nMódulos/almacenes incluidos: '+valid.length+'\n\nElige cómo restaurar:\n1 = REEMPLAZAR los módulos incluidos (los datos locales de esos módulos se sustituirán).\n2 = FUSIONAR (solo añade elementos que falten; conserva los datos actuales).','2');if(!['1','2'].includes(mode||''))return;if(mode==='1'&&!confirm('Última comprobación: se reemplazarán los datos locales de los módulos incluidos. Descarga primero una copia de los datos actuales si no lo has hecho. ¿Continuar?'))return;const normalized=await window.oihanePlantPhotos.localizeData(Object.fromEntries(valid));restoreModuleDataAtomically(Object.entries(normalized),mode);tasks=readStore('oihane_tasks');products=readStore('oihane_products').map(p=>['Embutidos','Embutido'].includes(p.category)?{...p,category:'Quesos y embutidos'}:p);events=readStore('oihane_events');save();await writeLocalSnapshot();home();alert('Restauración completada. '+(mode==='2'?'Se han añadido los elementos que faltaban sin borrar los datos actuales.':'Se han reemplazado los módulos incluidos.'))}catch(e){alert('No se ha podido leer o restaurar la copia. No sigas haciendo cambios si sospechas que el almacenamiento está lleno; conserva el archivo JSON original.')}};input.click()}
function openModule(name,seed=''){
  if(name==='Compras')store='General';
  if(name==='Estudio'&&window.oihaneIsRuben?.())return home();
  screen=name;
  try{window.oihaneFullSharedVisit?.(name);window.oihaneMixedVisit?.(name)}catch(_){}
  if(name==='Tareas')renderTasks(seed);
  else if(name==='Compras')renderShopping(seed);
  else if(name==='Calendario')renderCalendar(seed);
  else if(name==='Pedidos')renderOrders();
  else renderExtraModule(name,seed);
  // Ajustes: preparar la interfaz directamente desde la navegación,
  // en vez de sustituir openModule posteriormente.
  if(name==='Más'){window.oihaneEnsureSettings?.();window.oihaneOpenModulePreferences?.();}
  document.getElementById('app')?.scrollTo(0,0);window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
  requestAnimationFrame(()=>{
    document.getElementById('app')?.scrollTo(0,0);window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
    if(name==='Más'){
      window.oihaneEnsureSettings?.();window.oihaneOpenModulePreferences?.();
      document.getElementById('app')?.scrollTo(0,0);window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
    }
  });
}
function renderTasks(seed=''){screen='Tareas';const pending=tasks.filter(t=>!t.done).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));document.querySelector('#app').innerHTML=`${unifiedHeader('Tareas')}<div class="dashboard-lead"><div class="eyebrow">Una lista, sin ruido</div><h2>${pending.length?`${pending.length} cosas por resolver`:'Todo al día ✨'}</h2><p>Ordenadas por fecha. Las tareas repetitivas vuelven a aparecer cuando toque.</p><div class="stat-pills"><span>${pending.filter(t=>t.date&&t.date<=today()).length} para hoy o atrasadas</span><span>${tasks.filter(t=>t.done).length} completadas</span></div></div><div class="module-toolbar"><span class="item-meta">PENDIENTES</span><button class="primary" type="button" onclick="toggleAddForm()">＋ Añadir tarea</button></div><section class="panel hidden" id="addPanel"><form id="taskForm"><div class="field"><label>Tarea</label><input id="taskInput" placeholder="¿Qué tienes que hacer?" value="${esc(seed)}" required></div><div class="field"><label>Fecha (opcional)</label><input id="taskDate" type="date"></div><div class="field"><label>Repetición</label><select id="taskRepeat"><option value="">Sin repetición</option><option>Diaria</option><option>Cada 2 días</option><option>Cada 3 días</option><option>Cada 4 días</option><option>Cada 5 días</option><option>Cada 6 días</option><option>Semanal</option><option>Cada 2 semanas</option><option>Cada 3 semanas</option><option>Cada 4 semanas</option><option>Mensual</option><option>Cada 2 meses</option><option>Cada 3 meses</option><option>Cada 6 meses</option><option>Anual</option><option>Días concretos</option><option>Personalizada</option></select></div><div class="field"><label>Intervalo personalizado (días)</label><input id="taskIntervalDays" type="number" min="1" max="365" value="7"></div><div class="field"><label>Días de la semana (para días concretos)</label><div class="subtabs" id="taskWeekdays">${["L","M","X","J","V","S","D"].map((d,i)=>`<label class="check-label"><input type="checkbox" value="${i+1}">${d}</label>`).join("")}</div></div><div class="field"><label>Importancia</label><select id="taskImportance"><option value="2">Normal</option><option value="3">Alta</option><option value="1">Baja</option></select></div><div class="field"><label>Lugar (opcional)</label><input id="taskLocation" placeholder="Ej. supermercado, hospital…"></div><div class="field"><label>Contexto / vínculo (opcional)</label><input id="taskContext" placeholder="Ej. cuando esté en casa, compra, planta…"></div><div class="field"><label class="inline-check"><input id="taskNotify" type="checkbox"> Recordarme (requiere permiso del navegador)</label></div><div class="field"><label class="inline-check"><input id="taskShared" type="checkbox" checked> Compartir con mi pareja</label></div><button class="primary">Guardar tarea</button></form></section><section class="panel"><div id="taskList">${taskRows()}</div><div class="section-head" style="margin-top:14px"><h2>COMPLETADAS RECIENTEMENTE</h2><button id="completedHistoryButton" onclick="toggleCompletedHistory()">Ver historial completo</button></div><div id="completedTasks"></div></section>`;document.querySelector('#taskForm').onsubmit=e=>{e.preventDefault();tasks.push({id:Date.now(),title:document.querySelector('#taskInput').value.trim(),date:document.querySelector('#taskDate').value||'',repeat:document.querySelector('#taskRepeat').value,intervalDays:Number(document.querySelector('#taskIntervalDays').value||7),weekdays:[...document.querySelectorAll('#taskWeekdays input:checked')].map(x=>Number(x.value)),category:'',location:document.querySelector('#taskLocation').value.trim(),context:document.querySelector('#taskContext').value.trim(),importance:Number(document.querySelector('#taskImportance').value||2),notify:document.querySelector('#taskNotify').checked,shared:document.querySelector('#taskShared').checked,sharedWithPartner:document.querySelector('#taskShared').checked,done:false,created:today(),completedAt:'',lastCompleted:''});save();renderTasks()};showCompletedTasks()}

function completeImportantTask(id){const t=tasks.find(x=>x.id===id);if(!t||t.done)return;t.done=true;t.completedAt=today();t.lastCompleted=today();if(t.repeat){const next=nextRepeatDate(t);tasks.push({...t,id:Date.now()+Math.floor(Math.random()*999),date:t.date?next:'',done:false,created:today(),completedAt:'',lastCompleted:today()})}save();home()}
function taskPriority(t){const due=t.date||'9999-12-31';const overdue=due<today()?100:due===today()?70:due===tomorrow()?45:0;return overdue+(Number(t.importance||2)*10)+(t.repeat?3:0)}
function taskRows(){let list=tasks.filter(t=>!t.done).sort((a,b)=>taskPriority(b)-taskPriority(a)||(a.date||'9999').localeCompare(b.date||'9999')||(a.location||'').localeCompare(b.location||''));return list.length?list.map(t=>`<div class="item"><input aria-label="Completar ${esc(t.title)}" type="checkbox" onchange="toggleTask(${t.id})"><div class="item-main"><div class="item-title">${esc(t.title)} ${Number(t.importance)===3?'<span class="priority-high">· Alta</span>':''}</div><div class="item-meta">${t.date?fmt(t.date):'Sin fecha'}${t.repeat?' · '+esc(t.repeat):''}${t.location?' · 📍 '+esc(t.location):''}${t.context?' · '+esc(t.context):''}${t.notify?' · 🔔':''}${t.shared?' · Compartida':''}${t.lastCompleted?' · Última vez '+fmt(t.lastCompleted):''}</div></div><button class="delete" onclick="deleteTask(${t.id})">×</button></div>`).join(''):'<div class="empty-list">No tienes tareas pendientes ✨</div>'}
function addMonthsClamped(date,months){const day=date.getDate();date.setDate(1);date.setMonth(date.getMonth()+months);const last=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();date.setDate(Math.min(day,last));return date}
function nextRepeatDate(t){let d=new Date((t.date||today())+'T12:00:00'),r=t.repeat||'';if(!r)return '';const m=r.match(/Cada (\d+) días?/i);if(m)d.setDate(d.getDate()+Number(m[1]));else if(r==='Diaria')d.setDate(d.getDate()+1);else if(r==='Semanal')d.setDate(d.getDate()+7);else if(r==='Cada 2 semanas')d.setDate(d.getDate()+14);else if(r==='Cada 3 semanas')d.setDate(d.getDate()+21);else if(r==='Cada 4 semanas')d.setDate(d.getDate()+28);else if(r==='Mensual')addMonthsClamped(d,1);else if(r==='Cada 2 meses')addMonthsClamped(d,2);else if(r==='Cada 3 meses')addMonthsClamped(d,3);else if(r==='Cada 6 meses')addMonthsClamped(d,6);else if(r==='Anual')addMonthsClamped(d,12);else if(r==='Días concretos'&&Array.isArray(t.weekdays)&&t.weekdays.length){for(let i=1;i<=7;i++){const c=new Date(d);c.setDate(c.getDate()+i);if(t.weekdays.includes(c.getDay()||7)){d=c;break}}}else if(r==='Personalizada')d.setDate(d.getDate()+Number(t.intervalDays||7));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function toggleTask(id){let t=tasks.find(t=>t.id===id);if(!t)return;if(!t.done){t.done=true;t.completedAt=today();t.lastCompleted=today();if(t.repeat){const next=nextRepeatDate(t);tasks.push({...t,id:Date.now()+Math.floor(Math.random()*999),date:t.date?next:'',done:false,created:today(),completedAt:'',lastCompleted:today()})}}else{t.done=false;t.completedAt=''}save();renderTasks()}
function deleteTask(id){if(!confirm('¿Eliminar esta tarea y su recurrencia actual?'))return;tasks=tasks.filter(t=>t.id!==id);save();renderTasks()}
let completedHistoryAll=false;function toggleCompletedHistory(){completedHistoryAll=!completedHistoryAll;showCompletedTasks();const b=document.querySelector('#completedHistoryButton');if(b)b.textContent=completedHistoryAll?'Mostrar recientes':'Ver historial completo'}function showCompletedTasks(){let el=document.querySelector('#completedTasks');if(!el)return;let done=tasks.filter(t=>t.done).sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||''));const total=done.length;if(!completedHistoryAll)done=done.slice(0,5);el.innerHTML=done.length?done.map(t=>`<div class="item done"><input type="checkbox" checked onchange="toggleTask(${t.id})"><div class="item-main"><div class="item-title">${esc(t.title)}</div><div class="item-meta">${t.completedAt?'Completada el '+fmt(t.completedAt):'Completada'}${t.lastCompleted?' · Última vez '+fmt(t.lastCompleted):''}</div></div><button class="delete" onclick="deleteTask(${t.id})">×</button></div>`).join(''):'<div class="empty-list">Todavía no hay tareas completadas.</div>';const b=document.querySelector('#completedHistoryButton');if(b){b.textContent=completedHistoryAll?'Mostrar recientes':'Ver historial completo';b.style.display=total>5?'':'none'}}
function normalizeProductName(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim()}
/* classifyProductCategory: definición integrada en su implementación definitiva. */
/* migrateProducts: definición integrada en su implementación definitiva. */
migrateProducts();
function renderShopping(seed=''){screen='Compras';try{window.oihaneSharedShoppingTouch?.()}catch(e){}document.querySelector('#app').innerHTML=`${unifiedHeader('Compras')}<div class="subtabs">${['General','Lidl','Eroski','Mercadona'].map(s=>`<button class="${store===s?'active':''}" onclick="setStore('${s}')">${s}</button>`).join('')}</div><section class="panel"><h3>${store==='General'?'LISTA GENERAL':'LISTA DE '+store.toUpperCase()}</h3><form class="add-row" id="productForm"><input id="productInput" placeholder="Añadir producto…" value="${esc(seed)}" required><button class="primary">Añadir</button></form><div class="subtabs"><button class="${!showBought?'active':''}" onclick="setBought(false)">Pendientes</button><button class="${showBought?'active':''}" onclick="setBought(true)">Comprados</button></div><div>${productRows()}</div></section><p class="hint">La lista General reúne los productos pendientes; cada producto también pertenece a su tienda habitual. Los nuevos se asignan a Lidl salvo que elijas otra tienda. Los datos se guardan en este dispositivo.</p>`;document.querySelector('#productForm').onsubmit=e=>{e.preventDefault();const title=document.querySelector('#productInput').value.trim();if(!title)return;const assignedStore=store==='General'?'Lidl':store;products.push({id:Date.now(),title,store:assignedStore,lists:[...new Set(['General',assignedStore])],category:classifyProductCategory(title),bought:false,created:today()});selectedProductIds.clear();save();renderShopping()}}
function setStore(s){store=s;showBought=false;selectedProductIds.clear();renderShopping()}function setBought(b){showBought=b;selectedProductIds.clear();renderShopping()}
function toggleSelectedProduct(id,checked){if(checked)selectedProductIds.add(id);else selectedProductIds.delete(id);const bar=document.querySelector('#bulkActions');if(bar)bar.classList.toggle('hidden',selectedProductIds.size===0);const count=document.querySelector('#selectedCount');if(count)count.textContent=selectedProductIds.size}
/* productRows: definición integrada en su implementación definitiva. */
function clearProductSelection(){selectedProductIds.clear();renderShopping()}
/* moveSelectedProducts: definición integrada en su implementación definitiva. */
function toggleProduct(id){let p=products.find(p=>p.id===id);if(p){p.bought=!p.bought;if(p.sourceHomeId){const homeItems=extraItems('Hogar'),h=homeItems.find(x=>x.id===p.sourceHomeId);if(h){h.purchased=!!p.bought;saveExtra('Hogar',homeItems)}}}selectedProductIds.delete(id);save();renderShopping()}function deleteProduct(id){const p=products.find(p=>p.id===id);if(p){products=products.filter(x=>x.id!==id);if(p.sourceHomeId){const homeItems=extraItems('Hogar'),h=homeItems.find(x=>x.id===p.sourceHomeId);if(h){h.purchased=false;saveExtra('Hogar',homeItems)}}}selectedProductIds.delete(id);save();renderShopping()}
function renderCalendar(seed=''){screen='Calendario';const future=events.filter(e=>e.date>=today()).sort((a,b)=>((a.date||'9999')+(a.time||'')).localeCompare((b.date||'9999')+(b.time||'')));document.querySelector('#app').innerHTML=`${unifiedHeader('Calendario')}<div class="dashboard-lead"><div class="eyebrow">Tu agenda</div><h2>${future.length?`${future.length} eventos próximos`:'Espacio para lo importante'}</h2><p>Consulta tus próximos compromisos, con hora, ubicación y detalles.</p><div class="stat-pills"><span>${future.filter(e=>e.date===today()).length} hoy</span><span>${future.filter(e=>e.date===tomorrow()).length} mañana</span></div></div><div class="module-toolbar"><div class="subtabs"><button class="active" onclick="setCalendarView('day',this)">Día</button><button onclick="setCalendarView('week',this)">Semana</button><button onclick="setCalendarView('month',this)">Mes</button><button onclick="setCalendarView('all',this)">Todos</button></div><button class="primary" type="button" onclick="toggleAddForm()">＋ Nuevo evento</button></div><section class="panel hidden" id="addPanel"><form id="eventForm"><div class="field"><label>Nombre</label><input id="eventTitle" placeholder="Ej. Cita médica" value="${esc(seed)}" required></div><div class="field"><label>Fecha</label><input id="eventDate" type="date" value="${today()}" required></div><div class="field"><label>Hora</label><input id="eventTime" type="time"></div><div class="field"><label>Duración</label><select id="eventDuration"><option value="30">30 minutos</option><option value="60" selected>1 hora</option><option value="90">1 h 30 min</option><option value="120">2 horas</option><option value="240">Medio día</option><option value="480">Día completo</option></select></div><div class="field"><label>Ubicación</label><input id="eventLocation" placeholder="Dirección, centro médico, restaurante…"></div><div class="field"><label class="inline-check"><input type="checkbox" id="eventShare" checked> Compartir con mi pareja</label></div><div class="field"><label>Personas (opcional)</label><input id="eventPeople" placeholder="Con quién quedas"></div><div class="field"><label>Notas (opcional)</label><textarea id="eventNotes" placeholder="Información útil, reserva, preparación…"></textarea></div><div class="field"><label class="inline-check"><input id="eventNotify" type="checkbox"> Aviso (el navegador debe permitir notificaciones)</label></div><div class="field"><label>¿Cuándo avisarme?</label><select id="eventNotifyLead"><option value="0">A su hora</option><option value="15">15 minutos antes</option><option value="60">1 hora antes</option><option value="1440">1 día antes</option></select></div><div class="field"><label>Tiempo para salir antes (minutos)</label><input id="eventDeparture" type="number" min="0" step="5" placeholder="Ej. 30"></div><button class="primary">Guardar evento</button></form></section><section class="panel"><div id="calendarList" class="${calendarView==='week'?'calendar-week-view':''}">${calendarRows()}</div></section><p class="hint">Los eventos se guardan en el calendario interno de Oihane. La sincronización automática con Apple Calendar requiere una futura versión nativa.</p>`;document.querySelector('#eventForm').onsubmit=e=>{e.preventDefault();events.push({id:Date.now(),title:document.querySelector('#eventTitle').value.trim(),date:document.querySelector('#eventDate').value,time:document.querySelector('#eventTime').value,duration:document.querySelector('#eventDuration').value,location:document.querySelector('#eventLocation').value.trim(),people:document.querySelector('#eventPeople').value.trim(),notes:document.querySelector('#eventNotes').value.trim(),notify:document.querySelector('#eventNotify').checked,notifyLead:Number(document.querySelector('#eventNotifyLead')?.value||0),departureMinutes:document.querySelector('#eventDeparture').value||''});save();renderCalendar()}}
function tomorrow(){const d=new Date();d.setDate(d.getDate()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

function setCalendarView(view,button){calendarView=view;document.querySelectorAll('.module-toolbar .subtabs button').forEach(b=>b.classList.remove('active'));button.classList.add('active');const list=document.querySelector('#calendarList');if(list){list.classList.toggle('calendar-week-view',view==='week');list.innerHTML=calendarRows()}}
/* calendarRows: definición integrada en su implementación definitiva. */function deleteEvent(id){if(!confirm('¿Eliminar este evento?'))return;events=events.filter(e=>e.id!==id);save();renderCalendar()}

const extraConfig={
 'Wishlist':{key:'wishlist',intro:'Guarda productos e ideas que quieras investigar antes de comprar.',noun:'producto o idea',placeholder:'Ej. Aspiradora sin cable',status:['Idea','Buscando','Elegido','Comprado'],sections:['PRODUCTOS','IDEAS','BUSCANDO']},
 'Regalos':{key:'gifts',intro:'Organiza ideas y regalos por persona. Los regalos para Rubén se mantienen privados en este dispositivo.',noun:'regalo o persona',placeholder:'Ej. Idea de regalo para Rubén',status:['Idea','Buscando','Elegido','Comprado','Pedido','En camino','Entregado'],sections:['PRÓXIMOS REGALOS','IDEAS','BUSCANDO','COMPRADOS','HISTORIAL']},
 'Hogar':{key:'home',intro:'Cada estancia tiene compras pendientes, inspiración y opciones.',noun:'mueble o idea para casa',placeholder:'Ej. Sofá de tres plazas',status:['Cosas fijas que comprar','Inspiración','Opciones','Seguimiento de pedidos'],sections:['COSAS FIJAS QUE COMPRAR','INSPIRACIÓN','OPCIONES','SEGUIMIENTO DE PEDIDOS'],rooms:['Baño principal','Baño de invitados','Dormitorio','Despacho-vestidor','Habitación de invitados','Salón-comedor','Terraza']},
 'Plantas':{key:'plants',intro:'Registra cuidados, ubicación y observaciones de cada planta.',noun:'planta',placeholder:'Ej. Monstera',status:['Necesita atención','Bien','En observación'],sections:['NECESITAN ATENCIÓN','MIS PLANTAS','EVOLUCIÓN']},
 'Recetas':{key:'recipes',intro:'Guarda recetas, ideas para probar y platos habituales. Puedes anotar ingredientes y pasos.',noun:'receta',placeholder:'Ej. Carbonara',status:['Esta semana','Quiero probar','Quiero aprender','Habitual','Cocinada'],sections:['ESTA SEMANA','QUIERO PROBAR','QUIERO APRENDER','MIS RECETAS HABITUALES']},
 'Estudio':{key:'study',intro:'Organiza cursos y pendientes de lectura, vídeos o estudio.',noun:'curso o pendiente',placeholder:'Ej. Repasar endocarditis',status:['Curso','Pendiente','En espera'],sections:['CURSOS','PENDIENTES']},
 'Viajes':{key:'trips',intro:'Guarda destinos que te apetecen, próximos viajes y recuerdos de viajes realizados.',noun:'destino o viaje',placeholder:'Ej. Lago di Como',status:['Quiero ir','Próximamente','Viaje realizado'],sections:['PRÓXIMAMENTE','IDEAS','VIAJES REALIZADOS']},
 'Cultura':{key:'culture',intro:'Tu biblioteca cultural: libros, arte, museos y películas/series.',noun:'libro, obra, museo o película',placeholder:'Ej. Dune',status:['Pendiente','Leído / visto','Obra de arte','Quiero ver en persona','Museo'],sections:['LIBROS','ARTE','MUSEOS','PELÍCULAS Y SERIES','HISTORIAL']},
 'Planes':{key:'plans',intro:'Ideas de planes con o sin fecha. Si añades fecha, puedes crear también un evento en el calendario interno.',noun:'plan',placeholder:'Ej. Ir a un spa en pareja',status:['Sin fecha','Próximo','Realizado'],sections:['PRÓXIMOS','SIN FECHA','HISTORIAL']},
 'Más':{key:'more',intro:'Preferencias y opciones de Oihane. Las integraciones avanzadas aún no están conectadas.',noun:'nota o preferencia',placeholder:'Ej. Preferencia que quiero revisar',status:['Preferencia','Recordatorio','Pendiente','Integración','Privacidad'],sections:['PREFERENCIAS','INTEGRACIONES','PRIVACIDAD']}
};
let extraCurrent='Wishlist', extraFilter='Todos', activeRoom='';
function extraItems(name){const c=extraConfig[name];try{const value=JSON.parse(localStorage.getItem('oihane_'+c.key)||'[]');return Array.isArray(value)?value:[]}catch{return []}}
function saveExtra(name,items){try{localStorage.setItem('oihane_'+extraConfig[name].key,JSON.stringify(items))}catch(e){const reason=e&&e.name==='QuotaExceededError'?'El navegador ha rechazado el guardado por su límite de almacenamiento local.':'El navegador ha rechazado el guardado ('+(e&&e.name?e.name:'error')+').';alert('No se han podido guardar los cambios. '+reason+(name==='Plantas'?' Abre Plantas y usa «Liberar espacio de fotos» después de verificar una copia JSON.':'')+' No borres los datos de Oihane; descarga una copia si puedes.');return false}try{queueLocalSnapshot()}catch(e){}try{window.oihaneFullSharedChange?.(name)}catch(e){}try{window.oihaneMixedChanged?.(name)}catch(e){}try{queueCloudSync()}catch(e){}return true}
function sectionFor(name,item){if(name==='Wishlist')return item.status==='Buscando'?'BUSCANDO':item.status==='Idea'?'IDEAS':'PRODUCTOS';if(name==='Regalos')return item.status==='Entregado'?'HISTORIAL':['Comprado','Pedido','En camino'].includes(item.status)?'COMPRADOS':item.status==='Buscando'?'BUSCANDO':item.status==='Idea'?'IDEAS':'PRÓXIMOS REGALOS';if(name==='Hogar')return item.status==='Seguimiento de pedidos'?'SEGUIMIENTO DE PEDIDOS':item.status.toUpperCase();if(name==='Plantas')return item.status==='En observación'?'EVOLUCIÓN':(item.status==='Necesita atención'||(item.date&&item.date<=today()))?'NECESITAN ATENCIÓN':'MIS PLANTAS';if(name==='Recetas')return item.status==='Habitual'?'MIS RECETAS HABITUALES':item.status==='Quiero aprender'?'QUIERO APRENDER':item.status==='Esta semana'?'ESTA SEMANA':'QUIERO PROBAR';if(name==='Estudio')return item.status==='Curso'?'CURSOS':'PENDIENTES';if(name==='Viajes')return item.status==='Próximamente'?'PRÓXIMAMENTE':item.status==='Viaje realizado'?'VIAJES REALIZADOS':'IDEAS';if(name==='Cultura'){if(item.kind==='Libro')return 'LIBROS';if(item.kind==='Arte')return 'ARTE';if(item.kind==='Museo')return 'MUSEOS';return ['Leído / visto','Visto','Leído'].includes(item.status)?'HISTORIAL':'PELÍCULAS Y SERIES'}if(name==='Planes')return item.status==='Sin fecha'?'SIN FECHA':item.status==='Realizado'?'HISTORIAL':'PRÓXIMOS';if(name==='Más')return item.status==='Integración'?'INTEGRACIONES':item.status==='Privacidad'?'PRIVACIDAD':'PREFERENCIAS';return 'OTROS'}
function renderExtraModule(name,seed=''){
 if(!extraConfig[name])return;
 if(extraCurrent!==name)activeRoom='';extraCurrent=name;extraFilter='Todos';const c=extraConfig[name],emoji=modules.find(m=>m[1]===name)?.[0]||'✨',items=extraItems(name);try{window.oihaneFullSharedVisit?.(name)}catch(e){}if(name==='Hogar'){let migrated=false;items.forEach(i=>{if(i.purchased&&i.status==='Cosas fijas que comprar'){i.status='Seguimiento de pedidos';i.orderStatus=i.orderStatus||'Comprado';migrated=true}});if(migrated)saveExtra('Hogar',items)}
 const sectionLabels={'PRÓXIMAMENTE':'Próximos','COSAS FIJAS QUE COMPRAR':'Compras fijas','NECESITAN ATENCIÓN':'Necesitan atención','MIS RECETAS HABITUALES':'Habituales','PELÍCULAS Y SERIES':'Películas y series','LIBROS':'Libros','VIAJES REALIZADOS':'Viajes realizados','PRÓXIMOS REGALOS':'Próximos regalos','PREFERENCIAS':'Preferencias','INTEGRACIONES':'Integraciones','PRIVACIDAD':'Privacidad','ESTA SEMANA':'Esta semana','MIS PLANTAS':'Mis plantas','QUIERO PROBAR':'Quiero probar','QUIERO APRENDER':'Quiero aprender','SIN FECHA':'Sin fecha','PRODUCTOS':'Productos','IDEAS':'Ideas','BUSCANDO':'Buscando','CURSOS':'Cursos','PENDIENTES':'Pendientes','LIBROS':'Libros','ARTE':'Arte','MUSEOS':'Museos','COMPRADOS':'Comprados','OPCIONES':'Opciones','INSPIRACIÓN':'Inspiración','SEGUIMIENTO DE PEDIDOS':'Seguimiento de pedidos','HISTORIAL':'Historial','EVOLUCIÓN':'Evolución','PRÓXIMOS':'Próximos'};
 const countFor=sec=>items.filter(i=>sectionFor(name,i)===sec).length;
 const actionLabel=name==='Plantas'?'Añadir planta':name==='Recetas'?'Guardar receta':name==='Viajes'?'Añadir viaje o destino':name==='Cultura'?'Añadir a Cultura':name==='Hogar'?'Añadir mueble/compra':name==='Más'?'Añadir preferencia':name==='Estudio'?'Añadir curso o pendiente':name==='Regalos'?'Añadir regalo o idea':name==='Planes'?'Añadir plan':'Añadir '+(name==='Wishlist'?'producto o idea':'elemento');
 let intro='';
 if(name==='Wishlist')intro=`<div class="dashboard-lead"><div><div class="eyebrow">Tu lista inteligente</div><h2>Antes de comprar, compara.</h2><p>Productos que buscas, ideas guardadas y objetivos de precio.</p></div><div class="stat-pills"><span>${countFor('PRODUCTOS')} productos</span><span>${countFor('BUSCANDO')} buscando</span></div></div>`;
 if(name==='Regalos')intro=`<div class="dashboard-lead"><div><div class="eyebrow">Con tiempo y sin estrés</div><h2>Regalos por preparar</h2><p>Ideas, búsquedas y regalos ya comprados, organizados por persona.</p></div><div class="stat-pills"><span>${countFor('PRÓXIMOS REGALOS')} pendientes</span><span>${countFor('COMPRADOS')} comprados</span></div></div>`;
 if(name==='Hogar')intro=`<div class="dashboard-lead"><div><div class="eyebrow">Tu casa, estancia a estancia</div><h2>Lo que falta y lo que inspira</h2><p>Compras fijas, referencias visuales y opciones para cada rincón.</p></div><div class="stat-pills"><span>${countFor('COSAS FIJAS QUE COMPRAR')} compras fijas</span><span>${items.filter(i=>i.status==='Inspiración').length} inspiraciones</span></div></div><div class="room-grid"><button class="room-chip ${activeRoom===''?'active':''}" onclick="selectRoom('')">Todas las estancias<small>${items.length} guardados</small></button>${c.rooms.map(r=>`<button class="room-chip" onclick="selectRoom('${esc(r)}')">${esc(r)}<small>${items.filter(i=>i.room===r).length} guardados</small></button>`).join('')}</div>`;
 if(name==='Plantas'){const due=items.filter(i=>i.status==='Necesita atención'||(i.date&&i.date<=today()&&i.status!=='En observación'));intro=`<div class="dashboard-lead"><div><div class="eyebrow">Pequeños cuidados</div><h2>${due.length?`${due.length} planta${due.length===1?'':'s'} para revisar`:'Todo en calma por ahora 🌿'}</h2><p>Riego, luz, ubicación y evolución de cada planta.</p></div><div class="stat-pills"><span>${items.length} plantas</span><span>${countFor('EVOLUCIÓN')} en observación</span></div></div>`}
 if(name==='Recetas')intro=`<div class="dashboard-lead"><div><div class="eyebrow">Tu recetario</div><h2>¿Qué te apetece cocinar?</h2><p>Planifica la semana, guarda ideas y ten a mano tus recetas habituales.</p></div><div class="stat-pills"><span>${countFor('ESTA SEMANA')} esta semana</span><span>${countFor('MIS RECETAS HABITUALES')} habituales</span></div></div>`;
 if(name==='Estudio')intro=`<div class="dashboard-lead"><div><div class="eyebrow">Aprender, sin perder el hilo</div><h2>Cursos y pendientes</h2><p>Primero las formaciones con fecha; después, lo que quieres leer, ver o estudiar.</p></div><div class="stat-pills"><span>${countFor('CURSOS')} cursos</span><span>${countFor('PENDIENTES')} pendientes</span></div></div>`;
 if(name==='Viajes'){const next=items.filter(i=>i.status==='Próximamente').sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'))[0];intro=`<div class="dashboard-lead"><div><div class="eyebrow">Tu cuaderno de viaje</div><h2>${next?`Próximo destino: ${esc(next.title)}`:'¿Dónde te gustaría perderte?'}</h2><p>${next?(next.date?'Desde '+fmt(next.date)+' · ':'')+(next.location?esc(next.location):'Tu próxima aventura'):'Guarda destinos, prepara viajes y conserva recuerdos.'}</p></div><div class="stat-pills"><span>${countFor('PRÓXIMAMENTE')} próximos</span><span>${countFor('IDEAS')} ideas</span></div></div>`}
 if(name==='Cultura')intro=`<div class="dashboard-lead"><div><div class="eyebrow">Tu archivo cultural</div><h2>Tu biblioteca visual</h2><p>Portadas de libros en cuadrícula, arte en mosaico, museos que quieres visitar y películas pendientes.</p></div><div class="stat-pills"><span>${items.filter(i=>i.kind==='Libro').length} libros</span><span>${countFor('ARTE')} obras</span><span>${countFor('PELÍCULAS Y SERIES')} pendientes</span></div></div>`;
 if(name==='Planes')intro=`<div class="dashboard-lead"><div><div class="eyebrow">Ideas para vivir</div><h2>Planes con fecha y sin fecha</h2><p>Guarda lo que te apetece hacer y ponle fecha cuando toque.</p></div><div class="stat-pills"><span>${countFor('PRÓXIMOS')} próximos</span><span>${countFor('SIN FECHA')} sin fecha</span></div></div>`;
 if(name==='Más')intro=`<div class="dashboard-lead"><div><div class="eyebrow">Tu espacio personal</div><h2>Oihane, protegida y conectada</h2><p>Copia de seguridad local, sincronización opcional, calendario, avisos y asistente.</p></div><div class="stat-pills"><span>Versión 5.59.12</span><span id="backupStatusPill">Copia local pendiente</span></div></div><div class="integration-box" data-oihane-setting="backup"><h3>💾 Copias de seguridad y recuperación</h3><div class="integration-actions"><button class="primary" type="button" onclick="exportBackup()">Descargar copia JSON</button><button type="button" onclick="importBackup()">Restaurar / fusionar copia</button><button type="button" onclick="recoverLocalSnapshot()">Recuperar copia local</button></div><div class="integration-status" id="localBackupStatus">Comprobando instantáneas…</div></div><div class="integration-box" data-oihane-setting="sync"><h3>☁️ Sincronización entre dispositivos</h3><div class="field"><label>Correo</label><input id="syncEmail" type="email" autocomplete="email" placeholder="Tu correo"></div><div class="field"><label>Contraseña</label><input id="syncPassword" type="password" autocomplete="current-password" placeholder="Contraseña de tu cuenta"></div><div class="field"><label>Tu nombre</label><input id="oihaneAccountDisplayName" type="text" maxlength="48" autocomplete="name" placeholder="Nombre para el saludo"></div><div class="integration-actions"><button class="primary" type="button" onclick="oihaneSyncPrimary()">Sincronizar</button><button type="button" onclick="cloudLogout()">Desconectar</button><button type="button" onclick="oihaneToggleSupabasePublicInfo()">Ver URL y clave pública</button></div><p class="hint" id="oihaneSignupHelp">¿Aún no tienes cuenta? <a href="#" onclick="event.preventDefault();cloudAuth('signup')">Crear una cuenta</a></p><div id="oihaneSupabasePublicInfo" hidden><div class="field"><label>URL de Supabase</label><input id="syncUrl" type="url" readonly></div><div class="field"><label>Clave pública</label><input id="syncKey" type="text" readonly></div></div><p class="hint oihane-sync-frequency">Sincronización automática: cada 60 segundos con Oihane abierta, al abrirla o recuperar la conexión. Los cambios se envían poco después de guardarse.</p><div class="integration-status" id="cloudStatus"></div></div><div class="integration-box"><h3>📅 Calendario y avisos</h3><p>La web puede generar un archivo .ics con eventos y alarmas importables, y mostrar avisos dentro de Oihane o como notificaciones mientras está abierta. La sincronización directa con Apple Calendar y las notificaciones push con la app cerrada requieren una integración de servidor y permisos de iOS.</p><div class="integration-actions"><button class="primary" onclick="exportCalendarICS()">Exportar calendario para Apple</button><button onclick="openCalendarImport()">Importar archivo .ics</button><button onclick="requestNotificationPermission()">Activar avisos mientras Oihane está abierta</button><button class="primary" onclick="enablePushNotifications()">Activar notificaciones con Oihane cerrada</button><button onclick="testPushNotification()">Probar notificación push</button><button onclick="testNotification()">Probar aviso local</button><button onclick="showIntegrationStatus()">Estado de integraciones</button></div><div class="integration-status" id="notifStatus"></div></div>`;
 const kindOptions=name==='Cultura'?'<div class="field"><label>Tipo</label><select id="extraKind"><option>Libro</option><option>Arte</option><option>Museo</option><option>Película/serie</option></select></div>':name==='Recetas'?'<div class="field"><label>Tipo de receta / planificación</label><select id="extraKind"><option>Quiero probar</option><option>Quiero aprender</option><option>Habitual</option><option>Esta semana</option></select></div>':name==='Estudio'?'<div class="field"><label>Tipo</label><select id="extraKind"><option>Curso</option><option>Pendiente</option></select></div>':name==='Viajes'?'<div class="field"><label>Tipo</label><select id="extraKind"><option>Destino</option><option>Viaje</option></select></div>':'';
 const roomOptions=c.rooms?`<div class="field"><label>Estancia</label><select id="extraRoom">${c.rooms.map(r=>`<option>${r}</option>`).join('')}</select></div>`:'';
 const dateLabel=name==='Plantas'?'Próximo cuidado':name==='Viajes'?'Fecha de inicio':name==='Regalos'?'Fecha importante':name==='Recetas'?'Fecha para esta semana':'Fecha (opcional)';
 const photoField=['Plantas','Recetas','Cultura','Viajes','Hogar','Wishlist','Regalos'].includes(name)?`<div class="field"><label>Foto (opcional)</label><input id="extraPhoto" type="file" accept="image/*"><div id="photoPreview"></div></div>`:'';
 let special='';
 if(name==='Plantas')special='<div class="field"><label>Frecuencia de riego (días)</label><input id="extraFrequency" type="number" min="1" max="90" placeholder="Ej. 7"></div><div class="field"><label>Último riego</label><input id="extraWatered" type="date"></div><div class="field"><label>Luz</label><select id="extraLight"><option>Indirecta brillante</option><option>Luz directa</option><option>Luz media</option><option>Poca luz</option></select></div><div class="field"><label>Ubicación de la planta</label><input id="extraLocation" placeholder="Ej. salón, cerca de la ventana"></div>';
 if(name==='Recetas')special='<div class="field"><label>Ingredientes (uno por línea; separa cantidad y producto)</label><textarea id="extraIngredients" placeholder="200 g de pasta&#10;2 huevos&#10;1/2 cebolla&#10;Aceite de oliva al gusto"></textarea><div class="hint">Puedes escribir «200 g de pasta» o «200 g | pasta». Oihane separará la cantidad del ingrediente.</div></div><div class="field"><label>Pasos de preparación</label><textarea id="extraSteps" placeholder="Describe los pasos…"></textarea></div><div class="field"><label>Raciones de la receta original</label><input id="extraServings" type="number" min="1" placeholder="2" value="2"></div>';
 if(name==='Viajes')special='<div class="field"><label>Destino / lugar</label><input id="extraLocation" placeholder="Ciudad, país o alojamiento"></div><div class="field"><label>Fecha de vuelta</label><input id="extraEndDate" type="date"></div><div class="field"><label>Transporte / vuelo / reserva</label><input id="extraTransport" placeholder="Vuelo, compañía, localizador…"></div><div class="field"><label>Alojamiento / coche / presupuesto</label><textarea id="extraTripDetails" placeholder="Alojamiento, coche, entradas, presupuesto, itinerario…"></textarea></div>';
 if(name==='Regalos')special='<div class="field"><label>Para quién</label><input id="extraPerson" placeholder="Nombre de la persona"></div><div class="field"><label>Tipo de ocasión</label><select id="extraOccasion"><option>Cumpleaños</option><option>Aniversario</option><option>Navidad</option><option>Reyes</option><option>Otro</option></select></div><div class="field"><label>Fecha de la ocasión</label><input id="extraOccasionDate" type="date"></div><div class="field"><label>Precio objetivo (€)</label><input id="v518Price" type="number" min="0" step="0.01"></div><div class="field"><label>Pedido / seguimiento</label><input id="extraOrder" placeholder="Tienda, número de pedido, seguimiento…"></div>';
 if(name==='Wishlist')special='<div class="field"><label>Precio objetivo (€)</label><input id="extraPrice" type="number" min="0" step="0.01" placeholder="Ej. 150"></div><div class="field"><label>Precio actual (€)</label><input id="extraCurrentPrice" type="number" min="0" step="0.01" placeholder="Precio observado"></div><div class="field"><label>Enlace</label><input id="extraLink" type="url" placeholder="https://…"></div><div class="field"><label>Notas de comparación</label><textarea id="extraCompare" placeholder="Tienda, envío, disponibilidad…"></textarea></div>';
 if(name==='Estudio')special='<div class="field"><label>Enlace / plataforma</label><input id="extraLink" type="url" placeholder="https://…"></div><div class="field"><label>Modalidad</label><select id="extraMode"><option>Presencial</option><option>Online</option><option>Mixto</option></select></div><div class="field"><label>Hora de inicio (para cursos)</label><input id="extraTime" type="time"></div><div class="field"><label>Ubicación / enlace de sesión</label><input id="extraPlace" placeholder="Aula, centro o enlace online"></div><div class="field"><label>Duración (minutos)</label><input id="extraDuration" type="number" min="15" value="60"></div><div class="field"><label>Fecha de fin (opcional)</label><input id="extraEndDate" type="date"></div><div class="field"><label>Programa / documentos / notas</label><textarea id="extraProgram" placeholder="Programa, materiales, sesiones…"></textarea></div>';
 if(name==='Planes')special='<div class="field"><label>Ubicación</label><input id="extraLocation" placeholder="Lugar, dirección o enlace de Maps"></div><div class="field"><label>Personas</label><input id="extraPeople" placeholder="Con quién"></div><div class="field"><label>Reserva / detalles</label><input id="extraBooking" placeholder="Reserva, entradas, teléfono…"></div>';
 if(name==='Cultura')special='<div class="field"><label>Autor / artista / director</label><input id="extraCreator" placeholder="Autor, artista, director o museo"></div><div class="field"><label>Año</label><input id="extraYear" placeholder="Publicación, creación o estreno"></div><div class="field"><label>Valoración (1–5)</label><select id="extraRating"><option value="">Sin valorar</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div><div class="field"><label>Museo / ciudad / estilo</label><input id="extraArtPlace" placeholder="Museo, ciudad, estilo artístico…"></div><div class="field"><label>Enlace a ficha o museo</label><input id="extraLink" type="url" placeholder="https://…"></div><div class="field"><label>¿En qué ciudad está?</label><input id="cultureCity" placeholder="Ciudad para relacionarlo con un viaje"></div>'; 
 const sectionCards=c.sections.map((sec,i)=>`<section class="section-card" id="sectionCard${i}">${name==='Cultura'?`<div class="section-card-head-row"><button class="section-card-head" type="button" onclick="toggleSectionCard(${i})"><strong>${sectionLabels[sec]||sec}</strong><span class="section-count" id="extraCount_${i}">${countFor(sec)}</span><span class="section-chevron" id="sectionChevron${i}">⌃</span></button><button class="culture-add-inline" type="button" onclick="addCultureToSection('${sec}')">＋ Añadir</button></div>`:`<button class="section-card-head" type="button" onclick="toggleSectionCard(${i})"><strong>${sectionLabels[sec]||sec}</strong><span class="section-count" id="extraCount_${i}">${countFor(sec)}</span><span class="section-chevron" id="sectionChevron${i}">⌃</span></button>`}<div class="section-card-body" id="extraList_${i}"></div></section>`).join('');
 document.querySelector('#app').innerHTML=`<div class="module-header" style="--module-tint:${(moduleHeaders[name]||moduleHeaders['Más']).tint}" data-module="${name}"><img class="module-cover" src="${moduleHeaderImage(name)}" data-fallback="${moduleFallbackImage(name)}" alt="" onerror="this.onerror=null;this.src=this.dataset.fallback"><button class="back" onclick="home()" aria-label="Volver al inicio">‹</button><div class="header-title"><div class="header-kicker">${(moduleHeaders[name]||moduleHeaders['Más']).kicker}</div><h1>${name==='Más'?'Ajustes':name}</h1></div></div>${intro}<div class="module-toolbar"><span class="item-meta">SECCIONES</span><div style="display:flex;gap:7px;flex-wrap:wrap"><button class="small-action" id="toggleAllSections" type="button" onclick="toggleAllSectionCards()" aria-label="Plegar o desplegar secciones">⌃</button><button class="primary" type="button" onclick="toggleAddForm()">＋ ${actionLabel}</button></div></div><section class="panel hidden" id="addPanel"><div class="section-head"><h2>${actionLabel.toUpperCase()}</h2><button type="button" onclick="toggleAddForm()">Cerrar</button></div><form id="extraForm"><div class="field"><label>${name==='Cultura'?'Título de la obra':'Nombre'}</label>${name==='Cultura'?`<div class="culture-lookup-row"><input id="extraTitle" placeholder="${c.placeholder}" value="${esc(seed)}" required autocomplete="off"><button type="button" class="small-action" onclick="lookupCultureTitle(false)">Identificar</button></div><div class="culture-lookup-note" id="cultureLookupNote">Escribe el título; intentaré completar la ficha automáticamente.</div>`:`<input id="extraTitle" placeholder="${c.placeholder}" value="${esc(seed)}" required>`}</div>${kindOptions}${roomOptions}<div class="field"><label>Estado / categoría</label><select id="extraStatus">${c.status.map(st=>`<option>${st}</option>`).join('')}</select></div><div class="field"><label>${dateLabel}</label><input id="extraDate" type="date"></div>${special}${photoField}<div class="field"><label>Notas / descripción</label><textarea id="extraNotes" placeholder="Detalles, ideas, ingredientes, observaciones…"></textarea></div><button class="primary" type="submit">Guardar</button></form></section><div class="section-cards">${sectionCards}</div><p class="hint">Los datos se guardan en este dispositivo. No hay todavía sincronización entre dispositivos ni conexiones externas automáticas.</p>`;
 if(name==='Cultura'){const titleInput=document.querySelector('#extraTitle');if(titleInput){titleInput.addEventListener('blur',()=>{if(titleInput.value.trim())lookupCultureTitle(false)});titleInput.addEventListener('input',()=>{cultureLookupLastTitle='';const note=document.querySelector('#cultureLookupNote');if(note)note.textContent=''});}}
 const file=document.querySelector('#extraPhoto');if(file)file.onchange=async()=>{const f=file.files?.[0];if(!f)return;try{const data=await compressPhoto(f);document.querySelector('#photoPreview').innerHTML=`<img class="photo-preview" src="${data}" alt="Vista previa de la foto">`;file.dataset.photo=data}catch{alert('No se ha podido cargar la foto. Prueba con otra imagen.')}};
 if(name==='Más'){restoreSettingsIntoUI()}
document.querySelector('#extraForm').onsubmit=async e=>{e.preventDefault();const list=extraItems(name);let photo=document.querySelector('#extraPhoto')?.dataset.photo||'';if(!photo&&document.querySelector('#extraPhoto')?.files?.[0]){try{photo=await compressPhoto(document.querySelector('#extraPhoto').files[0])}catch{alert('No se ha podido procesar la foto.');return}}const status=document.querySelector('#extraStatus').value;const item={id:Date.now(),title:document.querySelector('#extraTitle').value.trim(),status,date:document.querySelector('#extraDate').value,notes:document.querySelector('#extraNotes').value.trim(),room:document.querySelector('#extraRoom')?.value||'',kind:document.querySelector('#extraKind')?.value||'',created:today(),photo,frequency:document.querySelector('#extraFrequency')?.value||'',light:document.querySelector('#extraLight')?.value||'',location:document.querySelector('#extraLocation')?.value||document.querySelector('#extraPlace')?.value||'',lastWatered:document.querySelector('#extraWatered')?.value||'',ingredients:document.querySelector('#extraIngredients')?.value||'',steps:document.querySelector('#extraSteps')?.value||'',servings:document.querySelector('#extraServings')?.value||'',currentServings:document.querySelector('#extraServings')?.value||'2',orderStatus:'',orderStore:'',orderNumber:'',trackingLink:'',person:document.querySelector('#extraPerson')?.value||'',price:document.querySelector('#extraPrice')?.value||'',link:document.querySelector('#extraLink')?.value||'',creator:document.querySelector('#extraCreator')?.value||'',currentPrice:document.querySelector('#extraCurrentPrice')?.value||'',compare:document.querySelector('#extraCompare')?.value||'',occasion:document.querySelector('#extraOccasion')?.value||'',occasionDate:document.querySelector('#extraOccasionDate')?.value||'',order:document.querySelector('#extraOrder')?.value||'',mode:document.querySelector('#extraMode')?.value||'',time:document.querySelector('#extraTime')?.value||'',duration:document.querySelector('#extraDuration')?.value||'60',people:document.querySelector('#extraPeople')?.value||'',booking:document.querySelector('#extraBooking')?.value||'',endDate:document.querySelector('#extraEndDate')?.value||'',program:document.querySelector('#extraProgram')?.value||'',transport:document.querySelector('#extraTransport')?.value||'',tripDetails:document.querySelector('#extraTripDetails')?.value||'',year:document.querySelector('#extraYear')?.value||'',rating:document.querySelector('#extraRating')?.value||'',artPlace:document.querySelector('#extraArtPlace')?.value||'',artCity:document.querySelector('#cultureCity')?.value||''};if(name==='Cultura'&&item.kind==='Museo')item.status='Museo';if(name==='Cultura'&&item.kind==='Arte'&&item.status==='Pendiente')item.status='Obra de arte';if(name==='Plantas'&&item.lastWatered&&item.frequency){const d=new Date(item.lastWatered+'T12:00:00');d.setDate(d.getDate()+Number(item.frequency));item.date=d.toISOString().slice(0,10);if(item.date<=today())item.status='Necesita atención'}if(name==='Recetas'&&item.kind)item.status=item.kind==='Habitual'?'Habitual':item.kind==='Quiero aprender'?'Quiero aprender':item.kind==='Esta semana'?'Esta semana':'Quiero probar';if(name==='Estudio'&&item.kind)item.status=item.kind;if(name==='Viajes'&&item.kind==='Viaje'&&item.status==='Quiero ir')item.status='Próximamente';if(name==='Planes'&&item.date)item.status='Próximo';if(name==='Regalos'&&item.person==='Rubén'&&!item.private)item.private=true;list.push(item);if(!saveExtra(name,list)){return}if(name==='Planes'&&item.date){upsertLinkedEvent(name,item)}renderExtraModule(name)};
 c.sections.forEach(sec=>renderExtraList(name,sec));
}
let cultureLookupLastTitle='';window.cultureBookFilter='Pendientes';
function setCultureBookFilter(filter){window.cultureBookFilter=filter;renderExtraList('Cultura','LIBROS')}
function addCultureToSection(section){
 const panel=document.querySelector('#addPanel');if(panel)panel.classList.remove('hidden');
 const kind=document.querySelector('#extraKind'),status=document.querySelector('#extraStatus'),title=document.querySelector('#extraTitle');
 const defaults=section==='LIBROS'?['Libro','Pendiente']:section==='ARTE'?['Arte','Obra de arte']:section==='MUSEOS'?['Museo','Museo']:section==='HISTORIAL'?['Película/serie','Leído / visto']:['Película/serie','Pendiente'];
 if(kind)kind.value=defaults[0];if(status)status.value=defaults[1];if(title)title.focus();
 const note=document.querySelector('#cultureLookupNote');if(note)note.textContent='Añadiendo en '+({LIBROS:'Libros',ARTE:'Arte',MUSEOS:'Museos',HISTORIAL:'Historial','PELÍCULAS Y SERIES':'Películas y series'}[section]||section)+'. Escribe el título para identificarlo.';
}
function cultureNorm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function cultureCandidate(kind,title,creator,year,photo,link,subtitle='',place=''){return {kind,title,creator:creator||'',year:year||'',photo:photo||'',link:link||'',subtitle:subtitle||'',artPlace:place||'',status:kind==='Libro'?'Pendiente':kind==='Arte'?'Obra de arte':kind==='Museo'?'Museo':'Pendiente'}}
async function lookupCultureTitle(force=false){
 const titleEl=document.querySelector('#extraTitle'),kindEl=document.querySelector('#extraKind'),note=document.querySelector('#cultureLookupNote');if(!titleEl||!kindEl)return;
 const query=titleEl.value.trim();if(query.length<2){if(force)alert('Escribe al menos dos letras del título.');return}
 if(!force&&cultureLookupLastTitle===query)return;cultureLookupLastTitle=query;
 if(note)note.textContent='Buscando en catálogos de libros, cine, series y arte…';
 const candidates=[];
 const safeFetch=async url=>{const r=await fetch(url,{headers:{'Accept':'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()};
 const tasks=[
  (async()=>{const d=await safeFetch('https://openlibrary.org/search.json?title='+encodeURIComponent(query)+'&limit=8&fields=title,author_name,first_publish_year,cover_i,key,edition_count');const seen=new Set();for(const b of d.docs||[]){if(!b.title)continue;const creator=(b.author_name||[]).slice(0,2).join(', '),year=b.first_publish_year||'',k=cultureNorm(b.title+' '+creator+' '+year);if(seen.has(k))continue;seen.add(k);candidates.push(cultureCandidate('Libro',b.title,creator,year,b.cover_i?'https://covers.openlibrary.org/b/id/'+b.cover_i+'-L.jpg':'','https://openlibrary.org'+(b.key||''),(b.edition_count?b.edition_count+' ediciones':'')+(year?' · primera publicación '+year:'')));if(seen.size>=6)break}})(),
  (async()=>{const d=await safeFetch('https://itunes.apple.com/search?term='+encodeURIComponent(query)+'&entity=movie&limit=6');for(const m of d.results||[])candidates.push(cultureCandidate('Película/serie',m.trackName||m.collectionName,m.artistName||'',(m.releaseDate||'').slice(0,4),m.artworkUrl600||m.artworkUrl100,m.trackViewUrl,'Película · '+(m.primaryGenreName||'Cine')))})(),
  (async()=>{const d=await safeFetch('https://api.tvmaze.com/search/shows?q='+encodeURIComponent(query));for(const t of (d||[]).slice(0,6)){const sh=t.show||{};if(sh.name)candidates.push(cultureCandidate('Película/serie',sh.name,(sh.network&&sh.network.name)||(sh.webChannel&&sh.webChannel.name)||'',(sh.premiered||'').slice(0,4),sh.image&&(sh.image.original||sh.image.medium),sh.url,'Serie · '+(sh.genres||[]).slice(0,2).join(', ')))}})(),
  (async()=>{const u='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(query+' painting artwork')+'&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=720&format=json&origin=*';const d=await safeFetch(u);for(const page of Object.values(d.query?.pages||{})){const info=page.imageinfo?.[0],meta=info?.extmetadata||{};if(!info?.thumburl)continue;const clean=v=>String(v?.value||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();const creator=clean(meta.Artist)||clean(meta.Credit)||'';const year=clean(meta.Date)||'';const title=(clean(meta.ObjectName)||page.title.replace(/^File:/,'').replace(/\.[^.]+$/,'')).replace(/_/g,' ');candidates.push(cultureCandidate('Arte',title,creator,year,info.thumburl,info.descriptionurl,'Imagen de Wikimedia Commons',clean(meta.Medium)||''));if(candidates.filter(x=>x.kind==='Arte').length>=6)break}})(),
  (async()=>{const d=await safeFetch('https://www.wikidata.org/w/api.php?action=wbsearchentities&search='+encodeURIComponent(query)+'&language=es&uselang=es&format=json&origin=*');for(const ent of (d.search||[]).slice(0,5))candidates.push(cultureCandidate('Museo',ent.label||query,'','', '',ent.concepturi||('https://www.wikidata.org/wiki/'+ent.id),ent.description||'Museo o institución cultural'))})()
 ];
 const settled=await Promise.allSettled(tasks);
 // Keep only candidates that plausibly correspond to the entered title; never silently choose among unrelated results.
 const qn=cultureNorm(query);let relevant=candidates.filter(c=>{const tn=cultureNorm(c.title);return tn===qn||tn.includes(qn)||(qn.length>=5&&qn.includes(tn))});
 const seen=new Set();relevant=relevant.filter(c=>{const k=cultureNorm(c.kind+'|'+c.title+'|'+c.creator+'|'+c.year);if(seen.has(k))return false;seen.add(k);return true}).slice(0,18);
 if(!relevant.length){cultureLookupLastTitle='';if(note)note.textContent='No he encontrado una ficha suficientemente parecida. Puedes completar los datos manualmente o pulsar «Identificar» para volver a buscar.';if(force&&settled.every(x=>x.status==='rejected'))alert('Los catálogos no están disponibles ahora mismo. Comprueba la conexión e inténtalo de nuevo.');return}
 const exact=relevant.filter(c=>cultureNorm(c.title)===qn);
 if(exact.length===1){applyCultureCandidate(exact[0],note);return}
 if(relevant.length===1){applyCultureCandidate(relevant[0],note);return}
 showCultureChoices(query,relevant.slice(0,10),note);
}
function applyCultureCandidate(c,note){
 const put=(id,val)=>{const el=document.querySelector('#'+id);if(el&&val)el.value=val};
 put('extraTitle',c.title);put('extraKind',c.kind);put('extraCreator',c.creator);put('extraYear',c.year);put('extraArtPlace',c.artPlace);put('extraLink',c.link);put('extraStatus',c.status);
 const photo=document.querySelector('#extraPhoto');if(photo&&c.photo){photo.dataset.photo=c.photo;const preview=document.querySelector('#photoPreview');if(preview)preview.innerHTML='<img class="photo-preview" src="'+c.photo.replace(/"/g,'&quot;')+'" alt="Imagen identificada">'}
 if(note)note.textContent='Ficha identificada: '+c.title+(c.creator?' · '+c.creator:'')+(c.year?' · '+c.year:'')+'. He rellenado los datos disponibles; puedes corregirlos antes de guardar.';
 cultureLookupLastTitle=c.title;
}
function showCultureChoices(query,candidates,note){
 document.querySelector('#cultureChoiceOverlay')?.remove();const overlay=document.createElement('div');overlay.id='cultureChoiceOverlay';overlay.className='culture-choice-overlay';
 const dialog=document.createElement('div');dialog.className='culture-choice-dialog';dialog.innerHTML='<h2>¿Cuál es?</h2><p>He encontrado varias opciones para «'+esc(query)+'». Elige la correcta y completaré la ficha.</p><div class="culture-choice-list"></div><div class="culture-choice-footer"><button type="button" onclick="document.querySelector(\'#cultureChoiceOverlay\')?.remove()">Ninguna / cancelar</button></div>';
 const list=dialog.querySelector('.culture-choice-list');candidates.forEach((c,index)=>{const btn=document.createElement('button');btn.type='button';btn.className='culture-choice';const img=c.photo?'<img src="'+c.photo.replace(/"/g,'&quot;')+'" alt="" loading="lazy">':'<span class="culture-choice-placeholder">'+(c.kind==='Libro'?'Libro':c.kind==='Arte'?'Arte':c.kind==='Museo'?'Museo':'Cine')+'</span>';btn.innerHTML=img+'<span><strong>'+esc(c.title)+'</strong><small>'+esc([c.creator,c.year,c.subtitle].filter(Boolean).join(' · ')||c.kind)+'</small></span>';btn.onclick=()=>{applyCultureCandidate(c,document.querySelector('#cultureLookupNote'));overlay.remove()};list.appendChild(btn)});overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});overlay.appendChild(dialog);document.body.appendChild(overlay);if(note)note.textContent='He encontrado varias coincidencias; selecciona la correcta.';
}
function toggleAddForm(){const panel=document.querySelector('#addPanel');if(!panel)return;const wasOpen=!panel.classList.contains('hidden');panel.classList.toggle('hidden');if(wasOpen){panel.querySelector('form')?.reset();panel.querySelectorAll('input[type=file]').forEach(file=>{delete file.dataset.photo;file.parentElement.querySelector('.photo-preview')?.remove()})}else{(document.querySelector('#extraTitle')||document.querySelector('#eventTitle')||document.querySelector('#taskInput'))?.focus()}}
function selectRoom(room){activeRoom=room;renderExtraModule('Hogar')}

async function compressPhoto(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const max=720,scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.58))};img.src=reader.result};reader.readAsDataURL(file)})}
// Miniaturas eficientes para Plantas. NO se elimina ni se sustituye una foto antigua
// automáticamente: el usuario puede solicitar su optimización tras exportar JSON.
window.oihaneCompressPlantPhotoData=function(src){return new Promise((resolve,reject)=>{
 if(typeof src!=='string'||!src.startsWith('data:image/')){resolve(src);return}
 const img=new Image();img.onerror=()=>reject(Error('No se pudo decodificar la fotografía'));
 img.onload=()=>{
  try{
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas no disponible');
   let best=src;
   for(const [limit,quality] of [[480,.55],[420,.48],[360,.42],[300,.36],[260,.32]]){
    const ratio=Math.min(1,limit/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));
    canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const next=canvas.toDataURL('image/jpeg',quality);
    if(next.startsWith('data:image/jpeg')&&next.length<best.length)best=next;
    if(best.length<=44000)break;
   }
   resolve(best);
  }catch(e){reject(e)}
 };
 img.src=src;
})};
window.oihaneCompressPlantPhotoFile=async function(file){
 // IndexedDB permite conservar miniaturas nítidas (720 px), sin compresión extrema.
 return compressPhoto(file);
};

function filterExtra(section){const idx=extraConfig[extraCurrent].sections.indexOf(section);if(idx>=0)toggleSectionCard(idx)}
function toggleSectionCard(idx){const body=document.querySelector('#extraList_'+idx),chev=document.querySelector('#sectionChevron'+idx);if(!body)return;body.classList.toggle('collapsed');if(chev)chev.textContent=body.classList.contains('collapsed')?'⌄':'⌃'}
function toggleAllSectionCards(){const cards=[...document.querySelectorAll('.section-card-body')];if(!cards.length)return;const shouldOpen=cards.some(card=>card.classList.contains('collapsed'));cards.forEach((body,idx)=>{body.classList.toggle('collapsed',!shouldOpen);const chev=document.querySelector('#sectionChevron'+idx);if(chev)chev.textContent=shouldOpen?'⌃':'⌄'});const btn=document.querySelector('#toggleAllSections');if(btn)btn.textContent=shouldOpen?'⌃':'⌄'}
function sectionListId(name,section){return 'extraList_'+extraConfig[name].sections.indexOf(section)}
function renderExtraList(name,section){
 const items=extraItems(name).filter(i=>sectionFor(name,i)===section&&!(name==='Hogar'&&activeRoom&&i.room!==activeRoom)).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
 const list=document.querySelector('#'+sectionListId(name,section));if(!list)return;const idx=extraConfig[name].sections.indexOf(section);const count=document.querySelector('#extraCount_'+idx);if(count)count.textContent=items.length;
 if(name==='Cultura'){
  const actions=i=>`<div class="culture-actions"><button class="small-action" onclick="editCultureStatus(${i.id})">Estado</button>${['Arte','Museo'].includes(i.kind)?`<button class="small-action" onclick="cultureArtToTrip(${i.id})">Añadir a viaje</button>`:''}<button class="small-action" onclick="editCultureDetails(${i.id})">Editar ficha</button><button class="delete" aria-label="Eliminar" onclick="deleteExtra('Cultura',${i.id},'${section}')">×</button></div>`;
  if(!items.length){list.innerHTML='<div class="empty-list">Todavía no hay elementos aquí. Puedes añadir el primero arriba.</div>';return}
  if(section==='LIBROS'){
   const allBooks=items,filter=window.cultureBookFilter||'Pendientes',shown=filter==='Todos'?allBooks:allBooks.filter(i=>filter==='Leídos'?['Leído / visto','Leído'].includes(i.status):!['Leído / visto','Leído'].includes(i.status));
   list.innerHTML=`<div class="culture-book-filters"><button class="${filter==='Pendientes'?'active':''}" onclick="setCultureBookFilter('Pendientes')">Pendientes (${allBooks.filter(i=>!['Leído / visto','Leído'].includes(i.status)).length})</button><button class="${filter==='Leídos'?'active':''}" onclick="setCultureBookFilter('Leídos')">Leídos (${allBooks.filter(i=>['Leído / visto','Leído'].includes(i.status)).length})</button><button class="${filter==='Todos'?'active':''}" onclick="setCultureBookFilter('Todos')">Todos (${allBooks.length})</button></div>${shown.length?`<div class="culture-book-grid">${shown.map(i=>`<article class="culture-book-card"><div class="culture-book-cover">${i.photo?`<img src="${i.photo}" alt="Portada de ${esc(i.title)}" loading="lazy">`:`<div class="cover-placeholder"><span>📖</span><strong>${esc(i.title)}</strong>${i.creator?`<small>${esc(i.creator)}</small>`:''}</div>`}</div><div class="culture-card-info"><strong>${esc(i.title)}</strong>${i.creator?`<span>${esc(i.creator)}</span>`:''}${i.year?`<small>${esc(i.year)}</small>`:''}${i.rating?`<small>★ ${esc(i.rating)}/5</small>`:''}${i.notes?`<p>${esc(i.notes)}</p>`:''}${i.link?`<a href="${esc(i.link)}" target="_blank" rel="noopener">Ver ficha ↗</a>`:''}${actions(i)}</div></article>`).join('')}</div>`:'<div class="empty-list">No hay libros en esta vista.</div>'}`;return;
  }
  if(section==='ARTE'){
   list.innerHTML=`<div class="culture-art-masonry">${items.map(i=>`<article class="culture-art-card">${i.photo?`<img class="culture-art-image" src="${i.photo}" alt="${esc(i.title)}" loading="lazy">`:`<div class="culture-art-placeholder"><span>${esc(i.title)}</span></div>`}<div class="culture-card-info"><strong>${esc(i.title)}</strong>${i.creator?`<span>${esc(i.creator)}</span>`:''}<small>${[i.year,i.artPlace,i.artCity].filter(Boolean).map(esc).join(' · ')}</small>${i.rating?`<small>★ ${esc(i.rating)}/5</small>`:''}${i.notes?`<p>${esc(i.notes)}</p>`:''}${i.link?`<a href="${esc(i.link)}" target="_blank" rel="noopener">Ficha / museo ↗</a>`:''}${actions(i)}</div></article>`).join('')}</div>`;return;
  }
  if(section==='MUSEOS'){
   list.innerHTML=`<div class="culture-museum-list">${items.map(i=>`<article class="culture-museum-card">${i.photo?`<img src="${i.photo}" alt="${esc(i.title)}" loading="lazy">`:`<div class="museum-placeholder">🏛️</div>`}<div class="culture-card-info"><strong>${esc(i.title)}</strong>${i.artCity||i.artPlace?`<span>📍 ${esc([i.artCity,i.artPlace].filter(Boolean).join(' · '))}</span>`:''}${i.notes?`<p>${esc(i.notes)}</p>`:''}${i.link?`<a href="${esc(i.link)}" target="_blank" rel="noopener">Web / entradas ↗</a>`:''}${actions(i)}</div></article>`).join('')}</div>`;return;
  }
  list.innerHTML=`<div class="culture-film-list">${items.map(i=>`<article class="culture-film-card">${i.photo?`<img src="${i.photo}" alt="${esc(i.title)}" loading="lazy">`:`<div class="film-placeholder">${esc(i.title)}</div>`}<div class="culture-card-info"><strong>${esc(i.title)}</strong>${i.creator?`<span>${esc(i.creator)}</span>`:''}${i.year?`<small>${esc(i.year)}${i.artPlace?' · '+esc(i.artPlace):''}</small>`:''}${i.notes?`<p>${esc(i.notes)}</p>`:''}${i.link?`<a href="${esc(i.link)}" target="_blank" rel="noopener">Ver dónde / ficha ↗</a>`:''}${actions(i)}</div></article>`).join('')}</div>`;return;
 }
 list.innerHTML=items.length?items.map(i=>`<div class="item">${i.photo?`<img class="item-photo" src="${i.photo}" alt="${esc(i.title)}">`:''}<div class="item-main"><div class="item-title">${esc(i.title)}</div><div class="item-meta">${esc(i.status)}${i.date?' · '+fmt(i.date):''}${i.room?' · '+esc(i.room):''}${i.kind?' · '+esc(i.kind):''}${i.person?' · Para '+esc(i.person):''}${i.location?' · 📍 '+esc(i.location):''}</div>${i.frequency?`<div class="item-meta">Riego cada ${esc(i.frequency)} días${i.lastWatered?' · Último riego '+fmt(i.lastWatered):''}</div>`:''}${i.light?`<div class="item-meta">☀️ ${esc(i.light)}</div>`:''}${i.ingredients?`<div class="recipe-ingredients">${recipeIngredientsForDisplay(i).map(ing=>`<div class="recipe-ingredient">${esc(ing.display)}</div>`).join('')}</div>${i.servings?`<div class="item-meta">${esc(i.currentServings||i.servings)} raciones (original: ${esc(i.servings)})</div>`:''}`:''}${i.creator?`<div class="item-meta">${esc(i.creator)}${i.year?' · '+esc(i.year):''}${i.rating?' · ★ '+esc(i.rating)+'/5':''}${i.artPlace?' · '+esc(i.artPlace):''}</div>`:''}${i.currentPrice?`<div class="item-meta">Precio actual: ${esc(i.currentPrice)} €${i.compare?' · '+esc(i.compare):''}</div>`:''}${i.occasionDate?`<div class="item-meta">${esc(i.occasion||'Ocasión')}: ${fmt(i.occasionDate)}${i.order?' · '+esc(i.order):''}</div>`:''}${i.endDate?`<div class="item-meta">Hasta ${fmt(i.endDate)}</div>`:''}${i.transport?`<div class="item-meta">${esc(i.transport)}</div>`:''}${i.time?`<div class="item-meta">🕒 ${esc(i.time)}${i.duration?' · '+esc(i.duration)+' min':''}</div>`:''}${i.people?`<div class="item-meta">Con ${esc(i.people)}</div>`:''}${i.booking?`<div class="item-meta">${esc(i.booking)}</div>`:''}${i.tripDetails?`<div class="item-meta">${esc(i.tripDetails)}</div>`:''}${i.program?`<div class="item-meta">${esc(i.program)}</div>`:''}${i.price?`<div class="item-meta">Objetivo: ${esc(i.price)} €</div>`:''}${i.purchased?`<div class="tracking-panel"><strong>Seguimiento del pedido · ${esc(i.orderStatus||'Comprado')}</strong>${i.orderStore?`<div class="item-meta">Tienda: ${esc(i.orderStore)}</div>`:''}${i.orderNumber?`<div class="item-meta">Pedido: ${esc(i.orderNumber)}</div>`:''}${i.trackingLink?`<div class="item-meta"><a href="${esc(i.trackingLink)}" target="_blank" rel="noopener">Abrir seguimiento ↗</a></div>`:''}</div>`:''}${i.notes?`<div class="item-meta">${esc(i.notes)}</div>`:''}${i.link?`<div class="item-meta"><a href="${esc(i.link)}" target="_blank" rel="noopener">Abrir enlace ↗</a></div>`:''}${i.steps?`<details><summary>Ver preparación</summary><div class="item-meta">${esc(i.steps)}</div></details>`:''}</div><div class="item-actions">${name==='Plantas'?`<button class="small-action" onclick="waterPlant(${i.id})">He regado</button>`:''}${name==='Recetas'?`<button class="small-action" onclick="editRecipe(${i.id})">Editar receta e ingredientes</button><button class="small-action" onclick="recipeToShopping(${i.id})">Añadir ingredientes a Compras</button>${i.servings?`<button class="small-action" onclick="adjustRecipeServings(${i.id})">Ajustar raciones</button>`:''}`:''}${name==='Wishlist'?`<button class="small-action" onclick="wishlistToGift(${i.id})">Crear regalo</button><button class="small-action" onclick="searchPrices(${i.id},'Wishlist')">Buscar precio</button>`:''}${name==='Hogar'&&i.status==='Cosas fijas que comprar'&&!i.purchased?`<button class="small-action" onclick="markHomePurchased(${i.id})">Ya lo he comprado</button><button class="small-action" onclick="searchPrices(${i.id},'Hogar')">Buscar precio</button>`:''}${name==='Hogar'&&i.status==='Seguimiento de pedidos'?`<button class="small-action" onclick="updateHomeOrder(${i.id})">Actualizar pedido</button><button class="small-action" onclick="editHomeOrderDetails(${i.id})">Datos del pedido</button>`:''}${name==='Regalos'?`<button class="small-action" onclick="searchPrices(${i.id},'Regalos')">Buscar precio</button>`:''}${name==='Planes'&&i.date?`<button class="small-action" onclick="openLinkedEvent(${i.id},'Planes')">Ver calendario</button>`:''}${name==='Estudio'&&i.kind==='Curso'&&i.date?`<button class="small-action" onclick="openLinkedEvent(${i.id},'Estudio')">Ver calendario</button>`:''}<button class="small-action" onclick="cycleExtraStatus('${name}',${i.id},'${section}')">Cambiar estado</button><button class="delete" aria-label="Eliminar" onclick="deleteExtra('${name}',${i.id},'${section}')">×</button></div></div>`).join(''):'<div class="empty-list">Todavía no hay elementos aquí. Puedes añadir el primero arriba.</div>'
}
function editCultureStatus(id){const items=extraItems('Cultura'),item=items.find(x=>x.id===id);if(!item)return;const options=item.kind==='Libro'?['Pendiente','Leído / visto']:item.kind==='Arte'?['Obra de arte','Quiero ver en persona']:item.kind==='Museo'?['Museo','Quiero ver en persona']:['Pendiente','Leído / visto'];const next=prompt('Estado disponible:\n'+options.map((x,i)=>(i+1)+'. '+x).join('\n')+'\n\nEscribe el número:',String(Math.max(1,options.indexOf(item.status)+1)));if(next===null)return;const n=Number(next);if(!Number.isInteger(n)||n<1||n>options.length){alert('No he reconocido ese estado.');return}item.status=options[n-1];saveExtra('Cultura',items);renderExtraModule('Cultura')}
function editCultureDetails(id){const items=extraItems('Cultura'),item=items.find(x=>x.id===id);if(!item)return;const title=prompt('Título',item.title);if(title===null)return;item.title=title.trim()||item.title;const creator=prompt('Autor / artista / director',item.creator||'');if(creator!==null)item.creator=creator;const year=prompt('Año',item.year||'');if(year!==null)item.year=year;const place=prompt('Museo / ubicación / estilo',item.artPlace||'');if(place!==null)item.artPlace=place;const city=prompt('Ciudad (para relacionar con viajes)',item.artCity||'');if(city!==null)item.artCity=city;const link=prompt('Enlace',item.link||'');if(link!==null)item.link=link;const notes=prompt('Notas',item.notes||'');if(notes!==null)item.notes=notes;saveExtra('Cultura',items);renderExtraModule('Cultura')}
function cultureArtToTrip(id){const arts=extraItems('Cultura'),art=arts.find(x=>x.id===id);if(!art)return;const trips=extraItems('Viajes').filter(x=>x.status!=='Viaje realizado');if(!trips.length){if(confirm('No tienes viajes pendientes. ¿Quieres guardar el lugar en una nueva idea de viaje?')){const title=prompt('Nombre del destino',art.artCity||art.artPlace||'Destino cultural');if(!title)return;const trip={id:Date.now(),title,status:'Quiero ir',kind:'Destino',date:'',notes:'Lugar cultural para visitar: '+art.title+(art.creator?' · '+art.creator:'')+(art.link?' · '+art.link:''),location:art.artCity||art.artPlace||'',tripDetails:'Lugar cultural guardado desde Cultura.',created:today()};saveExtra('Viajes',[...extraItems('Viajes'),trip]);alert('He creado una idea de viaje vinculada a '+art.title+'.');return}return}const menu=trips.map((t,i)=>(i+1)+'. '+t.title+(t.date?' · '+fmt(t.date):'')).join('\n');const pick=prompt('¿A qué viaje quieres añadir esta obra o museo?\n'+menu+'\n\nEscribe el número:', '1');if(pick===null)return;const n=Number(pick);if(!Number.isInteger(n)||n<1||n>trips.length){alert('No he reconocido ese viaje.');return}const trip=trips[n-1],line='Lugar cultural: '+art.title+(art.creator?' · '+art.creator:'')+(art.artPlace?' · '+art.artPlace:'')+(art.artCity?' · '+art.artCity:'')+(art.link?' · '+art.link:'');if((trip.cultureLinks||[]).includes(art.id)){alert('Este elemento cultural ya está vinculado a «'+trip.title+'».');return}trip.tripDetails=(trip.tripDetails?trip.tripDetails+'\n':'')+line;trip.cultureLinks=[...(trip.cultureLinks||[]),art.id];saveExtra('Viajes',trips);art.linkedTripId=trip.id;saveExtra('Cultura',arts);alert('Añadido a «'+trip.title+'».');renderExtraModule('Cultura')}

function waterPlant(id){const items=extraItems('Plantas'),p=items.find(x=>x.id===id);if(!p)return;if(window.oihanePlantLogWatering)window.oihanePlantLogWatering(p,today());else{p.lastWatered=today();p.date=nextPlantDate(p);p.status='Bien'}saveExtra('Plantas',items);renderExtraModule('Plantas')}
function nextPlantDate(p){const d=new Date((p.lastWatered||today())+'T12:00:00');d.setDate(d.getDate()+Number(p.frequency||7));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseRecipeIngredient(line){let raw=String(line||'').trim().replace(/^[-•*]\s*/,'');if(!raw)return null;const pipe=raw.match(/^([^|]+)\|\s*(.+)$/);if(pipe){const qtyText=pipe[1].trim(),name=pipe[2].trim(),m=qtyText.match(/^([\d.,/ ]+)\s*(.*)$/);return {quantity:m?m[1].trim():'',unit:m?m[2].trim():'',name,display:(qtyText+' '+name).trim()}}const m=raw.match(/^((?:\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?))\s*(.*)$/);if(!m){const clean=raw.replace(/\s+al gusto\s*$/i,'').trim();return {quantity:'',unit:'',name:clean,display:clean}}let quantity=m[1].replace(/,/g,'.').replace(/\s/g,'').trim(),rest=m[2].trim();const units=/^(kg|g|mg|ml|cl|dl|l|cucharadas?|cucharaditas?|cdas?\.?|cdtas?\.?|tazas?|vasos?|latas?|ramas?|dientes?|rebanadas?|pizcas?|puñados?|hojas?|lonchas?|unidades?)\b\s*(?:de\s+)?(.*)$/i;const um=rest.match(units);let unit='',name=rest;if(um&&um[2].trim()){unit=um[1];name=um[2].trim()}else if(um&&!um[2].trim()){name=rest}return {quantity,unit,name,display:[quantity,unit,name].filter(Boolean).join(' ')}}
function parseRecipeIngredients(text){return String(text||'').split(/\r?\n|;|,\s+/).map(parseRecipeIngredient).filter(x=>x&&x.name.trim())}
function recipeIngredientsForDisplay(recipe){const items=parseRecipeIngredients(recipe.ingredients);const base=Number(recipe.servings)||1,current=Number(recipe.currentServings||recipe.servings)||base,ratio=current/base;return items.map(x=>{let quantity=x.quantity;if(quantity){let n;if(quantity.includes('/')){const parts=quantity.split('/');n=Number(parts[0])/Number(parts[1])}else n=Number(quantity);if(Number.isFinite(n)){const scaled=n*ratio;quantity=Number.isInteger(scaled)?String(scaled):String(Math.round(scaled*100)/100)}}return {...x,display:[quantity,x.unit,x.name].filter(Boolean).join(' ')}})}
function adjustRecipeServings(id){const items=extraItems('Recetas'),recipe=items.find(x=>x.id===id);if(!recipe)return;const next=prompt('¿Para cuántas personas quieres calcular esta receta?',String(recipe.currentServings||recipe.servings||2));if(next===null)return;const count=Number(next);if(!Number.isFinite(count)||count<1||count>100){alert('Introduce un número de raciones entre 1 y 100.');return}recipe.currentServings=String(count);saveExtra('Recetas',items);renderExtraModule('Recetas')}
/* recipeToShopping: definición integrada en su implementación definitiva. */
function cycleExtraStatus(name,id,section){const c=extraConfig[name],items=extraItems(name),item=items.find(x=>x.id===id);if(!item)return;if(name==='Hogar'&&item.status==='Seguimiento de pedidos'){updateHomeOrder(id);return}const order=name==='Wishlist'?['Idea','Buscando','Elegido','Comprado']:name==='Regalos'?['Idea','Buscando','Elegido','Comprado','Pedido','En camino','Entregado']:name==='Plantas'?['Bien','En observación','Necesita atención']:name==='Recetas'?['Esta semana','Quiero probar','Quiero aprender','Habitual','Cocinada']:name==='Viajes'?['Quiero ir','Próximamente','Viaje realizado']:name==='Planes'?['Sin fecha','Próximo','Realizado']:name==='Cultura'?['Pendiente','Leído / visto','Quiero ver en persona']:name==='Hogar'?['Cosas fijas que comprar','Inspiración','Opciones']:c.status;let idx=order.indexOf(item.status);item.status=order[(idx+1+order.length)%order.length]||order[0];saveExtra(name,items);renderExtraModule(name)}
function deleteExtra(name,id,section){if(!confirm('¿Quieres eliminar este elemento?'))return;saveExtra(name,extraItems(name).filter(i=>i.id!==id));if(name==='Planes'||name==='Estudio'){const linked=events.filter(e=>e.sourceModule===name&&e.sourceId===id);if(linked.length&&confirm('Este elemento tiene un evento enlazado. ¿Quieres eliminar también ese evento del calendario?')){events=events.filter(e=>!(e.sourceModule===name&&e.sourceId===id));save()}}renderExtraModule(name)}


// --- Conexiones entre módulos, integraciones progresivas y seguridad de datos ---
function upsertLinkedEvent(moduleName,item){
 if(moduleName==='Estudio'&&item.kind==='Curso')return;
 const existing=events.find(ev=>ev.sourceModule===moduleName&&ev.sourceId===item.id);
 const ev={id:existing?.id||Date.now()+Math.floor(Math.random()*10000),title:item.title,date:item.date,time:item.time||'',duration:item.duration||'60',location:item.location||item.place||'',people:item.people||'',notes:(moduleName==='Estudio'?'Curso':'Plan')+' enlazado desde '+moduleName,sourceModule:moduleName,sourceId:item.id,notify:!!item.notify,notifyLead:Math.max(0,Number(item.notifyLead)||0)};
 if(existing)Object.assign(existing,ev);else events.push(ev);save();
}
function openLinkedEvent(id,moduleName){const ev=events.find(e=>e.sourceModule===moduleName&&e.sourceId===id);if(!ev){alert('Todavía no hay un evento enlazado. Abre el elemento y vuelve a guardarlo con fecha para crearlo.');return}renderCalendar();calendarView='all';const list=document.querySelector('#calendarList');if(list){list.innerHTML=calendarRows();const node=[...list.querySelectorAll('.item')].find(n=>n.textContent.includes(ev.title));if(node)node.scrollIntoView({behavior:'smooth',block:'center'})}}
function markHomePurchased(id){const items=extraItems('Hogar'),item=items.find(x=>x.id===id);if(!item)return;item.purchased=true;item.status='Seguimiento de pedidos';item.orderStatus='Comprado';item.orderStore=item.orderStore||'';item.orderNumber=item.orderNumber||'';item.trackingLink=item.trackingLink||'';saveExtra('Hogar',items);renderExtraModule('Hogar');const idx=extraConfig.Hogar.sections.indexOf('SEGUIMIENTO DE PEDIDOS');const body=document.querySelector('#extraList_'+idx);if(body)body.classList.remove('collapsed');const chevron=document.querySelector('#sectionChevron'+idx);if(chevron)chevron.textContent='⌃';setTimeout(()=>document.querySelector('#sectionCard'+idx)?.scrollIntoView({behavior:'smooth',block:'start'}),80)}
function updateHomeOrder(id){const items=extraItems('Hogar'),item=items.find(x=>x.id===id);if(!item)return;const stages=['Comprado','Pedido realizado','En preparación','En tránsito','Entregado'];let i=stages.indexOf(item.orderStatus||'Comprado');item.orderStatus=stages[(i+1)%stages.length];if(item.orderStatus==='Entregado'){item.deliveredAt=today();item.notes=(item.notes?item.notes+'\n':'')+'Entregado el '+today()}saveExtra('Hogar',items);renderExtraModule('Hogar');const idx=extraConfig.Hogar.sections.indexOf('SEGUIMIENTO DE PEDIDOS');document.querySelector('#extraList_'+idx)?.classList.remove('collapsed')}
function editHomeOrderDetails(id){const items=extraItems('Hogar'),item=items.find(x=>x.id===id);if(!item)return;const storeName=prompt('Tienda donde lo compraste:',item.orderStore||'');if(storeName===null)return;const orderNumber=prompt('Número de pedido (opcional):',item.orderNumber||'');if(orderNumber===null)return;const trackingLink=prompt('Enlace de seguimiento (opcional):',item.trackingLink||'');if(trackingLink===null)return;item.orderStore=storeName.trim();item.orderNumber=orderNumber.trim();item.trackingLink=trackingLink.trim();saveExtra('Hogar',items);renderExtraModule('Hogar');const idx=extraConfig.Hogar.sections.indexOf('SEGUIMIENTO DE PEDIDOS');document.querySelector('#extraList_'+idx)?.classList.remove('collapsed')}
function wishlistToGift(id){const items=extraItems('Wishlist'),w=items.find(x=>x.id===id);if(!w)return;const recipient=prompt('¿Para quién es el regalo?');if(recipient===null)return;const gifts=extraItems('Regalos');gifts.push({id:Date.now(),title:w.title,status:'Idea',date:'',notes:w.notes||'',person:recipient.trim(),occasion:'Otro',occasionDate:'',order:'',link:w.link||'',price:w.price||'',currentPrice:w.currentPrice||'',created:today(),fromWishlistId:w.id,private:recipient.trim().toLowerCase()==='rubén'});saveExtra('Regalos',gifts);alert('Idea copiada a Regalos. La Wishlist original se conserva.');openModule('Regalos')}
function searchPrices(id,moduleName){const item=extraItems(moduleName).find(x=>String(x.id)===String(id));if(!item)return;const defaultQuery=String(item.title||'').replace(/[“”‘’]/g,'').replace(/\s+/g,' ').trim();if(moduleName==='Wishlist'){if(defaultQuery)window.open('https://www.google.com/search?tbm=shop&q='+encodeURIComponent(defaultQuery),'_blank','noopener,noreferrer');return}const raw=prompt('Buscar precio de «'+item.title+'»\n\nPuedes acortar o corregir el nombre para obtener resultados más precisos (marca y modelo suelen ayudar):',''+defaultQuery);if(raw===null)return;const searchText=raw.replace(/[“”‘’]/g,'').replace(/\s+/g,' ').trim();if(!searchText){alert('Escribe el nombre o modelo que quieres buscar.');return}const q=encodeURIComponent(searchText);const choice=prompt('¿Dónde quieres buscar «'+searchText+'»?\n1 = Google Shopping\n2 = Idealo\n3 = Idealo + resultados de Google dentro de Idealo\nCancelar = volver','2');if(choice===null)return;const urls=[];if(['1','3'].includes(choice))urls.push('https://www.google.com/search?tbm=shop&q='+q);if(['2','3'].includes(choice)){urls.push('https://www.idealo.es/precios/MainSearchProductCategory.html?q='+q);if(choice==='3')urls.push('https://www.google.com/search?q='+encodeURIComponent('site:idealo.es '+searchText))}if(!urls.length){alert('Elige 1, 2 o 3.');return}urls.forEach(url=>window.open(url,'_blank','noopener,noreferrer'));}
function startVoiceInput(){const input=document.querySelector('#ask');const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('Este navegador no ofrece dictado de voz integrado. En iPhone, puedes usar el micrófono del teclado de iOS.');input?.focus();return}try{const rec=new SR();rec.lang='es-ES';rec.interimResults=false;rec.maxAlternatives=1;rec.onresult=e=>{if(input){input.value=e.results[0][0].transcript;input.focus();let box=document.querySelector('#assistantResult');if(!box){box=document.createElement('div');box.id='assistantResult';box.className='assistant-response';document.querySelector('.assistant')?.after(box)}box.textContent='He entendido: «'+input.value+'». Revísalo y pulsa enviar para ejecutar la orden.'}};rec.onerror=()=>alert('No se pudo completar el dictado. Comprueba el permiso de micrófono y vuelve a intentarlo.');rec.start()}catch(e){alert('No se ha podido iniciar el dictado. Puedes usar el micrófono del teclado.')}}
function requestNotificationPermission(){if(!('Notification'in window)){alert('Este navegador no admite notificaciones web. Oihane puede mostrar avisos dentro de la app mientras esté abierta.');return}Notification.requestPermission().then(p=>{const n=document.querySelector('#notifStatus');if(n)n.textContent=p==='granted'?'Permiso concedido. Los avisos se revisan mientras Oihane está abierta; iOS puede suspenderlos al cerrar o dejar la app en segundo plano.':'Permiso no concedido. Los avisos se mostrarán dentro de Oihane mientras esté abierta.';scheduleForegroundReminderCheck();if(p==='granted')testNotification()}).catch(()=>alert('No se ha podido solicitar permiso de notificaciones.'))}
let reminderTimer=null;let shownReminderKeys=new Set();try{shownReminderKeys=new Set(JSON.parse(localStorage.getItem('oihane_shown_reminders')||'[]'))}catch{}
function showInAppReminder(title,body,key){if(localStorage.getItem('oihane_push_registered')==='1'&&syncConfig().access)return;if(shownReminderKeys.has(key))return;shownReminderKeys.add(key);try{localStorage.setItem('oihane_shown_reminders',JSON.stringify([...shownReminderKeys].slice(-250)))}catch{}if('Notification'in window&&Notification.permission==='granted'){try{new Notification(title,{body,tag:key});return}catch{}}const app=document.querySelector('#app');if(!app)return;const toast=document.createElement('div');toast.className='oihane-toast';toast.innerHTML='<button type="button" aria-label="Cerrar aviso" onclick="this.parentElement.remove()">×</button><strong>'+esc(title)+'</strong><span>'+esc(body)+'</span>';app.appendChild(toast)}
function scheduleForegroundReminderCheck(){const check=()=>{if(document.visibilityState==='hidden')return;const now=new Date(),date=today(),nowM=now.getHours()*60+now.getMinutes();events.filter(e=>e.date===date&&e.time&&(e.notify||Number(e.departureMinutes)>0)).forEach(e=>{const parts=e.time.split(':').map(Number),eventM=parts[0]*60+parts[1],lead=Math.max(0,Number(e.departureMinutes)||0),isDeparture=lead>0&&nowM>=eventM-lead&&nowM<eventM,atEvent=!!e.notify&&nowM>=eventM;if(!isDeparture&&!atEvent)return;const kind=isDeparture?'salida':'evento',key='e'+e.id+'-'+e.date+'-'+kind;showInAppReminder(isDeparture?'Oihane · Hora de salir':'Oihane · '+e.title,isDeparture?'Sal para llegar a tiempo: '+e.title+(e.location?' · '+e.location:''):'Evento de hoy'+(e.location?' · '+e.location:''),key)});tasks.filter(t=>t.notify&&!t.done&&t.date&&t.date<=date).forEach(t=>{const key='t'+t.id+'-'+date;showInAppReminder('Oihane · Tarea pendiente',t.title,key)})};check();if(!reminderTimer)reminderTimer=setInterval(check,60000)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleForegroundReminderCheck()});window.addEventListener('focus',scheduleForegroundReminderCheck);window.addEventListener('pagehide',()=>{try{localStorage.setItem('oihane_shown_reminders',JSON.stringify([...shownReminderKeys].slice(-250)))}catch{};writeLocalSnapshot()});function showIntegrationStatus(){const SR=!!(window.SpeechRecognition||window.webkitSpeechRecognition);const notif=('Notification'in window)?Notification.permission:'no disponible';alert('ESTADO DE INTEGRACIONES\n\nDictado de voz del navegador: '+(SR?'disponible (depende del navegador)':'no disponible; usa el micrófono del teclado')+'\nPermiso de notificaciones: '+notif+'\nAvisos: solo mientras Oihane esté abierta y activa; para avisos con la app cerrada falta configurar Web Push y un emisor en servidor.\nCalendario: importación/exportación .ics con deduplicación; no hay sincronización bidireccional automática con Apple Calendar.\nSincronización entre dispositivos: '+(syncConfig().access?'sesión Supabase activa':'no conectada')+'.\nCopia de recuperación: instantáneas locales y exportación JSON.\n\nLa sincronización solo envía datos a Supabase si tú configuras y autorizas esa conexión.')}
/* Oihane 5.30.8: compatibilidad iCalendar (Europe/Madrid) sin modificar datos existentes. */
const OIHANE_ICS_TIMEZONE = 'Europe/Madrid';
function escapeICS(s){return String(s??'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function oihaneUnescapeICS(s){return String(s??'').replace(/\\([nN\\;,])/g,(_,c)=>c==='n'||c==='N'?'\n':c);}
function oihaneFoldICS(line){
  const encoder=new TextEncoder();let result='',part='',length=0;
  for(const cp of String(line)){
    const bytes=encoder.encode(cp).length;
    if(length+bytes>75 && part){result+=(result?'\r\n ':'')+part;part=cp;length=1+bytes;}
    else {part+=cp;length+=bytes;}
  }
  return result+(result?'\r\n ':'')+part;
}
function oihaneZoneParts(date,zone=OIHANE_ICS_TIMEZONE){
  const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  const obj={};for(const part of fmt.formatToParts(date)){if(part.type!=='literal')obj[part.type]=part.value;}
  return obj;
}
function oihaneZoneToUTC(date,time,zone=OIHANE_ICS_TIMEZONE){
  if(!/^\d{4}-\d\d-\d\d$/.test(String(date))||!/^\d\d:\d\d(?::\d\d)?$/.test(String(time)))throw Error('Fecha u hora inválida');
  const [year,month,day]=date.split('-').map(Number);const [hour,minute,second=0]=time.split(':').map(Number);
  if(hour>23||minute>59||second>59||month<1||month>12||day<1||day>31)throw Error('Fecha u hora fuera de rango');
  const wanted=Date.UTC(year,month-1,day,hour,minute,second);let epoch=wanted;
  for(let i=0;i<4;i++){
    const p=oihaneZoneParts(new Date(epoch),zone);
    const seen=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);
    const diff=wanted-seen;
    epoch+=diff;
    if(!diff)break;
  }
  const p=oihaneZoneParts(new Date(epoch),zone);
  if(`${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`!==`${date} ${time.slice(0,5)}`)throw Error('La hora no existe en '+zone+' (cambio horario)');
  return new Date(epoch);
}
function oihaneICSStamp(date){return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');}
function oihanePlusDays(date,days){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10).replace(/-/g,'');}
function oihaneAlarmMinutes(s){const m=String(s||'').trim().match(/^-P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i);if(!m)return null;return Math.round((Number(m[1]||0)*10080)+(Number(m[2]||0)*1440)+(Number(m[3]||0)*60)+Number(m[4]||0)+(Number(m[5]||0)/60));}
function oihaneICSLines(raw){return String(raw).replace(/\r\n?/g,'\n').replace(/\n[ \t]/g,'').split('\n');}
function oihaneICSProperty(line){const i=line.indexOf(':');if(i===-1)return null;const lhs=line.slice(0,i).split(';');const key=lhs.shift().trim().toUpperCase();const params={};for(const x of lhs){const pos=x.indexOf('=');if(pos>0)params[x.slice(0,pos).toUpperCase()]=x.slice(pos+1).replace(/^"|"$/g,'');}return {key,params,value:line.slice(i+1)};}
function oihaneDecodeDate(prop){
  if(!prop)return null;const val=prop.value.trim();
  if(prop.params.VALUE==='DATE'||/^\d{8}$/.test(val)){
    if(!/^\d{8}$/.test(val))return null;
    return {date:`${val.slice(0,4)}-${val.slice(4,6)}-${val.slice(6,8)}`,time:''};
  }
  const m=val.match(/^(\d{8})T(\d{2})(\d{2})(\d{2})?(Z)?$/i);if(!m)return null;
  const date=`${m[1].slice(0,4)}-${m[1].slice(4,6)}-${m[1].slice(6,8)}`,time=`${m[2]}:${m[3]}`,seconds=m[4]||'00';
  const tzid=String(prop.params.TZID||'').replace(/^\//,'').replace(/^.*\/(Europe\/|America\/|Asia\/|Africa\/|Australia\/|Pacific\/)/,'$1');
  try{
    if(!m[5]&&!tzid)return {date,time}; // RFC 5545 floating time is local wall time
    const instant=m[5]?new Date(`${date}T${time}:${seconds}Z`):oihaneZoneToUTC(date,`${time}:${seconds}`,tzid);
    if(Number.isNaN(instant.getTime()))return null;
    const p=oihaneZoneParts(instant);
    return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`};
  }catch{return null;}
}
function oihaneReadICS(raw){
  const items=[],errors=[];let current=null,insideAlarm=false,alarm=null;
  const push=()=>{
    if(!current)return;
    if(current.STATUS?.[0]?.value.toUpperCase()==='CANCELLED')return;
    if(current.RRULE||current['RECURRENCE-ID']){errors.push('Se omitió un evento recurrente: la repetición requiere tratamiento separado.');return;}
    const start=oihaneDecodeDate(current.DTSTART?.[0]);if(!start){errors.push('Evento omitido por fecha u horario desconocido.');return;}
    const end=oihaneDecodeDate(current.DTEND?.[0]);
    let duration=60;
    if(start.time&&end&&end.time){try{
      const e=oihaneZoneToUTC(end.date,end.time).getTime()-oihaneZoneToUTC(start.date,start.time).getTime();
      if(e>0)duration=Math.round(e/60000);
    }catch{}}
    const alarms=current._alarms||[];
    const lead=alarms.map(x=>oihaneAlarmMinutes(x.TRIGGER?.[0]?.value)).find(x=>x!==null);
    items.push({title:oihaneUnescapeICS(current.SUMMARY?.[0]?.value||'Evento importado'),date:start.date,time:start.time,duration:start.time?String(duration):'',location:oihaneUnescapeICS(current.LOCATION?.[0]?.value||''),notes:oihaneUnescapeICS(current.DESCRIPTION?.[0]?.value||''),icsUid:oihaneUnescapeICS(current.UID?.[0]?.value||''),notify:start.time&&lead!==undefined,notifyLead:lead??0,sourceModule:'ICS'});
  };
  for(const line of oihaneICSLines(raw)){
    if(line==='BEGIN:VEVENT'){current={_alarms:[]};insideAlarm=false;continue;}
    if(line==='END:VEVENT'){push();current=null;insideAlarm=false;continue;}
    if(!current)continue;
    if(line==='BEGIN:VALARM'){alarm={};insideAlarm=true;continue;}
    if(line==='END:VALARM'){if(alarm)current._alarms.push(alarm);alarm=null;insideAlarm=false;continue;}
    const p=oihaneICSProperty(line);if(!p)continue;
    const target=insideAlarm?alarm:current;if(!target)continue;
    (target[p.key]??=[]).push(p);
  }
  return {items,errors};
}
function exportCalendarICS(){
  if(!events.length){alert('No hay eventos que exportar todavía.');return;}
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Oihane//Calendario//ES','CALSCALE:GREGORIAN','X-WR-CALNAME:Oihane'];
  const stamp=oihaneICSStamp(new Date());let exported=0,skipped=0;
  for(const e of events){
    if(!e?.date || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)){skipped++;continue;}
    const day=e.date.replace(/-/g,'');let from,to;
    try{
      if(e.time){
        const d=oihaneZoneToUTC(e.date,String(e.time).slice(0,5));
        const mins=Number(e.duration);
        const duration=Number.isFinite(mins)&&mins>0?mins:60;
        from='DTSTART:'+oihaneICSStamp(d);
        to='DTEND:'+oihaneICSStamp(new Date(d.getTime()+duration*60000));
      }else{
        from='DTSTART;VALUE=DATE:'+day;
        to='DTEND;VALUE=DATE:'+oihanePlusDays(e.date,1);
      }
    }catch{skipped++;continue;}
    const uid=String(e.icsUid||('oihane-'+e.id+'@local'));
    lines.push('BEGIN:VEVENT','UID:'+escapeICS(uid),'DTSTAMP:'+stamp,from,to,'SUMMARY:'+escapeICS(e.title||'Sin título'));
    if(e.location)lines.push('LOCATION:'+escapeICS(e.location));
    if(e.notes)lines.push('DESCRIPTION:'+escapeICS(e.notes));
    if(e.notify&&e.time){
      const lead=Math.max(0,Number(e.notifyLead)||0);
      lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escapeICS(e.title||'Recordatorio de Oihane'),'TRIGGER:'+(lead>0?'-PT'+lead+'M':'PT0M'),'END:VALARM');
    }
    const departure=Math.max(0,Number(e.departureMinutes)||0);
    if(e.time&&departure>0&&!(e.notify&&departure===(Number(e.notifyLead)||0)))
      lines.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escapeICS('Hora de salir: '+(e.title||'Evento')),'TRIGGER:-PT'+departure+'M','END:VALARM');
    lines.push('END:VEVENT');exported++;
  }
  lines.push('END:VCALENDAR');
  const content=lines.map(oihaneFoldICS).join('\r\n')+'\r\n';
  const blob=new Blob([content],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='oihane-calendario-'+today()+'.ics';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  if(skipped)alert(`Se exportaron ${exported} eventos y se omitieron ${skipped} por fecha/hora inválida. No se modificó ningún evento.`);
}
function openCalendarImport(){
  const input=document.createElement('input');input.type='file';input.accept='.ics,text/calendar';
  input.onchange=async()=>{
    const file=input.files?.[0];if(!file)return;
    try{
      if(file.size>3_000_000){alert('El archivo .ics supera 3 MB. Importa un calendario más pequeño.');return;}
      const {items,errors}=oihaneReadICS(await file.text());let imported=0,duplicates=0;
      const normalize=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').replace(/\s+/g,' ').trim();
      for(const item of items){
        const key=normalize(item.title)+'|'+item.date+'|'+(item.time||'');
        const exists=events.some(e=>(item.icsUid&&e.icsUid===item.icsUid)||(normalize(e.title)+'|'+e.date+'|'+(e.time||'')===key));
        if(exists){duplicates++;continue;}
        events.push({...item,id:(globalThis.crypto?.randomUUID?.()||('ics-'+Date.now()+'-'+imported))});imported++;
      }
      if(imported)save();
      alert(`Importados: ${imported}. Duplicados omitidos: ${duplicates}. Eventos incompatibles omitidos: ${errors.length}.`+(errors.length?'\nAlgunas recurrencias o zonas horarias no están admitidas; no se inventaron fechas.':''));
      if(typeof renderCalendar==='function')renderCalendar();
    }catch(error){console.error('ICS import error',error);alert('No se ha podido leer el archivo .ics. No se ha modificado el calendario.');}
  };
  input.click();
}

// ---- Protección local y sincronización opcional ----
let snapshotTimer=null,cloudSyncTimer=null,syncInProgress=false;
function allOihaneData(){const out={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(oihaneSyncRuntime.isDataKey(k)){try{out[k]=JSON.parse(localStorage.getItem(k))}catch{out[k]=localStorage.getItem(k)}}}return out}
function openRecoveryDB(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window)){reject(new Error('IndexedDB no disponible'));return}const req=indexedDB.open('OihaneRecovery',2);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('snapshots'))db.createObjectStore('snapshots',{keyPath:'id',autoIncrement:true});if(!db.objectStoreNames.contains('syncBases'))db.createObjectStore('syncBases')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
// La base de comparación de Supabase puede duplicar TODAS las fotos. Se almacena
// fuera de localStorage, en el IndexedDB ya usado por las copias de recuperación.
// Cada cuenta utiliza su propia clave: nunca mezclar instantáneas entre usuarios.
async function oihaneSyncBaseGet(){
 const legacy=localStorage.getItem('oihane_sync_base');
 if(legacy){try{return JSON.parse(legacy)}catch(_){}}
 const uid=localStorage.getItem('oihane_sync_user')||localStorage.getItem('oihaneAccountOwnerV1');
 if(!uid)return null;
 let db;
 try{db=await openRecoveryDB();const value=await new Promise((resolve,reject)=>{const req=db.transaction('syncBases','readonly').objectStore('syncBases').get(uid);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});if(!value&&localStorage.getItem('oihane_sync_base_indexed_v1')===uid)throw Error('No se puede leer la base de sincronización; se cancela para proteger los datos.');return value}
 catch(e){if(localStorage.getItem('oihane_sync_base_indexed_v1')===uid)throw e;console.warn('Oihane: copia de sincronización no disponible en IndexedDB',e?.name);return null}
 finally{db?.close()}
}
async function oihaneSyncBasePut(data){
 const uid=localStorage.getItem('oihane_sync_user')||localStorage.getItem('oihaneAccountOwnerV1');
 if(!uid)throw Error('Cuenta sin identificar');
 const db=await openRecoveryDB();
 try{await new Promise((resolve,reject)=>{const tx=db.transaction('syncBases','readwrite');tx.objectStore('syncBases').put(data,uid);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Error IndexedDB'));tx.onabort=()=>reject(tx.error||Error('Transacción cancelada'))})}
 finally{db.close()}
}
async function oihaneSyncBaseMigrate(){
 const raw=localStorage.getItem('oihane_sync_base');
 if(!raw)return;
 const uid=localStorage.getItem('oihane_sync_user')||localStorage.getItem('oihaneAccountOwnerV1');
 if(!uid)return; // Sin propietario: no tocar una base posiblemente ajena.
 let parsed;try{parsed=JSON.parse(raw)}catch(_){return}
 await oihaneSyncBasePut(parsed);
 const saved=await oihaneSyncBaseReadDB(uid);
 // Solo liberar los bytes duplicados después de confirmar la escritura exacta.
 if(JSON.stringify(saved)===raw&&localStorage.getItem('oihane_sync_base')===raw){localStorage.removeItem('oihane_sync_base');try{localStorage.setItem('oihane_sync_base_indexed_v1',uid)}catch(_){}}
}
async function oihaneSyncBaseReadDB(uid){
 let db;
 try{db=await openRecoveryDB();return await new Promise((resolve,reject)=>{const req=db.transaction('syncBases','readonly').objectStore('syncBases').get(uid);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}
 finally{db?.close()}
}
async function oihaneSyncBaseSave(data){
 try{await oihaneSyncBasePut(data);const uid=localStorage.getItem('oihane_sync_user')||localStorage.getItem('oihaneAccountOwnerV1');localStorage.removeItem('oihane_sync_base');try{localStorage.setItem('oihane_sync_base_indexed_v1',uid)}catch(_){}return true}
 catch(e){ // No borrar datos ni dejar incompleta la sincronización si falla IndexedDB.
  console.warn('Oihane: no se pudo actualizar copia de sincronización en IndexedDB',e?.name);
  try{localStorage.setItem('oihane_sync_base',JSON.stringify(data))}catch(_){}
  return false;
 }
}
setTimeout(()=>{oihaneSyncBaseMigrate().catch(e=>console.warn('Oihane: migración de copia pendiente',e?.name))},500);

async function writeLocalSnapshot(){try{const db=await openRecoveryDB(),data={createdAt:new Date().toISOString(),data:allOihaneData()};await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite'),st=tx.objectStore('snapshots');st.add(data);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite'),st=tx.objectStore('snapshots'),req=st.getAll();req.onsuccess=()=>{const rows=req.result.sort((a,b)=>b.id-a.id);rows.slice(5).forEach(x=>st.delete(x.id))};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();const el=document.querySelector('#localBackupStatus');if(el)el.textContent='Última instantánea de recuperación: '+new Date(data.createdAt).toLocaleString('es-ES')+' · guardada en este dispositivo.';const pill=document.querySelector('#backupStatusPill');if(pill)pill.textContent='Copia local activa';return true}catch(e){const el=document.querySelector('#localBackupStatus');if(el)el.textContent='No se pudo crear una instantánea local en este navegador. Descarga una copia JSON.';return false}}
function queueLocalSnapshot(){clearTimeout(snapshotTimer);snapshotTimer=setTimeout(()=>writeLocalSnapshot(),500)}
async function recoverLocalSnapshot(){try{const db=await openRecoveryDB(),rows=await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readonly'),r=tx.objectStore('snapshots').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();if(!rows.length){alert('Todavía no hay una copia de recuperación local.');return}const snap=rows.sort((a,b)=>b.id-a.id)[0];if(!confirm('Recuperar la instantánea del '+new Date(snap.createdAt).toLocaleString('es-ES')+' fusionará elementos que falten; no borrará los datos actuales. ¿Continuar?'))return;mergeDataIntoLocal(snap.data);tasks=readStore('oihane_tasks');products=readStore('oihane_products').map(p=>['Embutidos','Embutido'].includes(p.category)?{...p,category:'Quesos y embutidos'}:p);events=readStore('oihane_events');save();home();alert('Recuperación completada.')}catch(e){alert('No se ha podido leer la copia local en este navegador.')}}
function mergeDataIntoLocal(incoming){return restoreModuleDataAtomically(Object.entries(incoming||{}),'2')}
// Parámetros públicos del proyecto Oihane: integrados en todas las instalaciones.
// Esto NO identifica al usuario ni sustituye a la autenticación: Supabase aplica RLS.
const OIHANE_SUPABASE_DEFAULT_URL='https://xdlvwwmccfpxvxpzmxaw.supabase.co';
const OIHANE_SUPABASE_PUBLISHABLE_KEY='sb_publishable_LaxfReez2GKX4TdII6sauA_2MRdtXOh';
function saveSyncConfig(){const url=document.querySelector('#syncUrl')?.value.trim().replace(/\/$/,'')||'',key=document.querySelector('#syncKey')?.value.trim()||'';if(!/^https:\/\/.+\.supabase\.co$/.test(url)||!key){alert('Introduce la URL https://…supabase.co y la clave pública del proyecto.');return}localStorage.setItem('oihane_sync_url',url);localStorage.setItem('oihane_sync_key',key);const st=document.querySelector('#cloudStatus');if(st)st.textContent='Configuración guardada en este dispositivo. Inicia sesión para sincronizar.';return true}
function syncConfig(){return {url:localStorage.getItem('oihane_sync_url')||OIHANE_SUPABASE_DEFAULT_URL,key:localStorage.getItem('oihane_sync_key')||OIHANE_SUPABASE_PUBLISHABLE_KEY,access:localStorage.getItem('oihane_sync_access')||'',refresh:localStorage.getItem('oihane_sync_refresh')||'',expires:Number(localStorage.getItem('oihane_sync_expires')||0)}}
async function cloudFetch(path,options={}){
 const protectedData=String(path).startsWith('/rest/v1/')||String(path).startsWith('/functions/v1/');
 const cfg=syncConfig();
 if(!cfg.url||!cfg.key)throw Error('Falta configuracion de Supabase.');
 if(protectedData&&options.auth!==false){
  if(!localStorage.getItem('oihane_sync_user'))throw Error('Sesion cerrada; datos conservados en el dispositivo.');
  await refreshCloudToken();
  if(!syncConfig().access)throw Error('Sesion no autenticada. Sincronizacion suspendida.');
 }
 async function send(){
  const cur=syncConfig(),headers={'apikey':cur.key,'Content-Type':'application/json',...(options.headers||{})};
  if(options.auth!==false&&cur.access)headers.Authorization='Bearer '+cur.access;
  if(protectedData&&options.auth!==false&&!headers.Authorization)throw Error('Autorizacion ausente: no se permite una consulta anonima.');
  // Consultas ordinarias: 20 s. Copias grandes: plazo mayor solicitado por el consumidor.
  const requested=Number(options.timeoutMs);
  const timeoutMs=Number.isFinite(requested)&&requested>0?Math.max(5000,Math.min(requested,150000)):20000;
  const {timeoutMs:_ignored,...fetchOptions}=options;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
   let response;
   try{
    response=await fetch(cur.url+path,{...fetchOptions,headers,signal:options.signal||controller.signal,cache:'no-store'});
   }catch(error){
    if(controller.signal.aborted)throw Error('La conexión con Supabase superó '+Math.round(timeoutMs/1000)+' segundos. No se ha cambiado ningún dato.');
    if(error?.name==='AbortError'||/aborted|abortada|abort/i.test(String(error?.message||error)))
     throw Error('Se interrumpió la conexión con Supabase. Comprueba la red y vuelve a intentarlo.');
    throw error;
   }
   const data=await response.json().catch(()=>({}));
   return {response,data};
  }finally{clearTimeout(timer)}
 }
 let result=await send();
 if(protectedData&&options.auth!==false&&result.response.status===401&&syncConfig().refresh){
  await refreshCloudToken(true);
  result=await send();
 }
 if(!result.response.ok){
  const d=result.data;
  const reason=d.msg||d.message||d.error_description||d.error||('HTTP '+result.response.status);
  if(result.response.status===401)throw Error('Sesion caducada. Vuelve a iniciar sesion sin borrar los datos. '+reason);
  throw Error(reason);
 }
 return result.data;
}
const OIHANE_VAPID_PUBLIC_KEY='BLQc8lARYmihRlyIbZ8qSXkm49DItK_dDnkTp78h2rEpYnqL3xS_WHKqZb-SvTCv28AX9FmucsLqe5lNAFFv2bw';
function vapidKeyBytes(value){const pad='='.repeat((4-value.length%4)%4);const raw=atob((value+pad).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0))}
function bytesToBase64(value){let binary='';for(const b of value)binary+=String.fromCharCode(b);return btoa(binary)}
async function enablePushNotifications(){
 const status=document.querySelector('#notifStatus');
 try{
  const c=syncConfig();if(!c.url||!c.key||!c.access)throw new Error('Inicia sesión en Supabase antes de activar las notificaciones push.');
  if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window))throw new Error('Este navegador no admite Web Push. En iPhone, instala Oihane en la pantalla de inicio y ábrela desde allí.');
  if(!window.isSecureContext)throw new Error('Las notificaciones push requieren una conexión segura HTTPS.');
  if(Notification.permission!=='granted'){const permission=await Notification.requestPermission();if(permission!=='granted')throw new Error('No se concedió permiso para las notificaciones.')}
  const registration=await navigator.serviceWorker.ready;
  let subscription=await registration.pushManager.getSubscription();
  if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:vapidKeyBytes(OIHANE_VAPID_PUBLIC_KEY)});
  const user=await cloudFetch('/auth/v1/user',{method:'GET'});if(!user?.id)throw new Error('No se ha podido verificar la sesión de Supabase. Inicia sesión de nuevo.');
  const raw=subscription.toJSON();
  const payload={user_id:user.id,endpoint:subscription.endpoint,p256dh:raw.keys?.p256dh||'',auth:raw.keys?.auth||'',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Madrid',created_at:new Date().toISOString()};
  if(!payload.p256dh||!payload.auth)throw new Error('El navegador no ha devuelto las claves de la suscripción push.');
  await cloudFetch('/rest/v1/oihane_push_subscriptions?on_conflict=user_id,endpoint',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(payload)});
  localStorage.setItem('oihane_push_registered','1');
  if(status)status.textContent='Notificaciones push activadas en este dispositivo. Pulsa «Probar notificación push» para comprobar el envío del servidor.';
 }catch(e){if(status)status.textContent='No se han podido activar las notificaciones push: '+(e?.message||e)+'. La sincronización de datos no se ha modificado.'}
}
async function testPushNotification(){
 const status=document.querySelector('#notifStatus');
 const version='5.44.0';
 const route='/functions/v1/DISPATCH-PUSH';
 let endpoint='';
 try{
  await refreshCloudToken();
  const c=syncConfig();
  if(!c.url||!c.key||!c.access)throw new Error('Inicia sesión en Supabase para realizar la prueba.');
  endpoint=c.url.replace(/\/$/,'')+route;
  if(status)status.textContent='Oihane '+version+' · Probando '+route+'…';
  const response=await fetch(endpoint,{
   method:'POST',
   headers:{'Content-Type':'application/json','apikey':c.key,'Authorization':'Bearer '+c.access},
   body:JSON.stringify({test:true}),
   cache:'no-store'
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok){
   const code=result.code||'';
   const detail=result.message||result.msg||result.error||result.error_description||'';
   if(status)status.textContent='Oihane '+version+' · Error HTTP '+response.status+(code?' ('+code+')':'')+(detail?' · '+detail:'')+' · Ruta utilizada: '+endpoint;
   return;
  }
  const sent=Number(result.sent||0);
  if(status)status.textContent='Oihane '+version+' · HTTP 200 · '+(sent>0?'Prueba enviada a '+sent+' suscripción(es). Comprueba tu iPhone.':'La función responde, pero no se ha enviado ninguna notificación. Comprueba la suscripción de este dispositivo.');
 }catch(e){
  if(status)status.textContent='Oihane '+version+' · Error de prueba: '+(e?.message||e)+(endpoint?' · Ruta: '+endpoint:'');
 }
}
async function cloudAuth(mode){try{if(!syncConfig().url&&!saveSyncConfig())return;const email=document.querySelector('#syncEmail')?.value.trim(),password=document.querySelector('#syncPassword')?.value;if(!email||!password){alert('Introduce el correo y la contraseña de tu cuenta Supabase.');return}const c=syncConfig(),endpoint=mode==='signup'?'/auth/v1/signup':'/auth/v1/token?grant_type=password';const data=await cloudFetch(endpoint,{method:'POST',auth:false,body:JSON.stringify({email,password})});if(!data.access_token){const st=document.querySelector('#cloudStatus');if(st)st.textContent='Solicitud enviada. Si Supabase requiere confirmar el correo, confírmalo y luego inicia sesión.';return}const intendedUser=String(data.user?.id||'');
if(!intendedUser)throw new Error('Supabase no ha confirmado la identidad de la cuenta.');
const localOwner=localStorage.getItem('oihaneAccountOwnerV1')||localStorage.getItem('oihane_sync_user')||'';
if(localOwner&&localOwner!==intendedUser)throw new Error('Este dispositivo conserva datos de otra cuenta. Por seguridad, no se mezclan ni se sincronizan. Exporta una copia JSON y utiliza el otro dispositivo o espera a activar los perfiles aislados.');
if(!localOwner&&localStorage.getItem('oihane_sync_base')&&Object.keys(collectBackupData().data||{}).some(k=>Array.isArray(collectBackupData().data[k])&&collectBackupData().data[k].length))throw new Error('Se detectaron datos antiguos vinculados a una sincronización sin identificar. Descarga una copia JSON antes de iniciar una cuenta diferente.');
localStorage.setItem('oihaneAccountOwnerV1',intendedUser);
localStorage.setItem('oihane_sync_access',data.access_token);localStorage.setItem('oihane_sync_refresh',data.refresh_token||'');localStorage.setItem('oihane_sync_expires',String(Date.now()+Number(data.expires_in||3600)*1000));localStorage.setItem('oihane_sync_user',data.user?.id||'');document.querySelector('#syncPassword').value='';const st=document.querySelector('#cloudStatus');if(st)st.textContent='Sesión iniciada. La sincronización comenzará automáticamente.'}catch(e){const st=document.querySelector('#cloudStatus');if(st)st.textContent='No se pudo iniciar sesión: '+e.message}}
let oihaneRefreshInFlight=null;
async function refreshCloudToken(force=false){
 const c=syncConfig();
 if(!force&&c.access&&c.expires>Date.now()+90000)return;
 if(!c.refresh)throw Error('Sesion caducada. Inicia sesion de nuevo; tus datos locales permanecen guardados.');
 if(!c.url||!c.key)throw Error('Falta configuracion de Supabase.');
 if(!oihaneRefreshInFlight){
  oihaneRefreshInFlight=(async()=>{
   const data=await cloudFetch('/auth/v1/token?grant_type=refresh_token',{
    method:'POST',auth:false,body:JSON.stringify({refresh_token:syncConfig().refresh})
   });
   if(!data?.access_token||!data?.user?.id)throw Error('Supabase no pudo renovar la sesion.');
   const owner=localStorage.getItem('oihane_sync_user')||'';
   if(owner&&data.user.id!==owner)throw Error('Cuenta distinta detectada. Sincronizacion bloqueada.');
   localStorage.setItem('oihane_sync_access',data.access_token);
   localStorage.setItem('oihane_sync_refresh',data.refresh_token||c.refresh);
   localStorage.setItem('oihane_sync_expires',String(Date.now()+Number(data.expires_in||3600)*1000));
  })().finally(()=>{oihaneRefreshInFlight=null;});
 }
 return oihaneRefreshInFlight;
}
function stableJSON(value){if(value===undefined)return '__undefined__';if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(stableJSON).join(',')+']';return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stableJSON(value[k])).join(',')+'}'}
function mapItems(list){const m=new Map();(Array.isArray(list)?list:[]).forEach((item,i)=>{const id=String(item&&item.id!=null?item.id:'__item_'+i);m.set(id,item)});return m}
function mergeSyncArray(localList,cloudList,baseList,hasBase){const L=mapItems(localList),C=mapItems(cloudList),B=mapItems(baseList),ids=new Set([...L.keys(),...C.keys(),...B.keys()]),result=[],conflicts=[];for(const id of ids){const l=L.has(id)?L.get(id):undefined,c=C.has(id)?C.get(id):undefined,b=B.has(id)?B.get(id):undefined,hl=L.has(id),hc=C.has(id),hb=B.has(id);if(!hasBase||!hb){if(hl&&hc){if(stableJSON(l)!==stableJSON(c))conflicts.push(id);result.push(l)}else if(hl)result.push(l);else if(hc)result.push(c);continue}const lc=hl!==hb||stableJSON(l)!==stableJSON(b),cc=hc!==hb||stableJSON(c)!==stableJSON(b);if(!hl&&!hc)continue;if(!hl){if(!cc)continue;result.push(c);conflicts.push(id);continue}if(!hc){if(!lc)continue;result.push(l);conflicts.push(id);continue}if(lc&&cc){if(stableJSON(l)!==stableJSON(c))conflicts.push(id);result.push(l)}else if(lc)result.push(l);else if(cc)result.push(c);else result.push(l)}return {value:result,conflicts:conflicts.length}}
function mergeSyncSnapshots(localData,cloudData,baseData){const merged={},keys=new Set([...Object.keys(localData||{}),...Object.keys(cloudData||{}),...Object.keys(baseData||{})]);let conflicts=0;const hasBase=!!baseData;for(const k of keys){if(!oihaneSyncRuntime.isDataKey(k))continue;const l=localData?.[k],c=cloudData?.[k],b=baseData?.[k];if(Array.isArray(l)||Array.isArray(c)||Array.isArray(b)){const m=mergeSyncArray(Array.isArray(l)?l:[],Array.isArray(c)?c:[],Array.isArray(b)?b:[],hasBase);merged[k]=m.value;conflicts+=m.conflicts;continue}const lc=stableJSON(l)!==stableJSON(b),cc=stableJSON(c)!==stableJSON(b);if(!hasBase){if(l!==undefined)merged[k]=l;else if(c!==undefined)merged[k]=c}else if(l===undefined&&c===undefined){}else if(l===undefined){if(cc)merged[k]=c}else if(c===undefined){if(lc)merged[k]=l}else if(lc&&cc){merged[k]=l;if(stableJSON(l)!==stableJSON(c))conflicts++}else merged[k]=lc?l:c}return {data:merged,conflicts}}
function applySyncSnapshot(data){
 const previousProducts=JSON.stringify(products);
 // Validar todo el lote antes de escribir cualquier modulo.
 for(const [key,next] of Object.entries(data||{})){
  if(!oihaneSyncRuntime.isDataKey(key)||!Array.isArray(next)||next.length)continue;
  try{
   const old=JSON.parse(localStorage.getItem(key)||'null');
   if(Array.isArray(old)&&old.length>=2)throw Error('Carga parcial: '+key+' desaparecio. Ningun dato local ha sido sustituido.');
  }catch(error){if(String(error?.message||'').includes('Carga parcial:'))throw error;}
 }
 const allowed=new Set();for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(oihaneSyncRuntime.isDataKey(k))allowed.add(k)}Object.keys(data||{}).forEach(k=>allowed.add(k));for(const k of allowed){
  if(!Object.prototype.hasOwnProperty.call(data||{},k))continue;
  const next=data[k],previous=localStorage.getItem(k);
  let old=null;try{old=previous===null?null:JSON.parse(previous)}catch(_){}
  if(Array.isArray(old)&&old.length>=2&&Array.isArray(next)&&next.length===0)
   throw Error('Proteccion: el modulo '+k+' quedo vacio. Se detiene la sincronizacion.');
  localStorage.setItem(k,JSON.stringify(next));
 }tasks=readStore('oihane_tasks');products=readStore('oihane_products').map(p=>['Embutidos','Embutido'].includes(p.category)?{...p,category:'Quesos y embutidos'}:p);events=readStore('oihane_events');
 // El antiguo flujo solo actualizaba Home. Compras podía quedar visualmente vacía
 // tras recibir productos: refrescar la lista sin reconstruir el formulario.
 if(previousProducts!==JSON.stringify(products)&&screen==='Compras')window.oihaneRefreshShoppingList?.();
}
let oihaneRemoteBackupCache={uid:'',stamp:'',data:null};
async function oihaneReadValidatedBackup(){
 const uid=localStorage.getItem('oihane_sync_user')||'';
 if(!uid)throw Error('Se requiere una sesion iniciada.');
 const cache=oihaneRemoteBackupCache;
 if(cache.uid===uid&&cache.data&&cache.stamp){
  const meta=await cloudFetch('/rest/v1/oihane_backups?select=updated_at&limit=1',{method:'GET'});
  if(!Array.isArray(meta))throw Error('Lectura incompleta del servidor.');
  if(meta.length===1&&meta[0]?.updated_at===cache.stamp)return [{data:cache.data,updated_at:cache.stamp}];
 }
 const rows=await cloudFetch('/rest/v1/oihane_backups?select=data,updated_at&limit=1',{method:'GET'});
 if(!Array.isArray(rows))throw Error('Respuesta inesperada de Supabase.');
 if(rows.length&&(!rows[0]?.data?.data||typeof rows[0].data.data!=='object'))throw Error('Copia remota ilegible: no se modifica el almacenamiento.');
 if(!rows.length){
  const local=collectBackupData().data||{};
  if(!Object.values(local).some(v=>Array.isArray(v)&&v.length))throw Error('Sin copia remota ni datos locales confirmados; sincronizacion detenida.');
 }else oihaneRemoteBackupCache={uid,stamp:rows[0].updated_at,data:rows[0].data};
 return rows;
}
async function syncCloudAutomatic(){if(syncInProgress||!navigator.onLine)return;const c=syncConfig();if(!c.access||!c.url||!c.key){const st=document.querySelector('#cloudStatus');if(st)st.textContent='Configura Supabase e entra en tu cuenta antes de sincronizar.';return}syncInProgress=true;const st=document.querySelector('#cloudStatus');try{await window.oihanePlantPhotos.migrate();await refreshCloudToken();const rows=await oihaneReadValidatedBackup();const cloudEnvelope=rows[0]?.data||null;const cloudData=cloudEnvelope?.data||{};
const me=localStorage.getItem('oihane_sync_user')||'';
for(const k of ['oihane_tasks','oihane_events','oihane_plans','oihane_orders','oihane_wishlist']){
 if(Array.isArray(cloudData[k]))cloudData[k]=cloudData[k].filter(x=>x&&(!x._oihaneSharedOwner||x._oihaneSharedOwner===me));
}
const localData=collectBackupData().data||{};const originalAgenda=screen==='home'?stableJSON([tasks,events,localStorage.getItem('oihane_plans')]):null;let baseData=await oihaneSyncBaseGet();
 // Conservar imágenes fuera de localStorage pero comparar los mismos identificadores.
 // Cada foto de Supabase se verifica en IndexedDB antes de usar la referencia.
 const photos=window.oihanePlantPhotos;
 const safeCloudData=await photos.localizeData(cloudData);
 baseData=await photos.localizeData(baseData);
 const merged=mergeSyncSnapshots(localData,safeCloudData,baseData);
// Compras tiene su propia fuente compartida granular. No sustituirla por una
// copia general potencialmente antigua durante el inicio de sesión: al abrir
// la PWA las dos sincronizaciones pueden llegar en distinto orden.
let linkedShopping=false;
try{const profile=JSON.parse(localStorage.getItem('oihane_sync_shared_profile')||'null');
 linkedShopping=!!(me&&profile?.uid===me&&profile?.link_id)}catch(_){}
if(window.oihaneSharedProductsActive||linkedShopping)merged.data.oihane_products=products;if(window.oihaneFullSharedKeys)for(const k of window.oihaneFullSharedKeys){const v=localStorage.getItem(k);if(v!==null){try{merged.data[k]=JSON.parse(v)}catch(_){}}}if(window.oihaneMixedKeys)for(const k of window.oihaneMixedKeys){const v=localStorage.getItem(k);if(v!==null){try{merged.data[k]=JSON.parse(v)}catch(_){}}}applySyncSnapshot(merged.data);if(typeof window.oihaneRolloverTasks==='function')window.oihaneRolloverTasks();const userId=localStorage.getItem('oihane_sync_user');if(!userId)throw new Error('No se encuentra la sesión de usuario. Vuelve a iniciar sesión.');const saved=collectBackupData();
 // El servidor recibe fotos completas; localStorage conserva sólo referencias pequeñas.
 const portable={...saved,data:await window.oihanePlantPhotos.expandData(saved.data)};
 // Failsafe: never replace a cloud backup with an unexpectedly empty snapshot.
 const listKeys=['oihane_tasks','oihane_events','oihane_plants','oihane_recipes','oihane_orders','oihane_wishlist','oihane_plans','oihane_gifts','oihane_culture'];
 const countRows=(obj,key)=>Array.isArray(obj?.[key])?obj[key].length:0;
 const losses=listKeys.filter(k=>countRows(cloudData,k)>=2 && countRows(portable.data,k)===0);
 if(losses.length>=2)throw new Error('Copia protegida: varios módulos han quedado vacíos ('+losses.join(', ')+'). Se ha cancelado la subida para evitar pérdida de información.');
 const now=new Date().toISOString();
 const cloudUnchanged=!!cloudEnvelope&&stableJSON(saved.data)===stableJSON(safeCloudData);
 if(!cloudUnchanged){
  const payload={user_id:userId,data:portable,updated_at:now};
  await cloudFetch('/rest/v1/oihane_backups?on_conflict=user_id',{
   method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(payload)
  });
  oihaneRemoteBackupCache={uid:userId,stamp:now,data:portable};
 }
 await oihaneSyncBaseSave(saved.data);localStorage.setItem('oihane_sync_last',now);await writeLocalSnapshot();if(originalAgenda!==null&&originalAgenda!==stableJSON([tasks,events,localStorage.getItem('oihane_plans')])&&!(document.activeElement?.id==='ask'&&document.activeElement.value.trim()))window.home?.();if(st)st.textContent='Sincronización completada: '+new Date(now).toLocaleString('es-ES')+'. '+(merged.conflicts?'Se han detectado '+merged.conflicts+' cambios simultáneos; se ha conservado la versión de este dispositivo para esos elementos. ':'')+'La copia común se ha actualizado.';/* No volver a Home tras sincronización en segundo plano: conserva pantalla y formulario actual. */}catch(e){if(st)st.textContent='No se ha podido sincronizar: '+e.message+' No se han borrado los datos locales. Revisa la URL, la clave pública, la sesión y las políticas SQL.'}finally{syncInProgress=false}}
async function syncCloudNow(){if(!confirm('Se hará una copia de seguridad local y se fusionarán los datos con la nube. Los cambios simultáneos en un mismo elemento conservarán la versión de este dispositivo. ¿Continuar?'))return;await syncCloudAutomatic()}

function queueCloudSync(){clearTimeout(cloudSyncTimer);const c=syncConfig();if(syncInProgress||!c.access||!c.url||!c.key)return;cloudSyncTimer=setTimeout(()=>syncCloudAutomatic(),1800)}
// Comprobar cada minuto solo metadatos. La copia completa se envia unicamente si hay cambios.
let oihaneLastBackupSweep=0;
oihaneSyncRuntime.register('cloud-backup',()=>{if(document.visibilityState==='visible'&&navigator.onLine&&syncConfig().access&&!syncInProgress&&Date.now()-oihaneLastBackupSweep>60000){oihaneLastBackupSweep=Date.now();return syncCloudAutomatic()}},{minute:true});
/* Sincronización visible y compartida: también al recuperar foco/conexión. */

/* Sincronización de entrada/salida: en primer plano cada 60s (temporizador principal),
 * al abrir/volver y al recuperar Internet. No funciona con iOS suspendido. */
(function(){
 'use strict';
 let lastWake=0,initialPulse=null;
 async function wake(force){
  if(document.visibilityState==='hidden'||!syncConfig().access)return;
  if(!force&&Date.now()-lastWake<8000)return;
  lastWake=Date.now();
  try{await syncCloudAutomatic()}catch(e){console.warn('Oihane: sincronización pendiente',e)}
  try{await window.oihaneMixedSyncNow?.()}catch(e){console.warn('Oihane: registros compartidos pendientes',e)}
 }
 window.oihaneInitialCloudSync=()=>initialPulse||Promise.resolve();
 window.oihaneSyncPulse=()=>wake(true);
 window.addEventListener('load',()=>{initialPulse=new Promise(resolve=>setTimeout(resolve,300)).then(()=>wake(true))});
 oihaneSyncRuntime.register('cloud-wake',reason=>wake(reason!=='focus'),{focus:true,online:true,visible:true});
})();

function cloudLogout(){['oihane_sync_access','oihane_sync_refresh','oihane_sync_expires','oihane_sync_user'].forEach(k=>localStorage.removeItem(k));const st=document.querySelector('#cloudStatus');if(st)st.textContent='Sesión desconectada en este dispositivo. Los datos locales no se han borrado.'}
function testNotification(){if(!('Notification'in window)){alert('Este navegador no admite notificaciones.');return}if(Notification.permission==='granted'){try{new Notification('Oihane · Prueba',{body:'Los avisos funcionan mientras el navegador/app pueda ejecutarlos.'});alert('Se ha enviado un aviso de prueba. No garantiza avisos con la app cerrada.')}catch(e){alert('No se ha podido mostrar el aviso.')}}else requestNotificationPermission()}
function showAssistantHelp(){alert('ÓRDENES QUE OIHA﻿NE PUEDE INTERPRETAR\n\n• Añade leche a la compra\n• Añade a la compra: leche, pan y huevos\n• Crea una tarea para mañana: llamar al dentista\n• Recuérdame llamar al dentista mañana\n• He limpiado el baño / he regado la monstera\n• Añade una cita mañana a las 18 en Vitoria\n• Qué tengo hoy / mañana / pasado mañana\n• Qué tareas tengo\n• Abre recetas / viajes / planes / plantas / calendario\n\nEl dictado rellena el texto y te deja revisarlo antes de ejecutar la orden. La comprensión es local; no envía tus datos a una IA externa. Los avisos se revisan mientras la app está abierta.')}
function parseRelativeDate(text){const t=text.toLowerCase(),d=new Date();if(t.includes('pasado mañana'))d.setDate(d.getDate()+2);else if(t.includes('mañana'))d.setDate(d.getDate()+1);else if(t.includes('hoy')){}else return '';return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function handleAssistantCommand(raw){const q=raw.trim(),l=q.toLowerCase();const input=document.querySelector('#ask');const say=msg=>{let box=document.querySelector('#assistantResult');if(!box){box=document.createElement('div');box.id='assistantResult';box.className='assistant-response';document.querySelector('.assistant')?.after(box)}box.textContent=msg};const open=(n,seed='')=>{openModule(n,seed);};
if(/^(qué|que) (tengo|hay|me espera).*(hoy|mañana|pasado mañana)?/.test(l)||/agenda de (hoy|mañana|pasado mañana)/.test(l)||/qué tareas tengo/.test(l)){const day=l.includes('pasado mañana')?parseRelativeDate('pasado mañana'):l.includes('mañana')?parseRelativeDate('mañana'):today();const ev=events.filter(e=>e.date===day).sort((a,b)=>(a.time||'').localeCompare(b.time||''));const ts=tasks.filter(t=>!t.done&&(!t.date||t.date<=day));const bits=[...ev.map(e=>(e.time?e.time+' ':'')+e.title+(e.location?' · '+e.location:'')),...ts.filter(t=>!t.date||t.date===day).map(t=>'Tarea: '+t.title)];say(bits.length?'Para '+(day===today()?'hoy':fmt(day))+': '+bits.join(' | '):'No tienes eventos ni tareas para '+(day===today()?'hoy':'esa fecha')+'.');return}
if(/^he regado (.+)/i.test(q)){const n=q.replace(/^he regado /i,'').trim().toLowerCase(),items=extraItems('Plantas'),p=items.find(x=>x.title.toLowerCase().includes(n));if(p){if(window.oihanePlantLogWatering)window.oihanePlantLogWatering(p,today());else{p.lastWatered=today();p.date=nextPlantDate(p);p.status='Bien'}saveExtra('Plantas',items);say('He actualizado el último riego de '+p.title+'.');return}open('Plantas',q);return}
if(/^he limpiado (.+)/i.test(q)){const n=q.replace(/^he limpiado /i,'').trim().toLowerCase(),t=tasks.find(x=>!x.done&&x.title.toLowerCase().includes(n));if(t){if(confirm('¿Marcar como completada la tarea «'+t.title+'»?')){toggleTask(t.id);say('Tarea completada: '+t.title)}return}open('Tareas','Limpiar '+q.replace(/^he limpiado /i,''));return}
if(/(añade|añadir|agrega|mete).*(compra|lista de la compra|supermercado)|^(necesito|comprar)\s+/i.test(q)){let rawName=q.replace(/^(?:por favor,?\s*)?(?:añade|añadir|agrega|mete|necesito|comprar)\s+/i,'').replace(/\s+(?:a|en)\s+(?:la\s+)?(?:lista de la compra|lista de compras|compra|supermercado).*$/i,'').replace(/^a la compra\s*:?\s*/i,'').replace(/^a la lista de la compra\s*:?\s*/i,'').trim();const names=rawName.split(/,|\s+y\s+/i).map(x=>x.trim()).filter(Boolean),norm=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim(),existing=new Set(products.map(p=>norm(p.title)));if(names.length&&names.every(n=>n.length<100)){const added=[];names.forEach((name,i)=>{if(!existing.has(norm(name))){products.push({id:Date.now()+i,title:name,store:'Lidl',lists:['General','Lidl'],category:classifyProductCategory(name),bought:false,created:today(),source:'assistant'});existing.add(norm(name));added.push(name)}});save();say(added.length?'Añadido a la compra: '+added.join(', ')+'.'+(added.length<names.length?' Los productos que ya estaban se han omitido.':''):'Esos productos ya estaban en la lista de la compra.');return}open('Compras',q);return}
if(/^(recuérdame|recuerdame|no olvides|acuérdame|acuérdate de)\s+/i.test(q)){const body=q.replace(/^(recuérdame|recuerdame|no olvides|acuérdame|acuérdate de)\s+/i,'').trim(),date=parseRelativeDate(l),title=body.replace(/\s+(hoy|mañana|pasado mañana|el lunes|el martes|el miércoles|el jueves|el viernes|el sábado|el domingo).*$/i,'').replace(/^que\s+/i,'').trim();if(title){tasks.push({id:Date.now(),title,date,repeat:'',category:'',importance:2,notify:true,done:false,created:today(),completedAt:''});save();say('He guardado el recordatorio: '+title+(date?' para '+fmt(date):'')+'. Te avisaré cuando Oihane esté abierta; para avisos fiables con la app cerrada hace falta otra integración.');return}}
if(/(crea|añade|pon|apunta).*(tarea|pendiente)|tarea para/i.test(l)){const title=q.replace(/^(?:por favor,?\s*)?(?:crea|añade|pon|apunta)\s+(?:una\s+)?(?:tarea|pendiente)\s*(?:para\s*)?/i,'').replace(/^para\s+/i,'').replace(/^(hoy|mañana|pasado mañana)\s*:?\s*/i,'').trim();const date=parseRelativeDate(l);if(title){tasks.push({id:Date.now(),title,date,repeat:'',category:'',importance:2,notify:false,done:false,created:today(),completedAt:''});save();say('Tarea guardada'+(date?' para '+fmt(date):'')+': '+title+'.');return}open('Tareas',q);return}
if(/(cita|reunión|evento|calendario).*(hoy|mañana|pasado mañana)|(?:añade|crea|pon|apunta).*(cita|reunión|evento)/i.test(q)){const date=parseRelativeDate(l)||today(),tm=(l.match(/(?:a las?\s*)?\b([01]?\d|2[0-3])(?::([0-5]\d)|[.h]([0-5]\d)?)?\b/i)||[]);const time=tm[0]?String(tm[1]).padStart(2,'0')+':'+String(tm[2]||tm[3]||'00').padStart(2,'0'):'';const loc=(q.match(/\b(?:en|ubicado en)\s+([A-ZÁÉÍÓÚÑ][^,.;]+)$/)||[])[1]||'';let title=q.replace(/^(?:por favor,?\s*)?(?:añade|crea|pon|apunta)\s+/i,'').replace(/\b(?:hoy|mañana|pasado mañana)\b/ig,'').replace(/\ba las?\s+\d{1,2}(?::\d{2}|[.h]\d{2})?\b/ig,'').replace(/\b\d{1,2}(?::\d{2}|[.h]\d{2})?\b/g,'').replace(/\s+en\s+[A-ZÁÉÍÓÚÑ][^,.;]*$/,'').replace(/\b(?:el|para)\b/ig,' ').replace(/\s+/g,' ').trim();title=title.replace(/^(una?\s+)?/i,'').trim()||'Cita';events.push({id:Date.now(),title,date,time,location:loc,notes:'Creado con el asistente',duration:'60',notify:true,departureMinutes:''});save();say('Evento guardado: '+title+' · '+fmt(date)+(time?' a las '+time:'')+(loc?' · '+loc:'')+'. He activado el aviso dentro de Oihane; no se garantiza si la app está cerrada.');return}
const map=[[/\b(receta|cocinar|ingredientes)\b/,'Recetas'],[/\b(planta|monstera|regar)\b/,'Plantas'],[/\b(viaje|viajar|destino)\b/,'Viajes'],[/\b(regalo)\b/,'Regalos'],[/\b(plan|excursión|actividad)\b/,'Planes'],[/\b(calendario|evento|cita|reunión)\b/,'Calendario'],[/\b(tarea|pendiente|limpiar|estudiar)\b/,'Tareas'],[/\b(hogar|mueble|sofá|mesa|lámpara)\b/,'Hogar'],[/\b(wishlist|deseo|quiero comprar)\b/,'Wishlist'],[/\b(compra|supermercado|leche|pan)\b/,'Compras']];for(const [re,n] of map){if(re.test(l)){open(n,q);return}}say('No he entendido del todo la orden. Prueba «añade leche a la compra», «crea una tarea para mañana: llamar al dentista» o «qué tengo mañana». Tus datos no se han enviado a ningún servicio externo.');}
function restoreSettingsIntoUI(){const c=syncConfig();const u=document.querySelector('#syncUrl'),k=document.querySelector('#syncKey'),e=document.querySelector('#syncEmail'),st=document.querySelector('#cloudStatus');if(u)u.value=c.url;if(k)k.value=c.key;if(e)e.value='';if(st)st.textContent=c.access?'Sesión Supabase activa.':'Inicia sesión para sincronizar.';const profile=document.querySelector('#oihaneAccountDisplayName');if(profile&&document.activeElement!==profile)profile.value=localStorage.getItem('oihane_display_name_'+(localStorage.getItem('oihane_sync_user')||''))||(typeof window.oihaneGreetingName==='function'?window.oihaneGreetingName():'');const n=document.querySelector('#notifStatus');if(n)n.textContent='Permiso de notificaciones: '+(('Notification'in window)?Notification.permission:'no disponible')+'.';const local=document.querySelector('#localBackupStatus');if(local){openRecoveryDB().then(db=>new Promise(resolve=>{const tx=db.transaction('snapshots','readonly'),r=tx.objectStore('snapshots').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve([])})).then(rows=>{const snap=rows.length?'Hay '+rows.length+' instantáneas locales. Última: '+new Date(rows.sort((a,b)=>b.id-a.id)[0].createdAt).toLocaleString('es-ES'):'Se creará una copia de recuperación al guardar cambios.';let ext='';try{const t=localStorage.getItem('oihane_last_export_at');if(t)ext=' Última descarga JSON registrada en este dispositivo: '+new Date(t).toLocaleString('es-ES')+'.'}catch{}local.textContent=snap+ext}).catch(()=>local.textContent='Este navegador no permite instantáneas locales; usa la copia JSON.') }}
function safeUpgradeSnapshot(){// No migramos ni borramos las claves existentes. Guardamos un registro de versión ligero, sin duplicar fotos ni agotar el almacenamiento.
 try{const v=document.querySelector('meta[name="oihane-version"]')?.content||'4.0.0';const previous=localStorage.getItem('oihane_last_version');if(previous!==v){localStorage.setItem('oihane_last_version',v);localStorage.setItem('oihane_last_upgrade_at',new Date().toISOString())}}catch(e){}
}

safeUpgradeSnapshot();home();queueLocalSnapshot();if('serviceWorker'in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});scheduleForegroundReminderCheck();document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){clearTimeout(snapshotTimer);writeLocalSnapshot()} });


/* Oihane 5.15 — corrective fixes: event editing, recipe ingredients, shopping-list integrity. */

function classifyProductCategory(value){
 const n=normalizeProductName(value);if(!n)return 'Otros';
 const has=terms=>terms.some(term=>{
  const t=normalizeProductName(term);if(!t)return false;
  if(t.includes(' '))return (` ${n} `).includes(` ${t} `)||(` ${n} `).includes(` ${t}s `);
  const escaped=t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp(`(^|\\s)${escaped}(?:s|es)?(?=\\s|$)`).test(n);
 });
 if(has(['congelado','congelada','helado','hielo','cubitos de hielo','pizza congelada','verduras congeladas','guisantes congelados','croquetas congeladas','patatas congeladas','lasaña congelada','pescado congelado','fruta congelada']))return 'Congelados';
 if(has(['tomate frito','tomate triturado','atún en lata','sardinas en lata','patatas fritas','pan rallado','sopa de sobre','puré de sobre','tomate cherry en conserva']))return 'Despensa';
 if(has(['lejía','detergente','suavizante','lavavajillas','pastillas lavavajillas','limpiacristales','limpiador','desengrasante','fregasuelos','bayeta','estropajo','esponja','bolsas de basura','papel de cocina','papel cocina','servilletas','quitamanchas','desinfectante','ambientador','abrillantador','limpiador multiusos','limpia baños','limpiador baño','limpia muebles','guantes de limpieza','percarbonato']))return 'Limpieza';
 if(has(['champú','acondicionador','gel de ducha','gel de baño','pasta de dientes','dentífrico','cepillo de dientes','desodorante','crema facial','crema corporal','protector solar','compresa','tampón','cuchilla de afeitar','maquinilla','algodón','pañales','toallitas','hilo dental','papel wc','papel higiénico','jabón de manos','discos desmaquillantes','agua micelar','mascarilla capilar','cuidado íntimo']))return 'Higiene';
 if(has(['leche de avena','leche de almendra','leche de soja','leche de arroz','leche de coco','bebida vegetal','bebida energética','agua','refresco','cola','coca cola','fanta','sprite','zumo','jugo','cerveza','vino','sidra','kombucha','café','té','infusión','horchata','isotónica']))return 'Bebidas';
 if(has(['yogur','yogurt','queso','leche','nata','mantequilla','margarina','kéfir','requesón','cuajada','flan','natillas','huevo','mozzarella','mascarpone','ricotta','parmesano','emmental','gouda','cheddar','feta','quesito']))return 'Lácteos y huevos';
 if(has(['salmón','salmon','merluza','bacalao','atún','atun','bonito','sardina','anchoa','boquerón','trucha','lubina','dorada','gamba','langostino','mejillón','almeja','calamar','pulpo','sepia','pescado','marisco','surimi']))return 'Pescado';
 if(has(['pollo','pavo','ternera','cerdo','cordero','conejo','carne picada','filete','entrecot','solomillo','hamburguesa','salchicha','chorizo','jamón','panceta','bacon','beicon','lomo','costilla','morcilla','salmón','merluza','bacalao','atún','bonito','sardina','anchoa','boquerón','trucha','lubina','dorada','gamba','langostino','mejillón','almeja','calamar','pulpo','sepia','pescado','marisco','surimi']))return 'Carne';
 if(has(['galleta','cereales','granola','muesli','copos de avena','mermelada','tostada desayuno','bizcocho desayuno']))return 'Desayuno';
 if(has(['snack','nachos','palomitas','patatas fritas','frutos secos','pistacho','cacahuete','aceituna','pepinillo','aperitivo']))return 'Picoteo';
 if(has(['pan de molde','barra de pan','baguette','hogaza','mollete','chapata','tostada','tostas','croissant','cruasán','napolitana','ensaimada','magdalena','bizcocho','bollería','picos','colines','tortilla de trigo','tortitas de maíz','arepa','pan']))return 'Panadería';
 if(has(['manzana','pera','plátano','banana','naranja','mandarina','limón','lima','pomelo','uva','fresa','frambuesa','arándano','mora','kiwi','piña','mango','papaya','melón','sandía','melocotón','nectarina','albaricoque','ciruela','cereza','aguacate','tomate','lechuga','espinaca','acelga','berza','repollo','brócoli','coliflor','zanahoria','patata','boniato','batata','cebolla','ajo','puerro','calabacín','pepino','pimiento','berenjena','calabaza','champiñón','seta','judía verde','guisante fresco','espárrago','alcachofa','apio','rúcula','canónigos','rábano','remolacha','yuca','jengibre fresco','perejil fresco','cilantro fresco','hierbabuena','albahaca fresca','ensalada preparada','verdura','fruta']))return 'Fruta y verdura';
 if(has(['arroz','pasta','macarrón','espagueti','fideo','lasaña','lenteja','garbanzo','alubia','judía blanca','judía roja','quinoa','cuscús','avena','harina','azúcar','sal','pimienta','especia','aceite','vinagre','mayonesa','ketchup','mostaza','tomate frito','tomate triturado','conserva','atún en lata','sardinas en lata','maíz','aceituna','pepinillo','frutos secos','almendra','nuez','pistacho','cacahuete','crema de cacahuete','miel','mermelada','cacao','chocolate','galleta','cereales','granola','barrita','levadura','caldo','sopa de sobre','puré de sobre','patatas fritas','snack','nachos','palomitas','tofu','soja texturizada','proteína de soja','tortilla mexicana','wraps','pan rallado','café molido','café soluble','té verde','salsa de soja','salsa pesto','tomate cherry en conserva']))return 'Despensa';
 return 'Otros';
}

function migrateProducts(){
 let changed=false;
 products=products.filter(p=>p&&typeof p==='object'&&!Array.isArray(p)).map(p=>{
  const oldLists=Array.isArray(p.lists)?p.lists:[];
  const validStores=['Lidl','Eroski','Mercadona'];
  let storeName=validStores.includes(p.store)?p.store:oldLists.find(x=>validStores.includes(x))||'Lidl';
  const lists=['General',storeName];
  const category=classifyProductCategory(p.title);
  if(p.store!==storeName||p.category!==category||p.bought!==!!p.bought||JSON.stringify(oldLists)!==JSON.stringify(lists))changed=true;
  return {...p,store:storeName,lists,category,bought:!!p.bought};
 });
 if(changed)save();
}
function productRows(){
 const arr=products.filter(p=>(p.lists||[]).includes(store)&&!!p.bought===!!showBought);
 if(!arr.length)return '<div class="empty-list">'+(showBought?'Todavía no has comprado nada de esta lista.':'Tu lista está vacía. Añade lo que necesites.')+'</div>';
 const row=p=>`<div class="item ${p.bought?'done':''}"><label class="check-label"><input aria-label="Marcar ${esc(p.title)} como comprado" type="checkbox" ${p.bought?'checked':''} onchange="toggleProduct(${p.id})">Estado de compra</label><label class="check-label"><input aria-label="Seleccionar ${esc(p.title)} para mover o copiar" type="checkbox" ${selectedProductIds.has(p.id)?'checked':''} onchange="toggleSelectedProduct(${p.id},this.checked)">Elegir</label><div class="item-main"><div class="item-title">${esc(p.title)}${window.oihaneShareBadge?.(p)||''}</div><div class="item-meta">${esc(p.category||'Otros')}${store==='General'?' · '+esc(p.store||'Lidl'):''}</div>${p.sourceRecipe?`<div class="item-meta">Receta: ${esc(p.sourceRecipe)}</div>`:''}${p.sourceHomeTitle?`<div class="item-meta">Hogar: ${esc(p.sourceHomeTitle)}</div>`:''}</div><button class="delete" aria-label="Quitar ${esc(p.title)} de la compra" onclick="deleteProduct(${p.id})">×</button></div>`;
 let body='';
 const order=[...productCategories,'Otros'].filter((v,i,a)=>a.indexOf(v)===i);
 for(const cat of order){const group=arr.filter(p=>(p.category||'Otros')===cat);if(group.length)body+=`<div class="category-heading">${esc(cat)}</div>${group.map(row).join('')}`}
 const unknown=arr.filter(p=>!order.includes(p.category||'Otros'));
 if(unknown.length)body+=`<div class="category-heading">Otros</div>${unknown.map(row).join('')}`;
 return `${body}<div class="panel ${selectedProductIds.size?'':'hidden'}" id="bulkActions" style="padding:12px;margin-top:12px"><div class="item-meta"><span id="selectedCount">${selectedProductIds.size}</span> seleccionados</div><div class="field"><label>Mover o copiar a</label><select id="targetList">${['General','Lidl','Eroski','Mercadona'].filter(x=>x!==store).map(x=>`<option>${x}</option>`).join('')}</select></div><div class="add-row"><button class="primary" type="button" onclick="moveSelectedProducts(false)">Mover</button><button class="primary" type="button" onclick="moveSelectedProducts(true)">Copiar</button><button type="button" onclick="clearProductSelection()" style="background:#efecdf;border-radius:12px;padding:10px">Cancelar</button></div><div class="hint">General es el resumen común de las listas de Lidl, Eroski y Mercadona. Cada producto aparece agrupado por categoría.</div></div>`;
}
function moveSelectedProducts(copy){
 const ids=[...selectedProductIds];if(!ids.length){alert('Selecciona al menos un producto.');return}
 const target=document.querySelector('#targetList')?.value;if(!target)return;
 for(const id of ids){const p=products.find(x=>x.id===id);if(!p)continue;
  if(copy){const targetStore=target==='General'?(p.store||'Lidl'):target;products.push({...p,id:Date.now()+Math.floor(Math.random()*1000000),store:targetStore,lists:['General',targetStore],bought:false});}
  else {const targetStore=target==='General'?(p.store||'Lidl'):target;p.store=targetStore;p.lists=['General',targetStore];}
 }
 selectedProductIds.clear();save();renderShopping();
}
function calendarRows(){
 let base=events.slice();const start=new Date(today()+'T12:00:00'),end=new Date(start);
 if(calendarView==='week'){const day=(start.getDay()+6)%7;start.setDate(start.getDate()-day);end.setTime(start.getTime());end.setDate(start.getDate()+6)}
 else if(calendarView==='month'){start.setDate(1);end.setMonth(end.getMonth()+1);end.setDate(0)}
 if(calendarView!=='all'){const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;base=base.filter(e=>e.date>=iso(start)&&e.date<=iso(end))}
 const arr=base.sort((a,b)=>((a.date||'9999')+(a.time||'')).localeCompare((b.date||'9999')+(b.time||'')));
 return arr.length?arr.map(e=>`<div class="item"><div class="event-date">${e.date===today()?'HOY':e.date===tomorrow()?'MAÑANA':fmt(e.date)}${e.time?'<span class="oihane-cal-time">'+esc(e.time)+'</span>':''}</div><div class="item-main"><div class="item-title">${esc(e.title)}</div><div class="item-meta">${e.location?'📍 '+esc(e.location):'Sin ubicación'}${e.duration?' · '+(Number(e.duration)>=480?'Día completo':esc(e.duration)+' min'):''}${e.people?' · '+esc(e.people):''}</div>${e.notes?`<div class="item-meta">${esc(e.notes)}</div>`:''}</div><div class="item-actions"><button class="small-action" type="button" onclick="editEvent(${e.id})">Editar</button><button class="delete" aria-label="Eliminar ${esc(e.title)}" onclick="deleteEvent(${e.id})">×</button></div></div>`).join(''):'<div class="empty-list">Todavía no hay eventos. Añade tu primera cita arriba.</div>';
}
function editEvent(id){
 const ev=events.find(e=>String(e.id)===String(id));if(!ev)return;
 renderCalendar();const panel=document.querySelector('#addPanel');if(!panel)return;panel.classList.remove('hidden');
 const set=(key,value)=>{const el=document.querySelector('#event'+key);if(el)el.value=value??''};
 set('Title',ev.title);set('Date',ev.date||today());set('Time',ev.time);set('Duration',String(ev.duration||60));set('Location',ev.location);set('People',ev.people);set('Notes',ev.notes);set('Departure',ev.departureMinutes);set('NotifyLead',String(ev.notifyLead||0));
 const notify=document.querySelector('#eventNotify');if(notify)notify.checked=!!ev.notify;const share=document.querySelector('#eventShare');if(share)share.checked=ev.sharedWithPartner===true;
 const submit=document.querySelector('#eventForm button');if(submit)submit.textContent='Guardar cambios';
 document.querySelector('#eventForm').onsubmit=e=>{e.preventDefault();const title=document.querySelector('#eventTitle').value.trim();const date=document.querySelector('#eventDate').value;if(!title||!date){alert('Indica un nombre y una fecha para el evento.');return}
  Object.assign(ev,{title,date,time:document.querySelector('#eventTime').value,duration:document.querySelector('#eventDuration').value,location:document.querySelector('#eventLocation').value.trim(),people:document.querySelector('#eventPeople').value.trim(),notes:document.querySelector('#eventNotes').value.trim(),notify:document.querySelector('#eventNotify').checked,notifyLead:Number(document.querySelector('#eventNotifyLead')?.value||0),departureMinutes:document.querySelector('#eventDeparture').value||'',sharedWithPartner:!!document.querySelector('#eventShare')?.checked});
  save();renderCalendar();
 };
}
function editRecipe(id){
 const items=extraItems('Recetas'),r=items.find(x=>String(x.id)===String(id));if(!r)return;
 const title=prompt('Nombre de la receta',r.title||'');if(title===null)return;
 const ingredients=prompt('Ingredientes: uno por línea. Puedes usar «200 g de pasta» o «200 g | pasta».',r.ingredients||'');if(ingredients===null)return;
 const steps=prompt('Pasos de preparación',r.steps||'');if(steps===null)return;
 const servings=prompt('Raciones originales',String(r.servings||2));if(servings===null)return;
 const count=Number(servings);if(!Number.isFinite(count)||count<1||count>100){alert('Las raciones deben ser un número entre 1 y 100. No se han guardado los cambios.');return}
 r.title=title.trim()||r.title;r.ingredients=ingredients.trim();r.steps=steps.trim();r.servings=String(count);if(!r.currentServings)r.currentServings=String(count);
 if(saveExtra('Recetas',items))renderExtraModule('Recetas');
}
function recipeToShopping(id){
 const r=extraItems('Recetas').find(x=>String(x.id)===String(id));
 if(!r){alert('No encuentro esta receta. Actualiza el módulo e inténtalo de nuevo.');return}
 const parsed=parseRecipeIngredients(r.ingredients||'');const names=parsed.map(x=>x.name.trim()).filter(Boolean);
 if(!names.length){alert('Esta receta no tiene ingredientes reconocibles. Pulsa «Editar receta e ingredientes» y añade uno por línea.');return}
 const targetStore=['Lidl','Eroski','Mercadona'].includes(store)?store:'Lidl';
 const norm=x=>normalizeProductName(x);let added=0,already=0;
 names.forEach((title,index)=>{
  const found=products.find(p=>norm(p.title)===norm(title));
  if(found){const preferred=found.store||targetStore;found.store=preferred;found.lists=['General',preferred];found.category=classifyProductCategory(found.title);already++;return}
  products.push({id:Date.now()+index+Math.floor(Math.random()*100000),title,store:targetStore,lists:['General',targetStore],category:classifyProductCategory(title),bought:false,created:today(),sourceRecipe:r.title,sourceRecipeId:r.id});added++;
 });
 save();store=targetStore;showBought=false;selectedProductIds.clear();alert(`Ingredientes de «${r.title}»: ${added} añadidos a ${targetStore}${already?`; ${already} ya estaban en la compra`:''}. Se han agrupado por categoría y también aparecen en General.`);renderShopping();
}