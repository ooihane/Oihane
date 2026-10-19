



/* --- funcionalidad-08 --- */

/* Oihane 5.26 — asistente conversacional local ampliado.
   Interpreta intención, fecha, hora y lugar sin enviar información privada a terceros. */
(function(){
 const previousAssistant=window.handleAssistantCommand;
 const cleanText=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[¿?¡!]/g,' ').replace(/\s+/g,' ').trim();
 const isoLocal=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 function assistantDate(text){
  const n=cleanText(text),now=new Date();now.setHours(12,0,0,0);
  if(/\bpasado manana\b/.test(n)){now.setDate(now.getDate()+2);return isoLocal(now)}
  if(/\bmanana\b/.test(n)){now.setDate(now.getDate()+1);return isoLocal(now)}
  if(/\bhoy\b/.test(n)){return today()}
  const slash=n.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if(slash){let y=slash[3]?Number(slash[3]):now.getFullYear();if(y<100)y+=2000;let d=new Date(y,Number(slash[2])-1,Number(slash[1]),12);if(!slash[3]&&d<new Date(today()+'T00:00:00'))d.setFullYear(d.getFullYear()+1);if(d.getDate()===Number(slash[1])&&d.getMonth()===Number(slash[2])-1)return isoLocal(d)}
  const months={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11};
  const named=n.match(/\b(?:el\s+)?(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+(\d{4}))?\b/);
  if(named){let y=Number(named[3]||now.getFullYear()),d=new Date(y,months[named[2]],Number(named[1]),12);if(!named[3]&&d<new Date(today()+'T00:00:00'))d.setFullYear(d.getFullYear()+1);if(d.getDate()===Number(named[1])&&d.getMonth()===months[named[2]])return isoLocal(d)}
  const days=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  const wd=n.match(/\b(?:el\s+)?(proximo\s+|que viene\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\b/);
  if(wd){const target=days.indexOf(wd[2]),current=now.getDay();let delta=(target-current+7)%7;if(delta===0)delta=7;if(wd[1])delta+=7;now.setDate(now.getDate()+delta);return isoLocal(now)}
  return '';
 }
 function assistantTime(text){
  let m=String(text||'').match(/\b(?:a\s+las?|sobre\s+las?|hacia\s+las?|para\s+las?)\s*(\d{1,2})(?:(?::|[.h])\s*(\d{2}))?\s*(?:de\s+la\s+(manana|tarde|noche))?/i);
  if(!m)m=String(text||'').match(/\b(\d{1,2})\s*h\s*(\d{2})?\b/i);
  if(!m)return '';
  let h=Number(m[1]),min=Number(m[2]||0);const period=cleanText(m[3]||'');if(period==='tarde'||period==='noche'){if(h<12)h+=12}else if(period==='manana'&&h===12)h=0;
  if(h>23||min>59)return '';return String(h).padStart(2,'0')+':'+String(min).padStart(2,'0');
 }
 function assistantLocation(text){
  const m=String(text||'').match(/\b(?:en|ubicado en|ubicada en|que sera en|que sera en el|que sera en la)\s+([^,;.!?]+?)(?=\s+(?:a\s+las?|sobre\s+las?|hacia\s+las?|de\s+\d{1,2}\s*(?:a|hasta)|el\s+(?:lunes|martes|miercoles|jueves|viernes|sabado|domingo)|manana|pasado manana|hoy|con\s+|desde\s+)|[,;.!?]|$)/i);
  if(!m)return '';let loc=m[1].trim().replace(/^(?:el|la|los|las)\s+/i,'');return loc.slice(0,100);
 }
 function assistantTitle(raw,kind,location){
  let t=String(raw||'');
  t=t.replace(/\b(?:pasado\s+mañana|mañana|hoy)\b/ig,' ')
   .replace(/\b(?:el\s+)?(?:próximo\s+|que viene\s+)?(?:lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/ig,' ')
   .replace(/\b(?:el\s+)?\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,' ')
   .replace(/\b(?:el\s+)?\d{1,2}\s+de\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+\d{4})?\b/ig,' ')
   .replace(/\b(?:a\s+las?|sobre\s+las?|hacia\s+las?|para\s+las?)\s*\d{1,2}(?:(?::|[.h])\s*\d{2})?\s*(?:de\s+la\s+(?:mañana|tarde|noche))?/ig,' ')
   .replace(/\b\d{1,2}\s*h\s*\d{0,2}\b/ig,' ');
  if(location){const re=new RegExp('\\b(?:ubicado en|ubicada en|que sera en|en)\\s+(?:el |la |los |las )?'+location.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');t=t.replace(re,' ')}
  t=t.replace(/\b(?:por favor|oye|oihane|apunta|anota|añade|agrega|guarda|crea|programa|mete|registra)\b/ig,' ')
   .replace(/\b(?:para mi agenda|en mi agenda|en el calendario|al calendario|en estudio|en la lista de tareas|a la lista de tareas|en tareas|en la lista de la compra|a la lista de la compra)\b/ig,' ')
   .replace(/\b(?:tengo|tendré|tendre|hay|voy a tener|me han puesto|tengo programado|tengo programada|asisto a|asistiré a|asistire a|quiero ir a|quiero ir|quiero hacer|me gustaría|me gustaria|vamos a ir a|vamos a ir|voy a ir a|voy a ir|me apetece ir a|me apetece hacer|plan para|actividad de)\b/ig,' ')
   .replace(/\b(?:un|una|el|la|los|las|este|esta|mi|mis)\b/ig,' ')
   .replace(/\s+/g,' ').replace(/^\s*[:,-]+|\s*[:,-]+$/g,'').trim();
  if(kind==='Curso'){
   t=t.replace(/^curso\s*(?:de\s+)?/i,'').trim();
   return 'Curso'+(t?' de '+t:'');
  }
  if(kind==='Tema')return t||'Pendiente de estudio';
  return t||'Evento';
 }
 function assistantSay(msg,kind='ok'){
  let box=document.querySelector('#assistantResult');if(!box){box=document.createElement('div');box.id='assistantResult';box.className='assistant-response';document.querySelector('.assistant')?.after(box)}
  box.textContent=msg;box.dataset.kind=kind;
 }
 function duplicateTitle(a,b){return cleanText(a)===cleanText(b)}
 function addCourse(raw,date,time,location){
  const title=assistantTitle(raw,'Curso',location);const all=extraItems('Estudio');
  let item=all.find(x=>x.kind==='Curso'&&duplicateTitle(x.title,title)&&String(x.date||'')===String(date||''));
  if(item){item.time=time||item.time||'';item.location=location||item.location||'';item.place=item.location;item.mode=item.mode||'Presencial';item.duration=item.duration||'60';item.notes=item.notes||'Añadido con el asistente';}
  else {item={id:Date.now()+Math.floor(Math.random()*10000),title,kind:'Curso',status:'Curso',date:date||'',time:time||'',mode:/\b(online|zoom|teams|meet|videollamada|virtual)\b/i.test(raw)?'Online':'Presencial',location:location||'',place:location||'',duration:'60',endDate:'',notes:'Añadido con el asistente',created:today()};all.push(item)}
  if(!saveExtra('Estudio',all)){assistantSay('No he podido guardar el curso. Tus datos actuales no se han borrado.','error');return}
  if(item.date&&typeof upsertLinkedEvent==='function')upsertLinkedEvent('Estudio',item);
  assistantSay('He guardado «'+item.title+'» en Estudio'+(date?' para '+fmt(date):'')+(time?' a las '+time:'')+(location?' · '+location:'')+(date?' y lo he añadido a tu calendario.':'.'));
 }
 function addEvent(raw,date,time,location){
  const title=assistantTitle(raw,'Evento',location);const dupe=events.find(e=>duplicateTitle(e.title,title)&&e.date===(date||today())&&(e.time||'')===(time||''));
  if(dupe){if(location&&!dupe.location)dupe.location=location;save();assistantSay('Ese evento ya estaba en tu calendario; he comprobado sus datos y no he creado un duplicado.');return}
  const e={id:Date.now()+Math.floor(Math.random()*10000),title,date:date||today(),time:time||'',duration:'60',location:location||'',notes:'Añadido con el asistente',notify:false,departureMinutes:''};events.push(e);save();assistantSay('He añadido «'+title+'» al calendario'+(date?' para '+fmt(date):'')+(time?' a las '+time:'')+(location?' · '+location:'')+'.');
 }
 function addTask(raw,date,location){
  const title=assistantTitle(raw,'Tarea',location).replace(/^(?:tarea|pendiente)\s*(?:de\s+)?/i,'').trim()||'Tarea pendiente';
  const dupe=tasks.find(t=>!t.done&&duplicateTitle(t.title,title)&&String(t.date||'')===String(date||''));if(dupe){assistantSay('Esa tarea ya está en tu lista; no he creado un duplicado.');return}
  tasks.push({id:Date.now()+Math.floor(Math.random()*10000),title,date:date||'',repeat:'',category:/estudi|curso|repasar|leer/i.test(title)?'Estudio':'Personal',location:location||'',context:'',importance:2,notify:false,done:false,created:today(),completedAt:'',lastCompleted:''});save();assistantSay('He guardado la tarea «'+title+'»'+(date?' para '+fmt(date):'')+(location?' · '+location:'')+'.');
 }
 function addPlan(raw,date,time,location){
  const title=assistantTitle(raw,'Plan',location).replace(/^(?:plan|actividad)\s*(?:de\s+)?/i,'').trim()||'Nuevo plan';const all=extraItems('Planes');
  let p=all.find(x=>duplicateTitle(x.title,title)&&String(x.date||'')===String(date||''));if(p){p.time=time||p.time||'';p.location=location||p.location||'';p.status=date?'Próximo':(p.status||'Sin fecha')}else{p={id:Date.now()+Math.floor(Math.random()*10000),title,status:date?'Próximo':'Sin fecha',date:date||'',time:time||'',location:location||'',people:'',notes:'Añadido con el asistente',created:today()};all.push(p)}
  if(!saveExtra('Planes',all)){assistantSay('No he podido guardar el plan.','error');return}if(p.date&&typeof upsertLinkedEvent==='function')upsertLinkedEvent('Planes',p);assistantSay('He guardado el plan «'+title+'»'+(date?' para '+fmt(date):'')+(time?' a las '+time:'')+(location?' · '+location:'')+(date?' y lo he añadido a tu calendario.':'.'));
 }
 function handleSmart(raw){
  const q=String(raw||'').trim(),l=cleanText(q);if(!q)return;const date=assistantDate(q),time=assistantTime(q),location=assistantLocation(q);
  // Cursos y formación: crear el elemento de Estudio y su evento enlazado, sin duplicar.
  if(/\b(curso|formacion|taller|seminario|congreso|masterclass|clase presencial|webinar)\b/.test(l)&&(/\b(tengo|tendre|asisto|asistire|voy|hay|apunta|anota|añade|agrega|programa|guarda|curso|formacion|taller|seminario|congreso)\b/.test(l))){addCourse(q,date,time,location);return}
  // Añadir varios productos a la vez, incluso con frases naturales.
  if(/\b(compra|comprar|supermercado|lista de la compra|lista de compras|lista del super)\b/.test(l)&&(/\b(aniade|anade|agrega|mete|compra|necesito|falta|quedan|apunta|pon)\b/.test(l)||/^comprar\b/.test(l))){
   let body=q.replace(/^(?:oye\s+)?(?:por favor\s+)?(?:añade|anade|agrega|mete|apunta|pon|necesito|comprar)\s+/i,'').replace(/\b(?:a|en)\s+(?:la\s+)?(?:lista de la compra|lista de compras|lista del super|compra|supermercado)\b/ig,'').replace(/\b(?:me falta|nos falta|se ha acabado|se acabó|se acabo)\b/ig,' ').trim();
   const names=body.split(/,|\s+y\s+/i).map(x=>x.trim()).filter(Boolean).map(x=>x.replace(/[.!?]+$/,''));if(names.length){const norm=x=>cleanText(x),seen=new Set(products.map(p=>norm(p.title))),added=[];names.forEach((name,i)=>{if(name&&!seen.has(norm(name))&&name.length<100){products.push({id:Date.now()+i,title:name,store:'Lidl',lists:['General','Lidl'],category:classifyProductCategory(name),bought:false,created:today(),source:'assistant'});seen.add(norm(name));added.push(name)}});if(added.length){save();assistantSay('Añadido a la compra: '+added.join(', ')+'.');return}}
  }
  if(/\b(he regado|acabo de regar|ya regue|he echado agua a)\b/.test(l)){const name=q.replace(/.*?\b(?:he regado|acabo de regar|ya regue|he echado agua a)\s+/i,'').trim(),all=extraItems('Plantas'),p=all.find(x=>cleanText(x.title).includes(cleanText(name))||cleanText(name).includes(cleanText(x.title)));if(p){p.lastWatered=today();p.date=p.frequency?nextPlantDate(p):'';p.status='Bien';saveExtra('Plantas',all);assistantSay('He registrado el riego de '+p.title+'.');return}assistantSay('¿De qué planta hablamos? No he cambiado nada.','question');return}
  if(/\b(recu[eé]rdame|no olvides|acu[eé]rdate de)\b/i.test(q)||/\b(tengo que|debo|me falta por|pendiente de|no se me puede olvidar)\b/.test(l)||/\b(tarea|pendiente)\b/.test(l)){
   const body=q.replace(/^(?:oye\s+)?(?:por favor\s+)?(?:recu[eé]rdame|no olvides|acu[eé]rdate de|crea una tarea|añade una tarea|anota una tarea|tarea para|tarea)\s*/i,'').replace(/\b(?:mañana|pasado mañana|hoy|el próximo\s+|el que viene\s+)?(?:lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/ig,' ').replace(/\b(?:mañana|pasado mañana|hoy)\b/ig,' ').replace(/\b(?:tengo que|debo|me falta por|pendiente de|no se me puede olvidar)\b/ig,' ').trim();
   if(body){addTask(body,date,location);return}
  }
  if(/\b(plan|excursion|excursiones|actividad|me gustaria ir|quiero hacer|quiero ir|vamos a ir|voy a ir|me apetece ir)\b/.test(l)&&(/\b(plan|excursion|actividad|me gustaria|quiero hacer|quiero ir|vamos a ir|voy a ir|me apetece|apunta|guarda|añade|anade)\b/.test(l))){addPlan(q,date,time,location);return}
  if(/\b(cita|reunion|reunión|evento|dentista|medico|médico|consulta|entrevista|vuelo|tren|reserva|quedada)\b/.test(l)&&(/\b(tengo|tendre|me han puesto|apunta|anota|añade|anade|crea|guarda|programa|el|mañana|hoy|pasado mañana)\b/.test(l))){addEvent(q,date,time,location);return}
  // Marking something done is consequential enough to confirm before changing history.
  const doneMatch=q.match(/^(?:ya\s+)?(?:he\s+(?:hecho|terminado|completado|acabado)|acabo de terminar|ya termine|ya terminé)\s+(.+)$/i);
  if(doneMatch){const what=cleanText(doneMatch[1]),task=tasks.find(t=>!t.done&&(cleanText(t.title).includes(what)||what.includes(cleanText(t.title))));if(task){if(confirm('¿Marco como completada la tarea «'+task.title+'»?')){toggleTask(task.id);assistantSay('He marcado como completada «'+task.title+'».')}else assistantSay('De acuerdo, no he cambiado la tarea.');return}}
  // Keep all legacy commands working if the new intent parser did not handle the phrase.
  if(typeof previousAssistant==='function'){previousAssistant(q);const box=document.querySelector('#assistantResult');if(box&&/No he entendido del todo/.test(box.textContent)){box.textContent='No quiero guardar algo en el apartado equivocado. ¿Quieres que lo añada a tu agenda, a Estudio, a Tareas, a Planes o a otro módulo? Puedes darme fecha, hora y ubicación en la misma frase.'}return}
  assistantSay('Puedo ayudarte con compras, tareas, cursos, calendario, planes, plantas y consultas de agenda. Si falta un dato importante, te lo preguntaré antes de cambiar nada.','question');
 }
 window.handleAssistantCommand=handleSmart;
})();



/* --- oihane-527-header-icons --- */




/* --- oihane-528-assistant --- */

(function(){
 'use strict';
 const PREF_KEY='oihane_assistant_preferences_v1';
 let prefs={speak:true};
 try{const saved=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');if(saved&&typeof saved==='object')prefs={...prefs,...saved}}catch(e){}
 let recognition=null,voiceActive=false,voiceFinal='',voiceInterim='',voiceShouldRun=false;
 let lastTaskId=null,lastActionType='';
 const $=s=>document.querySelector(s);
 function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify(prefs))}catch(e){}}
 function responseBox(){let b=$('#assistantResult');if(!b){b=document.createElement('div');b.id='assistantResult';b.className='assistant-response';$('.assistant')?.after(b)}return b}
 function statusBox(){let b=$('#assistantVoiceStatus');if(!b){b=document.createElement('div');b.id='assistantVoiceStatus';b.className='assistant-voice-state';$('.assistant')?.insertAdjacentElement('afterend',b)}return b}
 function setVoiceUi(active,message){const b=$('.assistant .voice-toggle');if(b){b.classList.toggle('voice-active',!!active);b.setAttribute('aria-pressed',String(!!active));b.textContent=active?'■':'🎙️';b.setAttribute('aria-label',active?'Terminar de hablar':'Hablar con Oihane');b.title=active?'Pulsa para terminar':'Pulsa para hablar'}if(message)statusBox().textContent=message;else if(!active&&$('#assistantVoiceStatus'))$('#assistantVoiceStatus').textContent=''}
 function speak(text){return window.oihaneSpeakReply?.(text)}
 // El sistema de voz único se instala al final de este documento.
 function updateSpeakButton(){const b=$('.assistant .voice-speak-toggle');if(!b)return;b.setAttribute('aria-pressed',String(!!prefs.speak));b.textContent=prefs.speak?'🔊':'🔈';b.title=prefs.speak?'Desactivar respuestas habladas':'Activar respuestas habladas';b.setAttribute('aria-label',b.title)}
 function addVoiceControls(){const form=$('#assistant');if(!form)return;const mic=form.querySelector('button[aria-label="Dictar por voz"]');if(mic&&!mic.classList.contains('voice-toggle')){mic.classList.add('voice-toggle');mic.setAttribute('aria-pressed','false');mic.title='Pulsa y habla; se enviará tras la pausa'}if(!form.querySelector('.voice-speak-toggle')){const b=document.createElement('button');b.type='button';b.className='voice-speak-toggle';b.textContent='🔊';b.setAttribute('aria-label','Desactivar respuestas habladas');b.title='Activar o desactivar respuestas habladas';b.onclick=()=>{prefs.speak=!prefs.speak;savePrefs();updateSpeakButton();if(!prefs.speak&&'speechSynthesis'in window)window.speechSynthesis.cancel();else if(prefs.speak)speak('Respuestas habladas activadas')};const send=form.querySelector('button[type="submit"]')||form.querySelector('button:not([type])');if(send)form.insertBefore(b,send);else form.appendChild(b)}updateSpeakButton()}
 function stopVoice(submit){if(!recognition){voiceActive=false;setVoiceUi(false);return}voiceShouldRun=!!submit;voiceActive=false;setVoiceUi(false,'');try{recognition.stop()}catch(e){finishVoice()}}
 function finishVoice(){const text=(voiceFinal+' '+voiceInterim).trim();recognition=null;voiceActive=false;voiceShouldRun=false;setVoiceUi(false);if(!text){setVoiceUi(false,'No he recibido ninguna frase. Puedes intentarlo otra vez o usar el dictado del teclado.');return}const input=$('#ask');if(input)input.value=text;if(voiceShouldSubmit){/* compatibility placeholder */}runVoiceCommand(text)}
 function runVoiceCommand(text){const input=$('#ask');if(input)input.value='';try{if(typeof window.handleAssistantCommand==='function')window.handleAssistantCommand(text);else $('#assistant')?.requestSubmit()}catch(e){responseBox().textContent='No he podido procesar la orden. No he confirmado ningún cambio.'} }
 // Track the explicit second tap. Recognition implementations may call onend after stop.
 let voiceShouldSubmit=false;
 window.startVoiceInput=function(){
  if(voiceActive){voiceShouldSubmit=true;stopVoice(true);return}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){const input=$('#ask');setVoiceUi(false,'El reconocimiento de voz continuo no está disponible en este navegador. Puedes tocar el micrófono del teclado de iOS y después enviar el texto.');input?.focus();return}
  try{recognition=new SR();recognition.lang='es-ES';recognition.interimResults=true;recognition.continuous=false;voiceFinal='';voiceInterim='';voiceShouldSubmit=false;voiceShouldRun=false;voiceActive=true;setVoiceUi(true,'Te escucho…');
   recognition.onresult=function(e){let finalChunk='';let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const res=e.results[i];if(res.isFinal)finalChunk+=res[0].transcript+' ';else interim+=res[0].transcript+' '}if(finalChunk)voiceFinal+=finalChunk;voiceInterim=interim;const input=$('#ask');if(input)input.value=(voiceFinal+' '+voiceInterim).trim();setVoiceUi(true,'Te escucho…');if(finalChunk){voiceShouldRun=true;try{recognition.stop()}catch(_){}}};
   recognition.onerror=function(e){const msg=e&&e.error==='not-allowed'?'No tengo permiso para usar el micrófono. Actívalo en los ajustes del navegador.':e&&e.error==='network'?'El reconocimiento de voz necesita conexión en esta configuración. Puedes escribir la orden y usar el motor local sin conexión.':'No se ha podido completar el dictado. Puedes usar el micrófono del teclado de iOS.';voiceActive=false;voiceShouldSubmit=false;setVoiceUi(false,msg);if(recognition){try{recognition.abort()}catch(x){}recognition=null}};
   recognition.onend=function(){const should=true;const text=(voiceFinal+' '+voiceInterim).trim();recognition=null;voiceActive=false;voiceShouldSubmit=false;voiceShouldRun=false;setVoiceUi(false);if(should&&text){const input=$('#ask');if(input)input.value=text;runVoiceCommand(text)}else if(text){const input=$('#ask');if(input)input.value=text;setVoiceUi(false,'Dictado recibido. Puedes enviarlo con Enter.')}};
   recognition.start();
  }catch(e){recognition=null;voiceActive=false;setVoiceUi(false,'No se ha podido iniciar el micrófono. Usa el dictado del teclado de iOS o escribe la orden.');$('#ask')?.focus()}
 };
 // Small local conversational context: follow-ups can update the task just created, without sending data anywhere.
 function parseFollowupDate(s){const t=String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();if(/\bpasado manana\b/.test(t))return parseRelativeDate('pasado mañana');if(/\bmanana\b/.test(t))return parseRelativeDate('mañana');if(/\bhoy\b/.test(t))return parseRelativeDate('hoy');const names=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];const m=t.match(/\b(?:el\s+)?(proximo\s+|que viene\s+)?(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\b/);if(m){const now=new Date();now.setHours(12,0,0,0);let delta=(names.indexOf(m[2])-now.getDay()+7)%7;if(delta===0)delta=7;if(m[1])delta+=7;now.setDate(now.getDate()+delta);return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-')}return ''}
 function handleFollowup(raw){const l=String(raw||'').toLowerCase();if(lastActionType!=='task'||!lastTaskId)return false;const task=(typeof tasks!=='undefined'&&Array.isArray(tasks)?tasks:[]).find(t=>String(t.id)===String(lastTaskId));if(!task)return false;
  const date=parseFollowupDate(l);if(date&&/\b(ponla|ponlo|cambiala|cambialo|muevela|muevelo|pasala|pasalo|mejor|cambia|para el|para manana|para hoy|para el lunes|para el martes|para el miercoles|para el jueves|para el viernes|para el sabado|para el domingo)\b/.test(l)){const oldDate=task.date;task.date=date;if(typeof save==='function'&&save()===false){task.date=oldDate;responseBox().textContent='No he podido guardar el cambio de fecha. La tarea conserva su fecha anterior.';return true}if(typeof window.renderTasks==='function'&&typeof screen!=='undefined'&&screen==='Tareas')window.renderTasks();responseBox().textContent='He cambiado la fecha de «'+task.title+'» a '+(typeof window.fmt==='function'?window.fmt(date):date)+'.';return true}
  if(/\b(prioridad alta|muy importante|alta prioridad)\b/.test(l)){const old=task.importance;task.importance=3;if(typeof save==='function'&&save()===false){task.importance=old;responseBox().textContent='No he podido guardar el cambio de prioridad.';return true}responseBox().textContent='He marcado «'+task.title+'» como prioridad alta.';return true}
  if(/\b(prioridad baja|poco importante|baja prioridad)\b/.test(l)){const old=task.importance;task.importance=1;if(typeof save==='function'&&save()===false){task.importance=old;responseBox().textContent='No he podido guardar el cambio de prioridad.';return true}responseBox().textContent='He marcado «'+task.title+'» como prioridad baja.';return true}
  return false;
 }
 const previous=window.handleAssistantCommand;
 if(typeof previous==='function')window.handleAssistantCommand=function(raw){
   const q=String(raw||'').trim();if(!q)return;
   if(handleFollowup(q)){const b=$('#assistantResult');if(b)speak(b.textContent);return}
   const before=new Set((typeof tasks!=='undefined'&&Array.isArray(tasks)?tasks:[]).map(t=>String(t.id)));const oldText=$('#assistantResult')?.textContent||'';
   previous(q);
   const after=Array.isArray(window.tasks)?window.tasks:[];const created=after.filter(t=>!before.has(String(t.id))).sort((a,b)=>Number(b.id)-Number(a.id));
   if(created.length){lastTaskId=created[0].id;lastActionType='task'}else if(/\b(compra|comprar|leche|pan|huevos)\b/i.test(q)){lastActionType='shopping'}else if(/\b(cita|evento|calendario|reunion)\b/i.test(q)){lastActionType='event'}
   setTimeout(()=>{const b=$('#assistantResult');if(b&&b.textContent&&b.textContent!==oldText)speak(b.textContent)},80);
 };
 // Re-add controls after home() redraws the DOM.
 const oldHome=window.home;
 if(typeof oldHome==='function')window.home=function(){const result=oldHome.apply(this,arguments);setTimeout(addVoiceControls,0);return result};
 document.addEventListener('DOMContentLoaded',addVoiceControls);addVoiceControls();
 window.showAssistantHelp=function(){alert('ASISTENTE LOCAL DE OIHANE\n\n• Añade leche, pan y huevos a la compra.\n• Recuérdame llamar al dentista mañana.\n• Añade una tarea: preparar la sesión.\n• Después: «ponla para el viernes» o «prioridad alta».\n• He regado la monstera.\n• Añade una cita mañana a las 18.\n• ¿Qué tengo hoy o mañana?\n• Abre recetas, viajes, plantas o calendario.\n\nLa interpretación es local. El reconocimiento de voz puede necesitar internet y depende de Safari/iOS. Las respuestas habladas usan la voz disponible en el dispositivo.');};
})();