/* Oihane 5.59.14 | Guardias de Estudio y selección de Cultura. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const clean=s=>String(s||'').trim();
const hour=s=>{const m=String(s||'08:00').match(/^(\d{1,2}):(\d{2})$/);return m?Number(m[1])*60+Number(m[2]):480};
const toDuration=(start,end)=>{let d=hour(end)-hour(start);if(d<=0)d+=1440;return String(d)};
let guardPending=null;
const oldSaveExtra=window.saveExtra;
if(typeof oldSaveExtra==='function')window.saveExtra=function(name,items){
 if(name==='Estudio'&&guardPending&&Array.isArray(items)){
  const found=[...items].reverse().find(x=>x?.kind==='Guardia'&&x.title===guardPending.title&&x.date===guardPending.date);
  if(found){found.guardType=guardPending.kind;found.startTime=guardPending.start;found.endTime=guardPending.end;found.location=guardPending.place;found.place=guardPending.place;found.duration=guardPending.duration;}
  guardPending=null;
 }
 return oldSaveExtra.apply(this,arguments);
};
function enhanceGuard(){
 if(typeof screen==='undefined'||screen!=='Estudio')return;
 const form=$('v520Form'),select=$('v520Type');if(!form||!select)return;
 let block=$('oihaneGuardFields');
 if(!block){
  block=document.createElement('div');block.id='oihaneGuardFields';block.className='oihane-guard-extra';
  block.innerHTML='<div class="field"><label for="oihaneGuardKind">Tipo de guardia</label><select id="oihaneGuardKind"><option value="Urgencias">Urgencias</option><option value="Planta">Planta</option></select></div>'+
   '<div class="field"><label for="oihaneGuardSite">Ubicación</label><select id="oihaneGuardSite"><option value="Santiago">Santiago</option><option value="Txagorritxu">Txagorritxu</option></select></div>'+
   '<div class="field"><label for="oihaneGuardStart">Hora de inicio</label><select id="oihaneGuardStart"><option value="08:00">8:00</option><option value="09:00">9:00</option><option value="15:00">15:00</option></select></div>'+
   '<div class="field"><label for="oihaneGuardEnd">Hora de fin</label><select id="oihaneGuardEnd"><option value="08:00">8:00</option><option value="09:00">9:00</option></select></div>';
  select.closest('.field')?.after(block);
  form.addEventListener('submit',()=>{
   if(select.value!=='Guardia')return;
   const type=$('oihaneGuardKind').value,start=$('oihaneGuardStart').value,end=$('oihaneGuardEnd').value;
   const location=$('oihaneGuardSite').value,duration=toDuration(start,end),date=$('v520Date').value;
   $('v520Title').value='Guardia '+type;
   $('v520Time').value=start;
   $('v520Location').value=location;
   $('v520Duration').value=duration;
   guardPending={title:'Guardia '+type,kind:type,start,end,place:location,date,duration};
  },true);
 }
 const isGuard=select.value==='Guardia',firstTime=!form.dataset.guardEnhanced;
 block.hidden=!isGuard;
 if(isGuard){
  const title=$('v520Title');
  if(firstTime&&title){
   const m=title.value.match(/guardia\s+(urgencias|planta)/i);
   if(m)$('oihaneGuardKind').value=m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();
   title.value='Guardia '+$('oihaneGuardKind').value;
  }
  const loc=firstTime?clean($('v520Location')?.value):'';
  if(/santiago/i.test(loc))$('oihaneGuardSite').value='Santiago';
  else if(/txagorritxu/i.test(loc))$('oihaneGuardSite').value='Txagorritxu';
  const time=firstTime?clean($('v520Time')?.value):'';
  if(['08:00','09:00','15:00'].includes(time))$('oihaneGuardStart').value=time;
  if(firstTime)$('oihaneGuardEnd').value='08:00';
  for(const id of ['v520Title','v520Time','v520Location','v520Duration','v520EndDate','v520Mode']){
   const element=$(id);const associated=element?.previousElementSibling?.tagName==='LABEL'?element.previousElementSibling:null;
   if(element)element.hidden=true;
   if(associated)associated.hidden=true;
  }
 }else{
  for(const id of ['v520Title','v520Time','v520Location','v520Duration','v520EndDate','v520Mode']){
   const element=$(id);const associated=element?.previousElementSibling?.tagName==='LABEL'?element.previousElementSibling:null;
   if(element)element.hidden=false;
   if(associated)associated.hidden=false;
  }
 }
 if(!select.dataset.guardToggle){select.dataset.guardToggle='1';select.addEventListener('change',enhanceGuard)}
 form.dataset.guardEnhanced='1';
}
// No se envía a Google información privada ni se presume que Google puede devolver su selección.
// Si un catálogo devuelve resultados, Oihane debe mostrar sus botones de selección internos.
function cultureHelp(){
 const results=$('v546CultureResults'),status=$('v521SearchStatus');
 if(!results||!status)return;
 if(!status.querySelector('a.v521-fallback-link')||$('oihaneCultureLinkHelp'))return;
 const p=document.createElement('span');p.id='oihaneCultureLinkHelp';
 p.textContent=' Si eliges una ficha en una web externa, vuelve a Oihane y pega aquí su enlace; después pulsa Guardar.';
 status.append(p);
 const paste=document.createElement('button');paste.type='button';paste.textContent='Pegar enlace elegido';paste.className='small-action';
 paste.onclick=async()=>{
  const inp=$('v521Link');if(!inp)return;
  try{
   const value=await navigator.clipboard.readText();
   if(/^https?:\/\//i.test(value))inp.value=value.trim();else inp.focus();
  }catch{inp.focus()}
 };
 status.append(' ',paste);
}
let scheduled=false;
function check(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhanceGuard();cultureHelp()})}
document.addEventListener('change',check,true);document.addEventListener('click',check,true);
const app=document.getElementById('app');if(app)new MutationObserver(check).observe(app,{childList:true,subtree:true});
new MutationObserver(check).observe(document.body,{childList:true});
check();
})();
