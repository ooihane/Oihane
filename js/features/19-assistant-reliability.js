/* Oihane 5.59.5 - Auditoría asistente (capa de compatibilidad).
 * Mantiene intactas las capas anteriores y protege controles al reconstruir Home.
 * No solicita audio ni altera datos hasta la acción explícita del usuario.
 */
(function(){
 'use strict';
 const prefKey='oihane_assistant_preferences_v1';
 const $=s=>document.querySelector(s);
 const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const textResult=(message)=>{
   const form=$('#assistant');if(!form)return;
   let node=$('#assistantResult');if(!node){node=document.createElement('div');node.id='assistantResult';node.className='assistant-response';form.insertAdjacentElement('afterend',node)}
   node.textContent=message;
   window.oihaneSpeakReply?.(message);
 };
 let speakEnabled=true;
 function readPrefs(){try{return JSON.parse(localStorage.getItem(prefKey)||'{}')}catch(_){return {}}}
 function updateSpeaker(button){speakEnabled=readPrefs().speak!==false;button.textContent=speakEnabled?'🔊':'🔈';button.setAttribute('aria-pressed',String(speakEnabled));button.setAttribute('aria-label',speakEnabled?'Desactivar respuestas habladas':'Activar respuestas habladas');button.title=button.getAttribute('aria-label')}
 function toggleSpeaker(){
   const next=! (readPrefs().speak!==false);
   let prefs=readPrefs();prefs.speak=next;
   try{localStorage.setItem(prefKey,JSON.stringify(prefs))}catch(_){}
   const b=$('#assistant .voice-speak-toggle');if(b)updateSpeaker(b);
   if(!next){try{window.speechSynthesis?.cancel()}catch(_){}}
   else window.oihaneSpeakReply?.('Respuestas habladas activadas');
 }
 function startManualSpeech(){
   // The old Home inline onclick calls foundation.startVoiceInput instead of
   // the 5.28 override on some iOS/PWA versions. Always invoke the window handler.
   try{window.startVoiceInput?.()}catch(error){console.warn('Oihane dictado',error);textResult('No se ha podido iniciar el dictado. Prueba a activar el micrófono desde el aviso de Oihane.');}
 }
 function ensureControls(){
   const form=$('#assistant');if(!form)return;
   const mic=form.querySelector('.voice-toggle,button[aria-label="Dictar por voz"]');
   if(mic&&!mic.dataset.oihaneManualBound){
     mic.dataset.oihaneManualBound='1';mic.classList.add('voice-toggle');
     mic.removeAttribute('onclick');mic.onclick=null;
     mic.setAttribute('aria-label','Dictar por voz');
     mic.addEventListener('click',startManualSpeech);
   }
   let sp=form.querySelector('.voice-speak-toggle');
   if(!sp){sp=document.createElement('button');sp.type='button';sp.className='voice-speak-toggle';
     const send=form.querySelector('button[aria-label="Enviar"],button[type="submit"]');
     if(send)form.insertBefore(sp,send);else form.appendChild(sp);}
   if(!sp.dataset.oihaneSpeakerBound){sp.dataset.oihaneSpeakerBound='1';sp.onclick=toggleSpeaker;}
   updateSpeaker(sp);
   window.oihaneEnsureWakeControl?.();
 }
 let queued=false;
 function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;ensureControls()})}
 const root=$('#app');
 if(root&&typeof MutationObserver==='function')new MutationObserver(mutations=>{
   if(mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.id==='assistant'||n.querySelector?.('#assistant')))))schedule();
 }).observe(root,{childList:true,subtree:true});
 document.addEventListener('DOMContentLoaded',schedule,{once:true});
 schedule();

 // Gentle, user-initiated permission request on each new app launch.
 // Native iOS permission dialog may not repeat once previously granted.
 let shown=false;
 function permissionPrompt(){
   if(shown||!$('#assistant')||!('SpeechRecognition'in window||'webkitSpeechRecognition'in window))return;
   shown=true;
   const wrap=document.createElement('div');wrap.id='oihaneMicPermission';wrap.className='oihane-mic-permission';
   const caption=document.createElement('span');caption.textContent='¿Quieres activar el micrófono para hablar con Oihane?';wrap.appendChild(caption);
   const yes=document.createElement('button');yes.type='button';yes.textContent='Activar';
   const no=document.createElement('button');no.type='button';no.textContent='Ahora no';
   no.onclick=()=>wrap.remove();
   yes.onclick=async()=>{
     yes.disabled=true;
     try{
       const media=navigator.mediaDevices;
       if(!media?.getUserMedia){wrap.remove();textResult('Puedes activar el micrófono pulsando 🎙️ o 👂. iOS gestiona los permisos desde el navegador.');return}
       const stream=await media.getUserMedia({audio:true});
       stream.getTracks().forEach(t=>t.stop());
       wrap.remove();
     }catch(e){yes.disabled=false;
       caption.textContent='No se pudo habilitar el micrófono ('+String(e?.name||'desconocido')+'). Revisa los permisos de Safari para esta web.';
     }
   };
   wrap.append(yes,no);$('#assistant')?.insertAdjacentElement('afterend',wrap);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(permissionPrompt,250),{once:true});
 else setTimeout(permissionPrompt,250);

 // Deterministic local creation, before Gemini. Date/priority optional.
 // Never infer a store if user specifies an unknown one; avoid ambiguous operations.
 const oldAssistant=window.handleAssistantCommand;
 const normalizedTitle=s=>clean(s).replace(/\s+/g,' ');
 function basicAction(raw){
   let q=String(raw||'').trim().replace(/[.!?]+$/,'');
   q=q.replace(/^(?:(?:oye[ ,]+oihane|oihane|por favor)[,: ]+)*/i,'').trim();
   if(!q||q.length>250||/\b(?:y luego|despues|después|ademas|además|borra|elimina|suprime)\b/i.test(q))return null;
   let m;
   // Examples: añade leche a la lista de la compra; pon pan en Mercadona.
   m=q.match(/^(?:añade|anade|agrega|apunta|mete|pon|guarda|comprar|compra)\s+(.+?)\s+(?:a|en)\s+(?:(?:la|mi)\s+)?(?:lista\s+de\s+)?(?:la\s+)?compra(?:\s+(?:de|en)\s+([\p{L}0-9 _-]+))?$/iu);
   let shop=null,items=null;
   if(m){shop=m[2]||'General';items=m[1]}
   else {
     m=q.match(/^(?:añade|anade|agrega|apunta|mete|pon|guarda)\s+(.+?)\s+(?:a|en)\s+(Mercadona|Lidl|Eroski|D[ií]a|General)$/i);
     if(m){shop=m[2];items=m[1]}
   }
   if(items){
     const all=Array.isArray(window.oihaneShopStores)?window.oihaneShopStores:['Lidl','Mercadona','Eroski','Dia'];
     const valid=['General',...all];
     let store=valid.find(s=>normalizedTitle(s)===normalizedTitle(shop));
     if(!store&&normalizedTitle(shop)==='dia')store=valid.find(s=>normalizedTitle(s)==='dia');
     if(!store)return {invalid:'No reconozco la lista de la compra indicada. No he añadido nada.'};
     const titles=items.split(/\s*,\s*|\s+y\s+/i).map(x=>x.replace(/^(un|una|unos|unas)\s+/i,'').trim());
     if(!titles.length||titles.length>6||titles.some(t=>t.length<2||t.length>100||/[;:]/.test(t)))return {invalid:'Indica entre uno y seis productos para añadir a la compra.'};
     return titles.map(title=>({op:'create',module:'Compras',title,fields:{store}}));
   }
   // Examples: crea una tarea llamar al dentista, apunta tarea de limpiar cocina.
   m=q.match(/^(?:añade|anade|crea|agrega|apunta|anota|pon|guarda)\s+(?:una?\s+)?(?:tarea|pendiente)\s*(?::|de|para)?\s+(.+)$/i);
   if(!m)m=q.match(/^(?:apunta|añade|anade|agrega)\s+(.+?)\s+(?:a|en)\s+(?:la\s+lista\s+de\s+)?(?:mis\s+)?tareas$/i);
   if(m){const title=m[1].trim();
     if(!title||title.length>140||/[;:]/.test(title)||/\b(?:mañana|hoy|prioridad|lunes|martes|miercoles|miércoles|jueves|viernes|sábado|sabado|domingo|a las|aviso|recordatorio)\b/i.test(title))return null;
     return [{op:'create',module:'Tareas',title,fields:{date:'',time:'',notify:false}}];
   }
   return null;
 }
 window.oihaneAuditAssistant={version:'5.59.5',parseLocal:basicAction,ensureControls};
 if(typeof oldAssistant==='function')window.handleAssistantCommand=function(raw){
   const actions=basicAction(raw);
   if(actions){
     if(actions.invalid){textResult(actions.invalid);return}
     const engine=window.oihaneActionEngine;
     if(!engine?.execute){textResult('El motor local no está disponible. No he guardado nada.');return}
     const result=engine.execute(actions);
     window.oihaneLastAssistantTiming={route:'local'};
     textResult(result.ok?result.msg:'No he podido guardar la orden: '+result.msg);
     return result;
   }
   return oldAssistant.call(this,raw);
 };
})();
