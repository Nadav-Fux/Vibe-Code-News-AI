// ============== VARIATION 5: NEWSROOM WORKBENCH (rev 2) ==============
const { useState: useV5S, useEffect: useV5E, useRef: useV5R, useMemo: useV5M } = React;

// ===== Background floating keywords =====
const V5_KEYWORDS = [
  ['חדשות',     '4%',   '6%',  9.5,  -8,  'outline'],
  ['VIBE',      '76%',  '4%',  12,    9,  'outline'],
  ['agents.',   '8%',   '52%', 9,    10,  'serif sage'],
  ['MODELS',    '46%',  '2%',  6.4,  -3,  'fill'],
  ['guides.',   '78%',  '74%', 7.6,  12,  'serif'],
  ['SHIP',      '20%',  '78%', 11,   -4,  'sage'],
];

// ===== Chat feed =====
const V5_FEED = [
  { type: 'system', text: 'היום · 09 במאי 2026' },
  { type: 'msg', time: '09:14', tag: 'מבזק',   text: 'בוקר טוב. Anthropic משיקה את Claude 5 Opus.', urgent: true },
  { type: 'msg', time: '10:02', tag: 'מודלים', text: 'GPT-5o זמין ב-API. מחיר נמוך ב-40%.' },
  { type: 'msg', time: '11:15', tag: 'מדריך',  text: '🔥 מדריך חדש: סוכן AI ב-Cursor + MCP ב-30 דקות.' },
  { type: 'msg', time: '13:22', tag: 'גינרוט', text: 'Jailbreak חדש ל-Gemini 2.5 — אתי, חוקי, עובד.', urgent: true },
  { type: 'msg', time: '14:32', tag: 'חדשות',  text: 'Lovable מגייסת 100M$ בסבב סדרה B. הערכת שווי: 1.2B.' },
];

// ===== Articles as draggable post-its =====
// pos auto-distributed in a soft grid + jitter; users can drag.
const V5_ARTICLES = [
  { id:'a1', cat:'OPINION',   color:'mustard', tag:'מאמר דעה', title:'Vibe Coding הוא לא סוף הפיתוח. הוא ההתחלה.', body:'אחרי שנה של בנייה רק עם פרומפטים, אני בטוח יותר מתמיד שמפתחים לא הולכים לשום מקום — הם פשוט עולים שלב.', author:'נדב גלעד', read:'8 דק׳' },
  { id:'a2', cat:'DEEP DIVE', color:'sky',     tag:'מודלים',     title:'Claude 5 Opus: הניתוח המלא',                     body:'בדקנו 47 משימות. הפתעה אחת, אכזבה אחת, ושינוי משחק בקטגוריה אחת.',                                                       author:'מערכת',     read:'12 דק׳' },
  { id:'a3', cat:'GUIDE',     color:'sage',    tag:'מדריך',      title:'בונים סוכן AI ב-Cursor — מ-MCP לפרודקשן ב-30 דק׳', body:'כל המודלים, ה-tools, ה-deployments. מהקבצים הראשונים ועד ה-ship.',                                                       author:'יואב לוי',  read:'6 דק׳' },
  { id:'a4', cat:'TOOLS',     color:'lavender',tag:'כלים',        title:'12 כלי AI לכל מפתח ב-2026',                       body:'מ-Linear AI עד Continue.dev — מי נשאר, מי הלך, מי חדש.',                                                                  author:'מערכת',     read:'4 דק׳' },
  { id:'a5', cat:'BENCH',     color:'rose',    tag:'בנצ׳מרק',     title:'GPT-5o vs Claude 5 vs Gemini 2.5',                 body:'קוד, היגיון, יצירתיות. החלטנו לבדוק. הכל בלייב, ללא טריקים.',                                                              author:'מערכת',     read:'15 דק׳' },
  { id:'a6', cat:'OPINION',   color:'paper',   tag:'מבט קדימה',   title:'הכלי הבא יחליף לא רק את האדם — גם את הצוות.',     body:'מודלים אוטונומיים, סוכנים מולטי-משימה, ופלוס אחד או שניים שלא נדבר עליהם פה.',                                            author:'דנה כהן',  read:'7 דק׳' },
  { id:'a7', cat:'GUIDE',     color:'mustard', tag:'tutorial',    title:'איך להפסיק לפחד מ-MCP',                          body:'5 פרוטוקולים שכל מפתח חייב להכיר ב-2026. עם דוגמאות חיות.',                                                                 author:'יואב לוי',  read:'9 דק׳' },
  { id:'a8', cat:'TOOLS',     color:'sky',     tag:'review',      title:'Linear AI: סוף סוף מנהל מוצר אמיתי?',            body:'בדקנו חודש שלם. התוצאה מפתיעה — וגם לא.',                                                                                   author:'רני מזרחי', read:'6 דק׳' },
  { id:'a9', cat:'DEEP DIVE', color:'sage',    tag:'תיאוריה',     title:'למה GPT-5o פתאום צודק יותר',                      body:'reasoning chains, RLHF חדש, ועוד דבר אחד שלא דובר.',                                                                       author:'מערכת',     read:'11 דק׳' },
];

