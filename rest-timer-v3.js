(() => {
  const TIMER_PREFIX = 'levelUpFitnessRestTimerV3:';
  const ALERT_KEY = 'levelUpFitnessRestAlertsEnabled';
  const DEFAULT_SECONDS = 90;
  let interval = null;
  let activeKey = '';
  let lastCompleteKey = '';
  let lastAutoStartAt = 0;

  const byId = id => document.getElementById(id);

  function accountKey() {
    try {
      if (typeof draftAccountKey === 'function') return String(draftAccountKey() || 'local');
    } catch {}
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return `cloud:${cloudUser.id}`;
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
    } catch {}
    return 'local';
  }

  function sessionId() {
    try { return typeof activeSessionId !== 'undefined' ? String(activeSessionId || '') : ''; }
    catch { return ''; }
  }

  function timerKey() {
    const session = sessionId();
    return session ? `${TIMER_PREFIX}${accountKey()}:${session}` : '';
  }

  function readState() {
    const key = timerKey();
    if (!key) return { endAt: 0, duration: DEFAULT_SECONDS, pausedRemaining: 0 };
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return {
        endAt: Math.max(0, Number(value?.endAt) || 0),
        duration: Math.max(15, Math.min(600, Number(value?.duration) || DEFAULT_SECONDS)),
        pausedRemaining: Math.max(0, Math.min(600, Number(value?.pausedRemaining) || 0))
      };
    } catch {
      return { endAt: 0, duration: DEFAULT_SECONDS, pausedRemaining: 0 };
    }
  }

  function writeState(endAt, duration = DEFAULT_SECONDS, pausedRemaining = 0) {
    const key = timerKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({
        version: 4,
        endAt: Math.max(0, Number(endAt) || 0),
        duration: Math.max(15, Math.min(600, Number(duration) || DEFAULT_SECONDS)),
        pausedRemaining: Math.max(0, Math.min(600, Number(pausedRemaining) || 0)),
        updatedAt: Date.now()
      }));
    } catch {}
  }

  function format(seconds) {
    const value = Math.max(0, Math.ceil(Number(seconds) || 0));
    const minutes = Math.floor(value / 60);
    return `${minutes}:${String(value % 60).padStart(2, '0')}`;
  }

  function activeWorkoutExists() {
    try { return Boolean(activePlan && activeSessionId); }
    catch { return false; }
  }

  function ensureUi() {
    const active = byId('active');
    if (!active || byId('restTimerV3')) return;
    const card = document.createElement('section');
    card.id = 'restTimerV3';
    card.className = 'rest-timer-v3 hidden';
    card.setAttribute('aria-label', 'Rest timer');
    card.innerHTML = `
      <div class="rest-timer-v3-top">
        <div>
          <div class="rest-timer-v3-label">Rest timer</div>
          <div id="restTimerV3Time" class="rest-timer-v3-time">1:30</div>
        </div>
        <div id="restTimerV3Status" class="rest-timer-v3-status">Ready. It starts automatically after you save a set.</div>
      </div>
      <div id="restTimerV3Presets" class="rest-timer-v3-presets">
        <button type="button" data-rest-v3-start="60">Start 1:00</button>
        <button type="button" class="primary" data-rest-v3-start="90">Start 1:30</button>
        <button type="button" data-rest-v3-start="120">Start 2:00</button>
      </div>
      <div id="restTimerV3Controls" class="rest-timer-v3-controls hidden">
        <button type="button" data-rest-v3-adjust="-30">−30 sec</button>
        <button id="restTimerV3Pause" class="rest-timer-v3-pause" type="button" data-rest-v3-pause>Pause</button>
        <button type="button" data-rest-v3-adjust="30">+30 sec</button>
        <button type="button" data-rest-v3-skip>Skip</button>
      </div>
      <button id="restTimerV3Alerts" class="rest-timer-v3-alerts" type="button">Enable lock-screen rest alerts</button>`;

    const clock = active.querySelector('.active-session-clock');
    const status = byId('workoutSessionStatus');
    if (status) status.insertAdjacentElement('afterend', card);
    else if (clock) clock.insertAdjacentElement('afterend', card);
    else active.insertBefore(card, active.firstChild);
  }

  function alertsEnabled() {
    try {
      return 'Notification' in window && Notification.permission === 'granted' && localStorage.getItem(ALERT_KEY) === 'true';
    } catch { return false; }
  }

  function updateAlertsButton() {
    const button = byId('restTimerV3Alerts');
    if (!button) return;
    if (!('Notification' in window)) {
      button.textContent = 'Lock-screen alerts are not supported in this browser';
      button.disabled = true;
      return;
    }
    button.disabled = false;
    const enabled = alertsEnabled();
    button.classList.toggle('enabled', enabled);
    button.textContent = enabled ? 'Lock-screen rest alerts on' : 'Enable lock-screen rest alerts';
  }

  async function enableAlerts() {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem(ALERT_KEY, permission === 'granted' ? 'true' : 'false');
    } catch {}
    updateAlertsButton();
  }

  async function notify(title, body, tag) {
    if (!alertsEnabled()) return;
    try {
      const registration = await navigator.serviceWorker?.ready;
      if (registration?.showNotification) {
        await registration.showNotification(title, {
          body,
          tag,
          renotify: true,
          requireInteraction: true,
          icon: './assets/app-icon-192.png',
          badge: './assets/app-icon-192.png',
          data: { url: location.href }
        });
        return;
      }
      new Notification(title, { body, tag });
    } catch {}
  }

  function startTimer(seconds = DEFAULT_SECONDS, source = 'manual') {
    if (!activeWorkoutExists()) return;
    if (source === 'saved-set') {
      const now = Date.now();
      if (now - lastAutoStartAt < 500) return;
      lastAutoStartAt = now;
    }
    const duration = Math.max(15, Math.min(600, Number(seconds) || DEFAULT_SECONDS));
    const endAt = Date.now() + duration * 1000;
    writeState(endAt, duration, 0);
    lastCompleteKey = '';
    render();
    const endLabel = new Date(endAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (source === 'saved-set') {
      void notify(`Rest ${format(duration)}`, `Your rest ends at ${endLabel}.`, 'level-up-rest-running');
    }
  }

  function pauseTimer() {
    const state = readState();
    if (!state.endAt) return;
    const remaining = Math.max(1, Math.ceil((state.endAt - Date.now()) / 1000));
    if (remaining <= 0) return;
    writeState(0, state.duration, remaining);
    render();
  }

  function resumeTimer() {
    const state = readState();
    if (!state.pausedRemaining) return;
    const remaining = Math.max(1, state.pausedRemaining);
    writeState(Date.now() + remaining * 1000, state.duration, 0);
    lastCompleteKey = '';
    render();
  }

  function togglePause() {
    const state = readState();
    if (state.pausedRemaining > 0) resumeTimer();
    else if (state.endAt > Date.now()) pauseTimer();
  }

  function adjustTimer(seconds) {
    const state = readState();
    const delta = Number(seconds || 0);
    if (state.pausedRemaining > 0) {
      const pausedRemaining = Math.max(1, Math.min(600, state.pausedRemaining + delta));
      writeState(0, Math.max(15, pausedRemaining), pausedRemaining);
      render();
      return;
    }
    const currentEnd = state.endAt > Date.now() ? state.endAt : Date.now();
    const endAt = Math.max(Date.now() + 1000, currentEnd + delta * 1000);
    writeState(endAt, Math.max(15, Math.ceil((endAt - Date.now()) / 1000)), 0);
    lastCompleteKey = '';
    render();
  }

  function skipTimer() {
    writeState(0, DEFAULT_SECONDS, 0);
    lastCompleteKey = timerKey();
    render();
  }

  function render() {
    ensureUi();
    const card = byId('restTimerV3');
    const time = byId('restTimerV3Time');
    const status = byId('restTimerV3Status');
    const presets = byId('restTimerV3Presets');
    const controls = byId('restTimerV3Controls');
    const pauseButton = byId('restTimerV3Pause');
    if (!card || !time || !status || !presets || !controls) return;

    const exists = activeWorkoutExists();
    card.classList.toggle('hidden', !exists);
    if (!exists) return;

    const key = timerKey();
    if (key !== activeKey) {
      activeKey = key;
      lastCompleteKey = '';
    }

    const state = readState();
    const remaining = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
    const running = Boolean(state.endAt && remaining > 0);
    const paused = Boolean(!running && state.pausedRemaining > 0);
    card.classList.toggle('running', running);
    card.classList.toggle('paused', paused);
    card.classList.remove('rest-timer-v3-complete');

    if (running) {
      time.textContent = format(remaining);
      status.textContent = `Resting. Ready at ${new Date(state.endAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`;
      presets.classList.add('hidden');
      controls.classList.remove('hidden');
      if (pauseButton) pauseButton.textContent = 'Pause';
    } else if (paused) {
      time.textContent = format(state.pausedRemaining);
      status.textContent = 'Paused. Resume when you are ready to continue the countdown.';
      presets.classList.add('hidden');
      controls.classList.remove('hidden');
      if (pauseButton) pauseButton.textContent = 'Resume';
    } else {
      time.textContent = format(state.duration || DEFAULT_SECONDS);
      status.textContent = 'Ready. It starts automatically after you save a set.';
      presets.classList.remove('hidden');
      controls.classList.add('hidden');
      if (pauseButton) pauseButton.textContent = 'Pause';

      if (state.endAt && state.endAt <= Date.now() && lastCompleteKey !== key) {
        lastCompleteKey = key;
        writeState(0, state.duration || DEFAULT_SECONDS, 0);
        card.classList.add('rest-timer-v3-complete');
        status.textContent = 'Rest complete. Start your next set when ready.';
        void notify('Rest complete', 'Your next set is ready when you are.', 'level-up-rest-complete');
      }
    }
    updateAlertsButton();
  }

  function installCoreHook() {
    try {
      if (typeof startRestTimer === 'function' && !startRestTimer.__restTimerV3) {
        const replacement = function(seconds = DEFAULT_SECONDS) {
          startTimer(seconds, 'saved-set');
        };
        replacement.__restTimerV3 = true;
        startRestTimer = replacement;
      }
    } catch {}
  }

  function bind() {
    if (document.body.dataset.restTimerV3Bound === 'true') return;
    document.body.dataset.restTimerV3Bound = 'true';

    document.addEventListener('click', event => {
      const start = event.target.closest?.('[data-rest-v3-start]');
      if (start) {
        startTimer(Number(start.dataset.restV3Start) || DEFAULT_SECONDS, 'manual');
        return;
      }
      const adjust = event.target.closest?.('[data-rest-v3-adjust]');
      if (adjust) {
        adjustTimer(Number(adjust.dataset.restV3Adjust) || 0);
        return;
      }
      if (event.target.closest?.('[data-rest-v3-pause]')) {
        togglePause();
        return;
      }
      if (event.target.closest?.('[data-rest-v3-skip]')) {
        skipTimer();
        return;
      }
      if (event.target.closest?.('#restTimerV3Alerts')) {
        void enableAlerts();
        return;
      }

      const save = event.target.closest?.('#setList [data-log]');
      if (!save) return;
      const wasDone = save.classList.contains('done');
      if (wasDone) return;
      window.setTimeout(() => {
        if (save.classList.contains('done')) startTimer(DEFAULT_SECONDS, 'saved-set');
      }, 120);
    }, true);

    window.addEventListener('pageshow', () => {
      installCoreHook();
      render();
    });
    document.addEventListener('visibilitychange', () => {
      installCoreHook();
      render();
    });
  }

  function start() {
    ensureUi();
    installCoreHook();
    bind();
    render();
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      installCoreHook();
      render();
    }, 500);
  }

  window.LevelUpRestTimerV3 = {
    start: seconds => startTimer(seconds, 'manual'),
    pause: pauseTimer,
    resume: resumeTimer,
    togglePause,
    skip: skipTimer,
    render
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
