(() => {
  const HELP_ID = 'restTimerInstallHelp';

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)')?.matches === true
      || navigator.standalone === true;
  }

  function needsInstall() {
    return isIOS() && !isStandalone();
  }

  function showInstallHelp() {
    alert('For lock-screen rest alerts on iPhone, add Level Up to your Home Screen first. Open the site in Safari, tap Share, choose Add to Home Screen, then launch Level Up from the new icon and enable rest alerts again.');
  }

  function update() {
    const original = document.getElementById('restTimerV3Alerts');
    if (!original) return;

    let help = document.getElementById(HELP_ID);
    if (needsInstall()) {
      original.style.display = 'none';
      if (!help) {
        help = document.createElement('button');
        help.id = HELP_ID;
        help.type = 'button';
        help.className = 'rest-timer-v3-alerts';
        help.textContent = 'Add Level Up to Home Screen for lock-screen alerts';
        help.onclick = showInstallHelp;
        original.insertAdjacentElement('afterend', help);
      }
      return;
    }

    original.style.removeProperty('display');
    help?.remove();
  }

  function start() {
    update();
    window.addEventListener('pageshow', update);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') update();
    });
    setInterval(update, 1200);
  }

  window.LevelUpRestAlertGuidance = { update };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
