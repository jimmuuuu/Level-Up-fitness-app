(() => {
  let queued = false;

  function stats() {
    try {
      const value = window.LevelUpTrainingQuests?.stats?.();
      if (value && Number.isFinite(Number(value.level))) return value;
    } catch {}
    return { level: 1, levelXp: 0, totalXp: 0 };
  }

  function cleanupOldPhotoBadge() {
    document.querySelectorAll('.profile-level-frame').forEach(frame => {
      const photo = frame.querySelector('.profile-photo');
      if (photo && frame.parentNode) frame.parentNode.insertBefore(photo, frame);
      frame.remove();
    });
    document.querySelectorAll('.profile-level-xp').forEach(node => node.remove());
  }

  function ensureSection() {
    const profile = document.getElementById('profile');
    const overview = document.getElementById('profileOverview');
    if (!profile || !overview) return null;

    let section = document.getElementById('profileTrainingLevel');
    if (section) return section;

    section = document.createElement('section');
    section.id = 'profileTrainingLevel';
    section.className = 'profile-training-level';
    section.setAttribute('aria-label', 'Training level and XP');
    overview.insertAdjacentElement('afterend', section);
    return section;
  }

  function render() {
    cleanupOldPhotoBadge();
    const section = ensureSection();
    if (!section) return;

    const data = stats();
    const level = Math.max(1, Math.floor(Number(data.level) || 1));
    const levelXp = Math.max(0, Math.min(999, Math.floor(Number(data.levelXp) || 0)));
    const totalXp = Math.max(0, Math.floor(Number(data.totalXp) || 0));
    const percent = Math.max(0, Math.min(100, levelXp / 10));
    const remaining = Math.max(0, 1000 - levelXp);

    section.innerHTML = `
      <div class="profile-level-card">
        <div class="profile-level-card-top">
          <div>
            <div class="over">TRAINING LEVEL</div>
            <h2>Level ${level}</h2>
          </div>
          <strong>${levelXp} / 1000 XP</strong>
        </div>
        <div class="profile-level-track" role="progressbar" aria-label="XP toward Level ${level + 1}" aria-valuemin="0" aria-valuemax="1000" aria-valuenow="${levelXp}">
          <span style="width:${percent}%"></span>
        </div>
        <div class="profile-level-meta">
          <span><b>${totalXp}</b> total XP</span>
          <span><b>${remaining}</b> XP to Level ${level + 1}</span>
        </div>
      </div>`;
  }

  function queueRender() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      render();
    });
  }

  function start() {
    render();
    window.addEventListener('pageshow', queueRender);
    window.addEventListener('levelup:history-enriched', queueRender);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') queueRender();
    });
    document.addEventListener('click', event => {
      if (event.target?.closest?.('[data-page="profile"]')) setTimeout(queueRender, 80);
    }, true);
    setInterval(() => {
      const profile = document.getElementById('profile');
      if (profile && !profile.classList.contains('hidden')) render();
    }, 4000);
  }

  window.LevelUpProfileLevelAvatar = { render: queueRender };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
