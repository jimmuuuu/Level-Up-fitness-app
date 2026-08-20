(() => {
  const ART_BY_NAME = {
    'Full Body': 'assets/workouts/full-body-visual.svg?v=7',
    'Upper Body': 'assets/workouts/upper-body-visual.svg?v=7',
    'Lower Body': 'assets/workouts/lower-body-visual.svg?v=7',
    'Push': 'assets/workouts/push-visual.svg?v=7',
    'Pull': 'assets/workouts/pull-visual.svg?v=7',
    'Core': 'assets/workouts/core-visual.svg?v=7',
    'Cardio': 'assets/workouts/cardio-visual.svg?v=7'
  };

  const OLD_ART_CLASSES = [
    'level-up-art-full','level-up-art-upper','level-up-art-lower','level-up-art-push',
    'level-up-art-pull','level-up-art-core','level-up-art-cardio'
  ];

  let queued = false;

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
        background: #050607 !important;
        background-image: none !important;
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

  function clearLegacyState(icon) {
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
    clearLegacyState(icon);
    icon.classList.add('workout-exercise-visual');
    icon.dataset.levelUpWorkoutArt = name;

    icon.querySelectorAll(':scope > img:not(.level-up-workout-art-image)').forEach(node => node.remove());
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
      paint(card.querySelector('.plan-icon'), card.querySelector('b')?.textContent?.trim() || '');
    });
    document.querySelectorAll('#homePlanList .home-plan').forEach(card => {
      paint(card.querySelector('.home-plan-icon'), card.querySelector('b')?.textContent?.trim() || '');
    });
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
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('pageshow', queueDecorate);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();