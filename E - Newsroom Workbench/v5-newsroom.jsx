// ============== VARIATION 5: NEWSROOM WORKBENCH (rev 3 — Article Editor) ==============
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
  { id:'article-intro', title:'מה השתנה בפיתוח עם AI' },
  { id:'article-stack', title:'הסטאק המינימלי לסוכן עובד' },
  { id:'article-risks', title:'איפה מודלים נופלים בפרודקשן' },
  { id:'article-ship', title:'צ׳קליסט לפני שמשחררים' },
];

const V5_TEMPLATE_OUTLINE = [
  { id:'article-intro', title:'Hook, promise, and reader payoff' },
  { id:'article-stack', title:'Context, problem, and why now' },
  { id:'article-risks', title:'Main body: insight, comparison, examples' },
  { id:'article-ship', title:'Ending: takeaway and next step' },
];

const V5_RELATED = [
  { title:'הפרוטוקול הקטן שמסדר MCP', meta:'מדריך · 9 דק׳' },
  { title:'מה למדנו מ־47 משימות Claude', meta:'מאמר עומק · 12 דק׳' },
  { title:'האם Linear AI באמת מנהל מוצר?', meta:'סקירה · 6 דק׳' },
];

const V5_TEMPLATE_RELATED = [
  { title:'ראה מאמר דוגמה מלא', meta:'DEMO ARTICLE', href:'article.html?view=demo' },
  { title:'חזור לספריית המאמרים', meta:'ARTICLE LIBRARY', href:'articles.html' },
  { title:'פתח את עמוד הבית של E', meta:'NEWSROOM HOME', href:'index.html#home' },
];

const V5_LINKS = {
  home: 'index.html#home',
  news: 'news.html',
  articles: 'articles.html',
  article: 'article.html',
  articleDemo: 'article.html?view=demo',
  tools: 'index.html#tools',
  community: 'index.html#community',
  editor: 'articles.html?tab=editor',
  updates: 'updates.html',
};

const V5_NAV_ITEMS = [
  { key:'home', label:'בית', href:V5_LINKS.home },
  { key:'news', label:'חדשות', href:V5_LINKS.news },
  { key:'articles', label:'מאמרים', href:V5_LINKS.articles },
  { key:'article', label:'מאמר חדש', href:V5_LINKS.editor },
  { key:'tools', label:'כלים', href:V5_LINKS.tools },
  { key:'updates', label:'עדכונים', href:V5_LINKS.updates },
  { key:'community', label:'קהילה', href:V5_LINKS.community },
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

// =================== STORAGE ===================

const STORAGE_KEY = 'v5_articles';

function loadArticles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveArticlesToStorage(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  window.dispatchEvent(new Event('v5ArticlesChanged'));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function sanitizeSlug(slug) {
  if (!slug) return '';
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function saveArticleToLocal(data) {
  const articles = loadArticles();
  const slug = sanitizeSlug(data.slug) || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const existingIdx = articles.findIndex(a => a.slug === slug);
  const now = new Date().toISOString();

  const article = {
    id: existingIdx >= 0 ? articles[existingIdx].id : generateId(),
    title: data.title,
    slug: slug,
    content: data.content || [],
    createdAt: existingIdx >= 0 ? articles[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    articles[existingIdx] = article;
  } else {
    articles.push(article);
  }

  saveArticlesToStorage(articles);
  return article;
}

function deleteArticleFromLocal(slug) {
  const articles = loadArticles();
  const filtered = articles.filter(a => a.slug !== slug);
  if (filtered.length === articles.length) return false;
  saveArticlesToStorage(filtered);
  return true;
}

function getArticleFromLocal(slug) {
  return loadArticles().find(a => a.slug === slug) || null;
}

// Sanity public config — replaced at build time by .github/scripts/inject-env.js.
// The WRITE token is intentionally NOT here; writes go through /api/save-article
// (a Cloudflare Pages Function) which keeps the write token server-side.
var SANITY_PROJECT = '__SANITY_PROJECT_ID__';
var SANITY_DATASET = '__SANITY_DATASET__';
var SANITY_API_VERSION = '__SANITY_API_VERSION__';
var SANITY_READ_TOKEN = '__SANITY_READ_TOKEN__';

// Treat unreplaced build placeholders as empty (local dev / no CI run)
function sanityValue(v) {
  return (typeof v === 'string' && v.indexOf('__') === 0 && v.lastIndexOf('__') === v.length - 2) ? '' : (v || '');
}
SANITY_PROJECT       = sanityValue(SANITY_PROJECT);
SANITY_DATASET       = sanityValue(SANITY_DATASET) || 'production';
SANITY_API_VERSION   = sanityValue(SANITY_API_VERSION) || '2024-01-01';
SANITY_READ_TOKEN    = sanityValue(SANITY_READ_TOKEN);
var SANITY_ENABLED = !!SANITY_PROJECT;

// Editor secret lives in localStorage (one-time setup by the editor user).
// The browser sends it as X-Editor-Secret to /api/save-article and /api/delete-article;
// the Pages Function compares it against the EDITOR_SECRET env var.
function getEditorSecret() {
  try { return localStorage.getItem('v5_editor_secret') || ''; } catch { return ''; }
}
function setEditorSecret(value) {
  try { localStorage.setItem('v5_editor_secret', value || ''); } catch {}
}

// Read articles from Sanity (uses read-only token when available)
async function sanityQueryArticles() {
  if (!SANITY_ENABLED) return null;
  try {
    var headers = { 'Content-Type': 'application/json' };
    if (SANITY_READ_TOKEN) {
      headers['Authorization'] = 'Bearer ' + SANITY_READ_TOKEN;
    }
    var perspective = SANITY_READ_TOKEN ? 'published' : 'preview';
    var url = 'https://' + SANITY_PROJECT + '.api.sanity.io/v' + SANITY_API_VERSION +
              '/data/query/' + SANITY_DATASET + '?perspective=' + perspective +
              '&query=*[_type == "article"]{title, "slug": slug.current, content, publishedAt, _createdAt, _updatedAt}';
    var res = await fetch(url, { headers: headers });
    if (!res.ok) {
      console.warn('Sanity query returned', res.status, res.statusText);
      return null;
    }
    var data = await res.json();
    return data.result || [];
  } catch(e) {
    console.warn('Sanity read failed (this is OK if public API is disabled):', e.message);
    return null;
  }
}

// Write/create article in Sanity (requires write token)
async function sanityWriteArticle(doc) {
  if (!SANITY_WRITE_TOKEN) {
    console.warn('Sanity write token not set — skipping write.');
    return null;
  }
  try {
    var url = 'https://' + SANITY_PROJECT + '.api.sanity.io/v' + SANITY_API_VERSION +
              '/data/mutate/' + SANITY_DATASET;
    var mutations = [{ create: { _type: 'article', ...doc } }];
    var res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SANITY_WRITE_TOKEN,
      },
      body: JSON.stringify({ mutations: mutations }),
    });
    var json = await res.json();
    if (!res.ok) {
      console.error('Sanity write error:', json);
    }
    return json;
  } catch(e) {
    console.warn('Sanity write failed:', e.message);
    return null;
  }
}

// Sync article to Sanity (create or update)
async function syncArticleToSanity(article) {
  try {
    var slugField = typeof article.slug === 'string' ? { _type: 'slug', current: article.slug } : article.slug;
    var doc = {
      title: article.title,
      slug: slugField,
      content: convertToSanityBlocks(article.content || []),
      status: 'published',
      publishedAt: new Date().toISOString(),
    };
    // Try to find existing article by slug first
    var existing = null;
    if (SANITY_READ_TOKEN) {
      var queryUrl = 'https://' + SANITY_PROJECT + '.api.sanity.io/v' + SANITY_API_VERSION +
                     '/data/query/' + SANITY_DATASET + '?perspective=published&query=*[_type == "article" && slug.current == "' + encodeURIComponent(article.slug) + '"][0]{_id}';
      try {
        var qRes = await fetch(queryUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SANITY_READ_TOKEN,
          }
        });
        if (qRes.ok) {
          var qData = await qRes.json();
          existing = qData.result || null;
        }
      } catch(e) { /* proceed with create */ }
    }

    var url = 'https://' + SANITY_PROJECT + '.api.sanity.io/v' + SANITY_API_VERSION +
              '/data/mutate/' + SANITY_DATASET;
    var mutations;
    if (existing && existing._id) {
      // Update existing
      mutations = [{ patch: { id: existing._id, set: doc } }];
    } else {
      // Create new
      mutations = [{ create: { _type: 'article', ...doc } }];
    }

    var res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SANITY_WRITE_TOKEN,
      },
      body: JSON.stringify({ mutations: mutations }),
    });
    var json = await res.json();
    if (!res.ok) {
      console.error('Sanity sync error:', json);
    }
    return json;
  } catch(e) {
    console.warn('Sync failed:', e.message);
    return null;
  }
}

