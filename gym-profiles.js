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
      equipment: Array.isArray(gym?.equipment) ? [...new Set(gym.equipment.filter(item => EQUIPMENT.includes(item)))] : [],
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
      notify();
    } catch {}
  }

  function current() { return readLocal(); }

  function notify(state = current()) {
    removeProfileSurfaces();
    window.dispatchEvent(new CustomEvent('levelup:gym-profiles-changed', { detail: state }));
    try { window.LevelUpExtraSettings?.refresh?.(); } catch {}
  }

  function setState(next) {
    const clean = writeLocal({ ...next, updatedAt: Date.now() });
    void saveCloud(clean);
    notify(clean);
    return clean;
  }

  function removeProfileSurfaces() {
    document.getElementById('gymProfilesSection')?.remove();
    document.querySelector('#profile .home-gym-section')?.remove();
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

  function saveGym({ id = '', name = '', equipment = [], note = '', preferred = true } = {}) {
    const cleanName = String(name || '').trim().slice(0, 60);
    if (!cleanName) return null;
    const state = current();
    const existing = state.gyms.find(gym => gym.id === id) || state.gyms.find(gym => gym.name.toLowerCase() === cleanName.toLowerCase()) || null;
    const gym = {
      id: existing?.id || id || `gym-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      name: cleanName,
      equipment: [...new Set((Array.isArray(equipment) ? equipment : []).filter(item => EQUIPMENT.includes(item)))],
      note: String(note || '').trim().slice(0, 160)
    };
    const gyms = existing ? state.gyms.map(item => item.id === existing.id ? gym : item) : [...state.gyms, gym];
    return setState({ ...state, gyms, preferredId: preferred ? gym.id : (state.preferredId || gym.id) });
  }

  function openEditor(id = '') {
    const state = current();
    const existing = state.gyms.find(gym => gym.id === id) || (!id ? state.gyms.find(gym => gym.id === state.preferredId) : null) || null;
    const modal = ensureModal();
    const content = modal.querySelector('#gymProfileModalContent');
    content.innerHTML = `
      <div class="gym-profile-heading"><div><div class="over">GYM & EQUIPMENT</div><h2>${existing ? 'Edit your gym' : 'Add a gym'}</h2></div><button type="button" data-gym-close aria-label="Close">×</button></div>
      <p class="gym-profiles-copy">Level Up uses this to keep workout and exercise-swap suggestions matched to equipment you actually have.</p>
      <label class="gym-profile-field"><span>Gym name</span><input id="gymProfileName" maxlength="60" value="${esc(existing?.name || '')}" placeholder="Example: Planet Fitness"></label>
      <div class="gym-profile-equipment"><span>Equipment available</span><div>${EQUIPMENT.map(item => `<label><input type="checkbox" value="${esc(item)}" ${existing?.equipment?.includes(item) ? 'checked' : ''}><span>${esc(item)}</span></label>`).join('')}</div></div>
      <label class="gym-profile-field"><span>Note</span><input id="gymProfileNote" maxlength="160" value="${esc(existing?.note || '')}" placeholder="Optional"></label>
      <label class="gym-profile-preferred"><input id="gymProfilePreferred" type="checkbox" ${existing?.id === state.preferredId || (!state.gyms.length && !existing) ? 'checked' : ''}><span>Use as preferred gym</span></label>
      <div class="gym-profile-actions"><button id="saveGymProfile" class="primary" type="button">Save gym</button>${existing ? '<button id="deleteGymProfile" type="button">Delete</button>' : ''}</div>
      <p id="gymProfileStatus" class="gym-profile-status"></p>`;
    modal.classList.remove('hidden');
    content.querySelector('[data-gym-close]')?.addEventListener('click', () => modal.classList.add('hidden'));
    content.querySelector('#saveGymProfile').onclick = () => {
      const name = String(content.querySelector('#gymProfileName')?.value || '').trim();
      const status = content.querySelector('#gymProfileStatus');
      if (!name) { status.textContent = 'Enter a gym name.'; return; }
      const equipment = [...content.querySelectorAll('.gym-profile-equipment input:checked')].map(input => input.value);
      if (!equipment.length) { status.textContent = 'Choose at least one type of equipment.'; return; }
      const note = String(content.querySelector('#gymProfileNote')?.value || '').trim();
      const preferred = Boolean(content.querySelector('#gymProfilePreferred')?.checked);
      saveGym({ id: existing?.id || '', name, equipment, note, preferred });
      modal.classList.add('hidden');
    };
    content.querySelector('#deleteGymProfile')?.addEventListener('click', () => {
      if (!existing) return;
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
    removeProfileSurfaces();
    void loadCloud();
    window.addEventListener('pageshow', () => { removeProfileSurfaces(); void loadCloud(); });
    const profile = document.getElementById('profile');
    if (profile) {
      new MutationObserver(removeProfileSurfaces).observe(profile, { childList: true });
    }
  }

  window.LevelUpGymProfiles = {
    get: current,
    preferred: preferredGym,
    saveGym,
    openEditor,
    refresh: () => { removeProfileSurfaces(); void loadCloud(); },
    equipmentOptions: () => [...EQUIPMENT]
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
