(() => {
  let loading = false;

  async function enrich() {
    if (loading) return;
    loading = true;
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;
      const { data: sessionData } = await client.auth.getSession();
      const userId = sessionData?.session?.user?.id || '';
      if (!userId) return;
      const { data, error } = await client.from('workout_sessions')
        .select('id, check_in, workout_note')
        .eq('user_id', userId)
        .eq('status', 'completed');
      if (error) throw error;
      const extras = new Map((data || []).map(row => [String(row.id), row]));
      let current = [];
      try { current = Array.isArray(workoutHistory) ? workoutHistory : []; } catch {}
      if (!current.length) return;
      const next = current.map(session => {
        const extra = extras.get(String(session?.id || ''));
        return extra ? { ...session, checkIn: extra.check_in || null, workout_note: extra.workout_note || '' } : session;
      });
      try { workoutHistory = next; } catch {}
      try { localStorage.setItem('levelUpFitnessWorkoutHistory', JSON.stringify(next)); } catch {}
      window.dispatchEvent(new CustomEvent('levelup:history-enriched'));
      try { window.LevelUpWorkoutCalendar?.render?.(); } catch {}
      try { window.LevelUpProgressInsights?.render?.(); } catch {}
    } catch {} finally { loading = false; }
  }

  function start() {
    window.addEventListener('levelup:history-v5-ready', () => void enrich());
    window.addEventListener('levelup:workout-finished', () => setTimeout(() => void enrich(), 900));
    window.addEventListener('pageshow', () => void enrich());
    setTimeout(() => void enrich(), 1200);
  }

  window.LevelUpHistoryEnrichment = { enrich };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
