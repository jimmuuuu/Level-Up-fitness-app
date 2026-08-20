(() => {
  const ART_BY_NAME = {
    'Full Body': 'assets/workouts/full-body-visual.svg?v=6',
    'Upper Body': 'assets/workouts/upper-body-visual.svg?v=6',
    'Lower Body': 'assets/workouts/lower-body-visual.svg?v=6',
    'Push': 'assets/workouts/push-visual.svg?v=6',
    'Pull': 'assets/workouts/pull-visual.svg?v=6',
    'Core': 'assets/workouts/core-visual.svg?v=6',
    'Cardio': 'assets/workouts/cardio-visual.svg?v=6'
  };

  const OLD_ART_CLASSES = [
    'level-up-art-full',
    'level-up-art-upper',
    'level-up-art-lower',
    'level-up-art-push',
    'level-up-art-pull',
    'level-up-art-core',
    'level-up-art-cardio'
  ];

  let queued = false;

  function ensureStyles() {
    let style = document.getElementById('levelUpWorkoutArtFixStyles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'levelUpWorkoutArtFixStyles';
      document.head.appendChild(style);
    }

    // Always overwrite this style block. Older iPhone/PWA sessions may still
    // have the former sprite-sheet rules in the DOM.
    style.textContent = `
      #planList .plan-icon.workout-exercise-visual,
      #homePlanList .home-plan-icon.workout-exercise-visual {
        position: relative !important;
        overflow: hidden !important;
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
        z-index: 1 !important;
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

  function clearLegacySpriteState(icon) {
    if (!icon) return;
    OLD_ART_CLASSES.forEach(className => icon.classList.remove(className));
    icon.style.removeProperty('background-image');
    icon.style.removeProperty('background-position');
    icon.style.removeProperty('background-size');
    icon.style.removeProperty('background-repeat');
  }

  function paint(icon, name) {
    const art = ART_BY_NAME[name];
    if (!icon || !art) return;

    clearLegacySpriteState(icon);
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

    const list = document.getElementById('planList');
    if (list) {
      list.querySelectorAll('.plan-card').forEach(card => {
        const name = card.querySelector('b')?.textContent?.trim() || '';
        paint(card.querySelector('.plan-icon'), name);
      });
    }

    const home = document.getElementById('homePlanList');
    if (home) {
      home.querySelectorAll('.home-plan').forEach(card => {
        const name = card.querySelector('b')?.textContent?.trim() || '';
        paint(card.querySelector('.home-plan-icon'), name);
      });
    }
  }

  function queueDecorate() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      decorate();
    });
  }

  function start() {
    decorate();

    const observer = new MutationObserver(queueDecorate);
    const workout = document.getElementById('workout');
    const home = document.getElementById('home');
    if (workout) observer.observe(workout, { childList: true, subtree: true });
    if (home) observer.observe(home, { childList: true, subtree: true });
    window.addEventListener('pageshow', queueDecorate);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();