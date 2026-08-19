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
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const plannedToday = days.includes(todayName);
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
        return {
          started: true,
          logs: Array.isArray(logs) ? logs : [],
          plan: activePlan
        };
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

  function setCountForExercise(logList, exerciseName) {
    const name = String(exerciseName || '').trim().toLowerCase();
    if (!name) return 0;
    return validLogs(logList).filter(log => String(log.exercise || '').trim().toLowerCase() === name).length;
  }

  function completedExerciseCount(plan, logList) {
    const exercises = Array.isArray(plan?.exercises) ? plan.exercises : [];
    return exercises.filter(exercise => setCountForExercise(logList, exercise.name) >= plannedSetCount(exercise)).length;
  }

  function quest(done, title, detail) {
    return `<div class="training-quest${done ? ' done' : ''}"><span>${done ? '✓' : ''}</span><div><strong>${esc(title)}</strong><small>${esc(detail)}</small></div></div>`;
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
        <p class="training-quests-rest">No workout quests today. Your next quests will match your next scheduled workout.</p>
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

    const completedSessions = todayCompletedSessions(context);
    const completedSession = completedSessions[0] || null;
    const active = activeProgress(context);
    const plan = active?.plan || context.plan;

    if (!plan || !Array.isArray(plan.exercises) || !plan.exercises.length) {
      section.innerHTML = `
        <div class="training-quests-card">
          <div class="training-quests-heading"><div class="over">TODAY'S QUESTS</div><h3>Today's workout</h3></div>
          ${quest(Boolean(completedSession), 'Complete today\'s workout', completedSession ? 'Workout saved' : 'Follow the workout scheduled for today')}
        </div>`;
      return;
    }

    const progressLogs = validLogs(completedSession?.logs || active?.logs || []);
    const firstExercise = plan.exercises[0];
    const firstTarget = plannedSetCount(firstExercise);
    const firstDoneSets = Math.min(firstTarget, setCountForExercise(progressLogs, firstExercise.name));
    const finishedExercises = completedSession ? plan.exercises.length : completedExerciseCount(plan, progressLogs);
    const halfwayTarget = Math.max(1, Math.ceil(plan.exercises.length / 2));
    const workoutDone = Boolean(completedSession);

    section.innerHTML = `
      <div class="training-quests-card">
        <div class="training-quests-heading"><div class="over">TODAY'S QUESTS</div><h3>${esc(plan.name || 'Today')}</h3></div>
        ${quest(firstDoneSets >= firstTarget, `Finish ${firstExercise.name}`, `${firstDoneSets} / ${firstTarget} planned sets logged`)}
        ${quest(finishedExercises >= halfwayTarget, `Complete ${halfwayTarget} exercises`, `${Math.min(finishedExercises, halfwayTarget)} / ${halfwayTarget} finished in ${plan.name || 'today\'s workout'}`)}
        ${quest(workoutDone, `Finish ${plan.name || 'today\'s workout'}`, workoutDone ? 'Workout completed and saved' : 'Complete the workout and save it')}
      </div>`;
  }

  function start() {
    render();
    window.addEventListener('pageshow', render);
    window.addEventListener('levelup:history-enriched', render);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') render(); });
    document.addEventListener('click', event => {
      if (event.target?.closest?.('[data-page="workout"]')) setTimeout(render, 80);
    }, true);
    setInterval(() => {
      const workout = document.getElementById('workout');
      if (workout && !workout.classList.contains('hidden')) render();
    }, 3000);
  }

  window.LevelUpTrainingQuests = { render, stats, today: todayPlanContext };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
