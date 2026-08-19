(() => {
  let viewDate = new Date();
  const MODAL_ID = 'workoutCalendarModal';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function history() {
    try { if (Array.isArray(workoutHistory)) return workoutHistory; } catch {}
    try {
      const parsed = JSON.parse(localStorage.getItem('levelUpFitnessWorkoutHistory') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function completedAt(session) {
    const raw = session?.completedAt ?? session?.completed_at ?? session?.endedAt ?? 0;
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
    const parsed = Date.parse(String(raw || ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function keyForDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function sessionsByDay() {
    const map = new Map();
    history().forEach(session => {
      if (String(session?.status || 'completed') !== 'completed') return;
      const stamp = completedAt(session);
      if (!stamp) return;
      const date = new Date(stamp);
      const key = keyForDate(date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(session);
    });
    return map;
  }

  function ensureSection() {
    const progress = document.getElementById('progress');
    const overview = document.getElementById('progressOverview');
    if (!progress || !overview) return null;
    let section = document.getElementById('workoutCalendarSection');
    if (section) return section;
    section = document.createElement('section');
    section.id = 'workoutCalendarSection';
    section.className = 'progress-section workout-calendar-section';
    section.innerHTML = '<div id="workoutCalendar"></div>';
    overview.insertAdjacentElement('afterend', section);
    return section;
  }

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'workout-calendar-modal hidden';
    modal.innerHTML = '<div class="workout-calendar-backdrop" data-calendar-close></div><section class="workout-calendar-sheet" role="dialog" aria-modal="true"><div class="workout-calendar-handle"></div><div id="workoutCalendarModalContent"></div></section>';
    document.body.appendChild(modal);
    modal.addEventListener('click', event => {
      if (event.target.closest?.('[data-calendar-close]')) modal.classList.add('hidden');
    });
    return modal;
  }

  function sessionMinutes(session) {
    const explicit = Number(session?.durationMinutes);
    if (Number.isFinite(explicit) && explicit > 0) return Math.round(explicit);
    const seconds = Number(session?.duration);
    return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds / 60) : 0;
  }

  function daySummary(session) {
    const sets = (session?.logs || []).filter(log => Number(log?.reps) > 0).length;
    const minutes = sessionMinutes(session);
    return `${sets} set${sets === 1 ? '' : 's'}${minutes ? ` · ${minutes} min` : ''}`;
  }

  function groupedLogs(session) {
    const groups = new Map();
    (session?.logs || []).filter(log => Number(log?.reps) > 0).forEach(log => {
      const name = String(log?.exercise || 'Exercise');
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(log);
    });
    return [...groups.entries()];
  }

  function sessionDetails(session) {
    const groups = groupedLogs(session);
    if (!groups.length) return '<p class="workout-calendar-no-sets">No set details were saved for this workout.</p>';
    return `<div class="workout-calendar-exercises">${groups.map(([name, logs]) => `
      <div class="workout-calendar-exercise">
        <strong>${esc(name)}</strong>
        <div>${logs.map((log, index) => `<span>Set ${esc(log.set || index + 1)}: ${Number(log.weight) > 0 ? `${esc(log.weight)} lb × ` : ''}${esc(log.reps)} reps</span>`).join('')}</div>
      </div>`).join('')}</div>`;
  }

  function openDay(date, sessions) {
    const modal = ensureModal();
    const content = modal.querySelector('#workoutCalendarModalContent');
    content.innerHTML = `
      <div class="workout-calendar-sheet-heading">
        <div><div class="over">WORKOUT HISTORY</div><h2>${esc(date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }))}</h2></div>
        <button type="button" data-calendar-close class="workout-calendar-close" aria-label="Close">×</button>
      </div>
      <div class="workout-calendar-day-list">
        ${sessions.map(session => `<article class="workout-calendar-session"><strong>${esc(session?.planName || session?.plan_name || session?.plan || session?.name || 'Workout')}</strong><span>${esc(daySummary(session))}</span>${sessionDetails(session)}${session?.workout_note ? `<p class="workout-calendar-note"><b>Note:</b> ${esc(session.workout_note)}</p>` : ''}</article>`).join('')}
      </div>`;
    modal.classList.remove('hidden');
  }

  function render() {
    const section = ensureSection();
    if (!section) return;
    const root = document.getElementById('workoutCalendar');
    const byDay = sessionsByDay();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = first.getDay();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push('<div class="workout-calendar-cell empty" aria-hidden="true"></div>');
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = keyForDate(date);
      const sessions = byDay.get(key) || [];
      const today = key === keyForDate(new Date());
      cells.push(`<button type="button" class="workout-calendar-cell${sessions.length ? ' trained' : ''}${today ? ' today' : ''}" data-calendar-day="${day}" ${sessions.length ? '' : 'disabled'}><span>${day}</span>${sessions.length ? `<b>${sessions.length}</b>` : ''}</button>`);
    }

    root.innerHTML = `
      <div class="workout-calendar-heading">
        <div><div class="over">CALENDAR</div><h2>Workout calendar</h2></div>
        <div class="workout-calendar-nav"><button type="button" data-cal-prev aria-label="Previous month">‹</button><strong>${esc(viewDate.toLocaleDateString([], { month: 'long', year: 'numeric' }))}</strong><button type="button" data-cal-next aria-label="Next month">›</button></div>
      </div>
      <div class="workout-calendar-weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
      <div class="workout-calendar-grid">${cells.join('')}</div>
      <p class="workout-calendar-help">Completed workouts are marked automatically. Tap a marked day to see every set you logged.</p>`;

    root.querySelector('[data-cal-prev]').onclick = () => { viewDate = new Date(year, month - 1, 1); render(); };
    root.querySelector('[data-cal-next]').onclick = () => { viewDate = new Date(year, month + 1, 1); render(); };
    root.querySelectorAll('[data-calendar-day]').forEach(button => {
      button.onclick = () => {
        const date = new Date(year, month, Number(button.dataset.calendarDay));
        const sessions = byDay.get(keyForDate(date)) || [];
        if (sessions.length) openDay(date, sessions);
      };
    });
  }

  function start() {
    ensureModal();
    render();
    window.addEventListener('pageshow', render);
    window.addEventListener('levelup:history-enriched', render);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') render(); });
    window.setInterval(() => {
      const progress = document.getElementById('progress');
      if (progress && !progress.classList.contains('hidden')) render();
    }, 5000);
  }

  window.LevelUpWorkoutCalendar = { render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
