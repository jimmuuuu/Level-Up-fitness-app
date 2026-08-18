(() => {
  const GLOBAL_HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const CLOUD_HISTORY_PREFIX = 'levelUpFitnessCloudWorkoutHistory:';
  const OWNER_KEY = 'levelUpFitnessWorkoutHistoryOwner';
  const LEGACY_BACKUP_KEY = 'levelUpFitnessLegacyWorkoutHistoryBackup';
  const ACCOUNT_GRACE_MS = 5 * 60 * 1000;

  let patched = false;
  let lastScope = '';

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

  function cloudCreatedAt() {
    try {
      const parsed = Date.parse(cloudUser?.created_at || '');
      return Number.isFinite(parsed) ? parsed : 0;
    } catch {
      return 0;
    }
  }

  function scopeInfo() {
    try {
      if (cloudUser?.id) {
        return {
          id: `cloud:${cloudUser.id}`,
          cloud: true,
          userId: cloudUser.id,
          createdAt: cloudCreatedAt()
        };
      }
    } catch {}

    try {
      if (userProfile) {
        const accountKey = String(userProfile.accountKey || '').trim();
        const email = String(userProfile.email || '').trim().toLowerCase();
        const identity = accountKey || email;
        if (identity) return { id: `local:${identity}`, cloud: false, userId: '', createdAt: 0 };
      }
    } catch {}

    return { id: '', cloud: false, userId: '', createdAt: 0 };
  }

  function sessionIsPossibleForScope(session, scope = scopeInfo()) {
    if (!session || !session.id) return false;
    if (!scope.cloud || !scope.createdAt) return true;
    const completedAt = Number(session.completedAt) || 0;
    const startedAt = Number(session.startedAt) || completedAt;
    const timestamp = completedAt || startedAt;
    if (!timestamp) return true;
    return timestamp >= scope.createdAt - ACCOUNT_GRACE_MS;
  }

  function filterForScope(history, scope = scopeInfo()) {
    const rows = Array.isArray(history) ? history : [];
    return rows.filter(session => sessionIsPossibleForScope(session, scope));
  }

  function accountHistory(scope = scopeInfo()) {
    if (!scope.id) return [];
    if (scope.cloud && scope.userId) {
      return filterForScope(readArray(`${CLOUD_HISTORY_PREFIX}${scope.userId}`), scope);
    }

    const owner = (() => {
      try { return localStorage.getItem(OWNER_KEY) || ''; } catch { return ''; }
    })();
    return owner === scope.id ? readArray(GLOBAL_HISTORY_KEY) : [];
  }

  function backupLegacyHistoryIfNeeded(scope) {
    if (!scope.id) return;
    try {
      const owner = localStorage.getItem(OWNER_KEY) || '';
      const globalHistory = readArray(GLOBAL_HISTORY_KEY);
      if (globalHistory.length && owner !== scope.id && !localStorage.getItem(LEGACY_BACKUP_KEY)) {
        localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify({
          owner: owner || 'unscoped',
          savedAt: Date.now(),
          history: globalHistory
        }));
      }
    } catch {}
  }

  function writeScopedHistory(history, scope = scopeInfo()) {
    if (!scope.id) return false;
    const clean = filterForScope(history, scope);
    backupLegacyHistoryIfNeeded(scope);
    const globalSaved = writeArray(GLOBAL_HISTORY_KEY, clean);
    let accountSaved = true;
    if (scope.cloud && scope.userId) accountSaved = writeArray(`${CLOUD_HISTORY_PREFIX}${scope.userId}`, clean);
    try { localStorage.setItem(OWNER_KEY, scope.id); } catch {}
    return globalSaved && accountSaved;
  }

  function patchHistoryFunctions() {
    if (patched) return;
    patched = true;

    try {
      loadHistory = function () {
        const scope = scopeInfo();
        if (!scope.id) return [];
        return accountHistory(scope);
      };
    } catch {}

    try {
      loadAccountHistory = function () {
        const scope = scopeInfo();
        return scope.cloud ? accountHistory(scope) : [];
      };
    } catch {}

    try {
      saveHistory = function (history = workoutHistory) {
        const scope = scopeInfo();
        if (!scope.id) return false;
        return writeScopedHistory(history, scope);
      };
    } catch {}

    try {
      const originalFetchCloudWorkoutHistory = fetchCloudWorkoutHistory;
      fetchCloudWorkoutHistory = async function () {
        const rows = await originalFetchCloudWorkoutHistory();
        return filterForScope(rows, scopeInfo());
      };
    } catch {}

    try {
      importLocalHistoryIfNeeded = async function (cloudHistory) {
        if (!cloudReady || !cloudUser) return filterForScope(cloudHistory, scopeInfo());
        const scope = scopeInfo();
        const cleanCloud = filterForScope(cloudHistory, scope);
        const localHistory = filterForScope(loadAccountHistory(), scope);
        const unsyncedLocal = localHistory.filter(localSession =>
          localSession?.id && !cleanCloud.some(cloudSession => cloudSession.id === localSession.id)
        );

        for (const session of unsyncedLocal) {
          try {
            await uploadCloudWorkoutSession(session);
          } catch {
            try { queuePendingCloudSession(session); } catch {}
          }
        }
        return typeof mergeHistory === 'function' ? mergeHistory(localHistory, cleanCloud) : [...cleanCloud, ...unsyncedLocal];
      };
    } catch {}
  }

  function refreshDecorations() {
    const setList = document.getElementById('setList');
    if (setList) {
      setList.querySelectorAll('.set-history-compare').forEach(node => node.remove());
      setList.querySelectorAll('.set-row').forEach(row => {
        delete row.dataset.historyComparisonReady;
      });
    }

    try {
      if (window.LevelUpTrainingStats?.reload) void window.LevelUpTrainingStats.reload();
    } catch {}
  }

  function renderCurrentAccount() {
    try { if (typeof renderHome === 'function') renderHome(); } catch {}
    try { if (typeof renderProgress === 'function') renderProgress(); } catch {}
    try { if (typeof renderProfile === 'function') renderProfile(); } catch {}
    refreshDecorations();
  }

  function applyIsolation(force = false) {
    patchHistoryFunctions();
    const scope = scopeInfo();
    if (!scope.id) return false;
    if (!force && scope.id === lastScope) return true;
    lastScope = scope.id;

    const clean = accountHistory(scope);
    try { workoutHistory = clean; } catch {}
    writeScopedHistory(clean, scope);
    renderCurrentAccount();
    return true;
  }

  window.LevelUpHistoryIsolation = {
    apply: () => applyIsolation(true),
    currentScope: () => ({ ...scopeInfo() })
  };

  patchHistoryFunctions();
  applyIsolation(true);

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const ready = applyIsolation(false);
    if ((ready && attempts >= 4) || attempts >= 30) window.clearInterval(timer);
  }, 400);

  window.addEventListener('pageshow', () => applyIsolation(true));
})();
