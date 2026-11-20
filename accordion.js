/* Smooth, lingering open/close for <details class="vc-item"> (voice / FAQ) */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE_OPEN = 'cubic-bezier(.16,1,.3,1)', EASE_CLOSE = 'cubic-bezier(.4,0,.2,1)';
  Array.prototype.forEach.call(document.querySelectorAll('details.vc-item'), function (d) {
    var sum = d.querySelector('summary'), body = d.querySelector('.vc-body');
    if (!sum || !body || reduce || !body.animate) return;
    var anim = null, inner = body.firstElementChild;
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (anim) anim.cancel();
      if (!d.open) {
        d.open = true;
        var h = body.offsetHeight, cs = getComputedStyle(body);
        var mb = cs.marginBottom, pt = cs.paddingTop, pb = cs.paddingBottom;
        anim = body.animate([{ height: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }, { height: h + 'px', marginBottom: mb, paddingTop: pt, paddingBottom: pb, opacity: 1 }],
          { duration: 1236, easing: EASE_OPEN });
        if (inner) inner.animate([{ opacity: 0, transform: 'translate3d(0,10px,0)' }, { opacity: 1, transform: 'none' }],
          { duration: 1618, delay: 236, easing: EASE_OPEN, fill: 'backwards' });
        d.classList.add('is-opening');
        anim.onfinish = function () { anim = null; d.classList.remove('is-opening'); };
      } else {
        var h2 = body.offsetHeight, cs2 = getComputedStyle(body), mb2 = cs2.marginBottom;
        d.classList.add('is-closing');
        anim = body.animate([{ height: h2 + 'px', marginBottom: mb2, paddingTop: cs2.paddingTop, paddingBottom: cs2.paddingBottom, opacity: 1 }, { height: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }],
          { duration: 764, easing: EASE_CLOSE });
        anim.onfinish = function () { d.open = false; anim = null; d.classList.remove('is-closing'); };
      }
    });
  });
})();
