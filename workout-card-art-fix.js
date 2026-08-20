(() => {
  const ART_BY_NAME = {
    'Full Body': 'assets/workouts/full-body-highlight.webp?v=56',
    'Upper Body': 'assets/workouts/upper-body-highlight.webp?v=56',
    'Lower Body': 'assets/workouts/lower-body-highlight.webp?v=56',
    'Push': 'assets/workouts/push-highlight.webp?v=56',
    'Pull': 'assets/workouts/pull-highlight.webp?v=56',
    'Core': 'assets/workouts/core-highlight.webp?v=56',
    'Cardio': 'assets/workouts/cardio-highlight.webp?v=56'
  };

  const SOURCE_ALIASES = new Map([
    ['strong start', 'Full Body'], ['full body', 'Full Body'], ['full body basics', 'Full Body'],
    ['upper body strength', 'Upper Body'], ['upper body', 'Upper Body'],
    ['lower body strength', 'Lower Body'], ['lower body', 'Lower Body'], ['glutes & legs', 'Lower Body'],
    ['push day', 'Push'], ['push', 'Push'],
    ['pull day', 'Pull'], ['pull', 'Pull'], ['back & biceps blitz', 'Pull'],
    ['core builder', 'Core'], ['core', 'Core'],
    ['cardio starter', 'Cardio'], ['cardio', 'Cardio']
  ]);

  const OLD_ART_CLASSES = [
    'level-up-art-full', 'level-up-art-upper', 'level-up-art-lower',
    'level-up-art-push', 'level-up-art-pull', 'level-up-art-core', 'level-up-art-cardio'
  ];

  let queued = false;
  const normalize = value => String(value || '').trim().toLowerCase();

  function canonicalName(value) {
    return SOURCE_ALIASES.get(normalize(value)) || null;
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

  function paint(icon, rawName) {
    const name = canonicalName(rawName);
    const art = name ? ART_BY_NAME[name] : null;
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
    if (image.getAttribute('src') !== art) image.setAttribute('src', art);
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
