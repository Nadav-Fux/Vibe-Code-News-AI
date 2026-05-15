// ============== VARIATION 5: ARTICLE EDITOR (rev 4 — block-as-template) ==============
// Renders the editor, the My-Articles list, the reading view, and the preview mode.
// Reuses storage helpers from v5-newsroom.jsx (loadArticles, saveArticleToLocal, etc.)
// Reuses the article template chrome CSS from v5-styles.css (.v5-article-* / .v5-longform-* / .v5-method-card / .v5-compare-strip / .v5-rail-card).
//
// The block schema is shared with the Cloudflare Pages Function at functions/api/save-article.js.

const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;

// ---------- Block schema ----------
// Each block: { id, type, content?, items?, items2?, items3?, tone?, lang?, alt?, level? }

const V5E_BLOCK_DEFS = [
  { type: 'paragraph', label: 'פסקה',          icon: '¶',  hint: 'טקסט רגיל',           kbd: 'p' },
  { type: 'heading2',  label: 'כותרת ראשית',   icon: 'H2', hint: 'פרק חדש במאמר',        kbd: 'h2' },
  { type: 'heading3',  label: 'תת-כותרת',      icon: 'H3', hint: 'תת-נושא בתוך פרק',      kbd: 'h3' },
  { type: 'lead',      label: 'פסקת פתיחה',    icon: '◖',  hint: 'lead — גדול ובולט',     kbd: 'lead' },
  { type: 'quote',     label: 'ציטוט',         icon: '“”', hint: 'pullquote / blockquote', kbd: 'q' },
  { type: 'image',     label: 'תמונה',         icon: '▣',  hint: 'URL של תמונה',           kbd: 'img' },
  { type: 'code',      label: 'קוד',           icon: '< >', hint: 'בלוק קוד מונוספייס',   kbd: 'code' },
  { type: 'method',    label: 'כרטיס שיטה',    icon: '⌖',  hint: 'Prompt contract / framework', kbd: 'method' },
  { type: 'compare',   label: 'השוואה',        icon: '⫶⫶', hint: '2-3 עמודות',              kbd: 'compare' },
  { type: 'tldr',      label: 'TL;DR',         icon: '★',  hint: 'תקציר במסילה הצדדית',    kbd: 'tldr' },
  { type: 'callout',   label: 'הערה צדדית',    icon: '!',  hint: 'הערת מחבר / aside',      kbd: 'note' },
  { type: 'divider',   label: 'מפריד',         icon: '—',  hint: 'קו הפרדה בין פרקים',     kbd: 'hr' },
];

const V5E_DEFAULT_BLOCKS = () => [{ id: v5eId(), type: 'paragraph', content: '' }];

function v5eId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function v5eEmptyOfType(type, base = {}) {
  const b = { id: v5eId(), type, content: '', ...base };
  if (type === 'compare') b.items = [{ label: '', title: '', sub: '' }, { label: '', title: '', sub: '' }, { label: '', title: '', sub: '' }];
  if (type === 'callout') b.tone = base.tone || 'sage';
  if (type === 'code')    b.lang = base.lang || 'js';
  if (type === 'image')   b.alt = base.alt || '';
  return b;
}

// ---------- Toast ----------

let v5eToastTimer = null;
function v5eToast(message, kind = 'info', ms = 2600) {
  let host = document.getElementById('v5e-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'v5e-toast-host';
    document.body.appendChild(host);
  }
  host.innerHTML = '';
  const node = document.createElement('div');
  node.className = `v5e-toast v5e-toast-${kind}`;
  node.textContent = message;
  host.appendChild(node);
  requestAnimationFrame(() => node.classList.add('show'));
  clearTimeout(v5eToastTimer);
  v5eToastTimer = setTimeout(() => {
    node.classList.remove('show');
    setTimeout(() => { try { host.removeChild(node); } catch {} }, 200);
  }, ms);
}

// ---------- Editor secret (auth header for /api/save-article) ----------

function getEditorSecretLS() {
  try { return localStorage.getItem('v5_editor_secret') || ''; } catch { return ''; }
}
function setEditorSecretLS(value) {
  try { localStorage.setItem('v5_editor_secret', value || ''); } catch {}
}

// ---------- Auto-resize textarea hook ----------

