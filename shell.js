/* ============================================================
   Shared app shell — sidebar nav, animations, helpers
   ============================================================ */
(function(){
  const ICON = {
    grid:'<path d="M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round"/>',
    inbox:'<path d="M4 13l2.5-7h11L20 13M4 13v5a1 1 0 001 1h14a1 1 0 001-1v-5M4 13h4l1.5 2.5h5L16 13h4" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round"/>',
    bell:'<path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3C7.7 6.2 6 8.4 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
    plus:'<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    search:'<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M20 20l-3.2-3.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    check:'<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    db:'<ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" stroke="currentColor" stroke-width="1.6" fill="none"/>',
    pie:'<path d="M12 3a9 9 0 109 9h-9V3z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M12 3v9h9" stroke="currentColor" stroke-width="1.6" fill="none"/>',
    shield:'<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
    cash:'<rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.6" fill="none"/>',
    bot:'<rect x="4" y="8" width="16" height="11" rx="3" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 4v4M9 13h.01M15 13h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    compass:'<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
    chart:'<path d="M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-6" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/>',
    plug:'<path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 01-10 0V7zM12 16v5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    users:'<circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M16 5.2A3 3 0 0118 11M21 19c0-2.2-1.3-4-3.3-4.7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    gear:'<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  };

  const NAV = [
    {group:'Workspace', items:[
      {id:'cockpit', label:'Dashboard', icon:'grid', href:'cockpit.html'},
      {id:'mytasks', label:'내 업무', icon:'inbox'},
      {id:'alerts', label:'알림 / 승인', icon:'bell', badge:'3', warn:true},
    ]},
    {group:'Deal', items:[
      {id:'alldeal', label:'전체 Deal', icon:'layers'},
      {id:'newdeal', label:'신규 제안', icon:'plus', badge:'12'},
      {id:'review', label:'검토중', icon:'search', badge:'8', href:'deal.html'},
      {id:'screening', label:'심의중', icon:'check', badge:'5'},
      {id:'dropdb', label:'Drop딜 DB', icon:'db'},
    ]},
    {group:'Portfolio', items:[
      {id:'portfolio', label:'포트폴리오', icon:'pie'},
      {id:'aftercare', label:'사후관리 / 회수', icon:'shield', href:'portfolio.html'},
      {id:'cashflow', label:'현금흐름', icon:'cash'},
    ]},
    {group:'Data & AI', items:[
      {id:'agent', label:'AI Agent', icon:'bot'},
      {id:'similar', label:'유사사례 검색', icon:'compass'},
      {id:'market', label:'시장 데이터', icon:'chart'},
      {id:'erp', label:'ERP 연동 현황', icon:'plug'},
    ]},
    {group:'Admin', items:[
      {id:'users', label:'사용자 / 권한', icon:'users'},
      {id:'settings', label:'설정', icon:'gear'},
    ]},
  ];

  function svg(name){return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none">'+(ICON[name]||'')+'</svg>';}

  window.renderHeader = function(){
    const h = document.getElementById('appHeader');
    if(!h) return;
    h.innerHTML =
      '<a class="app-logo" href="cockpit.html"><img src="'+((window.__resources&&window.__resources.logo)||'assets/logo-fine.png')+'" alt="화인파트너스"></a>'+
      '<div class="header-ticker"><span class="ht-label"><span class="blink"></span>투자 유의사항</span><div class="ticker-viewport"><div class="ticker-track" id="tickerTrack"></div></div></div>'+
      '<div class="app-header-right">'+
        '<span class="ht-clock" id="tickerClock">실시간 · 09:42</span>'+
        '<span class="role-badge">심사역</span>'+
        '<div class="user-chip"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.8" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 19c0-3.1 2.9-5 6.5-5s6.5 1.9 6.5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>김화인</span></div>'+
      '</div>';
  };

  window.renderTicker = function(){
    const track = document.getElementById('tickerTrack');
    if(!track) return;
    const ITEMS = [
      {name:'한국은행 기준금리', val:'3.00%', dir:'flat', tag:'동결'},
      {name:'美 연준 금리', val:'4.50%', dir:'flat', tag:'동결'},
      {name:'국고채 3년', val:'2.92%', dir:'dn', chg:'▼0.03'},
      {name:'회사채 AA- 3년', val:'3.81%', dir:'up', chg:'▲0.05'},
      {name:'USD/KRW', val:'1,378', dir:'up', chg:'▲4.2'},
      {name:'LME 구리', val:'$9,840/t', dir:'up', chg:'▲1.8%', tag:'우진기전 원가'},
      {name:'REC 현물', val:'72,400원', dir:'dn', chg:'▼12% MoM', tag:'광명에너지'},
      {name:'KOSPI', val:'2,684', dir:'up', chg:'▲0.6%'},
      {name:'회수 지연', val:'3건 / 142억', dir:'dn', tag:'주의'},
      {name:'이번 달 순현금', val:'-68억', dir:'dn', tag:'Dry Powder 소진'},
      {name:'한일정밀 만기경과', val:'D+14', dir:'dn', tag:'긴급'},
    ];
    const build = () => ITEMS.map(it=>{
      const cls = it.dir==='up'?'ti-up':it.dir==='dn'?'ti-dn':'ti-flat';
      const chg = it.chg?` <span class="${cls}">${it.chg}</span>`:'';
      const tag = it.tag?` <span class="ti-tag">${it.tag}</span>`:'';
      return `<span class="ticker-item"><span class="ti-name">${it.name}</span><span class="ti-val ${cls}">${it.val}</span>${chg}${tag}</span>`;
    }).join('');
    track.innerHTML = build() + build();
    const clk = document.getElementById('tickerClock');
    function tick(){ if(clk) clk.textContent='실시간 · '+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}); }
    tick(); clearInterval(window.__tickerInt); window.__tickerInt=setInterval(tick,30000);
  };

  window.renderSidebar = function(activeId){
    renderHeader();
    renderTicker();
    const el = document.getElementById('sidebar');
    if(!el) return;
    let html = '';
    html += '<div class="sb-profile">'+
      '<div class="sb-ava"></div>'+
      '<div class="sb-prof-txt">'+
        '<div class="sb-prof-name">김화인 <span class="role">매니저</span></div>'+
        '<div class="sb-prof-dept">투자2 본부</div>'+
      '</div>'+
      '<button class="sb-collapse" title="접기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M9 4v16" stroke="currentColor" stroke-width="1.7"/></svg></button>'+
    '</div>';
    html += '<div class="sb-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none">'+ICON.search+'</svg><span>검색</span><span class="kbd">⌘K</span></div>';
    html += '<div class="sb-scroll">';
    NAV.forEach(g=>{
      html += '<div class="sb-group"><div class="sb-group-head">'+g.group+'</div>';
      g.items.forEach(it=>{
        const active = it.id===activeId ? ' active':'';
        const tag = it.href ? 'a' : 'div';
        const href = it.href ? ' href="'+it.href+'"' : '';
        let badge = '';
        if(it.badge) badge = '<span class="badge'+(it.warn?' warn':'')+' num">'+it.badge+'</span>';
        html += '<'+tag+href+' class="sb-link'+active+'" data-nav="'+it.id+'">'+svg(it.icon)+'<span>'+it.label+'</span>'+badge+'</'+tag+'>';
      });
      html += '</div>';
    });
    html += '</div>';
    el.innerHTML = html;

    // navigation for non-href items → gentle toast
    el.querySelectorAll('.sb-link:not([href])').forEach(n=>{
      if(n.dataset.nav) n.addEventListener('click',()=>{
        if(n.classList.contains('active'))return;
        window.toast && window.toast('해당 화면은 프로토타입 범위 밖이에요 — 연결된 3개 화면을 둘러보세요');
      });
    });
  };

  // ---- toast ----
  window.toast = function(msg){
    let t = document.getElementById('__toast');
    if(!t){ t=document.createElement('div'); t.id='__toast';
      t.style.cssText='position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(20px);background:#101828;color:#fff;font-size:13px;font-weight:500;padding:11px 18px;border-radius:11px;box-shadow:0 12px 32px rgba(16,24,40,.3);z-index:9999;opacity:0;transition:.3s;pointer-events:none;max-width:90vw';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
    clearTimeout(t._t); t._t=setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(20px)'; },2600);
  };

  // ---- robust reveal: visible by default, animate in if motion allowed ----
  window.initReveal = function(root){
    document.documentElement.classList.add('js');
    const els = [...(root||document).querySelectorAll('.reveal')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){ els.forEach(e=>e.classList.add('in')); return; }
    // stagger reveal by document order, with a hard failsafe so nothing stays hidden
    let i=0;
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(ent=>{
        if(ent.isIntersecting){ const el=ent.target; setTimeout(()=>el.classList.add('in'), (el._d||0)); io.unobserve(el); }
      });
    },{threshold:0.04, rootMargin:'0px 0px -4% 0px'});
    els.forEach(el=>{ el._d = Math.min(i*55,330); i++; io.observe(el); });
    // failsafe: guarantee visibility regardless of observer/animation state
    setTimeout(()=>els.forEach(e=>e.classList.add('in')), 1400);
  };

  // ---- slide panel with failsafe (transitions pause in backgrounded iframes) ----
  // Animates for foreground users; pins the end-state so it's guaranteed even if paused.
  window.slidePanel = function(el, open, hiddenTransform){
    if(!el) return;
    const end = open ? 'translateX(0)' : (hiddenTransform||'translateX(100%)');
    el.style.transition='';   // normal transition for the animation
    el.style.transform='';    // hand control back to CSS classes so it can animate
    el.classList.toggle('open', open);
    clearTimeout(el._ftf);
    el._ftf = setTimeout(()=>{ el.style.transition='none'; el.style.transform=end; }, 470);
  };
  window.fadeScrim = function(el, open){
    if(!el) return;
    el.style.transition=''; el.style.opacity=''; el.style.pointerEvents='';
    el.classList.toggle('open', open);
    clearTimeout(el._ftf);
    el._ftf = setTimeout(()=>{ el.style.transition='none'; el.style.opacity=open?'1':'0'; el.style.pointerEvents=open?'auto':'none'; }, 420);
  };

  // ---- count-up + reveal on load ----
  window.animateCounts = function(root){
    (root||document).querySelectorAll('[data-count]').forEach(el=>{
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.dec|0);
      const suffix = el.dataset.suffix||'';
      function fmt(v){ return v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
      // set FINAL value first as a fallback (in case all timers are paused)
      el.textContent = fmt(target)+suffix;
      const dur = 900; const start = performance.now();
      function step(now){
        const p = Math.min(1,(now-start)/dur);
        const e = 1-Math.pow(1-p,3);
        el.textContent = fmt(target*e)+suffix;
        if(p<1) requestAnimationFrame(step);
      }
      el.textContent = fmt(0)+suffix;
      requestAnimationFrame(step);
      // failsafe: setTimeout runs even when rAF is paused (backgrounded iframe)
      setTimeout(()=>{ el.textContent = fmt(target)+suffix; }, 1100);
    });
  };

  // ---- progress bar fill on load ----
  window.animateBars = function(root){
    (root||document).querySelectorAll('.prog > i, .bar-fill').forEach(el=>{
      const w = el.dataset.w || el.style.getPropertyValue('--w');
      if(w){ el.style.width='0'; requestAnimationFrame(()=>requestAnimationFrame(()=>{ el.style.width=w; })); }
    });
  };
})();
