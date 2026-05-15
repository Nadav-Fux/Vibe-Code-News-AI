// Shared chrome JS for /admin/ pages.
// - Highlights the active nav link based on filename.
// - Provides loadList(type, render) helper for articles / news inboxes.
// - Provides simple delete-by-slug call sharing the X-Editor-Secret pattern.

(function () {
  var NAV = [
    { section: 'תוכן' },
    { href: 'index.html', label: 'סקירה' },
    { href: 'articles.html', label: 'מאמרים' },
    { href: 'news.html', label: 'חדשות' },
    { section: 'תפעול' },
    { href: 'stats.html', label: 'סטטיסטיקות', badge: 'בקרוב' },
    { href: 'channels.html', label: 'ערוצים', badge: 'בקרוב' },
  ];

  function renderNav() {
    var mount = document.querySelector('[data-admin-nav]');
    if (!mount) return;
    var current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var html = NAV.map(function (entry) {
      if (entry.section) {
        return '<div class="admin-nav-section">' + entry.section + '</div>';
      }
      var isActive = entry.href.toLowerCase() === current;
      return '<a href="' + entry.href + '" class="' + (isActive ? 'is-active' : '') + '">'
        + '<span>' + entry.label + '</span>'
        + (entry.badge ? '<span class="admin-nav-badge">' + entry.badge + '</span>' : '')
        + '</a>';
    }).join('');
    mount.innerHTML = html;
  }
  function activeNav() { renderNav(); }

  function getSecret() {
    return localStorage.getItem('v5_editor_secret') || '';
  }
  function setSecret(value) {
    if (value && value.trim()) {
      localStorage.setItem('v5_editor_secret', value.trim());
      return true;
    }
    return false;
  }

  async function fetchJson(url, options) {
    var res = await fetch(url, options || {});
    var text = await res.text();
    var data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { raw: text }; }
    return { ok: res.ok, status: res.status, data: data };
  }

  async function loadList(endpoint) {
    var r = await fetchJson(endpoint);
    if (!r.ok) {
      throw new Error('GET ' + endpoint + ' → ' + r.status + ' ' + JSON.stringify(r.data).slice(0, 200));
    }
    return r.data;
  }

  async function deleteBySlug(endpoint, slug) {
    var secret = getSecret();
    if (!secret) {
      var supplied = window.prompt('הזן EDITOR_SECRET:');
      if (!setSecret(supplied)) throw new Error('Missing EDITOR_SECRET');
      secret = getSecret();
    }
    var r = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Editor-Secret': secret },
      body: JSON.stringify({ slug: slug }),
    });
    if (!r.ok) throw new Error('DELETE failed: ' + r.status + ' ' + (r.data.error || ''));
    return r.data;
  }

  function pill(text, kind) {
    var cls = 'admin-pill' + (kind ? ' is-' + kind : '');
    return '<span class="' + cls + '">' + (text || '') + '</span>';
  }

  function fmtTime(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' }); }
    catch (_) { return iso; }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  document.addEventListener('DOMContentLoaded', activeNav);

  window.AdminShell = {
    activeNav: activeNav,
    loadList: loadList,
    deleteBySlug: deleteBySlug,
    pill: pill,
    fmtTime: fmtTime,
    escapeHtml: escapeHtml,
    getSecret: getSecret,
    setSecret: setSecret,
  };
})();
