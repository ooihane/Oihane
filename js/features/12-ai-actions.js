



/* --- oihane-5318-action-engine --- */

/* Oihane 5.31.9 · Motor unificado: actions are parsed by Gemini, verified here and saved locally. */
(function(){
 'use strict';
 const MODULES=['Compras','Calendario','Tareas','Planes','Hogar','Plantas','Wishlist','Regalos','Estudio','Recetas','Cultura','Viajes','Más'];
 const KEY='oihane_action_context_v1',LIMIT_KEY='oihane_gemini_daily_limit_day_v1',ENABLE='oihane_gemini_enabled_v1';
 const MAP={Compras:'oihane_products',Calendario:'oihane_events',Tareas:'oihane_tasks',...Object.fromEntries(MODULES.filter(n=>!['Compras','Calendario','Tareas'].includes(n)).map(n=>[n,'oihane_'+extraConfig[n].key]))};
 const ALLOWED={
  Compras:['store','category','bought','notes','title'],Calendario:['date','time','duration','people','location','notes','notify','notifyLead','title'],
  Wishlist:['status','price','notes','title'],Regalos:['person','occasion','occasionDate','status','kind','notes','title'],
  Hogar:['room','status','notes','title'],Plantas:['room','location','status','date','frequency','notes','title'],
  Recetas:['status','ingredients','steps','notes','title'],Estudio:['kind','status','date','time','duration','location','place','mode','notes','title'],
  Viajes:['date','endDate','status','location','notes','title'],Cultura:['kind','status','creator','year','platform','notes','title'],
  Planes:['date','time','people','location','status','category','notes','title'],Tareas:['date','time','priority','importance','notes','location','category','notify','notifyLead','done','title'],
  'Más':['status','notes','title']};
 const ROOMS=extraConfig.Hogar.rooms;
 const ST=['General','Lidl','Eroski','Mercadona','Dia'];
 const availableStores=()=>['General',...(Array.isArray(window.oihaneShopStores)?window.oihaneShopStores:ST.slice(1))];
 const VALID_STATUSES={Wishlist:['Idea','Lo quiero ya','Buscando','Elegido','Comprado'],Regalos:extraConfig.Regalos.status,Hogar:extraConfig.Hogar.status,Plantas:extraConfig.Plantas.status,Recetas:extraConfig.Recetas.status,Estudio:['Tema','Guardia','Curso','Pendiente','En espera'],Viajes:extraConfig.Viajes.status,Cultura:['Pendiente','Leído / visto','Obra de arte','Quiero ver en persona','Museo'],Planes:['Sin fecha','Próximo','Realizado'],'Más':extraConfig['Más'].status};
 const clean=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const norm=x=>clean(x).replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
 const iso=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T12:00:00Z'))&&new Date(x+'T12:00:00Z').toISOString().slice(0,10)===x;
 const clock=x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
 const todayMadrid=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Madrid'});
 const dayPacific=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const initialContext=()=>{try{const o=JSON.parse(sessionStorage.getItem(KEY)||'null');return o&&Date.now()-o.at<20*60e3?o:null}catch(_){return null}};
 const get=(m)=>{try{const a=JSON.parse(localStorage.getItem(MAP[m])||'[]');return Array.isArray(a)?a:[]}catch(_){return []}};
 let busy=false;
 function tell(s){let e=document.getElementById('assistantResult');if(!e){e=document.createElement('div');e.id='assistantResult';e.className='assistant-response';document.querySelector('#assistant')?.after(e)}if(e)e.textContent=s;try{window.oihaneSpeakReply?.(s)}catch(_){} }
 function notice(){const text='Has alcanzado las 90 peticiones diarias. A partir de ahora el asistente de voz utilizará únicamente el asistente local hasta restablecer el número de órdenes diarias.';let el=document.getElementById('oihaneAiCapNotice');if(el)return;el=document.createElement('div');el.id='oihaneAiCapNotice';el.className='oihane-ai-cap-notice';el.textContent=text;const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Cerrar aviso');close.style.cssText='float:right;background:none;border:0;font-size:22px';close.onclick=()=>el.remove();el.prepend(close);document.body.appendChild(el);tell(text)}
 function validateAction(a){if(!a||typeof a!=='object'||!MODULES.includes(a.module)||!['create','update','delete','move','complete','water','note','query'].includes(a.op))return 'Acción o módulo desconocido';
  const itemRef=['update','delete','move','complete','water','note'].includes(a.op);
  if(itemRef&&!(typeof a.target==='string'&&a.target.trim().length&&a.target.length<=150)){
   if(!['note','update'].includes(a.op)||a.target!=='@ultimo')return 'Necesito saber qué elemento modificar';
  }
  if(a.op==='create'&&!(typeof a.title==='string'&&a.title.trim().length&&a.title.length<=150))return 'Indica qué quieres guardar';
  if(a.op==='water'&&a.module!=='Plantas')return 'Los riegos solo corresponden a Plantas';
  if(a.op==='move'&&a.module!=='Compras'&&!a.fields?.status)return 'Indica la lista de destino';
  const f=a.fields||{};if(typeof f!=='object'||Array.isArray(f))return 'Datos incorrectos';
  for(const [key,value] of Object.entries(f)){if(!ALLOWED[a.module].includes(key))return 'El campo «'+key+'» no existe en '+a.module;if(typeof value!=='string'&&typeof value!=='number'&&typeof value!=='boolean')return 'Valor incorrecto';if(String(value).length>800)return 'Valor demasiado largo';if(['date','endDate','occasionDate'].includes(key)&&value!==''&&!iso(value))return 'Fecha incorrecta';if(key==='time'&&value!==''&&!clock(value))return 'Hora incorrecta';}
  if(a.op==='note'&&(!String(a.text||'').trim()||String(a.text).length>800))return 'Indica la nota';
  if(a.selector){if(typeof a.selector!=='object'||Array.isArray(a.selector)||Object.keys(a.selector).some(k=>!['date','person','store','room'].includes(k)))return 'Selector incorrecto';if(Object.values(a.selector).some(v=>typeof v!=='string'||v.length>90))return 'Selector incorrecto';}
  if(f.priority!=null&&!['alta','media','normal','baja',1,2,3].includes(f.priority))return 'Prioridad incorrecta';
  if(a.module==='Compras'&&f.store&&!availableStores().includes(f.store))return 'Supermercado desconocido';
  if(a.module==='Hogar'&&f.room&&!ROOMS.includes(f.room))return 'Estancia no reconocida';
  if(a.module==='Hogar'&&a.op==='create'&&!f.room)return '¿Para qué estancia es?';
  if(a.module==='Regalos'&&a.op==='create'&&!f.person)return '¿Para quién es el regalo?';
  if(a.module==='Calendario'&&a.op==='create'&&!f.date)return 'Necesito la fecha del evento';
  if(a.module==='Estudio'&&a.op==='create'&&['Guardia','Curso'].includes(f.kind)&&!f.date)return 'Necesito la fecha de la guardia o curso';
  if(f.status&&VALID_STATUSES[a.module]&&!VALID_STATUSES[a.module].includes(f.status))return 'Sección o estado no disponible';
  if(a.op==='move'&&a.module==='Compras'&&(!availableStores().includes(a.toStore)||!availableStores().includes(a.fromStore||'General')))return 'Lista de compra incorrecta';
  if(a.op==='query'&&!['Compras','Calendario','Tareas','Planes','Hogar','Plantas','Wishlist','Regalos','Estudio','Recetas','Cultura','Viajes','Más'].includes(a.module))return 'Consulta no disponible';
  return '';
 }
 const uniqueId=(list)=>{let id=Date.now()+Math.floor(Math.random()*10000);while(list.some(x=>String(x.id)===String(id)))id++;return id};
 function resolve(list,target,context,module,selector={}){if(target==='@ultimo'){
   if(!context||context.module!==module)return {error:'No sé a qué elemento anterior te refieres'};
   const match=list.filter(i=>String(i.id)===String(context.id));return match.length===1?{item:match[0]}:{error:'El elemento anterior ya no existe'};
 }
 const hits=list.filter(i=>norm(i.title)===norm(target)&&(!selector.date||i.date===selector.date)&&(!selector.person||norm(i.person||i.people)===norm(selector.person))&&(!selector.store||(i.lists||[]).includes(selector.store))&&(!selector.room||i.room===selector.room));if(hits.length===1)return {item:hits[0]};
 if(!hits.length)return {error:'No encuentro «'+target+'» en '+module};return {error:'Hay '+hits.length+' coincidencias para «'+target+'» en '+module+'. Especifica cuál y no cambiaré ninguna'};
 }
 function prepareCreate(m,a,list){const f={...(a.fields||{})},t=a.title.trim();
  if(list.some(i=>norm(i.title)===norm(t)&&(!f.date||i.date===f.date)&&(!f.person||norm(i.person)===norm(f.person))&&(!f.room||norm(i.room)===norm(f.room))))throw Error('Ya existe «'+t+'» en '+m);
  const item={id:uniqueId(list),title:t,created:todayMadrid(),notes:''};
  if(m==='Compras'){Object.assign(item,{store:f.store||'General',lists:['General',...(f.store&&f.store!=='General'?[f.store]:[])],category:f.category||classifyProductCategory(t),bought:false,source:'assistant'});}
  else if(m==='Calendario'){Object.assign(item,{date:f.date,time:f.time||'',duration:Number(f.duration||60),people:f.people||'',location:f.location||'',notes:f.notes||'',notify:f.notify===true,notifyLead:0});}
  else if(m==='Tareas'){Object.assign(item,{date:f.date||'',time:f.time||'',repeat:'',category:f.category||'',location:f.location||'',notes:f.notes||'',context:f.notes||'',importance:2,priority:2,notify:f.notify===true,notifyLead:0,done:false,completedAt:'',lastCompleted:''});}
  else if(m==='Wishlist')item.status='Idea';
  else if(m==='Regalos')Object.assign(item,{status:'Idea',person:f.person,kind:'Producto'});
  else if(m==='Hogar')Object.assign(item,{status:'Cosas fijas que comprar',room:f.room,purchased:false});
  else if(m==='Plantas')Object.assign(item,{status:'Bien',location:f.location||'',lastWatered:'',frequency:Number(f.frequency||7)});
  else if(m==='Recetas')Object.assign(item,{status:'Quiero probar',kind:'Quiero probar',ingredients:'',steps:'',servings:2});
  else if(m==='Estudio')Object.assign(item,{kind:f.kind||'Tema',status:f.kind||'Tema',date:f.date||'',time:f.time||'',duration:String(f.duration|| (f.kind==='Guardia'?480:60)),location:f.location||'',place:f.location||'',mode:'Presencial'});
  else if(m==='Viajes')Object.assign(item,{status:'Quiero ir',date:f.date||'',endDate:f.endDate||''});
  else if(m==='Cultura')Object.assign(item,{kind:'Libro',status:'Pendiente',creator:''});
  else if(m==='Planes')Object.assign(item,{status:f.date?'Próximo':'Sin fecha',category:f.date?'Próximos':'Ideas',date:f.date||'',time:f.time||'',people:f.people||'',location:f.location||''});
  else if(m==='Más')item.status='Preferencia';
  Object.assign(item,f);
  if(m==='Tareas'){const p=priority(f.priority??f.importance);item.importance=p;item.priority=p;item.context=item.notes||'';}
  if(m==='Compras'){item.store=f.store||'General';item.lists=['General',...(item.store!=='General'?[item.store]:[])];}
  if(m==='Planes'&&f.date&&!f.status){item.status='Próximo';item.category='Próximos';}
  if(m==='Cultura'){if(['Libro pendiente','Libro leído'].includes(f.kind)){item.kind='Libro';item.status=f.kind==='Libro leído'?'Leído / visto':'Pendiente';}else if(f.kind==='Serie'||f.kind==='Película'){item.kind='Película / serie';item.mediaType=f.kind;}else if(f.kind==='Artista'||f.kind==='Pintor'){item.kind='Arte';item.status='Obra de arte';item.cultureCategory=f.kind;}}
  if(m==='Recetas')item.kind=item.status;
  if(m==='Estudio'&&f.kind==='Tema')item.status='Tema';
  return item;
 }
 function priority(value){return value==='alta'||value===3?3:value==='baja'||value===1?1:2}
 function patch(m,item,f){for(const [k,v] of Object.entries(f)){if(k==='priority'||k==='importance'){item.priority=priority(v);item.importance=priority(v)}else if(k==='date'||k==='occasionDate'||k==='time'){item[k]=v}else if(k==='category'&&m==='Compras'){item.category=v}else item[k]=v;}
  if(m==='Tareas'&&f.notes!==undefined)item.context=item.notes;
  if(m==='Compras'&&f.store){item.store=f.store;item.lists=['General',...(f.store!=='General'?[f.store]:[])];}
  if(m==='Estudio'&&f.location!==undefined)item.place=f.location;
  if(m==='Recetas'&&f.status)item.kind=f.status;
  if(m==='Planes'&&f.date!==undefined){item.category=item.date?'Próximos':'Ideas';item.status=item.date?'Próximo':'Sin fecha';}
 }
 function linkedEvent(after,module,item,remove=false){
  const ev=after.Calendario;const idx=ev.findIndex(x=>x.sourceModule===module&&String(x.sourceId)===String(item.id));
  if(remove||!item.date){if(idx>=0)ev.splice(idx,1);return;}
  const title=item.title|| (item.kind==='Guardia'?'Guardia':'Plan');
  const value={id:idx>=0?ev[idx].id:uniqueId(ev),sourceModule:module,sourceId:item.id,title,date:item.date,time:item.time||'',duration:Number(item.duration||60),people:item.people||'',location:item.location||'',notes:item.notes||'',notify:false};
  if(idx>=0)ev[idx]={...ev[idx],...value};else ev.push(value);
 }
 function commit(before,after){const touched=Object.keys(after).filter(k=>JSON.stringify(after[k])!==JSON.stringify(before[k]));
  if(!touched.length)return;
  const written=[];try{for(const m of touched){localStorage.setItem(MAP[m],JSON.stringify(after[m]));written.push(m)}}catch(err){for(const m of written){try{localStorage.setItem(MAP[m],JSON.stringify(before[m]))}catch(_){}}throw Error('No se pudo guardar; revisa el almacenamiento del dispositivo');}
  // Update in-memory references used by the original screen and calendar renderers.
  if(touched.includes('Compras'))products=after.Compras;
  if(touched.includes('Tareas'))tasks=after.Tareas;
  if(touched.includes('Calendario'))events=after.Calendario;
  try{queueLocalSnapshot?.()}catch(_){}try{queueCloudSync?.()}catch(_){}
 }
 function execute(actions){if(!Array.isArray(actions)||!actions.length||actions.length>5)return {ok:false,msg:'La orden debe contener entre 1 y 5 acciones'};
  for(const a of actions){const e=validateAction(a);if(e)return {ok:false,msg:e};}
  const before=Object.fromEntries(MODULES.map(m=>[m,get(m)]));const after=structuredClone(before),context=initialContext(),messages=[];
  let last=null;let changes=false;
  try{for(const a of actions){const m=a.module,list=after[m],f={...(a.fields||{})};
    if(a.op==='query'){const matching=a.target?list.filter(i=>norm(i.title).includes(norm(a.target))):list;messages.push(m+': '+(matching.length?matching.slice(0,8).map(i=>i.title+(i.date?' ('+i.date+')':'')).join(', '):'no hay coincidencias'));continue;}
    if(a.op==='create'){const obj=prepareCreate(m,a,list);list.push(obj);if((m==='Planes'||m==='Estudio'&&obj.kind==='Guardia')&&obj.date)linkedEvent(after,m,obj);last={module:m,id:obj.id};changes=true;messages.push('He añadido «'+obj.title+'» a '+(m==='Más'?'Ajustes':m)+'.');continue;}
    const matched=resolve(list,a.target,context,m,a.selector||{});if(matched.error)throw Error(matched.error);const item=matched.item;
    if(a.op==='delete'){if(!confirm('¿Eliminar «'+item.title+'» de '+m+'? Esta acción no se puede deshacer.'))throw Error('Eliminación cancelada');list.splice(list.indexOf(item),1);if(m==='Planes'||m==='Estudio'){after.Calendario=after.Calendario.filter(e=>!(e.sourceModule===m&&String(e.sourceId)===String(item.id)))};changes=true;messages.push('He eliminado «'+item.title+'» de '+(m==='Más'?'Ajustes':m)+'.');last=null;continue;}
    if(a.op==='note'){item.notes=[item.notes||'',a.text.trim()].filter(Boolean).join('\n');}
    else if(a.op==='water'){if(window.oihanePlantLogWatering)window.oihanePlantLogWatering(item,f.date||todayMadrid());else{item.lastWatered=f.date||todayMadrid();item.soilStatus='';item.wateringHistory=Array.isArray(item.wateringHistory)?item.wateringHistory:[];item.wateringHistory.push({date:item.lastWatered,at:new Date().toISOString(),soil:''});item.status='Bien';item.date='';}}
    else if(a.op==='complete'){if(m==='Tareas'){item.done=true;item.completedAt=new Date().toISOString()}else if(m==='Compras')item.bought=true;else if(m==='Planes')item.status='Realizado';else if(m==='Recetas')item.status='Cocinada';else throw Error('Completar no está definido en '+m);}
    else if(a.op==='move'){if(m==='Compras'){const from=a.fromStore;const to=a.toStore;if(from==='General'&&item.lists?.length>1)throw Error('Indica el supermercado de origen');if(!item.lists?.includes(from))throw Error('El producto no está en '+from);item.lists=item.lists.filter(v=>v!==from);if(!item.lists.includes(to))item.lists.push(to);if(!item.lists.includes('General'))item.lists.unshift('General');if(to!=='General')item.store=to;}
      else patch(m,item,f);}
    else if(a.op==='update')patch(m,item,f);
    if((m==='Planes'||m==='Estudio'&&['Curso','Guardia'].includes(item.kind))&&(a.op==='update'||a.op==='move'))linkedEvent(after,m,item);
    last={module:m,id:item.id};changes=true;messages.push(a.op==='water'?'He registrado el riego de «'+item.title+'».':a.op==='note'?'He añadido una nota a «'+item.title+'» en '+m+'.':a.op==='complete'?'He marcado «'+item.title+'» como completado en '+m+'.':a.op==='move'&&m==='Compras'?'He movido «'+item.title+'» de '+a.fromStore+' a '+a.toStore+'.':'He actualizado «'+item.title+'» en '+(m==='Más'?'Ajustes':m)+'.');
   }
   if(changes)commit(before,after);
   if(last)try{sessionStorage.setItem(KEY,JSON.stringify({...last,at:Date.now()}))}catch(_){}
   if(changes){try{if(screen==='home')home();else if(screen==='Compras')renderShopping();else if(screen==='Calendario')renderCalendar();else if(screen==='Tareas')renderTasks();else if(MODULES.includes(screen))openModule(screen)}catch(e){console.warn('Oihane repaint',e)}}
   return {ok:true,msg:messages.join(' · ')};
  }catch(e){return {ok:false,msg:String(e.message||e)}}
 }
 function parseQuick(q){
  const s=q.trim().replace(/[.!]+$/,'');let m;
  // Preserve Gemini for all ambiguous/compound requests: local only for explicit, single-store purchases.
  if(/;|\b(?:y luego|adem[aá]s|despu[eé]s|recu[eé]rdame|cambia|borra|mueve|prioridad|nota|mañana|fecha|hora)\b/i.test(s))return null;
  m=s.match(/^(?:a[nñ]ade|agrega|apunta|mete|pon)\s+(.+?)\s+(?:a|en)\s+(?:(?:la lista de )?(?:la )?(?:compra\s+(?:de\s+)?)?)(Mercadona|Lidl|Eroski|D[ií]a|General)$/i);
  if(!m)return null;
  const store=clean(m[2])==='dia'?'Dia':m[2][0].toUpperCase()+m[2].slice(1).toLowerCase();
  const raw=m[1].trim().replace(/^(?:un|una|unos|unas)\s+/i,'');
  // Lists of clearly separate products; avoid falsely splitting normal compound item names.
  if(!raw||raw.length>120||/\b(?:para|con|sin|a las|el día|categoría)\b/i.test(raw))return null;
  const parts=raw.split(/\s*,\s*|\s+y\s+/i).map(x=>x.trim()).filter(Boolean);
  if(parts.length<1||parts.length>5||parts.some(x=>x.length<2||x.length>80))return null;
  return parts.map(title=>({op:'create',module:'Compras',title,fields:{store}}));
 }
 function isReminder(q){return /^\s*(?:(?:oye|por favor)[, ]+)?(?:recu[eé]rdame|acu[eé]rdate\s+de|no\s+te\s+olvides\s+de|no\s+olvides)\b/i.test(q)}
 function normalizeReminderActions(q,actions){
  if(!isReminder(q)||!Array.isArray(actions))return actions;
  return actions.map(a=>{
   if(!a||a.op!=='create')return a;
   const original={...(a.fields||{})};
   // Reminder descriptions and deadlines belong in Tasks, not Plans.
   const fields=Object.fromEntries(Object.entries(original).filter(([k])=>['date','time','priority','importance','notes','location','notify','notifyLead'].includes(k)));
   if(/\bma[nñ]ana\b/i.test(q)&&!fields.date){const p=todayMadrid().split('-').map(Number);fields.date=new Date(Date.UTC(p[0],p[1]-1,p[2]+1,12)).toISOString().slice(0,10);}
   const t={...a,module:'Tareas',fields};
   if(t.fields.notify===true&&(!t.fields.date||!t.fields.time))t.fields.notify=false;
   return t;
  });
 }
 let queued=false;
 const showBusy=(v)=>{busy=v;const button=document.getElementById('oihaneGeminiToggle');if(button)button.disabled=v};
 window.oihaneActionEngine={version:'5.31.9',execute,validateAction,parseQuick,modules:MODULES};
 window.handleAssistantCommand=async function(input){const q=String(input||'').trim();if(!q)return;if(busy){tell('Estoy procesando la orden anterior');return}
  const quick=parseQuick(q);if(quick){const res=execute(quick);tell(res.ok?res.msg:'No he podido completar la orden: '+res.msg);window.oihaneLastAssistantTiming={route:'local'};return}
  // Los comandos cotidianos no dependen de Gemini. La IA solo interpreta lo que el motor local no identifica.
  if(typeof window.oihaneLocalCommand==='function' && /\b(?:anade|añade|agrega|apunta|mete|pon|compra|comprar|recuérdame|recuerdame|tarea|pendiente|curso|guardia|cita|reunión|reunion|evento|plan|he regado|he terminado|completado|que tareas|qué tareas|abre|muestra)\b/i.test(q)){
   window.oihaneLastAssistantTiming={route:'local'};return window.oihaneLocalCommand(q);
  }
  if(localStorage.getItem('oihane_gemini_enabled')!=='1' && localStorage.getItem(ENABLE)!=='1'){
   return window.oihaneLocalCommand?.(q);
  }
  if(localStorage.getItem(LIMIT_KEY)===dayPacific()){tell('Hasta que se restablezcan las 90 peticiones, esta orden no está disponible en el asistente local. No he cambiado nada.');return}
  if(localStorage.getItem(ENABLE)!=='1'){tell('Esta orden necesita el intérprete inteligente. Activa ✦ IA para interpretarla.');return}
  const cfg=typeof syncConfig==='function'?syncConfig():null;
  if(!cfg?.access||!cfg?.key||!cfg?.url){tell('Inicia sesión en Supabase desde Ajustes → Sincronización.');return}
  const start=Date.now();showBusy(true);
  try{const r=await fetch(cfg.url.replace(/\/$/,'')+'/functions/v1/oihane-ai',{method:'POST',headers:{'Authorization':'Bearer '+cfg.access,'apikey':cfg.key,'Content-Type':'application/json'},body:JSON.stringify({message:q,stores:(()=>{try{return JSON.parse(localStorage.getItem('oihane_custom_shops_v1')||'[]')}catch(_){return []}})(),context:(()=>{const c=initialContext();const current=c&&get(c.module).find(i=>String(i.id)===String(c.id));return current?{module:c.module,title:String(current.title||'').slice(0,150)}:null})()})});
   const data=await r.json().catch(()=>({}));window.oihaneLastAssistantTiming={route:'gemini',elapsedMs:Date.now()-start,status:r.status};
   if(r.status===429&&data.error==='daily_cap'){try{localStorage.setItem(LIMIT_KEY,dayPacific())}catch(_){}notice();return}
   if(!r.ok){
    const cause=String(data?.error||'');
    const details={
      invalid_session:'La sesión de Supabase ha caducado. Vuelve a iniciar sesión.',
      unauthorized:'Inicia sesión en Supabase para usar Gemini.',
      quota_setup_required:'No se ha podido comprobar el límite de Supabase.',
      daily_cap:'Has alcanzado el límite diario; puedes seguir con las órdenes locales.',
      gemini_quota:'Gemini ha alcanzado su cuota. Las órdenes locales siguen disponibles.',
      gemini_permission:'Google ha rechazado la clave o los permisos de Gemini. Revisa los registros de oihane-ai.',
      gemini_model:'El modelo configurado no está disponible o no acepta esta petición. Revisa GEMINI_MODEL y los registros de oihane-ai.',
      gemini_upstream:'Google tiene un problema temporal. Vuelve a intentarlo más tarde.',
      gemini_timeout:'Gemini ha tardado demasiado. Puedes reintentar la orden.',
      gemini_response_invalid:'Gemini ha enviado una respuesta incompleta o que no se puede interpretar. Prueba a expresarlo de otra forma.',
      invalid_ai_response:'Gemini no devolvió el formato esperado. No se ha modificado ningún dato.',
      invalid_action:'La respuesta de Gemini no es segura o no corresponde con Oihane. Prueba a expresarlo de otra forma.',
      gemini_error:'No se ha podido completar la consulta de Gemini; revisa los registros de oihane-ai.'
    };
    tell((details[cause]||'El intérprete no está disponible ('+r.status+').')+' No he cambiado nada.');
    console.warn('Oihane AI error',r.status,cause);return
   }
   if(data.needs_clarification||!data.actions?.length){tell(String(data.reply||'Necesito más detalles.').slice(0,500));return}
   const actions=normalizeReminderActions(q,data.actions);
   if(!Array.isArray(actions)||!actions.length||actions.length>5){tell('La IA no ha preparado una orden válida. No se ha cambiado nada.');return}
   // Present the exact operations before modifying stored data.
   // Normal actions run immediately. Unexpected AI-initiated deletion is refused.
   if(actions.some(a=>a.op==='delete')&&!/\b(?:borra|borrar|elimina|eliminar|quita|quitar|suprime|suprimir)\b/i.test(q)){
    tell('No he eliminado nada porque no has pedido explícitamente borrar.');return;
   }
   const res=execute(actions);tell(res.ok?res.msg:'No he podido completar la orden: '+res.msg);
  }catch(e){if(typeof window.oihaneLocalCommand==='function'){window.oihaneLocalCommand(q)}else tell('No he podido conectar con Gemini. No he modificado datos.');console.warn('Oihane AI',e)}finally{showBusy(false)}
 };
})();




/* --- oihane-5320-features --- */

(()=>{'use strict';
 const $=id=>document.getElementById(id);
 // Month is a natural calendar month, always beginning on the 1st (Monday-first display).
 let monthAnchor=new Date();monthAnchor=new Date(monthAnchor.getFullYear(),monthAnchor.getMonth(),1,12);
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 function monthGrid(){const y=monthAnchor.getFullYear(),m=monthAnchor.getMonth(),total=new Date(y,m+1,0).getDate(),offset=(new Date(y,m,1).getDay()+6)%7;
   const cells=['L','M','X','J','V','S','D'].map(t=>`<span class="month-weekday">${t}</span>`);
   for(let n=0;n<Math.ceil((offset+total)/7)*7;n++){
     const d=n-offset+1;
     if(d<1||d>total){cells.push('<span class="month-cell is-empty" aria-hidden="true"></span>');continue}
     const key=iso(new Date(y,m,d,12)),dayEvents=events.filter(e=>e.date===key),items=dayEvents.sort((a,b)=>(a.time||'').localeCompare(b.time||''));
     cells.push(`<button type="button" class="month-cell ${key===today()?'is-today':''}" onclick="oihaneSelectMonthDay('${key}')" aria-label="${d} de ${monthAnchor.toLocaleDateString('es-ES',{month:'long'})}: ${items.length} eventos"><strong>${d}</strong>${items.slice(0,2).map(e=>`<span class="month-event">${esc(e.time?e.time+' ':'')}${esc(e.title)}</span>`).join('')}${items.length>2?`<span class="month-more">+${items.length-2}</span>`:''}</button>`);
   }
   return `<div class="oihane-month-switch"><button type="button" aria-label="Mes anterior" onclick="oihaneShiftMonth(-1)">‹</button><strong>${monthAnchor.toLocaleDateString('es-ES',{month:'long',year:'numeric'})}</strong><button type="button" aria-label="Mes siguiente" onclick="oihaneShiftMonth(1)">›</button></div><div class="oihane-month-grid">${cells.join('')}</div>`;
 }
 const prevRows=window.calendarRows;
 window.calendarRows=function(){return calendarView==='month'?monthGrid():prevRows()};
 window.oihaneShiftMonth=function(step){monthAnchor=new Date(monthAnchor.getFullYear(),monthAnchor.getMonth()+step,1,12);const list=$('calendarList');if(list&&calendarView==='month')list.innerHTML=monthGrid();window.oihaneEnhanceMonth?.()};
 window.oihaneSelectMonthDay=function(date){const chosen=$('eventDate');if(chosen)chosen.value=date;calendarView='day';
   document.querySelectorAll('.calendar-toolbar .subtabs button').forEach(b=>b.classList.toggle('active',b.textContent.trim()==='Todos'));
   window.calendarFocusDate(date);const strip=document.querySelector('.rolling-week-strip');if(strip)strip.style.display='none';
 };
 // calendarRows() ya devuelve monthGrid() al seleccionar el mes; no es
 // necesario volver a reemplazar el mismo HTML tras renderCalendar().
 const prevView=window.setCalendarView;
 window.setCalendarView=function(view,button){if(view==='year')view='month';prevView(view,button);if(view==='month'){$('calendarList').innerHTML=monthGrid()}window.oihaneEnhanceMonth?.()};
 // 'Más' remains the storage key; unifiedHeader and Home render 'Ajustes' directly.

})();