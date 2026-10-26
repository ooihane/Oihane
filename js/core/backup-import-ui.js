/* Oihane 5.59.14 — Diálogo de importación accesible en iOS.
 * FUSIONAR es la opción por defecto. Nunca importa claves de sesión.
 * Reemplaza el antiguo prompt(), que no se muestra de forma fiable en PWA iOS.
 */
(function () {
  'use strict';
  const NAMES = {
    oihane_study:'Estudio',oihane_orders:'Pedidos',oihane_plans:'Planes',
    oihane_culture:'Cultura',oihane_tasks:'Tareas',oihane_events:'Calendario',
    oihane_products:'Compras',oihane_plants:'Plantas',oihane_recipes:'Recetas',
    oihane_wishlist:'Wishlist',oihane_gifts:'Regalos',oihane_home:'Hogar',
    oihane_trips:'Viajes'
  };
  const RECOMMENDED = new Set(['oihane_study','oihane_orders','oihane_plans','oihane_culture']);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const style = document.createElement('style');
  style.textContent = `
    #oihane-import-mask{position:fixed;inset:0;z-index:2147483647;background:rgba(22,26,27,.68);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
    #oihane-import-dialog{box-sizing:border-box;width:min(100%,520px);max-height:90dvh;overflow:auto;background:#fff;color:#252c2c;border-radius:18px;padding:20px;box-shadow:0 12px 40px #0004;font:15px/1.5 system-ui,-apple-system,sans-serif;-webkit-overflow-scrolling:touch}
    #oihane-import-dialog h2{font-size:21px;margin:0 0 8px;color:#252c2c}
    #oihane-import-dialog p{margin:8px 0}
    #oihane-import-dialog label{display:flex;align-items:center;gap:10px;padding:9px 5px;border-bottom:1px solid #eee;color:#252c2c}
    #oihane-import-dialog label input{width:20px;height:20px;flex:none}
    #oihane-import-dialog small{color:#555}
    #oihane-import-dialog button{border:1px solid #bbb;border-radius:12px;padding:12px;font-size:15px;background:white;color:#252c2c;cursor:pointer}
    #oihane-import-dialog button.primary{background:#385d50;color:white;border-color:#385d50;font-weight:650}
    #oihane-import-dialog button:disabled{opacity:.5}
    #oihane-import-dialog .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}
    #oihane-import-dialog .actions button{flex:1;min-width:125px}
    #oihane-import-dialog .notice{background:#f1f5f3;border-radius:11px;padding:11px;margin:12px 0}
    #oihane-import-dialog .warn{background:#fff0e6;border-radius:11px;padding:11px;margin:12px 0}
    #oihane-import-dialog #oihane-import-status{font-weight:600;white-space:pre-wrap}
    #oihane-import-dialog fieldset{padding:8px 12px;border:1px solid #ddd;border-radius:12px;max-height:31dvh;overflow:auto}
    #oihane-import-dialog legend{font-weight:650}
  `;
  document.head.appendChild(style);

  function extract(parsed) {
    if (parsed?.format === 'oihane-backup' && parsed.data && typeof parsed.data==='object' && !Array.isArray(parsed.data)) return parsed.data;
    if (parsed?.data?.oihane_study || parsed?.data?.oihane_orders) return parsed.data;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).some(k=>k.startsWith('oihane_'))) return parsed;
    if (parsed && typeof parsed==='object' && (parsed.tasks || parsed.products || parsed.events || parsed.extras)) {
      const value={};
      if(parsed.tasks) value.oihane_tasks=parsed.tasks;
      if(parsed.products) value.oihane_products=parsed.products;
      if(parsed.events) value.oihane_events=parsed.events;
      for(const [name,list] of Object.entries(parsed.extras||{})) value['oihane_'+name]=list;
      return value;
    }
    throw Error('Este archivo no tiene el formato de una copia de Oihane.');
  }
  function getEntries(data){
    return Object.entries(data).filter(([key,value])=>
      Object.prototype.hasOwnProperty.call(NAMES,key) &&
      Array.isArray(value) &&
      window.oihaneSyncRuntime?.isDataKey(key));
  }
  function dialog(){
    document.getElementById('oihane-import-mask')?.remove();
    const mask=document.createElement('div'); mask.id='oihane-import-mask';
    mask.innerHTML=`<section id="oihane-import-dialog" role="dialog" aria-modal="true" aria-labelledby="oihane-import-title">
      <h2 id="oihane-import-title">Recuperar copia de Oihane</h2>
      <p>Selecciona el archivo JSON de tu copia. Después podrás elegir qué módulos recuperar y si fusionarlos.</p>
      <input id="oihane-import-file" type="file" accept=".json,application/json,text/plain" style="display:block;width:100%;margin:15px 0" />
      <div id="oihane-import-preview" hidden></div>
      <p id="oihane-import-status" role="status" aria-live="polite"></p>
      <div class="actions"><button id="oihane-import-cancel" type="button">Cancelar</button><button id="oihane-import-apply" class="primary" type="button" disabled>Fusionar selección</button></div>
    </section>`;
    document.body.appendChild(mask);
    const byId=id=>mask.querySelector('#'+id);
    const status=byId('oihane-import-status');
    const apply=byId('oihane-import-apply');
    const preview=byId('oihane-import-preview');
    let imported=null, chosenFile='';
    const close=()=>mask.remove();
    byId('oihane-import-cancel').onclick=close;
    byId('oihane-import-file').addEventListener('change',async event=>{
      apply.disabled=true;preview.hidden=true;status.textContent='';imported=null;
      const file=event.target.files?.[0];if(!file)return;
      if(file.size>40*1024*1024){status.textContent='El archivo es demasiado grande (máximo 40 MB).';return}
      try{
        const parsed=JSON.parse(await file.text());
        const entries=getEntries(extract(parsed));
        if(!entries.length)throw Error('No hay listas reconocibles para recuperar.');
        chosenFile=file.name;
        imported=Object.fromEntries(entries);
        const date=parsed.createdAt?new Date(parsed.createdAt):null;
        const dateLabel=date&&!Number.isNaN(date.getTime())?date.toLocaleString('es-ES'):'no indicada';
        preview.innerHTML=`<div class="notice"><strong>Archivo:</strong> ${escape(file.name)}<br><strong>Fecha:</strong> ${escape(dateLabel)}<br><small>Marca los módulos que quieras restaurar. Los demás quedarán intactos.</small></div>
        <fieldset><legend>Módulos de la copia</legend>${entries.map(([key,items])=>`<label><input type="checkbox" data-restore-key="${key}" ${RECOMMENDED.has(key)?'checked':''} ${!items.length?'disabled':''}> ${escape(NAMES[key])} (${items.length})</label>`).join('')}</fieldset>
        <fieldset style="margin-top:12px"><legend>Forma de recuperación</legend>
        <label><input type="radio" name="oihane-import-mode" value="2" checked> <span><strong>Fusionar (recomendado)</strong><small style="display:block">Añade los elementos que falten; mantiene los actuales por ID.</small></span></label>
        <label><input type="radio" name="oihane-import-mode" value="1"> <span><strong>Reemplazar módulos seleccionados</strong><small style="display:block">Sustituye las listas seleccionadas por las del archivo.</small></span></label></fieldset>
        <div class="warn">Recupera primero con <strong>Fusionar</strong>. La sustitución puede borrar cambios recientes. No se importan contraseñas ni datos de sesión.</div>`;
        preview.hidden=false;apply.disabled=false;
        const refresh=()=>{const mode=mask.querySelector('input[name="oihane-import-mode"]:checked')?.value||'2';apply.textContent=mode==='2'?'Fusionar selección':'Reemplazar selección';};
        preview.addEventListener('change',refresh);refresh();
      }catch(err){status.textContent='No se pudo abrir la copia: '+(err?.message||err)}
    });
    apply.onclick=async()=>{
      if(!imported)return;
      const keys=[...mask.querySelectorAll('[data-restore-key]:checked')].map(x=>x.dataset.restoreKey);
      if(!keys.length){status.textContent='Marca al menos un módulo con datos.';return}
      const mode=mask.querySelector('input[name="oihane-import-mode"]:checked')?.value||'2';
      const choice=keys.map(k=>NAMES[k]).join(', ');
      if(mode==='1'&&!confirm('ATENCIÓN: se REEMPLAZARÁN estos módulos: '+choice+'. ¿Continuar?'))return;
      if(mode==='2'&&!confirm('Se FUSIONARÁN los datos de '+choice+' con los actuales. ¿Continuar?'))return;
      apply.disabled=true;byId('oihane-import-cancel').disabled=true;
      status.textContent='Validando y recuperando…';
      try{
        // Copia local PREVIA independiente del archivo importado. Sin afectar la nube.
        const before=collectBackupData();
        // Guardar copia antes de importar en IndexedDB. No abrir Archivos de iPhone
        // por sorpresa: una descarga automática parece un segundo selector.
        const backupName='oihane-antes-de-fusion-'+new Date().toISOString().replace(/[.:]/g,'-')+'.json';
        const backupText=JSON.stringify(before);
        const backupDb=await new Promise((resolve,reject)=>{
          const req=indexedDB.open('oihane_premerge_safety_v1',1);
          req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('snapshots'))req.result.createObjectStore('snapshots',{keyPath:'name'})};
          req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
        });
        try{await new Promise((resolve,reject)=>{
          const tx=backupDb.transaction('snapshots','readwrite');
          tx.objectStore('snapshots').put({name:backupName,createdAt:new Date().toISOString(),json:backupText});
          tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
        })}finally{backupDb.close()}
        // Un botón explícito permite descargarla solo si la persona lo desea.
        const manualExport=()=>{
          const url=URL.createObjectURL(new Blob([backupText],{type:'application/json'}));
          const a=document.createElement('a');a.href=url;a.download=backupName;document.body.append(a);
          a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
        };
        const selected=Object.fromEntries(keys.map(k=>[k,imported[k]]));
        const localized=await window.oihanePlantPhotos.localizeData(selected);
        restoreModuleDataAtomically(Object.entries(localized),mode);
        // Refrescar referencias utilizadas en formularios y vista inicial.
        tasks=readStore('oihane_tasks');
        products=readStore('oihane_products');
        events=readStore('oihane_events');
        await writeLocalSnapshot();
        try{window.oihaneFullSharedChange?.('Cultura')}catch(_){}
        try{window.oihaneMixedChanged?.('Planes')}catch(_){}
        try{window.oihaneMixedChanged?.('Pedidos')}catch(_){}
        try{window.queueCloudSync?.()}catch(_){}
        home();
        status.textContent='Recuperación local completada ('+choice+'). La copia anterior se ha guardado en este dispositivo, sin abrir Archivos. Verifica los módulos antes de usarlos en otro móvil.';
        const download=document.createElement('button');download.type='button';download.textContent='Descargar copia previa (opcional)';
        download.onclick=manualExport;status.insertAdjacentElement('afterend',download);
        apply.style.display='none';byId('oihane-import-cancel').disabled=false;byId('oihane-import-cancel').textContent='Cerrar';
      }catch(err){status.textContent='No se aplicaron todos los cambios: '+(err?.message||err)+'. Conserva tu archivo '+chosenFile+'.';apply.disabled=false;byId('oihane-import-cancel').disabled=false;}
    };
    byId('oihane-import-file').focus();
  }
  // Se invoca desde el onclick ya existente en Más. Sin prompt() nativo en iOS.
  window.importBackup=dialog;
})();
