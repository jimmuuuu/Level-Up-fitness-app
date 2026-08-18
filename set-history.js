(() => {
  const legacySelector = '#setList .set-history-compare:not([data-history-v6="true"])';

  const sanitizeHistoryUi = () => {
    document.querySelectorAll(legacySelector).forEach(node => node.remove());

    const hasVerifiedV6History = Boolean(document.querySelector('#setList .set-history-compare[data-history-v6="true"]'));
    document.querySelectorAll('#setList .weight-recommendation').forEach(card => {
      const historyBased = /your exercise history/i.test(card.textContent || '');
      if (historyBased && !hasVerifiedV6History) {
        card.style.display = 'none';
        card.dataset.legacyHistoryRecommendationHidden = 'true';
      } else if (hasVerifiedV6History && card.dataset.legacyHistoryRecommendationHidden === 'true') {
        card.style.removeProperty('display');
        delete card.dataset.legacyHistoryRecommendationHidden;
      }
    });
  };

  const start = () => {
    sanitizeHistoryUi();
    const list = document.getElementById('setList');
    if (!list) return;
    // If an older cached loader requests this file, it is now a cleanup shim only.
    // It cannot create history cards. It removes legacy cards and hides any
    // history-based recommendation until V6 has verified a real prior set.
    new MutationObserver(sanitizeHistoryUi).observe(list, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
