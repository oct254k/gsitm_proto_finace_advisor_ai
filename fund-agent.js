/* ===== FUND: 원본 대조 패널 + 인터랙션 + AI Agent ===== */
(function(){
  const TABS = window.__fund.TABS;

  /* ---- 결과 화면이 렌더된 뒤 호출됨 (fund.js 의 goDone) ---- */
  window.__fundBindResults = function(){
    const tabBody = document.getElementById('tabBody');
    if(!tabBody) return;
    tabBody.style.transition='opacity .2s';
    document.querySelectorAll('.c-tab').forEach(tab=>{
      if(tab._b) return; tab._b=1;
      tab.addEventListener('click',()=>{
        document.querySelectorAll('.c-tab').forEach(t=>t.classList.remove('on'));
        tab.classList.add('on');
        tabBody.style.opacity='0';
        setTimeout(()=>{
          tabBody.innerHTML = TABS[tab.dataset.tab];
          tabBody.style.opacity='1';
          bindSendables();
          animateBars(tabBody);
          animateCounts(tabBody);
          initReveal(tabBody);
        },130);
      });
    });
    const drop = document.querySelector('[data-drop]');
    if(drop && !drop._b){ drop._b=1; drop.addEventListener('click',()=>{
      document.querySelector('[data-tab="rules"]').click();
      setTimeout(()=>toast('보완 요구서 초안 생성 (프로토타입) — 서면 요구 5개 항목이 담깁니다'),260);
    });}
    bindSendables();
  };

  /* ================= 원본 대조 패널 ================= */
  const refPanel = document.getElementById('refPanel');
  refPanel.innerHTML = `
    <div class="rp-head"><div class="rp-head-title">원본 대조</div><button class="rp-close">✕</button></div>
    <div class="rp-tabs"><div class="rp-tab on" data-rt="ledger">기준가대장</div><div class="rp-tab" data-rt="im">제안서</div><div class="rp-tab" data-rt="reason">하락사유서</div><div class="rp-tab" data-rt="review">검토보고서</div></div>
    <div class="rp-body" id="rpBody"></div>`;
  const rpBody = document.getElementById('rpBody');

  const RP = {
    ledger:`<div class="viewer-nav"><button class="nav-btn">← 이전</button><span style="font-size:10.5px;color:var(--t3)">기준가격대장_Fortress-A.xlsx · 행 364 / 3,151</span><button class="nav-btn">다음 →</button></div>
      <div class="im-page"><div class="im-pnum">— Sheet1 · 행 360~370 —</div><h4>① 숫자 — 시계열 원천</h4>
      <div style="overflow-x:auto"><table class="led-tbl">
        <tr><th>No</th><th>일자</th><th>종류운용</th><th>Class A</th><th>Class C1</th></tr>
        <tr><td>361</td><td>2018-05-12</td><td>1,193.20</td><td>1,175.4</td><td>1,171.0</td></tr>
        <tr><td>362</td><td>2018-05-13</td><td>1,193.21</td><td>1,175.4</td><td>1,171.0</td></tr>
        <tr><td>363</td><td>2018-05-14</td><td>1,196.80</td><td>1,178.7</td><td>1,174.2</td></tr>
        <tr class="mark"><td>364</td><td>2018-05-15</td><td>1,198.05</td><td>1,179.88</td><td>1,175.4</td></tr>
        <tr><td>365</td><td>2018-05-16</td><td>1,195.11</td><td>1,176.9</td><td>1,172.3</td></tr>
        <tr><td>⋮</td><td>⋮</td><td>⋮</td><td>⋮</td><td>⋮</td></tr>
        <tr class="mark"><td>532</td><td>2018-10-30</td><td>1,021.42</td><td>998.22</td><td>993.1</td></tr>
      </table></div>
      <p style="margin-top:11px">노란 행 = <span class="hl">MDD 구간의 고점(행 364)과 저점(행 532)</span>. 화면의 <b>-15.40%</b>는 이 두 행에서 직접 계산됩니다: 998.22 ÷ 1,179.88 − 1.</p>
      <p><b>주말 행 포함</b>: 이 대장은 영업일이 아니라 <span class="hl">달력일 기준</span>이라 주말 900행(28.6%)이 값 그대로 이월돼 있습니다. 연환산 시 √252가 아니라 <span class="hl">√365</span>를 써야 합니다.</p>
      </div>
      <div class="viewer-foot">노란 하이라이트 = 화면 수치가 참조한 행 · 좌측 수치 클릭 → 해당 행으로 이동</div>`,

    im:`<div class="viewer-nav"><button class="nav-btn">← 이전</button><span style="font-size:10.5px;color:var(--t3)">IM_Fortress-A_제안서.pdf · p.8 / 23</span><button class="nav-btn">다음 →</button></div>
      <div class="im-page"><div class="im-pnum">— 8 —</div><h4>② 약속 — 운용펀드 현황</h4>
      <table class="im-tbl"><tr><th>구분</th><th>설정일</th><th>설정이후</th><th>연환산<br>(기하)</th><th>연환산<br>변동성</th><th>Sharpe</th></tr>
        <tr><td>Fortress-A</td><td>2017.05.17</td><td>224.79%</td><td>14.47%</td><td>10.42%</td><td>1.19</td></tr>
        <tr><td>Saber-G</td><td>2017.05.11</td><td>213.68%</td><td>13.98%</td><td>10.97%</td><td>1.12</td></tr>
        <tr><td>Saber-V</td><td>2017.05.11</td><td>272.02%</td><td>16.23%</td><td>10.80%</td><td>1.32</td></tr></table>
      <p style="margin-top:10px">* 2026.01.31 기준</p>
      <p>※ <span class="hl">각종 보수 및 수수료 차감 전 운용펀드 수익률 기준</span>, 변동성(표준편차) 수치는 일일 수익률 기준</p>
      <div style="height:10px"></div>
      <div class="im-pnum">— 4 —</div><h4>전략 비중 (NAV 대비)</h4>
      <table class="im-tbl"><tr><th>주식</th><th>메자닌</th><th>이벤트</th><th>헤지</th></tr>
        <tr><td class="hl">20~60%</td><td>30~50%</td><td>0~15%</td><td>0~15%</td></tr></table>
      <p style="margin-top:10px">사유서 p.1 실제 주식 Long <span class="hl">53.05%</span> → 밴드 <b>안</b>. (도넛 차트 라벨이 값 뒤에 오는 레이아웃이라 좌표 기준으로 재확인했고, 검토보고서 p.1 "자산배분: 주식 20~60%, 메자닌 30~50%"와 일치합니다.)</p>
      <div style="height:10px"></div>
      <div class="im-pnum">— 14 —</div><h4>보수 · 수수료 (부록)</h4>
      <table class="im-tbl"><tr><th>구분</th><th>A</th><th>C1</th></tr>
        <tr><td>총보수</td><td class="hl">1.57%</td><td>2.07%</td></tr>
        <tr><td>성과보수</td><td colspan="2" class="hl">운용성과의 15% · High-Water Mark</td></tr>
        <tr><td>환매수수료</td><td colspan="2">90일 미만 이익금의 70%</td></tr></table>
      <p style="margin-top:10px">• TRS(Total Return Swap)를 포함한 장내·장외 파생상품 · 레버리지 한도 <span class="hl">400% 이하</span>(p.18)</p>
      <div style="height:10px"></div>
      <div class="im-pnum">— 7 —</div>
      <p>※ <span class="hl">KOSPI 지수는 단순 참고지수로서, 상기 투자신탁의 비교지수(Benchmark Index)가 아닙니다.</span></p>
      <p style="color:var(--amber);font-weight:600">→ 보수는 부록 p.14에 있으나, <b>목표수익률·위험등급·MDD는 제안서 23p 어디에도 없습니다</b>(검토보고서에 있음).</p>
      </div>
      <div class="viewer-foot">노란 하이라이트 = 3장 검증이 인용한 위치 · 총 23p 파싱 완료</div>`,

    review:`<div class="viewer-nav"><button class="nav-btn">← 이전</button><span style="font-size:10.5px;color:var(--t3)">검토보고서_투자_GVA Fortress-A.pdf · p.2 / 9</span><button class="nav-btn">다음 →</button></div>
      <div class="im-page"><div class="im-pnum">— 2 —</div><h4>④ 판단 — 화인 자금부 검토보고서 (2026.2)</h4>
      <table class="im-tbl"><tr><th>'26.1월말 기준</th><th>Fortress-A</th><th>KOSPI</th></tr>
        <tr><td>설정이후 누적수익률</td><td>224.79%</td><td>127.61%</td></tr>
        <tr><td>연환산 수익률</td><td>14.47%</td><td>9.89%</td></tr>
        <tr><td>연환산 변동성</td><td>10.42%</td><td>18.41%</td></tr>
        <tr><td>샤프지수</td><td>1.19</td><td>0.44</td></tr>
        <tr><td>최대낙폭</td><td class="hl">15.60%</td><td>43.90%</td></tr>
        <tr><td>Win ratio</td><td>64.76%</td><td>55.24%</td></tr></table>
      <div style="height:10px"></div>
      <div class="im-pnum">— 4 —</div><h4>펀드 개요</h4>
      <p>• 운용목표 — <span class="hl">IRR 10%</span> &nbsp;• 예상운용기간 — 펀드 매수 이후 3년 &nbsp;• 가입금액 — 20억원</p>
      <p>• 펀드 보수 — 총보수 A클래스 <span class="hl">1.57%</span>(판매보수 1%), C1 2.07% / 성과보수 <span class="hl">운용성과의 15%(High-Water Mark)</span></p>
      <p>• 순자산 4,598억 / <span class="hl">레버리지 한도 400% 이하</span> / 최소 가입금액 3억</p>
      <div style="height:10px"></div>
      <div class="im-pnum">— 1 —</div>
      <p>자산배분: <span class="hl">주식 20~60%, 메자닌 30~50%, 이벤트 드리븐 0~15%, 헤지 0~15%</span></p>
      <p style="color:var(--green);font-weight:600">→ 목표 IRR 10% · MDD 15.60% · 총보수 1.57% — <b>기준선의 절반이 여기 있습니다.</b> 인풋을 3종으로 한정하면 전부 "미기재"로 오판합니다.</p>
      </div>
      <div class="viewer-foot">화인 자금부 작성 · 9p + 품의서 34p 파싱 완료</div>`,

    reason:`<div class="viewer-nav"><button class="nav-btn">← 이전</button><span style="font-size:10.5px;color:var(--t3)">관리_펀드현황(기준가 하락사유)_260604.pdf · p.1 / 2</span><button class="nav-btn">다음 →</button></div>
      <div class="im-page"><div class="im-pnum">— 1 —</div><h4>③ 설명 — 최근 기준가격 하락 사유</h4>
      <p>지난 <span class="hl">26.05.28. 본 펀드 수익증권에 대한 환매 청구를 진행하신 날</span>을 포함하여, 전일(26.06.03.)까지의 본 펀드 수익률(운용펀드 기준)은 약 <span class="hl">-7.83%</span> 수준으로, 동기간 KOSPI 지수는 약 +6.96%, KOSDAQ 지수는 약 -9.45%를 각 기록하였습니다.</p>
      <p>[주식 Long -5.80%, 메자닌 Long -1.44%, 이벤트드리븐 0.01%, <span class="hl">변동성 트레이딩(헤지) 0.05%</span>, Pair trading -0.67%]</p>
      <p>주식 Long 전략이 차지하고 있는 비중은 <span class="hl">53.05%</span>(총 44건 종목, 단순평균 비중 1.21%)이며…</p>
      <table class="im-tbl"><tr><th>시장구분</th><th>대형주</th><th>중형주</th><th>소형주</th><th>합계</th></tr>
        <tr><td>KOSPI</td><td>7.26%</td><td>4.67%</td><td>10.08%</td><td>22.01%</td></tr>
        <tr><td>KOSDAQ</td><td>6.84%</td><td>20.42%</td><td>2.37%</td><td>29.63%</td></tr>
        <tr><td>합계</td><td>14.10%</td><td>25.09%</td><td>12.45%</td><td>51.64%</td></tr></table>
      <p>대형주 약 27%, <span class="hl">중소형주 약 73%</span> 수준을 나타내고 있습니다.</p>
      <p style="color:var(--red);font-weight:600">→ 이 문서가 설명하는 26.05.28~06.03은 대장 범위(~25.12.31) 밖입니다. 매칭 불가.</p>
      <p style="color:var(--amber);font-weight:600">→ 주식 Long 53.05%는 약속 밴드 20~60% 안. 다만 하락 국면 <b>헤지 기여가 +0.05%</b>에 그쳐 "항시 헤지로 변동성 관리" 철학이 실측으로 확인되지 않습니다.</p>
      </div>
      <div class="viewer-foot">확보된 유일한 사유서 · 낙폭 6구간 중 매칭 0건</div>`
  };
  function setRP(id){ rpBody.innerHTML=RP[id]; rpBody.scrollTop=0; }
  setRP('ledger');
  let rpOpen=false;
  function toggleRP(force){ rpOpen = force!==undefined?force:!rpOpen; slidePanel(refPanel, rpOpen); document.getElementById('refToggle').classList.toggle('primary',rpOpen); }
  document.getElementById('refToggle').addEventListener('click',()=>toggleRP());
  refPanel.querySelector('.rp-close').addEventListener('click',()=>toggleRP(false));
  refPanel.querySelectorAll('.rp-tab').forEach(t=>t.addEventListener('click',()=>{ refPanel.querySelectorAll('.rp-tab').forEach(x=>x.classList.remove('on')); t.classList.add('on'); setRP(t.dataset.rt); }));
  const refBtn = document.querySelector('[data-ref]');
  if(refBtn) refBtn.addEventListener('click',()=>{ toggleRP(true); });

  /* ================= AI AGENT (multi-pane) ================= */
  const agent = document.getElementById('agentPanel');
  const scrim = document.getElementById('agentScrim');
  let agentOpened=false;

  const SUG=[
    {tag:'검증',cls:'gray',q:'게이트에서 중단된 2건이 왜 치명적인지 설명해줘',tx:'게이트 중단 2건의 의미'},
    {tag:'분석',cls:'blue',q:'낙폭 6구간에 사유가 하나도 없는 게 얼마나 심각한 문제야?',tx:'사유 매칭 0/6의 심각도'},
    {tag:'요구',cls:'violet',q:'운용사에 서면으로 요구할 자료 리스트를 만들어줘',tx:'운용사 보완 요구 리스트'},
  ];

  agent.innerHTML = '<div class="ag-shell"><div class="ag-rail" id="agRail"></div><div class="ag-panes" id="agPanes"></div></div>';
  const railEl=agent.querySelector('#agRail'), panesEl=agent.querySelector('#agPanes');

  let panes=[]; let seq=0; let activeId=null;

  function railRender(){
    railEl.innerHTML = panes.map(p=>'<button class="ag-rail-btn'+(p.id===activeId?' on':'')+'" data-pane="'+p.id+'" title="'+p.title+'">'+p.idx+'</button>').join('')
      + '<button class="ag-rail-add" id="agAdd" title="대화 추가"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
    railEl.querySelectorAll('[data-pane]').forEach(b=>b.addEventListener('click',()=>setActive(+b.dataset.pane)));
    railEl.querySelector('#agAdd').addEventListener('click',()=>{ if(panes.length>=3){toast('대화는 최대 3개까지 동시에 열 수 있어요');return;} addPane(); });
  }
  function setActive(id){ activeId=id; panes.forEach(p=>p.el.classList.toggle('active',p.id===id)); railRender(); const p=cur(); if(p) setTimeout(()=>p.inputEl&&p.inputEl.focus(),60); }
  function cur(){ return panes.find(p=>p.id===activeId)||panes[0]; }
  function updateWidth(){
    agent.classList.toggle('multi', panes.length>1);
    if(agent.classList.contains('expanded')) return;
    const w = Math.min(56 + panes.length*398, Math.round(window.innerWidth*0.94));
    agent.style.width = panes.length<=1 ? '' : w+'px';
  }

  function paneHTML(p){
    return ''+
    '<div class="ag-head2">'+
      '<div class="ag-id"><span class="ag-dot"></span><div><div class="ag-t">화인 AI Agent</div><div class="ag-sub2">GVA Fortress-A 펀드 검증</div></div></div>'+
      '<div class="ag-head-actions"><span class="ag-erp2"><span class="dot"></span>ERP</span>'+
        '<button class="ag-fs" title="전체화면"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'+
        '<button class="ag-pclose" title="닫기"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></button>'+
      '</div>'+
    '</div>'+
    '<div class="ag-titlebar"><span class="ag-convtitle">'+p.title+'</span><span class="ag-edit">제목 클릭 편집</span></div>'+
    '<div class="ag-body" id="agBody-'+p.id+'"></div>'+
    '<div class="ag-foot2">'+
      '<div class="ag-scrapbar"><span class="ag-scrap-l">스크랩 <b>0</b></span><span class="ag-scrap-exp">▲ 펼치기</span></div>'+
      '<div class="ag-input2"><input class="ag-pinput" placeholder="질문을 입력하세요…" autocomplete="off">'+
        '<div class="ag-input-actions"><button class="ag-plus" title="첨부">+</button><div class="ag-ia-spacer"></div><button class="ag-send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>'+
      '</div>'+
      '<div class="ag-hint">Enter 전송 · Shift+Enter 줄바꿈</div>'+
    '</div>';
  }
  function welcomeHTML(p){
    return '<div class="ag-welcome"><div class="ag-orb"></div>'+
      '<div class="ag-orb-title">'+p.title+' — GVA Fortress-A<br>펀드 검증 AI</div>'+
      '<div class="ag-welcome-desc">분석 항목 위 <b>"Ask AI"</b>를 클릭하면 컨텍스트가 자동으로 붙습니다.<br>모든 답변은 <b>대장 행 번호 · 문서 페이지</b>를 근거로 제시합니다.</div>'+
      '<div class="ag-sug">'+SUG.map(s=>'<button class="ag-sug-card" data-q="'+s.q+'"><span class="ag-sug-tag '+s.cls+'">'+s.tag+'</span><span class="ag-sug-tx">'+s.tx+'</span></button>').join('')+'</div>'+
      '<div class="ag-welcome-time">오전 09:42</div></div>';
  }

  function renderWelcome(p){
    p.bodyEl.classList.remove('chatting');
    p.bodyEl.innerHTML = welcomeHTML(p);
    p.bodyEl.querySelectorAll('.ag-sug-card').forEach(c=>c.addEventListener('click',()=>sendTo(p,null,null,c.dataset.q)));
  }

  function addPane(){
    const id=++seq; const idx=panes.length+1;
    const p={id, idx, title:'대화 '+idx, history:[]};
    const el=document.createElement('div'); el.className='ag-pane'; el.dataset.pane=id; el.innerHTML=paneHTML(p);
    panesEl.appendChild(el);
    p.el=el; p.bodyEl=el.querySelector('.ag-body'); p.inputEl=el.querySelector('.ag-pinput');
    panes.push(p);
    el.querySelector('.ag-pclose').addEventListener('click',()=>closePane(id));
    el.querySelector('.ag-fs').addEventListener('click',toggleFs);
    el.querySelector('.ag-send').addEventListener('click',()=>sendTo(p));
    el.querySelector('.ag-plus').addEventListener('click',()=>{ if(panes.length>=3){toast('대화는 최대 3개까지');return;} addPane(); });
    el.querySelector('.ag-scrap-exp').addEventListener('click',()=>toast('스크랩 보드 (프로토타입)'));
    el.querySelector('.ag-edit').addEventListener('click',()=>renamePane(p));
    el.querySelector('.ag-convtitle').addEventListener('click',()=>renamePane(p));
    p.inputEl.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendTo(p); } });
    el.addEventListener('mousedown',()=>setActive(id));
    renderWelcome(p);
    setActive(id); updateWidth();
    return p;
  }
  function renamePane(p){
    const t=prompt('대화 제목', p.title); if(t&&t.trim()){ p.title=t.trim(); p.el.querySelector('.ag-convtitle').textContent=p.title; railRender(); }
  }
  function closePane(id){
    const i=panes.findIndex(p=>p.id===id); if(i<0)return;
    panes[i].el.remove(); panes.splice(i,1);
    if(panes.length===0){ closeAgent(); return; }
    panes.forEach((p,n)=>{ p.idx=n+1; const tEl=p.el.querySelector('.ag-convtitle'); if(p.title.startsWith('대화 ')){ p.title='대화 '+p.idx; tEl.textContent=p.title; } });
    if(activeId===id) activeId=panes[Math.max(0,i-1)].id;
    panes.forEach(p=>p.el.classList.toggle('active',p.id===activeId));
    railRender(); updateWidth();
  }
  function toggleFs(){ agent.classList.toggle('expanded'); if(agent.classList.contains('expanded')){ agent.style.width=''; } else { updateWidth(); } }

  function openAgent(){
    agentOpened=true;
    if(panes.length===0) addPane();
    slidePanel(agent, true); fadeScrim(scrim, true);
    updateWidth();
    setTimeout(()=>{ const p=cur(); p&&p.inputEl&&p.inputEl.focus(); },350);
  }
  function closeAgent(){ slidePanel(agent, false); fadeScrim(scrim, false); }
  document.getElementById('agentToggle').addEventListener('click',()=>agent.classList.contains('open')?closeAgent():openAgent());
  scrim.addEventListener('click',closeAgent);

  function addMsg(p,role,html,ctx){
    if(!p.bodyEl.classList.contains('chatting')){ p.bodyEl.innerHTML=''; p.bodyEl.classList.add('chatting'); }
    if(ctx){ const c=document.createElement('div'); c.className='ag-ctx'; c.innerHTML='<div class="ctx-l">분석 컨텍스트</div>'+ctx; p.bodyEl.appendChild(c); }
    const m=document.createElement('div'); m.className='ag-msg '+role;
    m.innerHTML='<div class="av">'+(role==='user'?'나':'')+'</div><div class="ag-bubble">'+html+'</div>';
    p.bodyEl.appendChild(m); p.bodyEl.scrollTop=p.bodyEl.scrollHeight; return m;
  }
  function typingMsg(p){ const m=document.createElement('div'); m.className='ag-msg ai'; m.innerHTML='<div class="av"></div><div class="ag-bubble"><span class="typing"><i></i><i></i><i></i></span></div>'; p.bodyEl.appendChild(m); p.bodyEl.scrollTop=p.bodyEl.scrollHeight; return m; }

  const FUND_CONTEXT = `당신은 화인파트너스 자금투자(펀드) 검증 AI Agent입니다. 검토 대상: 지브이에이 Fortress-A 일반 사모투자신탁(KRZ502142705).
[인풋] ①숫자=기준가격대장 xlsx 3,151행(2017-05-17~2025-12-31, 수정기준가 5계열) ②약속=제안서 pdf 23p(2026.02, 2026.01.31 기준) ③설명=하락사유서 pdf 2p(2026.06.04, 대상 26.05.28~06.03) ④판단(내부)=자금부 검토보고서 9p + 품의서 34p. 마스터=헤지펀드 운용현황 4,013개 레지스트리(행 3,141).
[중요] 목표 IRR·총보수·MDD는 제안서 본문(p.1~13)이 아니라 제안서 부록 p.14와 검토보고서 p.2·p.4에 있음. 3종 인풋만 쓰면 15개 검증항목 중 5개를 "미기재"로 오판함.
[게이트 STEP3] 통과5·경고2·중단2. 중단① 기준일 불일치(대장 25.12.31 / 제안서 26.01.31 / 사유서 26.06.03 → 사유서 구간이 대장 범위 밖, 매칭 원천 불가). 중단② 기준가 계열 혼용(제안서·검토보고서 성과표=종류운용 보수차감전, 투자자=Class A → 누적 190.9% vs 154.6%, 36.3%p). 경고① 달력일 대장(주말 900행 28.6%, √365 필요). 경고② 스키마 위반(Class C2 결측 1,520행, "무잔고 상태" 문자열).
[약속값 - 검토보고서 p.4 / 품의서 p.2] 운용목표 IRR 10%. 총보수 A클래스 1.57%(판매보수 1%)·C1 2.07%. 성과보수 15%(High-Water Mark). 환매수수료 90일 미만 이익금 70%, 90일 이상 없음. 환매 매월 1회(T+6 기준가, T+10 지급). 레버리지 한도 400% 이하. 최소가입 3억, 가입금액 20억. 예상운용기간 3년. 자산배분 주식 20~60% / 메자닌 30~50% / 이벤트드리븐 0~15% / 헤지 0~15%. 주요자산 주식 Long Short(한국 99.66%), 메자닌 CB·BW·EB, 장외파생 우량주 TRS.
[화인 산출 성과 - 검토보고서 p.2, 26.01.31 기준] Fortress-A vs KOSPI: 누적 224.79 vs 127.61, 연환산 14.47 vs 9.89, 변동성 10.42 vs 18.41, Sharpe 1.19 vs 0.44, MDD 15.60 vs 43.90, Win ratio 64.76 vs 55.24. 경쟁상품(18.01.12~26.01.31): GVA 165.4% > 씨앗멀티 140.5% > 미래에셋스마트롱숏 67.7%, KOSPI 110.0%.
[1장 성과 - 대장 실측] Class A 누적 +154.57%, CAGR 11.44%(목표 10% 대비 +1.44%p 달성), 8.62년. 종류운용 누적 +190.91%, CAGR 13.18%, 변동성 10.30%, Sharpe 1.09 — 화인 자체 산출값(190.91 / 13.17 / 10.39 / 1.09)과 독립적으로 일치. 연도별(Class A): 17 +5.59, 18 -1.09, 19 +8.83, 20 +27.76, 21 +18.75, 22 -6.55, 23 +14.55, 24 +2.02, 25 +35.16.
[2장 위험] MDD -15.40%(2018-05-15 행364 → 2018-10-30 행532), 회복 2020-04-06까지 524일. 2위 -14.59%(2022-04-21→10-13, 167일). 이하 -9.96/-8.88/-8.47/-6.97. 변동성 10.32%, Sharpe 0.92, Sortino 0.92(rf 2%, Class A). 낙폭 6구간 중 사유 매칭 0건.
[사유서] 26.05.28~06.03 -7.83%. 전략별: 주식Long -5.80, 메자닌Long -1.44, Pair -0.67, 이벤트 +0.01, 헤지 +0.05. 주식Long 비중 53.05%(44종목) — 약속 밴드 20~60% 안. 대형주 27% / 중소형주 73%.
[3장 약속검증 15항목] 충족: 설정일·누적·변동성·목표IRR(10%→11.44% 달성)·MDD(15.60 vs 실측 15.40, 오차 0.20%p)·위험조정성과(4조건 전부 통과). 경고: 연환산수익률(기준일차), Sharpe(rf 가정 미기재), 전략비중(밴드 내), 벤치마크(제안서는 KOSPI 비교지수 아니라 명시하나 검토보고서는 KOSPI로 대조), 위험등급(전 문서 부재). 불일치: Sortino(제안서 1.25 / 실측 0.95 / 문서체계 1.49 3중 불일치), 보수차감후 수익률(어느 문서에도 없음), 실효보수 1.74%p vs 약속 총보수 1.57%(+0.17%p 초과), 하락국면 헤지 기여 +0.05%(설정이후 누적 +5.78%, 전체의 2.6%).
[판단 3규칙] ①위험초과=충족(목표 달성 + 위험조정 4조건 통과, 단 위험등급 표기 부재) ②사유부실=위반(0/6, 사유서도 환매청구 후 작성) ③전략불일치=경고(비중은 밴드 내이나 "항시 헤지로 변동성 관리" 철학이 실측 미확인, TRS·레버리지 400% 대비 완화장치 검증 필요). 종합 조건부 적정.
답변 원칙: 한국어, 3~5문장, 실무적. 숫자에는 반드시 근거를 붙일 것(대장 행 번호 / 제안서 p.N / 사유서 p.N). 마지막 줄에 "출처: ..." 명시.`;

  async function send(presetCtx, presetLabel, presetQuery){ if(!agentOpened) openAgent(); await sendTo(cur(), presetCtx, presetLabel, presetQuery); }

  async function sendTo(p, presetCtx, presetLabel, presetQuery){
    if(!p) return;
    const q = presetQuery || (p.inputEl?p.inputEl.value.trim():'');
    if(!q && !presetCtx) return;
    const userText = q || ('이 항목을 분석해줘: '+(presetLabel||''));
    addMsg(p,'user', esc(userText), presetCtx?esc(presetCtx):null);
    p.history.push({role:'user',content:userText+(presetCtx?('\n참고: '+presetCtx):'')});
    if(p.inputEl) p.inputEl.value='';
    const t=typingMsg(p);
    try{
      let answer;
      if(window.claude && window.claude.complete){
        const convo=p.history.slice(-6).map(function(h){return (h.role==='user'?'심사역':'AI')+': '+h.content;}).join(String.fromCharCode(10));
        const nl=String.fromCharCode(10);
        answer=await window.claude.complete(FUND_CONTEXT+nl+nl+'[대화]'+nl+convo+nl+'AI:');
      } else answer=simulate(userText);
      t.remove(); answer=answer||simulate(userText);
      addMsg(p,'ai', fmtAnswer(answer));
      p.history.push({role:'assistant',content:answer});
    }catch(e){ t.remove(); addMsg(p,'ai', fmtAnswer(simulate(userText))); }
    if(p.inputEl) p.inputEl.focus();
  }
  function fmtAnswer(s){ var nl=String.fromCharCode(10); return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(출처:.*?)$/m,'<span class="src">$1</span>').split(nl).join('<br>'); }

  function simulate(q){
    var nl=String.fromCharCode(10);
    const k=q.toLowerCase();
    if(k.includes('게이트')||k.includes('중단')||k.includes('정규화')) return '중단 2건은 성격이 다릅니다. **기준일 불일치**는 대장(25.12.31)·제안서(26.01.31)·사유서(26.05.28~06.03)가 서로 다른 시점을 보고 있어, 사유서가 설명하는 하락 구간이 **대장에 아예 존재하지 않는다**는 뜻입니다 — STEP 5 매칭이 원천적으로 불가능합니다. **기준가 계열 혼용**은 더 치명적인데, 제안서와 검토보고서의 성과표가 전부 보수 차감 전(종류운용)이라 그대로 쓰면 누적수익률이 190.9%로 보이지만 투자자 실수령(Class A)은 154.6%입니다. 36.3%p 차이는 판단을 뒤집습니다.'+nl+'출처: 게이트 6·7, 대장 행 2~3,151, 제안서 p.8 각주, 검토보고서 p.2';
    if(k.includes('사유')||k.includes('매칭')||k.includes('0/6')||k.includes('낙폭')) return '매칭률 **0/6 (0%)** 입니다. MDD 15.40%(2018-05-15 행364 → 2018-10-30 행532, 회복까지 524일)와 14.59%(2022)를 포함해 6개 낙폭 전부에 설명이 없습니다. 확보된 사유서는 1건뿐인데 대장 범위 밖인 26.05.28~06.03을 다루고, 그마저 문서 첫 문단에 **"환매 청구를 진행하신 날"** 이라고 적혀 있어 **투자자가 돈을 빼겠다고 한 다음에 작성된 사후 문서**입니다. 성과가 아니라 상시 리스크 관리 체계에서 걸린 항목입니다.'+nl+'출처: 2장 낙폭 테이블, 사유서 p.1, 대장 행 364·532';
    if(k.includes('요구')||k.includes('보완')||k.includes('리스트')||k.includes('자료')) return '서면 요구 항목은 5가지입니다. ① **기준가격대장 최신본(~2026.07)** — 현재 대장이 25.12.31에서 끊겨 최근 하락 구간을 검증할 수 없습니다. ② **낙폭 6구간별 하락사유서** — 특히 15.40%(2018)와 14.59%(2022). ③ **성과보수 15%(HWM) 실현 명세** — 실효 보수 1.74%p가 약속 총보수 1.57%(제안서 p.14)를 0.17%p 초과합니다. ④ **하락 국면 헤지 전략 실행 내역** — "항시 헤지" 철학 대비 기여가 +0.05%에 그쳤습니다. ⑤ **위험등급 표기** — 목표 IRR과 MDD는 검토보고서에서 확보했으나 위험등급만 전 문서에 없습니다.'+nl+'출처: 게이트 6·7, 3장 검증 15항목, 제안서 p.14, 검토보고서 p.2·p.4';
    if(k.includes('전략')||k.includes('드리프트')||k.includes('비중')||k.includes('헤지')) return '**비중은 이상 없습니다.** 주식 Long 53.05%(사유서 p.1)는 약속 밴드 **20~60%**(제안서 p.4 · 검토보고서 p.1) 안입니다. 문제는 리스크 완화장치 쪽인데, 제안서 p.3이 "항시 헤지전략 수행으로 변동성 관리"를 운용철학으로 내걸고 화인 문서체계도 "헤지 병행 + 100~200종목 분산 = 파생 리스크 통제 가능"으로 판단했으나, 실제 -7.83% 하락 국면에서 헤지 기여도는 **+0.05%**에 그쳤습니다. 설정이후 누적으로도 +5.78%(전체 224.79% 중 2.6%)라, TRS·장외옵션(레버리지 한도 400%)을 통제한다는 근거가 실측으로 확인되지 않습니다.'+nl+'출처: 제안서 p.3·p.4·p.18, 검토보고서 p.1, 사유서 p.1';
    if(k.includes('mdd')||k.includes('위험')||k.includes('등급')||k.includes('규칙 1')||k.includes('①')) return '규칙 ①은 **충족**입니다. 검토보고서 p.4의 운용목표 **IRR 10%**에 대해 Class A 실측 CAGR은 **11.44%**로 +1.44%p 달성했고, 그 수익이 고위험에서 나온 것도 아닙니다 — KOSPI 대비 수익 14.47>9.89, 변동성 10.42<18.41, Sharpe 1.19>0.44, MDD 15.60<43.90으로 문서체계 성과검증 로직의 4개 조건을 전부 통과합니다. 다만 **위험등급 표기만은 제안서·검토보고서·품의서 어디에도 없어** 절대 기준 대조는 여전히 불가합니다.'+nl+'출처: 검토보고서 p.2·p.4, 대장 행 364·532';
    if(k.includes('보수')||k.includes('수수료')||k.includes('class a')) return '약속된 총보수는 **A클래스 1.57%**(판매보수 1%)이고 성과보수가 **운용성과의 15%(High-Water Mark)** 입니다(제안서 p.14 · 검토보고서 p.4). 그런데 대장에서 종류운용과 Class A 계열을 직접 비교해 역산한 **실효 보수는 연 1.74%p**로, 약속치를 **0.17%p 초과**합니다 — 성과보수 실현분으로 설명되는지 명세를 받아야 합니다. 더 근본적인 문제는 **보수 차감 후 수익률이 어느 문서에도 없다**는 점입니다. 모든 공식 성과표가 보수 차감 전이라 투자자 실수령 +154.57%(CAGR 11.44%)는 대장에서 직접 계산해야만 나옵니다.'+nl+'출처: 제안서 p.14, 검토보고서 p.4, 대장 행 2~3,151';
    if(k.includes('목표')||k.includes('irr')) return '운용목표는 **IRR 10%** 입니다 — 제안서가 아니라 화인 자금부 **검토보고서 p.4**와 **품의서 p.2**에 기재돼 있습니다. Class A 실측 CAGR 11.44%로 **+1.44%p 달성**했습니다. 참고로 이 값은 인풋을 대장·제안서·사유서 3종으로만 잡으면 찾을 수 없어 "목표수익률 미기재"로 오판하게 되는 항목입니다.'+nl+'출처: 검토보고서 p.4, 품의서 p.2, 대장 행 2~3,151';
    if(k.includes('결론')||k.includes('의견')||k.includes('투자')||k.includes('판단')) return '종합 의견은 **조건부 적정**입니다. 위험조정 성과는 통과합니다 — 목표 IRR 10% 대비 실측 CAGR 11.44%, KOSPI 대비 수익↑·변동성↓·Sharpe↑·MDD↓ 4개 조건 전부 충족. 걸린 지점은 사후관리 체계입니다: 낙폭 6구간 전부에 사유 설명이 없고(규칙②), 실효 보수 1.74%p가 약속 1.57%를 0.17%p 초과하며, 하락 국면 헤지 기여가 +0.05%에 그쳐 운용철학이 실측으로 확인되지 않습니다(규칙③). 서면 보완 후 재검토를 권고합니다.'+nl+'출처: 판단 3규칙, 3장 검증 15항목, 검토보고서 p.2·p.4';
    return 'GVA Fortress-A는 2017.05.17 설정된 Multi-strategy 헤지펀드로, Class A 기준 누적 +154.57%, CAGR 11.44%(목표 IRR 10% 달성), MDD 15.40%입니다. 궁금한 항목(게이트 중단 / 낙폭·사유 매칭 / 약속 대비 검증 / 판단 3규칙 / 보수 영향)을 지정해 주시면 대장 행 번호와 문서 페이지를 근거로 답변드리겠습니다.'+nl+'출처: 대장 3,151행, 제안서 23p, 사유서 2p, 검토보고서 9p, 품의서 34p';
  }
  function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  window.addEventListener('resize',()=>{ if(agentOpened) updateWidth(); });

  /* ---- send-to-ai + 원본 추적 칩 ---- */
  window.bindSendables = function(){
    document.querySelectorAll('.send-to-ai, .ai-sum .ask-ai').forEach(btn=>{
      if(btn._bound) return; btn._bound=true;
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        const host = btn.closest('.sendable');
        if(!host) return;
        openAgent();
        setTimeout(()=>send(host.dataset.ctx, host.dataset.label),120);
      });
    });
    // Ask AI 버튼이 없는 sendable 행(게이트·낙폭·검증표)은 행 자체를 클릭 가능하게
    document.querySelectorAll('.sendable').forEach(host=>{
      if(host._rb) return; host._rb=1;
      if(host.querySelector('.send-to-ai, .ask-ai')) return;
      host.addEventListener('click',e=>{
        if(e.target.closest('.trace, .src-chip, a, button')) return;
        openAgent();
        setTimeout(()=>send(host.dataset.ctx, host.dataset.label),120);
      });
    });
    // 원본 추적 — 클릭하면 해당 원본 뷰어로 점프
    document.querySelectorAll('.trace, .src-chip').forEach(c=>{
      if(c._b)return; c._b=1;
      c.addEventListener('click',e=>{
        e.stopPropagation();
        const t=c.textContent.trim();
        const rt = t.indexOf('제안서')>=0 ? 1 : t.indexOf('사유서')>=0 ? 2 : (t.indexOf('검토보고서')>=0||t.indexOf('품의서')>=0) ? 3 : 0;
        toggleRP(true);
        refPanel.querySelectorAll('.rp-tab')[rt].click();
        toast(t+' 위치로 이동');
      });
    });
    document.querySelectorAll('[data-toast]').forEach(b=>{ if(b._b)return;b._b=1;b.addEventListener('click',()=>toast(b.dataset.toast)); });
    // 다운로드 버튼
    document.querySelectorAll('[data-dl]').forEach(b=>{ if(b._b)return;b._b=1;
      b.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); window.__fundDownload(b.dataset.dl); }); });
  };
  bindSendables();

  animateBars();
  animateCounts();
})();
