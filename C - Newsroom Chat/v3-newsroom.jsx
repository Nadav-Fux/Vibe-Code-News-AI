// ============== VARIATION 3: THE NEWSROOM-IN-A-CHAT ==============
// Concept: The website IS a WhatsApp conversation, scaled up.
// Brutalist editorial column on the left + giant chat panel on the right.
// Single accent: WhatsApp green (#25D366). Bone paper + pure ink.
// Articles, leaderboards, prompts — all rendered as message cards.

const { useState: useV3S, useEffect: useV3E, useRef: useV3R } = React;

// Live chat-style message stream that includes RICH cards (not just text)
const V3_FEED = [
  { type: 'system', text: 'היום · 02 במאי 2026' },
  { type: 'msg', time: '09:14', tag: 'AI חדשות', text: 'בוקר טוב. Anthropic משיקה את Claude 5 Opus. ביצועים פי 2 על SWE-bench.', urgent: true },
  { type: 'card-article', time: '09:18', cat: 'מאמר דעה', title: 'Vibe Coding הוא לא סוף הפיתוח. הוא ההתחלה.', author: 'נדב גלעד', read: '8 דק׳' },
  { type: 'msg', time: '10:02', tag: 'מודלים', text: 'GPT-5o זמין ב-API. מחיר נמוך ב-40%.' },
  { type: 'card-leaderboard', time: '10:30' },
  { type: 'msg', time: '11:15', tag: 'מדריכים', text: '🔥 מדריך חדש למעלה: בונים סוכן AI מלא ב-Cursor + MCP ב-30 דקות.' },
  { type: 'card-tools', time: '12:04' },
  { type: 'msg', time: '13:22', tag: 'גינרוט', text: 'Jailbreak חדש ל-Gemini 2.5 — אתי, חוקי, עובד.', urgent: true },
  { type: 'card-prompts', time: '13:55' },
  { type: 'msg', time: '14:32', tag: 'חדשות', text: 'Lovable מגייסת 100M$ בסבב סדרה B. הערכת שווי: 1.2B.' },
];

// ===== HEADER (the "site nav" looks like a chat header gone large) =====
function V3Nav() {
  return (
    <header className="v3-nav">
      <div className="v3-nav-l">
        <div className="v3-mark">
          <svg viewBox="0 0 60 60">
            <rect x="0" y="0" width="60" height="60" rx="14" fill="#0a0a0a"/>
            <path d="M14 18 Q14 12 20 12 L40 12 Q46 12 46 18 L46 36 Q46 42 40 42 L26 42 L18 50 L20 42 L20 42 Q14 42 14 36 Z" fill="#25D366"/>
            <text x="30" y="32" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fontWeight="700" fill="#0a0a0a">n.</text>
          </svg>
        </div>
        <div className="v3-name-block">
          <div className="v3-name-l1"><strong>nVision AI</strong> <span className="v3-verified">✓</span></div>
          <div className="v3-name-l2 mono">CHANNEL · 12,847 SUBSCRIBERS</div>
        </div>
      </div>

      <nav className="v3-nav-c">
        <a data-cursor>חדשות</a>
        <a data-cursor>מאמרים</a>
        <a data-cursor>מדריכים</a>
        <a data-cursor>כלים</a>
        <a data-cursor>קהילה</a>
      </nav>

      <div className="v3-nav-r">
        <button className="v3-search-btn" data-cursor data-cursor-label="חיפוש">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <button className="v3-join-btn" data-cursor data-cursor-label="הצטרף">
          הצטרף לערוץ
          <span className="v3-join-arrow">↗</span>
        </button>
      </div>
    </header>
  );
}

