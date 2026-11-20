/* Smooth, lingering open/close for <details class="vc-item"> (voice / FAQ) — no flash frames */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE_OPEN = 'cubic-bezier(.16,1,.3,1)', EASE_CLOSE = 'cubic-bezier(.4,0,.2,1)';
  Array.prototype.forEach.call(document.querySelectorAll('details.vc-item'), function (d) {
    var sum = d.querySelector('summary'), body = d.querySelector('.vc-body');
    if (!sum || !body || reduce || !body.animate) return;
    var anim = null, innerAnim = null, inner = body.firstElementChild;
    function stop() { if (anim) { anim.cancel(); anim = null; } if (innerAnim) { innerAnim.cancel(); innerAnim = null; } }
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (!d.open) {
        stop();
        // hide before the browser paints the opened state, so no full-height frame appears
        body.style.height = '0px'; body.style.opacity = '0'; body.style.overflow = 'hidden';
        d.open = true;
        var cs = getComputedStyle(body);
        body.style.height = 'auto';
        var h = body.offsetHeight, mb = cs.marginBottom, pt = cs.paddingTop, pb = cs.paddingBottom;
        body.style.height = ''; body.style.opacity = '';
        anim = body.animate([{ height: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
                             { height: h + 'px', marginBottom: mb, paddingTop: pt, paddingBottom: pb, opacity: 1 }],
          { duration: 1236, easing: EASE_OPEN });
        if (inner) innerAnim = inner.animate([{ opacity: 0, transform: 'translate3d(0,10px,0)' }, { opacity: 1, transform: 'none' }],
          { duration: 1618, delay: 236, easing: EASE_OPEN, fill: 'backwards' });
        anim.onfinish = function () { anim = null; body.style.overflow = ''; };
      } else {
        stop();
        var cs2 = getComputedStyle(body), h2 = body.offsetHeight;
        d.classList.add('is-closing');
        body.style.overflow = 'hidden';
        anim = body.animate([{ height: h2 + 'px', marginBottom: cs2.marginBottom, paddingTop: cs2.paddingTop, paddingBottom: cs2.paddingBottom, opacity: 1 },
                             { height: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }],
          { duration: 764, easing: EASE_CLOSE, fill: 'forwards' });
        anim.onfinish = function () {
          d.open = false;            // close while still held at height 0 …
          d.classList.remove('is-closing');
          requestAnimationFrame(function () { if (anim) { anim.cancel(); anim = null; } body.style.overflow = ''; }); // … then release
        };
      }
    });
  });
})();
