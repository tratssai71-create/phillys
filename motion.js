/* Phillys motion — scroll reveals, hero intro, parallax, swipe hint */
(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { root.classList.add('mo-off'); return; }
  root.classList.add('mo');

  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* ---- hero headline: split into rising lines ---- */
  $$('.fv4-h, .rc-h').forEach(function (h) {
    var parts = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = parts.map(function (p, i) {
      return '<span class="mo-ln"><span style="transition-delay:' + (0.15 + i * 0.16).toFixed(2) + 's">' + p + '</span></span>';
    }).join('');
  });

  /* ---- vertical manifesto: char by char ---- */
  $$('.mf-h span').forEach(function (line, li) {
    var t = line.textContent, html = '';
    for (var i = 0; i < t.length; i++) {
      html += '<i class="mo-ch" style="transition-delay:' + (li * 0.5 + i * 0.09).toFixed(2) + 's">' + t[i] + '</i>';
    }
    line.innerHTML = html;
  });

  /* ---- assign reveal targets ---- */
  var groups = [
    '.st > *', '.ab3-ttl', '.sv3-intro', '.pg-lead', '.ab3-body > *', '.mf-body > *',
    '.sv4', '.vc-item', '.vp-card', '.pr-card', '.pr-head', '.nt-item', '.sp-who li', '.rc-ben li',
    '.vl-txt > *', '.ab3-gal li', '.vp-g', '.cta2-txt > *', '.og-txt > *', '.ab-what-body > *', '.rc-entry-in > *'
  ];
  var seen = new Set();
  groups.forEach(function (sel) {
    $$(sel).forEach(function (el) {
      if (seen.has(el) || el.closest('.fv4-head,.mbar,.hd')) return;
      seen.add(el); el.classList.add('rv');
    });
  });
  // stagger siblings
  var parents = new Map();
  seen.forEach(function (el) {
    var p = el.parentNode, n = parents.get(p) || 0;
    el.style.setProperty('--rv-d', Math.min(n, 6) * 0.09 + 's');
    parents.set(p, n + 1);
  });
  // photos: curtain reveal (not the hero photos)
  $$('.photo').forEach(function (ph) {
    if (ph.closest('.fv4, .rc-hero, .pg-hero, dialog')) return;
    ph.classList.add('rv-ph');
  });

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      if (el._ph) el._ph.classList.add('in');
      if (el.matches('.rv, .mf, .rc-stats, .ab3-gal, .vp-gal')) el.classList.add('in');
      if (el.matches('.ab3-gal, .vp-gal')) $$('.rv, .rv-ph', el).forEach(function (c) { c.classList.add('in'); });
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.rv, .mf, .rc-stats, .ab3-gal, .vp-gal').forEach(function (el) {
    if (!el.closest('.ab3-gal, .vp-gal') || el.matches('.ab3-gal, .vp-gal')) io.observe(el);
  });
  $$('.rv-ph').forEach(function (ph) {
    if (ph.closest('.ab3-gal, .vp-gal')) return;
    var host = ph.parentNode; host._ph = ph; io.observe(host);
  });

  /* ---- hero intro ---- */
  requestAnimationFrame(function () { setTimeout(function () { root.classList.add('mo-ready'); }, 60); });

  /* ---- count-up (recruit stats) ---- */
  $$('.rc-stats b').forEach(function (b) {
    var node = b.firstChild; if (!node || node.nodeType !== 3) return;
    var m = node.nodeValue.match(/(\D*)(\d+)(\D*)/); if (!m) return;
    var target = +m[2]; node.nodeValue = m[1] + '0' + m[3];
    var stats = b.closest('.rc-stats');
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now();
      (function tick(t) {
        var k = Math.min(1, (t - t0) / 1100), v = Math.round(target * (1 - Math.pow(1 - k, 3)));
        node.nodeValue = m[1] + v + m[3]; if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.5 }).observe(stats);
  });

  /* ---- scroll: parallax, header hide/show, bottom bar ---- */
  var px = $$('.fv4-photo img');
  var hd = d.querySelector('.hd'), lastY = scrollY, ticking = false;
  function onScroll() {
    var y = scrollY, vh = innerHeight;
    px.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = 'translate3d(0,' + (p * -4).toFixed(2) + '%,0) scale(1.08)';
    });
    root.classList.toggle('mbar-on', y > 280);
    lastY = y; ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
