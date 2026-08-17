(() => {
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const SET_LIST_ID = 'setList';

  if (!document.querySelector('link[data-set-history-style]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'set-history.css?v=1';
    style.dataset.setHistoryStyle = 'true';
    document.head.appendChild(style);
  }

  function readHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function previousSetFor(exerciseName, setNumber) {
    const history = readHistory()
      .filter(session => session && Array.isArray(session.logs))
      .sort((a, b) => (Number(b.completedAt) || 0) - (Number(a.completedAt) || 0));

    for (const session of history) {
      const match = session.logs.find(log =>
        log &&
        log.exercise === exerciseName &&
        Number(log.set) === Number(setNumber)
      );
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
    return `${formatWeight(previous.weight)} lb × ${previous.reps}`;
  }

  function signed(value, suffix = '') {
    const rounded = Math.abs(value) < 0.05 ? 0 : value;
    const formatted = Number.isInteger(rounded)
      ? String(Math.abs(rounded))
      : Math.abs(rounded).toFixed(1).replace(/\.0$/, '');
    if (rounded === 0) return `0${suffix}`;
    return `${rounded > 0 ? '+' : '−'}${formatted}${suffix}`;
  }

  function comparisonFor(previous, weightInput, repsInput) {
    if (!previous) {
      return {
        tone: 'baseline',
        summary: 'No previous set yet',
        detail: 'Save this set to create your baseline.'
      };
    }

    const weightText = weightInput.value.trim();
    const repsText = repsInput.value.trim();
    if (!weightText || !repsText) {
      return {
        tone: 'neutral',
        summary: `Last time: ${previousLabel(previous)}`,
        detail: 'Enter today’s weight and reps to compare.'
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
      return {
        tone,
        summary,
        detail: `Previous ${previous.reps} reps • Today ${reps} reps`
      };
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
    } else if (weightDelta === 0 && repsDelta === 0) {
      tone = 'same';
      summary = 'Matched last time';
    } else {
      tone = 'down';
      summary = previousVolume > 0
        ? `Below last time: ${Math.abs(Math.round(volumePercent))}% less volume`
        : 'Below last time';
    }

    return {
      tone,
      summary,
      detail: `Weight ${signed(weightDelta, ' lb')} • Reps ${signed(repsDelta)} • Previous ${previousLabel(previous)}`
    };
  }

  function makeComparison(exerciseName, setNumber, weightInput, repsInput) {
    const previous = previousSetFor(exerciseName, setNumber);
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

      const buttons = [...row.querySelectorAll('button[data-log]')];
      buttons.forEach(button => {
        const parts = String(button.dataset.log || '').split('-');
        const exerciseIndex = Number(parts[0]);
        const setNumber = Number(parts[1]);
        if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setNumber)) return;

        const weightInput = document.getElementById(`w-${exerciseIndex}-${setNumber}`);
        const repsInput = document.getElementById(`r-${exerciseIndex}-${setNumber}`);
        if (!weightInput || !repsInput) return;

        const comparison = makeComparison(exerciseName, setNumber, weightInput, repsInput);
        button.insertAdjacentElement('afterend', comparison);
      });

      row.dataset.historyComparisonReady = 'true';
    });
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

    const observer = new MutationObserver(scheduleDecorate);
    observer.observe(setList, { childList: true, subtree: true });
    scheduleDecorate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
