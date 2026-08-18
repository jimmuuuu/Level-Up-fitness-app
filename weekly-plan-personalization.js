(() => {
  const AUTO_PREFIX = 'custom-auto-weekly-';
  const CONFIG_PREFIX = 'levelUpFitnessWeeklyPlan:';
  const APPLIED_PREFIX = 'levelUpFitnessWeeklyPersonalizationV2:';
  const VERSION = 2;

  const roleCandidates = {
    chest: {
      planet: ['Chest Press', 'Dumbbell Bench Press', 'Push-Up'],
      full: ['Barbell Bench Press', 'Dumbbell Bench Press', 'Chest Press'],
      home: ['Dumbbell Bench Press', 'Push-Up', 'Incline Dumbbell Press'],
      minimal: ['Push-Up']
    },
    inclineChest: {
      planet: ['Incline Chest Press Machine', 'Incline Dumbbell Press', 'Chest Press'],
      full: ['Incline Barbell Bench Press', 'Incline Dumbbell Press', 'Chest Press'],
      home: ['Incline Dumbbell Press', 'Push-Up'],
      minimal: ['Push-Up']
    },
    chestAccessory: {
      planet: ['Pec Deck', 'Cable Chest Fly', 'Push-Up'],
      full: ['Cable Chest Fly', 'Pec Deck', 'Push-Up'],
      home: ['Push-Up', 'Dumbbell Bench Press'],
      minimal: ['Push-Up']
    },
    pull: {
      planet: ['Lat Pulldown', 'Close-Grip Lat Pulldown', 'Assisted Pull-Up'],
      full: ['Pull-Up', 'Lat Pulldown', 'Assisted Pull-Up'],
      home: ['Single-Arm Dumbbell Row', 'Dumbbell Row'],
      minimal: ['Back Extension']
    },
    row: {
      planet: ['Seated Row', 'Seated Cable Row', 'Chest-Supported Row'],
      full: ['Barbell Row', 'Seated Row', 'Single-Arm Dumbbell Row'],
      home: ['Single-Arm Dumbbell Row', 'Dumbbell Row', 'Chest-Supported Row'],
      minimal: ['Back Extension']
    },
    rowAlt: {
      planet: ['Chest-Supported Row', 'Seated Row', 'Seated Cable Row'],
      full: ['Single-Arm Dumbbell Row', 'Barbell Row', 'Seated Row'],
      home: ['Dumbbell Row', 'Single-Arm Dumbbell Row', 'Chest-Supported Row'],
      minimal: ['Back Extension']
    },
    shoulder: {
      planet: ['Shoulder Press', 'Machine Shoulder Press', 'Dumbbell Shoulder Press'],
      full: ['Dumbbell Shoulder Press', 'Shoulder Press', 'Arnold Press'],
      home: ['Dumbbell Shoulder Press', 'Arnold Press'],
      minimal: ['Push-Up']
    },
    lateral: {
      planet: ['Cable Lateral Raise', 'Lateral Raise'],
      full: ['Lateral Raise', 'Cable Lateral Raise'],
      home: ['Lateral Raise'],
      minimal: []
    },
    rearDelt: {
      planet: ['Reverse Pec Deck', 'Face Pull', 'Rear Delt Fly'],
      full: ['Face Pull', 'Rear Delt Fly', 'Reverse Pec Deck'],
      home: ['Rear Delt Fly'],
      minimal: []
    },
    squat: {
      planet: ['Leg Press', 'Smith Machine Squat', 'Goblet Squat'],
      full: ['Barbell Back Squat', 'Leg Press', 'Goblet Squat'],
      home: ['Goblet Squat', 'Reverse Lunge', 'Walking Lunge'],
      minimal: ['Reverse Lunge', 'Walking Lunge']
    },
    hinge: {
      planet: ['Dumbbell Romanian Deadlift', 'Romanian Deadlift', 'Glute Bridge'],
      full: ['Romanian Deadlift', 'Dumbbell Romanian Deadlift', 'Hip Thrust'],
      home: ['Dumbbell Romanian Deadlift', 'Glute Bridge'],
      minimal: ['Glute Bridge']
    },
    quad: {
      planet: ['Leg Extension', 'Single-Leg Press', 'Leg Press'],
      full: ['Leg Extension', 'Bulgarian Split Squat', 'Step-Up'],
      home: ['Bulgarian Split Squat', 'Step-Up', 'Reverse Lunge'],
      minimal: ['Reverse Lunge', 'Step-Up']
    },
    hamstring: {
      planet: ['Seated Leg Curl', 'Lying Leg Curl', 'Dumbbell Romanian Deadlift'],
      full: ['Seated Leg Curl', 'Romanian Deadlift', 'Dumbbell Romanian Deadlift'],
      home: ['Dumbbell Romanian Deadlift', 'Glute Bridge'],
      minimal: ['Glute Bridge']
    },
    glute: {
      planet: ['Glute Drive Machine', 'Smith Machine Hip Thrust', 'Hip Abductor Machine'],
      full: ['Hip Thrust', 'Cable Kickback', 'Glute Bridge'],
      home: ['Glute Bridge', 'Hip Thrust'],
      minimal: ['Glute Bridge']
    },
    lunge: {
      planet: ['Reverse Lunge', 'Walking Lunge', 'Step-Up'],
      full: ['Bulgarian Split Squat', 'Walking Lunge', 'Reverse Lunge'],
      home: ['Reverse Lunge', 'Walking Lunge', 'Step-Up'],
      minimal: ['Reverse Lunge', 'Walking Lunge', 'Step-Up']
    },
    calf: {
      planet: ['Calf Raise', 'Seated Calf Raise'],
      full: ['Calf Raise', 'Seated Calf Raise'],
      home: ['Calf Raise'],
      minimal: ['Calf Raise']
    },
    biceps: {
      planet: ['Cable Curl', 'Dumbbell Curl', 'Biceps Curl'],
      full: ['Dumbbell Curl', 'Cable Curl', 'Hammer Curl'],
      home: ['Dumbbell Curl', 'Hammer Curl'],
      minimal: []
    },
    bicepsAlt: {
      planet: ['Hammer Curl', 'Biceps Curl', 'Cable Curl'],
      full: ['Hammer Curl', 'EZ-Bar Curl', 'Dumbbell Curl'],
      home: ['Hammer Curl', 'Dumbbell Curl'],
      minimal: []
    },
    triceps: {
      planet: ['Rope Triceps Pushdown', 'Triceps Pushdown', 'Overhead Cable Triceps Extension'],
      full: ['Triceps Pushdown', 'Dip', 'Dumbbell Triceps Extension'],
      home: ['Dumbbell Triceps Extension', 'Push-Up'],
      minimal: ['Push-Up']
    },
    tricepsAlt: {
      planet: ['Overhead Cable Triceps Extension', 'Triceps Pushdown', 'Rope Triceps Pushdown'],
      full: ['Dumbbell Triceps Extension', 'Triceps Pushdown', 'Dip'],
      home: ['Dumbbell Triceps Extension', 'Push-Up'],
      minimal: ['Push-Up']
    },
    core: {
      planet: ['Ab Crunch Machine', 'Cable Crunch', 'Dead Bug'],
      full: ['Cable Crunch', 'Hanging Knee Raise', 'Dead Bug'],
      home: ['Dead Bug', 'Sit-Up', 'Russian Twist'],
      minimal: ['Dead Bug', 'Sit-Up', 'Russian Twist']
    },
    coreAlt: {
      planet: ['Cable Crunch', 'Dead Bug', 'Ab Crunch Machine'],
      full: ['Dead Bug', 'Hanging Knee Raise', 'Cable Crunch'],
      home: ['Russian Twist', 'Sit-Up', 'Dead Bug'],
      minimal: ['Russian Twist', 'Sit-Up', 'Dead Bug']
    }
  };

  const templates = {
    'Full Body A': ['squat', 'chest', 'row', 'hinge', 'shoulder', 'pull', 'core', 'biceps', 'triceps'],
    'Full Body B': ['lunge', 'inclineChest', 'pull', 'hamstring', 'rowAlt', 'lateral', 'glute', 'coreAlt', 'tricepsAlt'],
    'Full Body C': ['quad', 'chest', 'row', 'glute', 'hinge', 'rearDelt', 'calf', 'core', 'bicepsAlt'],
    'Upper Body A': ['chest', 'pull', 'row', 'shoulder', 'inclineChest', 'lateral', 'biceps', 'triceps', 'rearDelt'],
    'Upper Body B': ['inclineChest', 'rowAlt', 'pull', 'shoulder', 'chestAccessory', 'rearDelt', 'lateral', 'bicepsAlt', 'tricepsAlt'],
    'Lower Body A': ['squat', 'hamstring', 'quad', 'glute', 'hinge', 'calf', 'lunge', 'core'],
    'Lower Body B': ['hinge', 'quad', 'lunge', 'hamstring', 'glute', 'squat', 'calf', 'coreAlt'],
    Push: ['chest', 'inclineChest', 'shoulder', 'chestAccessory', 'lateral', 'triceps', 'tricepsAlt', 'core'],
    Pull: ['pull', 'row', 'rowAlt', 'rearDelt', 'biceps', 'bicepsAlt', 'hinge', 'core'],
    Legs: ['squat', 'hinge', 'quad', 'hamstring', 'glute', 'lunge', 'calf', 'core'],
    'Upper Body': ['chest', 'row', 'pull', 'shoulder', 'inclineChest', 'rearDelt', 'biceps', 'triceps', 'lateral'],
    'Lower Body': ['squat', 'hinge', 'quad', 'hamstring', 'glute', 'lunge', 'calf', 'core'],
    'Push A': ['chest', 'shoulder', 'inclineChest', 'chestAccessory', 'lateral', 'triceps', 'tricepsAlt', 'core'],
    'Pull A': ['pull', 'row', 'rowAlt', 'rearDelt', 'biceps', 'bicepsAlt', 'core'],
    'Legs A': ['squat', 'hamstring', 'quad', 'glute', 'calf', 'lunge', 'core'],
    'Push B': ['inclineChest', 'shoulder', 'chest', 'chestAccessory', 'lateral', 'tricepsAlt', 'triceps', 'coreAlt'],
    'Pull B': ['rowAlt', 'pull', 'row', 'rearDelt', 'bicepsAlt', 'biceps', 'hinge', 'coreAlt'],
    'Legs B': ['hinge', 'lunge', 'quad', 'hamstring', 'glute', 'squat', 'calf', 'coreAlt'],
    'Recovery & Core': ['core', 'coreAlt', 'rearDelt', 'calf', 'glute']
  };

  const accessoryRoles = new Set([
    'chestAccessory', 'lateral', 'rearDelt', 'quad', 'calf',
    'biceps', 'bicepsAlt', 'triceps', 'tricepsAlt', 'core', 'coreAlt'
  ]);

  function safe(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function currentAccountId() {
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return cloudUser.id;
      if (typeof userProfile !== 'undefined') {
        return userProfile?.accountKey || userProfile?.email?.trim().toLowerCase() || 'local';
      }
    } catch {}
    return 'local';
  }

  function readConfig() {
    try {
      const raw = localStorage.getItem(`${CONFIG_PREFIX}${currentAccountId()}`);
      const value = JSON.parse(raw || 'null');
      if (!value || value.version !== 1 || !value.answers) return null;
      return value;
    } catch {
      return null;
    }
  }

  function normalizeSettings(input = {}) {
    const goal = ['muscle', 'strength', 'fitness', 'endurance'].includes(input.goal) ? input.goal : 'muscle';
    const experience = ['new', 'beginner', 'intermediate'].includes(input.experience) ? input.experience : 'beginner';
    const location = ['planet', 'full', 'home', 'minimal'].includes(input.location) ? input.location : 'full';
    const duration = [30, 45, 60, 75].includes(Number(input.duration)) ? Number(input.duration) : 60;
    return { goal, experience, location, duration };
  }

  function splitNames(count) {
    const map = {
      1: ['Full Body A'],
      2: ['Full Body A', 'Full Body B'],
      3: ['Full Body A', 'Full Body B', 'Full Body C'],
      4: ['Upper Body A', 'Lower Body A', 'Upper Body B', 'Lower Body B'],
      5: ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body'],
      6: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
      7: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B', 'Recovery & Core']
    };
    return map[Math.max(1, Math.min(7, Number(count) || 4))] || map[4];
  }

  function targetTimeLabel(duration) {
    return Number(duration) === 75 ? '75+ min' : `~${Number(duration) || 60} min`;
  }

  function targetMinutes(duration) {
    return Number(duration) === 75 ? 80 : Number(duration) || 60;
  }

  function exerciseTarget(settings, light = false) {
    if (light) return settings.duration >= 60 ? 5 : 4;
    const base = ({ 30: 4, 45: 5, 60: 6, 75: 8 })[settings.duration] || 6;
    if (settings.experience === 'new') return Math.max(4, base - (settings.duration >= 60 ? 1 : 0));
    if (settings.experience === 'intermediate' && settings.duration >= 60) return Math.min(9, base + 1);
    return base;
  }

  function repRange(settings, role, light = false) {
    if (light) return [10, 15];
    const accessory = accessoryRoles.has(role);
    if (settings.goal === 'strength') return accessory ? [8, 12] : [5, 8];
    if (settings.goal === 'endurance') return accessory ? [15, 20] : [12, 15];
    if (settings.goal === 'fitness') return accessory ? [10, 15] : [8, 12];
    return accessory ? [10, 15] : [8, 12];
  }

  function setsFor(settings, role, light = false) {
    if (light) return 2;
    const accessory = accessoryRoles.has(role);
    let sets;
    if (settings.experience === 'new') {
      sets = accessory ? 2 : (settings.duration >= 60 ? 3 : 2);
    } else if (settings.experience === 'intermediate') {
      sets = accessory ? 3 : 3;
    } else {
      sets = accessory ? 2 : 3;
    }

    if (settings.goal === 'strength' && !accessory && settings.experience !== 'new') sets += 1;
    if (settings.duration === 75 && accessory && settings.experience !== 'new') sets += 1;
    return Math.max(2, Math.min(4, sets));
  }

  function restNote(settings, role, light = false) {
    if (light) return 'Keep this session easy and controlled. Rest about 60 to 90 seconds between sets.';
    const accessory = accessoryRoles.has(role);
    let rest = 'Rest about 60 to 90 seconds between sets.';
    if (settings.goal === 'strength') rest = accessory
      ? 'Rest about 75 to 120 seconds between sets.'
      : 'Rest about 2 to 3 minutes between sets.';
    else if (settings.goal === 'muscle') rest = accessory
      ? 'Rest about 60 to 90 seconds between sets.'
      : 'Rest about 90 to 120 seconds between sets.';
    else if (settings.goal === 'endurance') rest = 'Rest about 45 to 75 seconds between sets.';
    if (settings.experience === 'new') {
      rest += ' Use a comfortable load and focus on technique.';
    }
    return rest;
  }

  function catalogItem(name) {
    try {
      if (typeof exerciseCatalog === 'undefined' || !Array.isArray(exerciseCatalog)) return null;
      return exerciseCatalog.find(item => item.name === name) || null;
    } catch {
      return null;
    }
  }

  function pickExercise(role, settings, variant, used) {
    const choices = roleCandidates[role]?.[settings.location] || [];
    if (!choices.length) return null;
    for (let offset = 0; offset < choices.length; offset += 1) {
      const name = choices[(variant + offset) % choices.length];
      if (used.has(name)) continue;
      const catalog = catalogItem(name);
      if (catalog) return catalog;
    }
    for (const name of choices) {
      if (used.has(name)) continue;
      const catalog = catalogItem(name);
      if (catalog) return catalog;
    }
    return null;
  }

  function makeExercise(catalog, settings, role, light = false) {
    const range = repRange(settings, role, light);
    const uid = (typeof createSessionId === 'function')
      ? createSessionId()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return {
      instanceId: `auto-personalized-${uid}`,
      catalogId: catalog.id,
      name: catalog.name,
      category: catalog.category,
      equipment: catalog.equipment,
      muscle: catalog.primary?.[0] || '',
      primary: [...(catalog.primary || [])],
      assists: [...(catalog.assists || [])],
      sets: setsFor(settings, role, light),
      repRange: [...range],
      note: restNote(settings, role, light)
    };
  }

  function buildExercises(planName, index, rawSettings) {
    const settings = normalizeSettings(rawSettings);
    const light = planName === 'Recovery & Core';
    const roles = [...(templates[planName] || templates['Full Body A'])];
    const target = Math.min(20, exerciseTarget(settings, light));
    const used = new Set();
    const exercises = [];

    const fallback = settings.location === 'minimal'
      ? ['chest', 'squat', 'lunge', 'hinge', 'core', 'coreAlt', 'calf']
      : settings.location === 'home'
        ? ['chest', 'row', 'squat', 'hinge', 'shoulder', 'core', 'biceps', 'triceps']
        : ['chest', 'pull', 'row', 'squat', 'hinge', 'shoulder', 'quad', 'hamstring', 'core', 'biceps', 'triceps'];

    const queue = light ? roles : [...roles, ...fallback];
    queue.forEach((role, roleIndex) => {
      if (exercises.length >= target) return;
      const catalog = pickExercise(role, settings, index + roleIndex, used);
      if (!catalog) return;
      used.add(catalog.name);
      exercises.push(makeExercise(catalog, settings, role, light));
    });

    return exercises;
  }

  const baseSanitizeCustomPlan = typeof sanitizeCustomPlan === 'function' ? sanitizeCustomPlan : null;

  function applyTargetTime(plan, config) {
    if (!plan || !plan.id?.startsWith(AUTO_PREFIX) || !config?.answers) return plan;
    const duration = Number(config.answers.duration) || 60;
    plan.estimatedMinutes = targetMinutes(duration);
    plan.time = targetTimeLabel(duration);
    return plan;
  }

  if (baseSanitizeCustomPlan && !globalThis.__LEVEL_UP_WEEKLY_TIME_PATCHED__) {
    globalThis.__LEVEL_UP_WEEKLY_TIME_PATCHED__ = true;
    sanitizeCustomPlan = function personalizedSanitizeCustomPlan(value) {
      const plan = baseSanitizeCustomPlan(value);
      return applyTargetTime(plan, readConfig());
    };
  }

  function buildStoredPlan(planName, index, config, existing = null) {
    const settings = normalizeSettings(config.answers || {});
    const exercises = buildExercises(planName, index, settings);
    if (!exercises.length || !baseSanitizeCustomPlan) return null;
    const now = Date.now();
    const base = baseSanitizeCustomPlan({
      id: `${AUTO_PREFIX}${index + 1}`,
      name: planName,
      revision: (Number(existing?.revision) || 0) + 1,
      createdAt: existing?.createdAt || now,
      updatedAt: now + index,
      exercises
    });
    return applyTargetTime(base, config);
  }

  function structuralSignature(plan) {
    return JSON.stringify((plan?.exercises || []).map(exercise => ({
      name: exercise.name,
      sets: Number(exercise.sets) || 0,
      reps: exercise.repRange || []
    })));
  }

  async function rebuildSavedPlans(force = false) {
    const config = readConfig();
    if (!config?.answers || !config?.planIds?.length) return false;
    if (typeof userProfile === 'undefined' || !userProfile) return false;

    const account = currentAccountId();
    const appliedKey = `${APPLIED_PREFIX}${account}`;
    const desiredStamp = `${VERSION}:${config.updatedAt}`;
    try {
      if (!force && localStorage.getItem(appliedKey) === desiredStamp) return false;
    } catch {}

    const all = Array.isArray(userProfile.customWorkouts) ? userProfile.customWorkouts : [];
    const own = all.filter(plan => !plan?.id?.startsWith(AUTO_PREFIX));
    const existingAuto = new Map(all.filter(plan => plan?.id?.startsWith(AUTO_PREFIX)).map(plan => [plan.id, plan]));
    const names = splitNames(config.answers.days);
    const generated = names.map((name, index) => buildStoredPlan(
      name,
      index,
      config,
      existingAuto.get(`${AUTO_PREFIX}${index + 1}`)
    )).filter(Boolean);

    if (generated.length !== names.length) return false;

    const currentStructure = names.map((_, index) => structuralSignature(existingAuto.get(`${AUTO_PREFIX}${index + 1}`))).join('|');
    const nextStructure = generated.map(structuralSignature).join('|');
    if (currentStructure === nextStructure && !force) {
      try { localStorage.setItem(appliedKey, desiredStamp); } catch {}
      return false;
    }

    const previous = userProfile.customWorkouts;
    try {
      userProfile.customWorkouts = typeof sanitizeCustomPlans === 'function'
        ? sanitizeCustomPlans([...generated, ...own])
        : [...generated, ...own];

      if (typeof markProfileDirty === 'function') markProfileDirty('customWorkout');
      if (typeof saveUserProfile === 'function' && !saveUserProfile()) {
        userProfile.customWorkouts = previous;
        return false;
      }

      try { localStorage.setItem(appliedKey, desiredStamp); } catch {}

      if (typeof cloudReady !== 'undefined' && cloudReady && typeof saveCloudProfile === 'function') {
        try { await saveCloudProfile(); } catch {}
      }

      if (typeof renderPlans === 'function') renderPlans();
      return true;
    } catch {
      userProfile.customWorkouts = previous;
      return false;
    }
  }

  function previewSettings(overlay) {
    const summaryText = overlay.querySelector('.weekly-preview-summary p')?.textContent?.toLowerCase() || '';
    const timingText = overlay.querySelector('.weekly-preview-summary strong')?.textContent || '';
    const durationMatch = timingText.match(/(30|45|60|75)\+?/);

    let location = 'full';
    if (summaryText.includes('machine-focused') || summaryText.includes('planet fitness')) location = 'planet';
    else if (summaryText.includes('home gym')) location = 'home';
    else if (summaryText.includes('minimal')) location = 'minimal';

    let goal = 'muscle';
    if (summaryText.includes('get stronger')) goal = 'strength';
    else if (summaryText.includes('general fitness')) goal = 'fitness';
    else if (summaryText.includes('improve endurance')) goal = 'endurance';

    let experience = 'beginner';
    if (summaryText.includes('brand new')) experience = 'new';
    else if (summaryText.includes('intermediate')) experience = 'intermediate';

    return normalizeSettings({
      location,
      goal,
      experience,
      duration: Number(durationMatch?.[1]) || 60
    });
  }

  function enhancePreview() {
    const overlay = document.getElementById('weeklyPlanWizard');
    if (!overlay || overlay.classList.contains('hidden') || !overlay.querySelector('.weekly-preview-summary')) return;

    const settings = previewSettings(overlay);
    const signature = `${settings.goal}:${settings.experience}:${settings.location}:${settings.duration}`;

    overlay.querySelectorAll('.weekly-preview-day.workout').forEach((card, index) => {
      const planName = card.querySelector('strong')?.textContent?.trim() || '';
      if (!planName) return;
      const exercises = buildExercises(planName, index, settings);
      if (!exercises.length) return;

      const totalSets = exercises.reduce((sum, exercise) => sum + (Number(exercise.sets) || 0), 0);
      const details = card.querySelector('div > small');
      if (details) details.textContent = `${exercises.length} exercises · ${totalSets} work sets · ${targetTimeLabel(settings.duration)} target`;

      card.querySelectorAll('.weekly-preview-view-exercises, .weekly-preview-exercise-panel').forEach(node => node.remove());
      card.dataset.exercisePreviewReady = 'true';
      card.dataset.personalizedPreviewSignature = signature;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'weekly-preview-view-exercises';
      button.textContent = 'View exercises';
      button.setAttribute('aria-expanded', 'false');

      const panel = document.createElement('div');
      panel.className = 'weekly-preview-exercise-panel hidden';
      panel.innerHTML = `<div class="weekly-preview-exercise-heading"><span>PERSONALIZED WORKOUT</span><small>${exercises.length} movements · ${targetTimeLabel(settings.duration)} target</small></div>
        <ol>${exercises.map((exercise, exerciseIndex) => `<li>
          <span class="weekly-preview-exercise-number">${exerciseIndex + 1}</span>
          <span class="weekly-preview-exercise-copy"><b>${safe(exercise.name)}</b><small>${safe(exercise.equipment || '')}</small></span>
          <strong>${exercise.sets} x ${exercise.repRange[0]}-${exercise.repRange[1]}</strong>
        </li>`).join('')}</ol>
        <p class="weekly-personalized-time-note">The time target includes warm-up, normal rest between sets, equipment setup and transitions. Actual time can vary.</p>`;

      button.onclick = () => {
        const isOpen = panel.classList.toggle('hidden') === false;
        button.textContent = isOpen ? 'Hide exercises' : 'View exercises';
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };

      card.appendChild(button);
      card.appendChild(panel);
    });
  }

  function addStyles() {
    if (document.getElementById('weeklyPersonalizationV2Styles')) return;
    const style = document.createElement('style');
    style.id = 'weeklyPersonalizationV2Styles';
    style.textContent = `
      .weekly-personalized-time-note {
        margin: 10px 2px 0;
        color: #8e969e;
        font-size: 11px;
        line-height: 1.45;
      }
    `;
    document.head.appendChild(style);
  }

  function scheduleRebuild() {
    [250, 650, 1200, 2200].forEach(delay => {
      window.setTimeout(() => { void rebuildSavedPlans(false); }, delay);
    });
  }

  document.addEventListener('click', event => {
    if (event.target.closest?.('[data-weekly-use]')) scheduleRebuild();
  }, true);

  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      enhancePreview();
      void rebuildSavedPlans(false);
    });
  });

  function start() {
    addStyles();
    enhancePreview();
    void rebuildSavedPlans(false);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    window.addEventListener('storage', event => {
      if (event.key?.startsWith(CONFIG_PREFIX)) {
        enhancePreview();
        scheduleRebuild();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        enhancePreview();
        scheduleRebuild();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();