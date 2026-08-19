(() => {
  const XP_PER_WORKOUT = 100;
  const XP_PER_SET = 5;
  const SET_XP_CAP_PER_WORKOUT = 25;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[ch]);

  function history() {
    try { if (Array.isArray(workoutHistory)) return workoutHistory; } catch {}
    try {
      const parsed = JSON.parse(localStorage.getItem('levelUpFitnessWorkoutHistory') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function stamp(session) {
    const raw = session?.completedAt ?? session?.completed_at ?? 0;
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
    const parsed = Date.parse(String(raw || ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function startOfToday() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }

  function weekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }

  function accountId() {
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return String(cloudUser.id);
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
      if (typeof userProfile !== 'undefined' && userProfile?.email) return String(userProfile.email).trim().toLowerCase();
    } catch {}
    return 'local';
  }

  function weeklyConfig() {
    try {
      const parsed = JSON.parse(localStorage.getItem(`levelUpFitnessWeeklyPlan:${accountId()}`) || 'null');
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch { return null; }
  }

  function plannedDays() {
    const fallback = ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'];
    const config = weeklyConfig();
    const days = Array.isArray(config?.answers?.trainingDays) ? config.answers.trainingDays.filter(Boolean) : [];
    return days.length ? days : fallback;
  }

  function stats() {
    const all = history().filter(session => String(session?.status || 'completed') === 'completed' && stamp(session));
    let totalXp = 0;
    all.forEach(session => {
      const setCount = (session?.logs || []).filter(log => Number(log?.reps) > 0).length;
      totalXp += XP_PER_WORKOUT + Math.min(setCount, SET_XP_CAP_PER_WORKOUT) * XP_PER_SET;
    });
    const weekly = all.filter(session => stamp(session) >= weekStart());
    const weeklySets = weekly.reduce((sum, session) => sum + (session?.logs || []).filter(log => Number(log?.reps) > 0).length, 0);
    const days = plannedDays();
    const plannedTarget = Math.max(1, days.length);
    const cappedWeekly = Math.min(weekly.length, plannedTarget);
    if (cappedWeekly >= plannedTarget) totalXp += 100;
    const level = Math.floor(totalXp / 1000) + 1;
    const levelXp = totalXp % 1000;
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const plannedToday = days.includes(dayName);
    const todayKey = new Date().toDateString();
    const todaySessions = all.filter(session => new Date(stamp(session)).toDateString() === todayKey);
    const todaySets = todaySessions.reduce((sum, session) => sum + (session?.logs || []).filter(log => Number(log?.reps) > 0).length, 0);
    return { totalXp, level, levelXp, weeklyWorkouts: weekly.length, weeklySets, plannedTarget, plannedToday, todaySessions: todaySessions.length, todaySets };
  }

  function todayName() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }

  function findPlan(id) {
    if (!id) return null;
    try {
      if (typeof findVisiblePlan === 'function') {
        const plan = findVisiblePlan(id);
        if (plan) return plan;
      }
    } catch {}
    try {
      const custom = Array.isArray(userProfile?.customWorkouts) ? userProfile.customWorkouts : [];
      return custom.find(plan => String(plan?.id || '') === String(id)) || null;
    } catch { return null; }
  }

  function planId(plan) {
    if (!plan) return '';
    try { if (typeof planIdFor === 'function') return String(planIdFor(plan) || ''); } catch {}
    return String(plan.id || '');
  }

  function todaySchedule() {
    const day = todayName();
    const config = weeklyConfig();
    const item = Array.isArray(config?.schedule) ? config.schedule.find(entry => entry?.day === day) : null;
    if (item) return item;
    return plannedDays().includes(day) ? { day, planId: '', rest: '' } : { day, planId: '', rest: 'Rest day' };
  }

  function todayPlanContext() {
    const schedule = todaySchedule();
    if (!schedule?.planId) return { schedule, plan: null, planId: '' };
    const basePlan = findPlan(schedule.planId);
    const scheduledId = String(schedule.planId || '');

    try {
      if (typeof activePlan !== 'undefined' && activePlan && planId(activePlan) === scheduledId) {
        return { schedule, plan: activePlan, planId: scheduledId };
      }
    } catch {}

    return { schedule, plan: basePlan, planId: scheduledId };
  }

  function todayCompletedSessions(context) {
    if (!context?.planId) return [];
    const dayKey = new Date().toDateString();
    return history()
      .filter(session => new Date(stamp(session)).toDateString() === dayKey)
      .filter(session => {
        const sessionId = String(session?.planId || session?.plan_id || '');
        if (sessionId) return sessionId === context.planId;
        return context.plan?.name && String(session?.plan || session?.planName || '') === String(context.plan.name);
      })
      .sort((a, b) => stamp(b) - stamp(a));
  }

  function activeProgress(context) {
    if (!context?.planId) return null;
    try {
      if (typeof activePlan !== 'undefined' && activePlan && planId(activePlan) === context.planId) {
        return { started: true, logs: Array.isArray(logs) ? logs : [], plan: activePlan };
      }
    } catch {}

    try {
      if (typeof loadActiveWorkoutDraft === 'function') {
        const draft = loadActiveWorkoutDraft();
        if (draft?.planId === context.planId) {
          return { started: true, logs: Array.isArray(draft.logs) ? draft.logs : [], plan: context.plan };
        }
      }
    } catch {}

    return null;
  }

  function validLogs(value) {
    return (Array.isArray(value) ? value : []).filter(log => Number(log?.reps) > 0 && String(log?.exercise || '').trim());
  }

  function plannedSetCount(exercise) {
    try { if (typeof setCountFor === 'function') return Math.max(1, Number(setCountFor(exercise)) || 1); } catch {}
    return Math.max(1, Number(exercise?.sets) || 3);
  }

  function repRange(exercise) {
    const range = Array.isArray(exercise?.repRange) ? exercise.repRange.map(Number) : [8, 12];
    const min = Number.isFinite(range[0]) ? Math.max(1, Math.round(range[0])) : 8;
    const max = Number.isFinite(range[1]) ? Math.max(min, Math.round(range[1])) : Math.max(min, 12);
    return [min, max];
  }

  function historicalSessions() {
    const cutoff = startOfToday();
    return history().filter(session => stamp(session) > 0 && stamp(session) < cutoff);
  }

  function logsForExercise(logList, exerciseName) {
    const target = String(exerciseName || '').trim().toLowerCase();
    if (!target) return [];
    return validLogs(logList).filter(log => String(log.exercise || '').trim().toLowerCase() === target);
  }

  function historicalLogs(exerciseName) {
    return historicalSessions().flatMap(session => logsForExercise(session.logs, exerciseName));
  }

  function estimatedOneRepMax(log) {
    const weight = Number(log?.weight);
    const reps = Number(log?.reps);
    if (!(weight > 0) || !(reps >= 2 && reps <= 12)) return 0;
    return weight * (1 + reps / 30);
  }

  function bestHistoricalEstimate(exerciseName) {
    return historicalLogs(exerciseName).reduce((best, log) => Math.max(best, estimatedOneRepMax(log)), 0);
  }

  function bestCurrentEstimate(logList, exerciseName) {
    return logsForExercise(logList, exerciseName).reduce((best, log) => Math.max(best, estimatedOneRepMax(log)), 0);
  }

  function repPrTarget(exercise) {
    const [, maxReps] = repRange(exercise);
    const byWeight = new Map();
    historicalLogs(exercise.name).forEach(log => {
      const weight = Number(log?.weight);
      const reps = Number(log?.reps);
      if (!(weight > 0) || !(reps > 0) || reps >= maxReps) return;
      const previous = byWeight.get(weight) || 0;
      if (reps > previous) byWeight.set(weight, reps);
    });
    const candidates = [...byWeight.entries()]
      .map(([weight, reps]) => ({ weight, reps, target: reps + 1 }))
      .filter(item => item.target <= maxReps)
      .sort((a, b) => b.weight - a.weight || b.reps - a.reps);
    return candidates[0] || null;
  }

  function repPrDone(logList, exerciseName, target) {
    if (!target) return false;
    return logsForExercise(logList, exerciseName).some(log => {
      const weight = Number(log?.weight);
      const reps = Number(log?.reps);
      return Math.abs(weight - target.weight) < 0.01 && reps >= target.target;
    });
  }

  function sessionVolume(session, exerciseName, capSets) {
    return logsForExercise(session?.logs, exerciseName)
      .filter(log => Number(log?.weight) > 0)
      .slice(0, capSets)
      .reduce((sum, log) => sum + Number(log.weight) * Number(log.reps), 0);
  }

  function bestHistoricalVolume(exerciseName, capSets) {
    return historicalSessions().reduce((best, session) => Math.max(best, sessionVolume(session, exerciseName, capSets)), 0);
  }

  function currentVolume(logList, exerciseName, capSets) {
    return logsForExercise(logList, exerciseName)
      .filter(log => Number(log?.weight) > 0)
      .slice(0, capSets)
      .reduce((sum, log) => sum + Number(log.weight) * Number(log.reps), 0);
  }

  function benchmarkDone(logList, exercise) {
    return logsForExercise(logList, exercise.name).length >= plannedSetCount(exercise);
  }

  function formatWeight(value) {
    const rounded = Math.round(Number(value) * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.max(0, Number(value) || 0));
  }

  function candidateQuests(plan, progressLogs) {
    const exercises = Array.isArray(plan?.exercises) ? plan.exercises : [];
    const strength = [];
    const reps = [];
    const volume = [];
    const baseline = [];

    exercises.forEach(exercise => {
      const name = String(exercise?.name || '').trim();
      if (!name) return;
      const previousEstimate = bestHistoricalEstimate(name);
      const currentEstimate = bestCurrentEstimate(progressLogs, name);
      if (previousEstimate > 0) {
        strength.push({
          type: 'strength',
          exercise: name,
          done: currentEstimate > previousEstimate + 0.01,
          title: `Set an estimated 1RM PR on ${name}`,
          detail: `Previous estimate: ${formatWeight(previousEstimate)} lb. Beat it with a normal 2-12 rep working set, not a true 1-rep max.`
        });
      }

      const repTarget = repPrTarget(exercise);
      if (repTarget) {
        reps.push({
          type: 'reps',
          exercise: name,
          done: repPrDone(progressLogs, name, repTarget),
          title: `Rep PR on ${name}`,
          detail: `Beat ${repTarget.reps} reps at ${formatWeight(repTarget.weight)} lb. Target: ${repTarget.target} reps, still inside today's rep range.`
        });
      }

      const capSets = plannedSetCount(exercise);
      const previousVolume = bestHistoricalVolume(name, capSets);
      const nowVolume = currentVolume(progressLogs, name, capSets);
      if (previousVolume > 0) {
        volume.push({
          type: 'volume',
          exercise: name,
          done: nowVolume > previousVolume,
          title: `Beat your ${name} volume PR`,
          detail: `Previous best across up to ${capSets} planned sets: ${formatNumber(previousVolume)} lb. Extra sets do not count.`
        });
      }

      if (!previousEstimate && !repTarget && !previousVolume) {
        baseline.push({
          type: 'baseline',
          exercise: name,
          done: benchmarkDone(progressLogs, exercise),
          title: `Create a ${name} benchmark`,
          detail: `Log all ${capSets} planned sets today. That unlocks real PR challenges for this exercise next time.`
        });
      }
    });

    const chosen = [];
    const usedExercises = new Set();
    const addUnique = candidate => {
      if (!candidate || usedExercises.has(candidate.exercise) || chosen.length >= 3) return false;
      chosen.push(candidate);
      usedExercises.add(candidate.exercise);
      return true;
    };

    [strength, reps, volume].forEach(group => {
      const candidate = group.find(item => !usedExercises.has(item.exercise));
      addUnique(candidate);
    });

    if (chosen.length < 3) {
      [...strength, ...reps, ...volume, ...baseline].forEach(addUnique);
    }

    if (!chosen.length && exercises[0]) addUnique(baseline[0] || {
      type: 'baseline',
      exercise: exercises[0].name,
      done: benchmarkDone(progressLogs, exercises[0]),
      title: `Create a ${exercises[0].name} benchmark`,
      detail: `Log all ${plannedSetCount(exercises[0])} planned sets so Level Up can build PR challenges from your real numbers.`
    });

    return chosen.slice(0, 3);
  }

  function quest(item) {
    return `<div class="training-quest${item.done ? ' done' : ''}"><span>${item.done ? '✓' : ''}</span><div><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small></div></div>`;
  }

  function ensureSection() {
    const workout = document.getElementById('workout');
    if (!workout) return null;
    let section = document.getElementById('trainingQuestsSection');
    if (section) return section;
    section = document.createElement('section');
    section.id = 'trainingQuestsSection';
    section.className = 'training-quests-section';
    const launcher = document.getElementById('openExerciseLibrary');
    if (launcher) launcher.insertAdjacentElement('afterend', section);
    else workout.querySelector('h1')?.insertAdjacentElement('afterend', section);
    return section;
  }

  function renderRestDay(section) {
    section.innerHTML = `
      <div class="training-quests-card">
        <div class="training-quests-heading"><div class="over">TODAY'S QUESTS</div><h3>Recovery day</h3></div>
        <p class="training-quests-rest">No training challenges today. Your next quest set will be built from your next scheduled workout.</p>
      </div>`;
  }

  function render() {
    const section = ensureSection();
    if (!section) return;

    const context = todayPlanContext();
    if (!context.schedule?.planId) {
      renderRestDay(section);
      return;
    }

    const completedSession = todayCompletedSessions(context)[0] || null;
    const active = activeProgress(context);
    const plan = active?.plan || context.plan;

    if (!plan || !Array.isArray(plan.exercises) || !plan.exercises.length) {
      section.innerHTML = `
        <div class="training-quests-card">
          <div class="training-quests-heading"><div class="over">TODAY'S QUESTS</div><h3>Challenges unavailable</h3></div>
          <p class="training-quests-rest">Level Up could not load enough of today's workout to build safe, trackable challenges.</p>
        </div>`;
      return;
    }

    const progressLogs = validLogs(completedSession?.logs || active?.logs || []);
    const challenges = candidateQuests(plan, progressLogs);

    section.innerHTML = `
      <div class="training-quests-card">
        <div class="training-quests-heading"><div class="over">TODAY'S QUESTS</div><h3>${esc(plan.name || 'Challenge day')}</h3></div>
        <p class="training-quests-rest">Optional challenges based on today's exercises and your real history. They never require extra sets or a true 1-rep max test.</p>
        ${challenges.map(quest).join('')}
      </div>`;
  }

  function start() {
    render();
    window.addEventListener('pageshow', render);
    window.addEventListener('levelup:history-enriched', render);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') render(); });
    document.addEventListener('click', event => {
      if (event.target?.closest?.('[data-page="workout"]')) setTimeout(render, 80);
      if (event.target?.closest?.('#setList button, #finish')) setTimeout(render, 120);
    }, true);
    setInterval(() => {
      const workout = document.getElementById('workout');
      const activePage = document.getElementById('active');
      if ((workout && !workout.classList.contains('hidden')) || (activePage && !activePage.classList.contains('hidden'))) render();
    }, 2500);
  }

  window.LevelUpTrainingQuests = { render, stats, today: todayPlanContext };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
