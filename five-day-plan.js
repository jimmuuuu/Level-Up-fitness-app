(() => {
  const TARGET_USERS = new Set([
    '7157999e-613b-4a48-92a7-42960d0cdca8',
    '981bc688-a50f-4eb3-b9d7-2145acb2b6f5'
  ]);
  const CONFIG_PREFIX = 'levelUpFitnessWeeklyPlan:';
  const PERSONALIZATION_MARK = 'levelUpFitnessWeeklyPersonalizationV3:';
  const VERSION_MARK = 'levelUpFitnessFiveDayPlanV1:';
  const TRAINING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'];
  const AUTO_IDS = [1, 2, 3, 4, 5].map(index => `custom-auto-weekly-${index}`);
  let applying = false;

  async function authUser() {
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data?.session?.user || null;
    } catch { return null; }
  }

  function catalogItem(name) {
    try {
      return Array.isArray(exerciseCatalog)
        ? exerciseCatalog.find(item => String(item?.name || '').toLowerCase() === String(name).toLowerCase()) || null
        : null;
    } catch { return null; }
  }

  function makeExercise(name, sets, repRange, note = '', primary = [], assists = [], equipment = 'Machine') {
    const item = catalogItem(name);
    if (item) {
      try {
        if (typeof builderExerciseFromCatalog === 'function') {
          const made = builderExerciseFromCatalog(item);
          if (made) return { ...made, sets, repRange, note: note || made.note || '' };
        }
      } catch {}
      return {
        instanceId: `five-day-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        catalogId: item.id,
        name: item.name,
        category: item.category,
        equipment: item.equipment,
        muscle: item.primary?.[0] || primary[0] || '',
        primary: [...(item.primary || primary)],
        assists: [...(item.assists || assists)],
        sets,
        repRange,
        note
      };
    }
    return {
      instanceId: `five-day-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      catalogId: `five-day-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
      name,
      category: primary.includes('Core') ? 'Core' : 'Legs',
      equipment,
      muscle: primary[0] || '',
      primary,
      assists,
      sets,
      repRange,
      note
    };
  }

  function plan(id, name, day, type, exercises, icon = 'machine') {
    const now = Date.now();
    return {
      id,
      name,
      day,
      type,
      time: '45-60 min',
      icon,
      personal: true,
      revision: 1,
      createdAt: now,
      updatedAt: now,
      exercises
    };
  }

  function fivePlans() {
    return [
      plan('custom-auto-weekly-1', 'Push', 'Monday', 'Chest, shoulders & triceps', [
        makeExercise('Chest Press', 3, [8, 12]),
        makeExercise('Incline Dumbbell Press', 3, [8, 12]),
        makeExercise('Shoulder Press', 2, [8, 12]),
        makeExercise('Lateral Raise', 2, [10, 15]),
        makeExercise('Triceps Pushdown', 2, [10, 15]),
        makeExercise('Ab Crunch Machine', 2, [10, 15])
      ], 'bench-press'),
      plan('custom-auto-weekly-2', 'Pull', 'Tuesday', 'Back & biceps', [
        makeExercise('Lat Pulldown', 3, [8, 12]),
        makeExercise('Seated Row', 3, [8, 12]),
        makeExercise('Chest-Supported Row', 2, [8, 12]),
        makeExercise('Reverse Pec Deck', 2, [10, 15]),
        makeExercise('Cable Curl', 2, [10, 15]),
        makeExercise('Hammer Curl', 2, [10, 15])
      ], 'lat-pulldown'),
      plan('custom-auto-weekly-3', 'Leg Day', 'Wednesday', 'Legs', [
        makeExercise('Leg Press', 3, [8, 12], 'Controlled reps. Keep your feet planted and avoid locking your knees.'),
        makeExercise('Leg Extension', 3, [10, 15], 'Use a comfortable range and stop if it causes knee pain.'),
        makeExercise('Seated Leg Curl', 3, [10, 15]),
        makeExercise('Smith Machine Squat', 2, [8, 12], 'Use a comfortable load and controlled depth.'),
        makeExercise('Hip Abductor Machine', 2, [12, 15]),
        makeExercise('Calf Extension', 3, [10, 15], 'Use the calf-extension machine and control every rep.', ['Calves'], [], 'Machine')
      ], 'machine'),
      plan('custom-auto-weekly-4', 'Upper Body', 'Friday', 'Upper body', [
        makeExercise('Chest Press', 3, [8, 12]),
        makeExercise('Lat Pulldown', 3, [8, 12]),
        makeExercise('Seated Row', 2, [8, 12]),
        makeExercise('Shoulder Press', 2, [8, 12]),
        makeExercise('Biceps Curl', 2, [10, 15]),
        makeExercise('Triceps Pushdown', 2, [10, 15])
      ], 'upper-body-tower'),
      plan('custom-auto-weekly-5', 'Lower Body', 'Saturday', 'Legs & glutes', [
        makeExercise('Leg Press', 3, [10, 12]),
        makeExercise('Dumbbell Romanian Deadlift', 3, [8, 12]),
        makeExercise('Seated Leg Curl', 2, [10, 15]),
        makeExercise('Leg Extension', 2, [10, 15]),
        makeExercise('Hip Abductor Machine', 2, [12, 15]),
        makeExercise('Calf Extension', 3, [10, 15], 'Use the calf-extension machine and control every rep.', ['Calves'], [], 'Machine')
      ], 'barbell')
    ];
  }

  function expectedPlan(plans) {
    const auto = plans.filter(item => AUTO_IDS.includes(String(item?.id || '')));
    if (auto.length !== 5) return false;
    const names = auto.map(item => String(item?.name || ''));
    if (!names.includes('Leg Day') || !names.includes('Lower Body')) return false;
    return auto.every(item => (item.exercises || []).every(exercise => !/^(calf raise|seated calf raise)$/i.test(String(exercise?.name || '')) && !/leg raise|knee raise/i.test(String(exercise?.name || ''))));
  }

  function updateLocalConfig(userId) {
    const key = `${CONFIG_PREFIX}${userId}`;
    let existing = null;
    try { existing = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
    const answers = {
      ...(existing?.answers || {}),
      days: 5,
      trainingDays: [...TRAINING_DAYS]
    };
    const config = {
      version: 1,
      answers,
      planIds: [...AUTO_IDS],
      schedule: [
        { day: 'Monday', planId: AUTO_IDS[0], rest: '' },
        { day: 'Tuesday', planId: AUTO_IDS[1], rest: '' },
        { day: 'Wednesday', planId: AUTO_IDS[2], rest: '' },
        { day: 'Thursday', planId: '', rest: 'Rest or easy walking.' },
        { day: 'Friday', planId: AUTO_IDS[3], rest: '' },
        { day: 'Saturday', planId: AUTO_IDS[4], rest: '' },
        { day: 'Sunday', planId: '', rest: 'Rest and recover.' }
      ],
      updatedAt: Date.now()
    };
    try {
      localStorage.setItem(key, JSON.stringify(config));
      localStorage.removeItem(`${PERSONALIZATION_MARK}${userId}`);
    } catch {}
    return config;
  }

  async function saveConfigCloud(userId, config) {
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;
      await client.from('profiles').update({ weekly_plan: config, updated_at: new Date().toISOString() }).eq('id', userId);
    } catch {}
  }

  async function apply() {
    if (applying) return;
    applying = true;
    try {
      const user = await authUser();
      const userId = String(user?.id || '');
      if (!TARGET_USERS.has(userId)) return;
      if (typeof userProfile === 'undefined' || !userProfile) return;

      const config = updateLocalConfig(userId);
      void saveConfigCloud(userId, config);

      const existing = Array.isArray(userProfile.customWorkouts) ? userProfile.customWorkouts : [];
      if (expectedPlan(existing)) {
        try { localStorage.setItem(`${VERSION_MARK}${userId}`, '1'); } catch {}
        return;
      }

      const keep = existing.filter(item => !String(item?.id || '').startsWith('custom-auto-weekly-'));
      const next = [...keep, ...fivePlans()];
      try { userProfile.customWorkouts = typeof sanitizeCustomPlans === 'function' ? sanitizeCustomPlans(next) : next; }
      catch { userProfile.customWorkouts = next; }

      try { if (typeof markProfileDirty === 'function') markProfileDirty('customWorkout'); } catch {}
      try { if (typeof saveUserProfile === 'function') saveUserProfile(); } catch {}
      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      try { if (typeof renderHome === 'function') renderHome(); } catch {}
      try { if (typeof saveCloudProfile === 'function') await saveCloudProfile(); } catch {}
      try { localStorage.setItem(`${VERSION_MARK}${userId}`, '1'); } catch {}
    } finally {
      applying = false;
    }
  }

  function start() {
    [0, 500, 1500, 3200, 6000].forEach(delay => setTimeout(() => void apply(), delay));
    window.addEventListener('pageshow', () => setTimeout(() => void apply(), 250));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') setTimeout(() => void apply(), 200);
    });
  }

  window.LevelUpFiveDayPlan = { apply };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
