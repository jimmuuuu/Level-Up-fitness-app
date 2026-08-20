(() => {
  const ART_BY_NAME = {
    'Full Body': 'assets/workouts/full-body-visual.svg?v=4',
    'Upper Body': 'assets/workouts/upper-body-visual.svg?v=4',
    'Lower Body': 'assets/workouts/lower-body-visual.svg?v=4',
    'Push': 'assets/workouts/push-visual.svg?v=4',
    'Pull': 'assets/workouts/pull-visual.svg?v=4',
    'Core': 'assets/workouts/core-visual.svg?v=4',
    'Cardio': 'assets/workouts/cardio-visual.svg?v=4'
  };

  let queued = false;

  function ensureStyles() {
    if (document.getElementById('levelUpWorkoutArtFixStyles')) return;
    const style = document.createElement('style');
    style.id = 'levelUpWorkoutArtFixStyles';
    style.textContent = `
      #planList .plan-icon.workout-exercise-visual,
      #homePlanList .home-plan-icon.workout-exercise-visual {
        background-repeat: no-repeat !important;
        background-size: cover !important;
        background-position: center !important;
        image-rendering: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  function paint(icon, name) {
    const art = ART_BY_NAME[name];
    if (!icon || !art) return;
    icon.classList.add('workout-exercise-visual');
    icon.style.setProperty('background-image', `url("${art}")`, 'important');
    icon.style.setProperty('background-position', 'center', 'important');
    icon.style.setProperty('background-size', 'cover', 'important');
    icon.style.setProperty('background-repeat', 'no-repeat', 'important');
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
