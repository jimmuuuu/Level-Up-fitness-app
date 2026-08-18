(() => {
  const SET_LIST_ID = 'setList';
  const AUTO_PREFIX = 'custom-auto-weekly-';
  const CONFIG_PREFIX = 'levelUpFitnessWeeklyPlan:';

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

  function currentPlan(accountId = '') {
    try {
      if (typeof activePlan === 'undefined' || !activePlan) return { id: '', name: '', baseline: 0 };
      const id = idFor(activePlan);
      let baseline = configBaseline(id, accountId);
      if (!baseline && id.startsWith(AUTO_PREFIX)) {
        try {
          const storedPlan = typeof customPlansForCurrentUser === 'function'
            ? customPlansForCurrentUser().find(plan => idFor(plan) === id)
            : null;
          baseline = Number(storedPlan?.updatedAt) || Number(activePlan.updatedAt) || 0;
        } catch {
          baseline = Number(activePlan.updatedAt) || 0;
        }
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
    if (!state.ready) return ['baseline', 'Checking your history', 'Only this account and this version of the workout are being checked.'];
    if (!previous) return ['baseline', 'First time in this workout', 'Save this set to create this workout history.'];

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
    node.textContent = state.email ? `Signed in as ${state.email}` : (state.ready ? 'Local profile' : 'Checking signed-in account…');
  }

  function renderBox(box, exercise, setNumber, weightInput, repsInput) {
    const [tone, summary, detail] = resultFor(state.previous.get(setKey(exercise, setNumber)) || null, weightInput, repsInput);
    box.dataset.tone = tone;
    box.querySelector('.set-history-kicker').textContent = `SET ${setNumber} HISTORY`;
    box.querySelector('.set-history-summary').textContent = summary;
    box.querySelector('.set-history-detail').textContent = detail;
  }

  function render() {
    const list = document.getElementById(SET_LIST_ID);
    if (!list) return;
    accountIndicator();

    // Remove every older history implementation so only V6 can write these cards.
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
        if (!box?.classList?.contains('set-history-compare') || box.dataset.historyV6 !== 'true') {
          box = document.createElement('div');
          box.className = 'set-history-compare';
          box.dataset.historyV6 = 'true';
          box.innerHTML = '<span class="set-history-kicker"></span><strong class="set-history-summary"></strong><span class="set-history-detail"></span>';
          button.insertAdjacentElement('afterend', box);
          weightInput.addEventListener('input', () => renderBox(box, exercise, setNumber, weightInput, repsInput));
          repsInput.addEventListener('input', () => renderBox(box, exercise, setNumber, weightInput, repsInput));
        }
        renderBox(box, exercise, setNumber, weightInput, repsInput);
      });
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
    if (!force && state.ready && state.key === nextKey) return render();

    state.loading = true;
    state.ready = false;
    state.key = nextKey;
    state.userId = user?.id || '';
    state.email = user?.email || '';
    state.planId = plan.id;
    state.planName = plan.name;
    state.baseline = plan.baseline;
    state.previous = new Map();
    render();

    try {
      if (!user?.id || !supabase) {
        state.previous = localPrevious(plan);
        state.ready = true;
        return render();
      }
      if (!plan.id && !plan.name) {
        state.ready = true;
        return render();
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
        return render();
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
      render();
    } catch {
      // Never substitute shared browser history for unverified cloud history.
      state.previous = new Map();
      state.ready = true;
      render();
    } finally {
      state.loading = false;
    }
  }

  function start() {
    const list = document.getElementById(SET_LIST_ID);
    if (list) new MutationObserver(render).observe(list, { childList: true, subtree: true });

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
      } else {
        render();
      }
    }, 250);

    window.addEventListener('levelup:history-v5-ready', () => void reload(true));
    void reload(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
