(function () {
  if (window.__nvisionTabsMounted) return;
  window.__nvisionTabsMounted = true;

  var variations = [
    { key: "A", name: "A - Bento Editorial",      path: "/A%20-%20Bento%20Editorial/" },
    { key: "B", name: "B - Infinite Mosaic",      path: "/B%20-%20Infinite%20Mosaic/" },
    { key: "C", name: "C - Newsroom Chat",        path: "/C%20-%20Newsroom%20Chat/" },
    { key: "D", name: "D - Strategist Workbench", path: "/D%20-%20Strategist%20Workbench/" },
    { key: "E", name: "E - Newsroom Workbench",   path: "/E%20-%20Newsroom%20Workbench/" }
  ];

  function currentKey() {
    var p = decodeURIComponent(location.pathname);
    var hit = variations.find(function (v) { return p.indexOf(decodeURIComponent(v.path)) === 0; });
    return hit ? hit.key : null;
  }

  function makeStyle() {
    var s = document.createElement("style");
    s.textContent = ''
      + '.nv-switcher{position:fixed;top:12px;left:50%;transform:translateX(-50%);'
      + 'z-index:2147483647;display:flex;align-items:stretch;gap:2px;padding:4px;'
      + 'background:rgba(15,15,18,0.78);backdrop-filter:blur(14px) saturate(140%);'
      + '-webkit-backdrop-filter:blur(14px) saturate(140%);'
      + 'border:1px solid rgba(255,255,255,0.10);border-radius:14px;'
      + 'box-shadow:0 6px 24px rgba(0,0,0,0.45),0 0 0 1px rgba(255,255,255,0.02) inset;'
      + 'font-family:Heebo,system-ui,-apple-system,sans-serif;direction:ltr;'
      + 'transition:opacity .2s ease;opacity:.55}'
      + '.nv-switcher:hover{opacity:1}'
      + '.nv-switcher a{display:flex;align-items:center;gap:8px;padding:7px 12px;'
      + 'color:rgba(230,230,235,.78);text-decoration:none;font-size:12px;font-weight:500;'
      + 'border-radius:10px;letter-spacing:.2px;line-height:1;white-space:nowrap;'
      + 'transition:background .15s ease,color .15s ease}'
      + '.nv-switcher a:hover{color:#fff;background:rgba(255,255,255,0.06)}'
      + '.nv-switcher a[aria-current="page"]{color:#0b0b0d;background:#f5f5f7;'
      + 'box-shadow:0 1px 2px rgba(0,0,0,0.25)}'
      + '.nv-switcher .nv-k{display:inline-block;min-width:14px;text-align:center;'
      + 'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10px;font-weight:700;'
      + 'opacity:.7}'
      + '.nv-switcher a[aria-current="page"] .nv-k{opacity:1}'
      + '@media (max-width:760px){.nv-switcher{top:8px;padding:3px;gap:1px}'
      + '.nv-switcher a{padding:6px 9px;font-size:11px}'
      + '.nv-switcher .nv-name{display:none}}';
    document.head.appendChild(s);
  }

  function mount() {
    makeStyle();
    var nav = document.createElement("nav");
    nav.className = "nv-switcher";
    nav.setAttribute("aria-label", "nVision variations");
    var here = currentKey();
    variations.forEach(function (v) {
      var a = document.createElement("a");
      a.href = v.path;
      a.title = v.name + " (press " + v.key + ")";
      if (v.key === here) a.setAttribute("aria-current", "page");
      a.innerHTML = '<span class="nv-k">' + v.key + '</span><span class="nv-name">'
        + v.name.replace(/^[A-E]\s*-\s*/, '') + '</span>';
      nav.appendChild(a);
    });
    document.body.appendChild(nav);

    document.addEventListener("keydown", function (e) {
      if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
      if (e.target && e.target.isContentEditable) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = (e.key || "").toUpperCase();
      var v = variations.find(function (x) { return x.key === k; });
      if (v && v.key !== here) { e.preventDefault(); location.href = v.path; }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
