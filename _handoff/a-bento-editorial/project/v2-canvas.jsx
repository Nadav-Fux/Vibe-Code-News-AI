// ============== VARIATION 2: INFINITE CANVAS / MOSAIC ==============
// Soft sand/ivory + electric blue accent + lavender. Mosaic with rotated cards,
// drag-feel artboards, WebGL fluid bg. AI-feel: spatial, exploratory.

const { useState: useV2S, useEffect: useV2E, useRef: useV2R } = React;

// ===== WebGL-ish CSS shader background =====
function FluidBackground() {
  return (
    <div className="v2-fluid-bg">
      <div className="v2-fluid-blob v2-blob-1"></div>
      <div className="v2-fluid-blob v2-blob-2"></div>
      <div className="v2-fluid-blob v2-blob-3"></div>
      <div className="v2-fluid-grain"></div>
    </div>
  );
}

function V2Nav() {
  return (
    <nav className="v2-nav">
      <div className="v2-nav-logo" data-cursor>
        <span className="v2-nav-mark">
          <svg viewBox="0 0 40 40" fill="none">
            <rect x="2" y="2" width="36" height="36" rx="10" fill="#0e0e0c"/>
            <circle cx="20" cy="20" r="8" fill="#4760ff"/>
            <circle cx="20" cy="20" r="3" fill="#fff"/>
          </svg>
        </span>
        <div className="v2-nav-name">
          <strong>nVision<span style={{color:'#4760ff'}}>·</span>AI</strong>
          <span className="mono">vibe coding & ai news</span>
        </div>
      </div>
      <ul className="v2-nav-links">
        {['חדשות','מאמרים','מדריכים','כלים','קהילה'].map((l,i) => (
          <li key={i}><a data-cursor>{l}</a></li>
        ))}
      </ul>
      <button className="v2-nav-cta" data-cursor data-cursor-label="הצטרף">
        <span>הצטרף</span>
        <span className="v2-nav-cta-arrow">↗</span>
      </button>
    </nav>
  );
}

function V2Hero() {
  const ctaRef = useMagnetic(0.4);
  const [skin, setSkin] = useS1('telegram');

  return (
    <div className="v2-hero">
      <FluidBackground />

      <div className="v2-hero-meta">
        <div><span className="v2-live-dot"></span><span className="mono">FEED · LIVE · 02.05.26</span></div>
        <div className="mono">↪ ISSUE №247 — INFINITE</div>
      </div>

      <div className="v2-hero-stage">
        <div className="v2-hero-text">
          <h1 className="v2-h1">
            <span className="v2-h1-row" data-reveal>
              <span className="v2-h1-w1">החדשות</span>
              <span className="v2-h1-orbit">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#0e0e0c" strokeWidth="1"/>
                  <circle cx="40" cy="40" r="14" fill="#4760ff"/>
                </svg>
              </span>
            </span>
            <span className="v2-h1-row" data-reveal style={{transitionDelay:'0.1s'}}>
              <span className="serif v2-h1-italic">שמתעדכנות</span>
            </span>
            <span className="v2-h1-row" data-reveal style={{transitionDelay:'0.2s'}}>
              <span className="v2-h1-w3">מהר יותר</span>
              <span className="v2-h1-spark">✦</span>
              <span className="v2-h1-w4">ממך.</span>
            </span>
          </h1>

          <div className="v2-hero-sub">
            <p data-reveal style={{transitionDelay:'0.32s'}}>
              <strong>nVision AI</strong> — מבזקים, מאמרים, מדריכים, השוואות וכלים.
              עברית ראשונה. <span className="serif">AI</span> &amp; <span className="serif">Vibe Coding</span> בקצב של חדר חדשות.
            </p>
            <div className="v2-hero-actions">
              <button ref={ctaRef} className="v2-btn-primary" data-cursor data-cursor-label="לכל הכתבות">
                כל הכתבות
                <span className="v2-btn-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
              <button className="v2-btn-ghost" data-cursor>ניוזלטר ↗</button>
            </div>
          </div>
        </div>

        <div className="v2-hero-chat-wrap">
          <div className="v2-floating-tag v2-tag-1">
            <span className="mono">live · 12,847 חברים</span>
          </div>
          <div className="v2-floating-tag v2-tag-2">
            <span>✦</span><span className="serif">חם</span>
          </div>
          <ChatPanel skin={skin} onSkinChange={setSkin} variant="v2" />
        </div>
      </div>
    </div>
  );
}

