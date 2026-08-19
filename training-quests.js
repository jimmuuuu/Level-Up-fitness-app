(() => {
  const XP_PER_WORKOUT = 100;
  const XP_PER_SET = 5;
  const SET_XP_CAP_PER_WORKOUT = 25;

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
    start.setHours(0,0,0,0);
    return start.getTime();
  }

  function accountId() {
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return String(cloudUser.id);
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
    } catch {}
    return 'local';
  }

  function plannedDays() {
    const fallback = ['Monday','Tuesday','Wednesday','Friday','Saturday'];
    try {
      const config = JSON.parse(localStorage.getItem(`levelUpFitnessWeeklyPlan:${accountId()}`) || 'null');
      const days = Array.isArray(config?.answers?.trainingDays) ? config.answers.trainingDays.filter(Boolean) : [];
      return days.length ? days : fallback;
    } catch { return fallback; }
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

  function quest(done, title, detail) {
    return `<div class="training-quest${done ? ' done' : ''}"><span>${done ? '✓' : ''}</span><div><strong>${title}</strong><small>${detail}</small></div></div>`;
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

  function render() {
    const section = ensureSection();
    if (!section) return;
    const data = stats();
    const todayWorkoutDone = data.todaySessions > 0;
    const todaySetsDone = data.todaySets >= 3;
    const weeklyHalf = Math.min(3, data.plannedTarget);
    section.innerHTML = `
      <div class="training-xp-card">
        <div class="training-xp-heading"><div><div class="over">TRAINING XP</div><h2>Level ${data.level}</h2></div><strong>${data.levelXp} / 1000 XP</strong></div>
        <div class="training-xp-track"><span style="width:${Math.min(100, data.levelXp / 10)}%"></span></div>
        <p>XP rewards logging and consistency. Extra sets beyond a normal workout do not keep giving unlimited XP.</p>
      </div>
      <div class="training-quests-card">
        <div class="training-quests-heading"><div class="over">QUESTS</div><h3>${data.plannedToday ? 'Today' : 'Recovery day'}</h3></div>
        ${data.plannedToday ? quest(todayWorkoutDone, 'Complete today’s planned workout', todayWorkoutDone ? 'Completed' : 'Your scheduled training day') : quest(true, 'Recovery day', 'No workout required today')}
        ${data.plannedToday ? quest(todaySetsDone, 'Log your workout', `${Math.min(data.todaySets,3)} / 3 logged sets`) : ''}
        <div class="training-quest-divider"></div>
        ${quest(data.weeklyWorkouts >= weeklyHalf, `Complete ${weeklyHalf} planned sessions`, `${Math.min(data.weeklyWorkouts, weeklyHalf)} / ${weeklyHalf} this week`)}
        ${quest(data.weeklyWorkouts >= data.plannedTarget, 'Finish your planned training week', `${Math.min(data.weeklyWorkouts, data.plannedTarget)} / ${data.plannedTarget} planned sessions`)}
      </div>`;
  }

  function start() {
    render();
    window.addEventListener('pageshow', render);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') render(); });
    setInterval(() => {
      const workout = document.getElementById('workout');
      if (workout && !workout.classList.contains('hidden')) render();
    }, 5000);
  }

  window.LevelUpTrainingQuests = { render, stats };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
