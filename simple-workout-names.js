(() => {
  const workoutDefs = [
    { source: ['Strong Start', 'Full Body'], name: 'Full Body', detail: '4 exercises · 25 min' },
    { source: ['Upper Body Strength', 'Upper Body'], name: 'Upper Body', detail: '5 exercises · 40 min' },
    { source: ['Lower Body Strength', 'Lower Body'], name: 'Lower Body', detail: '4 exercises · 40 min' },
    { source: ['Push Day', 'Push'], name: 'Push', detail: '4 exercises · 40 min' },
    { source: ['Pull Day', 'Pull'], name: 'Pull', detail: '4 exercises · 40 min' },
    { source: ['Core Builder', 'Core'], name: 'Core', detail: '4 exercises · 20 min' },
    { source: ['Cardio Starter', 'Cardio'], name: 'Cardio', detail: '3 exercises · 25 min' }
  ];

  let queued = false;

  const normalize = value => String(value || '').trim().toLowerCase();

  function definitionFor(value) {
    const name = normalize(value);
    return workoutDefs.find(def => def.source.some(source => normalize(source) === name)) || null;
  }

  function ensureStyles() {
    let style = document.getElementById('levelUpPremadeVisualStylesV4');
    if (!style) {
      style = document.createElement('style');
      style.id = 'levelUpPremadeVisualStylesV4';
      document.head.appendChild(style);
    }

    // This stylesheet intentionally contains NO sprite/background image rules.
    // Workout artwork is owned exclusively by workout-card-art-fix.js.
    style.textContent = `
      #planList.premade-visual-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 12px !important;
        align-items: stretch !important;
      }

      #planList .plan-card.premade-visual-card {
        min-width: 0 !important;
        overflow: hidden !important;
        padding: 0 !important;
        border-radius: 20px !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) auto !important;
        grid-template-rows: auto auto !important;
        background: #090d0d !important;
      }

      #planList .plan-card.premade-visual-card .plan-icon {
        grid-column: 1 / -1 !important;
        grid-row: 1 !important;
        display: block !important;
        position: relative !important;
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 4 / 3 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        overflow: hidden !important;
        background: #070909 !important;
      }

      #planList .plan-card.premade-visual-card .plan-icon img {
        display: block !important;
      }

      #planList .plan-card.premade-visual-card > div:not(.plan-icon) {
        min-width: 0 !important;
        padding: 13px 0 13px 15px !important;
      }

      #planList .plan-card.premade-visual-card b {
        display: block !important;
        color: #f7f8f8 !important;
        font-size: 17px !important;
        line-height: 1.08 !important;
        font-weight: 900 !important;
      }

      #planList .plan-card.premade-visual-card small {
        display: block !important;
        margin-top: 5px !important;
        color: #8e9499 !important;
        font-size: 12px !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      #planList .plan-card.premade-visual-card .edit {
        align-self: center !important;
        justify-self: end !important;
        width: 48px !important;
        height: 48px !important;
        margin: 10px 9px 10px 7px !important;
        border-radius: 50% !important;
        font-size: 28px !important;
        line-height: 1 !important;
      }

      @media (max-width: 380px) {
        #planList.premade-visual-grid { gap: 10px !important; }
        #planList .plan-card.premade-visual-card b { font-size: 16px !important; }
        #planList .plan-card.premade-visual-card .edit { width: 44px !important; height: 44px !important; }
      }
    `;
  }

  function simplifyPlans() {
    const list = document.getElementById('planList');
    if (!list) return;

    ensureStyles();
    list.classList.add('premade-visual-grid');

    const cards = Array.from(list.querySelectorAll('.plan-card'));
    const chosen = [];

    workoutDefs.forEach(def => {
      const card = cards.find(candidate => {
        const title = candidate.dataset.levelUpOriginalWorkoutName || candidate.querySelector('b')?.textContent || '';
        return def.source.some(source => normalize(source) === normalize(title));
      });
      if (!card) return;

      const title = card.querySelector('b');
      if (title && !card.dataset.levelUpOriginalWorkoutName) {
        card.dataset.levelUpOriginalWorkoutName = title.textContent.trim();
      }

      card.classList.add('premade-visual-card');
      card.style.removeProperty('display');
      card.dataset.levelUpWorkoutName = def.name;
      if (title && title.textContent !== def.name) title.textContent = def.name;

      const small = card.querySelector('small');
      if (small && small.textContent !== def.detail) small.textContent = def.detail;

      const button = card.querySelector('.edit');
      if (button && button.textContent !== '→') {
        button.textContent = '→';
        button.setAttribute('aria-label', `Open ${def.name} workout`);
      }

      chosen.push(card);
    });

    cards.forEach(card => {
      if (!chosen.includes(card)) card.style.setProperty('display', 'none', 'important');
    });

    const visibleOrder = Array.from(list.children).filter(child => chosen.includes(child));
    const alreadyOrdered = chosen.length === visibleOrder.length && chosen.every((card, index) => card === visibleOrder[index]);
    if (!alreadyOrdered) chosen.forEach(card => list.appendChild(card));
  }

  function simplifyHome() {
    document.querySelectorAll('#homePlanList .home-plan').forEach(card => {
      const title = card.querySelector('b');
      if (!title) return;
      const original = card.dataset.levelUpOriginalWorkoutName || title.textContent.trim();
      if (!card.dataset.levelUpOriginalWorkoutName) card.dataset.levelUpOriginalWorkoutName = original;
      const def = definitionFor(original);
      if (def && title.textContent !== def.name) title.textContent = def.name;
    });
  }

  function decorate() {
    simplifyPlans();
    simplifyHome();
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
