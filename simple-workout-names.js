(() => {
  const basicWorkoutOrder = [
    { source: ['Strong Start', 'Full Body'], name: 'Full Body' },
    { source: ['Upper Body Strength', 'Upper Body'], name: 'Upper Body' },
    { source: ['Lower Body Strength', 'Lower Body'], name: 'Lower Body' },
    { source: ['Push Day', 'Push'], name: 'Push' },
    { source: ['Pull Day', 'Pull'], name: 'Pull' },
    { source: ['Core Builder', 'Core'], name: 'Core' },
    { source: ['Cardio Starter', 'Cardio'], name: 'Cardio' }
  ];

  const focusLabels = {
    'Full Body': ['FULL', 'BODY'],
    'Upper Body': ['UPPER', 'BODY'],
    'Lower Body': ['LOWER', 'BODY'],
    'Push': ['PUSH'],
    'Pull': ['PULL'],
    'Core': ['CORE'],
    'Cardio': ['CARDIO']
  };

  function ensureStyles() {
    if (document.getElementById('levelUpWorkoutFocusBadgeStyles')) return;
    const style = document.createElement('style');
    style.id = 'levelUpWorkoutFocusBadgeStyles';
    style.textContent = `
      #planList .plan-icon.workout-focus-visual,
      #homePlanList .home-plan-icon.workout-focus-visual {
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        width: 58px;
        height: 58px;
        padding: 0;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 16px;
        background:
          radial-gradient(circle at 28% 22%, rgba(255,255,255,.07), transparent 42%),
          linear-gradient(145deg, #15181c, #0c0e11 72%);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
      }

      #homePlanList .home-plan-icon.workout-focus-visual {
        width: 52px;
        height: 52px;
        border-radius: 14px;
      }

      .workout-focus-badge {
        display: flex;
        width: 100%;
        height: 100%;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1px;
        color: #f5f7f8;
        text-align: center;
        letter-spacing: .045em;
        line-height: .95;
      }

      .workout-focus-badge::before {
        content: '';
        width: 15px;
        height: 2px;
        margin-bottom: 4px;
        border-radius: 999px;
        background: #ff3447;
        box-shadow: 0 0 10px rgba(255,52,71,.28);
      }

      .workout-focus-badge strong {
        display: block;
        font-size: 10px;
        font-weight: 850;
      }

      .workout-focus-badge.one-line strong {
        font-size: 11px;
      }

      #homePlanList .workout-focus-badge strong {
        font-size: 9px;
      }

      #homePlanList .workout-focus-badge.one-line strong {
        font-size: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  function badgeMarkup(name) {
    const lines = focusLabels[name] || [String(name || 'WORKOUT').toUpperCase()];
    const oneLine = lines.length === 1 ? ' one-line' : '';
    return `<span class="workout-focus-badge${oneLine}" aria-hidden="true">${lines.map(line => `<strong>${line}</strong>`).join('')}</span>`;
  }

  function decorateContainer(containerSelector, cardSelector, iconSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.querySelectorAll(cardSelector).forEach(card => {
      const name = card.querySelector('b')?.textContent?.trim() || '';
      if (!focusLabels[name]) return;
      const icon = card.querySelector(iconSelector);
      if (!icon || icon.classList.contains('workout-focus-visual')) return;
      icon.classList.add('workout-focus-visual');
      icon.innerHTML = badgeMarkup(name);
    });
  }

  function decorateWorkoutVisuals() {
    ensureStyles();
    decorateContainer('#planList', '.plan-card', '.plan-icon');
    decorateContainer('#homePlanList', '.home-plan', '.home-plan-icon');
  }

  function applyBasicWorkoutLibrary() {
    try {
      if (!Array.isArray(plans)) return;

      const selected = basicWorkoutOrder
        .map(config => {
          const plan = plans.find(candidate => config.source.includes(candidate?.name));
          if (!plan) return null;
          plan.name = config.name;
          return plan;
        })
        .filter(Boolean);

      if (!selected.length) return;

      plans.splice(0, plans.length, ...selected);

      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      try { if (typeof renderHome === 'function') renderHome(); } catch {}
      decorateWorkoutVisuals();

      if (selectedPlan && !plans.includes(selectedPlan)) selectedPlan = null;
      if (selectedPlan && typeof populatePlanDetail === 'function') {
        try { populatePlanDetail(selectedPlan); } catch {}
      }
    } catch (error) {
      console.warn('Level Up basic workout library could not load.', error);
    }
  }

  const observer = new MutationObserver(() => decorateWorkoutVisuals());

  function start() {
    applyBasicWorkoutLibrary();
    decorateWorkoutVisuals();
    const workout = document.getElementById('workout');
    const home = document.getElementById('home');
    if (workout) observer.observe(workout, { childList: true, subtree: true });
    if (home) observer.observe(home, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
