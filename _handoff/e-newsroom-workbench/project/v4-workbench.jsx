// ============== VARIATION 4: THE STRATEGIST'S DESK ==============
// Chaotic creative-brainstorm layout that resolves into a clean
// browser mockup at the center. Same nVision palette (paper/ink/green
// + coral accent), same fonts (Heebo + Instrument Serif + JetBrains Mono).
// Draggable post-its + scraps + code, parallax keywords, hover reveals.

const { useState: useV4S, useEffect: useV4E, useRef: useV4R, useLayoutEffect: useV4L } = React;

// ===== Background keywords (parallax: fastest layer) =====
const V4_KEYWORDS = [
  // [text, x%, y%, sizeRem, rotateDeg, style]
  ['CONVERSION',   '4%',   '8%',   8.5,  -8,  'outline'],
  ['UX',           '78%',  '6%',   12,   12,  'outline'],
  ['SCALABILITY',  '46%',  '4%',   6.4,  -3,  'fill'],
  ['PERFORMANCE',  '6%',   '46%',  7.5,   8,  'fill'],
  ['vibe.',        '82%',  '38%',  9,    -10, 'serif coral'],
  ['ARCHITECTURE', '58%',  '52%',  6.2,  10,  'outline'],
  ['SHIP',         '24%',  '74%',  10.5, -6,  'green'],
  ['retention.',   '70%',  '78%',  7.8,   12, 'serif'],
  ['LATENCY',      '4%',   '94%',  6,    -2,  'outline'],
  ['INSIGHTS',     '88%',  '92%',  5.6,  -10, 'fill'],
];

// ===== Post-it strategy notes (Hebrew copy, EN phase tags) =====
const V4_POSTITS = [
  {
    color: 'yellow',
    phase: 'PHASE 01 / DISCOVERY',
    title: 'מחקר עמוק, לא ברייפים',
    body: 'יושבים שעה עם המשתמש. צופים בו עובד. לא שואלים מה הוא רוצה — מסתכלים מה הוא עושה. שם נמצא הברייף האמיתי.',
    meta: ['↑ research', '02d'],
    x: '6%',  y: '24%', rot: -7,
  },
  {
    color: 'magenta',
    phase: 'PHASE 02 / STRATEGY',
    title: 'לאן הולך הכסף',
    body: 'כל פיצ׳ר חייב להצביע על מטריקה אחת. אם אי אפשר לקשר אותו ל-revenue / retention / activation — הוא לא נכנס לתוכנית.',
    meta: ['→ strategy', '01w'],
    x: '24%', y: '38%', rot: 5,
  },
  {
    color: 'cyan',
    phase: 'PHASE 03 / BUILD',
    title: 'Vibe Coding ≠ Vibe Shipping',
    body: 'ה־AI כותב. אנחנו בודקים, מאתגרים, מתקנים. כל קומיט עובר code review של בן אדם לפני שמגיע ל־main.',
    meta: ['⚙ engineering', '04w'],
    x: '70%', y: '20%', rot: 9,
  },
  {
    color: 'green',
    phase: 'PHASE 04 / MEASURE',
    title: 'Metrics > Aesthetics',
    body: 'אם כפתור יפה לא מומר — הוא מכוער. נמדוד 6 שבועות, נחתוך מה שלא עובד, נכפיל מה שכן. תמיד.',
    meta: ['📊 measure', '06w'],
    x: '78%', y: '60%', rot: -6,
  },
  {
    color: 'yellow',
    phase: 'PHASE 05 / ITERATE',
    title: 'אין גרסה סופית',
    body: 'סייט שנשאר 12 חודשים בלי שינוי הוא סייט מת. כל רבעון: סבב מחקר, סבב ניסויים, סבב שחרור.',
    meta: ['↻ iterate', '∞'],
    x: '14%', y: '64%', rot: 4,
  },
];

