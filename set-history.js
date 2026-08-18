(() => {
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const CLOUD_HISTORY_PREFIX = 'levelUpFitnessCloudWorkoutHistory:';
  const HISTORY_OWNER_KEY = 'levelUpFitnessWorkoutHistoryOwner';
  const SET_LIST_ID = 'setList';
  const AUTO_WEEKLY_PREFIX = 'custom-auto-weekly-';

  if (!document.querySelector('link[data-set-history-style]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'set-history.css?v=2';
    style.dataset.setHistoryStyle = 'true';
    document.head.appendChild(style);
  }

  function storedArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function cloudUserId() {
    try { return cloudUser?.id || ''; } catch { return ''; }
  }

  function accountCreationTime() {
    try {
      const parsed = Date.parse(cloudUser?.created_at || '');
      return Number.isFinite(parsed) ? parsed : 0;
    } catch {
      return 0;
    }
  }

  function possibleForCurrentCloudAccount(session) {
    const createdAt = accountCreationTime();
    if (!createdAt) return true;
    const completedAt = Number(session?.completedAt) || 0;
    const startedAt = Number(session?.startedAt) || completedAt;
    const timestamp = completedAt || startedAt;
    return !timestamp || timestamp >= createdAt - 5 * 60 * 1000;
  }

  function readHistory() {
    const userId = cloudUserId();
    if (userId) {
      const truth = window.LevelUpAccountHistoryTruth;
      // Never show browser history for a signed-in account until that account's
      // completed sessions have been checked against Supabase.
      if (!truth?.ready || truth.userId !== userId) return [];
      return storedArray(`${CLOUD_HISTORY_PREFIX}${userId}`).filter(possibleForCurrentCloudAccount);
    }

    try {
      if (userProfile) {
        const accountKey = String(userProfile.accountKey || '').trim();
        const email = String(userProfile.email || '').trim().toLowerCase();
        const identity = accountKey || email;
        if (identity) {
          const expectedOwner = `local:${identity}`;
          const owner = localStorage.getItem(HISTORY_OWNER_KEY) || '';
          if (owner !== expectedOwner) return [];
        }
      }
    } catch {}

    try {
      if (typeof workoutHistory !== 'undefined' && Array.isArray(workoutHistory)) return workoutHistory;
    } catch {}
    return storedArray(HISTORY_KEY);
  }

  function currentWorkoutContext() {
    try {
      if (typeof activePlan !== 'undefined' && activePlan) {
        const id = typeof planIdFor === 'function' ? planIdFor(activePlan) : String(activePlan.id || '');
        return {
          planId: id,
          planName: String(activePlan.name || ''),
          baseline: id.startsWith(AUTO_WEEKLY_PREFIX) ? (Number(activePlan.updatedAt) || 0) : 0
        };
      }
    } catch {}
    return { planId: '', planName: '', baseline: 0 };
  }

  function belongsToCurrentWorkout(session, context) {
    if (!session || !context) return false;
    const sessionPlanId = String(session.planId || '');
    const sessionPlanName = String(session.plan || '');
    const sameWorkout = context.planId
      ? sessionPlanId === context.planId || (!sessionPlanId && context.planName && sessionPlanName === context.planName)
      : Boolean(context.planName && sessionPlanName === context.planName);
    if (!sameWorkout) return false;

    const completedAt = Number(session.completedAt) || 0;
    if (context.baseline && completedAt && completedAt < context.baseline) return false;
    return true;
  }

  function previousSetFor(exerciseName, setNumber) {
    const context = currentWorkoutContext();
    if (!context.planId && !context.planName) return null;

    const history = readHistory()
      .filter(session => session && Array.isArray(session.logs) && belongsToCurrentWorkout(session, context))
      .sort((a, b) => (Number(b.completedAt) || 0) - (Number(a.completedAt) || 0));

    for (const session of history) {
      const match = session.logs.find(log => log && log.exercise === exerciseName && Number(log.set) === Number(setNumber));
      if (match) {
        return {
          weight: Number(match.weight) || 0,
          reps: Number(match.reps) || 0,
          setType: match.setType || 'Normal',
          completedAt: Number(session.completedAt) || 0
        };
      }
    }
    return null;
  }

  function formatWeight(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
  }

  function previousLabel(previous) {
    if (!previous) return '';
    if (previous.weight === 0) return `${previous.reps} reps`;
    return `${formatWeight(previous.weight)} lb x ${previous.reps}`;
  }

  function signed(value, suffix = '') {
    const rounded = Math.abs(value) < 0.05 ? 0 : value;
    const formatted = Number.isInteger(rounded) ? String(Math.abs(rounded)) : Math.abs(rounded).toFixed(1).replace(/\.0$/, '');
    if (rounded === 0) return `0${suffix}`;
    return `${rounded > 0 ? '+' : '-'}${formatted}${suffix}`;
  }

  function comparisonFor(previous, weightInput, repsInput) {
    if (!previous) {
      return {
        tone: 'baseline',
        summary: 'First time in this workout',
        detail: 'Save this set to create this workout history.'
      };
    }

    const weightText = weightInput.value.trim();
    const repsText = repsInput.value.trim();
    if (!weightText || !repsText) {
      return {
        tone: 'neutral',
        summary: `Last time: ${previousLabel(previous)}`,
        detail: "Enter today's weight and reps to compare."
      };
    }

    const weight = Number(weightText);
    const reps = Number(repsText);
    if (!Number.isFinite(weight) || !Number.isFinite(reps) || reps < 1 || weight < 0) {
      return {
        tone: 'neutral',
        summary: `Last time: ${previousLabel(previous)}`,
        detail: 'Enter valid numbers to compare.'
      };
    }

    const weightDelta = weight - previous.weight;
    const repsDelta = reps - previous.reps;

    if (previous.weight === 0 && weight === 0) {
      const tone = repsDelta > 0 ? 'up' : repsDelta < 0 ? 'down' : 'same';
      const summary = repsDelta > 0
        ? `Improved by ${repsDelta} rep${repsDelta === 1 ? '' : 's'}`
        : repsDelta < 0
          ? `${Math.abs(repsDelta)} fewer rep${Math.abs(repsDelta) === 1 ? '' : 's'}`
          : 'Matched last time';
      return { tone, summary, detail: `Previous ${previous.reps} reps | Today ${reps} reps` };
    }

    const previousVolume = previous.weight * previous.reps;
    const currentVolume = weight * reps;
    const volumeDelta = currentVolume - previousVolume;
    const volumePercent = previousVolume > 0 ? (volumeDelta / previousVolume) * 100 : 0;

    let tone = 'same';
    let summary = 'Matched last time';
    if (weightDelta > 0 && repsDelta >= 0) {
      tone = 'up';
      summary = `Stronger: ${signed(weightDelta, ' lb')}${repsDelta > 0 ? ` and ${signed(repsDelta, ' reps')}` : ''}`;
    } else if (weightDelta === 0 && repsDelta > 0) {
      tone = 'up';
      summary = `More reps: ${signed(repsDelta, ' reps')}`;
    } else if (volumeDelta > 0) {
      tone = 'up';
      summary = `More total work: +${Math.round(volumePercent)}% volume`;
    } else if (weightDelta !== 0 || repsDelta !== 0) {
      tone = 'down';
      summary = previousVolume > 0 ? `Below last time: ${Math.abs(Math.round(volumePercent))}% less volume` : 'Below last time';
    }

    return {
      tone,
      summary,
      detail: `Weight ${signed(weightDelta, ' lb')} | Reps ${signed(repsDelta)} | Previous ${previousLabel(previous)}`
    };
  }

  function makeComparison(exerciseName, setNumber, weightInput, repsInput) {
    const box = document.createElement('div');
    box.className = 'set-history-compare';

    const kicker = document.createElement('span');
    kicker.className = 'set-history-kicker';
    kicker.textContent = `SET ${setNumber} HISTORY`;

    const summary = document.createElement('strong');
    summary.className = 'set-history-summary';

    const detail = document.createElement('span');
    detail.className = 'set-history-detail';
    box.append(kicker, summary, detail);

    const refresh = () => {
      const previous = previousSetFor(exerciseName, setNumber);
      const result = comparisonFor(previous, weightInput, repsInput);
      box.dataset.tone = result.tone;
      summary.textContent = result.summary;
      detail.textContent = result.detail;
    };

    weightInput.addEventListener('input', refresh);
    repsInput.addEventListener('input', refresh);
    refresh();
    return box;
  }

  function decorateSetRows() {
    const setList = document.getElementById(SET_LIST_ID);
    if (!setList) return;

    setList.querySelectorAll('.set-row').forEach(row => {
      if (row.dataset.historyComparisonReady === 'true') return;
      const exerciseName = row.querySelector('.exercise-heading h3')?.textContent?.trim();
      if (!exerciseName) return;

      [...row.querySelectorAll('button[data-log]')].forEach(button => {
        const [exerciseIndex, setNumber] = String(button.dataset.log || '').split('-').map(Number);
        if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setNumber)) return;
        const weightInput = document.getElementById(`w-${exerciseIndex}-${setNumber}`);
        const repsInput = document.getElementById(`r-${exerciseIndex}-${setNumber}`);
        if (!weightInput || !repsInput) return;
        button.insertAdjacentElement('afterend', makeComparison(exerciseName, setNumber, weightInput, repsInput));
      });

      row.dataset.historyComparisonReady = 'true';
    });
  }

  function resetAndDecorate() {
    const setList = document.getElementById(SET_LIST_ID);
    if (!setList) return;
    setList.querySelectorAll('.set-history-compare').forEach(node => node.remove());
    setList.querySelectorAll('.set-row').forEach(row => { delete row.dataset.historyComparisonReady; });
    requestAnimationFrame(decorateSetRows);
  }

  function start() {
    const setList = document.getElementById(SET_LIST_ID);
    if (!setList) return;
    let scheduled = false;
    const scheduleDecorate = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        decorateSetRows();
      });
    };
    new MutationObserver(scheduleDecorate).observe(setList, { childList: true, subtree: true });
    scheduleDecorate();

    let lastTruthStamp = 0;
    window.setInterval(() => {
      const stamp = Number(window.LevelUpAccountHistoryTruth?.verifiedAt) || 0;
      if (stamp && stamp !== lastTruthStamp) {
        lastTruthStamp = stamp;
        resetAndDecorate();
      }
    }, 350);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();