// Convert our block format to Sanity portable text
function convertToSanityBlocks(blocks) {
  if (!blocks || !blocks.length) return [{ _type: 'block', children: [{ _type: 'span', text: '' }], style: 'normal', markDefs: [] }];

  return blocks.map(function(block) {
    switch (block.type) {
      case 'heading': {
        var level = 2;
        var match = block.content.match(/^(#{1,6})\s/);
        if (match) { level = match[1].length; block.content = block.content.replace(/^#{1,6}\s/, ''); }
        return {
          _type: 'block',
          children: [{ _type: 'span', text: block.content, marks: [] }],
          style: 'h' + level,
          markDefs: [],
        };
      }
      case 'paragraph': {
        return {
          _type: 'block',
          children: [{ _type: 'span', text: block.content || '', marks: [] }],
          style: 'normal',
          markDefs: [],
        };
      }
      case 'image': {
        return {
          _type: 'image',
          asset: { _type: 'reference', _ref: '' },
          alt: block.content || '',
        };
      }
      case 'code': {
        return {
          _type: 'code',
          code: block.content || '',
          language: 'javascript',
          filename: '',
        };
      }
      default: {
        return {
          _type: 'block',
          children: [{ _type: 'span', text: String(block.content || ''), marks: [] }],
          style: 'normal',
          markDefs: [],
        };
      }
    }
  });
}

// =================== NAVIGATION ===================

function v5Navigate(href) {
  window.location.href = href;
}

// =================== COMPONENTS ===================

function V5Nav({ activeKey }) {
  var _useState = useV5S('14:32');
  var time = _useState[0], setTime = _useState[1];

  useV5E(function() {
    var tick = function() {
      var d = new Date();
      setTime(String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'));
    };
    tick();
    var id = setInterval(tick, 30000);
    return function() { clearInterval(id); };
  }, []);

  return React.createElement('header', { className: 'v5-nav' },
    React.createElement('div', { className: 'v5-nav-l' },
      React.createElement('a', { className: 'v5-mark', href: V5_LINKS.home },
        React.createElement('svg', { viewBox: '0 0 60 60' },
          React.createElement('rect', { x: 0, y: 0, width: 60, height: 60, rx: 14, fill: '#11110d' }),
          React.createElement('path', { d: 'M14 18 Q14 12 20 12 L40 12 Q46 12 46 18 L46 36 Q46 42 40 42 L26 42 L18 50 L20 42 Q14 42 14 36 Z', fill: '#88a884' }),
          React.createElement('text', { x: 30, y: 32, textAnchor: 'middle', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700, fill: '#11110d' }, 'n.')
        )
      ),
      React.createElement('div', { className: 'v5-name' },
        React.createElement('strong', null, 'nVision ', React.createElement('span', { style: { color: '#88a884' } }, '·'), ' AI'),
        React.createElement('span', { className: 'mono' }, 'VIBE CODE NEWS · TLV')
      )
    ),
    React.createElement('nav', { className: 'v5-nav-c' },
      V5_NAV_ITEMS.map(function(item) {
        return React.createElement('a', {
          key: item.href,
          className: activeKey === item.key ? 'active' : '',
          href: item.href
        }, item.label);
      })
    ),
    React.createElement('div', { className: 'v5-nav-r' },
      React.createElement('div', { className: 'v5-nav-clock' },
        React.createElement('span', { className: 'v5-pulse' }),
        React.createElement('span', null, 'LIVE · ' + time)
      ),
      React.createElement('a', { className: 'v5-join-btn', href: V5_LINKS.community }, 'הצטרף לערוץ ', React.createElement('span', null, '↗'))
    )
  );
}

function V5Keywords() {
  var ref = useV5Parallax(0.4);
  return React.createElement('div', { ref: ref, className: 'v5-bg-kw', style: { transform: 'translate3d(0, var(--py, 0), 0)' } },
    V5_KEYWORDS.map(function(k, i) {
      var text = k[0], x = k[1], y = k[2], size = k[3], rot = k[4], cls = k[5];
      return React.createElement('span', { key: i, className: 'v5-kw ' + cls, style: { left: x, top: y, fontSize: size + 'rem', transform: 'rotate(' + rot + 'deg)' } }, text);
    })
  );
}

function V5RotatingWord() {
  var words = ['וויב קודינג', 'סוכנים', 'מודלים', 'מוצרים', 'סטארטאפים'];
  var _useState2 = useV5S(0);
  var i = _useState2[0], setI = _useState2[1];
  var _useState3 = useV5S('');
  var t = _useState3[0], setT = _useState3[1];

  useV5E(function() {
    var word = words[i];
    var j = 0;
    var typing = true;
    var tick = function() {
      if (typing) {
        if (j < word.length) { setT(word.slice(0, ++j)); setTimeout(tick, 70); }
        else { setTimeout(function() { typing = false; tick(); }, 1800); }
      } else {
        if (j > 0) { setT(word.slice(0, --j)); setTimeout(tick, 35); }
        else { setI(function(p) { return (p + 1) % words.length; }); }
      }
    };
    tick();
  }, [i]);

  return React.createElement('span', { className: 'v5-rotor' }, t, React.createElement('i', { className: 'v5-caret' }));
}

function V5Title() {
  return React.createElement('div', { className: 'v5-title-wrap', 'data-v5-reveal': true },
    React.createElement('div', { className: 'v5-eyebrow-row' }, '[ ISSUE №247 / 09.05.2026 / LIVE ]'),
    React.createElement('h1', { className: 'v5-title' },
      React.createElement('span', { className: 'v5-w-fall', style: { animationDelay: '0.05s' } }, 'מה'), ' ',
      React.createElement('span', { className: 'v5-w-fall serif', style: { animationDelay: '0.18s' } }, 'חדש'), ' ',
      React.createElement('span', { className: 'v5-w-fall', style: { animationDelay: '0.32s' } }, 'היום?')
    ),
    React.createElement('div', { className: 'v5-title-pill' },
      React.createElement('span', { className: 'v5-pill-dot' }),
      'nVision ', React.createElement('span', { className: 'v5-pill-ai' }, '[AI]')
    ),
    React.createElement('div', { className: 'v5-title-sub' },
      React.createElement('span', null, 'הבינה המלאכותית, הטכנולוגיה ועולם '),
      React.createElement('span', { className: 'v5-rotor-wrap' }, React.createElement(V5RotatingWord))
    ),
    React.createElement('div', { className: 'v5-title-actions' },
      React.createElement('a', { className: 'v5-title-action primary', href: V5_LINKS.editor }, 'פתח מאמר חדש ↗'),
      React.createElement('a', { className: 'v5-title-action ghost', href: V5_LINKS.articles }, 'לספריית המאמרים')
    )
  );
}

function V5Chat(_ref) {
  var skin = _ref.skin;
  var feed = _ref.feed && _ref.feed.length ? _ref.feed : V5_FEED;
  var scrollerRef = useV5R(null);
  var _useState4 = useV5S(3);
  var shown = _useState4[0], setShown = _useState4[1];
  var _useState5 = useV5S(false);
  var typing = _useState5[0], setTyping = _useState5[1];

  useV5E(function() {
    if (shown >= feed.length) return;
    var t = setTimeout(function() {
      setTyping(true);
      var t2 = setTimeout(function() { setTyping(false); setShown(function(s) { return s + 1; }); }, 1100);
      return function() { clearTimeout(t2); };
    }, 2800);
    return function() { clearTimeout(t); };
  }, [shown, feed]);

  useV5E(function() {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [shown, typing]);

  return React.createElement('div', { className: 'v5-chat skin-' + skin },
    React.createElement(V5ChatHeader, { skin: skin, typing: typing }),
    React.createElement('div', { ref: scrollerRef, className: 'v5-chat-body' },
      React.createElement('div', { className: 'v5-chat-bg' }),
      feed.slice(0, shown).map(function(m, i) {
        if (m.type === 'system') return React.createElement('div', { key: i, className: 'v5-system' }, React.createElement('span', null, m.text));
        return React.createElement('div', { key: i, className: 'v5-msg-row skin-' + skin },
          React.createElement('div', { className: 'v5-bubble' },
            m.urgent && React.createElement('span', { className: 'v5-chat-urgent' }, '⚡ מבזק'),
            React.createElement('span', { className: 'v5-chat-tag' }, m.tag),
            React.createElement('p', null, m.text),
            React.createElement('div', { className: 'v5-time' }, m.time, skin === 'whatsapp' && React.createElement('span', { className: 'v5-ticks' }, ' ✓✓'))
          )
        );
      }),
      typing && React.createElement('div', { className: 'v5-msg-row skin-' + skin },
        React.createElement('div', { className: 'v5-bubble' }, React.createElement('div', { className: 'v5-typing' }, React.createElement('span'), React.createElement('span'), React.createElement('span')))
      )
    ),
    React.createElement(V5ChatInput, { skin: skin })
  );
}

function V5ChatHeader(_ref2) {
  var skin = _ref2.skin, typing = _ref2.typing;
  if (skin === 'whatsapp') return React.createElement('div', { className: 'v5-chat-header v5-h-wa' },
    React.createElement('span', { className: 'v5-chat-back' }, '‹'),
    React.createElement('div', { className: 'v5-chat-av', style: { background: '#25D366' } }, 'n.'),
    React.createElement('div', { className: 'v5-chat-h-meta' },
      React.createElement('strong', null, 'nVision · AI'),
      React.createElement('span', null, typing ? 'כותב/ת…' : 'ערוץ · 12,847 עוקבים')
    ),
    React.createElement('div', { className: 'v5-chat-icons' },
      React.createElement('span', null, '📷'),
      React.createElement('span', null, '⌕'),
      React.createElement('span', null, '⋮')
    )
  );
  if (skin === 'telegram') return React.createElement('div', { className: 'v5-chat-header v5-h-tg' },
    React.createElement('span', { className: 'v5-chat-back' }, '‹'),
    React.createElement('div', { className: 'v5-chat-av', style: { background: 'linear-gradient(135deg,#54a9eb,#2A8AD8)' } }, 'n.'),
    React.createElement('div', { className: 'v5-chat-h-meta' },
      React.createElement('strong', null, 'nVision · AI ', React.createElement('span', { className: 'v5-tg-verified' }, '✓')),
      React.createElement('span', null, typing ? 'כותב/ת…' : '12,847 subscribers')
    ),
    React.createElement('div', { className: 'v5-chat-icons' },
      React.createElement('span', null, '⌕'),
      React.createElement('span', null, '⋮')
    )
  );
  return React.createElement('div', { className: 'v5-chat-header v5-h-fb' },
    React.createElement('span', { className: 'v5-chat-back' }, '‹'),
    React.createElement('div', { className: 'v5-chat-av', style: { background: 'linear-gradient(135deg,#0099FF,#A033FF)' } }, 'n.'),
    React.createElement('div', { className: 'v5-chat-h-meta' },
      React.createElement('strong', null, 'nVision · AI'),
      React.createElement('span', null, typing ? 'מקליד/ה…' : 'פעיל/ה עכשיו')
    ),
    React.createElement('div', { className: 'v5-chat-icons' },
      React.createElement('span', null, '📞'),
      React.createElement('span', null, '📹'),
      React.createElement('span', null, 'ⓘ')
    )
  );
}

function V5ChatInput(_ref3) {
  var skin = _ref3.skin;
  if (skin === 'whatsapp') return React.createElement('div', { className: 'v5-chat-input v5-i-wa' },
    React.createElement('span', null, '😊'),
    React.createElement('div', { className: 'v5-chat-fake-input' }, 'הקלד הודעה'),
    React.createElement('span', null, '📎'),
    React.createElement('span', null, '📷'),
    React.createElement('button', { className: 'v5-chat-send', style: { background: '#25D366' } },
      React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none' },
        React.createElement('path', { d: 'M5 12L19 12M19 12L13 6M19 12L13 18', stroke: 'white', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' })
      )
    )
  );
  if (skin === 'telegram') return React.createElement('div', { className: 'v5-chat-input v5-i-tg' },
    React.createElement('span', null, '😊'),
    React.createElement('div', { className: 'v5-chat-fake-input' }, 'Message'),
    React.createElement('span', null, '📎'),
    React.createElement('span', { style: { color: '#2AABEE', fontSize: 18 } }, '🎤')
  );
  return React.createElement('div', { className: 'v5-chat-input v5-i-fb' },
    React.createElement('span', { style: { color: '#0084FF' } }, '+'),
    React.createElement('span', { style: { color: '#0084FF' } }, '📷'),
    React.createElement('span', { style: { color: '#0084FF' } }, '🖼'),
    React.createElement('span', { style: { color: '#0084FF' } }, '🎤'),
    React.createElement('div', { className: 'v5-chat-fake-input' }, 'Aa'),
    React.createElement('span', { style: { color: '#0084FF', fontSize: 18 } }, '👍')
  );
}

function V5Sparkline(_ref4) {
  var data = _ref4.data;
  var w = 78, h = 30, pad = 2;
  var max = Math.max.apply(null, data.concat([1]));
  var step = (w - pad * 2) / (data.length - 1);
  var pts = data.map(function(v, i) { return [pad + i * step, h - pad - (v / max) * (h - pad * 2)]; });
  var line = pts.map(function(p) { return p.join(','); }).join(' ');
  var area = pad + ',' + (h - pad) + ' ' + line + ' ' + (w - pad) + ',' + (h - pad);
  var last = pts[pts.length - 1];
  return React.createElement('svg', { className: 'v5-spark', viewBox: '0 0 ' + w + ' ' + h },
    React.createElement('polygon', { className: 'area', points: area }),
    React.createElement('polyline', { className: 'line', points: line }),
    React.createElement('circle', { className: 'endpt', cx: last[0], cy: last[1], r: 2.4 })
  );
}

// ============== NEWSROOM ==============

// Map a Sanity `news` document into the chat-feed bubble shape.
function v5NewsToFeedMessage(n) {
  var iso = n.publishedAt || n._createdAt || new Date().toISOString();
  var d;
  try { d = new Date(iso); } catch (_) { d = new Date(); }
  var hh = String(d.getHours()).padStart(2, '0');
  var mm = String(d.getMinutes()).padStart(2, '0');
  var tag = (V5_CATEGORY_LABELS && V5_CATEGORY_LABELS[n.category]) || n.category || 'חדשות';
  var text = n.headline || '';
  if (n.dek) text = text + ' — ' + n.dek;
  return {
    type: 'msg',
    time: hh + ':' + mm,
    tag: tag,
    text: text,
    urgent: n.urgency === 'breaking' || n.urgency === 'high',
  };
}

function V5Newsroom() {
  var _useState6 = useV5S('whatsapp');
  var skin = _useState6[0], setSkin = _useState6[1];
  var _liveFeed = useV5S(null);
  var liveFeed = _liveFeed[0], setLiveFeed = _liveFeed[1];

  useV5E(function() {
    var aborted = false;
    fetch('/api/list-news').then(function(r) { return r.ok ? r.json() : null; }).then(function(j) {
      if (aborted || !j || !Array.isArray(j.news) || !j.news.length) return;
      // chat feed = today header + last 5 news, oldest first (so newest sits at bottom)
      var sorted = j.news.slice(0, 5).reverse();
      var today = new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
      var mapped = [{ type: 'system', text: 'היום · ' + today }].concat(sorted.map(v5NewsToFeedMessage));
      setLiveFeed(mapped);
    }).catch(function() { /* fall back to V5_FEED */ });
    return function() { aborted = true; };
  }, []);

  return React.createElement('section', { id: 'news', className: 'v5-newsroom' },
    React.createElement('div', { className: 'v5-newsroom-head' },
      React.createElement('div', { className: 'v5-eyebrow' }, '[ §02 — NEWSROOM ]'),
      React.createElement('h2', null, 'הניוזרום שלנו ', React.createElement('span', { className: 'serif' }, 'בכיס שלך.')),
      React.createElement('p', null, 'וואטסאפ, טלגרם או מסנג׳ר — אותו תוכן, אפס פיד אינסופי. רק מה שצריך לדעת, מתי שצריך.')
    ),
    React.createElement('div', { className: 'v5-newsroom-grid' },
      React.createElement('div', { className: 'v5-phone-col', 'data-v5-reveal': true, style: { '--ey': '40px' } },
        React.createElement('div', { className: 'v5-skin-squares' },
          [['whatsapp','#25D366','W','WhatsApp'],['telegram','#2AABEE','T','Telegram'],['messenger','#0084FF','M','Messenger']].map(function(s) {
            return React.createElement('button', {
              key: s[0],
              className: 'v5-skin-sq ' + (skin === s[0] ? 'active' : '') + ' sq-' + s[0],
              onClick: function() { return setSkin(s[0]); },
              title: s[3]
            }, React.createElement('span', { style: { background: s[1] } }, s[2]));
          })
        ),
        React.createElement('div', { className: 'v5-phone' },
          React.createElement('div', { className: 'v5-phone-notch' }),
          React.createElement('div', { className: 'v5-phone-screen' },
            React.createElement(V5Chat, { skin: skin, feed: liveFeed })
          )
        )
      ),
      React.createElement('div', { className: 'v5-hot', 'data-v5-reveal': true, style: { '--ex': '30px' } },
        React.createElement('div', { className: 'v5-hot-head' },
          React.createElement('h3', null,
            React.createElement('span', null,
              React.createElement('small', null, 'HOT 06 · WEEKLY'),
              ' הכי ',
              React.createElement('span', { className: 'serif' }, 'חמים')
            )
          ),
          React.createElement('div', { className: 'v5-hot-meta-bar' },
            React.createElement('span', { className: 'mono' }, 'N°247'),
            React.createElement('strong', null, '● LIVE')
          )
        ),
        React.createElement('div', { className: 'v5-hot-list' },
          V5_HOT.map(function(row) {
            return React.createElement('a', {
              key: row.rank,
              href: V5_LINKS.articleDemo,
              className: 'v5-hot-row ' + (row.rank <= 2 ? 'is-fire' : '') + ' ' + (row.dir === 'dn' ? 'dn' : ''),
              'data-cat': 'cat-' + row.cat.split(' ')[0]
            },
              React.createElement('span', { className: 'v5-hot-rk' }, String(row.rank).padStart(2, '0')),
              React.createElement('div', { className: 'v5-hot-mid' },
                React.createElement('div', { className: 'v5-hot-meta' },
                  React.createElement('span', { className: 'v5-hot-cat' }, row.cat),
                  React.createElement('span', { className: 'v5-hot-tool' }, row.tool)
                ),
                React.createElement('strong', null, row.title)
              ),
              React.createElement(V5Sparkline, { data: row.spark }),
              React.createElement('div', { className: 'v5-hot-side' },
                React.createElement('span', { className: 'score' }, row.score + 'K'),
                React.createElement('span', { className: 'delta ' + (row.dir === 'dn' ? 'dn' : row.dir === 'new' ? 'new' : '') }, row.delta)
              )
            );
          })
        ),
        React.createElement('div', { className: 'v5-hot-foot' },
          React.createElement('span', { className: 'live' }, 'UPDATED 14:32'),
          React.createElement('a', { href: V5_LINKS.articles }, 'כל הדירוג ↗')
        )
      )
    )
  );
}

// ============== ARTICLE WALL ==============

var V5_POSTIT_COLORS = ['mustard', 'sky', 'sage', 'lavender', 'rose', 'paper'];

function v5ExtractFirstParagraph(blocks) {
  if (!Array.isArray(blocks)) return '';
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    if (b && b._type === 'block' && b.style === 'normal' && Array.isArray(b.children)) {
      var txt = b.children.map(function (c) { return c && c.text ? c.text : ''; }).join(' ').trim();
      if (txt) return txt.slice(0, 180);
    }
  }
  return '';
}

function v5SanityArticleToPostit(a, idx) {
  return {
    id: a._id || a.slug || 'art-' + idx,
    slug: a.slug || '',
    cat: 'GUIDE',
    color: V5_POSTIT_COLORS[idx % V5_POSTIT_COLORS.length],
    tag: 'מאמר',
    title: a.title || '(ללא כותרת)',
    body: v5ExtractFirstParagraph(a.content) || '— ',
    author: 'מערכת',
    read: '— ',
  };
}

function V5ArticleWall() {
  var _useState7 = useV5S('ALL');
  var filter = _useState7[0], setFilter = _useState7[1];
  var _live = useV5S(null);
  var liveArticles = _live[0], setLiveArticles = _live[1];

  useV5E(function() {
    var aborted = false;
    fetch('/api/list-articles').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (aborted || !j || !Array.isArray(j.articles) || !j.articles.length) return;
      setLiveArticles(j.articles.slice(0, V5_POS.length).map(v5SanityArticleToPostit));
    }).catch(function () { /* keep demo */ });
    return function () { aborted = true; };
  }, []);

  var articles = liveArticles && liveArticles.length ? liveArticles : V5_ARTICLES;
  var cats = ['ALL', 'OPINION', 'GUIDE', 'TOOLS', 'DEEP DIVE', 'BENCH'];

  return React.createElement('section', { id: 'tools', className: 'v5-wall' },
    React.createElement('div', { className: 'v5-sec-head' },
      React.createElement('div', { className: 'v5-eyebrow' }, '[ §03 — THE WALL ]'),
      React.createElement('h2', null, 'קיר ', React.createElement('span', { className: 'serif' }, 'המאמרים.')),
      React.createElement('p', { className: 'v5-sec-p' }, 'גרור. לחץ. תפתח. תקרא. ', React.createElement('em', null, 'כל פתק חי משלו.')),
      React.createElement('div', { className: 'v5-wall-filters' },
        cats.map(function(c) {
          return React.createElement('button', {
            key: c,
            className: 'v5-wf ' + (filter === c ? 'active' : ''),
            onClick: function() { return setFilter(c); }
          }, c);
        })
      )
    ),
    React.createElement('div', { className: 'v5-wall-stage' },
      articles.map(function(a, i) {
        var visible = filter === 'ALL' || a.cat === filter;
        return React.createElement(V5ArticlePostit, { key: a.id, a: a, pos: V5_POS[i], visible: visible });
      })
    )
  );
}

function V5ArticlePostit(_ref5) {
  var a = _ref5.a, pos = _ref5.pos, visible = _ref5.visible;
  var ref = useV5Drag();
  var _useState8 = useV5S(false);
  var open = _useState8[0], setOpen = _useState8[1];

  return React.createElement('article', {
    ref: ref,
    className: 'v5-pn v5-pn-' + a.color + ' ' + (open ? 'is-open' : '') + ' ' + (visible ? '' : 'is-hidden'),
    style: {
      left: pos.left, top: pos.top,
      transform: 'translate3d(var(--dx,0), var(--dy,0), 0) rotate(' + pos.rot + 'deg)'
    }
  },
    React.createElement('span', { className: 'v5-pn-pin' }),
    React.createElement('div', { className: 'v5-pn-meta' },
      React.createElement('span', { className: 'v5-pn-cat mono' }, a.cat),
      React.createElement('span', { className: 'v5-pn-tag' }, a.tag)
    ),
    React.createElement('h4', null, a.title),
    React.createElement('div', { className: 'v5-pn-body' },
      React.createElement('p', null, a.body),
      React.createElement('a', { className: 'v5-pn-link', href: V5_LINKS.articleDemo, 'data-no-drag': true }, 'קרא את המאמר ↗')
    ),
    React.createElement('div', { className: 'v5-pn-foot' },
      React.createElement('span', { className: 'mono' }, a.author),
      React.createElement('button', { className: 'v5-pn-toggle', 'data-no-drag': true, onClick: function(e) { e.stopPropagation(); setOpen(function(o) { return !o; }); } },
        open ? '— סגור' : '+ פתח'
      ),
      React.createElement('span', { className: 'mono' }, a.read)
    )
  );
}

// ============== ARTICLE TEMPLATE (Demo / New) ==============

function V5ArticleTemplate(_ref6) {
  var mode = _ref6.mode;
  var isDemo = mode === 'demo';
  var outline = isDemo ? V5_ARTICLE_OUTLINE : V5_TEMPLATE_OUTLINE;
  var related = isDemo
    ? V5_RELATED.map(function(item) { return Object.assign({}, item, { href: V5_LINKS.articles }); })
    : V5_TEMPLATE_RELATED;

  return React.createElement('section', { id: 'guides', className: 'v5-article-template' },
    React.createElement('div', { className: 'v5-article-paper' }),
    React.createElement('div', { className: 'v5-article-top', 'data-v5-reveal': true },
      React.createElement('div', { className: 'v5-article-labels' },
        React.createElement('span', null, isDemo ? '§05 - DEMO ARTICLE' : '§05 - NEW ARTICLE TEMPLATE'),
        React.createElement('span', null, isDemo ? 'מדריך / מאמר / השוואה' : 'טמפלט למדריך / מאמר / השוואה'),
        React.createElement('span', null, isDemo ? 'RTL READY' : 'READY TO FILL')
      ),
      React.createElement('h2', null,
        isDemo ? 'בונים סוכן AI ב-Cursor:' : 'כאן נכנסת הכותרת.',
        React.createElement('span', { className: 'serif' }, isDemo ? ' מהפתק הראשון לפרודקשן.' : ' כאן נבנה ההוק של המאמר.')
      ),
      React.createElement('p', null,
        isDemo
          ? 'זה עמוד דוגמה מלא כדי לראות איך מאמר נראה באופציה E: עם היררכיה, ויזואל, TL;DR, ציטוט, קוד וקישורי המשך.'
          : 'זה עמוד הטמפלט שפותחים כשמתחילים מאמר חדש. המבנה, הקצב והאווירה כבר בפנים; עכשיו אפשר לצקת לתוכם את הסיפור עצמו.',
        React.createElement('span', { className: 'v5-article-links' },
          React.createElement('a', { href: V5_LINKS.articles }, 'חזרה לספריית המאמרים'),
          React.createElement('a', { href: isDemo ? V5_LINKS.article : V5_LINKS.articleDemo },
            isDemo ? 'פתח מאמר חדש' : 'ראה מאמר דוגמה מלא'
          )
        )
      )
    ),
    React.createElement('div', { className: 'v5-article-shell' },
      React.createElement('aside', { className: 'v5-article-rail', 'data-v5-reveal': true, style: { '--ex': '26px' } },
        React.createElement('div', { className: 'v5-rail-card' },
          React.createElement('strong', null, 'TL;DR'),
          React.createElement('p', null,
            isDemo
              ? 'Cursor + MCP + מודל טוב הם לא מוצר. צריך גבולות, בדיקות, לוגים ו-rollback.'
              : 'כאן מכניסים ב-2 או 3 שורות את ה-takeaway של המאמר, כדי שגם סריקה מהירה תעבוד.'
          )
        ),
        React.createElement('div', { className: 'v5-rail-card v5-rail-dark' },
          React.createElement('span', { className: 'mono' }, 'READING MAP'),
          outline.map(function(item) {
            return React.createElement('a', { key: item.id, href: '#' + item.id },
              React.createElement('em', null, String(outline.indexOf(item) + 1).padStart(2, '0')),
              item.title
            );
          })
        ),
        React.createElement('div', { className: 'v5-rail-note' },
          isDemo
            ? 'לא עוד "AI יעשה הכל". יותר כמו: AI יעשה הרבה, ואתה תהיה המבוגר האחראי בחדר.'
            : 'טיפ: אם הפתיחה לא מייצרת סקרנות תוך 3 שורות, הקורא כבר בדרך החוצה.'
        )
      ),
      React.createElement('article', { className: 'v5-longform', 'data-v5-reveal': true },
        React.createElement('div', { className: 'v5-longform-meta' },
          React.createElement('span', null, isDemo ? 'מדריך' : 'סוג מאמר'),
          React.createElement('span', null, isDemo ? '09.05.2026' : 'DD.MM.YYYY'),
          React.createElement('span', null, isDemo ? 'יואב לוי' : 'AUTHOR NAME'),
          React.createElement('span', null, isDemo ? '11 דק׳' : 'X דק׳ קריאה')
        ),
        React.createElement('div', { className: 'v5-longform-hero' },
          React.createElement(V5ArticleVisual)
        ),
        React.createElement('p', { id: 'article-intro', className: 'lead' },
          isDemo
            ? 'כל שבוע נולד כלי חדש שמבטיח אפליקציה בפרומפט אחד. בפועל, ההבדל בין דמו יפה לבין מוצר שאפשר לסמוך עליו הוא לא הקסם של המודל, אלא השיטה שמקיפה אותו.'
            : 'כאן נכנס הפתיח הראשון של המאמר. הוא אמור להסביר מה הבעיה, למה דווקא עכשיו, ומה בדיוק הקורא ירוויח אם יישאר עד הסוף.'
        ),
        React.createElement('h3', { id: 'article-stack' },
          isDemo ? '1. מתחילים מבעיה קטנה, לא מסוכן כל-יכול' : '1. פרק ראשון: ממסגרים את הבעיה'
        ),
        React.createElement('p', null,
          isDemo
            ? 'הטעות הקלאסית היא לבנות סוכן שמנהל את כל החיים. במקום זה, בוחרים פעולה אחת שחוזרת על עצמה: סיכום PR, יצירת טיוטת מסמך, בדיקת issue, או בניית קומפוננטה מתוך brief.'
            : 'בפרק הזה מגדירים את החיכוך, הקונטקסט והסיבה לכתיבת המאמר. זה המקום להכניס דוגמה קצרה, נתון מעניין או סצנה שמכניסה את הקורא פנימה.'
        ),
        React.createElement('blockquote', null,
          isDemo
            ? '"וייב קודינג טוב הוא לא לוותר על ארכיטקטורה. הוא להזיז אותה קדימה מהר יותר."'
            : '"כאן נכנס משפט מפתח, ציטוט או takeaway חד שמייצר עצירה קטנה באמצע הקריאה."'
        ),
        React.createElement('div', { className: 'v5-method-card' },
          React.createElement('span', { className: 'mono' }, isDemo ? 'PROMPT CONTRACT' : 'ARTICLE BLUEPRINT'),
          React.createElement('code', null, isDemo ? "role: senior implementation agent\ninput: issue + repo context\nrules: ask only when blocked\noutput: patch + tests + risks" : "headline:\nsubheadline:\nreader:\npromise:\nsections:\n  - hook\n  - context\n  - main insight\n  - examples / comparison\n  - conclusion\ncta:")
        ),
        React.createElement('h3', { id: 'article-risks' },
          isDemo ? '2. בונים שלוש שכבות: מודל, כלים, שמירה' : '2. פרק שני: הגוף הראשי של המאמר'
        ),
        React.createElement('p', null,
          isDemo
            ? 'למודל נותנים יכולת לחשוב, לכלים נותנים יכולת לבצע, ולשכבת השמירה נותנים את הכוח לעצור אותו. זה המקום שבו MCP, הרשאות, בדיקות ו-CI הופכים מאביזרים ל-infrastructure.'
            : 'כאן נכנס עומק אמיתי: השוואות, צעדים, תובנות, פירוקים, תמונות מסך, קטעי קוד או prompts. זה החלק שבו המאמר מפסיק להיות רק כותרת טובה ומתחיל להיות שימושי.'
        ),
        React.createElement('div', { className: 'v5-compare-strip' },
          isDemo ? (
            React.createElement(React.Fragment, null,
              React.createElement('div', null,
                React.createElement('span', null, 'דמו'),
                React.createElement('strong', null, 'prompt → wow'),
                React.createElement('em', null, 'מהיר, שביר')
              ),
              React.createElement('div', null,
                React.createElement('span', null, 'מוצר'),
                React.createElement('strong', null, 'context → tools → tests'),
                React.createElement('em', null, 'איטי יותר, אמיתי')
              ),
              React.createElement('div', null,
                React.createElement('span', null, 'צוות'),
                React.createElement('strong', null, 'agent → review → ship'),
                React.createElement('em', null, 'הקצב הנכון')
              )
            )
          ) : (
            React.createElement(React.Fragment, null,
              React.createElement('div', null,
                React.createElement('span', null, 'HOOK'),
                React.createElement('strong', null, 'title → promise'),
                React.createElement('em', null, 'מה הקורא יקבל')
              ),
              React.createElement('div', null,
                React.createElement('span', null, 'BODY'),
                React.createElement('strong', null, 'insight → example → proof'),
                React.createElement('em', null, 'העומק שגורם להישאר')
              ),
              React.createElement('div', null,
                React.createElement('span', null, 'END'),
                React.createElement('strong', null, 'takeaway → action'),
                React.createElement('em', null, 'מה לוקחים הלאה')
              )
            )
          )
        ),
        React.createElement('h3', { id: 'article-ship' },
          isDemo ? '3. משחררים רק אחרי שיש דרך לדעת שנשבר' : '3. פרק סיום: סגירה, takeaway, CTA'
        ),
        React.createElement('p', null,
          isDemo
            ? 'אם אין לוגים, אין מוצר. אם אין rollback, אין אומץ לשחרר. ואם אין מדד הצלחה אחד, אין דרך לדעת אם הסוכן באמת עוזר או רק עושה רעש יפה.'
            : 'הסוף אמור לסגור את הטענה, לחבר את כל החלקים, ולהשאיר את הקורא עם צעד הבא ברור: מה לבדוק, מה לנסות, או לאן להמשיך מכאן.'
        )
      ),
      React.createElement('aside', { className: 'v5-related', 'data-v5-reveal': true, style: { '--ex': '-26px' } },
        React.createElement('h3', null, isDemo ? 'המשך קריאה' : 'קיצורי דרך'),
        related.map(function(item) {
          return React.createElement('a', { key: item.title, href: item.href },
            React.createElement('strong', null, item.title),
            React.createElement('span', { className: 'mono' }, item.meta)
          );
        })
      )
    )
  );
}

function V5ArticleVisual() {
  return React.createElement('svg', { viewBox: '0 0 920 430', preserveAspectRatio: 'xMidYMid slice' },
    React.createElement('rect', { width: 920, height: 430, fill: '#11110d' }),
    React.createElement('g', { opacity: 0.23, stroke: '#f4f0e8' },
      Array.from({ length: 16 }, function(_, i) { return React.createElement('line', { key: 'h' + i, x1: 0, y1: i * 32, x2: 920, y2: i * 32 }); }),
      Array.from({ length: 28 }, function(_, i) { return React.createElement('line', { key: 'v' + i, x1: i * 36, y1: 0, x2: i * 36, y2: 430 }); })
    ),
    React.createElement('g', { transform: 'translate(120 78)' },
      React.createElement('rect', { x: 0, y: 0, width: 260, height: 170, rx: 18, fill: '#88a884' }),
      React.createElement('text', { x: 28, y: 62, fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 700, fill: '#11110d' }, '{issue}'),
      React.createElement('text', { x: 28, y: 108, fontFamily: 'Heebo', fontSize: 34, fontWeight: 900, fill: '#11110d', dir: 'rtl' }, 'בעיה קטנה')
    ),
    React.createElement('path', { d: 'M392 160 C482 80 520 270 620 170', stroke: '#7da4be', strokeWidth: 8, fill: 'none', strokeLinecap: 'round' }),
    React.createElement('g', { transform: 'translate(610 132) rotate(-4)' },
      React.createElement('rect', { x: 0, y: 0, width: 210, height: 140, rx: 18, fill: '#c0d8e8' }),
      React.createElement('text', { x: 26, y: 58, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 52, fill: '#11110d' }, 'agent.'),
      React.createElement('text', { x: 28, y: 98, fontFamily: 'JetBrains Mono', fontSize: 14, fill: '#11110d' }, 'tools + tests')
    ),
    React.createElement('circle', { cx: 500, cy: 330, r: 54, fill: '#b89cc4' }),
    React.createElement('text', { x: 500, y: 340, textAnchor: 'middle', fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, fill: '#11110d' }, 'SHIP'),
    React.createElement('text', { x: 52, y: 376, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 74, fill: '#f4f0e8', dir: 'rtl' }, 'from chaos to production.')
  );
}

// ============== INFINITY CANVAS ==============

function V5Canvas() {
  return React.createElement('section', { className: 'v5-canvas' },
    React.createElement('div', { className: 'v5-canvas-head' },
      React.createElement('div', { className: 'v5-eyebrow' }, '[ §06 — INFINITY ]'),
      React.createElement('h2', null, 'הכל זורם. ', React.createElement('span', { className: 'serif' }, 'לכל הכיוונים.'))
    ),
    React.createElement('div', { className: 'v5-streams' },
      React.createElement(V5Stream, { items: V5_CATS.map(function(c) { return Object.assign({ kind: 'cat' }, c); }), dir: 'ltr', speed: '60s', tone: 'cat' }),
      React.createElement(V5Stream, { items: V5_ARTICLES.map(function(a) { return Object.assign({ kind: 'art' }, a); }), dir: 'rtl', speed: '80s', tone: 'art' }),
      React.createElement(V5Stream, { items: V5_QUOTES.map(function(q, i) { return { kind: 'q', q: q, i: i }; }), dir: 'ltr', speed: '100s', tone: 'q' })
    )
  );
}

function V5Stream(_ref7) {
  var items = _ref7.items, dir = _ref7.dir, speed = _ref7.speed, tone = _ref7.tone;
  var doubled = [].concat(items, items, items);
  return React.createElement('div', {
    className: 'v5-stream tone-' + tone,
    style: { '--speed': speed, '--dir': dir === 'ltr' ? 'normal' : 'reverse' }
  },
    React.createElement('div', { className: 'v5-stream-track' },
      doubled.map(function(it, idx) {
        if (it.kind === 'cat') return React.createElement(V5StreamCat, { key: idx, c: it });
        if (it.kind === 'art') return React.createElement(V5StreamArt, { key: idx, a: it });
        return React.createElement(V5StreamQ, { key: idx, q: it.q });
      })
    )
  );
}

function V5StreamCat(_ref8) {
  var c = _ref8.c;
  return React.createElement('a', { className: 'v5-s-cat', href: V5_LINKS.articles },
    React.createElement('span', { className: 'serif' }, c.en),
    React.createElement('span', { className: 'he' }, c.he),
    React.createElement('span', { className: 'mono' }, c.count)
  );
}

function V5StreamArt(_ref9) {
  var a = _ref9.a;
  return React.createElement('a', { className: 'v5-s-art tone-' + a.color, href: V5_LINKS.articleDemo },
    React.createElement('span', { className: 'mono' }, a.cat),
    React.createElement('strong', null, a.title),
    React.createElement('span', { className: 'v5-s-art-arrow' }, '↗')
  );
}

function V5StreamQ(_ref10) {
  var q = _ref10.q;
  return React.createElement('span', { className: 'v5-s-q' },
    React.createElement('span', { className: 'serif' }, q),
    React.createElement('span', { className: 'v5-s-q-dot' }, '·')
  );
}

// ============== TICKER / CTA / FOOT ==============

var V5_TICKER = [
  { time: '14:32', text: 'Anthropic משיקה את Claude 5 Opus' },
  { time: '14:18', text: 'GPT-5o זמין עכשיו ב-API במחיר נמוך ב-40%' },
  { time: '13:55', text: 'מדריך חדש: בניית סוכן AI מלא ב-Cursor' },
  { time: '13:41', text: 'Bolt.new עוקפת את v0 בבנצ׳מרקים יצירת אפליקציות' },
  { time: '13:22', text: 'Lovable מגייסת 100M$ בסבב סדרה B' },
];

function V5Ticker() {
  var items = [].concat(V5_TICKER, V5_TICKER, V5_TICKER);
  return React.createElement('div', { className: 'v5-ticker' },
    React.createElement('div', { className: 'v5-ticker-label' }, 'LIVE'),
    React.createElement('div', { className: 'v5-ticker-track' },
      items.map(function(t, i) {
        return React.createElement('div', { key: i, className: 'v5-ticker-item' },
          React.createElement('span', { className: 'mono' }, t.time),
          React.createElement('span', null, t.text),
          React.createElement('span', { className: 'v5-ticker-sep' }, '/')
        );
      })
    )
  );
}

function V5Cta() {
  return React.createElement('section', { id: 'community', className: 'v5-cta' },
    React.createElement('div', { className: 'v5-cta-ghost' }, 'JOIN · JOIN · JOIN'),
    React.createElement('h2', null, 'לחץ על הכפתור.', React.createElement('br'), React.createElement('span', { className: 'serif' }, 'הכל יגיע אליך.')),
    React.createElement('p', null, 'בלי טופס. בלי אימייל. רק WhatsApp / Telegram / Messenger.'),
    React.createElement('div', { className: 'v5-cta-row' },
      React.createElement('a', { className: 'v5-cta-btn primary', href: V5_LINKS.community }, 'הצטרף ב־WhatsApp ', React.createElement('span', null, '↗')),
      React.createElement('a', { className: 'v5-cta-btn ghost', href: V5_LINKS.community }, 'Telegram ↗'),
      React.createElement('a', { className: 'v5-cta-btn ghost', href: V5_LINKS.community }, 'Messenger ↗')
    )
  );
}

function V5Foot() {
  return React.createElement('footer', { className: 'v5-foot' },
    React.createElement('div', { className: 'v5-foot-top' },
      React.createElement('div', null,
        React.createElement('div', { className: 'mono' }, '© 2026 NVISION AI · TEL AVIV'),
        React.createElement('div', { className: 'mono', style: { marginTop: 8 } }, 'VIBE CODE NEWS · ISSUE №247')
      ),
      React.createElement('div', { className: 'v5-foot-cols' },
        React.createElement('div', null,
          React.createElement('h5', null, 'CONTENT'),
          React.createElement('a', { href: V5_LINKS.news }, 'חדשות'),
          React.createElement('a', { href: V5_LINKS.articles }, 'מאמרים'),
          React.createElement('a', { href: V5_LINKS.article }, 'מדריכים'),
          React.createElement('a', { href: V5_LINKS.tools }, 'קייסים')
        ),
        React.createElement('div', null,
          React.createElement('h5', null, 'CHANNELS'),
          React.createElement('a', { href: V5_LINKS.community }, 'WhatsApp ↗'),
          React.createElement('a', { href: V5_LINKS.community }, 'Telegram ↗'),
          React.createElement('a', { href: V5_LINKS.community }, 'Messenger ↗'),
          React.createElement('a', { href: V5_LINKS.community }, 'RSS')
        ),
        React.createElement('div', null,
          React.createElement('h5', null, 'LEGAL'),
          React.createElement('a', { href: V5_LINKS.home }, 'פרטיות'),
          React.createElement('a', { href: V5_LINKS.home }, 'תנאים'),
          React.createElement('a', { href: V5_LINKS.community }, 'צור קשר')
        )
      )
    ),
    React.createElement('div', { className: 'v5-foot-mark' }, 'nVision', React.createElement('span', null, '.'))
  );
}

// ============== EDITOR COMPONENTS ==============
// The Notion-style editor, MyArticles list, and reading view live in v5-editor.jsx
// and attach to window.V5ArticleEditorV2 / V5MyArticlesV2 / V5ArticleViewerV2 / V5RenderArticle.
// v5-newsroom.jsx only owns the storage helpers (loadArticles, saveArticleToLocal,
// deleteArticleFromLocal, getArticleFromLocal) used by both the editor and the routing below.


// ============== PAGES ==============

function V5HomePage() {
  return React.createElement(React.Fragment, null,
    React.createElement('main', { id: 'home', className: 'v5-hero' },
      React.createElement('div', { className: 'v5-paper' }),
      React.createElement('div', { className: 'v5-grain' }),
      React.createElement(V5Keywords),
      React.createElement(V5Title)
    ),
    React.createElement(V5Ticker),
    React.createElement(V5Newsroom),
    React.createElement(V5ArticleWall),
    React.createElement(V5ArticleTemplate),
    React.createElement(V5Canvas),
    React.createElement(V5Cta)
  );
}

// ---- Articles list with search + pagination ----
var V5_ARTICLES_PAGE_SIZE = 12;

function V5ArticlesBrowser() {
  // Search state
  var _q = useV5S('');
  var q = _q[0], setQ = _q[1];
  var _qLive = useV5S('');
  var qLive = _qLive[0], setQLive = _qLive[1];

  var _page = useV5S(0);
  var page = _page[0], setPage = _page[1];

  var _items = useV5S([]);
  var items = _items[0], setItems = _items[1];
  var _total = useV5S(0);
  var total = _total[0], setTotal = _total[1];
  var _loading = useV5S(true);
  var loading = _loading[0], setLoading = _loading[1];
  var _err = useV5S('');
  var err = _err[0], setErr = _err[1];

  // Debounce search input → q
  useV5E(function() {
    var t = setTimeout(function() { setQ(qLive.trim()); setPage(0); }, 280);
    return function() { clearTimeout(t); };
  }, [qLive]);

  // Fetch results when q or page changes
  useV5E(function() {
    var aborted = false;
    setLoading(true);
    setErr('');
    var offset = page * V5_ARTICLES_PAGE_SIZE;
    var url = '/api/search?type=article&limit=' + V5_ARTICLES_PAGE_SIZE + '&offset=' + offset
      + (q ? '&q=' + encodeURIComponent(q) : '');
    fetch(url).then(function(r) { return r.ok ? r.json() : null; }).then(function(j) {
      if (aborted) return;
      if (!j || !j.ok) {
        setItems([]); setTotal(0); setErr('שגיאת חיפוש'); setLoading(false); return;
      }
      setItems(j.results || []);
      setTotal(j.total || 0);
      setLoading(false);
    }).catch(function() {
      if (aborted) return;
      setItems([]); setTotal(0); setErr('שגיאת רשת'); setLoading(false);
    });
    return function() { aborted = true; };
  }, [q, page]);

  var totalPages = Math.max(1, Math.ceil(total / V5_ARTICLES_PAGE_SIZE));
  var hasPrev = page > 0;
  var hasNext = (page + 1) < totalPages;

  function openArticle(it) {
    var slug = it.slug || it._id;
    window.location.href = 'articles.html?action=view&slug=' + encodeURIComponent(slug);
  }
  function newArticle() {
    window.location.href = 'articles.html?action=new';
  }

  // Cards
  var cards = items.map(function(it) {
    var title = it.title || it.headline || '(ללא כותרת)';
    var preview = it.excerpt || it.dek || it.bodyPreview || '';
    var dateStr = it.publishedAt || it._updatedAt;
    var dateLabel = dateStr ? new Date(dateStr).toLocaleDateString('he-IL') : '';
    return React.createElement('article', {
      key: it._id,
      className: 'v5-news-card is-grid',
      role: 'button',
      tabIndex: 0,
      onClick: function() { openArticle(it); },
      onKeyDown: function(e) { if (e.key === 'Enter') openArticle(it); },
    },
      React.createElement('div', { className: 'v5-news-meta' },
        React.createElement('span', { className: 'v5-news-cat' }, 'מאמר'),
        dateLabel && React.createElement('span', { className: 'v5-news-time mono' }, dateLabel)
      ),
      React.createElement('h3', { className: 'v5-news-headline' }, title),
      preview && React.createElement('p', { className: 'v5-news-dek' },
        preview.length > 180 ? preview.slice(0, 180) + '…' : preview
      )
    );
  });

  return React.createElement('section', { className: 'v5-news-page' },
    React.createElement('header', { className: 'v5-news-head' },
      React.createElement('div', null,
        React.createElement('p', { className: 'v5-eyebrow mono' }, 'NEWSROOM · ARTICLES'),
        React.createElement('h1', { className: 'v5-news-title' }, 'מאמרים'),
        React.createElement('p', { className: 'v5-news-sub' },
          total > 0 ? (total + ' מאמרים' + (q ? ' תואמים ל-"' + q + '"' : '')) : (loading ? 'טוען…' : (q ? 'אין תוצאות' : 'אין מאמרים עדיין'))
        )
      ),
      React.createElement('div', { className: 'v5-news-view-toggle', style: { gap: 8 } },
        React.createElement('input', {
          type: 'search',
          className: 'v5-news-search-input',
          placeholder: 'חיפוש מאמרים...',
          value: qLive,
          onChange: function(e) { setQLive(e.target.value); },
          style: {
            padding: '8px 12px', borderRadius: 6, border: '1px solid var(--v5-line, #ccc)',
            background: 'var(--v5-paper, #fff)', color: 'var(--v5-ink, #1a1a1a)',
            minWidth: 180, fontFamily: 'inherit', fontSize: 14, direction: 'rtl',
          },
        }),
        React.createElement('button', {
          type: 'button',
          className: 'v5-news-view-btn is-active',
          onClick: newArticle,
        }, '+ חדש')
      )
    ),
    err && React.createElement('p', { className: 'v5-news-sub', style: { color: '#c0392b' } }, err),
    React.createElement('div', { className: 'v5-news-feed v5-news-feed-grid' }, cards),
    !loading && total === 0 && !err && React.createElement('p', {
      className: 'v5-news-sub',
      style: { textAlign: 'center', padding: '32px 0' },
    }, q ? 'אין מאמרים שתואמים לחיפוש.' : 'עדיין אין מאמרים. לחץ "+ חדש" כדי להתחיל.'),
    totalPages > 1 && React.createElement('nav', {
      className: 'v5-news-pagination',
      style: {
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
        padding: '24px 0', flexWrap: 'wrap',
      },
    },
      React.createElement('button', {
        type: 'button',
        className: 'v5-news-view-btn',
        disabled: !hasPrev,
        onClick: function() { if (hasPrev) setPage(page - 1); },
        style: { opacity: hasPrev ? 1 : 0.4 },
      }, '‹ הקודם'),
      React.createElement('span', { className: 'mono', style: { fontSize: 13 } },
        'עמוד ' + (page + 1) + ' מתוך ' + totalPages
      ),
      React.createElement('button', {
        type: 'button',
        className: 'v5-news-view-btn',
        disabled: !hasNext,
        onClick: function() { if (hasNext) setPage(page + 1); },
        style: { opacity: hasNext ? 1 : 0.4 },
      }, 'הבא ›')
    )
  );
}

function V5ArticlesPage() {
  // Read URL params on initial render (lazy init to avoid flash)
  var _useState20 = useV5S(function() {
    var params = new URLSearchParams(window.location.search);
    return params.get('action') || '';
  });
  var action = _useState20[0], setAction = _useState20[1];

  var _useState21 = useV5S(function() {
    var params = new URLSearchParams(window.location.search);
    return params.get('slug') || '';
  });
  var slug = _useState21[0], setSlug = _useState21[1];

  // Refresh on URL change (for back/forward navigation)
  useV5E(function() {
    function onPopState() {
      var params = new URLSearchParams(window.location.search);
      setAction(params.get('action') || '');
      setSlug(params.get('slug') || '');
    }
    window.addEventListener('popstate', onPopState);
    return function() { window.removeEventListener('popstate', onPopState); };
  }, []);

  // Edit or create article (V2 editor from v5-editor.jsx)
  if (action === 'edit' || action === 'new') {
    var article = action === 'edit' && slug ? getArticleFromLocal(slug) : null;
    return React.createElement(window.V5ArticleEditorV2, {
      initialData: article || undefined,
      onSaved: function() { window.location.href = 'articles.html'; },
      onCancel: function() { window.location.href = 'articles.html'; },
      onDeleted: function() { window.location.href = 'articles.html'; }
    });
  }

  // View an existing article (V2 viewer from v5-editor.jsx)
  if (action === 'view' && slug) {
    var viewArticle = getArticleFromLocal(slug);
    return React.createElement(window.V5ArticleViewerV2, {
      article: viewArticle,
      onBack: function() { window.location.href = 'articles.html'; }
    });
  }

  // Default: paginated, searchable browser (Sanity-backed).
  return React.createElement(V5ArticlesBrowser);
}

// ============== NEWS PAGE ==============
// Hybrid feed: timeline (default) ↔ grid toggle.
// Each item is a NewsCard with three open modes: inline expand, popup modal,
// WhatsApp deep-link share.

var V5_NEWS_FALLBACK = [
  {
    _id: 'fallback-1',
    headline: 'Claude Opus 4.7 משחרר context window של מיליון טוקנים',
    dek: 'Anthropic מכריזה על תמיכה מלאה ב-1M context, זמין דרך API ו-Claude Code.',
    body: 'הכרזה רשמית מבית Anthropic על הרחבת window הקונטקסט ב-Opus 4.7 למיליון טוקנים. הגרסה כבר זמינה דרך ה-CLI של Claude Code עם דגל 1m. המשמעות: ניתוח codebases שלמים בקריאה אחת.',
    category: 'release',
    urgency: 'high',
    channels: ['web', 'telegram'],
    slug: 'opus-4-7-1m-context',
    source: 'Anthropic',
    publishedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    _id: 'fallback-2',
    headline: 'n8n v2 בדרך — workflow editor חדש ו-AI agents native',
    dek: 'גרסה חדשה של n8n כוללת ממשק עורך משופר ותמיכה ב-LLM nodes כשרכיב מובנה.',
    body: 'הצוות של n8n פרסם roadmap לגרסה 2 שתכלול editor חדש מבוסס React 18, AI nodes מובנים ל-OpenAI/Anthropic/Groq, ושיפורי ביצועים משמעותיים ב-execution engine.',
    category: 'update',
    urgency: 'normal',
    channels: ['web'],
    slug: 'n8n-v2-roadmap',
    source: 'n8n blog',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    _id: 'fallback-3',
    headline: 'Sanity מציגה Studio v4 עם AI Actions מובנות',
    dek: 'הכלי הפופולרי ל-headless CMS מוסיף actions אוטומטיות בעזרת LLMs בתוך ה-Studio.',
    body: 'Sanity Studio v4 מציגה plugin חדש שמאפשר ליצור document actions עם prompt templates, ולשלוח את התוכן ל-LLM endpoint משלך לעיבוד נוסף לפני שמירה.',
    category: 'release',
    urgency: 'normal',
    channels: ['web', 'telegram'],
    slug: 'sanity-studio-v4',
    source: 'Sanity',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    _id: 'fallback-4',
    headline: 'Cloudflare Workers AI מוסיף Llama 4 70B ל-edge',
    dek: 'מודל חדש זמין דרך Workers AI ללא קונפיגורציה — fan-out automatic ל-edge.',
    body: 'Cloudflare הוסיפה את llama-4-70b-instruct לרשימת המודלים הזמינים דרך Workers AI binding. ה-inference רץ ב-edge הקרוב למשתמש, latency ממוצע ~280ms.',
    category: 'release',
    urgency: 'normal',
    channels: ['web'],
    slug: 'workers-ai-llama-4',
    source: 'Cloudflare',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    _id: 'fallback-5',
    headline: 'OpenAI Codex SDK יוצא מ-beta — אינטגרציה ל-VS Code',
    dek: 'גרסה יציבה של ה-SDK ל-Codex כעת זמינה, כולל extension רשמי ל-VS Code.',
    body: 'אחרי 8 חודשים ב-beta, ה-Codex SDK עובר ל-GA. ה-extension החדש ל-VS Code תומך ב-inline completions, chat, ו-multi-file edits בסגנון Aider.',
    category: 'update',
    urgency: 'low',
    channels: ['web'],
    slug: 'codex-sdk-ga',
    source: 'OpenAI',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
];

var V5_CATEGORY_LABELS = {
  breaking: 'דחוף',
  update: 'עדכון',
  analysis: 'ניתוח',
  release: 'שחרור',
  rumor: 'שמועה',
  'guide-short': 'מדריך קצר',
};

var V5_URGENCY_DOT = {
  breaking: '#e74c3c',
  high: '#e69138',
  normal: '#88a884',
  low: '#bab3a2',
};

function v5FormatRelative(iso) {
  if (!iso) return '';
  var diffMs = Date.now() - new Date(iso).getTime();
  var mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return 'לפני ' + mins + ' דק׳';
  var hrs = Math.round(mins / 60);
  if (hrs < 24) return 'לפני ' + hrs + ' שע׳';
  var days = Math.round(hrs / 24);
  if (days < 7) return 'לפני ' + days + ' ימים';
  return new Date(iso).toLocaleDateString('he-IL');
}

function v5BuildShareText(item) {
  var lines = [item.headline];
  if (item.dek) lines.push('', item.dek);
  if (typeof window !== 'undefined') {
    lines.push('', window.location.origin + '/E - Newsroom Workbench/news.html#' + (item.slug || item._id));
  }
  return lines.join('\n');
}

function V5NewsCard(_ref) {
  var item = _ref.item;
  var view = _ref.view || 'timeline';
  var _expand = useV5S(false);
  var expanded = _expand[0], setExpanded = _expand[1];
  var _modal = _ref.onOpenPopup;

  var urgency = V5_URGENCY_DOT[item.urgency] || V5_URGENCY_DOT.normal;
  var categoryLabel = V5_CATEGORY_LABELS[item.category] || item.category || '';
  var relative = v5FormatRelative(item.publishedAt || item._createdAt);

  function openWhatsApp(e) {
    e.stopPropagation();
    var text = encodeURIComponent(v5BuildShareText(item));
    window.open('https://wa.me/?text=' + text, '_blank', 'noopener');
  }
  function openPopup(e) {
    e.stopPropagation();
    if (_modal) _modal(item);
  }
  function openInline(e) {
    if (e.target.closest('button')) return;
    setExpanded(!expanded);
  }

  return React.createElement('article', {
    className: 'v5-news-card' + (view === 'grid' ? ' is-grid' : ' is-timeline') + (expanded ? ' is-open' : ''),
    onClick: openInline,
    role: 'button',
    tabIndex: 0,
    'data-urgency': item.urgency || 'normal',
  },
    React.createElement('div', { className: 'v5-news-meta' },
      React.createElement('span', { className: 'v5-news-dot', style: { background: urgency } }),
      categoryLabel && React.createElement('span', { className: 'v5-news-cat' }, categoryLabel),
      React.createElement('span', { className: 'v5-news-time mono' }, relative),
      item.source && React.createElement('span', { className: 'v5-news-source' }, '· ' + item.source)
    ),
    React.createElement('h3', { className: 'v5-news-headline' }, item.headline),
    item.dek && React.createElement('p', { className: 'v5-news-dek' }, item.dek),
    expanded && item.body && React.createElement('div', { className: 'v5-news-body' },
      item.body.split(/\n+/).map(function(p, i) {
        return React.createElement('p', { key: i }, p);
      })
    ),
    React.createElement('div', { className: 'v5-news-actions' },
      React.createElement('button', {
        type: 'button',
        className: 'v5-news-btn',
        onClick: function(e) { e.stopPropagation(); setExpanded(!expanded); },
      }, expanded ? 'סגור' : 'הרחב כאן'),
      React.createElement('button', {
        type: 'button',
        className: 'v5-news-btn',
        onClick: openPopup,
      }, 'פתח ב־popup ↗'),
      React.createElement('button', {
        type: 'button',
        className: 'v5-news-btn v5-news-btn-wa',
        onClick: openWhatsApp,
      }, 'WhatsApp')
    )
  );
}

function V5NewsModal(_ref2) {
  var item = _ref2.item, onClose = _ref2.onClose;
  useV5E(function() {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return function() {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);
  if (!item) return null;
  return React.createElement('div', { className: 'v5-news-modal-backdrop', onClick: onClose },
    React.createElement('div', { className: 'v5-news-modal', onClick: function(e) { e.stopPropagation(); } },
      React.createElement('button', { type: 'button', className: 'v5-news-modal-close', onClick: onClose, 'aria-label': 'סגור' }, '×'),
      React.createElement('div', { className: 'v5-news-modal-meta' },
        React.createElement('span', { className: 'v5-news-dot', style: { background: V5_URGENCY_DOT[item.urgency] || V5_URGENCY_DOT.normal } }),
        React.createElement('span', { className: 'v5-news-cat' }, V5_CATEGORY_LABELS[item.category] || ''),
        React.createElement('span', { className: 'v5-news-time mono' }, v5FormatRelative(item.publishedAt))
      ),
      React.createElement('h2', { className: 'v5-news-modal-headline' }, item.headline),
      item.dek && React.createElement('p', { className: 'v5-news-modal-dek' }, item.dek),
      item.body && React.createElement('div', { className: 'v5-news-modal-body' },
        item.body.split(/\n+/).map(function(p, i) {
          return React.createElement('p', { key: i }, p);
        })
      ),
      item.sourceUrl && React.createElement('a', { className: 'v5-news-modal-source', href: item.sourceUrl, target: '_blank', rel: 'noopener' }, 'מקור: ' + (item.source || item.sourceUrl) + ' ↗')
    )
  );
}

var V5_NEWS_PAGE_SIZE = 12;
var V5_NEWS_CATEGORIES = ['breaking', 'update', 'analysis', 'release', 'rumor', 'guide-short'];

function V5NewsPage() {
  var _v = useV5S('timeline');
  var view = _v[0], setView = _v[1];
  var _items = useV5S(V5_NEWS_FALLBACK);
  var items = _items[0], setItems = _items[1];
  var _status = useV5S('demo');
  var status = _status[0], setStatus = _status[1];
  var _modal = useV5S(null);
  var modalItem = _modal[0], setModalItem = _modal[1];

  // Search + filter + paginate
  var _qLive = useV5S('');
  var qLive = _qLive[0], setQLive = _qLive[1];
  var _q = useV5S('');
  var q = _q[0], setQ = _q[1];
  var _cat = useV5S('');
  var cat = _cat[0], setCat = _cat[1];
  var _page = useV5S(0);
  var page = _page[0], setPage = _page[1];
  var _total = useV5S(0);
  var total = _total[0], setTotal = _total[1];

  // Debounce typed query → committed q (reset page)
  useV5E(function() {
    var t = setTimeout(function() { setQ(qLive.trim()); setPage(0); }, 280);
    return function() { clearTimeout(t); };
  }, [qLive]);

  // Fetch data: when search/filter/paging is active, use /api/search; otherwise the cheap /api/list-news.
  useV5E(function() {
    var aborted = false;
    var useSearch = !!(q || cat || page > 0);
    if (useSearch) {
      var offset = page * V5_NEWS_PAGE_SIZE;
      var url = '/api/search?type=news&limit=' + V5_NEWS_PAGE_SIZE + '&offset=' + offset
        + (q ? '&q=' + encodeURIComponent(q) : '')
        + (cat ? '&category=' + encodeURIComponent(cat) : '');
      fetch(url).then(function(r) { return r.ok ? r.json() : null; }).then(function(j) {
        if (aborted || !j || !j.ok) return;
        // Normalize results — search endpoint returns bodyPreview instead of body.
        var normalized = (j.results || []).map(function(it) {
          var o = Object.assign({}, it);
          if (!o.body && o.bodyPreview) o.body = o.bodyPreview;
          return o;
        });
        setItems(normalized);
        setTotal(j.total || 0);
        setStatus(normalized.length ? 'live' : 'empty');
      }).catch(function() { /* keep prior */ });
    } else {
      fetch('/api/list-news').then(function(r) {
        return r.ok ? r.json() : null;
      }).then(function(j) {
        if (aborted || !j) return;
        if (Array.isArray(j.news) && j.news.length) {
          var firstPage = j.news.slice(0, V5_NEWS_PAGE_SIZE);
          setItems(firstPage);
          setTotal(j.news.length);
          setStatus('live');
        } else {
          // keep fallback demo data; total = fallback length
          setTotal(V5_NEWS_FALLBACK.length);
        }
      }).catch(function() { /* keep fallback */ });
    }
    return function() { aborted = true; };
  }, [q, cat, page]);

  var totalPages = Math.max(1, Math.ceil(total / V5_NEWS_PAGE_SIZE));
  var hasPrev = page > 0;
  var hasNext = (page + 1) < totalPages;

  function selectCategory(next) {
    setCat(next === cat ? '' : next);
    setPage(0);
  }

  return React.createElement('section', { className: 'v5-news-page' },
    React.createElement('header', { className: 'v5-news-head' },
      React.createElement('div', null,
        React.createElement('p', { className: 'v5-eyebrow mono' }, 'NEWSROOM · LIVE FEED'),
        React.createElement('h1', { className: 'v5-news-title' }, 'מה חדש עכשיו'),
        React.createElement('p', { className: 'v5-news-sub' }, status === 'demo'
          ? 'דמו — חבר Sanity דרך /api/list-news לפיד אמיתי.'
          : (status === 'empty' ? 'אין תוצאות לחיפוש זה.' : 'פיד חי, מתעדכן אוטומטית מ-Sanity.'))
      ),
      React.createElement('div', {
        className: 'v5-news-view-toggle',
        style: { gap: 8, flexWrap: 'wrap', alignItems: 'center' },
      },
        React.createElement('input', {
          type: 'search',
          className: 'v5-news-search-input',
          placeholder: 'חיפוש חדשות...',
          value: qLive,
          onChange: function(e) { setQLive(e.target.value); },
          style: {
            padding: '8px 12px', borderRadius: 6, border: '1px solid var(--v5-line, #ccc)',
            background: 'var(--v5-paper, #fff)', color: 'var(--v5-ink, #1a1a1a)',
            minWidth: 180, fontFamily: 'inherit', fontSize: 14, direction: 'rtl',
          },
        }),
        React.createElement('button', {
          type: 'button',
          className: 'v5-news-view-btn' + (view === 'timeline' ? ' is-active' : ''),
          onClick: function() { setView('timeline'); },
        }, 'טיימליין'),
        React.createElement('button', {
          type: 'button',
          className: 'v5-news-view-btn' + (view === 'grid' ? ' is-active' : ''),
          onClick: function() { setView('grid'); },
        }, 'Grid')
      )
    ),
    React.createElement('div', {
      className: 'v5-news-cat-chips',
      style: {
        display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0 16px', justifyContent: 'flex-end',
      },
    },
      React.createElement('button', {
        type: 'button',
        className: 'v5-news-view-btn' + (!cat ? ' is-active' : ''),
        onClick: function() { selectCategory(''); },
      }, 'הכל'),
      V5_NEWS_CATEGORIES.map(function(c) {
        return React.createElement('button', {
          key: c,
          type: 'button',
          className: 'v5-news-view-btn' + (cat === c ? ' is-active' : ''),
          onClick: function() { selectCategory(c); },
        }, V5_CATEGORY_LABELS[c] || c);
      })
    ),
    React.createElement('div', { className: 'v5-news-feed v5-news-feed-' + view },
      items.map(function(item) {
        return React.createElement(V5NewsCard, {
          key: item._id || item.slug,
          item: item,
          view: view,
          onOpenPopup: setModalItem,
        });
      })
    ),
    items.length === 0 && React.createElement('p', {
      className: 'v5-news-sub',
      style: { textAlign: 'center', padding: '32px 0' },
    }, 'אין פריטים להציג.'),
    totalPages > 1 && React.createElement('nav', {
      className: 'v5-news-pagination',
      style: {
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
        padding: '24px 0', flexWrap: 'wrap',
      },
    },
      React.createElement('button', {
        type: 'button',
        className: 'v5-news-view-btn',
        disabled: !hasPrev,
        onClick: function() { if (hasPrev) setPage(page - 1); },
        style: { opacity: hasPrev ? 1 : 0.4 },
      }, '‹ הקודם'),
      React.createElement('span', { className: 'mono', style: { fontSize: 13 } },
        'עמוד ' + (page + 1) + ' מתוך ' + totalPages
      ),
      React.createElement('button', {
        type: 'button',
        className: 'v5-news-view-btn',
        disabled: !hasNext,
        onClick: function() { if (hasNext) setPage(page + 1); },
        style: { opacity: hasNext ? 1 : 0.4 },
      }, 'הבא ›')
    ),
    modalItem && React.createElement(V5NewsModal, { item: modalItem, onClose: function() { setModalItem(null); } })
  );
}

function V5ArticlePage() {
  // action= overrides take precedence — so article.html?action=edit&slug=... opens the editor.
  var params = new URLSearchParams(window.location.search);
  var action = params.get('action');
  var slug = params.get('slug') || '';

  if (action === 'edit' || action === 'new') {
    var article = action === 'edit' && slug ? getArticleFromLocal(slug) : null;
    return React.createElement(window.V5ArticleEditorV2, {
      initialData: article || undefined,
      onSaved: function() { window.location.href = 'articles.html'; },
      onCancel: function() { window.location.href = 'articles.html'; },
      onDeleted: function() { window.location.href = 'articles.html'; }
    });
  }
  if (action === 'view' && slug) {
    return React.createElement(window.V5ArticleViewerV2, {
      article: getArticleFromLocal(slug),
      onBack: function() { window.location.href = 'articles.html'; }
    });
  }

  // No action — show the design-reference template (new or demo).
  var view = params.get('view') === 'demo' ? 'demo' : 'new';
  return React.createElement(React.Fragment, null,
    React.createElement(V5Ticker),
    React.createElement(V5ArticleTemplate, { mode: view }),
    React.createElement(V5Cta)
  );
}

// ============== APP ==============

function V5App(_ref15) {
  var page = _ref15.page;
  useV5Reveal();
  var activeKey = page === 'articles' ? 'articles'
    : page === 'article' ? 'article'
    : page === 'news' ? 'news'
    : 'home';
  return React.createElement('div', { className: 'v5-root v5-page-' + page, dir: 'rtl' },
    React.createElement(V5Nav, { activeKey: activeKey }),
    page === 'articles' ? React.createElement(V5ArticlesPage) :
    page === 'article' ? React.createElement(V5ArticlePage) :
    page === 'news' ? React.createElement(V5NewsPage) :
    React.createElement(V5HomePage),
    React.createElement(V5Foot)
  );
}

function mountVariationFive() {
  var page = document.body.dataset.page || 'home';
  if (page === 'article') {
    var isDemo = new URLSearchParams(window.location.search).get('view') === 'demo';
    document.title = isDemo ? 'nVision AI · Demo Article · Variation E' : 'nVision AI · New Article Template · Variation E';
  }
  if (page === 'articles') {
    document.title = 'nVision AI · Articles · Variation E';
  }
  if (page === 'news') {
    document.title = 'nVision AI · News · Variation E';
  }
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(V5App, { page: page }));
}

window.V5App = V5App;
window.mountVariationFive = mountVariationFive;
window.VariationFive = function VariationFive() {
  return React.createElement(V5App, { page: 'home' });
};
