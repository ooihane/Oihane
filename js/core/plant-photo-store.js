/* Oihane 5.59.8 — Fotos de Plantas fuera de localStorage.
 * Las referencias locales se expanden a imágenes reales antes de exportar o sincronizar.
 * Si IndexedDB no está disponible, se cancela el cambio: nunca sustituir fotos por referencias rotas.
 */
(function(){
 'use strict';
 const PREFIX='oihane-photo:';
 const DB='OihanePlantPhotos';
 const KEY='oihane_plants';
 const seen=new Map();
 const isRef=v=>typeof v==='string'&&v.startsWith(PREFIX);
 const isImage=v=>typeof v==='string'&&/^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(v);
 function open(){return new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(Error('IndexedDB no disponible'));return;}
  const req=indexedDB.open(DB,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('photos'))req.result.createObjectStore('photos')};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('No se pudo abrir el almacén de fotos'));
  req.onblocked=()=>reject(Error('El almacén de fotos está bloqueado'));
 })}
 async function transact(kind,key,data){const db=await open();try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction('photos',kind),store=tx.objectStore('photos');const req=data===undefined?store.get(key):store.put(data,key);
  req.onsuccess=()=>{if(data===undefined)resolve(req.result);};
  tx.oncomplete=()=>{if(data!==undefined)resolve(true)};
  tx.onerror=()=>reject(tx.error||Error('Error al guardar la foto'));
  tx.onabort=()=>reject(tx.error||Error('Se canceló el guardado de foto'));
 })}finally{db.close()}}
 async function hash(data){
  if(!crypto?.subtle?.digest)throw Error('La protección criptográfica de fotos no está disponible');
  const bytes=new TextEncoder().encode(data);
  const raw=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(raw)].map(n=>n.toString(16).padStart(2,'0')).join('');
 }
 async function put(data){
  if(!isImage(data))return data;
  const ref=PREFIX+await hash(data);
  const existing=await transact('readonly',ref);
  if(existing!==data){await transact('readwrite',ref,data);
   if(await transact('readonly',ref)!==data)throw Error('No se ha podido verificar la fotografía guardada');}
  seen.set(ref,data);
  if(seen.size>25)seen.delete(seen.keys().next().value);
  return ref;
 }
 async function get(ref){
  if(!isRef(ref))return ref;
  if(seen.has(ref))return seen.get(ref);
  const img=await transact('readonly',ref);
  if(!isImage(img))throw Error('La fotografía no está en este dispositivo. No se modifican los datos.');
  seen.set(ref,img);if(seen.size>25)seen.delete(seen.keys().next().value);
  return img;
 }
 async function localizeRows(rows){
  if(!Array.isArray(rows))return rows;
  return Promise.all(rows.map(async p=>{
   if(!p||!isImage(p.photo))return p;
   return {...p,photo:await put(p.photo)};
  }));
 }
 async function expandRows(rows){
  if(!Array.isArray(rows))return rows;
  return Promise.all(rows.map(async p=>{
   if(!p||!isRef(p.photo))return p;
   return {...p,photo:await get(p.photo)};
  }));
 }
 async function localizeData(data){
  if(!data||!Array.isArray(data[KEY]))return data;
  return {...data,[KEY]:await localizeRows(data[KEY])};
 }
 async function expandData(data){
  if(!data||!Array.isArray(data[KEY]))return data;
  return {...data,[KEY]:await expandRows(data[KEY])};
 }
 async function migrate(){
  const raw=localStorage.getItem(KEY)||'[]';
  const original=JSON.parse(raw);
  if(!Array.isArray(original))throw Error('Formato de Plantas inesperado');
  const count=original.filter(p=>p&&isImage(p.photo)).length;
  if(!count)return await migrateBaselines();
  const converted=await localizeRows(original);
  // Verificación: todas las fotos están en IndexedDB antes de liberar bytes.
  for(const plant of converted)if(isRef(plant?.photo))await get(plant.photo);
  if(localStorage.getItem(KEY)!==raw)throw Error('Plantas cambió durante la migración; vuelve a intentarlo');
  localStorage.setItem(KEY,JSON.stringify(converted));
  const baselineCount=await migrateBaselines();
  return count+baselineCount;
 }
 async function migrateBaselines(){
  // Las versiones anteriores duplicaban las mismas fotos dentro del historial
  // de comparación del módulo compartido, también sujeto a la cuota local.
  let count=0;
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key?.startsWith('oihane_shared_baseline_')||!key.endsWith('_plantas'))continue;
   const raw=localStorage.getItem(key);
   let rows;try{rows=JSON.parse(raw||'[]')}catch(_){continue}
   if(!Array.isArray(rows))continue;
   const source=rows.filter(row=>isImage(row?.payload?.photo));
   if(!source.length)continue;
   const updated=await Promise.all(rows.map(async row=>row?.payload?.photo&&isImage(row.payload.photo)
    ?{...row,payload:{...row.payload,photo:await put(row.payload.photo)}}:row));
   for(const row of updated)if(isRef(row?.payload?.photo))await get(row.payload.photo);
   if(localStorage.getItem(key)!==raw)throw Error('Los datos compartidos han cambiado; repite la migración');
   localStorage.setItem(key,JSON.stringify(updated));
   count+=source.length;
  }
  return count;
 }
 function usage(){
  let chars=0;const largest=[];
  for(let i=0;i<localStorage.length;i++){
   const k=localStorage.key(i),v=localStorage.getItem(k)||'';
   chars+=k.length+v.length;largest.push({key:k,characters:v.length});
  }
  return {estimatedBytes:chars*2,largest:largest.sort((a,b)=>b.characters-a.characters).slice(0,4)};
 }
 function render(container=document){
  const nodes=container.querySelectorAll('img[data-oihane-plant-photo]');
  for(const img of nodes){
   const ref=img.getAttribute('data-oihane-plant-photo');
   get(ref).then(src=>{if(img.isConnected&&img.getAttribute('data-oihane-plant-photo')===ref)img.src=src})
    .catch(()=>{if(img.isConnected){img.alt='Foto no disponible en este dispositivo';img.classList.add('oihane-photo-missing')}});
  }
 }
 window.oihanePlantPhotos={put,get,migrate,isRef,isImage,localizeRows,expandRows,localizeData,expandData,render,usage};
})();
