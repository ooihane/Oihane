/* Oihane 5.59.36 · Órdenes de voz locales por módulo.
 * Capa aditiva: intercepta órdenes claras no cubiertas y delega el resto al asistente previo.
 */
(function(){
 'use strict';
 const engine=()=>window.oihaneActionEngine;
 const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[¿?¡!]/g,' ').replace(/\s+/g,' ').trim();
 const say=(msg,kind='ok')=>{let b=document.getElementById('assistantResult');if(!b){b=document.createElement('div');b.id='assistantResult';b.className='assistant-response';document.querySelector('#assistant')?.after(b)}b.textContent=msg;b.dataset.kind=kind;window.oihaneSpeakReply?.(msg)};
 const dateOf=q=>window.oihaneAssistant538?.parseDate?.(q)||'';
 const timeOf=q=>window.oihaneAssistant538?.parseTime?.(q)||'';
 const stripWake=s=>String(s||'').replace(/^(?:(?:oye\s+)?oihane|por favor)[,:\s]+/i,'').trim();
 const verb=/^(?:añade|anade|agrega|apunta|anota|mete|pon|guarda|crea|registra|quiero añadir|quiero anadir)\s+/i;
 const bodyOf=s=>stripWake(s).replace(verb,'').trim();
 const titleOf=s=>String(s||'').trim().replace(/^(?:un|una|unos|unas|el|la|los|las)\s+/i,'').replace(/[.!?,;]+$/,'').trim();
 const people=['Rubén','Mamá','Unax','Rober','Aita','Patricia','Otros'];
 const personIn=s=>people.find(p=>new RegExp('\\b'+clean(p)+'\\b','i').test(clean(s)))||'';
 function run(actions){const e=engine();if(!e?.execute){say('El motor local de acciones no está disponible. No he guardado nada.','error');return true}const r=e.execute(actions);say(r.ok?r.msg:'No he podido completar la orden: '+r.msg,r.ok?'ok':'error');window.oihaneLastAssistantTiming={route:'local',feature:'voice-module-catalog'};return true}
 function create(q){
  const body=bodyOf(q),date=dateOf(q),time=timeOf(q);let m,title,fields={},module;
  // Regalos: "añade un producto a la lista de regalos para Rubén".
  m=body.match(/^(.+?)\s+(?:a|en)\s+(?:la\s+lista\s+de\s+)?regalos?(?:\s+para\s+(.+))?$/i);
  if(m){module='Regalos';title=titleOf(m[1]);fields.person=personIn(m[2]||body);
   if(!fields.person){say('¿Para quién es el regalo? Dime, por ejemplo, «para Rubén». No he guardado nada.','question');return true}
   fields.kind=/experiencia|entrada|escapada|viaje/i.test(title)?'Experiencia':/libro|novela|comic/i.test(clean(title))?'Libros y cultura':/movil|ordenador|auriculares|tablet|tecnologia/i.test(clean(title))?'Tecnología':'Producto';
   const occasion=['Navidad','Aniversario','Cumpleaños'].find(x=>clean(q).includes(clean(x)));if(occasion)fields.occasion=occasion;if(date)fields.occasionDate=date;
   return run([{op:'create',module,title,fields}]);
  }
  m=body.match(/^(?:un\s+)?regalo\s+para\s+([^:]+):\s*(.+)$/i);
  if(m){const person=personIn(m[1]);if(!person){say('No he identificado a la persona destinataria. No he guardado nada.','question');return true}return run([{op:'create',module:'Regalos',title:titleOf(m[2]),fields:{person,kind:'Producto'}}])}
  // Wishlist.
  m=body.match(/^(.+?)\s+(?:a|en)\s+(?:la\s+)?(?:wishlist|lista\s+de\s+deseos|lista\s+de\s+cosas\s+que\s+quiero)(?:\s+(idea|lo\s+quiero\s+ya))?$/i);
  if(m)return run([{op:'create',module:'Wishlist',title:titleOf(m[1]),fields:{status:/lo quiero ya/i.test(m[2]||'')?'Lo quiero ya':'Idea'}}]);
  // Calendario.
  m=body.match(/^(.+?)\s+(?:al|a el|en el)\s+calendario(?:\s+(?:para\s+)?(.+))?$/i);
  if(m){title=titleOf(m[1]);if(!date){say('¿Para qué día quieres añadir «'+title+'» al calendario?','question');return true}return run([{op:'create',module:'Calendario',title,fields:{date,time}}])}
  // Estudio: tema, curso o guardia.
  m=body.match(/^(.+?)\s+(?:a|en)\s+(?:el\s+)?estudio(?:\s+(?:para\s+)?(.+))?$/i);
  if(m){title=titleOf(m[1]);const kind=/guardia/i.test(title)?'Guardia':/curso|formacion|taller|seminario/i.test(clean(title))?'Curso':'Tema';if(['Guardia','Curso'].includes(kind)&&!date){say('¿Qué fecha tiene «'+title+'»? Necesito el día para guardar el curso o la guardia.','question');return true}return run([{op:'create',module:'Estudio',title,fields:{kind,date,time}}])}
  // Planes.
  m=body.match(/^(.+?)\s+(?:a|en)\s+planes?$/i);
  if(m)return run([{op:'create',module:'Planes',title:titleOf(m[1]),fields:{date,time}}]);
  m=body.match(/^(?:un\s+)?plan\s+(?:para\s+)?(.+)$/i);
  if(m)return run([{op:'create',module:'Planes',title:titleOf(m[1]),fields:{date,time}}]);
  // Tareas, cuando no las reconoce la ruta local anterior.
  m=body.match(/^(.+?)\s+(?:a|en)\s+(?:la\s+)?(?:lista\s+de\s+)?tareas?$/i);
  if(m)return run([{op:'create',module:'Tareas',title:titleOf(m[1]),fields:{date,time}}]);
  // Recetas.
  m=body.match(/^(?:una\s+)?receta\s+(?:de\s+)?(.+?)(?:\s+(?:a|en)\s+recetas?)?$/i);
  if(m)return run([{op:'create',module:'Recetas',title:titleOf(m[1]),fields:{status:'Quiero probar'}}]);
  // Plantas.
  m=body.match(/^(.+?)\s+(?:a|en)\s+(?:el\s+)?plantas?(?:\s+en\s+(.+))?$/i);
  if(m)return run([{op:'create',module:'Plantas',title:titleOf(m[1]),fields:{location:titleOf(m[2]||'')}}]);
  // Hogar requires a recognized room; never guess it.
  m=body.match(/^(.+?)\s+(?:a|en)\s+(?:el\s+)?hogar(?:\s+en\s+(.+))?$/i);
  if(m){title=titleOf(m[1]);const rooms=(typeof extraConfig!=='undefined'&&extraConfig.Hogar?.rooms)||window.extraConfig?.Hogar?.rooms||[];const room=rooms.find(x=>clean(x)===clean(titleOf(m[2]||'')));if(!room){say('¿En qué estancia va «'+title+'»? Dime una estancia de Hogar, por ejemplo cocina, dormitorio o salón.','question');return true}return run([{op:'create',module:'Hogar',title,fields:{room}}])}
  // Viajes.
  m=body.match(/^(?:un\s+)?viaje\s+(?:a\s+)?(.+?)(?:\s+(?:a|en)\s+viajes?)?$/i);
  if(m)return run([{op:'create',module:'Viajes',title:titleOf(m[1]),fields:{date}}]);
  // Cultura.
  m=body.match(/^(?:un\s+)?(libro|pelicula|película|serie|artista|museo)\s+(.+?)\s+(?:a|en)\s+cultura$/i);
  if(m){const kind=/libro/i.test(m[1])?'Libro':/museo/i.test(m[1])?'Museo':/artista/i.test(m[1])?'Arte':'Película / serie';return run([{op:'create',module:'Cultura',title:titleOf(m[2]),fields:{kind}}])}
  return false;
 }
 const moduleWords=[['Regalos',/\bregalos?\b/],['Wishlist',/\bwishlist|deseos|cosas que quiero\b/],['Planes',/\bplanes?\b/],['Estudio',/\bestudio|cursos?|guardias|temas\b/],['Plantas',/\bplantas?\b/],['Hogar',/\bhogar\b/],['Recetas',/\brecetas?\b/],['Cultura',/\bcultura|libros?|peliculas?|series\b/],['Viajes',/\bviajes?\b/],['Pedidos',/\bpedidos?\b/]];
 function query(q){
  const s=clean(q);if(!/^(que|cuales|cuantos|cuantas|dime|muestrame|ensename|lista|que tengo|que hay|que regalos|que planes|que viajes|que libros|que recetas|que plantas|que quiero)\b/.test(s))return false;
  const found=moduleWords.find(x=>x[1].test(s));if(!found)return false;
  let list=[];if(found[0]==='Pedidos'){try{list=JSON.parse(localStorage.getItem('oihane_orders')||'[]')}catch(_){}}else list=window.extraItems?.(found[0])||[];
  const person=personIn(q);if(person)list=list.filter(x=>clean(x.person||'')===clean(person));
  const pending=list.filter(x=>!['Comprado','Realizado','Entregado','Cocinada','Leído / visto'].includes(x.status||''));
  const items=(pending.length?pending:list).slice(0,10).map(x=>x.title||x.name).filter(Boolean);
  say(found[0]+(person?' para '+person:'')+': '+(items.length?items.join(', '):'no hay elementos guardados.'));return true;
 }
 function order(q){
  const body=bodyOf(q),m=body.match(/^(?:un\s+)?pedido\s+(?:de\s+)?(.+?)(?:\s+(?:en|a)\s+pedidos?)?$/i);if(!m)return false;
  const name=titleOf(m[1]);let list=[];try{list=JSON.parse(localStorage.getItem('oihane_orders')||'[]')}catch(_){}
  if(list.some(x=>clean(x.name)===clean(name)&&x.status!=='Entregado')){say('Ese pedido ya está registrado. No he creado un duplicado.');return true}
  const stamp=new Date().toISOString();list.push({id:'voice-'+Date.now(),name,store:'',orderNumber:'',carrier:'',trackingNumber:'',trackingURL:'',purchaseDate:'',estimatedDate:dateOf(q),deliveryType:'A domicilio',location:'',status:'Recibido',sharedWithPartner:true,notify:false,latestUpdate:'',notes:'Añadido con el asistente de voz',createdAt:stamp,updatedAt:stamp});
  try{localStorage.setItem('oihane_orders',JSON.stringify(list));window.queueLocalSnapshot?.();window.queueCloudSync?.();window.oihaneMixedChanged?.('Pedidos');if(window.screen==='Pedidos')window.renderOrders?.();say('He registrado el pedido «'+name+'» en Pedidos.');return true}catch(_){say('No he podido guardar el pedido. No he confirmado ningún cambio.','error');return true}
 }
 function work(q){
  const s=clean(q);
  if(/^(que|como|cuando|dime|muestrame)\b/.test(s)&&/\b(turno|trabaja|trabajo|guardia|vacaciones|festivo|saliente|libre)\b/.test(s)){
   const who=personIn(q)||(/\boihane\b/.test(s)?'Oihane':'Rubén'),day=dateOf(q)||new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Madrid'}),rows=window.oihaneWorkVoiceQuery?.(who,day)||[];
   say('Trabajo de '+who+' para '+day+': '+(rows.length?rows.map(x=>x.kind+(x.startTime?' de '+x.startTime+' a '+x.endTime:'')).join(', '):'sin turnos o periodos registrados.'));return true;
  }
  if(!/\b(guardia|vacaciones|festivo|saliente|libre|ap|tarde)\b/.test(s)||!/\b(para|el|dia|añade|anade|registra|apunta|guarda|pon)\b/.test(s))return false;
  const date=dateOf(q);if(!date){say('¿Para qué fecha quieres registrar ese turno o periodo en Trabajo?','question');return true}
  const person=personIn(q)||(/\boihane\b/i.test(q)?'Oihane':'');
  const kind=/vacaciones/.test(s)?'Vacaciones':/festivo/.test(s)?'Festivo':/saliente/.test(s)?'Saliente':/\blibre\b/.test(s)?'Libre':/\bap\b/.test(s)?'AP':/tarde/.test(s)?'Tarde':'Guardia';
  const result=window.oihaneWorkCreateVoiceEntry?.({person,kind,start:date,end:date,startTime:timeOf(q),endTime:''});
  if(!result){say('La creación de turnos por voz no está disponible. No he guardado nada.','error');return true}
  if(!result.ok){say(result.message||'No he podido guardar el turno.','error');return true}
  say('He registrado '+kind+' de '+result.person+' para '+date+'.');return true;
 }
 function action(q){
  const s=stripWake(q);let m;
  m=s.match(/^(?:borra|elimina|quita)\s+(.+?)\s+de\s+(regalos?|wishlist|planes?|estudio|plantas?|hogar|recetas?|cultura|viajes?|tareas?)$/i);
  if(m){const module=moduleWords.find(x=>x[1].test(clean(m[2])))?.[0];if(module)return run([{op:'delete',module,target:titleOf(m[1])}])}
  m=s.match(/^marca\s+(.+?)\s+como\s+completad[oa]\s+en\s+(tareas?|planes?|recetas?|compras)$/i);
  if(m){const module=clean(m[2]).startsWith('tarea')?'Tareas':clean(m[2]).startsWith('plan')?'Planes':clean(m[2]).startsWith('receta')?'Recetas':'Compras';return run([{op:'complete',module,target:titleOf(m[1])}])}
  m=s.match(/^he\s+regado\s+(.+)$/i);if(m)return run([{op:'water',module:'Plantas',target:titleOf(m[1])}]);
  m=s.match(/^(?:marca|pon|cambia)\s+(.+?)\s+(?:como|a)\s+(comprado|elegido|idea|buscando|lo quiero ya|realizado|leido|pendiente)\s+en\s+(regalos?|wishlist|planes?|estudio|plantas?|hogar|recetas?|cultura|viajes?)$/i);
  if(m){const module=moduleWords.find(x=>x[1].test(clean(m[3])))?.[0];if(module){const raw=m[2].toLowerCase(),status=raw==='leido'?'Leído / visto':raw==='realizado'?'Realizado':raw[0].toUpperCase()+raw.slice(1);return run([{op:'update',module,target:titleOf(m[1]),fields:{status}}])}}
  return false;
 }
 const previous=window.handleAssistantCommand;if(typeof previous!=='function')return;
 window.handleAssistantCommand=function(raw){const q=String(raw||'').trim();if(!q)return;try{if(order(q)||work(q)||query(q)||action(q)||create(q))return}catch(error){console.warn('Oihane voice module command',error);say('No he podido interpretar esa orden con seguridad. No he cambiado ningún dato.','error');return}return previous.apply(this,arguments)};
 window.oihaneVoiceCommandCatalog={version:'5.59.36',modules:['Compras','Calendario','Tareas','Planes','Hogar','Plantas','Wishlist','Regalos','Estudio','Recetas','Cultura','Viajes','Pedidos','Trabajo'],examples:['Añade un producto a la lista de regalos para Rubén','Añade un reloj a Regalos para Mamá','Añade colonia a Wishlist','Añade dentista al calendario para mañana a las 18','Añade un curso de ecografía a Estudio para el viernes','Añade una monstera a Plantas','Añade una lámpara a Hogar en el dormitorio','Añade una receta de tortilla a Recetas','Añade un viaje a Lisboa a Viajes','Registra una guardia para Rubén mañana','Añade un pedido de zapatillas']};
})();