// ===== INFINITE MOSAIC CANVAS =====
function V2Mosaic() {
  return (
    <section className="v2-section v2-mosaic-section">
      <div className="v2-section-head" data-reveal>
        <div className="v2-eyebrow">
          <span className="mono">[ 02 / TODAY ]</span>
        </div>
        <h2 className="v2-h2">
          המבחר של <span className="serif">המערכת.</span>
        </h2>
      </div>

      <div className="v2-mosaic">
        {/* Row 1 */}
        <div className="v2-mosaic-row v2-row-1">
          <article className="v2-tile v2-tile-feature" data-cursor data-cursor-label="קרא →" data-reveal>
            <div className="v2-tile-bg v2-bg-coral">
              <svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="v2dots" width="14" height="14" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.8" fill="#0e0e0c" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="600" height="380" fill="#f4d4c9"/>
                <rect width="600" height="380" fill="url(#v2dots)"/>
                <g transform="translate(440 130)">
                  <circle r="100" fill="#4760ff"/>
                  <circle r="60" fill="#0e0e0c"/>
                  <circle r="22" fill="#fff"/>
                </g>
                <text x="40" y="340" fontFamily="Instrument Serif" fontStyle="italic" fontSize="44" fill="#0e0e0c">vibe.</text>
              </svg>
            </div>
            <div className="v2-tile-body">
              <div className="v2-tile-meta">
                <span className="v2-tile-cat">מאמר דעה</span>
                <span className="mono">8 דק׳</span>
              </div>
              <h3>Vibe Coding הוא לא <span className="serif">סוף</span> הפיתוח. הוא ההתחלה.</h3>
              <div className="v2-tile-author">
                <div className="v2-tile-av">NG</div>
                <span><strong>נדב גלעד</strong> · Founder</span>
              </div>
            </div>
          </article>

          <article className="v2-tile v2-tile-vert" data-cursor data-cursor-label="מדריך →" data-reveal>
            <div className="v2-tile-bg v2-bg-sage">
              <svg viewBox="0 0 320 480" preserveAspectRatio="xMidYMid slice">
                <rect width="320" height="480" fill="#dde7d8"/>
                <g transform="translate(160 200)">
                  <rect x="-70" y="-70" width="140" height="140" fill="#0e0e0c" transform="rotate(8)"/>
                  <rect x="-50" y="-50" width="140" height="140" fill="#4760ff" transform="rotate(-4)"/>
                  <text x="0" y="14" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="44" fontWeight="700" fill="#fff">{`{ai}`}</text>
                </g>
                <text x="20" y="450" fontFamily="JetBrains Mono" fontSize="11" fill="#0e0e0c" letterSpacing="2">$ npx create-agent</text>
              </svg>
            </div>
            <div className="v2-tile-body">
              <div className="v2-tile-meta">
                <span className="v2-tile-cat">מדריך</span>
                <span className="mono">6 דק׳</span>
              </div>
              <h3>סוכן AI ב־<span className="serif">Cursor.</span> 30 דקות.</h3>
            </div>
          </article>
        </div>

        {/* Row 2 — three smaller */}
        <div className="v2-mosaic-row v2-row-2">
          <article className="v2-tile v2-tile-square v2-tilt-1" data-cursor data-reveal>
            <div className="v2-tile-bg v2-bg-ink">
              <svg viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice">
                <rect width="320" height="320" fill="#0e0e0c"/>
                <g stroke="#3a3a37" strokeWidth="0.5">
                  {[...Array(8)].map((_,i)=>(<line key={i} x1="0" y1={i*40} x2="320" y2={i*40}/>))}
                </g>
                <path d="M20 240 L70 200 L120 220 L170 140 L220 160 L270 80 L300 100" stroke="#4760ff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 260 L70 240 L120 230 L170 190 L220 200 L270 150 L300 160" stroke="#c9a3e8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"/>
                <circle cx="270" cy="80" r="6" fill="#4760ff"/>
                <text x="20" y="40" fontFamily="JetBrains Mono" fontSize="11" fill="#fff" opacity="0.7">SWE-bench</text>
              </svg>
            </div>
            <div className="v2-tile-body v2-tile-body-dark">
              <div className="v2-tile-meta"><span className="v2-tile-cat-light">בנצ׳מרק</span></div>
              <h3>GPT-5o vs <span className="serif">Claude 5</span></h3>
            </div>
          </article>

          <article className="v2-tile v2-tile-square v2-tile-leaderboard" data-cursor data-reveal>
            <div className="v2-tile-body v2-pad-md">
              <div className="v2-tile-meta">
                <span className="v2-tile-cat">Live · Leaderboard</span>
                <span className="v2-pulse-tiny"></span>
              </div>
              <h3 className="v2-tile-title-sm">מודלים · השבוע</h3>
              <div className="v2-mini-lb">
                {LEADERBOARD.slice(0,4).map((m,i) => (
                  <div key={i} className={`v2-mini-row ${m.leader?'leader':''}`}>
                    <span className="mono">0{i+1}</span>
                    <strong>{m.name}</strong>
                    <span className="v2-mini-bar"><span style={{width:`${m.score}%`}}></span></span>
                    <span className={`v2-mini-change ${m.change.startsWith('+')?'up':m.change.startsWith('-')?'down':''}`}>{m.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="v2-tile v2-tile-square v2-tilt-2" data-cursor data-reveal>
            <div className="v2-tile-bg v2-bg-lavender">
              <svg viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice">
                <rect width="320" height="320" fill="#dccfee"/>
                <g transform="translate(160 160)">
                  <circle r="100" fill="none" stroke="#0e0e0c" strokeWidth="1.5" strokeDasharray="3 6"/>
                  <circle r="60" fill="#0e0e0c"/>
                  <text x="0" y="6" textAnchor="middle" fontFamily="Instrument Serif" fontStyle="italic" fontSize="36" fill="#dccfee">jail.</text>
                  <circle cx="-90" cy="-40" r="10" fill="#4760ff"/>
                  <circle cx="90" cy="60" r="14" fill="#fff"/>
                </g>
              </svg>
            </div>
            <div className="v2-tile-body">
              <div className="v2-tile-meta">
                <span className="v2-tile-cat-warn">גינרוט · אתי</span>
                <span className="mono">3 דק׳</span>
              </div>
              <h3>הפרומפט שמשגע<br/>את <span className="serif">Gemini.</span></h3>
            </div>
          </article>
        </div>

        {/* Row 3 — wide tools showcase + small */}
        <div className="v2-mosaic-row v2-row-3">
          <article className="v2-tile v2-tile-tools" data-reveal>
            <div className="v2-tile-body v2-pad-md">
              <div className="v2-tile-meta">
                <span className="v2-tile-cat">12 כלי AI · Showcase</span>
                <span className="mono">↗ הכל</span>
              </div>
              <h3 className="v2-tile-title-sm">מה שמפתחים אוהבים <span className="serif">השבוע.</span></h3>
              <div className="v2-tools-row">
                {TOOLS_SHOWCASE.map((t,i) => (
                  <div key={i} className="v2-tool-chip" data-cursor data-cursor-label={t.name}>
                    <div className="v2-tool-icon">{t.name[0]}</div>
                    <div>
                      <strong>{t.name}</strong>
                      <span className="mono">{t.cat} · {t.score}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="v2-tile v2-tile-square v2-tilt-3 v2-tile-trending" data-cursor data-reveal>
            <div className="v2-tile-body v2-pad-md">
              <div className="v2-tile-meta">
                <span className="v2-tile-cat">🔥 Trending Prompts</span>
              </div>
              <h3 className="v2-tile-title-sm">הפרומפטים<br/><span className="serif">החמים.</span></h3>
              <div className="v2-prompts-mini">
                {TRENDING_PROMPTS.map((p,i) => (
                  <div key={i} className="v2-prompt-row">
                    <span className="mono">#{p.rank}</span>
                    <strong>{p.title}</strong>
                    <span className="mono v2-prompt-uses">{p.uses}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

// ===== CATEGORIES — DRIFTING CARDS =====
function V2Categories() {
  return (
    <section className="v2-section v2-cats-section">
      <div className="v2-section-head" data-reveal>
        <div className="v2-eyebrow"><span className="mono">[ 03 / EXPLORE ]</span></div>
        <h2 className="v2-h2">קטגוריות. <span className="serif">בחרו טעם.</span></h2>
      </div>
      <div className="v2-cats-grid">
        {CATEGORIES.map((c, i) => (
          <a key={i} className={`v2-cat-card v2-cat-${i%4}`} data-cursor data-cursor-label={`עיין · ${c}`}>
            <span className="v2-cat-num mono">{String(i+1).padStart(2,'0')}</span>
            <span className="v2-cat-name serif">{c}</span>
            <span className="v2-cat-arrow">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ===== COMMUNITY + CTA =====
function V2Community() {
  const ctaRef = useMagnetic(0.4);
  return (
    <section className="v2-section v2-community-section">
      <div className="v2-community-card">
        <div className="v2-community-art">
          <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="v2grad" cx="0.5" cy="0.5">
                <stop offset="0" stopColor="#4760ff" stopOpacity="0.45"/>
                <stop offset="1" stopColor="#4760ff" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="600" height="600" fill="#0e0e0c"/>
            <circle cx="300" cy="300" r="280" fill="url(#v2grad)"/>
            {[...Array(60)].map((_,i)=>{
              const a = (i/60)*Math.PI*2;
              const r = 100 + (i%5)*40;
              return <circle key={i} cx={300+Math.cos(a)*r} cy={300+Math.sin(a)*r} r={1+(i%3)} fill="#fff" opacity={0.2+(i%5)*0.1}/>
            })}
          </svg>
        </div>
        <div className="v2-community-inner">
          <div className="v2-eyebrow"><span className="mono">[ 04 / COMMUNITY ]</span></div>
          <h2 className="v2-community-h">
            <span className="serif v2-mega">12,847</span><br/>
            חברים. כבר<br/>
            מחכים לך.
          </h2>
          <p>קהילה שמדברת בעברית על AI ו־Vibe Coding. תגלו כלים, פרומפטים, ותתעדכנו כל יום.</p>
          <div className="v2-community-actions">
            <button ref={ctaRef} className="v2-btn-light" data-cursor data-cursor-label="Discord">
              <span className="v2-disc-dot"></span>
              Discord Server
            </button>
            <button className="v2-btn-outline-light" data-cursor>Telegram ↗</button>
          </div>
        </div>
      </div>

      <div className="v2-cta-block" data-reveal>
        <h2 className="v2-cta-h">
          אל תפספסו<br/>
          <span className="serif">שום מהפכה.</span>
        </h2>
        <p>ניוזלטר שבועי. 5 דקות קריאה. רק הסיגנל.</p>
        <form className="v2-cta-form" onSubmit={e=>e.preventDefault()}>
          <input type="email" placeholder="האימייל שלך" className="v2-cta-input"/>
          <button className="v2-btn-primary v2-cta-btn" data-cursor>הירשם →</button>
        </form>
      </div>
    </section>
  );
}

function V2Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-footer-mark">nVision<span className="v2-mark-dot">·</span>AI</div>
      <div className="v2-footer-cols">
        <div>
          <h4 className="mono">CONTENT</h4>
          <ul><li><a data-cursor>חדשות AI</a></li><li><a data-cursor>Vibe Coding</a></li><li><a data-cursor>מודלים</a></li><li><a data-cursor>מדריכים</a></li></ul>
        </div>
        <div>
          <h4 className="mono">TOOLS</h4>
          <ul><li><a data-cursor>השוואות</a></li><li><a data-cursor>בנצ׳מרקים</a></li><li><a data-cursor>פרומפטים</a></li><li><a data-cursor>גינרוטים</a></li></ul>
        </div>
        <div>
          <h4 className="mono">FOLLOW</h4>
          <ul><li><a data-cursor>WhatsApp ↗</a></li><li><a data-cursor>Telegram ↗</a></li><li><a data-cursor>YouTube ↗</a></li><li><a data-cursor>X / Twitter ↗</a></li></ul>
        </div>
      </div>
      <div className="v2-footer-bottom">
        <span className="mono">© 2026 nVision AI · Tel Aviv</span>
        <span className="mono">SHIPPING · <span className="v2-blink"></span></span>
      </div>
    </footer>
  );
}

function VariationTwo() {
  useReveal();
  return (
    <div className="v2-root" dir="rtl">
      <CustomCursor accentColor="#4760ff" />
      <V2Nav />
      <V2Hero />
      <V2Mosaic />
      <V2Categories />
      <V2Community />
      <V2Footer />
    </div>
  );
}

window.VariationTwo = VariationTwo;
