(() => {
  const EMBLEM = 'assets/level-up-emblem.svg';
  const APP_ICON = 'assets/level-up-app-icon.svg';

  function ensureExerciseCatalogExpansion() {
    if (document.querySelector('script[data-level-up-exercise-catalog-expansion]')) return;
    const script = document.createElement('script');
    script.async = false;
    script.src = 'exercise-catalog-expansion.js?v=1';
    script.setAttribute('data-level-up-exercise-catalog-expansion', 'true');
    document.body.appendChild(script);
  }

  function ensureSimpleWorkoutNames() {
    if (document.querySelector('script[data-level-up-simple-workout-names]')) return;
    const script = document.createElement('script');
    script.async = false;
    script.src = 'simple-workout-names.js?v=1';
    script.setAttribute('data-level-up-simple-workout-names', 'true');
    document.body.appendChild(script);
  }

  function ensureHeadBranding() {
    document.title = 'Level Up Fitness';

    let favicon = document.querySelector('link[rel="icon"][data-level-up-brand]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      favicon.dataset.levelUpBrand = 'true';
      document.head.appendChild(favicon);
    }
    favicon.href = APP_ICON;

    let touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!touchIcon) {
      touchIcon = document.createElement('link');
      touchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(touchIcon);
    }
    touchIcon.href = APP_ICON;

    const titleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (titleMeta) titleMeta.setAttribute('content', 'Level Up Fitness');
  }

  function makeBrandImage() {
    const image = document.createElement('img');
    image.src = EMBLEM;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    return image;
  }

  function brandAuthGate() {
    const panel = document.querySelector('#authGate .auth-panel');
    const title = document.getElementById('authTitle');
    if (!panel || !title || panel.querySelector('.level-up-auth-brand')) return;

    const brand = document.createElement('div');
    brand.className = 'level-up-auth-brand';
    brand.setAttribute('aria-label', 'Level Up Fitness');
    brand.appendChild(makeBrandImage());

    const copy = document.createElement('div');
    copy.className = 'level-up-auth-brand-copy';
    copy.innerHTML = '<strong>LEVEL UP</strong><span>FITNESS</span>';
    brand.appendChild(copy);
    title.insertAdjacentElement('beforebegin', brand);
  }

  function brandWorkoutPage() {
    const page = document.getElementById('workout');
    const over = page?.querySelector(':scope > .over');
    if (!page || !over || page.querySelector('.level-up-workout-brand')) return;

    const brand = document.createElement('div');
    brand.className = 'level-up-workout-brand';
    brand.setAttribute('aria-label', 'Level Up Fitness');
    brand.appendChild(makeBrandImage());

    const copy = document.createElement('div');
    copy.className = 'level-up-workout-brand-copy';
    copy.innerHTML = '<strong>LEVEL UP</strong><span>FITNESS</span>';
    brand.appendChild(copy);
    over.insertAdjacentElement('beforebegin', brand);
  }

  function brandProfileSettings() {
    const panel = document.getElementById('profileSettingsPanel');
    if (!panel || panel.querySelector('.level-up-profile-brand')) return;

    const heading = panel.querySelector('.over');
    const brand = document.createElement('div');
    brand.className = 'level-up-profile-brand';
    brand.appendChild(makeBrandImage());

    const copy = document.createElement('div');
    copy.innerHTML = '<strong>Level Up Fitness</strong><span>Training, progress, and your gym profile in one place.</span>';
    brand.appendChild(copy);

    if (heading) heading.insertAdjacentElement('beforebegin', brand);
    else panel.prepend(brand);
  }

  function applyBranding() {
    ensureExerciseCatalogExpansion();
    ensureSimpleWorkoutNames();
    ensureHeadBranding();
    brandAuthGate();
    brandWorkoutPage();
    brandProfileSettings();
  }

  const observer = new MutationObserver(applyBranding);

  function start() {
    applyBranding();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('pageshow', applyBranding);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
