(() => {
  const GLOBAL_HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const CLOUD_HISTORY_PREFIX = 'levelUpFitnessCloudWorkoutHistory:';
  const HISTORY_OWNER_KEY = 'levelUpFitnessWorkoutHistoryOwner';
  const LEGACY_BACKUP_KEY = 'levelUpFitnessCrossAccountHistoryBackup';
  const PENDING_KEY = 'levelUpFitnessPendingCloudSessions';
  const ACCOUNT_GRACE_MS = 5 * 60 * 1000;

  const state = {
    ready: false,
    userId: '',
    completedCount: 0,
    verifiedAt: 0,
    checking: false
  };

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writeArray(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value : []));
      return true;
    } catch {
      return false;
    }
  }

  function client() {
    try {
      if (typeof getSupabaseClient === 'function') return getSupabaseClient();
    } catch {}
    return null;
  }

  function backupContaminatedHistory(userId) {
    try {
      const globalRows = readArray(GLOBAL_HISTORY_KEY);
      const accountRows = readArray(`${CLOUD_HISTORY_PREFIX}${userId}`);
      if (!globalRows.length && !accountRows.length) return;
      const existing = JSON.parse(localStorage.getItem(LEGACY_BACKUP_KEY) || '[]');
      const backups = Array.isArray(existing) ? existing : [];
      backups.push({
        userId,
        savedAt: Date.now(),
        globalRows,
        accountRows
      });
      localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify(backups.slice(-5)));
    } catch {}
  }

  function removeHistoryUi() {
    const setList = document.getElementById('setList');
    if (setList) {
      setList.querySelectorAll('.set-history-compare').forEach(node => node.remove());
      setList.querySelectorAll('.set-row').forEach(row => {
        delete row.dataset.historyComparisonReady;
      });
    }
  }

  function refreshUi() {
    removeHistoryUi();
    try { if (typeof renderProgress === 'function') renderProgress(); } catch {}
    try { if (typeof renderProfile === 'function') renderProfile(); } catch {}
    try { if (typeof renderHome === 'function') renderHome(); } catch {}
    try {
      if (window.LevelUpTrainingStats?.reload) void window.LevelUpTrainingStats.reload();
    } catch {}
  }

  function clearBrowserHistoryFor(userId, createdAt, completedCount) {
    backupContaminatedHistory(userId);
    writeArray(GLOBAL_HISTORY_KEY, []);
    writeArray(`${CLOUD_HISTORY_PREFIX}${userId}`, []);
    try { localStorage.setItem(HISTORY_OWNER_KEY, `cloud:${userId}`); } catch {}
    try { workoutHistory = []; } catch {}

    // A brand-new account must never inherit an old account's pending uploads.
    // Keep recent pending work only when it could have been created by this account.
    if (completedCount === 0 && createdAt) {
      const pending = readArray(PENDING_KEY);
      const safePending = pending.filter(session => {
        const completedAt = Number(session?.completedAt) || 0;
        const startedAt = Number(session?.startedAt) || completedAt;
        const timestamp = completedAt || startedAt;
        return timestamp && timestamp >= createdAt - ACCOUNT_GRACE_MS;
      });
      writeArray(PENDING_KEY, safePending);
    }

    refreshUi();
  }

  function waitForAppCloudAndRefresh(userId, attempts = 0) {
    window.setTimeout(async () => {
      let currentCloudId = '';
      try { currentCloudId = cloudUser?.id || ''; } catch {}
      if (currentCloudId === userId) {
        try {
          if (typeof refreshCloudHistory === 'function') await refreshCloudHistory();
        } catch {}
        refreshUi();
        return;
      }
      if (attempts < 15) waitForAppCloudAndRefresh(userId, attempts + 1);
    }, attempts ? 200 : 0);
  }

  async function verify() {
    if (state.checking) return;
    const supabase = client();
    if (!supabase) return;
    state.checking = true;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user?.id) {
        state.ready = false;
        state.userId = '';
        state.completedCount = 0;
        return;
      }

      // If this account was already verified during this page lifetime, do not
      // repeatedly wipe/reload its local cache.
      if (state.ready && state.userId === user.id) return;

      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('id, started_at, completed_at')
        .eq('status', 'completed');
      if (error) return;

      const completedCount = Array.isArray(sessions) ? sessions.length : 0;
      const createdAt = Date.parse(user.created_at || '') || 0;

      // The database is the source of truth for signed-in accounts. Clearing the
      // browser cache first prevents another account's local history from being
      // merged or uploaded into this account during startup.
      clearBrowserHistoryFor(user.id, createdAt, completedCount);

      state.ready = true;
      state.userId = user.id;
      state.completedCount = completedCount;
      state.verifiedAt = Date.now();

      waitForAppCloudAndRefresh(user.id);
    } catch {
      // On a network failure, leave history unverified. Set History will stay
      // blank rather than showing possibly incorrect data from another account.
    } finally {
      state.checking = false;
    }
  }

  window.LevelUpAccountHistoryTruth = {
    get ready() { return state.ready; },
    get userId() { return state.userId; },
    get completedCount() { return state.completedCount; },
    get verifiedAt() { return state.verifiedAt; },
    refresh: verify
  };

  void verify();
  window.addEventListener('pageshow', () => { void verify(); });
  window.addEventListener('online', () => { state.ready = false; void verify(); });

  const supabase = client();
  if (supabase) {
    try {
      supabase.auth.onAuthStateChange((event, session) => {
        const nextId = session?.user?.id || '';
        if (nextId !== state.userId || ['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
          state.ready = false;
          state.userId = '';
          state.completedCount = 0;
          window.setTimeout(() => { void verify(); }, 0);
        }
      });
    } catch {}
  }
})();