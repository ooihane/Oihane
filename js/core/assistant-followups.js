/* Oihane 5.59.14 | Seguimiento de órdenes dentro de la sesión, sin escrituras ambiguas. */
(function(){
 'use strict';
 const KEY='oihane_assistant_pending_v1';
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[¿?¡!.,]/g,' ').replace(/\s+/g,' ').trim();
 const now=()=>Date.now();
 const load=()=>{try{const p=JSON.parse(sessionStorage.getItem(KEY)||'null');return p&&p.until>now()?p:null}catch{return null}};
 const clear=()=>{try{sessionStorage.removeItem(KEY)}catch(_){}};
 const pending=p=>{try{sessionStorage.setItem(KEY,JSON.stringify({...p,until:now()+10*60*1000}))}catch(_){}};
 function tell(msg){
  let node=document.getElementById('assistantResult');const form=document.getElementById('assistant');
  if(!node&&form){node=document.createElement('div');node.id='assistantResult';node.className='assistant-response';form.insertAdjacentElement('afterend',node)}
  if(node)node.textContent=msg;
  try{window.oihaneSpeakReply?.(msg)}catch(_){}
 }
 function storeExtra(module,entry){
  const list=extraItems(module);
  if(list.some(x=>String(x.id)===String(entry.id)))return false;
  list.push(entry);
  return saveExtra(module,list)!==false;
 }
 const iso=()=>typeof today==='function'?today():new Date().toISOString().slice(0,10);
 function createFor(target,title){
  const item={id:Date.now(),title,status:'Sin fecha',date:'',notes:'',created:iso(),sharedWithPartner:true};
  if(target==='wishlist'){
   return storeExtra('Wishlist',{...item,status:'Lo quiero ya',sharedWithPartner:true})?'Añadido a Wishlist: '+title+'.':'No se pudo guardar en Wishlist.';
  }
  if(target==='planes')return storeExtra('Planes',item)?'He añadido «'+title+'» a Planes, sin fecha.':'No se pudo guardar el plan.';
  if(target==='tareas'){
   if(typeof tasks==='undefined'||typeof save!=='function')return 'La lista de tareas no está disponible.';
   const task={id:item.id,title,created:iso(),date:'',repeat:'',done:false,importance:2,notify:false,shared:true,sharedWithPartner:true};
   tasks.push(task);
   if(save()===false){tasks=tasks.filter(t=>t.id!==task.id);return 'No se pudo guardar la tarea.'}
   return 'He creado la tarea «'+title+'».';
  }
  return '';
 }
 const previous=window.handleAssistantCommand;
 window.handleAssistantCommand=function(raw){
  const text=String(raw||'').trim(),l=norm(text);
  if(!text)return;
  const p=load();
  if(p){
   if(/^(cancelar|cancela|ninguno|no|olvidalo|olvidalo por favor)$/.test(l)){
    clear();tell('De acuerdo. No he añadido nada.');return;
   }
   const target=/^(?:en |a |para |en la |a la )?(?:mis )?tareas?(?: por favor)?$/.test(l)?'tareas':
    /^(?:en |a |para |en la |a la )?(?:mis )?planes?(?: por favor)?$/.test(l)?'planes':
    /^(?:en |a |para |en la |a la )?(?:mi )?(?:wishlist|wish list|lista de deseos)(?: por favor)?$/.test(l)?'wishlist':null;
   if(target){clear();tell(createFor(target,p.title));return;}
   // Si hay una orden nueva completa, abandonar la aclaración anterior.
   if(/^(anade|anota|apunta|pon|crea|agrega|quiero)/.test(l))clear();
   else{tell('¿Quieres añadir «'+p.title+'» a Tareas, Planes o Wishlist? Puedes responder solo con el nombre.');return;}
  }
  // Añadir expresamente a Wishlist no necesita pasar por Gemini o permisos inexistentes.
  if(/^(anade|anota|apunta|pon|agrega|guarda)\b/.test(l)&&/\b(wishlist|wish list|lista de deseos)\b/.test(l)){
   const title=text.replace(/^(?:añade|anade|anota|apunta|pon|agrega|guarda)\s+/i,'')
    .replace(/\s+(?:a|en|para)\s+(?:mi|la|el)?\s*(?:wishlist|wish list|lista de deseos).*$/i,'')
    .replace(/^(?:el|la|un|una)\s+/i,'').trim();
   if(title.length<2||title.length>180){tell('Dime el nombre del artículo para Wishlist.');return;}
   tell(createFor('wishlist',title));return;
  }
  // Orden incompleta: esperar una segunda respuesta, sin crear una tarea equivocada.
  if(/^(anade|anota|apunta|pon|crea|agrega)\b/.test(l)&&!/\b(tareas?|planes?|compras?|calendario|wishlist|wish list|lista de deseos|mercadona|eroski|lidl)\b/.test(l)){
   const title=text.replace(/^(?:añade|anade|anota|apunta|pon|crea|agrega)\s+/i,'').trim();
   if(title.length>=3&&title.length<=180){pending({title});tell('¿Quieres añadir «'+title+'» a Tareas, Planes o Wishlist?');return;}
  }
  if(typeof previous==='function')return previous.apply(this,arguments);
  tell('No he entendido la orden. Prueba a indicar el módulo y el elemento.');
 };
})();
