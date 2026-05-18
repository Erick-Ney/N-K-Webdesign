/* scroll-animations.js — N&K Webdesign */
(function () {
  'use strict';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .reveal-fade, .reveal-left, .reveal-right, .reveal-stagger')
      .forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.reveal, .reveal-fade, .reveal-left, .reveal-right, .reveal-stagger')
    .forEach(el => io.observe(el));

})();
