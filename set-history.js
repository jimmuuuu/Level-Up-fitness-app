(() => {
  const selector = '#setList .set-history-compare:not([data-history-v6="true"])';

  const purge = () => {
    document.querySelectorAll(selector).forEach(node => node.remove());
  };

  const start = () => {
    purge();
    const list = document.getElementById('setList');
    if (!list) return;
    // Old cached loaders may still request this file. It must never create history
    // cards again. It only removes legacy cards and leaves V6 cards alone.
    new MutationObserver(purge).observe(list, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
