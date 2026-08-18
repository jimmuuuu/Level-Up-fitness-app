(() => {
  const SET_LIST_ID = 'setList';
  const UNLOCK_PREFIX = 'levelUpFitnessSetHistoryUnlockedV7:';

  const state = {
    loading: false,
    ready: false,
    userId: '',
    planId: '',
    planName: '',
    fingerprint: '',
    unlockedAt: 0,
    key: '',
    previous: new Map()
  };

  let rendering = false;
  let renderQueued = false;
  let lastContext = null;

  function client() {
    try { return typeof getSupabaseClient === 'function' ? getSupabaseClient() : null; }
    catch { return null; }
  }

  function planId(plan) {
    try { return typeof planIdFor === 'function' ? String(planIdFor(plan) || '') : String(plan?.id || ''); }
    catch { return String(plan?.id || ''); }
  }

  function setCount(exercise) {
    try { return typeof setCountFor === 'function' ? Number(setCountFor(exercise)) || 3 : Number(exercise?.sets) || 3; }
    catch { return Number(exercise?.sets) || 3; }
  }

  function fingerprintFor(plan) {
    if (!plan || !Array.isArray(plan.exercises)) return '';
    return plan.exercises.map((exercise, index) => {
      const reps = Array.isArray(exercise?.repRange) ? exercise.repRange.join('-') : '';
      return `${index}:${String(exercise?.name || '').trim()}:${setCount(exercise)}:${reps}`;
    }).join('|');
  }

  function hash(value) {
    let h = 2166136261;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  function currentContext(userId = '') {
    try {
      if (typeof activePlan === 'undefined' || !activePlan) return null;
      const id = planId(activePlan);
      const name = String(activePlan.name || '');
      const fingerprint = fingerprintFor(activePlan);
      if (!id && !name) return null;
      const owner = userId || 'local';
      const unlockKey = `${UNLOCK_PREFIX}${owner}:${id || name}:${hash(fingerprint)}`;
      let unlockedAt = 0;
      try { unlockedAt = Number(localStorage.getItem(unlockKey)) || 0; } catch {}
      return { id, name, fingerprint, unlockKey, unlockedAt };
    } catch {
      return null;
    }
  }

  const setKey = (exercise, set) => `${String(exercise || '').trim()}\u0000${Number(set) || 0}`;

  function formatWeight(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, '');
  }

  function previousText(item) {
    if (!item) return '';
    return item.weight > 0 ? `${formatWeight(item.weight)} lb x ${item.reps}` : `${item.reps} reps`;
  }

  function resultFor(previous, weightInput, repsInput) {
    const weightText = String(weightInput.value || '').trim();
    const repsText = String(repsInput.value || '').trim();
    if (!weightText || !repsText) return ['neutral', `Last time: ${previousText(previous)}`, "Enter today's weight and reps to compare."];

    const weight = Number(weightText);
    const reps = Number(repsText);
    if (!Number.isFinite(weight) || weight < 0 || !Number.isFinite(reps) || reps < 1) {
      return ['neutral', `Last time: ${previousText(previous)}`, 'Enter valid numbers to compare.'];
    }

    const weightDelta = weight - previous.weight;
    const repsDelta = reps - previous.reps;
    if (weightDelta > 0 && repsDelta >= 0) return ['up', 'Stronger than last time', `Previous ${previousText(previous)} | Today ${formatWeight(weight)} lb x ${reps}`];
    if (weightDelta === 0 && repsDelta > 0) return ['up', 'More reps than last time', `Previous ${previous.reps} reps | Today ${reps} reps`];
    if (weightDelta === 0 && repsDelta === 0) return ['same', 'Matched last time', `Previous ${previousText(previous)}`];
    return ['down', 'Different from last time', `Previous ${previousText(previous)} | Today ${weight > 0 ? `${formatWeight(weight)} lb x ` : ''}${reps}`];
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function syncRecommendationVisibility(showHistory) {
    const list = document.getElementById(SET_LIST_ID);
    if (!list) return;
    list.querySelectorAll('.weight-recommendation').forEach(card => {
      if (!/your exercise history/i.test(card.textContent || '')) return;
      if (!showHistory) {
        card.style.display = 'none';
        card.dataset.exactWorkoutHistoryHidden = 'true';
      } else if (card.dataset.exactWorkoutHistoryHidden === 'true') {
        card.style.display = '';
        delete card.dataset.exactWorkoutHistoryHidden;
      }
    });
  }

  function renderBox(box, previous, weightInput, repsInput, setNumber) {
    const [tone, summary, detail] = resultFor(previous, weightInput, repsInput);
    if (box.dataset.tone !== tone) box.dataset.tone = tone;
    setText(box.querySelector('.set-history-kicker'), `SET ${setNumber} HISTORY`);
    setText(box.querySelector('.set-history-summary'), summary);
    setText(box.querySelector('.set-history-detail'), detail);
  }

  function render() {
    if (rendering) return;
    const list = document.getElementById(SET_LIST_ID);
    if (!list) return;
    rendering = true;
    try {
      const unlocked = Boolean(state.unlockedAt && state.previous.size);
      list.dataset.setHistoryUnlocked = unlocked ? 'true' : 'false';

      // Nothing related to Set History is allowed to remain until this exact
      // workout version has been completed at least once.
      if (!unlocked) {
        list.querySelectorAll('.set-history-compare').forEach(node => node.remove());
        syncRecommendationVisibility(false);
        return;
      }

      syncRecommendationVisibility(true);
      list.querySelectorAll('.set-history-compare:not([data-history-v6="true"])').forEach(node => node.remove());

      list.querySelectorAll('.set-row').forEach(row => {
        const exercise = row.querySelector('.exercise-heading h3')?.textContent?.trim() || '';
        if (!exercise) return;
        row.querySelectorAll('button[data-log]').forEach(button => {
          const [exerciseIndex, setNumber] = String(button.dataset.log || '').split('-').map(Number);
          if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setNumber)) return;
          const previous = state.previous.get(setKey(exercise, setNumber)) || null;
          let box = button.nextElementSibling;
          const isV6Box = box?.classList?.contains('set-history-compare') && box.dataset.historyV6 === 'true';

          if (!previous) {
            if (isV6Box) box.remove();
            return;
          }

          const weightInput = document.getElementById(`w-${exerciseIndex}-${setNumber}`);
          const repsInput = document.getElementById(`r-${exerciseIndex}-${setNumber}`);
          if (!weightInput || !repsInput) return;

          if (!isV6Box) {
            box = document.createElement('div');
            box.className = 'set-history-compare';
            box.dataset.historyV6 = 'true';
            box.innerHTML = '<span class="set-history-kicker"></span><strong class="set-history-summary"></strong><span class="set-history-detail"></span>';
            button.insertAdjacentElement('afterend', box);
            weightInput.addEventListener('input', queueRender);
            repsInput.addEventListener('input', queueRender);
          }
          renderBox(box, previous, weightInput, repsInput, setNumber);
        });
      });
    } finally {
      rendering = false;
    }
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    window.requestAnimationFrame(() => {
      renderQueued = false;
      render();
    });
  }

  function localPrevious(context) {
    const previous = new Map();
    let history = [];
    try { history = Array.isArray(workoutHistory) ? workoutHistory : []; } catch {}
    history
      .filter(session => {
        if (!session || !Array.isArray(session.logs)) return false;
        if (context.id ? String(session.planId || '') !== context.id : String(session.plan || '') !== context.name) return false;
        return Number(session.completedAt) >= Math.max(0, context.unlockedAt - 2000);
      })
      .sort((a, b) => (Number(b.completedAt) || 0) - (Number(a.completedAt) || 0))
      .forEach(session => {
        session.logs.forEach(log => {
          const key = setKey(log.exercise, log.set);
          if (!previous.has(key)) previous.set(key, { weight: Number(log.weight) || 0, reps: Number(log.reps) || 0 });
        });
      });
    return previous;
  }

  async function reload(force = false) {
    if (state.loading) return;
    const supabase = client();
    let authSession = null;
    if (supabase) {
      try { authSession = (await supabase.auth.getSession()).data?.session || null; } catch {}
    }
    const user = authSession?.user || null;
    const context = currentContext(user?.id || '');
    lastContext = context;

    if (!context) {
      state.ready = true;
      state.previous = new Map();
      state.unlockedAt = 0;
      return queueRender();
    }

    const nextKey = `${user?.id || 'local'}|${context.id}|${hash(context.fingerprint)}|${context.unlockedAt}`;
    if (!force && state.ready && state.key === nextKey) return queueRender();

    state.loading = true;
    state.ready = false;
    state.key = nextKey;
    state.userId = user?.id || '';
    state.planId = context.id;
    state.planName = context.name;
    state.fingerprint = context.fingerprint;
    state.unlockedAt = context.unlockedAt;
    state.previous = new Map();
    queueRender();

    try {
      // Hard gate: until this exact workout fingerprint has been completed once,
      // do not load or display any Set History at all.
      if (!context.unlockedAt) {
        state.ready = true;
        return queueRender();
      }

      if (!user?.id || !supabase) {
        state.previous = localPrevious(context);
        state.ready = true;
        return queueRender();
      }

      let query = supabase
        .from('workout_sessions')
        .select('id, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', new Date(Math.max(0, context.unlockedAt - 2000)).toISOString())
        .order('completed_at', { ascending: false });
      if (context.id) query = query.eq('plan_id', context.id);
      else query = query.eq('plan_name', context.name);

      const { data: sessions, error: sessionError } = await query;
      if (sessionError) throw sessionError;
      const safeSessions = Array.isArray(sessions) ? sessions : [];
      if (!safeSessions.length) {
        state.ready = true;
        return queueRender();
      }

      const completed = new Map(safeSessions.map(item => [item.id, Date.parse(item.completed_at || '') || 0]));
      const ids = safeSessions.map(item => item.id).filter(Boolean);
      const { data: rows, error: rowError } = await supabase
        .from('workout_sets')
        .select('session_id, set_number, exercise_name, weight_lbs, reps')
        .eq('user_id', user.id)
        .in('session_id', ids);
      if (rowError) throw rowError;

      const previous = new Map();
      [...(Array.isArray(rows) ? rows : [])]
        .sort((a, b) => (completed.get(b.session_id) || 0) - (completed.get(a.session_id) || 0))
        .forEach(row => {
          const key = setKey(row.exercise_name, row.set_number);
          if (!previous.has(key)) previous.set(key, { weight: Number(row.weight_lbs) || 0, reps: Number(row.reps) || 0 });
        });
      state.previous = previous;
      state.ready = true;
      queueRender();
    } catch {
      state.previous = new Map();
      state.ready = true;
      queueRender();
    } finally {
      state.loading = false;
    }
  }

  function completedSessionFor(context, since) {
    let history = [];
    try { history = Array.isArray(workoutHistory) ? workoutHistory : []; } catch {}
    return history
      .filter(session => {
        if (!session || !Number(session.completedAt) || Number(session.completedAt) < since - 3000) return false;
        return context.id ? String(session.planId || '') === context.id : String(session.plan || '') === context.name;
      })
      .sort((a, b) => Number(b.completedAt) - Number(a.completedAt))[0] || null;
  }

  function unlockFromCompletedSession(context, session) {
    if (!context || !session?.completedAt) return false;
    const completedAt = Number(session.completedAt) || Date.now();
    try { localStorage.setItem(context.unlockKey, String(completedAt)); } catch {}
    void reload(true);
    return true;
  }

  function watchFinishClick() {
    document.addEventListener('click', event => {
      const button = event.target.closest?.('#finish');
      if (!button) return;
      const context = lastContext || currentContext(state.userId);
      if (!context) return;
      const clickedAt = Date.now();
      [150, 400, 900, 1600, 2600].forEach(delay => {
        window.setTimeout(() => {
          const session = completedSessionFor(context, clickedAt);
          if (session) unlockFromCompletedSession(context, session);
        }, delay);
      });
    }, true);

    window.addEventListener('levelup:workout-finished', () => {
      const context = lastContext || currentContext(state.userId);
      if (!context) return;
      const session = completedSessionFor(context, Date.now() - 10000);
      if (session) unlockFromCompletedSession(context, session);
    });
  }

  function start() {
    const list = document.getElementById(SET_LIST_ID);
    if (list) {
      // Remove anything an older cached history script may have inserted.
      list.querySelectorAll('.set-history-compare').forEach(node => node.remove());
      list.dataset.setHistoryUnlocked = 'false';
      new MutationObserver(mutations => {
        let relevant = false;
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            const element = node;
            if (element.matches?.('.set-row, .set-history-compare') || element.querySelector?.('.set-row, .set-history-compare')) {
              relevant = true;
              break;
            }
          }
          if (relevant) break;
        }
        if (relevant) queueRender();
      }).observe(list, { childList: true, subtree: true });
    }

    const supabase = client();
    if (supabase) {
      try { supabase.auth.onAuthStateChange(() => window.setTimeout(() => void reload(true), 0)); } catch {}
    }

    watchFinishClick();

    let lastPlanKey = '';
    window.setInterval(() => {
      const context = currentContext(state.userId);
      const key = context ? `${context.id}|${hash(context.fingerprint)}|${context.unlockedAt}` : '';
      if (key !== lastPlanKey) {
        lastPlanKey = key;
        void reload(true);
      } else if (!state.unlockedAt) {
        queueRender();
      }
    }, 500);

    window.addEventListener('levelup:history-v5-ready', () => void reload(true));
    void reload(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
