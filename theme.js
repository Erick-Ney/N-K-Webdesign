/* theme.js — N&K Webdesign (dark-first)
   Dark is default. light-mode class enables the light palette.
   FOUC prevention is handled inline in each page's <head>.
*/
(function () {
  'use strict';

  const toggle = document.getElementById('theme-toggle');
  const html   = document.documentElement;

  function isLight() {
    return html.classList.contains('light-mode');
  }

  function setLight() {
    html.classList.add('light-mode');
    html.classList.remove('dark-mode'); // safety
    localStorage.setItem('theme', 'light');
    if (toggle) toggle.setAttribute('aria-label', 'Switch to dark mode');
  }

  function setDark() {
    html.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
    if (toggle) toggle.setAttribute('aria-label', 'Switch to light mode');
  }

  // Set correct aria-label on load
  if (toggle) {
    toggle.setAttribute('aria-label', isLight() ? 'Switch to dark mode' : 'Switch to light mode');
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (isLight()) setDark();
      else setLight();
    });
  }

  // Listen for system preference changes (if user hasn't manually set)
  try {
    const mq = matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) setLight();
        else setDark();
      }
    });
  } catch (e) { /* older Safari */ }

})();
