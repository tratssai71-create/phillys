/* Phillys carousel for .ab3-gal — slow continuous drift (loop), pauses on touch/hover, arrows & dots */
(function () {
  var ARW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = 16.18; // px per second — slow drift (16 × φ / φ)

  Array.prototype.forEach.call(document.querySelectorAll('.ab3-gal'), function (track) {
    var slides = Array.prototype.slice.call(track.children);
    var N = slides.length;
    if (N < 2) return;
    track.classList.add('crs-track');
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-roledescription', 'カルーセル');

    // clone a full set on each side for a seamless loop
    if (!reduce) {
      slides.forEach(function (s) { var c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('crs-clone'); track.appendChild(c); });
      slides.slice().reverse().forEach(function (s) { var c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('crs-clone'); track.insertBefore(c, track.firstChild); });
      track.classList.add('crs-auto');
      Array.prototype.forEach.call(track.querySelectorAll('.crs-clone .rv, .crs-clone .rv-ph'), function (e) { e.classList.add('in'); });
    }
    var all = Array.prototype.slice.call(track.children);

    var wrap = document.createElement('div');
    wrap.className = 'crs';
    track.parentNode.insertBefore(wrap, track);
    wrap.appendChild(track);
    var nav = document.createElement('div');
    nav.className = 'crs-nav wrap';
    nav.innerHTML =
      '<p class="crs-count"><b>01</b><span>/</span>' + String(N).padStart(2, '0') + '</p>' +
      '<div class="crs-dots">' + slides.map(function (_, i) { return '<button type="button" class="crs-dot" aria-label="' + (i + 1) + '枚目へ"></button>'; }).join('') + '</div>' +
      '<div class="crs-btns"><button type="button" class="crs-btn crs-prev" aria-label="前の写真">' + ARW + '</button>' +
      '<button type="button" class="crs-btn crs-next" aria-label="次の写真">' + ARW + '</button></div>';
    wrap.appendChild(nav);

    var dotEls = nav.querySelectorAll('.crs-dot'), count = nav.querySelector('.crs-count b');
    var prev = nav.querySelector('.crs-prev'), next = nav.querySelector('.crs-next');

    function setW() { return reduce ? 0 : slides[0].offsetLeft - all[0].offsetLeft; } // width of one set (offset of first real slide)
    function startX(i) { return all[i].offsetLeft - all[0].offsetLeft; }
    var setWidth = 0, pos = 0;

    function curIndex() {
      var x = track.scrollLeft, best = 0, bd = Infinity;
      all.forEach(function (s, i) { var d = Math.abs(startX(i) - x); if (d < bd) { bd = d; best = i; } });
      return best % N;
    }
    function update() {
      var i = curIndex();
      count.textContent = String(i + 1).padStart(2, '0');
      Array.prototype.forEach.call(dotEls, function (d, k) { d.classList.toggle('on', k === i); d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      all.forEach(function (s, k) { s.classList.toggle('crs-on', k % N === i && Math.abs(startX(k) - track.scrollLeft) < s.offsetWidth * 0.6); });
      if (reduce) { prev.disabled = i === 0; next.disabled = i === N - 1; }
    }
    function wrapPos() {
      if (reduce || !setWidth) return;
      if (track.scrollLeft >= setWidth * 2) { track.scrollLeft -= setWidth; }
      else if (track.scrollLeft < setWidth * 0.5) { track.scrollLeft += setWidth; }
    }

    /* drift */
    var paused = false, resumeT, last = 0, visible = true;
    function pause(ms) { paused = true; clearTimeout(resumeT); resumeT = setTimeout(function () { paused = false; pos = track.scrollLeft; }, ms || 2618); }
    function tick(t) {
      requestAnimationFrame(tick);
      var dt = last ? Math.min(64, t - last) : 16; last = t;
      if (reduce || paused || !visible || document.hidden) return;
      pos += SPEED * dt / 1000;
      track.scrollLeft = pos;
      if (track.scrollLeft >= setWidth * 2) { pos -= setWidth; track.scrollLeft = pos; }
    }
    function goRel(dir) {
      pause(4236);
      var i = 0, x = track.scrollLeft, bd = Infinity;
      all.forEach(function (s, k) { var d = Math.abs(startX(k) - x); if (d < bd) { bd = d; i = k; } });
      var target = all[Math.max(0, Math.min(all.length - 1, i + dir))];
      track.scrollTo({ left: startX(all.indexOf(target)), behavior: 'smooth' });
    }
    function goTo(k) {
      pause(4236);
      var base = reduce ? k : N + k;
      track.scrollTo({ left: startX(base), behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { goRel(-1); });
    next.addEventListener('click', function () { goRel(1); });
    Array.prototype.forEach.call(dotEls, function (d, k) { d.addEventListener('click', function () { goTo(k); }); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goRel(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goRel(-1); }
    });
    ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) { track.addEventListener(ev, function () { pause(2618); }, { passive: true }); });
    track.addEventListener('mouseenter', function () { paused = true; clearTimeout(resumeT); });
    track.addEventListener('mouseleave', function () { pause(800); });
    track.addEventListener('focusin', function () { pause(6000); });

    var raf; track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { if (paused) { wrapPos(); pos = track.scrollLeft; } update(); });
    }, { passive: true });

    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(track);
    function init() { setWidth = setW(); track.scrollLeft = setWidth; pos = setWidth; update(); }
    addEventListener('resize', function () { var i = curIndex(); setWidth = setW(); track.scrollLeft = startX(reduce ? i : N + i); pos = track.scrollLeft; update(); });
    if (document.readyState === 'complete') init(); else addEventListener('load', init);
    if (!reduce) requestAnimationFrame(tick);
  });
})();
