/* ===== COCKPIT screen ===== */
(function(){
  renderSidebar('cockpit');

  const tasks = [
    {stage:'검토', stageCls:'warn', name:'우진기전 Pre-IPO PEF', sub:'검토보고서 v3 초안 작성 · 전력·에너지', team:['김화','김파'], pct:100, dday:'D-2', ddCls:'urg', href:'deal.html'},
    {stage:'제안접수', stageCls:'info', name:'케이엠솔라 신기술조합', sub:'IM 분석 결과 검토 · 신재생에너지', team:['김화'], pct:62, dday:'D-3', ddCls:'urg'},
    {stage:'1차심의', stageCls:'', name:'메디팜글로벌 CB', sub:'IC 자료 업로드 및 발표 준비 · 바이오', team:['김화','박찬'], pct:100, dday:'D-5', ddCls:''},
    {stage:'사후관리', stageCls:'muted', name:'동성제약 메자닌', sub:'2026 Q1 성과 모니터링 보고 · 바이오', team:['김화'], pct:0, dday:'D-7', ddCls:''},
    {stage:'2차심의', stageCls:'', name:'한라정밀 Buyout', sub:'본심의 의견서 검토 의견 회신 · 기계', team:['김화','최현','김파'], pct:100, dday:'D-9', ddCls:'ok'},
    {stage:'검토', stageCls:'', name:'서울리츠 부동산 PF', sub:'시장 데이터 분석 · 부동산', team:['김화'], pct:31, dday:'D-12', ddCls:'ok'},
  ];
  const team = [
    {av:'김화',cls:'c-indigo',name:'김화인',role:'심사역 (나)',deals:[['우진기전 PEF','검토','warn'],['메디팜 CB','1차심의',''],['케이엠솔라','제안','info']],load:85,loadTxt:'높음',loadCls:''},
    {av:'김파',cls:'c-slate',name:'김파트',role:'심사역',deals:[['우진기전 PEF','검토','warn'],['한라정밀','2차심의','']],load:55,loadTxt:'중간',loadCls:''},
    {av:'박너',cls:'c-slate',name:'박너스',role:'심사역',deals:[['메디팜 CB','1차심의',''],['서울리츠 PF','검토','warn']],load:50,loadTxt:'중간',loadCls:''},
    {av:'최현',cls:'c-slate',name:'최현수',role:'심사역',deals:[['한라정밀','2차심의',''],['동성제약','사후관리','muted']],load:30,loadTxt:'여유',loadCls:'ok'},
  ];
  const kpis = [
    {l:'총 운용자산 (AUM)', v:'8,420', u:'억원', pill:'+5.2% QoQ', dir:'up', sub:'전분기 8,003억', spark:[24,22,25,18,20,14,16,9,11,5]},
    {l:'진행중 Deal', v:'30', u:'건', pill:'+4건 MoM', dir:'up', sub:'신규 12 / 종료 8', spark:[16,18,12,15,11,17,9,13,8,7]},
    {l:'평균 실현 IRR (YTD)', v:'17.8', u:'%', pill:'+2.8%p', dir:'up', sub:'목표 15.0% 대비 상승', spark:[21,18,20,16,17,12,14,9,8,6]},
    {l:'가용 자금 (Dry Powder)', v:'1,250', u:'억원', pill:'-180억 MoM', dir:'dn', sub:'약정 잔여 3,420억', spark:[7,9,8,12,11,15,14,18,17,22]},
  ];
  const pipe = [
    ['1','제안접수','12',60,'blue'],['2','검토','8',40,'blue'],['3','1차 심의','5',25,'violet'],['4','2차 심의','3',15,'violet'],
    ['5','승인','2',10,'green'],['6','사후관리','24',100,'gray'],['7','종결 (YTD)','18',75,'gray'],
  ];
  const acts = [
    ['우진기전 PEF','검토보고서 v3 저장 · Risk 섹션 보완 (5장 수정)','김화인','30분 전'],
    ['케이엠솔라','IM 분석 결과 조회 · 유사 Deal 비교 (3건)','김화인','2시간 전'],
    ['한라정밀 Buyout','본심의 의견서 코멘트 3건 추가 · 수정 요청','김파트','3시간 전'],
    ['메디팜글로벌 CB','IC 자료 v2 작성 완료 · 발표 자료 업로드','박너스','어제 17:42'],
    ['동성제약 메자닌','분기 배당금 4.2억 회수 등록 (실제 vs 예상 +0.3억)','최현수','어제 14:15'],
  ];

  function avatars(arr){return '<div class="task-team">'+arr.map(a=>'<div class="task-avatar">'+a+'</div>').join('')+'</div>';}
  function pctLabel(p){return p===100?'완료':p===0?'미시작':p+'%';}

  const html = `
  <div class="page-h reveal">
    <div><h1>Dashboard</h1><div class="sub">2026.05.27 (화) · 김화인 심사역 · 오늘 처리할 핵심 업무 7건</div></div>
    <div class="page-h-actions">
      <button class="btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>신규 Deal</button>
      <button class="btn primary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" fill="currentColor"/></svg>AI 브리핑</button>
    </div>
  </div>

  <div class="exec-banner reveal d1">
    <span class="eb-label">임원 뷰</span>
    <div class="eb-items">
      <div class="eb-item"><div class="eb-v"><span data-count="8420" data-suffix="">0</span><small>억</small></div><div class="eb-l">총 운용자산 (AUM)</div></div>
      <div class="eb-divider"></div>
      <div class="eb-item"><div class="eb-v"><span data-count="17.8" data-dec="1">0</span><small>%</small></div><div class="eb-l">평균 실현 IRR (YTD)</div></div>
      <div class="eb-divider"></div>
      <div class="eb-item"><div class="eb-v"><span data-count="3">0</span><small>건</small></div><div class="eb-l">회수 지연 <span style="opacity:.6;font-size:11px;font-weight:400">/ 원금 142억</span></div></div>
      <div class="eb-divider"></div>
      <div class="eb-item"><div class="eb-v"><span data-count="1250">0</span><small>억</small></div><div class="eb-l">가용 자금 (Dry Powder)</div></div>
      <div class="eb-divider"></div>
      <div class="eb-item"><div class="eb-v"><span data-count="30">0</span><small>건</small></div><div class="eb-l">진행중 Deal</div></div>
    </div>
    <div class="eb-ask"><input placeholder='임원용 질의 — "현재 가장 위험한 건?"'></div>
  </div>

  <div class="alert-strip2 reveal d2">
    <div class="as-label"><svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>긴급</div>
    <div class="as-items">
      <div class="as-item" data-href="portfolio.html"><div class="ai-title">한일정밀 메자닌 · 회수 만기 14일 경과</div><div class="ai-desc">원금 80억 · 만기일 5/13 경과 · AI 신뢰도 98%</div><button class="ai-action">조치 검토 →</button></div>
      <div class="as-item" data-href="deal.html"><div class="ai-title">우진기전 PEF · 1차 심의 D-2 임박</div><div class="ai-desc">검토보고서 v3 미승인 · IC 자료 미업로드</div><button class="ai-action">바로가기 →</button></div>
    </div>
  </div>

  <div class="row r6040">
    <div class="card reveal d3">
      <div class="card-h bordered"><h3>내 업무 <span style="font-weight:500;color:var(--t4);font-size:13px">My Tasks</span></h3><div class="card-h-right"><button class="hdr-icon" title="필터" data-toast="필터 (프로토타입)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 5.5h16l-6.3 7.4v4.9l-3.4 1.7v-6.6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button><button class="hdr-icon" title="내보내기" data-toast="내보내기 (프로토타입)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 4v9m0 0l-3.2-3.3M12 13l3.2-3.3M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="hdr-icon" title="더보기" data-toast="더보기 (프로토타입)"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></button></div></div>
      <div class="card-body" style="padding:8px 18px 12px">
        <table class="task-tbl">
          <thead><tr><th style="width:62px">단계</th><th>Deal · 다음 액션</th><th style="width:72px">담당팀</th><th style="width:88px">AI 준비</th><th style="width:66px;text-align:right">D-Day</th></tr></thead>
          <tbody>
            ${tasks.map(t=>`<tr ${t.href?`data-href="${t.href}"`:''}>
              <td><span class="tag ${t.stageCls}">${t.stage}</span></td>
              <td><div class="task-name">${t.name}</div><div class="task-sub">${t.sub}</div></td>
              <td>${avatars(t.team)}</td>
              <td><div class="ai-ready"><div class="ai-prog-bar"><i style="width:${t.pct}%"></i></div><span class="ai-pct">${pctLabel(t.pct)}</span></div></td>
              <td style="text-align:right"><span class="dday ${t.ddCls}">${t.dday}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card reveal d4">
      <div class="card-h bordered"><h3>팀 현황 · 업무 분포</h3><span class="sub">투자2본부 · 4인</span></div>
      <div class="team-grid">
        ${team.map(m=>`<div class="team-member">
          <div class="tm-header"><div class="tm-avatar logo-box ${m.cls}">${m.av}</div><div><div class="tm-name">${m.name}</div><div class="tm-role">${m.role}</div></div></div>
          <div class="tm-deals">${m.deals.map(d=>`<div class="tm-deal"><span class="td-name">${d[0]}</span><span class="tag ${d[2]}" style="font-size:9.5px;padding:1px 6px;height:18px">${d[1]}</span></div>`).join('')}</div>
          <div><div class="tm-load-label"><span>업무 부하</span><span style="font-weight:700;color:${m.loadCls==='ok'?'var(--green)':'var(--t1)'}">${m.loadTxt}</span></div><div class="tm-load-bar"><i style="width:${m.load}%"></i></div></div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="card reveal d5">
    <div class="card-h bordered"><h3>포트폴리오 KPI</h3><span class="sub">2026.05.27 기준 · ERP 연동 · 전사 합산</span></div>
    <div class="ck-kpi-grid">
      ${kpis.map(k=>{
        const n=k.spark.length, w=96, h=38, pad=4;
        const xs=k.spark.map((_,i)=>(i/(n-1))*w);
        const ys=k.spark.map(v=>pad+(v/30)*(h-pad*2));
        const line=xs.map((x,i)=>`${i?'L':'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
        const area=`${line} L${w},${h} L0,${h} Z`;
        const col=k.dir==='dn'?'#e0444a':'#16a34a';
        const gid='sp'+Math.random().toString(36).slice(2,7);
        return `<div class="ck-kpi">
        <div class="ck-kpi-l">${k.l}</div>
        <div class="ck-kpi-mid">
          <div class="ck-kpi-v">${k.v}<small>${k.u}</small></div>
          <svg class="ck-kpi-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${col}" stop-opacity="0.22"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#${gid})" stroke="none"/><path d="${line}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="ck-kpi-foot"><span class="kpi-pill ${k.dir}">${k.pill}</span><span class="kpi-sub">${k.sub}</span></div>
      </div>`;}).join('')}
    </div>
  </div>

  <div class="card reveal d6">
    <div class="card-h bordered"><h3>Deal Pipeline · 7단계 흐름</h3><span class="sub">전사 진행중 72건 (사후관리·종결 포함)</span></div>
    <div class="pipe">
      ${pipe.map(p=>`<div class="stg"><div class="stg-badge ${p[4]}"><span class="stg-num">${p[0]}</span><span class="stg-label">${p[1]}</span></div><div class="stg-c">${p[2]}<small>건</small></div><div class="stg-bar"><i style="width:${p[3]}%"></i></div></div>`).join('')}
    </div>
  </div>

  <div class="row" style="grid-template-columns:1fr 340px">
    <div class="card reveal d7">
      <div class="card-h bordered"><h3>AI Agent · 추천 질의</h3><span class="sub">롤 기반 (심사역) · 클릭 시 즉시 응답</span></div>
      <div class="card-body">
        <div class="qbox exec" data-q="지금 가장 위험한 포트폴리오 건과 근거를 요약해줘"><span class="qm">임원</span><span class="qt">지금 가장 위험한 포트폴리오 건과 근거를 요약해줘</span><span class="qa">→</span></div>
        <div class="q-divider">심사역 전용</div>
        <div style="display:flex;flex-direction:column;gap:7px">
          <div class="qbox" data-q="이번 달 회수 예정 금액과 입금일 정리해줘"><span class="qm">조회</span><span class="qt">이번 달 회수 예정 금액과 입금일 정리해줘</span><span class="qa">→</span></div>
          <div class="qbox" data-q="최근 30일 Drop딜 사유 분포와 사후 적중률은?"><span class="qm">분석</span><span class="qt">최근 30일 Drop딜 사유 분포와 사후 적중률은?</span><span class="qa">→</span></div>
          <div class="qbox" data-q="전력·에너지 분야 자사 Deal의 평균 IRR과 손실 사례"><span class="qm">검색</span><span class="qt">전력·에너지 분야 자사 Deal의 평균 IRR과 손실 사례</span><span class="qa">→</span></div>
          <div class="qbox" data-q="회수 지연 가능성이 높은 Deal Top 3와 근거"><span class="qm">예측</span><span class="qt">회수 지연 가능성이 높은 Deal Top 3와 근거</span><span class="qa">→</span></div>
        </div>
        <div style="margin-top:11px;padding:9px 14px;border:1px dashed var(--line-strong);border-radius:11px;font-size:11.5px;color:var(--t3)">자유롭게 입력 — 응답에는 항상 출처(ERP 필드 / IM 페이지 / Deal ID)가 첨부됩니다</div>
      </div>
    </div>
    <div class="card reveal d8">
      <div class="card-h bordered"><h3>바로가기</h3></div>
      <div class="card-body">
        <div class="qa-grid">
          ${[['+','신규 Deal 등록','제안접수 단계'],['≡','보고서 작성','AI 초안 생성'],['○','회수 등록','배당 / 분배 / 원금'],['↑','IC 자료 업로드','1차 / 2차 심의'],['✕','Drop 등록','사유 구조화 저장'],['✎','현장 메모','실사 후 빠른 입력']].map(q=>`<div class="qa-btn"><div class="qa-sym">${q[0]}</div><div><div class="qa-l">${q[1]}</div><div class="qa-d">${q[2]}</div></div></div>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <div class="card reveal d8">
    <div class="card-h bordered"><h3>최근 작업 내역 · 팀 전체</h3><span class="sub">최근 7일 · 전체 팀원 활동 포함</span></div>
    <div class="card-body flush">
      ${acts.map(a=>`<div class="act"><div class="act-dot"></div><span class="act-deal">${a[0]}</span><span class="act-t">${a[1]}</span><span class="act-who">${a[2]}</span><span class="act-tm">${a[3]}</span></div>`).join('')}
    </div>
  </div>
  `;

  document.getElementById('cnt').innerHTML = html;

  // interactions
  document.querySelectorAll('[data-toast]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();toast(el.dataset.toast);}));
  document.querySelectorAll('[data-href]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();location.href=el.dataset.href;}));
  document.querySelectorAll('.qbox').forEach(q=>q.addEventListener('click',()=>toast('AI Agent가 "'+q.dataset.q.slice(0,22)+'..." 분석을 시작합니다')));
  document.querySelectorAll('.qa-btn,.stg,.team-member,.act').forEach(el=>el.addEventListener('click',()=>el.dataset.href||toast('프로토타입 — 연결된 3개 화면을 둘러보세요')));
  document.querySelector('.ai-hero').addEventListener('click',()=>toast('⌘K — AI 자연어 검색 (프로토타입)'));
  document.querySelector('.btn.primary').addEventListener('click',()=>toast('AI 일일 브리핑을 생성합니다…'));

  // animate
  initReveal();
  requestAnimationFrame(()=>{ animateCounts(); });
  window.addEventListener('load',()=>setTimeout(()=>animateCounts(),100));
})();
