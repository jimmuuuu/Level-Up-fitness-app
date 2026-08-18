(() => {
  const BUTTON_ID = 'restTimerPauseVisible';
  let interval = null;

  function ensureButton() {
    const card = document.getElementById('restTimerV3');
    const top = card?.querySelector('.rest-timer-v3-top');
    if (!card || !top) return null;

    let button = document.getElementById(BUTTON_ID);
    if (!button) {
      button = document.createElement('button');
      button.id = BUTTON_ID;
      button.type = 'button';
      button.className = 'rest-timer-pause-visible';
      button.textContent = 'Pause';
      button.setAttribute('aria-label', 'Pause rest timer');
      button.addEventListener('click', () => {
        if (button.disabled) return;
        try { window.LevelUpRestTimerV3?.togglePause?.(); } catch {}
        updateButton();
      });
      top.appendChild(button);
    }
    return button;
  }

  function updateButton() {
    const card = document.getElementById('restTimerV3');
    const button = ensureButton();
    if (!card || !button) return;

    const running = card.classList.contains('running');
    const paused = card.classList.contains('paused');
    button.disabled = !running && !paused;
    button.textContent = paused ? 'Resume' : 'Pause';
    button.setAttribute('aria-label', paused ? 'Resume rest timer' : 'Pause rest timer');
    button.classList.toggle('active', running || paused);
    button.classList.toggle('paused', paused);
  }

  function start() {
    updateButton();
    if (interval) clearInterval(interval);
    interval = setInterval(updateButton, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
