(() => {
  const LAST_PAGE_KEY = 'levelUpFitnessLastPage';

  function workoutTab() {
    return document.querySelector('.tabs button[data-page="workout"]');
  }

  function redirectHomeToWorkout() {
    const home = document.getElementById('home');
    if (!home || home.classList.contains('hidden')) return;
    const tab = workoutTab();
    if (tab) tab.click();
  }

  function setupProfileSettings() {
    const profile = document.getElementById('profile');
    const signOut = document.getElementById('signOut');
    if (!profile || !signOut || document.getElementById('profileSettingsPanel')) return;

    const panel = document.createElement('section');
    panel.id = 'profileSettingsPanel';
    panel.className = 'profile-settings-panel';
    panel.setAttribute('aria-labelledby', 'profileSettingsTitle');
    panel.innerHTML = `
      <div class="over">SETTINGS</div>
      <h2 id="profileSettingsTitle">Account & app</h2>
      <p class="profile-settings-copy">Manage account options here. More app settings can be added as Level Up grows.</p>
    `;

    const note = profile.querySelector('.signout-note');
    signOut.parentNode.insertBefore(panel, signOut);
    panel.appendChild(signOut);
    if (note) panel.appendChild(note);

    const shortcut = document.createElement('button');
    shortcut.type = 'button';
    shortcut.className = 'profile-settings-shortcut';
    shortcut.textContent = 'Settings';
    shortcut.setAttribute('aria-controls', panel.id);
    shortcut.onclick = () => panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) syncStatus.insertAdjacentElement('afterend', shortcut);
    else profile.querySelector('.profile-email')?.insertAdjacentElement('afterend', shortcut);
  }

  function loadFeature(styleFlag, styleHref, scriptFlag, scriptSrc) {
    if (!document.querySelector(`link[${styleFlag}]`)) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = styleHref;
      style.setAttribute(styleFlag, 'true');
      document.head.appendChild(style);
    }
    if (!document.querySelector(`script[${scriptFlag}]`)) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.setAttribute(scriptFlag, 'true');
      document.body.appendChild(script);
    }
  }

  function loadScanFeature() {
    loadFeature('data-scan-feature-style', 'scan-feature.css?v=1', 'data-scan-feature', 'scan-feature.js?v=1');
  }

  function loadGymPasses() {
    loadFeature('data-gym-passes-style', 'gym-passes.css?v=1', 'data-gym-passes', 'gym-passes.js?v=1');
  }

  function start() {
    try {
      const remembered = sessionStorage.getItem(LAST_PAGE_KEY) || '';
      if (!remembered || remembered === 'home') sessionStorage.setItem(LAST_PAGE_KEY, 'workout');
    } catch {}

    setupProfileSettings();
    loadScanFeature();
    loadGymPasses();
    redirectHomeToWorkout();

    const home = document.getElementById('home');
    if (home) {
      const observer = new MutationObserver(redirectHomeToWorkout);
      observer.observe(home, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