function useAutoResize(ref, value) {
  useEffect(() => {
    const el = ref.current;
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);
}

// ===================================================================
// ARTICLE EDITOR
// ===================================================================

function V5ArticleEditorV2({ initialData, onSaved, onCancel, onDeleted }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [blocks, setBlocks] = useState(initialData?.content?.length ? initialData.content : V5E_DEFAULT_BLOCKS());
  const [previewMode, setPreviewMode] = useState(false);
  const [autosaveAt, setAutosaveAt] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const isExisting = !!initialData?.slug;
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  // Auto-slug from title when creating new. Drop Hebrew/Arabic — the user can
  // override anyway. If the title is all non-Latin, fall back to a stable id.
  useEffect(() => {
    if (isExisting || !title) return;
    let auto = title.toLowerCase()
      .replace(/[֐-׿؀-ۿ]+/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!auto || auto.length < 3) {
      const d = new Date();
      auto = `article-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6)}`;
    }
    setSlug(auto);
  }, [title, isExisting]);

  // Autosave to localStorage 1.5s after last change
  const autosaveTimer = useRef(null);
  useEffect(() => {
    if (!title.trim() || !slug.trim()) return;
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        saveArticleToLocal({ title: title.trim(), slug: slug.trim(), content: blocksRef.current });
        setAutosaveAt(new Date());
      } catch {}
    }, 1500);
    return () => clearTimeout(autosaveTimer.current);
  }, [title, slug, blocks]);

  // ---------- Block ops ----------
  const updateBlock = useCallback((id, patch) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }, []);
  const removeBlock = useCallback((id) => {
    setBlocks(prev => prev.length <= 1 ? prev : prev.filter(b => b.id !== id));
  }, []);
  const insertAfter = useCallback((id, type = 'paragraph', focus = true) => {
    const newBlock = v5eEmptyOfType(type);
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return [...prev, newBlock];
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    if (focus) {
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${newBlock.id}"] textarea, [data-block-id="${newBlock.id}"] input[type=url], [data-block-id="${newBlock.id}"] input[type=text]`);
        if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      }, 30);
    }
    return newBlock.id;
  }, []);
  const moveBlock = useCallback((id, direction) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);
  const reorderBlocks = useCallback((sourceId, targetId, position) => {
    setBlocks(prev => {
      const sIdx = prev.findIndex(b => b.id === sourceId);
      const tIdx = prev.findIndex(b => b.id === targetId);
      if (sIdx === -1 || tIdx === -1 || sIdx === tIdx) return prev;
      const next = [...prev];
      const [item] = next.splice(sIdx, 1);
      const adjusted = sIdx < tIdx ? tIdx - 1 : tIdx;
      const insertAt = position === 'after' ? adjusted + 1 : adjusted;
      next.splice(insertAt, 0, item);
      return next;
    });
  }, []);
  const convertBlock = useCallback((id, newType) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b;
      return { ...v5eEmptyOfType(newType, { id: b.id, content: b.content }) };
    }));
  }, []);

  // ---------- AI assist ----------
  // Sends raw text to /api/ai-format (mode=article). Converts the structured
  // response into Notion-style blocks (lead + heading2 + paragraphs per section).
  // If the editor is empty (default single empty paragraph), replaces; otherwise
  // appends so we don't clobber existing work.
  const handleAiFormat = useCallback(async (rawText, instructions) => {
    const secret = getEditorSecretLS();
    if (!secret) {
      v5eToast('הגדר Editor Secret קודם (⚙)', 'warn');
      setSecretDialogOpen(true);
      return false;
    }
    setAiBusy(true);
    try {
      const r = await fetch('/api/ai-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Editor-Secret': secret },
        body: JSON.stringify({ rawText: rawText, mode: 'article', instructions: instructions || '' }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) {
        const msg = (j && (j.error || j.message)) || ('HTTP ' + r.status);
        v5eToast('AI נכשל: ' + msg, 'warn', 4200);
        return false;
      }
      const data = j.data || {};
      if (data.title && !title.trim()) setTitle(data.title);
      if (data.slug && !slug.trim()) setSlug(data.slug);
      const generated = [];
      if (data.lead) {
        generated.push(v5eEmptyOfType('lead', { content: data.lead }));
      }
      (Array.isArray(data.sections) ? data.sections : []).forEach((s) => {
        if (s.heading) generated.push(v5eEmptyOfType('heading2', { content: s.heading }));
        const paragraphs = (s.body || '').split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
        paragraphs.forEach((p) => generated.push(v5eEmptyOfType('paragraph', { content: p })));
      });
      if (Array.isArray(data.takeaways) && data.takeaways.length) {
        generated.push(v5eEmptyOfType('callout', { content: 'נקודות עיקריות: ' + data.takeaways.join(' · '), tone: 'sage' }));
      }
      if (!generated.length) {
        v5eToast('AI לא החזיר תוכן בר-המרה', 'warn');
        return false;
      }
      setBlocks((prev) => {
        const isEffectivelyEmpty = prev.length === 1 && prev[0].type === 'paragraph' && !(prev[0].content || '').trim();
        return isEffectivelyEmpty ? generated : prev.concat(generated);
      });
      v5eToast('סודר עם ' + (j.provider || 'AI') + ' — בדוק ועדכן', 'success');
      return true;
    } catch (e) {
      v5eToast('שגיאת רשת: ' + e.message, 'warn');
      return false;
    } finally {
      setAiBusy(false);
    }
  }, [title, slug]);

  // ---------- Save / publish ----------
  const handlePublish = async () => {
    if (!title.trim()) { v5eToast('יש להזין כותרת', 'warn'); return; }
    if (!slug.trim()) { v5eToast('יש להזין slug', 'warn'); return; }
    if (!blocks.some(b => (b.content || '').trim() || (b.items && b.items.some(i => i.title)))) {
      v5eToast('יש להוסיף לפחות בלוק אחד עם תוכן', 'warn');
      return;
    }

    // Save locally first (always succeeds)
    const local = saveArticleToLocal({ title: title.trim(), slug: slug.trim(), content: blocks });

    // Try Sanity sync via Pages Function
    const secret = getEditorSecretLS();
    if (!secret) {
      v5eToast('המאמר נשמר מקומית. הגדר Editor Secret כדי לפרסם ל-Sanity.', 'info', 3800);
      setSecretDialogOpen(true);
      if (onSaved) onSaved(local);
      return;
    }

    setPublishing(true);
    try {
      const r = await fetch('/api/save-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Editor-Secret': secret },
        body: JSON.stringify({ title: title.trim(), slug: slug.trim(), blocks }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 401) {
          v5eToast('Editor Secret שגוי. תקן ב-Settings.', 'error', 4000);
          setSecretDialogOpen(true);
        } else if (j.error === 'sanity_not_configured') {
          v5eToast('Sanity לא מוגדר בשרת. נשמר רק מקומית.', 'warn', 4000);
        } else {
          v5eToast('שגיאה בפרסום: ' + (j.message || j.error || r.status), 'error', 4500);
        }
      } else {
        v5eToast(`פורסם ל-Sanity (${j.action === 'updated' ? 'עודכן' : 'נוצר'}).`, 'success');
      }
    } catch (e) {
      v5eToast('שגיאת רשת: ' + e.message, 'error', 4000);
    } finally {
      setPublishing(false);
      if (onSaved) onSaved(local);
    }
  };

  const handleDelete = async () => {
    if (!isExisting) return;
    if (!confirm(`למחוק את "${initialData.title}"? פעולה בלתי הפיכה.`)) return;
    deleteArticleFromLocal(initialData.slug);
    const secret = getEditorSecretLS();
    if (secret) {
      try {
        const r = await fetch('/api/delete-article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Editor-Secret': secret },
          body: JSON.stringify({ slug: initialData.slug }),
        });
        if (r.ok) v5eToast('נמחק מקומית ומ-Sanity.', 'success');
        else v5eToast('נמחק מקומית. מ-Sanity לא הצליח.', 'warn');
      } catch {
        v5eToast('נמחק מקומית. מ-Sanity לא הצליח.', 'warn');
      }
    } else {
      v5eToast('נמחק מקומית.', 'info');
    }
    if (onDeleted) onDeleted();
  };

  // ---------- Render ----------
  if (previewMode) {
    return (
      <div className="v5e-editor-frame">
        <div className="v5e-editor-bar">
          <div className="v5e-editor-bar-l">
            <span className="mono">PREVIEW · {title || '—'}</span>
          </div>
          <div className="v5e-editor-bar-r">
            <button className="v5e-btn ghost" onClick={() => setPreviewMode(false)}>← חזור לעריכה</button>
            <button className="v5e-btn primary" onClick={handlePublish} disabled={publishing}>
              {publishing ? 'מפרסם…' : 'שמור ופרסם'}
            </button>
          </div>
        </div>
        <V5RenderArticle article={{ title, slug, content: blocks }} />
      </div>
    );
  }

  return (
    <div className="v5e-editor-frame">
      <div className="v5e-editor-bar">
        <div className="v5e-editor-bar-l">
          <a href="articles.html" className="v5e-back">← ספריית מאמרים</a>
          <span className="mono v5e-savedot">
            {autosaveAt ? `נשמר אוטומטית ${autosaveAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'טיוטה לא נשמרה'}
          </span>
        </div>
        <div className="v5e-editor-bar-r">
          <button className="v5e-btn ghost" onClick={() => setSecretDialogOpen(true)} title="Editor Secret">⚙</button>
          <button className="v5e-btn ghost" onClick={() => setAiDialogOpen(true)} disabled={aiBusy} title="סדר טקסט גולמי לכתבה עם AI">
            {aiBusy ? '⏳ AI…' : '✨ סדר עם AI'}
          </button>
          <button className="v5e-btn ghost" onClick={() => setPreviewMode(true)}>תצוגה מקדימה</button>
          {isExisting && <button className="v5e-btn danger" onClick={handleDelete}>מחק</button>}
          <button className="v5e-btn ghost" onClick={onCancel}>ביטול</button>
          <button className="v5e-btn primary" onClick={handlePublish} disabled={publishing}>
            {publishing ? 'מפרסם…' : 'שמור ופרסם'}
          </button>
        </div>
      </div>
      {aiDialogOpen && (
        <V5AiFormatDialog
          busy={aiBusy}
          onClose={() => setAiDialogOpen(false)}
          onSubmit={async (rawText, instructions) => {
            const ok = await handleAiFormat(rawText, instructions);
            if (ok) setAiDialogOpen(false);
          }}
        />
      )}

      <div className="v5e-editor-scroll">
        <div className="v5e-editor-canvas">
          <input
            className="v5e-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="כותרת המאמר…"
            dir="rtl"
            spellCheck
          />
          <div className="v5e-slug-row">
            <span className="mono">/article/</span>
            <input
              className="v5e-slug-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, '-').toLowerCase())}
              placeholder="article-slug"
              dir="ltr"
              spellCheck={false}
            />
          </div>

          <div className="v5e-blocks">
            {blocks.map((block, idx) => (
              <V5BlockShell
                key={block.id}
                block={block}
                isFirst={idx === 0}
                isLast={idx === blocks.length - 1}
                onUpdate={(patch) => updateBlock(block.id, patch)}
                onRemove={() => removeBlock(block.id)}
                onInsertAfter={(type) => insertAfter(block.id, type)}
                onMoveUp={() => moveBlock(block.id, 'up')}
                onMoveDown={() => moveBlock(block.id, 'down')}
                onConvert={(t) => convertBlock(block.id, t)}
                onReorder={reorderBlocks}
              />
            ))}
          </div>

          <V5InsertBar onInsert={(type) => insertAfter(blocks[blocks.length - 1].id, type)} />

          <div className="v5e-foot">
            <span className="mono">
              {blocks.reduce((s, b) => s + (b.content || '').split(/\s+/).filter(Boolean).length, 0)} מילים · {blocks.length} בלוקים
            </span>
          </div>
        </div>
      </div>

      {secretDialogOpen && <V5SecretDialog onClose={() => setSecretDialogOpen(false)} />}
    </div>
  );
}

// ---------- Block shell: drag handle + body + slash menu ----------

function V5BlockShell({ block, isFirst, isLast, onUpdate, onRemove, onInsertAfter, onMoveUp, onMoveDown, onConvert, onReorder }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropState, setDropState] = useState(null); // 'before' | 'after' | null

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/v5-block', block.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    setDropState(y < rect.height / 2 ? 'before' : 'after');
  };
  const handleDragLeave = () => setDropState(null);
  const handleDrop = (e) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/v5-block');
    if (sourceId && sourceId !== block.id) {
      onReorder(sourceId, block.id, dropState || 'after');
    }
    setDropState(null);
  };

  return (
    <div
      className={`v5e-block v5e-b-${block.type}${dropState ? ' drop-' + dropState : ''}`}
      data-block-id={block.id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="v5e-gutter">
        <button
          className="v5e-handle"
          draggable
          onDragStart={handleDragStart}
          onClick={() => setMenuOpen((v) => !v)}
          title="גרור או לחץ לתפריט"
        >⋮⋮</button>
        {menuOpen && (
          <V5BlockMenu
            block={block}
            isFirst={isFirst}
            isLast={isLast}
            onClose={() => setMenuOpen(false)}
            onConvert={onConvert}
            onRemove={onRemove}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onInsertAfter={onInsertAfter}
          />
        )}
      </div>

      <div className="v5e-body">
        <V5BlockBody block={block} isFirst={isFirst} onUpdate={onUpdate} onInsertAfter={onInsertAfter} onRemove={onRemove} onConvert={onConvert} />
      </div>
    </div>
  );
}

function V5BlockMenu({ block, isFirst, isLast, onClose, onConvert, onRemove, onMoveUp, onMoveDown, onInsertAfter }) {
  const menuRef = useRef(null);
  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [onClose]);
  return (
    <div className="v5e-block-menu" ref={menuRef}>
      <div className="v5e-menu-section">
        <div className="v5e-menu-label">המר ל…</div>
        {V5E_BLOCK_DEFS.filter(d => d.type !== block.type).map(d => (
          <button key={d.type} className="v5e-menu-item" onClick={() => { onConvert(d.type); onClose(); }}>
            <span className="v5e-mi-icon">{d.icon}</span>
            <span className="v5e-mi-label">{d.label}</span>
          </button>
        ))}
      </div>
      <div className="v5e-menu-divider" />
      <div className="v5e-menu-section">
        <button className="v5e-menu-item" onClick={() => { onInsertAfter('paragraph'); onClose(); }}>
          <span className="v5e-mi-icon">+</span><span className="v5e-mi-label">הוסף פסקה אחרי</span>
        </button>
        <button className="v5e-menu-item" disabled={isFirst} onClick={() => { onMoveUp(); onClose(); }}>
          <span className="v5e-mi-icon">↑</span><span className="v5e-mi-label">העבר למעלה</span>
        </button>
        <button className="v5e-menu-item" disabled={isLast} onClick={() => { onMoveDown(); onClose(); }}>
          <span className="v5e-mi-icon">↓</span><span className="v5e-mi-label">העבר למטה</span>
        </button>
        <button className="v5e-menu-item danger" disabled={isFirst} onClick={() => { onRemove(); onClose(); }}>
          <span className="v5e-mi-icon">✕</span><span className="v5e-mi-label">מחק בלוק</span>
        </button>
      </div>
    </div>
  );
}

// ---------- Block bodies (one per type) ----------

function V5BlockBody({ block, isFirst, onUpdate, onInsertAfter, onRemove, onConvert }) {
  const taRef = useRef(null);
  useAutoResize(taRef, block.content);

  const handleKeyDown = (e) => {
    // Slash menu trigger: typing "/" at start of empty paragraph opens the slash menu
    // We handle that inside V5SlashCapture below
    if (e.key === 'Enter' && !e.shiftKey && (block.type === 'heading2' || block.type === 'heading3' || block.type === 'lead' || block.type === 'tldr' || block.type === 'callout')) {
      e.preventDefault();
      onInsertAfter('paragraph');
      return;
    }
    if (e.key === 'Backspace' && !block.content && !isFirst && (block.type === 'paragraph' || block.type === 'heading2' || block.type === 'heading3' || block.type === 'lead')) {
      e.preventDefault();
      onRemove();
      return;
    }
    if (e.key === 'Tab' && (block.type === 'heading2' || block.type === 'heading3')) {
      e.preventDefault();
      onConvert(block.type === 'heading2' ? 'heading3' : 'heading2');
    }
  };

  switch (block.type) {
    case 'paragraph':
    case 'lead':
      return <V5SlashCapture block={block} onConvert={onConvert} render={(commonProps) => (
        <textarea
          ref={taRef}
          className={block.type === 'lead' ? 'v5e-input v5e-input-lead' : 'v5e-input v5e-input-paragraph'}
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onKeyDown={(e) => { commonProps.onKeyDown?.(e); if (!e.defaultPrevented) handleKeyDown(e); }}
          placeholder={block.type === 'lead' ? 'פסקת פתיחה חזקה — מסבירה במה המאמר עוסק…' : 'כתוב כאן…'}
          dir="rtl"
          rows={2}
          spellCheck
        />
      )} />;

    case 'heading2':
    case 'heading3':
      return (
        <input
          ref={taRef}
          className={block.type === 'heading2' ? 'v5e-input v5e-input-h2' : 'v5e-input v5e-input-h3'}
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder={block.type === 'heading2' ? 'כותרת ראשית של פרק…' : 'תת-כותרת…'}
          dir="rtl"
          spellCheck
        />
      );

    case 'quote':
      return (
        <textarea
          ref={taRef}
          className="v5e-input v5e-input-quote"
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="ציטוט או takeaway חד…"
          dir="rtl"
          rows={2}
          spellCheck
        />
      );

    case 'image':
      return <V5ImageBlock block={block} onUpdate={onUpdate} />;

    case 'code':
      return (
        <div className="v5e-code-block">
          <div className="v5e-code-bar">
            <select value={block.lang || 'js'} onChange={(e) => onUpdate({ lang: e.target.value })} className="v5e-code-lang">
              <option value="js">javascript</option>
              <option value="ts">typescript</option>
              <option value="py">python</option>
              <option value="bash">bash</option>
              <option value="json">json</option>
              <option value="md">markdown</option>
            </select>
          </div>
          <textarea
            ref={taRef}
            className="v5e-input v5e-input-code"
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="// קוד…"
            dir="ltr"
            rows={4}
            spellCheck={false}
          />
        </div>
      );

    case 'method':
      return (
        <div className="v5e-method-block">
          <input
            type="text"
            className="v5e-input v5e-input-method-label"
            value={block.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="PROMPT CONTRACT / FRAMEWORK / METHOD"
            dir="ltr"
            spellCheck={false}
          />
          <textarea
            ref={taRef}
            className="v5e-input v5e-input-method"
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder={'role: ...\ninput: ...\nrules: ...\noutput: ...'}
            dir="ltr"
            rows={5}
            spellCheck={false}
          />
        </div>
      );

    case 'compare':
      return <V5CompareEditor block={block} onUpdate={onUpdate} />;

    case 'tldr':
      return (
        <div className="v5e-tldr-block">
          <span className="mono">TL;DR</span>
          <textarea
            ref={taRef}
            className="v5e-input v5e-input-tldr"
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="המסר ב-2-3 שורות. הקורא שקרא רק את ה-TL;DR צריך לדעת מה לקחת מהמאמר."
            dir="rtl"
            rows={3}
            spellCheck
          />
        </div>
      );

    case 'callout':
      return (
        <div className={`v5e-callout-block tone-${block.tone || 'sage'}`}>
          <div className="v5e-callout-bar">
            {['sage', 'cobalt', 'mustard', 'rose'].map(t => (
              <button key={t} className={`v5e-tone v5e-tone-${t}${block.tone === t ? ' active' : ''}`} onClick={() => onUpdate({ tone: t })} title={t}>●</button>
            ))}
          </div>
          <textarea
            ref={taRef}
            className="v5e-input v5e-input-callout"
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="הערת מחבר, אזהרה, רעיון צדדי…"
            dir="rtl"
            rows={2}
            spellCheck
          />
        </div>
      );

    case 'divider':
      return <div className="v5e-divider-block"><span>— · —</span></div>;

    default:
      return <div className="v5e-input">סוג בלוק לא ידוע: {block.type}</div>;
  }
}

function V5SlashCapture({ block, onConvert, render }) {
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const wrapRef = useRef(null);

  const onKeyDown = (e) => {
    if (slashOpen) {
      if (e.key === 'Escape') { e.preventDefault(); setSlashOpen(false); return; }
      // Let arrow/enter be handled by the menu component
    } else if (e.key === '/' && !block.content) {
      e.preventDefault();
      setSlashOpen(true);
      setSlashQuery('');
    }
  };

  const filtered = useMemo(() => {
    const q = slashQuery.trim().toLowerCase();
    if (!q) return V5E_BLOCK_DEFS;
    return V5E_BLOCK_DEFS.filter(d => d.kbd.includes(q) || d.label.toLowerCase().includes(q) || d.type.includes(q));
  }, [slashQuery]);

  return (
    <div className="v5e-slash-wrap" ref={wrapRef}>
      {render({ onKeyDown })}
      {slashOpen && (
        <div className="v5e-slash-menu">
          <input
            autoFocus
            className="v5e-slash-search"
            value={slashQuery}
            onChange={(e) => setSlashQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setSlashOpen(false); }
              if (e.key === 'Enter' && filtered[0]) {
                e.preventDefault();
                onConvert(filtered[0].type);
                setSlashOpen(false);
              }
            }}
            placeholder="חפש בלוק (lead, quote, method…)"
            dir="rtl"
          />
          <div className="v5e-slash-list">
            {filtered.map(d => (
              <button key={d.type} className="v5e-slash-item" onClick={() => { onConvert(d.type); setSlashOpen(false); }}>
                <span className="v5e-mi-icon">{d.icon}</span>
                <span className="v5e-mi-label">{d.label}</span>
                <span className="v5e-mi-hint">{d.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Image block with AI generation (Pollinations.ai — free, no key) ----------

const V5_IMG_MODELS = [
  { id: 'flux',          label: 'Flux',          hint: 'איכותי, ברירת מחדל' },
  { id: 'flux-realism',  label: 'Realism',       hint: 'פוטו-ריאליסטי' },
  { id: 'flux-anime',    label: 'Anime',         hint: 'אנימה / איור סטייליסטי' },
  { id: 'flux-3d',       label: '3D',            hint: 'רנדר תלת-ממדי' },
  { id: 'turbo',         label: 'Turbo',         hint: 'מהיר, איכות פחותה' },
];

const V5_IMG_RATIOS = [
  { id: 'wide',     label: '16:9 (Hero)',  w: 1280, h: 720 },
  { id: 'square',   label: '1:1 (Social)', w: 1024, h: 1024 },
  { id: 'portrait', label: '3:4 (Story)',  w: 768,  h: 1024 },
  { id: 'banner',   label: '21:9 (Banner)',w: 1680, h: 720 },
];

function buildPollinationsUrl({ prompt, model = 'flux', width = 1280, height = 720, seed = null }) {
  const s = seed != null ? seed : Math.floor(Math.random() * 1e9);
  const params = new URLSearchParams({ width: String(width), height: String(height), model, seed: String(s), nologo: 'true', enhance: 'true' });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
}

function V5ImageBlock({ block, onUpdate }) {
  const [mode, setMode] = useState(block.content ? 'url' : 'ai'); // 'url' or 'ai'
  const [prompt, setPrompt] = useState(block.prompt || '');
  const [model, setModel] = useState(block.model || 'flux');
  const [ratio, setRatio] = useState(block.ratio || 'wide');
  const [generating, setGenerating] = useState(false);
  const [imgError, setImgError] = useState(false);

  const generate = () => {
    if (!prompt.trim()) { v5eToast('הכנס פרומפט לתמונה', 'warn'); return; }
    const r = V5_IMG_RATIOS.find(x => x.id === ratio) || V5_IMG_RATIOS[0];
    const url = buildPollinationsUrl({ prompt: prompt.trim(), model, width: r.w, height: r.h });
    setGenerating(true);
    setImgError(false);
    onUpdate({ content: url, prompt: prompt.trim(), model, ratio, alt: block.alt || prompt.trim().slice(0, 80) });
  };

  return (
    <div className="v5e-img-block">
      <div className="v5e-img-tabs">
        <button className={`v5e-img-tab${mode === 'ai' ? ' active' : ''}`} onClick={() => setMode('ai')}>✨ צור עם AI</button>
        <button className={`v5e-img-tab${mode === 'url' ? ' active' : ''}`} onClick={() => setMode('url')}>🔗 הדבק URL</button>
      </div>

      {mode === 'ai' ? (
        <div className="v5e-img-ai">
          <textarea
            className="v5e-input v5e-input-img-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="תאר את התמונה — מה רואים, סגנון, אווירה. אפשר בעברית או באנגלית."
            dir="rtl"
            rows={2}
          />
          <div className="v5e-img-ai-row">
            <select className="v5e-img-select" value={model} onChange={(e) => setModel(e.target.value)} title="מודל">
              {V5_IMG_MODELS.map(m => <option key={m.id} value={m.id}>{m.label} · {m.hint}</option>)}
            </select>
            <select className="v5e-img-select" value={ratio} onChange={(e) => setRatio(e.target.value)} title="יחס">
              {V5_IMG_RATIOS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <button className="v5e-btn primary v5e-img-go" onClick={generate} disabled={!prompt.trim()}>
              {generating && !imgError ? 'מייצר…' : 'צור תמונה'}
            </button>
          </div>
          <div className="v5e-img-credit">
            <span className="mono">Pollinations.ai · חינמי · Flux</span>
            {block.content && <button className="v5e-img-regen" onClick={generate} title="הגרל סיד חדש">↻ הגרל מחדש</button>}
          </div>
        </div>
      ) : (
        <input
          type="url"
          className="v5e-input v5e-input-image-url"
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="הדבק URL של תמונה (https://…)"
          dir="ltr"
          spellCheck={false}
        />
      )}

      {block.content && (
        <div className="v5e-img-preview">
          {imgError ? (
            <div className="v5e-img-fail">
              <span>התמונה לא הצליחה להיטען</span>
              <button className="v5e-img-regen" onClick={generate}>↻ נסה שוב</button>
            </div>
          ) : (
            <img
              src={block.content}
              alt={block.alt || ''}
              onLoad={() => { setGenerating(false); setImgError(false); }}
              onError={() => { setGenerating(false); setImgError(true); }}
            />
          )}
        </div>
      )}

      <input
        type="text"
        className="v5e-input v5e-input-image-alt"
        value={block.alt || ''}
        onChange={(e) => onUpdate({ alt: e.target.value })}
        placeholder="alt / כיתוב לתמונה (חשוב ל-SEO ולנגישות)"
        dir="rtl"
      />
    </div>
  );
}

function V5CompareEditor({ block, onUpdate }) {
  const items = block.items || [];
  const setItem = (i, patch) => {
    const next = items.map((it, idx) => idx === i ? { ...it, ...patch } : it);
    onUpdate({ items: next });
  };
  const addCol = () => onUpdate({ items: [...items, { label: '', title: '', sub: '' }] });
  const removeCol = (i) => onUpdate({ items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="v5e-compare-block">
      <div className="v5e-compare-grid" style={{ gridTemplateColumns: `repeat(${items.length || 1}, 1fr)` }}>
        {items.map((it, i) => (
          <div key={i} className="v5e-compare-col">
            <input className="v5e-input v5e-input-cmp-label" value={it.label} onChange={(e) => setItem(i, { label: e.target.value })} placeholder="LABEL" dir="ltr" />
            <input className="v5e-input v5e-input-cmp-title" value={it.title} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="כותרת" dir="rtl" />
            <input className="v5e-input v5e-input-cmp-sub" value={it.sub} onChange={(e) => setItem(i, { sub: e.target.value })} placeholder="הערה / קונטקסט" dir="rtl" />
            {items.length > 2 && <button className="v5e-cmp-del" onClick={() => removeCol(i)} title="הסר עמודה">✕</button>}
          </div>
        ))}
      </div>
      {items.length < 4 && <button className="v5e-cmp-add" onClick={addCol}>+ הוסף עמודה</button>}
    </div>
  );
}

function V5InsertBar({ onInsert }) {
  return (
    <div className="v5e-insert-bar">
      {V5E_BLOCK_DEFS.filter(d => !['tldr'].includes(d.type)).map(d => (
        <button key={d.type} className="v5e-insert-btn" onClick={() => onInsert(d.type)} title={d.hint}>
          <span className="v5e-mi-icon">{d.icon}</span>
          <span className="v5e-mi-label">{d.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------- Editor secret dialog ----------

function V5SecretDialog({ onClose }) {
  const [value, setValue] = useState(getEditorSecretLS());
  return (
    <div className="v5e-dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="v5e-dialog">
        <h3>Editor Secret</h3>
        <p>
          הסוד הזה מאמת את הדפדפן מול פונקציית <code>/api/save-article</code> בקלאודפלייר.
          ההגדרה הזו פעם אחת בלבד, נשמרת ב-localStorage של הדפדפן הזה.
        </p>
        <input
          className="v5e-input"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="הדבק את ה-EDITOR_SECRET של Cloudflare Pages"
          dir="ltr"
          spellCheck={false}
        />
        <div className="v5e-dialog-actions">
          <button className="v5e-btn ghost" onClick={onClose}>ביטול</button>
          <button className="v5e-btn primary" onClick={() => { setEditorSecretLS(value.trim()); v5eToast('Editor Secret נשמר.', 'success'); onClose(); }}>שמור</button>
        </div>
      </div>
    </div>
  );
}

// ---------- AI format dialog ----------

function V5AiFormatDialog({ onClose, onSubmit, busy }) {
  const [rawText, setRawText] = useState('');
  const [instructions, setInstructions] = useState('');
  const submit = () => {
    const t = rawText.trim();
    if (t.length < 20) { v5eToast('הזן לפחות 20 תווים', 'warn'); return; }
    onSubmit(t, instructions.trim());
  };
  return (
    <div className="v5e-dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="v5e-dialog" style={{ maxWidth: 640 }}>
        <h3>✨ סדר עם AI</h3>
        <p>
          הדבק טקסט גולמי (טיוטה, תמליל, הערות) — ה-AI יסדר אותו לכותרת + lead + סעיפים עם פסקאות.
          הבלוקים החדשים יתווספו לעורך; אם הוא ריק, הם יחליפו את הפסקה הריקה. כותרת ו-slug מתמלאים אם הם ריקים.
        </p>
        <textarea
          className="v5e-input"
          rows={9}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="הדבק או הקלד טקסט גולמי כאן…"
          dir="rtl"
          style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.55 }}
          disabled={busy}
        />
        <input
          className="v5e-input"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="הנחיה אופציונלית לעורך AI (למשל: 'טון רשמי', 'התמקד בהשלכות עסקיות')"
          dir="rtl"
          style={{ marginTop: 8 }}
          disabled={busy}
        />
        <div className="v5e-dialog-actions">
          <button className="v5e-btn ghost" onClick={onClose} disabled={busy}>ביטול</button>
          <button className="v5e-btn primary" onClick={submit} disabled={busy}>
            {busy ? 'מבקש מ-AI…' : 'סדר וצור בלוקים'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// MY ARTICLES — list and management
// ===================================================================

function V5MyArticlesV2() {
  const [articles, setArticles] = useState(() => loadArticles());
  const [tab, setTab] = useState('all'); // all | drafts | published
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('updatedAt');

  useEffect(() => {
    const refresh = () => setArticles(loadArticles());
    window.addEventListener('v5ArticlesChanged', refresh);
    return () => window.removeEventListener('v5ArticlesChanged', refresh);
  }, []);

  const isDraft = (a) => {
    const c = a.content || [];
    if (!c.length) return true;
    return c.every(b => !(b.content || '').trim() && !(b.items && b.items.some(i => i.title)));
  };

  const stats = useMemo(() => {
    const drafts = articles.filter(isDraft).length;
    return { total: articles.length, drafts, published: articles.length - drafts };
  }, [articles]);

  const filtered = useMemo(() => {
    let r = [...articles];
    if (tab === 'drafts') r = r.filter(isDraft);
    else if (tab === 'published') r = r.filter(a => !isDraft(a));
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        (a.content || []).some(b => (b.content || '').toLowerCase().includes(q))
      );
    }
    if (sort === 'updatedAt') r.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    else if (sort === 'createdAt') r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'title') r.sort((a, b) => a.title.localeCompare(b.title, 'he'));
    return r;
  }, [articles, tab, query, sort]);

  const handleDelete = (e, slug, title) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`למחוק את "${title}"?`)) return;
    deleteArticleFromLocal(slug);
    v5eToast('נמחק מקומית.', 'info');
  };

  return (
    <section className="v5e-list-section">
      <header className="v5e-list-head">
        <div>
          <div className="v5-eyebrow">[ §06 — ARTICLE LIBRARY ]</div>
          <h2>המאמרים <span className="serif">שלי.</span></h2>
          <p>טיוטות נשמרות אוטומטית. פרסום מסונכרן ל-Sanity דרך פונקציה מאובטחת.</p>
        </div>
        <a className="v5e-new-btn" href="article.html?action=new">+ מאמר חדש</a>
      </header>

      <div className="v5e-list-stats">
        <div><strong>{stats.total}</strong><span>סך הכל</span></div>
        <div><strong>{stats.published}</strong><span>פורסם</span></div>
        <div><strong>{stats.drafts}</strong><span>טיוטות</span></div>
      </div>

      <div className="v5e-list-tools">
        <div className="v5e-tabs">
          {[
            ['all', 'הכל', stats.total],
            ['published', 'פורסם', stats.published],
            ['drafts', 'טיוטות', stats.drafts],
          ].map(([k, label, n]) => (
            <button key={k} className={`v5e-tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>
              {label} <em>{n}</em>
            </button>
          ))}
        </div>
        <div className="v5e-list-filters">
          <input className="v5e-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש…" dir="rtl" />
          <select className="v5e-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="updatedAt">לפי תאריך עדכון</option>
            <option value="createdAt">לפי תאריך יצירה</option>
            <option value="title">לפי כותרת</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="v5e-empty">
          <div className="v5e-empty-mark">∅</div>
          <h3>{query ? 'לא נמצאו תוצאות' : tab === 'drafts' ? 'אין טיוטות' : tab === 'published' ? 'אין מאמרים פורסמו' : 'אין מאמרים עדיין'}</h3>
          <p>{query ? 'נסה חיפוש אחר.' : 'התחל לכתוב — המאמר הראשון מחכה.'}</p>
          <a className="v5e-new-btn" href="article.html?action=new">+ מאמר חדש</a>
        </div>
      ) : (
        <div className="v5e-cards">
          {filtered.map(a => (
            <V5ArticleCard key={a.id || a.slug} article={a} isDraft={isDraft(a)} onDelete={handleDelete} />
          ))}
          <a className="v5e-card-new" href="article.html?action=new">
            <span className="plus">+</span>
            <span>מאמר חדש</span>
          </a>
        </div>
      )}
    </section>
  );
}

