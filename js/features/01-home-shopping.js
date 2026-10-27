




/* --- funcionalidad-02 --- */

/* Oihane 5.16: visual and workflow redesign requested by Oihane */
(function(){
 
 // Make the home agenda compact and remove non-informative labels while preserving the existing actions/data.
   // La cabecera y las casillas se dibujan correctamente en home() desde el inicio.
 // Keep the current header format, with unique tile artwork and replace Plans' clock icon with a small scenic illustration.
 // Icono Planes: recurso único ./icons/planes.png, compartido en todas las vistas.
 // Default into General when opening shopping, and retain store selector for independent lists.
 // Add compact current-week calendar at the top and compress event cards.
 // Redesign section structures; preserve every saved item and simply change its grouping.
 extraConfig.Wishlist.sections=['COSAS QUE QUIERO','COMPRADOS'];
 extraConfig.Regalos.sections=['PRÓXIMOS REGALOS','PADRE','MADRE','NOVIO','PAREJA PADRE','PAREJA MADRE','HERMANO','RESTO'];
 extraConfig.Plantas.sections=['NECESITAN ATENCIÓN','MIS PLANTAS'];
 const originalSectionFor=sectionFor;
 sectionFor=function(name,item){
  if(name==='Wishlist')return item.status==='Comprado'?'COMPRADOS':'COSAS QUE QUIERO';
  if(name==='Regalos'){
   const p=String(item.person||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
   if(/^(padre|aita|mi padre|papa|papá)$/.test(p))return 'PADRE';if(/^(madre|ama|mi madre|mama|mamá)$/.test(p))return 'MADRE';if(/^(novio|ruben|rub[eé]n|mi novio|pareja)$/.test(p))return 'NOVIO';if(/(pareja.*padre|mujer.*padre|companer.*padre|pareja de mi padre)/.test(p))return 'PAREJA PADRE';if(/(pareja.*madre|marido.*madre|companer.*madre|pareja de mi madre)/.test(p))return 'PAREJA MADRE';if(/^(hermano|mi hermano)$/.test(p))return 'HERMANO';return 'RESTO';
  }
  if(name==='Plantas')return (item.status==='Necesita atención'||(item.date&&item.date<=today()))?'NECESITAN ATENCIÓN':'MIS PLANTAS';
  if(name==='Estudio')return item.status==='Curso'?'CURSOS':'TEMAS PENDIENTES';
  if(name==='Planes')return item.status==='Sin fecha'?'SIN FECHA':item.status==='Realizado'?'PLANES REALIZADOS':'PRÓXIMOS';
  if(name==='Cultura'){if(item.kind==='Libro')return 'LIBROS';if(item.kind==='Arte'||item.kind==='Museo')return 'ARTE';return 'PELÍCULAS Y SERIES'}
  return originalSectionFor(name,item);
 };
 // Configure clean labels and sections (all legacy data remains in local storage).
 extraConfig.Estudio.sections=['CURSOS','TEMAS PENDIENTES'];
 extraConfig.Cultura.sections=['LIBROS','ARTE','PELÍCULAS Y SERIES'];
 extraConfig.Planes.sections=['PRÓXIMOS','SIN FECHA'];
 const oldRenderExtraModule=renderExtraModule;renderExtraModule=function(name,seed=''){oldRenderExtraModule(name,seed);const labels={'COSAS QUE QUIERO':'Cosas que quiero','COMPRADOS':'Comprados','PRÓXIMOS REGALOS':'Próximos regalos','PADRE':'Mi padre','MADRE':'Mi madre','NOVIO':'Mi novio','PAREJA PADRE':'Pareja de mi padre','PAREJA MADRE':'Pareja de mi madre','HERMANO':'Mi hermano','RESTO':'Resto de personas y regalos','TEMAS PENDIENTES':'Temas pendientes','PRÓXIMOS':'Planes próximos','SIN FECHA':'Planes pendientes','LIBROS':'Libros','ARTE':'Arte','PELÍCULAS Y SERIES':'Películas y series'};document.querySelectorAll('.section-card-head strong').forEach(el=>{const k=el.textContent.trim();if(labels[k])el.textContent=labels[k]});if(name==='Cultura'){const kind=document.querySelector('#extraKind');if(kind){[...kind.options].filter(o=>o.value==='Museo'||o.text==='Museo').forEach(o=>o.remove())}const lookupRow=document.querySelector('.culture-lookup-row');if(lookupRow&&!document.querySelector('#cultureQuickSearch')){const quick=document.createElement('div');quick.id='cultureQuickSearch';quick.className='culture-search-links';quick.innerHTML='<a id="cultureGoogleBooks" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=bks">Buscar libro ↗</a><a id="cultureGoogleImages" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch">Buscar imágenes ↗</a>';lookupRow.after(quick);const input=document.querySelector('#extraTitle');const update=()=>{const q=encodeURIComponent(input?.value||'');const a=document.querySelector('#cultureGoogleBooks'),b=document.querySelector('#cultureGoogleImages');if(a)a.href='https://www.google.com/search?tbm=bks&q='+q;if(b)b.href='https://www.google.com/search?tbm=isch&q='+q};input?.addEventListener('input',update);update()}const museumLinks=document.querySelectorAll('#app a');museumLinks.forEach(a=>{if(/web \/ entradas/i.test(a.textContent))a.textContent='Web del museo ↗'});hydrateCultureBookCovers();}if(name==='Planes'){document.querySelectorAll('#app .section-card').forEach(card=>{const t=card.querySelector('.section-card-head strong')?.textContent||'';if(t==='Planes realizados'||t==='Historial')card.remove()})}if(name==='Tareas'){const toolbar=document.querySelector('#app .module-toolbar');if(toolbar){const label=toolbar.querySelector('.item-meta');if(label)label.remove()}}};
 // Render a person-specific gift list with a clear status on each gift. A gift may also appear in the 60-day upcoming section.
 const originalRenderExtraList=renderExtraList;renderExtraList=function(name,section){originalRenderExtraList(name,section);const list=document.querySelector('#'+sectionListId(name,section));if(!list)return;
  if(name==='Regalos'&&section==='PRÓXIMOS REGALOS'){const now=new Date(today()+'T12:00:00');const gifts=extraItems('Regalos').filter(i=>{const d=i.occasionDate||i.date||'';if(!d)return false;const target=new Date(d+'T12:00:00'),days=Math.round((target-now)/86400000);return days>=0&&days<=60}).sort((a,b)=>(a.occasionDate||a.date).localeCompare(b.occasionDate||b.date));list.innerHTML=gifts.length?gifts.map(i=>`<div class="item"><div class="item-main"><div class="item-title">${esc(i.title)}</div><div class="item-meta">${esc(i.person||'Sin persona')} · ${fmt(i.occasionDate||i.date)}${i.occasion?' · '+esc(i.occasion):''}</div><span class="gift-substatus">${esc(i.status||'Idea')}</span></div><div class="item-actions"><button class="small-action" onclick="cycleExtraStatus('Regalos',${i.id},'PRÓXIMOS REGALOS')">Estado</button><button class="delete" onclick="deleteExtra('Regalos',${i.id},'PRÓXIMOS REGALOS')">×</button></div></div>`).join(''):'<div class="empty-list">No hay regalos con fecha en los próximos dos meses.</div>';}
  if(name==='Regalos'&&['PADRE','MADRE','NOVIO','PAREJA PADRE','PAREJA MADRE','HERMANO','RESTO'].includes(section)){list.querySelectorAll('.item').forEach(el=>{const meta=el.querySelector('.item-meta');if(meta&&!el.querySelector('.gift-substatus')){const span=document.createElement('div');span.className='gift-substatus';span.textContent=meta.textContent.includes('Comprado')||meta.textContent.includes('Pedido')||meta.textContent.includes('En camino')?'Ya comprado / pedido':meta.textContent.includes('Buscando')?'Buscando activamente':'Idea de regalo';meta.after(span)}})}
  if(name==='Planes'){list.querySelectorAll('.item').forEach(el=>{const old=[...el.querySelectorAll('button.small-action')].find(b=>b.textContent.trim()==='Cambiar estado');if(!old)return;old.remove();const title=el.querySelector('.item-title')?.textContent;const item=extraItems('Planes').find(x=>x.title===title);if(!item)return;const controls=document.createElement('div');controls.className='plan-status-actions';[['Próximo','Añadir a próximos'],['Sin fecha','Añadir a pendientes'],['Realizado','Añadir a historial']].forEach(([status,label])=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(item.status===status)b.classList.add('active');b.onclick=()=>{const all=extraItems('Planes'),target=all.find(x=>String(x.id)===String(item.id));if(!target)return;target.status=status;saveExtra('Planes',all);renderExtraModule('Planes')};controls.appendChild(b)});el.querySelector('.item-actions')?.appendChild(controls)})}
  if(name==='Plantas'){list.querySelectorAll('.item').forEach(el=>{const title=el.querySelector('.item-title')?.textContent;const plant=extraItems('Plantas').find(x=>x.title===title);if(!plant)return;let panel=el.querySelector('.plant-evolution');if(!panel){panel=document.createElement('div');panel.className='plant-evolution';panel.innerHTML='<strong>Evolución de la planta</strong>';const entries=Array.isArray(plant.evolution)?plant.evolution:[];panel.innerHTML+='<div class="plant-evolution-entry">'+(entries.length?entries.slice(-4).map(x=>`${esc(x.date||'')} · ${esc(x.note||'')}`).join('</div><div class="plant-evolution-entry">'):'Aún no hay observaciones. Registra cambios, hojas nuevas o problemas.')+'</div><button type="button" class="small-action" style="margin-top:6px" onclick="addPlantEvolution('+plant.id+')">＋ Registrar evolución</button>';el.querySelector('.item-main')?.appendChild(panel)}})}
  if(name==='Cultura'){list.querySelectorAll('.culture-book-card,.culture-art-card,.culture-film-card').forEach(card=>{const title=card.querySelector('.culture-card-info strong')?.textContent;if(!title)return;const item=extraItems('Cultura').find(x=>x.title===title);if(!item)return;let links=card.querySelector('.culture-search-links');if(!links){links=document.createElement('div');links.className='culture-search-links';const q=encodeURIComponent(item.title+(item.creator?' '+item.creator:''));links.innerHTML=`<a target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}">Buscar ficha ↗</a>${item.kind==='Libro'?`<a target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q=${q}+portada">Buscar portada ↗</a>`:`<a target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q=${q}+obra">Ver imágenes ↗</a>`}`;card.querySelector('.culture-card-info')?.appendChild(links)}})}
 };
 window.addPlantEvolution=function(id){const items=extraItems('Plantas'),p=items.find(x=>String(x.id)===String(id));if(!p)return;const note=prompt('¿Qué ha cambiado en esta planta? (hojas nuevas, crecimiento, plaga, trasplante…)');if(note===null||!note.trim())return;p.evolution=Array.isArray(p.evolution)?p.evolution:[];p.evolution.push({date:today(),note:note.trim()});if(saveExtra('Plantas',items))renderExtraModule('Plantas')};
 async function hydrateCultureBookCovers(){const all=extraItems('Cultura');const books=all.filter(x=>x.kind==='Libro'&&!x.photo&&x.title);if(!books.length)return;let changed=false;for(const book of books.slice(0,10)){try{const url='https://openlibrary.org/search.json?title='+encodeURIComponent(book.title)+'&limit=4&fields=title,author_name,cover_i';const r=await fetch(url);if(!r.ok)continue;const data=await r.json();const docs=data.docs||[];const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();const match=docs.find(d=>d.cover_i&&norm(d.title)===norm(book.title))||docs.find(d=>d.cover_i&&norm(d.title).includes(norm(book.title)));if(match){book.photo='https://covers.openlibrary.org/b/id/'+match.cover_i+'-M.jpg';if(!book.link&&match.key)book.link='https://openlibrary.org'+match.key;changed=true}}catch(e){/* External catalogue unavailable: manual search links remain available. */}}if(changed){saveExtra('Cultura',all);const idx=extraConfig.Cultura.sections.indexOf('LIBROS');if(idx>=0)renderExtraList('Cultura','LIBROS')}}
 // Change the home tile backgrounds and module headers uniformly; don't migrate or delete user records.
})();


