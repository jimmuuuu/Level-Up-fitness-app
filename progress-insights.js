(() => {
  function history() {
    try { if (Array.isArray(workoutHistory)) return workoutHistory; } catch {}
    try {
      const parsed = JSON.parse(localStorage.getItem('levelUpFitnessWorkoutHistory') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function stamp(session) {
    const raw = session?.completedAt ?? session?.completed_at ?? 0;
    const num = Number(raw);
    if (Number.isFinite(num) && num > 0) return num;
    const parsed = Date.parse(String(raw || ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function startOfWeek(date = new Date()) {
    const copy = new Date(date);
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0,0,0,0);
    return copy.getTime();
  }

  function startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  }

  function minutes(session) {
    const explicit = Number(session?.durationMinutes);
    if (Number.isFinite(explicit) && explicit > 0) return Math.round(explicit);
    const seconds = Number(session?.duration) || 0;
    if (seconds > 0) return Math.round(seconds / 60);
    const started = Number(session?.startedAt) || Date.parse(session?.started_at || '') || 0;
    const ended = stamp(session);
    return started && ended > started ? Math.round((ended - started) / 60000) : 0;
  }

  function summary() {
    const all = history().filter(session => String(session?.status || 'completed') === 'completed' && stamp(session));
    const weekStart = startOfWeek();
    const monthStart = startOfMonth();
    const week = all.filter(session => stamp(session) >= weekStart);
    const month = all.filter(session => stamp(session) >= monthStart);
    const logs = all.flatMap(session => session?.logs || []);
    const monthLogs = month.flatMap(session => session?.logs || []);
    const validLogs = logs.filter(log => Number(log?.reps) > 0);
    const muscles = new Map();
    monthLogs.filter(log => Number(log?.reps) > 0).forEach(log => {
      const targets = Array.isArray(log?.muscleTargets) ? log.muscleTargets : [];
      targets.forEach(target => muscles.set(String(target), (muscles.get(String(target)) || 0) + 1));
    });
    const topMuscles = [...muscles.entries()].sort((a,b) => b[1]-a[1]).slice(0,3);
    const checkIns = all.map(session => session?.checkIn?.value).filter(Boolean);
    return {
      weekWorkouts: week.length,
      monthWorkouts: month.length,
      totalSets: validLogs.length,
      totalMinutes: all.reduce((sum, session) => sum + minutes(session), 0),
      topMuscles,
      checkIns: checkIns.length
    };
  }

  function ensureSection() {
    const progress = document.getElementById('progress');
    if (!progress) return null;
    let section = document.getElementById('progressInsightsSection');
    if (section) return section;
    section = document.createElement('section');
    section.id = 'progressInsightsSection';
    section.className = 'progress-section progress-insights-section';
    const calendar = document.getElementById('workoutCalendarSection');
    if (calendar) calendar.insertAdjacentElement('afterend', section);
    else document.getElementById('progressRank')?.insertAdjacentElement('afterend', section);
    return section;
  }

  function render() {
    const section = ensureSection();
    if (!section) return;
    const data = summary();
    section.innerHTML = `
      <div class="section-heading compact-heading"><div><div class="over">INSIGHTS</div><h2>Your training at a glance</h2></div></div>
      <div class="progress-insight-grid">
        <div><span>This week</span><strong>${data.weekWorkouts}</strong><small>workouts</small></div>
        <div><span>This month</span><strong>${data.monthWorkouts}</strong><small>workouts</small></div>
        <div><span>Logged sets</span><strong>${data.totalSets}</strong><small>all time</small></div>
        <div><span>Training time</span><strong>${Math.floor(data.totalMinutes / 60)}h ${data.totalMinutes % 60}m</strong><small>all time</small></div>
      </div>
      <div class="progress-muscle-insights">
        <div><span>Most trained this month</span><strong>${data.topMuscles.length ? data.topMuscles.map(([name]) => name).join(' · ') : 'No muscle data yet'}</strong></div>
        <p>${data.checkIns ? `${data.checkIns} workout check-in${data.checkIns === 1 ? '' : 's'} logged. ` : ''}These stats only summarize workouts and sets you logged. They do not compare your body or performance with other people.</p>
      </div>`;
  }

  function start() {
    render();
    window.addEventListener('pageshow', render);
    window.addEventListener('levelup:history-enriched', render);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') render(); });
    setInterval(() => {
      const progress = document.getElementById('progress');
      if (progress && !progress.classList.contains('hidden')) render();
    }, 5000);
  }

  window.LevelUpProgressInsights = { render, summary };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
