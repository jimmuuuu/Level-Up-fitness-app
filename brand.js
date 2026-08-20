(() => {
  // The Level Up mark is reserved for the installed app icon / Home Screen icon.
  // Do not inject logo, splash, or brand blocks inside the app UI.
  const selectors = [
    '#levelUpOpeningSplash',
    '.level-up-auth-brand',
    '.level-up-workout-brand',
    '.level-up-profile-brand',
    '.level-up-splash-inner',
    '.level-up-splash-mark-wrap',
    '.level-up-splash-mark',
    '.level-up-splash-wordmark',
    '.level-up-splash-loader'
  ];

  function removeInAppLogoElements() {
    document.querySelectorAll(selectors.join(',')).forEach(element => element.remove());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeInAppLogoElements, { once: true });
  } else {
    removeInAppLogoElements();
  }

  window.addEventListener('load', removeInAppLogoElements, { once: true });
})();
