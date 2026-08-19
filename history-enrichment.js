(() => {
  const NOTE_PREFIX = 'levelUpFitnessWorkoutNote:';
  const EXERCISE_NOTE_PREFIX = 'levelUpFitnessExerciseNotes:';
  const CHECKIN_PREFIX = 'levelUpFitnessWorkoutCheckIn:';
  let loading = false;

  function currentHistory() {
    try {
      if (Array.isArray(workoutHistory)) return workoutHistory;
    } catch {}
    try {
      const parsed = JSON.parse(localStorage.getItem('levelUpFitnessWorkoutHistory') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function accountCandidates() {
    const values = new Set(['local']);
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) {
        values.add(String(cloudUser.id));
        values.add(`cloud:${cloudUser.id}`);
      }
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) values.add(String(userProfile.accountKey));
      if (typeof userProfile !== 'undefined' && userProfile?.email) values.add(String(userProfile.email).trim().toLowerCase());
    } catch {}
    try {
      const owner = String(localStorage.getItem('levelUpFitnessWorkoutHistoryOwner') || '');
      if (owner) values.add(owner);
      if (owner.startsWith('cloud:')) values.add(owner.slice(6));
    } catch {}
    return [...values].filter(Boolean);
  }

  function localValue(prefix, sessionId) {
    const id = String(sessionId || '');
    if (!id) return '';
    for (const account of accountCandidates()) {
      try {
        const value = localStorage.getItem(`${prefix}${account}:${id}`);
        if (value != null && value !== '') return value;
      } catch {}
    }
    return '';
  }

  function parseExerciseNotes(raw) {
    if (!raw) return {};
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const clean = {};
      Object.entries(parsed).forEach(([index, value]) => {
        const note = String(value?.note || '').trim();
        if (!note) return;
        clean[String(index)] = {
          exercise: String(value?.exercise || '').trim(),
          note,
          updatedAt: Number(value?.updatedAt) || 0
        };
      });
      return clean;
    } catch { return {}; }
  }

  function localExtras(sessionId) {
    const note = localValue(NOTE_PREFIX, sessionId);
    const exerciseNotes = parseExerciseNotes(localValue(EXERCISE_NOTE_PREFIX, sessionId));
    const rawCheckIn = localValue(CHECKIN_PREFIX, sessionId);
    let checkIn = null;
    if (rawCheckIn) {
      try {
        const parsed = JSON.parse(rawCheckIn);
        if (parsed && typeof parsed === 'object') checkIn = parsed;
      } catch {}
    }
    return { note, exerciseNotes, checkIn };
  }

  function writeHistory(next) {
    try { workoutHistory = next; } catch {}
    try { localStorage.setItem('levelUpFitnessWorkoutHistory', JSON.stringify(next)); } catch {}
  }

  function publish(next) {
    writeHistory(next);
    window.dispatchEvent(new CustomEvent('levelup:history-enriched'));
    try { window.LevelUpWorkoutCalendar?.render?.(); } catch {}
    try { window.LevelUpProgressInsights?.render?.(); } catch {}
    try { window.LevelUpTrainingQuests?.render?.(); } catch {}
  }

  async function enrich() {
    if (loading) return;
    loading = true;
    try {
      const current = currentHistory();
      if (!current.length) return;

      let next = current.map(session => {
        const local = localExtras(session?.id);
        return {
          ...session,
          checkIn: local.checkIn || session?.checkIn || null,
          workout_note: local.note || session?.workout_note || '',
          exercise_notes: Object.keys(local.exerciseNotes).length ? local.exerciseNotes : (session?.exercise_notes || {})
        };
      });

      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (client) {
        try {
          const { data: sessionData } = await client.auth.getSession();
          const userId = sessionData?.session?.user?.id || '';
          if (userId) {
            const { data, error } = await client.from('workout_sessions')
              .select('id, check_in, workout_note, exercise_notes')
              .eq('user_id', userId)
              .eq('status', 'completed');
            if (!error) {
              const extras = new Map((data || []).map(row => [String(row.id), row]));
              next = next.map(session => {
                const remote = extras.get(String(session?.id || ''));
                if (!remote) return session;
                const remoteExerciseNotes = parseExerciseNotes(remote.exercise_notes);
                return {
                  ...session,
                  checkIn: remote.check_in || session.checkIn || null,
                  workout_note: remote.workout_note || session.workout_note || '',
                  exercise_notes: Object.keys(remoteExerciseNotes).length ? remoteExerciseNotes : (session.exercise_notes || {})
                };
              });
            }
          }
        } catch {}
      }

      publish(next);
    } finally {
      loading = false;
    }
  }

  function start() {
    window.addEventListener('levelup:history-v5-ready', () => void enrich());
    window.addEventListener('levelup:workout-finished', () => setTimeout(() => void enrich(), 900));
    window.addEventListener('pageshow', () => void enrich());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void enrich();
    });
    setTimeout(() => void enrich(), 1200);
  }

  window.LevelUpHistoryEnrichment = { enrich };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
