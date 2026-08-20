(() => {
  const SPRITE = 'data:image/jpeg;base64,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';

  const workoutDefs = [
    { source: ['Strong Start', 'Full Body'], name: 'Full Body', pos: '0% 0%' },
    { source: ['Upper Body Strength', 'Upper Body'], name: 'Upper Body', pos: '33.333% 0%' },
    { source: ['Lower Body Strength', 'Lower Body'], name: 'Lower Body', pos: '66.666% 0%' },
    { source: ['Push Day', 'Push'], name: 'Push', pos: '100% 0%' },
    { source: ['Pull Day', 'Pull'], name: 'Pull', pos: '0% 100%' },
    { source: ['Core Builder', 'Core'], name: 'Core', pos: '33.333% 100%' },
    { source: ['Cardio Starter', 'Cardio'], name: 'Cardio', pos: '66.666% 100%' }
  ];
  const posByName = Object.fromEntries(workoutDefs.map(x => [x.name, x.pos]));
  let busy = false;
  let queued = false;

  function ensureStyles() {
    document.getElementById('levelUpPremadeVisualStyles')?.remove();
    if (document.getElementById('levelUpPremadeVisualStylesV4')) return;
    const style = document.createElement('style');
    style.id = 'levelUpPremadeVisualStylesV4';
    style.textContent = `
      #premadeWorkoutIntro{margin:6px 0 2px;color:#92979f;font-size:14px;line-height:1.45}
      #planList.premade-visual-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;margin-top:14px!important}
      #planList .plan-card.premade-visual-card{display:grid!important;grid-template-columns:minmax(0,1fr) 44px!important;grid-template-rows:auto auto!important;gap:0!important;min-width:0!important;padding:0!important;overflow:hidden!important;border:1px solid #252a2f!important;border-radius:20px!important;background:linear-gradient(180deg,#101316,#0b0d0f)!important;box-shadow:0 10px 26px rgba(0,0,0,.22)!important}
      #planList .plan-card.premade-visual-card .plan-icon.workout-exercise-visual{grid-column:1/-1!important;grid-row:1!important;display:block!important;width:100%!important;height:auto!important;aspect-ratio:4/3!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background-color:#090b0d!important;background-image:url("${SPRITE}")!important;background-repeat:no-repeat!important;background-size:400% 200%!important;overflow:hidden!important}
      #planList .plan-card.premade-visual-card .plan-icon img{display:none!important}
      #planList .plan-card.premade-visual-card>div{grid-column:1!important;grid-row:2!important;min-width:0!important;padding:13px 6px 14px 13px!important;align-self:center!important}
      #planList .plan-card.premade-visual-card>div b{display:block!important;color:#f6f7f8!important;font-size:17px!important;line-height:1.15!important;letter-spacing:-.01em!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #planList .plan-card.premade-visual-card>div small{display:block!important;margin-top:5px!important;color:#8f959d!important;font-size:12px!important;line-height:1.2!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #planList .plan-card.premade-visual-card .edit{grid-column:2!important;grid-row:2!important;align-self:center!important;justify-self:center!important;width:38px!important;height:38px!important;min-width:38px!important;padding:0!important;margin:0 7px 0 0!important;border:1px solid #282d32!important;border-radius:999px!important;background:#171a1e!important;color:#ff5563!important;font-size:23px!important;line-height:1!important;font-weight:500!important;box-shadow:none!important}
      #homePlanList .home-plan-icon.workout-exercise-visual{display:block!important;width:56px!important;height:48px!important;flex:0 0 56px!important;border:1px solid #252a2f!important;border-radius:12px!important;background-color:#090b0d!important;background-image:url("${SPRITE}")!important;background-repeat:no-repeat!important;background-size:400% 200%!important;overflow:hidden!important}
      #homePlanList .home-plan-icon.workout-exercise-visual img{display:none!important}
      @media(min-width:700px){#planList.premade-visual-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
      @media(min-width:1040px){#planList.premade-visual-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
      @media(max-width:345px){#planList.premade-visual-grid{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
  }

  function normalizePlans() {
    if (!Array.isArray(plans)) return;
    const selected = workoutDefs.map(def => {
      const plan = plans.find(p => def.source.includes(p?.name));
      if (!plan) return null;
      plan.name = def.name;
      return plan;
    }).filter(Boolean);
    if (!selected.length) return;
    plans.splice(0, plans.length, ...selected);
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
    intro.textContent = 'Pick a workout and get started. Simple, effective, and ready to go.';
  }

  function paint(icon, position) {
    if (!icon || !position) return;
    icon.classList.add('workout-exercise-visual');
    icon.innerHTML = '';
    icon.style.backgroundImage = `url("${SPRITE}")`;
    icon.style.backgroundSize = '400% 200%';
    icon.style.backgroundPosition = position;
    icon.style.backgroundRepeat = 'no-repeat';
  }

  function decorate() {
    if (busy) return;
    busy = true;
    try {
      ensureStyles();
      ensureIntro();
      const list = document.getElementById('planList');
      if (list) {
        list.classList.add('premade-visual-grid');
        list.querySelectorAll('.plan-card').forEach(card => {
          const name = card.querySelector('b')?.textContent?.trim() || '';
          const pos = posByName[name];
          if (!pos) return;
          card.classList.add('premade-visual-card');
          paint(card.querySelector('.plan-icon'), pos);
          const plan = plans.find(p => p.name === name);
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
          const name = card.querySelector('b')?.textContent?.trim() || '';
          paint(card.querySelector('.home-plan-icon'), posByName[name]);
        });
      }
    } finally {
      busy = false;
    }
  }

  function apply() {
    normalizePlans();
    try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
    try { if (typeof renderHome === 'function') renderHome(); } catch {}
    decorate();
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
    apply();
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