// ===== Categories for canvas streams =====
const V5_CATS = [
  { he:'חדשות',       en:'news.',     count:247 },
  { he:'Vibe Coding', en:'vibe.',     count:89  },
  { he:'מודלים',      en:'models.',   count:64  },
  { he:'מדריכים',     en:'guides.',   count:142 },
  { he:'כלים',        en:'tools.',    count:96  },
  { he:'מאמרי דעה',   en:'op-eds.',   count:38  },
  { he:'בנצ׳מרקים',   en:'bench.',    count:27  },
  { he:'גינרוטים',    en:'prompts.',  count:184 },
  { he:'סוכנים',      en:'agents.',   count:52  },
  { he:'אסטרטגיה',    en:'strategy.', count:19  },
  { he:'קוד',         en:'code.',     count:118 },
  { he:'סטארטאפים',   en:'startups.', count:71  },
  { he:'ראיונות',     en:'interviews.', count:24 },
  { he:'מחקר',        en:'research.', count:46  },
  { he:'אתיקה',       en:'ethics.',   count:14  },
  { he:'UX/UI',       en:'design.',   count:33  },
];

const V5_QUOTES = [
  '"בעוד 5 שנים אף מתכנת לא יזכור איך כתבו קוד בלי AI."',
  '"היום הראשון של ה-IDE החדש שלך הוא היום האחרון של זה הישן."',
  '"מודלים זה לא קסם. זה איטרציה."',
  '"כל פיצ׳ר חייב מטריקה אחת."',
  '"אם הכפתור היפה לא מומר — הוא מכוער."',
  '"שיפ. תקן. שיפ שוב."',
  '"Cursor + Claude = 90% מהפיתוח."',
  '"תכל׳ס: AI כותב טוב. אנחנו צריכים לחשוב טוב."',
  '"הסטארטאפ הבא שלך יהיה צוות של אחד וצבא של סוכנים."',
  '"קוד הוא הנכס. הפרומפט הוא ה-IP."',
  '"מי שלא יבחן בלייב — יישאר בתחתית."',
  '"AI לא יחליף אותך. מי שמשתמש ב-AI יחליף אותך."',
  '"הראיון של 2026: סוכן מול סוכן."',
  '"זמן ה-deploy חשוב יותר מזמן הפיתוח."',
];

// curated scattered positions for the article wall
const V5_POS = [
  { left: '4%',  top: 30,  rot: -2.4 },
  { left: '36%', top: 60,  rot:  1.6 },
  { left: '68%', top: 20,  rot: -1.2 },
  { left: '8%',  top: 320, rot:  2.8 },
  { left: '40%', top: 360, rot: -0.8 },
  { left: '72%', top: 310, rot:  2.2 },
  { left: '2%',  top: 620, rot:  1.8 },
  { left: '34%', top: 660, rot: -2.6 },
  { left: '66%', top: 610, rot:  0.6 },
];

const V5_HOT = [
  { rank:1, title:'GPT-5o vs Claude 5 vs Gemini 2.5', cat:'BENCH',    score:12.4, delta:'▲ 2',  dir:'up',  spark:[3,5,4,7,8,11,9,14,18,22,20,28], tool:'LIVE' },
  { rank:2, title:'בונים סוכן AI ב-Cursor + MCP',     cat:'GUIDE',    score:8.9,  delta:'▲ 1',  dir:'up',  spark:[5,6,5,8,9,8,11,12,14,17,19,21], tool:'24H' },
  { rank:3, title:'Vibe Coding הוא לא סוף הפיתוח',    cat:'OPINION',  score:7.2,  delta:'NEW',  dir:'new', spark:[0,0,0,2,3,5,8,11,12,14,15,18], tool:'48H' },
  { rank:4, title:'12 כלי AI לכל מפתח ב-2026',         cat:'TOOLS',    score:5.1,  delta:'▲ 3',  dir:'up',  spark:[2,3,4,3,4,6,7,8,9,11,13,15], tool:'24H' },
  { rank:5, title:'Claude 5 Opus: הניתוח המלא',        cat:'DEEP DIVE',score:4.3,  delta:'▼ 1',  dir:'dn',  spark:[8,9,11,12,11,10,9,9,8,7,7,8], tool:'72H' },
  { rank:6, title:'איך להפסיק לפחד מ-MCP',             cat:'GUIDE',    score:3.8,  delta:'▲ 2',  dir:'up',  spark:[1,2,2,3,4,5,5,7,8,8,10,12], tool:'48H' },
];

const V5_KIND_MAP = {
  GUIDE: 'מדריך',
  BENCH: 'השוואה',
  OPINION: 'מאמר',
  'DEEP DIVE': 'מאמר עומק',
  TOOLS: 'סקירה',
};

const V5_CATEGORY_FILTERS = ['הכל', 'מדריך', 'מאמר', 'השוואה', 'סקירה'];

const V5_PATHS = [
  { label:'למתחילים', count:'18', title:'מ־prompt ראשון לסוכן ראשון', tone:'sage' },
  { label:'למפתחים', count:'31', title:'Cursor, MCP, agents, deploy', tone:'sky' },
  { label:'למנהלים', count:'12', title:'מה שווה כלי AI לצוות מוצר', tone:'paper' },
  { label:'לחולי בנצ׳מרקים', count:'09', title:'מודלים, מחירים, latency', tone:'lavender' },
];

const V5_ARTICLE_OUTLINE = [
  'מה השתנה בפיתוח עם AI',
  'הסטאק המינימלי לסוכן עובד',
  'איפה מודלים נופלים בפרודקשן',
  'צ׳קליסט לפני שמשחררים',
];

