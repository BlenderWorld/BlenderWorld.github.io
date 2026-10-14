'use strict';
(() => {
  const D = window.BLENDERWORLD;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => Number(v).toFixed(1);
  const dims = {scene_fidelity:'Scene fidelity',physics:'Physical plausibility',style_color:'Style & color',realism:'Realism',layout_spatial:'Spatial layout',proportion_scale:'Proportion & scale',lighting_material:'Lighting & materials',completeness:'Completeness'};
  const state = {tableView:'completion',sort:'score',direction:-1,category:D.categories[0].name,galleryCategory:'All',galleryKind:'all',galleryModel:'All',expanded:false,task:null,model:0,view:'render',render:0};
  let viewerModule, mediaVersion = 0, previousHash = '#showcase';
  const modelIcon = m => `<img class="model-icon" src="assets/model-icons/${esc(m.brand)}.svg" alt="" aria-hidden="true" width="26" height="26">`;
  const hasVideo = c => c.models.some(m=>m.videos.length);
  const caseKind = c => c.showcase_type || (hasVideo(c)?'motion':'object');
  const firstPageSize = 9;
  const pausePreviews = () => $$('.card-motion').forEach(v=>v.pause());
  const showcaseModels = D.models.filter(m=>D.cases.some(c=>c.models.some(x=>x.name===m.name)));
  const matchesModel = c => state.galleryModel==='All'||c.models.some(m=>m.name===state.galleryModel);
  const scoreObservers = new WeakMap();
  function revealScoreBars(container) {
    // Each bar reveals on entry, including rows and columns reached on a phone.
    scoreObservers.get(container)?.disconnect();
    const bars = [...container.querySelectorAll('[data-score-bar]')];
    if(matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    bars.forEach(bar => bar.classList.add('score-bar-pending'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({target,isIntersecting}) => {
        if(!isIntersecting) return;
        target.classList.remove('score-bar-pending');
        target.classList.add('score-bar-revealed');
        observer.unobserve(target);
      });
    }, {threshold:0.2,rootMargin:'0px 0px -24px 0px'});
    bars.forEach(bar => observer.observe(bar));
    scoreObservers.set(container,observer);
  }
  function cardModel(c) {
    const query=$('#gallery-search').value.trim().toLowerCase();
    return c.models.find(m=>m.name===state.galleryModel)
      || (query&&c.models.find(m=>m.name.toLowerCase().includes(query)))
      || c.models.find(m=>m.name===c.default_model) || c.models[0];
  }

  function renderTable() {
    const cols = state.tableView === 'completion'
      ? [['name','Model'],['score','Overall'],['text','Text'],['mm','MM'],['rubric','Rubric'],['dimension','Dimension'],['perfect','Full pass']]
      : [['name','Model'],['score','Overall'],['turns','Turns'],['tokens','Output tokens (K)'],['tools','Tool calls']];
    $('#score-head').innerHTML = `<tr><th scope="col">#</th>${cols.map(([k,label]) => `<th scope="col" ${state.sort===k ? `aria-sort="${state.direction===-1?'descending':'ascending'}"` : ''}><button data-sort="${k}" aria-label="Sort by ${esc(label.replace(' ↑',''))}">${label} ${state.sort===k ? (state.direction===-1?'↓':'↑') : ''}</button></th>`).join('')}</tr>`;
    const query = $('#model-search').value.trim().toLowerCase();
    const rows = D.models.filter(m => m.name.toLowerCase().includes(query)).sort((a,b) => (state.sort==='name' ? a.name.localeCompare(b.name) : a[state.sort]-b[state.sort]) * state.direction || a.rank-b.rank);
    $('#score-body').innerHTML = rows.map((m,i) => `<tr class="${m.rank===1?'top-model':''}"><td>${String(m.rank).padStart(2,'0')}</td>${cols.map(([k]) => {
      if(k==='name') return `<td><span class="model-name">${modelIcon(m)}${esc(m.name)}</span></td>`;
      if(k==='score') return `<td class="score-cell score-cell--score"><span class="score-meter" data-score-bar style="--value:${m.score}%;--bar-delay:${Math.min(i,6)*35}ms"><span class="score-fill" aria-hidden="true"></span><span class="score-value">${num(m.score)}</span></span></td>`;
      if(k==='perfect') return `<td class="score-cell--perfect"><span class="score-value">${m.perfect < 10 ? m.perfect.toFixed(2) : num(m.perfect)}%</span></td>`;
      return `<td>${num(m[k])}</td>`;
    }).join('')}</tr>`).join('') || `<tr><td colspan="${cols.length+1}" class="empty-state">No model matches your search.</td></tr>`;
    revealScoreBars($('#score-body'));
    $('#table-note').textContent = state.tableView==='completion'
      ? 'Main-table results · 223 tasks · GPT-5.6-terra judge · Higher is better. Overall bars use pale 100-point tracks. Click a column heading to sort. On small screens, swipe the table to see all columns.'
      : 'Mean per-task rollout statistics from the supplied manuscript. K = 1,000 output tokens. Lower resource use alone does not imply better performance. Rank # refers to overall performance.';
    $$('#score-head [data-sort]').forEach(b => b.addEventListener('click', () => {const k=b.dataset.sort;state.direction=state.sort===k?-state.direction:k==='name'?1:-1;state.sort=k;renderTable();}));
  }
  $$('[data-table-view]').forEach(b => b.addEventListener('click', () => {
    state.tableView=b.dataset.tableView;state.sort='score';state.direction=-1;
    $$('[data-table-view]').forEach(x => {const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',active);});renderTable();
  }));
  $('#model-search').addEventListener('input',renderTable);

  function renderCategory() {
    const cat=D.categories.find(c=>c.name===state.category);
    $('#chart-title').textContent=cat.name;
    $('#chart-count').textContent=`${cat.count} benchmark tasks`;
    $('#category-select').value=cat.name;
    $$('#category-list button').forEach(b=>{const on=b.dataset.category===cat.name;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});
    const models=[...D.models].sort((a,b)=>b.categories[cat.name]-a.categories[cat.name]);
    $('#category-bars').innerHTML=models.map((m,i)=>`<div class="chart-row"><span class="chart-row-name">${modelIcon(m)}<span>${esc(m.name)}</span></span><div class="chart-track" data-score-bar aria-hidden="true" style="--bar-delay:${Math.min(i,6)*35}ms"><div class="chart-fill score-fill" style="--value:${m.categories[cat.name]}%"></div></div><span class="chart-row-value">${num(m.categories[cat.name])}</span></div>`).join('');
    revealScoreBars($('#category-bars'));
  }
  $('#category-select').innerHTML=D.categories.map(c=>`<option>${esc(c.name)}</option>`).join('');
  $('#category-list').innerHTML=D.categories.map(c=>`<button data-category="${esc(c.name)}" aria-pressed="false">${esc(c.name)}<span>${c.count}</span></button>`).join('');
  $$('#category-list button').forEach(b=>b.addEventListener('click',()=>{state.category=b.dataset.category;renderCategory();}));
  $('#category-select').addEventListener('change',e=>{state.category=e.target.value;renderCategory();});

  function filteredCases() {
    const query=$('#gallery-search').value.trim().toLowerCase();
    return D.cases.filter(c=>matchesModel(c)&&(state.galleryKind==='all'||caseKind(c)===state.galleryKind)&&(state.galleryCategory==='All'||c.category===state.galleryCategory)&&`${c.title} ${c.id} ${c.category} ${c.description} ${hasVideo(c)?'video animation motion':''} ${c.models.filter(m=>state.galleryModel==='All'||m.name===state.galleryModel).map(m=>m.name).join(' ')}`.toLowerCase().includes(query));
  }
  function renderGallery() {
    pausePreviews();
    const filtered=filteredCases(), visible=state.expanded?filtered:filtered.slice(0,firstPageSize);
    $('#gallery-count').textContent=`Showing ${visible.length} of ${filtered.length} tasks`;
    $('#show-more').hidden=filtered.length<=firstPageSize;
    $('#show-more').innerHTML=state.expanded?'Show fewer tasks ↑':`View all ${filtered.length} tasks ↓`;
    $('#showcase-grid').innerHTML=visible.map((c,i)=>{
      const m=cardModel(c);
      const video=m.videos[0];
      const visual=m.preview_video?`<video class="card-motion" muted playsinline loop preload="none" poster="${m.thumbnail}" data-preview-src="${m.preview_video}" aria-hidden="true"></video>`:`<img src="${m.thumbnail}" alt="${esc(c.title)} — ${esc(m.name)} render" loading="lazy" width="800" height="550">`;
      const viewLabel=video?`▶ Play video${video.duration?` · ${Number(video.duration.toFixed(1))}s`:''}`:'◇ Explore 3D';
      return `<button class="showcase-card" data-case="${c.id}" data-model="${esc(m.name)}" aria-label="${video?'Watch':'Explore'} ${esc(c.title)} — ${esc(m.name)} — ${esc(c.category)}"><div class="card-image">${visual}<span class="card-view ${video?'video-badge':''}">${viewLabel}</span>${c.models.length>1?`<span class="compare-badge">Compare ${c.models.length} models</span>`:''}</div><div class="card-info"><div class="card-eyebrow"><span>${esc(c.category)}</span><span>${c.modality==='text'?'Text brief':c.modality+' input'}</span></div><h3>${esc(c.title)}</h3><p class="card-description">${esc(c.description)}</p><div class="card-bottom"><span class="card-model">${modelIcon(m)}${esc(m.name)}</span><b>${num(m.score)}<small> / 100</small></b></div></div></button>`;
    }).join('') || '<p class="empty-state">No scenes found. Try another category or search term.</p>';
    $$('[data-case]').forEach(b=>{
      b.addEventListener('click',()=>openCase(b.dataset.case,b.dataset.model));
      const video=b.querySelector('.card-motion');if(!video)return;
      const play=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||dialog.open)return;if(!video.src)video.src=video.dataset.previewSrc;video.play().catch(()=>{});};
      b.addEventListener('mouseenter',()=>{if(matchMedia('(hover: hover)').matches)play();});
      b.addEventListener('focus',play);b.addEventListener('mouseleave',()=>video.pause());b.addEventListener('blur',()=>video.pause());
    });
    $$('#gallery-filters button').forEach(b=>{const on=b.dataset.filter===state.galleryCategory;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);const count=D.cases.filter(c=>matchesModel(c)&&(state.galleryKind==='all'||caseKind(c)===state.galleryKind)&&(b.dataset.filter==='All'||c.category===b.dataset.filter)).length;b.querySelector('small').textContent=count;b.disabled=!count;});
    $$('[data-gallery-kind]').forEach(b=>{const on=b.dataset.galleryKind===state.galleryKind;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);b.querySelector('span').textContent=D.cases.filter(c=>matchesModel(c)&&(b.dataset.galleryKind==='all'||caseKind(c)===b.dataset.galleryKind)).length;});
  }
  $('#gallery-filters').innerHTML=[{name:'All',label:'All categories',count:D.cases.length},...D.categories.map(c=>({name:c.name,label:c.name,count:D.cases.filter(x=>x.category===c.name).length}))].map(c=>`<button class="filter-chip" data-filter="${esc(c.name)}" aria-pressed="false">${esc(c.label)}<small>${c.count}</small></button>`).join('');
  $('#gallery-kinds').innerHTML=[['all','All works'],['scene','Large scenes'],['motion','Video & animation'],['object','Objects & details']].map(([kind,label])=>`<button data-gallery-kind="${kind}" aria-pressed="false">${label}<span>${D.cases.filter(c=>kind==='all'||caseKind(c)===kind).length}</span></button>`).join('');
  $$('[data-gallery-kind]').forEach(b=>b.addEventListener('click',()=>{state.galleryKind=b.dataset.galleryKind;state.galleryCategory='All';state.expanded=false;renderGallery();}));
  $('#showcase-summary').textContent=`${showcaseModels.length} models · ${D.cases.length} tasks · ${D.cases.reduce((n,c)=>n+c.models.length,0)} artifacts`;
  $('#gallery-model').innerHTML='<option value="All">All models</option>'+showcaseModels.map(m=>`<option value="${esc(m.name)}">${esc(m.name)} · ${D.cases.filter(c=>c.models.some(x=>x.name===m.name)).length} works</option>`).join('');
  $('#gallery-model').addEventListener('change',e=>{state.galleryModel=e.target.value;state.expanded=false;renderGallery();});
  $$('#gallery-filters button').forEach(b=>b.addEventListener('click',()=>{state.galleryCategory=b.dataset.filter;state.expanded=false;renderGallery();}));
  $('#gallery-search').addEventListener('input',()=>{state.expanded=false;renderGallery();});
  $('#show-more').addEventListener('click',()=>{state.expanded=!state.expanded;renderGallery();if(!state.expanded)$('#showcase').scrollIntoView({behavior:'smooth'});});

  const heroCases=[['src_zhixun_0908_006','GPT-6-Astra'],['src_bl_t010','Qwen3.8-Max'],['src_bl_t019','Opus-5']].map(([id,name])=>({c:D.cases.find(x=>x.archive_id===id),name}));
  $('#hero-gallery').innerHTML=heroCases.map(({c,name},i)=>{
    const m=c.models.find(m=>m.name===name),video=m.videos.length>0;
    return `<button class="hero-tile" data-hero="${c.id}" data-model="${esc(m.name)}" aria-label="${video?'Watch':'Explore'} ${esc(c.title)} — ${esc(m.name)}"><img src="${m.images[0].src}" alt="${esc(c.title)} — ${esc(m.name)}" width="850" height="550" ${i===0?'fetchpriority="high"':''}><span class="hero-tile-label"><span><small>${esc(m.name)} · ${num(m.score)}</small><strong>${esc(c.title)}</strong></span><span aria-hidden="true">${video?'▶':'↗'}</span></span></button>`;
  }).join('');
  $$('[data-hero]').forEach(b=>b.addEventListener('click',()=>openCase(b.dataset.hero,b.dataset.model)));

  const dialog=$('#task-dialog');
  function currentModel(){return state.task.models[state.model];}
  function loadViewer(){
    window.ModelViewerElement ||= {};
    window.ModelViewerElement.dracoDecoderLocation=new URL('vendor/draco/',document.baseURI).href;
    if(!viewerModule) viewerModule=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.type='module';script.src='vendor/model-viewer.min.js';
      script.onerror=()=>{viewerModule=null;script.remove();reject(new Error('The 3D viewer could not load.'));};
      script.onload=()=>customElements.whenDefined('model-viewer').then(()=>{
        customElements.get('model-viewer').dracoDecoderLocation=new URL('vendor/draco/',document.baseURI).href;
        resolve();
      });document.head.append(script);
    });
    return viewerModule;
  }
  async function setView(view) {
    const m=currentModel(), version=++mediaVersion;
    if(view==='video'&&!m.videos.length)view='render';
    state.view=view;
    $$('[data-view]').forEach(b=>{const active=b.dataset.view===view;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;});
    $('#media-stage').setAttribute('aria-labelledby',`${view==='model'?'model':view}-tab`);
    $('#render-thumbs').innerHTML='';
    const stage=$('#media-stage');stage.replaceChildren();
    if(view==='render') {
      const img=m.images[state.render]||m.images[0];
      stage.innerHTML=`<a class="full-render" href="${img.src}" target="_blank" rel="noopener" aria-label="Open rendered image at full size"><img src="${img.src}" alt="${esc(state.task.title)} rendered by ${esc(m.name)}"></a>`;
      $('#media-caption').textContent=(img.kind==='video-frame'?`Frame extracted from the original submitted animation at ${img.time.toFixed(2)}s.`:img.kind==='evaluation-render'?'Render used in the frozen paper evaluation of this submitted Blender project.':'Original submitted render.')+' Select an image below, or open the image to inspect it at full size.';
      $('#render-thumbs').innerHTML=m.images.map((im,i)=>`<button class="${i===state.render?'active':''}" data-render="${i}" aria-label="Show render ${i+1}" aria-pressed="${i===state.render}"><img src="${im.src}" alt="Render ${i+1}"></button>`).join('');
      $$('[data-render]').forEach(b=>b.addEventListener('click',()=>{state.render=Number(b.dataset.render);setView('render');}));
    } else if(view==='video') {
      const video=m.videos[0];
      stage.innerHTML=`<video controls controlslist="nodownload" playsinline preload="metadata" poster="${m.images[0].src}" aria-label="Original submitted animation"><source src="${video.src}"></video>`;
      stage.querySelector('video').play().catch(()=>{});
      $('#media-caption').textContent=`Original submitted animation${video.duration?` · ${Number(video.duration.toFixed(2))}s · ${video.width} × ${video.height} · ${video.fps} fps`:''}. Use the playback controls to review the motion.`;
    } else {
      stage.innerHTML='<span class="viewer-status" role="status">Loading the 3D scene…</span>';
      const previewNote=m.preview_note?' '+m.preview_note:state.task.id==='bw_0037'?' Room enclosure surfaces are hidden for a cutaway view.':state.task.id==='bw_0174'?' Background grass is omitted for smooth interaction.':'';
      $('#media-caption').textContent='Drag to orbit · Scroll or pinch to zoom. Optimized static preview; large studio surrounds may be omitted. Blender shaders, lighting, hair and simulations may differ. The original renders are the scoring evidence.'+previewNote;
      try {
        await loadViewer();
        if(version!==mediaVersion||!dialog.open)return;
        const viewer=document.createElement('model-viewer');
        const attrs={src:m.glb,alt:`Interactive 3D preview of ${state.task.title}, generated by ${m.name}`,'camera-controls':'','touch-action':'pan-y','interaction-prompt':'none','environment-image':'neutral','shadow-intensity':'0.6',exposure:'1','camera-orbit':'35deg 68deg auto','min-camera-orbit':'auto 5deg auto','max-camera-orbit':'auto 175deg auto',loading:'eager'};
        if(state.task.id==='bw_0043'&&m.name==='GPT-6-Astra')Object.assign(attrs,{'camera-target':'0m .06m 0m','camera-orbit':'35deg 40deg .32m','min-camera-orbit':'auto 5deg .05m'});
        if(state.task.id==='bw_0101'&&m.name==='GPT-6-Astra')Object.assign(attrs,{'camera-target':'4.8m 3m 0m','camera-orbit':'35deg 62deg 35m','min-camera-orbit':'auto 5deg 1m'});
        if(m.preview_camera)Object.assign(attrs,m.preview_camera);
        Object.entries(attrs).forEach(([k,v])=>viewer.setAttribute(k,v));
        viewer.addEventListener('load',()=>{if(version===mediaVersion){stage.querySelector('.viewer-status')?.remove();viewer.dataset.loaded='true';}});
        viewer.addEventListener('error',()=>{if(version===mediaVersion){stage.querySelector('.viewer-status')?.remove();const error=document.createElement('p');error.className='viewer-error';error.textContent='This browser could not display the scene. Try a browser with WebGL enabled, or switch to the rendered images.';stage.append(error);}});
        stage.prepend(viewer);
      } catch(e) {
        if(version===mediaVersion)stage.innerHTML='<p class="viewer-error">The 3D viewer could not load. Reload the page or switch to the rendered images.</p>';
      }
    }
  }
  function renderScores() {
    const m=currentModel(),details=m.details;
    $('#detail-scores').innerHTML=[['Overall',m.score],['Rubric',m.rubric],['Dimension',m.dimension]].map(([label,v])=>`<div><span>${label}</span><strong>${num(v)}</strong></div>`).join('');
    $('#dimension-bars').innerHTML=details.dimensions.map(d=>`<div class="dimension-row" title="${esc(d.reasons)}"><span>${esc(dims[d.id]||d.id)}</span><div class="dimension-track" aria-hidden="true"><span style="--value:${d.score*10}%"></span></div><span>${d.score}/10</span></div>`).join('');
    $('#judge-notes').textContent=details.notes;
    const passed=details.criteria.filter(c=>c.score===1).length;
    $('#rubric-summary').textContent=`Task-specific rubric decisions · ${passed} / ${details.criteria.length} passed`;
    $('#rubric-decisions').innerHTML=details.criteria.map(c=>`<article class="rubric-item"><span class="rubric-state ${c.score===1?'':'fail'}" aria-label="${c.score===1?'Pass':'Fail'}">${c.score===1?'✓':'×'}</span><div><small>${esc(c.id)} · ${c.score===1?'Pass':'Fail'}${c.evidence_type?` · ${esc(c.evidence_type==='render'?'Visual evidence':'Scene inspection')}`:''}</small><h4>${esc(c.criterion||'Task-specific requirement')}</h4><p>${esc(c.evidence)}</p></div></article>`).join('');
    $('#video-tab').hidden=!m.videos.length;
    $('#submission-note').hidden=!m.submission_note;
    $('#submission-note').textContent=m.submission_note||'';
    $('.judge-notes').open=false;
  }
  function openCase(id,modelName) {
    const c=D.cases.find(c=>c.id===id);if(!c)return;
    $('#intro-player').pause();
    pausePreviews();
    if(!dialog.open)previousHash=location.hash.startsWith('#case=')?'#showcase':location.hash||'#showcase';
    state.task=c;state.model=Math.max(0,c.models.findIndex(m=>m.name===(modelName||cardModel(c).name)));state.render=0;
    $('#detail-title').textContent=c.title;$('#detail-category').textContent=c.category;
    $('#detail-id').textContent=`${c.id} · ${c.modality==='text'?'Text brief':c.modality+' input'}`;
    $('#detail-description').textContent=c.description;
    $('#detail-model').innerHTML=c.models.map((m,i)=>`<option value="${i}">${esc(m.name)}</option>`).join('');
    $('#detail-model').value=state.model;
    $('#detail-query').textContent=c.query;
    $('#detail-attachments').innerHTML=c.attachments.map(a=>`<span class="attachment-label">Attachment: ${esc(a.name)}</span>`).join('');
    $('#detail-references').innerHTML=c.references.length?c.references.map(r=>`<div class="reference-item">${r.type==='video'?`<video controls controlslist="nodownload" playsinline preload="metadata" aria-label="Input reference video"><source src="${r.src}"></video>`:`<a href="${r.src}" target="_blank" rel="noopener"><img src="${r.src}" alt="Original input reference for ${esc(c.title)}"></a>`}${r.source_url&&/^https?:/.test(r.source_url)?`<a href="${esc(r.source_url)}" target="_blank" rel="noopener">Reference source ↗</a>`:''}</div>`).join(''):'<p>This is a text-only task. The scene is specified by the brief and any attached specifications.</p>';
    $('.rubric-details').open=false;renderScores();
    if(!dialog.open){dialog.showModal();document.body.classList.add('dialog-open');}
    dialog.scrollTop=0;setView(currentModel().videos.length?'video':'render');
    updateCaseLink();
  }
  function updateCaseLink(){history.replaceState(null,'',`#case=${state.task.id}&model=${encodeURIComponent(currentModel().name)}`);}
  function cleanupDialog(){
    mediaVersion++;$('#media-stage').replaceChildren();
    $$('#detail-references video').forEach(v=>v.pause());document.body.classList.remove('dialog-open');
    history.replaceState(null,'',previousHash);
  }
  $('#close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',cleanupDialog);
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  $('#detail-model').addEventListener('change',e=>{state.model=Number(e.target.value);state.render=0;renderScores();setView(state.view);updateCaseLink();});
  $$('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('.detail-tabs').addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    const tabs=$$('[data-view]').filter(b=>!b.hidden),i=tabs.indexOf(document.activeElement);if(i<0)return;
    e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    tabs[next].focus();setView(tabs[next].dataset.view);
  });
  function stepTask(delta){const modelName=currentModel().name,filtered=filteredCases(),list=(filtered.length?filtered:D.cases).filter(c=>c.models.some(m=>m.name===modelName));let i=list.findIndex(c=>c.id===state.task.id);openCase(list[(i+delta+list.length)%list.length].id,modelName);}
  $('#previous-task').addEventListener('click',()=>stepTask(-1));$('#next-task').addEventListener('click',()=>stepTask(1));
  $('#human-body').innerHTML=D.human_alignment.map(m=>`<tr><td>${esc(m.model)}</td><td>${m.agreement.toFixed(2)}%</td><td>${m.spearman.toFixed(3)}</td></tr>`).join('');
  renderTable();renderCategory();renderGallery();
  function openDeepLink(){const params=new URLSearchParams(location.hash.slice(1));if(/^bw_\d{4}$/.test(params.get('case')||''))openCase(params.get('case'),params.get('model'));}
  openDeepLink();window.addEventListener('hashchange',openDeepLink);
})();
