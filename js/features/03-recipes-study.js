





/* --- funcionalidad-03 --- */

/* Resolución explícita de pantallas: una única ruta para cada módulo especializado.
   Sustituye los tres envoltorios sucesivos de renderExtraModule de 5.20–5.22. */
const OihaneModuleRenderer=(()=>{
  const defaultRenderer=window.renderExtraModule;
  const specialized=new Map();
  function render(name,seed=''){
    const implementation=specialized.get(name);
    return implementation ? implementation.call(this,name,seed) : defaultRenderer.apply(this,arguments);
  }
  return {
    render,
    use(name,fn){
      if(specialized.has(name)) throw new Error('Pantalla duplicada: '+name);
      specialized.set(name,fn);
    }
  };
})();
window.renderExtraModule=OihaneModuleRenderer.render;

/* Oihane 5.20 — Recetas y Estudio compactos */
(function(){
 const $=id=>document.getElementById(id);
 const safe=s=>typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 let activeEdit=null;
 const recipePlans=[['Esta semana','Esta semana'],['Quiero aprender','Quiero aprender'],['Habitual','Habituales']];
 const recipeCategories=['Desayunos','Entrantes','Pasta','Arroz','Guisos de cuchara','Verduras','Carne','Pescado','Guarniciones','Al horno','Postres'];
 const recipeCategory=r=>recipeCategories.includes(String(r.category||''))?r.category:'Sin categoría';
 const studyTypes=['Guardia','Curso','Tema'];
 window.oihaneMakeRecipeHabitual=function(id,checked){
  if(!checked)return;
  const a=extraItems('Recetas'),r=a.find(x=>String(x.id)===String(id));
  if(!r)return;
  r.status='Habitual';r.kind='Habitual';
  if(saveExtra('Recetas',a))window.renderExtraModule('Recetas');
 };
 function items(n){return extraItems(n)}
 function save(n,a){saveExtra(n,a);window.renderExtraModule(n)}
 function head(n){const h=moduleHeaders[n]||moduleHeaders['Más'];return `<div class="module-header" style="--module-tint:${h.tint}" data-module="${n}"><img class="module-cover" src="${moduleHeaderImage(n)}" data-fallback="${moduleFallbackImage(n)}" alt="" onerror="this.onerror=null;this.src=this.dataset.fallback"><button class="back" onclick="home()" aria-label="Volver al inicio">‹</button><div class="header-title"><div class="header-kicker">${h.kicker}</div><h1>${n}</h1></div></div>`}
 function top(n,collapsed){return `<div class="v520-toolbar"><span></span><div><button type="button" class="v520-icon" id="v520Fold" aria-label="Plegar o desplegar" title="Plegar o desplegar">${collapsed?'⌄':'⌃'}</button><button type="button" class="v520-icon v520-plus" id="v520Add" aria-label="Añadir" title="Añadir">＋</button></div></div>`}
 function formPanel(n,seed=''){
  const isR=n==='Recetas',editing=!!activeEdit;
  const x=editing?items(n).find(i=>String(i.id)===String(activeEdit))||{}:{};
  const photo=x.photo||'';
  const fields=isR?`<label>Nombre</label><input id="v520Title" required value="${safe(x.title||seed)}" placeholder="Ej. Tortilla de patata"><label>Planificación</label><select id="v520Plan">${recipePlans.map(([v,l])=>`<option value="${v}" ${(x.status===v||(!x.status&&x.kind===v)||(!x.status&&!x.kind&&v==='Quiero aprender'))?'selected':''}>${l}</option>`).join('')}</select><label for="v520Category">Categorías</label><select id="v520Category"><option value="" ${!recipeCategories.includes(String(x.category||''))?'selected':''}>Sin categoría</option>${recipeCategories.map(cat=>`<option value="${safe(cat)}" ${x.category===cat?'selected':''}>${safe(cat)}</option>`).join('')}</select><label>Ingredientes</label><textarea id="v520Ingredients" placeholder="Patatas, huevos, aceite…">${safe(x.ingredients||'')}</textarea><label>Pasos de la receta</label><textarea id="v520Steps" placeholder="Describe cómo prepararla…">${safe(x.steps||'')}</textarea><label>Raciones originales</label><input id="v520Servings" type="number" min="1" max="100" value="${safe(x.servings||2)}"><label>Foto</label><input id="v520Photo" type="file" accept="image/*"><div class="v520-photo-preview">${photo?`<img src="${safe(photo)}" alt="Foto de la receta">`:''}</div><label>Notas</label><textarea id="v520Notes" placeholder="Trucos o variaciones…">${safe(x.notes||'')}</textarea>`:
  `<label>Nombre</label><input id="v520Title" required value="${safe(x.title||seed)}" placeholder="Ej. Curso de ecografía"><label>Tipo</label><select id="v520Type">${studyTypes.map(v=>`<option ${((x.kind||x.status||'Tema')===v)?'selected':''}>${v}</option>`).join('')}</select><label>Fecha</label><input id="v520Date" type="date" value="${safe(x.date||'')}"><label>Hora</label><input id="v520Time" type="time" value="${safe(x.time||'')}"><label>Modalidad</label><select id="v520Mode"><option value="Presencial" ${(!x.mode||x.mode==='Presencial')?'selected':''}>Presencial</option><option value="Online" ${x.mode==='Online'?'selected':''}>Online</option></select><label>Ubicación</label><input id="v520Location" value="${safe(x.location||x.place||'')}" placeholder="Centro, ciudad o enlace de acceso"><label>Duración (minutos)</label><input id="v520Duration" type="number" min="1" value="${safe(x.duration||60)}"><label>Fecha fin (opcional)</label><input id="v520EndDate" type="date" value="${safe(x.endDate||'')}">${oihaneReminderFields('v532Study',x)}<label>Notas</label><textarea id="v520Notes" placeholder="Contenido, apuntes…">${safe(x.notes||'')}</textarea>`;
  return `<section class="panel v520-form-panel ${activeEdit||seed?'':'hidden'}" id="v520Panel"><form id="v520Form" class="v520-form">${fields}<div class="v520-actions"><button class="primary" type="submit">${editing?'Guardar cambios':'Guardar'}</button><button type="button" class="small-action" id="v520Cancel">Cerrar</button></div></form></section>`;
 }
 function recipeMarkup(seed=''){
  const a=items('Recetas');let migrated=false;a.forEach(r=>{let v=r.status||r.kind||'Quiero aprender';if(v==='Quiero probar')v='Quiero aprender';if(v==='Cocinada')v='Habitual';if(!['Esta semana','Quiero aprender','Habitual'].includes(v))v='Quiero aprender';if(r.status!==v||r.kind!==v){r.status=v;r.kind=v;migrated=true}});if(migrated)saveExtra('Recetas',a);const collapsed=localStorage.getItem('oihane_Recetas_collapsed')==='1';
   const group=(status,label)=>{const list=a.filter(x=>(x.status||x.kind||'Quiero aprender')===status);const sorted=status==='Habitual'?[...list].sort((a,b)=>{const rank=r=>{const name=recipeCategory(r);return name==='Sin categoría'?recipeCategories.length:recipeCategories.indexOf(name)};return rank(a)-rank(b)||String(a.title||'').localeCompare(String(b.title||''),'es')}):list;let lastCat=null;return `<section class="v520-section ${status==='Habitual'?'oihane-habitual-section':'oihane-plan-section'}" data-recipe-plan="${status}"><h2>${label}</h2>${list.length?sorted.map(r=>{
     const cat=recipeCategory(r),prefix=status==='Habitual'&&lastCat!==cat?`<h3 class="oihane-recipe-category category-heading" data-cat="${safe(cat)}">${safe(cat)}</h3>`:'';if(status==='Habitual')lastCat=cat;
     const id=JSON.stringify(r.id),hasDetail=!!(r.ingredients||r.steps||r.notes||r.photo);
     if(status!=='Habitual')return `<div class="v520-row v520-week-row"><button type="button" class="v520-name" data-v520-title="${safe(r.id)}">${safe(r.title)}</button>${window.oihaneShareBadge?.(r)||''}<input type="checkbox" class="oihane-recipe-to-habitual" aria-label="Mover ${safe(r.title)} a Recetas habituales" title="Pasar a habituales" onchange="oihaneMakeRecipeHabitual(${id},this.checked)"></div>`;
     const ingredients=recipeIngredientsForDisplay(r).map(x=>safe(x.display)).join('<br>');
     return `${prefix}<div class="v520-row v534-recipe-habitual"><div class="v534-recipe-line"><button class="v520-name" data-v520-title="${safe(r.id)}">${safe(r.title)}</button><div class="v520-actions-row"><button class="small-action" onclick="recipeToShopping(${id})">Ingredientes a compras</button><button class="small-action" type="button" onclick="toggleRecipeDetails(${id})">Ver</button><button class="delete" aria-label="Eliminar ${safe(r.title)}" onclick="v520Delete('Recetas',${id})">×</button></div></div><div class="v520-details-content hidden" id="recipeDetails-${safe(r.id)}">${r.photo?`<img class="v520-recipe-photo" src="${safe(r.photo)}" alt="${safe(r.title)}" loading="lazy">`:''}<span class="v530-recipe-heading">Ingredientes:</span><div class="v530-ingredients">${ingredients||'Sin ingredientes'}</div><span class="v530-recipe-heading">Pasos:</span><div class="v530-ingredients">${safe(r.steps||'Sin pasos').replace(/\n/g,'<br>')}</div>${r.notes?`<p>${safe(r.notes).replace(/\n/g,'<br>')}</p>`:''}<p class="v520-meta">Raciones: ${safe(r.currentServings||r.servings||2)} (original: ${safe(r.servings||2)})</p><button class="small-action v530-serving-button" type="button" onclick="adjustRecipeServings(${id})">Ajustar raciones</button></div></div>`;
   }).join(''):'<div class="v520-empty">Todavía no hay recetas aquí.</div>'}</section>`};
  return `${head('Recetas')}${top('Recetas',collapsed)}${formPanel('Recetas',seed)}<div class="v520-body ${collapsed?'hidden':''}" id="v520Body">${group('Esta semana','Esta semana')}${group('Quiero aprender','Quiero aprender')}${group('Habitual','Habituales')}</div>`;
 }
 function studyMarkup(seed=''){
  const a=items('Estudio');let migrated=false;a.forEach(x=>{const v=(x.kind==='Guardia'||x.status==='Guardia')?'Guardia':(x.kind==='Curso'||x.status==='Curso')?'Curso':'Tema';if(x.kind!==v||x.status!==v){x.kind=v;x.status=v;migrated=true}});if(migrated)saveExtra('Estudio',a);const collapsed=localStorage.getItem('oihane_Estudio_collapsed')==='1';
  const guards=a.filter(x=>(x.kind==='Guardia'||x.status==='Guardia')).sort((x,y)=>((x.date||'9999')+(x.time||'')).localeCompare((y.date||'9999')+(y.time||'')));
   const courses=a.filter(x=>(x.kind==='Curso'||x.status==='Curso')).sort((x,y)=>((x.date||'9999')+(x.time||'')).localeCompare((y.date||'9999')+(y.time||'')));
  const themes=a.filter(x=>!['Curso','Guardia'].includes(x.kind)&&!['Curso','Guardia'].includes(x.status));
  const guardRows=guards.length?guards.map(c=>`<div class="v520-course-row oihane-study-compact"><button class="v520-course-main" data-v520-title="${safe(c.id)}"><strong>${safe(c.title)}</strong><span class="oihane-study-inline">${[c.date?fmt(c.date):'',c.time||'',c.location||''].filter(Boolean).map(safe).join(' · ')}</span></button><button class="delete" aria-label="Eliminar ${safe(c.title)}" onclick="v520Delete('Estudio',${JSON.stringify(c.id)})">×</button></div>`).join(''):'<div class="v520-empty">No hay guardias programadas.</div>';
   const courseRows=courses.length?courses.map(c=>`<div class="v520-course-row oihane-study-compact"><button class="v520-course-main" data-v520-title="${safe(c.id)}"><strong>${safe(c.title)}</strong><span class="oihane-study-inline">${[c.date?fmt(c.date):'',c.time||'',c.mode||'Presencial',c.location||''].filter(Boolean).map(safe).join(' · ')}</span></button><button class="delete" aria-label="Eliminar ${safe(c.title)}" onclick="v520Delete('Estudio',${JSON.stringify(c.id)})">×</button></div>`).join(''):'<div class="v520-empty">Todavía no hay cursos programados.</div>';
  return `${head('Estudio')}${top('Estudio',collapsed)}${formPanel('Estudio',seed)}<div class="v520-body ${collapsed?'hidden':''}" id="v520Body"><section class="v520-section"><h2>Guardias</h2>${guardRows}</section><section class="v520-section"><h2>Cursos</h2>${courseRows}</section><section class="v520-section"><h2>Temas</h2>${themes.length?themes.map(t=>`<div class="v520-row v520-theme-row"><button class="v520-name oihane-study-theme-inline" data-v520-title="${safe(t.id)}">${safe(t.title)}<span class="oihane-study-inline">${[t.date||"",t.time||"",t.location||""].filter(Boolean).map(safe).join(" · ")}</span></button><button class="delete" aria-label="Eliminar ${safe(t.title)}" onclick="v520Delete('Estudio',${JSON.stringify(t.id)})">×</button></div>`).join(''):'<div class="v520-empty">Todavía no hay temas guardados.</div>'}</section></div>`;
 }
 function bind(n,seed=''){
  const panel=$('v520Panel'),form=$('v520Form');$('v520Add').onclick=()=>{if(panel&&!panel.classList.contains('hidden')){activeEdit=null;panel.classList.add('hidden');form.reset();return}if(panel){activeEdit=null;form.reset();panel.classList.remove('hidden');$('v520Title')?.focus();panel.scrollIntoView({block:'nearest',behavior:'smooth'})}};
  $('v520Fold').onclick=()=>{const b=$('v520Body');b.classList.toggle('hidden');const is=b.classList.contains('hidden');localStorage.setItem('oihane_'+n+'_collapsed',is?'1':'0');$('v520Fold').textContent=is?'⌄':'⌃'};
  $('v520Cancel').onclick=()=>{activeEdit=null;renderExtraModule(n)};if(n==='Estudio')oihaneBindReminder('v532Study');
  form.onsubmit=async e=>{e.preventDefault();const all=items(n),id=activeEdit;let obj;
   if(n==='Recetas'){let photo=$('v520Photo').dataset.photo||'';if(!photo&&$('v520Photo').files?.[0]){try{photo=await compressPhoto($('v520Photo').files[0])}catch{alert('No se ha podido procesar la foto.');return}}obj={title:$('v520Title').value.trim(),status:$('v520Plan').value,kind:$('v520Plan').value,category:$('v520Category').value,ingredients:$('v520Ingredients').value.trim(),steps:$('v520Steps').value.trim(),servings:$('v520Servings').value||'2',currentServings:id?(all.find(x=>String(x.id)===String(id))?.currentServings||''):'',photo:photo||(id?all.find(x=>String(x.id)===String(id))?.photo:'')||'',notes:$('v520Notes').value.trim()};
   }else{const kind=$('v520Type').value;const withNotice=$('v532StudyNotify').checked;if(withNotice&&(!$('v520Date').value||!$('v520Time').value)){alert('Para el aviso de Estudio, indica fecha y hora.');return}let lead=0;try{if(withNotice)lead=oihaneReminderLead('v532Study')}catch(error){alert(error.message);return}obj={notify:withNotice,notifyLead:lead,title:$('v520Title').value.trim(),kind,status:kind,date:$('v520Date').value,time:$('v520Time').value,mode:$('v520Mode').value,location:$('v520Location').value.trim(),place:$('v520Location').value.trim(),duration:$('v520Duration').value||'60',endDate:$('v520EndDate').value,notes:$('v520Notes').value.trim()};}
   if(!obj.title)return;if(id){const target=all.find(x=>String(x.id)===String(id));if(target)Object.assign(target,obj)}else all.push({id:Date.now(),...obj,created:today()});if(!saveExtra(n,all))return;
   if(n==='Estudio'){const saved=all.find(x=>String(x.id)===String(id||all[all.length-1].id));if(saved&&saved.kind==='Guardia'&&saved.date&&typeof upsertLinkedEvent==='function')upsertLinkedEvent('Estudio',saved);else if(saved){const linked=events.filter(e=>e.sourceModule==='Estudio'&&String(e.sourceId)===String(saved.id));if(linked.length){events=events.filter(e=>!(e.sourceModule==='Estudio'&&String(e.sourceId)===String(saved.id)));save()}}}
   activeEdit=null;renderExtraModule(n);
  };
  if(n==='Recetas')$('v520Photo').onchange=async()=>{const f=$('v520Photo').files?.[0];if(!f)return;try{$('v520Photo').dataset.photo=await compressPhoto(f);$('v520Photo').nextElementSibling.innerHTML=`<img src="${$('v520Photo').dataset.photo}" alt="Vista previa">`}catch{alert('No se ha podido cargar la foto.')}};
 }
 function edit(n,id){const i=items(n).find(x=>String(x.id)===String(id));if(!i)return;activeEdit=i.id;renderExtraModule(n);const panel=$('v520Panel');panel?.scrollIntoView({block:'nearest',behavior:'smooth'});}
 window.v520Delete=function(n,id){if(!confirm('¿Quieres eliminar este elemento?'))return;save(n,items(n).filter(x=>String(x.id)!==String(id)))};
 const prevEdit=window.v519EditGeneric;
 // Keep the pre-5.20 generic editor reachable for modules that don't have a custom editor.
 window.v520EditGeneric=prevEdit;
 window.v519EditGeneric=function(n,id){if(n==='Recetas'||n==='Estudio'){edit(n,id);return}if(typeof window.v520EditGeneric==='function')window.v520EditGeneric(n,id)};
 const renderRecipeOrStudy=(n,seed='')=>{screen=n;extraCurrent=n;document.querySelector('#app').innerHTML=n==='Recetas'?recipeMarkup(seed):studyMarkup(seed);bind(n,seed)};
 OihaneModuleRenderer.use('Recetas',renderRecipeOrStudy);
 OihaneModuleRenderer.use('Estudio',renderRecipeOrStudy);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-v520-title]');if(!b)return;const n=screen;if(n!=='Recetas'&&n!=='Estudio')return;edit(n,b.getAttribute('data-v520-title'))});
 
})();