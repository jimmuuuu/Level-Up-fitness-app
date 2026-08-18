(() => {
  // Weight recommendations were intentionally removed after real-gym testing.
  // Keep a tiny compatibility API because other helpers may call reload().
  function purgeLegacyUi() {
    document.querySelectorAll('#setList .weight-recommendation').forEach(card => card.remove());
    document.getElementById('trainingDetailsCard')?.remove();
  }

  window.LevelUpTrainingStats = {
    get: () => ({ heightInches: 0, weightLbs: 0, userId: '', loaded: true }),
    reload: async () => { purgeLegacyUi(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', purgeLegacyUi, { once: true });
  } else {
    purgeLegacyUi();
  }
})();
