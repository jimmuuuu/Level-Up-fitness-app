(() => {
  let forcing = false;
  let timerWatchdog = null;
  let identityCheckRunning = false;
  let identityMismatch = false;

  if (!document.querySelector('script[data-authoritative-history-sync]')) {
    const sync = document.createElement('script');
    sync.src = 'authoritative-history-sync.js?v=1';
    sync.dataset.authoritativeHistorySync = 'true';
    document.body.appendChild(sync);
  }

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

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function currentProfileIdentity() {
    try {
      return {
        provider: String(userProfile?.provider || ''),
        email: normalizeEmail(userProfile?.email),
        cloudUserId: String(userProfile?.cloudUserId || '')
      };
    } catch {
      return { provider: '', email: '', cloudUserId: '' };
    }
  }

  function activePlanId() {
    try {
      if (typeof activePlan === 'undefined' || !activePlan) return '';
      return typeof planIdFor === 'function' ? String(planIdFor(activePlan) || '') : String(activePlan.id || '');
    } catch {
      return '';
    }
  }

  function mostLikelyWeeklyPlanOwner() {
    const planId = activePlanId();
    if (!planId.startsWith('custom-auto-weekly-')) return '';

    let bestOwner = '';
    let bestUpdatedAt = 0;
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index) || '';
        const prefix = 'levelUpFitnessWeeklyPlan:';
        if (!key.startsWith(prefix)) continue;
        let config = null;
        try { config = JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
        if (!config || !Array.isArray(config.planIds) || !config.planIds.includes(planId)) continue;
        const updatedAt = Number(config.updatedAt) || 0;
        if (updatedAt >= bestUpdatedAt) {
          bestUpdatedAt = updatedAt;
          bestOwner = key.slice(prefix.length);
        }
      }
    } catch {}
    return bestOwner;
  }

  function authoritativeHistoryIsEmpty() {
    try {
      const source = window.LevelUpAuthoritativeHistory;
      if (source?.cloud && source.ready) {
        const history = source.getHistory?.();
        if (Array.isArray(history) && history.length === 0) return true;
      }
    } catch {}

    try {
      const truth = window.LevelUpAccountHistoryTruth;
      if (truth?.ready && Number(truth.completedCount) === 0) return true;
    } catch {}
    return false;
  }

  function generatedPlanBelongsToDifferentAccount(authUserId) {
    if (!authUserId) return false;
    const owner = mostLikelyWeeklyPlanOwner();
    if (!owner) return false;
    // Cloud-generated weekly plans use the Supabase user id as the storage scope.
    // If the newest matching weekly plan belongs to another id, never borrow the
    // current Supabase session's workout history for this active workout.
    if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(owner)) return owner !== authUserId;
    return false;
  }

  function shouldSuppressHistory() {
    if (identityMismatch) return true;
    if (authoritativeHistoryIsEmpty()) return true;

    try {
      const authId = String(window.LevelUpAuthoritativeHistory?.userId || cloudUser?.id || '');
      if (generatedPlanBelongsToDifferentAccount(authId)) return true;
    } catch {}
    return false;
  }

  async function verifyAccountIdentity() {
    if (identityCheckRunning) return;
    identityCheckRunning = true;
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) {
        identityMismatch = false;
        return;
      }
      const { data } = await client.auth.getSession();
      const authUser = data?.session?.user || null;
      const profile = currentProfileIdentity();

      if (!authUser) {
        identityMismatch = false;
        return;
      }

      const authEmail = normalizeEmail(authUser.email);
      const profileIsGoogle = profile.provider === 'google';
      const emailMismatch = Boolean(profile.email && authEmail && profile.email !== authEmail);
      const idMismatch = Boolean(profile.cloudUserId && profile.cloudUserId !== authUser.id);
      const localProfileWithCloudSession = Boolean(profile.provider && !profileIsGoogle);
      const weeklyOwnerMismatch = generatedPlanBelongsToDifferentAccount(authUser.id);

      identityMismatch = emailMismatch || idMismatch || localProfileWithCloudSession || weeklyOwnerMismatch;
      if (shouldSuppressHistory()) enforceIdentitySafeHistory();
    } catch {
      // If identity cannot be verified, leave existing data untouched until the next check.
    } finally {
      identityCheckRunning = false;
    }
  }

  function enforceIdentitySafeHistory() {
    const setList = document.getElementById('setList');
    if (!setList) return;

    setList.querySelectorAll('.set-history-compare').forEach(box => {
      box.dataset.tone = 'baseline';
      const summary = box.querySelector('.set-history-summary');
      const detail = box.querySelector('.set-history-detail');
      if (summary) summary.textContent = 'First time in this workout';
      if (detail) detail.textContent = 'Save this set to create this workout history.';
    });

    setList.querySelectorAll('.weight-recommendation').forEach(card => {
      if (/your exercise history/i.test(card.textContent || '')) {
        card.style.display = 'none';
        card.dataset.identityHistoryHidden = 'true';
      }
    });
  }

  function keepIdentityHistorySafe() {
    if (shouldSuppressHistory()) enforceIdentitySafeHistory();
  }

  document.addEventListener('click', event => {
    const start = event.target.closest?.('#start');
    if (!start) return;
    scheduleActivePageCheck();
    window.setTimeout(() => { void verifyAccountIdentity(); }, 0);
  });

  window.addEventListener('levelup:authoritative-history-ready', () => {
    void verifyAccountIdentity();
    keepIdentityHistorySafe();
  });

  window.addEventListener('pageshow', () => {
    if (activeWorkoutExists()) ensureSessionTimer();
    void verifyAccountIdentity();
    keepIdentityHistorySafe();
  });

  window.addEventListener('load', () => {
    void verifyAccountIdentity();
    window.setInterval(() => {
      void verifyAccountIdentity();
      keepIdentityHistorySafe();
    }, 250);
  }, { once: true });
})();
