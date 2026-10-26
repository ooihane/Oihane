/* Oihane 5.59.14 - formularios independientes, compactos y accesibles. */
(function () {
 'use strict';
 const root=document.getElementById('app');
 const candidates='#addPanel,#v518FormPanel,#v519Panel,#v520Panel';
 const isOpen=p=>p&&!p.classList.contains('hidden')&&p.getClientRects().length>0;
 let active=null,scheduled=false;
 const visible=()=>[...document.querySelectorAll(candidates)].find(isOpen);
 const isFormElement=el=>el?.matches?.('input:not([type=checkbox]):not([type=radio]):not([type=file]),textarea,select');
 function enrich(form){
  if(!form)return;
  const fields=form.querySelectorAll('input,textarea,select');
  for(const control of fields){
   if(!isFormElement(control)||control.dataset.oihaneCompact)continue;
   control.dataset.oihaneCompact='1';
   const wrap=control.closest('.field,.v521-field')||control.parentElement;
   const adjacent=control.previousElementSibling;
   const label=(wrap?.querySelector('label:not(:has(input))') || (adjacent?.tagName==='LABEL'?adjacent:null));
   if(!label)continue;
   const title=(label.textContent||'').replace(/\s*\(opcional\)/i,'').replace(/\s*\(.*?\)/g,'').trim();
   if(!title)continue;
   control.setAttribute('aria-label',title);
   if(control.tagName==='SELECT'){
    control.dataset.oihaneFieldName=title;
    control.setAttribute('title',title);
   }else if(control.type!=='date'&&control.type!=='time'&&control.type!=='datetime-local'){
    control.placeholder=title;
   }else{
    control.title=title;
    // Los campos con selector de fecha/hora no admiten placeholder nativo en Safari.
    if(!wrap.querySelector('.oihane-modal-placeholder-label')){
     const heading=document.createElement('small');heading.className='oihane-modal-placeholder-label';heading.textContent=title;
     heading.style.cssText='font-size:10px;line-height:1.1;display:block;color:#66766c';
     control.before(heading);
    }
   }
  }
 }
 function fixBoxes(form){
  for(const label of form?.querySelectorAll('label')||[]){
   if(label.querySelector('input[type="checkbox"],input[type="radio"]'))label.classList.add('oihane-inline-compact');
  }
 }
 function fixModuleFields(panel){
  const name=typeof screen==='string'?screen:'';
  if(name==='Regalos'){
   for(const id of ['v518Occasion','v518Date','extraOccasion','extraOccasionDate']){
    const input=panel.querySelector('#'+id);if(input){const container=input.closest('.field')||input.previousElementSibling;if(container?.classList?.contains('field'))container.hidden=true;else{if(input.previousElementSibling?.tagName==='LABEL')input.previousElementSibling.hidden=true;input.hidden=true;}}
   }
  }
  if(name==='Hogar'){
   const f=panel.querySelector('#v519StatusField');if(f)f.hidden=true;
  }
  if(name==='Calendario'){
   // Un único cerrar, en la cabecera del formulario.
   const buttons=[...panel.querySelectorAll('button')].filter(b=>/^(cerrar|cancelar)$/i.test(b.textContent.trim()));
   buttons.forEach((b,i)=>{if(i>0)b.hidden=true;});
  }
 }
 function close(panel){
  if(!panel)return;
  const name=typeof screen==='string'?screen:'';
  const id=panel.id;
  if(id==='v519Panel'&&typeof window.v519CloseForm==='function')window.v519CloseForm();
  else if(id==='v518FormPanel'&&typeof window.v518ToggleForm==='function'){
   // No llamar a toggle si otra operación ya cerró el panel.
   if(!panel.classList.contains('hidden'))window.v518ToggleForm(name);
  }else if(id==='v520Panel'){
   const btn=panel.querySelector('#v520Cancel');if(btn)btn.click();else panel.classList.add('hidden');
  }else if(id==='addPanel'&&typeof window.toggleAddForm==='function'){
   if(!panel.classList.contains('hidden'))window.toggleAddForm();
  }else panel.classList.add('hidden');
  panel.classList.remove('oihane-form-isolated');
  if(active===panel)active=null;
  document.documentElement.classList.remove('oihane-form-active');
 }
 function activate(panel){
  if(active===panel)return;
  if(active&&active!==panel)active.classList.remove('oihane-form-isolated');
  active=panel;panel.classList.add('oihane-form-isolated');
  panel.scrollTop=0;
  document.documentElement.classList.add('oihane-form-active');
  panel.querySelector('.oihane-isolated-head')?.remove();
  const head=document.createElement('div');head.className='oihane-isolated-head';
  const title=document.createElement('strong');
  title.textContent=typeof screen==='string'?screen:'Editar';
  const cancel=document.createElement('button');cancel.type='button';cancel.title='Cerrar formulario';cancel.setAttribute('aria-label','Cerrar formulario');cancel.textContent='×';
  cancel.onclick=()=>close(panel);head.append(title,cancel);panel.prepend(head);
  const form=panel.querySelector('form');enrich(form);fixBoxes(form);fixModuleFields(panel);
 }
 function inspect(){
  // El aviso de permisos del micrófono solo debe aparecer tras pulsar su control.
  document.getElementById('oihaneMicPermission')?.remove();
  const next=visible();
  if(next)activate(next);
  else if(active){active.classList.remove('oihane-form-isolated');active=null;document.documentElement.classList.remove('oihane-form-active');}
  const wishlist=document.querySelector('#v518Body');
  if(wishlist&&screen==='Wishlist'){
   // La fila entera abre la misma función de edición que el nombre.
   wishlist.querySelectorAll('.v518-line-item').forEach(row=>{
    if(row.dataset.oihaneEditRow)return;
    row.dataset.oihaneEditRow='1';
    const name=row.querySelector('.v518-item-name');
    if(!name)return;
    row.addEventListener('click',event=>{
     if(event.target.closest('button,a,input,select,textarea'))return;
     name.click();
    });
   });
  }
  for(const el of document.querySelectorAll('#v519GenericEditor,.v519-modal-wrap,.v521-modal-wrap,.oihane-530-location')){
   // Estas ventanas ya están desacopladas del módulo y mantienen su scroll propio.
   el.style.overscrollBehavior='contain';
  }
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;inspect();});}
 // Capturar la pulsación antes de que el módulo se redibuje.
 document.addEventListener('click',schedule,true);
 document.addEventListener('submit',schedule,true);
 document.addEventListener('change',schedule,true);
 window.addEventListener('popstate',schedule);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();close(active)}},true);
 // Solo vigilar la zona principal y los cambios de clase, no los valores de campos.
 if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
 schedule();
})();
