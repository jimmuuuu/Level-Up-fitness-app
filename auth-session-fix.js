(() => {
  const GITHUB_PAGES_APP_URL = 'https://jimmuuuu.github.io/Level-Up-fitness-app/';
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const CLOUD_HISTORY_PREFIX = 'levelUpFitnessCloudWorkoutHistory:';
  const HISTORY_OWNER_KEY = 'levelUpFitnessWorkoutHistoryOwner';
  const USER_PROFILE_KEY = 'levelUpFitnessUserProfile';
  const ACTIVE_WORKOUT_KEY = 'levelUpFitnessActiveWorkout';

  let boundClient = null;
  let documentClickBound = false;
  let recoveryPromise = null;

  function redirectUrl() {
    if (location.hostname === 'jimmuuuu.github.io') return GITHUB_PAGES_APP_URL;
    return new URL('./', location.href).href;
  }

  function getClient() {
    if (typeof window.getSupabaseClient === 'function') return window.getSupabaseClient();
    return null;
  }

  function readArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeArray(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value : []));
    } catch {}
  }

  function preserveVisibleHistoryFor(userId) {
    if (!userId) return;
    const visible = readArray(HISTORY_KEY);
    if (visible.length) writeArray(`${CLOUD_HISTORY_PREFIX}${userId}`, visible);
  }

  function clearVisibleHistory() {
    writeArray(HISTORY_KEY, []);
    try { localStorage.removeItem(HISTORY_OWNER_KEY); } catch {}
    try { workoutHistory = []; } catch {}
    try { if (typeof renderHome === 'function') renderHome(); } catch {}
    try { if (typeof renderProgress === 'function') renderProgress(); } catch {}
    try { if (typeof renderProfile === 'function') renderProfile(); } catch {}
  }

  function scopeVisibleHistoryToSession(session) {
    const userId = session?.user?.id || '';
    let owner = '';
    try { owner = localStorage.getItem(HISTORY_OWNER_KEY) || ''; } catch {}

    if (!userId) return;

    const expectedOwner = `cloud:${userId}`;
    if (owner && owner !== expectedOwner && owner.startsWith('cloud:')) {
      preserveVisibleHistoryFor(owner.slice('cloud:'.length));
    }

    if (owner !== expectedOwner) {
      writeArray(HISTORY_KEY, []);
      try { workoutHistory = []; } catch {}
    }

    try { localStorage.setItem(HISTORY_OWNER_KEY, expectedOwner); } catch {}
  }

  function hideAuthGate() {
    const gate = document.getElementById('authGate');
    if (gate) gate.classList.add('hidden');
  }

  async function recoverSignedInSession(session) {
    if (!session?.user) return false;
    if (recoveryPromise) return recoveryPromise;

    recoveryPromise = (async () => {
      scopeVisibleHistoryToSession(session);
      hideAuthGate();

      try {
        if (typeof window.handleCloudSession === 'function') {
          await window.handleCloudSession(session);
        } else if (typeof handleCloudSession === 'function') {
          await handleCloudSession(session);
        }
      } catch {
        // A valid Supabase session should remain signed in even if cloud profile
        // hydration temporarily fails. The next auth event or resume will retry.
      }

      hideAuthGate();
      try {
        if (typeof initializeProfile === 'function') initializeProfile();
      } catch {}
      return true;
    })().finally(() => {
      recoveryPromise = null;
    });

    return recoveryPromise;
  }

  async function verifySessionOnResume() {
    const client = getClient();
    if (!client) return;
    try {
      const { data } = await client.auth.getSession();
      if (data?.session?.user) await recoverSignedInSession(data.session);
    } catch {
      // Do not sign the person out just because a resume-time session check failed.
    }
  }

  async function startGoogleSignIn(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    const client = getClient();
    const notice = document.getElementById('authNotice');
    if (!client) {
      if (notice) notice.textContent = 'Google sign-in is not ready yet.';
      return;
    }

    if (notice) notice.textContent = 'Choose the Google account you want to use...';

    try {
      const { data } = await client.auth.getSession();
      const currentId = data?.session?.user?.id || '';
      if (currentId) preserveVisibleHistoryFor(currentId);

      await client.auth.signOut({ scope: 'local' });
      clearVisibleHistory();
      try { localStorage.removeItem(USER_PROFILE_KEY); } catch {}
      try { localStorage.removeItem(ACTIVE_WORKOUT_KEY); } catch {}
    } catch {
      // Continue to OAuth even if local cleanup has nothing to remove.
    }

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl(),
        queryParams: { prompt: 'select_account' }
      }
    });
    if (error && notice) notice.textContent = error.message || 'Google sign-in could not start.';
  }

  function installGlobalOverride() {
    try { window.signInWithGoogle = startGoogleSignIn; } catch {}
    window.LevelUpGoogleRedirectUrl = redirectUrl;
  }

  function bindGoogleSignIn() {
    if (documentClickBound) return;
    documentClickBound = true;

    document.addEventListener('click', event => {
      const target = event.target.closest?.('#googleSignIn, #switchToGoogle');
      if (!target) return;
      void startGoogleSignIn(event);
    }, true);
  }

  function bindSessionIsolation() {
    const client = getClient();
    if (!client || boundClient === client) return;
    boundClient = client;

    client.auth.getSession().then(({ data }) => {
      if (data?.session?.user) void recoverSignedInSession(data.session);
    }).catch(() => {});

    client.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // app.js previously treated TOKEN_REFRESHED and other valid-session events
        // like sign-outs. Rehydrate immediately so a token refresh can never kick
        // the user back to the login screen.
        void recoverSignedInSession(session);
        return;
      }

      if (event !== 'SIGNED_OUT') return;

      // Confirm the session is truly gone before clearing account-scoped history.
      // This protects against transient auth events during iPhone app resume.
      window.setTimeout(async () => {
        try {
          const { data } = await client.auth.getSession();
          if (data?.session?.user) {
            await recoverSignedInSession(data.session);
            return;
          }
        } catch {}
        clearVisibleHistory();
      }, 250);
    });
  }

  function start() {
    installGlobalOverride();
    bindGoogleSignIn();
    bindSessionIsolation();
    void verifySessionOnResume();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.addEventListener('pageshow', start);
  window.addEventListener('focus', () => { void verifySessionOnResume(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void verifySessionOnResume();
  });
  window.addEventListener('load', () => setTimeout(start, 0), { once: true });
})();
