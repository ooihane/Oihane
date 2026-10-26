/* Oihane 5.59.15 — copias locales independientes de Supabase.
 * iOS no ejecuta JavaScript con la PWA cerrada: los registros se guardan
 * tras sincronizar al abrir o mientras esta en primer plano.
 * No se envian fotografias ni datos a terceros.
 */
(function(){
 'use strict';
 const DB='oihane-offline-archives-v1',STORE='snapshots';
 let running=null;
 const esc=s=>String(s??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
 const $=s=>document.querySelector(s);
 function madridParts(when=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(when);
  const get=k=>parts.find(p=>p.type===k)?.value||'';
  return {day:get('year')+'-'+get('month')+'-'+get('day'),hour:Number(get('hour'))};
 }
 const dayOffset=(day,delta)=>{
  const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+delta);return d.toISOString().slice(0,10);
 };
 const slotOf=now=>{const p=madridParts(now);return p.day+'@'+(p.hour<12?'00':'12')};
 function wanted(today){
  return [
   {label:'Hace 7 días · 12:00',slot:dayOffset(today,-7)+'@12'},
   {label:'Hace 3 días · 12:00',slot:dayOffset(today,-3)+'@12'},
   {label:'Hace 2 días · 12:00',slot:dayOffset(today,-2)+'@12'},
   {label:'Ayer · 12:00',slot:dayOffset(today,-1)+'@12'},
   {label:'Ayer · 00:00',slot:dayOffset(today,-1)+'@00'},
   {label:'Hoy · 12:00',slot:today+'@12'}
  ];
 }
 function openDB(){
  return new Promise((resolve,reject)=>{
   if(!('indexedDB'in window)){reject(Error('Tu navegador no admite IndexedDB'));return}
   const r=indexedDB.open(DB,1);
   r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'key'})};
   r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error('No se puede abrir el archivo local'));
  });
 }
 function tx(db,mode,action){
  return new Promise((resolve,reject)=>{
   const t=db.transaction(STORE,mode),s=t.objectStore(STORE);
   let result;
   try{result=action(s)}catch(e){reject(e);return}
   t.oncomplete=()=>resolve(result?.result);
   t.onerror=()=>reject(t.error||Error('No se pudo guardar la copia'));
   t.onabort=()=>reject(t.error||Error('La copia fue cancelada'));
  });
 }
 function findAll(db,uid){
  return new Promise((resolve,reject)=>{
   const t=db.transaction(STORE,'readonly'),r=t.objectStore(STORE).getAll();
   r.onsuccess=()=>resolve((r.result||[]).filter(v=>v.uid===uid));r.onerror=()=>reject(r.error);
  });
 }
 async function prune(db,uid,today){
  const keepDays=new Set(Array.from({length:9},(_,i)=>dayOffset(today,-i)));
  const rows=await findAll(db,uid);
  const candidates=rows.filter(row=>{
   const day=row.slot.split('@')[0],half=row.slot.split('@')[1];
   return !keepDays.has(day)||(half==='00'&&day<dayOffset(today,-2));
  });
  if(!candidates.length)return;
  await new Promise((resolve,reject)=>{
   const t=db.transaction(STORE,'readwrite'),s=t.objectStore(STORE);
   for(const row of candidates)s.delete(row.key);
   t.oncomplete=resolve;t.onerror=()=>reject(t.error);
  });
 }
 async function sha256(blob){
  if(!crypto?.subtle?.digest)return null;
  const buffer=await blob.arrayBuffer();
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),b=>b.toString(16).padStart(2,'0')).join('');
 }
 async function archiveWhenAvailable(){
  if(running)return running;
  running=(async()=>{
   const uid=localStorage.getItem('oihane_sync_user');
   if(!uid||document.visibilityState==='hidden'||!navigator.onLine)return false;
   const now=new Date(),slot=slotOf(now),key=uid+'|'+slot,db=await openDB();
   try{
    const exists=await new Promise((resolve,reject)=>{
     const t=db.transaction(STORE,'readonly'),r=t.objectStore(STORE).get(key);
     r.onsuccess=()=>resolve(!!r.result);r.onerror=()=>reject(r.error);
    });
    if(exists){await prune(db,uid,madridParts(now).day);return true}
    if(typeof collectBackupData!=='function'||!window.oihanePlantPhotos?.expandData)return false;
    const copy=collectBackupData();
    if(!copy?.data||typeof copy.data!=='object')return false;
    copy.data=await window.oihanePlantPhotos.expandData(copy.data);
    const meaningful=Object.values(copy.data).some(v=>Array.isArray(v)&&v.length);
    if(!meaningful)return false;
    const blob=new Blob([JSON.stringify(copy)],{type:'application/json'});
    const digest=await sha256(blob);
    await new Promise((resolve,reject)=>{
     const t=db.transaction(STORE,'readwrite');
     t.objectStore(STORE).put({key,uid,slot,capturedAt:now.toISOString(),blob,bytes:blob.size,digest});
     t.oncomplete=resolve;t.onerror=()=>reject(t.error);
    });
    await prune(db,uid,madridParts(now).day);
    return true;
   }finally{db.close()}
  })().catch(error=>{
    console.warn('Copia independiente en este dispositivo pendiente:',error);
    const el=$('#oihane-device-archive-alert');
    if(el)el.textContent='No se pudo guardar copia en el iPhone: '+String(error?.message||error);
    return false;
  }).finally(()=>{running=null});
  return running;
 }
 async function download(row){
  if(!row?.blob)throw Error('No se ha podido leer el archivo guardado');
  if(row.digest&&await sha256(row.blob)!==row.digest)throw Error('La copia esta dañada. Conserva las restantes.');
  const date=row.slot.replace('@','-'),filename='oihane-'+date+'-copia-iPhone.json';
  const file=new File([row.blob],filename,{type:'application/json'});
  if(navigator.canShare?.({files:[file]})){
   try{await navigator.share({files:[file],title:'Guardar copia de Oihane en Archivos o iCloud Drive'});return}
   catch(e){if(e?.name==='AbortError')return}
  }
  const url=URL.createObjectURL(row.blob);
  const a=document.createElement('a');a.download=filename;a.href=url;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),12000);
 }
 async function openArchiveUI(){
  $('#oihane-device-archive-mask')?.remove();
  const mask=document.createElement('div');mask.id='oihane-device-archive-mask';
  mask.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#1b2624cc;display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box';
  mask.innerHTML='<section role="dialog" aria-modal="true" style="width:min(540px,100%);max-height:90dvh;overflow:auto;background:#fff;color:#253a30;border-radius:18px;padding:20px;font:14px/1.5 system-ui,-apple-system"><h2 style="margin:0 0 8px;font-size:19px">Copias fuera de Supabase · Este iPhone</h2><p>Son copias independientes guardadas en este dispositivo. Para una protección también fuera del teléfono, pulsa «Guardar en Archivos» y elige iCloud Drive u otra carpeta segura.</p><p id="oihane-device-archive-alert" role="status"></p><div id="oihane-device-archive-list"></div><button type="button" id="oihane-device-archive-close" style="padding:10px;border-radius:10px;margin-top:12px">Cerrar</button></section>';
  document.body.append(mask);
  $('#oihane-device-archive-close').onclick=()=>mask.remove();
  const list=$('#oihane-device-archive-list'),status=$('#oihane-device-archive-alert');
  try{
   const uid=localStorage.getItem('oihane_sync_user')||'';
   if(!uid){status.textContent='Inicia sesion para identificar tu archivo privado.';return}
   const db=await openDB(),rows=await findAll(db,uid);db.close();
   const map=new Map(rows.map(v=>[v.slot,v]));
   const today=madridParts().day;
   const entries=wanted(today);
   const future=entries.filter(e=>!map.has(e.slot));
   for(const entry of entries){
    const row=map.get(entry.slot);
    const line=document.createElement('div');line.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #ddd';
    const info=document.createElement('div');const title=document.createElement('strong');title.textContent=entry.label;info.append(title);
    const detail=document.createElement('small');detail.style.display='block';detail.textContent=row?
      'Guardada '+new Date(row.capturedAt).toLocaleString('es-ES')+' · '+(row.bytes/1024/1024).toFixed(1)+' MB':
      'No hay copia local para esta fecha';
    info.append(detail);line.append(info);
    if(row){
     const btn=document.createElement('button');btn.textContent='Guardar en Archivos';btn.style.cssText='border:1px solid #aeb8ae;border-radius:10px;padding:8px;flex:none;font-size:12px;background:white';
     btn.onclick=async()=>{btn.disabled=true;try{await download(row);status.textContent='Elige una carpeta externa al navegador para conservar esta copia.'}catch(e){status.textContent='Error: '+String(e?.message||e)}finally{btn.disabled=false}};
     line.append(btn);
    }
    list.append(line);
   }
   if(future.length)status.textContent='Algunas fechas no estan disponibles: iOS no crea copias con la aplicacion cerrada. El historial automatico del servidor sigue disponible.';
  }catch(e){status.textContent='No se pudieron leer las copias de este iPhone: '+String(e?.message||e)}
 }
 function addButton(){
  const anchor=$('#localBackupStatus');
  if(!anchor||$('#oihane-device-archives-button'))return;
  const button=document.createElement('button');
  button.id='oihane-device-archives-button';button.textContent='Copias fuera de Supabase · Este iPhone';
  button.type='button';button.style.cssText='margin:9px 0;padding:11px;border-radius:12px;background:white;color:#254f41;border:1px solid #9cafa4';
  button.onclick=openArchiveUI;anchor.insertAdjacentElement('afterend',button);
 }
 const observer=new MutationObserver(addButton);
 observer.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('DOMContentLoaded',addButton);
 addButton();
 window.oihaneTakeDeviceArchive=archiveWhenAvailable;
 window.oihaneOpenDeviceArchives=openArchiveUI;
})();