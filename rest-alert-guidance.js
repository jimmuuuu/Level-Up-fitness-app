(() => {
  let observedButton = null;
  let observer = null;
  let queued = false;

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

  function update() {
    const button = document.getElementById('restTimerV3Alerts');
    if (!button) return;

    if (needsInstall()) {
      const wanted = 'Add Level Up to Home Screen for lock-screen alerts';
      if (button.disabled) button.disabled = false;
      if (button.dataset.levelupInstallRequired !== 'true') button.dataset.levelupInstallRequired = 'true';
      if (button.classList.contains('enabled')) button.classList.remove('enabled');
      if (button.textContent !== wanted) button.textContent = wanted;
    } else {
      if (button.dataset.levelupInstallRequired) delete button.dataset.levelupInstallRequired;
    }

    if (button !== observedButton) observeButton(button);
  }

  function queueUpdate() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  }

  function observeButton(button) {
    observer?.disconnect();
    observedButton = button;
    observer = new MutationObserver(queueUpdate);
    observer.observe(button, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'class']
    });
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
