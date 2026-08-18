(() => {
  const RECOVERY_PREFIX = 'levelUpFitnessWorkoutRecoveryV2:';
  const REST_ALERT_KEY = 'levelUpFitnessRestAlertsEnabled';
  let tickTimer = null;
  let lastRestEnd = 0;
  let lastRecoverySignature = '';
  let observer = null;

  const byId = id => document.getElementById(id);

  function accountKey() {
    try {
      if (typeof draftAccountKey === 'function') return String(draftAccountKey() || 'local');
    } catch {}
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return `cloud:${cloudUser.id}`;
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
    } catch {}
    return 'local';
  }

  function activeSession() {
    try { return typeof activeSessionId !== 'undefined' ? String(activeSessionId || '') : ''; }
    catch { return ''; }
  }

  function activeWorkout() {
    try { return typeof activePlan !== 'undefined' ? activePlan : null; }
    catch { return null; }
  }

  function startedAt() {
    try { return Number(activeStartedAt) || 0; }
    catch { return 0; }
  }

  function restEndsAt() {
    try { return Number(restTimerEndsAt) || 0; }
    catch { return 0; }
  }

  function formatDuration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function ensureStatusCard() {
    const active = byId('active');
    if (!active || byId('workoutSessionStatus')) return;
    const card = document.createElement('div');
    card.id = 'workoutSessionStatus';
    card.className = 'workout-session-status';
    card.innerHTML = `
      <strong id="workoutSessionName">Active workout</strong>
      <span id="workoutSessionTime" class="workout-session-time">0:00</span>
      <div id="workoutSessionRest" class="workout-session-rest">Save a set to start the rest timer.</div>`;
    const clock = active.querySelector('.active-session-clock');
    if (clock) clock.insertAdjacentElement('afterend', card);
    else active.insertBefore(card, active.firstChild);
  }

  function currentExerciseLabel() {
    const setList = byId('setList');
    if (!setList) return '';
    const rows = [...setList.querySelectorAll('.set-row')];
    for (const row of rows) {
      const pending = [...row.querySelectorAll('button[data-log]')].find(button => !button.classList.contains('done'));
      if (pending) return row.querySelector('.exercise-heading h3')?.textContent?.trim() || '';
    }
    return rows.at(-1)?.querySelector('.exercise-heading h3')?.textContent?.trim() || '';
  }

  function updateStatus() {
    ensureStatusCard();
    const plan = activeWorkout();
    const session = activeSession();
    const card = byId('workoutSessionStatus');
    if (!card) return;

    const activePage = byId('active');
    const isActive = Boolean(plan && session);
    card.classList.toggle('hidden', !isActive);
    if (!isActive) return;

    const name = byId('workoutSessionName');
    const time = byId('workoutSessionTime');
    const rest = byId('workoutSessionRest');
    if (name) name.textContent = plan?.name || 'Active workout';
    if (time) time.textContent = formatDuration(Date.now() - (startedAt() || Date.now()));

    const end = restEndsAt();
    const remaining = Math.max(0, end - Date.now());
    if (rest) {
      if (end && remaining > 0) {
        rest.classList.add('active');
        const next = currentExerciseLabel();
        rest.textContent = `Rest ${formatDuration(remaining)}${next ? ` · Next: ${next}` : ''}`;
      } else {
        rest.classList.remove('active');
        rest.textContent = 'Ready for your next set.';
      }
    }

    if (activePage && !activePage.classList.contains('hidden')) {
      try { sessionStorage.setItem('levelUpFitnessLastPage', 'active'); } catch {}
    }

    if (end && end !== lastRestEnd) {
      lastRestEnd = end;
      maybeShowRestAlert(end, currentExerciseLabel());
    }
  }

  function recoveryKey() {
    return `${RECOVERY_PREFIX}${accountKey()}`;
  }

  function collectInputs() {
    const session = activeSession();
    const plan = activeWorkout();
    if (!session || !plan) return null;
    const setList = byId('setList');
    const values = {};
    if (setList) {
      setList.querySelectorAll('input[id^="w-"], input[id^="r-"]').forEach(input => {
        if (input.value !== '') values[input.id] = input.value;
      });
      setList.querySelectorAll('[data-type-log]').forEach(select => {
        if (select.value) values[`type:${select.dataset.typeLog}`] = select.value;
      });
    }
    let savedLogs = [];
    try { savedLogs = Array.isArray(logs) ? logs : []; } catch {}
    return {
      version: 2,
      accountKey: accountKey(),
      sessionId: session,
      planId: (() => { try { return typeof planIdFor === 'function' ? planIdFor(plan) : String(plan?.id || ''); } catch { return String(plan?.id || ''); } })(),
      startedAt: startedAt(),
      updatedAt: Date.now(),
      values,
      logs: savedLogs,
      restEndsAt: restEndsAt()
    };
  }

  function saveRecovery(force = false) {
    const payload = collectInputs();
    if (!payload) return;
    const signature = JSON.stringify([payload.sessionId, payload.values, payload.logs, payload.restEndsAt]);
    if (!force && signature === lastRecoverySignature) return;
    lastRecoverySignature = signature;
    try { localStorage.setItem(recoveryKey(), JSON.stringify(payload)); } catch {}
    try { if (typeof persistActiveWorkout === 'function') persistActiveWorkout(); } catch {}
  }

  function readRecovery() {
    try {
      const value = JSON.parse(localStorage.getItem(recoveryKey()) || 'null');
      return value?.version === 2 ? value : null;
    } catch { return null; }
  }

  function restoreUnsavedInputs() {
    const recovery = readRecovery();
    const session = activeSession();
    if (!recovery || !session || recovery.sessionId !== session) return;
    const setList = byId('setList');
    if (!setList) return;
    Object.entries(recovery.values || {}).forEach(([key, value]) => {
      if (key.startsWith('type:')) {
        const select = setList.querySelector(`[data-type-log="${CSS.escape(key.slice(5))}"]`);
        if (select && !select.disabled) select.value = value;
        return;
      }
      const input = byId(key);
      if (input && !input.readOnly && input.value === '') input.value = value;
    });
  }

  function cleanupFinishedRecovery() {
    if (activeSession()) return;
    try { localStorage.removeItem(recoveryKey()); } catch {}
    lastRecoverySignature = '';
  }

  function alertsEnabled() {
    try { return localStorage.getItem(REST_ALERT_KEY) === 'true'; }
    catch { return false; }
  }

  async function maybeShowRestAlert(end, nextExercise) {
    if (!alertsEnabled() || !('Notification' in window) || Notification.permission !== 'granted') return;
    const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    if (!seconds) return;
    const body = `${seconds}s rest${nextExercise ? ` · Next: ${nextExercise}` : ''}. Return when the timer reaches zero.`;
    try {
      const registration = await navigator.serviceWorker?.ready;
      if (registration?.showNotification) {
        await registration.showNotification('Level Up · Rest timer', {
          body,
          tag: 'level-up-rest',
          renotify: true,
          silent: true,
          icon: 'assets/app-icon-192.png',
          badge: 'assets/app-icon-192.png'
        });
      }
    } catch {}
  }

  async function enableAlerts() {
    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      const enabled = permission === 'granted';
      localStorage.setItem(REST_ALERT_KEY, enabled ? 'true' : 'false');
      return enabled;
    } catch { return false; }
  }

  function bindRecoveryEvents() {
    const active = byId('active');
    if (!active || active.dataset.recoveryBound === 'true') return;
    active.dataset.recoveryBound = 'true';

    active.addEventListener('input', () => saveRecovery(false), true);
    active.addEventListener('change', () => saveRecovery(true), true);
    active.addEventListener('click', event => {
      if (event.target.closest('[data-log], #finish, #discardWorkout')) {
        window.setTimeout(() => {
          saveRecovery(true);
          cleanupFinishedRecovery();
          restoreUnsavedInputs();
        }, 80);
      }
    }, true);
  }

  function startObserver() {
    const active = byId('active');
    if (!active || observer) return;
    observer = new MutationObserver(() => {
      ensureStatusCard();
      bindRecoveryEvents();
      restoreUnsavedInputs();
      updateStatus();
    });
    observer.observe(active, { childList: true, subtree: true });
  }

  function start() {
    ensureStatusCard();
    bindRecoveryEvents();
    startObserver();
    restoreUnsavedInputs();
    updateStatus();

    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      updateStatus();
      saveRecovery(false);
      restoreUnsavedInputs();
      cleanupFinishedRecovery();
    }, 1000);

    window.addEventListener('pagehide', () => saveRecovery(true));
    window.addEventListener('beforeunload', () => saveRecovery(true));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveRecovery(true);
      else {
        restoreUnsavedInputs();
        updateStatus();
      }
    });
  }

  window.LevelUpWorkoutSession = {
    enableLockScreenRestAlerts: enableAlerts,
    saveRecovery: () => saveRecovery(true),
    restoreUnsavedInputs
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