const V5_RELATED = [
  { title:'הפרוטוקול הקטן שמסדר MCP', meta:'מדריך · 9 דק׳' },
  { title:'מה למדנו מ־47 משימות Claude', meta:'מאמר עומק · 12 דק׳' },
  { title:'האם Linear AI באמת מנהל מוצר?', meta:'סקירה · 6 דק׳' },
];

// ===== Drag hook =====
function useV5Drag() {
  const ref = useV5R(null);
  const stateRef = useV5R({ dragging:false, sx:0, sy:0, dx:0, dy:0 });
  useV5E(() => {
    const el = ref.current; if (!el) return;
    const onDown = (e) => {
      if (e.target.closest('[data-no-drag]')) return;
      stateRef.current.dragging = true;
      stateRef.current.sx = e.clientX; stateRef.current.sy = e.clientY;
      el.classList.add('is-dragging'); el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!stateRef.current.dragging) return;
      const ndx = stateRef.current.dx + (e.clientX - stateRef.current.sx);
      const ndy = stateRef.current.dy + (e.clientY - stateRef.current.sy);
      el.style.setProperty('--dx', ndx + 'px');
      el.style.setProperty('--dy', ndy + 'px');
    };
    const onUp = (e) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.dragging = false;
      el.classList.remove('is-dragging');
      stateRef.current.dx += (e.clientX - stateRef.current.sx);
      stateRef.current.dy += (e.clientY - stateRef.current.sy);
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);
  return ref;
}

