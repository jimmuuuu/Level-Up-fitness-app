(() => {
  // Compatibility cleanup only. The per-exercise History button was removed
  // from active workouts because it added clutter without enough value there.
  function removeHistoryUi() {
    document.querySelectorAll('#setList .exercise-facts-button').forEach(button => button.remove());
    document.getElementById('exerciseFactsModal')?.remove();
  }

  function start() {
    removeHistoryUi();
    const list = document.getElementById('setList');
    if (list) {
      new MutationObserver(() => requestAnimationFrame(removeHistoryUi))
        .observe(list, { childList: true, subtree: true });
    }
    window.addEventListener('pageshow', removeHistoryUi);
  }

  // Keep the old global harmless so any stale code that checks for it does not fail.
  window.LevelUpExerciseHistoryFacts = { open: () => {} };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
