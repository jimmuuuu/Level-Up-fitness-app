(() => {
  let forcing = false;
  let timerWatchdog = null;

  function activeWorkoutExists() {
    try {
      if (typeof activePlan !== 'undefined' && activePlan) return true;
      if (typeof loadActiveWorkoutDraft === 'function') {
        const draft = loadActiveWorkoutDraft();
        if (draft?.sessionId) return true;
      }
    } catch {}
    return false;
  }

  function activeStartTime() {
    try {
      const current = Number(activeStartedAt) || 0;
      if (current > 0) return current;
    } catch {}
    try {
      if (typeof loadActiveWorkoutDraft === 'function') {
        const draft = loadActiveWorkoutDraft();
        const saved = Number(draft?.startedAt) || 0;
        if (saved > 0) return saved;
      }
    } catch {}
    return 0;
  }

  function fallbackClock(elapsedMilliseconds) {
    const totalSeconds = Math.max(0, Math.floor(elapsedMilliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function updateVisibleClock() {
    const display = document.getElementById('activeElapsed');
    const startedAt = activeStartTime();
    if (!display || !startedAt || !activeWorkoutExists()) return false;
    const elapsed = Math.max(0, Date.now() - startedAt);
    try {
      display.textContent = typeof formatElapsedClock === 'function' ? formatElapsedClock(elapsed) : fallbackClock(elapsed);
    } catch {
      display.textContent = fallbackClock(elapsed);
    }
    return true;
  }

  function ensureSessionTimer() {
    if (!activeWorkoutExists()) return;
    updateVisibleClock();
    try {
      if (typeof startActiveWorkoutTimer === 'function') startActiveWorkoutTimer();
    } catch {}
    if (timerWatchdog !== null) return;
    timerWatchdog = window.setInterval(() => {
      if (!activeWorkoutExists()) {
        window.clearInterval(timerWatchdog);
        timerWatchdog = null;
        return;
      }
      updateVisibleClock();
    }, 1000);
  }

  function forceActivePage() {
    if (forcing || !activeWorkoutExists()) return;
    const active = document.getElementById('active');
    if (!active) return;
    forcing = true;
    try {
      if (typeof go === 'function') go('active');
      if (active.classList.contains('hidden')) {
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
        active.classList.remove('hidden');
        try { sessionStorage.setItem('levelUpFitnessLastPage', 'active'); } catch {}
      }
      ensureSessionTimer();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
      active.classList.remove('hidden');
      ensureSessionTimer();
    } finally {
      forcing = false;
    }
  }

  function scheduleActivePageCheck() {
    [0, 40, 140, 320, 700].forEach(delay => {
      window.setTimeout(() => {
        const start = document.getElementById('start');
        const active = document.getElementById('active');
        if (!start || !active || !activeWorkoutExists()) return;
        const becameResume = /resume workout/i.test(start.textContent || '');
        if (becameResume && active.classList.contains('hidden')) forceActivePage();
        if (becameResume) ensureSessionTimer();
      }, delay);
    });
  }

  document.addEventListener('click', event => {
    const start = event.target.closest?.('#start');
    if (!start) return;
    scheduleActivePageCheck();
  });

  window.addEventListener('pageshow', () => {
    if (activeWorkoutExists()) ensureSessionTimer();
  });
})();