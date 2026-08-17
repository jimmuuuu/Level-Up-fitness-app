(() => {
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const STATS_PREFIX = 'levelUpFitnessTrainingStats:';
  const LOCAL_STATS_KEY = `${STATS_PREFIX}local`;
  const PROFILE_ID = 'trainingDetailsCard';
  const SET_LIST_ID = 'setList';

  let stats = { heightInches: 0, weightLbs: 0, userId: '', loaded: false };
  let currentClient = null;

  const roundTo = (value, step = 5) => Math.max(step, Math.round(value / step) * step);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const median = values => {
    const clean = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!clean.length) return 0;
    const middle = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
  };

  function readHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function cacheKey(userId = '') {
    return userId ? `${STATS_PREFIX}${userId}` : LOCAL_STATS_KEY;
  }

  function readCachedStats(userId = '') {
    try {
      const parsed = JSON.parse(localStorage.getItem(cacheKey(userId)) || '{}');
      return {
        heightInches: Number(parsed.heightInches) || 0,
        weightLbs: Number(parsed.weightLbs) || 0
      };
    } catch {
      return { heightInches: 0, weightLbs: 0 };
    }
  }

  function writeCachedStats(next) {
    try {
      localStorage.setItem(cacheKey(next.userId), JSON.stringify({
        heightInches: Number(next.heightInches) || 0,
        weightLbs: Number(next.weightLbs) || 0,
        updatedAt: Date.now()
      }));
    } catch {}
  }

  function client() {
    if (currentClient) return currentClient;
    if (typeof window.getSupabaseClient === 'function') {
      try { currentClient = window.getSupabaseClient(); } catch {}
    }
    return currentClient;
  }

  async function loadStats() {
    const supabase = client();
    let userId = '';
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        userId = data?.session?.user?.id || '';
      } catch {}
    }

    const cached = readCachedStats(userId);
    stats = { ...cached, userId, loaded: true };

    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('height_inches, weight_lbs')
          .eq('id', userId)
          .maybeSingle();
        if (!error && data) {
          stats.heightInches = Number(data.height_inches) || cached.heightInches || 0;
          stats.weightLbs = Number(data.weight_lbs) || cached.weightLbs || 0;
          writeCachedStats(stats);
        }
      } catch {}
    }

    window.LevelUpTrainingStats = {
      get: () => ({ ...stats }),
      reload: loadStats
    };
    renderProfileCard();
    decorateRecommendations();
  }

  function heightParts(total) {
    const value = Math.max(0, Math.round(Number(total) || 0));
    return { feet: Math.floor(value / 12), inches: value % 12 };
  }

  async function saveStatsFromForm(form) {
    const feet = Number(form.querySelector('#trainingHeightFeet')?.value || 0);
    const inches = Number(form.querySelector('#trainingHeightInches')?.value || 0);
    const weight = Number(form.querySelector('#trainingBodyWeight')?.value || 0);
    const status = form.querySelector('#trainingDetailsStatus');

    if (!Number.isInteger(feet) || feet < 3 || feet > 8 || !Number.isInteger(inches) || inches < 0 || inches > 11) {
      status.textContent = 'Enter a valid height.';
      status.dataset.tone = 'error';
      return;
    }
    if (!Number.isFinite(weight) || weight < 50 || weight > 500) {
      status.textContent = 'Enter a valid body weight in pounds.';
      status.dataset.tone = 'error';
      return;
    }

    const next = {
      heightInches: feet * 12 + inches,
      weightLbs: Math.round(weight * 10) / 10,
      userId: stats.userId,
      loaded: true
    };
    writeCachedStats(next);
    stats = next;
    status.textContent = 'Saving training details…';
    status.dataset.tone = '';

    const supabase = client();
    if (supabase && next.userId) {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: next.userId,
          height_inches: next.heightInches,
          weight_lbs: next.weightLbs,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        if (error) throw error;
        status.textContent = 'Saved. New workout recommendations will use these details.';
        status.dataset.tone = 'success';
      } catch {
        status.textContent = 'Saved on this device. Cloud sync for these details will retry later.';
        status.dataset.tone = 'warn';
      }
    } else {
      status.textContent = 'Saved on this device.';
      status.dataset.tone = 'success';
    }

    decorateRecommendations();
  }

  function renderProfileCard() {
    const profile = document.getElementById('profile');
    const overview = document.getElementById('profileOverview');
    if (!profile || !overview) return;

    let card = document.getElementById(PROFILE_ID);
    if (!card) {
      card = document.createElement('section');
      card.id = PROFILE_ID;
      card.className = 'profile-section training-details-card';
      overview.insertAdjacentElement('afterend', card);
    }

    const parts = heightParts(stats.heightInches);
    card.innerHTML = `
      <div class="section-heading compact-heading">
        <div><div class="over">TRAINING DETAILS</div><h2>Personalize weight suggestions</h2></div>
      </div>
      <p class="training-details-copy">Add your height and body weight so Level Up can give a conservative starting range when an exercise is new. Your workout history has more influence than body size; height is kept as profile context and is not used to push the load higher.</p>
      <form id="trainingDetailsForm" class="training-details-form">
        <label><span>Height</span><div class="height-inputs"><input id="trainingHeightFeet" type="number" min="3" max="8" step="1" inputmode="numeric" value="${parts.feet || ''}" placeholder="ft" aria-label="Height feet"><input id="trainingHeightInches" type="number" min="0" max="11" step="1" inputmode="numeric" value="${stats.heightInches ? parts.inches : ''}" placeholder="in" aria-label="Height inches"></div></label>
        <label><span>Body weight</span><div class="weight-input-wrap"><input id="trainingBodyWeight" type="number" min="50" max="500" step="0.1" inputmode="decimal" value="${stats.weightLbs || ''}" placeholder="lb" aria-label="Body weight in pounds"><b>lb</b></div></label>
        <button type="submit" class="secondary-button">Save training details</button>
        <p id="trainingDetailsStatus" class="training-details-status" role="status"></p>
      </form>`;

    card.querySelector('#trainingDetailsForm').onsubmit = event => {
      event.preventDefault();
      void saveStatsFromForm(event.currentTarget);
    };
  }

  function classify(name) {
    const n = name.toLowerCase();
    if (/treadmill|bike|stair climber/.test(n)) return { kind: 'cardio', ratio: 0, step: 5, cap: 0, label: '' };
    if (/assisted pull|assisted dip/.test(n)) return { kind: 'assisted', ratio: 0, step: 5, cap: 0, label: '' };
    if (/push-up|pull-up|chin-up|sit-up|dead bug|hanging knee|captain|ab wheel|glute bridge$|\bdip\b/.test(n)) return { kind: 'bodyweight', ratio: 0, step: 5, cap: 0, label: '' };
    if (/barbell|deadlift|back squat|front squat|romanian deadlift|ez-bar|preacher curl$|skull crusher|sumo deadlift/.test(n) && !/dumbbell/.test(n)) {
      return { kind: 'barbell', ratio: 0.22, step: 5, cap: 95, label: 'total load' };
    }
    if (/smith/.test(n)) return { kind: 'smith', ratio: 0.22, step: 5, cap: 95, label: 'selected load' };
    if (/leg press|hack squat/.test(n)) return { kind: 'leg-machine-compound', ratio: 0.38, step: 5, cap: 180, label: 'selected load' };
    if (/hip thrust|glute drive/.test(n)) return { kind: 'glute-compound', ratio: 0.28, step: 5, cap: 135, label: 'selected load' };
    if (/dumbbell bench|incline dumbbell|dumbbell shoulder|arnold press|dumbbell row|single-arm dumbbell|dumbbell romanian|goblet squat|walking lunge|reverse lunge|bulgarian|step-up/.test(n)) {
      return { kind: 'dumbbell-compound', ratio: 0.07, step: 5, cap: 45, label: 'per dumbbell' };
    }
    if (/lateral raise|rear delt|front raise|dumbbell curl|hammer curl|concentration curl|dumbbell triceps|dumbbell shrug/.test(n)) {
      return { kind: 'dumbbell-isolation', ratio: 0.035, step: 5, cap: 30, label: 'per dumbbell' };
    }
    if (/leg extension|leg curl|calf raise|abductor|adductor|pec deck|reverse pec deck|ab crunch/.test(n)) {
      return { kind: 'machine-isolation', ratio: 0.13, step: 5, cap: 75, label: 'selected load' };
    }
    if (/cable|pushdown|face pull|pulldown|pallof|kickback/.test(n)) {
      const compound = /lat pulldown|seated cable row/.test(n);
      return { kind: compound ? 'cable-compound' : 'cable-isolation', ratio: compound ? 0.18 : 0.08, step: 5, cap: compound ? 90 : 55, label: 'selected load' };
    }
    if (/chest press|shoulder press|seated row|t-bar row|chest-supported row/.test(n)) {
      return { kind: 'machine-compound', ratio: 0.2, step: 5, cap: 100, label: 'selected load' };
    }
    return { kind: 'general', ratio: 0.12, step: 5, cap: 75, label: 'selected load' };
  }

  function primaryMuscles(row) {
    return [...row.querySelectorAll('.exercise-targets .muscle-label')]
      .map(node => node.textContent.trim())
      .filter(Boolean);
  }

  function targetRepRange(row) {
    const input = row.querySelector('input[id^="r-"]');
    const match = String(input?.placeholder || '').match(/(\d+)\s*-\s*(\d+)/);
    return match ? { low: Number(match[1]), high: Number(match[2]) } : { low: 8, high: 12 };
  }

  function lastExerciseSession(history, exerciseName) {
    const sessions = history
      .filter(session => Array.isArray(session?.logs) && session.logs.some(log => log?.exercise === exerciseName))
      .sort((a, b) => (Number(b.completedAt) || 0) - (Number(a.completedAt) || 0));
    if (!sessions.length) return [];
    return sessions[0].logs.filter(log => log?.exercise === exerciseName && Number(log.weight) > 0 && String(log.setType || 'Normal') !== 'Warmup');
  }

  function relatedLogs(history, muscles, exerciseName) {
    if (!muscles.length) return [];
    return history.flatMap(session => (session.logs || []).map(log => ({ ...log, completedAt: session.completedAt })))
      .filter(log => {
        if (!log || log.exercise === exerciseName || Number(log.weight) <= 0) return false;
        if (String(log.setType || 'Normal') === 'Warmup') return false;
        const targets = Array.isArray(log.muscleTargets) ? log.muscleTargets : [];
        return targets.some(target => muscles.includes(target));
      })
      .sort((a, b) => (Number(b.completedAt) || 0) - (Number(a.completedAt) || 0))
      .slice(0, 24);
  }

  function rangeAround(center, step, cap) {
    const safeCenter = clamp(roundTo(center, step), step, cap || 999);
    let low = clamp(roundTo(safeCenter * 0.85, step), step, safeCenter);
    let high = clamp(roundTo(safeCenter * 1.05, step), safeCenter, cap || 999);
    if (high === low) high = Math.min(cap || 999, low + step);
    return { low, high };
  }

  function exactRecommendation(row, exerciseName, exactSets, info) {
    const weights = exactSets.map(log => Number(log.weight)).filter(value => value > 0);
    if (!weights.length) return null;
    const reps = exactSets.map(log => Number(log.reps)).filter(value => value > 0);
    const repRange = targetRepRange(row);
    const lastWeight = median(weights);
    const averageReps = reps.length ? reps.reduce((a, b) => a + b, 0) / reps.length : repRange.low;
    let center = lastWeight;
    let reason = 'Based on your most recent work sets for this exercise.';

    if (averageReps >= repRange.high && !exactSets.some(log => String(log.setType || '') === 'Failure')) {
      center = lastWeight * 1.03;
      reason = 'You reached the top of the rep range last time, so the estimate allows only a small increase.';
    } else if (averageReps < repRange.low) {
      center = lastWeight * 0.92;
      reason = 'Last time was below the target rep range, so the estimate starts slightly lighter.';
    }

    return {
      ...rangeAround(center, info.step, Math.max(info.cap, lastWeight * 1.1)),
      confidence: 'High',
      source: 'Your exercise history',
      reason
    };
  }

  function newExerciseRecommendation(row, exerciseName, history, info) {
    if (['cardio', 'assisted', 'bodyweight'].includes(info.kind)) {
      if (info.kind === 'cardio') return { special: 'No weight recommendation', confidence: '—', source: 'Cardio exercise', reason: 'Use the workout’s time or intensity target instead of a lifting load.' };
      if (info.kind === 'assisted') return { special: 'Choose comfortable assistance', confidence: 'Low', source: 'Assisted exercise', reason: 'Assistance machines work in reverse: more displayed weight usually means more help, so the app will not guess a number without your history.' };
      return { special: 'Start with bodyweight', confidence: 'Medium', source: 'Bodyweight exercise', reason: 'Use controlled reps and add assistance if you cannot stay in the target rep range.' };
    }

    if (['barbell', 'smith'].includes(info.kind) && !stats.weightLbs) {
      return { special: 'Start with an empty or very light setup', confidence: 'Low', source: 'No body-weight baseline yet', reason: 'Bar and Smith-machine starting resistance varies by equipment. Add your training details in Profile for a more useful estimate.' };
    }

    const muscles = primaryMuscles(row);
    const related = relatedLogs(history, muscles, exerciseName);
    let impliedBase = 0;

    if (related.length) {
      const implied = related.map(log => {
        const sourceInfo = classify(log.exercise || '');
        if (!sourceInfo.ratio || ['bodyweight', 'assisted', 'cardio'].includes(sourceInfo.kind)) return NaN;
        return Number(log.weight) / sourceInfo.ratio;
      }).filter(Number.isFinite);
      impliedBase = median(implied);
    }

    let center = 0;
    let confidence = 'Low';
    let source = '';
    let reason = '';

    if (stats.weightLbs > 0) {
      center = stats.weightLbs * info.ratio;
      confidence = related.length >= 4 ? 'Medium' : 'Low';
      source = related.length ? 'Body weight + related workout history' : 'Body-weight starting estimate';
      reason = related.length
        ? `Level Up found ${related.length} recent set${related.length === 1 ? '' : 's'} for related muscles and uses them only to make a small adjustment.`
        : 'You have no logged history for this movement yet, so this is a deliberately conservative first-session range.';

      if (impliedBase > 0) {
        const historyScale = clamp(impliedBase / stats.weightLbs, 0.8, 1.12);
        center *= historyScale;
      }
    } else if (impliedBase > 0) {
      center = impliedBase * info.ratio * 0.85;
      confidence = 'Low';
      source = 'Related workout history';
      reason = 'Your profile is missing body weight, so Level Up keeps the estimate below what your related logged sets suggest.';
    } else {
      return {
        missing: true,
        confidence: '—',
        source: 'More information needed',
        reason: 'Add height and body weight in Profile. Once you log workouts, your history will take priority over the starter estimate.'
      };
    }

    if (['barbell', 'smith'].includes(info.kind)) center *= 0.85;
    const range = rangeAround(center, info.step, info.cap);
    return { ...range, confidence, source, reason };
  }

  function recommendationFor(row, exerciseName) {
    const history = readHistory();
    const info = classify(exerciseName);
    const exactSets = lastExerciseSession(history, exerciseName);
    if (exactSets.length) return { ...exactRecommendation(row, exerciseName, exactSets, info), info };
    return { ...newExerciseRecommendation(row, exerciseName, history, info), info };
  }

  function recommendationMarkup(rec) {
    if (rec.missing) {
      return `<div class="weight-rec-main"><span class="weight-rec-kicker">STARTING WEIGHT</span><strong>Add training details</strong><em>${rec.source}</em></div><p>${rec.reason}</p>`;
    }
    if (rec.special) {
      return `<div class="weight-rec-main"><span class="weight-rec-kicker">STARTING WEIGHT</span><strong>${rec.special}</strong><em>${rec.source}</em></div><p>${rec.reason}</p>`;
    }
    const unit = rec.info?.label ? ` <small>${rec.info.label}</small>` : '';
    return `<div class="weight-rec-main"><span class="weight-rec-kicker">RECOMMENDED START</span><strong>${rec.low}–${rec.high} lb${unit}</strong><em>${rec.confidence} confidence · ${rec.source}</em></div><p>${rec.reason} Start at the lower end if the movement or machine feels unfamiliar, and keep a few clean reps in reserve.</p>`;
  }

  function decorateRecommendations() {
    const setList = document.getElementById(SET_LIST_ID);
    if (!setList) return;
    setList.querySelectorAll('.set-row').forEach(row => {
      const exerciseName = row.querySelector('.exercise-heading h3')?.textContent?.trim();
      if (!exerciseName) return;
      let card = row.querySelector('.weight-recommendation');
      if (!card) {
        card = document.createElement('aside');
        card.className = 'weight-recommendation';
        const grid = row.querySelector('.set-grid');
        if (grid) grid.insertAdjacentElement('beforebegin', card);
        else row.appendChild(card);
      }
      const rec = recommendationFor(row, exerciseName);
      card.dataset.confidence = String(rec.confidence || '').toLowerCase();
      card.innerHTML = recommendationMarkup(rec);
    });
  }

  function observeWorkout() {
    const setList = document.getElementById(SET_LIST_ID);
    if (!setList) return;
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        decorateRecommendations();
      });
    };
    new MutationObserver(schedule).observe(setList, { childList: true, subtree: true });
    schedule();
  }

  function observeProfile() {
    const profile = document.getElementById('profile');
    if (!profile) return;
    new MutationObserver(() => {
      if (!document.getElementById(PROFILE_ID)) renderProfileCard();
    }).observe(profile, { childList: true, subtree: true });
  }

  async function start() {
    renderProfileCard();
    observeProfile();
    observeWorkout();
    await loadStats();

    const supabase = client();
    if (supabase) {
      try {
        supabase.auth.onAuthStateChange(() => setTimeout(() => void loadStats(), 0));
      } catch {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void start(), { once: true });
  else void start();
})();
