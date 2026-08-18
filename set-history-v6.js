(() => {
  const SET_LIST_ID = 'setList';
  const AUTO_PREFIX = 'custom-auto-weekly-';
  const CONFIG_PREFIX = 'levelUpFitnessWeeklyPlan:';
  const BASELINE_PREFIX = 'levelUpFitnessSetHistoryBaselineV6:';

  const state = {
    loading: false,
    ready: false,
    userId: '',
    email: '',
    planId: '',
    planName: '',
    baseline: 0,
    key: '',
    previous: new Map()
  };

  let rendering = false;
  let renderQueued = false;

  function client() {
    try { return typeof getSupabaseClient === 'function' ? getSupabaseClient() : null; }
    catch { return null; }
  }

  function idFor(plan) {
    try { return typeof planIdFor === 'function' ? String(planIdFor(plan) || '') : String(plan?.id || ''); }
    catch { return String(plan?.id || ''); }
  }

  function configBaseline(planId, accountId) {
    if (!planId.startsWith(AUTO_PREFIX)) return 0;
    const candidateKeys = [];
    if (accountId) candidateKeys.push(`${CONFIG_PREFIX}${accountId}`);
    try {
      const accountKey = String(userProfile?.accountKey || '');
      const email = String(userProfile?.email || '').trim().toLowerCase();
      if (accountKey) candidateKeys.push(`${CONFIG_PREFIX}${accountKey}`);
      if (email) candidateKeys.push(`${CONFIG_PREFIX}${email}`);
    } catch {}

    for (const key of [...new Set(candidateKeys)]) {
      try {
        const config = JSON.parse(localStorage.getItem(key) || 'null');
        if (config && Array.isArray(config.planIds) && config.planIds.includes(planId)) {
          const updatedAt = Number(config.updatedAt) || 0;
          if (updatedAt) return updatedAt;
        }
      } catch {}
    }
    return 0;
  }

  function activeWorkoutStart() {
    try {
      const started = Number(activeStartedAt) || 0;
      if (started > 0) return started;
    } catch {}
    try {
      if (typeof loadActiveWorkoutDraft === 'function') {
        const started = Number(loadActiveWorkoutDraft()?.startedAt) || 0;
        if (started > 0) return started;
      }
    } catch {}
    return 0;
  }

  function persistentGeneratedBaseline(planId, accountId) {
    if (!planId.startsWith(AUTO_PREFIX)) return 0;
    const owner = accountId || 'local';
    const key = `${BASELINE_PREFIX}${owner}:${planId}`;
    let saved = 0;
    try { saved = Number(localStorage.getItem(key)) || 0; } catch {}

    if (!saved) {
      const started = activeWorkoutStart();
      if (started > 0) {
        saved = started;
        try { localStorage.setItem(key, String(saved)); } catch {}
      }
    }
    return saved;
  }

  function currentPlan(accountId = '') {
    try {
      if (typeof activePlan === 'undefined' || !activePlan) return { id: '', name: '', baseline: 0 };
      const id = idFor(activePlan);
      let baseline = configBaseline(id, accountId);
      if (id.startsWith(AUTO_PREFIX)) {
        try {
          const storedPlan = typeof customPlansForCurrentUser === 'function'
            ? customPlansForCurrentUser().find(plan => idFor(plan) === id)
            : null;
          baseline = Math.max(baseline, Number(storedPlan?.updatedAt) || Number(activePlan.updatedAt) || 0);
        } catch {
          baseline = Math.max(baseline, Number(activePlan.updatedAt) || 0);
        }
        baseline = Math.max(baseline, persistentGeneratedBaseline(id, accountId));
      }
      return { id, name: String(activePlan.name || ''), baseline };
    } catch {
      return { id: '', name: '', baseline: 0 };
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

  function accountIndicator() {
    const title = document.getElementById('activeTitle');
    if (!title) return;
    let node = document.getElementById('activeAccountIndicator');
    if (!node) {
      node = document.createElement('p');
      node.id = 'activeAccountIndicator';
      node.style.margin = '-4px 0 12px';
      node.style.color = 'var(--muted)';
      node.style.fontSize = '.78rem';
      title.insertAdjacentElement('afterend', node);
    }
    setText(node, state.email ? `Signed in as ${state.email}` : (state.ready ? 'Local profile' : 'Checking signed-in account…'));
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
      accountIndicator();

      // Legacy history cards are never allowed to remain in the active workout.
      list.querySelectorAll('.set-history-compare:not([data-history-v6="true"])').forEach(node => node.remove());

      list.querySelectorAll('.set-row').forEach(row => {
        const exercise = row.querySelector('.exercise-heading h3')?.textContent?.trim() || '';
        if (!exercise) return;
        row.querySelectorAll('button[data-log]').forEach(button => {
          const [exerciseIndex, setNumber] = String(button.dataset.log || '').split('-').map(Number);
          if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setNumber)) return;
          const weightInput = document.getElementById(`w-${exerciseIndex}-${setNumber}`);
          const repsInput = document.getElementById(`r-${exerciseIndex}-${setNumber}`);
          if (!weightInput || !repsInput) return;

          let box = button.nextElementSibling;
          const isV6Box = box?.classList?.contains('set-history-compare') && box.dataset.historyV6 === 'true';
          const previous = state.ready ? (state.previous.get(setKey(exercise, setNumber)) || null) : null;

          // A first-time workout should not show a Set History card at all.
          // History appears only after this exact workout has a verified prior set.
          if (!previous) {
            if (isV6Box) box.remove();
            return;
          }

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

  function localPrevious(plan) {
    const previous = new Map();
    let history = [];
    try { history = Array.isArray(workoutHistory) ? workoutHistory : []; } catch {}
    history
      .filter(session => {
        if (!session || !Array.isArray(session.logs)) return false;
        if (plan.id ? String(session.planId || '') !== plan.id : String(session.plan || '') !== plan.name) return false;
        if (plan.baseline && Number(session.completedAt) && Number(session.completedAt) < plan.baseline) return false;
        return true;
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
    const plan = currentPlan(user?.id || '');
    const nextKey = `${user?.id || 'local'}|${plan.id}|${plan.name}|${plan.baseline}`;
    if (!force && state.ready && state.key === nextKey) return queueRender();

    state.loading = true;
    state.ready = false;
    state.key = nextKey;
    state.userId = user?.id || '';
    state.email = user?.email || '';
    state.planId = plan.id;
    state.planName = plan.name;
    state.baseline = plan.baseline;
    state.previous = new Map();
    queueRender();

    try {
      if (!user?.id || !supabase) {
        state.previous = localPrevious(plan);
        state.ready = true;
        return queueRender();
      }
      if (!plan.id && !plan.name) {
        state.ready = true;
        return queueRender();
      }

      let query = supabase
        .from('workout_sessions')
        .select('id, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });
      if (plan.id) query = query.eq('plan_id', plan.id);
      else query = query.eq('plan_name', plan.name);
      if (plan.baseline) query = query.gte('completed_at', new Date(plan.baseline).toISOString());

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
      // Never substitute shared browser history for unverified cloud history.
      state.previous = new Map();
      state.ready = true;
      queueRender();
    } finally {
      state.loading = false;
    }
  }

  function start() {
    const list = document.getElementById(SET_LIST_ID);
    if (list) {
      new MutationObserver(mutations => {
        let relevant = false;
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            const element = node;
            if (element.matches?.('.set-row, .set-history-compare:not([data-history-v6="true"])')
              || element.querySelector?.('.set-row, .set-history-compare:not([data-history-v6="true"])')) {
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

    let lastPlanKey = '';
    window.setInterval(() => {
      const plan = currentPlan(state.userId);
      const key = `${plan.id}|${plan.name}|${plan.baseline}`;
      if (key !== lastPlanKey) {
        lastPlanKey = key;
        void reload(true);
      }
    }, 500);

    window.addEventListener('levelup:history-v5-ready', () => void reload(true));
    void reload(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();