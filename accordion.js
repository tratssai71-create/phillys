/* Accordion for <details class="vc-item"> — CSS grid-row transition (no layout toggling, no flash on iOS) */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('details.vc-item'), function (d) {
    var sum = d.querySelector('summary'), body = d.querySelector('.vc-body');
    if (!sum || !body) return;
    // wrap: .vc-body (grid) > .vc-clip (overflow) > .vc-pad (visual box)
    var clip = document.createElement('div'); clip.className = 'vc-clip';
    var pad = document.createElement('div'); pad.className = 'vc-pad';
    while (body.firstChild) pad.appendChild(body.firstChild);
    clip.appendChild(pad); body.appendChild(clip);
    var startOpen = d.open;
    d.classList.add('acc');
    d.open = true;                       // keep native element open; visibility is CSS-driven
    d.classList.toggle('is-open', startOpen);
    sum.setAttribute('aria-expanded', startOpen ? 'true' : 'false');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      var o = !d.classList.contains('is-open');
      d.classList.toggle('is-open', o);
      sum.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
  });
})();
