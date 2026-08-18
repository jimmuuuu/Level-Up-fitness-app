(() => {
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';

  function historyIds() {
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (!Array.isArray(history)) return new Set();
      return new Set(history.map(session => session?.id).filter(Boolean));
    } catch {
      return new Set();
    }
  }

  function newestNewSession(beforeIds) {
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (!Array.isArray(history)) return null;
      return [...history].reverse().find(session => session?.id && !beforeIds.has(session.id)) || null;
    } catch {
      return null;
    }
  }

  function summaryAlreadyOpen() {
    const overlay = document.getElementById('workoutSummaryOverlay');
    return Boolean(overlay && !overlay.classList.contains('hidden'));
  }

  function openNewestSummaryWhenReady(beforeIds) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;

      if (summaryAlreadyOpen()) {
        clearInterval(timer);
        return;
      }

      const completed = newestNewSession(beforeIds);
      if (!completed) {
        if (attempts >= 160) clearInterval(timer);
        return;
      }

      // The normal summary feature opens as soon as the workout is written to history.
      // This button click is a fallback in case that watcher misses the event.
      const buttons = [...document.querySelectorAll('.ws-view-summary')];
      if (buttons.length) {
        buttons[0].click();
        clearInterval(timer);
        return;
      }

      if (attempts >= 160) clearInterval(timer);
    }, 100);
  }

  function attach() {
    const finish = document.getElementById('finish');
    if (!finish || finish.dataset.autoSummaryFallback === 'true') return;
    finish.dataset.autoSummaryFallback = 'true';
    finish.addEventListener('click', () => {
      const beforeIds = historyIds();
      openNewestSummaryWhenReady(beforeIds);
    }, true);
  }

  function start() {
    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
