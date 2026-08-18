(() => {
  let forcing = false;

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

  function forceActivePage() {
    if (forcing || !activeWorkoutExists()) return;
    const active = document.getElementById('active');
    if (!active) return;

    forcing = true;
    try {
      if (typeof go === 'function') {
        go('active');
      }

      // Defensive fallback in case another UI helper interrupts the normal page transition.
      if (active.classList.contains('hidden')) {
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
        active.classList.remove('hidden');
        try {
          sessionStorage.setItem('levelUpFitnessLastPage', 'active');
        } catch {}
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
      active.classList.remove('hidden');
    } finally {
      forcing = false;
    }
  }

  function scheduleActivePageCheck() {
    // The normal app handler creates/persists the workout first. These checks only repair navigation.
    [0, 40, 140, 320].forEach(delay => {
      window.setTimeout(() => {
        const start = document.getElementById('start');
        const active = document.getElementById('active');
        if (!start || !active || !activeWorkoutExists()) return;

        const becameResume = /resume workout/i.test(start.textContent || '');
        if (becameResume && active.classList.contains('hidden')) forceActivePage();
      }, delay);
    });
  }

  document.addEventListener('click', event => {
    const start = event.target.closest?.('#start');
    if (!start) return;
    scheduleActivePageCheck();
  });
})();