function V5ArticleCard({ article, isDraft, onDelete }) {
  const preview = useMemo(() => {
    const para = (article.content || []).find(b => (b.type === 'paragraph' || b.type === 'lead') && b.content);
    return para ? para.content.slice(0, 140) : '';
  }, [article]);

  const wordCount = (article.content || []).reduce((s, b) => s + ((b.content || '').split(/\s+/).filter(Boolean).length), 0);

  const editHref = `article.html?action=edit&slug=${encodeURIComponent(article.slug)}`;
  const viewHref = `article.html?action=view&slug=${encodeURIComponent(article.slug)}`;

  return (
    <article className={`v5e-card${isDraft ? ' is-draft' : ''}`}>
      <header className="v5e-card-head">
        <span className="mono">{new Date(article.updatedAt).toLocaleDateString('he-IL')}</span>
        <span className="mono">{wordCount} מילים</span>
        {isDraft && <span className="v5e-card-badge">טיוטה</span>}
      </header>
      <a href={editHref} className="v5e-card-title">
        <h3>{article.title}</h3>
      </a>
      {preview && <p className="v5e-card-preview" dir="rtl">{preview}{preview.length >= 140 ? '…' : ''}</p>}
      <footer className="v5e-card-foot">
        <a href={editHref} className="v5e-card-action">✏️ ערוך</a>
        <a href={viewHref} className="v5e-card-action">👁 קרא</a>
        <button className="v5e-card-action danger" onClick={(e) => onDelete(e, article.slug, article.title)}>🗑 מחק</button>
      </footer>
    </article>
  );
}

