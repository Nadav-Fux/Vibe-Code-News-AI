// Shared utilities + data for both variations
const { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } = React;

// =============== DATA ===============
const TICKER_MESSAGES = [
  { time: '14:32', text: 'Anthropic משיקה את Claude 5 Opus — ביצועים פי 2 על SWE-bench', tag: 'מודלים', urgent: true },
  { time: '14:18', text: 'GPT-5o זמין עכשיו ב-API במחיר נמוך ב-40%', tag: 'AI חדשות' },
  { time: '13:55', text: '🔥 מדריך חדש: בניית סוכן AI מלא ב-Cursor + MCP ב-30 דקות', tag: 'מדריכים' },
  { time: '13:41', text: 'Bolt.new עוקפת את v0 בבנצ׳מרק יצירת אפליקציות', tag: 'בנצ׳מרק' },
  { time: '13:22', text: 'Jailbreak חדש שעובד על Gemini 2.5 — מתפרסם ב-Reddit', tag: 'גינרוט', urgent: true },
  { time: '12:58', text: 'Lovable מגייסת 100M$ בסבב סדרה B', tag: 'AI חדשות' },
  { time: '12:30', text: 'דעה: למה Vibe Coding הוא לא סוף הפיתוח אלא ההתחלה', tag: 'מאמר' },
];

const ARTICLES = [
  {
    cat: 'מאמר דעה',
    title: 'Vibe Coding הוא לא סוף הפיתוח. הוא ההתחלה.',
    excerpt: 'אחרי שנה של בנייה רק עם פרומפטים, אני בטוח יותר מתמיד שמפתחים לא הולכים לשום מקום — הם פשוט הולכים לעלות שלב.',
    author: 'נדב גלעד',
    time: '8 דקות קריאה',
    date: 'אתמול',
    size: 'hero',
    accent: 'coral',
  },
  {
    cat: 'מודלים',
    title: 'Claude 5 Opus: ניתוח מעמיק',
    excerpt: 'בדקנו 47 משימות. הנה מה שמצאנו.',
    author: 'מערכת',
    time: '12 דק׳',
    date: 'היום',
    size: 'wide',
    accent: 'ink',
  },
  {
    cat: 'מדריך',
    title: 'בונים סוכן AI ב-Cursor',
    excerpt: 'מ-MCP לפרודקשן ב-30 דקות.',
    author: 'יואב לוי',
    time: '6 דק׳',
    date: 'היום',
    size: 'tall',
    accent: 'lavender',
  },
  {
    cat: 'כלים',
    title: '12 כלי AI שכל מפתח חייב ב-2026',
    excerpt: 'מ-Linear AI עד Continue.dev.',
    author: 'מערכת',
    time: '4 דק׳',
    date: 'היום',
    size: 'medium',
    accent: 'sand',
  },
  {
    cat: 'בנצ׳מרק',
    title: 'GPT-5o vs Claude 5 vs Gemini 2.5',
    excerpt: 'קוד, היגיון, יצירתיות. מי מנצח?',
    author: 'מערכת',
    time: '15 דק׳',
    date: 'אתמול',
    size: 'medium',
    accent: 'coral',
  },
  {
    cat: 'גינרוט',
    title: 'הפרומפט שמשגע את Gemini',
    excerpt: 'חוקי, אתי, מועיל — ועוצמתי.',
    author: 'דני כהן',
    time: '3 דק׳',
    date: 'אתמול',
    size: 'small',
    accent: 'ink',
  },
];

const TRENDING_PROMPTS = [
  { rank: 1, title: 'Senior Code Reviewer', uses: '12.4K', tag: 'Cursor' },
  { rank: 2, title: 'Marketing Copywriter PRO', uses: '8.9K', tag: 'Claude' },
  { rank: 3, title: 'SQL Query Builder', uses: '7.2K', tag: 'GPT-5' },
  { rank: 4, title: 'Bug Hunter Mode', uses: '5.1K', tag: 'Cursor' },
];

const TOOLS_SHOWCASE = [
  { name: 'Cursor', cat: 'IDE', score: 9.6 },
  { name: 'Claude Code', cat: 'CLI', score: 9.4 },
  { name: 'Bolt.new', cat: 'Builder', score: 8.9 },
  { name: 'v0', cat: 'UI Gen', score: 8.7 },
  { name: 'Lovable', cat: 'Builder', score: 8.5 },
  { name: 'Continue', cat: 'IDE', score: 8.2 },
];

