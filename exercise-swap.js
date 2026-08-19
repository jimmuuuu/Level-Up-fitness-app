(() => {
  const AVOID_PREFIX = 'levelUpFitnessAvoidExercises:';
  const MODAL_ID = 'exerciseSwapModal';
  let currentIndex = -1;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function accountKey() {
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return `cloud:${cloudUser.id}`;
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
      if (typeof userProfile !== 'undefined' && userProfile?.email) return String(userProfile.email).trim().toLowerCase();
    } catch {}
    return 'local';
  }

  function avoidKey() { return `${AVOID_PREFIX}${accountKey()}`; }

  function avoided() {
    try {
      const parsed = JSON.parse(localStorage.getItem(avoidKey()) || '[]');
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch { return []; }
  }

  function saveAvoided(list) {
    const clean = [...new Set(list.map(String).filter(Boolean))].slice(0, 100);
    try { localStorage.setItem(avoidKey(), JSON.stringify(clean)); } catch {}
    window.dispatchEvent(new CustomEvent('levelup:avoid-exercises-changed', { detail: clean }));
    return clean;
  }

  function addAvoid(name) { return saveAvoided([...avoided(), name]); }
  function removeAvoid(name) { return saveAvoided(avoided().filter(item => item !== name)); }

  function catalog() {
    try { return Array.isArray(exerciseCatalog) ? exerciseCatalog : []; }
    catch { return []; }
  }

  function activeExercises() {
    try { return Array.isArray(activePlan?.exercises) ? activePlan.exercises : []; }
    catch { return []; }
  }

  function normalizeMuscles(exercise) {
    const values = [exercise?.muscle, ...(exercise?.primary || []), ...(exercise?.assists || [])]
      .map(value => String(value || '').trim().toLowerCase())
      .filter(Boolean);
    return [...new Set(values)];
  }

  function scoreCandidate(current, candidate) {
    if (!current || !candidate || current.name === candidate.name) return -999;
    const avoid = new Set(avoided().map(v => v.toLowerCase()));
    if (avoid.has(String(candidate.name || '').toLowerCase())) return -999;
    const currentMuscles = normalizeMuscles(current);
    const candidateMuscles = normalizeMuscles(candidate);
    const overlap = candidateMuscles.filter(muscle => currentMuscles.includes(muscle)).length;
    const primaryCurrent = (current.primary || []).map(v => String(v).toLowerCase());
    const primaryCandidate = (candidate.primary || []).map(v => String(v).toLowerCase());
    const primaryOverlap = primaryCandidate.filter(muscle => primaryCurrent.includes(muscle)).length;
    const sameEquipment = String(current.equipment || '').toLowerCase() === String(candidate.equipment || '').toLowerCase();
    return primaryOverlap * 7 + overlap * 3 + (sameEquipment ? 2 : 0);
  }

  function suggestions(current) {
    return catalog()
      .map(item => ({ item, score: scoreCandidate(current, item) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score || String(a.item.name).localeCompare(String(b.item.name)))
      .slice(0, 12)
      .map(entry => entry.item);
  }

  function makeExercise(candidate, current) {
    let made = null;
    try {
      if (typeof builderExerciseFromCatalog === 'function') made = builderExerciseFromCatalog(candidate);
    } catch {}
    if (!made) {
      made = {
        instanceId: `swap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        catalogId: candidate.id,
        name: candidate.name,
        category: candidate.category,
        equipment: candidate.equipment,
        muscle: candidate.primary?.[0] || '',
        primary: [...(candidate.primary || [])],
        assists: [...(candidate.assists || [])],
        sets: Number(current?.sets) || 3,
        repRange: Array.isArray(current?.repRange) ? [...current.repRange] : [8, 12]
      };
    }
    return {
      ...made,
      sets: Number(current?.sets) || Number(made?.sets) || 3,
      repRange: Array.isArray(current?.repRange) ? [...current.repRange] : (Array.isArray(made?.repRange) ? [...made.repRange] : [8, 12])
    };
  }

  function ensureModal() {
    if (document.getElementById(MODAL_ID)) return document.getElementById(MODAL_ID);
    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'exercise-swap-modal hidden';
    modal.innerHTML = '<div class="exercise-swap-backdrop" data-swap-close></div><section class="exercise-swap-sheet" role="dialog" aria-modal="true" aria-labelledby="exerciseSwapTitle"><div class="exercise-swap-handle"></div><div id="exerciseSwapContent"></div></section>';
    document.body.appendChild(modal);
    modal.addEventListener('click', event => {
      if (event.target.closest?.('[data-swap-close]')) closeModal();
    });
    return modal;
  }

  function closeModal() {
    document.getElementById(MODAL_ID)?.classList.add('hidden');
    currentIndex = -1;
  }

  function renderModal(index) {
    const exercises = activeExercises();
    const current = exercises[index];
    if (!current) return;
    currentIndex = index;
    const modal = ensureModal();
    const content = modal.querySelector('#exerciseSwapContent');
    const options = suggestions(current);
    const isAvoided = avoided().includes(String(current.name || ''));
    content.innerHTML = `
      <div class="exercise-swap-heading">
        <div><div class="over">SWAP EXERCISE</div><h2 id="exerciseSwapTitle">Replace ${esc(current.name)}</h2><p>These options target the same main muscles. Your current sets and rep range will stay the same.</p></div>
        <button type="button" class="exercise-swap-close" data-swap-close aria-label="Close">×</button>
      </div>
      <div class="exercise-swap-actions">
        <button type="button" class="exercise-swap-avoid${isAvoided ? ' active' : ''}" data-swap-avoid>${isAvoided ? 'Allow this exercise again' : "Don't recommend this exercise again"}</button>
      </div>
      <div class="exercise-swap-list">
        ${options.length ? options.map(item => `<button type="button" class="exercise-swap-option" data-swap-name="${esc(item.name)}"><span>${esc(item.name)}</span><small>${esc(item.equipment || 'Exercise')} · ${esc((item.primary || []).join(', '))}</small></button>`).join('') : '<p class="exercise-swap-empty">No close matches are available in the exercise library yet.</p>'}
      </div>`;
    modal.classList.remove('hidden');
    content.querySelector('[data-swap-avoid]')?.addEventListener('click', () => {
      if (isAvoided) removeAvoid(current.name); else addAvoid(current.name);
      renderModal(index);
    });
    content.querySelectorAll('[data-swap-name]').forEach(button => {
      button.onclick = () => replaceExercise(index, button.dataset.swapName);
    });
  }

  function replaceExercise(index, name) {
    const exercises = activeExercises();
    const current = exercises[index];
    const candidate = catalog().find(item => String(item?.name || '') === String(name || ''));
    if (!current || !candidate) return;
    const next = makeExercise(candidate, current);
    try {
      activePlan = { ...activePlan, exercises: exercises.map((exercise, i) => i === index ? next : exercise) };
      if (typeof persistActiveWorkout === 'function') persistActiveWorkout();
      if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
      closeModal();
      const notice = document.getElementById('setSaveNotice');
      if (notice) notice.textContent = `${current.name} was swapped for ${candidate.name}.`;
      window.dispatchEvent(new CustomEvent('levelup:exercise-swapped', { detail: { from: current.name, to: candidate.name, index } }));
    } catch {}
  }

  function decorateRows() {
    const list = document.getElementById('setList');
    if (!list) return;
    const rows = [...list.querySelectorAll('.set-row')];
    rows.forEach((row, index) => {
      const heading = row.querySelector('.exercise-heading');
      if (!heading || heading.querySelector('.exercise-swap-button')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'exercise-swap-button';
      button.textContent = 'Swap';
      button.setAttribute('aria-label', `Swap ${heading.querySelector('h3')?.textContent?.trim() || 'exercise'}`);
      button.onclick = () => renderModal(index);
      heading.appendChild(button);
    });
  }

  function start() {
    ensureModal();
    decorateRows();
    const list = document.getElementById('setList');
    if (list) new MutationObserver(() => requestAnimationFrame(decorateRows)).observe(list, { childList: true });
    window.addEventListener('pageshow', decorateRows);
  }

  window.LevelUpExerciseSwap = { open: renderModal, avoided, addAvoid, removeAvoid };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
