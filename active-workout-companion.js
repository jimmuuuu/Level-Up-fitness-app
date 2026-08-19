(() => {
  const BAR_ID = 'activeWorkoutCompanion';
  let interval = null;

  function activeWorkoutExists() {
    try { return Boolean(activePlan && activeSessionId); }
    catch { return false; }
  }

  function activePageVisible() {
    const active = document.getElementById('active');
    return Boolean(active && !active.classList.contains('hidden'));
  }

  function formatElapsed() {
    const existing = document.getElementById('activeElapsed')?.textContent?.trim();
    if (existing) return existing;
    try {
      const start = Number(activeStartedAt) || 0;
      if (!start) return '0:00';
      const total = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      return hours
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${minutes}:${String(seconds).padStart(2, '0')}`;
    } catch { return '0:00'; }
  }

  function ensureBar() {
    const active = document.getElementById('active');
    if (!active) return null;
    let bar = document.getElementById(BAR_ID);
    if (bar) return bar;

    bar = document.createElement('section');
    bar.id = BAR_ID;
    bar.className = 'active-workout-companion hidden';
    bar.setAttribute('aria-label', 'Workout and rest timer status');
    bar.innerHTML = `
      <div class="active-companion-metric active-companion-workout">
        <span>Workout</span>
        <strong id="activeCompanionWorkoutTime">0:00</strong>
      </div>
      <button type="button" class="active-companion-rest" id="activeCompanionRest" aria-label="Open rest timer controls">
        <span>Rest</span>
        <strong id="activeCompanionRestTime">Ready</strong>
      </button>
      <button type="button" class="active-companion-pause hidden" id="activeCompanionPause">Pause</button>`;
    active.insertBefore(bar, active.firstChild);

    bar.querySelector('#activeCompanionRest').onclick = () => {
      const timer = document.getElementById('restTimerV3');
      if (timer) timer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    bar.querySelector('#activeCompanionPause').onclick = () => {
      try { window.LevelUpRestTimerV3?.togglePause?.(); } catch {}
      setTimeout(render, 30);
    };
    return bar;
  }

  function restState() {
    const card = document.getElementById('restTimerV3');
    const time = document.getElementById('restTimerV3Time')?.textContent?.trim() || '';
    if (!card || card.classList.contains('hidden')) return { mode: 'idle', label: 'Ready' };
    if (card.classList.contains('running')) return { mode: 'running', label: time || 'Resting' };
    if (card.classList.contains('paused')) return { mode: 'paused', label: time || 'Paused' };
    if (card.classList.contains('rest-timer-v3-complete')) return { mode: 'complete', label: 'Done' };
    return { mode: 'idle', label: 'Ready' };
  }

  function render() {
    const bar = ensureBar();
    if (!bar) return;
    const visible = activeWorkoutExists() && activePageVisible();
    bar.classList.toggle('hidden', !visible);
    if (!visible) return;

    const workoutTime = bar.querySelector('#activeCompanionWorkoutTime');
    const restTime = bar.querySelector('#activeCompanionRestTime');
    const restButton = bar.querySelector('#activeCompanionRest');
    const pause = bar.querySelector('#activeCompanionPause');
    if (workoutTime) workoutTime.textContent = formatElapsed();

    const rest = restState();
    if (restTime) restTime.textContent = rest.label;
    restButton?.classList.toggle('running', rest.mode === 'running');
    restButton?.classList.toggle('paused', rest.mode === 'paused');
    restButton?.classList.toggle('complete', rest.mode === 'complete');

    const canPause = rest.mode === 'running' || rest.mode === 'paused';
    if (pause) {
      pause.classList.toggle('hidden', !canPause);
      pause.textContent = rest.mode === 'paused' ? 'Resume' : 'Pause';
    }
  }

  function start() {
    ensureBar();
    render();
    window.addEventListener('pageshow', render);
    window.addEventListener('levelup:rest-started', render);
    window.addEventListener('levelup:rest-complete', render);
    document.addEventListener('visibilitychange', render);
    document.addEventListener('click', event => {
      if (event.target.closest?.('[data-page], #start, #finish')) setTimeout(render, 100);
    }, true);
    if (interval) clearInterval(interval);
    interval = setInterval(render, 500);
  }

  window.LevelUpActiveWorkoutCompanion = { render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
