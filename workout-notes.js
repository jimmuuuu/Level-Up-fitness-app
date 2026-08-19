(() => {
  const PREFIX = 'levelUpFitnessWorkoutNote:';
  let saveTimer = null;

  function sessionId() {
    try { return String(activeSessionId || ''); } catch { return ''; }
  }

  function accountKey() {
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return String(cloudUser.id);
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
    } catch {}
    return 'local';
  }

  function key(id = sessionId()) { return `${PREFIX}${accountKey()}:${id}`; }

  function read(id = sessionId()) {
    if (!id) return '';
    try { return String(localStorage.getItem(key(id)) || ''); } catch { return ''; }
  }

  function write(value, id = sessionId()) {
    const clean = String(value || '').slice(0, 1000);
    if (!id) return clean;
    try { localStorage.setItem(key(id), clean); } catch {}
    return clean;
  }

  async function saveCloud(note, id = sessionId(), attempt = 0) {
    if (!id) return;
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;
      const { data } = await client.auth.getSession();
      const userId = data?.session?.user?.id || '';
      if (!userId) return;
      const { data: rows, error } = await client.from('workout_sessions')
        .update({ workout_note: note || null, updated_at: new Date().toISOString() })
        .eq('id', id).eq('user_id', userId).select('id');
      if (error) throw error;
      if ((!rows || !rows.length) && attempt < 4) setTimeout(() => void saveCloud(note, id, attempt + 1), 1000 * (attempt + 1));
    } catch {
      if (attempt < 3) setTimeout(() => void saveCloud(note, id, attempt + 1), 1500 * (attempt + 1));
    }
  }

  function ensureCard() {
    const finishSection = document.getElementById('endWorkoutSection');
    const id = sessionId();
    if (!finishSection || !id) return null;
    let card = document.getElementById('workoutNotesCard');
    if (card && card.dataset.sessionId !== id) card.remove();
    card = document.getElementById('workoutNotesCard');
    if (card) return card;
    card = document.createElement('section');
    card.id = 'workoutNotesCard';
    card.dataset.sessionId = id;
    card.className = 'workout-notes-card';
    card.innerHTML = `
      <div class="workout-notes-heading"><div><div class="over">WORKOUT NOTES</div><h2>How did it go?</h2></div><span id="workoutNotesStatus">Saved on this device</span></div>
      <textarea id="workoutNotesInput" maxlength="1000" rows="4" placeholder="Example: Leg press felt good. Machine setup was different today."></textarea>
      <p>Use notes for things you want to remember next time, like machine setup, comfort, or how an exercise felt.</p>`;
    finishSection.insertAdjacentElement('beforebegin', card);
    const input = card.querySelector('#workoutNotesInput');
    input.value = read(id);
    input.addEventListener('input', () => {
      const note = write(input.value, id);
      const status = card.querySelector('#workoutNotesStatus');
      if (status) status.textContent = 'Saving…';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        void saveCloud(note, id);
        if (status) status.textContent = 'Saved';
      }, 450);
    });
    return card;
  }

  function removeIfInactive() {
    let active = false;
    try { active = Boolean(activePlan && activeSessionId); } catch {}
    if (!active) document.getElementById('workoutNotesCard')?.remove();
  }

  function start() {
    ensureCard();
    window.addEventListener('pageshow', () => { removeIfInactive(); ensureCard(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { removeIfInactive(); ensureCard(); } });
    document.addEventListener('click', event => {
      if (!event.target.closest?.('#finish')) return;
      const id = sessionId();
      const note = read(id);
      if (id && note) void saveCloud(note, id);
    }, true);
    setInterval(() => { removeIfInactive(); ensureCard(); }, 1800);
  }

  window.LevelUpWorkoutNotes = { get: read, save: value => { const id = sessionId(); const note = write(value, id); void saveCloud(note, id); return note; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
