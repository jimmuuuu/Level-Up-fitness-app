(() => {
  const icons = {
    workout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9v6M18 9v6M3.5 10.5v3M20.5 10.5v3M6 12h12"/></svg>',
    progress: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V11M12 19V5M19 19V8M3 19h18"/></svg>',
    scan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H5a1 1 0 0 0-1 1v3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8.5 12h7"/></svg>',
    profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19c.8-3.3 3.1-5 6.5-5s5.7 1.7 6.5 5"/></svg>'
  };

  function navLabel(button) {
    const existing = button.querySelector('.lu-nav-label');
    if (existing) return existing.textContent.trim();
    return (button.textContent || button.dataset.page || '').trim();
  }

  function enhanceNavButton(button) {
    if (!button || button.dataset.luNavReady === 'true') return;
    const page = button.dataset.page || '';
    if (!icons[page]) return;
    const label = navLabel(button);
    button.innerHTML = `<span class="lu-nav-icon">${icons[page]}</span><span class="lu-nav-label">${label}</span>`;
    button.dataset.luNavReady = 'true';
    button.setAttribute('aria-label', label);
  }

  function enhanceNavigation() {
    const tabs = document.querySelector('.tabs');
    if (!tabs) return;
    tabs.querySelectorAll('button[data-page]').forEach(enhanceNavButton);
    if (tabs.dataset.luObserverReady === 'true') return;
    tabs.dataset.luObserverReady = 'true';
    const observer = new MutationObserver(() => {
      tabs.querySelectorAll('button[data-page]').forEach(enhanceNavButton);
    });
    observer.observe(tabs, { childList: true });
  }

  function markPageState() {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.toggle('lu-visible-page', !page.classList.contains('hidden'));
    });
  }

  function polishDocument() {
    document.title = 'Level Up Fitness';
    document.body.classList.add('level-up-product-ui');
    enhanceNavigation();
    markPageState();
  }

  function start() {
    polishDocument();

    const tabs = document.querySelector('.tabs');
    if (tabs) {
      tabs.addEventListener('click', () => requestAnimationFrame(markPageState), true);
    }

    window.addEventListener('pageshow', polishDocument);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') polishDocument();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
