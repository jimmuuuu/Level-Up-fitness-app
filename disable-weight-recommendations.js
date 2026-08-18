(() => {
  // CSS is the permanent fail-safe. This script only removes any legacy cards
  // that were already in the DOM when the page loaded; it does not observe or
  // continuously mutate the page.
  function removeLegacyRecommendations() {
    document.querySelectorAll('#setList .weight-recommendation').forEach(card => card.remove());
    document.getElementById('trainingDetailsCard')?.remove();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeLegacyRecommendations, { once: true });
  } else {
    removeLegacyRecommendations();
  }
})();