// ===================================================================
// READING VIEW — full article rendered inside V5ArticleTemplate chrome
// ===================================================================

function V5ArticleViewerV2({ article, onBack }) {
  if (!article) {
    return (
      <section className="v5e-list-section">
        <div className="v5e-empty">
          <div className="v5e-empty-mark">404</div>
          <h3>מאמר לא נמצא</h3>
          <p>ייתכן שנמחק או שה-slug לא קיים.</p>
          <a className="v5e-new-btn" href="articles.html">← לספריית המאמרים</a>
        </div>
      </section>
    );
  }
  return (
    <div className="v5e-reading-wrap">
      <div className="v5e-reading-bar">
        <a href="articles.html" className="v5e-back">← ספריית מאמרים</a>
        <a href={`article.html?action=edit&slug=${encodeURIComponent(article.slug)}`} className="v5e-btn ghost">✏️ ערוך</a>
      </div>
      <V5RenderArticle article={article} />
    </div>
  );
}

function V5RenderArticle({ article }) {
  const blocks = article.content || [];
  const tldr = blocks.find(b => b.type === 'tldr');
  const headings = blocks.filter(b => b.type === 'heading2' || b.type === 'heading3');
  const meta = useMemo(() => {
    const words = blocks.reduce((s, b) => s + ((b.content || '').split(/\s+/).filter(Boolean).length), 0);
    return {
      words,
      readMinutes: Math.max(1, Math.round(words / 220)),
      date: article.updatedAt ? new Date(article.updatedAt).toLocaleDateString('he-IL') : '',
    };
  }, [blocks, article.updatedAt]);

  return (
    <section className="v5-article-template v5e-published">
      <div className="v5-article-paper" />
      <div className="v5-article-top" data-v5-reveal>
        <div className="v5-article-labels">
          <span>§ ARTICLE</span>
          <span>{tldr ? 'מאמר עם TL;DR' : 'מאמר'}</span>
          <span>{meta.readMinutes} דק׳ קריאה</span>
        </div>
        <h2>{article.title}</h2>
      </div>

      <div className="v5-article-shell">
        <aside className="v5-article-rail" data-v5-reveal style={{ '--ex': '26px' }}>
          {tldr && (
            <div className="v5-rail-card">
              <strong>TL;DR</strong>
              <p>{tldr.content}</p>
            </div>
          )}
          {headings.length > 0 && (
            <div className="v5-rail-card v5-rail-dark">
              <span className="mono">READING MAP</span>
              {headings.map((h, i) => (
                <a key={h.id} href={`#${h.id}`}>
                  <em>{String(i + 1).padStart(2, '0')}</em>{h.content || '—'}
                </a>
              ))}
            </div>
          )}
          <div className="v5-rail-note">
            {meta.words} מילים · {meta.date}
          </div>
        </aside>

        <article className="v5-longform" data-v5-reveal>
          <div className="v5-longform-meta">
            <span>מאמר</span>
            <span>{meta.date}</span>
            <span>{meta.readMinutes} דק׳</span>
          </div>
          {blocks.filter(b => b.type !== 'tldr').map(b => <V5RenderBlock key={b.id} block={b} />)}
        </article>

        <aside className="v5-related" data-v5-reveal style={{ '--ex': '-26px' }}>
          <h3>קיצורי דרך</h3>
          <a href="articles.html">
            <strong>ספריית המאמרים</strong>
            <span className="mono">ARTICLE LIBRARY</span>
          </a>
          <a href={`article.html?action=edit&slug=${encodeURIComponent(article.slug)}`}>
            <strong>ערוך מאמר זה</strong>
            <span className="mono">EDIT MODE</span>
          </a>
          <a href="index.html#home">
            <strong>חזרה לעמוד הבית</strong>
            <span className="mono">NEWSROOM HOME</span>
          </a>
        </aside>
      </div>
    </section>
  );
}

