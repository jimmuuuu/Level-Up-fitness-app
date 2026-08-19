(() => {
  const OVERLAY_ID = 'weeklyGymProfileStep';
  const STYLE_ID = 'weeklyGymProfileStepStyle';
  const EQUIPMENT = ['Machines', 'Cable', 'Dumbbells', 'Barbell', 'Smith machine', 'Bodyweight', 'Cardio'];
  const DEFAULTS = {
    planet: ['Machines', 'Cable', 'Dumbbells', 'Smith machine', 'Cardio'],
    full: ['Machines', 'Cable', 'Dumbbells', 'Barbell', 'Smith machine', 'Bodyweight', 'Cardio'],
    home: ['Dumbbells', 'Bodyweight'],
    minimal: ['Bodyweight']
  };

  let replayingChoice = false;
  let pendingChoice = null;
  let pendingLocation = '';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function removeDuplicateProfileGymUi() {
    document.querySelector('#profile .home-gym-section')?.remove();
    document.getElementById('gymProfilesSection')?.remove();
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #profile .home-gym-section,
      #gymProfilesSection { display:none !important; }
      .weekly-gym-profile-step {
        position:absolute;
        inset:0;
        z-index:50;
        background:#090c0f;
        overflow:auto;
      }
      .weekly-gym-profile-step .weekly-slide-shell { min-height:100%; }
      .weekly-gym-fields { display:grid; gap:18px; margin-top:24px; }
      .weekly-gym-field { display:grid; gap:8px; }
      .weekly-gym-field > span,
      .weekly-gym-equipment > span { font-weight:800; font-size:.82rem; letter-spacing:.08em; text-transform:uppercase; color:#aab2bd; }
      .weekly-gym-field input {
        width:100%; box-sizing:border-box; min-height:54px; border-radius:14px;
        border:1px solid #353b42; background:#11161a; color:#fff; padding:0 16px;
        font:inherit; font-weight:700;
      }
      .weekly-gym-equipment { display:grid; gap:10px; }
      .weekly-gym-equipment-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
      .weekly-gym-equipment-grid label {
        display:flex; align-items:center; gap:10px; min-height:48px; padding:10px 12px;
        border:1px solid #31383f; border-radius:13px; background:#11161a; color:#e8edf2; font-weight:700;
      }
      .weekly-gym-equipment-grid label:has(input:checked) { border-color:#ff4b59; background:rgba(255,75,89,.1); }
      .weekly-gym-equipment-grid input { accent-color:#ff4b59; }
      .weekly-gym-profile-status { min-height:22px; margin:8px 0 0; color:#aab2bd; font-size:.9rem; }
      .weekly-gym-profile-status.error { color:#ff8a94; }
      @media (max-width:520px) {
        .weekly-gym-equipment-grid { grid-template-columns:1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function wizard() {
    return document.getElementById('weeklyPlanWizard');
  }

  function isLocationStep() {
    const root = wizard();
    if (!root || root.classList.contains('hidden')) return false;
    const title = String(root.querySelector('#weeklyWizardTitle')?.textContent || '').trim().toLowerCase();
    return title.includes('where do you usually train') || title.includes('what type of gym setup');
  }

  function preferredGym() {
    try { return window.LevelUpGymProfiles?.preferred?.() || null; } catch { return null; }
  }

  function legacyGym() {
    try {
      const gym = userProfile?.homeGym;
      return gym?.name ? { name: String(gym.name), address: String(gym.address || '') } : null;
    } catch { return null; }
  }

  function locationEquipment(location) {
    return [...(DEFAULTS[location] || DEFAULTS.full)];
  }

  function closeGymStep() {
    document.getElementById(OVERLAY_ID)?.remove();
    pendingChoice = null;
    pendingLocation = '';
  }

  function showGymStep(button, location) {
    const root = wizard();
    if (!root) return;
    closeGymStep();
    pendingChoice = button;
    pendingLocation = location;

    const existing = preferredGym();
    const legacy = legacyGym();
    const selectedEquipment = existing?.equipment?.length ? existing.equipment : locationEquipment(location);
    const defaultName = existing?.name || legacy?.name || ((location === 'home' || location === 'minimal') ? 'Home' : '');

    const panel = document.createElement('section');
    panel.id = OVERLAY_ID;
    panel.className = 'weekly-gym-profile-step';
    panel.innerHTML = `
      <div class="weekly-slide-shell">
        <div class="weekly-slide-topbar">
          <button type="button" class="weekly-slide-back" data-gym-step-back aria-label="Back">←</button>
          <div class="weekly-slide-progress" aria-label="Gym setup"><span class="active"></span><span class="active"></span><span class="active"></span><span class="active"></span><span class="active"></span><span></span></div>
          <button type="button" class="weekly-slide-close" data-gym-step-close aria-label="Close">×</button>
        </div>
        <main class="weekly-slide-content">
          <span class="weekly-slide-kicker">GYM SETUP</span>
          <h2>Which gym do you train at?</h2>
          <p>Level Up uses this to recommend workouts and exercise swaps that match equipment you actually have access to.</p>
          <div class="weekly-gym-fields">
            <label class="weekly-gym-field">
              <span>Gym name</span>
              <input id="weeklyGymName" maxlength="60" autocomplete="organization" placeholder="Example: Planet Fitness" value="${esc(defaultName)}">
            </label>
            <div class="weekly-gym-equipment">
              <span>Equipment available</span>
              <div class="weekly-gym-equipment-grid">
                ${EQUIPMENT.map(item => `<label><input type="checkbox" value="${esc(item)}" ${selectedEquipment.includes(item) ? 'checked' : ''}><span>${esc(item)}</span></label>`).join('')}
              </div>
            </div>
            <p id="weeklyGymProfileStatus" class="weekly-gym-profile-status">You can change this later in Settings.</p>
          </div>
        </main>
        <div class="weekly-slide-footer">
          <button type="button" class="weekly-slide-secondary" data-gym-step-back>Back</button>
          <button type="button" class="weekly-slide-primary" data-gym-step-continue>Continue</button>
        </div>
      </div>`;
    root.appendChild(panel);

    panel.querySelectorAll('[data-gym-step-back]').forEach(control => control.onclick = closeGymStep);
    panel.querySelector('[data-gym-step-close]').onclick = () => {
      closeGymStep();
      root.querySelector('.weekly-slide-close')?.click();
    };
    panel.querySelector('[data-gym-step-continue]').onclick = async event => {
      const status = panel.querySelector('#weeklyGymProfileStatus');
      const name = String(panel.querySelector('#weeklyGymName')?.value || '').trim();
      const equipment = [...panel.querySelectorAll('.weekly-gym-equipment-grid input:checked')].map(input => input.value);
      if (!name) {
        status.textContent = 'Enter the gym name first.';
        status.classList.add('error');
        return;
      }
      if (!equipment.length) {
        status.textContent = 'Choose at least one type of equipment.';
        status.classList.add('error');
        return;
      }
      status.classList.remove('error');
      status.textContent = 'Saving your gym...';
      event.currentTarget.disabled = true;
      try {
        const api = window.LevelUpGymProfiles;
        if (!api?.saveGym) throw new Error('Gym profiles are still loading.');
        api.saveGym({
          id: existing?.id || '',
          name,
          equipment,
          note: legacy?.address || '',
          preferred: true
        });
        status.textContent = 'Gym saved.';
        const choice = pendingChoice;
        closeGymStep();
        if (choice) {
          replayingChoice = true;
          try { choice.click(); } finally { replayingChoice = false; }
        }
      } catch (error) {
        event.currentTarget.disabled = false;
        status.textContent = error?.message || 'Your gym could not be saved. Try again.';
        status.classList.add('error');
      }
    };
    setTimeout(() => panel.querySelector('#weeklyGymName')?.focus(), 80);
  }

  function interceptLocationChoice(event) {
    if (replayingChoice) return;
    const button = event.target.closest?.('#weeklyPlanWizard [data-weekly-choice]');
    if (!button || !isLocationStep()) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showGymStep(button, String(button.dataset.weeklyChoice || 'full'));
  }

  async function migrateLegacyGym() {
    try {
      const api = window.LevelUpGymProfiles;
      if (!api?.get || !api?.saveGym) return;
      const state = api.get();
      if (state?.gyms?.length) return;
      const oldGym = legacyGym();
      if (!oldGym?.name) return;
      let location = 'full';
      try {
        const account = typeof cloudUser !== 'undefined' && cloudUser?.id
          ? cloudUser.id
          : (userProfile?.accountKey || userProfile?.email?.trim().toLowerCase() || 'local');
        const config = JSON.parse(localStorage.getItem(`levelUpFitnessWeeklyPlan:${account}`) || 'null');
        if (['planet','full','home','minimal'].includes(config?.answers?.location)) location = config.answers.location;
      } catch {}
      api.saveGym({ name: oldGym.name, equipment: locationEquipment(location), note: oldGym.address || '', preferred: true });
    } catch {}
  }

  function start() {
    ensureStyle();
    removeDuplicateProfileGymUi();
    document.addEventListener('click', interceptLocationChoice, true);

    const profile = document.getElementById('profile');
    if (profile) new MutationObserver(removeDuplicateProfileGymUi).observe(profile, { childList: true, subtree: false });

    [300, 1000, 2400].forEach(delay => setTimeout(() => {
      removeDuplicateProfileGymUi();
      void migrateLegacyGym();
    }, delay));

    window.addEventListener('pageshow', () => {
      removeDuplicateProfileGymUi();
      void migrateLegacyGym();
    });
  }

  window.LevelUpGymOnboarding = {
    openEditor: () => window.LevelUpGymProfiles?.openEditor?.(),
    migrate: migrateLegacyGym
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