// ===== HERO — split: editorial left, chat right =====
function V3Hero() {
  const ctaRef = useMagnetic(0.45);
  return (
    <section className="v3-hero">
      <div className="v3-hero-grid">
        <div className="v3-hero-l">
          <div className="v3-meta-row mono">
            <span><span className="v3-live-dot"></span> LIVE · 02.05.2026 · 14:32</span>
            <span>ISSUE №247</span>
          </div>

          <div className="v3-eyebrow mono" data-reveal>
            <span>[ THE PRODUCT IS THE CHAT ]</span>
          </div>

          <h1 className="v3-h1">
            <span className="v3-h1-line" data-reveal>
              <span className="v3-num">01.</span>
              <span>חדשות AI</span>
            </span>
            <span className="v3-h1-line" data-reveal style={{transitionDelay:'0.08s'}}>
              <span className="v3-num">02.</span>
              <span>בעברית</span>
            </span>
            <span className="v3-h1-line v3-h1-accent" data-reveal style={{transitionDelay:'0.16s'}}>
              <span className="v3-num">03.</span>
              <span className="serif">בוואטסאפ.</span>
            </span>
          </h1>

          <div className="v3-divider"></div>

          <div className="v3-hero-meta-grid">
            <div className="v3-meta-block">
              <div className="mono">FORMAT</div>
              <strong>WhatsApp Channel</strong>
            </div>
            <div className="v3-meta-block">
              <div className="mono">CADENCE</div>
              <strong>Live · 24/7</strong>
            </div>
            <div className="v3-meta-block">
              <div className="mono">LANG</div>
              <strong>עברית · EN terms</strong>
            </div>
            <div className="v3-meta-block">
              <div className="mono">COVERS</div>
              <strong>AI · Vibe Coding</strong>
            </div>
          </div>

          <p className="v3-hero-p" data-reveal style={{transitionDelay:'0.24s'}}>
            הניוזרום היחיד בארץ שמתפרסם בערוץ וואטסאפ. <strong>מבזקים, מאמרים, מדריכים, השוואות וכלים</strong> — הכול מגיעים אליך כהודעה. לא פיד. לא ניוזלטר. שיחה.
          </p>

          <div className="v3-hero-cta-row">
            <button ref={ctaRef} className="v3-btn-primary" data-cursor data-cursor-label="JOIN">
              <span className="v3-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12C3 7 7 3 12 3C17 3 21 7 21 12C21 17 17 21 12 21H3L4.5 17.5C3.5 16 3 14 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
              </span>
              הצטרף ב־WhatsApp
            </button>
            <button className="v3-btn-link" data-cursor>או Telegram ↗</button>
          </div>

          <div className="v3-trust-row">
            <div className="v3-trust-stack">
              {['NG','YL','RM','DK','+'].map((a,i)=>(
                <div key={i} className="v3-trust-av" style={{background: i===4?'#25D366':'#0a0a0a', color:i===4?'#0a0a0a':'#fafaf7'}}>{a}</div>
              ))}
            </div>
            <div>
              <strong>12,847</strong>
              <span className="mono">SUBSCRIBERS · GROWING +47/DAY</span>
            </div>
          </div>
        </div>

        <div className="v3-hero-r">
          <V3PhoneFrame />
        </div>
      </div>
    </section>
  );
}

// ===== THE PHONE — central object =====
function V3PhoneFrame() {
  const [skin, setSkin] = useV3S('whatsapp');
  return (
    <div className="v3-phone-stage">
      <div className="v3-phone-tabs">
        <span className="mono">SKIN:</span>
        {[['whatsapp','WhatsApp'],['telegram','Telegram'],['messenger','Messenger']].map(([k,n])=>(
          <button key={k} className={`v3-skin-tab ${skin===k?'active':''}`} onClick={()=>setSkin(k)} data-cursor>{n}</button>
        ))}
      </div>

      <div className="v3-phone">
        <div className="v3-phone-notch"></div>
        <div className="v3-phone-screen">
          <V3ChatStream skin={skin} />
        </div>
      </div>

      <div className="v3-phone-caption mono">
        <span>↑</span>
        <span>FIG. 01 — האתר הזה הוא הערוץ הזה.</span>
      </div>
    </div>
  );
}

