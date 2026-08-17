(() => {
  const GITHUB_PAGES_APP_URL = 'https://jimmuuuu.github.io/Level-Up-fitness-app/';

  function redirectUrl() {
    if (location.hostname === 'jimmuuuu.github.io') return GITHUB_PAGES_APP_URL;
    return new URL('./', location.href).href;
  }

  function getClient() {
    if (typeof window.getSupabaseClient === 'function') return window.getSupabaseClient();
    return null;
  }

  function bindGoogleSignIn() {
    const button = document.getElementById('googleSignIn');
    if (!button || button.dataset.authRedirectFixed === 'true') return;

    button.dataset.authRedirectFixed = 'true';
    button.onclick = async () => {
      const client = getClient();
      const notice = document.getElementById('authNotice');
      if (!client) {
        if (notice) notice.textContent = 'Google sign-in is not ready yet.';
        return;
      }

      if (notice) notice.textContent = 'Opening Google sign-in...';
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl() }
      });
      if (error && notice) notice.textContent = error.message || 'Google sign-in could not start.';
    };
  }

  function keepSignedInNoticeClean() {
    const client = getClient();
    if (!client) return;
    client.auth.getSession().then(({ data }) => {
      if (data?.session) {
        const gate = document.getElementById('authGate');
        if (gate) gate.classList.add('hidden');
      }
    }).catch(() => {});
  }

  function start() {
    bindGoogleSignIn();
    keepSignedInNoticeClean();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.addEventListener('pageshow', start);
})();
