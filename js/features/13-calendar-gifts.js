



/* --- oihane-5323-improvements --- */

/* Oihane 5.32.3 — Calendar, Study, Gifts, compact sections. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const KEY='oihane_gift_people_dates_v1';
 const readPeople=()=>{try{const d=JSON.parse(localStorage.getItem(KEY)||'{}');return d&&typeof d==='object'&&!Array.isArray(d)?d:{}}catch{return {}}};
 const savePeople=d=>{try{localStorage.setItem(KEY,JSON.stringify(d));if(typeof queueLocalSnapshot==='function')queueLocalSnapshot();if(typeof queueCloudSync==='function')queueCloudSync();return true}catch(e){alert('No se pudieron guardar las fechas. '+String(e));return false}};
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const dayNow=()=>new Date(today()+'T12:00:00');
 const addYears=(s,annual)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;const [year,month,day]=s.split('-').map(Number);const now=dayNow();const y=annual?now.getFullYear():year;let d=new Date(y,month-1,day,12);if(d.getMonth()!==month-1||d.getDate()!==day){if(annual&&month===2&&day===29)d=new Date(y,1,28,12);else return null}if(annual&&d<now){d=new Date(y+1,month-1,day,12);if(d.getMonth()!==month-1)d=new Date(y+1,1,28,12)}return d};
 const daysUntil=d=>Math.floor((d-dayNow())/86400000);
 const dateShort=d=>d?d.toLocaleDateString('es-ES',{day:'numeric',month:'long'}):'';

 // Invocado desde renderTasks: la función final ya no se reenvuelve.
 window.oihaneFinalizeTasks=function(){compactCompleted();scheduleSections()};
 function compactCompleted(){document.querySelectorAll('#v522DoneList .v522-done-row').forEach(row=>{
  row.querySelectorAll('small,.v522-task-priority,.v522-task-period').forEach(n=>n.remove());
  const name=row.querySelector('.v522-task-copy');if(name){name.removeAttribute('data-task-edit');name.onclick=e=>e.preventDefault();name.setAttribute('aria-label','Tarea completada')}
 });}
 const oldExtra=window.renderExtraModule;
 if(typeof oldExtra==='function')window.renderExtraModule=function(name,...args){
  // Preserve painter records by moving them to the single favourite-artists section.
  if(name==='Cultura') {const arr=extraItems('Cultura');let changed=false;arr.forEach(i=>{if(i.cultureCategory==='Pintor'){i.cultureCategory='Artista';changed=true}});if(changed)saveExtra('Cultura',arr)}
  const out=oldExtra.call(this,name,...args);
  if(name==='Estudio')enhanceStudy();
  if(name==='Regalos')enhanceGifts();
  if(name==='Hogar')renameHomeSection();
  if(name==='Cultura')enhanceCulture();
  scheduleSections();return out;
 };
 function renameHomeSection(){const headings=document.querySelectorAll('#v519Body h2');headings.forEach(h=>{if(/^Compras fijas/.test(h.textContent||''))h.textContent='Compras pendientes'})}
 function enhanceCulture(){document.querySelectorAll('#v521Body .v521-section').forEach(s=>{const h=s.querySelector('h2');if(!h)return;if(h.textContent.trim()==='Arte')h.textContent='Obras de arte';if(h.textContent.trim()==='Pintores favoritos')s.remove()})}
 // Regalos — independent person sections with birthday and other recurring dates.
 function giftGroups(){const gifts=extraItems('Regalos'),meta=readPeople();const fixed=[...document.querySelectorAll('#v518Person option')].map(x=>x.value).filter(x=>x&&x!=='Otros'&&!(meta.__hidden||[]).includes(x));
  const persons=[...new Set([...fixed,...Object.keys(meta).filter(x=>x!=='__hidden'),...gifts.map(g=>(g.person||'Otros').trim()).filter(Boolean)])];
  if(gifts.some(g=>!g.person)&&!persons.includes('Otros'))persons.push('Otros');
  const now=dayNow();
  const cards=p=>gifts.filter(g=>(g.person||'Otros').trim()===p).map(g=>`<div class="v518-line-item">${g.photo?`<img class="v518-thumb" src="${safe(g.photo)}" alt="">`:''}<button class="v518-item-name" onclick="v518GiftEdit(${JSON.stringify(g.id)})">${safe(g.title||'Regalo')}</button><button type="button" class="small-action" onclick="searchPrices(${JSON.stringify(g.id)},'Regalos')">Buscar</button>${g.occasionDate||g.date?`<small class="v518-date">${safe(g.occasionDate||g.date)}</small>`:''}<button type="button" class="delete" aria-label="Eliminar regalo" onclick="v518GiftDelete(${JSON.stringify(g.id)})">×</button></div>`).join('')||'';
  const dates=p=>{const m=meta[p]||{},all=[];
   if(m.birthday)all.push({label:'Cumpleaños',date:m.birthday,annual:true});if(!(m.dates||[]).some(x=>String(x.label||'').toLowerCase()==='navidad'))all.push({label:'Navidad',date:today().slice(0,4)+'-12-25',annual:true});
   (m.dates||[]).forEach(x=>{if(x&&x.label&&x.date)all.push(x)});
   const future=all.map(x=>({...x,next:addYears(x.date,x.annual!==false)})).filter(x=>x.next&&x.next>=now).sort((a,b)=>a.next-b.next);
   return {all,future,nearest:future[0]};
  };
  const group=persons.map((person,index)=>{const d=dates(person),collapsed=localStorage.getItem('oihane_person_fold_'+encodeURIComponent(person))==='1';return `<section class="v518-person-group oihane-person-section" data-person="${safe(person)}"><div class="oihane-person-head"><h3>${safe(person)}</h3><button type="button" class="oihane-person-dates" data-person-dates="${safe(person)}">Fechas importantes</button>${person==='Otros'?'':`<button type="button" class="oihane-person-delete delete" data-person-delete="${safe(person)}" aria-label="Eliminar persona ${safe(person)}" title="Eliminar persona">×</button>`}<button type="button" class="oihane-person-toggle" data-person-toggle="${safe(person)}" aria-expanded="${!collapsed}" aria-label="Plegar o desplegar regalos de ${safe(person)}">${collapsed?'⌄':'⌃'}</button></div><div class="oihane-person-inner ${collapsed?'hidden':''}">${d.nearest?`<p class="oihane-gift-next">Próxima ocasión: <strong>${safe(d.nearest.label)} · ${safe(dateShort(d.nearest.next))}</strong> <span>(${daysUntil(d.nearest.next)} días)</span></p>`:''}${cards(person)}</div></section>`}).join('');
  return {group,persons,meta};
 }
 function enhanceGifts(){const body=$('v518Body');if(!body)return;const hidden=readPeople().__hidden||[];document.querySelectorAll('#v518Person option').forEach(option=>{if(hidden.includes(option.value)&&option.value!=='Otros')option.remove()});const result=giftGroups();body.innerHTML=`<div class="oihane-gifts-head"><button class="small-action" type="button" id="oihaneNewPerson">＋ Persona</button></div>${result.group}`;
  $('oihaneNewPerson').onclick=()=>{const answer=prompt('Nombre de la persona');if(answer===null)return;const name=answer.trim();if(!name)return;const d=readPeople();d.__hidden=(d.__hidden||[]).filter(x=>x!==name);if(!d[name])d[name]={birthday:'',dates:[]};if(savePeople(d))renderExtraModule('Regalos')};
  body.querySelectorAll('[data-person-delete]').forEach(btn=>btn.onclick=()=>{const person=btn.dataset.personDelete;const gifts=extraItems('Regalos'),owned=gifts.filter(g=>(g.person||'Otros').trim()===person);if(!confirm('¿Eliminar a '+person+' de Regalos?'+(owned.length?' Sus '+owned.length+' regalos pasarán a Otros.':'')))return;if(owned.length){owned.forEach(g=>g.person='Otros');if(!saveExtra('Regalos',gifts))return}const meta=readPeople();delete meta[person];meta.__hidden=Array.isArray(meta.__hidden)?meta.__hidden:[];if(!meta.__hidden.includes(person))meta.__hidden.push(person);if(savePeople(meta))renderExtraModule('Regalos')});
  body.querySelectorAll('[data-person-dates]').forEach(btn=>btn.onclick=()=>editPersonDates(btn.dataset.personDates));
  body.querySelectorAll('[data-person-toggle]').forEach(btn=>btn.onclick=()=>{const inner=btn.closest('.oihane-person-section')?.querySelector('.oihane-person-inner');if(!inner)return;inner.classList.toggle('hidden');const isClosed=inner.classList.contains('hidden');btn.textContent=isClosed?'⌄':'⌃';btn.setAttribute('aria-expanded',String(!isClosed));localStorage.setItem('oihane_person_fold_'+encodeURIComponent(btn.dataset.personToggle),isClosed?'1':'0')});
  const personSelect=$('v518Person');if(personSelect){result.persons.forEach(p=>{if(![...personSelect.options].some(o=>o.value===p))personSelect.add(new Option(p,p))})}
  window.oihaneRenderPartnerWishes?.();
 }
 function editPersonDates(person){const meta=readPeople(),p=meta[person]||{birthday:'',dates:[]},old=$('oihaneDatesModal');old?.remove();
  const modal=document.createElement('div');modal.className='v521-modal-wrap';modal.id='oihaneDatesModal';modal.innerHTML=`<form class="v521-modal"><h2>Fechas de ${safe(person)}</h2><label for="personBirthday">Cumpleaños</label><input type="date" id="personBirthday" value="${safe(p.birthday||'')}"><div id="personOtherDates">${(p.dates||[]).map((d,i)=>`<div class="oihane-date-row"><input aria-label="Nombre de la fecha ${i+1}" placeholder="Aniversario, santo…" data-label="${i}" value="${safe(d.label)}"><input aria-label="Fecha ${i+1}" type="date" data-date="${i}" value="${safe(d.date)}"><label class="oihane-check"><input type="checkbox" data-year="${i}" ${d.annual!==false?'checked':''}> Anual</label><button type="button" class="small-action" data-remove="${i}">×</button></div>`).join('')}</div><button type="button" class="small-action" id="personAddDate">＋ Otra fecha</button><div class="v521-actions"><button type="submit" class="primary">Guardar fechas</button><button type="button" class="small-action" id="personCancelDates">Cancelar</button></div></form>`;
  document.body.appendChild(modal);modal.onclick=e=>{if(e.target===modal)modal.remove()};$('personCancelDates').onclick=()=>modal.remove();
  $('personAddDate').onclick=()=>{$('personOtherDates').insertAdjacentHTML('beforeend',`<div class="oihane-date-row"><input placeholder="Ocasión" data-label-new><input type="date" data-date-new><label class="oihane-check"><input type="checkbox" data-year-new checked> Anual</label><button type="button" class="small-action" data-remove-date>×</button></div>`)};
  modal.querySelector('#personOtherDates').onclick=e=>{const b=e.target.closest('[data-remove],[data-remove-date]');if(b)b.closest('.oihane-date-row')?.remove()};
  modal.querySelector('form').onsubmit=e=>{e.preventDefault();const dates=[...modal.querySelectorAll('.oihane-date-row')].map(row=>({label:(row.querySelector('[data-label],[data-label-new]')?.value||'').trim(),date:row.querySelector('[data-date],[data-date-new]')?.value||'',annual:!!row.querySelector('[data-year],[data-year-new]')?.checked})).filter(x=>x.label&&x.date);meta[person]={birthday:$('personBirthday').value,dates};if(savePeople(meta)){modal.remove();renderExtraModule('Regalos')}};
 }
 // Study — targeted add control per section, hours and bidirectional end-time calculation.
 function enhanceStudy(){const main=$('v520Body'),plus=$('v520Add'),panel=$('v520Panel'),form=$('v520Form');if(!main||!form)return;
  if(plus){plus.classList.add('oihane-visually-hidden');plus.setAttribute('tabindex','-1')}
  const kinds=['Guardia','Curso','Tema'];[...main.querySelectorAll('.v520-section')].forEach((section,i)=>{const h=section.querySelector('h2');if(!h||i>2)return;const b=document.createElement('button');b.type='button';b.className='oihane-study-plus';b.textContent='＋ Añadir';b.setAttribute('aria-label','Añadir '+h.textContent.trim());b.onclick=()=>{if(!panel.classList.contains('hidden'))plus.click();section.insertBefore(panel,section.querySelector('.v520-row,.v520-empty')||null);plus.click();const type=$('v520Type');if(type)type.value=kinds[i];const title=$('v520Title');title?.focus();updateStudyKind()};h.insertAdjacentElement('afterend',b)});
  const type=$('v520Type');if(type){type.value=type.value||'Tema';type.parentElement?.classList.add('oihane-study-form');const label=type.previousElementSibling;if(label?.tagName==='LABEL')label.style.display='none';type.style.display='none';type.addEventListener('change',updateStudyKind)}
  const duration=$('v520Duration'),start=$('v520Time');if(start){start.step='60';start.value=String(start.value||'').slice(0,5)}if(duration&&start){
   const originalMinutes=Math.max(1,Math.round(Number(duration.value||60)));
   duration.type='hidden';duration.setAttribute('aria-label','Duración total en minutos');
   const label=duration.previousElementSibling;if(label?.tagName==='LABEL')label.style.display='none';
   const fields=document.createElement('div');fields.className='oihane-duration-grid oihane-study-duration';
   fields.innerHTML='<div><label for="oihaneStudyHours">Duración (horas)</label><input id="oihaneStudyHours" type="number" min="0" max="1680" step="1" inputmode="numeric" value="'+Math.floor(originalMinutes/60)+'"></div><div><label for="oihaneStudyMinutes">Minutos</label><input id="oihaneStudyMinutes" type="number" min="0" max="59" step="1" inputmode="numeric" value="'+(originalMinutes%60)+'"></div>';
   duration.insertAdjacentElement('beforebegin',fields);
   const endWrap=document.createElement('div');endWrap.className='oihane-study-end';
   endWrap.innerHTML='<label for="oihaneStudyEndTime">Hora fin</label><input id="oihaneStudyEndTime" type="time" step="60">';
   duration.insertAdjacentElement('afterend',endWrap);
   const mins=t=>{const a=String(t||'').match(/^(\d{2}):(\d{2})$/);return a?Number(a[1])*60+Number(a[2]):null};
   const format=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
   const calc=()=>{const hh=Number($('oihaneStudyHours').value),mm=Number($('oihaneStudyMinutes').value);
    if(!Number.isInteger(hh)||hh<0||hh>1680||!Number.isInteger(mm)||mm<0||mm>59)return null;
    return hh*60+mm;
   };
   const updateEnd=()=>{const value=calc(),a=mins(start.value);if(value===null||a===null)return;
    duration.value=String(value);
    const end=a+value;$('oihaneStudyEndTime').value=format(end);
    const date=$('v520Date')?.value,endDate=$('v520EndDate');
    if(date&&endDate){const next=new Date(date+'T12:00:00');next.setDate(next.getDate()+Math.floor(end/1440));endDate.value=iso(next)}
   };
   const updateDuration=()=>{const a=mins(start.value),b=mins($('oihaneStudyEndTime').value);
    if(a===null||b===null)return;const minutes=(b-a+1440)%1440;
    $('oihaneStudyHours').value=String(Math.floor(minutes/60));$('oihaneStudyMinutes').value=String(minutes%60);
    duration.value=String(minutes);
    const date=$('v520Date')?.value,endDate=$('v520EndDate');
    if(date&&endDate){const next=new Date(date+'T12:00:00');next.setDate(next.getDate()+(b<a?1:0));endDate.value=iso(next)}
   };
   start.addEventListener('change',updateEnd);
   $('oihaneStudyHours').addEventListener('input',updateEnd);
   $('oihaneStudyMinutes').addEventListener('input',updateEnd);
   $('oihaneStudyEndTime').addEventListener('change',updateDuration);
   updateEnd();
   const original=form.onsubmit;
   form.onsubmit=e=>{const value=calc();if(value===null||value===0){e.preventDefault();alert('Indica una duración válida en horas y minutos.');return}
    duration.value=String(value);original(e);
   };
  }
  const reminder=$('v532StudyNotify');if(reminder){const label=reminder.closest('label');if(label)label.classList.add('oihane-notify-inline')}
  function updateStudyKind(){const current=type?.value;form.querySelectorAll('input,select,textarea').forEach(x=>{if(x.id==='v520Type')return});const end=$('oihaneStudyEndTime');if(end&&current==='Tema')end.closest('.oihane-study-end').style.display='none';else if(end)end.closest('.oihane-study-end').style.display='';}
  updateStudyKind();
 }
 // Calendar — duration in hours and minutes, Maps-only visible picker and responsive fields.
 function enhanceCalendar(){const form=$('eventForm');if(!form||form.dataset.oihane5323)return;form.dataset.oihane5323='1';
  const duration=$('eventDuration');for(const field of [$('eventTime')])if(field){field.step='60';field.value=String(field.value||'').slice(0,5)}if(duration){
    const field=duration.closest('.field');field?.classList.add('oihane-duration-old');
    const block=document.createElement('div');block.className='oihane-calendar-duration';
    block.innerHTML='<label>Duración</label><div class="oihane-duration-grid"><div><label for="oihaneEventHours">Horas</label><input id="oihaneEventHours" type="number" min="0" max="1680" step="1" value="1" inputmode="numeric"></div><div><label for="oihaneEventMinutes">Minutos</label><input id="oihaneEventMinutes" type="number" min="0" max="59" step="1" value="0" inputmode="numeric"></div></div>';
    field?.insertAdjacentElement('afterend',block);
    const total=Math.max(0,Math.round(Number(duration.value||60)));
    $('oihaneEventHours').value=String(Math.floor(total/60));
    $('oihaneEventMinutes').value=String(total%60);
  }
  const location=$('eventLocation');if(location){location.type='hidden';const field=location.closest('.field');field?.classList.add('oihane-map-only');const button=field?.querySelector('.maps-button')||field?.querySelector('button');const buttons=field?.querySelectorAll('button')||[];buttons.forEach(b=>{if(b!==button)b.remove()});if(button){button.textContent='📍 Elegir en Maps';button.setAttribute('aria-label','Elegir ubicación en Maps');button.classList.add('oihane-maps-choice')}const status=document.createElement('div');status.className='oihane-maps-selected';status.textContent=location.value?'Seleccionado: '+location.value:'Ninguna ubicación seleccionada';field?.appendChild(status);location.addEventListener('change',()=>{status.textContent=location.value?'Seleccionado: '+location.value:'Ninguna ubicación seleccionada'})}
  const notify=$('eventNotify');if(notify){const notice=notify.closest('.field'),lead=$('eventNotifyLead')?.closest('.field');if(notice&&lead){notice.classList.add('oihane-notify-row');lead.classList.add('oihane-notify-lead');notice.appendChild(lead);const label=notify.closest('label');if(label)label.innerHTML='<input id="eventNotify" type="checkbox" '+(notify.checked?'checked':'')+'> Avisar';const newNotify=$('eventNotify');const update=()=>lead.classList.toggle('oihane-inactive',!newNotify.checked);newNotify.addEventListener('change',update);update()}}
  wrapCalendarSubmit(form);
 }
 function wrapCalendarSubmit(form){const original=form.onsubmit;if(typeof original!=='function'||original.oihaneMinutesWrapped)return;
  const minuteSubmit=e=>{
   const hours=Number($('oihaneEventHours')?.value||0),minutes=Number($('oihaneEventMinutes')?.value||0);
   if(!Number.isInteger(hours)||hours<0||hours>1680||!Number.isInteger(minutes)||minutes<0||minutes>59||(hours===0&&minutes===0)){
    e.preventDefault();alert('Indica una duración válida en horas y minutos.');return;
   }
   const total=hours*60+minutes,select=$('eventDuration');
   if(select){const value=String(total);let opt=[...select.options].find(o=>o.value===value);if(!opt){opt=new Option(value,value);select.add(opt)}select.value=value}
   const prevIds=new Set(events.map(x=>String(x.id)));const originalTarget=form.dataset.oihaneEditingId;const shareSelected=$('eventShare')?.checked;original(e);
   const saved=originalTarget?events.find(ev=>String(ev.id)===originalTarget):events.find(ev=>!prevIds.has(String(ev.id)));
   if(saved){saved.duration=String(total);saved.durationMinutes=total;delete saved.durationSeconds;if(shareSelected!==undefined)saved.sharedWithPartner=shareSelected;save()}
  };
  minuteSubmit.oihaneMinutesWrapped=true;form.onsubmit=minuteSubmit;
 }
 const oldRenderCalendar=window.renderCalendar;
 if(typeof oldRenderCalendar==='function')window.renderCalendar=function(...args){const result=oldRenderCalendar.apply(this,args);enhanceCalendar();enhanceMonth();scheduleSections();return result};
 const oldEditEvent=window.editEvent;
 if(typeof oldEditEvent==='function')window.editEvent=function(id){oldEditEvent.apply(this,arguments);const form=$('eventForm');if(!form)return;form.dataset.oihaneEditingId=String(id);const ev=events.find(x=>String(x.id)===String(id));if(!ev)return;enhanceCalendar();wrapCalendarSubmit(form);const sharing=$('eventShare');if(sharing)sharing.checked=ev.sharedWithPartner===true;const total=Math.max(1,Math.round(Number(ev.durationSeconds!=null?Number(ev.durationSeconds)/60:(ev.durationMinutes??ev.duration??60))));if($('oihaneEventHours'))$('oihaneEventHours').value=String(Math.floor(total/60));if($('oihaneEventMinutes'))$('oihaneEventMinutes').value=String(total%60);const place=$('eventLocation');place?.dispatchEvent(new Event('change',{bubbles:true}));};
 function enhanceMonth(){if(typeof calendarView==='undefined'||calendarView!=='month')return;const list=$('calendarList');if(!list)return;
  list.querySelectorAll('.month-cell:not(.is-empty)').forEach(cell=>{const raw=cell.getAttribute('onclick')||'',date=raw.match(/\d{4}-\d{2}-\d{2}/)?.[0];if(!date)return;const number=cell.querySelector('strong');if(number)number.classList.add('oihane-month-day');
   cell.querySelectorAll('.month-event,.month-more').forEach(n=>n.remove());
   const all=events.filter(e=>e.date===date).map(e=>({title:e.title,time:e.time||'',kind:'event'})).sort((a,b)=>a.time.localeCompare(b.time));
   all.slice(0,3).forEach(e=>{const label=document.createElement('span');label.className='month-event'+(e.kind==='task'?' is-task':'');label.textContent=e.title+(e.time?' · '+e.time:'');cell.appendChild(label)});
   if(all.length>3){const extra=document.createElement('span');extra.className='month-more';extra.textContent='+'+(all.length-3);cell.appendChild(extra)}
  });
 }
 window.oihaneEnhanceMonth=enhanceMonth; // Invocación directa desde las acciones de mes.
 // Shared section fold controls on the top-right of individual groups.
 const sectionSelectors=['.oihane-shop-section','.v518-list-section','.v519-room-group','.v519-section','.v520-section','.v521-section','.v522-plan-section','.v522-task-section','.v518-person-group','.v532-home-room','.v530-task-group','.v521-trip-card'];
 let pending=false;
 function scheduleSections(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;applySections();compactCompleted();renameHomeSectionSafe()})}
 function renameHomeSectionSafe(){if(typeof screen==='undefined'||screen!=='Hogar')return;renameHomeSection()}
 function wrapShoppingCategories(){if(screen!=='Compras')return;const list=$('productList');if(!list||list.querySelector('.oihane-shop-section'))return;let section=null;
  [...list.children].forEach(child=>{if(child.classList?.contains('category-heading')){section=document.createElement('section');section.className='oihane-shop-section';list.insertBefore(section,child);section.appendChild(child)}else if(section&&child.classList?.contains('shop-row'))section.appendChild(child)});
 }
 function syncLegacySections(){document.querySelectorAll('#app .section-card').forEach(s=>{const icon=s.querySelector('.section-chevron'),body=s.querySelector('.section-card-body');if(!icon||!body)return;const v=body.classList.contains('collapsed')?'⌄':'⌃';if(icon.textContent!==v)icon.textContent=v})}
 document.addEventListener('click',e=>{if(e.target.closest('.section-card-head'))queueMicrotask(syncLegacySections)});
 function applySections(){const root=$('app');if(!root||typeof screen==='undefined'||screen==='home')return;wrapShoppingCategories();syncLegacySections();
  const elements=[...root.querySelectorAll(sectionSelectors.join(','))];elements.forEach((section,index)=>{if(section.dataset.oihaneFoldReady)return;let head=section.querySelector(':scope > h2,:scope > h3,:scope > .v521-section-head,:scope > .v522-plan-head,:scope > .v522-task-head,:scope > .section-card-head,:scope > .section-card-head-row,:scope > .oihane-person-head');if(!head)return;
   // Estudio: título, botón Añadir y flecha comparten la misma fila real.
   if(screen==='Estudio'&&section.classList.contains('v520-section')&&head.matches('h2')){
    const add=head.nextElementSibling;
    if(add?.classList.contains('oihane-study-plus')){
     const bar=document.createElement('div');bar.className='oihane-section-heading oihane-study-heading';
     head.before(bar);bar.append(head,add);head=bar;
    }
   }
   // Person groups have their own targeted collapse button.
   if(section.classList.contains('oihane-person-section'))return;
   section.dataset.oihaneFoldReady='1';head.classList.add('oihane-section-heading');const title=(head.querySelector('h2,h3,strong')||head).textContent?.trim().slice(0,65)||'Sección';const id='oihane_fold_'+screen+'_'+title+'_'+index;
   const button=document.createElement('button');button.type='button';button.className='oihane-section-fold';button.setAttribute('aria-label','Plegar o desplegar '+title);button.dataset.foldKey=id;
   const saved=localStorage.getItem(id)==='1';section.classList.toggle('oihane-section-closed',saved);button.textContent=saved?'⌄':'⌃';button.setAttribute('aria-expanded',String(!saved));head.appendChild(button);
   button.onclick=e=>{e.stopPropagation();const hidden=section.classList.toggle('oihane-section-closed');button.textContent=hidden?'⌄':'⌃';button.setAttribute('aria-expanded',String(!hidden));localStorage.setItem(id,hidden?'1':'0')};
  })
 }
 const obs=new MutationObserver(()=>scheduleSections());const app=$('app');if(app)obs.observe(app,{childList:true,subtree:true});scheduleSections();
})();




/* --- oihane-5327-apartados --- */

