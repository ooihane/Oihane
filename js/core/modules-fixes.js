/* Oihane 5.59.14 - arreglos de tareas, supermercados, plantas y formularios. */
(function () {
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const key=(s)=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const read=name=>{try{const a=JSON.parse(localStorage.getItem(name)||'[]');return Array.isArray(a)?a:[]}catch(_){return []}};
const dateLocal=()=>typeof today==='function'?today():new Date().toISOString().slice(0,10);
const dueDays=day=>{if(!day)return 999;const a=new Date(dateLocal()+'T12:00:00'),b=new Date(day+'T12:00:00');return Math.round((b-a)/86400000)};
// --- Supermercados: unir nombres originales + guardados + productos existentes. ---
const SHOP_KEY='oihane_custom_shops_v1',builtin=['General','Lidl','Eroski','Mercadona','Dia'];
function consolidateStores(){
 const stored=read(SHOP_KEY),productsNow=typeof products!=='undefined'&&Array.isArray(products)?products:[];
 const recovered=productsNow.flatMap(p=>[p.store,...(Array.isArray(p.lists)?p.lists:[])]);
 const memory=Array.isArray(window.oihaneShopStores)?window.oihaneShopStores:[];
 const uniq=new Map();
 for(const name of [...stored,...memory,...recovered]){
  if(typeof name!=='string')continue;const cleaned=name.trim().replace(/\s+/g,' ');
  if(cleaned.length<2||cleaned.length>30||builtin.some(x=>key(x)===key(cleaned)))continue;
  if(!/^[\p{L}\p{N} -]+$/u.test(cleaned))continue;
  if(!uniq.has(key(cleaned)))uniq.set(key(cleaned),cleaned);
 }
 const merged=[...uniq.values()].slice(0,20);
 if(JSON.stringify(merged)!==JSON.stringify(stored)){
  try{localStorage.setItem(SHOP_KEY,JSON.stringify(merged));window.queueLocalSnapshot?.();window.queueCloudSync?.()}catch(e){console.warn('No se pudieron conservar las tiendas nuevas',e)}
 }
 if(Array.isArray(window.oihaneShopStores))for(const name of merged){if(!window.oihaneShopStores.some(x=>key(x)===key(name)))window.oihaneShopStores.push(name)}
}
const previousMerge=window.mergeSyncSnapshots;
if(typeof previousMerge==='function'){
 window.mergeSyncSnapshots=function(local,cloud,base){
  const result=previousMerge.apply(this,arguments);
  const vals=[...(Array.isArray(local?.[SHOP_KEY])?local[SHOP_KEY]:[]),...(Array.isArray(cloud?.[SHOP_KEY])?cloud[SHOP_KEY]:[])];
  const shops=[...new Map(vals.filter(x=>typeof x==='string').map(x=>[key(x),x])).values()];
  result.data[SHOP_KEY]=shops;return result;
 };
}
const oldShopping=window.renderShopping;
if(typeof oldShopping==='function')window.renderShopping=function(){consolidateStores();return oldShopping.apply(this,arguments)};
consolidateStores();

// --- Tareas recurrentes: un solo ID, misma tarea y nueva fecha después del check. ---
const prevToggle=window.toggleTask;
if(typeof prevToggle==='function')window.toggleTask=function(id){
 const task=typeof tasks!=='undefined'&&Array.isArray(tasks)?tasks.find(t=>String(t.id)===String(id)):null;
 if(!task?.repeat)return prevToggle.apply(this,arguments);
 const oldDate=task.date||'';
 if(!oldDate){alert('Indica primero la fecha prevista para esta tarea recurrente.');return;}
 const next=typeof nextRepeatDate==='function'?nextRepeatDate(task):'';
 if(!next||next<=oldDate){alert('No se ha podido calcular la siguiente fecha; la tarea no se ha modificado.');return;}
 task.history=Array.isArray(task.history)?task.history:[];
 task.history.push({date:dateLocal(),scheduledDate:oldDate,completedAt:new Date().toISOString()});
 task.history=task.history.slice(-50);
 task.lastCompleted=dateLocal();task.lastScheduledDate=oldDate;
 task.date=next;task.done=false;task.completedAt='';
 if(task.oihaneOriginalImportance!==undefined)task.importance=task.oihaneOriginalImportance;
 save();renderTasks();
};
function setUpcomingPriority(){
 if(typeof tasks==='undefined'||!Array.isArray(tasks))return;
 let modified=false;
 for(const t of tasks){
  if(!t||!t.repeat||t.done||!t.date)continue;
  const imminent=dueDays(t.date)<=2;
  if(imminent){
   if(t.oihaneOriginalImportance===undefined)t.oihaneOriginalImportance=Number(t.importance||2);
   if(Number(t.importance)!==3){t.importance=3;modified=true;}
  }else if(t.oihaneOriginalImportance!==undefined){
   if(Number(t.importance)!==Number(t.oihaneOriginalImportance)){t.importance=Number(t.oihaneOriginalImportance);modified=true;}
  }
 }
 if(modified)try{save()}catch(e){console.warn('No se guardó la prioridad recurrente',e)}
}
const oldHome=window.home;
if(typeof oldHome==='function')window.home=function(){setUpcomingPriority();return oldHome.apply(this,arguments)};
const oldTasks=window.renderTasks;
if(typeof oldTasks==='function')window.renderTasks=function(){
 setUpcomingPriority();const result=oldTasks.apply(this,arguments);
 const records=typeof tasks==='undefined'?[]:tasks.filter(t=>t.repeat&&!t.done);
 const target=document.querySelector('#taskList')?.closest('.panel');
 if(target&&records.length){
  const sect=document.createElement('section');sect.className='oihane-recurring-tasks';
  sect.innerHTML='<h3>Tareas recurrentes</h3><p class="hint">Se mantienen después de completarlas; la fecha se recalcula automáticamente.</p>'+
   records.sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).map(t=>
    '<div class="oihane-recur-row"><input type="checkbox" aria-label="Completar '+esc(t.title)+'" data-oihane-repeat-check="'+esc(t.id)+'">'+
    '<div><strong>'+esc(t.title)+'</strong><small>'+esc(t.date||'Sin fecha')+
    (dueDays(t.date)<=2?' · Prioridad alta':'')+'</small></div><button type="button" class="delete" data-oihane-repeat-delete="'+esc(t.id)+'" aria-label="Eliminar tarea recurrente">×</button></div>').join('');
  target.append(sect);
  sect.querySelectorAll('[data-oihane-repeat-check]').forEach(box=>box.onchange=()=>window.toggleTask(box.dataset.oihaneRepeatCheck));
  sect.querySelectorAll('[data-oihane-repeat-delete]').forEach(btn=>btn.onclick=()=>{if(typeof window.deleteTask==='function')window.deleteTask(Number(btn.dataset.oihaneRepeatDelete))});
 }
 return result;
};

// --- Plantas: conservar por separado los dos historiales; un único selector los registra. ---
let plantEditId=null,pendingNewCare=null,previousPlantIds=null;
function setPlantCare(p,choice){
 if(!p||!choice)return false;
 if(choice==='water'){
  if(typeof window.oihanePlantLogWatering==='function')window.oihanePlantLogWatering(p,dateLocal(),5);
  else{
   const at=new Date().toISOString(),date=dateLocal();
   p.wateringHistory=Array.isArray(p.wateringHistory)?p.wateringHistory:[];
   p.wateringHistory.push({date,at,waitDays:5});p.lastWatered=date;p.waterWaitDays=5;p.attentionSource='watering';p.attentionRecordedAt=at;
  }
 }else{
  const days={'Suelo mojado':6,'Húmeda':4,'Ligeramente húmeda':2}[choice];
  if(!days)return false;
  const at=new Date().toISOString(),date=dateLocal();
  const next=new Date(date+'T12:00:00');next.setDate(next.getDate()+days);
  const due=next.getFullYear()+'-'+String(next.getMonth()+1).padStart(2,'0')+'-'+String(next.getDate()).padStart(2,'0');
  p.soilHistory=Array.isArray(p.soilHistory)?p.soilHistory:[];
  p.soilHistory.push({date,at,status:choice,waitDays:days,nextCheckDate:due});
  p.soilStatus=choice;p.soilCheckedDate=date;p.soilWaitDays=days;p.soilNextCheck=due;
  p.attentionSource='soil';p.attentionRecordedAt=at;
 }
 if(typeof window.oihanePlantRecalculate==='function')window.oihanePlantRecalculate(p);
 return true;
}
const originalSaveExtra=window.saveExtra;
if(typeof originalSaveExtra==='function')window.saveExtra=function(name,list){
 if(name==='Plantas'&&pendingNewCare&&plantEditId===null&&Array.isArray(list)){
  const newOne=list.find(p=>previousPlantIds&&!previousPlantIds.has(String(p.id)));
  if(newOne){setPlantCare(newOne,pendingNewCare);pendingNewCare=null;previousPlantIds=null;}
 }
 return originalSaveExtra.apply(this,arguments);
};
function finishPlantCare(choice,plantId){
 const arr=read('oihane_plants'),item=arr.find(x=>String(x.id)===String(plantId));
 if(!item)return;
 if(setPlantCare(item,choice)&&typeof saveExtra==='function'&&saveExtra('Plantas',arr)){
  const text=document.querySelector('#oihanePlantCareFeedback');
  if(text)text.textContent=choice==='water'?'Riego de hoy registrado.':'Estado del suelo registrado.';
 }
}
const previousPlantEditor=window.v519EditPlant;
if(typeof previousPlantEditor==='function')window.v519EditPlant=function(id){
 plantEditId=id;pendingNewCare=null;
 const result=previousPlantEditor.apply(this,arguments);
 const chooser=document.querySelector('#oihanePlantCare');if(chooser)chooser.value='';
 return result;
};
const previousResetPlant=window.v519ResetForm;
if(typeof previousResetPlant==='function')window.v519ResetForm=function(){
 plantEditId=null;pendingNewCare=null;previousPlantIds=null;return previousResetPlant.apply(this,arguments);
};
function enhancePlantForm(){
 if(typeof screen==='undefined'||screen!=='Plantas')return;
 const panel=document.querySelector('#v519Panel'),form=document.querySelector('#v519Form');if(!panel||!form)return;
 const room=form.querySelector('#v519PlantRoom')?.closest('.field');
 const light=form.querySelector('#v519Light')?.closest('.field');
 const title=form.querySelector('#v519Title')?.closest('.field');
 if(title&&room&&title.nextElementSibling!==room)title.after(room);
 if(light&&room&&light.previousElementSibling!==room)room.after(light);
 for(const selector of ['#v519Watered','#v519SoilStatus']){
  const node=form.querySelector(selector);if(node?.closest('.field'))node.closest('.field').hidden=true;
 }
 const actions=form.querySelector('.v519-watering-actions');if(actions)actions.hidden=true;
 const history=form.querySelector('#v519WateringHistory');if(history)history.hidden=true;
 if(!form.querySelector('#oihanePlantCare')){
  const field=document.createElement('div');field.className='field oihane-care-only';
  field.innerHTML='<label for="oihanePlantCare">Riego / estado del suelo</label><select id="oihanePlantCare" aria-label="Riego o estado del suelo">'+
   '<option value="">Riego / estado del suelo</option><option value="water">Riego hoy · 5 días</option>'+
   '<option value="Suelo mojado">Suelo mojado · 6 días</option><option value="Húmeda">Húmeda · 4 días</option>'+
   '<option value="Ligeramente húmeda">Ligeramente húmeda · 2 días</option></select>'+
   '<div class="oihane-care-feedback" id="oihanePlantCareFeedback" role="status"></div>';
  room?.after(field);
  field.querySelector('select').onchange=event=>{
   const value=event.target.value;if(!value)return;
   if(plantEditId!==null){finishPlantCare(value,plantEditId);}
   else{pendingNewCare=value;const out=document.querySelector('#oihanePlantCareFeedback');if(out)out.textContent='Se registrará al guardar la planta nueva.';}
  };
 }
 if(!form.dataset.oihaneCareCapture){
  form.dataset.oihaneCareCapture='1';
  form.addEventListener('submit',()=>{
   if(plantEditId===null)previousPlantIds=new Set(read('oihane_plants').map(p=>String(p.id)));
  },true);
 }
 const tools=document.querySelector('.v519-photo-tools');const body=document.querySelector('#v519Body');
 if(tools&&body&&tools.previousElementSibling!==body){
  tools.querySelectorAll('.hint,span.hint').forEach(el=>el.remove());
  body.after(tools);
 }
}
function enhancePlantCards(){
 if(typeof screen==='undefined'||screen!=='Plantas')return;
 document.querySelectorAll('.v519-plant-card').forEach(card=>{
  if(card.closest('.oihane-plant-wrap'))return;
  const id=card.getAttribute('onclick')?.match(/v519EditPlant\(([^)]+)\)/)?.[1];
  if(!id)return;
  let selected;
  try{selected=JSON.parse(id)}catch{selected=id.replace(/['"]/g,'')}
  const wrap=document.createElement('div');wrap.className='oihane-plant-wrap';
  card.before(wrap);wrap.append(card);
  const del=document.createElement('button');del.type='button';del.className='oihane-plant-delete';del.textContent='×';
  del.setAttribute('aria-label','Eliminar planta');del.title='Eliminar planta';wrap.append(del);
  del.onclick=async e=>{
   e.stopPropagation();const all=read('oihane_plants'),item=all.find(p=>String(p.id)===String(selected));
   if(!item||!confirm('¿Eliminar definitivamente la planta «'+item.title+'»? Quedará en la papelera compartida cuando se sincronice.'))return;
   if(item._oihaneSharedId){
    if(!navigator.onLine){alert('Conéctate a Internet antes de eliminar una planta compartida.');return}
    const uid=localStorage.getItem('oihane_sync_user')||'';
    const base=read('oihane_shared_baseline_'+uid+'_plantas').find(x=>x.id===item._oihaneSharedId);
    if(!base?.revision){alert('La planta todavía no tiene sincronización confirmada. No se ha borrado.');return}
    try{
     await window.oihaneSyncRuntime.request('/rest/v1/rpc/oihane_delete_shared_record',{
      method:'POST',body:JSON.stringify({p_id:base.id,p_expected_revision:base.revision}),headers:{'Content-Type':'application/json'}
     });
    }catch(error){alert('Supabase no ha confirmado la eliminación. No se ha borrado nada: '+String(error?.message||error));return}
   }
   if(saveExtra('Plantas',all.filter(x=>String(x.id)!==String(selected))))renderExtraModule('Plantas');
  };
 });
}
function syncPlant(){if(typeof screen==='undefined'||screen!=='Plantas')return;enhancePlantForm();enhancePlantCards();}
// DomObserver: mejoras idempotentes; solo mutaciones estructurales.
const app=document.getElementById('app');let scheduled=false;
function plan(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;syncPlant()})}
if(app)new MutationObserver(plan).observe(app,{subtree:true,childList:true});
document.addEventListener('click',plan,true);
plan();
})();
