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
      + '.nv-switcher{position:fixed;top:2px;left:50%;transform:translateX(-50%);'
      + 'z-index:2147483647;display:flex;align-items:stretch;gap:1px;padding:2px;'
      + 'background:rgba(255,255,255,0.92);backdrop-filter:blur(12px) saturate(140%);'
      + '-webkit-backdrop-filter:blur(12px) saturate(140%);'
      + 'border:1px solid rgba(124,58,237,0.18);border-radius:10px;'
      + 'box-shadow:0 2px 10px rgba(76,29,149,0.18);'
      + 'font-family:Heebo,system-ui,-apple-system,sans-serif;direction:ltr;'
      + 'transition:opacity .2s ease;opacity:.55}'
      + '.nv-switcher:hover{opacity:1}'
      + '.nv-switcher a{display:flex;align-items:center;gap:6px;padding:4px 9px;'
      + 'color:#7c3aed;text-decoration:none;font-size:11px;font-weight:600;'
      + 'border-radius:7px;letter-spacing:.2px;line-height:1;white-space:nowrap;'
      + 'transition:background .15s ease,color .15s ease}'
      + '.nv-switcher a:hover{color:#5b21b6;background:rgba(124,58,237,0.08)}'
      + '.nv-switcher a[aria-current="page"]{color:#fff;background:#7c3aed;'
      + 'box-shadow:0 1px 3px rgba(76,29,149,0.35)}'
      + '.nv-switcher .nv-k{display:inline-block;min-width:12px;text-align:center;'
      + 'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:9px;font-weight:700;'
      + 'opacity:.65}'
      + '.nv-switcher a[aria-current="page"] .nv-k{opacity:1}'
      + '@media (max-width:760px){.nv-switcher{top:1px;padding:2px;gap:1px}'
      + '.nv-switcher a{padding:3px 7px;font-size:10px}'
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
