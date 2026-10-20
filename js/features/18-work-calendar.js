/* Oihane 5.54.0 · Trabajo unificado. Sin dependencia de servicios de pago.
   Conserva el almacenamiento y los registros de pareja oihane:work:v1: de 5.53.
   Las rotaciones no se vuelcan al Calendario general automáticamente.
*/
(function(){
'use strict';
const STORAGE='oihane_work_v1',PREFIX='oihane:work:v1:',PEOPLE=['Oihane','Rubén'];
const PERIODS=['Vacaciones','AP','Festivo','Libre','Saliente'];
const ROTATION_HOURS={Mañana:['06:00','14:00'],Tarde:['14:00','22:00'],Noche:['22:00','04:30']};
const ADD_HOURS={Guardia:['08:00','08:00'],Tarde:['15:00','22:00']};
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const dayISO=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseDay=v=>new Date(`${v}T12:00:00`);
const isDay=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(+parseDay(v))&&dayISO(parseDay(v))===v;
const plusDays=(v,n)=>{const d=parseDay(v);d.setDate(d.getDate()+n);return dayISO(d)};
const monday=v=>{const d=parseDay(v);d.setDate(d.getDate()-(d.getDay()+6)%7);return dayISO(d)};
const diffDays=(a,b)=>Math.round((Date.UTC(...a.split('-').map((x,i)=>i===1?Number(x)-1:Number(x)))-Date.UTC(...b.split('-').map((x,i)=>i===1?Number(x)-1:Number(x))))/86400000);
const me=()=>linked&&userId===linked.user_b?'Rubén':window.oihaneIsRuben?.()?'Rubén':'Oihane';
const partner=()=>me()==='Oihane'?'Rubén':'Oihane';
const rKey=p=>PREFIX+p+':rotation';
const eKey=(p,id)=>PREFIX+p+':entry:'+id;
const studyKey=id=>PREFIX+'Oihane:study:'+id;
function defaultState(){return {version:1,records:{},pending:{}}}
function read(){try{const v=JSON.parse(localStorage.getItem(STORAGE)||'null');if(v&&v.version===1&&v.records&&v.pending)return v}catch(_){}return defaultState()}
let data=read(),linked=null,userId='',busy=false,workOpen=false,chosenDay='',editingKey='',notice='';
let month=new Date(new Date().getFullYear(),new Date().getMonth(),1);
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(data));window.queueLocalSnapshot?.();window.queueCloudSync?.();return true}catch(e){alert('No se ha podido guardar Trabajo. Revisa el almacenamiento y conserva tu copia de seguridad.');return false}}
function store(key,value){data.records[key]=value;data.pending[key]='upsert';if(save()){draw();greeting();void sync()}}
function remove(key){const item=data.records[key];if(!item)return;delete data.records[key];data.pending[key]='delete';syncGeneral(null,key);if(save()){draw();greeting();void sync()}}
function rotation(person){return data.records[rKey(person)]||null}
function cycle(config){if(!config)return[];if(config.mode==='3')return ['Mañana','Tarde','Noche'];if(config.mode==='2')return ['Mañana','Tarde'];if(config.mode==='1')return [config.first||'Mañana'];return []}
function shift(person,day){
 const cfg=rotation(person);if(!cfg||!isDay(cfg.anchor)||!isDay(day))return null;
 const seq=cycle(cfg);if(!seq.length)return null;
 const initial=seq.includes(cfg.first)?seq.indexOf(cfg.first):0;
 const weeks=Math.floor(diffDays(monday(day),monday(cfg.anchor))/7);
 const name=seq[((initial+weeks)%seq.length+seq.length)%seq.length];
 const weekday=parseDay(day).getDay();
 if(weekday===0)return null;
 if(weekday===6&&!(cfg.saturdayMorning===true&&name==='Mañana'))return null;
 // En rotaciones se guardan las horas estándar por cada turno; no es preciso editarlas semana a semana.
 const times=cfg.hours?.[name]||ROTATION_HOURS[name];
 return {person,kind:name,start:day,end:day,startTime:times[0],endTime:times[1],rotation:true};
}
function entries(person){return Object.entries(data.records).filter(([k,x])=>k.startsWith(PREFIX)&&x&&x.person===person&&x.kind!=='rotation').map(([key,x])=>({...x,_key:key}))}
function covers(item,day){return item.start<=day&&(PERIODS.includes(item.kind)?(item.end||item.start)>=day:item.start===day)}
function daily(person,day){const manual=entries(person).filter(x=>covers(x,day));if(manual.length)return manual;const auto=shift(person,day);return auto?[auto]:[]}
function allDaily(day){return PEOPLE.flatMap(p=>daily(p,day))}
function ownLabel(item){return item.person==='Rubén'?'ruben':'oihane'}
function detail(item){
 const time=PERIODS.includes(item.kind)?'Todo el día':(item.startTime&&item.endTime?item.startTime+'–'+item.endTime+(item.endTime<=item.startTime?' (+1 día)':''):'');
 const type=item.kind==='Guardia'?(item.guardType||(/urgencias/i.test(item.title||'')?'Urgencias':/planta/i.test(item.title||'')?'Planta':'')) : '';
 return [item.person,item.kind,type,item.location||'',time].filter(Boolean).join(' · ');
}
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n}
function button(text,onClick,className){const b=el('button',className,text);b.type='button';b.addEventListener('click',onClick);return b}
function formField(form,label,type,name,value){
 const div=el('div','field oihane-work-field');const lab=el('label','',label);lab.htmlFor='oihaneWork_'+name;
 const inp=document.createElement('input');inp.type=type;inp.name=name;inp.id='oihaneWork_'+name;inp.value=value||'';
 div.append(lab,inp);form.append(div);return inp;
}
function formSelect(form,label,name,options,value){
 const div=el('div','field oihane-work-field');const lab=el('label','',label);lab.htmlFor='oihaneWork_'+name;
 const input=document.createElement('select');input.name=name;input.id='oihaneWork_'+name;
 for(const [val,display] of options){const option=document.createElement('option');option.value=val;option.textContent=display;input.append(option)}
 input.value=value||options[0][0];div.append(lab,input);form.append(div);return input;
}
function formCheck(form,label,value,name){const div=el('label','inline-check oihane-work-check');const input=document.createElement('input');input.type='checkbox';input.name=name;input.checked=!!value;div.append(input,document.createTextNode(' '+label));form.append(div);return input}
function formActions(form,submitText,cancel,removeAction){const row=el('div','oihane-work-form-actions');const saveBtn=button(submitText,()=>{},'primary');saveBtn.type='submit';row.append(saveBtn,button('Cancelar',cancel,'small-action'));if(removeAction)row.append(button('Eliminar',removeAction,'small-action oihane-work-delete'));form.append(row)}
function renderForm(title,cb){const host=$('oihaneWorkEditor');if(!host)return;host.replaceChildren();const box=el('section','panel oihane-work-form-panel');box.append(el('h3','',title));host.append(box);cb(box);host.scrollIntoView({block:'nearest',behavior:'smooth'})}
function cancelForm(){const host=$('oihaneWorkEditor');host?.replaceChildren();editingKey=''}
function changeMonth(offset){month=new Date(month.getFullYear(),month.getMonth()+offset,1);draw()}
function monthName(){return month.toLocaleDateString('es-ES',{month:'long',year:'numeric'})}
function cell(day,currentMonth){
 const list=allDaily(day);const box=el('div','oihane-work-day'+(day.slice(0,7)!==currentMonth?' is-out':'')+(day===dayISO(new Date())?' is-today':''));
 const dayBtn=button(String(parseDay(day).getDate()),()=>openDay(day),'oihane-work-day-no');dayBtn.setAttribute('aria-label','Ver trabajo del '+day);box.append(dayBtn);
 for(const item of list.slice(0,3)){
  const pill=button(item.kind,()=>item.rotation?openDay(day):editEntry(item),'oihane-work-pill '+ownLabel(item));pill.title=detail(item);pill.setAttribute('aria-label',detail(item));box.append(pill);
 }
 if(list.length>3)box.append(button('+'+(list.length-3),()=>openDay(day),'oihane-work-more'));
 return box;
}
function draw(){
 if(!workOpen||typeof screen==='undefined'||screen!=='Calendario')return;
 const area=$('oihaneWorkPanel');if(!area)return;
 // No destruir un formulario que alguien está rellenando al llegar la sincronización.
 if(area.querySelector('#oihaneWorkEditor form'))return;
 area.replaceChildren();
 const toolbar=el('div','oihane-work-toolbar');
 const left=el('div','oihane-work-month');left.append(button('‹',()=>changeMonth(-1),'oihane-work-prev'),el('strong','',monthName()),button('›',()=>changeMonth(1),'oihane-work-next'));
 const right=el('div','oihane-work-tools');right.append(button('Rotación',()=>editRotation(),'small-action'),button('＋ Añadir',()=>editEntry(null),'primary'));
 toolbar.append(left,right);area.append(toolbar);
 const legend=el('div','oihane-work-legend');legend.append(el('span','oihane-legend-pink','Oihane'),el('span','oihane-legend-green','Rubén'));area.append(legend);
 const board=el('div','oihane-work-board');for(const title of ['L','M','X','J','V','S','D'])board.append(el('div','oihane-work-dow',title));
 const first=monday(dayISO(month));const monthStr=dayISO(month).slice(0,7);
 for(let i=0;i<42;i++)board.append(cell(plusDays(first,i),monthStr));area.append(board);
 const chosen=$('oihaneWorkEditor');if(!chosen){const host=el('div','oihane-work-editor');host.id='oihaneWorkEditor';area.append(host)}
 if(notice){const status=el('p','hint oihane-work-sync-hint',notice);status.id='oihaneWorkHint';area.append(status)}
}
function openDay(day){
 chosenDay=day;
 renderForm('Trabajo · '+parseDay(day).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}),box=>{
  const items=allDaily(day);if(!items.length)box.append(el('p','hint','Sin turnos configurados para este día.'));
  for(const item of items){const row=el('div','oihane-work-day-detail '+ownLabel(item));
   row.append(el('span','',detail(item)));
   if(!item.rotation){row.append(button(item.imported?'Abrir en Estudio':'Editar',()=>editEntry(item),'small-action'))}
   box.append(row);
  }
  box.append(button('＋ Añadir a este día',()=>editEntry(null,day),'primary'),button('Cerrar',cancelForm,'small-action'));
 });
}
function editRotation(){
 renderForm('Configurar rotación',box=>{
  const form=el('form','oihane-work-form');box.append(form);
  const person=formSelect(form,'Calendario de','person',PEOPLE.map(p=>[p,p]),'Rubén');
  const cfg=rotation(person.value);
  const mode=formSelect(form,'Sistema de turnos','mode',[['1','Turno fijo'],['2','Rotativo: mañana y tarde'],['3','Rotativo: mañana, tarde y noche']],cfg?.mode||'3');
  const first=formSelect(form,'Turno de la semana de referencia','first',Object.keys(ROTATION_HOURS).map(k=>[k,k]),cfg?.first||'Mañana');
  const anchor=formField(form,'Una fecha de la semana de referencia','date','anchor',cfg?.anchor||dayISO(new Date()));
  const start=formField(form,'Hora de inicio','time','startTime',ROTATION_HOURS[first.value][0]);
  const end=formField(form,'Hora de fin','time','endTime',ROTATION_HOURS[first.value][1]);
  const sat=formCheck(form,'Activar sábados en turno de mañana',cfg?.saturdayMorning===true,'saturday');
  form.append(el('p','hint oihane-work-form-note','Rotación semanal de lunes a viernes. El sábado solo se añade en las semanas de mañana al marcar la casilla. Los turnos de noche terminan al día siguiente.'));
  function loaded(){return rotation(person.value)}
  function refreshPerson(){const x=loaded();mode.value=x?.mode||'3';first.value=x?.first||'Mañana';anchor.value=x?.anchor||dayISO(new Date());sat.checked=x?.saturdayMorning===true;update();}
  function update(){const allowed=mode.value==='2'?['Mañana','Tarde']:mode.value==='3'?['Mañana','Tarde','Noche']:['Mañana','Tarde','Noche'];for(const option of first.options)option.disabled=!allowed.includes(option.value);if(!allowed.includes(first.value))first.value=allowed[0];const config=loaded();const pair=config?.hours?.[first.value]||ROTATION_HOURS[first.value];start.value=pair[0];end.value=pair[1];}
  person.addEventListener('change',refreshPerson);mode.addEventListener('change',update);first.addEventListener('change',update);update();
  formActions(form,'Guardar rotación',cancelForm);
  form.addEventListener('submit',e=>{
   e.preventDefault();if(!isDay(anchor.value)||!start.value||!end.value)return alert('Comprueba la fecha y las horas.');
   const existing=rotation(person.value)||{};
   const hours={...existing.hours,[first.value]:[start.value,end.value]};
   const config={kind:'rotation',person:person.value,mode:mode.value,first:first.value,pair:'MT',anchor:monday(anchor.value),hours,saturdayMorning:sat.checked};
   cancelForm();store(rKey(person.value),config);
  });
 });
}
function importedStudy(){
 if(me()!=='Oihane'||typeof extraItems!=='function')return[];
 const items=extraItems('Estudio').filter(x=>x?.kind==='Guardia'&&isDay(x.date));
 return items.map(x=>{
  const title=String(x.title||'Guardia');const guardType=/urgencias/i.test(title)||/urgencias/i.test(x.notes||'')?'Urgencias':/planta/i.test(title)||/planta/i.test(x.notes||'')?'Planta':String(x.guardType||'');
  return {id:String(x.id),kind:'Guardia',person:'Oihane',title,guardType,location:String(x.location||x.place||''),start:x.date,end:x.date,
   startTime:x.time||'08:00',endTime:Number(x.duration)>=1440?'08:00':'20:00',hours:Number(x.duration)>=1440?24:12,
   imported:true,sourceModule:'Estudio',sourceId:String(x.id),addToCalendar:false};
 });
}
function importedPlans(study){
 if(me()!=='Oihane'||typeof extraItems!=='function')return [];
 const seen=new Set(study.map(x=>x.start+'|'+x.title.toLowerCase()));
 return extraItems('Planes').filter(x=>x&&isDay(x.date)&&(/\bguardia\b/i.test(x.title||'')||/\bguardia\b/i.test(x.kind||'')||/\bguardia\b/i.test(x.category||'')))
  .filter(x=>!seen.has(x.date+'|'+String(x.title||'').toLowerCase())).map(x=>{
   const title=String(x.title||'Guardia'),notes=String(x.notes||'');
   const guardType=/urgencias/i.test(title+' '+notes)?'Urgencias':/planta/i.test(title+' '+notes)?'Planta':'';
   return {id:String(x.id),kind:'Guardia',person:'Oihane',title,guardType,location:String(x.location||x.place||''),start:x.date,end:x.date,
    startTime:x.time||'08:00',endTime:Number(x.duration)>=1440?'08:00':'20:00',hours:Number(x.duration)>=1440?24:12,
    imported:true,sourceModule:'Planes',sourceId:String(x.id),addToCalendar:false};
  });
}
function syncGuardMirrors(){
 if(!linked||!userId||userId!==linked.user_a)return;
 let modified=false;const study=importedStudy(),guards=[...study,...importedPlans(study)],keys=new Set();
 for(const item of guards){const k=item.sourceModule==='Planes'?PREFIX+'Oihane:plan:'+item.id:studyKey(item.id);keys.add(k);if(JSON.stringify(data.records[k])!==JSON.stringify(item)){data.records[k]=item;data.pending[k]='upsert';modified=true}}
 for(const k of Object.keys(data.records))if((k.startsWith(PREFIX+'Oihane:study:')||k.startsWith(PREFIX+'Oihane:plan:'))&&!keys.has(k)){delete data.records[k];data.pending[k]='delete';modified=true}
 if(modified)save();
}
function editEntry(item=null,prefDate=''){
 if(item?.imported){if(me()==='Oihane'&&typeof openModule==='function')openModule(item.sourceModule==='Planes'?'Planes':'Estudio');else alert('Esta guardia importada se edita desde la cuenta de Oihane.');return;}
 editingKey=item?item._key:'';
 renderForm(item?'Editar elemento':'Añadir trabajo',box=>{
  const form=el('form','oihane-work-form');box.append(form);
  const who=formSelect(form,'Calendario de','person',PEOPLE.map(p=>[p,p]),item?.person||me());
  const type=formSelect(form,'Turno','kind',['Guardia','Tarde',...PERIODS].map(t=>[t,t]),item?.kind||'Guardia');
  const start=formField(form,'Fecha de inicio','date','start',item?.start||prefDate||dayISO(new Date()));
  const end=formField(form,'Fecha fin','date','end',item?.end||plusDays(start.value,1));
  const timeStart=formField(form,'Hora de inicio','time','startTime',item?.startTime||'08:00');
  const timeEnd=formField(form,'Hora fin','time','endTime',item?.endTime||'08:00');
  // Metadatos de las guardias conservados para consultas desde el calendario.
  const guardType=formSelect(form,'Tipo de guardia','guardType',[['','Sin especificar'],['Planta','Planta'],['Urgencias','Urgencias']],item?.guardType||'');
  const location=formField(form,'Ubicación de la guardia','text','location',item?.location||'');
  const share=formCheck(form,'Añadir también al Calendario general',item?.addToCalendar===true,'addToCalendar');
  form.append(el('p','hint oihane-work-form-note','Los turnos quedan en Trabajo y se comparten con la pareja. El calendario general solo recibe los elementos que marques.'));
  function typeChanged(){const current=type.value,allDay=PERIODS.includes(current),guard=current==='Guardia';
   for(const input of [timeStart,timeEnd])input.closest('.field').hidden=allDay;
   guardType.closest('.field').hidden=!guard;location.closest('.field').hidden=!guard;
   if(!item||current!==item.kind){if(guard){timeStart.value='08:00';timeEnd.value='08:00';end.value=plusDays(start.value,1)}else if(current==='Tarde'){timeStart.value='15:00';timeEnd.value='22:00';end.value=start.value}else{timeStart.value='';timeEnd.value='';end.value=start.value}}
  }
  type.addEventListener('change',typeChanged);
  start.addEventListener('change',()=>{if(type.value==='Guardia'&&(!item||start.value!==item.start))end.value=plusDays(start.value,1);else if(!PERIODS.includes(type.value))end.value=start.value});
  typeChanged();if(item){start.value=item.start;end.value=item.end||item.start;timeStart.value=item.startTime||timeStart.value;timeEnd.value=item.endTime||timeEnd.value;}
  formActions(form,'Guardar',cancelForm,item?()=>{if(confirm('¿Eliminar este elemento de Trabajo?')){const keyToDelete=editingKey;cancelForm();remove(keyToDelete)}}:null);
  form.addEventListener('submit',e=>{
   e.preventDefault();if(!isDay(start.value)||!isDay(end.value)||end.value<start.value)return alert('Comprueba las fechas de inicio y fin.');
   if(diffDays(end.value,start.value)>366)return alert('El periodo no puede superar un año.');
   if(!PERIODS.includes(type.value)&&(!timeStart.value||!timeEnd.value))return alert('Indica las horas.');
   const id=item?.id||String(Date.now())+'-'+Math.random().toString(36).slice(2,8);
   const key=eKey(who.value,id),oldKey=editingKey;
   const created={person:who.value,kind:type.value,id,start:start.value,end:end.value,
     startTime:timeStart.value,endTime:timeEnd.value,
     hours:type.value==='Guardia'?(end.value>start.value?24:12):0,
     guardType:type.value==='Guardia'?guardType.value:'',location:type.value==='Guardia'?location.value.trim():'',
     title:type.value==='Guardia'?'Guardia'+(guardType.value?' de '+guardType.value:''):type.value,
     addToCalendar:share.checked};
   cancelForm();if(oldKey&&oldKey!==key){remove(oldKey)}
   store(key,created);syncGeneral(created,key);
  });
 });
}
function syncGeneral(item,key){
 if(typeof events==='undefined'||typeof save!=='function')return;
 const old=events.find(x=>x.sourceModule==='Trabajo'&&String(x.sourceId)===key);
 if(!item||!item.addToCalendar){if(old){events=events.filter(e=>e!==old);save()}return}
 const obj={id:old?.id||Date.now()+Math.round(Math.random()*999),title:item.title,date:item.start,
  time:PERIODS.includes(item.kind)?'':item.startTime,duration:item.hours===24?1440:60,
  location:item.location||'',notes:item.end!==item.start?'Hasta '+item.end:'',
  sourceModule:'Trabajo',sourceId:key,sharedWithPartner:true,notify:false};
 if(old)Object.assign(old,obj);else events.push(obj);save();
}
function greeting(){
 if(typeof screen==='undefined'||screen!=='home')return;
 const header=document.querySelector('.home-greeting-row');if(!header)return;
 let line=$('oihaneWorkGreeting');if(!line){line=el('div','oihane-work-greeting');line.id='oihaneWorkGreeting';header.insertAdjacentElement('afterend',line)}
 const person=partner(),today=dayISO(new Date()),list=daily(person,today);
 if(!list.length){line.textContent=person==='Rubén'?'Configura los turnos de Rubén en Calendario → Trabajo':'Consulta los turnos de Oihane en Calendario → Trabajo';return}
 const item=list[0];const work=item.kind;
 line.textContent=person==='Rubén'?(PERIODS.includes(work)?'Rubén: '+work.toLowerCase()+' hoy':work==='Guardia'?'Rubén está de guardia hoy':'Rubén trabaja de '+work.toLowerCase()+' esta semana'):
 (work==='Guardia'?'Oihane está de guardia hoy':PERIODS.includes(work)?'Oihane: '+work.toLowerCase()+' hoy':'Oihane trabaja de '+work.toLowerCase()+' hoy');
}
function mount(){
 if(typeof screen==='undefined'||screen!=='Calendario')return;
 const app=$('app'),tabs=app?.querySelector('.module-toolbar .subtabs');if(!tabs)return;
 // ID fijo: la v5.53 creaba un botón nuevo cada vez porque nunca asignaba su ID.
 // Reutilizar una sola pestaña incluso si una versión anterior dejó botones sin ID.
 const found=[...tabs.querySelectorAll('button')].filter(b=>b.id==='oihaneWorkTab'||b.classList.contains('oihane-work-tab')||b.textContent.trim()==='Trabajo');
 let tab=found[0]||null;
 for(const duplicate of found.slice(1))duplicate.remove();
 if(!tab){tab=el('button','oihane-work-tab','Trabajo');tab.type='button';tabs.append(tab)}
 tab.id='oihaneWorkTab';tab.classList.add('oihane-work-tab');
 // No asociar otro evento al botón heredado si ya se configuró.
 if(!tab.dataset.oihaneWorkBound){tab.addEventListener('click',openWork);tab.dataset.oihaneWorkBound='1'}
 const panels=[...app.querySelectorAll('#oihaneWorkPanel,.oihane-work-panel')];
 let work=panels[0]||null;for(const extra of panels.slice(1))extra.remove();
 if(!work){work=el('section','oihane-work-panel');tabs.closest('.module-toolbar').insertAdjacentElement('afterend',work)}
 work.id='oihaneWorkPanel';
 app.classList.toggle('oihane-work-active',workOpen);tab.classList.toggle('active',workOpen);
 work.hidden=!workOpen;if(workOpen)draw();
}
function openWork(){if(workOpen){mount();return}workOpen=true;mount();void sync()}
function closeWork(){workOpen=false;$('app')?.classList.remove('oihane-work-active');const panel=$('oihaneWorkPanel');if(panel)panel.hidden=true;$('oihaneWorkTab')?.classList.remove('active')}
async function sync(){
 if(busy||!window.oihaneSyncRuntime||typeof syncConfig!=='function'||!syncConfig().access)return;
 const id=localStorage.getItem('oihane_sync_user')||'';if(!id)return;
 busy=true;
 try{
  const api=window.oihaneSyncRuntime.request;
  const links=await api('/rest/v1/oihane_partner_links?select=id,user_a,user_b&status=eq.active&limit=1',{method:'GET'});
  linked=links?.find(x=>x&&[x.user_a,x.user_b].includes(id))||null;userId=id;
  if(!linked){notice='Pareja no vinculada: los turnos están guardados solo en este dispositivo.';return}
  syncGuardMirrors();notice='';
  const path='/rest/v1/oihane_shared_records?select=id,source_key,owner_id,link_id,shared,payload,revision,deleted_at&module=eq.pedidos&link_id=eq.'+encodeURIComponent(linked.id)+'&source_key=like.'+encodeURIComponent(PREFIX+'%')+'&limit=1000';
  let rows=await api(path,{method:'GET'});if(!Array.isArray(rows))throw Error('No se pudieron leer los turnos compartidos');
  const performed=[];
  for(const [key,op] of Object.entries({...data.pending})){
   const remote=rows.find(x=>x.source_key===key),item=data.records[key];
   if(op==='delete'){
    if(remote&&!remote.deleted_at)await api('/rest/v1/oihane_shared_records?id=eq.'+encodeURIComponent(remote.id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({deleted_at:new Date().toISOString(),deleted_by:id})});
    performed.push(key);continue;
   }
   if(!item){performed.push(key);continue}
   if(remote){await api('/rest/v1/oihane_shared_records?id=eq.'+encodeURIComponent(remote.id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({payload:item,shared:true,deleted_at:null})})}
   else{await api('/rest/v1/oihane_shared_records',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({link_id:linked.id,owner_id:id,module:'pedidos',source_key:key,shared:true,payload:item})})}
   performed.push(key);
  }
  for(const key of performed)delete data.pending[key];
  rows=await api(path,{method:'GET'});
  for(const row of rows){if(data.pending[row.source_key])continue;
   if(row.deleted_at){delete data.records[row.source_key];continue}
   if(row.payload&&typeof row.payload==='object'&&PEOPLE.includes(row.payload.person))data.records[row.source_key]=row.payload;
  }
  save();draw();greeting();
 }catch(err){notice='No se han podido sincronizar los turnos. Se conservarán localmente.';console.warn('Oihane Trabajo',err)}finally{busy=false}
}
function initialize(){
 const oldCalendar=window.renderCalendar;
 if(typeof oldCalendar==='function')window.renderCalendar=function(){const preserve=workOpen&&screen==='Calendario';const result=oldCalendar.apply(this,arguments);workOpen=preserve;mount();return result};
 const oldSetView=window.setCalendarView;
 if(typeof oldSetView==='function')window.setCalendarView=function(){closeWork();return oldSetView.apply(this,arguments)};
 const oldHome=window.home;
 if(typeof oldHome==='function')window.home=function(){const result=oldHome.apply(this,arguments);greeting();return result};
 const oldSaveExtra=window.saveExtra;
 if(typeof oldSaveExtra==='function')window.saveExtra=function(name,items){const ok=oldSaveExtra.apply(this,arguments);if(ok!==false&&name==='Estudio'){syncGuardMirrors();void sync()}return ok};
 window.oihaneWorkRotation=(person,day)=>shift(person,day)?.kind||'';
 window.oihaneWorkSync=sync;
 if(window.oihaneSyncRuntime)window.oihaneSyncRuntime.register('work-calendars',sync,{minute:true,focus:true,visible:true,online:true});
 syncGuardMirrors();mount();greeting();setTimeout(()=>{void sync()},900);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
