/* main.js — N&K Webdesign */
(function () {
  'use strict';

  try {

    /* ── 1. STICKY HEADER: hide on down, show on up ─── */
    const header = document.getElementById('site-header');
    let lastY = 0;
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (header) {
            if (y > 60) header.classList.add('scrolled');
            else header.classList.remove('scrolled');

            if (y > lastY && y > 120) header.classList.add('nav-hidden');
            else header.classList.remove('nav-hidden');
          }
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });


    /* ── 2. MOBILE NAV ──────────────────────────────── */
    const hamburger = document.getElementById('nav-hamburger');
    const overlay   = document.getElementById('nav-overlay');

    function openNav() {
      if (!overlay || !hamburger) return;
      overlay.removeAttribute('hidden');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      // Focus first link
      const firstLink = overlay.querySelector('a, button');
      if (firstLink) firstLink.focus();
    }

    function closeNav() {
      if (!overlay || !hamburger) return;
      overlay.setAttribute('hidden', '');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }

    if (hamburger) hamburger.addEventListener('click', openNav);

    // Close on overlay link click
    if (overlay) {
      overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
    }

    // ESC closes
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay && !overlay.hidden) closeNav();
    });

    // Focus trap
    if (overlay) {
      overlay.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const focusable = overlay.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }


    /* ── 3. SMOOTH SCROLL with header offset ───────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });


    /* ── 4. ACTIVE NAV via scroll sections ──────────── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="./"]');

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute('id');
          navLinks.forEach(link => {
            link.removeAttribute('aria-current');
            if (link.getAttribute('href').includes(id)) {
              link.setAttribute('aria-current', 'section');
            }
          });
        }
      });
    }, { threshold: 0.25 });

    sections.forEach(s => sectionObserver.observe(s));


    /* ── 5. CONTACT FORM (Formspree) ────────────────── */
    const form   = document.getElementById('contact-form');
    const status = document.getElementById('form-status');

    if (form) {
      form.addEventListener('submit', async e => {
        e.preventDefault();

        // Validate required fields
        let valid = true;
        form.querySelectorAll('[required]').forEach(field => {
          if (!field.value.trim()) {
            field.classList.add('error');
            valid = false;
          } else {
            field.classList.remove('error');
          }
        });
        if (!valid) return;

        // Honeypot check
        const honey = form.querySelector('[name="bot-field"]');
        if (honey && honey.value) return;

        const submitBtn = form.querySelector('[type="submit"]');
        const origText  = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

        try {
          const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
          });

          if (res.ok) {
            if (status) {
              status.className = 'form-status success';
              status.textContent = 'Thank you! We\'ll be in touch within 1 business day.';
              status.setAttribute('aria-live', 'polite');
            }
            form.reset();
          } else {
            throw new Error('Server error');
          }
        } catch {
          if (status) {
            status.className = 'form-status error';
            status.textContent = 'Something went wrong. Please email us directly at hello@nk-webdesign.de';
          }
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
        }
      });

      // Blur validation
      form.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('blur', () => {
          if (!field.value.trim()) field.classList.add('error');
          else field.classList.remove('error');
        });
      });
    }


    /* ── 6. MAGNETIC BUTTONS ────────────────────────── */
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r   = btn.getBoundingClientRect();
        const x   = e.clientX - r.left - r.width  / 2;
        const y   = e.clientY - r.top  - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });


    /* ── 7. PROJECT FILTER ──────────────────────────── */
    const filterBtns  = document.querySelectorAll('.project-filter-btn');
    const projectCards = document.querySelectorAll('.project-card[data-category]');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        projectCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.removeAttribute('data-hidden');
          } else {
            card.setAttribute('data-hidden', 'true');
          }
        });
      });
    });


    /* ── 8. FAQ ACCORDION ───────────────────────────── */
    document.querySelectorAll('.faq-item__trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item    = trigger.closest('.faq-item');
        const answer  = item.querySelector('.faq-item__answer');
        const isOpen  = trigger.getAttribute('aria-expanded') === 'true';

        // Close all others
        document.querySelectorAll('.faq-item__trigger').forEach(t => {
          if (t !== trigger) {
            t.setAttribute('aria-expanded', 'false');
            const a = t.closest('.faq-item').querySelector('.faq-item__answer');
            if (a) a.setAttribute('hidden', '');
          }
        });

        trigger.setAttribute('aria-expanded', !isOpen);
        if (answer) {
          if (isOpen) answer.setAttribute('hidden', '');
          else answer.removeAttribute('hidden');
        }
      });
    });


    /* ── 9. FOOTER YEAR ─────────────────────────────── */
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


    /* ── 10. BUTTON RIPPLE ──────────────────────────── */
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const r    = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `
          width:${size}px;height:${size}px;
          left:${e.clientX - r.left - size/2}px;
          top:${e.clientY - r.top  - size/2}px;
        `;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });


    /* ── 11. COOKIE SETTINGS FROM FOOTER ───────────── */
    const cookieSettingsBtn = document.getElementById('cookie-settings-btn');
    if (cookieSettingsBtn) {
      cookieSettingsBtn.addEventListener('click', () => {
        const modal = document.getElementById('cookie-modal');
        if (modal) modal.removeAttribute('hidden');
      });
    }


  } catch (err) {
    console.warn('N&K main.js error:', err);
  }

})();
