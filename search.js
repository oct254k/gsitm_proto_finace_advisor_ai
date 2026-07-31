/* ============================================================
   지식 검색 (RAG / Vector DB) — 화인 DATA 인덱스 D-01 ~ D-06
   · 브라우저 안에서 실제로 벡터 인덱스를 만들고 코사인 유사도로 검색한다.
   · 코퍼스(kb.js)는 화인_DATA_샘플자료 원본에서 추출한 청크.
   ============================================================ */
(function () {
  renderSidebar('ksearch');

  const KB = window.KB || { folders: [], docs: [] };
  const FOLDERS = KB.folders;
  const DOCS = KB.docs;
  const FMAP = {};
  FOLDERS.forEach(f => FMAP[f.id] = f);

  const FCOL = {
    'D-01': '#64748b', 'D-02': '#0d8276', 'D-03-01': '#3a4fc4', 'D-03-02': '#6d4fd6',
    'D-04': '#ed7d2b', 'D-05-01': '#2563eb', 'D-05-02': '#16a34a', 'D-06': '#e0457f',
    'ROOT': '#94a3b8'
  };
  const BADGE = {
    'D-01': 'gray', 'D-02': 'green', 'D-03-01': 'indigo', 'D-03-02': 'indigo',
    'D-04': 'orange', 'D-05-01': 'blue', 'D-05-02': 'green', 'D-06': 'red', 'ROOT': 'gray'
  };

  const SUGGESTIONS = [
    '기준가격이 하락한 사유가 뭐야?',
    '케이알이앤씨 Buy-out 투자심의 결과',
    '메자닌 운용전략과 자산배분 비중',
    '직무전결 규정상 투자 결재권자',
    'ERP 투자관리 메뉴 구조',
    '실사에서 발견된 리스크와 대응방안',
    '유사한 사모펀드 제안서 찾아줘'
  ];

  /* ==========================================================
     1. 토크나이저 — 한글 2·3-gram + 라틴 단어 + 숫자
     ========================================================== */
  function tokenize(s) {
    const out = [];
    s = (s || '').toLowerCase();
    (s.match(/[a-z][a-z0-9_]{1,}/g) || []).forEach(w => out.push(w));
    (s.match(/\d{2,}/g) || []).forEach(w => out.push('#' + w));
    const runs = s.match(/[가-힣]+|[一-鿿]+/g) || [];
    for (const r of runs) {
      if (r.length === 1) { out.push(r); continue; }
      for (let i = 0; i <= r.length - 2; i++) out.push(r.slice(i, i + 2));
      for (let i = 0; i <= r.length - 3; i++) out.push(r.slice(i, i + 3));
    }
    return out;
  }

  function counts(toks) {
    const m = new Map();
    for (const t of toks) m.set(t, (m.get(t) || 0) + 1);
    return m;
  }

  /* ==========================================================
     2. 인덱스 — TF-IDF 희소벡터 + L2 정규화 (= 임베딩 역할)
     ========================================================== */
  let CHUNKS = [], IDF = new Map(), AVGDL = 0, DOCVEC = [], TITLEVEC = [], INDEX_MS = 0;

  function buildIndex() {
    const t0 = performance.now();
    CHUNKS = [];
    DOCS.forEach(d => (d.c || []).forEach((c, i) => {
      CHUNKS.push({ di: d.id, ci: i, p: c.p, sh: c.s || '', t: c.t, tf: counts(tokenize(c.t)) });
    }));
    const N = CHUNKS.length || 1;
    const df = new Map();
    CHUNKS.forEach(ch => ch.tf.forEach((_, term) => df.set(term, (df.get(term) || 0) + 1)));
    IDF = new Map();
    df.forEach((v, term) => IDF.set(term, Math.log(1 + N / (1 + v))));
    let total = 0;
    CHUNKS.forEach(ch => {
      let len = 0; ch.tf.forEach(v => len += v);
      ch.len = len; total += len;
      ch.vec = weight(ch.tf);
    });
    AVGDL = total / N;

    TITLEVEC = []; DOCVEC = [];
    DOCS.forEach(d => {
      const f = FMAP[d.f] || {};
      const title = [d.n, f.label, f.cat, f.item, f.inc, f.note].filter(Boolean).join(' ');
      TITLEVEC[d.id] = weight(counts(tokenize(title)));
      // 문서 벡터 = 청크 벡터 합 + 제목 벡터 (centroid)
      const acc = new Map();
      CHUNKS.filter(c => c.di === d.id).forEach(c => c.vec.forEach((v, k) => acc.set(k, (acc.get(k) || 0) + v)));
      TITLEVEC[d.id].forEach((v, k) => acc.set(k, (acc.get(k) || 0) + v * 1.4));
      DOCVEC[d.id] = norm(acc);
    });
    INDEX_MS = performance.now() - t0;
    return INDEX_MS;
  }

  function weight(tfMap) {
    const v = new Map();
    tfMap.forEach((c, term) => {
      const idf = IDF.has(term) ? IDF.get(term) : Math.log(1 + (CHUNKS.length || 1) / 2);
      v.set(term, (1 + Math.log(c)) * idf);
    });
    return norm(v);
  }

  function norm(v) {
    let s = 0; v.forEach(x => s += x * x);
    s = Math.sqrt(s) || 1;
    const o = new Map();
    v.forEach((x, k) => o.set(k, x / s));
    return o;
  }

  function cosine(a, b) {
    if (!a || !b) return 0;
    let small = a, big = b;
    if (a.size > b.size) { small = b; big = a; }
    let s = 0;
    small.forEach((x, k) => { const y = big.get(k); if (y) s += x * y; });
    return s;
  }

  function bm25(qTf, ch, k1, b) {
    k1 = k1 || 1.2; b = b || 0.72;
    let s = 0;
    qTf.forEach((_, term) => {
      const f = ch.tf.get(term);
      if (!f) return;
      const idf = IDF.get(term) || 0;
      s += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * ch.len / (AVGDL || 1)));
    });
    return s;
  }

  /* ==========================================================
     3. 검색
     ========================================================== */
  const MODE_W = {
    hybrid: { cos: 0.58, bm: 0.27, ttl: 0.15 },
    vector: { cos: 0.86, bm: 0.00, ttl: 0.14 },
    keyword: { cos: 0.10, bm: 0.76, ttl: 0.14 }
  };

  function runSearch(q, state) {
    const t0 = performance.now();
    const qToks = tokenize(q);
    if (!qToks.length) return null;
    const qTf = counts(qToks);
    const qv = weight(qTf);
    const w = MODE_W[state.mode] || MODE_W.hybrid;

    const pool = CHUNKS.filter(ch => {
      const d = DOCS[ch.di];
      if (state.folder !== 'all' && d.f !== state.folder) return false;
      if (state.ext !== 'all' && d.e !== state.ext) return false;
      return true;
    });

    let maxBm = 0;
    const raw = pool.map(ch => {
      const cos = cosine(qv, ch.vec);
      const bm = bm25(qTf, ch);
      if (bm > maxBm) maxBm = bm;
      const ttl = cosine(qv, TITLEVEC[ch.di]);
      return { ch, cos, bm, ttl };
    });
    raw.forEach(r => {
      r.score = w.cos * r.cos + w.bm * (maxBm ? r.bm / maxBm : 0) + w.ttl * r.ttl;
    });
    raw.sort((a, b) => b.score - a.score);

    // 문서 단위로 집계 — 최고 청크 + 나머지 청크 보너스
    const byDoc = new Map();
    raw.forEach(r => {
      if (r.score <= 0.0001) return;
      const cur = byDoc.get(r.ch.di);
      if (!cur) byDoc.set(r.ch.di, { di: r.ch.di, best: r, hits: [r], sum: r.score });
      else { cur.hits.push(r); cur.sum += r.score; }
    });
    const docs = [...byDoc.values()].map(d => {
      d.score = d.best.score + 0.14 * Math.min(1, (d.sum - d.best.score) / (d.best.score + 1e-6));
      d.hits.sort((a, b) => b.score - a.score);
      return d;
    }).sort((a, b) => b.score - a.score);

    const top = docs.length ? docs[0].score : 0;
    // Top-K를 넓게 잡으면 관련도 컷오프도 함께 완화한다
    const cut = state.topk >= 20 ? 0.18 : state.topk <= 5 ? 0.42 : 0.32;
    const kept = docs.filter(d => d.score >= top * cut && d.best.cos > 0.012).slice(0, state.topk);
    kept.forEach(d => { d.rel = top ? Math.max(0.08, d.score / top) : 0; });

    return {
      q, qv, took: performance.now() - t0, scanned: pool.length,
      docs: kept, allDocs: docs, chunkHits: raw.filter(r => r.cos > 0.02).length
    };
  }

  /* 문서 간 최근접 이웃 (벡터 유사도) */
  function neighbors(di, k) {
    return DOCS.filter(d => d.id !== di)
      .map(d => ({ d, s: cosine(DOCVEC[di], DOCVEC[d.id]) }))
      .sort((a, b) => b.s - a.s).slice(0, k || 5);
  }

  /* ==========================================================
     4. 2D 투영 (random projection) — 벡터 공간 미니맵
     ========================================================== */
  function fnv(str, seed) {
    let h = seed >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  }
  function project(vec) {
    let x = 0, y = 0;
    vec.forEach((w, t) => {
      x += w * (fnv(t, 2166136261) * 2 - 1);
      y += w * (fnv(t, 40389) * 2 - 1);
    });
    return [x, y];
  }
  let PROJ = null;
  function buildProjection() {
    const pts = DOCS.map(d => { const p = project(DOCVEC[d.id]); return { di: d.id, x: p[0], y: p[1] }; });
    const mean = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
    const sd = (a, m) => Math.sqrt(mean(a.map(v => (v - m) * (v - m)))) || 1;
    const mx = mean(pts.map(p => p.x)), my = mean(pts.map(p => p.y));
    const sx = sd(pts.map(p => p.x), mx), sy = sd(pts.map(p => p.y), my);
    PROJ = { pts, mx, my, sx, sy };
    pts.forEach(p => { p.zx = (p.x - mx) / sx; p.zy = (p.y - my) / sy; });
    return PROJ;
  }
  function toXY(zx, zy) {
    const W = 300, H = 186, pad = 16;
    const cl = v => Math.max(-2.4, Math.min(2.4, v));
    return [pad + (cl(zx) + 2.4) / 4.8 * (W - pad * 2), pad + (cl(zy) + 2.4) / 4.8 * (H - pad * 2)];
  }

  /* ==========================================================
     5. 유틸 — 하이라이트 / 스니펫 / 아이콘
     ========================================================== */
  const esc = s => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function queryTerms(q) {
    const full = (q.match(/[가-힣]{2,}|[a-zA-Z][a-zA-Z0-9]{1,}|\d{2,}/g) || []);
    const grams = [];
    full.forEach(r => {
      if (/^[가-힣]+$/.test(r) && r.length >= 3) {
        for (let i = 0; i <= r.length - 2; i++) grams.push(r.slice(i, i + 2));
      }
    });
    return { full: [...new Set(full)].sort((a, b) => b.length - a.length), grams: [...new Set(grams)] };
  }

  function highlight(text, qt) {
    const t = esc(text);
    if (!qt.full.length) return t;
    const build = arr => new RegExp('(' + arr.map(rex).join('|') + ')', 'gi');
    let re = build(qt.full);
    if (!re.test(t) && qt.grams.length) re = build(qt.full.concat(qt.grams));
    re.lastIndex = 0;
    return t.replace(re, '<mark>$1</mark>');
  }

  function snippet(text, qt, max) {
    max = max || 230;
    if (text.length <= max) return text;
    let pos = -1;
    for (const term of qt.full.concat(qt.grams)) {
      const i = text.indexOf(term);
      if (i >= 0) { pos = i; break; }
    }
    if (pos < 0) return text.slice(0, max) + '…';
    const start = Math.max(0, pos - Math.floor(max * 0.35));
    return (start > 0 ? '…' : '') + text.slice(start, start + max) + (start + max < text.length ? '…' : '');
  }

  function bestSentence(text, qt) {
    const parts = text.split(/(?<=[.。!?])\s+|(?<=니다)\s+|(?<=음)\s+/).filter(s => s.length > 18);
    if (!parts.length) return text.slice(0, 150);
    let best = parts[0], bs = -1;
    parts.forEach(p => {
      let s = 0;
      qt.full.concat(qt.grams).forEach(t => { if (p.indexOf(t) >= 0) s += t.length; });
      if (s > bs) { bs = s; best = p; }
    });
    return best.length > 190 ? best.slice(0, 190) + '…' : best;
  }

  const EXT_LBL = { pdf: 'PDF', xlsx: 'XLS', txt: 'TXT', docx: 'DOC' };
  function fileTag(e) { return '<span class="ft ft-' + e + '">' + (EXT_LBL[e] || e.toUpperCase()) + '</span>'; }
  function docPath(d) {
    const f = FMAP[d.f];
    return '화인_DATA_샘플자료/' + (f && f.dir ? f.dir + '/' : '') + d.n;
  }
  const ICO = {
    search: '<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M20 20l-3.4-3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" fill="currentColor"/>',
    folder: '<path d="M3 7a2 2 0 012-2h4l2 2.4h8a2 2 0 012 2V18a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linejoin="round"/>',
    cube: '<path d="M12 2.6l8.2 4.7v9.4L12 21.4 3.8 16.7V7.3z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M3.8 7.3L12 12l8.2-4.7M12 12v9.4" stroke="currentColor" stroke-width="1.5" fill="none"/>',
    chunk: '<rect x="3.5" y="4" width="17" height="5" rx="1.6" stroke="currentColor" stroke-width="1.6" fill="none"/><rect x="3.5" y="11" width="17" height="4" rx="1.4" stroke="currentColor" stroke-width="1.5" fill="none" opacity=".6"/><rect x="3.5" y="17" width="11" height="3.4" rx="1.2" stroke="currentColor" stroke-width="1.5" fill="none" opacity=".4"/>',
    bolt: '<path d="M13 2L5 13h5l-1 9 8-11h-5z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
    doc: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M14 3v5h5" stroke="currentColor" stroke-width="1.6" fill="none"/>',
    clock: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 7.5V12l3 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    chev: '<path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    x: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    refresh: '<path d="M20 11a8 8 0 10-2.3 6M20 5v6h-6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  const svg = (n, sz) => '<svg width="' + (sz || 16) + '" height="' + (sz || 16) + '" viewBox="0 0 24 24" fill="none">' + ICO[n] + '</svg>';

  /* ==========================================================
     6. 상태
     ========================================================== */
  const state = {
    q: '', mode: 'hybrid', folder: 'all', ext: 'all', topk: 10,
    result: null, recent: JSON.parse(localStorage.getItem('fp_ks_recent') || '[]')
  };

  const totalChunks = () => DOCS.reduce((s, d) => s + (d.c ? d.c.length : 0), 0);
  const totalKb = () => DOCS.reduce((s, d) => s + d.kb, 0);
  const totalPages = () => DOCS.filter(d => d.e === 'pdf').reduce((s, d) => s + d.pg, 0);

  buildIndex();
  buildProjection();

  /* ==========================================================
     7. 화면 구성
     ========================================================== */
  const cnt = document.getElementById('cnt');

  function shellHtml() {
    return `
    <div class="page-h reveal">
      <div>
        <h1>지식 검색 <span style="font-size:14px;font-weight:600;color:var(--t4);letter-spacing:-.2px">RAG · Vector Search</span></h1>
        <div class="sub">화인 DATA 인덱스 <b>D-01 ~ D-06</b> · 경영 · 지식 · 대체투자 · 자금투자 문서를 임베딩해 의미 기반으로 검색합니다</div>
      </div>
      <div class="page-h-actions">
        <button class="btn" id="ksReindex">${svg('refresh')}재색인</button>
        <button class="btn primary" id="ksAgent">${svg('spark')}AI Agent로 이어보기</button>
      </div>
    </div>

    <div class="ks-hero reveal d1">
      <div class="ks-hero-top">
        <span class="ks-hero-tag">${svg('cube', 13)} Vector DB</span>
        <span class="ks-hero-tag">RAG Pipeline</span>
        <span class="ks-hero-desc">문서 <b class="num">${DOCS.length}</b>건 · 청크 <b class="num">${totalChunks()}</b>개 · 색인 완료</span>
        <div class="ks-hero-spacer"></div>
        <div class="ks-seg" id="ksMode" style="background:rgba(255,255,255,.16)">
          <button data-mode="hybrid" class="active">하이브리드</button>
          <button data-mode="vector">벡터</button>
          <button data-mode="keyword">키워드</button>
        </div>
      </div>
      <div class="ks-searchbar">
        ${svg('search', 20)}
        <input id="ksInput" placeholder="자연어로 물어보세요 — 예) 기준가격이 하락한 사유가 뭐야?" autocomplete="off">
        <button class="ks-clear" id="ksClear" title="지우기">${svg('x', 15)}</button>
        <button class="ks-go" id="ksGo">${svg('spark', 15)}검색</button>
      </div>
      <div class="ks-hero-foot">
        <span class="ks-hint">추천 질의</span>
        ${SUGGESTIONS.map(s => `<button class="ks-sugg" data-q="${esc(s)}">${esc(s)}</button>`).join('')}
      </div>
    </div>

    <div class="ks-pipe reveal d2" id="ksPipe"></div>

    <div class="ks-controls reveal d2">
      <span class="ks-ctl-label">데이터 분류</span>
      <div class="ks-chips" id="ksFolders"></div>
    </div>
    <div class="ks-controls reveal d3">
      <span class="ks-ctl-label">파일 형식</span>
      <div class="ks-chips" id="ksExts"></div>
      <div class="ks-spacer"></div>
      <span class="ks-ctl-label">Top-K</span>
      <div class="ks-seg" id="ksTopk">
        <button data-k="5">5</button><button data-k="10" class="active">10</button><button data-k="20">20</button>
      </div>
    </div>

    <div class="ks-grid">
      <div id="ksLeft" style="display:flex;flex-direction:column;gap:16px;min-width:0"></div>
      <div class="ks-rail" id="ksRail"></div>
    </div>`;
  }

  function pipeHtml(r) {
    const steps = [
      ['chunk', '문서 청킹', DOCS.length + '문서 → ' + totalChunks() + '청크', false],
      ['cube', '임베딩 · 색인', IDF.size.toLocaleString() + '차원 · ' + INDEX_MS.toFixed(0) + 'ms', false],
      ['search', '벡터 검색', r ? r.scanned + '청크 스캔 · ' + r.took.toFixed(1) + 'ms' : '대기 중', !!r],
      ['spark', '근거 기반 답변', r ? '근거 ' + Math.min(3, r.docs.length) + '건 인용' : '대기 중', !!r]
    ];
    return steps.map((s, i) =>
      `<div class="ks-pipe-step">
        <div class="ks-pipe-ico${s[3] ? ' g' : ''}">${svg(s[0], 15)}</div>
        <div><div class="ks-pipe-t">${s[1]}</div><div class="ks-pipe-s">${s[2]}</div></div>
      </div>` + (i < steps.length - 1 ? `<span class="ks-pipe-arrow">${svg('chev', 14)}</span>` : '')
    ).join('') + `<div class="ks-pipe-note">코사인 유사도 · TF-IDF 희소벡터 (프로토타입 · 브라우저 내 연산)</div>`;
  }

  function folderChips() {
    const hits = {};
    if (state.result) state.result.allDocs.forEach(d => { const f = DOCS[d.di].f; hits[f] = (hits[f] || 0) + 1; });
    const all = `<button class="ks-chip${state.folder === 'all' ? ' active' : ''}" data-f="all">전체<span class="n">${DOCS.length}</span></button>`;
    return all + FOLDERS.filter(f => f.docs > 0).map(f =>
      `<button class="ks-chip${state.folder === f.id ? ' active' : ''}" data-f="${f.id}" title="${esc(f.item)}">
        <span class="swatch" style="background:${FCOL[f.id]}"></span>${esc(f.id)} ${esc(f.label)}<span class="n">${f.docs}</span>
      </button>`).join('');
  }

  function extChips() {
    const c = { pdf: 0, xlsx: 0, txt: 0 };
    DOCS.forEach(d => c[d.e] = (c[d.e] || 0) + 1);
    const items = [['all', '전체', DOCS.length], ['pdf', 'PDF', c.pdf], ['xlsx', 'Excel', c.xlsx], ['txt', 'Text', c.txt]];
    return items.map(i => `<button class="ks-chip${state.ext === i[0] ? ' active' : ''}" data-e="${i[0]}">${i[1]}<span class="n">${i[2]}</span></button>`).join('');
  }

  /* ---------- 결과 카드 ---------- */
  function resultCard(d, i, qt) {
    const doc = DOCS[d.di];
    const f = FMAP[doc.f];
    const pct = Math.round(d.rel * 97);
    const C = 2 * Math.PI * 19;
    const best = d.best;
    const sn = snippet(best.ch.t, qt);
    const more = d.hits.length - 1;
    return `
    <div class="ks-card reveal" data-doc="${doc.id}">
      <div class="ks-score">
        <div class="ks-ring">
          <svg width="46" height="46" viewBox="0 0 46 46">
            <circle cx="23" cy="23" r="19" fill="none" stroke="#edeff5" stroke-width="4.5"/>
            <circle cx="23" cy="23" r="19" fill="none" stroke="${i === 0 ? '#344acb' : '#8b96e6'}" stroke-width="4.5"
              stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}"
              style="transition:stroke-dashoffset .8s cubic-bezier(.2,.7,.3,1)"/>
          </svg>
          <div class="v">${pct}</div>
        </div>
        <div class="ks-rank">#${i + 1}</div>
      </div>
      <div class="ks-main">
        <div class="ks-title">${fileTag(doc.e)}<span>${highlight(doc.n, qt)}</span></div>
        <div class="ks-meta">
          <span class="badge ${BADGE[doc.f]}">${doc.f} ${esc(f.label)}</span>
          <span class="ks-path">${svg('folder', 12)} ${esc(f.dir || '/')}</span>
          <span class="dot-sep"></span>
          <span class="num">${doc.e === 'pdf' ? doc.pg + 'p' : doc.e === 'xlsx' ? doc.pg + ' sheet' : doc.pg + ' lines'}</span>
          <span class="dot-sep"></span>
          <span class="num">${doc.kb.toLocaleString()} KB</span>
          <span class="dot-sep"></span>
          <span class="num">cos ${best.cos.toFixed(3)}</span>
          ${state.mode !== 'vector' ? `<span class="dot-sep"></span><span class="num">bm25 ${best.bm.toFixed(2)}</span>` : ''}
        </div>
        <div class="ks-snip"><span class="pg">${doc.e === 'xlsx' && best.ch.sh ? esc(best.ch.sh) : 'p.' + best.ch.p}</span>${highlight(sn, qt)}</div>
        ${more > 0 ? `<div class="ks-more-chunks">${svg('chunk', 13)} 같은 문서에서 ${more}개 청크가 더 매칭됨 · 클릭하면 전체 근거 보기</div>` : ''}
        <div class="ks-bar"><i style="width:${pct}%"></i></div>
      </div>
    </div>`;
  }

  /* ---------- AI 답변 ---------- */
  function answerHtml(r, qt) {
    if (!r.docs.length) return '';
    const top = r.docs[0], topDoc = DOCS[top.di];
    const fLabels = [...new Set(r.docs.slice(0, 4).map(d => DOCS[d.di].f))];
    const key = bestSentence(top.best.ch.t, qt);
    const conf = Math.round(Math.min(96, 42 + top.best.cos * 130 + Math.min(r.docs.length, 5) * 3));
    const ev = r.docs.slice(0, 3);
    const lead =
      `<b>${esc(r.q)}</b> — ${fLabels.map(f => f).join(' · ')} 인덱스에서 문서 <b>${r.docs.length}건</b>, 근접 청크 <b>${r.chunkHits}개</b>를 찾았어요. ` +
      `가장 근접한 근거는 <b>${esc(topDoc.n)}</b> ${topDoc.e === 'pdf' ? '(p.' + top.best.ch.p + ')' : ''} 입니다. ` +
      `해당 문단의 핵심 문장은 다음과 같습니다 — “${esc(key)}”`;
    return `
    <div class="ks-ans reveal">
      <div class="ks-ans-h">
        <div class="ks-ans-ava"></div>
        <div style="flex:1;min-width:0">
          <div class="nm">AI 근거 요약 <span class="badge indigo">RAG · 근거 ${ev.length}건</span></div>
          <div class="sb">검색된 원문 청크만 사용 · 인덱스 D-01~D-06 · ${r.took.toFixed(1)}ms</div>
        </div>
        <button class="ks-toolbtn" id="ksCopyAns">복사</button>
      </div>
      <div class="ks-ans-body">
        <div class="ks-ans-lead" id="ksLead" data-full="${esc(lead)}"></div>
        <div class="ks-ev">
          ${ev.map((d, i) => {
            const doc = DOCS[d.di];
            return `<div class="ks-ev-item" data-doc="${doc.id}">
              <div class="ks-cite">${i + 1}</div>
              <div class="ks-ev-txt">
                <div class="ks-ev-q">${highlight(snippet(d.best.ch.t, qt, 175), qt)}</div>
                <div class="ks-ev-m">
                  <span class="fn">${esc(doc.n)}</span>
                  <span class="dot-sep"></span><span class="num">${doc.e === 'xlsx' && d.best.ch.sh ? esc(d.best.ch.sh) : 'p.' + d.best.ch.p}</span>
                  <span class="dot-sep"></span><span class="badge ${BADGE[doc.f]}" style="height:18px;font-size:10px">${doc.f}</span>
                  <span class="dot-sep"></span><span class="num">유사도 ${(d.best.cos).toFixed(3)}</span>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="ks-ans-foot">
        <span class="conf">근거 신뢰도 <span class="ks-conf-bar"><i style="width:${conf}%"></i></span> <span class="num">${conf}%</span></span>
        <span class="dot-sep"></span>
        <span>원문 청크에서 추출·요약 (프로토타입) · 운영 환경에서는 사내 LLM이 동일 근거로 문장을 생성합니다</span>
      </div>
    </div>`;
  }

  /* ---------- 폴더 브라우저 (검색 전 기본 화면) ---------- */
  function folderBrowser() {
    const list = FOLDERS.filter(f => f.docs > 0);
    return `
    <div class="card reveal">
      <div class="card-h bordered">
        <h3>데이터 인덱스 ${svg('folder', 17)}</h3>
        <span class="sub">화인파트너스 AI 플랫폼 아키텍처 · DATA Index 기준 · 폴더를 클릭하면 해당 분류로 검색 범위가 좁혀집니다</span>
      </div>
      <div class="card-body">
        <div class="ks-fold-grid">
          ${list.map(f => {
            const docs = DOCS.filter(d => d.f === f.id);
            const ch = docs.reduce((s, d) => s + d.c.length, 0);
            return `<div class="ks-fold" data-f="${f.id}">
              <div class="ks-fold-h">
                <div class="ks-fold-ico" style="background:${FCOL[f.id]}">${svg('folder', 18)}</div>
                <div style="min-width:0">
                  <div class="ks-fold-id">${f.id}</div>
                  <div class="ks-fold-nm">${esc(f.label)}</div>
                </div>
              </div>
              <div class="ks-fold-desc">${esc(f.item)}</div>
              <div class="ks-fold-stats">
                <span class="badge ${BADGE[f.id]}">${f.docs}개 문서</span>
                <span class="tag">${ch} 청크</span>
                <span class="tag">${esc(f.fmt)}</span>
                <span class="tag">${esc(f.struct)}</span>
              </div>
              <div class="ks-fold-files">
                ${docs.slice(0, 3).map(d => `<div class="ks-fold-file"><span class="d"></span>${esc(d.n)}</div>`).join('')}
                ${docs.length > 3 ? `<div class="ks-fold-file" style="color:var(--t4)"><span class="d"></span>외 ${docs.length - 3}건</div>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="card reveal d1">
      <div class="card-h bordered">
        <h3>색인된 문서 <span style="font-weight:500;color:var(--t4);font-size:13px">${filteredDocs().length}건</span></h3>
        <span class="sub">클릭 시 문서 상세 · 청크 · 유사 문서 확인</span>
      </div>
      <div class="card-body flush">
        ${filteredDocs().map(d => {
          const f = FMAP[d.f];
          return `<div class="lrow" data-doc="${d.id}">
            ${fileTag(d.e)}
            <div class="l-main">
              <div class="l-t">${esc(d.n)}</div>
              <div class="l-s">
                <span class="badge ${BADGE[d.f]}" style="height:19px;font-size:10.5px">${d.f}</span>
                <span>${esc(f.dir || '루트')}</span><span class="dot-sep"></span>
                <span class="num">${d.e === 'pdf' ? d.pg + ' pages' : d.e === 'xlsx' ? d.pg + ' sheets' : d.pg + ' lines'}</span>
                <span class="dot-sep"></span><span class="num">${d.c.length} 청크</span>
                <span class="dot-sep"></span><span class="num">${d.kb.toLocaleString()} KB</span>
                <span class="dot-sep"></span><span class="num">${d.d}</span>
              </div>
            </div>
            <span style="color:var(--t4)">${svg('chev', 16)}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  function filteredDocs() {
    return DOCS.filter(d => (state.folder === 'all' || d.f === state.folder) && (state.ext === 'all' || d.e === state.ext));
  }

  /* ---------- 우측 레일 ---------- */
  function railHtml() {
    const r = state.result;
    const hitDocs = new Set(r ? r.docs.map(d => d.di) : []);
    const maxDocs = Math.max(...FOLDERS.map(f => f.docs));
    const hitByF = {};
    if (r) r.docs.forEach(d => { const f = DOCS[d.di].f; hitByF[f] = (hitByF[f] || 0) + 1; });

    const qp = r ? project(r.qv) : null;
    const qz = qp ? [(qp[0] - PROJ.mx) / PROJ.sx, (qp[1] - PROJ.my) / PROJ.sy] : null;
    const qxy = qz ? toXY(qz[0], qz[1]) : null;

    return `
    <div class="ks-rc reveal">
      <div class="ks-rc-h"><h4>${svg('cube', 15)} 벡터 공간</h4><span class="s">${DOCS.length} docs · 2D 투영</span></div>
      <div class="ks-rc-b">
        <div class="ks-map">
          <svg viewBox="0 0 300 186">
            <defs>
              <pattern id="ksGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M30 0H0v30" fill="none" stroke="#e9ecf4" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="300" height="186" fill="url(#ksGrid)"/>
            ${qxy ? r.docs.slice(0, 3).map(d => {
              const p = PROJ.pts.find(p => p.di === d.di); const xy = toXY(p.zx, p.zy);
              return `<line x1="${qxy[0].toFixed(1)}" y1="${qxy[1].toFixed(1)}" x2="${xy[0].toFixed(1)}" y2="${xy[1].toFixed(1)}"
                stroke="#344acb" stroke-width="1" stroke-dasharray="3 3" opacity=".45"/>`;
            }).join('') : ''}
            ${PROJ.pts.map(p => {
              const d = DOCS[p.di], xy = toXY(p.zx, p.zy);
              const hit = hitDocs.has(p.di);
              return `<circle cx="${xy[0].toFixed(1)}" cy="${xy[1].toFixed(1)}" r="${hit ? 5.2 : 3.4}"
                fill="${FCOL[d.f]}" opacity="${r ? (hit ? 1 : .22) : .8}">
                <title>${esc(d.n)}</title></circle>` +
                (hit ? `<circle cx="${xy[0].toFixed(1)}" cy="${xy[1].toFixed(1)}" r="8.4" fill="none" stroke="${FCOL[d.f]}" stroke-width="1.2" opacity=".55"/>` : '');
            }).join('')}
            ${qxy ? `<g><circle cx="${qxy[0].toFixed(1)}" cy="${qxy[1].toFixed(1)}" r="13" fill="#344acb" opacity=".12"/>
              <circle cx="${qxy[0].toFixed(1)}" cy="${qxy[1].toFixed(1)}" r="5.6" fill="#344acb" stroke="#fff" stroke-width="2"/>
              <text x="${(qxy[0] + 10).toFixed(1)}" y="${(qxy[1] - 8).toFixed(1)}" font-size="9" font-weight="700" fill="#2c3a9e" font-family="Inter,sans-serif">query</text></g>` : ''}
          </svg>
        </div>
        <div class="ks-map-legend">
          ${FOLDERS.filter(f => f.docs > 0).map(f => `<span class="ks-lg"><i style="background:${FCOL[f.id]}"></i>${f.id}</span>`).join('')}
        </div>
        <div class="ks-map-note">${r
          ? '질의 벡터와 가장 가까운 문서 3건을 점선으로 연결했습니다.'
          : '문서 벡터를 2차원으로 투영한 지도입니다. 검색하면 질의 위치와 근접 문서가 표시됩니다.'}</div>
      </div>
    </div>

    <div class="ks-rc reveal d1">
      <div class="ks-rc-h"><h4>${svg('chunk', 15)} 인덱스 현황</h4><span class="s">${r ? '히트 기준' : '문서 기준'}</span></div>
      <div class="ks-rc-b">
        <div class="ks-stats" style="margin-bottom:14px">
          <div class="ks-stat"><div class="l">색인 문서</div><div class="v">${DOCS.length}<small>건</small></div></div>
          <div class="ks-stat"><div class="l">임베딩 청크</div><div class="v">${totalChunks()}<small>개</small></div></div>
          <div class="ks-stat"><div class="l">어휘 차원</div><div class="v">${(IDF.size / 1000).toFixed(1)}<small>K</small></div></div>
          <div class="ks-stat"><div class="l">원본 용량</div><div class="v">${(totalKb() / 1024).toFixed(1)}<small>MB</small></div></div>
        </div>
        <div class="ks-idx">
          ${FOLDERS.filter(f => f.docs > 0).map(f => {
            const ch = DOCS.filter(d => d.f === f.id).reduce((s, d) => s + d.c.length, 0);
            const hit = hitByF[f.id] || 0;
            return `<div class="ks-idx-row" data-f="${f.id}">
              <div class="ks-idx-nm"><span class="id">${f.id}</span><span class="lb">${esc(f.label)}</span></div>
              <div class="ks-idx-v">${hit ? `<span class="hit">${hit}건 히트</span> · ` : ''}${f.docs}문서 · ${ch}청크</div>
              <div class="ks-idx-bar">
                <i style="width:${(f.docs / maxDocs * 100).toFixed(0)}%;background:${FCOL[f.id]};opacity:${r ? (hit ? 1 : .3) : .85}"></i>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="ks-rc reveal d2">
      <div class="ks-rc-h"><h4>${svg('clock', 15)} 최근 질의</h4>${state.recent.length ? '<button class="ks-toolbtn" id="ksClearRecent">비우기</button>' : ''}</div>
      <div class="ks-rc-b">
        <div class="ks-recent">
          ${state.recent.length
            ? state.recent.map(q => `<button data-q="${esc(q)}">${svg('search', 13)}<span>${esc(q)}</span></button>`).join('')
            : '<div class="empty">아직 검색 기록이 없습니다.</div>'}
        </div>
      </div>
    </div>`;
  }

  /* ==========================================================
     8. 렌더 / 이벤트
     ========================================================== */
  function renderLeft() {
    const left = document.getElementById('ksLeft');
    const r = state.result;
    if (!r) { left.innerHTML = folderBrowser(); }
    else if (!r.docs.length) {
      left.innerHTML = `<div class="ks-empty reveal">
        <div class="ico">${svg('search', 22)}</div>
        <div class="t">“${esc(r.q)}” 에 대한 근거 문서를 찾지 못했어요</div>
        <div class="s">필터를 넓히거나 다른 표현으로 질문해 보세요. 현재 인덱스는 화인_DATA_샘플자료 ${DOCS.length}건 · ${totalChunks()}청크입니다.</div>
        <button class="btn sm" id="ksReset">필터 초기화</button>
      </div>`;
    } else {
      const qt = queryTerms(r.q);
      left.innerHTML =
        answerHtml(r, qt) +
        `<div>
          <div class="ks-res-h">
            <div class="t">검색 결과 <em>${r.docs.length}</em>건</div>
            <div class="s">${r.scanned}개 청크 스캔 · ${r.took.toFixed(1)}ms · ${state.mode === 'hybrid' ? '하이브리드(벡터+BM25)' : state.mode === 'vector' ? '벡터(코사인)' : '키워드(BM25)'}</div>
          </div>
          <div class="ks-res">${r.docs.map((d, i) => resultCard(d, i, qt)).join('')}</div>
        </div>`;
      typeLead();
    }
    document.getElementById('ksPipe').innerHTML = pipeHtml(r);
    initReveal(left);
    bindLeft();
  }

  function typeLead() {
    const el = document.getElementById('ksLead');
    if (!el) return;
    const full = el.dataset.full;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.innerHTML = full; return; }
    // 태그를 깨지 않도록 텍스트 노드 단위로 조각 내어 순차 노출
    const parts = full.split(/(<[^>]+>)/).filter(Boolean);
    let out = '', pi = 0, ci = 0;
    el.innerHTML = '';
    const timer = setInterval(() => {
      if (pi >= parts.length) { clearInterval(timer); el.innerHTML = full; return; }
      const p = parts[pi];
      if (p[0] === '<') { out += p; pi++; }
      else {
        out += p.slice(ci, ci + 3); ci += 3;
        if (ci >= p.length) { pi++; ci = 0; }
      }
      el.innerHTML = out + '<span class="ks-caret"></span>';
    }, 12);
    setTimeout(() => { clearInterval(timer); el.innerHTML = full; }, 3200);
  }

  function renderRail() {
    const rail = document.getElementById('ksRail');
    rail.innerHTML = railHtml();
    initReveal(rail);
    rail.querySelectorAll('.ks-idx-row').forEach(n => n.addEventListener('click', () => setFolder(n.dataset.f)));
    rail.querySelectorAll('.ks-recent button[data-q]').forEach(n => n.addEventListener('click', () => {
      document.getElementById('ksInput').value = n.dataset.q;
      doSearch(n.dataset.q);
    }));
    const cr = document.getElementById('ksClearRecent');
    if (cr) cr.addEventListener('click', () => { state.recent = []; localStorage.setItem('fp_ks_recent', '[]'); renderRail(); });
  }

  function renderChips() {
    document.getElementById('ksFolders').innerHTML = folderChips();
    document.getElementById('ksExts').innerHTML = extChips();
    document.querySelectorAll('#ksFolders .ks-chip').forEach(n => n.addEventListener('click', () => setFolder(n.dataset.f)));
    document.querySelectorAll('#ksExts .ks-chip').forEach(n => n.addEventListener('click', () => {
      state.ext = n.dataset.e; refresh();
    }));
  }

  function setFolder(f) {
    state.folder = (state.folder === f && f !== 'all') ? 'all' : f;
    refresh();
  }

  function refresh() {
    if (state.q) state.result = runSearch(state.q, state);
    renderChips(); renderLeft(); renderRail();
  }

  function bindLeft() {
    document.querySelectorAll('[data-doc]').forEach(n =>
      n.addEventListener('click', () => openDoc(+n.dataset.doc)));
    document.querySelectorAll('.ks-fold[data-f]').forEach(n =>
      n.addEventListener('click', () => setFolder(n.dataset.f)));
    const rs = document.getElementById('ksReset');
    if (rs) rs.addEventListener('click', () => { state.folder = 'all'; state.ext = 'all'; refresh(); });
    const cp = document.getElementById('ksCopyAns');
    if (cp) cp.addEventListener('click', e => {
      e.stopPropagation();
      const el = document.getElementById('ksLead');
      const txt = (el ? el.textContent : '') + '\n\n' + (state.result ? state.result.docs.slice(0, 3)
        .map((d, i) => `[${i + 1}] ${DOCS[d.di].n} (p.${d.best.ch.p}) — ${d.best.ch.t.slice(0, 120)}…`).join('\n') : '');
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(
        () => toast('근거 요약을 클립보드에 복사했습니다'), () => toast('복사에 실패했어요'));
      else toast('이 브라우저에서는 복사를 지원하지 않아요');
    });
  }

  function doSearch(q) {
    q = (q || '').trim();
    state.q = q;
    if (!q) { state.result = null; renderChips(); renderLeft(); renderRail(); return; }
    state.result = runSearch(q, state);
    state.recent = [q].concat(state.recent.filter(x => x !== q)).slice(0, 6);
    localStorage.setItem('fp_ks_recent', JSON.stringify(state.recent));
    renderChips(); renderLeft(); renderRail();
    document.getElementById('ksClear').classList.add('on');
  }

  /* ---------- 문서 상세 드로어 ---------- */
  const drawer = document.getElementById('docDrawer');
  const scrim = document.getElementById('drawerScrim');

  function openDoc(id) {
    const d = DOCS[id];
    if (!d) return;
    const f = FMAP[d.f];
    const qt = state.q ? queryTerms(state.q) : { full: [], grams: [] };
    const qv = state.result ? state.result.qv : null;
    const chunkScores = d.c.map((c, i) => {
      const ch = CHUNKS.find(x => x.di === id && x.ci === i);
      return { c, i, s: qv && ch ? cosine(qv, ch.vec) : 0 };
    });
    const maxS = Math.max(0.0001, ...chunkScores.map(c => c.s));
    const nn = neighbors(id, 5);

    drawer.innerHTML = `
      <div class="ks-dw-h">
        <div class="tt">
          <h3>${fileTag(d.e)} ${esc(d.n)}</h3>
          <div class="p">${esc(docPath(d))}</div>
        </div>
        <button class="ks-dw-close" id="ksDwClose">${svg('x', 16)}</button>
      </div>
      <div class="ks-dw-b">
        <div class="ks-dw-sec">
          <div class="h">문서 메타</div>
          <dl class="ks-kv">
            <dt>데이터 분류</dt><dd><span class="badge ${BADGE[d.f]}">${d.f}</span> ${esc(f.cat)}</dd>
            <dt>데이터 항목</dt><dd>${esc(f.item)}</dd>
            <dt>포함 내용</dt><dd>${esc(f.inc)}</dd>
            <dt>정형 여부</dt><dd>${esc(f.struct)}${f.note ? ' · <span style="color:var(--t3);font-weight:500">' + esc(f.note) + '</span>' : ''}</dd>
            <dt>분량</dt><dd class="num">${d.e === 'pdf' ? d.pg + ' pages' : d.e === 'xlsx' ? d.pg + ' sheets' : d.pg + ' lines'} · ${d.kb.toLocaleString()} KB · 청크 ${d.c.length}개</dd>
            <dt>최종 수정</dt><dd class="num">${d.d}</dd>
          </dl>
        </div>

        <div class="ks-dw-sec">
          <div class="h"><span>임베딩 청크 ${d.c.length}개</span>${state.q ? '<span style="text-transform:none;letter-spacing:0;font-weight:600;color:var(--t3)">질의 대비 코사인 유사도</span>' : ''}</div>
          ${chunkScores.map(cs => `
            <div class="ks-chunk">
              <div class="ch">
                <span class="ci">CHUNK #${cs.i + 1}</span>
                <span class="tag">${d.e === 'xlsx' && cs.c.s ? esc(cs.c.s) : 'p.' + cs.c.p}</span>
                ${qv ? `<span class="cs">${cs.s.toFixed(3)}</span>` : ''}
              </div>
              <div class="ct">${highlight(cs.c.t, qt)}</div>
              ${qv ? `<div class="cbar"><i style="width:${(cs.s / maxS * 100).toFixed(0)}%"></i></div>` : ''}
            </div>`).join('')}
        </div>

        <div class="ks-dw-sec">
          <div class="h">벡터 유사 문서 Top 5</div>
          ${nn.map(n => `<div class="ks-nn" data-doc="${n.d.id}">
            <span class="s">${n.s.toFixed(3)}</span>
            <span class="badge ${BADGE[n.d.f]}" style="height:19px;font-size:10px">${n.d.f}</span>
            <span class="n">${esc(n.d.n)}</span>
          </div>`).join('')}
        </div>

        <div class="ks-dw-sec">
          <div class="h">액션</div>
          <div class="row gap8" style="flex-wrap:wrap">
            <button class="btn sm" data-toast="원문 뷰어는 프로토타입 범위 밖이에요">원문 열기</button>
            <button class="btn sm" data-toast="AI Agent 연동은 프로토타입 범위 밖이에요">AI Agent에 근거로 첨부</button>
            <button class="btn sm" data-toast="다운로드는 프로토타입 범위 밖이에요">다운로드</button>
          </div>
        </div>
      </div>`;

    drawer.querySelector('#ksDwClose').addEventListener('click', closeDoc);
    drawer.querySelectorAll('.ks-nn[data-doc]').forEach(n =>
      n.addEventListener('click', () => openDoc(+n.dataset.doc)));
    drawer.querySelectorAll('[data-toast]').forEach(n =>
      n.addEventListener('click', () => toast(n.dataset.toast)));
    drawer.querySelector('.ks-dw-b').scrollTop = 0;
    slidePanel(drawer, true);
    fadeScrim(scrim, true);
  }

  function closeDoc() { slidePanel(drawer, false); fadeScrim(scrim, false); }
  scrim.addEventListener('click', closeDoc);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDoc();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const i = document.getElementById('ksInput'); if (i) { i.focus(); i.select(); }
    }
  });

  /* ---------- 부팅 ---------- */
  cnt.innerHTML = shellHtml();
  renderChips();
  renderLeft();
  renderRail();
  initReveal(document);

  const input = document.getElementById('ksInput');
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(input.value); });
  input.addEventListener('input', () => {
    document.getElementById('ksClear').classList.toggle('on', !!input.value);
  });
  document.getElementById('ksGo').addEventListener('click', () => doSearch(input.value));
  document.getElementById('ksClear').addEventListener('click', () => {
    input.value = ''; input.focus();
    document.getElementById('ksClear').classList.remove('on');
    doSearch('');
  });
  document.querySelectorAll('.ks-sugg').forEach(n => n.addEventListener('click', () => {
    input.value = n.dataset.q; doSearch(n.dataset.q);
  }));
  document.querySelectorAll('#ksMode button').forEach(n => n.addEventListener('click', () => {
    document.querySelectorAll('#ksMode button').forEach(b => b.classList.remove('active'));
    n.classList.add('active'); state.mode = n.dataset.mode; refresh();
  }));
  document.querySelectorAll('#ksTopk button').forEach(n => n.addEventListener('click', () => {
    document.querySelectorAll('#ksTopk button').forEach(b => b.classList.remove('active'));
    n.classList.add('active'); state.topk = +n.dataset.k; refresh();
  }));
  document.getElementById('ksReindex').addEventListener('click', () => {
    const ms = buildIndex(); buildProjection(); refresh();
    toast(`재색인 완료 · 문서 ${DOCS.length}건 / 청크 ${totalChunks()}개 / ${ms.toFixed(0)}ms`);
  });
  document.getElementById('ksAgent').addEventListener('click', () =>
    toast('AI Agent 연동은 프로토타입 범위 밖이에요 — 연결된 화면을 둘러보세요'));

  const pill = document.getElementById('idxPill');
  if (pill) pill.textContent = `${DOCS.length}문서 · ${totalChunks()}청크 · ${totalPages().toLocaleString()}p`;

  setTimeout(() => input.focus(), 300);
})();
