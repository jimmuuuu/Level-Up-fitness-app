(() => {
  const GLOBAL_HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const CLOUD_HISTORY_PREFIX = 'levelUpFitnessCloudWorkoutHistory:';
  const OWNER_KEY = 'levelUpFitnessWorkoutHistoryOwner';

  function apply() {
    const source = window.LevelUpAuthoritativeHistory;
    if (!source?.cloud || !source.ready || !source.userId) return false;

    const history = source.getHistory();
    try {
      localStorage.setItem(GLOBAL_HISTORY_KEY, JSON.stringify(history));
      localStorage.setItem(`${CLOUD_HISTORY_PREFIX}${source.userId}`, JSON.stringify(history));
      localStorage.setItem(OWNER_KEY, `cloud:${source.userId}`);
    } catch {}

    try { workoutHistory = history; } catch {}
    try {
      if (window.LevelUpTrainingStats?.reload) void window.LevelUpTrainingStats.reload();
    } catch {}
    try { if (typeof renderProgress === 'function') renderProgress(); } catch {}
    try { if (typeof renderProfile === 'function') renderProfile(); } catch {}
    try { if (typeof renderHome === 'function') renderHome(); } catch {}
    return true;
  }

  window.addEventListener('levelup:authoritative-history-ready', apply);
  window.addEventListener('pageshow', () => window.setTimeout(apply, 0));

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (apply() || attempts >= 30) window.clearInterval(timer);
  }, 250);
})();