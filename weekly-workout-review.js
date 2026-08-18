(() => {
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const CARD_ID = 'weeklyWorkoutReview';

  function readHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function mondayStart(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    return date.getTime();
  }

  function isThisWeek(timestamp) {
    const time = Number(timestamp) || 0;
    if (!time) return false;
    const start = mondayStart(Date.now());
    const end = start + 7 * 24 * 60 * 60 * 1000;
    return time >= start && time < end;
  }

  function currentPlanName() {
    return document.getElementById('detailTitle')?.textContent?.trim() || '';
  }

  function completedThisWeek(planName) {
    if (!planName) return null;
    return readHistory()
      .filter(session => session && session.plan === planName && isThisWeek(session.completedAt))
      .sort((a, b) => (Number(b.completedAt) || 0) - (Number(a.completedAt) || 0))[0] || null;
  }

  function durationLabel(session) {
    let minutes = Number(session?.durationMinutes) || 0;
    if (!minutes && session?.startedAt && session?.completedAt) {
      minutes = Math.max(0, Math.round((Number(session.completedAt) - Number(session.startedAt)) / 60000));
    }
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  function dateLabel(timestamp) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    }).format(new Date(timestamp));
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(Number(value) || 0);
  }

  function totalVolume(session) {
    return (session?.logs || []).reduce((total, log) => {
      return total + (Number(log?.weight) || 0) * (Number(log?.reps) || 0);
    }, 0);
  }

  function exerciseList(session) {
    const groups = new Map();
    (session?.logs || []).forEach(log => {
      if (!log?.exercise) return;
      if (!groups.has(log.exercise)) groups.set(log.exercise, []);
      groups.get(log.exercise).push(log);
    });

    return [...groups.entries()].map(([exercise, sets]) => {
      const ordered = [...sets].sort((a, b) => (Number(a.set) || 0) - (Number(b.set) || 0));
      const setMarkup = ordered.map(log => {
        const weight = Number(log.weight) || 0;
        const reps = Number(log.reps) || 0;
        const value = weight > 0 ? `${formatNumber(weight)} lb × ${reps}` : `${reps} reps`;
        return `<span><b>Set ${Number(log.set) || 1}</b>${escapeHtml(value)}</span>`;
      }).join('');

      return `<article class="weekly-review-exercise">
        <strong>${escapeHtml(exercise)}</strong>
        <div class="weekly-review-sets">${setMarkup}</div>
      </article>`;
    }).join('');
  }

  function makeCard(session) {
    const card = document.createElement('section');
    card.id = CARD_ID;
    card.className = 'weekly-workout-review';
    card.dataset.sessionId = session.id || String(session.completedAt || '');

    const setCount = (session.logs || []).length;
    const exerciseCount = new Set((session.logs || []).map(log => log?.exercise).filter(Boolean)).size;
    const volume = totalVolume(session);

    card.innerHTML = `
      <div class="weekly-review-top">
        <div>
          <span class="weekly-review-kicker">COMPLETED THIS WEEK</span>
          <strong>${escapeHtml(dateLabel(session.completedAt))}</strong>
          <small>${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'} · ${setCount} set${setCount === 1 ? '' : 's'} · ${escapeHtml(durationLabel(session))}</small>
        </div>
        <span class="weekly-review-check" aria-hidden="true">✓</span>
      </div>
      <button class="weekly-review-toggle" type="button" aria-expanded="false">View this week's workout</button>
      <div class="weekly-review-details hidden">
        <div class="weekly-review-stats">
          <article><span>TIME</span><strong>${escapeHtml(durationLabel(session))}</strong></article>
          <article><span>SETS</span><strong>${setCount}</strong></article>
          <article><span>VOLUME</span><strong>${volume > 0 ? `${formatNumber(volume)} lb` : 'Bodyweight'}</strong></article>
        </div>
        <div class="weekly-review-exercises">${exerciseList(session)}</div>
      </div>`;

    const toggle = card.querySelector('.weekly-review-toggle');
    const details = card.querySelector('.weekly-review-details');
    toggle.onclick = () => {
      const opening = details.classList.contains('hidden');
      details.classList.toggle('hidden', !opening);
      toggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
      toggle.textContent = opening ? 'Hide this week\'s workout' : 'View this week\'s workout';
    };

    return card;
  }

  function render() {
    const detail = document.getElementById('detail');
    const start = document.getElementById('start');
    if (!detail || !start) return;

    const existing = document.getElementById(CARD_ID);
    const session = completedThisWeek(currentPlanName());

    if (!session) {
      existing?.remove();
      return;
    }

    const sessionId = session.id || String(session.completedAt || '');
    if (existing?.dataset.sessionId === sessionId) return;

    existing?.remove();
    start.insertAdjacentElement('afterend', makeCard(session));
  }

  function start() {
    const detail = document.getElementById('detail');
    if (!detail) return;

    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        render();
      });
    };

    const observer = new MutationObserver(schedule);
    observer.observe(detail, { attributes: true, childList: true, subtree: true, characterData: true });
    window.addEventListener('storage', event => {
      if (event.key === HISTORY_KEY) schedule();
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) schedule();
    });
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();