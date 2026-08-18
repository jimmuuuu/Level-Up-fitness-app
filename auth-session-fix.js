(() => {
  const GITHUB_PAGES_APP_URL = 'https://jimmuuuu.github.io/Level-Up-fitness-app/';
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const CLOUD_HISTORY_PREFIX = 'levelUpFitnessCloudWorkoutHistory:';
  const HISTORY_OWNER_KEY = 'levelUpFitnessWorkoutHistoryOwner';
  const USER_PROFILE_KEY = 'levelUpFitnessUserProfile';
  const ACTIVE_WORKOUT_KEY = 'levelUpFitnessActiveWorkout';

  let boundClient = null;

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

    if (!userId) {
      clearVisibleHistory();
      return;
    }

    const expectedOwner = `cloud:${userId}`;
    if (owner && owner !== expectedOwner && owner.startsWith('cloud:')) {
      preserveVisibleHistoryFor(owner.slice('cloud:'.length));
    }

    // Never carry the visible history from one Google account into another.
    // The current account's database history will be loaded by the app after auth hydration.
    if (owner !== expectedOwner) {
      writeArray(HISTORY_KEY, []);
      try { workoutHistory = []; } catch {}
    }

    try { localStorage.setItem(HISTORY_OWNER_KEY, expectedOwner); } catch {}
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

      // End only this browser session before starting OAuth. This prevents an
      // already-signed-in account from silently winning the next login attempt.
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

  function bindGoogleSignIn() {
    const button = document.getElementById('googleSignIn');
    if (!button || button.dataset.authRedirectFixed === 'true') return;

    button.dataset.authRedirectFixed = 'true';
    // Capture-phase listener runs before the legacy onclick in app.js.
    button.addEventListener('click', startGoogleSignIn, true);
  }

  function bindSessionIsolation() {
    const client = getClient();
    if (!client || boundClient === client) return;
    boundClient = client;

    client.auth.getSession().then(({ data }) => {
      scopeVisibleHistoryToSession(data?.session || null);
      if (data?.session) {
        const gate = document.getElementById('authGate');
        if (gate) gate.classList.add('hidden');
      }
    }).catch(() => {});

    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearVisibleHistory();
        return;
      }
      if (session?.user) scopeVisibleHistoryToSession(session);
    });
  }

  function start() {
    bindGoogleSignIn();
    bindSessionIsolation();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.addEventListener('pageshow', start);
  window.addEventListener('load', () => setTimeout(start, 0), { once: true });
})();
