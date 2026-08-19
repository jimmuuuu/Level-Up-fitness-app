(() => {
  const FALLBACK_SECONDS = 90;
  let interval = null;
  let timerObserver = null;

  function getDefaultSeconds() {
    try {
      const value = Number(window.LevelUpSettings?.getRestSeconds?.());
      if (Number.isFinite(value)) return Math.max(30, Math.min(600, Math.round(value)));
    } catch {}
    return FALLBACK_SECONDS;
  }

  function format(seconds) {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    const minutes = Math.floor(total / 60);
    return `${minutes}:${String(total % 60).padStart(2, '0')}`;
  }

  function timerIdle() {
    const card = document.getElementById('restTimerV3');
    return Boolean(card && !card.classList.contains('running') && !card.classList.contains('paused'));
  }

  function applyDefaultToUi() {
    const seconds = getDefaultSeconds();
    const expected = format(seconds);
    const time = document.getElementById('restTimerV3Time');
    const middle = document.querySelector('#restTimerV3Presets button.primary');
    if (middle) {
      if (middle.dataset.restV3Start !== String(seconds)) middle.dataset.restV3Start = String(seconds);
      const label = `Start ${expected}`;
      if (middle.textContent !== label) middle.textContent = label;
    }
    if (time && timerIdle() && time.textContent !== expected) time.textContent = expected;
  }

  function observeTimerUi() {
    const card = document.getElementById('restTimerV3');
    if (!card || card.dataset.settingsBridgeObserved === 'true') return;
    card.dataset.settingsBridgeObserved = 'true';
    timerObserver?.disconnect();
    timerObserver = new MutationObserver(() => applyDefaultToUi());
    timerObserver.observe(card, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });
  }

  function refresh() {
    observeTimerUi();
    applyDefaultToUi();
  }

  function start() {
    refresh();
    window.addEventListener('levelup:settings-changed', refresh);
    window.addEventListener('levelup:extra-settings-changed', refresh);
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh();
    });
    if (interval) clearInterval(interval);
    interval = setInterval(refresh, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
