/* Oihane 5.59.19 — Gestor UNICO de formularios.
 * Reemplaza por completo el antiguo sistema de paneles a pantalla completa.
 * Mantiene intactos eventos, validación, identificadores y persistencia de cada módulo.
 */
(function(){
'use strict';
if(window.OihaneForms?.version==='5.59.24')return;

const INLINE=['#addPanel','#v518FormPanel','#v519Panel','#v520Panel','[data-oihane-setting="sync"].oihane-settings-open'];
const FLOATING=[
 '.v521-modal-wrap','.v519-modal-wrap','#v519GenericEditor',
 '.oihane-530-location','.oihane-534-category-modal','.oihane-shop-modal',
 '.oihane-536-order-curtain','.oihane-530-auth','#oihaneDatesModal'
];
const SELECTOR=[...INLINE,...FLOATING].join(',');
const DATA=Object.freeze({version:'5.59.24'});
let active=null,scheduled=false,quickButton=null,backdrop=null;

const $=(selector,root=document)=>root.querySelector(selector);
const text=el=>String(el?.textContent||'').replace(/\s+/g,' ').trim();
const cap=s=>String(s||'').replace(/\s*\((?:opcional|obligatorio)\)/gi,'')
 .replace(/\s*\*+\s*$/,'').replace(/[\s:]+$/,'').trim();
const visible=el=>!!(el&&el.isConnected&&!el.hidden&&!el.classList.contains('hidden')&&
 window.getComputedStyle(el).display!=='none');

function ensureBackdrop(root){
 if(!backdrop){
  backdrop=document.createElement('div');
  backdrop.className='oihane-dialog-backdrop';
  backdrop.setAttribute('aria-hidden','true');
  backdrop.addEventListener('click',()=>{if(active)close(active)});
 }
 // Los paneles incrustados en #app comparten contexto de apilamiento.
 // Un fondo colgado de body quedaba DELANTE del formulario en iOS.
 const parent=root?.parentNode||document.body;
 if(backdrop.parentNode!==parent||backdrop.nextSibling!==root)
  parent.insertBefore(backdrop,root);
 return backdrop;
}
function inferName(el){
 if(el.closest('.oihane-530-auth'))return'Iniciar sesión';
 if(el.closest('.oihane-536-order-curtain'))return'Pedido';
 if(el.matches?.('[data-oihane-setting="sync"]'))return'Configurar sincronización';
 if(el.id==='productForm'||el.closest('.oihane-530-location'))return'Editar elemento';
 if(el.closest('#oihaneWorkEditor'))return'Trabajo';
 const h=el.querySelector('h2,h3,.section-head h2');
 const t=text(h);
 if(t&&t.length<65)return t;
 const module=typeof screen==='string'?screen:'Elemento';
 return module||'Elemento';
}
function findForm(el){return el.matches('form')?el:el.querySelector('form')}
function chooseCard(root){
 if(root.id==='oihaneWorkEditor')return root.querySelector(':scope > .panel')||root;
 if(root.matches('#addPanel,#v518FormPanel,#v519Panel,#v520Panel,#productForm,[data-oihane-setting="sync"]'))return root;
 return root.querySelector(':scope > form,:scope > .v521-modal,:scope > .v519-modal,:scope > .oihane-536-order-form,:scope > .login,:scope > div, :scope > section') || root;
}
function classify(root){
 const form=findForm(root);
 if(!form && !root.querySelector('.primary,button[data-save],button[id$=Save]'))return null;
 const card=chooseCard(root);
 if(!card)return null;
 return {root,card,form,title:inferName(root),start:document.activeElement};
}
function findSave(form,card){
 if(form){
  const explicit=form.querySelector('button[type=submit],input[type=submit]');
  if(explicit)return explicit;
  const buttons=Array.from(form.querySelectorAll('button')).filter(b=>b.type==='submit');
  return buttons.find(b=>/guardar|añadir|iniciar sesi[oó]n|actualizar|registrar|aceptar/i.test(text(b)))||buttons.at(-1)||null;
 }
 return card.querySelector('[id$=Save],button[data-save],button.primary')||null;
}
function findCancel(form,card){
 const buttons=[...card.querySelectorAll('button')].filter(b=>!b.closest('.oihane-dialog-header'));
 return buttons.find(b=>b.matches('[data-cancel],[id$="Cancel"],[id$="Close"],#v520Cancel,[id$="Cerrar"]')) ||
  buttons.find(b=>/^(cerrar|cancelar|volver|entrar sin sincronizar)(\s*[×x])?$/i.test(text(b)))||null;
}
function hideOriginalActions(card,form,submit,cancel){
 for(const button of [submit,cancel]){
  if(button&&!button.closest('.oihane-dialog-header')){
   button.classList.add('oihane-dialog-original-action');
   button.setAttribute('data-oihane-was-action','1');
  }
 }
 // Las barras de acción antiguas no deben ocupar espacio ni duplicar botones.
 for(const button of card.querySelectorAll('button,input[type=submit]')){
  if(button.closest('.oihane-dialog-header'))continue;
  if(button.matches('button[type=submit],input[type=submit]')||
     /^(cerrar|cancelar)(\s*[×x])?$/i.test(text(button))||
     button.matches('[id$="Cancel"],[id$="Close"],[data-cancel]')){
    button.classList.add('oihane-dialog-original-action');
  }
 }
 // Las barras antiguas sin contenido visible crean un recuadro vacio.
 for(const selector of ['.v519-form-actions','.v520-actions','.v521-actions','.oihane-536-order-actions','.oihane-shop-actions']){
  for(const group of card.querySelectorAll(selector)){
   if([...group.querySelectorAll('button,input[type=submit]')].every(button=>button.classList.contains('oihane-dialog-original-action')))
    group.classList.add('oihane-dialog-legacy-actions');
  }
 }
 for(const el of card.querySelectorAll('.oihane-form-actions-top')){
  if(!el.classList.contains('oihane-dialog-header'))el.classList.add('oihane-dialog-legacy-actions');
 }
}
function invokeSave(entry){
 const {form,card}=entry;
 const original=findSave(form,card);
 if(!original)return;
 if(form){
  if(form.requestSubmit&&original.matches('button[type="submit"],input[type="submit"],button:not([type])')){
   try{form.requestSubmit(original);return}catch(_){}
  }
  if(form.requestSubmit){try{form.requestSubmit();return}catch(_){}}
 }
 original.click();
}
function restoreLegacyClose(entry){
 const {root,form,card}=entry;
 const original=findCancel(form,card);
 if(original){
  try{original.click()}catch(e){console.warn('No se pudo cerrar el formulario con su acción original',e)}
  if(!root.isConnected||root.classList.contains('hidden'))return;
 }
 if(root.matches('[data-oihane-setting="sync"]')){
  root.classList.remove('oihane-settings-open');
 }else if(root.id==='v518FormPanel'&&typeof window.v518ToggleForm==='function'){
  if(!root.classList.contains('hidden'))window.v518ToggleForm(typeof screen==='string'?screen:'');
 }else if(root.id==='v519Panel'&&typeof window.v519CloseForm==='function'){
  window.v519CloseForm();
 }else if(root.id==='addPanel'&&typeof window.toggleAddForm==='function'){
  if(!root.classList.contains('hidden'))window.toggleAddForm();
 }else if(root.id==='v520Panel'){
  root.classList.add('hidden');
 }else if(root.id==='oihaneWorkEditor'){
  const cancel=root.querySelector('.oihane-work-form-panel button[type="button"]');
  if(cancel)cancel.click();
 }else if(root.closest('body')&&!INLINE.some(s=>root.matches(s))){
  root.remove();
 }else root.classList.add('hidden');
}
function close(entry){
 if(!entry)return;
 // Guardar no se ejecuta al cerrar: deja el formulario y los datos intactos.
 restoreLegacyClose(entry);
 if(entry.root?.isConnected){
  entry.root.classList.remove('oihane-dialog-root','oihane-quick-open');
  entry.card?.classList.remove('oihane-dialog-card');
 }
 if(active===entry)active=null;
 document.documentElement.classList.remove('oihane-dialog-open');
 document.body.classList.remove('oihane-dialog-open');
 if(backdrop)backdrop.hidden=true;
 try{entry.opener?.focus?.({preventScroll:true})}catch(_){}
 schedule();
}
function headerFor(entry){
 const {card,form,title}=entry;
 let header=$(':scope > .oihane-dialog-header',card);
 if(!header){
  header=document.createElement('header');header.className='oihane-dialog-header';
  const titleBox=document.createElement('div');titleBox.className='oihane-dialog-identity';
  titleBox.innerHTML='<span class="oihane-dialog-ornament" aria-hidden="true"></span>';
  const caption=document.createElement('strong');caption.className='oihane-dialog-title';
  caption.textContent=title;titleBox.append(caption);
  const actions=document.createElement('div');actions.className='oihane-dialog-actions';
  const closer=document.createElement('button');closer.type='button';
  closer.className='oihane-dialog-close';closer.textContent='Cerrar';
  closer.setAttribute('aria-label','Cerrar formulario sin guardar');
  closer.onclick=()=>close(entry);actions.append(closer);
  const saving=findSave(form,card);
  if(saving){
   const save=document.createElement('button');save.type='button';save.className='oihane-dialog-save';
   save.textContent='Guardar';
   save.setAttribute('aria-label','Guardar formulario');
   save.onclick=()=>invokeSave(entry);
   actions.append(save);
  }
  header.append(titleBox,actions);card.prepend(header);
  hideOriginalActions(card,form,saving,findCancel(form,card));
 }else{
  const label=$('.oihane-dialog-title',header);if(label)label.textContent=title;
 }
 const legacyTitle=[...card.querySelectorAll('h2,h3')].find(el=>!el.closest('.oihane-dialog-header')&&el.textContent.trim()===title);
 if(legacyTitle)legacyTitle.classList.add('oihane-dialog-legacy-title');
 entry.header=header;
}
function cleanLabel(s){
 return cap(String(s||'').replace(/[\n\r]/g,' ').replace(/\s+/g,' '))
  .replace(/\bEjemplo\b.*$/i,'').slice(0,88);
}
function labelOf(control){
 const wrap=control.closest('label');
 if(wrap && !wrap.querySelector('input[type=checkbox],input[type=radio]')){
  const clone=wrap.cloneNode(true);
  clone.querySelectorAll('input,select,textarea,button,small,svg,span.oihane-field-inset').forEach(e=>e.remove());
  const label=cleanLabel(text(clone));
  if(label)return {label,el:wrap,embedded:true};
 }
 const prev=control.previousElementSibling;
 let label=(prev?.tagName==='LABEL'&&!prev.querySelector('input,select,textarea'))?prev:null;
 if(!label){
  const holder=control.closest('.field,.v521-field,.v521-subform,.oihane-work-field');
  if(holder){
   const labels=[...holder.querySelectorAll('label')];
   label=labels.find(l=>!l.querySelector('input,select,textarea')&&
    (l.control===control||l.getAttribute('for')===control.id||holder.querySelectorAll('input:not([type=hidden]),textarea,select').length===1))||null;
  }
 }
 if(label)return {label:cleanLabel(text(label)),el:label,embedded:false};
 const name=control.getAttribute('aria-label')||control.dataset.oihaneFieldName||control.getAttribute('placeholder')||
  control.getAttribute('name')||control.id||'';
 return {label:cleanLabel(name.replace(/^(v\d+|oihane)/i,'')),el:null,embedded:false};
}
function groupLabelAndControl(control,info){
 const label=info.el;
 if(!label||info.embedded)return;
 const parent=label.parentElement;
 if(!parent||parent!==control.parentElement)return;
 if(parent.matches('.field,.v521-field,.oihane-control-group'))return;
 // Los creadores de Estudio/Recetas y Trabajo generan <label> e <input> consecutivos.
 // Agruparlos evita posiciones sueltas sin alterar sus IDs ni manejadores.
 let sibling=label.nextElementSibling;
 if(sibling!==control)return;
 const box=document.createElement('div');box.className='oihane-control-group';
 label.before(box);box.append(label,control);
}
function enhanceField(control){
 if(control.dataset.oihaneFormV2)return;
 if(control.matches('input[type=hidden],input[type=checkbox],input[type=radio],input[type=submit],input[type=button]'))return;
 const info=labelOf(control);
 if(!info.label)return;
 groupLabelAndControl(control,info);
 control.dataset.oihaneFormV2='1';
 control.setAttribute('aria-label',info.label);
 const type=control.type||'';
 const native=control.tagName==='SELECT'||['date','time','datetime-local','month','week','file','color'].includes(type);
 if(!native){
  control.setAttribute('placeholder',info.label);
  if(info.el&&!info.embedded)info.el.classList.add('oihane-label-for-placeholder');
 }else{
  if(info.el){
   info.el.classList.add(info.embedded?'oihane-label-embedded':'oihane-label-inset');
   info.el.setAttribute('data-oihane-label',info.label);
  }else{
   const parent=control.parentElement;
   if(parent&&parent.children.length<4){
    const caption=document.createElement('small');caption.className='oihane-field-inset';
    caption.textContent=info.label;control.before(caption);
   }
  }
  control.classList.add('oihane-inset-control');
 }
 const holder=control.closest('.field,.v521-field,.oihane-control-group')||control.parentElement;
 holder?.classList.add('oihane-field-unit');
 if(info.embedded)info.el?.classList.add('oihane-embedded-unit');
}
function enhanceAllFields(entry){
 const card=entry.card;
 const controls=[...card.querySelectorAll('input,textarea,select')];
 // Los campos se normalizan una sola vez en form-refactor-55921.js.
 // Evita capas de etiquetas y recuadros crema anidados.
 for(const label of card.querySelectorAll('label')){
  if(label.querySelector('input[type=checkbox],input[type=radio]')){
   label.classList.add('oihane-check-row');
   continue;
  }
  if(label.classList.contains('oihane-label-inset')||
     label.classList.contains('oihane-label-embedded')||
     label.classList.contains('oihane-label-for-placeholder'))continue;
  // Los dias de la semana, duraciones y grupos de casillas tambien tienen
  // su enunciado DENTRO del marco en lugar de una etiqueta exterior.
  const next=label.nextElementSibling;
  if(next?.matches('.subtabs,.oihane-duration-grid,.v522-repeat-fields,.oihane-guard-extra,.oihane-532-custom')){
   const wrapper=label.closest('.field,.v521-field,.oihane-control-group')||label.parentElement;
   if(wrapper){
    wrapper.classList.add('oihane-grouped-controls');
    label.classList.add('oihane-grouped-caption');
   }
  }
 }
 // Preservar las correcciones de campos que el usuario ya había eliminado.
 if(typeof screen==='string'&&screen==='Regalos')
  for(const id of ['v518Occasion','v518Date','extraOccasion','extraOccasionDate']){
   const input=$('#'+id,card);
   if(input)(input.closest('.field,.oihane-control-group')||input).hidden=true;
  }
 if(typeof screen==='string'&&screen==='Hogar'){
  const field=$('#v519StatusField',card);if(field)field.hidden=true;
 }
}
function open(entry){
 if(active?.root===entry.root){enhanceAllFields(active);return}
 if(active && active.root!==entry.root){
  active.root.classList.remove('oihane-dialog-root');
  active.card.classList.remove('oihane-dialog-card');
 }
 entry.opener=document.activeElement;
 active=entry;
 ensureBackdrop(entry.root).hidden=false;
 entry.root.classList.add('oihane-dialog-root');
 entry.card.classList.add('oihane-dialog-card');
 document.documentElement.classList.add('oihane-dialog-open');
 document.body.classList.add('oihane-dialog-open');
 headerFor(entry);
 enhanceAllFields(entry);
 if(!entry.card.hasAttribute('role'))entry.card.setAttribute('role','dialog');
 entry.card.setAttribute('aria-modal','true');
 const heading=$('.oihane-dialog-title',entry.header);
 if(heading){
  if(!heading.id)heading.id='oihane-form-dialog-heading';
  heading.setAttribute('tabindex','-1');
  entry.card.setAttribute('aria-labelledby',heading.id);
 }
 const scrolling=entry.form||entry.card;
 requestAnimationFrame(()=>{
  if(active?.root!==entry.root)return;
  // El foco inicial queda en el titulo y no abre el teclado o desplaza al primer campo.
  const focused=document.activeElement;
  if(focused&&entry.card.contains(focused)&&focused.matches('input,select,textarea'))focused.blur();
  scrolling.scrollTop=0;
  entry.card.scrollTop=0;
  try{heading?.focus({preventScroll:true})}catch(_){}
 });
}
function findOpen(){
 const roots=[...document.querySelectorAll(SELECTOR)].filter(node=>visible(node));
 const work=$('#oihaneWorkEditor');
 if(work && work.querySelector('form') && visible(work))roots.push(work);
 const settings=$('[data-oihane-setting="sync"].oihane-settings-open');
 if(settings&&visible(settings))roots.push(settings);
 return roots.reverse().find(node=>classify(node))||null;
}
function adaptSettingsForms(){
 const card=$('#app [data-oihane-setting="sync"]');
 if(!card||card.dataset.oihaneSettingsPrepared==='1')return;
 card.dataset.oihaneSettingsPrepared='1';
 const btn=document.createElement('button');
 btn.type='button';btn.className='oihane-quick-launch oihane-settings-launch';
 btn.textContent='Editar la configuración de sincronización';
 btn.onclick=()=>{card.classList.add('oihane-settings-open');schedule()};
 card.before(btn);
 card.classList.add('oihane-settings-resting');
}

function reconcile(){
 // No cambiar el micrófono ni sus permisos al abrir cualquier módulo.
 document.getElementById('oihaneMicPermission')?.remove();
 adaptSettingsForms();
 const root=findOpen();
 if(root){
  if(active?.root!==root)open(classify(root));
  else enhanceAllFields(active);
 }else if(active){
  active.root?.classList.remove('oihane-dialog-root');
  active.card?.classList.remove('oihane-dialog-card');
  active=null;
  document.documentElement.classList.remove('oihane-dialog-open');
  document.body.classList.remove('oihane-dialog-open');
  if(backdrop)backdrop.hidden=true;
 }
 // La fila de Wishlist también abre edición al pulsar en un espacio libre.
 if(typeof screen==='string'&&screen==='Wishlist'){
  // Las filas de Wishlist se preparan en enrichWishRows().
 }
}
function enrichWishRows(){
 if(typeof screen!=='string'||screen!=='Wishlist')return;
 for(const row of document.querySelectorAll('#v518Body .v518-line-item')){
  if(row.dataset.oihaneRowEditor==='1')continue;
  row.dataset.oihaneRowEditor='1';
  const button=row.querySelector('.v518-item-name');
  if(!button)continue;
  row.addEventListener('click',event=>{
   if(event.target.closest('button,input,select,textarea,a'))return;
   button.click();
  });
 }
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;reconcile();enrichWishRows()});
}
window.OihaneForms=Object.freeze({
 ...DATA,
 open:selector=>{const el=typeof selector==='string'?$(selector):selector;if(el)open(classify(el))},
 close:()=>active&&close(active),
 refresh:schedule,
 selectors:()=>[...INLINE,...FLOATING]
});
document.addEventListener('click',schedule,true);
document.addEventListener('change',schedule,true);
document.addEventListener('submit',schedule,true);
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&active){event.preventDefault();close(active)}
},true);
window.addEventListener('popstate',schedule);
const watcher=new MutationObserver(records=>{
 if(records.some(r=>r.type==='childList'||r.attributeName==='class'||r.attributeName==='hidden'))schedule();
});
watcher.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
schedule();
})();