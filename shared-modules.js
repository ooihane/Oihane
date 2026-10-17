/* Oihane 5.36.9 — sincronización granular de módulos íntegramente compartidos.
 * Requiere sesión Supabase y vínculo activo; no toca Regalos, Libros, Arte ni Estudio.
 * Revisión por registro para evitar sobrescribir cambios paralelos. */
(function(){
 'use strict';
 const modules=[
   {name:'Hogar',module:'hogar',key:'oihane_home'},
   {name:'Plantas',module:'plantas',key:'oihane_plants'},
   {name:'Recetas',module:'recetas',key:'oihane_recipes'},
   {name:'Viajes',module:'viajes',key:'oihane_trips'},
   {name:'Cultura',module:'peliculas',key:'oihane_culture',film:true}
 ];
 const state=new Map(modules.map(m=>[m.name,{ready:false,rows:[],busy:false,generation:0,queued:false,lastPoll:0}]));
 let uid='',linkId='',booting=false,stopped=false,workTimer=null;
 const clean=x=>JSON.parse(JSON.stringify(x));
 const equivalent=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
 const idOf=x=>String(x?.id??'');
 const isFilm=x=>/pel[íi]cula|serie/i.test(String(x?.kind||''));
 const select=(m,items)=>m.film?items.filter(isFilm):items;
 const other=(m,items)=>m.film?items.filter(x=>!isFilm(x)):[];
 const tag=(r)=>({...clean(r.payload),_oihaneSharedId:r.id,_oihaneSharedSource:r.source_key});
 const strip=x=>{const y=clean(x);delete y._oihaneSharedId;delete y._oihaneSharedSource;return y};
 const read=m=>{try{const a=JSON.parse(localStorage.getItem(m.key)||'[]');return Array.isArray(a)?a:[]}catch(_){return []}};
 const baseKey=m=>'oihane_shared_baseline_'+uid+'_'+m.module;
 const rowsMap=rs=>new Map(rs.map(r=>[r.id,r]));
 const now=()=>Date.now();
 const changed=(a,b)=>[...new Set([...Object.keys(a||{}),...Object.keys(b||{})])].filter(k=>!equivalent(a?.[k],b?.[k]));
 async function rpc(path,opts){await refreshCloudToken();return cloudFetch(path,opts||{method:'GET'})}
 async function rowsFor(m){
  const path='/rest/v1/oihane_shared_records?select=id,owner_id,source_key,payload,revision,deleted_at,updated_at&module=eq.'+m.module+
   '&link_id=eq.'+encodeURIComponent(linkId)+'&limit=1000&order=created_at.asc';
  const data=await rpc(path,{method:'GET'});
  if(!Array.isArray(data))throw Error('Respuesta inesperada de Supabase');
  return data;
 }
 const sourceOf=x=>x._oihaneSharedSource||uid+'|'+idOf(x);
 function findRow(m,item,rows){
  const src=sourceOf(item);
  return rows.find(r=>r.id===item._oihaneSharedId||r.source_key===src);
 }
 function notify(m,message){
  if(screen!==m.name)return;
  const app=document.getElementById('app');if(!app)return;
  let el=app.querySelector('.oihane-shared-note');
  if(!el){el=document.createElement('p');el.className='hint oihane-shared-note';app.append(el)}
  el.textContent=message;
 }
 function apply(m,remote,local){
  const ownLocal=other(m,local);
  const combined=ownLocal.concat(remote.filter(r=>!r.deleted_at).map(tag));
  const s=state.get(m.name);s.rows=remote;s.ready=true;s.queued=false;s.lastPoll=now();
  try{localStorage.setItem(baseKey(m),JSON.stringify(remote));
   localStorage.setItem(m.key,JSON.stringify(combined))}catch(e){notify(m,'Sin espacio local para guardar los datos compartidos.');throw e}
  if(screen===m.name){
   const openForm=document.querySelector('#extraForm,#v520Form,#v518Form');
   if(!openForm||!document.activeElement||!openForm.contains(document.activeElement)){
    if(m.name==='Cultura')renderExtraModule('Cultura');
    else if(typeof openModule==='function')openModule(m.name);
   }
  }
 }
 async function insert(m,item){
  const payload={link_id:linkId,owner_id:uid,module:m.module,shared:true,source_key:sourceOf(item),payload:strip(item)};
  return rpc('/rest/v1/oihane_shared_records?select=id,payload,revision,source_key,deleted_at',
   {method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});
 }
 async function readOne(id){
  const list=await rpc('/rest/v1/oihane_shared_records?select=id,owner_id,source_key,payload,revision,deleted_at,updated_at&id=eq.'+encodeURIComponent(id)+'&limit=1',{method:'GET'});
  return list?.[0];
 }
 async function patch(base,ours,deleted){
  let baseline=strip(base.payload);
  let target=ours?strip(ours):null;
  const fields=deleted?[]:changed(baseline,target);
  if(!deleted&&!fields.length)return;
  for(let attempt=0;attempt<3;attempt++){
   const cur=await readOne(base.id);
   if(!cur)throw Error('Elemento no accesible');
   if(cur.deleted_at&&deleted)return;
   if(cur.deleted_at&&!deleted&&!confirm('Este elemento fue eliminado desde otro móvil. ¿Recuperarlo?'))return;
   if(deleted&&!equivalent(cur.payload,baseline)&&!confirm('Este elemento cambió en el otro dispositivo. ¿Eliminar igualmente?'))return;
   const merged=clean(cur.payload);
   if(!deleted)for(const k of fields){
    if(!equivalent(baseline[k],cur.payload[k])&&!equivalent(target[k],cur.payload[k])){
     if(!confirm('Conflicto en '+k+'.\n\nTu versión: '+JSON.stringify(target[k]).slice(0,150)+'\nVersión compartida: '+JSON.stringify(cur.payload[k]).slice(0,150)+'\n\nAceptar para conservar tu cambio.'))continue;
    }
    if(Object.prototype.hasOwnProperty.call(target,k))merged[k]=clean(target[k]);
    else delete merged[k];
   }
   const body=deleted?{deleted_at:new Date().toISOString(),deleted_by:uid}:
     {payload:merged,...(cur.deleted_at?{deleted_at:null,deleted_by:null}:{})};
   const path='/rest/v1/oihane_shared_records?id=eq.'+encodeURIComponent(base.id)+'&revision=eq.'+cur.revision+
     '&select=id,revision';
   const result=await rpc(path,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(body)});
   if(Array.isArray(result)&&result.length)return;
  }
  throw Error('Cambios simultáneos pendientes de resolver');
 }
 async function process(m){
  const s=state.get(m.name);
  if(!s.ready||s.busy||!uid||!linkId)return;
  s.busy=true;const generation=s.generation;
  try{
   const baseline=s.rows.slice();
   const local=select(m,read(m));
   const marked=new Set(),ops=[];
   for(const item of local){
    const row=findRow(m,item,baseline);
    if(!row){
     // No duplicar si el mismo elemento acaba de ser importado.
     const foreignSource=sourceOf(item);
     ops.push(async()=>{const remote=await rowsFor(m);
       if(!remote.some(x=>x.source_key===foreignSource))await insert(m,item)});
    }else{
     marked.add(row.id);
     if(!row.deleted_at&&!equivalent(row.payload,strip(item)))ops.push(()=>patch(row,item,false));
    }
   }
   for(const row of baseline){
    if(!row.deleted_at&&!marked.has(row.id))ops.push(()=>patch(row,null,true));
   }
   for(const op of ops)await op();
   const remote=await rowsFor(m);
   if(s.generation!==generation){s.rows=remote;s.queued=true;return}
   apply(m,remote,read(m));
  }catch(e){s.queued=true;notify(m,'Sincronización pendiente: '+String(e?.message||e))}
  finally{s.busy=false;s.lastPoll=now()}
 }
 async function boot(){
  if(booting)return;
  const current=localStorage.getItem('oihane_sync_user')||'';
  if(!current||!syncConfig().access)return;
  if(uid===current&&linkId)return;
  booting=true;
  try{
   const links=await rpc('/rest/v1/oihane_partner_links?select=id,user_a,user_b&status=eq.active&limit=1',{method:'GET'});
   const l=links?.[0];if(!l||![l.user_a,l.user_b].includes(current))return;
   uid=current;linkId=l.id;stopped=false;
   for(const m of modules){
    const s=state.get(m.name),local=read(m);
    const remote=await rowsFor(m);
    let cached=[];
    try{cached=JSON.parse(localStorage.getItem(baseKey(m))||'[]')}catch(_){}
    if(!Array.isArray(cached))cached=[];
    if(cached.length){
     // Reanudar ediciones offline partiendo de la última copia común persistida.
     const checked=new Set();
     for(const item of select(m,local)){
      const old=findRow(m,item,cached);if(!old)continue;checked.add(old.id);
      if(!old.deleted_at&&!equivalent(old.payload,strip(item)))await patch(old,item,false);
     }
     for(const row of cached){
      if(!row.deleted_at&&!checked.has(row.id))await patch(row,null,true);
     }
    }
    // Si el dispositivo llevaba cambios desde la importación inicial, subir solo
    // los campos alterados antes de sustituir su copia local.
    if(!cached.length){
     let mustRefetch=false;
     for(const item of select(m,local)){
      const row=findRow(m,item,remote);
      if(row&&!row.deleted_at&&!equivalent(strip(item),row.payload)){
       await patch(row,item,false);
       mustRefetch=true;
      }
     }
     if(mustRefetch)remote=await rowsFor(m);
    }
    const latest=cached.length?await rowsFor(m):remote;
    // Al migrar, mantener cambios locales posteriores a la fecha de importación.
    const known=new Set(latest.map(r=>r.source_key));
    const pending=select(m,local).filter(item=>!known.has(sourceOf(item))&&!latest.some(r=>r.id===item._oihaneSharedId));
    const ownLocal=other(m,local);
    // Preservar cambios locales sin enviar accidentalmente contenidos de Cultura privados.
    s.rows=latest;s.ready=true;s.lastPoll=now();
    const tagged=latest.filter(r=>!r.deleted_at).map(tag);
    try{localStorage.setItem(m.key,JSON.stringify(ownLocal.concat(tagged,pending)))}catch(e){throw e}
    if(pending.length){
       s.queued=true;s.generation++;await process(m);
    }else apply(m,latest,read(m));
   }
  }catch(e){console.warn('Oihane: módulos compartidos aún no disponibles',e)}
  finally{booting=false}
 }
 window.oihaneFullSharedKeys=new Set();
 for(const m of modules)window.oihaneFullSharedKeys.add(m.key);
 window.oihaneFullSharedChange=function(name){
  const s=state.get(name);if(!s||!s.ready)return;
  s.generation++;s.queued=true;setTimeout(()=>process(modules.find(m=>m.name===name)),850);
 };
 window.oihaneFullSharedVisit=function(name){const m=modules.find(x=>x.name===name);if(!m)return;
  if(!linkId)boot();else if(now()-state.get(name).lastPoll>3000)process(m);
 };
 async function tick(){
  if(document.visibilityState==='hidden')return;
  if(!linkId||uid!==localStorage.getItem('oihane_sync_user')){linkId='';uid='';for(const v of state.values())v.ready=false;await boot();return}
  for(const m of modules){
   const s=state.get(m.name);if(s.ready&&!s.busy)await process(m);
  }
 }
 window.addEventListener('load',()=>setTimeout(boot,500));
 window.addEventListener('focus',()=>tick());
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')tick()});
 window.setInterval(tick,60000);
})();