function V5RenderBlock({ block }) {
  switch (block.type) {
    case 'lead':
      return <p className="lead" dir="rtl">{block.content}</p>;
    case 'paragraph':
      return <p dir="rtl">{block.content}</p>;
    case 'heading2':
      return <h3 id={block.id} dir="rtl">{block.content}</h3>;
    case 'heading3':
      return <h4 id={block.id} dir="rtl" style={{ fontSize: 22, fontWeight: 800, margin: '28px 0 10px', letterSpacing: '-0.02em' }}>{block.content}</h4>;
    case 'quote':
      return <blockquote dir="rtl">{block.content}</blockquote>;
    case 'image':
      return block.content ? (
        <figure className="v5e-img-fig">
          <img src={block.content} alt={block.alt || ''} />
          {block.alt && <figcaption className="mono">{block.alt}</figcaption>}
        </figure>
      ) : null;
    case 'code':
      return (
        <pre className="v5e-code-render"><code dir="ltr">{block.content}</code></pre>
      );
    case 'method':
      return (
        <div className="v5-method-card">
          <span className="mono">{block.label || 'METHOD'}</span>
          <code>{block.content}</code>
        </div>
      );
    case 'compare':
      return (
        <div className="v5-compare-strip" style={{ gridTemplateColumns: `repeat(${(block.items || []).length || 1}, 1fr)` }}>
          {(block.items || []).map((it, i) => (
            <div key={i}>
              <span>{it.label}</span>
              <strong>{it.title}</strong>
              <em>{it.sub}</em>
            </div>
          ))}
        </div>
      );
    case 'callout':
      return <aside className={`v5e-callout v5e-callout-${block.tone || 'sage'}`} dir="rtl">{block.content}</aside>;
    case 'divider':
      return <hr className="v5e-hr" />;
    case 'tldr':
      return null; // rendered in the rail
    default:
      return null;
  }
}

// ===================================================================
// EXPORTS (mounted via v5-newsroom.jsx V5ArticlesPage / V5ArticlePage)
// ===================================================================

window.V5ArticleEditorV2 = V5ArticleEditorV2;
window.V5MyArticlesV2 = V5MyArticlesV2;
window.V5ArticleViewerV2 = V5ArticleViewerV2;
window.V5RenderArticle = V5RenderArticle;
window.V5_BLOCK_DEFS = V5E_BLOCK_DEFS;
