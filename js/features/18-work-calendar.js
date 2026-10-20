/* Oihane 5.53.0 — Trabajo: turnos, vacaciones y guardias de la pareja.
   Persistencia local sin conexión y registros granulares RLS para la pareja.
   Las filas Trabajo usan un prefijo reservado y nunca aparecen en Pedidos.
*/
(function(){
'use strict';
const KEY='oihane_work_v1',PREFIX='oihane:work:v1:',MODULE='pedidos';
const PEOPLE=['Oihane','Rubén'],SHIFTS=['Mañana','Tarde','Noche'];
const DAY_MS=86400000;
const $=id=>document.getElementById(id);
let data,link=null,uid='',connected=false,syncBusy=false,active=false,editing='',personSelected='Rubén';
const months={Oihane:new Date(),Rubén:new Date()};
let lastError='';
function clean(x){return String(x==null?'':x).trim()}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function date(x){return new Date(clean(x)+'T12:00:00')}
function valid(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(date(s).getTime())&&iso(date(s))===s}
function monday(x){const d=date(x);if(!isFinite(+d))return iso(new Date());d.setDate(d.getDate()-(d.getDay()+6)%7);return iso(d)}
function dayDiff(a,b){return Math.round((Date.UTC(...a.split('-').map((x,i)=>i===1?+x-1:+x))-Date.UTC(...b.split('-').map((x,i)=>i===1?+x-1:+x)))/DAY_MS)}
function addDays(s,n){let d=date(s);d.setDate(d.getDate()+n);return iso(d)}
function currentPerson(){return window.oihaneIsRuben?.()?'Rubén':'Oihane'}
function partner(){return currentPerson()==='Rubén'?'Oihane':'Rubén'}
function keyRotation(person){return PREFIX+person+':rotation'}
function keyEntry(person,id){return PREFIX+person+':entry:'+id}
function json(x){return JSON.parse(JSON.stringify(x))}
function read(){
 try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&v.version===1&&v.records&&v.pending)return v;}catch(_){}
 return {version:1,records:{},pending:{}};
}
data=read();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));window.queueLocalSnapshot?.();}catch(e){console.warn('Oihane Trabajo: no se puede guardar',e)}}
function localSave(k,v){data.records[k]=v;data.pending[k]='upsert';persist();draw();renderHome();}
function localDelete(k){delete data.records[k];data.pending[k]='delete';persist();draw();renderHome();}
function list(person){return Object.entries(data.records).filter(([k,v])=>k.startsWith(PREFIX)&&v&&v.person===person&&v.kind!=='rotation').map(([k,v])=>({...v,_key:k})).sort((a,b)=>clean(a.start).localeCompare(clean(b.start)))}
function rotation(person){return data.records[keyRotation(person)]||null}
function order(cfg){
 if(!cfg)return[];
 if(cfg.mode==='3')return ['Mañana','Tarde','Noche'];
 if(cfg.mode==='2')return cfg.pair==='MT'?['Mañana','Tarde']:cfg.pair==='TN'?['Tarde','Noche']:['Mañana','Noche'];
 if(cfg.mode==='1')return [cfg.first||'Mañana'];
 return [];
}
function shiftOn(person,when){
 const cfg=rotation(person);if(!cfg||!valid(cfg.anchor))return'';
 const seq=order(cfg);if(!seq.length)return'';
 const shift=seq.includes(cfg.first)?seq.indexOf(cfg.first):0;
 const weeks=Math.floor(dayDiff(monday(when),monday(cfg.anchor))/7);
 return seq[((shift+weeks)%seq.length+seq.length)%seq.length];
}
function covering(item,day){return item.start<=day&&(item.end||item.start)>=day;}
function studyGuards(){
 if(currentPerson()!=='Oihane'||typeof extraItems!=='function')return [];
 return extraItems('Estudio').filter(x=>x&&x.kind==='Guardia'&&valid(x.date)).map(x=>({
  person:'Oihane',kind:'Guardia',title:x.title||'Guardia',start:x.date,end:x.date,
  startTime:x.time||'08:00',endTime:Number(x.duration)>=1440?'08:00':'20:00',
  hours:Number(x.duration)>=1440?24:12,originStudy:true,sourceId:String(x.id)
 }));
}
function dayEntries(person,day){
 const own=list(person).filter(x=>covering(x,day));
 if(person==='Oihane'&&currentPerson()==='Oihane'){
  const keys=new Set(own.filter(x=>x.originStudy).map(x=>String(x.sourceId)));
  for(const g of studyGuards())if(covering(g,day)&&!keys.has(g.sourceId))own.push(g);
 }
 return own;
}
function summary(person,day){const a=dayEntries(person,day),absence=a.find(x=>['Vacaciones','Festivo','Libre'].includes(x.kind));
 if(absence)return absence.kind.toLowerCase();
 const guard=a.find(x=>x.kind==='Guardia');if(guard)return 'de guardia';
 const exception=a.find(x=>SHIFTS.includes(x.kind));return exception?exception.kind.toLowerCase():(shiftOn(person,day)||'').toLowerCase();
}
function span(text,cls){const n=document.createElement('span');n.textContent=text;if(cls)n.className=cls;return n}
function elem(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}
function button(label,fn,cls){const b=elem('button',cls,label);b.type='button';b.addEventListener('click',fn);return b}
function h(text,tag='h3'){return elem(tag,'',text)}
function showStatus(){const s=$('oihaneWorkStatus');if(s)s.textContent=link?'Turnos compartidos con tu pareja · sincronización automática cada minuto':(lastError||'Se guardará en este dispositivo; conecta ambas cuentas para compartir.')}
function mountTab(){
 if(screen!=='Calendario')return;
 const app=$('app');if(!app)return;
 const tabs=app.querySelector('.module-toolbar .subtabs');if(!tabs)return;
 if(!$('oihaneWorkTab'))tabs.append(button('Trabajo',()=>showWork(),'oihane-work-tab'));
 if(!$('oihaneWorkPanel')){
  const panel=elem('section','oihane-work-panel');panel.id='oihaneWorkPanel';panel.hidden=true;
  app.querySelector('.module-toolbar').insertAdjacentElement('afterend',panel);
 }
 app.classList.toggle('oihane-work-active',active);
 const btn=$('oihaneWorkTab');if(btn)btn.classList.toggle('active',active);
 if(active)draw();
}
function showWork(){
 active=true;mountTab();draw();void sync();
}
function closeWork(){
 active=false;$('app')?.classList.remove('oihane-work-active');$('oihaneWorkPanel')?.setAttribute('hidden','');
 $('oihaneWorkTab')?.classList.remove('active');
}
function renderHome(){
 if(screen!=='home')return;
 const row=document.querySelector('.home-greeting-row');if(!row)return;
 let line=$('oihane-work-greeting');if(!line){line=elem('p','oihane-work-greeting');line.id='oihane-work-greeting';row.insertAdjacentElement('afterend',line)}
 const day=iso(new Date()),other=partner(),s=summary(other,day);
 if(currentPerson()==='Oihane'){
  line.textContent=s?('Rubén trabaja de '+(SHIFTS.map(x=>x.toLowerCase()).includes(s)?s+' esta semana':s==='de guardia'?'guardia hoy':s+' hoy')):'Configura los turnos de Rubén en Calendario → Trabajo';
 }else{
  line.textContent=s==='de guardia'?'Oihane está de guardia hoy':
   s?('Oihane '+(SHIFTS.map(x=>x.toLowerCase()).includes(s)?'trabaja de '+s+' hoy':s==='vacaciones'?'está de vacaciones':'está '+s+' hoy')):'Consulta los turnos de Oihane en Calendario → Trabajo';
 }
}
function draw(){
 if(!active||screen!=='Calendario')return;
 const panel=$('oihaneWorkPanel');if(!panel)return;
 // No reiniciar un formulario mientras alguien lo rellena y llega una sincronización.
 if(panel.querySelector('#oihaneWorkEditor form')){showStatus();return}
 panel.hidden=false;panel.replaceChildren();
 const lead=elem('div','oihane-work-lead');lead.append(h('Turnos de trabajo','h2'),elem('p','', 'Dos calendarios independientes de tu agenda general. La pareja puede consultar y editar ambos.'));panel.append(lead);
 const status=elem('p','hint');status.id='oihaneWorkStatus';panel.append(status);
 showStatus();
 const main=elem('div','oihane-work-calendars');panel.append(main);
 PEOPLE.forEach(person=>main.append(makeCalendar(person)));
 panel.append(button('＋ Añadir turno, guardia, festivo o vacaciones',()=>editEntry('',personSelected,iso(new Date())),'primary oihane-work-add'));
 const target=elem('div','oihane-work-editor');target.id='oihaneWorkEditor';panel.append(target);
}
function makeCalendar(person){
 const card=elem('section','oihane-work-card');if(person===currentPerson())card.classList.add('is-self');
 const top=elem('div','oihane-work-top');top.append(h(person,'h3'),button('Configurar rotación',()=>editRotation(person),'oihane-work-settings'));card.append(top);
 const config=rotation(person),seq=order(config);
 const desc=config&&seq.length?'Cada semana: '+seq.join(' → ')+' · Semana de referencia: '+config.anchor+' ('+config.first+')':
  'Sin rotación · Añade turnos sueltos o configura el ciclo';
 card.append(elem('p','oihane-work-detail',desc));
 const month=months[person];const current=new Date(month.getFullYear(),month.getMonth(),1);
 const controls=elem('div','oihane-work-month');const title=elem('strong','',current.toLocaleDateString('es-ES',{month:'long',year:'numeric'}));
 controls.append(button('‹',()=>changeMonth(person,-1),'oihane-month-arrow'),title,button('›',()=>changeMonth(person,1),'oihane-month-arrow'));card.append(controls);
 const grid=elem('div','oihane-work-grid');
 for(const x of ['L','M','X','J','V','S','D'])grid.append(elem('span','oihane-work-dow',x));
 const first=monday(iso(current)),todayKey=iso(new Date());
 for(let i=0;i<42;i++){
  const key=addDays(first,i),thisMonth=key.slice(0,7)===iso(current).slice(0,7);
  const cell=elem('div','oihane-work-day');if(!thisMonth)cell.classList.add('other-month');if(key===todayKey)cell.classList.add('today');
  cell.append(button(String(date(key).getDate()),()=>editEntry('',person,key),'oihane-work-day-number'));
  const es=dayEntries(person,key),selected=es.find(x=>['Vacaciones','Festivo','Libre','Guardia'].includes(x.kind))||es[0];
  if(selected){
   const chip=button(selected.kind==='Guardia'?'Guardia':selected.kind,()=>selected.originStudy?alert('Esta guardia procede de Estudio. Edítala en Estudio para conservar su sincronización.'):editEntry(selected._key,person,key),'oihane-work-shift '+(selected.kind==='Guardia'?'is-guard': ''));
   chip.title=selected.title||selected.kind;cell.append(chip);
  }else{
   const sh=shiftOn(person,key);if(sh)cell.append(elem('span','oihane-work-shift',sh));
  }
  grid.append(cell);
 }
 card.append(grid);
 const ahead=elem('p','oihane-work-next',config&&seq.length?'Dentro de 10 semanas: '+shiftOn(person,addDays(todayKey,70)):'');
 card.append(ahead);
 const below=elem('div','oihane-work-entries');
 const visible=list(person).filter(x=>(x.end||x.start)>=first&&x.start<=addDays(first,41));
 for(const x of visible){
  const item=button(x.start+(x.end&&x.end!==x.start?'–'+x.end:'')+' · '+x.kind+(x.title&&x.title!==x.kind?' · '+x.title:''),()=>x.originStudy?alert('Edita esta guardia en Estudio.'):editEntry(x._key,person,x.start),'oihane-work-list-entry');
  below.append(item);
 }
 if(!visible.length)below.append(elem('p','hint','Pulsa un día para añadir un turno o unas vacaciones.'));
 card.append(below);return card;
}
function changeMonth(person,step){const d=months[person];months[person]=new Date(d.getFullYear(),d.getMonth()+step,1);draw()}
function field(form,label,type,value,name){
 const wrap=elem('label','oihane-work-field');wrap.append(elem('span','',label));
 const input=document.createElement('input');input.type=type;input.name=name;input.value=value==null?'':value;wrap.append(input);form.append(wrap);return input;
}
function select(form,label,name,choices,value){
 const wrap=elem('label','oihane-work-field');wrap.append(elem('span','',label));
 const el=document.createElement('select');el.name=name;
 for(const [v,l] of choices){const opt=document.createElement('option');opt.value=v;opt.textContent=l;el.append(opt)}
 el.value=value||choices[0][0];wrap.append(el);form.append(wrap);return el;
}
function editor(title){const place=$('oihaneWorkEditor');if(!place)return null;place.replaceChildren();place.append(h(title,'h3'));place.scrollIntoView({behavior:'smooth',block:'nearest'});return place}
function editRotation(person){
 const place=editor('Rotación de '+person);if(!place)return;
 personSelected=person;const cfg=rotation(person)||{mode:person==='Rubén'?'3':'1',first:'Mañana',pair:'MN',anchor:monday(iso(new Date()))};
 const form=elem('form','oihane-work-form');
 const mode=select(form,'Sistema de turnos','mode',[['1','Turno fijo'],['2','Rotativo de 2 turnos'],['3','Rotativo de 3 turnos']],cfg.mode);
 const pair=select(form,'Rotación de dos turnos','pair',[['MN','Mañana → Noche'],['MT','Mañana → Tarde'],['TN','Tarde → Noche']],cfg.pair||'MN');
 const first=select(form,'Turno de la semana de referencia','first',SHIFTS.map(x=>[x,x]),cfg.first);
 const anchor=field(form,'Una fecha de la semana inicial','date',cfg.anchor,'anchor');
 const help=elem('p','hint','Si esa semana es de mañana, se calculan automáticamente todas las semanas futuras y anteriores. La rotación cambia los lunes.');
 form.append(help);
 function update(){pair.closest('label').hidden=mode.value!=='2';const seq=mode.value==='2'?(pair.value==='MT'?['Mañana','Tarde']:pair.value==='TN'?['Tarde','Noche']:['Mañana','Noche']):mode.value==='3'?SHIFTS:SHIFTS;[...first.options].forEach(x=>x.hidden=!seq.includes(x.value));if(!seq.includes(first.value))first.value=seq[0]}
 mode.addEventListener('change',update);pair.addEventListener('change',update);update();
 form.append(button('Guardar rotación',()=>{},'primary'));form.lastChild.type='submit';
 form.append(button('Cancelar',()=>place.replaceChildren(),'secondary'));
 form.addEventListener('submit',e=>{e.preventDefault();if(!valid(anchor.value))return alert('Selecciona una fecha válida.');
  localSave(keyRotation(person),{kind:'rotation',person,mode:mode.value,pair:pair.value,first:first.value,anchor:monday(anchor.value)});
  place.replaceChildren();draw();void sync();});place.append(form);
}
function editEntry(k,person,start){
 personSelected=person;const existing=k?data.records[k]:null;
 const place=editor(existing?'Editar elemento de '+person:'Añadir elemento a '+person);if(!place)return;
 const form=elem('form','oihane-work-form');
 const who=select(form,'Calendario de','person',PEOPLE.map(x=>[x,x]),existing?.person||person);
 const kind=select(form,'Tipo','kind',[...SHIFTS,'Guardia','Vacaciones','Festivo','Libre','Otro'].map(x=>[x,x]),existing?.kind||'Guardia');
 const title=field(form,'Descripción (opcional)','text',existing?.title||'','title');
 const startInput=field(form,'Desde','date',existing?.start||start,'start');
 const endInput=field(form,'Hasta (para vacaciones y periodos)','date',existing?.end||start,'end');
 const startTime=field(form,'Hora de inicio','time',existing?.startTime||'08:00','startTime');
 const endTime=field(form,'Hora de fin','time',existing?.endTime||'20:00','endTime');
 const guardDuration=select(form,'Duración de guardia','duration',[['12','12 horas (08:00–20:00)'],['24','24 horas (08:00–08:00 del día siguiente)']],String(existing?.hours||12));
 const calendar=elem('label','oihane-work-check');const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=!!existing?.addToCalendar;
 calendar.append(checkbox,elem('span','','Añadir también al Calendario general'));form.append(calendar);
 const note=elem('p','hint','Se comparte con tu pareja en Trabajo. Solo aparecerá en el Calendario general si activas la casilla.');form.append(note);
 function update(){const period=['Vacaciones','Festivo','Libre'].includes(kind.value);endInput.closest('label').hidden=!period;startTime.closest('label').hidden=period;endTime.closest('label').hidden=period;guardDuration.closest('label').hidden=kind.value!=='Guardia';}
 kind.addEventListener('change',update);update();
 const submit=button('Guardar',()=>{},'primary');submit.type='submit';form.append(submit);
 if(existing)form.append(button('Eliminar',()=>{if(confirm('¿Eliminar este elemento del calendario de trabajo?')){removeLinked(existing);localDelete(k);place.replaceChildren();draw();void sync()}},'secondary'));
 form.append(button('Cancelar',()=>place.replaceChildren(),'secondary'));
 form.addEventListener('submit',e=>{e.preventDefault();
  const startDay=startInput.value,endDay=['Vacaciones','Festivo','Libre'].includes(kind.value)?endInput.value:startDay;
  if(!valid(startDay)||!valid(endDay)||endDay<startDay)return alert('Comprueba las fechas.');
  if(dayDiff(endDay,startDay)>366)return alert('Un período no puede superar 366 días.');
  const id=existing?.id||String(Date.now())+'-'+Math.random().toString(36).slice(2,7);
  const personNew=who.value,workKey=(existing&&personNew!==existing.person)?keyEntry(personNew,id):(k||keyEntry(personNew,id));
  const item={kind:kind.value,person:personNew,id,title:clean(title.value)||kind.value,
   start:startDay,end:endDay,startTime:startTime.value,endTime:endTime.value,
   hours:kind.value==='Guardia'?Number(guardDuration.value):0,addToCalendar:checkbox.checked};
  if(k&&workKey!==k){removeLinked(existing);localDelete(k);}
  localSave(workKey,item);syncGeneral(item,workKey);place.replaceChildren();draw();void sync();
 });place.append(form);
}
function syncGeneral(item,k){
 if(typeof events==='undefined'||typeof save!=='function')return;
 let old=events.find(x=>x.sourceModule==='Trabajo'&&String(x.sourceId)===k);
 if(!item.addToCalendar){if(old){events=events.filter(x=>x!==old);save()}return}
 const ev={id:old?.id||Date.now()+Math.round(Math.random()*5000),title:item.title||item.kind,
  date:item.start,time:['Vacaciones','Festivo','Libre'].includes(item.kind)?'':item.startTime||'',
  duration:item.kind==='Guardia'?item.hours*60:60,notes:item.end!==item.start?'Hasta el '+item.end:'',
  location:'',sourceModule:'Trabajo',sourceId:k,sharedWithPartner:true,notify:false};
 if(old)Object.assign(old,ev);else events.push(ev);
 save();
}
function removeLinked(item){if(typeof events!=='undefined'&&item){const before=events.length;events=events.filter(x=>!(x.sourceModule==='Trabajo'&&String(x.sourceId)===keyEntry(item.person,item.id)));if(before!==events.length)save()}}
function updateMirrors(){
 if(currentPerson()!=='Oihane'||typeof extraItems!=='function')return;
 const found=studyGuards(),keys=new Set();
 for(const g of found){const k=PREFIX+'Oihane:study:'+g.sourceId;keys.add(k);
  if(JSON.stringify(data.records[k])!==JSON.stringify(g)){data.records[k]=g;data.pending[k]='upsert';}
 }
 for(const k of Object.keys(data.records)){if(k.startsWith(PREFIX+'Oihane:study:')&&!keys.has(k)){delete data.records[k];data.pending[k]='delete';}}
 persist();
}
async function sync(){
 if(syncBusy||!window.oihaneSyncRuntime||typeof syncConfig!=='function'||!syncConfig().access)return;
 const id=localStorage.getItem('oihane_sync_user')||'';if(!id)return;
 syncBusy=true;
 try{
  const api=window.oihaneSyncRuntime.request;
  const links=await api('/rest/v1/oihane_partner_links?select=id,user_a,user_b&status=eq.active&limit=1',{method:'GET'});
  const candidate=links?.[0];if(!candidate||![candidate.user_a,candidate.user_b].includes(id)){lastError='No hay una pareja vinculada activa.';return}
  link=candidate;uid=id;connected=true;lastError='';
  updateMirrors();
  const request='/rest/v1/oihane_shared_records?select=id,source_key,owner_id,link_id,shared,payload,revision,deleted_at&module=eq.'+MODULE+'&link_id=eq.'+encodeURIComponent(link.id)+'&source_key=like.'+encodeURIComponent(PREFIX+'%')+'&limit=1000';
  let rows=await api(request,{method:'GET'});if(!Array.isArray(rows))throw Error('Respuesta de turnos no válida.');
  for(const [k,op] of Object.entries({...data.pending})){
   const row=rows.find(x=>x.source_key===k);
   if(op==='delete'){
    if(row&&!row.deleted_at)await api('/rest/v1/oihane_shared_records?id=eq.'+encodeURIComponent(row.id),{method:'PATCH',body:JSON.stringify({deleted_at:new Date().toISOString(),deleted_by:uid}),headers:{Prefer:'return=minimal'}});
    delete data.pending[k];continue;
   }
   const record=data.records[k];if(!record){delete data.pending[k];continue}
   if(row){
    await api('/rest/v1/oihane_shared_records?id=eq.'+encodeURIComponent(row.id),{method:'PATCH',body:JSON.stringify({payload:record,shared:true,deleted_at:null}),headers:{Prefer:'return=minimal'}});
   }else{
    await api('/rest/v1/oihane_shared_records',{method:'POST',body:JSON.stringify({link_id:link.id,owner_id:uid,module:MODULE,source_key:k,shared:true,payload:record}),headers:{Prefer:'return=minimal'}});
   }
   delete data.pending[k];
  }
  if(rows.length||Object.keys(data.pending).length===0)rows=await api(request,{method:'GET'});
  for(const row of rows){
   if(data.pending[row.source_key])continue;
   if(row.deleted_at){delete data.records[row.source_key];continue}
   if(!row.payload||typeof row.payload!=='object')continue;
   if(row.payload.person&&PEOPLE.includes(row.payload.person))data.records[row.source_key]=row.payload;
  }
  persist();draw();renderHome();
 }catch(e){lastError='Sincronización pendiente. Comprueba la conexión en Ajustes.';console.warn('Oihane Trabajo',e);showStatus()}
 finally{syncBusy=false;}
}
function init(){
 const base=window.renderCalendar;
 if(typeof base==='function')window.renderCalendar=function(){const result=base.apply(this,arguments);mountTab();return result;};
 const setView=window.setCalendarView;
 if(typeof setView==='function')window.setCalendarView=function(){closeWork();return setView.apply(this,arguments);};
 const home=window.home;
 if(typeof home==='function')window.home=function(){const result=home.apply(this,arguments);renderHome();return result;};
 const saveExtraBase=window.saveExtra;
 if(typeof saveExtraBase==='function')window.saveExtra=function(name,items){const ok=saveExtraBase.apply(this,arguments);if(name==='Estudio'&&ok!==false){updateMirrors();void sync();}return ok};
 window.oihaneWorkSync=sync;
 window.oihaneWorkRotation=(person,day)=>shiftOn(person,day);
 if(window.oihaneSyncRuntime)window.oihaneSyncRuntime.register('work-calendars',sync,{minute:true,focus:true,visible:true,online:true});
 setTimeout(()=>{updateMirrors();renderHome();void sync()},1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();