/* Oihane 5.17 — compra compacta y calendario práctico */
(function(){
  const STORE_NAMES=['Lidl','Eroski','Mercadona','Dia',...(()=>{try{const a=JSON.parse(localStorage.getItem('oihane_custom_shops_v1')||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string'&&/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]{2,30}$/.test(x)&&!['General','Lidl','Eroski','Mercadona','Dia'].includes(x)).slice(0,20):[]}catch(_){return []}})()];
  window.oihaneShopStores=STORE_NAMES;
  const CUSTOM_SHOP_KEY='oihane_custom_shops_v1';
  const BUILTIN_SHOPS=['General','Lidl','Eroski','Mercadona','Dia'];
  const validShopName=name=>typeof name==='string'&&/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]{2,30}$/.test(name.trim());
  const shopKey=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-ES').trim();
  // Read saved shops again when shopping is opened, including after a cloud sync.
  function refreshCustomShops(){
    try{const saved=JSON.parse(localStorage.getItem(CUSTOM_SHOP_KEY)||'[]');
      if(!Array.isArray(saved))return;
      for(const name of saved.slice(0,20)){
        if(validShopName(name)&&!STORE_NAMES.some(n=>shopKey(n)===shopKey(name))&&!BUILTIN_SHOPS.some(n=>shopKey(n)===shopKey(name)))STORE_NAMES.push(name);
      }
    }catch(_){}
  }
  window.oihaneAddShop=function(){
    refreshCustomShops();
    document.querySelector('#oihaneAddShopModal')?.remove();
    const wrap=document.createElement('div');wrap.id='oihaneAddShopModal';wrap.className='oihane-shop-modal';
    wrap.innerHTML='<form class="oihane-shop-dialog" aria-label="Crear supermercado"><h2>Nuevo supermercado</h2><label for="oihaneShopName">Nombre de la tienda</label><input id="oihaneShopName" type="text" autocomplete="off" maxlength="30" placeholder="Ej. Aldi" required><p id="oihaneShopError" role="alert" aria-live="polite"></p><div class="oihane-shop-actions"><button type="button" class="small-action" id="oihaneShopCancel">Cancelar</button><button type="submit" class="primary">Crear tienda</button></div></form>';
    document.body.appendChild(wrap);
    const input=wrap.querySelector('#oihaneShopName'),error=wrap.querySelector('#oihaneShopError');
    wrap.querySelector('#oihaneShopCancel').onclick=()=>wrap.remove();
    wrap.addEventListener('click',event=>{if(event.target===wrap)wrap.remove()});
    input.focus();
    wrap.querySelector('form').onsubmit=event=>{
      event.preventDefault();const name=input.value.trim().replace(/\s+/g,' ');
      if(!validShopName(name)){error.textContent='Utiliza entre 2 y 30 caracteres: letras, números, espacios o guiones.';return}
      if([...BUILTIN_SHOPS,...STORE_NAMES].some(n=>shopKey(n)===shopKey(name))){error.textContent='Ese supermercado ya existe.';return}
      const custom=STORE_NAMES.filter(n=>!BUILTIN_SHOPS.some(b=>shopKey(n)===shopKey(b)));
      if(custom.length>=20){error.textContent='Ya tienes 20 supermercados adicionales.';return}
      try{localStorage.setItem(CUSTOM_SHOP_KEY,JSON.stringify([...custom,name]));}
      catch(_){error.textContent='No se ha podido guardar. Comprueba el almacenamiento del iPhone.';return}
      STORE_NAMES.push(name);wrap.remove();
      try{if(typeof queueLocalSnapshot==='function')queueLocalSnapshot();if(typeof queueCloudSync==='function')queueCloudSync()}catch(_){}
      setStore(name);
    };
  };
  const CAT_ORDER=productCategories.slice();
  const normProduct=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  classifyProductCategory=function(value){
    const v=normProduct(value);
    const has=words=>words.some(w=>v.includes(normProduct(w)));
    if(has(['cerveza','vino','sidra','vermut','whisky','ginebra','vodka','ron','tequila','licor','champan','cava','alcohol','aperitivo con alcohol']))return 'Bebidas alcohólicas';
    if(has(['congelad','helado','hielo','pizza congelada','croquetas congeladas','patatas congeladas']))return 'Congelados';
    if(has(['salmón','salmon','merluza','bacalao','atun fresco','bonito','sardina','anchoa','boqueron','trucha','lubina','dorada','gamba','langostino','mejillon','almeja','calamar','pulpo','sepia','pescado','marisco','surimi']))return 'Pescado';
    if(has(['jamon','chorizo','fuet','salchichon','mortadela','pechuga de pavo en lonchas','pavo en lonchas','lomo embuchado','cecina','embutido','longaniza curada']) || (v.includes('lonchas') && has(['pavo','pollo','jamon','lomo'])))return 'Quesos y embutidos';
    if(has(['salmón','salmon','merluza','bacalao','atún','atun','bonito','sardina','anchoa','boquerón','trucha','lubina','dorada','gamba','langostino','mejillón','almeja','calamar','pulpo','sepia','pescado','marisco','surimi']))return 'Pescado';
 if(has(['pollo','pavo','ternera','cerdo','cordero','conejo','carne picada','filete','entrecot','solomillo','hamburguesa','salchicha fresca','lomo','costilla','morcilla','panceta','bacon','beicon','carne']))return 'Carne';
    if(has(['jamon','chorizo','fuet','salchichon','mortadela','pechuga de pavo en lonchas','pavo en lonchas','lomo embuchado','cecina','embutido','longaniza curada']))return 'Quesos y embutidos';
    if(has(['helado','guisantes congelados','verdura congelada','pescado congelado','pizza congelada','croquetas congeladas','patatas congeladas','congelado','hielo']))return 'Congelados';
    if(has(['lejia','detergente','suavizante','lavavajillas','limpiacristales','limpiador','fregasuelos','estropajo','bayeta','bolsas de basura','limpieza']))return 'Limpieza';
    if(has(['leche','yogur','yogurt','queso','mantequilla','nata','huevo','huevos','kefir','kéfir','cuajada','requeson','bebida vegetal','lacteo']))return 'Lácteos y huevos';
    if(has(['agua','refresco','coca cola','cocacola','fanta','aquarius',' nestea','zumo','jugo','tonica','tónica','bebida energetica','isotonica','cafe preparado','té frio']))return 'Bebidas';
    if(has(['galleta','cereales','granola','muesli','copos de avena','mermelada','tostada desayuno','bizcocho desayuno']))return 'Desayuno';
 if(has(['snack','nachos','palomitas','patatas fritas','frutos secos','pistacho','cacahuete','aceituna','pepinillo','aperitivo']))return 'Picoteo';
 if(has(['pan de molde','barra de pan','baguette','hogaza','mollete','chapata','croissant','cruasán','napolitana','ensaimada','magdalena','bizcocho','bolleria','picos','colines','tortilla de trigo','tortitas de maiz','arepa','pan']))return 'Panadería';
    if(has(['patatas fritas','tomate frito','tomate triturado','atun en lata','patatas chips']))return 'Despensa';
    if(has(['manzana','pera','platano','banana','naranja','mandarina','limon','lima','uva','fresa','frambuesa','arandano','mora','kiwi','piña','mango','papaya','melon','sandia','melocoton','nectarina','albaricoque','ciruela','cereza','aguacate','tomate','lechuga','espinaca','acelga','berza','repollo','brocoli','coliflor','zanahoria','patata','boniato','cebolla','ajo','puerro','calabacin','pepino','pimiento','berenjena','calabaza','champiñon','seta','judia verde','guisante fresco','esparrago','alcachofa','apio','rucula','canonigos','rabano','remolacha','yuca','jengibre fresco','perejil fresco','cilantro fresco','hierbabuena','albahaca fresca','verdura','fruta']))return 'Fruta y verdura';
    if(has(['arroz','pasta','macarron','espagueti','fideo','lasana','lenteja','garbanzo','alubia','quinoa','cuscus','avena','harina','azucar','sal','pimienta','especia','aceite','vinagre','mayonesa','ketchup','mostaza','tomate frito','tomate triturado','conserva','atun en lata','maiz','aceituna','pepinillo','frutos secos','almendra','nuez','pistacho','cacahuete','miel','mermelada','cacao','chocolate','galleta','cereales','granola','barrita','levadura','caldo','sopa de sobre','patatas fritas','snack','nachos','palomitas','tofu','soja texturizada','tortilla mexicana','wraps','pan rallado','cafe molido','cafe soluble','te verde','salsa de soja','salsa pesto','despensa']))return 'Despensa';
    if(has(['champu','champú','gel de baño','pasta de dientes','cepillo de dientes','desodorante','papel higienico','compresa','tampon','pañal','higiene']))return 'Higiene';
    return 'Otros';
  };
  const PRODUCT_PREF_KEY='oihane_product_preferences_v1';
  const readPreferences=()=>{try{const o=JSON.parse(localStorage.getItem(PRODUCT_PREF_KEY)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{}}catch(_){return {}}};
  const savePreferences=prefs=>{try{localStorage.setItem(PRODUCT_PREF_KEY,JSON.stringify(prefs))}catch(e){console.warn('Preferencias de compra no guardadas:',e)}};
  window.oihaneShopPreference=function(title){
    return readPreferences()[normProduct(title)]||null;
  };
  window.oihaneRememberShoppingAssignment=function(title,selectedStore,selectedCategory){
    const key=normProduct(title);if(!key)return;
    const prefs=readPreferences();
    prefs[key]={store:selectedStore,category:selectedCategory,updatedAt:Date.now()};
    savePreferences(prefs);
  };
  window.oihaneLearnShoppingAssignments=function(items){
    const prefs=readPreferences();let changed=false;
    for(const item of items||[]){
      if(!item?.title||!item.store)continue;
      const key=normProduct(item.title),old=prefs[key];
      // Las preferencias manuales del dispositivo tienen prioridad; aprender
      // solo de registros compartidos que fueron clasificados explícitamente.
      if(!old&&item.categoryManual){prefs[key]={store:item.store,category:item.category||'Otros',updatedAt:0};changed=true}
    }
    if(changed)savePreferences(prefs);
  };
  // Reconcile old categories and store lists without deleting or duplicating saved items.
  function normalizeProducts(){
   refreshCustomShops();
   let changed=false;
   const prefs=readPreferences();
   const known=new Set(STORE_NAMES.map(shopKey));
   for(const p of products){
    if(!p||typeof p!=='object'||!p.title)continue;
    const key=normProduct(p.title),pref=prefs[key];
    const raw=String(p.store||'').trim();
    // NO convertir silenciosamente un supermercado nuevo a Lidl.
    // Se recupera incluso si el catálogo de tiendas llegó después.
    if(raw&&validShopName(raw)&&!known.has(shopKey(raw))){
     STORE_NAMES.push(raw);known.add(shopKey(raw));
    }
    let st=raw&&STORE_NAMES.some(s=>shopKey(s)===shopKey(raw))?
     STORE_NAMES.find(s=>shopKey(s)===shopKey(raw)):
     (Array.isArray(p.lists)?p.lists.find(x=>STORE_NAMES.includes(x)):'')||
     (pref&&STORE_NAMES.includes(pref.store)?pref.store:'Lidl');
    let cat=p.category||pref?.category||classifyProductCategory(p.title);
    const lists=['General',st];
    if(p.store!==st||JSON.stringify(p.lists)!==JSON.stringify(lists)||p.category!==cat||
      p.title[0]!==p.title[0].toLocaleUpperCase('es-ES'))changed=true;
    p.store=st;p.lists=lists;p.category=cat;
    p.title=p.title.charAt(0).toLocaleUpperCase('es-ES')+p.title.slice(1);
   }
   const customs=STORE_NAMES.filter(n=>!BUILTIN_SHOPS.some(b=>shopKey(n)===shopKey(b)));
   try{
    const prior=JSON.parse(localStorage.getItem(CUSTOM_SHOP_KEY)||'[]');
    const combined=[...new Set([...(Array.isArray(prior)?prior:[]),...customs])].slice(0,20);
    if(JSON.stringify(prior)!==JSON.stringify(combined))localStorage.setItem(CUSTOM_SHOP_KEY,JSON.stringify(combined));
   }catch(_){}
   window.oihaneLearnShoppingAssignments(products);
   if(changed){try{localStorage.setItem('oihane_products',JSON.stringify(products));queueLocalSnapshot()}catch(e){console.warn('Compras: normalización pendiente',e)}}
  }
  normalizeProducts();
  window.setStore=function(s){store=STORE_NAMES.includes(s)?s:'General';showBought=false;selectedProductIds.clear();renderShopping()};
  window.setBought=function(b){showBought=!!b;selectedProductIds.clear();renderShopping()};
  window.toggleProduct=function(id){const p=products.find(x=>String(x.id)===String(id));if(p){p.bought=!p.bought;if(p.sourceHomeId){const hs=extraItems('Hogar'),h=hs.find(x=>String(x.id)===String(p.sourceHomeId));if(h){h.purchased=!!p.bought;saveExtra('Hogar',hs)}}save();renderShopping()}};
  window.deleteProduct=function(id){const p=products.find(x=>String(x.id)===String(id));products=products.filter(x=>String(x.id)!==String(id));if(p&&p.sourceHomeId){const hs=extraItems('Hogar'),h=hs.find(x=>String(x.id)===String(p.sourceHomeId));if(h){h.purchased=false;saveExtra('Hogar',hs)}}save();renderShopping()};
  window.productRows=function(){
    const arr=products.filter(p=>(p.lists||[]).includes(store)&&!!p.bought===!!showBought);
    if(!arr.length)return `<div class="empty-list">${showBought?'Todavía no has comprado nada.':'Tu lista está vacía. Añade lo que necesites.'}</div>`;
    let html='';
    CAT_ORDER.forEach(cat=>{const group=arr.filter(p=>(p.category||'Otros')===cat).sort((a,b)=>a.title.localeCompare(b.title,'es'));if(!group.length)return;html+=`<div class="category-heading">${esc(cat)}</div>`;html+=group.map(p=>`<div class="shop-row ${p.bought?'done':''}"><button type="button" class="shop-name shop-editable" onclick="oihaneEditShoppingProduct(${JSON.stringify(p.id)})" aria-label="Editar ${esc(p.title)}">${esc(p.title)} ✎</button>${store==='General'?`<span class="shop-store">${esc(p.store||'Lidl')}</span>`:''}<button type="button" class="shop-bought" aria-label="Marcar ${esc(p.title)} como comprado" onclick="toggleProduct(${JSON.stringify(p.id)})">${p.bought?'Comprado ✓':'Comprado'}</button><button type="button" class="shop-delete" aria-label="Quitar ${esc(p.title)}" onclick="deleteProduct(${JSON.stringify(p.id)})">×</button></div>`).join('')});
    const unknown=arr.filter(p=>!CAT_ORDER.includes(p.category||'Otros'));if(unknown.length){html+='<div class="category-heading">Otros</div>'+unknown.map(p=>`<div class="shop-row ${p.bought?'done':''}"><button type="button" class="shop-name shop-editable" onclick="oihaneEditShoppingProduct(${JSON.stringify(p.id)})" aria-label="Editar ${esc(p.title)}">${esc(p.title)} ✎</button>${store==='General'?`<span class="shop-store">${esc(p.store||'Lidl')}</span>`:''}<button type="button" class="shop-bought" onclick="toggleProduct(${JSON.stringify(p.id)})">${p.bought?'Comprado ✓':'Comprado'}</button><button type="button" class="shop-delete" onclick="deleteProduct(${JSON.stringify(p.id)})">×</button></div>`).join('')}
    return html;
  };
  const shoppingViewSignature=()=>JSON.stringify([store,showBought,products]);
  // Actualizar SOLO la lista que cambia desde Supabase (sin perder el texto escrito).
  window.oihaneRefreshShoppingList=function(){
    if(screen!=='Compras')return;
    const list=document.querySelector('#app #productList');
    if(!list){if(typeof renderShopping==='function')renderShopping();return;}
    const signature=shoppingViewSignature();
    if(list.dataset.oihaneSignature===signature)return;
    list.innerHTML=productRows();list.dataset.oihaneSignature=signature;
    const bottom=document.querySelector('#app .shop-bought-toggle');
    if(bottom){const count=products.filter(p=>(p.lists||[]).includes(store)&&p.bought).length;
      bottom.textContent=showBought?'← Volver a pendientes':'Comprados ('+count+')';}
    window.oihaneEnhanceShopping?.();
  };
  window.oihaneOpenFullShoppingForm=function(){
    document.getElementById('oihaneShoppingAddModal')?.remove();
    const current=document.getElementById('productInput')?.value.trim()||'';
    const preference=window.oihaneShopPreference(current);
    const selected=store==='General'?(preference?.store&&STORE_NAMES.includes(preference.store)?preference.store:'Lidl'):store;
    const modal=document.createElement('div');
    modal.id='oihaneShoppingAddModal';modal.className='oihane-shop-modal';
    modal.innerHTML=`<form class="oihane-shop-dialog" id="oihaneShoppingAddForm">
      <h2>Añadir producto</h2>
      <label for="oihaneFullProductName">Nombre</label>
      <input id="oihaneFullProductName" required maxlength="180" value="${esc(current)}" placeholder="Nombre del producto">
      <label for="oihaneFullProductStore">Supermercado</label>
      <select id="oihaneFullProductStore">${STORE_NAMES.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}</select>
      <label for="oihaneFullProductCategory">Categoría</label>
      <select id="oihaneFullProductCategory">${productCategories.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select>
      <div class="oihane-shop-actions"><button type="button" id="oihaneFullProductCancel">Cerrar</button><button type="submit" class="primary">Guardar</button></div>
    </form>`;
    document.body.append(modal);
    const form=modal.querySelector('form'),name=modal.querySelector('#oihaneFullProductName'),category=modal.querySelector('#oihaneFullProductCategory');
    category.value=preference?.category||classifyProductCategory(current);
    name.addEventListener('change',()=>{
     const remembered=window.oihaneShopPreference(name.value);
     if(remembered?.category)category.value=remembered.category;
     if(store==='General'&&remembered?.store&&STORE_NAMES.includes(remembered.store))
      modal.querySelector('#oihaneFullProductStore').value=remembered.store;
    });
    modal.querySelector('#oihaneFullProductCancel').onclick=()=>modal.remove();
    modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
    form.onsubmit=e=>{
      e.preventDefault();
      const raw=name.value.trim();if(!raw)return;
      const title=raw.charAt(0).toLocaleUpperCase('es-ES')+raw.slice(1);
      const supermarket=modal.querySelector('#oihaneFullProductStore').value;
      const cat=category.value;
      if(products.some(p=>normProduct(p.title)===normProduct(title)&&p.store===supermarket&&!p.bought)){
        alert('Ya tienes este producto pendiente en '+supermarket+'.');return;
      }
      const id=Date.now()+Math.floor(Math.random()*1000);
      products.push({id,title,store:supermarket,lists:['General',supermarket],category:cat,
        categoryManual:true,bought:false,created:today()});
      window.oihaneRememberShoppingAssignment(title,supermarket,cat);
      selectedProductIds.clear();showBought=false;
      if(typeof save==='function')save();
      modal.remove();renderShopping();
    };
  };
  window.renderShopping=function(seed=''){
    screen='Compras';
    refreshCustomShops();
    // Al acceder directamente tras abrir la PWA, iniciar/reanudar las compras
    // compartidas, que en la implementación final antes no se invocaba.
    try{window.oihaneSharedShoppingTouch?.()}catch(e){console.warn('Compras: sincronización pendiente',e)}
    document.querySelector('#app').innerHTML=`<div class="screen-head"><button class="back" onclick="home()" aria-label="Volver al inicio">‹</button><h1>${moduleIcon('Compras')} Compras</h1></div><div class="subtabs shop-tabs">${['General',...STORE_NAMES].map(s=>`<button type="button" class="${store===s?'active':''}" onclick="setStore('${s}')">${esc(s)}</button>`).join('')}<button type="button" class="oihane-add-shop" onclick="oihaneAddShop()" aria-label="Crear un supermercado">＋ Tienda</button></div><section class="panel shop-panel"><div class="oihane-shop-entry"><form class="add-row shop-add-row" id="productForm"><input id="productInput" placeholder="Añadir producto…" value="${esc(seed)}" required aria-label="Producto que quieres añadir"><button class="shop-plus" aria-label="Añadir producto" title="Añadir producto rápido">＋</button></form><button type="button" class="oihane-shop-full-add" id="oihaneShoppingFullAdd">Añadir</button></div><div id="productList">${productRows()}</div><div class="shop-bottom"><button type="button" class="shop-bought-toggle" onclick="setBought(${!showBought})">${showBought?'← Volver a pendientes':'Comprados ('+products.filter(p=>(p.lists||[]).includes(store)&&p.bought).length+')'}</button></div></section>`;
    const list=document.querySelector('#app #productList');
    if(list)list.dataset.oihaneSignature=shoppingViewSignature();
    const input=document.querySelector('#productInput');
    document.getElementById('oihaneShoppingFullAdd').onclick=()=>window.oihaneOpenFullShoppingForm();
    document.querySelector('#productForm').onsubmit=e=>{e.preventDefault();const raw=input.value.trim();if(!raw)return;const title=raw.charAt(0).toLocaleUpperCase('es-ES')+raw.slice(1),n=normProduct(title);const prior=[...products].reverse().find(p=>normProduct(p.title)===n),preference=window.oihaneShopPreference(title);
    const assignedStore=store==='General'?(preference?.store&&STORE_NAMES.includes(preference.store)?preference.store:prior&&STORE_NAMES.includes(prior.store)?prior.store:'Lidl'):store;const already=products.find(p=>normProduct(p.title)===n&&p.store===assignedStore&&!p.bought);if(already){alert('Ese producto ya está pendiente en '+assignedStore+'. He evitado duplicarlo.');renderShopping();return}products.push({id:Date.now(),title,store:assignedStore,lists:['General',assignedStore],category:window.oihaneShopPreference(title)?.category||classifyProductCategory(title),categoryManual:!!window.oihaneShopPreference(title),bought:false,created:today()});selectedProductIds.clear();showBought=false;save();renderShopping()};
    // Una única salida de renderizado; comportamiento añadido por Compras (5.34).
    if(typeof window.oihaneEnhanceShopping==='function')window.oihaneEnhanceShopping();
  };
  // Recipe ingredients keep their established store assignment when a product has been bought before.
  window.recipeToShopping=function(id){const r=extraItems('Recetas').find(x=>String(x.id)===String(id));if(!r||!r.ingredients){alert('Añade los ingredientes de la receta primero.');return}const names=parseRecipeIngredients(r.ingredients).map(x=>x.name.trim()).filter(Boolean),seen=new Set(products.map(p=>normProduct(p.title)));let added=0;names.forEach(title=>{const n=normProduct(title);if(!seen.has(n)){const prior=[...products].reverse().find(p=>normProduct(p.title)===n);const st=prior&&STORE_NAMES.includes(prior.store)?prior.store:'Lidl';const nice=title.charAt(0).toLocaleUpperCase('es-ES')+title.slice(1);products.push({id:Date.now()+Math.floor(Math.random()*999999),title:nice,store:st,lists:['General',st],category:classifyProductCategory(nice),bought:false,created:today(),sourceRecipe:r.title,sourceRecipeId:r.id});seen.add(n);added++}});save();alert(added?`Añadidos ${added} ingredientes a General y a su supermercado habitual.`:'Todos los ingredientes ya estaban en la lista de compra.');if(screen==='Compras')renderShopping()};

  // Rolling seven-day window, beginning today, with each day's events visible inside the strip.
  calendarView='all';
  const isoDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  window.calendarRows=function(){let base=events.filter(e=>e.date);const now=new Date(today()+'T12:00:00'),end=new Date(now);if(calendarView==='day'){base=base.filter(e=>e.date===isoDate(now))}else if(calendarView==='week'){end.setDate(now.getDate()+6);base=base.filter(e=>e.date>=isoDate(now)&&e.date<=isoDate(end))}else if(calendarView==='month'){const a=new Date(now.getFullYear(),now.getMonth(),1),b=new Date(now.getFullYear(),now.getMonth()+1,0);base=base.filter(e=>e.date>=isoDate(a)&&e.date<=isoDate(b))}else if(calendarView==='year'){base=base.filter(e=>(e.date||'').startsWith(String(now.getFullYear())))}base.sort((a,b)=>((a.date||'9999')+(a.time||'')).localeCompare((b.date||'9999')+(b.time||'')));if(!base.length)return '<div class="empty-list">No hay eventos en este periodo.</div>';return base.map(e=>`<div class="item calendar-event-row" role="button" tabindex="0" aria-label="Editar ${esc(e.title)}" onclick="editEvent(${JSON.stringify(e.id)})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();editEvent(${JSON.stringify(e.id)})}"><div class="event-date">${e.date===today()?'HOY':esc(fmt(e.date))}${e.time?'<span class="oihane-cal-time">'+esc(e.time)+'</span>':''}</div><div class="item-main"><div class="event-title-line"><span class="item-title">${esc(e.title)}</span>${window.oihaneShareBadge?.(e)||''}${e.location?`<span class="event-inline-meta">📍 ${esc(e.location)}</span>`:''}${e.people?`<span class="event-inline-meta">· ${esc(e.people)}</span>`:''}</div>${e.notes&&!/^Plan enlazado desde Planes$/.test(e.notes)?`<div class="item-meta event-notes">${esc(e.notes)}</div>`:''}</div><button type="button" class="shop-delete" aria-label="Eliminar ${esc(e.title)}" onclick="event.stopPropagation();deleteEvent(${JSON.stringify(e.id)})">×</button></div>`).join('')};
  window.setCalendarView=function(view,button){calendarView=view;document.querySelectorAll('.module-toolbar .subtabs button').forEach(b=>b.classList.toggle('active',b===button));const list=document.querySelector('#calendarList');if(list)list.innerHTML=calendarRows();const strip=document.querySelector('.rolling-week-strip');if(strip)strip.style.display=view==='week'?'grid':'none'};
  window.renderCalendar=function(seed=''){
    screen='Calendario';const future=events.filter(e=>e.date>=today()).sort((a,b)=>((a.date||'9999')+(a.time||'')).localeCompare((b.date||'9999')+(b.time||'')));
    document.querySelector('#app').innerHTML=`<div class="screen-head"><button class="back" onclick="home()" aria-label="Volver al inicio">‹</button><h1>${moduleIcon('Calendario')} Calendario</h1></div><div class="module-toolbar calendar-toolbar"><div class="subtabs"><button class="${calendarView==='all'?'active':''}" onclick="setCalendarView('all',this)">Todos</button><button class="${calendarView==='week'?'active':''}" onclick="setCalendarView('week',this)">Semana</button><button class="${calendarView==='month'?'active':''}" onclick="setCalendarView('month',this)">Mes</button></div><button class="calendar-plus" type="button" aria-label="Añadir evento" title="Añadir evento" onclick="toggleAddForm()">＋</button></div><div class="rolling-week-strip" aria-label="Próximos siete días">${Array.from({length:7},(_,i)=>{const d=new Date(today()+'T12:00:00');d.setDate(d.getDate()+i);const key=isoDate(d),dayEvents=events.filter(e=>e.date===key).sort((a,b)=>(a.time||'').localeCompare(b.time||''));return `<button type="button" class="rolling-day ${key===today()?'today':''}" onclick="setCalendarView('day',document.querySelector('.calendar-toolbar .subtabs button:first-child'));calendarFocusDate('${key}')"><span>${d.toLocaleDateString('es-ES',{weekday:'short'}).replace('.','')}</span><strong>${d.getDate()}</strong><div class="rolling-day-events">${dayEvents.map(e=>`<span>${e.time?esc(e.time)+' ':''}${esc(e.title)}</span>`).join('')}</div></button>`}).join('')}</div><section class="panel hidden" id="addPanel"><form id="eventForm"><div class="field"><label>Nombre</label><input id="eventTitle" placeholder="Ej. Cita médica" value="${esc(seed)}" required></div><div class="field"><label>Fecha</label><input id="eventDate" type="date" value="${today()}" required></div><div class="field"><label>Hora</label><input id="eventTime" type="time"></div><div class="field"><label>Duración</label><select id="eventDuration"><option value="30">30 minutos</option><option value="60" selected>1 hora</option><option value="90">1 h 30 min</option><option value="120">2 horas</option><option value="240">Medio día</option><option value="480">Día completo</option></select></div><div class="field"><label>Ubicación</label><div class="location-entry"><input id="eventLocation" placeholder="Dirección o lugar…"><button type="button" class="maps-button" title="Buscar en Google Maps" aria-label="Abrir Google Maps" onclick="oihanePickLocation('eventLocation')">📍</button></div></div><div class="field"><label class="inline-check"><input type="checkbox" id="eventShare" checked> Compartir con mi pareja</label></div><div class="field"><label>Personas (opcional)</label><input id="eventPeople" placeholder="Con quién quedas"></div><div class="field"><label>Notas (opcional)</label><textarea id="eventNotes" placeholder="Información útil, reserva, preparación…"></textarea></div><div class="field"><label class="inline-check"><input id="eventNotify" type="checkbox"> Aviso (el navegador debe permitir notificaciones)</label></div><div class="field"><label>¿Cuándo avisarme?</label><select id="eventNotifyLead"><option value="0">A su hora</option><option value="15">15 minutos antes</option><option value="60">1 hora antes</option><option value="1440">1 día antes</option></select></div><div class="field"><label>Tiempo para salir antes (minutos)</label><input id="eventDeparture" type="number" min="0" step="5" placeholder="Ej. 30"></div><button class="primary" type="submit">Guardar evento</button></form></section><section class="panel"><div id="calendarList">${calendarRows()}</div></section><p class="hint">Los eventos se guardan en el calendario interno de Oihane.</p>`;
    document.querySelector('#eventForm').onsubmit=e=>{e.preventDefault();const title=document.querySelector('#eventTitle').value.trim(),date=document.querySelector('#eventDate').value;if(!title||!date){alert('Indica un nombre y una fecha.');return}const item={id:Date.now(),title,date,time:document.querySelector('#eventTime').value,duration:document.querySelector('#eventDuration').value,location:document.querySelector('#eventLocation').value.trim(),people:document.querySelector('#eventPeople').value.trim(),notes:document.querySelector('#eventNotes').value.trim(),notify:document.querySelector('#eventNotify').checked,notifyLead:Number(document.querySelector('#eventNotifyLead')?.value||0),departureMinutes:document.querySelector('#eventDeparture').value||'',sharedWithPartner:!!document.querySelector('#eventShare')?.checked};events.push(item);save();renderCalendar()};
  };
  window.calendarFocusDate=function(date){calendarFocus=date;const d=document.querySelector('#eventDate');if(d)d.value=date;const list=document.querySelector('#calendarList');if(list){calendarView='day';list.innerHTML=events.filter(e=>e.date===date).sort((a,b)=>(a.time||'').localeCompare(b.time||'')).map(e=>`<div class="item calendar-event-row" onclick="editEvent(${JSON.stringify(e.id)})"><div class="event-date">${esc(fmt(date))}${e.time?'<span class="oihane-cal-time">'+esc(e.time)+'</span>':''}</div><div class="item-main"><div class="event-title-line"><span class="item-title">${esc(e.title)}</span>${window.oihaneShareBadge?.(e)||''}${e.location?`<span class="event-inline-meta">📍 ${esc(e.location)}</span>`:''}${e.people?`<span class="event-inline-meta">· ${esc(e.people)}</span>`:''}</div>${e.notes?`<div class="item-meta">${esc(e.notes)}</div>`:''}</div><button class="shop-delete" onclick="event.stopPropagation();deleteEvent(${JSON.stringify(e.id)})">×</button></div>`).join('')||'<div class="empty-list">No hay eventos este día.</div>'}};
  window.openEventLocationMap=function(){const q=document.querySelector('#eventLocation')?.value.trim()||'';window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q),'_blank','noopener')};
  window.editEvent=function(id){const ev=events.find(e=>String(e.id)===String(id));if(!ev)return;renderCalendar();const panel=document.querySelector('#addPanel');panel?.classList.remove('hidden');const set=(k,v)=>{const el=document.querySelector('#event'+k);if(el)el.value=v??''};set('Title',ev.title);set('Date',ev.date||today());set('Time',ev.time);set('Duration',String(ev.duration||60));set('Location',ev.location);set('People',ev.people);set('Notes',/^Plan enlazado desde Planes$/.test(ev.notes||'')?'':ev.notes);set('Departure',ev.departureMinutes);set('NotifyLead',String(ev.notifyLead||0));const n=document.querySelector('#eventNotify');if(n)n.checked=!!ev.notify;const submit=document.querySelector('#eventForm button[type=submit]');if(submit)submit.textContent='Guardar cambios';document.querySelector('#eventForm').onsubmit=e=>{e.preventDefault();const title=document.querySelector('#eventTitle').value.trim(),date=document.querySelector('#eventDate').value;if(!title||!date)return;Object.assign(ev,{title,date,time:document.querySelector('#eventTime').value,duration:document.querySelector('#eventDuration').value,location:document.querySelector('#eventLocation').value.trim(),people:document.querySelector('#eventPeople').value.trim(),notes:document.querySelector('#eventNotes').value.trim(),notify:document.querySelector('#eventNotify').checked,notifyLead:Number(document.querySelector('#eventNotifyLead')?.value||0),departureMinutes:document.querySelector('#eventDeparture').value||''});if(ev.sourceModule==='Planes'||ev.sourceModule==='Estudio'){const all=extraItems(ev.sourceModule),src=all.find(x=>String(x.id)===String(ev.sourceId));if(src)Object.assign(src,{title:ev.title,date:ev.date,time:ev.time,location:ev.location,place:ev.location,people:ev.people,duration:ev.duration,notes:ev.notes});saveExtra(ev.sourceModule,all)}save();renderCalendar()}};
  // Keep linked plans' date, time and place together, but do not insert implementation notes in the visible event.
  window.upsertLinkedEvent=function(moduleName,item){if(moduleName==='Estudio'&&item.kind==='Curso')return;const existing=events.find(ev=>ev.sourceModule===moduleName&&String(ev.sourceId)===String(item.id));const ev={id:existing?.id||Date.now()+Math.floor(Math.random()*10000),title:item.title,date:item.date,time:item.time||'',duration:item.duration||'60',location:item.location||item.place||'',people:item.people||'',notes:item.notes||'',sourceModule:moduleName,sourceId:item.id,...(moduleName==='Estudio'?{notify:!!item.notify,notifyLead:Number(item.notifyLead)||0}:{})};if(existing)Object.assign(existing,ev);else events.push(ev);save()};
  // Make every module's primary create action a simple plus, while leaving save buttons untouched.
  const priorExtraRender=renderExtraModule;renderExtraModule=function(name,seed=''){priorExtraRender(name,seed);document.querySelectorAll('#app .module-toolbar button.primary').forEach(b=>{if(/añadir|guardar|nuevo|crear|elemento|producto|plan|regalo|planta|receta|viaje|preferencia|curso/i.test(b.textContent)&&b.getAttribute('onclick')?.includes('toggleAddForm')){b.textContent='＋';b.setAttribute('aria-label','Añadir');b.setAttribute('title','Añadir')}});if(name==='Planes'){const loc=document.querySelector('#extraLocation');if(loc&&!loc.closest('.location-entry')){const wrap=document.createElement('div');wrap.className='location-entry';loc.parentNode.insertBefore(wrap,loc);wrap.appendChild(loc);const b=document.createElement('button');b.type='button';b.className='maps-button';b.textContent='📍';b.title='Buscar en Google Maps';b.setAttribute('aria-label','Abrir Google Maps');b.onclick=openPlanLocationMap;wrap.appendChild(b)}const time=document.querySelector('#extraTime');if(!time){const label=document.createElement('label');label.textContent='Hora';const input=document.createElement('input');input.type='time';input.id='extraTime';const field=document.createElement('div');field.className='field';field.append(label,input);const locField=document.querySelector('#extraLocation')?.closest('.field');if(locField)locField.after(field);else document.querySelector('#extraForm')?.prepend(field)}}};
  const priorTasksRender=renderTasks;renderTasks=function(seed=''){priorTasksRender(seed);const toolbar=document.querySelector('#app .module-toolbar');if(toolbar){toolbar.querySelector('.item-meta')?.remove();const b=toolbar.querySelector('button.primary');if(b){b.textContent='＋';b.setAttribute('aria-label','Añadir tarea');b.setAttribute('title','Añadir tarea')}}};
  window.openPlanLocationMap=function(){const q=document.querySelector('#extraLocation')?.value.trim()||'';window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q),'_blank','noopener')};
  
  // Update visible version marker and service worker cache.
})();
/* 5.59.1: repair shopping viewport after interrupted iOS layout/DOM updates. */
(function(){
 let repairing=false;
 function repair(){
  if(typeof screen==='undefined'||screen!=='Compras'||repairing)return;
  const app=document.getElementById('app');if(!app)return;
  const list=app.querySelector('#productList');
  if(!list||!app.querySelector('#productForm')){
   repairing=true;try{window.renderShopping?.()}finally{repairing=false}return;
  }
  if(!list.children.length){try{window.oihaneRefreshShoppingList?.()}catch(e){console.warn('Reparando lista',e)}}
 }
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestAnimationFrame(repair)});
 window.addEventListener('pageshow',()=>requestAnimationFrame(repair));
 document.addEventListener('click',e=>{if(e.target.closest('.shop-tabs,.shop-bought-toggle'))requestAnimationFrame(repair)},true);
})();