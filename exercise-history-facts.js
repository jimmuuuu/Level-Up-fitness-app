(() => {
  const MODAL_ID = 'exerciseFactsModal';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function history() {
    try {
      if (Array.isArray(workoutHistory)) return workoutHistory;
    } catch {}
    try {
      const parsed = JSON.parse(localStorage.getItem('levelUpFitnessWorkoutHistory') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function exerciseLogs(name) {
    const sessions = history()
      .filter(session => String(session?.status || 'completed') === 'completed')
      .map(session => ({
        session,
        logs: (session?.logs || []).filter(log => String(log?.exercise || '').trim().toLowerCase() === String(name || '').trim().toLowerCase())
      }))
      .filter(item => item.logs.length)
      .sort((a, b) => (Number(b.session?.completedAt) || Number(new Date(b.session?.completed_at || 0))) - (Number(a.session?.completedAt) || Number(new Date(a.session?.completed_at || 0))));
    return sessions;
  }

  function bestSet(sessions) {
    const logs = sessions.flatMap(item => item.logs).filter(log => Number(log?.weight) > 0 && Number(log?.reps) > 0 && String(log?.setType || 'Normal') !== 'Warmup');
    return logs.sort((a, b) => Number(b.weight) - Number(a.weight) || Number(b.reps) - Number(a.reps))[0] || null;
  }

  function dateLabel(session) {
    const raw = Number(session?.completedAt) || Number(session?.completed_at) || Date.parse(session?.completed_at || '') || 0;
    if (!raw) return 'Previous workout';
    try { return new Date(raw).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return 'Previous workout'; }
  }

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'exercise-facts-modal hidden';
    modal.innerHTML = '<div class="exercise-facts-backdrop" data-facts-close></div><section class="exercise-facts-sheet" role="dialog" aria-modal="true"><div class="exercise-facts-handle"></div><div id="exerciseFactsContent"></div></section>';
    document.body.appendChild(modal);
    modal.addEventListener('click', event => {
      if (event.target.closest?.('[data-facts-close]')) modal.classList.add('hidden');
    });
    return modal;
  }

  function open(name) {
    const modal = ensureModal();
    const content = modal.querySelector('#exerciseFactsContent');
    const sessions = exerciseLogs(name);
    const latest = sessions[0] || null;
    const best = bestSet(sessions);
    const latestSets = latest?.logs?.filter(log => Number(log?.reps) > 0).sort((a, b) => Number(a.set || a.setNumber || 0) - Number(b.set || b.setNumber || 0)) || [];
    content.innerHTML = `
      <div class="exercise-facts-heading">
        <div><div class="over">EXERCISE HISTORY</div><h2>${esc(name)}</h2><p>Only sets you actually logged are shown here. No estimated or recommended weights.</p></div>
        <button type="button" class="exercise-facts-close" data-facts-close aria-label="Close">×</button>
      </div>
      ${sessions.length ? `
        <div class="exercise-facts-summary">
          <div><span>Times logged</span><strong>${sessions.length}</strong></div>
          <div><span>Best logged set</span><strong>${best ? `${esc(best.weight)} lb × ${esc(best.reps)}` : '—'}</strong></div>
        </div>
        <section class="exercise-facts-card">
          <div class="exercise-facts-card-title"><div><span>Last workout</span><strong>${esc(dateLabel(latest.session))}</strong></div><small>${esc(latest.session?.planName || latest.session?.plan_name || latest.session?.name || 'Workout')}</small></div>
          <div class="exercise-facts-sets">
            ${latestSets.map((log, index) => `<div><span>Set ${esc(log.set || log.setNumber || index + 1)}</span><strong>${Number(log.weight) > 0 ? `${esc(log.weight)} lb` : 'Bodyweight'} × ${esc(log.reps)} reps</strong></div>`).join('')}
          </div>
        </section>` : `
        <div class="exercise-facts-empty"><strong>No logged history yet</strong><p>Once you complete this exercise and save the workout, the exact sets will show here next time.</p></div>`}
    `;
    modal.classList.remove('hidden');
  }

  function decorateRows() {
    const list = document.getElementById('setList');
    if (!list) return;
    list.querySelectorAll('.set-row').forEach(row => {
      const heading = row.querySelector('.exercise-heading');
      const name = heading?.querySelector('h3')?.textContent?.trim();
      if (!heading || !name || heading.querySelector('.exercise-facts-button')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'exercise-facts-button';
      button.textContent = 'History';
      button.onclick = () => open(name);
      heading.appendChild(button);
    });
  }

  function start() {
    ensureModal();
    decorateRows();
    const list = document.getElementById('setList');
    if (list) new MutationObserver(() => requestAnimationFrame(decorateRows)).observe(list, { childList: true });
  }

  window.LevelUpExerciseHistoryFacts = { open };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