const LEADERBOARD = [
  { name: 'Claude 5 Opus', org: 'Anthropic', score: 94.2, change: '+2.1', leader: true },
  { name: 'GPT-5o', org: 'OpenAI', score: 92.8, change: '+1.4' },
  { name: 'Gemini 2.5 Pro', org: 'Google', score: 89.1, change: '-0.3' },
  { name: 'Llama 4', org: 'Meta', score: 86.5, change: '+3.2' },
  { name: 'Mistral Large 3', org: 'Mistral', score: 84.0, change: '0.0' },
];

const CATEGORIES = ['AI חדשות', 'Vibe Coding', 'מודלים', 'מדריכים', 'כלים', 'מאמרי דעה', 'בנצ׳מרקים', 'גינרוטים'];

// =============== HOOKS ===============
function useTicker(messages, intervalMs = 3500) {
  const [items, setItems] = useState(messages.slice(0, 4));
  const [typing, setTyping] = useState(false);
  const idxRef = useRef(4 % messages.length);

  useEffect(() => {
    const tick = () => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setItems(prev => {
          const next = messages[idxRef.current];
          idxRef.current = (idxRef.current + 1) % messages.length;
          const now = new Date();
          const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
          return [...prev, { ...next, time, fresh: true }];
        });
      }, 1200);
    };
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [messages, intervalMs]);

  return { items, typing };
}

// =============== CUSTOM CURSOR ===============
function CustomCursor({ accentColor = '#e8543a' }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const stateRef = useRef({ mx: 0, my: 0, rx: 0, ry: 0, label: '' });

  useEffect(() => {
    const onMove = (e) => {
      stateRef.current.mx = e.clientX;
      stateRef.current.my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    const onOver = (e) => {
      const t = e.target.closest('[data-cursor]');
      if (t) {
        ringRef.current?.classList.add('hover');
        const lbl = t.getAttribute('data-cursor-label');
        if (lbl && labelRef.current) {
          labelRef.current.textContent = lbl;
          labelRef.current.classList.add('show');
        }
      }
    };
    const onOut = (e) => {
      const t = e.target.closest('[data-cursor]');
      if (t) {
        ringRef.current?.classList.remove('hover');
        labelRef.current?.classList.remove('show');
      }
    };
    let raf;
    const loop = () => {
      const s = stateRef.current;
      s.rx += (s.mx - s.rx) * 0.18;
      s.ry += (s.my - s.ry) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${s.rx}px, ${s.ry}px) translate(-50%, -50%)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${s.rx + 24}px, ${s.ry + 16}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseout', onOut);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseout', onOut);
    };
  }, []);

  return (
    <React.Fragment>
      <div ref={dotRef} className="cc-dot" style={{ background: accentColor }} />
      <div ref={ringRef} className="cc-ring" />
      <div ref={labelRef} className="cc-label" />
    </React.Fragment>
  );
}

// =============== MAGNETIC BUTTON ===============
function useMagnetic(strength = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);
  return ref;
}

// =============== SCRAMBLE TEXT ===============
function ScrambleText({ text, className, trigger = true }) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef(0);
  const startedRef = useRef(false);

  const scramble = useCallback(() => {
    const chars = '!<>-_\\/[]{}—=+*^?#________ABCDEF';
    let frame = 0;
    const queue = [];
    for (let i = 0; i < text.length; i++) {
      const start = Math.floor(Math.random() * 12);
      const end = start + Math.floor(Math.random() * 12) + 8;
      queue.push({ from: text[i], to: text[i], start, end });
    }
    cancelAnimationFrame(rafRef.current);
    const update = () => {
      let output = '';
      let complete = 0;
      for (let i = 0; i < queue.length; i++) {
        const { from, to, start, end } = queue[i];
        let char;
        if (frame >= end) { complete++; char = to; }
        else if (frame >= start) { char = chars[Math.floor(Math.random() * chars.length)]; }
        else { char = from; }
        output += char;
      }
      setDisplay(output);
      if (complete < queue.length) {
        frame++;
        rafRef.current = requestAnimationFrame(update);
      }
    };
    update();
  }, [text]);

  useEffect(() => {
    if (trigger && !startedRef.current) {
      startedRef.current = true;
      scramble();
    }
  }, [trigger, scramble]);

  return <span className={className} onMouseEnter={scramble}>{display}</span>;
}

// =============== REVEAL ON SCROLL ===============
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// Export
Object.assign(window, {
  TICKER_MESSAGES, ARTICLES, TRENDING_PROMPTS, TOOLS_SHOWCASE, LEADERBOARD, CATEGORIES,
  useTicker, CustomCursor, useMagnetic, ScrambleText, useReveal,
});
