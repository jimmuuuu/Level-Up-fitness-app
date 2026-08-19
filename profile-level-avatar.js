(() => {
  let observer = null;
  let queued = false;

  function stats() {
    try {
      const value = window.LevelUpTrainingQuests?.stats?.();
      if (value && Number.isFinite(Number(value.level))) return value;
    } catch {}
    return { level: 1, levelXp: 0, totalXp: 0 };
  }

  function queueRender() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      render();
    });
  }

  function render() {
    const photo = document.getElementById('profilePhotoPreview');
    if (!photo) return;
    const wrap = photo.closest('.profile-photo-wrap');
    if (!wrap) return;

    let frame = photo.closest('.profile-level-frame');
    if (!frame) {
      frame = document.createElement('div');
      frame.className = 'profile-level-frame';
      photo.parentNode.insertBefore(frame, photo);
      frame.appendChild(photo);

      const badge = document.createElement('span');
      badge.className = 'profile-level-badge';
      badge.setAttribute('aria-hidden', 'true');
      frame.appendChild(badge);

      const xp = document.createElement('div');
      xp.className = 'profile-level-xp';
      frame.insertAdjacentElement('afterend', xp);
    }

    const data = stats();
    const level = Math.max(1, Math.floor(Number(data.level) || 1));
    const levelXp = Math.max(0, Math.min(999, Math.floor(Number(data.levelXp) || 0)));
    const progress = levelXp / 1000;

    frame.style.setProperty('--level-progress', `${progress * 360}deg`);
    frame.setAttribute('aria-label', `Level ${level}. ${levelXp} of 1000 XP toward the next level.`);

    const badge = frame.querySelector('.profile-level-badge');
    if (badge) badge.textContent = `LV ${level}`;

    const xp = frame.nextElementSibling?.classList?.contains('profile-level-xp')
      ? frame.nextElementSibling
      : wrap.querySelector('.profile-level-xp');
    if (xp) xp.innerHTML = `<strong>${levelXp}</strong> / 1000 XP`;
  }

  function watchProfile() {
    const overview = document.getElementById('profileOverview');
    if (!overview || observer) return;
    observer = new MutationObserver(queueRender);
    observer.observe(overview, { childList: true });
  }

  function start() {
    watchProfile();
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
      watchProfile();
      const profile = document.getElementById('profile');
      if (profile && !profile.classList.contains('hidden')) render();
    }, 4000);
  }

  window.LevelUpProfileLevelAvatar = { render: queueRender };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