/* Estilos por posición: no modifica información ni el contenido de los módulos. */
(()=>{
 'use strict';
 const app=document.getElementById('app');
 if(!app)return;
 const GROUPS=[
  '.home-agenda','.oihane-shop-section','.section-card','.v518-list-section','.v518-person-group',
  '.v519-section','.v519-room-group','.v520-section','.v521-section',
  '.v521-trip-card','.v522-plan-section','.v522-task-section',
  '.oihane-person-section','.v532-home-room','.panel'
 ].join(',');
 const WRAPPERS=':scope > .v521-section-head,:scope > .v522-plan-head,:scope > .v522-task-head,:scope > .section-card-head,:scope > .oihane-person-head,:scope > .home-agenda-heading,:scope > .section-head,:scope > .oihane-section-heading';
 let pending=false;
 function refresh(){
  pending=false;
  // El propio renderizador de Oihane sustituye el contenido de #app al cambiar de módulo.
  const blocks=[...app.querySelectorAll(GROUPS)].filter(el=>
    !el.classList.contains('panel') || !!el.querySelector(':scope > h3,:scope > .section-head'));
  // Numerar por el orden REAL de presentación, no por tipo de sección.
  let index=0;
  for(const el of blocks){
    let title=el.querySelector(':scope > h2,:scope > h3,:scope > .category-heading');
    if(!title){const wrap=el.querySelector(WRAPPERS);
      if(wrap)title=wrap.matches('h2,h3,strong,.category-heading')?wrap:wrap.querySelector('h2,h3,strong');}
    if(!title)continue;
    index++;
    const position=String(((index-1)%8)+1);
    if(el.dataset.oihaneVisualSection!==position)el.dataset.oihaneVisualSection=position;
    title.classList.add('oihane-5327-title');
    for(const h of el.querySelectorAll('h3,h4')){
      if(h===title || h.classList.contains('oihane-5327-title'))continue;
      if(h.closest('.v530-task-group,form,.v521-modal,.integration-box,[data-oihane-visual-section]')!==el)continue;
      h.classList.add('oihane-5327-subtitle');
    }
  }
  // Home: Mi agenda no siempre tiene un contenedor de tipo section-card.
  const homeAgenda=app.querySelector('.home-agenda .home-agenda-heading h2');
  if(homeAgenda){
    const box=homeAgenda.closest('.home-agenda');
    if(box)box.dataset.oihaneVisualSection='1';
    homeAgenda.classList.add('oihane-5327-title');
  }
 }
 const schedule=()=>{if(!pending){pending=true;queueMicrotask(refresh)}};
 const obs=new MutationObserver(schedule);
 obs.observe(app,{childList:true,subtree:true});
 schedule();
})();



