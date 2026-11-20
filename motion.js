/* Phillys motion — scroll reveals, hero intro, parallax, swipe hint */
(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { root.classList.add('mo-off'); return; }
  root.classList.add('mo');

  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }


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
    '.st', '.ab3-ttl', '.sv4', '.vl', '.vp-card', '.pr-card', '.nt-item', '.cta2-txt', '.og-txt'
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
    el.style.setProperty('--rv-d', '0s');
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
      if (el.matches('.rv, .mf, .rc-stats, .ab3-gal, .vp-gal')) el.classList.add('in');
      if (el.matches('.ab3-gal, .vp-gal')) $$('.rv, .rv-ph', el).forEach(function (c) { c.classList.add('in'); });
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  /* photos wait until they are well inside the screen, so the reveal can be seen */
  var ioPh = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      ioPh.unobserve(e.target); if (e.target._ph) e.target._ph.classList.add('in');
    });
  }, { threshold: 0, rootMargin: '0px 0px -24% 0px' });
  $$('.rv, .mf, .rc-stats, .ab3-gal, .vp-gal').forEach(function (el) {
    if (!el.closest('.ab3-gal, .vp-gal') || el.matches('.ab3-gal, .vp-gal')) io.observe(el);
  });
  $$('.rv-ph').forEach(function (ph) {
    if (ph.closest('.ab3-gal, .vp-gal')) return;
    var host = ph.parentNode; host._ph = ph; ioPh.observe(host);
  });

  /* ---- hero intro ---- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('mo-ready'); }); });
  /* replay the headline motion when the page is shown again (back/forward cache) */
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    root.classList.remove('mo-ready');
    $$('.mf').forEach(function (m) { m.classList.remove('in'); });
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      root.classList.add('mo-ready');
      $$('.mf').forEach(function (m) { if (m.getBoundingClientRect().top < innerHeight) m.classList.add('in'); });
    }); });
  });

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
  var px = [];
  var hd = d.querySelector('.hd'), lastY = scrollY, ticking = false;
  /* safety net: reveal anything that is in or above the viewport (fast flicks can skip observers) */
  var pending = $$('.rv, .mf, .ab3-gal, .vp-gal').concat($$('.rv-ph'));
  function sweep(vh) {
    if (!pending.length) return;
    pending = pending.filter(function (el) {
      if (el.classList.contains('in')) return false;
      var host = el.classList.contains('rv-ph') && !el.closest('.ab3-gal, .vp-gal') ? el.parentNode : el;
      if (host.getBoundingClientRect().top < vh * (el.classList.contains('rv-ph') || el.matches('.ab3-gal, .vp-gal') ? 0.76 : 0.94)) {
        el.classList.add('in');
        if (el.matches('.ab3-gal, .vp-gal')) $$('.rv, .rv-ph', el).forEach(function (c) { c.classList.add('in'); });
        return false;
      }
      return true;
    });
  }
  function onScroll() {
    var y = scrollY, vh = innerHeight;
    sweep(vh);
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
