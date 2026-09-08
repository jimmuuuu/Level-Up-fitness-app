(() => {
  const CONFIG_PREFIX = 'levelUpFitnessWeeklyPlan:';
  const SEEN_PREFIX = 'levelUpFitnessWeeklyPlanOnboardingSeen:';
  const AUTO_PLAN_PREFIX = 'custom-auto-weekly-';
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const MAX_CUSTOM_WORKOUTS_ALLOWED = 12;
  const QUESTION_COUNT = 6;

  let currentConfig = null;
  let cloudLoadedFor = '';
  let renderQueued = false;
  let wizardDraft = null;
  let wizardStep = 0;
  let autoOpenTimer = 0;

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  function accountId() {
    return cloudUser?.id || userProfile?.accountKey || userProfile?.email?.trim().toLowerCase() || 'local';
  }

  function configKey() { return `${CONFIG_PREFIX}${accountId()}`; }
  function seenKey() { return `${SEEN_PREFIX}${accountId()}`; }

  function readLocalConfig() {
    try {
      return normalizeConfig(JSON.parse(localStorage.getItem(configKey()) || 'null'));
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
      return typeof personalProgramForCurrentUser === 'function' && Boolean(personalProgramForCurrentUser());
    } catch {
      return false;
    }
  }

  function recommendedDays(count) {
    const map = {
      1: ['Wednesday'],
      2: ['Monday', 'Thursday'],
      3: ['Monday', 'Wednesday', 'Friday'],
      4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      5: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
      6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      7: [...DAYS]
    };
    return [...(map[count] || map[4])];
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
    return [...(map[count] || map[4])];
  }

  function normalizeAnswers(value) {
    const goal = ['muscle', 'strength', 'fitness', 'endurance'].includes(value?.goal) ? value.goal : 'muscle';
    const experience = ['new', 'beginner', 'intermediate'].includes(value?.experience) ? value.experience : 'beginner';
    const days = Math.min(7, Math.max(1, Number(value?.days) || 4));
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
    return { version: 1, answers, planIds, schedule, updatedAt: Number(value.updatedAt) || Date.now() };
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
    const { error } = await client.from('profiles').update({
      weekly_plan: config,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
  }

  function goalLabel(value) {
    return ({ muscle: 'Build muscle', strength: 'Get stronger', fitness: 'General fitness', endurance: 'Improve endurance' })[value] || 'Build muscle';
  }

  function experienceLabel(value) {
    return ({ new: 'Brand new', beginner: 'Beginner', intermediate: 'Intermediate' })[value] || 'Beginner';
  }

  function locationLabel(value) {
    return ({ planet: 'Planet Fitness', full: 'Full gym', home: 'Home gym / dumbbells', minimal: 'Minimal equipment' })[value] || 'Full gym';
  }

  function goalRanges(goal) {
    if (goal === 'strength') return { main: [6, 10], accessory: [8, 12] };
    if (goal === 'endurance') return { main: [12, 15], accessory: [12, 20] };
    if (goal === 'fitness') return { main: [8, 12], accessory: [10, 15] };
    return { main: [8, 12], accessory: [10, 15] };
  }

  function exerciseCountFor(answers, light = false) {
    if (light) return Math.min(4, ({ 30: 3, 45: 4, 60: 4, 75: 4 })[answers.duration] || 4);
    let count = ({ 30: 4, 45: 5, 60: 6, 75: 7 })[answers.duration] || 6;
    if (answers.experience === 'new') count = Math.min(count, 5);
    return count;
  }

  function setsFor(answers, role = 'main', light = false) {
    if (light) return 2;
    if (answers.experience === 'new') return 2;
    if (answers.experience === 'intermediate') return 3;
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
    'Legs B': ['hinge', 'lunge', 'quad', 'glute', 'calf', 'core'],
    'Recovery & Core': ['core', 'rearDelt', 'calf', 'glute']
  };

  function catalogByName(name) {
    return exerciseCatalog.find(item => item.name === name) || null;
  }

  function makeExercise(key, answers, index, light = false) {
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
      sets: setsFor(answers, role, light),
      repRange: light ? [10, 15] : [...ranges[role]]
    };
  }

  function fallbackKeysFor(location) {
    if (location === 'minimal') return ['chest', 'squat', 'lunge', 'hinge', 'core', 'calf'];
    if (location === 'home') return ['chest', 'row', 'squat', 'hinge', 'shoulder', 'core', 'biceps', 'triceps'];
    return ['chest', 'pull', 'row', 'squat', 'hinge', 'shoulder', 'core', 'biceps', 'triceps', 'calf'];
  }

  function buildWorkout(name, index, answers, existingRevision = 0) {
    const light = name === 'Recovery & Core';
    const targetCount = exerciseCountFor(answers, light);
    const keys = [...(splitKeys[name] || splitKeys['Full Body A']), ...(light ? [] : fallbackKeysFor(answers.location))];
    const used = new Set();
    const exercises = [];
    for (const key of keys) {
      const exercise = makeExercise(key, answers, exercises.length, light);
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
    const existing = new Map(customPlansForCurrentUser()
      .filter(plan => plan.id.startsWith(AUTO_PLAN_PREFIX))
      .map(plan => [plan.id, plan]));
    const built = names.map((name, index) => buildWorkout(
      name,
      index,
      answers,
      Number(existing.get(`${AUTO_PLAN_PREFIX}${index + 1}`)?.revision) || 0
    )).filter(Boolean);
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
      // Local plan is already usable; normal profile sync can retry later.
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
        <p>Answer one question at a time and get a schedule based on your goals, experience, equipment, available days, and workout length.</p>
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

    if (intro) intro.textContent = `${currentConfig.answers.days} training day${currentConfig.answers.days === 1 ? '' : 's'} · ${goalLabel(currentConfig.answers.goal)} · ${locationLabel(currentConfig.answers.location)}`;
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
          <li>If you train most or all days of the week, keep some sessions lighter and take recovery when you need it.</li>
        </ul>
      </details>`;
    document.getElementById('libraryTitle').textContent = 'Other premade workouts';

    list.querySelector('[data-weekly-plan-edit-setup]')?.addEventListener('click', () => openWizard(currentConfig.answers));
    list.querySelectorAll('[data-weekly-view]').forEach(button => { button.onclick = () => detail(button.dataset.weeklyView); });
    list.querySelectorAll('[data-weekly-edit]').forEach(button => { button.onclick = () => openWorkoutBuilder(button.dataset.weeklyEdit); });
    hideGeneratedCustomCards();
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
    wizardDraft = normalizeAnswers(seed || currentConfig?.answers || {
      goal: 'muscle', experience: 'beginner', days: 4, location: 'full', duration: 60
    });
    wizardStep = 0;
    const overlay = ensureWizard();
    overlay.classList.remove('hidden');
    document.body.classList.add('weekly-plan-wizard-open');
    renderWizardStep();
  }

  function progressMarkup(step) {
    return Array.from({ length: QUESTION_COUNT }, (_, index) => `<i class="${index < step ? 'done' : index === step ? 'active' : ''}"></i>`).join('');
  }

  function shellMarkup(inner, { preview = false } = {}) {
    return `<div class="weekly-slide-shell">
      <div class="weekly-slide-topbar">
        <button type="button" class="weekly-slide-back" ${wizardStep === 0 && !preview ? 'disabled' : ''} aria-label="Back">←</button>
        <div class="weekly-slide-progress" aria-label="Setup progress">${progressMarkup(preview ? QUESTION_COUNT : wizardStep)}</div>
        <button type="button" class="weekly-slide-close" aria-label="Close">×</button>
      </div>
      ${inner}
    </div>`;
  }

  function choiceButton(value, title, subtitle, selected = false) {
    return `<button type="button" class="weekly-choice ${selected ? 'selected' : ''}" data-weekly-choice="${escapeHtml(value)}">
      <span><b>${escapeHtml(title)}</b>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ''}</span>
      <span class="weekly-choice-mark" aria-hidden="true">✓</span>
    </button>`;
  }

  function nextStep() {
    wizardStep = Math.min(QUESTION_COUNT, wizardStep + 1);
    renderWizardStep();
  }

  function previousStep() {
    if (wizardStep <= 0) return;
    wizardStep -= 1;
    renderWizardStep();
  }

  function singleChoiceScreen({ kicker, title, copy, choices, field }) {
    const overlay = ensureWizard();
    const buttons = choices.map(item => choiceButton(item.value, item.title, item.subtitle, wizardDraft[field] === item.value)).join('');
    overlay.innerHTML = shellMarkup(`<main class="weekly-slide-content">
      <span class="weekly-slide-kicker">${escapeHtml(kicker)}</span>
      <h2 id="weeklyWizardTitle">${escapeHtml(title)}</h2>
      <p>${escapeHtml(copy)}</p>
      <div class="weekly-choice-list">${buttons}</div>
    </main>`);
    bindShell();
    overlay.querySelectorAll('[data-weekly-choice]').forEach(button => {
      button.onclick = () => {
        const raw = button.dataset.weeklyChoice;
        wizardDraft[field] = field === 'duration' || field === 'days' ? Number(raw) : raw;
        overlay.querySelectorAll('[data-weekly-choice]').forEach(item => item.classList.toggle('selected', item === button));
        if (field === 'days') wizardDraft.trainingDays = recommendedDays(wizardDraft.days);
        window.setTimeout(nextStep, 130);
      };
    });
  }

  function renderGoalStep() {
    singleChoiceScreen({
      kicker: '1 OF 6 · YOUR GOAL',
      title: 'What are you training for?',
      copy: 'This changes the exercise balance and rep ranges in your plan.',
      field: 'goal',
      choices: [
        { value: 'muscle', title: 'Build muscle', subtitle: 'Balanced strength and muscle-building work' },
        { value: 'strength', title: 'Get stronger', subtitle: 'More focus on your main movements' },
        { value: 'fitness', title: 'General fitness', subtitle: 'A balanced mix for overall training' },
        { value: 'endurance', title: 'Improve endurance', subtitle: 'More moderate-load, higher-rep work' }
      ]
    });
  }

  function renderExperienceStep() {
    singleChoiceScreen({
      kicker: '2 OF 6 · EXPERIENCE',
      title: 'How experienced are you?',
      copy: 'We use this to keep the starting workload appropriate and easy to follow.',
      field: 'experience',
      choices: [
        { value: 'new', title: 'Brand new', subtitle: 'I am just getting started' },
        { value: 'beginner', title: 'Beginner', subtitle: 'I know the basics but I am still learning' },
        { value: 'intermediate', title: 'Intermediate', subtitle: 'I have been training consistently' }
      ]
    });
  }

  function renderDaysCountStep() {
    const overlay = ensureWizard();
    const choices = [1,2,3,4,5,6,7].map(value => `<button type="button" class="weekly-choice ${wizardDraft.days === value ? 'selected' : ''}" data-weekly-choice="${value}">
      <span><b>${value}</b><small>${value === 1 ? 'day' : 'days'}</small></span>
    </button>`).join('');
    overlay.innerHTML = shellMarkup(`<main class="weekly-slide-content">
      <span class="weekly-slide-kicker">3 OF 6 · FREQUENCY</span>
      <h2 id="weeklyWizardTitle">How many days do you want to train?</h2>
      <p>You can choose anywhere from 1 to 7. If you choose most or all days, the plan keeps one of the sessions lighter.</p>
      <div class="weekly-number-grid">${choices}</div>
    </main>`);
    bindShell();
    overlay.querySelectorAll('[data-weekly-choice]').forEach(button => {
      button.onclick = () => {
        wizardDraft.days = Number(button.dataset.weeklyChoice);
        wizardDraft.trainingDays = recommendedDays(wizardDraft.days);
        overlay.querySelectorAll('[data-weekly-choice]').forEach(item => item.classList.toggle('selected', item === button));
        window.setTimeout(nextStep, 130);
      };
    });
  }

  function renderTrainingDaysStep() {
    const overlay = ensureWizard();
    const buttons = DAYS.map(day => choiceButton(day, day, '', wizardDraft.trainingDays.includes(day))).join('');
    overlay.innerHTML = shellMarkup(`<main class="weekly-slide-content">
      <span class="weekly-slide-kicker">4 OF 6 · YOUR WEEK</span>
      <h2 id="weeklyWizardTitle">Which days work for you?</h2>
      <p>Choose exactly ${wizardDraft.days} day${wizardDraft.days === 1 ? '' : 's'}. You can change this later.</p>
      <div class="weekly-day-grid">${buttons}</div>
      <p id="weeklyDayStatus" class="weekly-slide-status"></p>
    </main>
    <div class="weekly-slide-footer">
      <button type="button" class="weekly-slide-primary" data-weekly-continue>Continue</button>
    </div>`);
    bindShell();

    const update = () => {
      overlay.querySelectorAll('[data-weekly-choice]').forEach(button => {
        const on = wizardDraft.trainingDays.includes(button.dataset.weeklyChoice);
        button.classList.toggle('selected', on);
      });
      const remaining = wizardDraft.days - wizardDraft.trainingDays.length;
      const status = document.getElementById('weeklyDayStatus');
      status.textContent = remaining > 0 ? `Choose ${remaining} more day${remaining === 1 ? '' : 's'}.` : 'Your training days are set.';
      overlay.querySelector('[data-weekly-continue]').disabled = remaining !== 0;
    };

    overlay.querySelectorAll('[data-weekly-choice]').forEach(button => {
      button.onclick = () => {
        const day = button.dataset.weeklyChoice;
        const selected = new Set(wizardDraft.trainingDays);
        if (selected.has(day)) selected.delete(day);
        else if (selected.size < wizardDraft.days) selected.add(day);
        wizardDraft.trainingDays = DAYS.filter(item => selected.has(item));
        update();
      };
    });
    overlay.querySelector('[data-weekly-continue]').onclick = nextStep;
    update();
  }

  function renderLocationStep() {
    singleChoiceScreen({
      kicker: '5 OF 6 · EQUIPMENT',
      title: 'Where do you usually train?',
      copy: 'We only build workouts around equipment you are likely to have access to.',
      field: 'location',
      choices: [
        { value: 'planet', title: 'Planet Fitness', subtitle: 'Machines, cables, Smith machines and dumbbells' },
        { value: 'full', title: 'Full gym', subtitle: 'Barbells, machines, cables and free weights' },
        { value: 'home', title: 'Home gym / dumbbells', subtitle: 'Dumbbells and basic home equipment' },
        { value: 'minimal', title: 'Minimal equipment', subtitle: 'Mostly bodyweight and simple movements' }
      ]
    });
  }

  function renderDurationStep() {
    singleChoiceScreen({
      kicker: '6 OF 6 · WORKOUT LENGTH',
      title: 'How long should each workout be?',
      copy: 'Shorter sessions use fewer exercises; longer sessions include more work.',
      field: 'duration',
      choices: [
        { value: 30, title: 'About 30 minutes', subtitle: 'Quick and focused' },
        { value: 45, title: 'About 45 minutes', subtitle: 'A compact full session' },
        { value: 60, title: 'About 60 minutes', subtitle: 'Balanced amount of training' },
        { value: 75, title: 'About 75 minutes', subtitle: 'More exercises and accessories' }
      ]
    });
  }

  function bindShell() {
    const overlay = ensureWizard();
    overlay.querySelector('.weekly-slide-close')?.addEventListener('click', closeWizard);
    overlay.querySelector('.weekly-slide-back')?.addEventListener('click', previousStep);
  }

  function renderWizardStep() {
    wizardDraft = normalizeAnswers(wizardDraft || {});
    if (wizardStep === 0) return renderGoalStep();
    if (wizardStep === 1) return renderExperienceStep();
    if (wizardStep === 2) return renderDaysCountStep();
    if (wizardStep === 3) return renderTrainingDaysStep();
    if (wizardStep === 4) return renderLocationStep();
    if (wizardStep === 5) return renderDurationStep();
    return renderWizardPreview();
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

    overlay.innerHTML = shellMarkup(`<main class="weekly-slide-content weekly-preview-scroll">
      <span class="weekly-slide-kicker">YOUR WEEKLY PLAN</span>
      <h2 id="weeklyWizardTitle">Your week is ready.</h2>
      <p>Review it before saving. Every workout can still be edited later.</p>
      <section class="weekly-preview-summary">
        <span>PERSONALIZED FOR YOU</span>
        <strong>${wizardDraft.days} training day${wizardDraft.days === 1 ? '' : 's'} · about ${wizardDraft.duration} min each</strong>
        <p>${goalLabel(wizardDraft.goal)} · ${experienceLabel(wizardDraft.experience)} · ${locationLabel(wizardDraft.location)}</p>
      </section>
      <div class="weekly-preview-list">${schedule}</div>
      <p class="weekly-preview-note">This is a starting plan, not a test of your limits. If you schedule most or all days, keep some sessions light and take recovery when needed.</p>
      <p id="weeklyApplyStatus" class="weekly-slide-status" role="status"></p>
    </main>
    <div class="weekly-slide-footer">
      <button type="button" class="weekly-slide-secondary" data-weekly-edit-answers>Edit answers</button>
      <button type="button" class="weekly-slide-primary" data-weekly-use>Use this plan</button>
    </div>`, { preview: true });

    overlay.querySelector('.weekly-slide-close').onclick = closeWizard;
    overlay.querySelector('.weekly-slide-back').onclick = () => { wizardStep = QUESTION_COUNT - 1; renderWizardStep(); };
    overlay.querySelector('[data-weekly-edit-answers]').onclick = () => { wizardStep = 0; renderWizardStep(); };
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
    }, 700);
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
      } else if (attempts > 30) {
        clearInterval(readiness);
      }
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();