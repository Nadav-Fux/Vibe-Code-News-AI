// ============== VARIATION 1: BENTO EDITORIAL MODERN ==============
// Warm cream + ink + coral accent. Asymmetric bento grid. Hairline borders.
// Editorial typography. AI-feel: monospace ticker, model leaderboard, etc.

const { useState: useV1S, useEffect: useV1E, useRef: useV1R, useMemo: useV1M } = React;

function V1Hero() {
  const ctaRef = useMagnetic(0.35);
  const [skin, setSkin] = useS1('whatsapp');

  return (
    <div className="v1-hero">
      <div className="v1-hero-bg">
        <div className="v1-grain"></div>
        <svg className="v1-hero-deco" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="v1soft" cx="0.7" cy="0.3">
              <stop offset="0" stopColor="#e8543a" stopOpacity="0.18"/>
              <stop offset="1" stopColor="#e8543a" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="600" cy="200" r="340" fill="url(#v1soft)"/>
        </svg>
      </div>

      <div className="v1-hero-meta">
        <div className="v1-meta-l">
          <span className="v1-live-dot"></span>
          <span className="mono">LIVE · 02 MAY 2026 · 14:32 IST</span>
        </div>
        <div className="v1-meta-r mono">EDITION №247 / WEEKLY</div>
      </div>

      <div className="v1-hero-grid">
        <div className="v1-hero-headline">
          <div className="v1-eyebrow">
            <span className="v1-eyebrow-line"></span>
            <span className="mono">VIBE CODING & AI · ISSUE 247</span>
          </div>

          <h1 className="v1-h1">
            <span className="v1-h1-row" data-reveal>
              <span>החדשות</span>
              <span className="v1-orbit">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#0e0e0c" strokeWidth="1" strokeDasharray="2 4"/>
                  <circle cx="50" cy="50" r="22" fill="#e8543a"/>
                  <circle cx="50" cy="50" r="6" fill="#f4f1ea"/>
                </svg>
              </span>
              <span>של</span>
            </span>
            <span className="v1-h1-row" data-reveal style={{transitionDelay:'0.08s'}}>
              <span className="serif">המהפכה</span>
              <span className="v1-h1-em">.AI</span>
            </span>
            <span className="v1-h1-row v1-h1-shift" data-reveal style={{transitionDelay:'0.16s'}}>
              <span>במהירות</span>
              <span className="serif v1-h1-italic">המחשבה</span>
            </span>
          </h1>

          <div className="v1-hero-sub">
            <p data-reveal style={{transitionDelay:'0.26s'}}>
              <strong>nVision AI</strong> — בית למבזקים, מאמרים, מדריכים, השוואות וכלים על
              <span className="v1-pill">AI</span>
              <span className="v1-pill v1-pill-2">Vibe Coding</span>
              ומה שמתחת למכסה המנוע של המודלים החדשים. עברית — כי טכנולוגיה לא חייבת להיות באנגלית.
            </p>
            <div className="v1-hero-actions">
              <button ref={ctaRef} className="v1-btn-primary" data-cursor data-cursor-label="התחל לקרוא →">
                <span>התחל לקרוא</span>
                <span className="v1-btn-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
              <button className="v1-btn-ghost" data-cursor data-cursor-label="ניוזלטר">
                הירשמו לניוזלטר
              </button>
            </div>
          </div>
        </div>

        <div className="v1-hero-chat">
          <ChatPanel skin={skin} onSkinChange={setSkin} variant="v1" />
        </div>
      </div>

      <div className="v1-hero-marquee">
        <div className="v1-marquee-track">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="v1-marquee-inner">
              {['Claude 5 Opus', 'GPT-5o', 'Gemini 2.5', 'Cursor', 'Bolt.new', 'Lovable', 'v0.dev', 'Continue', 'Aider', 'Replit', 'Windsurf', 'Codeium'].map((t,i) => (
                <span key={i} className="v1-marquee-item">
                  <span className="v1-marquee-star">✦</span>
                  <span className="serif">{t}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== BENTO ARTICLES GRID =====
function V1Bento() {
  return (
    <section className="v1-section" id="articles">
      <div className="v1-section-head" data-reveal>
        <div className="v1-section-eyebrow">
          <span className="v1-eyebrow-line"></span>
          <span className="mono">[02] תוכן השבוע</span>
        </div>
        <h2 className="v1-h2">
          המאמרים <span className="serif">שמשנים</span><br/>
          את המשחק.
        </h2>
        <p className="v1-section-desc">מבחר עורך — מהמערכת ומהקהילה. קצר, חד, ובלי באז־וורדס.</p>
      </div>

      <div className="v1-bento">
        {/* HERO ARTICLE */}
        <article className="v1-card v1-card-hero" data-cursor data-cursor-label="קרא →" data-reveal>
          <div className="v1-card-art">
            <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="dots1" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#0e0e0c" opacity="0.18"/>
                </pattern>
              </defs>
              <rect width="600" height="400" fill="#f0ddc7"/>
              <rect width="600" height="400" fill="url(#dots1)"/>
              <g transform="translate(450 150)">
                <circle r="120" fill="#e8543a"/>
                <circle r="80" fill="#0e0e0c"/>
                <circle r="38" fill="#f4f1ea"/>
                <circle cx="-60" cy="-80" r="14" fill="#0e0e0c"/>
                <circle cx="-130" cy="60" r="22" fill="#c9a3e8"/>
              </g>
              <text x="40" y="360" fontFamily="Instrument Serif" fontStyle="italic" fontSize="48" fill="#0e0e0c">vibe.</text>
            </svg>
          </div>
          <div className="v1-card-meta">
            <span className="v1-card-cat">מאמר דעה</span>
            <span className="v1-card-time mono">8 דק׳ · אתמול</span>
          </div>
          <h3 className="v1-card-title-xl">
            Vibe Coding הוא לא <span className="serif">סוף</span> הפיתוח.<br/>
            הוא ההתחלה.
          </h3>
          <p className="v1-card-excerpt">אחרי שנה של בנייה רק עם פרומפטים, אני בטוח יותר מתמיד שמפתחים לא הולכים לשום מקום — הם פשוט הולכים לעלות שלב אחד למעלה.</p>
          <div className="v1-card-author">
            <div className="v1-avatar">NG</div>
            <div>
              <strong>נדב גלעד</strong>
              <span className="mono">Founder, nVision AI</span>
            </div>
            <span className="v1-card-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </article>

        {/* LEADERBOARD CARD */}
        <article className="v1-card v1-card-leaderboard" data-cursor data-cursor-label="לכל הדירוג" data-reveal>
          <div className="v1-card-meta">
            <span className="v1-card-cat v1-cat-dark">Leaderboard · live</span>
            <span className="v1-pulse-tiny"></span>
          </div>
          <h3 className="v1-card-title-md">דירוג מודלים</h3>
          <div className="v1-leaderboard">
            {LEADERBOARD.map((m, i) => (
              <div key={i} className={`v1-lb-row ${m.leader ? 'leader' : ''}`}>
                <span className="v1-lb-rank mono">{String(i+1).padStart(2,'0')}</span>
                <div className="v1-lb-name">
                  <strong>{m.name}</strong>
                  <span className="mono">{m.org}</span>
                </div>
                <div className="v1-lb-score">
                  <strong>{m.score}</strong>
                  <span className={`v1-lb-change ${m.change.startsWith('+') ? 'up' : m.change.startsWith('-') ? 'down' : ''}`}>{m.change}</span>
                </div>
                <div className="v1-lb-bar"><span style={{width: `${m.score}%`}}></span></div>
              </div>
            ))}
          </div>
        </article>

        {/* GUIDE */}
        <article className="v1-card v1-card-tall" data-cursor data-cursor-label="קרא →" data-reveal>
          <div className="v1-card-art v1-art-tall">
            <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
              <rect width="400" height="500" fill="#dde4d6"/>
              <g transform="translate(200 200)">
                <rect x="-90" y="-90" width="180" height="180" fill="none" stroke="#0e0e0c" strokeWidth="2"/>
                <rect x="-60" y="-60" width="180" height="180" fill="#0e0e0c"/>
                <rect x="-30" y="-30" width="180" height="180" fill="#e8543a"/>
                <text x="60" y="80" fontFamily="JetBrains Mono" fontSize="60" fontWeight="700" fill="#f4f1ea">{`{ai}`}</text>
              </g>
              <text x="20" y="470" fontFamily="JetBrains Mono" fontSize="11" fill="#0e0e0c" letterSpacing="2">$ npx create-agent@latest</text>
            </svg>
          </div>
          <div className="v1-card-meta">
            <span className="v1-card-cat">מדריך</span>
            <span className="v1-card-time mono">6 דק׳ · היום</span>
          </div>
          <h3 className="v1-card-title-lg">
            בונים סוכן AI ב־<span className="serif">Cursor</span><br/>
            ב־30 דקות.
          </h3>
          <p className="v1-card-excerpt">מ־MCP לפרודקשן: התקנה, הגדרת tools, שילוב Claude API ופריסה ל־Vercel.</p>
        </article>

        {/* TOOLS SHOWCASE */}
        <article className="v1-card v1-card-tools" data-reveal>
          <div className="v1-card-meta">
            <span className="v1-card-cat v1-cat-dark">12 כלי AI · Showcase</span>
          </div>
          <h3 className="v1-card-title-md">מה שמפתחים<br/>אוהבים השבוע.</h3>
          <div className="v1-tools-grid">
            {TOOLS_SHOWCASE.map((t, i) => (
              <div key={i} className="v1-tool" data-cursor data-cursor-label={t.name}>
                <div className="v1-tool-icon">
                  <span>{t.name[0]}</span>
                </div>
                <div className="v1-tool-info">
                  <strong>{t.name}</strong>
                  <span className="mono">{t.cat}</span>
                </div>
                <div className="v1-tool-score">
                  <strong>{t.score}</strong>
                  <span className="mono">/10</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* BENCHMARK */}
        <article className="v1-card v1-card-bench" data-cursor data-cursor-label="קרא →" data-reveal>
          <div className="v1-card-art">
            <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
              <rect width="400" height="240" fill="#0e0e0c"/>
              <g stroke="#3a3a37" strokeWidth="0.5">
                {[...Array(8)].map((_,i)=>(<line key={i} x1="0" y1={i*30} x2="400" y2={i*30}/>))}
              </g>
              <path d="M20 180 L80 140 L140 160 L200 90 L260 110 L320 50 L380 70" stroke="#e8543a" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 200 L80 180 L140 170 L200 130 L260 140 L320 100 L380 110" stroke="#c9a3e8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"/>
              <path d="M20 210 L80 200 L140 195 L200 170 L260 175 L320 150 L380 155" stroke="#dde4d6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 6"/>
              <circle cx="320" cy="50" r="6" fill="#e8543a"/>
              <text x="20" y="30" fontFamily="JetBrains Mono" fontSize="11" fill="#f4f1ea" opacity="0.7">SWE-bench / 0–100</text>
            </svg>
          </div>
          <div className="v1-card-meta">
            <span className="v1-card-cat">בנצ׳מרק</span>
            <span className="v1-card-time mono">15 דק׳</span>
          </div>
          <h3 className="v1-card-title-md">
            GPT-5o vs Claude 5<br/>
            vs <span className="serif">Gemini 2.5</span>
          </h3>
        </article>

        {/* JAILBREAK */}
        <article className="v1-card v1-card-small" data-cursor data-cursor-label="קרא →" data-reveal>
          <div className="v1-card-meta">
            <span className="v1-card-cat v1-cat-warn">גינרוט · אתי</span>
            <span className="v1-card-time mono">3 דק׳</span>
          </div>
          <h3 className="v1-card-title-md">
            הפרומפט שמשגע<br/>
            את <span className="serif">Gemini.</span>
          </h3>
          <code className="v1-code-snippet">{`> System: You are a senior reviewer with 20 years...`}</code>
        </article>
      </div>
    </section>
  );
}

// ===== TRENDING PROMPTS + COMMUNITY =====
function V1TrendingCommunity() {
  return (
    <section className="v1-section v1-trending-section">
      <div className="v1-trending-grid">
        <div className="v1-trending-block" data-reveal>
          <div className="v1-eyebrow">
            <span className="v1-eyebrow-line"></span>
            <span className="mono">[03] TRENDING PROMPTS</span>
          </div>
          <h2 className="v1-h2-mid">
            הפרומפטים <span className="serif">החמים</span><br/>
            של השבוע.
          </h2>
          <div className="v1-prompts">
            {TRENDING_PROMPTS.map((p, i) => (
              <div key={i} className="v1-prompt-row" data-cursor data-cursor-label="העתק →">
                <span className="v1-prompt-rank mono">#{p.rank}</span>
                <div className="v1-prompt-info">
                  <strong>{p.title}</strong>
                  <span className="mono">{p.tag}</span>
                </div>
                <div className="v1-prompt-uses">
                  <strong>{p.uses}</strong>
                  <span className="mono">uses</span>
                </div>
                <span className="v1-prompt-arrow">↗</span>
              </div>
            ))}
          </div>
        </div>

        <div className="v1-community" data-reveal>
          <div className="v1-community-bg">
            <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="comGrad" cx="0.5" cy="0.5">
                  <stop offset="0" stopColor="#e8543a" stopOpacity="0.3"/>
                  <stop offset="1" stopColor="#e8543a" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <rect width="400" height="400" fill="#0e0e0c"/>
              <circle cx="200" cy="200" r="180" fill="url(#comGrad)"/>
              {[...Array(40)].map((_,i)=>{
                const a = (i/40)*Math.PI*2;
                const r = 80 + (i%4)*30;
                return <circle key={i} cx={200+Math.cos(a)*r} cy={200+Math.sin(a)*r} r={1+(i%3)} fill="#f4f1ea" opacity={0.3+(i%5)*0.1}/>
              })}
            </svg>
          </div>
          <div className="v1-community-inner">
            <div className="v1-community-eyebrow mono">[04] COMMUNITY</div>
            <h2 className="v1-community-title">
              <span className="serif">12,847</span><br/>
              חברים. כבר מחכים<br/>
              שתצטרף.
            </h2>
            <div className="v1-community-actions">
              <button className="v1-btn-light" data-cursor data-cursor-label="Discord">
                <span className="v1-disc-dot"></span>
                Discord Server
              </button>
              <button className="v1-btn-outline-light" data-cursor>
                Telegram ↗
              </button>
            </div>
            <div className="v1-community-stats">
              <div><strong>247</strong><span className="mono">issues</span></div>
              <div><strong>1.2K</strong><span className="mono">articles</span></div>
              <div><strong>89</strong><span className="mono">guides</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function V1Categories() {
  return (
    <section className="v1-section v1-categories-section">
      <div className="v1-eyebrow" data-reveal>
        <span className="v1-eyebrow-line"></span>
        <span className="mono">[05] BROWSE</span>
      </div>
      <div className="v1-cat-marquee">
        <div className="v1-cat-track">
          {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
            <a key={i} className="v1-cat-chip" data-cursor data-cursor-label={`עיין · ${c}`}>
              <span className="serif">{c}</span>
              <span className="v1-cat-arrow">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function V1CTA() {
  const ctaRef = useMagnetic(0.4);
  return (
    <section className="v1-cta-section">
      <div className="v1-cta-inner">
        <div className="v1-eyebrow v1-cta-eyebrow">
          <span className="v1-eyebrow-line"></span>
          <span className="mono">[06] JOIN THE LIST</span>
        </div>
        <h2 className="v1-cta-h">
          <span data-reveal>אל תפספסו</span><br/>
          <span data-reveal style={{transitionDelay:'0.1s'}} className="serif v1-cta-italic">שום מהפכה.</span>
        </h2>
        <p className="v1-cta-sub" data-reveal style={{transitionDelay:'0.2s'}}>
          ניוזלטר שבועי. 5 דקות קריאה. רק מה שחשוב.<br/>
          בלי ספאם. בלי באז. רק הסיגנל.
        </p>
        <form className="v1-cta-form" data-reveal style={{transitionDelay:'0.3s'}} onSubmit={e=>e.preventDefault()}>
          <input type="email" placeholder="האימייל שלך" className="v1-cta-input"/>
          <button ref={ctaRef} className="v1-btn-primary v1-cta-btn" data-cursor data-cursor-label="הרשמה!">
            <span>הירשם</span>
            <span className="v1-btn-arrow">→</span>
          </button>
        </form>
      </div>
    </section>
  );
}

function V1Footer() {
  return (
    <footer className="v1-footer">
      <div className="v1-footer-mark">
        nVision<span className="v1-mark-dot">.</span>AI
      </div>
      <div className="v1-footer-cols">
        <div>
          <h4 className="mono">CONTENT</h4>
          <ul>
            <li><a data-cursor>חדשות AI</a></li>
            <li><a data-cursor>Vibe Coding</a></li>
            <li><a data-cursor>מודלים</a></li>
            <li><a data-cursor>מדריכים</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mono">TOOLS</h4>
          <ul>
            <li><a data-cursor>השוואות</a></li>
            <li><a data-cursor>בנצ׳מרקים</a></li>
            <li><a data-cursor>פרומפטים</a></li>
            <li><a data-cursor>גינרוטים</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mono">FOLLOW</h4>
          <ul>
            <li><a data-cursor>WhatsApp ↗</a></li>
            <li><a data-cursor>Telegram ↗</a></li>
            <li><a data-cursor>YouTube ↗</a></li>
            <li><a data-cursor>X / Twitter ↗</a></li>
          </ul>
        </div>
      </div>
      <div className="v1-footer-bottom">
        <span className="mono">© 2026 nVision AI · Tel Aviv</span>
        <span className="mono">SHIPPING · <span className="v1-blink"></span></span>
      </div>
    </footer>
  );
}

function V1Nav() {
  return (
    <nav className="v1-nav">
      <div className="v1-nav-logo" data-cursor>
        <span className="v1-nav-mark">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="6" fill="#e8543a"/>
          </svg>
        </span>
        <div className="v1-nav-name">
          <strong>nVision<span style={{color:'#e8543a'}}>.</span>AI</strong>
          <span className="mono">Vibe Coding & AI News</span>
        </div>
      </div>
      <ul className="v1-nav-links">
        <li><a data-cursor>חדשות</a></li>
        <li><a data-cursor>מאמרים</a></li>
        <li><a data-cursor>מדריכים</a></li>
        <li><a data-cursor>כלים</a></li>
        <li><a data-cursor>קהילה</a></li>
      </ul>
      <button className="v1-nav-cta" data-cursor data-cursor-label="הצטרף">
        הצטרף ↗
      </button>
    </nav>
  );
}

function VariationOne() {
  useReveal();
  return (
    <div className="v1-root" dir="rtl">
      <CustomCursor accentColor="#e8543a" />
      <V1Nav />
      <V1Hero />
      <V1Bento />
      <V1TrendingCommunity />
      <V1Categories />
      <V1CTA />
      <V1Footer />
    </div>
  );
}

window.VariationOne = VariationOne;
