(() => {
  const SETTINGS_PREFIX = 'levelUpFitnessAppSettings:';
  const DEFAULT_REST_SECONDS = 90;
  const REST_OPTIONS = [60, 90, 120, 150, 180, 240, 300];
  let resolvedUserId = '';
  let cloudLoadedFor = '';
  let saving = false;

  const byId = id => document.getElementById(id);

  function clampRestSeconds(value) {
    const seconds = Math.round(Number(value) || DEFAULT_REST_SECONDS);
    return Math.max(30, Math.min(600, seconds));
  }

  function accountId() {
    if (resolvedUserId) return resolvedUserId;
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return String(cloudUser.id);
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
      if (typeof userProfile !== 'undefined' && userProfile?.email) return String(userProfile.email).trim().toLowerCase();
    } catch {}
    return 'local';
  }

  function keyFor(id = accountId()) {
    return `${SETTINGS_PREFIX}${id || 'local'}`;
  }

  function normalize(value) {
    return {
      version: 1,
      restSeconds: clampRestSeconds(value?.restSeconds),
      updatedAt: Number(value?.updatedAt) || 0
    };
  }

  function readLocal(id = accountId()) {
    try {
      const parsed = JSON.parse(localStorage.getItem(keyFor(id)) || 'null');
      return parsed ? normalize(parsed) : normalize({ restSeconds: DEFAULT_REST_SECONDS, updatedAt: 0 });
    } catch {
      return normalize({ restSeconds: DEFAULT_REST_SECONDS, updatedAt: 0 });
    }
  }

  function writeLocal(settings, id = accountId()) {
    const clean = normalize(settings);
    try { localStorage.setItem(keyFor(id), JSON.stringify(clean)); } catch {}
    return clean;
  }

  function format(seconds) {
    const total = clampRestSeconds(seconds);
    const minutes = Math.floor(total / 60);
    const remainder = total % 60;
    return remainder ? `${minutes}:${String(remainder).padStart(2, '0')}` : `${minutes}:00`;
  }

  async function sessionUser() {
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return null;
      const { data } = await client.auth.getSession();
      const user = data?.session?.user || null;
      if (user?.id) resolvedUserId = String(user.id);
      return user;
    } catch { return null; }
  }

  async function saveCloud(settings) {
    if (saving) return;
    const user = await sessionUser();
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!user?.id || !client) return;
    saving = true;
    try {
      const { data } = await client.from('profiles').select('app_settings').eq('id', user.id).maybeSingle();
      const existing = data?.app_settings && typeof data.app_settings === 'object' ? data.app_settings : {};
      await client.from('profiles').update({
        app_settings: { ...existing, ...settings },
        updated_at: new Date().toISOString()
      }).eq('id', user.id);
    } catch {} finally {
      saving = false;
    }
  }

  async function loadCloud() {
    const user = await sessionUser();
    if (!user?.id || user.id === cloudLoadedFor) return;
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) return;
    cloudLoadedFor = user.id;
    try {
      const { data, error } = await client.from('profiles').select('app_settings').eq('id', user.id).maybeSingle();
      if (error) throw error;
      const local = readLocal(user.id);
      const remoteRaw = data?.app_settings && typeof data.app_settings === 'object' ? data.app_settings : null;
      const remote = remoteRaw ? normalize(remoteRaw) : null;
      if (remote && remote.updatedAt > local.updatedAt) {
        writeLocal(remote, user.id);
      } else if (local.updatedAt > 0) {
        void saveCloud(local);
      }
      render();
      dispatchChange();
    } catch {
      cloudLoadedFor = '';
    }
  }

  function current() {
    return readLocal();
  }

  function dispatchChange() {
    const detail = current();
    window.dispatchEvent(new CustomEvent('levelup:settings-changed', { detail }));
  }

  function setRestSeconds(seconds) {
    const next = writeLocal({
      ...current(),
      restSeconds: clampRestSeconds(seconds),
      updatedAt: Date.now()
    });
    render();
    dispatchChange();
    void saveCloud(next);
    return next.restSeconds;
  }

  function openSettings() {
    ensurePage();
    render();
    try {
      if (typeof go === 'function') go('settings');
      else {
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
        byId('settings')?.classList.remove('hidden');
      }
    } catch {
      document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
      byId('settings')?.classList.remove('hidden');
    }
  }

  function closeSettings() {
    try {
      if (typeof go === 'function') go('profile');
      else {
        byId('settings')?.classList.add('hidden');
        byId('profile')?.classList.remove('hidden');
      }
    } catch {
      byId('settings')?.classList.add('hidden');
      byId('profile')?.classList.remove('hidden');
    }
  }

  function ensurePage() {
    const tabs = document.querySelector('.tabs');
    if (!tabs || byId('settings')) return;
    const section = document.createElement('section');
    section.id = 'settings';
    section.className = 'page hidden settings-page';
    section.innerHTML = `
      <button id="settingsBack" class="settings-back" type="button">‹ Profile</button>
      <header class="settings-header">
        <div class="over">PROFILE</div>
        <h1>Settings</h1>
        <p>Keep your workout preferences in one place.</p>
      </header>
      <div id="settingsContent"></div>`;
    tabs.insertAdjacentElement('beforebegin', section);
    byId('settingsBack').onclick = closeSettings;
  }

  function storageCopy() {
    return accountId() === 'local'
      ? 'These settings are saved on this device. Sign in to sync supported settings to your Level Up account.'
      : 'These settings are saved to this device and synced to your Level Up account.';
  }

  function render() {
    ensurePage();
    const content = byId('settingsContent');
    if (!content) return;
    const settings = current();
    const selected = settings.restSeconds;
    const optionButtons = REST_OPTIONS.map(seconds => `
      <button type="button" class="settings-time-option${selected === seconds ? ' active' : ''}" data-rest-seconds="${seconds}">
        ${format(seconds)}
      </button>`).join('');

    content.innerHTML = `
      <section class="settings-card">
        <div class="settings-card-heading">
          <div>
            <div class="settings-kicker">WORKOUT</div>
            <h2>Rest timer</h2>
          </div>
          <strong>${format(selected)}</strong>
        </div>
        <p>Choose the default countdown that starts after you save a set. Changing this does not change a rest that is already running.</p>
        <div class="settings-time-grid">${optionButtons}</div>
        <div class="settings-custom-row">
          <label for="settingsCustomMinutes">Custom minutes</label>
          <div>
            <input id="settingsCustomMinutes" type="number" min="0.5" max="10" step="0.5" inputmode="decimal" value="${(selected / 60).toFixed(selected % 60 ? 1 : 0)}">
            <button id="settingsSaveCustom" type="button">Save</button>
          </div>
        </div>
      </section>

      <section class="settings-card">
        <div class="settings-card-heading">
          <div>
            <div class="settings-kicker">NOTIFICATIONS</div>
            <h2>Rest alerts</h2>
          </div>
        </div>
        <p>Lock-screen alerts are controlled from the rest timer inside an active workout. Your permission choice stays on this device.</p>
        <button id="settingsOpenWorkout" class="settings-secondary" type="button">Go to workout</button>
      </section>

      <section class="settings-card">
        <div class="settings-card-heading">
          <div>
            <div class="settings-kicker">DATA</div>
            <h2>Saved preferences</h2>
          </div>
        </div>
        <p>${storageCopy()}</p>
        <div class="settings-saved-row"><span>Default rest timer</span><strong>${format(selected)}</strong></div>
      </section>`;

    content.querySelectorAll('[data-rest-seconds]').forEach(button => {
      button.onclick = () => setRestSeconds(Number(button.dataset.restSeconds));
    });
    byId('settingsSaveCustom').onclick = () => {
      const minutes = Number(byId('settingsCustomMinutes')?.value || 0);
      if (!Number.isFinite(minutes) || minutes < 0.5 || minutes > 10) return;
      setRestSeconds(Math.round(minutes * 60));
    };
    byId('settingsOpenWorkout').onclick = () => {
      try { if (typeof go === 'function') go('workout'); }
      catch {}
    };
  }

  function wireProfileButton() {
    const shortcut = document.querySelector('.profile-settings-shortcut');
    if (!shortcut) return false;
    shortcut.textContent = 'Settings';
    shortcut.removeAttribute('aria-controls');
    shortcut.onclick = openSettings;
    return true;
  }

  function start() {
    ensurePage();
    render();
    if (!wireProfileButton()) {
      const observer = new MutationObserver(() => {
        if (wireProfileButton()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    void loadCloud();
    window.addEventListener('pageshow', () => void loadCloud());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void loadCloud();
    });
  }

  window.LevelUpSettings = {
    get: () => ({ ...current() }),
    getRestSeconds: () => current().restSeconds,
    setRestSeconds,
    open: openSettings,
    refresh: () => { render(); dispatchChange(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
