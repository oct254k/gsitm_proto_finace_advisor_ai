/* ===== PORTFOLIO content ===== */
(function(){
  renderSidebar('aftercare');

  const sourceBar = (items)=>`<div style="padding:12px 20px 0"><div class="source-bar">${items.map((it,i)=>`${i>0?'<div class="sb-divider"></div>':''}<div class="sb-item">${i===0?'<span class="sb-dot"></span>':''}<span class="sb-k">${it[0]}</span><span class="sb-v">${it[1]}</span></div>`).join('')}</div></div>`;

  const ganttRows = [
    {name:'한일정밀 메자닌', sub:'<span style="color:var(--red);font-weight:700">만기 경과 14일</span> · 80억 · 👤 김파트', bars:'<div class="g-bar warn" style="left:0;width:4%"></div><div class="g-event alert" style="left:0"></div>'},
    {name:'대원전기 Pre-IPO', sub:'<span style="color:var(--amber);font-weight:700">Exit 검토 권고</span> · 전력·에너지 · 👤 김화인', bars:'<div class="g-bar exit-ready" style="left:0;width:32%"></div><div class="g-event future" style="left:28%"></div>'},
    {name:'동성제약 메자닌', sub:'바이오 · 분기 배당 · 진행 75% · 👤 김파트', bars:'<div class="g-bar ok" style="left:0;width:50%"></div><div class="g-event future" style="left:3%"></div><div class="g-event future" style="left:28%"></div><div class="g-event future" style="left:48%"></div>'},
    {name:'광명에너지 CB', sub:'신재생 · 분기 배당 · 진행 30% · 👤 김화인', bars:'<div class="g-bar" style="left:0;width:75%"></div><div class="g-event future" style="left:8%"></div><div class="g-event future" style="left:33%"></div><div class="g-event future" style="left:58%"></div>'},
    {name:'서울리츠 부동산 PF', sub:'부동산 · 분할상환 · 진행 22% · 👤 김파트', bars:'<div class="g-bar" style="left:0;width:88%"></div><div class="g-event future" style="left:18%"></div><div class="g-event future" style="left:48%"></div><div class="g-event future" style="left:78%"></div>'},
    {name:'메디팜 신기술조합', sub:'바이오 · IPO 예정 · 진행 60% · 👤 김화인', bars:'<div class="g-bar" style="left:0;width:60%"></div><div class="g-event future" style="left:55%"></div>'},
  ];
  const tableRows = [
    {n:'한일정밀 메자닌', meta:['warn','만기 경과','FP-2024-0088'], ind:'기계·부품', date:'24.05.13|<span style="color:var(--red)">만기 경과</span>', irr:['12.0%','추심중','','red'], prog:[0,'미회수 · 원금 80억','var(--red)'], sig:['alert','긴급'], mgr:'김파트', act:['warn','조치 검토','한일정밀 메자닌 회수 만기 경과 건 조치 로드맵 알려줘']},
    {n:'대원전기 Pre-IPO', meta:['amber','Exit 권고','FP-2023-0062'], ind:'전력·에너지', date:"23.08.20|예정 '27.Q4", irr:['20.0%','24.3%','▲ +4.3%p','up'], prog:[32,'32% · 48억 회수',''], sig:['watch','검토'], mgr:'김화인', act:['','Exit 분석','대원전기 Pre-IPO 현재 Exit 시 예상 회수 금액과 최적 타이밍 분석해줘']},
    {n:'동성제약 메자닌', meta:['','','FP-2024-0011'], ind:'바이오', date:'24.01.15|26.01.14', irr:['13.5%','14.8%','▲ +1.3%p','up'], prog:[75,'75% · 배당 3회 완료',''], sig:['ok','정상'], mgr:'김파트', act:['','보고서','']},
    {n:'서울리츠 부동산 PF', meta:['','','FP-2025-0034'], ind:'부동산', date:'25.03.10|28.03.09', irr:['11.2%','10.8%','▼ -0.4%p','dn'], prog:[22,'22% · 분할상환 2회',''], sig:['ok','정상'], mgr:'김파트', act:['','보고서','']},
    {n:'광명에너지 CB', meta:['','','FP-2024-0051'], ind:'신재생', date:'24.07.01|27.06.30', irr:['22.0%','19.4%','▼ -2.6%p','dn'], prog:[30,'30% · 배당 1회 완료',''], sig:['watch','주의'], mgr:'김화인', act:['','모니터링','광명에너지 CB IRR 하회 원인과 향후 전망 분석해줘']},
  ];

  function kpi(l,v,u,d,cls,tag){return `<div class="pf-kpi ${cls||''}"><div class="pf-kpi-l">${l}${tag?` <span class="badge red" style="height:17px;font-size:9px">${tag}</span>`:''}</div><div class="pf-kpi-v">${v}<small>${u}</small></div><div class="pf-kpi-d">${d}</div></div>`;}

  const html = `
    <div class="page-h reveal"><div><h1>사후관리 / 회수</h1><div class="sub">24건 운용 · 회수 완료율 64.2% · 2026.05.27 기준</div></div>
      <div class="page-h-actions"><button class="btn" data-chip="이번 달 회수 예정 금액과 입금일 정리해줘"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" fill="currentColor"/></svg>AI 회수 브리핑</button></div>
    </div>

    <div class="alert-strip2 reveal d1">
      <div class="as-badge"><svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>긴급</div>
      <div class="as-items">
        <div class="as-item"><div class="as-title">한일정밀 메자닌 · 회수 만기 14일 경과</div><div class="as-desc">원금 80억 · 만기일 5/13 경과 · 담당: 김파트</div><div class="as-conf">AI 신뢰도 98%</div><button class="as-btn" data-chip="한일정밀 메자닌 회수 만기 경과 건 조치 로드맵과 추심 절차 알려줘">AI 조치 검토 →</button></div>
        <div class="as-item"><div class="as-title">신재생에너지 업황 둔화 · 영향 딜 3건</div><div class="as-desc">REC 가격 -12% MoM · 광명에너지 등 IRR 재추정 필요</div><div class="as-conf">AI 신뢰도 84%</div><button class="as-btn" data-chip="신재생에너지 업황 둔화가 포트폴리오에 미치는 영향과 IRR 재추정 결과 알려줘">AI 영향 분석 →</button></div>
      </div>
    </div>

    <div class="card reveal d2">
      <div class="card-h bordered"><h3>현금흐름 현황 (이번 달)</h3><div class="card-h-right"><button class="why-btn" data-why="cashflow">AI 분석 근거 보기</button><span class="sub">2026.05</span></div></div>
      ${sourceBar([['데이터 기준','2026.05.27 09:42'],['출처','ERP(자금관리)·한국은행·회수 스케줄'],['기준금리','3.00% (동결)'],['갱신','실시간/일1회']])}
      <div class="cf-grid">
        <div class="cf-block"><div class="cf-label">회수 예정</div><div class="cf-val" style="color:var(--green)">82<small>억원</small></div><div class="cf-sub">배당 54억 + 원금 28억 · 3건</div></div>
        <div class="cf-block"><div class="cf-label">투자 집행 예정</div><div class="cf-val">150<small>억원</small></div><div class="cf-sub">우진기전 PEF (예정)</div></div>
        <div class="cf-block"><div class="cf-label">순 현금 변동</div><div class="cf-val" style="color:var(--red)">-68<small>억원</small></div><div class="cf-sub">Dry Powder 1,250억 → 1,182억</div></div>
      </div>
      <div class="ai-comment"><span class="ai-pill">AI</span><div class="ai-text">이번 달 순 현금 -68억으로 Dry Powder가 소진되나, 6월 서울리츠 분할상환(28억)·동성제약 배당(4.2억) 유입이 예정되어 단기 유동성은 안정적. 기준금리 동결(3.00%)로 조달 비용 변동 없음.</div><button class="why-btn" data-why="cashflow" style="align-self:center">근거 →</button></div>
    </div>

    <div class="card reveal d3">
      <div class="card-h bordered"><h3>포트폴리오 KPI</h3><div class="card-h-right"><button class="why-btn" data-why="kpi">AI 분석 근거 보기</button><span class="sub">전사 합산</span></div></div>
      ${sourceBar([['데이터 기준','2026.05.27 09:42'],['출처','ERP·한국거래소·Bloomberg'],['IRR 산정','실현 현금흐름 (XIRR)']])}
      <div class="pf-kpi-grid">
        ${kpi('사후관리 AUM','5,840','억원','▲ +5.2% QoQ · 24건')}
        ${kpi('회수 지연 건수','3','건','▲ 전월 2건 · 지연 원금 142억','warn','긴급')}
        ${kpi('이번 달 회수 예정','82','억원','배당 54억 + 원금 28억 · 3건')}
        ${kpi('평균 실현 IRR (YTD)','17.8','%','▲ 목표 15.0% 대비 +2.8%p','ok')}
        ${kpi('회수 완료율','64.2','%','누적 3,750억 · 잔여 2,090억')}
      </div>
      <div class="ai-bar"><span class="ai-bar-tag">AI</span><div class="ai-bar-chips">
        ${['현재 회수 지연 중인 투자건 정리해줘','이번 달 회수 예정 금액과 입금일','회수 지연 가능성 높은 Deal Top 3','Exit 적기 가능성 높은 건','포트폴리오 전체 리스크 요약'].map(c=>`<div class="ai-chip" data-chip="${c}">${c}</div>`).join('')}
      </div><div class="ai-bar-open" data-open>+ Agent 열기</div></div>
    </div>

    <div class="card reveal d4">
      <div class="card-h bordered"><h3>AI 리스크 조기경보</h3><div class="card-h-right"><span class="sub">긴급 1 · 주의 3 · 기준 09:42</span><button class="btn sm" data-chip="포트폴리오 전체 리스크를 긴급도 순으로 요약하고 각 조치 방향을 알려줘">AI 전체 분석</button></div></div>
      ${risk('warn','긴급','한일정밀 · 만기 14일 경과','98%','원금 80억 회수 불가. 발행사 유동성 악화 신호. 추심 절차 검토 또는 채권 재구조화 필요. 담당: 김파트','risk_hanil','조치 로드맵 →','한일정밀 메자닌 회수 만기 경과 건 조치 로드맵 상세히 알려줘',true)}
      ${risk('amber','주의','신재생에너지 업황 둔화','84%','REC 가격 -12% MoM. 영향 딜 3건 (광명에너지 외). IRR 재추정 검토 필요.','risk_rec','영향 분석 →','신재생에너지 업황 둔화 영향 딜 분석과 IRR 재추정 결과 알려줘',false)}
      ${risk('amber','주의','광명에너지 · IRR 예상 대비 하회','79%','예상 22.0% vs 현재 19.4%. 업황 둔화 지속 시 추가 하락 가능.','risk_gm','IRR 재추정 →','광명에너지 CB IRR 하회 원인과 향후 전망 분석해줘',false)}
      ${risk('gray','모니터링','대원전기 · Exit 적기 신호','91%','Peer P/E 16.2배 (전환가 기준 +38% 상승). 구리 가격 고점 리스크 전 조기 Exit 검토 권고.','exit_dw','Exit 분석 →','대원전기 Pre-IPO Exit 적기 분석과 예상 회수 금액 계산해줘',false)}
    </div>

    <div class="reveal d5"><div class="exit-banner">
      <span class="eb-tag">AI · Exit 적기 신호</span>
      <div class="eb-text"><strong>대원전기 Pre-IPO</strong> — 현재 Peer P/E 16.2배 (전환가 기준 +38% 상승). IPO 예정일까지 18개월 남았으나 <strong>현재 시장 Exit 검토 권고</strong>. 구리 가격 고점 리스크 사전 회피 가능. 담당: <strong>김화인</strong></div>
      <button class="eb-why" data-why="exit_dw">근거 보기</button>
      <button class="eb-action" data-chip="대원전기 Pre-IPO 현재 Exit 시 예상 회수 금액과 IRR, 최적 Exit 타이밍 분석해줘">Exit 분석 →</button>
    </div></div>

    <div class="card reveal d6">
      <div class="card-h bordered"><h3>회수 스케줄 (향후 12개월)</h3><div class="card-h-right"><div class="btn-grp"><button class="on">Gantt</button><button data-toast="Calendar 뷰 (프로토타입)">Calendar</button></div><select class="pf-select"><option>전체 산업</option><option>전력·에너지</option><option>바이오</option><option>부동산</option></select></div></div>
      <div class="gantt">
        <div class="gantt-head"><div style="font-size:11px;font-weight:600;color:var(--t3)">Deal · 담당자</div><div class="gantt-months">${["'26.06","07","08","09","10","11","12","'27.01","02","03","04","05"].map(m=>`<div>${m}</div>`).join('')}</div></div>
        ${ganttRows.map(r=>`<div class="gantt-row"><div class="g-name">${r.name}<div class="g-name-sub">${r.sub}</div></div><div class="g-track">${r.bars}<div class="g-today" style="left:0"></div></div></div>`).join('')}
      </div>
      <div class="gantt-legend">
        <div class="leg-item"><div class="leg-dot" style="background:#c8e8d8;border:1px solid #a0c8b0"></div>정상 진행</div>
        <div class="leg-item"><div class="leg-dot" style="background:#e8f0c8;border:1px dashed #c0d890"></div>Exit 검토 권고</div>
        <div class="leg-item"><div class="leg-dot" style="background:repeating-linear-gradient(45deg,#fde8e8,#fde8e8 4px,#f5d0d0 4px,#f5d0d0 8px);border:1px solid #e0a8a8"></div>지연/경고</div>
        <div class="leg-item"><div style="width:6px;height:11px;background:var(--indigo);border-radius:1px"></div>회수 이벤트</div>
        <div class="leg-item"><div style="width:6px;height:11px;background:var(--red);border-radius:1px"></div>긴급</div>
        <div style="margin-left:auto;font-size:11px;color:var(--t3)">▲ = 오늘 기준선</div>
      </div>
    </div>

    <div class="card reveal d7">
      <div class="card-h bordered"><h3>포트폴리오 현황 <span style="font-weight:500;color:var(--t4);font-size:13px">전체 24건</span></h3><div class="card-h-right"><input class="pf-input" placeholder="Deal 검색..."><select class="pf-select"><option>전체 산업</option><option>전력·에너지</option><option>바이오</option></select></div></div>
      <div class="tbl-wrap"><table class="ptbl">
        <thead><tr><th style="width:190px">Deal</th><th>산업</th><th>투자 / 회수일</th><th style="width:160px">IRR (예상 → 실현)</th><th style="width:130px">회수 진행</th><th>AI 신호</th><th style="width:72px">담당</th><th style="width:120px">조치</th></tr></thead>
        <tbody>${tableRows.map(r=>row(r)).join('')}</tbody>
      </table></div>
    </div>

    <div class="card reveal d8">
      <div class="card-h bordered"><h3>LP 보고서</h3><span class="sub">2026.Q1 기준 · ERP 데이터 기반 자동 생성</span></div>
      <div class="lp-item"><div class="lp-name">국민연금 공단</div><div class="lp-status">AI 초안 생성 완료</div><button class="lp-act ready" data-toast="국민연금 LP 보고서 초안 검토 (프로토타입)">검토 →</button></div>
      <div class="lp-item"><div class="lp-name">교직원공제회</div><div class="lp-status">데이터 취합중</div><button class="lp-act" data-toast="AI 보고서 생성 시작">AI 생성</button></div>
      <div class="lp-item"><div class="lp-name">행정공제회</div><div class="lp-status">미시작</div><button class="lp-act" data-toast="AI 보고서 생성 시작">AI 생성</button></div>
    </div>

    <div class="card reveal d8">
      <div class="card-h bordered"><h3>Outcome DB · 투자 판단 vs 결과</h3><span class="sub">종결 18건 · 학습 데이터 누적 · AI가 다음 딜에 자동 적용</span></div>
      <div class="out-row"><div class="out-name">대원전기 Pre-IPO</div><div class="out-logic">IPO 성공 · 한전 수주 지속 → ESS 모멘텀 유효</div><div class="out-result up">+4.3%p</div><div class="out-gap">IRR 초과</div></div>
      <div class="out-row"><div class="out-name">한일변전 PEF</div><div class="out-logic">한전 의존도 리스크 현실화 · 발주 감소</div><div class="out-result dn">-3.3%p</div><div class="out-gap">IRR 미달</div></div>
      <div class="out-row"><div class="out-name">리스텍 Drop</div><div class="out-logic">Drop 사유: 밸류에이션 과다 · 실제 M&A 무산 후 청산</div><div class="out-result up">✓ 적중</div><div class="out-gap">Drop 정확</div></div>
      <div class="out-row"><div class="out-name">코리아솔라 Drop</div><div class="out-logic">Drop 사유: 업황 둔화 · 실제 상장 후 +180% 상승</div><div class="out-result dn">✗ 오판</div><div class="out-gap">Drop 오류</div></div>
    </div>
  `;

  function risk(sevCls,sevTxt,title,conf,desc,why,act,chip,warn){
    const badge = sevCls==='warn'?'red':sevCls==='amber'?'amber':'gray';
    return `<div class="risk-card"><div class="risk-sev"><span class="badge ${badge}">${sevTxt}</span></div><div class="risk-body"><div class="risk-title">${title}<span class="risk-conf">AI ${conf}</span><button class="why-btn" data-why="${why}" style="padding:3px 8px;font-size:10px">근거</button></div><div class="risk-desc">${desc}</div></div><button class="risk-act ${warn?'warn':''}" data-chip="${chip}">${act}</button></div>`;
  }
  function row(r){
    const d=r.date.split('|');
    return `<tr><td><div class="deal-name">${r.n}</div><div class="deal-meta">${r.meta[0]?`<span class="badge ${r.meta[0]==='warn'?'red':'amber'}" style="height:17px;font-size:9px">${r.meta[1]}</span>`:''}${r.meta[2]}</div></td>
      <td style="text-align:center"><span class="badge gray">${r.ind}</span></td>
      <td style="text-align:center"><div class="date-cell">${d[0]}<br>${d[1]}</div></td>
      <td><div class="irr-cell"><span class="irr-e">${r.irr[0]}</span><span style="color:var(--t4)">→</span><span class="irr-a" ${r.irr[3]==='red'?'style="color:var(--red)"':''}>${r.irr[1]}</span>${r.irr[2]?`<span class="irr-${r.irr[3]}">${r.irr[2]}</span>`:''}</div></td>
      <td><div class="prog-bar"><i style="width:${r.prog[0]}%${r.prog[2]?`;background:${r.prog[2]}`:''}"></i></div><div class="prog-l" ${r.prog[2]?`style="color:${r.prog[2]}"`:''}>${r.prog[1]}</div></td>
      <td style="text-align:center"><span class="signal sig-${r.sig[0]}"><span class="signal-dot"></span>${r.sig[1]}</span></td>
      <td style="text-align:center"><span class="mgr-badge">${r.mgr}</span></td>
      <td style="text-align:center"><button class="act-btn ${r.act[0]==='warn'?'warn':''}" ${r.act[2]?`data-chip="${r.act[2]}"`:`data-toast="${r.act[1]} (프로토타입)"`}>${r.act[1]}</button></td></tr>`;
  }

  document.getElementById('cnt').innerHTML = html;
  initReveal();
  animateBars();
})();
