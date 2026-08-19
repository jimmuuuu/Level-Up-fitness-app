(() => {
  const PAGE_ID = 'exerciseLibrary';
  let selectedName = '';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function catalog() {
    try { return Array.isArray(exerciseCatalog) ? exerciseCatalog : []; }
    catch { return []; }
  }

  function ensurePage() {
    const tabs = document.querySelector('.tabs');
    if (!tabs) return null;
    let page = document.getElementById(PAGE_ID);
    if (page) return page;
    page = document.createElement('section');
    page.id = PAGE_ID;
    page.className = 'page hidden exercise-library-page';
    page.innerHTML = `
      <button id="exerciseLibraryBack" class="back" type="button">Back to workouts</button>
      <div class="over">EXERCISES</div>
      <h1>Exercise library</h1>
      <p class="exercise-library-intro">Search movements, learn what they train, and add them to a workout.</p>
      <div class="exercise-library-search-wrap"><input id="exerciseLibrarySearch" type="search" autocomplete="off" placeholder="Search chest press, leg curl, row..."></div>
      <div id="exerciseLibraryCount" class="exercise-library-count"></div>
      <div id="exerciseLibraryList" class="exercise-library-list"></div>
      <div id="exerciseLibraryDetail" class="exercise-library-detail hidden"></div>`;
    tabs.insertAdjacentElement('beforebegin', page);
    page.querySelector('#exerciseLibraryBack').onclick = () => goSafe('workout');
    page.querySelector('#exerciseLibrarySearch').addEventListener('input', renderList);
    return page;
  }

  function ensureLauncher() {
    const workout = document.getElementById('workout');
    if (!workout || document.getElementById('openExerciseLibrary')) return;
    const button = document.createElement('button');
    button.id = 'openExerciseLibrary';
    button.type = 'button';
    button.className = 'exercise-library-launcher';
    button.innerHTML = '<span>Exercise library</span><small>Browse every movement</small>';
    const program = document.getElementById('accountProgramLibrary');
    if (program) program.insertAdjacentElement('beforebegin', button); else workout.querySelector('h1')?.insertAdjacentElement('afterend', button);
    button.onclick = openPage;
  }

  function goSafe(id) {
    try { if (typeof go === 'function') return go(id); } catch {}
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(id)?.classList.remove('hidden');
  }

  function openPage() {
    ensurePage();
    renderList();
    goSafe(PAGE_ID);
  }

  function match(item, query) {
    if (!query) return true;
    const text = `${item?.name || ''} ${item?.category || ''} ${item?.equipment || ''} ${(item?.primary || []).join(' ')} ${(item?.assists || []).join(' ')}`.toLowerCase();
    return text.includes(query.toLowerCase());
  }

  function renderList() {
    ensurePage();
    const search = document.getElementById('exerciseLibrarySearch');
    const list = document.getElementById('exerciseLibraryList');
    const count = document.getElementById('exerciseLibraryCount');
    if (!list || !count) return;
    const query = String(search?.value || '').trim();
    const items = catalog().filter(item => match(item, query)).sort((a,b) => String(a.name).localeCompare(String(b.name)));
    count.textContent = `${items.length} exercise${items.length === 1 ? '' : 's'}`;
    list.innerHTML = items.map(item => `
      <button type="button" class="exercise-library-item" data-exercise-name="${esc(item.name)}">
        <div><strong>${esc(item.name)}</strong><span>${esc(item.equipment || item.category || 'Exercise')}</span></div>
        <small>${esc((item.primary || []).join(', '))}</small>
      </button>`).join('');
    list.querySelectorAll('[data-exercise-name]').forEach(button => button.onclick = () => openDetail(button.dataset.exerciseName));
  }

  function youtubeUrl(name) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} proper form exercise tutorial`)}`;
  }

  function openDetail(name) {
    const item = catalog().find(entry => String(entry?.name || '') === String(name || ''));
    const detail = document.getElementById('exerciseLibraryDetail');
    if (!item || !detail) return;
    selectedName = item.name;
    detail.innerHTML = `
      <div class="exercise-library-detail-backdrop" data-detail-close></div>
      <section class="exercise-library-detail-sheet" role="dialog" aria-modal="true">
        <div class="exercise-library-detail-heading">
          <div><div class="over">EXERCISE</div><h2>${esc(item.name)}</h2><p>${esc(item.equipment || item.category || '')}</p></div>
          <button type="button" data-detail-close aria-label="Close">×</button>
        </div>
        <div class="exercise-library-muscles">${(item.primary || []).map(m => `<span>${esc(m)} · primary</span>`).join('')}${(item.assists || []).map(m => `<span>${esc(m)}</span>`).join('')}</div>
        ${item.note ? `<div class="exercise-library-note"><strong>How to do it</strong><p>${esc(item.note)}</p></div>` : ''}
        <div class="exercise-library-detail-actions">
          <button type="button" class="primary" data-add-active>Add to active workout</button>
          <a href="${youtubeUrl(item.name)}" target="_blank" rel="noopener noreferrer">Watch form video</a>
        </div>
      </section>`;
    detail.classList.remove('hidden');
    detail.querySelectorAll('[data-detail-close]').forEach(button => button.onclick = () => detail.classList.add('hidden'));
    detail.querySelector('[data-add-active]').onclick = () => addToActive(item);
  }

  function makeExercise(item) {
    try { if (typeof builderExerciseFromCatalog === 'function') return builderExerciseFromCatalog(item); } catch {}
    return {
      instanceId: `library-${Date.now()}`,
      catalogId: item.id,
      name: item.name,
      category: item.category,
      equipment: item.equipment,
      muscle: item.primary?.[0] || '',
      primary: [...(item.primary || [])],
      assists: [...(item.assists || [])],
      sets: 3,
      repRange: [8,12]
    };
  }

  function addToActive(item) {
    const detail = document.getElementById('exerciseLibraryDetail');
    try {
      if (!activePlan || !activeSessionId) throw new Error('Start a workout first, then add this exercise.');
      const exercises = Array.isArray(activePlan.exercises) ? activePlan.exercises : [];
      if (exercises.some(ex => ex.name === item.name || ex.catalogId === item.id)) throw new Error('This exercise is already in the workout.');
      activePlan = { ...activePlan, exercises: [...exercises, makeExercise(item)] };
      if (typeof persistActiveWorkout === 'function') persistActiveWorkout();
      if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
      const actions = detail?.querySelector('.exercise-library-detail-actions');
      if (actions) actions.insertAdjacentHTML('beforeend', `<p class="exercise-library-status">${esc(item.name)} added to the active workout.</p>`);
    } catch (error) {
      const actions = detail?.querySelector('.exercise-library-detail-actions');
      if (actions) actions.insertAdjacentHTML('beforeend', `<p class="exercise-library-status error">${esc(error?.message || 'Could not add exercise.')}</p>`);
    }
  }

  function start() {
    ensurePage();
    ensureLauncher();
    renderList();
  }

  window.LevelUpExerciseLibrary = { open: openPage, openExercise: openDetail };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
