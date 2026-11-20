/* Phillys carousel for .ab3-gal — swipe / arrows / dots, no autoplay */
(function () {
  var ARW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  Array.prototype.forEach.call(document.querySelectorAll('.ab3-gal'), function (track) {
    var slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) return;
    track.classList.add('crs-track');
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-roledescription', 'カルーセル');
    var wrap = document.createElement('div');
    wrap.className = 'crs';
    track.parentNode.insertBefore(wrap, track);
    wrap.appendChild(track);
    var nav = document.createElement('div');
    nav.className = 'crs-nav wrap';
    var dots = slides.map(function (_, i) {
      return '<button type="button" class="crs-dot" aria-label="' + (i + 1) + '枚目へ"></button>';
    }).join('');
    nav.innerHTML =
      '<p class="crs-count"><b>01</b><span>/</span>' + String(slides.length).padStart(2, '0') + '</p>' +
      '<div class="crs-dots">' + dots + '</div>' +
      '<div class="crs-btns"><button type="button" class="crs-btn crs-prev" aria-label="前の写真">' + ARW + '</button>' +
      '<button type="button" class="crs-btn crs-next" aria-label="次の写真">' + ARW + '</button></div>';
    wrap.appendChild(nav);
    slides.forEach(function (s, i) { s.setAttribute('aria-label', (i + 1) + ' / ' + slides.length); });

    var dotEls = nav.querySelectorAll('.crs-dot'), count = nav.querySelector('.crs-count b');
    var prev = nav.querySelector('.crs-prev'), next = nav.querySelector('.crs-next'), cur = 0;

    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[i];
      track.scrollTo({ left: s.offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
    }
    function update() {
      var x = track.scrollLeft, best = 0, bd = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft - slides[0].offsetLeft - x);
        if (d < bd) { bd = d; best = i; }
      });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = slides.length - 1;
      cur = best;
      count.textContent = String(best + 1).padStart(2, '0');
      Array.prototype.forEach.call(dotEls, function (d, i) {
        d.classList.toggle('on', i === best);
        d.setAttribute('aria-current', i === best ? 'true' : 'false');
      });
      slides.forEach(function (s, i) { s.classList.toggle('crs-on', i === best); });
      prev.disabled = best === 0;
      next.disabled = best === slides.length - 1;
    }
    prev.addEventListener('click', function () { go(cur - 1); });
    next.addEventListener('click', function () { go(cur + 1); });
    Array.prototype.forEach.call(dotEls, function (d, i) { d.addEventListener('click', function () { go(i); }); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });
    var t; track.addEventListener('scroll', function () { cancelAnimationFrame(t); t = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', update);
    update();
  });
})();
