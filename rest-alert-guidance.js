(() => {
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)')?.matches === true
      || navigator.standalone === true;
  }

  function update() {
    const button = document.getElementById('restTimerV3Alerts');
    if (!button) return;

    if (isIOS() && !isStandalone()) {
      button.disabled = false;
      button.dataset.levelupInstallRequired = 'true';
      button.classList.remove('enabled');
      button.textContent = 'Add Level Up to Home Screen for lock-screen alerts';
      return;
    }

    delete button.dataset.levelupInstallRequired;
  }

  function showInstallHelp() {
    alert('For lock-screen rest alerts on iPhone, add Level Up to your Home Screen first. Open the site in Safari, tap Share, choose Add to Home Screen, then launch Level Up from the new icon and enable rest alerts again.');
  }

  function start() {
    update();
    document.addEventListener('click', event => {
      const button = event.target.closest?.('#restTimerV3Alerts');
      if (!button || button.dataset.levelupInstallRequired !== 'true') return;
      event.preventDefault();
      showInstallHelp();
    });
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