// ===== Wireframe scraps =====
const V4_SCRAPS = [
  {
    id: 'wf-hero',
    label: 'WF-001 / hero',
    x: '50%', y: '20%', rot: -4, w: 200,
    svg: (
      <svg viewBox="0 0 200 130" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="2" width="196" height="126" stroke="currentColor"/>
        <rect x="14" y="14" width="80" height="6"/>
        <rect x="14" y="28" width="160" height="14"/>
        <rect x="14" y="48" width="120" height="14"/>
        <rect x="14" y="76" width="60" height="20" fill="currentColor"/>
        <rect x="84" y="76" width="40" height="20"/>
        <line x1="14" y1="110" x2="186" y2="110" strokeDasharray="3 3"/>
      </svg>
    ),
  },
  {
    id: 'wf-grid',
    label: 'WF-002 / grid',
    x: '32%', y: '78%', rot: 6, w: 180,
    svg: (
      <svg viewBox="0 0 180 110" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="2" width="176" height="106"/>
        <rect x="10" y="10" width="50" height="40"/>
        <rect x="65" y="10" width="50" height="40" fill="currentColor"/>
        <rect x="120" y="10" width="50" height="40"/>
        <rect x="10" y="56" width="50" height="40"/>
        <rect x="65" y="56" width="50" height="40"/>
        <rect x="120" y="56" width="50" height="40" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'wf-flow',
    label: 'WF-003 / flow',
    x: '62%', y: '82%', rot: -10, w: 220,
    svg: (
      <svg viewBox="0 0 220 110" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="6" y="38" width="44" height="36"/>
        <text x="28" y="60" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" fill="currentColor" stroke="none">view</text>
        <path d="M52 56 L80 56" markerEnd="url(#a)"/>
        <rect x="82" y="38" width="44" height="36" fill="currentColor"/>
        <text x="104" y="60" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" fill="#f4f1ea" stroke="none">click</text>
        <path d="M128 56 L156 56" markerEnd="url(#a)"/>
        <rect x="158" y="38" width="56" height="36"/>
        <text x="186" y="60" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" fill="currentColor" stroke="none">convert</text>
        <defs>
          <marker id="a" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" stroke="none"/>
          </marker>
        </defs>
      </svg>
    ),
  },
];

// ===== Code snippet scraps =====
const V4_CODE = [
  {
    id: 'code-css',
    x: '4%', y: '52%', rot: -3, w: 260, file: 'tokens.css',
    lines: [
      <span><span className="c-com">/* design tokens */</span></span>,
      <span><span className="c-key">:root</span> {'{'}</span>,
      <span>{'  '}<span className="c-fn">--ink</span>: <span className="c-str">#0a0a0a</span>;</span>,
      <span>{'  '}<span className="c-fn">--paper</span>: <span className="c-str">#f4f1ea</span>;</span>,
      <span>{'  '}<span className="c-fn">--accent</span>: <span className="c-str">#25D366</span>;</span>,
      <span>{'  '}<span className="c-fn">--coral</span>: <span className="c-str">#e8543a</span>;</span>,
      <span>{'}'}</span>,
    ],
  },
  {
    id: 'code-jsx',
    x: '76%', y: '46%', rot: 6, w: 280, file: 'Button.jsx',
    lines: [
      <span><span className="c-com">// magnetic CTA</span></span>,
      <span><span className="c-key">export</span> <span className="c-key">const</span> <span className="c-fn">Cta</span> = ({'{'} ch {'}'}) =&gt; {'{'}</span>,
      <span>{'  '}<span className="c-key">const</span> r = <span className="c-fn">useMagnetic</span>(<span className="c-str">0.4</span>);</span>,
      <span>{'  '}<span className="c-key">return</span> &lt;<span className="c-tag">button</span> ref={'{'}r{'}'}&gt;{'{'}ch{'}'}&lt;/<span className="c-tag">button</span>&gt;;</span>,
      <span>{'}'};</span>,
    ],
  },
  {
    id: 'code-cli',
    x: '40%', y: '94%', rot: -2, w: 240, file: 'shipping.log',
    lines: [
      <span><span className="c-com">$ ship --strategy=lean</span></span>,
      <span><span className="c-tag">✓</span> research <span className="c-com">// 12 interviews</span></span>,
      <span><span className="c-tag">✓</span> wireframes <span className="c-com">// 4 rounds</span></span>,
      <span><span className="c-tag">✓</span> build <span className="c-com">// 28 commits</span></span>,
      <span><span className="c-tag">→</span> measure...</span>,
    ],
  },
];

// ===== Photo / printout scraps =====
const V4_PHOTOS = [
  { id: 'ph-1', x: '88%', y: '78%', rot: 8,  w: 160, label: '[ user-test session ]', cap: 'יום 03 — sara, מסתבכת בקופה' },
  { id: 'ph-2', x: '2%',  y: '82%', rot: -6, w: 150, label: '[ analytics dump ]',     cap: 'בנצ׳מרק זמני טעינה' },
];

// ===== Drag hook (vanilla pointer events, persists offsets per id) =====
function useV4Drag(id, initial) {
  const ref = useV4R(null);
  const [pos, setPos] = useV4S({ dx: 0, dy: 0, drot: 0 });
  const stateRef = useV4R({ dragging: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  useV4E(() => {
    const el = ref.current;
    if (!el) return;
    const onDown = (e) => {
      stateRef.current.dragging = true;
      stateRef.current.sx = e.clientX;
      stateRef.current.sy = e.clientY;
      stateRef.current.ox = pos.dx;
      stateRef.current.oy = pos.dy;
      el.classList.add('is-dragging');
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!stateRef.current.dragging) return;
      const ndx = stateRef.current.ox + (e.clientX - stateRef.current.sx);
      const ndy = stateRef.current.oy + (e.clientY - stateRef.current.sy);
      el.style.setProperty('--dx', ndx + 'px');
      el.style.setProperty('--dy', ndy + 'px');
    };
    const onUp = (e) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.dragging = false;
      el.classList.remove('is-dragging');
      const ndx = stateRef.current.ox + (e.clientX - stateRef.current.sx);
      const ndy = stateRef.current.oy + (e.clientY - stateRef.current.sy);
      setPos({ dx: ndx, dy: ndy, drot: pos.drot });
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [pos.dx, pos.dy]);

  return { ref, pos, reset: () => setPos({ dx: 0, dy: 0, drot: 0 }) };
}

// ===== Parallax — translate elements proportional to scroll =====
function useV4Parallax(speed = 0.2) {
  const ref = useV4R(null);
  useV4E(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const apply = () => {
      const r = el.parentElement?.getBoundingClientRect();
      if (r) {
        const offset = (window.innerHeight * 0.5 - (r.top + r.height * 0.5)) * speed;
        el.style.setProperty('--py', offset + 'px');
      }
      raf = requestAnimationFrame(apply);
    };
    raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return ref;
}

// ===== Components =====
function V4Nav() {
  return (
    <header className="v4-nav">
      <div className="v4-nav-l">
        <div className="v4-mark">
          <svg viewBox="0 0 60 60">
            <rect x="0" y="0" width="60" height="60" rx="14" fill="#0a0a0a"/>
            <path d="M14 18 Q14 12 20 12 L40 12 Q46 12 46 18 L46 36 Q46 42 40 42 L26 42 L18 50 L20 42 Q14 42 14 36 Z" fill="#25D366"/>
            <text x="30" y="32" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" fill="#0a0a0a">n.</text>
          </svg>
        </div>
        <div className="v4-name">
          <strong>nVision <span style={{color:'#25D366'}}>·</span> studio</strong>
          <span className="mono">STRATEGIC WEB DEV / TLV</span>
        </div>
      </div>
      <nav className="v4-nav-c">
        <a href="#">חדשות</a>
        <a href="#">מאמרים</a>
        <a className="active" href="#">סטודיו</a>
        <a href="#">תהליך</a>
        <a href="#">קייסים</a>
      </nav>
      <div className="v4-nav-r">
        <V4CleanupBtn/>
      </div>
    </header>
  );
}

// Toggles between "messy" (default) and "clean" (snap everything to grid)
function V4CleanupBtn() {
  const [clean, setClean] = useV4S(false);
  useV4E(() => {
    document.documentElement.classList.toggle('v4-tidy', clean);
  }, [clean]);
  return (
    <button className={`v4-cleanup-btn ${clean?'is-clean':''}`} onClick={() => setClean(c => !c)}>
      {clean ? '↻ MESS IT UP' : '✦ CLEAN UP DESK'}
    </button>
  );
}

function V4Title() {
  return (
    <div className="v4-title-block">
      <div className="v4-eyebrow">[ §01 — STRATEGIC WEB DEV ]</div>
      <h1 className="v4-title">
        <span className="serif">Strategic</span>{' '}
        <span className="mono">{'<web/>'}</span>{' '}
        <span>Dev.</span>
      </h1>
      <div className="v4-title-sub">
        אסטרטגיה, עיצוב וקוד — <strong>מהמחקר ועד ה־ship</strong>. הדף הזה הוא ההוכחה.
      </div>
    </div>
  );
}

function V4Keywords() {
  const ref = useV4Parallax(0.42);
  return (
    <div ref={ref} className="v4-keywords" style={{transform:'translate3d(0, var(--py, 0), 0)'}}>
      {V4_KEYWORDS.map((k, i) => {
        const [text, x, y, size, rot, cls] = k;
        return (
          <span key={i} className={`v4-kw ${cls}`} style={{
            left: x, top: y,
            fontSize: `${size}rem`,
            transform: `rotate(${rot}deg)`,
          }}>{text}</span>
        );
      })}
    </div>
  );
}

function V4PostIt({ p, idx }) {
  const { ref } = useV4Drag('postit-'+idx);
  return (
    <div
      ref={ref}
      className={`v4-postit ${p.color}`}
      style={{
        left: p.x, top: p.y,
        transform: `translate3d(var(--dx,0), calc(var(--dy,0) + var(--py,0)), 0) rotate(${p.rot}deg)`,
      }}
      data-rot={p.rot}
    >
      <span className="v4-pin"></span>
      <div className="v4-postit-phase">{p.phase}</div>
      <h4>{p.title}</h4>
      <div className="v4-postit-body">{p.body}</div>
      <div className="v4-postit-meta">
        <span>{p.meta[0]}</span>
        <span>{p.meta[1]}</span>
      </div>
    </div>
  );
}

function V4PostIts() {
  const ref = useV4Parallax(0.16);
  return (
    <div ref={ref} className="v4-postits">
      {V4_POSTITS.map((p, i) => <V4PostIt key={i} p={p} idx={i} />)}
    </div>
  );
}

function V4Scrap({ s }) {
  const { ref } = useV4Drag('scrap-'+s.id);
  return (
    <div
      ref={ref}
      className="v4-scrap"
      style={{
        left: s.x, top: s.y, width: s.w,
        transform: `translate3d(var(--dx,0), calc(var(--dy,0) + var(--py,0)), 0) rotate(${s.rot}deg)`,
      }}
    >
      <div className="v4-scrap-label">
        <span>{s.label}</span>
        <span>↗</span>
      </div>
      {s.svg}
    </div>
  );
}
function V4Scraps() {
  const ref = useV4Parallax(0.22);
  return (
    <div ref={ref} className="v4-scraps">
      {V4_SCRAPS.map(s => <V4Scrap key={s.id} s={s}/>)}
    </div>
  );
}

function V4Code({ c }) {
  const { ref } = useV4Drag('code-'+c.id);
  return (
    <div
      ref={ref}
      className="v4-code"
      style={{
        left: c.x, top: c.y, width: c.w,
        transform: `translate3d(var(--dx,0), calc(var(--dy,0) + var(--py,0)), 0) rotate(${c.rot}deg)`,
      }}
    >
      <div className="v4-code-bar">
        <span></span><span></span><span></span>
        <small>{c.file}</small>
      </div>
      {c.lines.map((line, i) => <div key={i}>{line}</div>)}
    </div>
  );
}
function V4Codes() {
  const ref = useV4Parallax(0.18);
  return (
    <div ref={ref} className="v4-postits" style={{zIndex: 7}}>
      {V4_CODE.map(c => <V4Code key={c.id} c={c}/>)}
    </div>
  );
}

function V4Photo({ ph }) {
  const { ref } = useV4Drag('photo-'+ph.id);
  return (
    <div
      ref={ref}
      className="v4-photo"
      style={{
        left: ph.x, top: ph.y, width: ph.w,
        transform: `translate3d(var(--dx,0), calc(var(--dy,0) + var(--py,0)), 0) rotate(${ph.rot}deg)`,
      }}
    >
      <div className="v4-photo-img">{ph.label}</div>
      <small>{ph.cap}</small>
    </div>
  );
}
function V4Photos() {
  const ref = useV4Parallax(0.14);
  return (
    <div ref={ref} className="v4-scraps" style={{zIndex: 5}}>
      {V4_PHOTOS.map(ph => <V4Photo key={ph.id} ph={ph}/>)}
    </div>
  );
}

// THE PORTAL — the clean browser mockup, the order in the chaos.
function V4Portal() {
  return (
    <div className="v4-portal-wrap" dir="rtl">
      <div className="v4-portal-halo"></div>
      <div className="v4-browser">
        <div className="v4-browser-bar">
          <div className="v4-browser-dots"><span></span><span></span><span></span></div>
          <div className="v4-browser-url">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z" stroke="#25D366" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            <span className="mono-dim">https://</span>
            <span>nvision.studio</span>
            <span className="mono-dim">/work/finance-co</span>
          </div>
          <div className="v4-browser-meta">
            <span className="v4-pulse"></span>
            <span>LIVE · 99 PSI</span>
          </div>
        </div>

        <div className="v4-browser-page">
          <div className="v4-page-hero">
            <div>
              <div className="v4-page-eyebrow">CASE №07 / FINANCE-CO</div>
              <h1 className="v4-page-h">
                10 שבועות.<br/>
                <span className="serif">3.1× המרה.</span>
              </h1>
              <p className="v4-page-p">
                בנינו מאפס פלטפורמת ניהול הון לקוחות. מחקר משתמשים, אסטרטגיה, מערכת עיצוב, פיתוח React/Next, ו־A/B מתמשך אחרי ה־launch.
              </p>
              <button className="v4-page-cta">קרא את הקייס המלא <span>↗</span></button>
            </div>
            <div className="v4-page-side">
              <div className="v4-page-stat">
                <span className="mono">CONVERSION</span>
                <div className="v4-stat-num">3.1<em>×</em></div>
                <div className="v4-stat-trend">↗ +212% vs. baseline</div>
              </div>
              <div className="v4-page-stat">
                <span className="mono">LIGHTHOUSE</span>
                <div className="v4-stat-num">99<em>/100</em></div>
                <div className="v4-stat-trend">↗ all four pillars</div>
              </div>
              <div className="v4-page-stat">
                <span className="mono">TIME TO SHIP</span>
                <div className="v4-stat-num">10<em>w</em></div>
                <div className="v4-stat-trend">↗ on schedule</div>
              </div>
            </div>
          </div>

          <div className="v4-page-grid">
            <div>
              <h5>STACK</h5>
              <strong>Next.js 15</strong>
              <p>App Router · RSC · Edge runtime · Vercel.</p>
            </div>
            <div>
              <h5>DESIGN</h5>
              <strong>Tokens-first</strong>
              <p>מערכת עיצוב משלנו, 4-pt grid, OKLCH.</p>
            </div>
            <div>
              <h5>RESEARCH</h5>
              <strong>12 interviews</strong>
              <p>שלושה סבבי בדיקות שמישות — לפני, אחרי, חודש.</p>
            </div>
            <div>
              <h5>OUTCOME</h5>
              <strong>$2.4M ARR</strong>
              <p>תוצאה ישירה של redesign — quarter ראשון.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function V4Process() {
  const phases = [
    { n: '01', he: 'מחקר', en: 'discovery.', body: 'ראיונות עומק, ניתוח מתחרים, מיפוי jobs-to-be-done. שום קוד לא נכתב לפני שהתשובות יושבות על השולחן.' },
    { n: '02', he: 'אסטרטגיה', en: 'strategy.', body: 'בוחרים מטריקה אחת. מצמצמים scope. כותבים את הסיפור — ורק אז מתחילים wireframes.' },
    { n: '03', he: 'בנייה', en: 'build.', body: 'Vibe coding עם supervision: Cursor + Claude לקוד, אנחנו לארכיטקטורה. מערכת עיצוב, רכיבים, אוטומציה, ci/cd.' },
    { n: '04', he: 'מדידה', en: 'measure.', body: 'ש שבוע ראשון אחרי launch: דשבורד חי, A/B דשנים, סבב refactor כל 6 שבועות. הגרסה הראשונה היא לא הסופית.' },
  ];
  return (
    <section className="v4-process">
      <div className="v4-process-head">
        <div className="v4-process-eyebrow">[ §02 — תהליך ]</div>
        <h2 className="v4-process-h">
          איך מסדרים <span className="serif">את השולחן.</span>
        </h2>
      </div>
      <div className="v4-process-grid">
        {phases.map(p => (
          <div key={p.n} className="v4-process-cell">
            <div className="v4-pn">PHASE {p.n}</div>
            <h4>{p.he} <span className="serif">{p.en}</span></h4>
            <p>{p.body}</p>
            <div className="v4-pdiag">↘ {p.n}/04</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function V4Cta() {
  return (
    <section className="v4-cta">
      <div className="v4-cta-ghost">SHIP · SHIP · SHIP</div>
      <h3>יש לך פרויקט.<br/><span className="serif">בוא נסדר אותו.</span></h3>
      <p>שיחה ראשונית, חצי שעה, בלי התחייבות. נציג לך את התהליך. אם נתאים — נמשיך.</p>
      <button className="v4-cta-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 12C3 7 7 3 12 3C17 3 21 7 21 12C21 17 17 21 12 21H3L4.5 17.5C3.5 16 3 14 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
        קבע שיחה ב־WhatsApp
        <span>↗</span>
      </button>
    </section>
  );
}

function V4Foot() {
  return (
    <footer className="v4-foot">
      <span>© 2026 NVISION STUDIO · TEL AVIV</span>
      <span>SECTION 04/12 · STRATEGIC WEB DEV</span>
      <a href="#">↑ TOP</a>
    </footer>
  );
}

function VariationFour() {
  return (
    <div className="v4-root" dir="rtl">
      <V4Nav />
      <main className="v4-stage">
        <div className="v4-paper"></div>
        <div className="v4-grain"></div>

        <V4Keywords />
        <V4Title />
        <V4Scraps />
        <V4Photos />
        <V4Codes />
        <V4PostIts />

        <V4Portal />
      </main>
      <V4Process />
      <V4Cta />
      <V4Foot />
    </div>
  );
}

window.VariationFour = VariationFour;
