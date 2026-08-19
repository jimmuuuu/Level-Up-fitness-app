(() => {
  const PREFIX = 'levelUpFitnessWorkoutCheckIn:';
  const OPTIONS = [
    { value: 'great', label: 'Great' },
    { value: 'normal', label: 'Normal' },
    { value: 'tired', label: 'Tired' },
    { value: 'sore', label: 'Sore' }
  ];

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

  function key() { return `${PREFIX}${accountKey()}:${sessionId()}`; }

  function read() {
    const id = sessionId();
    if (!id) return null;
    try {
      const parsed = JSON.parse(localStorage.getItem(key()) || 'null');
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch { return null; }
  }

  function write(value) {
    const next = { value, createdAt: Date.now() };
    try { localStorage.setItem(key(), JSON.stringify(next)); } catch {}
    return next;
  }

  async function saveCloud(checkIn, attempt = 0) {
    if (!sessionId() || !checkIn) return;
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;
      const { data } = await client.auth.getSession();
      const userId = data?.session?.user?.id || '';
      if (!userId) return;
      const { data: rows, error } = await client
        .from('workout_sessions')
        .update({ check_in: checkIn, updated_at: new Date().toISOString() })
        .eq('id', sessionId())
        .eq('user_id', userId)
        .select('id');
      if (error) throw error;
      if ((!rows || !rows.length) && attempt < 4) setTimeout(() => void saveCloud(checkIn, attempt + 1), 1200 * (attempt + 1));
    } catch {
      if (attempt < 3) setTimeout(() => void saveCloud(checkIn, attempt + 1), 1500 * (attempt + 1));
    }
  }

  function ensureCard() {
    const active = document.getElementById('active');
    if (!active || !sessionId()) return null;
    let card = document.getElementById('workoutCheckIn');
    if (card) return card;
    card = document.createElement('section');
    card.id = 'workoutCheckIn';
    card.className = 'workout-checkin';
    const timer = document.getElementById('restTimerV3');
    const notice = document.getElementById('setSaveNotice');
    if (timer) timer.insertAdjacentElement('afterend', card);
    else if (notice) notice.insertAdjacentElement('beforebegin', card);
    else active.insertBefore(card, document.getElementById('setList'));
    return card;
  }

  function render() {
    const card = ensureCard();
    if (!card) return;
    const saved = read();
    if (saved?.value) {
      const option = OPTIONS.find(item => item.value === saved.value) || { label: saved.value };
      card.innerHTML = `<div class="workout-checkin-saved"><div><span>Today’s check-in</span><strong>${option.label}</strong></div><button type="button" data-checkin-change>Change</button></div><p>This is just a training note. It does not automatically make your workout harder or easier.</p>`;
      card.querySelector('[data-checkin-change]').onclick = () => { try { localStorage.removeItem(key()); } catch {} render(); };
      return;
    }
    card.innerHTML = `
      <div class="workout-checkin-heading"><div><span>Quick check-in</span><strong>How are you feeling today?</strong></div></div>
      <div class="workout-checkin-options">${OPTIONS.map(item => `<button type="button" data-checkin="${item.value}">${item.label}</button>`).join('')}</div>
      <p>This is logged so you can notice patterns later. It does not change the workout automatically.</p>`;
    card.querySelectorAll('[data-checkin]').forEach(button => {
      button.onclick = () => {
        const next = write(button.dataset.checkin);
        render();
        void saveCloud(next);
      };
    });
  }

  function cleanupWhenInactive() {
    const card = document.getElementById('workoutCheckIn');
    let active = false;
    try { active = Boolean(activePlan && activeSessionId); } catch {}
    if (!active) card?.remove();
  }

  function start() {
    render();
    window.addEventListener('pageshow', () => { cleanupWhenInactive(); render(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { cleanupWhenInactive(); render(); } });
    setInterval(() => { cleanupWhenInactive(); render(); }, 1500);
  }

  window.LevelUpWorkoutCheckIn = { get: read, render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
