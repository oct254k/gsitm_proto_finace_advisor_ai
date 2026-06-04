/* ===== DEAL ANALYSIS screen ===== */
(function(){
  renderSidebar('review');

  /* ---------------- CONTENT ---------------- */
  const tabSummary = `
    <div class="ai-sum sendable reveal" data-ctx="[AI 요약] 우진기전 Pre-IPO PEF: 한전 ESS 주력 중전기기사. 2025년 매출 1,842억(+28%), 영업이익률 9.2%. CB 150억 단독 배정, 전환가 18,500원, IRR 22.5%, 2027.Q4 IPO Exit." data-label="AI 요약">
      <div class="ai-sum-head">
        <span class="ai-tag-sm">AI 자동 요약</span>
        <span class="ai-label">IM 84p 전체 분석</span>
        <div class="ai-conf"><div class="conf-bar"><i style="width:92%"></i></div>신뢰도92%</div>
      </div>
      <div class="ai-sum-body">
        <p>우진기전은 한전 ESS·변전소 EPC를 주력으로 하는 중전기기 제조사로, 2025년 매출 1,842억(YoY +28%), 영업이익률 9.2%를 기록. 본 건은 IPO 직전 CB 발행으로 화인파트너스에 150억(전환가 18,500원, Put/Call 24개월) 단독 배정. IRA 수혜와 한전 발주 확대로 향후 3년 CAGR 22% 전망. Exit 시나리오는 2027.Q4 코스닥 상장.</p>
        <button class="ask-ai">Ask AI <svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
      <div class="ai-sum-foot">생성 2026.05.26 14:22 · Private LLM</div>
      <div class="ai-sum-src"><span class="src-l">출처</span>${['IM 12p','IM p.24','IM p.38','IM p.56'].map(s=>`<span class="src-chip"><svg viewBox="0 0 24 24" fill="none"><path d="M19 11l-7.5 7.5a4 4 0 01-5.7-5.7L13 5.5a2.5 2.5 0 113.5 3.5l-7.6 7.6a1 1 0 01-1.4-1.4L14 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>${s}</span>`).join('')}</div>
    </div>

    ${sumCard('투자 포인트','AI 추출 · 출처 클릭→IM 동기화',
      ip(1,'한전 ESS 시장 점유 1위 (점유율 31.2%)','2025년 한전 ESS 수주잔고 2,840억, 점유율 1위. 2026년 추가 발주 1.2조 예정으로 수주 모멘텀 지속.',['IM p.12','IM p.18','한전 입찰 공시'],'[투자포인트 1] 한전 ESS 점유 1위(31.2%). 수주잔고 2,840억. 2026년 한전 발주 1.2조 예정.')+
      ip(2,'미국 IRA 수혜로 북미 진출 가속','텍사스 ESS 1.2GW(4,200억) 수주. IRA 세액공제 적용으로 마진 +3.2%p 추가 확보 가능.',['IM p.24','IM p.31'],'[투자포인트 2] IRA 수혜—북미 진출. 텍사스 ESS 1.2GW(4,200억) 수주. 마진 +3.2%p.')+
      ip(3,'Pre-IPO 밸류에이션 매력도 (Peer 대비 -23%)','전환가 18,500원 기준 P/E 11.4배 — 동종업계 14.8배 대비 23% 할인. 2027 IPO 공모가 22,000~26,000원 예상.',['IM p.38','Peer: LS일렉트릭, 일진전기'],'[투자포인트 3] Peer 대비 -23% 할인. 전환가 18,500원, P/E 11.4배(업계 14.8배). IPO 공모가 22,000~26,000원.'))}

    ${sumCard('유사 Deal Top 3','자사 142건 중',`<div class="sim-grid">
      ${sim('대원전기 Pre-IPO','89%','2023 · 전력·에너지 · CB',['ok','성공'],[['예상 IRR','20%',''],['실제 IRR','24.3%▲',''],['Exit','IPO 18개월','']],'[유사딜] 대원전기 Pre-IPO(2023,성공). 예상IRR 20%→실제 24.3%▲. IPO 18개월. 유사도 89%.')}
      ${sim('한일변전 PEF','82%','2022 · 전력·에너지 · 메자닌',['amber','부분성공'],[['예상 IRR','18.5%',''],['실제 IRR','15.2%▼',''],['주요 리스크','한전 의존도','']],'[유사딜] 한일변전 PEF(2022,부분성공). 예상IRR 18.5%→실제 15.2%▼. 한전 의존도 리스크 현실화. 유사도 82%.')}
      ${sim('광명에너지 CB','76%','2024 · 신재생 · CB',['info','진행중'],[['예상 IRR','22%',''],['현재 IRR','19.4%▼',''],['Exit','IPO 준비중','']],'[유사딜] 광명에너지 CB(2024,진행중). 예상IRR 22%→현재 19.4%. 유사도 76%.')}
    </div>`)}

    ${sumCard('AI 리스크 탐지','Taxonomy 기반', riskTable())}

    <div class="sum-row">
    ${sumCard('IC 예상 질의','과거 심의 학습 기반',
      icQA('Q1','한전 의존도 64%인데 한일변전 때랑 뭐가 다른가요?','한일변전 당시와 달리 우진기전은 북미 매출 21%(4,200억)로 단일 의존 구조가 분산됨...','유사 IC (한일변전 2022년 2차심의) · 신뢰도 88%','[IC Q1] 한전 의존도 64%인데 한일변전과 차이? 북미 21% 분산. 신뢰도 88%.')+
      icQA('Q2','IPO 지연 시 Put 행사하면 우리 수익률은 얼마나 나오나?','Put 행사 시 YTM 5%, 원금+이자 약 165억 회수. IRR 환산 약 8.2% — 자본 손실 없음...','시나리오 분석 · 신뢰도 94%','[IC Q2] IPO 지연 시 Put 행사 IRR? YTM 5%, 165억 회수, IRR 8.2%. 신뢰도 94%.')+
      icQA('Q3','밸류에이션 18,500원 근거가 뭐가요?','LS일렉트릭 14.2배, 일진전기 15.4배 평균 14.8배 대비 P/E 11.4배. 23% 할인은 비상장 유동성 디스카운트 통상 범위(20~30%)...','Peer 비교 DB + IM p.38 · 신뢰도 91%','[IC Q3] 밸류에이션 18,500원 근거? P/E 11.4배, Peer 14.8배 대비 23% 할인. 신뢰도 91%.'))}

    ${sumCard('Drop 처리','',`<div class="drop-area">
      <div class="drop-title">Drop 처리하는 사유를 선택해 주세요</div>
      <div class="drop-desc">향후 유사 딜 검토 시, 과거 판단 근거로 쓰입니다.</div>
      <div class="drop-tags">${['밸류에이션 과다','Exit 경로 불확실','유동성 리스크','업황 둔화','경영진 신뢰도','정책 리스크','기타'].map((t,i)=>`<div class="drop-tag-btn${(i===0||i===3)?' on':''}">${t}</div>`).join('')}</div>
      <button class="drop-submit" data-toast="Drop 처리 (프로토타입) — 선택한 사유가 저장됩니다">Drop 처리하기</button>
    </div>`)}
    </div>`;

  function sumCard(title,sub,body){return `<div class="sum-card reveal"><div class="sum-card-h"><h4>${title}</h4>${sub?`<span class="sum-sub">${sub}</span>`:''}</div><div class="sum-card-body">${body}</div></div>`;}

  function ip(n,title,desc,cites,ctx){const icons=['<path d="M9 17V9m4 8V5m4 12v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>','<path d="M3 12l4-4 4 3 7-7M21 7v4h-4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>','<path d="M12 3v18M7 8h10M7 16h6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'];return `<div class="ip sendable" data-ctx="${ctx}" data-label="투자포인트 ${n}"><div class="ip-icon"><svg viewBox="0 0 24 24" fill="none">${icons[n-1]||icons[0]}</svg></div><div style="flex:1;min-width:0"><div class="ip-title">${title}</div><div class="ip-desc">${desc}</div><div class="ip-cites">${cites.map(c=>`<span class="cite">${c}</span>`).join('')}</div></div><button class="send-to-ai">Ask AI <svg viewBox="0 0 24 24" fill="none" style="width:12px;height:12px"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`;}
  function sim(name,score,sub,tag,rows,ctx){
    const pct=parseInt(String(score).replace(/[^0-9]/g,''))||0;
    const statusCls={ok:'green',amber:'amber',info:'blue'}[tag[0]]||'gray';
    const r=15.5,c=2*Math.PI*r,off=c*(1-pct/100);
    const donut=`<div class="sim-donut"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="${r}" class="don-track"/><circle cx="20" cy="20" r="${r}" class="don-fill" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 20 20)"/></svg><span class="don-pct">${pct}%</span></div>`;
    return `<div class="sim-card sendable" data-ctx="${ctx}" data-label="유사딜 ${name}">
      <div class="sim-status ${statusCls}"><span class="sim-dot"></span>${tag[1]}</div>
      <div class="sim-top"><div class="sim-head"><div class="sim-name">${name}</div><div class="sim-sub2">${sub}</div></div>${donut}</div>
      <div class="sim-rows">${rows.map(simRow).join('')}</div>
      <button class="send-to-ai sim-ask">Ask AI <svg viewBox="0 0 24 24" fill="none" style="width:12px;height:12px"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>`;
  }
  function simRow(r){
    const raw=r[1]; const up=raw.includes('▲'), dn=raw.includes('▼');
    const clean=raw.replace(/[▲▼]/g,'').trim();
    let badge='', col='';
    if(up){badge='<span class="irr-arr up"><svg viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';col='#e7000b';}
    else if(dn){badge='<span class="irr-arr down"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';col='#155dfc';}
    return `<div class="sim-row"><span class="sim-rk">${r[0]}</span><span class="sim-rv" ${col?`style="color:${col}"`:''}>${clean}${badge}</span></div>`;
  }
  function icQA(n,q,a,src,ctx){return `<div class="ic-qa-item sendable" data-ctx="${ctx}" data-label="IC ${n}"><div class="ic-head"><div class="q-text">${q}</div><button class="send-to-ai ic-ask">Ask AI <svg viewBox="0 0 24 24" fill="none" style="width:12px;height:12px"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="q-src">${src}</div><div class="ai-answer"><span class="ai-ans-ic">${hexBot('icbot'+n)}</span><span class="ai-ans-label">AI답변</span><span class="ai-ans-text">${a}</span></div></div>`;}
  function hexBot(id){return `<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="${id}" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#5f3cff"/><stop offset="46%" stop-color="#4cd5ff"/><stop offset="100%" stop-color="#56fffc"/></linearGradient></defs><path d="M12 1.8l8.66 5v10.4L12 22.2 3.34 17.2V6.8z" fill="url(#${id})"/><rect x="8" y="10.2" width="8" height="6" rx="2" fill="#fff"/><rect x="11.4" y="7.4" width="1.2" height="2.6" rx="0.6" fill="#fff"/><circle cx="12" cy="6.9" r="1.1" fill="#fff"/><circle cx="10.2" cy="13.2" r="1" fill="url(#${id})"/><circle cx="13.8" cy="13.2" r="1" fill="url(#${id})"/></svg>`;}
  function riskTable(){
    const rows=[
      ['red','매출 집중','한전 단일 매출 의존도 64.3%','한전 발주 정책 변화 시 매출 급감. <span style="color:var(--red);font-weight:600">한일변전 유사 리스크 현실화 → IRR -3.3%p</span>',94,'high','상','[리스크] 매출집중. 한전 의존도 64.3%. 한일변전 IRR -3.3%p 사례. 신뢰도 94%, 심각도 상.'],
      ['amber','원자재','구리 가격 변동성 (원가 38%)','LME 구리 +18% YTD. 헤지 비율 42% — 업계 65% 대비 낮음',87,'mid','중','[리스크] 원자재. 구리 원가 38%, 헤지 42%. LME 구리 +18% YTD. 신뢰도 87%.'],
      ['gray','규제','IRA 정책 변경 가능성','미 행정부 교체 시 세액공제 축소. 북미 마진 재검토 필요',71,'mid','중','[리스크] IRA 규제. 미 행정부 교체 시 세액공제 축소. 신뢰도 71%.'],
      ['gray','유동성','IPO 지연 시 Put Option 행사','2027.Q4 IPO 지연 → Put 행사(5% YTM). 발행사 현금 410억 — 상환 여력 충분',58,'low','하','[리스크] 유동성. IPO 지연 시 Put(YTM 5%). 현금 410억 상환 가능. 신뢰도 58%.'],
    ];
    return `<div class="risk-table"><div class="risk-head"><div style="text-align:center">유형</div><div>내용 · 근거</div><div style="text-align:center">신뢰도</div><div style="text-align:center">심각도</div><div style="text-align:center">AI 분석</div></div>${rows.map(r=>`<div class="risk-row sendable" data-ctx="${r[7]}" data-label="리스크: ${r[1]}"><div style="text-align:center"><span class="badge ${r[0]}" style="height:21px">${r[1]}</span></div><div><div class="risk-main">${r[2]}</div><div class="risk-detail">${r[3]}</div></div><div><div class="conf-mini"><div class="conf-bar-mini"><i style="width:${r[4]}%"></i></div>${r[4]}%</div></div><div style="text-align:center"><span class="sev-${r[5]}">${r[6]}</span></div><div style="text-align:center"><button class="ask-ai-link send-to-ai">Ask AI <svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>`).join('')}</div>`;
  }

  const leftMeta = `
    <div class="meta-grp"><div class="meta-l">투자 대상</div><div class="meta-v-lg">우진기전㈜</div><div style="font-size:11px;color:var(--t3);margin-top:3px">중전기기 제조 · 매출 1,842억 ('25)</div></div>
    <div class="meta-grp"><div class="meta-l">투자 구조</div>${mr('투자 유형','PEF (Pre-IPO)')}${mr('상품 구조','CB (전환사채)')}${mr('투자 금액','150억원')}${mr('지분율','7.8%')}</div>
    <div class="meta-grp"><div class="meta-l">수익 / 회수</div>${mr('예상 IRR','22.5%')}${mr('Exit 방식','IPO')}${mr('예상 회수','2027.Q4')}${mr('투자 기간','약 24개월')}</div>
    <div class="meta-grp"><div class="meta-l">담당</div>${mr('주관','김화인')}${mr('보조','김파트')}<div class="meta-row"><span class="mk">마감일</span><span class="mv" style="display:flex;align-items:center;gap:7px"><span class="dday-pill">D-2</span><span style="color:var(--red)">2026.05.29</span></span></div></div>`;
  const attachSection = `
    <div class="attach-h"><span class="attach-t">첨부 문서</span><span class="attach-c">4건</span></div>
    <div class="attach-list">
      ${docRow('PDF','우진기전_IM_v2.pdf','2026.04.29 · 84p')}
      ${docRow('PDF','감사보고서_2023-2025.pdf','2026.04.29 · 62p')}
      ${docRow('XLSX','밸류에이션_초안.xlsx','2026.04.29 · 12 sheets')}
      ${docRow('DOCX','검토보고서_v3.docx','2026.04.29 · 작성중')}
    </div>`;
  function mr(k,v){return `<div class="meta-row"><span class="mk">${k}</span><span class="mv">${v}</span></div>`;}
  function fileIcon(type){
    const c={PDF:'#d92d20',XLSX:'#079455',DOCX:'#155eef'}[type]||'#98a2b3';
    const bw=type.length===3?17:23;
    return `<span class="file-ic"><svg width="34" height="34" viewBox="0 0 34 40" fill="none"><path d="M1.5 2.5A1.5 1.5 0 0 1 3 1h17.5L32 11.5v25A1.5 1.5 0 0 1 30.5 38h-27A1.5 1.5 0 0 1 1.5 36.5z" fill="#fff" stroke="#dbdbdb" stroke-width="1.2"/><path d="M20.5 1l11.5 10.5H22A1.5 1.5 0 0 1 20.5 10z" fill="#d4d4d8"/><rect x="1" y="20" width="${bw}" height="15" rx="3" fill="${c}"/><text x="${1+bw/2}" y="30.6" font-family="Inter,sans-serif" font-weight="700" font-size="8.5" fill="#fff" text-anchor="middle">${type}</text></svg></span>`;
  }
  function docRow(type,name,sub){return `<div class="doc-row" data-toast="${name} 열기 (프로토타입)">${fileIcon(type)}<div class="doc-meta"><div class="doc-name">${name}</div><div class="doc-sub">${sub}</div></div></div>`;}

  const content = `
    <div class="dh reveal">
      <div class="dh-row1">
        <div class="dh-bar"></div>
        <div>
          <h1 class="dh-title">우진기전 Pre-IPO PEF</h1>
          <div class="dh-tags"><span class="badge gray">PEF</span><span class="badge gray">전력·에너지</span><span class="badge gray">CB</span><span class="badge gray">FP-2026-0142</span><span class="badge amber">D-2 심의</span></div>
        </div>
        <div class="dh-actions"><button class="btn danger" data-drop>Drop 처리</button><button class="btn" data-toast="PDF로 내보내는 중…">PDF 내보내기</button><button class="btn primary" data-ref>검토보고서 작성 →</button></div>
      </div>
      <div class="stepper">${(()=>{const steps=['신규 제안','검토','1차 심의','2차 심의','승인','사후관리','종결'];const cur=1;return steps.map((s,i)=>{const st=i<cur?'done':i===cur?'cur':'todo';const circle=i<cur?'<svg viewBox="0 0 24 24" fill="none"><path d="M6 12.5l4 4 8-9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>':(i+1);const conn=i<steps.length-1?`<div class="step-conn ${i<cur?'active':''}"></div>`:'';return `<div class="step ${st}"><div class="step-circle">${circle}</div><div class="step-label">${s}</div></div>${conn}`;}).join('');})()}</div>
    </div>
    <div class="pane">
      <div class="pn-col reveal d1">
        <aside class="pn pn-left">${leftMeta}</aside>
        <aside class="pn attach-card">${attachSection}</aside>
      </div>
      <main class="pn pn-center reveal d2">
        <div class="c-tabs">
          <div class="c-tab on" data-tab="summary">Executive Summary</div>
          <div class="c-tab" data-tab="similar">유사 Deal <span class="tc">3</span></div>
          <div class="c-tab" data-tab="risk">Risk 탐지 <span class="tc">4</span></div>
          <div class="c-tab" data-tab="ic">IC 예상 질의 <span class="tc">3</span></div>
        </div>
        <div class="tab-body" id="tabBody">${tabSummary}</div>
      </main>
    </div>`;

  document.getElementById('content').innerHTML = content;

  /* tab bodies for the secondary tabs */
  const tabSimilar = `<div class="sec-t">유사 Deal Top 3 <small>· 자사 142건 중 · 항목 클릭 → AI 비교</small></div><div class="sim-grid">
    ${sim('대원전기 Pre-IPO','유사 89%','2023 · 전력·에너지 · CB · 종결',['ok','성공'],[['예상 IRR','20.0%',''],['실제 IRR','24.3% ▲','var(--green)'],['Exit','IPO (18개월)','']],'[유사딜] 대원전기 Pre-IPO(2023,성공). IRR 24.3%▲. 유사도 89%.')}
    ${sim('한일변전 PEF','유사 82%','2022 · 전력·에너지 · 메자닌 · 종결',['amber','부분성공'],[['예상 IRR','18.5%',''],['실제 IRR','15.2% ▼','var(--red)'],['주요 리스크','한전 의존도','']],'[유사딜] 한일변전 PEF(2022,부분성공). IRR 15.2%▼. 한전 의존도 현실화. 유사도 82%.')}
    ${sim('광명에너지 CB','유사 76%','2024 · 신재생 · CB · 사후관리',['info','진행중'],[['예상 IRR','22.0%',''],['현재 IRR','19.4%',''],['Exit','IPO 준비중','']],'[유사딜] 광명에너지 CB(2024,진행). IRR 19.4%. 유사도 76%.')}
  </div>`;
  const tabRisk = `<div class="sec-t">AI 리스크 탐지 <small>· 행 클릭 → AI 심층 분석</small></div>${riskTable()}`;
  const tabIc = `<div class="sec-t">IC 예상 질의 <small>· 과거 심의 학습 기반</small></div>
    ${icQA('Q1','한전 의존도 64%인데 한일변전 때랑 뭐가 다른가요?','AI 초안: 우진기전은 북미 매출 21%(4,200억)로 단일 의존 구조가 이미 분산됨...','한일변전 2022년 2차심의 기반 · 신뢰도 88%','[IC Q1] 한전 의존도 64% vs 한일변전. 북미 21% 분산. 88%.')}
    ${icQA('Q2','IPO 지연 시 Put 행사하면 수익률은?','AI 초안: Put 행사 시 YTM 5%로 원금+이자 약 165억. IRR 환산 약 8.2%...','시나리오 분석 · 신뢰도 94%','[IC Q2] Put 행사 IRR? YTM 5%, 165억, IRR 8.2%. 94%.')}
    ${icQA('Q3','밸류에이션 18,500원 근거가 뭐가요?','AI 초안: LS일렉트릭 14.2배, 일진전기 15.4배 평균 14.8배 대비 P/E 11.4배...','Peer 비교 DB + IM p.38 · 신뢰도 91%','[IC Q3] 밸류 18,500원? P/E 11.4배 vs 14.8배. 23% 할인. 91%.')}`;
  const TABS = {summary:tabSummary, similar:tabSimilar, risk:tabRisk, ic:tabIc};

  window.__deal = { TABS };
  initReveal();
})();
