(() => {
  const AUTO_PREFIX = 'custom-auto-weekly-';
  const TARGET_CALF = 'Calf Extension (Machine)';
  const RETIRED_CORE = /(?:leg raise|knee raise)/i;
  let applying = false;

  function catalog() {
    try { return Array.isArray(exerciseCatalog) ? exerciseCatalog : []; }
    catch { return []; }
  }

  function findExercise(name) {
    return catalog().find(item => String(item?.name || '').toLowerCase() === String(name).toLowerCase()) || null;
  }

  function ensureCalfExtension() {
    if (findExercise(TARGET_CALF)) return findExercise(TARGET_CALF);
    const source = findExercise('Seated Calf Raise') || findExercise('Calf Raise');
    if (!source) return null;
    const item = {
      ...source,
      id: 'exercise-calf-extension-machine',
      name: TARGET_CALF,
      category: 'Legs',
      equipment: 'Machine',
      primary: ['Calves'],
      assists: []
    };
    try { exerciseCatalog.push(item); } catch { return null; }
    return item;
  }

  function cloneExercise(name, sets, repRange, note = '') {
    const item = findExercise(name);
    if (!item) return null;
    const uid = (() => {
      try { return typeof createSessionId === 'function' ? createSessionId() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
      catch { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
    })();
    return {
      instanceId: `preference-${uid}`,
      catalogId: item.id,
      name: item.name,
      category: item.category,
      equipment: item.equipment,
      muscle: item.primary?.[0] || '',
      primary: [...(item.primary || [])],
      assists: [...(item.assists || [])],
      sets,
      repRange: [...repRange],
      note
    };
  }

  function replaceExercise(exercise) {
    const name = String(exercise?.name || '');
    let replacement = '';
    if (/^(?:seated )?calf raise$/i.test(name)) replacement = TARGET_CALF;
    else if (RETIRED_CORE.test(name)) replacement = findExercise('Ab Crunch Machine') ? 'Ab Crunch Machine' : 'Dead Bug';
    if (!replacement) return exercise;

    const item = findExercise(replacement);
    if (!item) return exercise;
    return {
      ...exercise,
      catalogId: item.id,
      name: item.name,
      category: item.category,
      equipment: item.equipment,
      muscle: item.primary?.[0] || exercise.muscle || '',
      primary: [...(item.primary || [])],
      assists: [...(item.assists || [])],
      note: replacement === TARGET_CALF
        ? 'Use the calf-extension machine. Move through a comfortable range and keep the reps controlled.'
        : 'Use a controlled core movement that does not bother your knees.'
    };
  }

  function legDayExercises() {
    return [
      cloneExercise('Leg Press', 3, [8, 12], 'Controlled reps. Keep your feet planted and do not lock your knees.'),
      cloneExercise('Seated Leg Curl', 3, [10, 15], 'Keep your hips against the pad and control the return.'),
      cloneExercise('Leg Extension', 2, [10, 15], 'Use a comfortable range. Stop if the movement causes knee pain.'),
      cloneExercise('Hip Abductor Machine', 2, [10, 15], 'Controlled reps for the side glutes.'),
      cloneExercise('Glute Drive Machine', 2, [10, 15], 'Keep your torso stable and drive through the hips.'),
      cloneExercise(TARGET_CALF, 2, [10, 15], 'Use the calf-extension machine and keep each rep controlled.')
    ].filter(Boolean);
  }

  function isAutoPlan(plan) {
    return String(plan?.id || '').startsWith(AUTO_PREFIX);
  }

  function isPrimaryLegDay(plan, autoIndex) {
    const name = String(plan?.name || '').toLowerCase();
    if (name === 'lower body a' || name === 'legs' || name === 'legs a') return true;
    /* Four-day generated programs use the second auto slot for Lower Body A. */
    return autoIndex === 1 && /lower|leg/.test(name);
  }

  function normalizePlan(plan, autoIndex) {
    if (!isAutoPlan(plan)) return plan;
    const exercises = Array.isArray(plan.exercises) ? plan.exercises.map(replaceExercise) : [];
    let next = { ...plan, exercises };

    if (isPrimaryLegDay(plan, autoIndex)) {
      const focused = legDayExercises();
      if (focused.length >= 5) {
        next = {
          ...next,
          name: 'Leg Day',
          type: 'Legs',
          time: plan.time || '45-60 min',
          exercises: focused
        };
      }
    }

    const before = JSON.stringify({ name: plan.name, type: plan.type, exercises: plan.exercises });
    const after = JSON.stringify({ name: next.name, type: next.type, exercises: next.exercises });
    if (before !== after) {
      next.revision = (Number(plan.revision) || 0) + 1;
      next.updatedAt = Date.now();
    }
    return next;
  }

  async function apply() {
    if (applying) return;
    applying = true;
    try {
      ensureCalfExtension();
      if (typeof userProfile === 'undefined' || !userProfile) return;
      const all = Array.isArray(userProfile.customWorkouts) ? userProfile.customWorkouts : [];
      if (!all.some(isAutoPlan)) return;

      let autoIndex = -1;
      const next = all.map(plan => {
        if (!isAutoPlan(plan)) return plan;
        autoIndex += 1;
        return normalizePlan(plan, autoIndex);
      });
      if (JSON.stringify(all) === JSON.stringify(next)) return;

      userProfile.customWorkouts = typeof sanitizeCustomPlans === 'function' ? sanitizeCustomPlans(next) : next;
      try { if (typeof markProfileDirty === 'function') markProfileDirty('customWorkout'); } catch {}
      try { if (typeof saveUserProfile === 'function') saveUserProfile(); } catch {}
      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      try { if (typeof renderHome === 'function') renderHome(); } catch {}
      try {
        if (typeof cloudReady !== 'undefined' && cloudReady && typeof saveCloudProfile === 'function') await saveCloudProfile();
      } catch {}
    } finally {
      applying = false;
    }
  }

  function start() {
    ensureCalfExtension();
    void apply();
    window.setTimeout(() => void apply(), 900);
    window.setTimeout(() => void apply(), 2400);
  }

  window.LevelUpTrainingPreferences = { apply, ensureCalfExtension };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
