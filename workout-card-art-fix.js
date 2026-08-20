(() => {
  const POSITIONS = {
    'Full Body': '0% 0%',
    'Upper Body': '33.333% 0%',
    'Lower Body': '66.666% 0%',
    'Push': '100% 0%',
    'Pull': '0% 100%',
    'Core': '33.333% 100%',
    'Cardio': '66.666% 100%'
  };

  const CLASS_BY_NAME = {
    'Full Body': 'level-up-art-full',
    'Upper Body': 'level-up-art-upper',
    'Lower Body': 'level-up-art-lower',
    'Push': 'level-up-art-push',
    'Pull': 'level-up-art-pull',
    'Core': 'level-up-art-core',
    'Cardio': 'level-up-art-cardio'
  };

  let spriteData = '';
  let queued = false;
  let loadingSprite = false;

  function ensureStyles() {
    if (document.getElementById('levelUpWorkoutArtFixStyles')) return;
    const style = document.createElement('style');
    style.id = 'levelUpWorkoutArtFixStyles';
    style.textContent = `
      #planList .plan-icon.workout-exercise-visual,
      #homePlanList .home-plan-icon.workout-exercise-visual {
        background-repeat: no-repeat !important;
        background-size: 400% 200% !important;
        image-rendering: auto !important;
      }
      #planList .level-up-art-full, #homePlanList .level-up-art-full { background-position: 0% 0% !important; }
      #planList .level-up-art-upper, #homePlanList .level-up-art-upper { background-position: 33.333% 0% !important; }
      #planList .level-up-art-lower, #homePlanList .level-up-art-lower { background-position: 66.666% 0% !important; }
      #planList .level-up-art-push, #homePlanList .level-up-art-push { background-position: 100% 0% !important; }
      #planList .level-up-art-pull, #homePlanList .level-up-art-pull { background-position: 0% 100% !important; }
      #planList .level-up-art-core, #homePlanList .level-up-art-core { background-position: 33.333% 100% !important; }
      #planList .level-up-art-cardio, #homePlanList .level-up-art-cardio { background-position: 66.666% 100% !important; }
    `;
    document.head.appendChild(style);
  }

  function clearArtClasses(icon) {
    Object.values(CLASS_BY_NAME).forEach(name => icon.classList.remove(name));
  }

  function paint(icon, name) {
    if (!icon || !POSITIONS[name]) return;
    clearArtClasses(icon);
    icon.classList.add('workout-exercise-visual', CLASS_BY_NAME[name]);
    icon.style.setProperty('background-position', POSITIONS[name], 'important');
    icon.style.setProperty('background-size', '400% 200%', 'important');
    icon.style.setProperty('background-repeat', 'no-repeat', 'important');
    if (spriteData) {
      icon.style.setProperty('background-image', `url("${spriteData}")`, 'important');
    }
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

  async function loadBetterSprite() {
    if (loadingSprite || spriteData) return;
    loadingSprite = true;
    try {
      const response = await fetch('assets/workouts/premade-sprite-v2.svg?v=3', { cache: 'reload' });
      if (!response.ok) return;
      const svg = await response.text();
      const match = svg.match(/href=["'](data:image\/(?:jpeg|jpg|png|webp);base64,[^"']+)["']/i);
      if (!match?.[1]) return;
      spriteData = match[1];
      decorate();
    } catch (error) {
      console.warn('Level Up workout artwork enhancement could not load.', error);
    } finally {
      loadingSprite = false;
    }
  }

  function start() {
    decorate();
    loadBetterSprite();

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
