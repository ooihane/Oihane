



/* --- oihane-538-assistant --- */

/* Oihane 5.30.8: incremental, no-API conversational layer. The existing command engine remains the fallback. */
(function(){
 'use strict';
 const KEY='oihane_assistant_context_v2', PREF='oihane_assistant_preferences_v1';
 const previous=window.handleAssistantCommand;
 if(typeof previous!=='function')return;
 const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/^[¿¡\s]+|[?!。.!]+$/g,'');
 const dateString=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const todayLocal=()=>dateString(new Date());
 const safeRead=(key,defaultValue)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??defaultValue}catch(_){return defaultValue}};
 let context=safeRead(KEY,{});
 if(!context||typeof context!=='object'||Date.now()-Number(context.at||0)>12*3600*1000)context={};
 function rememberTask(id){context={kind:'task',id,at:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(context))}catch(_){}}
 function taskForContext(){if(context.kind!=='task'||Date.now()-Number(context.at||0)>12*3600*1000)return null;return typeof tasks!=='undefined'&&Array.isArray(tasks)?tasks.find(t=>String(t.id)===String(context.id)&&!t.done):null}
 function tell(msg,kind='ok'){
  let b=document.querySelector('#assistantResult');if(!b){b=document.createElement('div');b.id='assistantResult';b.className='assistant-response';document.querySelector('.assistant')?.after(b)}
  b.textContent=msg;b.dataset.kind=kind;
  try{window.oihaneSpeakReply?.(msg)}catch(_){}
 }
 function parseDate(text){
  const s=clean(text),d=new Date();d.setHours(12,0,0,0);
  if(/\bpasado manana\b/.test(s)){d.setDate(d.getDate()+2);return dateString(d)}
  if(/\bmanana\b/.test(s)){d.setDate(d.getDate()+1);return dateString(d)}
  if(/\bhoy\b/.test(s))return dateString(d);
  const m=s.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
  if(m){let yr=m[3]?+m[3]:d.getFullYear();if(yr<100)yr+=2000;let n=new Date(yr,+m[2]-1,+m[1],12);if(n.getDate()!==+m[1]||n.getMonth()!==+m[2]-1)return '';if(!m[3]&&n<d)n.setFullYear(n.getFullYear()+1);return dateString(n)}
  const days=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  const w=s.match(/\b(?:el\s+)?(proximo\s+|que viene\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\b/);
  if(w){let advance=(days.indexOf(w[2])-d.getDay()+7)%7;if(advance===0)advance=7;
   // "viernes que viene" in normal speech means next occurrence, not two Fridays out.
   d.setDate(d.getDate()+advance);return dateString(d)}
  return '';
 }
 function parseTime(text){
  const s=clean(text);let m=s.match(/\b(?:a|para|sobre|hacia)\s+las?\s+(\d{1,2})(?:[:.]([0-5]\d))?(?:\s+de\s+la\s+(manana|tarde|noche))?\b/);
  if(!m)m=s.match(/\b(\d{1,2}):([0-5]\d)\b/);
  if(!m)return '';
  let h=+m[1],min=+(m[2]||0);if(m[3]==='tarde'||m[3]==='noche'){if(h<12)h+=12}else if(m[3]==='manana'&&h===12)h=0;
  return h<=23&&min<=59?String(h).padStart(2,'0')+':'+String(min).padStart(2,'0'):'';
 }
 function dateLabel(iso){if(!iso)return 'sin fecha';const d=new Date(iso+'T12:00:00');return Number.isNaN(d.getTime())?iso:d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'short'})}
 function formatTask(t){return (t.date?dateLabel(t.date)+(t.time?' '+t.time:'')+' · ':'')+t.title}
 function summarizeTasks(text){
  const s=clean(text),all=typeof tasks!=='undefined'&&Array.isArray(tasks)?tasks:[];
  const pending=all.filter(t=>!t.done),target=parseDate(s);
  let results,lead;
  if(/\b(semana|proximos 7 dias)\b/.test(s)){
   const d=new Date();d.setHours(12,0,0,0);const end=new Date(d);end.setDate(d.getDate()+6);
   results=pending.filter(t=>t.date&&t.date>=dateString(d)&&t.date<=dateString(end));lead='En los próximos 7 días';
  }else if(target){results=pending.filter(t=>t.date===target||(t.date&&t.date<target));lead='Para '+dateLabel(target)+' (incluidas las atrasadas)';}
  else {results=pending;lead='Tareas pendientes';}
  results=results.slice().sort((a,b)=>(a.date||'9999-12-31').localeCompare(b.date||'9999-12-31'));
  tell(lead+': '+(results.length?results.slice(0,7).map(formatTask).join('; ')+(results.length>7?' y '+(results.length-7)+' más.':'.'):'no tienes tareas en esta selección.'));
 }
 function summarizeShopping(text){
  const s=clean(text),items=typeof products!=='undefined'&&Array.isArray(products)?products:[];
  const stores=['Lidl','Eroski','Mercadona','Dia','General'];const store=stores.find(x=>new RegExp('\\b'+clean(x)+'\\b').test(s));
  const pending=items.filter(p=>!p.bought&&(!store||store==='General'?(store!=='General'||(p.lists||[]).includes('General')):((p.lists||[]).some(x=>clean(x)===clean(store))||clean(p.store)===clean(store))));
  const names=[...new Set(pending.map(p=>p.title).filter(Boolean))];
  tell('Compra '+(store?'en '+store:'pendiente')+': '+(names.length?names.slice(0,9).join(', ')+(names.length>9?' y '+(names.length-9)+' más.':'.'):'no tienes productos pendientes.'));
 }
 function isFollowup(s){return /^(?:(?:oye|oihane|por favor)\s+)?(?:ponla|ponlo|cambiala|cambialo|muevela|muevelo|pasala|pasalo|ponle|dale|mejor|avisame|recuerdamelo|recuerdamela|prioridad\s+(?:alta|media|baja)|que\s+sea)\b/.test(s)}
 function patchTask(raw){
  const s=clean(raw),task=taskForContext();if(!task){tell('No sé a qué tarea te refieres. Dime su nombre o crea una tarea primero.','question');return true}
  const newDate=parseDate(raw),newTime=parseTime(raw);
  const high=/\b(prioridad alta|muy importante|alta prioridad)\b/.test(s),low=/\b(prioridad baja|baja prioridad|poco importante)\b/.test(s);
  const med=/\b(prioridad media|prioridad normal)\b/.test(s);
  const reminder=/\b(avisame|recuerdamelo|recuerdamela|recordatorio|aviso)\b/.test(s);
  let lead=0;const leadMatch=s.match(/\b(\d+)\s*(minuto|hora|dia)s?\s*antes\b/);if(leadMatch){lead=+leadMatch[1]*(leadMatch[2]==='hora'?60:leadMatch[2]==='dia'?1440:1)}
  if(!newDate&&!newTime&&!high&&!low&&!med&&!reminder){tell('Puedo cambiar la fecha, hora, prioridad o aviso de esa tarea. Por ejemplo: «ponla para el viernes a las 18».','question');return true}
  const before={date:task.date,time:task.time,importance:task.importance,notify:task.notify,notifyLead:task.notifyLead};
  if(newDate){const duplicate=tasks.some(t=>t!==task&&!t.done&&clean(t.title)===clean(task.title)&&t.date===newDate);if(duplicate){tell('Ya hay otra tarea con el mismo título en esa fecha. No he cambiado nada.','question');return true}task.date=newDate}
  if(newTime)task.time=newTime;
  if(high)task.importance=3;if(med)task.importance=2;if(low)task.importance=1;
  if(reminder){if(!task.date||!task.time){Object.assign(task,before);tell('Para activar un aviso necesito fecha y hora. Dime, por ejemplo, «ponla para mañana a las 18».','question');return true}task.notify=true;task.notifyLead=lead;}
  let success=false;try{success=typeof save==='function'&&save()!==false}catch(_){success=false}
  if(!success){Object.assign(task,before);tell('No he podido guardar el cambio; la tarea conserva sus datos anteriores.','error');return true}
  rememberTask(task.id);
  tell('He actualizado «'+task.title+'»: '+(task.date?dateLabel(task.date):'sin fecha')+(task.time?' a las '+task.time:'')+(reminder?' · aviso '+(lead?lead+' minutos antes':'a su hora'):'')+(high?' · prioridad alta':low?' · prioridad baja':med?' · prioridad media':'')+'.');
  if(typeof screen!=='undefined'&&screen==='Tareas'&&typeof renderTasks==='function')try{renderTasks()}catch(_){}
  return true;
 }
 window.handleAssistantCommand=function(raw){
  const q=String(raw||'').trim(),s=clean(q);if(!q)return;
  if(/^(?:que (?:puedes|sabes) hacer|ayuda|como funciona el asistente|comandos disponibles)\??$/.test(s)){
   tell('Puedo consultar tus tareas y la compra, resumir pendientes de hoy o de esta semana, crear tareas, citas y planes, y registrar riegos. Después de crear una tarea puedes decir «ponla para el viernes», «ponla a las 18» o «prioridad alta». Si falta información, te la pediré.','ok');return;
  }
  if(isFollowup(s)){patchTask(q);return}
  if(/\b(?:tareas|tarea|pendientes|pendiente)\b/.test(s)&&/^(?:que|cuales|cuantas|dime|muestrame|ensename|revisa|lista|resumeme|que tengo que hacer|tengo)\b/.test(s)){
   summarizeTasks(q);return;
  }
  if(/\b(?:que tengo que hacer|que tengo pendiente|tengo cosas que hacer)\b/.test(s)&&/\b(?:hoy|manana|semana)\b/.test(s)){
   summarizeTasks(q);return;
  }
  if(/\b(?:compra|supermercado|lista del super)\b/.test(s)&&/^(?:que|cuanto|cuales|dime|muestrame|ensename|revisa|lista|tengo|que falta|que me falta|que tenemos)\b/.test(s)){
   summarizeShopping(q);return;
  }
  const previousIds=new Set((typeof tasks!=='undefined'&&Array.isArray(tasks)?tasks:[]).map(t=>String(t.id)));
  let result;
  try{result=previous.call(this,q)}catch(e){tell('No he podido procesar la orden. No he confirmado ningún cambio.','error');return}
  if(typeof tasks!=='undefined'&&Array.isArray(tasks)){
   const created=tasks.find(t=>!previousIds.has(String(t.id))&&!t.done);
   if(created)rememberTask(created.id);
  }
  return result;
 };
 window.oihaneAssistant538={version:'5.30.8',normalize:clean,parseDate,parseTime};
})();




