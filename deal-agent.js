/* ===== DEAL: panels + interactions + AI agent ===== */
(function(){
  const TABS = window.__deal.TABS;
  const tabBody = document.getElementById('tabBody');

  /* ---- tab switching ---- */
  document.querySelectorAll('.c-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.c-tab').forEach(t=>t.classList.remove('on'));
      tab.classList.add('on');
      tabBody.style.opacity='0';
      setTimeout(()=>{
        tabBody.innerHTML = TABS[tab.dataset.tab];
        tabBody.style.opacity='1';
        bindSendables();
        animateBars(tabBody);
      },130);
    });
  });
  tabBody.style.transition='opacity .2s';

  /* ================= REFERENCE PANEL ================= */
  const refPanel = document.getElementById('refPanel');
  refPanel.innerHTML = `
    <div class="rp-head"><div class="rp-head-title">참고 자료</div><button class="rp-close">✕</button></div>
    <div class="rp-tabs"><div class="rp-tab on" data-rt="im">IM Viewer</div><div class="rp-tab" data-rt="report">보고서</div><div class="rp-tab" data-rt="field">실사기록</div></div>
    <div class="rp-body" id="rpBody"></div>`;
  const rpBody = document.getElementById('rpBody');
  const RP = {
    im:`<div class="viewer-nav"><button class="nav-btn">← 이전</button><span style="font-size:10.5px;color:var(--t3)">우진기전_IM_v2.pdf · p.12 / 84</span><button class="nav-btn">다음 →</button></div>
      <div class="im-page"><div class="im-pnum">— 12 —</div><h4>3. 시장 분석</h4>
      <p>국내 한전 ESS 시장은 2024년 1.8조 규모에서 2027년 4.2조 규모로 연평균 32% 성장이 예상된다. 당사는 <span class="hl">2025년 한전 ESS 수주잔고 2,840억으로 시장 점유율 31.2%를 기록</span>하며 업계 1위 지위를 공고히 하고 있다.</p>
      <p>2026년 한전은 RE100 대응 및 분산형 전원 확대를 위해 ESS 신규 발주 1.2조원을 계획하고 있으며, 당사의 점유율과 기 확보 PQ 자격을 고려할 때 약 35~40%의 수주 가능성이 있다.</p>
      <table class="im-tbl"><tr><th>구분</th><th>2023</th><th>2024</th><th>2025</th><th>2026(E)</th></tr><tr><td>매출</td><td>1,124</td><td>1,438</td><td>1,842</td><td>2,310</td></tr><tr><td>점유율</td><td>22.4%</td><td>27.1%</td><td>31.2%</td><td>33.5%</td></tr></table>
      <p>한편 <span class="hl">미국 텍사스에서 IRA 세액공제를 활용한 ESS 프로젝트 1.2GW(4,200억) 수주에 성공</span>하여 북미 진출의 교두보를 마련하였다.</p></div>
      <div class="viewer-foot">노란 하이라이트 = AI 인용 위치 · 출처 클릭 → 자동 스크롤</div>`,
    report:`<div class="rw-prog-head"><div class="rw-prog-title">검토보고서 작성 현황</div><button class="rw-ai-btn">AI 전체 초안</button></div>
      ${[['done','✓','Executive Summary','완료','var(--green)'],['done','✓','투자 배경 및 대상 개요','완료','var(--green)'],['prog','◐','시장 분석','AI 초안','#b46c00'],['prog','◐','재무 분석 / 밸류에이션','AI 초안','#b46c00'],['todo','○','리스크 분석','미작성','var(--t4)'],['todo','○','투자 의견 및 결론','미작성','var(--t4)']].map(r=>`<div class="rw-item"><div class="rw-dot ${r[0]}">${r[1]}</div><span class="ri-label">${r[2]}</span><span class="ri-stat" style="color:${r[4]}">${r[3]}</span></div>`).join('')}
      <div style="margin-top:16px;font-size:13px;font-weight:700;color:var(--t1);margin-bottom:8px">AI 스크랩 삽입 보드</div>
      <div class="riz">AI 답변에서 "보고서 삽입" 클릭 시 여기에 추가됩니다</div>`,
    field:`<div class="fn-section"><div class="fn-sec-t"><div class="fn-icon">✏️</div>텍스트 메모</div>
      <textarea class="fn-textarea" placeholder="CEO 인터뷰 인상, 공장 분위기, 경영진 실행력 등"></textarea>
      <div class="fn-tag-row">${['경영진 신뢰도','공장/현장','재무 인상','리스크 발견','긍정 포인트'].map(t=>`<button class="fn-tag-btn">${t}</button>`).join('')}</div>
      <div class="fn-hint">AI 학습 데이터로 자동 저장</div>
      <div class="fn-item">CEO 윤 대표: 한전 트랙레코드 자신감↑. 북미 실행계획 설득력 있음. CFO 수준 양호.<div class="fn-meta"><span>김화인</span><span>2026.05.26 현장실사</span><span class="badge gray" style="height:17px;font-size:9px">경영진 신뢰도</span></div></div></div>
      <div class="fn-section"><div class="fn-sec-t"><div class="fn-icon">📎</div>사진 / 영상 / 문서</div>
      <div class="upload-zone" data-toast="파일 선택 UI 연결 (프로토타입)"><div style="font-size:22px;margin-bottom:6px">⬆️</div><div class="upload-label">클릭하거나 드래그</div><div class="upload-sub">사진, 영상, 문서, 스캔 파일</div><div class="upload-types"><span class="upload-type">JPG/PNG</span><span class="upload-type">MP4</span><span class="upload-type">PDF</span></div></div>
      <div class="fn-files"><div class="fn-file"><div class="fn-file-thumb" style="background:#e8f0f8">🏭</div><div><div class="fn-file-name">공장_내부_01.jpg</div><div class="fn-file-info">1.2MB · 05.26</div></div></div><div class="fn-file"><div class="fn-file-thumb" style="background:#f0e8f8">🎥</div><div><div class="fn-file-name">CEO_인터뷰.mp4</div><div class="fn-file-info">28MB · 05.26</div></div></div></div></div>
      <div class="fn-section"><div class="fn-sec-t"><div class="fn-icon">🔍</div>OCR · 녹취 변환</div>
      <div class="ocr-result"><div class="ocr-result-head">📷 OCR 결과 · 공장_내부_01.jpg</div>"생산 라인 가동률 87% (2025.Q4 기준) — 연간 최대 가동 가능 용량: 3,200억원 상당. 한전 납품 인증 PQ 자격: ESS(1등급), 변전소 EPC(A등급)"</div></div>`
  };
  function setRP(id){ rpBody.innerHTML=RP[id]; rpBody.scrollTop=0; }
  setRP('im');
  let rpOpen=false;
  function toggleRP(force){ rpOpen = force!==undefined?force:!rpOpen; slidePanel(refPanel, rpOpen); document.getElementById('refToggle').classList.toggle('primary',rpOpen); }
  document.getElementById('refToggle').addEventListener('click',()=>toggleRP());
  refPanel.querySelector('.rp-close').addEventListener('click',()=>toggleRP(false));
  refPanel.querySelectorAll('.rp-tab').forEach(t=>t.addEventListener('click',()=>{ refPanel.querySelectorAll('.rp-tab').forEach(x=>x.classList.remove('on')); t.classList.add('on'); setRP(t.dataset.rt); }));
  document.querySelector('[data-ref]').addEventListener('click',()=>{ toggleRP(true); refPanel.querySelectorAll('.rp-tab')[1].click(); });

  /* ================= AI AGENT ================= */
  const agent = document.getElementById('agentPanel');
  const scrim = document.getElementById('agentScrim');
  agent.innerHTML = `
    <div class="ag-head2">
      <button class="ag-fs" title="전체화면"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <div class="ag-title"><div class="ag-t">AI Agent</div><div class="ag-erp2"><span class="dot"></span>ERP</div></div>
      <button class="ag-close" title="닫기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></button>
    </div>
    <div class="ag-body" id="agBody"></div>
    <div class="ag-foot2">
      <div class="ag-tagchip" data-toast="태그 · 분석 컨텍스트 3개"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 7.5V4.5A1.5 1.5 0 014.5 3h3L20 15.5a1.5 1.5 0 010 2.1l-2.4 2.4a1.5 1.5 0 01-2.1 0L3 7.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7" cy="7" r="1.1" fill="currentColor"/></svg><span class="ag-tagbadge">3</span></div>
      <div class="ag-input2">
        <input id="agInput" placeholder="Ask anything" autocomplete="off">
        <div class="ag-input-actions"><button class="ag-plus" data-toast="첨부 (프로토타입)">+</button><div class="ag-ia-spacer"></div><button class="ag-send" id="agSend"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
      </div>
    </div>`;
  const agBody=document.getElementById('agBody'), agInput=document.getElementById('agInput'), agSend=document.getElementById('agSend');
  agent.querySelector('.ag-fs').addEventListener('click',function(){ agent.classList.toggle('expanded'); this.title=agent.classList.contains('expanded')?'좁게':'넓게'; });
  agent.querySelectorAll('[data-toast]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();toast(el.dataset.toast);}));

  let history=[];
  let agentOpened=false;
  function emptyState(){ agBody.innerHTML=`<div class="ag-welcome">
    <div class="ag-orb"></div>
    <div class="ag-orb-title">우진기전 Pre-IPO PEF<br>Assistance AI</div>
    <div class="ag-sug">
      <button class="ag-sug-card" data-q="이 딜의 핵심 리스크 리스트와 투자 가능성을 분석해줘"><span class="ag-sug-tag blue">분석</span><span class="ag-sug-tx">핵심리스트 + 투자 가능성</span></button>
      <button class="ag-sug-card" data-q="유사딜의 성공과 실패 요인을 비교 분석해줘"><span class="ag-sug-tag violet">비교</span><span class="ag-sug-tx">유사딜 성공, 실패 요인비교</span></button>
      <button class="ag-sug-card" data-q="IPO 지연 시 IRR 시뮬레이션 결과를 알려줘"><span class="ag-sug-tag gray">검증</span><span class="ag-sug-tx">IPO 지연 IRR 시뮬레이션</span></button>
    </div>
  </div>`;
    agBody.querySelectorAll('.ag-sug-card').forEach(c=>c.addEventListener('click',()=>send(null,null,c.dataset.q)));
  }
  emptyState();

  function openAgent(){ agentOpened=true; slidePanel(agent, true); fadeScrim(scrim, true); setTimeout(()=>agInput.focus(),350); }
  function closeAgent(){ slidePanel(agent, false); fadeScrim(scrim, false); }
  document.getElementById('agentToggle').addEventListener('click',()=>agent.classList.contains('open')?closeAgent():openAgent());
  agent.querySelector('.ag-close').addEventListener('click',closeAgent);
  scrim.addEventListener('click',closeAgent);

  function addMsg(role,html,ctx){
    if(history.length===0){ agBody.innerHTML=''; agBody.classList.add('chatting'); }
    if(ctx){ const c=document.createElement('div'); c.className='ag-ctx'; c.innerHTML=`<div class="ctx-l">분석 컨텍스트</div>${ctx}`; agBody.appendChild(c); }
    const m=document.createElement('div'); m.className='ag-msg '+role;
    m.innerHTML = `<div class="av">${role==='user'?'나':''}</div><div class="ag-bubble">${html}</div>`;
    agBody.appendChild(m); agBody.scrollTop=agBody.scrollHeight; return m;
  }
  function typingMsg(){ const m=document.createElement('div'); m.className='ag-msg ai'; m.innerHTML=`<div class="av"></div><div class="ag-bubble"><span class="typing"><i></i><i></i><i></i></span></div>`; agBody.appendChild(m); agBody.scrollTop=agBody.scrollHeight; return m; }

  const DEAL_CONTEXT = `당신은 화인파트너스 PE 투자 분석 AI Agent입니다. 검토 딜: 우진기전 Pre-IPO PEF (FP-2026-0142).
[딜] 우진기전㈜(중전기기, 한전 ESS 주력). PEF Pre-IPO CB 150억, 지분 7.8%, 전환가 18,500원(P/E 11.4배, Peer 대비 -23%). 예상 IRR 22.5%, Exit 2027.Q4 IPO, Put/Call 24개월 YTM 5%. 2025년 매출 1,842억(+28%), 영업이익률 9.2%. 한전 ESS 수주잔고 2,840억(점유율 31.2%), 텍사스 ESS 4,200억 수주, 발행사 현금 410억.
[유사딜] 대원전기(2023,성공,IRR24.3%), 한일변전(2022,부분성공,IRR15.2%↓한전의존도), 광명에너지(2024,진행,IRR19.4%).
[리스크] 한전의존도64%(상,94%), 구리헤지부족(중,87%), IRA규제(중,71%), Put유동성(하,58%).
답변: 한국어, 3~5문장, 실무적, 숫자 근거 포함, 마지막 줄에 "출처: ..." 명시.`;

  async function send(presetCtx, presetLabel, presetQuery){
    const q = presetQuery || agInput.value.trim();
    if(!q && !presetCtx) return;
    if(!agentOpened) openAgent();
    const userText = q || ('이 항목을 분석해줘: '+(presetLabel||''));
    addMsg('user', esc(userText), presetCtx?esc(presetCtx):null);
    history.push({role:'user',content:userText+(presetCtx?('\n참고: '+presetCtx):'')});
    agInput.value=''; agSend.disabled=true;
    const t = typingMsg();
    try{
      let answer;
      if(window.claude && window.claude.complete){
        const convo = history.slice(-6).map(h=>`${h.role==='user'?'심사역':'AI'}: ${h.content}`).join('\n');
        const prompt = `${DEAL_CONTEXT}\n\n[대화]\n${convo}\nAI:`;
        answer = await window.claude.complete(prompt);
      } else { answer = simulate(userText); }
      t.remove();
      const formatted = fmtAnswer(answer||simulate(userText));
      addMsg('ai', formatted);
      history.push({role:'assistant',content:answer||''});
    }catch(e){
      t.remove(); addMsg('ai', fmtAnswer(simulate(userText)));
    }
    agSend.disabled=false; agInput.focus();
  }
  function fmtAnswer(s){
    s = esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(출처:.*?)$/m,'<span class="src">$1</span>').replace(/\n/g,'<br>');
    return s;
  }
  function simulate(q){
    const k=q.toLowerCase();
    if(k.includes('리스크')||k.includes('위험')) return '가장 큰 리스크는 **한전 단일 매출 의존도 64.3%**입니다(신뢰도 94%, 심각도 상). 한일변전(2022)에서 동일 리스크가 현실화되어 IRR이 18.5%→15.2%로 -3.3%p 하락한 전례가 있습니다. 다만 우진기전은 북미 매출 21%(4,200억)로 구조적 분산이 진행 중이라 완화 요인이 존재합니다.\n출처: 리스크 Taxonomy, IM p.24, 한일변전 2022 종결보고';
    if(k.includes('한일변전')||k.includes('차이')) return '한일변전 대비 핵심 차이는 **매출 분산도**입니다. 한일변전은 한전 의존도 82%로 단일 구조였으나, 우진기전은 북미(텍사스 ESS 4,200억) 진출로 의존도가 64%까지 낮아졌습니다. 또한 발행사 현금 410억으로 Put 상환 여력이 확보되어 하방이 제한적입니다.\n출처: IM p.24/p.31, 한일변전 비교 DB';
    if(k.includes('ipo')||k.includes('put')||k.includes('손실')) return 'IPO가 2027.Q4 이후로 지연되면 **Put Option(YTM 5%)** 행사가 가능합니다. 이 경우 원금+이자 약 165억을 회수하며 IRR은 약 8.2%로, 자본 손실은 발생하지 않습니다. 발행사 현금 410억으로 상환 여력도 충분합니다(리스크 신뢰도 58%, 심각도 하).\n출처: 시나리오 분석, IM p.56';
    if(k.includes('의견')||k.includes('투자')) return '현 단계 종합 의견은 **조건부 긍정**입니다. 예상 IRR 22.5%, Peer 대비 -23% 밸류 매력, 한전 점유 1위(31.2%)가 강점입니다. 단 한전 의존도(상)와 구리 헤지 부족(중)에 대한 완화 조건을 IC 자료에 명시할 것을 권고합니다.\n출처: 종합 분석, 유사딜 3건 비교';
    return '우진기전 건은 예상 IRR 22.5%, 투자금 150억(CB), 2027.Q4 IPO Exit 구조입니다. 구체적으로 궁금한 항목(리스크/밸류에이션/유사딜/회수 시나리오)을 지정해 주시면 근거와 함께 답변드리겠습니다.\n출처: IM v2, ERP 딜 FP-2026-0142';
  }
  function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  agSend.addEventListener('click',()=>send());
  agInput.addEventListener('keydown',e=>{ if(e.key==='Enter') send(); });

  /* ---- send-to-ai buttons on analysis items ---- */
  window.bindSendables = function(){
    document.querySelectorAll('.send-to-ai, .ai-sum .ask-ai').forEach(btn=>{
      if(btn._bound) return; btn._bound=true;
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        const host = btn.closest('.sendable');
        openAgent();
        setTimeout(()=>send(host.dataset.ctx, host.dataset.label),120);
      });
    });
    document.querySelectorAll('.cite').forEach(c=>{ if(c._b)return;c._b=1;c.addEventListener('click',e=>{e.stopPropagation();toggleRP(true);refPanel.querySelectorAll('.rp-tab')[0].click();toast('IM '+c.textContent+' 위치로 이동');});});
    document.querySelectorAll('.drop-tag-btn').forEach(b=>{ if(b._b)return;b._b=1;b.addEventListener('click',()=>b.classList.toggle('on'));});
    document.querySelectorAll('.fn-tag-btn').forEach(b=>{ if(b._b)return;b._b=1;b.addEventListener('click',()=>b.classList.toggle('on'));});
  };
  bindSendables();

  /* misc buttons */
  document.querySelectorAll('[data-toast]').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.toast)));
  document.querySelector('[data-drop]').addEventListener('click',()=>{ document.querySelector('[data-tab="summary"]').click(); setTimeout(()=>toast('Drop 사유 태그를 선택하세요'),200); });

  animateBars();
})();
