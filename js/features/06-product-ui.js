



/* --- funcionalidad-06 --- */

(function(){window.toggleRecipeDetails=function(id){const el=document.getElementById('recipeDetails-'+String(id));if(el)el.classList.toggle('hidden')};})();



/* --- oihane-525-patch --- */

(function(){
 const $=s=>document.querySelector(s);
 // Category labels get semantic classes for the colour palette, including older list renderers.
 function colourCategoryHeadings(root=document){root.querySelectorAll('.category-heading').forEach(el=>{const t=(el.textContent||'').trim();el.dataset.cat=t;});}
 // Las categorías de Compras reciben data-cat durante updateGroups().
 // No hay que volver a envolver renderShopping para colorearlas.
 colourCategoryHeadings();
 // Ensure the live classifier splits fish and meat, and keeps existing records categorized without deleting anything.
 // If an artwork URL fails, use another work from the user's favourite artists rather than a stock landscape.
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
 window.classifyProductCategory=function(value){const n=norm(value),has=a=>a.some(x=>n.includes(norm(x)));if(!n)return'Otros';
  if(has(['cerveza','vino','sidra','vermut','whisky','ginebra','vodka','ron','tequila','licor','champan','cava']))return'Bebidas alcohólicas';
  if(has(['congelado','helado','hielo','pizza congelada','croquetas congeladas','patatas congeladas','fruta congelada','verdura congelada']))return'Congelados';
  if(has(['jamon','jamón','chorizo','fuet','salchichon','salchichón','mortadela','pechuga de pavo en lonchas','pavo en lonchas','lomo embuchado','cecina','embutido','longaniza curada']))return'Quesos y embutidos';
  if(has(['salmón','salmon','merluza','bacalao','atún','atun','bonito','sardina','anchoa','boquerón','trucha','lubina','dorada','gamba','langostino','mejillón','almeja','calamar','pulpo','sepia','pescado','marisco','surimi']))return 'Pescado';
 if(has(['pollo','pavo','ternera','cerdo','cordero','conejo','carne picada','filete','entrecot','solomillo','hamburguesa','salchicha fresca','lomo','costilla','morcilla','panceta','bacon','beicon','carne']))return'Carne';
  if(has(['leche','yogur','yogurt','queso','mantequilla','nata','huevo','huevos','kefir','kéfir','cuajada','requeson','requesón','lácteo','lacteo','bebida vegetal']))return'Lácteos y huevos';
  if(has(['lejia','lejía','detergente','suavizante','lavavajillas','limpiacristales','limpiador','fregasuelos','estropajo','bayeta','bolsas de basura','limpieza']))return'Limpieza';
  if(has(['champu','champú','gel de baño','pasta de dientes','cepillo de dientes','desodorante','papel higienico','papel higiénico','compresa','tampon','tampón','pañal','higiene']))return'Higiene';
  if(has(['agua','refresco','coca cola','cocacola','fanta','aquarius','nestea','zumo','jugo','tonica','tónica','bebida energetica','isotonica','café','cafe','té','infusión']))return'Bebidas';
  if(has(['galleta','cereales','granola','muesli','copos de avena','mermelada','tostada desayuno','bizcocho desayuno']))return 'Desayuno';
 if(has(['snack','nachos','palomitas','patatas fritas','frutos secos','pistacho','cacahuete','aceituna','pepinillo','aperitivo']))return 'Picoteo';
 if(has(['pan de molde','barra de pan','baguette','hogaza','mollete','chapata','croissant','cruasán','napolitana','ensaimada','magdalena','bizcocho','bolleria','bollería','picos','colines','tortilla de trigo','tortitas de maiz','arepa','pan']))return'Panadería';
  if(has(['manzana','pera','platano','plátano','banana','naranja','mandarina','limon','limón','uva','fresa','frambuesa','arandano','arándano','mora','kiwi','piña','mango','papaya','melon','melón','sandia','sandía','melocoton','melocotón','nectarina','albaricoque','ciruela','cereza','aguacate','tomate','lechuga','espinaca','acelga','berza','repollo','brocoli','brócoli','coliflor','zanahoria','patata','boniato','cebolla','ajo','puerro','calabacin','calabacín','pepino','pimiento','berenjena','calabaza','champiñon','champiñón','seta','judia verde','judía verde','esparrago','espárrago','alcachofa','apio','rucula','rúcula','canonigos','canónigos','rábano','remolacha','fruta','verdura']))return'Fruta y verdura';
  if(has(['arroz','pasta','macarron','espagueti','fideo','lasana','lasaña','lenteja','garbanzo','alubia','quinoa','cuscus','cuscús','avena','harina','azucar','azúcar','sal','pimienta','especia','aceite','vinagre','mayonesa','ketchup','mostaza','conserva','maiz','maíz','aceituna','pepinillo','frutos secos','almendra','nuez','pistacho','cacahuete','miel','mermelada','cacao','chocolate','galleta','cereales','granola','barrita','levadura','caldo','snack','nachos','palomitas','tofu','wraps','pan rallado','tomate frito','tomate triturado','atun en lata','atún en lata']))return'Despensa';return'Otros'};
 // Reclassify existing shopping records conservatively and persist through existing save routines.
 try{if(typeof products!=='undefined'&&Array.isArray(products)){products.forEach(p=>{if(p&&p.title)p.category=window.classifyProductCategory(p.title)});if(typeof save==='function')save();}}catch(e){}
 // Generic top action bar for all full add/edit forms; preserves existing submit/cancel listeners.
 function prepareForm(form){if(!form||form.dataset.oihaneTopActions==='1')return;
  const isModal=!!form.closest('.v521-modal,.v521-modal-wrap,#v522PlanModal,#v522TaskModal,#v522TripModal,#v521Modal');
  const isEvent=form.id==='eventForm',isExtra=form.id==='extraForm';
  if(!isModal&&!isEvent&&!isExtra)return;
  const submit=form.querySelector('button[type="submit"],button:not([type])');if(!submit)return;
  const oldAction=submit.closest('.v521-actions');const cancel=oldAction?.querySelector('button[type="button"]:not(.delete)')||form.querySelector('button[id$="Cancel"],button[id$="Close"]');
  const top=document.createElement('div');top.className='oihane-form-actions-top';
  if(cancel){cancel.classList.add('oihane-form-close');top.appendChild(cancel)}else if(isModal||isEvent){const close=document.createElement('button');close.type='button';close.className='oihane-form-close';close.textContent='Cerrar ×';close.onclick=()=>{const wrap=form.closest('.v521-modal-wrap,#v522PlanModal,#v522TaskModal,#v522TripModal,#v521Modal');if(wrap)wrap.remove();else if(isEvent){const panel=$('#addPanel');panel?.classList.add('hidden')}};top.appendChild(close)}
  submit.textContent=submit.textContent.trim().startsWith('Guardar')?submit.textContent.trim():'Guardar';submit.classList.add('primary');top.appendChild(submit);
  const del=oldAction?.querySelector('.delete');if(del)top.insertBefore(del,submit);
  form.insertBefore(top,form.firstChild);if(oldAction&&!oldAction.querySelector('button'))oldAction.remove();form.dataset.oihaneTopActions='1';
 }
 function scan(root){if(root.matches?.('form'))prepareForm(root);root.querySelectorAll?.('form').forEach(prepareForm)}
 scan(document);
 const mo=new MutationObserver(records=>records.forEach(rec=>rec.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)})));
 mo.observe(document.body,{childList:true,subtree:true});
 // Make new/old gift labels use the requested spelling without changing their stored identifiers.
 function normalizeGiftDisplay(){document.querySelectorAll('#app .item-meta,#app .v518-person-group h3,#app .section-card-head strong').forEach(el=>{el.childNodes.forEach(n=>{if(n.nodeType===3)n.nodeValue=n.nodeValue.replace(/\bmamá\b/gi,'Mamá')})})}
 const oldRenderExtra=window.renderExtraModule;if(typeof oldRenderExtra==='function')window.renderExtraModule=function(){const v=oldRenderExtra.apply(this,arguments);requestAnimationFrame(()=>{colourCategoryHeadings();normalizeGiftDisplay();scan(document)});return v};
 // El MutationObserver de formularios ya detecta las inserciones de Calendario.
})();