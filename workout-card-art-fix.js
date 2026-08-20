(() => {
  // Exact highlighted-muscle artwork supplied by the user. Embedded as data URIs
  // so the PWA cannot fall back to missing files, stale sprite sheets, or placeholders.
  const ART = {
    full: 'data:image/jpeg;base64,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','
    upper: 'data:image/jpeg;base64,',
    lower: 'data:image/jpeg;base64,',
    push: 'data:image/jpeg;base64,',
    pull: 'data:image/jpeg;base64,',
    core: 'data:image/jpeg;base64,',
    cardio: 'data:image/jpeg;base64,'
  };

  const KEY_BY_NAME = new Map([
    ['strong start', 'full'], ['full body', 'full'], ['full body basics', 'full'],
    ['upper body strength', 'upper'], ['upper body', 'upper'],
    ['lower body strength', 'lower'], ['lower body', 'lower'], ['glutes & legs', 'lower'],
    ['push day', 'push'], ['push', 'push'],
    ['pull day', 'pull'], ['pull', 'pull'], ['back & biceps blitz', 'pull'],
    ['core builder', 'core'], ['core', 'core'],
    ['cardio starter', 'cardio'], ['cardio', 'cardio']
  ]);

  const OLD_ART_CLASSES = [
    'level-up-art-full', 'level-up-art-upper', 'level-up-art-lower',
    'level-up-art-push', 'level-up-art-pull', 'level-up-art-core', 'level-up-art-cardio'
  ];

  let queued = false;
  const normalize = value => String(value || '').trim().toLowerCase();

  function artForName(name) {
    const key = KEY_BY_NAME.get(normalize(name));
    return key ? ART[key] : null;
  }

  function ensureStyles() {
    let style = document.getElementById('levelUpWorkoutArtFixStyles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'levelUpWorkoutArtFixStyles';
      document.head.appendChild(style);
    }
    style.textContent = `
      #planList .plan-icon.workout-exercise-visual,
      #homePlanList .home-plan-icon.workout-exercise-visual {
        position: relative !important;
        overflow: hidden !important;
        background: #070909 !important;
        background-image: none !important;
        background-position: center !important;
        background-size: cover !important;
        background-repeat: no-repeat !important;
        image-rendering: auto !important;
      }
      #planList .level-up-workout-art-image,
      #homePlanList .level-up-workout-art-image {
        position: absolute !important;
        inset: 0 !important;
        z-index: 2 !important;
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        max-height: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        object-fit: cover !important;
        object-position: center !important;
        image-rendering: auto !important;
        transform: none !important;
        filter: none !important;
        opacity: 1 !important;
        pointer-events: none !important;
      }
    `;
  }

  function clearLegacyState(icon) {
    if (!icon) return;
    OLD_ART_CLASSES.forEach(className => icon.classList.remove(className));
    icon.style.removeProperty('background-image');
    icon.style.removeProperty('background-position');
    icon.style.removeProperty('background-size');
    icon.style.removeProperty('background-repeat');
    icon.querySelectorAll(':scope > img:not(.level-up-workout-art-image)').forEach(img => {
      img.style.setProperty('display', 'none', 'important');
      img.setAttribute('aria-hidden', 'true');
    });
  }

  function paint(icon, name) {
    const art = artForName(name);
    if (!icon || !art) return;
    clearLegacyState(icon);
    icon.classList.add('workout-exercise-visual');
    icon.dataset.levelUpWorkoutArt = name;

    let image = icon.querySelector(':scope > .level-up-workout-art-image');
    if (!image) {
      image = document.createElement('img');
      image.className = 'level-up-workout-art-image';
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      image.decoding = 'async';
      image.loading = 'eager';
      icon.prepend(image);
    }
    if (image.src !== art) image.src = art;
  }

  function decorate() {
    ensureStyles();
    document.querySelectorAll('#planList .plan-card').forEach(card => {
      const name = card.dataset.levelUpWorkoutName || card.dataset.levelUpOriginalWorkoutName || card.querySelector('b')?.textContent || '';
      paint(card.querySelector('.plan-icon'), name);
    });
    document.querySelectorAll('#homePlanList .home-plan').forEach(card => {
      const name = card.dataset.levelUpWorkoutName || card.dataset.levelUpOriginalWorkoutName || card.querySelector('b')?.textContent || '';
      paint(card.querySelector('.home-plan-icon'), name);
    });
  }

  function queueDecorate() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; decorate(); });
  }

  function start() {
    decorate();
    const observer = new MutationObserver(queueDecorate);
    const workout = document.getElementById('workout');
    const home = document.getElementById('home');
    if (workout) observer.observe(workout, { childList: true, subtree: true });
    if (home) observer.observe(home, { childList: true, subtree: true });
    window.addEventListener('pageshow', queueDecorate);
    window.addEventListener('load', queueDecorate, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