/* --- oihane-5340-voz-configurable --- */

/* Único motor de salida. La voz se identifica desde el navegador, no por oído. */
(()=>{
 'use strict';
 const PREF='oihane_assistant_preferences_v1',VOICE='oihane_voice_selection_v1';
 const synth=window.speechSynthesis;
 const supported=()=>!!(synth&&window.SpeechSynthesisUtterance);
 const spanish=()=>supported()?synth.getVoices().filter(v=>/^es(?:[-_]|$)/i.test(v.lang)):[];
 let current=null,lastText='',lastAt=0,ready=false,opening=false,seenResult='',pending=false;
 const enabled=()=>{try{return JSON.parse(localStorage.getItem(PREF)||'{}').speak!==false}catch(_){return true}};
 const saved=()=>{try{return JSON.parse(localStorage.getItem(VOICE)||'null')}catch(_){return null}};
 const voiceKey=v=>v?{name:v.name,lang:v.lang,voiceURI:v.voiceURI}:null;
 const choose=()=>{const voices=spanish(),pref=saved();if(pref){const match=voices.find(v=>v.voiceURI===pref.voiceURI&&v.lang===pref.lang)||voices.find(v=>v.name===pref.name&&v.lang===pref.lang);if(match)return match;}return voices.find(v=>v.lang.toLowerCase().replace('_','-')==='es-es')||voices[0]||null};
 const clean=raw=>String(raw??'').replace(/^[✓✔✗✘]\s*/,'').replace(/\s*[·•]\s*/g,'. ').trim().slice(0,650);
 const speakable=t=>t&&!/^(interpretando|procesando|pensando|escuchando|te escucho|dictado recibido|gemini activado)/i.test(t);
 let request=0;
 function speak(raw,options={}){
  if(!supported()||(!options.test&&!enabled()))return false;
  const text=clean(raw);if(!speakable(text))return false;
  const now=Date.now();if(!options.test&&text===lastText&&now-lastAt<350)return true;
  if(!options.test){lastText=text;lastAt=now;}
  const id=++request;
  try{
   synth.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-ES';u.rate=.98;u.pitch=1;u.volume=1;
   const v=options.voice||choose();if(v){u.voice=v;u.lang=v.lang;}
   current=u;
   window.dispatchEvent(new CustomEvent('oihane-voice-start'));
   u.onend=()=>{if(current===u){current=null;window.dispatchEvent(new CustomEvent('oihane-voice-end'))}};
   u.onerror=e=>{
    if(current!==u||id!==request)return;current=null;
    const error=e.error||'desconocido';window.dispatchEvent(new CustomEvent('oihane-voice-end'));console.warn('Oihane: fallo de voz',error);
    // Solo reintentar errores recuperables; nunca saltar la voz por una cancelación.
    if(!options.retry&&['voice-unavailable','language-unavailable','synthesis-failed'].includes(error)){
      const alt=spanish().find(x=>!v||x.voiceURI!==v.voiceURI);
      if(alt)speak(text,{...options,retry:true,voice:alt});
    }
   };
   synth.speak(u);if(synth.paused)synth.resume();return true;
  }catch(e){window.dispatchEvent(new CustomEvent('oihane-voice-end'));console.warn('Oihane: salida de voz no disponible',e);return false;}
 }
 window.oihaneSpeakReply=speak;
 window.oihaneVoiceDiagnostics=()=>({available:supported(),voices:spanish().map(v=>({...voiceKey(v),localService:v.localService,default:v.default})),selected:voiceKey(choose()),preferred:saved()});
  function attach(){document.querySelectorAll('#assistant .oihane-voice-settings,#oihaneVoicePanel').forEach(node=>node.remove());}
 function prime(e){if(ready||!supported()||!e.target?.closest?.('#assistant'))return;
  try{synth.getVoices();if(synth.paused)synth.resume();ready=true;}catch(_){}}
 document.addEventListener('pointerdown',prime,true);document.addEventListener('keydown',e=>{if(e.key==='Enter')prime(e)},true);
 function observeResult(){pending=false;const el=document.getElementById('assistantResult');if(!el){seenResult='';return}
  const text=el.textContent.trim();if(!text||text===seenResult)return;seenResult=text;speak(text);
 }
 const observer=new MutationObserver(mutations=>{
  attach();
  const relevant=mutations.some(m=>{const t=m.target;if(t?.nodeType===1&&(t.id==='assistantResult'||t.closest?.('#assistantResult')))return true;
   if(t?.parentElement?.closest?.('#assistantResult'))return true;
   return [...m.addedNodes].some(n=>n.nodeType===1&&(n.id==='assistantResult'||n.querySelector?.('#assistantResult')))});
  if(relevant&&!pending){pending=true;queueMicrotask(observeResult)}
 });
 const init=()=>{attach();const first=document.getElementById('assistantResult');if(first)seenResult=first.textContent.trim();observer.observe(document.body,{subtree:true,childList:true,characterData:true})};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();



/* --- oihane-5330-functional-fixes --- */

(()=>{'use strict';
 const app=document.getElementById('app');if(!app)return;
 const own=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const todayLocal=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 window.oihaneOpenWeb=function(raw){try{const u=new URL(String(raw||'').trim());if(!['https:','http:'].includes(u.protocol))throw Error();window.open(u.href,'_blank','noopener,noreferrer')}catch(_){alert('Añade una dirección web válida que comience por https:// o http://.')}};
 window.oihaneMarkObtained=function(id,obtained){const all=extraItems('Wishlist'),item=all.find(x=>String(x.id)===String(id));if(!item)return;item.obtained=!!obtained;saveExtra('Wishlist',all);renderExtraModule('Wishlist')};
 const oldEditHome=window.v519EditHome;
 if(typeof oldEditHome==='function')window.v519EditHome=function(id){oldEditHome.call(this,id);const item=extraItems('Hogar').find(x=>String(x.id)===String(id));if(!item)return;const price=document.getElementById('v519Price'),bf=document.getElementById('v519BlackFriday');if(price)price.value=item.price||'';if(bf)bf.checked=!!item.blackFriday};
 function newResult(text){const form=document.getElementById('assistant');if(!form)return;document.getElementById('assistantResult')?.remove();const box=document.createElement('div');box.className='assistant-response';box.id='assistantResult';box.setAttribute('aria-live','polite');box.textContent=text;form.after(box);window.oihaneSpeakReply?.(text)}
 const previousAssistant=window.handleAssistantCommand;
 if(typeof previousAssistant==='function')window.handleAssistantCommand=function(raw){
  const t=String(raw||'').trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¿?.,!]/g,' ').replace(/\s+/g,' ').trim();
  const taskQuery=/^(?:dime\s+)?(?:cuales?\s+son\s+|que\s+)?(?:las?\s+)?tareas(?:\s+(?:prioritarias|importantes|pendientes))?\s+(?:que\s+)?(?:tengo\s+)?(?:para\s+)?(hoy|manana)$/;
  const m=t.match(taskQuery)||t.match(/^(?:que|cuales)\s+tareas\s+(?:tengo|hay)\s+(hoy|manana)$/)||(!/\b(?:crea|crear|anade|añade|apunta|borra|elimina|cancela|modifica|programa)\b/.test(t)&&/\b(?:tareas|que tengo que hacer)\b/.test(t)&&/\b(hoy|manana)\b/.test(t)?[null,t.match(/\b(hoy|manana)\b/)?.[1]]:null);
  if(!m)return previousAssistant.call(this,raw);
  const base=new Date(todayLocal()+'T12:00:00');if(m[1]==='manana')base.setDate(base.getDate()+1);const day=`${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,'0')}-${String(base.getDate()).padStart(2,'0')}`;
  const relevant=tasks.filter(x=>!x.done&&x.date===day&&Number(x.priority||x.importance||2)>=2).sort((a,b)=>Number(b.priority||b.importance||2)-Number(a.priority||a.importance||2)||(a.time||'').localeCompare(b.time||''));
  newResult(relevant.length?'Tareas prioritarias para '+(day===todayLocal()?'hoy':'mañana')+': '+relevant.map(x=>(x.time?x.time+' · ':'')+x.title).join('; ')+'.':'No tienes tareas prioritarias pendientes para '+(day===todayLocal()?'hoy':'mañana')+'.');
 };
 // Reparar las preguntas de la ruta anterior «qué tengo que hacer hoy»: excluir completadas
 // y fechas equivocadas manteniendo la hora como único metadato temporal.
 // El motor de voz configurable es el único responsable de la reproducción.
 function patchDom(){
  const current=typeof screen==='string'?screen:'';
  // Flechas: se generan directamente con el mismo símbolo en cada controlador.
  // Hogar: mismo buscador de precios que Wishlist. Reutiliza búsqueda original.
  if(current==='Hogar'){
   for(const row of app.querySelectorAll('.v532-home-room .v519-home-row')){
    if(row.dataset.oihane5330)continue; // no duplicar botones
    const edit=row.querySelector('[onclick*="v519EditHome"]'),match=edit?.getAttribute('onclick')?.match(/v519EditHome\((.+?)\)/);if(!match)continue;
    let id;try{id=JSON.parse(match[1])}catch(_){continue}
    row.dataset.oihane5330='1';const obj=extraItems('Hogar').find(x=>String(x.id)===String(id));
    const btn=document.createElement('button');btn.type='button';btn.className='small-action';btn.textContent='Buscar';btn.onclick=()=>searchPrices(id,'Hogar');row.insertBefore(btn,row.querySelector('.delete'));
    if(obj?.blackFriday){const tag=document.createElement('span');tag.className='oihane-blackfriday';tag.textContent='Black Friday';row.insertBefore(tag,btn)}
   }
   const type=document.getElementById('v519Type');if(type&&!type.dataset.oihane5330){type.dataset.oihane5330='1';type.addEventListener('change',()=>{const status=document.getElementById('v519StatusField');if(status&&type.value==='Mis tiendas favoritas')status.style.display='none';else if(status)status.style.display=''})}
   if(type?.value==='Mis tiendas favoritas'){const status=document.getElementById('v519StatusField');if(status)status.style.display='none'}
  }
  if(current==='Regalos'){
    const personBtn=document.getElementById('oihaneNewPerson'),actions=app.querySelector('.v518-actions');if(personBtn&&actions&&!actions.contains(personBtn)){actions.prepend(personBtn)}
    for(const row of app.querySelectorAll('.oihane-person-section .v518-line-item')){
     const btn=row.querySelector('[onclick*="v518GiftEdit"]'),m=btn?.getAttribute('onclick')?.match(/v518GiftEdit\((.+?)\)/);if(!m||row.dataset.oihaneMeta)continue;row.dataset.oihaneMeta='1';let id;try{id=JSON.parse(m[1])}catch(_){continue}
     const gift=extraItems('Regalos').find(x=>String(x.id)===String(id));if(!gift)continue;
     if(gift.price){const price=document.createElement('small');price.className='v518-price';price.textContent=`≤ ${gift.price} €`;btn.after(price)}
     if(gift.notes){const note=document.createElement('span');note.className='v518-note';note.textContent=gift.notes;btn.after(note)}
    }
  }
  // Formulario de guardias: selector particular y campos reordenados sin borrar el resto de cursos.
  if(current==='Estudio'){
   const form=document.getElementById('v520Form'),type=document.getElementById('v520Type');if(form&&type){
    const guard=type.value==='Guardia',select=document.getElementById('oihane5330GuardType');
    if(!select){const label=document.createElement('label');label.htmlFor='oihane5330GuardType';label.textContent='Categoría';label.id='oihane5330GuardLabel';const el=document.createElement('select');el.id='oihane5330GuardType';[['Urgencias','Urgencias'],['Planta','Planta'],['Tarde','Tarde']].forEach(([txt,val])=>el.add(new Option(txt,val)));const title=document.getElementById('v520Title');title?.insertAdjacentElement('afterend',el);el.before(label);
     type.addEventListener('change',()=>queueMicrotask(patchDom));const oldSubmit=form.onsubmit;
     form.onsubmit=function(e){if(type.value==='Guardia'){const title=document.getElementById('v520Title');if(title&&(!title.value||/^(Guardia|Urgencias|Planta|Tarde)$/i.test(title.value)))title.value='Guardia '+el.value;}
      return oldSubmit?.call(this,e)};
    }
    const cat=document.getElementById('oihane5330GuardType'),lab=document.getElementById('oihane5330GuardLabel');if(cat){cat.hidden=!guard;lab.hidden=!guard;const title=document.getElementById('v520Title');if(title&&guard){const existing=title.value.match(/Guardia (Urgencias|Planta|Tarde)/i);if(existing)cat.value=existing[1].charAt(0).toUpperCase()+existing[1].slice(1).toLowerCase();}}
    const mode=document.getElementById('v520Mode');if(mode){mode.hidden=guard;const ml=mode.previousElementSibling;if(ml?.tagName==='LABEL')ml.hidden=guard}
    const endDate=document.getElementById('v520EndDate'),endTime=document.getElementById('oihaneStudyEndTime');if(endDate){const l=endDate.previousElementSibling;if(l?.tagName==='LABEL')l.textContent='Fecha fin'}if(endTime){const l=endTime.previousElementSibling;if(l?.tagName==='LABEL')l.textContent='Hora fin'}
   }
  }
 }
 app.addEventListener('click',e=>{if(e.target.closest('.oihane-study-plus,#v520Add,[data-v520-title]'))queueMicrotask(patchDom)});
 let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;patchDom()})};
 new MutationObserver(schedule).observe(app,{subtree:true,childList:true});schedule();
})();



/* --- oihane-5360-account-ownership --- */

// Migración no destructiva: fijar el propietario de los datos ya iniciados.
(()=>{const k='oihaneAccountOwnerV1',id=localStorage.getItem('oihane_sync_user');if(id&&!localStorage.getItem(k))localStorage.setItem(k,id)})();(()=>{const k='oihaneAccountOwnerV1',id=localStorage.getItem('oihane_sync_user');if(id&&!localStorage.getItem(k))localStorage.setItem(k,id)})();