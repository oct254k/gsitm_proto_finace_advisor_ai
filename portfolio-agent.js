/* ===== PORTFOLIO: agent + why-modal + interactions ===== */
(function(){
  const agent=document.getElementById('agentPanel'), scrim=document.getElementById('agentScrim');
  agent.innerHTML = `
    <div class="ag-head"><div class="ag-logo-dot"></div><div style="min-width:0"><div class="ag-name">화인 AI Agent</div><div class="ag-sub">사후관리 / 회수</div></div><span class="ag-erp">● ERP 연결</span><button class="ag-close">✕</button></div>
    <div class="ag-body" id="agBody"></div>
    <div class="ag-foot"><div class="ag-chips" id="agChips"></div><div class="ag-input"><input id="agInput" placeholder="포트폴리오에 대해 무엇이든 물어보세요…" autocomplete="off"><button class="ag-send" id="agSend"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>`;
  const agBody=document.getElementById('agBody'),agInput=document.getElementById('agInput'),agSend=document.getElementById('agSend'),agChips=document.getElementById('agChips');
  const CHIPS=['회수 지연 건 정리','이번 달 회수 예정','Exit 적기 건은?','전체 리스크 요약'];
  agChips.innerHTML=CHIPS.map(c=>`<div class="ag-chip">${c}</div>`).join('');
  agChips.querySelectorAll('.ag-chip').forEach(c=>c.addEventListener('click',()=>{agInput.value=c.textContent;send();}));

  let history=[],opened=false;
  function emptyState(){agBody.innerHTML=`<div class="ag-empty"><div class="ico"></div><div class="t">포트폴리오 컨텍스트 로드됨</div><div class="s">화면의 <b>'AI 분석/조치'</b> 버튼을 누르거나<br>아래에 직접 질문해 보세요</div></div>`;}
  emptyState();
  function openAgent(){opened=true;slidePanel(agent,true);fadeScrim(scrim,true);setTimeout(()=>agInput.focus(),350);}
  function closeAgent(){slidePanel(agent,false);fadeScrim(scrim,false);}
  document.getElementById('agentToggle').addEventListener('click',()=>agent.classList.contains('open')?closeAgent():openAgent());
  agent.querySelector('.ag-close').addEventListener('click',closeAgent);
  scrim.addEventListener('click',closeAgent);

  function addMsg(role,html){if(history.length===0)agBody.innerHTML='';const m=document.createElement('div');m.className='ag-msg '+role;m.innerHTML=`<div class="av">${role==='user'?'나':''}</div><div class="ag-bubble">${html}</div>`;agBody.appendChild(m);agBody.scrollTop=agBody.scrollHeight;return m;}
  function typingMsg(){const m=document.createElement('div');m.className='ag-msg ai';m.innerHTML=`<div class="av"></div><div class="ag-bubble"><span class="typing"><i></i><i></i><i></i></span></div>`;agBody.appendChild(m);agBody.scrollTop=agBody.scrollHeight;return m;}
  function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function fmt(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(출처:.*?)$/m,'<span class="src">$1</span>').replace(/\n/g,'<br>');}

  const CTX=`당신은 화인파트너스 포트폴리오 관리 AI Agent입니다. 사후관리·투자회수 화면.
[현황 2026.05.27] 사후관리 24건, AUM 5,840억, 평균 실현 IRR 17.8%(목표 15.0%). 이번 달 회수 예정 82억(배당54+원금28). 회수 완료율 64.2%(누적3,750억/잔여2,090억). 현금흐름 순변동 -68억.
[긴급/주의] ①한일정밀 메자닌(FP-2024-0088): 만기14일경과, 원금80억 미회수, 담당 김파트, AI98%. ②신재생 업황둔화: REC-12%MoM, 광명에너지 등 3건 IRR재추정, AI84%. ③광명에너지 CB: 예상22%vs현재19.4%(-2.6%p), AI79%. ④대원전기 Pre-IPO: PeerP/E16.2배(+38%), Exit적기, AI91%.
[상세] 한일정밀(기계,80억,추심중). 대원전기(전력,100억,IRR20→24.3%,32%회수,김화인). 동성제약(바이오,120억,IRR13.5→14.8%,75%,김파트). 서울리츠(부동산,200억,IRR11.2→10.8%,22%,김파트). 광명에너지(신재생,80억,IRR22→19.4%,30%,김화인).
[회수스케줄] 동성제약 5/31·8/31·12/31 배당4.2억, 27.01.14 원금120억. 서울리츠 6/10·9/10 분할상환28억. 광명에너지 7/1·10/1 이자3.6억, 27.06.30 IPO회수96억. 대원전기 27.Q4 IPO(Exit검토 권고).
답변: 한국어, 3~5문장, 실무적, 숫자 근거, 마지막 줄 "출처: ..." 명시.`;

  async function send(preset){
    const q=preset||agInput.value.trim(); if(!q)return;
    if(!opened)openAgent();
    addMsg('user',esc(q)); history.push({role:'user',content:q});
    agInput.value='';agSend.disabled=true;
    const t=typingMsg();
    try{
      let a;
      if(window.claude&&window.claude.complete){
        const convo=history.slice(-6).map(h=>`${h.role==='user'?'심사역':'AI'}: ${h.content}`).join('\n');
        a=await window.claude.complete(`${CTX}\n\n[대화]\n${convo}\nAI:`);
      } else a=sim(q);
      t.remove(); a=a||sim(q); addMsg('ai',fmt(a)); history.push({role:'assistant',content:a});
    }catch(e){ t.remove(); addMsg('ai',fmt(sim(q))); }
    agSend.disabled=false; agInput.focus();
  }
  function sim(q){
    const k=q.toLowerCase();
    if(k.includes('지연')) return '현재 회수 지연은 **3건(지연 원금 142억)**입니다. 최우선은 **한일정밀 메자닌**으로 만기 14일 경과·원금 80억 미회수 상태이며(담당 김파트, AI 98%), 발행사 유동성 악화 신호가 감지되어 추심 또는 채권 재구조화 검토가 필요합니다.\n출처: ERP 회수관리, 리스크 조기경보';
    if(k.includes('회수 예정')||k.includes('입금')) return '이번 달 회수 예정은 **82억원**(배당 54억 + 원금 28억, 3건)입니다. 주요 입금일은 5/31 동성제약 배당 4.2억, 6/10 서울리츠 분할상환 28억입니다. 투자 집행 150억(우진기전)으로 순 현금은 -68억이나 6월 유입으로 단기 유동성은 안정적입니다.\n출처: ERP 자금관리, 회수 스케줄';
    if(k.includes('exit')||k.includes('적기')) return 'Exit 적기 신호가 가장 강한 건은 **대원전기 Pre-IPO**입니다. Peer P/E가 16.2배로 전환가 대비 +38% 상승했고(AI 91%), IPO 예정일(2027.Q4)까지 18개월 남았으나 구리 가격 고점 리스크 전 조기 Exit이 권고됩니다.\n출처: 시장 데이터(Bloomberg), Exit 시그널 엔진';
    if(k.includes('리스크')||k.includes('전체')) return '긴급도 순 요약: **①한일정밀**(긴급, 만기경과 80억, 추심 검토) **②신재생 업황 둔화**(주의, REC -12%, 3건 IRR 재추정) **③광명에너지**(주의, IRR 19.4%로 -2.6%p) **④대원전기**(모니터링, Exit 적기). 즉시 조치 필요 건은 한일정밀입니다.\n출처: 리스크 조기경보, ERP';
    return '포트폴리오는 24건·AUM 5,840억, 평균 실현 IRR 17.8%입니다. 회수 지연/Exit 적기/현금흐름 등 구체적 항목을 지정해 주시면 근거와 함께 답변드리겠습니다.\n출처: ERP 포트폴리오 관리';
  }
  agSend.addEventListener('click',()=>send());
  agInput.addEventListener('keydown',e=>{if(e.key==='Enter')send();});

  /* ===== WHY MODAL ===== */
  const overlay=document.getElementById('whyOverlay');
  const WHY={
    cashflow:{title:'현금흐름 분석 근거',sub:'2026.05.27 09:42 기준 · ERP 자금관리',lines:[['회수 예정','82억 (배당 54 + 원금 28)'],['집행 예정','150억 (우진기전 PEF)'],['순 변동','-68억'],['기준금리','3.00% (한국은행, 동결)']],note:'순 현금 -68억이나 6월 서울리츠 분할상환(28억)·동성제약 배당(4.2억) 유입 예정으로 단기 유동성 안정적. 금리 동결로 조달 비용 변동 없음.'},
    kpi:{title:'포트폴리오 KPI 산정 근거',sub:'XIRR 실현 현금흐름 기준',lines:[['사후관리 AUM','5,840억 (24건)'],['평균 실현 IRR','17.8% (목표 15.0%, +2.8%p)'],['회수 완료율','64.2% (누적 3,750억)'],['지연 건수','3건 (지연 원금 142억)']],note:'IRR은 한국거래소·Bloomberg 시세와 ERP 실현 현금흐름으로 XIRR 산정. 지연 건수 증가(2→3건)는 한일정밀 만기 경과 반영.'},
    risk_hanil:{title:'한일정밀 리스크 근거',sub:'AI 신뢰도 98%',lines:[['상품','메자닌 (FP-2024-0088)'],['원금','80억 (미회수)'],['만기','2024.05.13 (14일 경과)'],['담당','김파트']],note:'발행사 현금흐름 ERP 연동 결과 단기 유동성 악화 신호 감지. 유사 사례(한일변전) 대비 회수 난이도 높음. 추심 절차 또는 채권 재구조화 검토 권고.'},
    risk_rec:{title:'신재생 업황 둔화 근거',sub:'AI 신뢰도 84%',lines:[['REC 가격','-12% MoM'],['영향 딜','3건 (광명에너지 외)'],['조치','IRR 재추정 검토']],note:'REC 현물 가격 급락으로 신재생 포트폴리오 수익성 하방 압력. 광명에너지 등 3건 IRR 재추정 필요.'},
    risk_gm:{title:'광명에너지 IRR 하회 근거',sub:'AI 신뢰도 79%',lines:[['예상 IRR','22.0%'],['현재 IRR','19.4% (-2.6%p)'],['진행','30% (배당 1회)']],note:'신재생 업황 둔화 직접 영향. 업황 지속 시 추가 하락 가능. Exit 시점 재검토 권고.'},
    exit_dw:{title:'대원전기 Exit 적기 근거',sub:'AI 신뢰도 91%',lines:[['Peer P/E','16.2배 (전환가 +38%)'],['현재 IRR','24.3% (+4.3%p)'],['IPO 예정','2027.Q4'],['담당','김화인']],note:'Peer 밸류 고점 + 구리 가격 고점 리스크 사전 회피 차원에서 IPO 18개월 전 조기 Exit 검토 권고. 현재 매각 시 IRR 24%대 확정 가능.'},
  };
  function openWhy(id){const w=WHY[id];if(!w)return;document.getElementById('whyTitle').textContent=w.title;document.getElementById('whySub').textContent=w.sub;document.getElementById('whyBody').innerHTML=`<div class="why-sec"><div class="why-sec-t">핵심 데이터</div>${w.lines.map(l=>`<div class="why-line"><span class="k">${l[0]}</span><span class="v">${l[1]}</span></div>`).join('')}</div><div class="why-sec"><div class="why-sec-t">AI 해석</div><div class="why-note">${w.note}</div></div>`;overlay.style.transition='';overlay.style.opacity='';overlay.classList.add('open');clearTimeout(overlay._ftf);overlay._ftf=setTimeout(()=>{overlay.style.transition='none';overlay.style.opacity='1';overlay.style.pointerEvents='auto';const m=overlay.querySelector('.why-modal');if(m){m.style.transition='none';m.style.transform='none';}},300);}
  function closeWhy(){overlay.classList.remove('open');clearTimeout(overlay._ftf);overlay._ftf=setTimeout(()=>{overlay.style.transition='none';overlay.style.opacity='0';overlay.style.pointerEvents='none';const m=overlay.querySelector('.why-modal');if(m)m.style.transition='';},300);}
  document.getElementById('whyClose').addEventListener('click',closeWhy);
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeWhy();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeWhy();closeAgent();}});

  /* ===== WIRE ===== */
  document.querySelectorAll('[data-chip]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openAgent();setTimeout(()=>send(el.dataset.chip),120);}));
  document.querySelectorAll('[data-why]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openWhy(el.dataset.why);}));
  document.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>openAgent()));
  document.querySelectorAll('[data-toast]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();toast(el.dataset.toast);}));
  document.querySelectorAll('.btn-grp button').forEach((b,_,arr)=>b.addEventListener('click',()=>{arr.forEach(x=>x.classList.remove('on'));b.classList.add('on');}));
  document.querySelectorAll('.ptbl tbody tr').forEach(tr=>tr.addEventListener('click',()=>toast('Deal 상세 (프로토타입)')));
})();