// ===== Chat stream that lives inside the phone =====
function V3ChatStream({ skin }) {
  const scrollerRef = useV3R(null);
  const [shown, setShown] = useV3S(4);
  const [typing, setTyping] = useV3S(false);

  useV3E(() => {
    if (shown >= V3_FEED.length) return;
    const t = setTimeout(() => {
      setTyping(true);
      const t2 = setTimeout(() => {
        setTyping(false);
        setShown(s => s + 1);
      }, 1400);
      return () => clearTimeout(t2);
    }, 3500);
    return () => clearTimeout(t);
  }, [shown]);

  useV3E(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [shown, typing]);

  const skinCfg = {
    whatsapp: { headerBg:'#075E54', bg:'#ECE5DD', bubble:'#fff', accent:'#25D366', name:'nVision · AI', pattern:true },
    telegram: { headerBg:'#517DA2', bg:'#E7EBF0', bubble:'#fff', accent:'#2AABEE', name:'nVision · Channel', pattern:false },
    messenger:{ headerBg:'#fff', bg:'#fff', bubble:'#F0F0F0', accent:'#0084FF', name:'nVision · AI', pattern:false },
  };
  const cfg = skinCfg[skin];

  return (
    <div className={`v3-chat v3-chat-${skin}`}>
      <div className="v3-chat-header" style={{background:cfg.headerBg, color: skin==='messenger'?'#050505':'#fff'}}>
        <span className="v3-chat-back">‹</span>
        <div className="v3-chat-av" style={{background:cfg.accent}}>n.</div>
        <div className="v3-chat-h-meta">
          <strong>{cfg.name}</strong>
          <span>{typing ? 'כותב/ת...' : '12,847 חברים'}</span>
        </div>
        <div className="v3-chat-icons"><span>⌕</span><span>⋮</span></div>
      </div>

      <div ref={scrollerRef} className={`v3-chat-body ${cfg.pattern?'v3-wa-pattern':''}`} style={{background:cfg.bg}}>
        {V3_FEED.slice(0, shown).map((m, i) => <V3ChatItem key={i} m={m} cfg={cfg} skin={skin} fresh={i===shown-1}/>)}
        {typing && (
          <div className="v3-msg-row">
            <div className="v3-bubble" style={{background:cfg.bubble}}>
              <div className="v3-typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
      </div>

      <div className="v3-chat-input" style={{background: skin==='messenger'?'#fff':'#F0F2F5'}}>
        <span>+</span>
        <div className="v3-chat-fake-input">הצטרפ/י כדי לקבל מבזקים...</div>
        <button className="v3-chat-send" style={{background:cfg.accent}} data-cursor>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12L19 12M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

function V3ChatItem({ m, cfg, skin, fresh }) {
  if (m.type === 'system') {
    return <div className="v3-system"><span>{m.text}</span></div>;
  }
  if (m.type === 'msg') {
    return (
      <div className={`v3-msg-row ${fresh?'fresh':''}`}>
        <div className="v3-bubble" style={{background:cfg.bubble}}>
          {m.urgent && <span className="v3-urgent">⚡ מבזק</span>}
          <span className="v3-tag" data-tag={m.tag}>{m.tag}</span>
          <p>{m.text}</p>
          <div className="v3-time">{m.time} <V3Checks color={cfg.accent}/></div>
        </div>
      </div>
    );
  }
  if (m.type === 'card-article') {
    return (
      <div className={`v3-msg-row ${fresh?'fresh':''}`}>
        <div className="v3-bubble v3-bubble-rich" style={{background:cfg.bubble}}>
          <div className="v3-rich-art">
            <svg viewBox="0 0 280 120" preserveAspectRatio="xMidYMid slice">
              <rect width="280" height="120" fill="#0a0a0a"/>
              <text x="20" y="60" fontFamily="Heebo" fontWeight="900" fontSize="36" fill="#fafaf7" letterSpacing="-0.04em">VIBE</text>
              <text x="20" y="92" fontFamily="Instrument Serif" fontStyle="italic" fontSize="28" fill="#25D366">{`coding.`}</text>
              <circle cx="240" cy="60" r="32" fill="#25D366"/>
            </svg>
          </div>
          <div className="v3-rich-body">
            <span className="v3-tag" data-tag={m.cat}>{m.cat}</span>
            <strong>{m.title}</strong>
            <div className="v3-rich-meta mono">{m.author} · {m.read}</div>
          </div>
          <div className="v3-time">{m.time} <V3Checks color={cfg.accent}/></div>
        </div>
      </div>
    );
  }
  if (m.type === 'card-leaderboard') {
    return (
      <div className={`v3-msg-row ${fresh?'fresh':''}`}>
        <div className="v3-bubble v3-bubble-rich" style={{background:cfg.bubble}}>
          <div className="v3-rich-head">
            <strong>📊 Leaderboard · השבוע</strong>
            <span className="mono">SWE-BENCH</span>
          </div>
          <div className="v3-mini-lb">
            {LEADERBOARD.slice(0,4).map((row,i)=>(
              <div key={i} className="v3-lb-row">
                <span className="mono">{String(i+1).padStart(2,'0')}</span>
                <strong>{row.name}</strong>
                <span className="v3-lb-bar"><span style={{width:`${row.score}%`, background:cfg.accent}}></span></span>
                <span className={`mono v3-lb-c ${row.change.startsWith('+')?'up':row.change.startsWith('-')?'down':''}`}>{row.change}</span>
              </div>
            ))}
          </div>
          <div className="v3-time">{m.time} <V3Checks color={cfg.accent}/></div>
        </div>
      </div>
    );
  }
  if (m.type === 'card-tools') {
    return (
      <div className={`v3-msg-row ${fresh?'fresh':''}`}>
        <div className="v3-bubble v3-bubble-rich" style={{background:cfg.bubble}}>
          <div className="v3-rich-head">
            <strong>🛠 כלים · השבוע</strong>
            <span className="mono">TOP 4</span>
          </div>
          <div className="v3-tools-mini">
            {TOOLS_SHOWCASE.slice(0,4).map((t,i)=>(
              <div key={i} className="v3-tool-mini">
                <div className="v3-tool-mini-i" style={{background:cfg.accent}}>{t.name[0]}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span className="mono">{t.cat} · {t.score}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="v3-time">{m.time} <V3Checks color={cfg.accent}/></div>
        </div>
      </div>
    );
  }
  if (m.type === 'card-prompts') {
    return (
      <div className={`v3-msg-row ${fresh?'fresh':''}`}>
        <div className="v3-bubble v3-bubble-rich" style={{background:cfg.bubble}}>
          <div className="v3-rich-head">
            <strong>🔥 Trending Prompts</strong>
            <span className="mono">LIVE</span>
          </div>
          <div className="v3-prompts-mini">
            {TRENDING_PROMPTS.slice(0,3).map((p,i)=>(
              <div key={i} className="v3-prompt-mini">
                <span className="mono">#{p.rank}</span>
                <strong>{p.title}</strong>
                <span className="mono">{p.uses}</span>
              </div>
            ))}
          </div>
          <div className="v3-time">{m.time} <V3Checks color={cfg.accent}/></div>
        </div>
      </div>
    );
  }
  return null;
}

function V3Checks({ color }) {
  return <svg width="14" height="9" viewBox="0 0 14 9" fill="none" style={{marginInlineStart:4, verticalAlign:'middle'}}><path d="M1 4.5L4 7.5L9 1.5M5 7.5L8 4.5L13 1.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

// ===== INDEX (the categories, brutalist style) =====
function V3Index() {
  const cats = [
    { num:'01', he:'AI חדשות', en:'AI News', count: 247 },
    { num:'02', he:'Vibe Coding', en:'Vibe Coding', count: 89 },
    { num:'03', he:'מודלים', en:'Models', count: 64 },
    { num:'04', he:'מדריכים', en:'Guides', count: 142 },
    { num:'05', he:'כלים', en:'Tools', count: 96 },
    { num:'06', he:'מאמרי דעה', en:'Op-eds', count: 38 },
    { num:'07', he:'בנצ׳מרקים', en:'Benchmarks', count: 27 },
    { num:'08', he:'גינרוטים', en:'Prompts', count: 184 },
  ];
  return (
    <section className="v3-section">
      <div className="v3-section-head">
        <span className="mono v3-section-eyebrow">[ §02 — INDEX ]</span>
        <h2 className="v3-h2">קטגוריות. <span className="serif">כל מה שמתפרסם.</span></h2>
      </div>
      <div className="v3-index-table">
        {cats.map((c, i) => (
          <a key={i} className="v3-index-row" data-cursor data-cursor-label={`/${c.en.toLowerCase()}`} data-reveal style={{transitionDelay:`${i*0.04}s`}}>
            <span className="mono v3-index-num">{c.num}</span>
            <span className="v3-index-he">{c.he}</span>
            <span className="mono v3-index-en">/ {c.en}</span>
            <span className="mono v3-index-count">{c.count} פריטים</span>
            <span className="v3-index-arrow">→</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ===== ARCHIVE (latest published — not bento, list-magazine) =====
function V3Archive() {
  return (
    <section className="v3-section">
      <div className="v3-section-head">
        <span className="mono v3-section-eyebrow">[ §03 — ARCHIVE / LATEST ]</span>
        <h2 className="v3-h2">מה התפרסם <span className="serif">השבוע.</span></h2>
      </div>
      <div className="v3-archive">
        {ARTICLES.map((a, i) => (
          <article key={i} className="v3-arch-row" data-cursor data-cursor-label="קרא →" data-reveal style={{transitionDelay:`${i*0.05}s`}}>
            <div className="v3-arch-num mono">№{String(i+1).padStart(3,'0')}</div>
            <div className="v3-arch-cat">
              <span className="mono">{a.cat.toUpperCase()}</span>
              <span className="mono v3-arch-date">{a.date}</span>
            </div>
            <div className="v3-arch-title">
              <h3>{a.title}</h3>
              <p>{a.excerpt}</p>
            </div>
            <div className="v3-arch-author">
              <strong>{a.author}</strong>
              <span className="mono">{a.time}</span>
            </div>
            <div className="v3-arch-arrow">→</div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ===== TICKER MARQUEE — brutalist style =====
function V3Ticker() {
  const items = [...TICKER_MESSAGES, ...TICKER_MESSAGES];
  return (
    <div className="v3-ticker">
      <div className="v3-ticker-label mono">⚡ LIVE FEED</div>
      <div className="v3-ticker-track">
        {items.map((m, i) => (
          <div key={i} className="v3-ticker-item">
            <span className="mono">{m.time}</span>
            <span>{m.text}</span>
            <span className="v3-ticker-sep">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== MANIFESTO BLOCK =====
function V3Manifesto() {
  return (
    <section className="v3-manifesto">
      <div className="mono v3-section-eyebrow">[ §04 — MANIFESTO ]</div>
      <h2 className="v3-mfst-h">
        <span data-reveal>חדשות AI</span>
        <span data-reveal style={{transitionDelay:'0.1s'}}>שמגיעות אליך</span>
        <span data-reveal style={{transitionDelay:'0.2s'}} className="serif">כשאתה לא מחפש.</span>
      </h2>

      <div className="v3-mfst-grid">
        <div className="v3-mfst-block" data-reveal>
          <span className="mono v3-mfst-num">№01</span>
          <h4>בלי פיד אינסופי.</h4>
          <p>בלי המלצות אלגוריתם. בלי scroll-hole. רק מה שצריך לדעת, מתי שצריך, לאן שאתה ממילא מסתכל.</p>
        </div>
        <div className="v3-mfst-block" data-reveal style={{transitionDelay:'0.1s'}}>
          <span className="mono v3-mfst-num">№02</span>
          <h4>עברית קודם. אנגלית כשצריך.</h4>
          <p>מונחים נשארים באנגלית, ההסבר תמיד בעברית. <strong>nVision</strong> זה מקום לישראלים שעובדים עם AI, לא תרגום של TechCrunch.</p>
        </div>
        <div className="v3-mfst-block" data-reveal style={{transitionDelay:'0.2s'}}>
          <span className="mono v3-mfst-num">№03</span>
          <h4>אנשים, לא בוטים.</h4>
          <p>כל מבזק נכתב על־ידי בן אדם שמבין את התחום. עם דעה. עם הקשר. עם הומור לפעמים.</p>
        </div>
      </div>
    </section>
  );
}

// ===== JOIN BLOCK (the only big CTA) =====
function V3Join() {
  const ctaRef = useMagnetic(0.5);
  return (
    <section className="v3-join">
      <div className="v3-join-bg-text mono">JOIN · JOIN · JOIN · JOIN · JOIN ·</div>
      <div className="v3-join-inner">
        <div className="mono v3-section-eyebrow v3-join-eyebrow">[ §05 — JOIN ]</div>
        <h2 className="v3-join-h">
          לחץ על הכפתור.<br/>
          <span className="serif">הכל יגיע אליך.</span>
        </h2>
        <p>בלי טופס. בלי אימייל. רק WhatsApp. הסר/י בכל רגע.</p>
        <div className="v3-join-cta-row">
          <button ref={ctaRef} className="v3-btn-primary v3-btn-huge" data-cursor data-cursor-label="JOIN NOW">
            <span className="v3-btn-icon-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12C3 7 7 3 12 3C17 3 21 7 21 12C21 17 17 21 12 21H3L4.5 17.5C3.5 16 3 14 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
            </span>
            הצטרף ב־WhatsApp
            <span className="v3-btn-arrow-lg">↗</span>
          </button>
          <div className="v3-join-alt">
            <button className="v3-btn-link" data-cursor>Telegram</button>
            <span className="mono">·</span>
            <button className="v3-btn-link" data-cursor>Discord</button>
            <span className="mono">·</span>
            <button className="v3-btn-link" data-cursor>RSS</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== FOOTER =====
function V3Footer() {
  return (
    <footer className="v3-footer">
      <div className="v3-footer-top">
        <div>
          <div className="mono">© 2026 NVISION AI · TEL AVIV</div>
          <div className="mono v3-footer-status">SHIPPING <span className="v3-blink-g"></span></div>
        </div>
        <div className="v3-footer-cols">
          <div>
            <h5 className="mono">CONTENT</h5>
            <a data-cursor>חדשות</a><a data-cursor>מאמרים</a><a data-cursor>מדריכים</a>
          </div>
          <div>
            <h5 className="mono">CHANNELS</h5>
            <a data-cursor>WhatsApp ↗</a><a data-cursor>Telegram ↗</a><a data-cursor>YouTube ↗</a>
          </div>
          <div>
            <h5 className="mono">LEGAL</h5>
            <a data-cursor>פרטיות</a><a data-cursor>תנאים</a><a data-cursor>צור קשר</a>
          </div>
        </div>
      </div>
      <div className="v3-footer-mark">nVision<span style={{color:'#25D366'}}>.</span></div>
    </footer>
  );
}

function VariationThree() {
  useReveal();
  return (
    <div className="v3-root" dir="rtl">
      <CustomCursor accentColor="#25D366" />
      <V3Nav />
      <V3Hero />
      <V3Ticker />
      <V3Index />
      <V3Archive />
      <V3Manifesto />
      <V3Join />
      <V3Footer />
    </div>
  );
}

window.VariationThree = VariationThree;
