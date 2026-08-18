(() => {
  function removeRecommendations() {
    document.querySelectorAll('#setList .weight-recommendation').forEach(card => card.remove());
    document.getElementById('trainingDetailsCard')?.remove();
  }

  function start() {
    removeRecommendations();
    const setList = document.getElementById('setList');
    if (setList) {
      new MutationObserver(removeRecommendations).observe(setList, { childList: true, subtree: true });
    }
    const profile = document.getElementById('profile');
    if (profile) {
      new MutationObserver(removeRecommendations).observe(profile, { childList: true, subtree: true });
    }
    window.setInterval(removeRecommendations, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
