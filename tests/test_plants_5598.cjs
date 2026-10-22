'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const base=path.resolve(__dirname,'..');
// IndexedDB simulada: confirma que se escribe antes de devolver éxito.
const entries=new Map();let upgrade=false;
const db={
 objectStoreNames:{contains:()=>upgrade},
 createObjectStore:()=>{upgrade=true},close:()=>{},
 transaction(){const tx={error:null,objectStore(){return {
  get(k){const req={result:null};queueMicrotask(()=>{req.result=entries.get(k);req.onsuccess?.();queueMicrotask(()=>tx.oncomplete?.())});return req},
  put(v,k){const req={};queueMicrotask(()=>{entries.set(k,v);req.onsuccess?.();queueMicrotask(()=>tx.oncomplete?.())});return req}
 }}};return tx}
};
const indexedDB={open(){const req={result:db};queueMicrotask(()=>{if(!upgrade)req.onupgradeneeded?.();req.onsuccess?.()});return req}};
const items=new Map();const storage={getItem(k){return items.has(k)?items.get(k):null},setItem(k,v){items.set(k,v)},removeItem(k){items.delete(k)}};
const window={indexedDB};
const context={window,localStorage:storage,indexedDB,crypto:webcrypto,TextEncoder,Promise,Map,Set,console,Error,Uint8Array,document:{querySelectorAll(){return []}},setTimeout,queueMicrotask};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(base,'js/core/plant-photo-store.js'),'utf8'),context);
async function test(){
 const store=window.oihanePlantPhotos;
 const img='data:image/jpeg;base64,'+'B'.repeat(400000);
 const ref=await store.put(img);
 assert.ok(ref.startsWith('oihane-photo:'));
 assert.equal(await store.get(ref),img);
 storage.setItem('oihane_plants',JSON.stringify([{id:'1',title:'Monstera',lastWatered:'2026-10-19',photo:img}]));
 assert.equal(await store.migrate(),1);
 const packed=JSON.parse(storage.getItem('oihane_plants'));
 assert.equal(packed[0].photo,ref);
 assert.ok(storage.getItem('oihane_plants').length<500);
 const expanded=await store.expandData({oihane_plants:packed});
 assert.equal(expanded.oihane_plants[0].photo,img);
 assert.equal((await store.localizeData(expanded)).oihane_plants[0].photo,ref);
 assert.equal(await store.migrate(),0);
 const p=packed[0];
 const code=fs.readFileSync(path.join(base,'js/features/02-tasks-hogar.js'),'utf8');
 const a=code.indexOf(' // Plantas: riegos y comprobaciones del suelo son acciones independientes.');
 const b=code.indexOf(' function moduleHead(name)',a);
 assert.ok(a>0&&b>a);
 const today=()=> '2026-10-22';
 const scope={window:{},today,getItems:()=>[],console,Date,Number,String,Object,Array};
 vm.createContext(scope);
 vm.runInContext(code.slice(a,b)+'\nwindow.testPlant={recordWatering,recordSoil,updatePlantStatus};',scope);
 const plant=scope.window.testPlant;
 assert.equal(plant.recordWatering(p,'2026-10-20',5),true);
 plant.updatePlantStatus(p); assert.equal(p.date,'2026-10-25');
 const wateringBefore=p.lastWatered;
 assert.equal(plant.recordSoil(p,'Suelo mojado','2026-10-22',6),true);
 plant.updatePlantStatus(p);assert.equal(p.lastWatered,wateringBefore);assert.equal(p.date,'2026-10-28');
 assert.equal(p.wateringHistory.length,2);assert.equal(p.soilHistory.length,1);
 assert.equal(plant.recordSoil(p,'Húmeda','2026-10-22',9),true);plant.updatePlantStatus(p);
 assert.equal(p.date,'2026-10-31');assert.equal(p.soilHistory.at(-1).waitDays,9);
 plant.recordWatering(p,'2026-10-22',4);plant.updatePlantStatus(p);
 assert.equal(p.date,'2026-10-26');assert.equal(p.soilHistory.length,2);assert.equal(p.wateringHistory.length,3);
 const end=code.indexOf("if(name==='Plantas'){byId('v519WaterNow')");const start=code.lastIndexOf('form.onsubmit=async e=>',end);
 const submit=code.slice(start,end);
 assert.ok(!submit.includes('recordSoil(')&&!submit.includes('recordWatering('),'form save must not log actions');
 for(const id of ['v519WaterNow','v519RecordSoil','v519SoilDays','v519WaterDays'])assert.ok(code.includes(id));
 console.log('PASS: 12 verificaciones: almacenamiento fuera de localStorage, copia portable, fechas, historiales independientes y botones');
}
test().catch(e=>{console.error(e);process.exitCode=1});
