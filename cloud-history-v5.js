(() => {
  const HISTORY_KEY = 'levelUpFitnessWorkoutHistory';
  const CLOUD_PREFIX = 'levelUpFitnessCloudWorkoutHistory:';
  const OWNER_KEY = 'levelUpFitnessWorkoutHistoryOwner';
  let loading = false;
  let lastUserId = '';

  function client() {
    try { return typeof getSupabaseClient === 'function' ? getSupabaseClient() : null; }
    catch { return null; }
  }

  function ms(value) {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function writeHistory(userId, history) {
    const safe = Array.isArray(history) ? history : [];
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(safe));
      if (userId) localStorage.setItem(`${CLOUD_PREFIX}${userId}`, JSON.stringify(safe));
      if (userId) localStorage.setItem(OWNER_KEY, `cloud:${userId}`);
      else localStorage.removeItem(OWNER_KEY);
    } catch {}
    try { workoutHistory = safe; } catch {}
  }

  function refreshUi() {
    try { if (typeof renderHome === 'function') renderHome(); } catch {}
    try { if (typeof renderProgress === 'function') renderProgress(); } catch {}
    try { if (typeof renderProfile === 'function') renderProfile(); } catch {}
    try { if (window.LevelUpTrainingStats?.reload) void window.LevelUpTrainingStats.reload(); } catch {}
  }

  async function load() {
    if (loading) return;
    const supabase = client();
    if (!supabase) return;
    loading = true;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user || null;
      if (!user?.id) {
        lastUserId = '';
        writeHistory('', []);
        refreshUi();
        return;
      }

      if (lastUserId && lastUserId !== user.id) {
        // Clear the visible copy immediately when the authenticated account changes.
        writeHistory(user.id, []);
        refreshUi();
      }
      lastUserId = user.id;

      const { data: sessions, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('id, plan_id, plan_name, program, scheduled_day, muscles, started_at, completed_at, duration_minutes')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true });
      if (sessionError) throw sessionError;

      const safeSessions = Array.isArray(sessions) ? sessions : [];
      if (!safeSessions.length) {
        writeHistory(user.id, []);
        refreshUi();
        window.dispatchEvent(new CustomEvent('levelup:history-v5-ready', { detail: { userId: user.id, count: 0 } }));
        return;
      }

      const ids = safeSessions.map(item => item.id).filter(Boolean);
      const { data: rows, error: rowError } = await supabase
        .from('workout_sets')
        .select('session_id, exercise_index, set_number, exercise_name, weight_lbs, reps, muscle_targets, saved_at')
        .eq('user_id', user.id)
        .in('session_id', ids);
      if (rowError) throw rowError;
      const safeRows = Array.isArray(rows) ? rows : [];

      const history = safeSessions.map(session => ({
        id: session.id,
        startedAt: ms(session.started_at),
        completedAt: ms(session.completed_at),
        durationMinutes: Number(session.duration_minutes) || 0,
        planId: session.plan_id || '',
        plan: session.plan_name || 'Workout',
        program: session.program || null,
        scheduledDay: session.scheduled_day || null,
        muscles: Array.isArray(session.muscles) ? session.muscles : [],
        logs: safeRows
          .filter(row => row.session_id === session.id)
          .sort((a, b) => Number(a.exercise_index) - Number(b.exercise_index) || Number(a.set_number) - Number(b.set_number))
          .map(row => ({
            exerciseIndex: Number(row.exercise_index) || 0,
            set: Number(row.set_number) || 1,
            exercise: row.exercise_name || '',
            weight: Number(row.weight_lbs) || 0,
            reps: Number(row.reps) || 0,
            muscleTargets: Array.isArray(row.muscle_targets) ? row.muscle_targets : [],
            savedAt: ms(row.saved_at)
          }))
      }));

      writeHistory(user.id, history);
      refreshUi();
      window.dispatchEvent(new CustomEvent('levelup:history-v5-ready', { detail: { userId: user.id, count: history.length } }));
    } catch {
      // If signed-in history cannot be verified, do not substitute shared browser history.
      const supabaseNow = client();
      try {
        const { data } = await supabaseNow.auth.getSession();
        const userId = data?.session?.user?.id || '';
        if (userId) {
          writeHistory(userId, []);
          refreshUi();
        }
      } catch {}
    } finally {
      loading = false;
    }
  }

  function start() {
    const supabase = client();
    if (!supabase) return;
    try {
      supabase.auth.onAuthStateChange(() => {
        window.setTimeout(() => void load(), 0);
      });
    } catch {}
    window.addEventListener('pageshow', () => void load());
    window.addEventListener('levelup:workout-finished', () => void load());
    void load();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
