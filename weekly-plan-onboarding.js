(() => {
  const CONFIG_PREFIX = 'levelUpFitnessWeeklyPlan:';
  const SEEN_PREFIX = 'levelUpFitnessWeeklyPlanOnboardingSeen:';
  const AUTO_PLAN_PREFIX = 'custom-auto-weekly-';
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const MAX_CUSTOM_WORKOUTS_ALLOWED = 12;

  let currentConfig = null;
  let cloudLoadedFor = '';
  let renderQueued = false;
  let wizardDraft = null;
  let autoOpenTimer = 0;

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');

  function accountId() {
    return cloudUser?.id || userProfile?.accountKey || userProfile?.email?.trim().toLowerCase() || 'local';
  }

  function configKey() {
    return `${CONFIG_PREFIX}${accountId()}`;
  }

  function seenKey() {
    return `${SEEN_PREFIX}${accountId()}`;
  }

  function readLocalConfig() {
    try {
      const value = JSON.parse(localStorage.getItem(configKey()) || 'null');
      return normalizeConfig(value);
    } catch {
      return null;
    }
  }

  function writeLocalConfig(config) {
    try {
      if (config) localStorage.setItem(configKey(), JSON.stringify(config));
      else localStorage.removeItem(configKey());
      return true;
    } catch {
      return false;
    }
  }

  function hasBuiltInProgram() {
    try {
      return Boolean(personalProgramForCurrentUser());
    } catch {
      return false;
    }
  }

  function recommendedDays(count) {
    const map = {
      2: ['Monday', 'Thursday'],
      3: ['Monday', 'Wednesday', 'Friday'],
      4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      5: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
      6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    return [...(map[count] || map[4])];
  }

  function splitNames(count) {
    const map = {
      2: ['Full Body A', 'Full Body B'],
      3: ['Full Body A', 'Full Body B', 'Full Body C'],
      4: ['Upper Body A', 'Lower Body A', 'Upper Body B', 'Lower Body B'],
      5: ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body'],
      6: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B']
    };
    return [...(map[count] || map[4])];
  }

  function normalizeAnswers(value) {
    const goal = ['muscle', 'strength', 'fitness', 'endurance'].includes(value?.goal) ? value.goal : 'muscle';
    const experience = ['new', 'beginner', 'intermediate'].includes(value?.experience) ? value.experience : 'beginner';
    const days = Math.min(6, Math.max(2, Number(value?.days) || 4));
    const location = ['planet', 'full', 'home', 'minimal'].includes(value?.location) ? value.location : 'full';
    const duration = [30, 45, 60, 75].includes(Number(value?.duration)) ? Number(value.duration) : 60;
    const selected = Array.isArray(value?.trainingDays)
      ? DAYS.filter(day => value.trainingDays.includes(day)).slice(0, days)
      : [];
    return {
      goal,
      experience,
      days,
      location,
      duration,
      trainingDays: selected.length === days ? selected : recommendedDays(days)
    };
  }

  function normalizeConfig(value) {
    if (!value || typeof value !== 'object' || Number(value.version) !== 1) return null;
    const answers = normalizeAnswers(value.answers || {});
    const planIds = Array.isArray(value.planIds)
      ? value.planIds.filter(id => typeof id === 'string' && id.startsWith(AUTO_PLAN_PREFIX)).slice(0, answers.days)
      : [];
    const schedule = Array.isArray(value.schedule)
      ? value.schedule.filter(item => item && DAYS.includes(item.day)).slice(0, 7).map(item => ({
          day: item.day,
          planId: typeof item.planId === 'string' ? item.planId : '',
          rest: typeof item.rest === 'string' ? item.rest.slice(0, 120) : ''
        }))
      : [];
    return {
      version: 1,
      answers,
      planIds,
      schedule,
      updatedAt: Number(value.updatedAt) || Date.now()
    };
  }

  async function loadCloudConfig() {
    const id = cloudUser?.id || '';
    if (!id || id === cloudLoadedFor) return;
    const client = getSupabaseClient?.();
    if (!client) return;
    cloudLoadedFor = id;
    try {
      const { data, error } = await client.from('profiles').select('weekly_plan').eq('id', id).maybeSingle();
      if (error) throw error;
      const remote = normalizeConfig(data?.weekly_plan);
      const local = readLocalConfig();
      if (remote && (!local || remote.updatedAt >= local.updatedAt)) {
        currentConfig = remote;
        writeLocalConfig(remote);
      } else if (local) {
        currentConfig = local;
        await saveCloudConfig(local);
      }
      queueRender();
    } catch {
      cloudLoadedFor = '';
    }
  }

  async function saveCloudConfig(config) {
    const id = cloudUser?.id || '';
    const client = getSupabaseClient?.();
    if (!id || !client) return;
    const payload = { weekly_plan: config, updated_at: new Date().toISOString() };
    const { error } = await client.from('profiles').update(payload).eq('id', id);
    if (error) throw error;
  }

  function goalLabel(value) {
    return ({ muscle: 'Build muscle', strength: 'Get stronger', fitness: 'General fitness', endurance: 'Improve endurance' })[value] || 'Build muscle';
  }

  function experienceLabel(value) {
    return ({ new: 'Brand new', beginner: 'Beginner', intermediate: 'Intermediate' })[value] || 'Beginner';
  }

  function locationLabel(value) {
    return ({ planet: 'Planet Fitness', full: 'Full gym', home: 'Home gym', minimal: 'Minimal equipment' })[value] || 'Full gym';
  }

  function goalRanges(goal) {
    if (goal === 'strength') return { main: [6, 10], accessory: [8, 12] };
    if (goal === 'endurance') return { main: [12, 15], accessory: [12, 20] };
    if (goal === 'fitness') return { main: [8, 12], accessory: [10, 15] };
    return { main: [8, 12], accessory: [10, 15] };
  }

  function exerciseCountFor(answers) {
    let count = ({ 30: 4, 45: 5, 60: 6, 75: 7 })[answers.duration] || 6;
    if (answers.experience === 'new') count = Math.min(count, 5);
    return count;
  }

  function setsFor(answers, role = 'main') {
    if (answers.experience === 'new') return 2;
    if (answers.experience === 'intermediate') return role === 'main' ? 3 : 3;
    return role === 'main' ? 3 : 2;
  }

  const candidates = {
    chest: {
      planet: ['Chest Press', 'Incline Chest Press Machine', 'Dumbbell Bench Press', 'Push-Up'],
      full: ['Barbell Bench Press', 'Dumbbell Bench Press', 'Chest Press', 'Push-Up'],
      home: ['Dumbbell Bench Press', 'Push-Up', 'Incline Dumbbell Press'],
      minimal: ['Push-Up']
    },
    inclineChest: {
      planet: ['Incline Chest Press Machine', 'Incline Dumbbell Press', 'Chest Press'],
      full: ['Incline Dumbbell Press', 'Incline Barbell Bench Press', 'Chest Press'],
      home: ['Incline Dumbbell Press', 'Push-Up'],
      minimal: ['Push-Up']
    },
    pull: {
      planet: ['Lat Pulldown', 'Close-Grip Lat Pulldown', 'Assisted Pull-Up'],
      full: ['Lat Pulldown', 'Pull-Up', 'Assisted Pull-Up'],
      home: ['Single-Arm Dumbbell Row', 'Dumbbell Row'],
      minimal: ['Back Extension']
    },
    row: {
      planet: ['Seated Row', 'Seated Cable Row', 'Chest-Supported Row'],
      full: ['Seated Row', 'Barbell Row', 'Single-Arm Dumbbell Row'],
      home: ['Single-Arm Dumbbell Row', 'Dumbbell Row', 'Chest-Supported Row'],
      minimal: ['Back Extension']
    },
    shoulder: {
      planet: ['Shoulder Press', 'Machine Shoulder Press', 'Dumbbell Shoulder Press'],
      full: ['Dumbbell Shoulder Press', 'Shoulder Press', 'Arnold Press'],
      home: ['Dumbbell Shoulder Press', 'Arnold Press'],
      minimal: ['Push-Up']
    },
    lateral: {
      planet: ['Lateral Raise', 'Cable Lateral Raise'],
      full: ['Lateral Raise', 'Cable Lateral Raise'],
      home: ['Lateral Raise'],
      minimal: []
    },
    rearDelt: {
      planet: ['Reverse Pec Deck', 'Face Pull', 'Rear Delt Fly'],
      full: ['Rear Delt Fly', 'Face Pull', 'Reverse Pec Deck'],
      home: ['Rear Delt Fly'],
      minimal: []
    },
    squat: {
      planet: ['Leg Press', 'Goblet Squat', 'Smith Machine Squat'],
      full: ['Goblet Squat', 'Barbell Back Squat', 'Leg Press'],
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
      full: ['Hip Thrust', 'Glute Bridge', 'Cable Kickback'],
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
      planet: ['Biceps Curl', 'Cable Curl', 'Dumbbell Curl'],
      full: ['Dumbbell Curl', 'Cable Curl', 'Hammer Curl'],
      home: ['Dumbbell Curl', 'Hammer Curl'],
      minimal: []
    },
    triceps: {
      planet: ['Triceps Pushdown', 'Rope Triceps Pushdown', 'Overhead Cable Triceps Extension'],
      full: ['Triceps Pushdown', 'Dumbbell Triceps Extension', 'Dip'],
      home: ['Dumbbell Triceps Extension', 'Push-Up'],
      minimal: ['Push-Up']
    },
    core: {
      planet: ['Ab Crunch Machine', 'Cable Crunch', 'Dead Bug'],
      full: ['Dead Bug', 'Cable Crunch', 'Hanging Knee Raise'],
      home: ['Dead Bug', 'Sit-Up', 'Russian Twist'],
      minimal: ['Dead Bug', 'Sit-Up', 'Russian Twist']
    }
  };

  const splitKeys = {
    'Full Body A': ['squat', 'chest', 'row', 'hinge', 'shoulder', 'core', 'biceps'],
    'Full Body B': ['lunge', 'inclineChest', 'pull', 'hamstring', 'lateral', 'core', 'triceps'],
    'Full Body C': ['quad', 'chest', 'row', 'glute', 'rearDelt', 'core', 'biceps'],
    'Upper Body A': ['chest', 'pull', 'row', 'shoulder', 'lateral', 'biceps', 'triceps'],
    'Lower Body A': ['squat', 'hamstring', 'quad', 'glute', 'calf', 'core'],
    'Upper Body B': ['inclineChest', 'row', 'pull', 'lateral', 'rearDelt', 'biceps', 'triceps'],
    'Lower Body B': ['quad', 'hinge', 'lunge', 'hamstring', 'calf', 'core'],
    Push: ['chest', 'inclineChest', 'shoulder', 'lateral', 'triceps', 'core'],
    Pull: ['pull', 'row', 'rearDelt', 'biceps', 'hinge', 'core'],
    Legs: ['squat', 'hinge', 'quad', 'hamstring', 'glute', 'calf', 'core'],
    'Upper Body': ['chest', 'row', 'pull', 'shoulder', 'biceps', 'triceps', 'core'],
    'Lower Body': ['squat', 'hinge', 'quad', 'hamstring', 'glute', 'calf', 'core'],
    'Push A': ['chest', 'shoulder', 'inclineChest', 'lateral', 'triceps', 'core'],
    'Pull A': ['pull', 'row', 'rearDelt', 'biceps', 'core'],
    'Legs A': ['squat', 'hamstring', 'quad', 'calf', 'core'],
    'Push B': ['inclineChest', 'shoulder', 'chest', 'lateral', 'triceps', 'core'],
    'Pull B': ['row', 'pull', 'rearDelt', 'biceps', 'core'],
    'Legs B': ['hinge', 'lunge', 'quad', 'glute', 'calf', 'core']
  };

  function catalogByName(name) {
    return exerciseCatalog.find(item => item.name === name) || null;
  }

  function makeExercise(key, answers, index) {
    const names = candidates[key]?.[answers.location] || [];
    const catalog = names.map(catalogByName).find(Boolean);
    if (!catalog) return null;
    const ranges = goalRanges(answers.goal);
    const accessoryKeys = new Set(['lateral', 'rearDelt', 'biceps', 'triceps', 'calf', 'core', 'quad']);
    const role = accessoryKeys.has(key) || index >= 4 ? 'accessory' : 'main';
    return {
      instanceId: `auto-exercise-${createSessionId()}`,
      catalogId: catalog.id,
      name: catalog.name,
      category: catalog.category,
      equipment: catalog.equipment,
      muscle: catalog.primary[0],
      primary: [...catalog.primary],
      assists: [...catalog.assists],
      sets: setsFor(answers, role),
      repRange: [...ranges[role]]
    };
  }

  function fallbackKeysFor(location) {
    if (location === 'minimal') return ['chest', 'squat', 'lunge', 'hinge', 'core', 'calf'];
    if (location === 'home') return ['chest', 'row', 'squat', 'hinge', 'shoulder', 'core', 'biceps', 'triceps'];
    return ['chest', 'pull', 'row', 'squat', 'hinge', 'shoulder', 'core', 'biceps', 'triceps', 'calf'];
  }

  function buildWorkout(name, index, answers, existingRevision = 0) {
    const targetCount = exerciseCountFor(answers);
    const keys = [...(splitKeys[name] || splitKeys['Full Body A']), ...fallbackKeysFor(answers.location)];
    const used = new Set();
    const exercises = [];
    for (const key of keys) {
      const exercise = makeExercise(key, answers, exercises.length);
      if (!exercise || used.has(exercise.name)) continue;
      used.add(exercise.name);
      exercises.push(exercise);
      if (exercises.length >= targetCount) break;
    }
    if (!exercises.length) return null;
    const now = Date.now();
    return sanitizeCustomPlan({
      id: `${AUTO_PLAN_PREFIX}${index + 1}`,
      name,
      revision: existingRevision + 1,
      createdAt: now,
      updatedAt: now + index,
      exercises
    });
  }

  function buildPreview(answers) {
    const names = splitNames(answers.days);
    const existing = new Map(customPlansForCurrentUser().filter(plan => plan.id.startsWith(AUTO_PLAN_PREFIX)).map(plan => [plan.id, plan]));
    const built = names.map((name, index) => buildWorkout(name, index, answers, Number(existing.get(`${AUTO_PLAN_PREFIX}${index + 1}`)?.revision) || 0)).filter(Boolean);
    const selectedDays = DAYS.filter(day => answers.trainingDays.includes(day));
    const schedule = DAYS.map(day => {
      const workoutIndex = selectedDays.indexOf(day);
      if (workoutIndex >= 0 && built[workoutIndex]) return { day, planId: built[workoutIndex].id };
      return { day, rest: 'Recovery day' };
    });
    return { plans: built, schedule };
  }

  function planForId(id) {
    return customPlansForCurrentUser().find(plan => plan.id === id) || null;
  }

  async function applyWeeklyPlan(answers) {
    if (!userProfile) throw new Error('Your profile is not ready yet.');
    const normalized = normalizeAnswers(answers);
    const preview = buildPreview(normalized);
    if (preview.plans.length !== normalized.days) throw new Error('The app could not build every workout. Try a different equipment option.');

    const allCustom = customPlansForCurrentUser();
    const ownPlans = allCustom.filter(plan => !plan.id.startsWith(AUTO_PLAN_PREFIX));
    if (ownPlans.length + preview.plans.length > MAX_CUSTOM_WORKOUTS_ALLOWED) {
      throw new Error(`Your weekly plan needs ${preview.plans.length} workout slots. You already have ${ownPlans.length} custom workouts; delete a few custom workouts first.`);
    }

    const previousPlans = userProfile.customWorkouts;
    const previousSync = profileSyncState(userProfile);
    const now = Date.now();
    const keepIds = new Set(preview.plans.map(plan => plan.id));
    const removedAuto = allCustom.filter(plan => plan.id.startsWith(AUTO_PLAN_PREFIX) && !keepIds.has(plan.id));

    userProfile.customWorkouts = sanitizeCustomPlans([...preview.plans, ...ownPlans]);
    userProfile.profileSync = {
      ...previousSync,
      customWorkoutTombstones: sanitizeCustomWorkoutTombstones([
        ...previousSync.customWorkoutTombstones.filter(item => !keepIds.has(item.id)),
        ...removedAuto.map((plan, index) => ({ id: plan.id, deletedAt: now + index }))
      ])
    };
    markProfileDirty('customWorkout');
    if (!saveUserProfile()) {
      userProfile.customWorkouts = previousPlans;
      userProfile.profileSync = previousSync;
      throw new Error('Your weekly plan could not be saved on this device.');
    }

    const config = normalizeConfig({
      version: 1,
      answers: normalized,
      planIds: preview.plans.map(plan => plan.id),
      schedule: preview.schedule,
      updatedAt: Date.now()
    });
    currentConfig = config;
    writeLocalConfig(config);

    try {
      if (cloudReady) await saveCloudProfile();
      await saveCloudConfig(config);
    } catch {
      // The local plan is complete. Existing sync systems can retry profile data later.
    }

    renderPlans();
    queueRender();
  }

  function weeklyScheduleMarkup(config) {
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    return config.schedule.map(item => {
      const isToday = item.day === today;
      const badge = isToday ? '<span class="today-badge">Today</span>' : '';
      if (!item.planId) {
        return `<article class="program-day rest-day ${isToday ? 'today' : ''}">
          <span class="day-badge">${item.day.slice(0, 3).toUpperCase()}</span>
          <span class="program-day-copy"><small>${item.day}${badge}</small><b>Rest day</b><em>Recovery day</em></span>
          <span class="rest-label">REST</span>
        </article>`;
      }
      const plan = planForId(item.planId);
      if (!plan) return '';
      return `<article class="program-day workout-day weekly-generated-day ${isToday ? 'today' : ''}">
        <span class="day-badge">${item.day.slice(0, 3).toUpperCase()}</span>
        <span class="program-day-copy"><small>${item.day}${badge}</small><b>${escapeHtml(plan.name)}</b><em>${plan.exercises.length} exercises · ${totalSetsFor(plan)} work sets · ${escapeHtml(plan.time)}</em></span>
        <span class="weekly-plan-actions">
          <button type="button" data-weekly-view="${escapeHtml(plan.id)}">View</button>
          <button type="button" data-weekly-edit="${escapeHtml(plan.id)}">Edit</button>
        </span>
      </article>`;
    }).join('');
  }

  function setupCardMarkup() {
    return `<article class="weekly-plan-empty-card">
      <div class="weekly-plan-empty-icon" aria-hidden="true">7</div>
      <div>
        <span>PERSONALIZED SCHEDULE</span>
        <h3>Build your weekly plan</h3>
        <p>Get a workout schedule based on your goal, experience, equipment, available days, and workout length.</p>
      </div>
      <button class="primary" type="button" data-weekly-plan-create>Create my plan</button>
    </article>`;
  }

  function hideGeneratedCustomCards() {
    const list = document.getElementById('customPlanList');
    if (!list) return;
    [...list.querySelectorAll('.custom-plan-card')].forEach(card => {
      const id = card.querySelector('[data-plan-id]')?.dataset.planId || '';
      if (id.startsWith(AUTO_PLAN_PREFIX)) card.remove();
    });
    const section = document.getElementById('customWorkoutLibrary');
    if (section && !list.querySelector('.custom-plan-card')) section.classList.add('hidden');
  }

  function renderWeeklySection() {
    if (!userProfile || hasBuiltInProgram()) return;
    if (!currentConfig) currentConfig = readLocalConfig();

    const section = document.getElementById('accountProgramLibrary');
    const list = document.getElementById('personalPlanList');
    const intro = section?.querySelector('.program-intro');
    const title = document.getElementById('personalProgramLibraryTitle');
    if (!section || !list || !title) return;

    section.classList.remove('hidden');
    title.textContent = 'My weekly plan';

    if (!currentConfig || !currentConfig.planIds.length) {
      if (intro) intro.textContent = 'No schedule yet. Build one in about a minute.';
      if (!list.querySelector('[data-weekly-plan-create]')) {
        list.dataset.weeklyGeneratedSignature = 'empty';
        list.innerHTML = setupCardMarkup();
        list.querySelector('[data-weekly-plan-create]')?.addEventListener('click', () => openWizard());
      }
      document.getElementById('libraryTitle').textContent = 'Premade workouts';
      hideGeneratedCustomCards();
      maybeAutoOpen();
      return;
    }

    const autoPlanState = currentConfig.planIds.map(id => {
      const plan = planForId(id);
      return `${id}:${plan?.revision || 0}:${plan?.updatedAt || 0}`;
    }).join('|');
    const signature = `${currentConfig.updatedAt}:${autoPlanState}`;
    if (list.dataset.weeklyGeneratedSignature === signature && list.querySelector('.weekly-generated-schedule')) {
      hideGeneratedCustomCards();
      return;
    }
    list.dataset.weeklyGeneratedSignature = signature;

    if (intro) intro.textContent = `${currentConfig.answers.days} training days · ${goalLabel(currentConfig.answers.goal)} · ${locationLabel(currentConfig.answers.location)}`;
    list.innerHTML = `<div class="weekly-plan-toolbar">
        <div><span>YOUR PLAN</span><strong>${experienceLabel(currentConfig.answers.experience)} · about ${currentConfig.answers.duration} min/workout</strong></div>
        <button type="button" data-weekly-plan-edit-setup>Edit weekly plan</button>
      </div>
      <div class="program-week weekly-generated-schedule">${weeklyScheduleMarkup(currentConfig)}</div>
      <details class="program-instructions">
        <summary>How to follow this plan</summary>
        <ul>
          <li>Use controlled repetitions and stop sets while your technique is still clean.</li>
          <li>Start conservatively on unfamiliar movements or machines.</li>
          <li>When you reach the top of your rep range comfortably with good form, add a small amount of weight next time.</li>
          <li>Rest days are part of the plan; you do not need to make them up.</li>
        </ul>
      </details>`;
    document.getElementById('libraryTitle').textContent = 'Other premade workouts';

    list.querySelector('[data-weekly-plan-edit-setup]')?.addEventListener('click', () => openWizard(currentConfig.answers));
    list.querySelectorAll('[data-weekly-view]').forEach(button => {
      button.onclick = () => detail(button.dataset.weeklyView);
    });
    list.querySelectorAll('[data-weekly-edit]').forEach(button => {
      button.onclick = () => openWorkoutBuilder(button.dataset.weeklyEdit);
    });
    hideGeneratedCustomCards();
  }

  function dayButtonsMarkup(selected) {
    return DAYS.map(day => `<button type="button" class="weekly-day-choice ${selected.includes(day) ? 'selected' : ''}" data-day-choice="${day}" aria-pressed="${selected.includes(day) ? 'true' : 'false'}">${day.slice(0, 3)}</button>`).join('');
  }

  function ensureWizard() {
    let overlay = document.getElementById('weeklyPlanWizard');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'weeklyPlanWizard';
    overlay.className = 'weekly-plan-wizard hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'weeklyWizardTitle');
    document.body.appendChild(overlay);
    return overlay;
  }

  function closeWizard() {
    const overlay = ensureWizard();
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    document.body.classList.remove('weekly-plan-wizard-open');
    try { localStorage.setItem(seenKey(), '1'); } catch {}
  }

  function openWizard(seed = null) {
    const overlay = ensureWizard();
    wizardDraft = normalizeAnswers(seed || currentConfig?.answers || {
      goal: 'muscle', experience: 'beginner', days: 4, location: 'full', duration: 60
    });
    renderWizardQuestions();
    overlay.classList.remove('hidden');
    document.body.classList.add('weekly-plan-wizard-open');
  }

  function renderWizardQuestions() {
    const overlay = ensureWizard();
    overlay.innerHTML = `<div class="weekly-wizard-sheet">
      <header class="weekly-wizard-header">
        <div><span>LEVEL UP SETUP</span><h2 id="weeklyWizardTitle">Build your weekly plan</h2><p>Answer a few questions and Level Up will build a schedule you can edit later.</p></div>
        <button type="button" class="weekly-wizard-close" aria-label="Close">×</button>
      </header>

      <div class="weekly-wizard-grid">
        <label><span>Main goal</span><select id="weeklyGoal">
          <option value="muscle" ${wizardDraft.goal === 'muscle' ? 'selected' : ''}>Build muscle</option>
          <option value="strength" ${wizardDraft.goal === 'strength' ? 'selected' : ''}>Get stronger</option>
          <option value="fitness" ${wizardDraft.goal === 'fitness' ? 'selected' : ''}>General fitness</option>
          <option value="endurance" ${wizardDraft.goal === 'endurance' ? 'selected' : ''}>Improve endurance</option>
        </select></label>
        <label><span>Experience</span><select id="weeklyExperience">
          <option value="new" ${wizardDraft.experience === 'new' ? 'selected' : ''}>Brand new</option>
          <option value="beginner" ${wizardDraft.experience === 'beginner' ? 'selected' : ''}>Beginner</option>
          <option value="intermediate" ${wizardDraft.experience === 'intermediate' ? 'selected' : ''}>Intermediate</option>
        </select></label>
        <label><span>Training days per week</span><select id="weeklyDays">
          ${[2,3,4,5,6].map(value => `<option value="${value}" ${wizardDraft.days === value ? 'selected' : ''}>${value} days</option>`).join('')}
        </select></label>
        <label><span>Where do you train?</span><select id="weeklyLocation">
          <option value="planet" ${wizardDraft.location === 'planet' ? 'selected' : ''}>Planet Fitness</option>
          <option value="full" ${wizardDraft.location === 'full' ? 'selected' : ''}>Full gym</option>
          <option value="home" ${wizardDraft.location === 'home' ? 'selected' : ''}>Home gym / dumbbells</option>
          <option value="minimal" ${wizardDraft.location === 'minimal' ? 'selected' : ''}>Minimal equipment</option>
        </select></label>
        <label><span>Workout length</span><select id="weeklyDuration">
          ${[30,45,60,75].map(value => `<option value="${value}" ${wizardDraft.duration === value ? 'selected' : ''}>About ${value} minutes</option>`).join('')}
        </select></label>
      </div>

      <section class="weekly-day-picker">
        <div><span>TRAINING DAYS</span><strong>Pick exactly ${wizardDraft.days}</strong></div>
        <div id="weeklyDayChoices" class="weekly-day-choices">${dayButtonsMarkup(wizardDraft.trainingDays)}</div>
        <p id="weeklyDayStatus">Rest days will fill in automatically.</p>
      </section>

      <div class="weekly-wizard-actions">
        <button type="button" class="weekly-secondary" data-weekly-cancel>Cancel</button>
        <button type="button" class="weekly-primary" data-weekly-preview>Preview my plan</button>
      </div>
    </div>`;

    overlay.querySelector('.weekly-wizard-close').onclick = closeWizard;
    overlay.querySelector('[data-weekly-cancel]').onclick = closeWizard;

    const updateAnswers = () => {
      const nextDays = Number(document.getElementById('weeklyDays').value);
      const dayChanged = nextDays !== wizardDraft.days;
      wizardDraft = normalizeAnswers({
        goal: document.getElementById('weeklyGoal').value,
        experience: document.getElementById('weeklyExperience').value,
        days: nextDays,
        location: document.getElementById('weeklyLocation').value,
        duration: Number(document.getElementById('weeklyDuration').value),
        trainingDays: dayChanged ? recommendedDays(nextDays) : wizardDraft.trainingDays
      });
      if (dayChanged) renderWizardQuestions();
    };

    ['weeklyGoal', 'weeklyExperience', 'weeklyLocation', 'weeklyDuration'].forEach(id => {
      document.getElementById(id).onchange = updateAnswers;
    });
    document.getElementById('weeklyDays').onchange = updateAnswers;

    overlay.querySelectorAll('[data-day-choice]').forEach(button => {
      button.onclick = () => {
        const day = button.dataset.dayChoice;
        const selected = new Set(wizardDraft.trainingDays);
        if (selected.has(day)) selected.delete(day);
        else if (selected.size < wizardDraft.days) selected.add(day);
        wizardDraft.trainingDays = DAYS.filter(item => selected.has(item));
        overlay.querySelectorAll('[data-day-choice]').forEach(choice => {
          const on = wizardDraft.trainingDays.includes(choice.dataset.dayChoice);
          choice.classList.toggle('selected', on);
          choice.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        const status = document.getElementById('weeklyDayStatus');
        status.textContent = wizardDraft.trainingDays.length === wizardDraft.days
          ? 'Rest days will fill in automatically.'
          : `Choose ${wizardDraft.days - wizardDraft.trainingDays.length} more day${wizardDraft.days - wizardDraft.trainingDays.length === 1 ? '' : 's'}.`;
      };
    });

    overlay.querySelector('[data-weekly-preview]').onclick = () => {
      updateAnswers();
      if (wizardDraft.trainingDays.length !== wizardDraft.days) {
        document.getElementById('weeklyDayStatus').textContent = `Pick exactly ${wizardDraft.days} training days before continuing.`;
        return;
      }
      renderWizardPreview();
    };
  }

  function renderWizardPreview() {
    const overlay = ensureWizard();
    const preview = buildPreview(wizardDraft);
    const planById = new Map(preview.plans.map(plan => [plan.id, plan]));
    const schedule = preview.schedule.map(item => {
      const plan = planById.get(item.planId);
      return `<article class="weekly-preview-day ${plan ? 'workout' : 'rest'}">
        <span>${item.day.slice(0, 3).toUpperCase()}</span>
        <div><strong>${plan ? escapeHtml(plan.name) : 'Rest day'}</strong><small>${plan ? `${plan.exercises.length} exercises · ${totalSetsFor(plan)} sets · ${escapeHtml(plan.time)}` : 'Recovery'}</small></div>
      </article>`;
    }).join('');

    overlay.innerHTML = `<div class="weekly-wizard-sheet">
      <header class="weekly-wizard-header">
        <div><span>YOUR PLAN</span><h2 id="weeklyWizardTitle">Here’s your week</h2><p>${goalLabel(wizardDraft.goal)} · ${experienceLabel(wizardDraft.experience)} · ${locationLabel(wizardDraft.location)}</p></div>
        <button type="button" class="weekly-wizard-close" aria-label="Close">×</button>
      </header>
      <div class="weekly-preview-list">${schedule}</div>
      <p class="weekly-preview-note">This is a starting plan, not a test of your limits. You can edit individual workouts after saving it.</p>
      <p id="weeklyApplyStatus" class="weekly-apply-status" role="status"></p>
      <div class="weekly-wizard-actions">
        <button type="button" class="weekly-secondary" data-weekly-back>Back</button>
        <button type="button" class="weekly-primary" data-weekly-use>Use this plan</button>
      </div>
    </div>`;

    overlay.querySelector('.weekly-wizard-close').onclick = closeWizard;
    overlay.querySelector('[data-weekly-back]').onclick = renderWizardQuestions;
    overlay.querySelector('[data-weekly-use]').onclick = async event => {
      const button = event.currentTarget;
      const status = document.getElementById('weeklyApplyStatus');
      button.disabled = true;
      status.textContent = 'Building your workouts…';
      try {
        await applyWeeklyPlan(wizardDraft);
        status.textContent = 'Weekly plan saved.';
        setTimeout(closeWizard, 350);
      } catch (error) {
        status.textContent = error?.message || 'Your plan could not be saved.';
        button.disabled = false;
      }
    };
  }

  function maybeAutoOpen() {
    if (autoOpenTimer || hasBuiltInProgram() || currentConfig || !userProfile) return;
    try {
      if (localStorage.getItem(seenKey()) === '1') return;
    } catch {}
    autoOpenTimer = window.setTimeout(() => {
      autoOpenTimer = 0;
      const workout = document.getElementById('workout');
      if (workout && !workout.classList.contains('hidden') && !currentConfig && !hasBuiltInProgram()) openWizard();
    }, 900);
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderWeeklySection();
      hideGeneratedCustomCards();
    });
  }

  function start() {
    currentConfig = readLocalConfig();
    queueRender();
    void loadCloudConfig();

    const root = document.getElementById('appShell') || document.body;
    const observer = new MutationObserver(queueRender);
    observer.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });

    window.addEventListener('storage', event => {
      if (event.key === configKey()) {
        currentConfig = readLocalConfig();
        queueRender();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        currentConfig = readLocalConfig();
        void loadCloudConfig();
        queueRender();
      }
    });

    let attempts = 0;
    const readiness = window.setInterval(() => {
      attempts += 1;
      if (userProfile) {
        currentConfig = readLocalConfig();
        void loadCloudConfig();
        queueRender();
        if (attempts > 12) clearInterval(readiness);
      } else if (attempts > 30) clearInterval(readiness);
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
