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
  function activeLogs() {
    try { return Array.isArray(logs) ? logs : []; }
    catch { return []; }
  }

  function primaryMuscles(exercise) {
    const values = Array.isArray(exercise?.primary) && exercise.primary.length
      ? exercise.primary
      : [exercise?.muscle];
    return [...new Set(values.map(value => String(value || '').trim().toLowerCase()).filter(Boolean))];
  }

  function allMuscles(exercise) {
    return [...new Set([
      ...primaryMuscles(exercise),
      ...(exercise?.assists || []).map(value => String(value || '').trim().toLowerCase())
    ].filter(Boolean))];
  }

  function preferredGym() {
    try { return window.LevelUpGymProfiles?.preferred?.() || null; }
    catch { return null; }
  }

  function equipmentBucket(value) {
    const text = String(value || '').toLowerCase();
    if (/smith/.test(text)) return 'Smith machine';
    if (/dumbbell/.test(text)) return 'Dumbbells';
    if (/barbell/.test(text)) return 'Barbell';
    if (/cable/.test(text)) return 'Cable';
    if (/bodyweight|pull-up|dip station/.test(text)) return 'Bodyweight';
    if (/treadmill|bike|cardio|stair/.test(text)) return 'Cardio';
    return 'Machines';
  }

  function gymEquipmentScore(candidate) {
    const gym = preferredGym();
    const saved = Array.isArray(gym?.equipment) ? gym.equipment : [];
    if (!saved.length) return 0;
    return saved.includes(equipmentBucket(candidate?.equipment || candidate?.category)) ? 5 : -20;
  }

  function movementFamily(exercise) {
    const name = String(exercise?.name || '').toLowerCase();
    const primary = primaryMuscles(exercise);
    if (primary.includes('calves') || /calf/.test(name)) return 'calves';
    if (/leg curl|hamstring curl/.test(name)) return 'leg-curl';
    if (/deadlift|romanian|hip thrust|glute bridge|kickback/.test(name)) return 'hinge-glute';
    if (/leg press|squat|lunge|step-up|leg extension/.test(name)) return 'knee-dominant';
    if (/abductor|adductor/.test(name)) return 'hip-machine';
    if (/pulldown|pull-up|chin-up/.test(name)) return 'vertical-pull';
    if (/row/.test(name)) return 'row';
    if (/chest press|bench press|push-up/.test(name)) return 'chest-press';
    if (/fly|pec deck/.test(name)) return 'chest-fly';
    if (/shoulder press|overhead press/.test(name)) return 'shoulder-press';
    if (/lateral raise/.test(name)) return 'lateral-raise';
    if (/reverse pec|rear delt|face pull/.test(name)) return 'rear-delt';
    if (/curl/.test(name) && primary.includes('biceps')) return 'biceps';
    if (/triceps|pushdown|dip/.test(name) && primary.includes('triceps')) return 'triceps';
    if (/crunch|plank|dead bug|sit-up|core/.test(name)) return 'core';
    return String(exercise?.category || '').trim().toLowerCase() || primary.join('|');
  }

  function hasSavedSets(index) {
    return activeLogs().some(log => Number(log?.exerciseIndex) === Number(index));
  }

  function blockedNames(index) {
    const blocked = new Set();
    activeExercises().forEach((exercise, exerciseIndex) => {
      if (exerciseIndex === index) return;
      const name = String(exercise?.name || '').trim().toLowerCase();
      if (name) blocked.add(name);
    });
    activeLogs().forEach(log => {
      const name = String(log?.exercise || '').trim().toLowerCase();
      if (name) blocked.add(name);
    });
    return blocked;
  }

  function scoreCandidate(current, candidate, index) {
    if (!current || !candidate || current.name === candidate.name) return -999;
    const candidateName = String(candidate.name || '').trim().toLowerCase();
    if (!candidateName || blockedNames(index).has(candidateName)) return -999;

    const avoid = new Set(avoided().map(value => value.toLowerCase()));
    if (avoid.has(candidateName)) return -999;

    const currentPrimary = primaryMuscles(current);
    const candidatePrimary = primaryMuscles(candidate);
    const primaryOverlap = candidatePrimary.filter(muscle => currentPrimary.includes(muscle)).length;

    // A swap must share a primary target. Assisting muscles alone are not enough.
    if (primaryOverlap === 0) return -999;

    const currentAll = allMuscles(current);
    const candidateAll = allMuscles(candidate);
    const totalOverlap = candidateAll.filter(muscle => currentAll.includes(muscle)).length;
    const sameFamily = movementFamily(current) === movementFamily(candidate);
    const sameCategory = String(current.category || '').toLowerCase() === String(candidate.category || '').toLowerCase();
    const sameEquipment = String(current.equipment || '').toLowerCase() === String(candidate.equipment || '').toLowerCase();
    const gymScore = gymEquipmentScore(candidate);

    if (gymScore <= -20) return -999;
    return primaryOverlap * 12 + totalOverlap * 3 + (sameFamily ? 9 : 0) + (sameCategory ? 3 : 0) + (sameEquipment ? 1 : 0) + gymScore;
  }

  function suggestions(current, index) {
    return catalog()
      .map(item => ({ item, score: scoreCandidate(current, item, index) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score || String(a.item.name).localeCompare(String(b.item.name)))
      .slice(0, 10)
      .map(entry => entry.item);
  }

  function makeExercise(candidate, current) {
    let made = null;
    try { if (typeof builderExerciseFromCatalog === 'function') made = builderExerciseFromCatalog(candidate); } catch {}
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
    modal.addEventListener('click', event => { if (event.target.closest?.('[data-swap-close]')) closeModal(); });
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
    const gym = preferredGym();

    if (hasSavedSets(index)) {
      content.innerHTML = `
        <div class="exercise-swap-heading">
          <div><div class="over">SWAP EXERCISE</div><h2 id="exerciseSwapTitle">${esc(current.name)} already started</h2><p>You already saved a set for this exercise. Swapping it now would mix two exercises inside the same workout entry, so Level Up keeps it locked.</p></div>
          <button type="button" class="exercise-swap-close" data-swap-close aria-label="Close">×</button>
        </div>`;
      modal.classList.remove('hidden');
      return;
    }

    const options = suggestions(current, index);
    const isAvoided = avoided().includes(String(current.name || ''));
    content.innerHTML = `
      <div class="exercise-swap-heading">
        <div>
          <div class="over">SWAP EXERCISE</div>
          <h2 id="exerciseSwapTitle">Replace ${esc(current.name)}</h2>
          <p>Only exercises with the same primary target are shown. Exercises already in this workout are removed.${gym?.name ? ` Options also have to fit the equipment saved for ${esc(gym.name)}.` : ''}</p>
        </div>
        <button type="button" class="exercise-swap-close" data-swap-close aria-label="Close">×</button>
      </div>
      <div class="exercise-swap-actions"><button type="button" class="exercise-swap-avoid${isAvoided ? ' active' : ''}" data-swap-avoid>${isAvoided ? 'Allow this exercise again' : "Don't recommend this exercise again"}</button></div>
      <div class="exercise-swap-list">
        ${options.length ? options.map(item => `<button type="button" class="exercise-swap-option" data-swap-name="${esc(item.name)}"><span>${esc(item.name)}</span><small>${esc((item.primary || []).join(', '))} · ${esc(item.equipment || 'Exercise')}</small></button>`).join('') : '<p class="exercise-swap-empty">No unused exercises with the same primary target match your saved gym equipment.</p>'}
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
    if (hasSavedSets(index)) return renderModal(index);
    const exercises = activeExercises();
    const current = exercises[index];
    const candidate = catalog().find(item => String(item?.name || '') === String(name || ''));
    if (!current || !candidate || scoreCandidate(current, candidate, index) <= 0) return;
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
    const rows = [...list.querySelectorAll(':scope > .set-row')];
    rows.forEach((row, index) => {
      const heading = row.querySelector('.exercise-heading');
      if (!heading) return;
      let button = heading.querySelector('.exercise-swap-button');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'exercise-swap-button';
        heading.appendChild(button);
      }
      const started = hasSavedSets(index);
      button.textContent = started ? 'Started' : 'Swap';
      button.disabled = started;
      button.setAttribute('aria-label', started
        ? `${heading.querySelector('h3')?.textContent?.trim() || 'Exercise'} already has saved sets`
        : `Swap ${heading.querySelector('h3')?.textContent?.trim() || 'exercise'}`);
      button.onclick = started ? null : () => renderModal(index);
    });
  }

  function start() {
    ensureModal();
    decorateRows();
    const list = document.getElementById('setList');
    if (list) new MutationObserver(() => requestAnimationFrame(decorateRows)).observe(list, { childList: true });
    window.addEventListener('pageshow', decorateRows);
    window.addEventListener('levelup:gym-profiles-changed', decorateRows);
    document.addEventListener('click', event => {
      if (event.target.closest?.('#setList [data-log]')) setTimeout(decorateRows, 160);
    }, true);
  }

  window.LevelUpExerciseSwap = { open: renderModal, avoided, addAvoid, removeAvoid, suggestions };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
