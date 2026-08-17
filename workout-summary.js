(() => {
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const SUMMARY_KEY = 'levelUpFitnessWorkoutSummaries';
  const MAX_PHOTOS = 3;

  if (!document.querySelector('link[data-workout-summary-style]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'workout-summary.css?v=1';
    style.dataset.workoutSummaryStyle = 'true';
    document.head.appendChild(style);
  }

  function readJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function readHistory() {
    const value = readJson(HISTORY_KEY, []);
    return Array.isArray(value) ? value : [];
  }

  function readSummaries() {
    const value = readJson(SUMMARY_KEY, {});
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function writeSummaries(value) {
    try {
      localStorage.setItem(SUMMARY_KEY, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function savedSummary(sessionId) {
    const summaries = readSummaries();
    return summaries[sessionId] || { notes: '', photos: [] };
  }

  function updateSavedSummary(sessionId, patch) {
    const summaries = readSummaries();
    const current = summaries[sessionId] || { notes: '', photos: [] };
    summaries[sessionId] = {
      notes: typeof patch.notes === 'string' ? patch.notes : (current.notes || ''),
      photos: Array.isArray(patch.photos) ? patch.photos : (Array.isArray(current.photos) ? current.photos : []),
      updatedAt: Date.now()
    };
    return writeSummaries(summaries);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatNumber(value) {
    const number = Number(value) || 0;
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(number);
  }

  function formatDuration(session) {
    let minutes = Number(session?.durationMinutes) || 0;
    if (!minutes && session?.startedAt && session?.completedAt) {
      minutes = Math.max(0, Math.round((Number(session.completedAt) - Number(session.startedAt)) / 60000));
    }
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }

  function formatDate(timestamp) {
    const date = new Date(Number(timestamp) || Date.now());
    return date.toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  }

  function workoutVolume(session) {
    return (session?.logs || []).reduce((total, log) => {
      const weight = Number(log?.weight) || 0;
      const reps = Number(log?.reps) || 0;
      return total + weight * reps;
    }, 0);
  }

  function previousSet(history, currentIndex, log) {
    for (let index = currentIndex - 1; index >= 0; index -= 1) {
      const previous = history[index];
      if (!previous || !Array.isArray(previous.logs)) continue;
      const match = previous.logs.find(candidate =>
        candidate &&
        candidate.exercise === log.exercise &&
        Number(candidate.set) === Number(log.set)
      );
      if (match) return match;
    }
    return null;
  }

  function setComparison(current, previous) {
    if (!previous) return 'baseline';
    const currentWeight = Number(current.weight) || 0;
    const previousWeight = Number(previous.weight) || 0;
    const currentReps = Number(current.reps) || 0;
    const previousReps = Number(previous.reps) || 0;

    if (currentWeight === 0 && previousWeight === 0) {
      if (currentReps > previousReps) return 'up';
      if (currentReps === previousReps) return 'same';
      return 'down';
    }

    if (currentWeight > previousWeight && currentReps >= previousReps) return 'up';
    if (currentWeight === previousWeight && currentReps > previousReps) return 'up';

    const currentVolume = currentWeight * currentReps;
    const previousVolume = previousWeight * previousReps;
    if (currentVolume > previousVolume) return 'up';
    if (currentWeight === previousWeight && currentReps === previousReps) return 'same';
    return 'down';
  }

  function progressForSession(history, currentIndex, session) {
    let improved = 0;
    let matched = 0;
    let baseline = 0;
    let below = 0;

    (session.logs || []).forEach(log => {
      const comparison = setComparison(log, previousSet(history, currentIndex, log));
      if (comparison === 'up') improved += 1;
      else if (comparison === 'same') matched += 1;
      else if (comparison === 'baseline') baseline += 1;
      else below += 1;
    });

    const previousPlan = [...history.slice(0, currentIndex)].reverse().find(candidate =>
      (candidate.planId && candidate.planId === session.planId) ||
      (!candidate.planId && candidate.plan === session.plan)
    );
    const currentVolume = workoutVolume(session);
    const previousVolume = previousPlan ? workoutVolume(previousPlan) : 0;
    const volumeChange = previousVolume > 0 ? ((currentVolume - previousVolume) / previousVolume) * 100 : null;

    const weighted = (session.logs || []).filter(log => Number(log.weight) > 0);
    const heaviest = weighted.reduce((best, log) => !best || Number(log.weight) > Number(best.weight) ? log : best, null);
    const exercises = new Set((session.logs || []).map(log => log.exercise).filter(Boolean));

    return { improved, matched, baseline, below, currentVolume, previousVolume, volumeChange, heaviest, exerciseCount: exercises.size };
  }

  function comparisonBadge(history, currentIndex, log) {
    const previous = previousSet(history, currentIndex, log);
    const tone = setComparison(log, previous);
    if (tone === 'up') return '<span class="ws-set-change up" title="Improved from last time">↑</span>';
    if (tone === 'same') return '<span class="ws-set-change same" title="Matched last time">=</span>';
    if (tone === 'down') return '<span class="ws-set-change down" title="Below last time">↓</span>';
    return '<span class="ws-set-change baseline" title="New baseline">NEW</span>';
  }

  function exerciseMarkup(history, currentIndex, session) {
    const groups = new Map();
    (session.logs || []).forEach(log => {
      if (!groups.has(log.exercise)) groups.set(log.exercise, []);
      groups.get(log.exercise).push(log);
    });

    return [...groups.entries()].map(([exercise, sets]) => {
      const ordered = [...sets].sort((a, b) => Number(a.set) - Number(b.set));
      return `<article class="ws-exercise">
        <div class="ws-exercise-head"><strong>${escapeHtml(exercise)}</strong><span>${ordered.length} set${ordered.length === 1 ? '' : 's'}</span></div>
        <div class="ws-set-list">${ordered.map(log => {
          const weight = Number(log.weight) || 0;
          const reps = Number(log.reps) || 0;
          const value = weight > 0 ? `${formatNumber(weight)} lb × ${reps}` : `${reps} reps`;
          return `<div class="ws-set-chip"><b>Set ${Number(log.set) || 1}</b><span>${escapeHtml(value)}</span>${comparisonBadge(history, currentIndex, log)}</div>`;
        }).join('')}</div>
      </article>`;
    }).join('');
  }

  function ensureOverlay() {
    let overlay = document.getElementById('workoutSummaryOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'workoutSummaryOverlay';
    overlay.className = 'workout-summary-overlay hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'wsTitle');
    document.body.appendChild(overlay);
    return overlay;
  }

  function closeSummary() {
    const overlay = document.getElementById('workoutSummaryOverlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    document.body.classList.remove('workout-summary-open');
  }

  function renderPhotos(sessionId, photos) {
    const grid = document.getElementById('wsPhotoGrid');
    if (!grid) return;
    grid.innerHTML = photos.length
      ? photos.map((photo, index) => `<figure class="ws-photo"><img src="${photo}" alt="Workout photo ${index + 1}"><button type="button" data-remove-photo="${index}" aria-label="Remove workout photo ${index + 1}">×</button></figure>`).join('')
      : '<div class="ws-photo-empty">No workout photos yet.</div>';

    grid.querySelectorAll('[data-remove-photo]').forEach(button => {
      button.onclick = () => {
        const summary = savedSummary(sessionId);
        const next = [...(summary.photos || [])];
        next.splice(Number(button.dataset.removePhoto), 1);
        if (updateSavedSummary(sessionId, { photos: next })) renderPhotos(sessionId, next);
      };
    });

    const addButton = document.getElementById('wsAddPhotos');
    if (addButton) {
      addButton.disabled = photos.length >= MAX_PHOTOS;
      addButton.textContent = photos.length >= MAX_PHOTOS ? 'Photo limit reached' : 'Add workout photos';
    }
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        try {
          const max = 960;
          const scale = Math.min(1, max / Math.max(image.width, image.height));
          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, width, height);
          const data = canvas.toDataURL('image/jpeg', 0.68);
          URL.revokeObjectURL(url);
          resolve(data);
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image could not be opened'));
      };
      image.src = url;
    });
  }

  async function addPhotos(sessionId, files) {
    const status = document.getElementById('wsSaveStatus');
    const summary = savedSummary(sessionId);
    const existing = Array.isArray(summary.photos) ? summary.photos : [];
    const remaining = Math.max(0, MAX_PHOTOS - existing.length);
    const selected = [...files].slice(0, remaining);
    if (!selected.length) return;
    if (status) status.textContent = 'Adding photos…';

    const added = [];
    for (const file of selected) {
      try {
        added.push(await compressImage(file));
      } catch {
        // Skip files the browser cannot decode.
      }
    }
    const next = [...existing, ...added].slice(0, MAX_PHOTOS);
    if (!writeSummaries({ ...readSummaries(), [sessionId]: { ...summary, photos: next, updatedAt: Date.now() } })) {
      if (status) status.textContent = 'Photos could not be saved. Try fewer photos.';
      return;
    }
    renderPhotos(sessionId, next);
    if (status) status.textContent = added.length ? 'Photos saved on this device.' : 'That photo format could not be added.';
  }

  function showSummary(session) {
    if (!session) return;
    const history = readHistory();
    const currentIndex = history.findIndex(item => item.id && item.id === session.id);
    const index = currentIndex >= 0 ? currentIndex : Math.max(0, history.length - 1);
    const stats = progressForSession(history, index, session);
    const summary = savedSummary(session.id);
    const volumeChange = stats.volumeChange === null
      ? 'First time for this workout'
      : `${stats.volumeChange >= 0 ? '+' : ''}${Math.round(stats.volumeChange)}% vs last ${escapeHtml(session.plan || 'workout')}`;
    const heaviest = stats.heaviest
      ? `${formatNumber(stats.heaviest.weight)} lb × ${Number(stats.heaviest.reps) || 0}`
      : 'Bodyweight workout';

    const overlay = ensureOverlay();
    overlay.innerHTML = `
      <div class="ws-sheet">
        <header class="ws-header">
          <div><span class="ws-kicker">WORKOUT COMPLETE</span><h2 id="wsTitle">${escapeHtml(session.plan || 'Workout summary')}</h2><p>${escapeHtml(formatDate(session.completedAt))}</p></div>
          <button class="ws-close" type="button" id="wsClose" aria-label="Close workout summary">×</button>
        </header>

        <section class="ws-hero-stats">
          <article><span>TIME</span><strong>${escapeHtml(formatDuration(session))}</strong></article>
          <article><span>SETS</span><strong>${(session.logs || []).length}</strong></article>
          <article><span>VOLUME</span><strong>${formatNumber(stats.currentVolume)} lb</strong></article>
          <article><span>EXERCISES</span><strong>${stats.exerciseCount}</strong></article>
        </section>

        <section class="ws-progress-card">
          <div class="ws-section-title"><div><span>PROGRESS</span><h3>What changed today</h3></div></div>
          <div class="ws-progress-grid">
            <article class="good"><strong>${stats.improved}</strong><span>Improved sets</span></article>
            <article><strong>${stats.matched}</strong><span>Matched sets</span></article>
            <article><strong>${stats.baseline}</strong><span>New baselines</span></article>
            <article><strong>${escapeHtml(heaviest)}</strong><span>Heaviest set</span></article>
          </div>
          <p class="ws-volume-change">${volumeChange}</p>
        </section>

        <section class="ws-section">
          <div class="ws-section-title"><div><span>SESSION</span><h3>Everything you logged</h3></div></div>
          <div class="ws-exercises">${exerciseMarkup(history, index, session)}</div>
        </section>

        <section class="ws-section">
          <div class="ws-section-title"><div><span>WORKOUT NOTES</span><h3>How did it go?</h3></div><small>Saved on this device</small></div>
          <textarea id="wsNotes" maxlength="1200" placeholder="Example: Felt strong today. Leg press moved well, but my last set of curls was tough.">${escapeHtml(summary.notes || '')}</textarea>
        </section>

        <section class="ws-section">
          <div class="ws-section-title"><div><span>PHOTOS</span><h3>Workout memories</h3></div><small>Up to ${MAX_PHOTOS}</small></div>
          <div class="ws-photo-grid" id="wsPhotoGrid"></div>
          <input class="hidden" id="wsPhotoInput" type="file" accept="image/*" multiple>
          <button class="ws-secondary" id="wsAddPhotos" type="button">Add workout photos</button>
          <p class="ws-device-note">Notes and photos stay on this device for now; your workout stats keep using the app’s normal workout history.</p>
        </section>

        <div class="ws-save-row">
          <span id="wsSaveStatus" role="status"></span>
          <button class="ws-primary" id="wsDone" type="button">Save summary &amp; done</button>
        </div>
      </div>`;

    overlay.classList.remove('hidden');
    document.body.classList.add('workout-summary-open');
    renderPhotos(session.id, Array.isArray(summary.photos) ? summary.photos : []);

    const notes = document.getElementById('wsNotes');
    const saveNotes = () => {
      const ok = updateSavedSummary(session.id, { notes: notes?.value || '' });
      const status = document.getElementById('wsSaveStatus');
      if (status) status.textContent = ok ? 'Summary saved.' : 'Summary could not be saved on this device.';
      return ok;
    };

    document.getElementById('wsClose').onclick = () => { saveNotes(); closeSummary(); };
    document.getElementById('wsDone').onclick = () => { saveNotes(); closeSummary(); };
    document.getElementById('wsAddPhotos').onclick = () => document.getElementById('wsPhotoInput').click();
    document.getElementById('wsPhotoInput').onchange = event => {
      addPhotos(session.id, event.target.files || []);
      event.target.value = '';
    };
  }

  function watchForCompletedWorkout(beforeIds) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      const history = readHistory();
      const completed = [...history].reverse().find(session => session?.id && !beforeIds.has(session.id));
      if (completed) {
        clearInterval(timer);
        setTimeout(() => showSummary(completed), 250);
      } else if (attempts >= 120) {
        clearInterval(timer);
      }
    }, 125);
  }

  function attachFinishWatcher() {
    const finish = document.getElementById('finish');
    if (!finish || finish.dataset.workoutSummaryWatcher === 'true') return;
    finish.dataset.workoutSummaryWatcher = 'true';
    finish.addEventListener('click', () => {
      const beforeIds = new Set(readHistory().map(session => session?.id).filter(Boolean));
      watchForCompletedWorkout(beforeIds);
    }, true);
  }

  function decorateRecentWorkouts() {
    const list = document.getElementById('recentWorkouts');
    if (!list) return;
    const rows = [...list.querySelectorAll('.history-row')];
    const recent = [...readHistory()].reverse().slice(0, rows.length);
    rows.forEach((row, index) => {
      const session = recent[index];
      if (!session) return;
      let button = row.querySelector('.ws-view-summary');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'ws-view-summary';
        button.textContent = 'Summary';
        row.appendChild(button);
      }
      button.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        showSummary(session);
      };
    });
  }

  function start() {
    attachFinishWatcher();
    decorateRecentWorkouts();

    const recent = document.getElementById('recentWorkouts');
    if (recent) {
      const observer = new MutationObserver(() => requestAnimationFrame(decorateRecentWorkouts));
      observer.observe(recent, { childList: true, subtree: true });
    }

    const root = document.body;
    const rootObserver = new MutationObserver(() => attachFinishWatcher());
    rootObserver.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
