(() => {
  const STORAGE_PREFIX = 'levelUpFitnessGymProfiles:';
  const MODAL_ID = 'gymProfileModal';
  const EQUIPMENT = ['Machines', 'Cable', 'Dumbbells', 'Barbell', 'Smith machine', 'Bodyweight', 'Cardio'];
  let resolvedUserId = '';
  let saving = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function accountKey() {
    if (resolvedUserId) return resolvedUserId;
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return String(cloudUser.id);
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
      if (typeof userProfile !== 'undefined' && userProfile?.email) return String(userProfile.email).trim().toLowerCase();
    } catch {}
    return 'local';
  }

  function storageKey(id = accountKey()) { return `${STORAGE_PREFIX}${id || 'local'}`; }

  function normalize(data) {
    const gyms = Array.isArray(data?.gyms) ? data.gyms.slice(0, 12).map(gym => ({
      id: String(gym?.id || `gym-${Date.now()}-${Math.random().toString(36).slice(2,7)}`),
      name: String(gym?.name || 'Gym').trim().slice(0, 60),
      equipment: Array.isArray(gym?.equipment) ? gym.equipment.filter(item => EQUIPMENT.includes(item)) : [],
      note: String(gym?.note || '').slice(0, 160)
    })) : [];
    const preferredId = gyms.some(gym => gym.id === data?.preferredId) ? String(data.preferredId) : (gyms[0]?.id || '');
    return { version: 1, gyms, preferredId, updatedAt: Number(data?.updatedAt) || 0 };
  }

  function readLocal(id = accountKey()) {
    try { return normalize(JSON.parse(localStorage.getItem(storageKey(id)) || '{}')); }
    catch { return normalize({}); }
  }

  function writeLocal(data, id = accountKey()) {
    const clean = normalize(data);
    try { localStorage.setItem(storageKey(id), JSON.stringify(clean)); } catch {}
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

  async function saveCloud(state) {
    if (saving) return;
    const user = await sessionUser();
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!user?.id || !client) return;
    saving = true;
    try {
      const { data } = await client.from('profiles').select('app_settings').eq('id', user.id).maybeSingle();
      const settings = data?.app_settings && typeof data.app_settings === 'object' ? data.app_settings : {};
      await client.from('profiles').update({ app_settings: { ...settings, gymProfiles: state }, updated_at: new Date().toISOString() }).eq('id', user.id);
    } catch {} finally { saving = false; }
  }

  async function loadCloud() {
    const user = await sessionUser();
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!user?.id || !client) return;
    try {
      const { data } = await client.from('profiles').select('app_settings').eq('id', user.id).maybeSingle();
      const remoteRaw = data?.app_settings?.gymProfiles;
      const local = readLocal(user.id);
      if (remoteRaw && typeof remoteRaw === 'object') {
        const remote = normalize(remoteRaw);
        if (remote.updatedAt > local.updatedAt) writeLocal(remote, user.id);
        else if (local.updatedAt > remote.updatedAt) void saveCloud(local);
      } else if (local.updatedAt) void saveCloud(local);
      render();
    } catch {}
  }

  function current() { return readLocal(); }

  function setState(next) {
    const clean = writeLocal({ ...next, updatedAt: Date.now() });
    render();
    void saveCloud(clean);
    window.dispatchEvent(new CustomEvent('levelup:gym-profiles-changed', { detail: clean }));
    return clean;
  }

  function ensureSection() {
    const profile = document.getElementById('profile');
    if (!profile) return null;
    let section = document.getElementById('gymProfilesSection');
    if (section) return section;
    section = document.createElement('section');
    section.id = 'gymProfilesSection';
    section.className = 'profile-section gym-profiles-section';
    const settingsPanel = document.getElementById('profileSettingsPanel');
    if (settingsPanel) settingsPanel.insertAdjacentElement('beforebegin', section); else profile.appendChild(section);
    return section;
  }

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'gym-profile-modal hidden';
    modal.innerHTML = '<div class="gym-profile-backdrop" data-gym-close></div><section class="gym-profile-sheet" role="dialog" aria-modal="true"><div class="gym-profile-handle"></div><div id="gymProfileModalContent"></div></section>';
    document.body.appendChild(modal);
    modal.addEventListener('click', event => { if (event.target.closest?.('[data-gym-close]')) modal.classList.add('hidden'); });
    return modal;
  }

  function render() {
    const section = ensureSection();
    if (!section) return;
    const state = current();
    const preferred = state.gyms.find(gym => gym.id === state.preferredId) || null;
    section.innerHTML = `
      <div class="section-heading compact-heading"><div><div class="over">GYMS</div><h2>Gym profiles</h2></div><button id="addGymProfile" class="text-button" type="button">Add gym</button></div>
      <p class="gym-profiles-copy">Save the equipment available at each gym. Your preferred gym can be used by workout and swap features.</p>
      ${preferred ? `<div class="gym-preferred"><span>Preferred gym</span><strong>${esc(preferred.name)}</strong><small>${esc(preferred.equipment.join(' · ') || 'Equipment not added yet')}</small></div>` : ''}
      <div class="gym-profile-list">
        ${state.gyms.map(gym => `<button type="button" class="gym-profile-card${gym.id === state.preferredId ? ' preferred' : ''}" data-gym-id="${esc(gym.id)}"><div><strong>${esc(gym.name)}</strong><span>${esc(gym.equipment.join(', ') || 'Add equipment')}</span></div><small>${gym.id === state.preferredId ? 'Preferred' : 'Edit'}</small></button>`).join('')}
        ${!state.gyms.length ? '<div class="gym-profile-empty">No gyms saved yet.</div>' : ''}
      </div>`;
    section.querySelector('#addGymProfile').onclick = () => openEditor();
    section.querySelectorAll('[data-gym-id]').forEach(button => button.onclick = () => openEditor(button.dataset.gymId));
  }

  function openEditor(id = '') {
    const state = current();
    const existing = state.gyms.find(gym => gym.id === id) || null;
    const modal = ensureModal();
    const content = modal.querySelector('#gymProfileModalContent');
    content.innerHTML = `
      <div class="gym-profile-heading"><div><div class="over">GYM PROFILE</div><h2>${existing ? 'Edit gym' : 'Add gym'}</h2></div><button type="button" data-gym-close aria-label="Close">×</button></div>
      <label class="gym-profile-field"><span>Gym name</span><input id="gymProfileName" maxlength="60" value="${esc(existing?.name || '')}" placeholder="Example: Planet Fitness"></label>
      <div class="gym-profile-equipment"><span>Equipment available</span><div>${EQUIPMENT.map(item => `<label><input type="checkbox" value="${esc(item)}" ${existing?.equipment?.includes(item) ? 'checked' : ''}><span>${esc(item)}</span></label>`).join('')}</div></div>
      <label class="gym-profile-field"><span>Note</span><input id="gymProfileNote" maxlength="160" value="${esc(existing?.note || '')}" placeholder="Optional"></label>
      <label class="gym-profile-preferred"><input id="gymProfilePreferred" type="checkbox" ${existing?.id === state.preferredId || (!state.gyms.length && !existing) ? 'checked' : ''}><span>Use as preferred gym</span></label>
      <div class="gym-profile-actions"><button id="saveGymProfile" class="primary" type="button">Save gym</button>${existing ? '<button id="deleteGymProfile" type="button">Delete</button>' : ''}</div>
      <p id="gymProfileStatus" class="gym-profile-status"></p>`;
    modal.classList.remove('hidden');
    content.querySelector('#saveGymProfile').onclick = () => {
      const name = String(content.querySelector('#gymProfileName')?.value || '').trim();
      const status = content.querySelector('#gymProfileStatus');
      if (!name) { status.textContent = 'Enter a gym name.'; return; }
      const equipment = [...content.querySelectorAll('.gym-profile-equipment input:checked')].map(input => input.value);
      const note = String(content.querySelector('#gymProfileNote')?.value || '').trim();
      const preferred = Boolean(content.querySelector('#gymProfilePreferred')?.checked);
      const gym = { id: existing?.id || `gym-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name, equipment, note };
      const gyms = existing ? state.gyms.map(item => item.id === existing.id ? gym : item) : [...state.gyms, gym];
      setState({ ...state, gyms, preferredId: preferred ? gym.id : (state.preferredId || gym.id) });
      modal.classList.add('hidden');
    };
    content.querySelector('#deleteGymProfile')?.addEventListener('click', () => {
      const gyms = state.gyms.filter(gym => gym.id !== existing.id);
      setState({ ...state, gyms, preferredId: state.preferredId === existing.id ? (gyms[0]?.id || '') : state.preferredId });
      modal.classList.add('hidden');
    });
  }

  function preferredGym() {
    const state = current();
    return state.gyms.find(gym => gym.id === state.preferredId) || null;
  }

  function start() {
    ensureModal();
    render();
    void loadCloud();
    window.addEventListener('pageshow', () => { render(); void loadCloud(); });
  }

  window.LevelUpGymProfiles = { get: current, preferred: preferredGym, openEditor };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
