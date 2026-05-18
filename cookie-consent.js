/* cookie-consent.js — N&K Webdesign (GDPR / Germany) */
(function () {
  'use strict';

  const STORAGE_KEY = 'cookieConsent';

  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveConsent(analytics, marketing) {
    const data = {
      essential:  true,
      analytics:  !!analytics,
      marketing:  !!marketing,
      timestamp:  new Date().toISOString()
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    return data;
  }

  function loadGA4() {
    // Only inject GA4 after analytics consent. Replace GA_MEASUREMENT_ID.
    if (document.querySelector('script[data-ga4]')) return;
    const s1 = document.createElement('script');
    s1.dataset.ga4 = '1';
    s1.async = true;
    s1.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(s1);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID', { anonymize_ip: true });
  }

  function applyConsent(data) {
    if (data && data.analytics) loadGA4();
  }

  /* ── Banner elements ── */
  const banner = document.getElementById('cookie-banner');
  const modal  = document.getElementById('cookie-modal');

  function showBanner() {
    if (banner) {
      banner.removeAttribute('hidden');
      banner.setAttribute('aria-live', 'polite');
    }
  }

  function hideBanner() {
    if (banner) banner.setAttribute('hidden', '');
  }

  function openModal() {
    if (!modal) return;
    modal.removeAttribute('hidden');
    const firstFocusable = modal.querySelector('button, [tabindex]');
    if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  /* ── On load ── */
  const existing = getConsent();
  if (!existing) {
    showBanner();
  } else {
    applyConsent(existing);
  }

  /* ── Banner actions ── */
  const btnAccept = document.getElementById('cookie-accept');
  const btnReject = document.getElementById('cookie-reject');
  const btnManage = document.getElementById('cookie-manage');

  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      const data = saveConsent(true, true);
      applyConsent(data);
      hideBanner();
    });
  }

  if (btnReject) {
    btnReject.addEventListener('click', () => {
      saveConsent(false, false);
      hideBanner();
    });
  }

  if (btnManage) {
    btnManage.addEventListener('click', () => {
      hideBanner();
      openModal();
    });
  }

  /* ── Modal actions ── */
  const modalSave = document.getElementById('cookie-modal-save');
  const modalOverlay = document.getElementById('cookie-modal-overlay');

  if (modalSave) {
    modalSave.addEventListener('click', () => {
      const analyticsToggle  = document.getElementById('toggle-analytics');
      const marketingToggle  = document.getElementById('toggle-marketing');
      const analyticsVal  = analyticsToggle  ? analyticsToggle.checked  : false;
      const marketingVal  = marketingToggle  ? marketingToggle.checked  : false;
      const data = saveConsent(analyticsVal, marketingVal);
      applyConsent(data);
      closeModal();
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  // Focus trap in modal
  if (modal) {
    modal.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ── Footer "Cookie Settings" re-opens modal ── */
  const settingsBtn = document.getElementById('cookie-settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openModal);
  }

  /* ── Pre-fill modal toggles from existing consent ── */
  if (existing) {
    const at = document.getElementById('toggle-analytics');
    const mt = document.getElementById('toggle-marketing');
    if (at) at.checked = !!existing.analytics;
    if (mt) mt.checked = !!existing.marketing;
  }

})();