/* --- oihane-539-home-polish --- */

(function(){
  // A public (anon/publishable) key entered once is retained locally across updates.
  document.addEventListener('change',function(event){
    const field=event.target; if(!field||field.id!=='syncKey')return;
    const value=String(field.value||'').trim();
    if(value && !value.startsWith('sb_secret_')){try{localStorage.setItem('oihane_sync_key',value)}catch(_){}}
  },true);
})();



/* --- oihane-5310-gemini --- */

/* Optional Gemini interpreter, bound to authenticated Supabase Edge Function.
   Gemini NEVER writes to storage; typed, allowlisted operations are executed locally.
   Enabled only with explicit user action. No Gemini secret is ever in the client. */
(function(){
 'use strict';
 const ENABLE='oihane_gemini_enabled_v1',COUNT='oihane_gemini_calls_v1';
 let serverUsage=null,usageLoading=false;
 const base=window.handleAssistantCommand;if(typeof base!=='function')return;
 let busy=false;
 const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 function message(s){let b=document.getElementById('assistantResult');if(!b){b=document.createElement('div');b.id='assistantResult';b.className='assistant-response';document.querySelector('.assistant')?.after(b)}b.textContent=s;try{window.oihaneSpeakReply?.(s)}catch(_){}}
 function enabled(){return localStorage.getItem(ENABLE)==='1'}
 function ui(){let form=document.getElementById('assistant');if(!form)return;let button=document.getElementById('oihaneGeminiToggle');if(!button){button=document.createElement('button');button.type='button';button.id='oihaneGeminiToggle';button.title='Activar o desactivar IA Gemini';button.onclick=()=>{if(!enabled()){
  if(!confirm('¿Activar Gemini? Tus instrucciones se enviarán a Google a través de Supabase para interpretarlas. En el nivel gratuito Google puede usar las solicitudes para mejorar sus productos. No se enviará tu agenda completa. ¿Continuar?'))return;
  localStorage.setItem(ENABLE,'1');
 }else localStorage.setItem(ENABLE,'0');ui();message(enabled()?'Gemini activado. Si la función no está configurada, te avisaré sin modificar tus datos.':'Gemini desactivado. Vuelves al asistente local.');};
 const submit=form.querySelector('button[type="submit"]');if(submit)form.insertBefore(button,submit);else form.appendChild(button)}
 button.textContent=enabled()?'✦ IA':'✧ IA';button.setAttribute('aria-pressed',String(enabled()));button.disabled=busy;
 document.getElementById('oihaneAiQuota')?.remove();}
 async function refreshUsage(){if(usageLoading||!enabled())return;const cfg=typeof syncConfig==='function'?syncConfig():null;if(!cfg?.url||!cfg?.key||!cfg?.access){serverUsage=null;ui();return}
 usageLoading=true;ui();try{const r=await fetch(cfg.url.replace(/\/$/,'')+'/functions/v1/oihane-ai',{method:'GET',headers:{'apikey':cfg.key,'Authorization':'Bearer '+cfg.access},cache:'no-store'});const data=await r.json();if(r.ok&&data?.usage&&Number.isInteger(data.usage.used))serverUsage=data.usage;else serverUsage=null}catch(_){serverUsage=null}finally{usageLoading=false;ui()}}
 // Refreshed after home() rebuilds the assistant. No global DOM observer.
 window.oihaneRefreshAssistantUi=ui;ui();
 function isValidDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !Number.isNaN(+d)&&d.toISOString().slice(0,10)===s}
 function check(a){
 if(!a||typeof a!=='object')return 'Respuesta inválida';
 if(typeof a.title!=='string'||!a.title.trim()||a.title.length>140)return 'Nombre no válido';
 if(a.type==='shopping.add')return ['Lidl','Mercadona','Eroski','Dia','General'].includes(a.store)?'':'Supermercado inválido';
 if(a.type==='task.create')return typeof a.date==='string'&&(!a.date||isValidDate(a.date))&&typeof a.time==='string'&&(!a.time||/^([01]\d|2[0-3]):[0-5]\d$/.test(a.time))&&typeof a.notify==='boolean'&&(!a.notify||(a.date&&a.time))&&['normal','alta','baja',undefined].includes(a.priority)?'':'Datos de tarea inválidos';
 if(a.type==='study.add')return a.kind==='Tema'?'':'Tipo de estudio no válido';
 if(a.type==='module.add')return ['Planes','Recetas','Wishlist','Regalos'].includes(a.module)&&(a.module!=='Regalos'||typeof a.person==='string'&&a.person.trim())&&(!a.person||typeof a.person==='string'&&a.person.length<=90)&&(!a.date||isValidDate(a.date))&&(!a.time||/^([01]\d|2[0-3]):[0-5]\d$/.test(a.time))?'':'Módulo o datos no válidos';
 if(a.type==='item.delete')return ['Compras','Tareas','Estudio','Planes','Recetas','Wishlist','Regalos'].includes(a.module)?'':'Módulo no válido';
 if(a.type==='task.priority')return ['alta','normal','baja'].includes(a.priority)?'':'Prioridad no válida';
 return 'Acción no admitida';
 }
 function getCollection(n){return n==='Compras'?products:n==='Tareas'?tasks:extraItems(n)}
 function saveCollection(n,arr){return n==='Compras'||n==='Tareas'?save()!==false:saveExtra(n,arr)!==false}
 function normalizedTitle(s){return clean(s).replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
 function findMatches(list,title){const x=normalizedTitle(title);return list.filter(v=>normalizedTitle(v.title)===x)}
 function applyOne(a){const invalid=check(a);if(invalid)return {ok:false,detail:invalid};
 const title=a.title.trim();
 if(a.type==='item.delete'||a.type==='task.priority'){
  const collection=a.type==='task.priority'?'Tareas':a.module,items=getCollection(collection),matches=findMatches(items,title);
  if(matches.length!==1)return {ok:false,detail:matches.length?'Hay varios elementos llamados «'+title+'». No he modificado nada.':'No encuentro «'+title+'» en '+collection};
  const item=matches[0];
  if(a.type==='item.delete'){
   if(!confirm('¿Eliminar definitivamente «'+item.title+'» de '+collection+'?'))return {ok:false,detail:'Eliminación cancelada'};
   const index=items.indexOf(item);items.splice(index,1);
   if(!saveCollection(collection,items)){items.splice(index,0,item);return {ok:false,detail:'No se ha podido eliminar'}}
   return {ok:true,detail:'Eliminado de '+collection+': '+title};
  }
  const before=item.importance;item.importance=a.priority==='alta'?3:a.priority==='baja'?1:2;
  if(!saveCollection('Tareas',items)){item.importance=before;return {ok:false,detail:'No se ha podido cambiar la prioridad'}}
  return {ok:true,detail:'Prioridad '+a.priority+' para «'+title+'»'};
 }
 if(a.type==='shopping.add'){
  const st=a.store;if(products.some(p=>!p.bought&&normalizedTitle(p.title)===normalizedTitle(title)&&(p.store===st||(p.lists||[]).includes(st))))return {ok:true,detail:'Ya estaba en '+st+': '+title};
  const item={id:uniqueId(products),title,store:st,lists:st==='General'?['General']:['General',st],category:classifyProductCategory(title),bought:false,created:today(),source:'assistant'};
  products.push(item);if(save()===false){products.splice(products.indexOf(item),1);return {ok:false,detail:'No se pudo guardar '+title}}return {ok:true,detail:'Añadido a '+st+': '+title};
 }
 if(a.type==='task.create'){
  const date=a.date||'';if(tasks.some(t=>!t.done&&normalizedTitle(t.title)===normalizedTitle(title)&&String(t.date||'')===date))return {ok:true,detail:'Ya existía: '+title};
  const item={id:uniqueId(tasks),title,date,time:a.time||'',repeat:'',category:'',location:'',context:typeof a.person==='string'?'Con '+a.person:'',importance:a.priority==='alta'?3:a.priority==='baja'?1:2,notify:a.notify===true,notifyLead:0,done:false,created:today(),completedAt:'',lastCompleted:''};
  tasks.push(item);if(save()===false){tasks.splice(tasks.indexOf(item),1);return {ok:false,detail:'No se guardó la tarea'}}return {ok:true,detail:'Tarea creada'+(item.importance===3?' · prioridad alta':'')+': '+title};
 }
 const moduleName=a.type==='study.add'?'Estudio':a.module;const items=extraItems(moduleName);
 if(items.some(x=>normalizedTitle(x.title)===normalizedTitle(title)))return {ok:true,detail:'Ya existe en '+moduleName+': '+title};
 const item={id:uniqueId(items),title,created:today()};
 if(moduleName==='Estudio')Object.assign(item,{kind:'Tema',status:'Tema',date:'',time:'',notes:''});
 if(moduleName==='Recetas')Object.assign(item,{kind:'Quiero aprender',status:'Quiero aprender',ingredients:'',steps:'',servings:2});
 if(moduleName==='Wishlist')Object.assign(item,{status:'Idea'});
 if(moduleName==='Regalos')Object.assign(item,{status:'Idea',person:a.person||''});
 if(moduleName==='Planes')Object.assign(item,{status:a.date?'Próximo':'Sin fecha',category:a.date?'Próximos':'Ideas',date:a.date||'',time:a.time||'',people:a.person||'',location:a.location||''});
 items.push(item);if(!saveExtra(moduleName,items)){items.splice(items.indexOf(item),1);return {ok:false,detail:'No se pudo guardar en '+moduleName}};
 return {ok:true,detail:'Guardado en '+moduleName+(item.person?' para '+item.person:item.people?' con '+item.people:'')+': '+title};
 }
 function uniqueId(collection){let id=Date.now();const ids=new Set(collection.map(x=>String(x.id)));while(ids.has(String(id)))id++;return id}
 function stats(){let date=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Madrid'});let obj;try{obj=JSON.parse(localStorage.getItem(COUNT)||'{}')}catch(_){obj={}}if(obj.day!==date)obj={day:date,n:0};return obj}
 function tick(){const st=stats();st.n++;try{localStorage.setItem(COUNT,JSON.stringify(st))}catch(_){}return st.n}
 // Ruta local estricta: solo órdenes inequívocas; jamás se adivina el supermercado.
 // El resto continúa en Gemini. No se envía ningún texto a terceros en esta ruta.
 function additionalQuickActions(q){
  const pref=/^(?:(?:oye|por favor|oihane)[,\s]+)*/i;
  const text=q.replace(pref,'').trim();
  const study=text.match(/^(?:añade|agrega|apunta|mete|guarda|crea)\s+(?:(?:el|un)\s+tema\s+(?:(?:sobre|de)\s+)?|estudiar\s+)?(.+?)\s+(?:a|en|dentro de)\s+(?:la\s+)?(?:lista\s+de\s+)?(?:temas?\s+(?:de\s+)?)?estudio[.!]?$/i);
  if(study&&study[1].trim().length<140&&study[1].trim().length>1)return [{type:'study.add',title:study[1].trim(),kind:'Tema'}];
  const hi=text.match(/^(?:pon|cambia|marca|establece)\s+(?:la\s+)?(?:tarea\s+)?(.+?)\s+(?:con\s+)?prioridad\s+(alta|normal|baja)[.!]?$/i);
  if(hi&&hi[1].length<140)return [{type:'task.priority',title:hi[1].trim(),priority:clean(hi[2])}];
  const deletion=text.match(/^(?:elimina|borra|quita)\s+(?:la\s+)?tarea\s+(.+?)(?:\s+de\s+(?:mis\s+)?tareas)?[.!]?$/i);
  if(deletion&&deletion[1].trim().length<140)return [{type:'item.delete',module:'Tareas',title:deletion[1].trim()}];
  const task=text.match(/^(?:crea|añade|agrega|apunta)\s+(?:una\s+)?tarea\s*(?::|de)?\s+(.+?)\s+(?:con\s+)?prioridad\s+(alta|normal|baja)[.!]?$/i);
  if(task&&task[1].trim().length<140&&!/\b(?:hoy|mañana|viernes|lunes|martes|miercoles|miércoles|jueves|sabado|sábado|domingo|recu[eé]rdame|aviso|a las)\b/i.test(task[1]))return [{type:'task.create',title:task[1].trim(),date:'',time:'',notify:false,priority:clean(task[2])}];
  return null;
 }
 function quickActions(q){
  const tidy=s=>s.replace(/^[\s:;,.-]+|[\s:;,.-]+$/g,'').trim();
  const shop=q.match(/^(?:oye\s+)?(?:oihane[,\s]+)?(?:por favor[,\s]+)?(?:añade|agrega|mete|apunta|pon)\s+(.+?)\s+(?:a|en)\s+(?:la\s+)?(?:compra\s+(?:de|en)\s+|lista\s+de\s+)?(mercadona|lidl|eroski|dia|día|general)\s*[.!]?$/i);
  if(shop){const store=({mercadona:'Mercadona',lidl:'Lidl',eroski:'Eroski',dia:'Dia',día:'Dia',general:'General'})[clean(shop[2])];
   let body=tidy(shop[1]);if(/\b(?:mañana|pasado mañana|hoy|recu[eé]rdame|recordatorio|tarea|calendario|y luego)\b/i.test(body))return null;
   const pieces=body.split(/\s*,\s*|\s+y\s+/i).map(tidy);
   if(!pieces.length||pieces.length>5||pieces.some(x=>!x||x.length>90||/[;:.!?]/.test(x)))return null;
   return pieces.map(title=>({type:'shopping.add',title,store}));
  }
  const task=q.match(/^(?:oye\s+)?(?:oihane[,\s]+)?(?:por favor[,\s]+)?(?:crea|añade|agrega|apunta)\s+(?:una\s+)?tarea\s*(?::|de)?\s+(.+?)\s*[.!]?$/i);
  if(task){const title=tidy(task[1]);if(title&&title.length<=140&&!/[;:.!?]/.test(title)&&!/\b(?:hoy|mañana|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|fecha|hora|aviso|recu[eé]rdame|a las|el día|el dia|y luego)\b/i.test(title))return [{type:'task.create',title,date:'',time:'',notify:false}];}
  return null;
 }
 window.handleAssistantCommand=async function(raw){const q=String(raw||'').trim();if(!q)return;if(!enabled())return base.call(this,q);if(busy){message('Estoy terminando la orden anterior. Espera un momento.');return;}
 const pacificDay=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const blockedKey='oihane_gemini_daily_limit_day_v1';
 function capNotice(){
   const notice='Has alcanzado las 90 peticiones diarias. A partir de ahora el asistente de voz utilizará únicamente el asistente local hasta restablecer el número de órdenes diarias.';
   const host=document.getElementById('app')||document.body;
   let el=document.getElementById('oihaneAiCapNotice');
   if(!el){el=document.createElement('div');el.id='oihaneAiCapNotice';el.className='oihane-ai-cap-notice';el.setAttribute('role','status');host.appendChild(el)}
   el.textContent=notice;const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Cerrar aviso');close.style.cssText='position:absolute;right:9px;top:5px;border:0;background:transparent;font-size:22px;color:inherit';close.onclick=()=>el.remove();el.appendChild(close);
 }
 const quick=additionalQuickActions(q)||quickActions(q);
 if(quick){const errors=quick.map(check).filter(Boolean);if(!errors.length){busy=true;ui();try{const result=quick.map(applyOne);message(result.map(r=>(r.ok?'✓ ':'✗ ')+r.detail).join(' · '));window.oihaneLastAssistantTiming={route:'local',elapsedMs:0};}finally{busy=false;ui()}return;}}
 if(localStorage.getItem(blockedKey)===pacificDay()){
   // Never invoke Gemini after the internal daily cap. Local assistant remains usable.
   return base.call(this,q);
 }
 const startedAt=Date.now();
 const cfg=typeof syncConfig==='function'?syncConfig():null;
 if(!cfg?.url||!cfg?.key||!cfg?.access){message('Para utilizar Gemini primero inicia sesión en Supabase desde Ajustes → Sincronización. No he cambiado ningún dato.');return}
 busy=true;ui();
 try{if(serverUsage?.used>=90){localStorage.setItem(blockedKey,pacificDay());capNotice();return base.call(this,q)}
 tick();const response=await fetch(cfg.url.replace(/\/$/,'')+'/functions/v1/oihane-ai',{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.key,'Authorization':'Bearer '+cfg.access},body:JSON.stringify({message:q,localDate:new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Madrid'}),localTime:new Date().toLocaleTimeString('es-ES',{timeZone:'Europe/Madrid',hour12:false}),tz:'Europe/Madrid'})});
 const body=await response.json().catch(()=>({}));if(body?.usage&&Number.isInteger(body.usage.used)){serverUsage=body.usage;ui()}window.oihaneLastAssistantTiming={route:'gemini',elapsedMs:Date.now()-startedAt,status:response.status};
 if(!response.ok){if(response.status===429&&body.error==='daily_cap'){localStorage.setItem(blockedKey,pacificDay());capNotice();return base.call(this,q)}message(response.status===429?'Gemini ha alcanzado su cuota. Puedes seguir usando órdenes locales.':response.status===401?'Tu sesión de Supabase ha caducado. Vuelve a iniciar sesión.':'Gemini no está disponible o no está configurado ('+response.status+'). No he cambiado nada.');return}
 if(!Array.isArray(body.actions)||body.actions.length>5){message('Gemini devolvió un resultado inesperado. No he modificado datos.');return}
 if(body.needs_clarification||!body.actions.length){message(String(body.reply||'Necesito que concretes la orden.').slice(0,500));return}
 const normalized=body.actions.map(a=>a?.type==='task.create'?{...a,date:a.date||'',time:a.time||'',notify:a.notify===true,priority:a.priority||'normal'}:a);const errors=normalized.map(check).filter(Boolean);if(errors.length){message('No he ejecutado ninguna acción: '+errors[0]+'. Indica fecha y hora si deseas un aviso.');return}
 const results=normalized.map(applyOne);message(results.map(r=>(r.ok?'✓ ':'✗ ')+r.detail).join(' · '));
 }catch(e){message('No puedo conectar con Gemini. No he modificado nada. Desactiva IA si deseas usar el asistente local.');}
 finally{busy=false;ui()}
 };
 window.oihaneGemini={usage:()=>serverUsage||stats(),enabled,refreshUsage};
})();



/* --- oihane-5313-input --- */

// The Home renderer owns the assistant Enter key behaviour (5.42.0).