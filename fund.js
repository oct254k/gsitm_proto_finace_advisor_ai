/* ============================================================
   FUND VERIFICATION screen
   스토리: 파일 업로드 → 파이프라인 처리(스피너) → 3장 리포트 → 다운로드
   ------------------------------------------------------------
   화면에 나오는 모든 수치는 아래 실제 원본에서 추출/계산한 값입니다.
     · 기준가격대장_지브이에이 Fortress-A 일반 사모투자신탁_수정기준가격.xlsx (3,151행)
     · IM_지브이에이 Fortress-A 일반 사모투자신탁_제안서.pdf (23p)
     · 관리_펀드 현황(기준가 하락사유 등)_..._260604.pdf (2p)
     · 헤지펀드_운용_현황(2026706).xlsx (4,013개 펀드 레지스트리)
   ============================================================ */
(function(){
  renderSidebar('fundverify');

  /* ================= 공통 헬퍼 ================= */
  function sumCard(title,sub,body){return `<div class="sum-card reveal"><div class="sum-card-h"><h4>${title}</h4>${sub?`<span class="sum-sub">${sub}</span>`:''}</div><div class="sum-card-body">${body}</div></div>`;}
  const LINKIC='<svg viewBox="0 0 24 24" fill="none"><path d="M19 11l-7.5 7.5a4 4 0 01-5.7-5.7L13 5.5a2.5 2.5 0 113.5 3.5l-7.6 7.6a1 1 0 01-1.4-1.4L14 8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function tr(t){return `<span class="trace" data-src="${t}">${LINKIC}${t}</span>`;}
  function traces(){return `<div class="traces">${[].slice.call(arguments).map(tr).join('')}</div>`;}
  function askBtn(){return `<button class="send-to-ai">Ask AI <svg viewBox="0 0 24 24" fill="none" style="width:12px;height:12px"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;}
  function sgn(v,d){const s=(v>0?'+':'')+v.toFixed(d===undefined?2:d);return `<span class="${v>0?'pos':v<0?'neg':''}">${s}%</span>`;}
  function fileIcon(type){
    const c={PDF:'#d92d20',XLSX:'#079455',DOCX:'#155eef',CSV:'#079455',HTML:'#f0852a',JSON:'#6941c6'}[type]||'#98a2b3';
    const bw=type.length===3?17:23;
    return `<span class="file-ic"><svg width="34" height="34" viewBox="0 0 34 40" fill="none"><path d="M1.5 2.5A1.5 1.5 0 0 1 3 1h17.5L32 11.5v25A1.5 1.5 0 0 1 30.5 38h-27A1.5 1.5 0 0 1 1.5 36.5z" fill="#fff" stroke="#dbdbdb" stroke-width="1.2"/><path d="M20.5 1l11.5 10.5H22A1.5 1.5 0 0 1 20.5 10z" fill="#d4d4d8"/><rect x="1" y="20" width="${bw}" height="15" rx="3" fill="${c}"/><text x="${1+bw/2}" y="30.6" font-family="Inter,sans-serif" font-weight="700" font-size="8.5" fill="#fff" text-anchor="middle">${type}</text></svg></span>`;
  }

  /* ================= 인풋 3종 정의 (업로드 슬롯) ================= */
  const SLOTS=[
    {id:'ledger',n:1,axis:'숫자',c:'#344acb',type:'XLSX',need:true,
     sample:'기준가격대장_지브이에이 Fortress-A 일반 사모투자신탁_수정기준가격.xlsx',
     size:'412 KB',accept:'.xlsx,.xls,.csv',
     role:'<b>시계열 원천.</b> 모든 지표(수익률·MDD·변동성·Sharpe)가 여기서만 나옵니다.',
     parsed:'3,151행 × 8열 · 2017.05.17~2025.12.31 · 수정기준가 5계열',
     stat:['행 <b>3,151</b>','열 <b>8</b>','기간 <b>2017.05.17~2025.12.31</b>','클래스 <b>5종</b>'],
     ctx:'[인풋1 숫자] 기준가격대장 xlsx. 3,151행×8열, 2017-05-17~2025-12-31, 수정기준가 5개 클래스(종류운용/A/C1/C2/Ci). 시계열 원천.'},
    {id:'im',n:2,axis:'약속',c:'#009638',type:'PDF',need:true,
     sample:'IM_지브이에이 Fortress-A 일반 사모투자신탁_제안서.pdf',
     size:'2.8 MB',accept:'.pdf',
     role:'<b>비교 기준선.</b> 목표수익·위험등급·전략비중·수수료가 여기 있어야 3장(검증)이 성립합니다.',
     parsed:'23p · 2026.02 작성 · 기준일 2026.01.31 · 성과표 4건 추출',
     stat:['<b>23</b>p','작성 <b>2026.02</b>','기준일 <b>2026.01.31</b>','준감사전승인 <b>제2026-11호</b>'],
     ctx:'[인풋2 약속] 제안서 pdf 23p, 2026.02 작성(2026.01.31 기준). 누적 224.79%, 연환산 14.47%, 변동성 10.42%, Sharpe 1.19, Sortino 1.25. 전략비중 주식30~50/메자닌20~60/헤지0~15/이벤트0~15. 위험등급·목표수익률·MDD·보수율 미기재.'},
    {id:'reason',n:3,axis:'설명',c:'#e08600',type:'PDF',need:true,
     sample:'관리_펀드 현황(기준가 하락사유 등)_지브이에이 Fortress-A_260604.pdf',
     size:'186 KB',accept:'.pdf,.xlsx',
     role:'<b>숫자 변동의 원인.</b> 낙폭 구간에 이 정성 데이터가 붙어야 시스템이 의미를 갖습니다.',
     parsed:'2p · 2026.06.04 작성 · 대상기간 26.05.28~06.03 · 전략별 기여 5건',
     stat:['<b>2</b>p','작성 <b>2026.06.04</b>','대상기간 <b>26.05.28~06.03</b>','설명 손실 <b>-7.83%</b>'],
     ctx:'[인풋3 설명] 하락사유서 pdf 2p, 2026.06.04 작성. 대상기간 26.05.28~06.03 수익률 -7.83%(운용펀드 기준). 전략별: 주식Long -5.80, 메자닌Long -1.44, Pair -0.67, 이벤트 +0.01, 헤지 +0.05.'},
    {id:'review',n:4,axis:'판단(내부)',c:'#6941c6',type:'PDF',need:true,
     sample:'검토보고서_투자_GVA Fortress-A 일반 사모투자신탁.pdf  ·  품의서_매수의 건.pdf',
     size:'1.4 MB',accept:'.pdf,.docx',
     role:'<b>진짜 기준선.</b> 목표 IRR·총보수·MDD는 제안서 본문이 아니라 <b>여기</b> 있습니다. 3종만으로는 5개 항목을 "미기재"로 오판합니다.',
     parsed:'검토보고서 9p + 품의서 34p · 목표 IRR 10% · 총보수 1.57% · MDD 15.60% 추출',
     stat:['<b>43</b>p','자금부 <b>2026.02</b>','목표 IRR <b>10%</b>','총보수 <b>1.57%</b>'],
     ctx:'[인풋4 판단·내부] 화인 자금부 검토보고서 9p + 품의서 34p. 운용목표 IRR 10%, 총보수 A클래스 1.57%(판매보수 1%)·C1 2.07%, 성과보수 15% HWM, 환매수수료 90일 미만 이익금 70%, 레버리지 한도 400%, 최소가입 3억/가입 20억, 예상운용기간 3년. 성과표(26.01.31): 누적 224.79 vs KOSPI 127.61, 연환산 14.47 vs 9.89, 변동성 10.42 vs 18.41, Sharpe 1.19 vs 0.44, MDD 15.60 vs 43.90, Win ratio 64.76 vs 55.24.'},
    {id:'master',n:'M',axis:'마스터',c:'#68778c',type:'XLSX',need:false,
     sample:'헤지펀드_운용_현황(2026706).xlsx',
     size:'1.1 MB',accept:'.xlsx',
     role:'<b>레지스트리.</b> 분석 대상이 아니라 <b>펀드 ID를 발급</b>하고 나머지를 매다는 기준 테이블입니다.',
     parsed:'4,013개 펀드 · 16열 · 기준일 2026.07.06 · 매칭행 3,141',
     stat:['펀드 <b>4,013</b>','열 <b>16</b>','기준일 <b>2026.07.06</b>','매칭 <b>행 3,141</b>'],
     ctx:'[마스터] 헤지펀드 운용현황 레지스트리 xlsx. 4,013개 펀드, 기준일 2026.07.06. Fortress-A는 행 3,141, 펀드코드 KRZ502142705, 설정액 4,227.75억, 누적 153.21%, YTD -4.64%.'},
  ];

  /* ================= 마스터 레지스트리 ================= */
  const REG=[
    ['순번 / 펀드ID','3141 · KRZ502142705'],['운용사','지브이에이자산운용㈜'],
    ['설정일','2017.05.17'],['전략명','Multi-strategy'],
    ['설정액','4,227.75 억원'],['PB','미래에셋'],
    ['좌당단가','954.11'],['수정기준가','2,532.07'],
    ['누적수익률','+153.21%'],['YTD','-4.64%'],['YoY','+6.61%'],['최근 1개월','-7.16%'],
  ];
  const regBox = `<div class="reg-box">
    <div class="reg-head"><span class="reg-head-t">펀드 레지스트리 (마스터)</span>
      <span class="reg-head-s">헤지펀드_운용_현황(2026706).xlsx · 4,013개 펀드 중 3,141행 · 기준일 2026.07.06</span></div>
    <div class="reg-grid">${REG.map(r=>`<div class="reg-cell"><div class="reg-k">${r[0]}</div><div class="reg-v">${r[1]}</div></div>`).join('')}</div>
  </div>
  <div class="note-line"><span class="nl-ic">🔑</span><div>이 파일은 <b>분석 대상이 아니라 펀드 ID를 발급하는 기준 테이블</b>입니다. 나머지 3종 인풋은 모두 <b>펀드코드 KRZ502142705</b>에 매달려 정규화됩니다. 레지스트리 수정기준가 <b class="num">2,532.07</b>(26.07.06)는 대장 최종값 <b class="num">2,545.60</b>(25.12.31)보다 낮아, 대장 이후 구간에서 하락이 발생했음을 알려줍니다.</div></div>`;

  const ioCards = `<div class="io-grid">${SLOTS.filter(o=>o.need).map(o=>`
    <div class="io-card sendable" style="--io-c:${o.c}" data-ctx="${o.ctx}" data-label="인풋 ${o.n} ${o.axis}">
      <div class="io-axis"><span class="io-n">${o.n}</span><span class="io-axis-l">${o.axis}</span>
        <span style="margin-left:auto"><span class="pill mute">${o.type}</span></span></div>
      <div class="io-file">${o.sample}</div>
      <div class="io-role">${o.role}</div>
      <div class="io-stat">${o.stat.map(s=>`<span>${s}</span>`).join('')}</div>
      <div style="margin-top:9px">${askBtn()}</div>
    </div>`).join('')}</div>`;

  const mapTbl = `<table class="map-tbl">
    <tr><th>기업분석</th><th></th><th>펀드분석</th></tr>
    <tr><td>재무제표 3종</td><td>→</td><td><b>기준가격대장</b><span class="map-ax">숫자</span></td></tr>
    <tr><td>주석</td><td>→</td><td><b>기준가 하락사유서</b><span class="map-ax">설명</span></td></tr>
    <tr><td>차입금·채권 명세</td><td>→</td><td><b>투자제안서 · 운용현황</b><span class="map-ax">약속</span></td></tr>
    <tr><td>현금흐름 브리지</td><td>→</td><td><b>낙폭 구간 ↔ 사유 매칭</b><span class="map-ax">2장</span></td></tr>
  </table>`;

  /* ================= 파이프라인 7단계 ================= */
  const FLOW=[
    {n:1,t:'수집',d:'xlsx 기준가대장 → 시계열 파싱 · pdf 제안서/사유서 → 텍스트 추출',s:'',ms:900,
     logs:['기준가격대장.xlsx 로드 — Sheet1 3,151행 × 8열','제안서.pdf 텍스트 추출 — 23p','하락사유서.pdf 텍스트 추출 — 2p','검토보고서 9p + 품의서 34p 텍스트 추출','레지스트리.xlsx 로드 — 4,013행']},
    {n:2,t:'정규화',d:'펀드 ID 부여(레지스트리 기준) · 기준가 스키마 통일 · <b>★ 수정기준가 우선 채택</b>',s:'',ms:800,
     logs:['펀드 ID 발급 — KRZ502142705 (레지스트리 행 3,141)','기준가 계열 5종 감지 — 종류운용 / A / C1 / C2 / Ci','★ 수정기준가 우선 채택 — 원기준가 컬럼 없음','문서 3종을 펀드 ID에 결속']},
    {n:3,t:'검증 — 게이트',d:'영업일 결측 · 이상치 · 설정일 일치. <b>안 맞으면 중단하고 사람 호출</b>',s:'gate',ms:1400,
     pill:'<span class="pill bad">중단 2건</span><span class="pill warn">경고 2건</span><span class="pill ok">통과 5건</span>',
     logs:['✓ 일자 연속성 — 3,151행 = 3,151일, 결측 0','! 달력일 대장 — 주말 900행(28.6%) → √365 적용','✓ 이상치 — 일간 ±30% 초과 0건 (최대 ±3.52%)','! 스키마 위반 — "무잔고 상태" 문자열 2건','✓ 설정일 일치 — 제안서 2017.05.17 = 대장 행 2','✕ 기준일 불일치 — 사유서 구간이 대장 범위 밖','✕ 기준가 계열 혼용 — 제안서=보수 전 / 투자자=Class A','✓ 기준선 확보 — 목표 IRR 10%(검토보고서 p.4), 총보수 1.57%(제안서 p.14)','✓ 교차검증 — 누적 190.91%·Sharpe 1.09 화인 산출값과 일치']},
    {n:4,t:'계산',d:'수익률 · MDD · 변동성 · Sharpe / Sortino',s:'',ms:1000,
     logs:['Class A 고정 — 보수 차감 후 계열','누적 +154.57% · CAGR 11.44% · 8.62년','MDD -15.40% (행 364 → 532) · 회복 524일','변동성 10.32% · Sharpe 0.92 · Sortino 0.92','낙폭 구간 6건 탐지']},
    {n:5,t:'매칭',d:'낙폭 구간 ↔ 하락사유 시점 연결',s:'fail',ms:800,pill:'<span class="pill bad">매칭 0 / 6</span>',
     logs:['사유 문서 1건 · 대상기간 2026.05.28~06.03','대장 범위 2017.05.17~2025.12.31 — 교집합 없음','✕ 매칭 0 / 6 — 낙폭 6구간 전부 미설명']},
    {n:6,t:'검증 2',d:'제안서 약속값 ↔ 실측값 대조',s:'',ms:1000,pill:'<span class="pill warn">불일치 4건</span>',
     logs:['15개 항목 대조 — 충족 6 · 경고 5 · 불일치 4','✓ 목표 IRR 10% → 실측 11.44% 달성','✓ 전략비중 약속 20~60% vs 실제 53.05% — 밴드 내','✕ 실효보수 1.74%p vs 약속 총보수 1.57% (+0.17%p)','✕ 보수 차감 후 수익률 — 어느 문서에도 없음']},
    {n:7,t:'출력',d:'3장 리포트 — 모든 수치에 원본 행·페이지 링크 부착',s:'',ms:700,
     logs:['1장 성과 / 2장 흐름·위험 / 3장 약속검증 생성','원본 추적 링크 부착 — 대장 행 · 문서 페이지','판단 3규칙 적용 → 충족 1 · 경고 1 · 위반 1','종합 판정: 조건부 적정']},
  ];
  const flowBox = `<div class="flow">${FLOW.map((f,i)=>`
    <div class="flow-step ${f.s} sendable" data-ctx="[파이프라인 STEP ${f.n}] ${f.t} — ${f.d.replace(/<[^>]+>/g,'')}" data-label="STEP ${f.n} ${f.t}">
      <span class="flow-num">${f.n}</span>
      <div><div class="flow-t">${f.t}${f.pill?' '+f.pill:''}</div><div class="flow-d">${f.d}</div></div>
      <div>${askBtn()}</div>
    </div>${i<FLOW.length-1?`<div class="flow-conn ${f.s==='gate'?'gatebar':f.s==='fail'?'failbar':''}"></div>`:''}`).join('')}</div>`;

  /* ================= STEP 3 게이트 결과 ================= */
  const GATE=[
    ['ok','일자 연속성 — 결측 0건','대장 3,151행 = 2017-05-17 ~ 2025-12-31 <b>3,151일</b>. 비연속 구간 0건.','통과',
     '[게이트1] 일자 연속성 통과. 3,151행=3,151일, 결측 0.'],
    ['warn','달력일 기준 대장 — 연환산 계수 주의','주말 <b>900행(28.6%)</b> 포함, 일간수익률 0인 날 75일. 연환산은 <b>√365</b> 적용이 맞습니다. 관행대로 √252를 쓰면 변동성이 10.30% → <b>8.56%</b>로 2.06%p 과소 추정됩니다.','경고',
     '[게이트2] 달력일 대장. 주말 900행(28.6%), 0수익률 75일. √365 적용 필요, √252 오적용시 변동성 10.30→8.56% 과소추정.'],
    ['ok','이상치 — 일간 ±30% 초과 0건','전 구간 최대 일간 변동 <b>±3.52%</b>. 임계치 내.','통과',
     '[게이트3] 이상치 0건. 최대 일간변동 ±3.52%.'],
    ['warn','스키마 위반 — 숫자 컬럼에 문자열','Class C2 결측 <b>1,520행(48.2%)</b>, Class Ci 13행. 숫자 컬럼에 <b>"무잔고 상태"</b> 문자열 2건 혼입 → C2·Ci는 분석 대상에서 제외.','경고',
     '[게이트4] 스키마 위반. Class C2 결측 1,520행(48.2%), 숫자컬럼에 "무잔고 상태" 문자열 2건. C2/Ci 제외.'],
    ['ok','설정일 일치','제안서 <b>2017.05.17</b> = 대장 시작행 <b>2017-05-17</b>(행 2). 일치.','통과',
     '[게이트5] 설정일 일치. 제안서 2017.05.17 = 대장 행2 2017-05-17.'],
    ['bad','기준일 불일치 — <b>중단</b>','대장 <b>2025-12-31</b> / 제안서 <b>2026-01-31</b>(+1개월) / 사유서 대상기간 <b>2026-05-28~06-03</b>(+5개월). <b>사유서가 설명하는 하락 구간이 대장 범위 밖</b>이라 STEP 5 매칭이 원천적으로 불가능합니다. → 대장 재수집 요청.','중단',
     '[게이트6] ★중단. 기준일 불일치: 대장 2025-12-31, 제안서 2026-01-31, 사유서 2026-05-28~06-03. 사유서 구간이 대장 범위 밖 → 매칭 불가. 대장 재수집 필요.'],
    ['bad','기준가 계열 혼용 — <b>중단</b>','대장에 수정기준가만 5계열. 제안서·검토보고서의 모든 성과표가 <b>종류운용(보수 차감 전)</b>이고 투자자 실수령은 <b>Class A</b>입니다. 혼용하면 누적수익률이 <b>190.9% vs 154.6%</b>로 36.3%p 뒤집힙니다.','중단',
     '[게이트7] ★중단. 기준가 계열 혼용. 제안서·검토보고서=종류운용(보수전), 투자자=Class A. 누적 190.9% vs 154.6%, 36.3%p 차이.'],
    ['ok','약속 기준선 확보 — 내부 문서 병합','목표 IRR·총보수·MDD는 <b>제안서 본문(p.1~13)에 없습니다.</b> 제안서 부록 <b>p.14</b>(총보수 1.57%·성과보수 15% HWM)와 자금부 <b>검토보고서 p.2·p.4</b>(목표 IRR 10%·MDD 15.60%)에서 확보. <b>대장·제안서·사유서 3종만 물리면 15개 검증항목 중 5개를 "미기재"로 오판</b>합니다.','통과',
     '[게이트8] 통과. 기준선 문서 병합 필요. 목표IRR 10%·MDD 15.60%는 검토보고서 p.2/p.4, 총보수 1.57%·성과보수 15%는 제안서 p.14. 3종 인풋만으로는 15개 중 5개 항목 오판.'],
    ['ok','계산 엔진 교차검증','대장에서 독립 산출한 값이 화인 자체 산출값과 일치: 누적 <b>190.91%</b>(문서체계 p.12와 완전 일치), 연환산 <b>13.18% vs 13.17%</b>, 변동성 <b>10.30% vs 10.39%</b>, Sharpe <b>1.09 vs 1.09</b>.','통과',
     '[게이트9] 통과. 계산 엔진 교차검증 — 누적 190.91% 완전 일치, 연환산 13.18 vs 13.17, 변동성 10.30 vs 10.39, Sharpe 1.09 vs 1.09 (화인 문서체계 p.12 대비).'],
  ];
  const gateBox = `<div class="gate-tbl">${GATE.map(g=>`
    <div class="gate-row ${g[0]==='bad'?'bad':''} sendable" data-ctx="${g[4]}" data-label="게이트: ${g[1].replace(/<[^>]+>/g,'')}">
      <span class="gate-ic ${g[0]}">${g[0]==='ok'?'✓':g[0]==='warn'?'!':'✕'}</span>
      <div><div class="gate-t">${g[1]}</div><div class="gate-d">${g[2]}</div></div>
      <span class="gate-r"><span class="pill ${g[0]}">${g[3]}</span></span>
    </div>`).join('')}</div>
    <div class="note-line bad"><span class="nl-ic">⛔</span><div><b>게이트 판정: 중단.</b> 통과 5 · 경고 2 · <b>중단 2</b>. 정규화가 틀린 채로 STEP 4로 넘어가면 <b>그럴듯한 틀린 숫자</b>가 나옵니다. 아래 2·3장은 <b>Class A(보수 차감 후)</b> 계열로 고정하고, 대장 범위(~2025-12-31) 안에서만 산출한 결과입니다.</div></div>`;

  const ledPrev = `<div style="overflow-x:auto"><table class="led-tbl">
    <tr><th>No</th><th>일자</th><th>수정기준가<br>(종류운용)</th><th>수정기준가<br>(Class A)</th><th>Class C1</th><th>Class C2</th><th>Class Ci</th></tr>
    <tr class="bad"><td>1</td><td>2017-05-17</td><td>1,000.01</td><td>999.96</td><td>999.95</td><td>무잔고 상태</td><td>무잔고 상태</td></tr>
    <tr><td>2</td><td>2017-05-18</td><td>999.96</td><td>999.88</td><td>999.85</td><td>—</td><td>—</td></tr>
    <tr class="mark"><td>364</td><td>2018-05-15</td><td>1,198.05</td><td>1,179.88</td><td>1,175.4</td><td>—</td><td>—</td></tr>
    <tr class="mark"><td>532</td><td>2018-10-30</td><td>1,021.42</td><td>998.22</td><td>993.1</td><td>—</td><td>—</td></tr>
    <tr><td>⋮</td><td>⋮</td><td>⋮</td><td>⋮</td><td>⋮</td><td>⋮</td><td>⋮</td></tr>
    <tr><td>3,151</td><td>2025-12-31</td><td>2,909.14</td><td>2,545.60</td><td>2,439.69</td><td>—</td><td>—</td></tr>
  </table></div>
  <div class="note-line"><span class="nl-ic">📌</span><div>붉은 행 = 숫자 컬럼에 문자열 혼입(게이트 4). 노란 행 = MDD 구간의 고점·저점 행(2장에서 링크로 연결). 화면의 모든 수치는 <b>대장 행 번호</b>까지 되짚을 수 있어야 심사역이 리포트를 씁니다.</div></div>`;

  /* ================= 1장 성과 ================= */
  const YR=[
    ['2017',6.62,5.59,7.50],['2018',0.49,-1.09,-17.28],['2019',10.53,8.83,7.67],
    ['2020',29.71,27.76,30.75],['2021',20.59,18.75,3.63],['2022',-5.08,-6.55,-24.89],
    ['2023',16.33,14.55,18.73],['2024',3.64,2.02,-9.63],['2025',37.23,35.16,75.63],
  ];
  function yrBar(v){const w=Math.min(Math.abs(v)/80*50,50);return `<div class="yr-bar"><i class="${v>=0?'up':'dn'}" data-w="${w}%" style="width:0"></i></div>`;}
  const yrTbl = `<table class="yr-tbl">
    <tr><th>연도</th><th>종류운용<br>(보수 전)</th><th>Class A<br>(보수 후)</th><th>KOSPI<br>(참고)</th><th style="text-align:center">Class A</th></tr>
    ${YR.map(r=>`<tr><td>${r[0]}</td><td>${sgn(r[1])}</td><td>${sgn(r[2])}</td><td>${sgn(r[3])}</td><td style="width:120px">${yrBar(r[2])}</td></tr>`).join('')}
    <tr style="border-top:2px solid var(--line-strong)"><td>설정이후</td><td>${sgn(190.91,1)}</td><td>${sgn(154.57,1)}</td><td>${sgn(83.64,1)}</td><td></td></tr>
  </table>
  ${traces('대장 행 2 ~ 3,151','제안서 p.7 반기/연 수익률','제안서 p.6 전략별 기여도')}
  <div class="note-line"><span class="nl-ic">⚖️</span><div>KOSPI는 제안서 p.7에 <b>"단순 참고지수로서 본 투자신탁의 비교지수(Benchmark)가 아니다"</b>라고 명시돼 있습니다. 즉 <b>초과수익을 판정할 공식 기준선이 계약상 존재하지 않습니다.</b> 아래 초과수익 수치는 참고값입니다.</div></div>`;

  const perfKpi = `<div class="kpi-row">
    ${[['누적수익률','154.57','%','Class A · 8.62년 · 보수 차감 후',1],
       ['CAGR (연평균복리)','11.44','%','종류운용 기준 13.18%',1],
       ['목표 IRR 대비','+1.44','%p','목표 10% (검토보고서 p.4) vs 실측 11.44%',0],
       ['보수 드래그','-1.74','%p/년','종류운용 → Class A 스프레드 역산',0]]
      .map(k=>`<div class="kpi ${k[4]?'accent':''}"><div class="kpi-k">${k[0]}</div><div class="kpi-v"><span data-count="${parseFloat(k[1])}" data-dec="2">${k[1]}</span><small>${k[2]}</small></div><div class="kpi-s">${k[3]}</div></div>`).join('')}
  </div>`;

  function navChart(){
    const S=window.FUND_SERIES, n=S.dates.length;
    const W=900,H=250,L=42,R=8,T=12,B=22;
    const lo=900, hi=3050;
    const x=i=>L+(W-L-R)*i/(n-1), y=v=>T+(H-T-B)*(1-(v-lo)/(hi-lo));
    const path=arr=>arr.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
    let g='';
    for(let v=1000;v<=3000;v+=500){g+=`<line class="gridline" x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}"/><text x="${L-6}" y="${y(v)+3}" text-anchor="end">${v.toLocaleString()}</text>`;}
    let xt='';
    [0,52,104,156,208,260,312,364,450].forEach(i=>{ if(i<n) xt+=`<text x="${x(i)}" y="${H-6}" text-anchor="middle">${S.dates[i].slice(0,7)}</text>`; });
    const iOf=d=>{let b=0;for(let i=0;i<n;i++){if(S.dates[i]<=d)b=i;}return b;};
    const sh=(a,b,c)=>`<rect x="${x(iOf(a))}" y="${T}" width="${x(iOf(b))-x(iOf(a))}" height="${H-T-B}" fill="${c}"/>`;
    return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:250px">
      ${sh('2018-05-15','2018-10-30','rgba(21,93,252,.07)')}${sh('2022-04-21','2022-10-13','rgba(21,93,252,.07)')}
      ${g}${xt}
      <path class="navline" d="${path(S.gross)}" stroke="#99a1af" stroke-dasharray="4 3"/>
      <path class="navline" d="${path(S.net)}" stroke="#344acb" stroke-width="2"/>
      <circle class="ddmark" cx="${x(iOf('2018-10-30'))}" cy="${y(998.2)}" r="4"/>
      <text x="${x(iOf('2018-10-30'))+7}" y="${y(998.2)+4}" fill="#e7000b" font-weight="700">MDD -15.40%</text>
    </svg>`;
  }
  function ddChart(){
    const S=window.FUND_SERIES, n=S.dd.length;
    const W=900,H=120,L=42,R=8,T=8,B=16;
    const x=i=>L+(W-L-R)*i/(n-1), y=v=>T+(H-T-B)*(-v/17);
    let d='M'+x(0)+' '+y(0);
    S.dd.forEach((v,i)=>{d+=' L'+x(i).toFixed(1)+' '+y(v).toFixed(1);});
    d+=' L'+x(n-1)+' '+y(0)+' Z';
    let g='';
    [0,-5,-10,-15].forEach(v=>{g+=`<line class="${v?'gridline':'zeroline'}" x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}"/><text x="${L-6}" y="${y(v)+3}" text-anchor="end">${v}%</text>`;});
    return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:120px">${g}<path class="ddarea" d="${d}"/></svg>`;
  }
  const chartCard = `<div class="chart-card">
    <div class="chart-h"><span class="chart-t">수정기준가 추이 — 보수 차감 전 vs 투자자 실수령</span>
      <span class="chart-lg"><span class="lg"><i style="background:#99a1af"></i>종류운용 (보수 전) 2,909.14</span><span class="lg"><i style="background:#344acb"></i>Class A (보수 후) 2,545.60</span><span class="lg"><i style="background:rgba(21,93,252,.3)"></i>주요 낙폭 구간</span></span></div>
    ${navChart()}
    <div class="chart-h" style="margin-top:14px"><span class="chart-t">낙폭(Drawdown) — Class A 기준</span></div>
    ${ddChart()}
    <div class="chart-foot">원본: 기준가격대장 xlsx 3,151행을 7일 간격 451포인트로 샘플링 · 2017-05-17 ~ 2025-12-31 · 두 선의 간격이 곧 <b>보수·수수료</b>입니다(설정이후 36.3%p).</div>
  </div>`;

  /* ================= 2장 흐름·위험 ================= */
  const riskKpi = `<div class="kpi-row">
    ${[['MDD (최대낙폭)','-15.40','%','KOSPI 43.90% · 검토보고서 15.60%',1],
       ['MDD 회복 소요','524','일','2020-04-06 회복 · 6개 구간 중 최장',1],
       ['연환산 변동성','10.32','%','일간 수익률 · √365 기준',0],
       ['Sharpe (vs KOSPI)','0.92','','종류운용 1.09 vs KOSPI 0.44',0]]
      .map(k=>`<div class="kpi ${k[4]?'accent':''}"><div class="kpi-k">${k[0]}</div><div class="kpi-v"><span data-count="${parseFloat(k[1])}" data-dec="${k[1].indexOf('.')<0?0:2}">${k[1]}</span><small>${k[2]}</small></div><div class="kpi-s">${k[3]}</div></div>`).join('')}
  </div>`;

  const DD=[
    ['-15.40','2018-05-15','2018-10-30','2020-04-06','524','행 364 → 532 → 1,056',15.40],
    ['-14.59','2022-04-21','2022-10-13','2023-03-29','167','행 1,801 → 1,976 → 2,143',14.59],
    ['-9.96','2025-03-19','2025-04-09','2025-05-13','34','행 2,864 → 2,885 → 2,919',9.96],
    ['-8.88','2024-06-13','2024-12-09','2025-01-08','30','행 2,585 → 2,764 → 2,794',8.88],
    ['-8.47','2023-07-04','2023-10-20','2024-03-27','159','행 2,240 → 2,348 → 2,507',8.47],
    ['-6.97','2025-10-29','2025-11-25','2025-12-22','27','행 3,088 → 3,115 → 3,142',6.97],
  ];
  const ddTbl = `<div class="dd-tbl">
    <div class="dd-head"><div>낙폭</div><div>고점 → 저점</div><div style="text-align:center">회복일</div><div style="text-align:center">소요</div><div>매칭된 하락사유</div></div>
    ${DD.map(d=>`<div class="dd-row sendable" data-ctx="[낙폭구간] ${d[0]}% (${d[1]}→${d[2]}), 회복 ${d[3]} ${d[4]}일. ${d[5]}. 매칭된 하락사유 없음." data-label="낙폭 ${d[0]}%">
      <div><div class="dd-mag">${d[0]}%</div><div class="dd-bar"><i data-w="${(d[6]/15.4*100).toFixed(0)}%" style="width:0"></i></div></div>
      <div class="dd-per">${d[1]} → ${d[2]}<br><small>${d[5]}</small></div>
      <div class="dd-rec" style="text-align:center">${d[3]}</div>
      <div class="dd-rec" style="text-align:center">${d[4]}일</div>
      <div class="dd-why miss">사유 문서 없음 — 운용사 제출 요청 필요</div>
    </div>`).join('')}
  </div>
  <div class="note-line bad"><span class="nl-ic">🎯</span><div><b>매칭률 0 / 6 (0%).</b> 이 매칭이 이 시스템의 존재 이유인데, 현재 확보된 사유서는 단 1건이고 그마저 <b>대장 범위(~2025-12-31) 밖인 2026-05-28~06-03 구간</b>을 설명합니다. 즉 <b>-15.40% MDD를 포함한 6개 낙폭 전부가 설명되지 않은 상태</b>입니다. → 판단규칙 ②에 직결.</div></div>`;

  const ATTR=[['주식 Long',-5.80],['메자닌 Long',-1.44],['Pair trading',-0.67],['이벤트 드리븐',0.01],['변동성 트레이딩(헤지)',0.05]];
  const attrBox = `<div class="attr-list">${ATTR.map(a=>{
    const w=Math.min(Math.abs(a[1])/7*82,82);
    return `<div class="attr"><span class="attr-k">${a[0]}</span><div class="attr-b"><i class="${a[1]>=0?'up':''}" data-w="${w.toFixed(1)}%" style="width:0"></i></div><span class="attr-v ${a[1]>=0?'pos':'neg'}">${a[1]>0?'+':''}${a[1].toFixed(2)}%</span></div>`;
  }).join('')}
  <div class="attr" style="border-top:1px solid var(--line);padding-top:8px;margin-top:3px"><span class="attr-k" style="font-weight:750;color:var(--t1)">합계 (기타 포함)</span><div class="attr-b" style="visibility:hidden"></div><span class="attr-v neg">-7.83%</span></div></div>
  ${traces('사유서 p.1','사유서 p.2')}
  <div class="note-line warn"><span class="nl-ic">⚠️</span><div>사유서가 제시한 이 수치는 <b>운용펀드(보수 차감 전) 기준</b>이고, 대상기간(26.05.28~06.03) 역시 <b>대장에 존재하지 않는 구간</b>입니다. 시스템은 이 값을 <b>검증 불가(unverified)</b>로 표시하고 대조하지 않습니다 — 검증 못 한 숫자를 리포트에 섞지 않는 것이 원칙입니다.</div></div>`;

  const reasonBox = `<div class="src-page">
    <h4>사유서 원문 — 하락 원인 서술</h4>
    <p>동기간 펀드 수익률은 약 <span class="hl">-7.83%</span> 수준이며, KOSPI는 <span class="hl">+6.96%</span>, KOSDAQ은 <span class="hl">-9.45%</span>를 기록.</p>
    <p>주식 Long 전략 비중은 <span class="hl">53.05%</span>(총 44개 종목, 단순평균 비중 1.21%)이며, 국내 상장주식으로 포지션이 구축되어 있음.</p>
    <table class="src-tbl"><tr><th>시장구분</th><th>대형주</th><th>중형주</th><th>소형주</th><th>합계</th></tr>
      <tr><th>KOSPI</th><td>7.26%</td><td>4.67%</td><td>10.08%</td><td>22.01%</td></tr>
      <tr><th>KOSDAQ</th><td>6.84%</td><td>20.42%</td><td>2.37%</td><td>29.63%</td></tr>
      <tr><th>합계</th><td>14.10%</td><td>25.09%</td><td>12.45%</td><td>51.64%</td></tr></table>
    <p>대형주 약 27%, <span class="hl">중소형주 약 73%</span> 수준. 최근 시장이 일부 대형주 위주로 관심이 집중됨에 따라 손실 발생.</p>
    ${traces('사유서 p.1','사유서 p.2')}
  </div>
  <div class="note-line bad"><span class="nl-ic">🔍</span><div>이 표에서 시스템이 자동으로 잡아내는 것: 주식 Long 비중 <b class="num">53.05%</b> — 제안서 p.4가 약속한 주식 전략 밴드 <b class="num">30~50%</b>의 <b>상단을 3.05%p 초과</b>합니다. 사유서를 읽으면 읽을수록 <b>3장(약속 검증)의 증거</b>가 나옵니다. → 판단규칙 ③.</div></div>`;

  /* ================= 3장 약속 대비 검증 ================= */
  const PV=[
    ['ok','설정일','2017.05.17 <em>제안서 p.5·p.7·p.8 / 검토보고서 p.4</em>','2017-05-17 <em>대장 행 2</em>','일치'],
    ['ok','누적수익률','+224.79% <em>제안서 p.8 / 검토보고서 p.2 · 26.01.31 기준</em>','+190.91% <em>대장 25.12.31 · 종류운용</em><em>26.01 환산 시 +224.8%</em>','일치'],
    ['ok','연환산 변동성','10.42% <em>제안서 p.8 · 일일수익률 기준</em>','10.30% <em>대장 실측 · √365</em>','오차 0.12%p'],
    ['ok','목표수익률 (IRR)','연 10% <em>검토보고서 p.4 "운용목표 IRR 10%" / 품의서 p.2</em>','CAGR 11.44% <em>Class A · 보수 차감 후</em>','달성 +1.44%p'],
    ['ok','MDD','15.60% <em>검토보고서 p.2 · 26.01.31 기준</em>','15.40% <em>Class A · 대장 행 364→532</em><em>종류운용 기준 14.74%</em>','오차 0.20%p'],
    ['ok','위험조정 성과','KOSPI 대비 우위 <em>검토보고서 p.2 · 문서체계 성과검증 로직</em>','수익 ↑ 변동성 ↓ Sharpe ↑ MDD ↓ <em>4개 조건 전부 충족</em>','고위험 아님'],
    ['warn','연환산수익률(기하)','14.47% <em>제안서 p.8 / 검토보고서 p.2</em>','13.18% <em>대장 25.12.31 · 종류운용</em>','기준일 차'],
    ['warn','Sharpe','1.19 <em>제안서 p.8 · rf 가정 미기재</em>','1.09 <em>종류운용 · rf 2.0%</em><em>Class A 기준 0.92</em>','가정 불명'],
    ['bad','Sortino','1.25 <em>제안서 p.5</em>','0.95 <em>대장 실측 · 종류운용</em><em>문서체계 p.12는 1.49로 또 다름</em>','3중 불일치'],
    ['bad','수수료 차감 후 수익률','<span class="mutetxt">미제시</span> <em>제안서·검토보고서 성과표 전부 "보수 차감 전 운용펀드 기준"</em>','+154.57% / CAGR 11.44% <em>Class A · 누적 -36.3%p</em>','미제시'],
    ['bad','실효 보수율','총보수 1.57% <em>A클래스(판매보수 1%) + 성과보수 15% HWM · 제안서 p.14 / 검토보고서 p.4</em>','연 -1.74%p <em>종류운용 → Class A 스프레드 역산</em>','+0.17%p 초과'],
    ['warn','전략 비중','주식 20~60% <em>메자닌 30~50 / 이벤트 0~15 / 헤지 0~15 · 제안서 p.4 · 검토보고서 p.1</em>','주식 Long 53.05% <em>사유서 p.1 · 26.06.03</em>','밴드 내'],
    ['bad','하락 국면 헤지 기여','"항시 헤지전략 수행으로 변동성 관리" <em>제안서 p.3 운용철학 · 헤지 밴드 0~15%</em>','+0.05% <em>-7.83% 손실 중 · 사유서 p.1</em><em>설정이후 누적 기여 +5.78%(전체의 2.6%)</em>','작동 미확인'],
    ['warn','벤치마크','"KOSPI는 비교지수가 아님" <em>제안서 p.7 각주 · 문서체계 p.13도 동일 지적</em>','검토보고서는 KOSPI로 대조 <em>계약상 기준선과 실무 관행 불일치</em>','기준 상충'],
    ['warn','위험등급','<span class="mutetxt">미기재</span> <em>제안서·검토보고서·품의서 전부 위험등급 표기 없음</em>','MDD 15.40% / 레버리지 한도 400% <em>제안서 p.18</em>','대조 불가'],
  ];
  const pvTbl = `<div class="pv-tbl">
    <div class="pv-head"><div>검증 항목</div><div>제안서가 약속한 값</div><div>대장 실측값</div><div style="text-align:right">판정</div></div>
    ${PV.map(r=>`<div class="pv-row ${r[0]==='bad'?'bad':''} sendable" data-ctx="[약속대비검증] ${r[1]} — 제안서: ${r[2].replace(/<[^>]+>/g,' ')} / 실측: ${r[3].replace(/<[^>]+>/g,' ')} / 판정: ${r[4]}" data-label="검증: ${r[1]}">
      <div class="pv-k">${r[1]}</div><div class="pv-c">${r[2]}</div><div class="pv-c">${r[3]}</div>
      <div class="pv-j"><span class="pill ${r[0]}">${r[4]}</span></div>
    </div>`).join('')}
  </div>
  <div class="note-line warn"><span class="nl-ic">📎</span><div><b>기준선의 절반은 제안서가 아니라 화인 내부 문서에 있습니다.</b> 목표수익률(IRR 10%)·총보수(1.57%)·MDD(15.60%)는 제안서 본문(p.1~13)에 없고 <b>제안서 부록 p.14</b>와 <b>자금부 검토보고서 p.2·p.4</b>에 있었습니다. 인풋을 대장·제안서·사유서 3종으로만 잡으면 <b>15개 항목 중 5개를 "미기재"로 잘못 판정</b>합니다 — 검토보고서·품의서를 4번째 축으로 반드시 물려야 합니다.</div></div>
  <div class="note-line bad"><span class="nl-ic">📉</span><div>그래도 남는 결함: <b>보수 차감 후 수익률이 어느 문서에도 없습니다.</b> 제안서·검토보고서 성과표가 전부 "보수 차감 전 운용펀드 기준"이라, 투자자가 실제로 받은 <b>+154.57%</b>는 대장에서 직접 계산해야만 나옵니다. 그리고 실효 보수 <b>1.74%p</b>가 약속한 총보수 <b>1.57%</b>를 <b>0.17%p 초과</b>합니다 — 성과보수 15%(HWM) 실현분으로 설명되는지 <b>운용사에 명세를 요구</b>해야 합니다.</div></div>`;

  /* ================= 판단 규칙 3 ================= */
  const RULES=[
    {n:'①',s:'ok',t:'위험 초과 — 수익은 좋은데 MDD가 목표 위험등급보다 큰가',
     rule:'수익률이 좋아도 MDD가 약속한 위험 수준을 넘으면, <b>위험을 초과 감수해서 번 것</b>이라 재현되지 않습니다.',
     find:'<b>충족.</b> 검토보고서 p.4의 <b>운용목표 IRR 10%</b>에 대해 Class A 실측 CAGR은 <span class="hitnum">11.44%</span>로 <b>+1.44%p 달성</b>했고, 그 수익이 고위험에서 나온 것이 아닙니다 — 문서체계 「성과 검증 로직」의 4개 조건을 전부 통과합니다: 수익 <b>13.18% &gt; 9.89%</b>, 변동성 <b>10.30% &lt; 18.41%</b>, Sharpe <b>1.09 &gt; 0.44</b>, MDD <b>15.40% &lt; 43.90%</b>(vs KOSPI). 다만 <b>위험등급 자체는 제안서·검토보고서·품의서 어디에도 없어</b> 절대 기준 대조는 여전히 불가합니다.',
     ctx:'[판단규칙1 위험초과] 충족 — 목표 IRR 10%(검토보고서 p.4) 대비 Class A CAGR 11.44% 달성. 위험조정 4조건 전부 통과(수익 13.18>9.89, 변동성 10.30<18.41, Sharpe 1.09>0.44, MDD 15.40<43.90). 단 위험등급 표기는 전 문서에 부재.'},
    {n:'②',s:'bad',t:'사유 부실 — 하락 구간에 설명이 없거나 부실한가',
     rule:'낙폭 구간에 사유 설명이 없거나 부실하면 <b>운용사 리스크 관리 부재 신호</b>입니다.',
     find:'<b>위반.</b> 낙폭 6개 구간 중 사유가 매칭된 건 <span class="hitnum">0건 (0%)</span>. 확보된 사유서는 1건뿐이고, 그마저 대장 범위 밖인 <b>2026-05-28~06-03</b>을 설명합니다. <b>-15.40% MDD(2018), -14.59%(2022)에 대한 설명이 8년째 존재하지 않습니다.</b> 게다가 그 1건도 투자자가 <b>환매를 청구한 다음</b> 작성됐습니다(사유서 p.1: "26.05.28. 환매 청구를 진행하신 날"). → <b>사후 대응, 상시 관리 아님</b>',
     ctx:'[판단규칙2 사유부실] 위반 — 낙폭 6구간 중 사유 매칭 0건(0%). 사유서 1건은 대장 범위 밖(26.05.28~06.03)이며 투자자 환매청구 후 작성. 상시 리스크관리 부재 신호.'},
    {n:'③',s:'warn',t:'전략 불일치 — 제안서 전략과 실제 수익 패턴이 다른가',
     rule:'제안서 전략과 실제가 다르면 <b>스타일 드리프트(Style Drift)</b> — 약속과 다른 걸 하고 있다는 뜻입니다.',
     find:'<b>비중은 이상 없음, 리스크 완화장치는 관찰 필요.</b> 주식 Long <b>53.05%</b>는 약속 밴드 <b>20~60%</b>(제안서 p.4 · 검토보고서 p.1) <b>안</b>입니다. 다만 제안서 p.3은 "항시 헤지전략 수행으로 변동성 관리"를 운용철학으로 내걸고, 화인 문서체계도 <b>"헤지전략 병행 + 100~200종목 분산 = 파생 리스크 통제 가능"</b>으로 판단했는데, 실제 하락 국면에서 헤지 기여도는 <span class="hitnum">+0.05%</span>로 <b>-7.83%</b> 손실을 방어하지 못했습니다. 설정이후 누적 기여도도 <b>+5.78%</b>(총 224.79% 중 2.6%). <b>TRS·장외옵션(레버리지 한도 400%)을 통제한다는 근거가 실측으로 확인되지 않습니다.</b>',
     ctx:'[판단규칙3 전략불일치] 비중은 밴드 내(주식 53.05% vs 약속 20~60%). 다만 제안서 p.3 "항시 헤지로 변동성 관리" 및 화인 문서체계의 "헤지 병행=파생리스크 통제가능" 판단 근거가, 하락기 헤지 기여 +0.05%·설정이후 +5.78%(전체 2.6%)로 실측 미확인. TRS/레버리지 400% 한도 대비 완화장치 검증 필요.'},
  ];
  const RVERDICT={ok:'충족',warn:'경고',bad:'위반'};
  const ruleBox = `<div style="display:flex;flex-direction:column;gap:11px">
    ${RULES.map(r=>`<div class="rule-card ${r.s} sendable" data-ctx="${r.ctx}" data-label="판단규칙 ${r.n}">
      <div class="rule-h"><span class="rule-n">${r.n}</span><span class="rule-t">${r.t}</span>
        <span style="margin-left:auto;display:flex;gap:6px;align-items:center"><span class="pill ${r.s}">${RVERDICT[r.s]}</span>${askBtn()}</span></div>
      <div class="rule-rule">${r.rule}</div>
      <div class="rule-find">${r.find}</div>
    </div>`).join('')}
  </div>
  <div class="verdict reveal cond" style="margin-top:13px">
    <span class="verdict-badge">조건부 적정</span>
    <div><div class="verdict-t">3규칙 중 충족 1 · 경고 1 · <b>위반 1</b> — 성과는 통과, <b>사후관리 체계</b>에서 걸렸습니다</div>
    <div class="verdict-d">Class A 누적 <b class="num">+154.57%</b>, CAGR <b class="num">11.44%</b>(목표 IRR 10% 대비 <b>+1.44%p 달성</b>), MDD <b class="num">15.40%</b>(KOSPI 43.90%)로 <b>위험조정 성과는 4개 조건 전부 통과</b>합니다. 남은 문제는 ⑴ 낙폭 6구간 전부에 사유 설명이 없고, ⑵ 실효 보수 1.74%p가 약속 총보수 1.57%를 <b>0.17%p 초과</b>하며, ⑶ 하락 국면에서 헤지 전략이 <b>+0.05%</b>밖에 기여하지 못해 "항시 헤지로 변동성 관리"라는 운용철학이 실측으로 확인되지 않는다는 점입니다. <b>구간별 하락사유서 · 성과보수 실현 명세 · 대장 최신본(~2026.07)을 서면 요구한 뒤 재검토</b>가 다음 액션입니다.</div></div>
  </div>`;

  /* ================= 탭 본문 ================= */
  const tabInputs = `
    <div class="ai-sum sendable reveal" data-ctx="[AI 요약] GVA Fortress-A 펀드 검증. 인풋 5종(대장 xlsx 3,151행 / 제안서 pdf 23p / 사유서 pdf 2p / 검토보고서 9p / 품의서 34p) 파싱. STEP3 게이트 중단 2건(기준일 불일치, 기준가 계열 혼용). Class A 누적 154.57%, CAGR 11.44%(목표 IRR 10% 달성), MDD 15.40%. 판단 3규칙: 충족1·경고1·위반1 → 조건부 적정." data-label="AI 요약">
      <div class="ai-sum-head"><span class="ai-tag-sm">AI 자동 요약</span><span class="ai-label">인풋 5종 · 3,151행 + 68p 전체 분석</span>
        <div class="ai-conf"><div class="conf-bar"><i style="width:91%"></i></div>신뢰도91%</div></div>
      <div class="ai-sum-body">
        <p>GVA Fortress-A는 2017.05.17 설정된 Multi-strategy 헤지펀드로, 대장 기준 <b>Class A 누적 +154.57%(CAGR 11.44%), MDD 15.40%</b>를 기록했습니다. 검토보고서 p.4의 <b>운용목표 IRR 10%를 +1.44%p 초과 달성</b>했고, 위험조정 4개 조건(수익↑·변동성↓·Sharpe↑·MDD↓ vs KOSPI)도 전부 통과합니다. 다만 <b>STEP 3 게이트에서 중단 2건</b> — 대장(~25.12.31)·제안서(26.01.31)·사유서(26.06.03) <b>기준일이 모두 다르고</b>, 모든 공식 성과표가 <b>보수 차감 전</b>이라 투자자 실수령과 36.3%p 벌어집니다. 낙폭 <b>6구간 전부 사유 설명 0건</b>, 실효 보수 1.74%p가 약속 총보수 1.57%를 <b>0.17%p 초과</b>, 하락 국면 헤지 기여 <b>+0.05%</b>. 판단 3규칙 <b>충족 1 · 경고 1 · 위반 1 → 조건부 적정</b>.</p>
        <button class="ask-ai">Ask AI <svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
      <div class="ai-sum-foot">생성 2026.07.31 09:42 · Private LLM · 원본 5종 직접 파싱</div>
      <div class="ai-sum-src"><span class="src-l">출처</span>${['대장 행 2~3,151','제안서 p.4','제안서 p.14','검토보고서 p.2','검토보고서 p.4','사유서 p.1'].map(s=>`<span class="src-chip">${LINKIC}${s}</span>`).join('')}</div>
    </div>

    ${sumCard('인풋 3종','축 = 숫자 · 약속 · 설명 · 카드 클릭 → AI',ioCards)}
    ${sumCard('마스터 = 헤지펀드 운용현황','분석 대상이 아니라 펀드 ID 발급 레지스트리',regBox)}
    <div class="sum-row">
      ${sumCard('기업분석 ↔ 펀드분석 대응','도메인만 바뀌고 프레임은 동일',mapTbl)}
      ${sumCard('시스템 플로우','7단계 · STEP 3이 게이트',flowBox)}
    </div>
    ${sumCard('STEP 3 게이트 결과','통과 3 · 경고 2 · 중단 2 — 행 클릭 → AI 심층',gateBox)}
    ${sumCard('대장 원본 미리보기','원본 추적(traceability) — 모든 수치는 행 번호까지',ledPrev)}`;

  const tabPerf = `<div class="sec-t">1장. 얼마 벌었나 <small>· 성과 · Class A(보수 차감 후) 기준 고정</small></div>
    ${perfKpi}<div style="height:12px"></div>${chartCard}<div style="height:12px"></div>
    ${sumCard('연도별 · 설정이후 수익률','종류운용 vs Class A vs KOSPI',yrTbl)}`;

  const tabFlow = `<div class="sec-t">2장. 돈이 언제 빠졌나 <small>· 흐름 · 위험 — 기업분석의 "현금흐름 브리지" 자리</small></div>
    ${riskKpi}<div style="height:12px"></div>
    ${sumCard('낙폭 구간 ↔ 하락사유 매칭','★ 시스템의 존재 이유 · 행 클릭 → AI',ddTbl)}
    <div class="sum-row">
      ${sumCard('사유서가 설명하는 손실 (전략별)','2026.05.28~06.03 · 검증 불가 구간',attrBox)}
      ${sumCard('사유서 원문 — 근거 위치','노란 하이라이트 = 시스템이 뽑아 쓴 값',reasonBox)}
    </div>`;

  const tabVerify = `<div class="sec-t">3장. 약속 지켰나 <small>· 제안서 ↔ 대장 대조 · 13개 항목 · 행 클릭 → AI</small></div>${pvTbl}`;
  const tabRules = `<div class="sec-t">판단 규칙 3개 <small>· 이것만 보면 80% 걸러짐</small></div>${ruleBox}`;

  /* ================= 좌측 패널 ================= */
  function mr(k,v){return `<div class="meta-row"><span class="mk">${k}</span><span class="mv">${v}</span></div>`;}
  const leftMeta = `
    <div class="meta-grp"><div class="meta-l">투자 대상</div><div class="meta-v-lg">GVA Fortress-A</div>
      <div style="font-size:11px;color:var(--t3);margin-top:3px">지브이에이 Fortress-A 일반 사모투자신탁</div></div>
    <div class="meta-grp"><div class="meta-l">펀드 식별</div>${mr('펀드코드','KRZ502142705')}${mr('운용사','지브이에이자산운용㈜')}${mr('전략','Multi-strategy')}${mr('PB','미래에셋')}</div>
    <div class="meta-grp"><div class="meta-l">규모 / 성과</div>${mr('설정일','2017.05.17')}${mr('설정액','4,227.75억')}${mr('누적 (Class A)','+154.57%')}${mr('CAGR','11.44%')}</div>
    <div class="meta-grp"><div class="meta-l">위험</div>${mr('MDD','-15.40%')}${mr('회복 소요','524일')}${mr('변동성','10.32%')}${mr('Sharpe','0.92')}</div>
    <div class="meta-grp"><div class="meta-l">검증 상태</div>
      <div class="meta-row"><span class="mk">게이트</span><span class="mv" style="color:var(--red)">중단 2건</span></div>
      <div class="meta-row"><span class="mk">사유 매칭</span><span class="mv" style="color:var(--red)">0 / 6</span></div>
      <div class="meta-row"><span class="mk">판단 3규칙</span><span class="mv" style="display:flex;align-items:center;gap:7px"><span class="dday-pill">위반 2</span></span></div></div>`;

  function docRow(type,name,sub){return `<div class="doc-row" data-toast="${name} 열기 (프로토타입)">${fileIcon(type)}<div class="doc-meta"><div class="doc-name">${name}</div><div class="doc-sub">${sub}</div></div></div>`;}
  const attachSection = `
    <div class="attach-h"><span class="attach-t">업로드된 인풋</span><span class="attach-c">5건</span></div>
    <div class="attach-list">
      ${docRow('XLSX','기준가격대장_Fortress-A_수정기준가격.xlsx','① 숫자 · 3,151행 × 8열')}
      ${docRow('PDF','IM_Fortress-A_제안서.pdf','② 약속 · 23p · 26.01.31 기준')}
      ${docRow('PDF','관리_펀드현황(기준가 하락사유)_260604.pdf','③ 설명 · 2p · 26.06.04')}
      ${docRow('PDF','검토보고서_투자_GVA Fortress-A.pdf','④ 판단 · 9p + 품의서 34p · 자금부')}
      ${docRow('XLSX','헤지펀드_운용_현황(2026706).xlsx','마스터 · 4,013개 펀드')}
    </div>
    <div class="dl-mini">
      <div class="dl-mini-t">산출물 다운로드</div>
      ${dlBtn('HTML','3장 리포트','report')}${dlBtn('CSV','지표 요약','csv')}${dlBtn('JSON','검증 결과','json')}
    </div>`;

  function dlBtn(type,label,kind){
    return `<button class="dl-btn" data-dl="${kind}">${fileIcon(type)}<span class="dl-l"><span class="dl-n">${label}</span><span class="dl-s">${type} 내려받기</span></span>
      <svg class="dl-ic" viewBox="0 0 24 24" fill="none"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
  }

  /* ================= 헤더 / 스테퍼 ================= */
  const STEPS=['수집','정규화','검증 게이트','계산','매칭','약속검증','출력'];
  function stepper(done){ // done = 완료된 단계 수 (0 = 대기)
    return STEPS.map((s,i)=>{
      let st = i<done ? 'done' : i===done ? 'cur' : 'todo';
      if(i===2 && done>2) st='done gate';
      const circle = (i<done)
        ? (i===2 ? '!' : '<svg viewBox="0 0 24 24" fill="none"><path d="M6 12.5l4 4 8-9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>')
        : (i+1);
      const conn = i<STEPS.length-1 ? `<div class="step-conn ${i<done?'active':''}"></div>` : '';
      return `<div class="step ${st}"><div class="step-circle">${circle}</div><div class="step-label">${s}</div></div>${conn}`;
    }).join('');
  }
  function header(done,tags,actions){
    return `<div class="dh reveal">
      <div class="dh-row1">
        <div class="dh-bar"></div>
        <div><h1 class="dh-title">GVA Fortress-A 일반 사모투자신탁</h1><div class="dh-tags">${tags}</div></div>
        <div class="dh-actions">${actions}</div>
      </div>
      <div class="stepper" id="stepper">${stepper(done)}</div>
    </div>`;
  }

  /* ================= STAGE 1 — 업로드 ================= */
  function uploadStage(){
    return header(0,
      `<span class="badge gray">일반사모</span><span class="badge gray">Multi-strategy</span><span class="badge gray">KRZ502142705</span><span class="badge amber">인풋 대기</span>`,
      `<button class="btn" id="fillSample">샘플 자료로 채우기</button><button class="btn primary" id="runBtn" disabled>분석 시작 →</button>`)
    + `<div class="up-wrap reveal">
        <div class="up-head">
          <div><div class="up-title">인풋 4종을 올려주세요</div>
          <div class="up-desc">숫자(대장) · 약속(제안서) · 설명(사유서) · 판단(내부 검토보고서) 4개 축이 모두 있어야 3장 리포트가 나옵니다. 마스터(운용현황)는 펀드 ID 발급용이라 선택입니다.</div></div>
          <div class="up-count"><span id="upCount">0</span> / 4 <small>필수</small></div>
        </div>
        <div class="up-grid">
          ${SLOTS.map(s=>`
            <label class="up-slot ${s.need?'':'opt'}" data-slot="${s.id}" style="--io-c:${s.c}">
              <input type="file" accept="${s.accept}" hidden>
              <div class="up-empty">
                <div class="up-axis"><span class="io-n">${s.n}</span><span class="io-axis-l">${s.axis}</span>${s.need?'':'<span class="pill mute">선택</span>'}</div>
                <div class="up-drop">
                  <svg class="up-ic" viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0L8 8m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <div class="up-dl">클릭하거나 드래그</div>
                  <div class="up-ds">${s.accept.replace(/\./g,'').toUpperCase().replace(/,/g,' · ')}</div>
                </div>
                <div class="up-role">${s.role}</div>
              </div>
              <div class="up-filled">
                <div class="up-axis"><span class="io-n">${s.n}</span><span class="io-axis-l">${s.axis}</span><span class="pill ok" style="margin-left:auto">파싱 완료</span></div>
                <div class="up-file">${fileIcon(s.type)}<div><div class="up-fn"></div><div class="up-fs"></div></div></div>
                <div class="up-parsed">${s.parsed}</div>
              </div>
            </label>`).join('')}
        </div>
        <div class="note-line"><span class="nl-ic">🔎</span><div>이 프로토타입은 실제 파일을 읽지 않고, <b>화인_DATA_샘플자료의 원본 5종을 미리 파싱해 둔 결과</b>를 씁니다. 화면의 모든 수치(3,151행 · MDD 15.40% · 목표 IRR 10% · 총보수 1.57% 등)는 그 원본에서 실제로 계산·추출했으며, 누적 190.91%·Sharpe 1.09는 화인 자체 산출값과 독립적으로 일치합니다.</div></div>
      </div>`;
  }

  /* ================= STAGE 2 — 처리 ================= */
  function runStage(){
    return header(0,
      `<span class="badge gray">일반사모</span><span class="badge gray">Multi-strategy</span><span class="badge gray">KRZ502142705</span><span class="badge amber">분석 중</span>`,
      `<button class="btn" disabled>샘플 자료로 채우기</button><button class="btn primary" disabled><span class="spin sm"></span>분석 중…</button>`)
    + `<div class="run-wrap reveal">
        <div class="run-head">
          <div class="run-orb"><span class="spin"></span></div>
          <div style="flex:1"><div class="run-title" id="runTitle">파이프라인 실행 중…</div>
            <div class="run-sub" id="runSub">인풋 3종 + 마스터 1종 · 총 7단계</div>
            <div class="run-bar"><i id="runBar"></i></div></div>
          <div class="run-pct"><span id="runPct">0</span>%</div>
        </div>
        <div class="run-body">
          <div class="run-steps" id="runSteps">
            ${FLOW.map(f=>`<div class="run-step" data-rs="${f.n}">
              <span class="rs-ic"><span class="rs-idle">${f.n}</span><span class="spin sm"></span><span class="rs-done"></span></span>
              <span class="rs-t">${f.t}</span><span class="rs-pill"></span></div>`).join('')}
          </div>
          <div class="run-log" id="runLog"></div>
        </div>
      </div>`;
  }

  /* ================= STAGE 3 — 결과 ================= */
  function doneStage(){
    return header(7,
      `<span class="badge gray">일반사모</span><span class="badge gray">Multi-strategy</span><span class="badge gray">KRZ502142705</span><span class="badge gray">설정 2017.05.17</span><span class="badge red">게이트 중단 2</span>`,
      `<button class="btn" id="resetBtn">새 파일로 다시</button><button class="btn danger" data-drop>보완 요구서 발송</button><button class="btn primary" data-dl="report">3장 리포트 받기 ↓</button>`)
    + `<div class="dl-bar reveal">
        <div class="dl-bar-l"><span class="dl-ok">✓</span><div><div class="dl-bar-t">분석 완료 — 3장 리포트 생성됨</div>
          <div class="dl-bar-s">인풋 5종 · 3,151행 + 68p 파싱 · 7단계 처리 · 게이트 중단 2건 포함 · 판정 <b>조건부 적정</b></div></div></div>
        <div class="dl-bar-r">${dlBtn('HTML','3장 리포트','report')}${dlBtn('CSV','지표 요약','csv')}${dlBtn('JSON','검증 결과','json')}</div>
      </div>
      <div class="pane">
        <div class="pn-col reveal d1">
          <aside class="pn pn-left">${leftMeta}</aside>
          <aside class="pn attach-card">${attachSection}</aside>
        </div>
        <main class="pn pn-center reveal d2">
          <div class="c-tabs">
            <div class="c-tab on" data-tab="inputs">인풋 3종 · 게이트 <span class="tc">7</span></div>
            <div class="c-tab" data-tab="perf">1장 성과</div>
            <div class="c-tab" data-tab="flow">2장 흐름·위험 <span class="tc">6</span></div>
            <div class="c-tab" data-tab="verify">3장 약속검증 <span class="tc">15</span></div>
            <div class="c-tab" data-tab="rules">판단 3규칙 <span class="tc">3</span></div>
          </div>
          <div class="tab-body" id="tabBody">${tabInputs}</div>
        </main>
      </div>`;
  }

  /* ================= 스테이지 머신 ================= */
  const root = document.getElementById('content');
  const filled = {};

  function goUpload(){
    root.innerHTML = uploadStage();
    initReveal(root);

    root.querySelectorAll('.up-slot').forEach(slot=>{
      const id=slot.dataset.slot, def=SLOTS.find(s=>s.id===id);
      slot.querySelector('input').addEventListener('change',e=>{
        const f=e.target.files&&e.target.files[0];
        setFilled(slot, def, f?f.name:def.sample, f?fmtSize(f.size):def.size);
      });
      ['dragover','dragenter'].forEach(ev=>slot.addEventListener(ev,e=>{e.preventDefault();slot.classList.add('over');}));
      ['dragleave','drop'].forEach(ev=>slot.addEventListener(ev,e=>{e.preventDefault();slot.classList.remove('over');}));
      slot.addEventListener('drop',e=>{
        const f=e.dataTransfer.files&&e.dataTransfer.files[0];
        setFilled(slot, def, f?f.name:def.sample, f?fmtSize(f.size):def.size);
      });
    });

    root.querySelector('#fillSample').addEventListener('click',()=>{
      SLOTS.forEach((s,i)=>setTimeout(()=>{
        setFilled(root.querySelector(`[data-slot="${s.id}"]`), s, s.sample, s.size);
      }, i*180));
    });
    root.querySelector('#runBtn').addEventListener('click',goRun);
  }
  function fmtSize(b){ return b>1048576 ? (b/1048576).toFixed(1)+' MB' : Math.max(1,Math.round(b/1024))+' KB'; }
  function setFilled(slot, def, name, size){
    if(!slot) return;
    filled[def.id]=true;
    slot.classList.add('has');
    slot.querySelector('.up-fn').textContent = name;
    slot.querySelector('.up-fs').textContent = size + ' · 파싱 완료';
    const n = SLOTS.filter(s=>s.need&&filled[s.id]).length;
    const cEl=root.querySelector('#upCount'); if(cEl) cEl.textContent=n;
    const btn=root.querySelector('#runBtn'); if(btn) btn.disabled = n<4;
    if(n===4 && btn && !btn._t){ btn._t=1; toast('인풋 4종 확보 — 분석을 시작할 수 있습니다'); }
  }

  function goRun(){
    root.innerHTML = runStage();
    initReveal(root);
    const bar=root.querySelector('#runBar'), pct=root.querySelector('#runPct'),
          logEl=root.querySelector('#runLog'), titleEl=root.querySelector('#runTitle'),
          subEl=root.querySelector('#runSub'), stepEl=root.querySelector('#stepper');
    const total=FLOW.reduce((a,f)=>a+f.ms,0);
    let elapsed=0, i=0;

    function nextStep(){
      if(i>=FLOW.length){ setTimeout(goDone, 420); return; }
      const f=FLOW[i];
      const row=root.querySelector(`[data-rs="${f.n}"]`);
      row.classList.add('running');
      titleEl.textContent = `STEP ${f.n} · ${f.t}`;
      subEl.textContent = f.d.replace(/<[^>]+>/g,'');
      row.scrollIntoView&&0;

      // 로그를 단계 시간 내에 나눠 출력
      f.logs.forEach((l,k)=>setTimeout(()=>{
        const cls = l.startsWith('✕')?'bad':l.startsWith('!')?'warn':l.startsWith('✓')?'ok':'';
        const d=document.createElement('div');
        d.className='log-l '+cls;
        d.innerHTML=`<span class="log-s">STEP ${f.n}</span>${l}`;
        logEl.appendChild(d); logEl.scrollTop=logEl.scrollHeight;
      }, f.ms*(k+1)/(f.logs.length+1)));

      setTimeout(()=>{
        row.classList.remove('running');
        row.classList.add('done');
        if(f.s) row.classList.add(f.s);
        if(f.pill) row.querySelector('.rs-pill').innerHTML=f.pill;
        elapsed+=f.ms; i++;
        const p=Math.round(elapsed/total*100);
        bar.style.width=p+'%'; pct.textContent=p;
        if(stepEl) stepEl.innerHTML = stepper(i);
        nextStep();
      }, f.ms);
    }
    bar.style.width='2%';
    setTimeout(nextStep, 260);
  }

  function goDone(){
    root.innerHTML = doneStage();
    initReveal(root);
    animateBars(root); animateCounts(root);
    if(window.__fundBindResults) window.__fundBindResults();
    root.querySelector('#resetBtn').addEventListener('click',()=>{
      Object.keys(filled).forEach(k=>delete filled[k]);
      goUpload();
    });
    toast('분석 완료 — 3장 리포트를 내려받을 수 있습니다');
  }

  /* ================= 다운로드 산출물 ================= */
  function download(name, mime, text){
    const blob=new Blob([text],{type:mime+';charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 3000);
    toast(name+' 내려받는 중…');
  }
  const STAMP='2026-07-31';
  const FNAME='GVA_Fortress-A';

  function buildCSV(){
    const rows=[
      ['# 펀드 검증 지표 요약'],['# 펀드','지브이에이 Fortress-A 일반 사모투자신탁'],
      ['# 펀드코드','KRZ502142705'],['# 산출일',STAMP],
      ['# 원천','기준가격대장 xlsx 3,151행 (2017-05-17~2025-12-31)'],
      ['# 기준계열','수정기준가 Class A (보수 차감 후)'],[],
      ['구분','항목','값','단위','근거'],
      ['1장 성과','누적수익률 (Class A)','154.57','%','대장 행 2 → 3,151'],
      ['1장 성과','누적수익률 (종류운용)','190.91','%','대장 행 2 → 3,151'],
      ['1장 성과','CAGR (Class A)','11.44','%','8.62년'],
      ['1장 성과','CAGR (종류운용)','13.18','%','8.62년'],
      ['1장 성과','KOSPI 설정이후 (참고)','83.64','%','제안서 p.7 역산'],
      ['1장 성과','목표 IRR (약속)','10.00','%','검토보고서 p.4 · 품의서 p.2'],
      ['1장 성과','목표 대비','+1.44','%p','Class A CAGR 11.44%'],
      ['1장 성과','보수 드래그','-1.74','%p/년','클래스 스프레드 역산'],
      ['2장 위험','MDD (Class A 실측)','-15.40','%','행 364 → 532'],
      ['2장 위험','MDD (화인 산출)','-15.60','%','검토보고서 p.2 · 26.01.31'],
      ['2장 위험','MDD (KOSPI)','-43.90','%','검토보고서 p.2'],
      ['2장 위험','MDD 회복 소요','524','일','2020-04-06'],
      ['2장 위험','연환산 변동성','10.32','%','일간 · √365'],
      ['2장 위험','Sharpe','0.92','','rf 2.0%'],
      ['2장 위험','Sortino','0.92','','rf 2.0%'],
      ['2장 위험','낙폭 구간 수','6','건',''],
      ['2장 위험','사유 매칭','0','건','매칭률 0%'],
      ['3장 검증','검증 항목','15','건','충족 6 · 경고 5 · 불일치 4'],
      ['3장 검증','약속 총보수','1.57','%','A클래스 · 제안서 p.14 / 검토보고서 p.4'],
      ['3장 검증','실효 보수 (역산)','1.74','%p/년','약속 대비 +0.17%p'],
      ['게이트','통과 / 경고 / 중단','5 / 2 / 2','건','STEP 3'],
      ['판정','종합','조건부 적정','','충족 1 · 경고 1 · 위반 1'],
      [],
      ['연도','종류운용(%)','Class A(%)','KOSPI(%)',''],
      ...YR.map(r=>[r[0],r[1],r[2],r[3],'']),
      [],
      ['낙폭','고점','저점','회복','소요(일)','원본 행','매칭 사유'],
      ...DD.map(d=>[d[0]+'%',d[1],d[2],d[3],d[4],d[5],'없음']),
      [],
      ['검증항목','제안서','실측','판정'],
      ...PV.map(r=>[r[1],r[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(),r[3].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(),r[4]]),
    ];
    const esc=v=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
    return '﻿'+rows.map(r=>r.map(esc).join(',')).join('\r\n');
  }

  function buildJSON(){
    const strip=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    return JSON.stringify({
      generated_at:STAMP, engine:'화인파트너스 펀드검증 파이프라인 v0.1 (프로토타입)',
      fund:{name:'지브이에이 Fortress-A 일반 사모투자신탁',code:'KRZ502142705',
        manager:'지브이에이자산운용㈜',strategy:'Multi-strategy',inception:'2017-05-17',
        aum_billion_krw:4227.75, registry_row:3141, registry_asof:'2026-07-06'},
      inputs:SLOTS.map(s=>({axis:s.axis,file:s.sample,type:s.type,parsed:s.parsed,required:s.need})),
      pipeline:FLOW.map(f=>({step:f.n,name:f.t,status:f.s==='gate'?'halted':f.s==='fail'?'failed':'ok',logs:f.logs})),
      gate:{passed:5,warned:2,halted:2,
        checks:GATE.map(g=>({level:g[0],title:strip(g[1]),detail:strip(g[2]),verdict:g[3]}))},
      report_1_performance:{basis:'수정기준가 Class A (보수 차감 후)',period:'2017-05-17~2025-12-31',years:8.62,
        cumulative_pct:154.57,cagr_pct:11.44,gross_cumulative_pct:190.91,gross_cagr_pct:13.18,
        kospi_cumulative_pct:83.64,fee_drag_pct_per_year:-1.74,
        target_irr_pct:10.0, target_source:'검토보고서 p.4 / 품의서 p.2', target_met:true, excess_over_target_pct:1.44,
        stated_total_fee_pct:1.57, stated_fee_source:'제안서 p.14 / 검토보고서 p.4', performance_fee:'15% (High-Water Mark)',
        yearly:YR.map(r=>({year:r[0],gross:r[1],class_a:r[2],kospi:r[3]}))},
      report_2_risk:{mdd_pct:-15.40,mdd_peak:'2018-05-15',mdd_trough:'2018-10-30',mdd_recovery:'2020-04-06',
        mdd_recovery_days:524,volatility_pct:10.32,sharpe:0.92,sortino:0.92,risk_free_pct:2.0,
        mdd_pct_manager_stated:-15.60, mdd_source:'검토보고서 p.2 (2026-01-31)',
        benchmark_kospi:{cagr_pct:9.89, volatility_pct:18.41, sharpe:0.44, mdd_pct:-43.90, source:'검토보고서 p.2'},
        drawdowns:DD.map(d=>({magnitude_pct:parseFloat(d[0]),peak:d[1],trough:d[2],recovery:d[3],
          recovery_days:parseInt(d[4]),source_rows:d[5],matched_reason:null})),
        reason_match:{matched:0,total:6,rate_pct:0,
          note:'확보된 사유서 1건의 대상기간(2026-05-28~06-03)이 대장 범위(~2025-12-31) 밖'}},
      report_3_promise_vs_actual:PV.map(r=>({level:r[0],item:r[1],promised:strip(r[2]),actual:strip(r[3]),verdict:r[4]})),
      rules:RULES.map(r=>({rule:r.n,title:strip(r.t),result:{ok:'SATISFIED',warn:'WARNING',bad:'VIOLATED'}[r.s],finding:strip(r.find)})),
      verdict:{decision:'CONDITIONAL_PASS',label:'조건부 적정',satisfied:1,warned:1,violated:1,
        required_from_manager:['기준가격대장 최신본(~2026.07)','낙폭 6구간별 하락사유서','성과보수 15%(HWM) 실현 명세 — 실효보수 1.74%p vs 약속 1.57%','위험등급 표기','하락 국면 헤지 전략 실행 내역']}
    },null,2);
  }

  function buildReportHTML(){
    const strip=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    const css=`body{font-family:'Pretendard','Apple SD Gothic Neo',system-ui,sans-serif;color:#101828;max-width:940px;margin:0 auto;padding:38px 26px;line-height:1.65;background:#fff}
h1{font-size:22px;margin:0 0 6px}h2{font-size:16px;margin:30px 0 10px;padding-bottom:7px;border-bottom:2px solid #101828}
h3{font-size:13.5px;margin:20px 0 8px;color:#3a4150}.sub{color:#68778c;font-size:12px;margin-bottom:22px}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12px}
th,td{border:1px solid #e5e7eb;padding:7px 9px;text-align:left}th{background:#f7f8fa;font-weight:700;color:#3a4150}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.kpis{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
.k{flex:1;min-width:140px;border:1px solid #e5e7eb;border-radius:10px;padding:11px 13px}
.k .kk{font-size:10.5px;color:#68778c;font-weight:600}.k .kv{font-size:21px;font-weight:750;margin-top:4px}
.bad{color:#e7000b}.warn{color:#e08600}.ok{color:#009638}
.box{border:1px solid #e5e7eb;border-left:3px solid #e7000b;border-radius:9px;padding:12px 14px;margin:12px 0;font-size:12px;background:#fffafa}
.box.w{border-left-color:#e08600;background:#fffdf6}.box.i{border-left-color:#344acb;background:#fafbff}
.src{font-size:10.5px;color:#99a1af;font-family:'Inter',sans-serif}
footer{margin-top:34px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:10.5px;color:#99a1af}`;
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<title>펀드 검증 3장 리포트 — GVA Fortress-A</title><style>${css}</style></head><body>
<h1>펀드 검증 3장 리포트</h1>
<div class="sub">지브이에이 Fortress-A 일반 사모투자신탁 · KRZ502142705 · 지브이에이자산운용㈜ · Multi-strategy · 설정 2017.05.17<br>
산출일 ${STAMP} · 기준계열 <b>수정기준가 Class A (보수 차감 후)</b> · 원천 기준가격대장 3,151행(2017-05-17~2025-12-31)</div>

<div class="box w"><b>종합 판정: 조건부 적정</b> — 판단 3규칙 중 충족 1 · 경고 1 · 위반 1.
위험조정 성과는 통과합니다(목표 IRR 10% 대비 실측 CAGR 11.44%, KOSPI 대비 수익↑·변동성↓·Sharpe↑·MDD↓ 4개 조건 충족).
걸린 지점은 사후관리 체계입니다 — 낙폭 6구간 전부에 사유 설명이 없고, 실효 보수 1.74%p가 약속 총보수 1.57%를 0.17%p 초과하며, 하락 국면에서 헤지 전략 기여가 +0.05%에 그쳤습니다.</div>

<h2>0. 인풋 3종 · STEP 3 게이트</h2>
<table><tr><th>축</th><th>파일</th><th>파싱 결과</th></tr>
${SLOTS.map(s=>`<tr><td>${s.axis}${s.need?'':' (선택)'}</td><td>${s.sample}</td><td>${s.parsed}</td></tr>`).join('')}</table>
<h3>게이트 결과 — 통과 5 · 경고 2 · <span class="bad">중단 2</span></h3>
<table><tr><th style="width:80px">판정</th><th>항목</th><th>내용</th></tr>
${GATE.map(g=>`<tr><td class="${g[0]==='ok'?'ok':g[0]==='warn'?'warn':'bad'}">${g[3]}</td><td>${strip(g[1])}</td><td>${strip(g[2])}</td></tr>`).join('')}</table>
<div class="box">정규화가 틀린 채 진행하면 <b>그럴듯한 틀린 숫자</b>가 나옵니다. 본 리포트의 모든 수치는 Class A 계열로 고정하고 대장 범위(~2025-12-31) 안에서만 산출했습니다.</div>

<h2>1장. 얼마 벌었나 — 성과</h2>
<div class="kpis">
<div class="k"><div class="kk">누적수익률 (Class A)</div><div class="kv">+154.57%</div></div>
<div class="k"><div class="kk">CAGR</div><div class="kv">11.44%</div></div>
<div class="k"><div class="kk">목표 IRR 대비</div><div class="kv ok">+1.44%p</div></div>
<div class="k"><div class="kk">실효 보수</div><div class="kv">-1.74%p</div></div></div>
<p style="font-size:12px;color:#68778c">목표 IRR 10%는 자금부 검토보고서 p.4 · 품의서 p.2 기재값. 약속 총보수는 A클래스 1.57%(제안서 p.14)이며, 대장 클래스 스프레드로 역산한 실효 보수 1.74%p는 이를 <b>0.17%p 초과</b>합니다 — 성과보수 15%(HWM) 실현분 명세 확인 필요.</p>
<table><tr><th>연도</th><th class="n">종류운용 (보수 전)</th><th class="n">Class A (보수 후)</th><th class="n">KOSPI (참고)</th></tr>
${YR.map(r=>`<tr><td>${r[0]}</td><td class="n">${r[1]>0?'+':''}${r[1].toFixed(2)}%</td><td class="n">${r[2]>0?'+':''}${r[2].toFixed(2)}%</td><td class="n">${r[3]>0?'+':''}${r[3].toFixed(2)}%</td></tr>`).join('')}
<tr><td><b>설정이후</b></td><td class="n"><b>+190.91%</b></td><td class="n"><b>+154.57%</b></td><td class="n"><b>+83.64%</b></td></tr></table>
<div class="box w">제안서 p.7 각주: "KOSPI 지수는 단순 참고지수로서 본 투자신탁의 비교지수(Benchmark)가 아닙니다."
→ <b>초과수익을 판정할 계약상 기준선이 존재하지 않습니다.</b></div>
<div class="src">근거: 대장 행 2~3,151 · 제안서 p.6~p.8</div>

<h2>2장. 돈이 언제 빠졌나 — 흐름 · 위험</h2>
<div class="kpis">
<div class="k"><div class="kk">MDD</div><div class="kv bad">-15.40%</div></div>
<div class="k"><div class="kk">MDD 회복</div><div class="kv">524일</div></div>
<div class="k"><div class="kk">연환산 변동성</div><div class="kv">10.32%</div></div>
<div class="k"><div class="kk">Sharpe</div><div class="kv">0.92</div></div></div>
<table><tr><th>지표 (26.01.31 기준 · 검토보고서 p.2)</th><th class="n">Fortress-A</th><th class="n">KOSPI</th><th>판정</th></tr>
<tr><td>연환산수익률</td><td class="n">14.47%</td><td class="n">9.89%</td><td class="ok">우위</td></tr>
<tr><td>연환산변동성</td><td class="n">10.42%</td><td class="n">18.41%</td><td class="ok">우위</td></tr>
<tr><td>Sharpe</td><td class="n">1.19</td><td class="n">0.44</td><td class="ok">우위</td></tr>
<tr><td>최대낙폭(MDD)</td><td class="n">15.60%</td><td class="n">43.90%</td><td class="ok">우위</td></tr>
<tr><td>Win ratio</td><td class="n">64.76%</td><td class="n">55.24%</td><td class="ok">우위</td></tr></table>
<p style="font-size:12px;color:#68778c">→ 문서체계 「성과 검증 판단 로직」의 4개 조건을 전부 충족하므로 <b>고위험 편취가 아닌 위험조정 초과성과</b>로 판정. 대장 실측 MDD(Class A) 15.40%는 위 15.60%와 0.20%p 오차.</p>
<table><tr><th class="n">낙폭</th><th>고점 → 저점</th><th>회복</th><th class="n">소요</th><th>원본 행</th><th>매칭된 사유</th></tr>
${DD.map(d=>`<tr><td class="n bad">${d[0]}%</td><td>${d[1]} → ${d[2]}</td><td>${d[3]}</td><td class="n">${d[4]}일</td><td class="src">${d[5]}</td><td class="bad">없음</td></tr>`).join('')}</table>
<div class="box"><b>사유 매칭률 0 / 6 (0%).</b> 확보된 사유서는 1건이며 대상기간(2026-05-28~06-03)이 대장 범위 밖입니다.
해당 문서는 손실을 주식 Long -5.80% · 메자닌 Long -1.44% · Pair -0.67% · 이벤트 +0.01% · 헤지 +0.05%로 귀속(합계 -7.83%)하나, <b>대장으로 검증할 수 없는 구간</b>이라 본 리포트는 이를 대조하지 않습니다.</div>
<div class="src">근거: 대장 행 364·532 등 · 사유서 p.1~p.2</div>

<h2>3장. 약속 지켰나 — 제안서 대비 검증</h2>
<table><tr><th style="width:130px">검증 항목</th><th>제안서가 약속한 값</th><th>대장 실측값</th><th style="width:78px">판정</th></tr>
${PV.map(r=>`<tr><td>${r[1]}</td><td>${strip(r[2])}</td><td>${strip(r[3])}</td><td class="${r[0]==='ok'?'ok':r[0]==='warn'?'warn':'bad'}">${r[4]}</td></tr>`).join('')}</table>
<div class="box w">목표 IRR·총보수·MDD는 <b>제안서 본문(p.1~13)이 아니라 제안서 부록 p.14와 자금부 검토보고서 p.2·p.4</b>에 있었습니다. 인풋을 대장·제안서·사유서 3종으로만 한정하면 15개 검증항목 중 5개를 "미기재"로 오판합니다.</div>
<div class="box">그래도 남는 결함: <b>보수 차감 후 수익률이 어느 문서에도 없습니다.</b> 모든 공식 성과표가 "보수 차감 전 운용펀드 기준"이라, 투자자 실수령 +154.57%는 대장에서 직접 계산해야만 나옵니다.</div>

<h2>판단 규칙 3개</h2>
${RULES.map(r=>`<h3>${r.n} ${strip(r.t)} — <span class="${r.s==='bad'?'bad':'warn'}">${r.s==='bad'?'위반':'판정 불가'}</span></h3>
<p style="font-size:12px;color:#68778c;margin:4px 0">규칙: ${strip(r.rule)}</p>
<p style="font-size:12.5px;margin:6px 0">${strip(r.find)}</p>`).join('')}

<h2>운용사 서면 요구 항목</h2>
<ol style="font-size:12.5px">
<li>기준가격대장 최신본(~2026.07) — 현재 대장이 2025-12-31에서 끊겨 최근 하락 구간 검증 불가</li>
<li>낙폭 6구간별 하락사유서 — 특히 15.40%(2018), 14.59%(2022)</li>
<li>성과보수 15%(HWM) 실현 명세 — 실효 보수 1.74%p가 약속 총보수 1.57%를 0.17%p 초과</li>
<li>하락 국면 헤지 전략 실행 내역 — "항시 헤지" 철학 대비 기여 +0.05%</li>
<li>위험등급 표기 — 목표 IRR·MDD는 확보되었으나 위험등급은 전 문서에 부재</li>
</ol>

<footer>화인파트너스 AI 심사역 · 펀드검증 파이프라인 v0.1 (프로토타입) · 생성 ${STAMP}<br>
본 리포트의 모든 수치는 기준가격대장 xlsx(3,151행) · 투자제안서 pdf(23p) · 하락사유서 pdf(2p) · 자금부 검토보고서 pdf(9p) · 품의서 pdf(34p) · 헤지펀드 운용현황 xlsx(4,013행)에서 직접 산출한 값이며, 각 항목에 원본 행 번호와 문서 페이지를 병기했습니다. 대장에서 독립 산출한 누적 190.91% · Sharpe 1.09는 화인 자체 산출값과 일치합니다.</footer>
</body></html>`;
  }

  window.__fundDownload = function(kind){
    if(kind==='csv')  return download(FNAME+'_지표요약_'+STAMP+'.csv','text/csv',buildCSV());
    if(kind==='json') return download(FNAME+'_검증결과_'+STAMP+'.json','application/json',buildJSON());
    return download(FNAME+'_3장리포트_'+STAMP+'.html','text/html',buildReportHTML());
  };

  window.__fund = { TABS:{inputs:tabInputs, perf:tabPerf, flow:tabFlow, verify:tabVerify, rules:tabRules} };

  /* ---- 시작 ---- */
  goUpload();
})();
