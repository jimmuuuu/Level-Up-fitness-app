(() => {
  function refreshSettingsWhenOpened() {
    const page = document.getElementById('settings');
    if (!page || page.dataset.companionQualityObserved === 'true') return;
    page.dataset.companionQualityObserved = 'true';
    new MutationObserver(() => {
      if (!page.classList.contains('hidden')) {
        try { window.LevelUpExtraSettings?.refresh?.(); } catch {}
      }
    }).observe(page, { attributes: true, attributeFilter: ['class'] });
  }

  function refreshCompanionUi() {
    refreshSettingsWhenOpened();
    try { window.LevelUpExerciseHistoryFacts && document.getElementById('setList'); } catch {}
    try { window.LevelUpWorkoutCalendar?.render?.(); } catch {}
    try { window.LevelUpProgressInsights?.render?.(); } catch {}
  }

  function start() {
    refreshCompanionUi();
    window.addEventListener('pageshow', refreshCompanionUi);
    window.addEventListener('levelup:history-v5-ready', refreshCompanionUi);
    window.addEventListener('levelup:history-enriched', refreshCompanionUi);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