function useV5Parallax(speed = 0.2) {
  const ref = useV5R(null);
  useV5E(() => {
    const el = ref.current; if (!el) return;
    let raf;
    const apply = () => {
      const r = el.getBoundingClientRect();
      const offset = (window.innerHeight * 0.5 - (r.top + r.height * 0.5)) * speed;
      el.style.setProperty('--py', offset + 'px');
      raf = requestAnimationFrame(apply);
    };
    raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return ref;
}

function useV5Reveal() {
  useV5E(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('v5-enter'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-v5-reveal]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// =================== COMPONENTS ===================

function V5Nav() {
  const [time, setTime] = useV5S('14:32');
  useV5E(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <header className="v5-nav">
      <div className="v5-nav-l">
        <div className="v5-mark">
          <svg viewBox="0 0 60 60">
            <rect x="0" y="0" width="60" height="60" rx="14" fill="#11110d"/>
            <path d="M14 18 Q14 12 20 12 L40 12 Q46 12 46 18 L46 36 Q46 42 40 42 L26 42 L18 50 L20 42 Q14 42 14 36 Z" fill="#88a884"/>
            <text x="30" y="32" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" fill="#11110d">n.</text>
          </svg>
        </div>
        <div className="v5-name">
          <strong>nVision <span style={{color:'#88a884'}}>·</span> AI</strong>
          <span className="mono">VIBE CODE NEWS · TLV</span>
        </div>
      </div>
      <nav className="v5-nav-c">
        <a className="active" href="#">בית</a>
        <a href="#">חדשות</a>
        <a href="#">מאמרים</a>
        <a href="#">מדריכים</a>
        <a href="#">כלים</a>
        <a href="#">קהילה</a>
      </nav>
      <div className="v5-nav-r">
        <div className="v5-nav-clock">
          <span className="v5-pulse"></span>
          <span>LIVE · {time}</span>
        </div>
        <button className="v5-join-btn">הצטרף לערוץ <span>↗</span></button>
      </div>
    </header>
  );
}

function V5Keywords() {
  const ref = useV5Parallax(0.4);
  return (
    <div ref={ref} className="v5-bg-kw" style={{transform:'translate3d(0, var(--py, 0), 0)'}}>
      {V5_KEYWORDS.map((k, i) => {
        const [text, x, y, size, rot, cls] = k;
        return <span key={i} className={`v5-kw ${cls}`} style={{left:x,top:y,fontSize:`${size}rem`,transform:`rotate(${rot}deg)`}}>{text}</span>;
      })}
    </div>
  );
}

function V5RotatingWord() {
  const words = ['וויב קודינג', 'סוכנים', 'מודלים', 'מוצרים', 'סטארטאפים'];
  const [i, setI] = useV5S(0);
  const [t, setT] = useV5S('');
  useV5E(() => {
    const word = words[i];
    let j = 0; let typing = true;
    const tick = () => {
      if (typing) {
        if (j < word.length) { setT(word.slice(0, ++j)); setTimeout(tick, 70); }
        else { setTimeout(() => { typing = false; tick(); }, 1800); }
      } else {
        if (j > 0) { setT(word.slice(0, --j)); setTimeout(tick, 35); }
        else { setI(p => (p + 1) % words.length); }
      }
    };
    tick();
  }, [i]);
  return <span className="v5-rotor">{t}<i className="v5-caret"></i></span>;
}

function V5Title() {
  return (
    <div className="v5-title-wrap" data-v5-reveal>
      <div className="v5-eyebrow-row">[ ISSUE №247 / 09.05.2026 / LIVE ]</div>
      <h1 className="v5-title">
        <span className="v5-w-fall" style={{animationDelay:'0.05s'}}>מה</span>{' '}
        <span className="v5-w-fall serif" style={{animationDelay:'0.18s'}}>חדש</span>{' '}
        <span className="v5-w-fall" style={{animationDelay:'0.32s'}}>היום?</span>
      </h1>
      <div className="v5-title-pill">
        <span className="v5-pill-dot"></span>
        nVision <span className="v5-pill-ai">[AI]</span>
      </div>
      <div className="v5-title-sub">
        <span>הבינה המלאכותית, הטכנולוגיה ועולם </span>
        <span className="v5-rotor-wrap"><V5RotatingWord/></span>
      </div>
    </div>
  );
}

// ===== COMBINED: WhatsApp phone + Hot articles panel =====
function V5Newsroom() {
  const [skin, setSkin] = useV5S('whatsapp');
  return (
    <section className="v5-newsroom">
      <div className="v5-newsroom-head">
        <div className="v5-eyebrow">[ §02 — NEWSROOM ]</div>
        <h2>
          הניוזרום שלנו <span className="serif">בכיס שלך.</span>
        </h2>
        <p>וואטסאפ, טלגרם או מסנג׳ר — אותו תוכן, אפס פיד אינסופי. רק מה שצריך לדעת, מתי שצריך.</p>
      </div>

      <div className="v5-newsroom-grid">
        <div className="v5-phone-col" data-v5-reveal style={{'--ey':'40px'}}>
          <div className="v5-skin-squares">
            {[
              ['whatsapp','#25D366','W','WhatsApp'],
              ['telegram','#2AABEE','T','Telegram'],
              ['messenger','#0084FF','M','Messenger'],
            ].map(([k, c, l, n]) => (
              <button key={k} className={`v5-skin-sq ${skin===k?'active':''} sq-${k}`} onClick={() => setSkin(k)} title={n}>
                <span style={{background:c}}>{l}</span>
              </button>
            ))}
          </div>
          <div className="v5-phone">
            <div className="v5-phone-notch"></div>
            <div className="v5-phone-screen">
              <V5Chat skin={skin}/>
            </div>
          </div>
        </div>

        <div className="v5-hot" data-v5-reveal style={{'--ex':'30px'}}>
          <div className="v5-hot-head">
            <h3>
              <span>
                <small>HOT 06 · WEEKLY</small>
                הכי <span className="serif">חמים</span>
              </span>
            </h3>
            <div className="v5-hot-meta-bar">
              <span className="mono">N°247</span>
              <strong>● LIVE</strong>
            </div>
          </div>
          <div className="v5-hot-list">
            {V5_HOT.map((row) => (
              <a key={row.rank} className={`v5-hot-row ${row.rank<=2?'is-fire':''} ${row.dir==='dn'?'dn':''} cat-${row.cat.split(' ')[0]}`}>
                <span className="v5-hot-rk">{String(row.rank).padStart(2,'0')}</span>
                <div className="v5-hot-mid">
                  <div className="v5-hot-meta">
                    <span className="v5-hot-cat">{row.cat}</span>
                    <span className="v5-hot-tool">{row.tool}</span>
                  </div>
                  <strong>{row.title}</strong>
                </div>
                <V5Sparkline data={row.spark}/>
                <div className="v5-hot-side">
                  <span className="score">{row.score}K</span>
                  <span className={`delta ${row.dir==='dn'?'dn':row.dir==='new'?'new':''}`}>{row.delta}</span>
                </div>
              </a>
            ))}
          </div>
          <div className="v5-hot-foot">
            <span className="live">UPDATED 14:32</span>
            <a>כל הדירוג ↗</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function V5Sparkline({ data }) {
  const w = 78, h = 30, pad = 2;
  const max = Math.max(...data, 1);
  const step = (w - pad*2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i*step, h - pad - (v/max) * (h - pad*2)]);
  const line = pts.map(p => p.join(',')).join(' ');
  const area = `${pad},${h-pad} ${line} ${w-pad},${h-pad}`;
  const last = pts[pts.length-1];
  return (
    <svg className="v5-spark" viewBox={`0 0 ${w} ${h}`}>
      <polygon className="area" points={area}/>
      <polyline className="line" points={line}/>
      <circle className="endpt" cx={last[0]} cy={last[1]} r="2.4"/>
    </svg>
  );
}

function V5Chat({ skin }) {
  const scrollerRef = useV5R(null);
  const [shown, setShown] = useV5S(3);
  const [typing, setTyping] = useV5S(false);

  useV5E(() => {
    if (shown >= V5_FEED.length) return;
    const t = setTimeout(() => {
      setTyping(true);
      const t2 = setTimeout(() => { setTyping(false); setShown(s => s + 1); }, 1100);
      return () => clearTimeout(t2);
    }, 2800);
    return () => clearTimeout(t);
  }, [shown]);

  useV5E(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight; }, [shown, typing]);

  return (
    <div className={`v5-chat skin-${skin}`}>
      <V5ChatHeader skin={skin} typing={typing}/>
      <div ref={scrollerRef} className="v5-chat-body">
        <div className="v5-chat-bg"></div>
        {V5_FEED.slice(0, shown).map((m, i) => {
          if (m.type === 'system') return <div key={i} className="v5-system"><span>{m.text}</span></div>;
          return (
            <div key={i} className={`v5-msg-row skin-${skin}`}>
              <div className="v5-bubble">
                {m.urgent && <span className="v5-chat-urgent">⚡ מבזק</span>}
                <span className="v5-chat-tag">{m.tag}</span>
                <p>{m.text}</p>
                <div className="v5-time">{m.time}{skin==='whatsapp' && <span className="v5-ticks"> ✓✓</span>}</div>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className={`v5-msg-row skin-${skin}`}>
            <div className="v5-bubble"><div className="v5-typing"><span></span><span></span><span></span></div></div>
          </div>
        )}
      </div>
      <V5ChatInput skin={skin}/>
    </div>
  );
}

function V5ChatHeader({ skin, typing }) {
  if (skin === 'whatsapp') return (
    <div className="v5-chat-header v5-h-wa">
      <span className="v5-chat-back">‹</span>
      <div className="v5-chat-av" style={{background:'#25D366'}}>n.</div>
      <div className="v5-chat-h-meta"><strong>nVision · AI</strong><span>{typing ? 'כותב/ת…' : 'ערוץ · 12,847 עוקבים'}</span></div>
      <div className="v5-chat-icons"><span>📷</span><span>⌕</span><span>⋮</span></div>
    </div>
  );
  if (skin === 'telegram') return (
    <div className="v5-chat-header v5-h-tg">
      <span className="v5-chat-back">‹</span>
      <div className="v5-chat-av" style={{background:'linear-gradient(135deg,#54a9eb,#2A8AD8)'}}>n.</div>
      <div className="v5-chat-h-meta"><strong>nVision · AI <span className="v5-tg-verified">✓</span></strong><span>{typing ? 'כותב/ת…' : '12,847 subscribers'}</span></div>
      <div className="v5-chat-icons"><span>⌕</span><span>⋮</span></div>
    </div>
  );
  return (
    <div className="v5-chat-header v5-h-fb">
      <span className="v5-chat-back">‹</span>
      <div className="v5-chat-av" style={{background:'linear-gradient(135deg,#0099FF,#A033FF)'}}>n.</div>
      <div className="v5-chat-h-meta"><strong>nVision · AI</strong><span>{typing ? 'מקליד/ה…' : 'פעיל/ה עכשיו'}</span></div>
      <div className="v5-chat-icons"><span>📞</span><span>📹</span><span>ⓘ</span></div>
    </div>
  );
}

function V5ChatInput({ skin }) {
  if (skin === 'whatsapp') return (
    <div className="v5-chat-input v5-i-wa">
      <span>😊</span><div className="v5-chat-fake-input">הקלד הודעה</div><span>📎</span><span>📷</span>
      <button className="v5-chat-send" style={{background:'#25D366'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12L19 12M19 12L13 6M19 12L13 18" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
    </div>
  );
  if (skin === 'telegram') return (
    <div className="v5-chat-input v5-i-tg"><span>😊</span><div className="v5-chat-fake-input">Message</div><span>📎</span><span style={{color:'#2AABEE',fontSize:18}}>🎤</span></div>
  );
  return (
    <div className="v5-chat-input v5-i-fb">
      <span style={{color:'#0084FF'}}>+</span><span style={{color:'#0084FF'}}>📷</span><span style={{color:'#0084FF'}}>🖼</span><span style={{color:'#0084FF'}}>🎤</span>
      <div className="v5-chat-fake-input">Aa</div><span style={{color:'#0084FF',fontSize:18}}>👍</span>
    </div>
  );
}

// ============== ARTICLE WALL — draggable accordion post-its ==============
function V5ArticleWall() {
  const [filter, setFilter] = useV5S('ALL');
  const cats = ['ALL', 'OPINION', 'GUIDE', 'TOOLS', 'DEEP DIVE', 'BENCH'];
  const filtered = filter === 'ALL' ? V5_ARTICLES : V5_ARTICLES.filter(a => a.cat === filter);

  const positions = V5_POS;

  return (
    <section className="v5-wall">
      <div className="v5-sec-head">
        <div className="v5-eyebrow">[ §03 — THE WALL ]</div>
        <h2>קיר <span className="serif">המאמרים.</span></h2>
        <p className="v5-sec-p">גרור. לחץ. תפתח. תקרא. <em>כל פתק חי משלו.</em></p>
        <div className="v5-wall-filters">
          {cats.map(c => (
            <button key={c} className={`v5-wf ${filter===c?'active':''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="v5-wall-stage">
        {V5_ARTICLES.map((a, i) => {
          const visible = filter === 'ALL' || a.cat === filter;
          return <V5ArticlePostit key={a.id} a={a} pos={positions[i]} visible={visible}/>;
        })}
      </div>
    </section>
  );
}

function V5ArticlePostit({ a, pos, visible }) {
  const ref = useV5Drag();
  const [open, setOpen] = useV5S(false);
  return (
    <article
      ref={ref}
      className={`v5-pn v5-pn-${a.color} ${open?'is-open':''} ${visible?'':'is-hidden'}`}
      style={{
        left: pos.left, top: pos.top,
        transform: `translate3d(var(--dx,0), var(--dy,0), 0) rotate(${pos.rot}deg)`,
      }}
    >
      <span className="v5-pn-pin"></span>
      <div className="v5-pn-meta">
        <span className="v5-pn-cat mono">{a.cat}</span>
        <span className="v5-pn-tag">{a.tag}</span>
      </div>
      <h4>{a.title}</h4>
      <div className="v5-pn-body">
        <p>{a.body}</p>
        <a className="v5-pn-link" data-no-drag>קרא את המאמר ↗</a>
      </div>
      <div className="v5-pn-foot">
        <span className="mono">{a.author}</span>
        <button className="v5-pn-toggle" data-no-drag onClick={(e)=>{e.stopPropagation(); setOpen(o=>!o);}}>
          {open ? '— סגור' : '+ פתח'}
        </button>
        <span className="mono">{a.read}</span>
      </div>
    </article>
  );
}

// ============== CATEGORY PAGE — magazine library template ==============
function V5ArticleKind(a) {
  return V5_KIND_MAP[a.cat] || 'מאמר';
}

function V5CategoryPage() {
  const [filter, setFilter] = useV5S('הכל');
  const visible = filter === 'הכל' ? V5_ARTICLES : V5_ARTICLES.filter(a => V5ArticleKind(a) === filter);
  const hero = visible[0] || V5_ARTICLES[0];

  return (
    <section className="v5-category">
      <div className="v5-cat-bg-word">LIBRARY</div>
      <div className="v5-cat-head" data-v5-reveal>
        <div>
          <div className="v5-eyebrow">[ §04 — ARTICLE LIBRARY ]</div>
          <h2>דף קטגוריה <span className="serif">למאמרים שחיים על הקיר.</span></h2>
        </div>
        <p>
          מדריכים, מאמרים, השוואות וסקירות. במקום עוד גריד משעמם, הספרייה עובדת כמו שולחן מערכת:
          פתקים, מסלולי קריאה, דירוגים קטנים, וקצת בלגן שמכריח את העין לטייל.
        </p>
      </div>

      <div className="v5-cat-controls" data-v5-reveal>
        {V5_CATEGORY_FILTERS.map(f => (
          <button key={f} className={`v5-cat-filter ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
            <span>{f}</span>
            <em>{f === 'הכל' ? V5_ARTICLES.length : V5_ARTICLES.filter(a => V5ArticleKind(a) === f).length}</em>
          </button>
        ))}
      </div>

      <div className="v5-cat-layout">
        <article className={`v5-cat-feature v5-pn-${hero.color}`} data-v5-reveal style={{'--ey':'42px'}}>
          <span className="v5-cat-stamp">EDITOR PICK</span>
          <div className="v5-cat-feature-art">
            <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">
              <rect width="640" height="360" fill="currentColor" opacity="0.08"/>
              <g fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M70 250 C140 120 220 280 310 150 S500 90 570 240" strokeDasharray="8 10"/>
                <path d="M80 110 L230 70 L340 170 L500 105" />
                <rect x="74" y="74" width="120" height="82" rx="10"/>
                <rect x="370" y="190" width="150" height="96" rx="12"/>
                <circle cx="275" cy="210" r="54"/>
              </g>
              <text x="42" y="318" fontFamily="Instrument Serif" fontStyle="italic" fontSize="62" fill="currentColor">vibe field notes.</text>
            </svg>
          </div>
          <div className="v5-cat-feature-copy">
            <div className="v5-cardline">
              <span>{V5ArticleKind(hero)}</span>
              <span>{hero.read}</span>
              <span>{hero.author}</span>
            </div>
            <h3>{hero.title}</h3>
            <p>{hero.body}</p>
            <a>פתח טמפלט מאמר ↙</a>
          </div>
        </article>

        <aside className="v5-cat-side" data-v5-reveal style={{'--ex':'-24px'}}>
          <h3><span className="serif">מסלולי</span> קריאה</h3>
          {V5_PATHS.map((path, i) => (
            <a key={path.label} className={`v5-path v5-path-${path.tone}`} style={{'--rot': `${i % 2 ? -1.6 : 1.4}deg`}}>
              <span className="mono">TRACK {String(i+1).padStart(2,'0')} · {path.count}</span>
              <strong>{path.label}</strong>
              <em>{path.title}</em>
            </a>
          ))}
        </aside>

        <div className="v5-cat-grid">
          {visible.map((a, i) => (
            <article key={a.id} className={`v5-cat-card v5-cat-card-${a.color}`} data-v5-reveal style={{'--delay': `${i * 0.04}s`}}>
              <div className="v5-cardline">
                <span>{V5ArticleKind(a)}</span>
                <span>{a.cat}</span>
              </div>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
              <div className="v5-cat-card-foot">
                <span className="mono">{a.author}</span>
                <span className="mono">{a.read}</span>
                <a>↙</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============== ARTICLE TEMPLATE — longform page mock ==============
function V5ArticleTemplate() {
  return (
    <section className="v5-article-template">
      <div className="v5-article-paper"></div>
      <div className="v5-article-top" data-v5-reveal>
        <div className="v5-article-labels">
          <span>§05 — ARTICLE TEMPLATE</span>
          <span>מדריך / מאמר / השוואה</span>
          <span>RTL READY</span>
        </div>
        <h2>
          בונים סוכן AI ב־Cursor:
          <span className="serif"> מהפתק הראשון לפרודקשן.</span>
        </h2>
        <p>
          הטמפלט הזה בנוי למאמר ארוך, מדריך פרקטי או השוואת מודלים. הוא שומר על השפה של E:
          נייר, שולחן מערכת, הערות בצד, אבל נותן חוויית קריאה נקייה מספיק כדי לא לעייף.
        </p>
      </div>

      <div className="v5-article-shell">
        <aside className="v5-article-rail" data-v5-reveal style={{'--ex':'26px'}}>
          <div className="v5-rail-card">
            <strong>TL;DR</strong>
            <p>Cursor + MCP + מודל טוב הם לא מוצר. צריך גבולות, בדיקות, לוגים ו־rollback.</p>
          </div>
          <div className="v5-rail-card v5-rail-dark">
            <span className="mono">READING MAP</span>
            {V5_ARTICLE_OUTLINE.map((item, i) => (
              <a key={item}><em>{String(i+1).padStart(2,'0')}</em>{item}</a>
            ))}
          </div>
          <div className="v5-rail-note">לא עוד “AI יעשה הכל”. יותר כמו: AI יעשה הרבה, ואתה תהיה המבוגר האחראי בחדר.</div>
        </aside>

        <article className="v5-longform" data-v5-reveal>
          <div className="v5-longform-meta">
            <span>מדריך</span>
            <span>09.05.2026</span>
            <span>יואב לוי</span>
            <span>11 דק׳</span>
          </div>

          <div className="v5-longform-hero">
            <V5ArticleVisual/>
          </div>

          <p className="lead">
            כל שבוע נולד כלי חדש שמבטיח “אפליקציה בפרומפט אחד”. בפועל, ההבדל בין דמו יפה לבין מוצר שאפשר לסמוך עליו
            הוא לא הקסם של המודל, אלא השיטה שמקיפה אותו.
          </p>

          <h3>1. מתחילים מבעיה קטנה, לא מסוכן כל־יכול</h3>
          <p>
            הטעות הקלאסית היא לבנות סוכן שמנהל את כל החיים. במקום זה, בוחרים פעולה אחת שחוזרת על עצמה:
            סיכום PR, יצירת טיוטת מסמך, בדיקת issue, או בניית קומפוננטה מתוך brief.
          </p>

          <blockquote>
            “וייב קודינג טוב הוא לא לוותר על ארכיטקטורה. הוא להזיז אותה קדימה מהר יותר.”
          </blockquote>

          <div className="v5-method-card">
            <span className="mono">PROMPT CONTRACT</span>
            <code>{`role: senior implementation agent
input: issue + repo context
rules: ask only when blocked
output: patch + tests + risks`}</code>
          </div>

          <h3>2. בונים שלוש שכבות: מודל, כלים, שמירה</h3>
          <p>
            למודל נותנים יכולת לחשוב, לכלים נותנים יכולת לבצע, ולשכבת השמירה נותנים את הכוח לעצור אותו.
            זה המקום שבו MCP, הרשאות, בדיקות ו־CI הופכים מאביזרים ל־infrastructure.
          </p>

          <div className="v5-compare-strip">
            <div><span>דמו</span><strong>prompt → wow</strong><em>מהיר, שביר</em></div>
            <div><span>מוצר</span><strong>context → tools → tests</strong><em>איטי יותר, אמיתי</em></div>
            <div><span>צוות</span><strong>agent → review → ship</strong><em>הקצב הנכון</em></div>
          </div>

          <h3>3. משחררים רק אחרי שיש דרך לדעת שנשבר</h3>
          <p>
            אם אין לוגים, אין מוצר. אם אין rollback, אין אומץ לשחרר. ואם אין מדד הצלחה אחד, אין דרך לדעת אם הסוכן באמת
            עוזר או רק עושה רעש יפה.
          </p>
        </article>

        <aside className="v5-related" data-v5-reveal style={{'--ex':'-26px'}}>
          <h3>המשך קריאה</h3>
          {V5_RELATED.map(item => (
            <a key={item.title}>
              <strong>{item.title}</strong>
              <span className="mono">{item.meta}</span>
            </a>
          ))}
        </aside>
      </div>
    </section>
  );
}

function V5ArticleVisual() {
  return (
    <svg viewBox="0 0 920 430" preserveAspectRatio="xMidYMid slice">
      <rect width="920" height="430" fill="#11110d"/>
      <g opacity="0.23" stroke="#f4f0e8">
        {[...Array(16)].map((_, i) => <line key={'h'+i} x1="0" y1={i*32} x2="920" y2={i*32}/>)}
        {[...Array(28)].map((_, i) => <line key={'v'+i} x1={i*36} y1="0" x2={i*36} y2="430"/>)}
      </g>
      <g transform="translate(120 78)">
        <rect x="0" y="0" width="260" height="170" rx="18" fill="#88a884"/>
        <text x="28" y="62" fontFamily="JetBrains Mono" fontSize="24" fontWeight="700" fill="#11110d">{'{issue}'}</text>
        <text x="28" y="108" fontFamily="Heebo" fontSize="34" fontWeight="900" fill="#11110d">בעיה קטנה</text>
      </g>
      <path d="M392 160 C482 80 520 270 620 170" stroke="#7da4be" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <g transform="translate(610 132) rotate(-4)">
        <rect x="0" y="0" width="210" height="140" rx="18" fill="#c0d8e8"/>
        <text x="26" y="58" fontFamily="Instrument Serif" fontStyle="italic" fontSize="52" fill="#11110d">agent.</text>
        <text x="28" y="98" fontFamily="JetBrains Mono" fontSize="14" fill="#11110d">tools + tests</text>
      </g>
      <circle cx="500" cy="330" r="54" fill="#b89cc4"/>
      <text x="500" y="340" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="18" fontWeight="700" fill="#11110d">SHIP</text>
      <text x="52" y="376" fontFamily="Instrument Serif" fontStyle="italic" fontSize="74" fill="#f4f0e8">from chaos to production.</text>
    </svg>
  );
}

// ============== INFINITY CANVAS — 3 streams ==============
function V5Canvas() {
  return (
    <section className="v5-canvas">
      <div className="v5-canvas-head">
        <div className="v5-eyebrow">[ §06 — INFINITY ]</div>
        <h2>הכל זורם. <span className="serif">לכל הכיוונים.</span></h2>
      </div>
      <div className="v5-streams">
        <V5Stream items={V5_CATS.map(c => ({ kind:'cat', ...c }))} dir="ltr" speed="60s" tone="cat"/>
        <V5Stream items={V5_ARTICLES.map(a => ({ kind:'art', ...a }))} dir="rtl" speed="80s" tone="art"/>
        <V5Stream items={V5_QUOTES.map((q, i) => ({ kind:'q', q, i }))} dir="ltr" speed="100s" tone="q"/>
      </div>
    </section>
  );
}

function V5Stream({ items, dir, speed, tone }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className={`v5-stream tone-${tone}`} style={{'--speed': speed, '--dir': dir==='ltr'?'normal':'reverse'}}>
      <div className="v5-stream-track">
        {doubled.map((it, idx) => {
          if (it.kind === 'cat')  return <V5StreamCat  key={idx} c={it}/>;
          if (it.kind === 'art')  return <V5StreamArt  key={idx} a={it}/>;
          return <V5StreamQ key={idx} q={it.q}/>;
        })}
      </div>
    </div>
  );
}

function V5StreamCat({ c }) {
  return (
    <a className="v5-s-cat">
      <span className="serif">{c.en}</span>
      <span className="he">{c.he}</span>
      <span className="mono">{c.count}</span>
    </a>
  );
}

function V5StreamArt({ a }) {
  return (
    <a className={`v5-s-art tone-${a.color}`}>
      <span className="mono">{a.cat}</span>
      <strong>{a.title}</strong>
      <span className="v5-s-art-arrow">↗</span>
    </a>
  );
}

function V5StreamQ({ q }) {
  return (
    <span className="v5-s-q">
      <span className="serif">{q}</span>
      <span className="v5-s-q-dot">·</span>
    </span>
  );
}

// ============== TICKER ==============
const V5_TICKER = [
  { time: '14:32', text: 'Anthropic משיקה את Claude 5 Opus' },
  { time: '14:18', text: 'GPT-5o זמין עכשיו ב-API במחיר נמוך ב-40%' },
  { time: '13:55', text: 'מדריך חדש: בניית סוכן AI מלא ב-Cursor' },
  { time: '13:41', text: 'Bolt.new עוקפת את v0 בבנצ׳מרק יצירת אפליקציות' },
  { time: '13:22', text: 'Lovable מגייסת 100M$ בסבב סדרה B' },
];
function V5Ticker() {
  const items = [...V5_TICKER, ...V5_TICKER, ...V5_TICKER];
  return (
    <div className="v5-ticker">
      <div className="v5-ticker-label">LIVE</div>
      <div className="v5-ticker-track">
        {items.map((t, i) => (
          <div key={i} className="v5-ticker-item">
            <span className="mono">{t.time}</span>
            <span>{t.text}</span>
            <span className="v5-ticker-sep">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function V5Cta() {
  return (
    <section className="v5-cta">
      <div className="v5-cta-ghost">JOIN · JOIN · JOIN</div>
      <h2>לחץ על הכפתור.<br/><span className="serif">הכל יגיע אליך.</span></h2>
      <p>בלי טופס. בלי אימייל. רק WhatsApp / Telegram / Messenger.</p>
      <div className="v5-cta-row">
        <button className="v5-cta-btn primary">הצטרף ב־WhatsApp <span>↗</span></button>
        <button className="v5-cta-btn ghost">Telegram ↗</button>
        <button className="v5-cta-btn ghost">Messenger ↗</button>
      </div>
    </section>
  );
}

function V5Foot() {
  return (
    <footer className="v5-foot">
      <div className="v5-foot-top">
        <div>
          <div className="mono">© 2026 NVISION AI · TEL AVIV</div>
          <div className="mono" style={{marginTop: 8}}>VIBE CODE NEWS · ISSUE №247</div>
        </div>
        <div className="v5-foot-cols">
          <div><h5>CONTENT</h5><a>חדשות</a><a>מאמרים</a><a>מדריכים</a><a>קייסים</a></div>
          <div><h5>CHANNELS</h5><a>WhatsApp ↗</a><a>Telegram ↗</a><a>Messenger ↗</a><a>RSS</a></div>
          <div><h5>LEGAL</h5><a>פרטיות</a><a>תנאים</a><a>צור קשר</a></div>
        </div>
      </div>
      <div className="v5-foot-mark">nVision<span>.</span></div>
    </footer>
  );
}

function VariationFive() {
  useV5Reveal();
  return (
    <div className="v5-root" dir="rtl">
      <V5Nav/>
      <main className="v5-hero">
        <div className="v5-paper"></div>
        <div className="v5-grain"></div>
        <V5Keywords/>
        <V5Title/>
      </main>
      <V5Ticker/>
      <V5Newsroom/>
      <V5ArticleWall/>
      <V5CategoryPage/>
      <V5ArticleTemplate/>
      <V5Canvas/>
      <V5Cta/>
      <V5Foot/>
    </div>
  );
}

window.VariationFive = VariationFive;
