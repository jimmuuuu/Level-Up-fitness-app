(() => {
  const PREFIX = 'levelUpFitnessExtraSettings:';
  let resolvedUserId = '';
  let cloudLoaded = false;
  let saving = false;

  function accountKey() {
    if (resolvedUserId) return resolvedUserId;
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return String(cloudUser.id);
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
      if (typeof userProfile !== 'undefined' && userProfile?.email) return String(userProfile.email).trim().toLowerCase();
    } catch {}
    return 'local';
  }

  function key() { return `${PREFIX}${accountKey()}`; }

  function normalize(value) {
    const startPage = ['workout','progress','profile'].includes(value?.startPage) ? value.startPage : 'workout';
    return {
      version: 1,
      autoStartRest: value?.autoStartRest !== false,
      showQuests: value?.showQuests !== false,
      showCheckIn: value?.showCheckIn !== false,
      startPage,
      updatedAt: Number(value?.updatedAt) || 0
    };
  }

  function read() {
    try { return normalize(JSON.parse(localStorage.getItem(key()) || '{}')); }
    catch { return normalize({}); }
  }

  function write(next) {
    const clean = normalize(next);
    try { localStorage.setItem(key(), JSON.stringify(clean)); } catch {}
    apply(clean);
    window.dispatchEvent(new CustomEvent('levelup:extra-settings-changed', { detail: clean }));
    return clean;
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
      await client.from('profiles').update({ app_settings: { ...existing, extraPreferences: settings }, updated_at: new Date().toISOString() }).eq('id', user.id);
    } catch {} finally { saving = false; }
  }

  async function loadCloud() {
    if (cloudLoaded) return;
    const user = await sessionUser();
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!user?.id || !client) return;
    try {
      const { data } = await client.from('profiles').select('app_settings').eq('id', user.id).maybeSingle();
      const local = read();
      const remoteRaw = data?.app_settings?.extraPreferences;
      if (remoteRaw && typeof remoteRaw === 'object') {
        const remote = normalize(remoteRaw);
        if (remote.updatedAt > local.updatedAt) write(remote);
        else if (local.updatedAt > remote.updatedAt) void saveCloud(local);
      } else if (local.updatedAt) void saveCloud(local);
      cloudLoaded = true;
      render();
    } catch {}
  }

  function setSetting(name, value) {
    const next = write({ ...read(), [name]: value, updatedAt: Date.now() });
    if (name === 'startPage') {
      try { sessionStorage.setItem('levelUpFitnessLastPage', next.startPage); } catch {}
    }
    void saveCloud(next);
    render();
    return next;
  }

  function apply(settings = read()) {
    document.documentElement.dataset.levelUpQuests = settings.showQuests ? 'on' : 'off';
    document.documentElement.dataset.levelUpCheckIn = settings.showCheckIn ? 'on' : 'off';
    try { localStorage.setItem('levelUpFitnessPreferredStartPage', settings.startPage); } catch {}
  }

  function avoidedCount() {
    try { return window.LevelUpExerciseSwap?.avoided?.().length || 0; } catch { return 0; }
  }

  function preferredGymName() {
    try { return window.LevelUpGymProfiles?.preferred?.()?.name || 'Not set'; } catch { return 'Not set'; }
  }

  function switchRow(id, label, description, checked) {
    return `<label class="settings-expanded-row"><div><strong>${label}</strong><small>${description}</small></div><input id="${id}" type="checkbox" ${checked ? 'checked' : ''}><span class="settings-toggle" aria-hidden="true"></span></label>`;
  }

  function render() {
    const content = document.getElementById('settingsContent');
    if (!content) return;
    const settings = read();
    let section = document.getElementById('settingsExpandedPreferences');
    if (!section) {
      section = document.createElement('div');
      section.id = 'settingsExpandedPreferences';
      const first = content.querySelector('.settings-card');
      if (first) first.insertAdjacentElement('afterend', section); else content.prepend(section);
    }
    section.innerHTML = `
      <section class="settings-card settings-expanded-card">
        <div class="settings-card-heading"><div><div class="settings-kicker">WORKOUT</div><h2>Workout behavior</h2></div></div>
        ${switchRow('settingAutoRest', 'Auto-start rest timer', 'Start your default rest countdown when a set is saved.', settings.autoStartRest)}
        ${switchRow('settingCheckIn', 'Workout check-in', 'Show the quick Great / Normal / Tired / Sore check-in at the start of a workout.', settings.showCheckIn)}
      </section>
      <section class="settings-card settings-expanded-card">
        <div class="settings-card-heading"><div><div class="settings-kicker">APP</div><h2>App behavior</h2></div></div>
        ${switchRow('settingQuests', 'Training quests', 'Show XP and consistency quests in Workout.', settings.showQuests)}
        <label class="settings-expanded-select"><span>Start page</span><select id="settingStartPage"><option value="workout" ${settings.startPage === 'workout' ? 'selected' : ''}>Workout</option><option value="progress" ${settings.startPage === 'progress' ? 'selected' : ''}>Progress</option><option value="profile" ${settings.startPage === 'profile' ? 'selected' : ''}>Profile</option></select></label>
      </section>
      <section class="settings-card settings-expanded-card">
        <div class="settings-card-heading"><div><div class="settings-kicker">TRAINING</div><h2>Training preferences</h2></div></div>
        <button id="settingsManageGyms" class="settings-expanded-link" type="button"><span>Preferred gym</span><strong>${preferredGymName()}</strong></button>
        <button id="settingsAvoidedExercises" class="settings-expanded-link" type="button"><span>Exercises not recommended</span><strong>${avoidedCount()}</strong></button>
      </section>`;

    section.querySelector('#settingAutoRest').onchange = event => setSetting('autoStartRest', event.target.checked);
    section.querySelector('#settingCheckIn').onchange = event => setSetting('showCheckIn', event.target.checked);
    section.querySelector('#settingQuests').onchange = event => setSetting('showQuests', event.target.checked);
    section.querySelector('#settingStartPage').onchange = event => setSetting('startPage', event.target.value);
    section.querySelector('#settingsManageGyms').onclick = () => {
      try { if (typeof go === 'function') go('profile'); } catch {}
      setTimeout(() => document.getElementById('gymProfilesSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    };
    section.querySelector('#settingsAvoidedExercises').onclick = () => {
      const list = window.LevelUpExerciseSwap?.avoided?.() || [];
      if (!list.length) return;
      if (window.confirm(`Allow all ${list.length} avoided exercise${list.length === 1 ? '' : 's'} again?`)) {
        list.forEach(name => window.LevelUpExerciseSwap?.removeAvoid?.(name));
        render();
      }
    };
  }

  function start() {
    apply();
    render();
    void loadCloud();
    window.addEventListener('pageshow', () => { render(); void loadCloud(); });
    window.addEventListener('levelup:gym-profiles-changed', render);
    window.addEventListener('levelup:avoid-exercises-changed', render);
    setInterval(() => {
      const settings = document.getElementById('settings');
      if (settings && !settings.classList.contains('hidden')) render();
    }, 2500);
  }

  window.LevelUpExtraSettings = { get: read, set: setSetting, refresh: render };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
