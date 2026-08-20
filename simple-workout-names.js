(() => {
  const SPRITE = 'assets/workouts/premade-sprite-v2.svg';
  const basicWorkoutOrder = [
    { source: ['Strong Start', 'Full Body'], name: 'Full Body', pos: '0% 0%' },
    { source: ['Upper Body Strength', 'Upper Body'], name: 'Upper Body', pos: '33.333% 0%' },
    { source: ['Lower Body Strength', 'Lower Body'], name: 'Lower Body', pos: '66.666% 0%' },
    { source: ['Push Day', 'Push'], name: 'Push', pos: '100% 0%' },
    { source: ['Pull Day', 'Pull'], name: 'Pull', pos: '0% 100%' },
    { source: ['Core Builder', 'Core'], name: 'Core', pos: '33.333% 100%' },
    { source: ['Cardio Starter', 'Cardio'], name: 'Cardio', pos: '66.666% 100%' }
  ];

  const positionByName = Object.fromEntries(basicWorkoutOrder.map(item => [item.name, item.pos]));
  let decorating = false;
  let queued = false;

  function ensureStyles() {
    if (document.getElementById('levelUpPremadeVisualStyles')) return;
    const style = document.createElement('style');
    style.id = 'levelUpPremadeVisualStyles';
    style.textContent = `
      #premadeWorkoutIntro {
        margin: 6px 0 2px;
        color: #92979f;
        font-size: 14px;
        line-height: 1.45;
      }

      #planList.premade-visual-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 12px !important;
        margin-top: 14px !important;
      }

      #planList .plan-card.premade-visual-card {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 44px !important;
        grid-template-rows: auto auto !important;
        gap: 0 !important;
        min-width: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        border: 1px solid #252a2f !important;
        border-radius: 20px !important;
        background: linear-gradient(180deg, #101316, #0b0d0f) !important;
        box-shadow: 0 10px 26px rgba(0,0,0,.22) !important;
      }

      #planList .plan-card.premade-visual-card .plan-icon.workout-exercise-visual {
        grid-column: 1 / -1 !important;
        grid-row: 1 !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 4 / 3 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background-color: #090b0d !important;
        background-repeat: no-repeat !important;
        background-size: 400% 200% !important;
        overflow: hidden !important;
      }

      #planList .plan-card.premade-visual-card .plan-icon img { display: none !important; }

      #planList .plan-card.premade-visual-card > div {
        grid-column: 1 !important;
        grid-row: 2 !important;
        min-width: 0 !important;
        padding: 13px 6px 14px 13px !important;
        align-self: center !important;
      }

      #planList .plan-card.premade-visual-card > div b {
        display: block !important;
        color: #f6f7f8 !important;
        font-size: 17px !important;
        line-height: 1.15 !important;
        letter-spacing: -.01em !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      #planList .plan-card.premade-visual-card > div small {
        display: block !important;
        margin-top: 5px !important;
        color: #8f959d !important;
        font-size: 12px !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      #planList .plan-card.premade-visual-card .edit {
        grid-column: 2 !important;
        grid-row: 2 !important;
        align-self: center !important;
        justify-self: center !important;
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        padding: 0 !important;
        margin: 0 7px 0 0 !important;
        border: 1px solid #282d32 !important;
        border-radius: 999px !important;
        background: #171a1e !important;
        color: #ff5563 !important;
        font-size: 23px !important;
        line-height: 1 !important;
        font-weight: 500 !important;
        box-shadow: none !important;
      }

      #planList .plan-card.premade-visual-card .edit:active {
        transform: scale(.96) !important;
        background: #20242a !important;
      }

      #homePlanList .home-plan-icon.workout-exercise-visual {
        display: block !important;
        width: 56px !important;
        height: 48px !important;
        flex: 0 0 56px !important;
        border: 1px solid #252a2f !important;
        border-radius: 12px !important;
        background-color: #090b0d !important;
        background-repeat: no-repeat !important;
        background-size: 400% 200% !important;
        overflow: hidden !important;
      }

      #homePlanList .home-plan-icon.workout-exercise-visual img { display: none !important; }

      @media (min-width: 700px) {
        #planList.premade-visual-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 14px !important;
        }
      }

      @media (min-width: 1040px) {
        #planList.premade-visual-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
      }

      @media (max-width: 345px) {
        #planList.premade-visual-grid { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function planForName(name) {
    try { return Array.isArray(plans) ? plans.find(plan => String(plan?.name || '') === name) || null : null; }
    catch { return null; }
  }

  function ensureIntro() {
    const title = document.getElementById('libraryTitle');
    if (!title) return;
    let intro = document.getElementById('premadeWorkoutIntro');
    if (!intro) {
      intro = document.createElement('p');
      intro.id = 'premadeWorkoutIntro';
      title.insertAdjacentElement('afterend', intro);
    }
    const text = 'Pick a workout and get started. Simple, effective, and ready to go.';
    if (intro.textContent !== text) intro.textContent = text;
  }

  function paintIcon(icon, name) {
    const pos = positionByName[name];
    if (!icon || !pos) return;
    icon.classList.add('workout-exercise-visual');
    icon.innerHTML = '';
    icon.style.backgroundImage = `url("${SPRITE}")`;
    icon.style.backgroundPosition = pos;
    icon.style.backgroundSize = '400% 200%';
    icon.style.backgroundRepeat = 'no-repeat';
  }

  function decorateWorkoutVisuals() {
    if (decorating) return;
    decorating = true;
    try {
      ensureStyles();
      ensureIntro();

      const list = document.getElementById('planList');
      if (list) {
        list.classList.add('premade-visual-grid');
        list.querySelectorAll('.plan-card').forEach(card => {
          const name = String(card.querySelector('b')?.textContent || '').trim();
          if (!positionByName[name]) return;
          card.classList.add('premade-visual-card');
          paintIcon(card.querySelector('.plan-icon'), name);

          const plan = planForName(name);
          const meta = card.querySelector('small');
          if (plan && meta) meta.textContent = `${plan.exercises.length} exercises · ${plan.time}`;

          const button = card.querySelector('.edit');
          if (button) {
            button.textContent = '→';
            button.setAttribute('aria-label', `Open ${name} workout`);
          }
        });
      }

      const home = document.getElementById('homePlanList');
      if (home) {
        home.querySelectorAll('.home-plan').forEach(card => {
          const name = String(card.querySelector('b')?.textContent || '').trim();
          paintIcon(card.querySelector('.home-plan-icon'), name);
        });
      }
    } finally {
      decorating = false;
    }
  }

  function applyBasicWorkoutLibrary() {
    try {
      if (!Array.isArray(plans)) return;
      const selected = basicWorkoutOrder.map(config => {
        const plan = plans.find(candidate => config.source.includes(candidate?.name));
        if (!plan) return null;
        plan.name = config.name;
        return plan;
      }).filter(Boolean);
      if (!selected.length) return;
      plans.splice(0, plans.length, ...selected);
      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      try { if (typeof renderHome === 'function') renderHome(); } catch {}
      if (selectedPlan && !plans.includes(selectedPlan)) selectedPlan = null;
      if (selectedPlan && typeof populatePlanDetail === 'function') {
        try { populatePlanDetail(selectedPlan); } catch {}
      }
    } catch (error) {
      console.warn('Level Up basic workout library could not load.', error);
    }
  }

  function queueDecorate() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      decorateWorkoutVisuals();
    });
  }

  function start() {
    applyBasicWorkoutLibrary();
    decorateWorkoutVisuals();
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
