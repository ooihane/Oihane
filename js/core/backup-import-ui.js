/* Oihane 5.59.10 — selector de recuperacion para Safari y PWA iOS. */
(function(){
'use strict';
const names={oihane_study:'Estudio',oihane_orders:'Pedidos',oihane_plans:'Planes',oihane_culture:'Cultura',oihane_tasks:'Tareas',oihane_events:'Calendario',oihane_products:'Compras',oihane_plants:'Plantas',oihane_recipes:'Recetas',oihane_wishlist:'Wishlist',oihane_gifts:'Regalos',oihane_home:'Hogar',oihane_trips:'Viajes'};
const defaults=new Set(['oihane_study','oihane_orders','oihane_plans','oihane_culture']);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const css=document.createElement('style');
css.textContent='#oihane-import-mask{position:fixed;inset:0;z-index:2147483647;background:#151b1bc4;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}#oihane-import-dialog{box-sizing:border-box;width:min(100%,520px);max-height:90dvh;overflow:auto;background:white;color:#24302d;border-radius:18px;padding:20px;font:15px/1.5 system-ui,-apple-system,sans-serif;-webkit-overflow-scrolling:touch}#oihane-import-dialog h2{font-size:21px;margin:0 0 8px}#oihane-import-dialog p{margin:8px 0}#oihane-import-dialog label{display:flex;align-items:center;gap:10px;padding:9px 5px;border-bottom:1px solid #eee;color:#24302d}#oihane-import-dialog label input{width:20px;height:20px;flex:none}#oihane-import-dialog button{border:1px solid #bbb;border-radius:12px;padding:12px;font-size:15px;background:white;color:#24302d}#oihane-import-dialog button.primary{background:#385d50;color:white;border-color:#385d50;font-weight:600}#oihane-import-dialog button:disabled{opacity:.5}#oihane-import-dialog .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}#oihane-import-dialog .actions button{flex:1;min-width:120px}#oihane-import-dialog fieldset{padding:8px 12px;border:1px solid #ddd;border-radius:12px;max-height:32dvh;overflow:auto}#oihane-import-dialog legend{font-weight:600}#oihane-import-status{font-weight:600;white-space:pre-wrap}';
document.head.append(css);
function extract(parsed){
 if(parsed?.format==='oihane-backup'&&parsed.data&&typeof parsed.data==='object'&&!Array.isArray(parsed.data))return parsed.data;
 if(parsed?.data&&typeof parsed.data==='object'&&Object.keys(parsed.data).some(k=>k.startsWith('oihane_')))return parsed.data;
 if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)&&Object.keys(parsed).some(k=>k.startsWith('oihane_')))return parsed;
 if(parsed&&typeof parsed==='object'&&(parsed.tasks||parsed.products||parsed.events||parsed.extras)){
  const result={};if(parsed.tasks)result.oihane_tasks=parsed.tasks;if(parsed.products)result.oihane_products=parsed.products;if(parsed.events)result.oihane_events=parsed.events;
  for(const [k,v] of Object.entries(parsed.extras||{}))result['oihane_'+k]=v;
  return result;
 }
 throw Error('El archivo no tiene el formato de una copia de Oihane.');
}
function openDialog(){
 document.getElementById('oihane-import-mask')?.remove();
 const mask=document.createElement('div');mask.id='oihane-import-mask';
 mask.innerHTML='<section id="oihane-import-dialog" role="dialog" aria-modal="true" aria-labelledby="oihane-import-title"><h2 id="oihane-import-title">Recuperar copia de Oihane</h2><p>Selecciona un archivo JSON para elegir los modulos que quieres recuperar.</p><input id="oihane-import-file" type="file" accept=".json,application/json,text/plain" style="display:block;width:100%;margin:15px 0"><div id="oihane-import-preview" hidden></div><p id="oihane-import-status" role="status" aria-live="polite"></p><div class="actions"><button type="button" id="oihane-import-cancel">Cancelar</button><button type="button" id="oihane-import-apply" class="primary" disabled>Fusionar seleccion</button></div></section>';
 document.body.append(mask);
 const el=id=>mask.querySelector('#'+id),status=el('oihane-import-status'),apply=el('oihane-import-apply'),preview=el('oihane-import-preview');
 let imported=null,filename='';
 el('oihane-import-cancel').onclick=()=>mask.remove();
 el('oihane-import-file').onchange=async event=>{
  imported=null;apply.disabled=true;preview.hidden=true;status.textContent='';
  const file=event.target.files?.[0];if(!file)return;
  if(file.size>40*1024*1024){status.textContent='El archivo supera el limite de 40 MB.';return;}
  try{
   const parsed=JSON.parse(await file.text()),data=extract(parsed);
   const entries=Object.entries(data).filter(([key,value])=>Object.prototype.hasOwnProperty.call(names,key)&&Array.isArray(value)&&window.oihaneSyncRuntime?.isDataKey(key));
   if(!entries.length)throw Error('La copia no contiene modulos compatibles.');
   imported=Object.fromEntries(entries);filename=file.name;
   const dt=parsed.createdAt?new Date(parsed.createdAt):null;
   const date=dt&&!Number.isNaN(dt.getTime())?dt.toLocaleString('es-ES'):'no indicada';
   preview.innerHTML='<p><strong>Archivo:</strong> '+escapeHtml(filename)+'<br><strong>Fecha:</strong> '+escapeHtml(date)+'</p><fieldset><legend>Modulos a recuperar</legend>'+entries.map(([k,v])=>'<label><input type="checkbox" data-restore-key="'+k+'" '+(defaults.has(k)&&v.length?'checked':'')+' '+(!v.length?'disabled':'')+'> '+escapeHtml(names[k])+' ('+v.length+')</label>').join('')+'</fieldset><fieldset style="margin-top:12px"><legend>Modo de recuperacion</legend><label><input type="radio" name="oihane-import-mode" value="2" checked> Fusionar (recomendado, conserva lo existente)</label><label><input type="radio" name="oihane-import-mode" value="1"> Reemplazar modulos seleccionados</label></fieldset><p>Recomendamos fusionar. La sustitucion puede borrar cambios recientes.</p>';
   preview.hidden=false;apply.disabled=false;
   preview.onchange=()=>{const mode=mask.querySelector('input[name="oihane-import-mode"]:checked')?.value||'2';apply.textContent=mode==='2'?'Fusionar seleccion':'Reemplazar seleccion';};
  }catch(error){status.textContent='No se pudo abrir la copia: '+(error?.message||error);}
 };
 apply.onclick=async()=>{
  if(!imported)return;
  const keys=Array.from(mask.querySelectorAll('[data-restore-key]:checked'),e=>e.dataset.restoreKey);
  if(!keys.length){status.textContent='Marca al menos un modulo con datos.';return;}
  const mode=mask.querySelector('input[name="oihane-import-mode"]:checked')?.value||'2',selected=keys.map(k=>names[k]).join(', ');
  if(!confirm((mode==='1'?'Se REEMPLAZARAN':'Se FUSIONARAN')+' los datos de '+selected+'. ¿Continuar?'))return;
  apply.disabled=true;el('oihane-import-cancel').disabled=true;status.textContent='Preparando copia de seguridad y recuperando...';
  try{
   const before=collectBackupData(),backupName='oihane-antes-de-fusion-'+new Date().toISOString().slice(0,10)+'.json';
   const blob=new Blob([JSON.stringify(before,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=backupName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
   const selectedData=Object.fromEntries(keys.map(k=>[k,imported[k]]));
   const normalized=await window.oihanePlantPhotos.localizeData(selectedData);
   restoreModuleDataAtomically(Object.entries(normalized),mode);
   tasks=readStore('oihane_tasks');products=readStore('oihane_products');events=readStore('oihane_events');
   await writeLocalSnapshot();
   try{window.oihaneFullSharedChange?.('Cultura')}catch(_){}
   try{window.oihaneMixedChanged?.('Planes');window.oihaneMixedChanged?.('Pedidos')}catch(_){}
   home();
   status.textContent='Fusion/restauracion local completada: '+selected+'. Se ha descargado la copia previa: '+backupName+'. Verifica los modulos antes de sincronizar otros dispositivos.';
   apply.style.display='none';el('oihane-import-cancel').disabled=false;el('oihane-import-cancel').textContent='Cerrar';
  }catch(error){status.textContent='No se pudo completar la recuperacion: '+(error?.message||error)+'. Conserva el archivo '+filename;apply.disabled=false;el('oihane-import-cancel').disabled=false;}
 };
 el('oihane-import-file').focus();
}
window.importBackup=openDialog;
})();