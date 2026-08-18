(() => {
  const SET_LIST_ID = 'setList';
  const AUTO_WEEKLY_PREFIX = 'custom-auto-weekly-';
  const state = {
    key: '',
    loading: false,
    ready: false,
    cloud: false,
    accountId: '',
    accountEmail: '',
    planId: '',
    planName: '',
    baseline: 0,
    sessions: [],
    previous: new Map()
  };

  function client() {
    try { return typeof getSupabaseClient === 'function' ? getSupabaseClient() : null; }
    catch { return null; }
  }

  function planContext() {
    try {
      if (typeof activePlan !== 'undefined' && activePlan) {
        const id = typeof planIdFor === 'function' ? String(planIdFor(activePlan) || '') : String(activePlan.id || '');
        return {
          id,
          name: String(activePlan.name || ''),
          baseline: id.startsWith(AUTO_WEEKLY_PREFIX) ? Number(activePlan.updatedAt) || 0 : 0
        };
      }
    } catch {}
    return { id: '', name: '', baseline: 0 };
  }

  function keyFor(exercise, set) {
    return `${String(exercise || '').trim()}\u0000${Number(set) || 0}`;
  }

  function formatWeight(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, '');
  }

  function previousLabel(previous) {
    if (!previous) return '';
    return previous.weight > 0 ? `${formatWeight(previous.weight)} lb x ${previous.reps}` : `${previous.reps} reps`;
  }

  function signed(value, suffix = '') {
    const rounded = Math.abs(Number(value) || 0) < 0.05 ? 0 : Number(value) || 0;
    const absolute = Number.isInteger(rounded) ? String(Math.abs(rounded)) : Math.abs(rounded).toFixed(1).replace(/\.0$/, '');
    if (!rounded) return `0${suffix}`;
    return `${rounded > 0 ? '+' : '-'}${absolute}${suffix}`;
  }

  function comparison(previous, weightInput, repsInput) {
    if (!state.ready) return { tone: 'baseline', summary: 'Checking your history', detail: 'Only this account and this workout are being checked.' };
    if (!previous) return { tone: 'baseline', summary: 'First time in this workout', detail: 'Save this set to create this workout history.' };

    const weightText = String(weightInput?.value || '').trim();
    const repsText = String(repsInput?.value || '').trim();
    if (!weightText || !repsText) return { tone: 'neutral', summary: `Last time: ${previousLabel(previous)}`, detail: "Enter today's weight and reps to compare." };

    const weight = Number(weightText);
    const reps = Number(repsText);
    if (!Number.isFinite(weight) || weight < 0 || !Number.isFinite(reps) || reps < 1) {
      return { tone: 'neutral', summary: `Last time: ${previousLabel(previous)}`, detail: 'Enter valid numbers to compare.' };
    }

    const weightDelta = weight - previous.weight;
    const repsDelta = reps - previous.reps;
    const previousVolume = previous.weight * previous.reps;
    const currentVolume = weight * reps;
    const volumeDelta = currentVolume - previousVolume;
    const volumePercent = previousVolume > 0 ? (volumeDelta / previousVolume) * 100 : 0;

    if (previous.weight === 0 && weight === 0) {
      const tone = repsDelta > 0 ? 'up' : repsDelta < 0 ? 'down' : 'same';
      const summary = repsDelta > 0 ? `Improved by ${repsDelta} rep${repsDelta === 1 ? '' : 's'}` : repsDelta < 0 ? `${Math.abs(repsDelta)} fewer rep${Math.abs(repsDelta) === 1 ? '' : 's'}` : 'Matched last time';
      return { tone, summary, detail: `Previous ${previous.reps} reps | Today ${reps} reps` };
    }

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
    return { tone, summary, detail: `Weight ${signed(weightDelta, ' lb')} | Reps ${signed(repsDelta)} | Previous ${previousLabel(previous)}` };
  }

  function accountIndicator() {
    const active = document.getElementById('active');
    const title = document.getElementById('activeTitle');
    if (!active || !title) return;
    let indicator = document.getElementById('activeAccountIndicator');
    if (!indicator) {
      indicator = document.createElement('p');
      indicator.id = 'activeAccountIndicator';
      indicator.style.margin = '-4px 0 12px';
      indicator.style.color = 'var(--muted)';
      indicator.style.fontSize = '.78rem';
      title.insertAdjacentElement('afterend', indicator);
    }
    if (state.cloud && state.accountEmail) indicator.textContent = `Signed in as ${state.accountEmail}`;
    else if (state.ready) indicator.textContent = 'Local profile';
    else indicator.textContent = 'Checking signed-in account…';
  }

  function removeLegacyBoxes() {
    const setList = document.getElementById(SET_LIST_ID);
    if (!setList) return;
    setList.querySelectorAll('.set-history-compare:not([data-history-v5="true"])').forEach(node => node.remove());
  }

  function ensureBox(button, exerciseName, setNumber, weightInput, repsInput) {
    let box = button.nextElementSibling;
    if (!box?.classList?.contains('set-history-compare') || box.dataset.historyV5 !== 'true') {
      box = document.createElement('div');
      box.className = 'set-history-compare';
      box.dataset.historyV5 = 'true';
      box.innerHTML = `<span class="set-history-kicker"></span><strong class="set-history-summary"></strong><span class="set-history-detail"></span>`;
      button.insertAdjacentElement('afterend', box);
      weightInput?.addEventListener('input', () => renderBox(box, exerciseName, setNumber, weightInput, repsInput));
      repsInput?.addEventListener('input', () => renderBox(box, exerciseName, setNumber, weightInput, repsInput));
    }
    renderBox(box, exerciseName, setNumber, weightInput, repsInput);
  }

  function renderBox(box, exerciseName, setNumber, weightInput, repsInput) {
    const previous = state.previous.get(keyFor(exerciseName, setNumber)) || null;
    const result = comparison(previous, weightInput, repsInput);
    box.dataset.tone = result.tone;
    box.querySelector('.set-history-kicker').textContent = `SET ${setNumber} HISTORY`;
    box.querySelector('.set-history-summary').textContent = result.summary;
    box.querySelector('.set-history-detail').textContent = result.detail;
  }

  function render() {
    removeLegacyBoxes();
    accountIndicator();
    const setList = document.getElementById(SET_LIST_ID);
    if (!setList) return;
    setList.querySelectorAll('.set-row').forEach(row => {
      const exerciseName = row.querySelector('.exercise-heading h3')?.textContent?.trim() || '';
      if (!exerciseName) return;
      row.querySelectorAll('button[data-log]').forEach(button => {
        const [exerciseIndex, setNumber] = String(button.dataset.log || '').split('-').map(Number);
        if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setNumber)) return;
        const weightInput = document.getElementById(`w-${exerciseIndex}-${setNumber}`);
        const repsInput = document.getElementById(`r-${exerciseIndex}-${setNumber}`);
        if (!weightInput || !repsInput) return;
        ensureBox(button, exerciseName, setNumber, weightInput, repsInput);
      });
    });
  }

  function buildPrevious(sessions, rows) {
    const previous = new Map();
    const completedBySession = new Map(sessions.map(session => [session.id, Date.parse(session.completed_at || '') || 0]));
    [...rows]
      .sort((a, b) => (completedBySession.get(b.session_id) || 0) - (completedBySession.get(a.session_id) || 0))
      .forEach(row => {
        const key = keyFor(row.exercise_name, row.set_number);
        if (previous.has(key)) return;
        previous.set(key, {
          weight: Number(row.weight_lbs) || 0,
          reps: Number(row.reps) || 0,
          completedAt: completedBySession.get(row.session_id) || 0
        });
      });
    return previous;
  }

  function localPrevious(context) {
    let history = [];
    try { history = Array.isArray(workoutHistory) ? workoutHistory : []; } catch {}
    const sessions = history
      .filter(session => {
        if (!session || !Array.isArray(session.logs)) return false;
        const same = context.id ? String(session.planId || '') === context.id : String(session.plan || '') === context.name;
        if (!same) return false;
        if (context.baseline && Number(session.completedAt) && Number(session.completedAt) < context.baseline) return false;
        return true;
      })
      .sort((a, b) => (Number(b.completedAt) || 0) - (Number(a.completedAt) || 0));
    const previous = new Map();
    sessions.forEach(session => {
      (session.logs || []).forEach(log => {
        const key = keyFor(log.exercise, log.set);
        if (!previous.has(key)) previous.set(key, { weight: Number(log.weight) || 0, reps: Number(log.reps) || 0, completedAt: Number(session.completedAt) || 0 });
      });
    });
    return previous;
  }

  async function load() {
    if (state.loading) return;
    const context = planContext();
    const supabase = client();
    let session = null;
    if (supabase) {
      try { session = (await supabase.auth.getSession()).data?.session || null; } catch {}
    }
    const user = session?.user || null;
    const nextKey = `${user?.id || 'local'}|${context.id}|${context.name}|${context.baseline}`;
    if (state.ready && state.key === nextKey) {
      render();
      return;
    }

    state.loading = true;
    state.ready = false;
    state.key = nextKey;
    state.cloud = Boolean(user?.id);
    state.accountId = user?.id || '';
    state.accountEmail = user?.email || '';
    state.planId = context.id;
    state.planName = context.name;
    state.baseline = context.baseline;
    state.previous = new Map();
    render();

    try {
      if (!user?.id || !supabase) {
        state.previous = localPrevious(context);
        state.ready = true;
        render();
        return;
      }

      if (!context.id && !context.name) {
        state.ready = true;
        render();
        return;
      }

      let query = supabase
        .from('workout_sessions')
        .select('id, plan_id, plan_name, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });
      if (context.id) query = query.eq('plan_id', context.id);
      else query = query.eq('plan_name', context.name);
      if (context.baseline) query = query.gte('completed_at', new Date(context.baseline).toISOString());

      const { data: sessions, error: sessionError } = await query;
      if (sessionError) throw sessionError;
      const safeSessions = Array.isArray(sessions) ? sessions : [];
      state.sessions = safeSessions;

      if (!safeSessions.length) {
        state.previous = new Map();
        state.ready = true;
        render();
        return;
      }

      const ids = safeSessions.map(item => item.id).filter(Boolean);
      const { data: rows, error: rowError } = await supabase
        .from('workout_sets')
        .select('session_id, set_number, exercise_name, weight_lbs, reps')
        .eq('user_id', user.id)
        .in('session_id', ids);
      if (rowError) throw rowError;

      state.previous = buildPrevious(safeSessions, Array.isArray(rows) ? rows : []);
      state.ready = true;
      render();
    } catch {
      // Never fall back to another account's browser history when cloud history
      // cannot be verified. An empty history is safer than a false history.
      state.previous = new Map();
      state.ready = true;
      render();
    } finally {
      state.loading = false;
    }
  }

  function start() {
    const setList = document.getElementById(SET_LIST_ID);
    if (setList) new MutationObserver(() => render()).observe(setList, { childList: true, subtree: true });

    const supabase = client();
    if (supabase) {
      try {
        supabase.auth.onAuthStateChange(() => {
          state.key = '';
          state.ready = false;
          window.setTimeout(() => void load(), 0);
        });
      } catch {}
    }

    let lastContext = '';
    window.setInterval(() => {
      const context = planContext();
      const current = `${context.id}|${context.name}|${context.baseline}`;
      if (current !== lastContext) {
        lastContext = current;
        state.key = '';
        state.ready = false;
        void load();
      } else {
        render();
      }
    }, 250);

    void load();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
