(() => {
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const CLOUD_HISTORY_PREFIX = 'levelUpFitnessCloudWorkoutHistory:';
  const HISTORY_OWNER_KEY = 'levelUpFitnessWorkoutHistoryOwner';
  const USER_PROFILE_KEY = 'levelUpFitnessUserProfile';
  const ACTIVE_WORKOUT_KEY = 'levelUpFitnessActiveWorkout';
  const GITHUB_PAGES_APP_URL = 'https://jimmuuuu.github.io/Level-Up-fitness-app/';

  let initialized = false;

  function getClient() {
    try { return typeof getSupabaseClient === 'function' ? getSupabaseClient() : null; }
    catch { return null; }
  }

  function readArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeArray(key, rows) {
    try { localStorage.setItem(key, JSON.stringify(Array.isArray(rows) ? rows : [])); } catch {}
  }

  function redirectUrl() {
    return location.hostname === 'jimmuuuu.github.io'
      ? GITHUB_PAGES_APP_URL
      : new URL('./', location.href).href;
  }

  function saveVisibleHistoryFor(userId) {
    if (!userId) return;
    const rows = readArray(HISTORY_KEY);
    if (rows.length) writeArray(`${CLOUD_HISTORY_PREFIX}${userId}`, rows);
  }

  function clearVisibleHistory() {
    writeArray(HISTORY_KEY, []);
    try { localStorage.removeItem(HISTORY_OWNER_KEY); } catch {}
    try { workoutHistory = []; } catch {}
    try { if (typeof renderHome === 'function') renderHome(); } catch {}
    try { if (typeof renderProgress === 'function') renderProgress(); } catch {}
    try { if (typeof renderProfile === 'function') renderProfile(); } catch {}
  }

  function scopeToSession(session) {
    const userId = session?.user?.id || '';
    let owner = '';
    try { owner = localStorage.getItem(HISTORY_OWNER_KEY) || ''; } catch {}

    if (!userId) {
      clearVisibleHistory();
      return;
    }

    const expected = `cloud:${userId}`;
    if (owner && owner !== expected && owner.startsWith('cloud:')) {
      saveVisibleHistoryFor(owner.slice(6));
    }

    if (owner !== expected) {
      writeArray(HISTORY_KEY, []);
      try { workoutHistory = []; } catch {}
    }
    try { localStorage.setItem(HISTORY_OWNER_KEY, expected); } catch {}
  }

  async function forceAccountChooser(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    const client = getClient();
    const notice = document.getElementById('authNotice');
    if (!client) {
      if (notice) notice.textContent = 'Google sign-in is not ready yet.';
      return;
    }

    if (notice) notice.textContent = 'Choose the Google account you want to use...';

    try {
      const { data } = await client.auth.getSession();
      const oldId = data?.session?.user?.id || '';
      if (oldId) saveVisibleHistoryFor(oldId);
      await client.auth.signOut({ scope: 'local' });
    } catch {}

    clearVisibleHistory();
    try { localStorage.removeItem(USER_PROFILE_KEY); } catch {}
    try { localStorage.removeItem(ACTIVE_WORKOUT_KEY); } catch {}

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl(),
        queryParams: { prompt: 'select_account' }
      }
    });
    if (error && notice) notice.textContent = error.message || 'Google sign-in could not start.';
  }

  function bind() {
    if (initialized) return;
    const client = getClient();
    const button = document.getElementById('googleSignIn');
    if (!client || !button) return;
    initialized = true;

    // Remove the older helper's capture listener by replacing the button with an
    // identical clone, then install one account-safe handler.
    const replacement = button.cloneNode(true);
    button.replaceWith(replacement);
    replacement.addEventListener('click', forceAccountChooser, true);

    client.auth.getSession().then(({ data }) => scopeToSession(data?.session || null)).catch(() => {});
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') clearVisibleHistory();
      else if (session?.user) scopeToSession(session);
    });

    window.LevelUpAccountSwitchFix = { version: 2, forceAccountChooser };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  window.addEventListener('pageshow', bind);
})();
