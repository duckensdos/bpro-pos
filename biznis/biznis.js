(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // VSL: a poster facade that loads the YouTube player only on click (privacy-enhanced domain).
  document.querySelectorAll('.vsl__play').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.video;
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      f.title = btn.getAttribute('aria-label').replace('Jwe videyo a: ', '');
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      btn.replaceWith(f);
      f.closest('.vsl')?.classList.add('is-playing');
      f.focus();
    });
  });

  // Hero depth: one progress value, the device and the background plate move at different rates.
  if (reduce) return;
  const hero = document.querySelector('.vhero');
  if (!hero) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = hero.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.8)));
    hero.style.setProperty('--vp', p.toFixed(4));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
