/* In-page anchor scrolling with slow, eased motion (ease-in-out, φ-based duration) */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.style.scrollBehavior = 'auto';
  // easeInOutQuint: slow start, gentle acceleration, long soft landing
  function ease(t) { return t < .5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2; }
  var anim = null;
  function headerH() { var h = document.querySelector('.hd'); return h ? h.getBoundingClientRect().height : 0; }
  function go(target) {
    var from = scrollY;
    var to = Math.max(0, Math.min(target.getBoundingClientRect().top + scrollY - headerH() - 26,
      document.documentElement.scrollHeight - innerHeight));
    var dist = Math.abs(to - from);
    if (dist < 2) return;
    var dur = Math.min(2618, Math.max(1236, 1000 + dist * 0.382)); // 1.236s – 2.618s
    var t0 = performance.now();
    if (anim) cancelAnimationFrame(anim);
    function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      scrollTo(0, from + (to - from) * ease(k));
      if (k < 1) anim = requestAnimationFrame(step); else anim = null;
    }
    anim = requestAnimationFrame(step);
    // stop if the user scrolls by hand
    var stop = function () { if (anim) { cancelAnimationFrame(anim); anim = null; } off(); };
    function off() { removeEventListener('wheel', stop); removeEventListener('touchstart', stop); }
    addEventListener('wheel', stop, { passive: true, once: true });
    addEventListener('touchstart', stop, { passive: true, once: true });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) { e.preventDefault(); go(document.body); return; }
    var el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    var mn = document.getElementById('mn'); if (mn) mn.checked = false;
    go(el);
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });
})();
