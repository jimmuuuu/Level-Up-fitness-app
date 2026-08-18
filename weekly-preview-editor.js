(() => {
  const AUTO_PREFIX = 'custom-auto-weekly-';
  const CONFIG_PREFIX = 'levelUpFitnessWeeklyPlan:';
  const V3_APPLIED_PREFIX = 'levelUpFitnessWeeklyPersonalizationV3:';
  const V3_VERSION = 3;
  const MAX_EXERCISES = 20;

  const drafts = new Map();
  const dirtyPlans = new Set();
  let previewSignature = '';
  let renderQueued = false;

  const html = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  function accountId() {
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return cloudUser.id;
      if (typeof userProfile !== 'undefined') {
        return userProfile?.accountKey || userProfile?.email?.trim().toLowerCase() || 'local';
      }
    } catch {}
    return 'local';
  }

  function readConfig() {
    try {
      return JSON.parse(localStorage.getItem(`${CONFIG_PREFIX}${accountId()}`) || 'null');
    } catch {
      return null;
    }
  }

  function catalogByName(name) {
    try {
      return Array.isArray(exerciseCatalog) ? exerciseCatalog.find(item => item.name === name) || null : null;
    } catch {
      return null;
    }
  }

  function allCatalog() {
    try {
      return Array.isArray(exerciseCatalog) ? exerciseCatalog : [];
    } catch {
      return [];
    }
  }

  function cardPlanName(card) {
    return card?.querySelector(':scope > div > strong')?.textContent?.trim()
      || card?.querySelector('strong')?.textContent?.trim()
      || '';
  }

  function targetTimeText(card) {
    const small = card?.querySelector(':scope > div > small')?.textContent || '';
    const match = small.match(/(?:·\s*)?(75\+\s*min|~?\d+\s*min)(?:\s*target)?/i);
    if (match) return match[1].replace(/^~/, '').trim() + ' target';
    const summary = document.querySelector('#weeklyPlanWizard .weekly-preview-summary strong')?.textContent || '';
    if (/75\+\s*min/i.test(summary)) return '75+ min target';
    const duration = summary.match(/(30|45|60|75)\+?\s*min/i)?.[1];
    return duration ? `${duration} min target` : 'Personalized target';
  }

  function clampInt(value, min, max, fallback) {
    const number = Math.round(Number(value));
    return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
  }

  function parseExerciseRow(row) {
    const name = row.querySelector('.weekly-preview-exercise-copy b')?.textContent?.trim() || '';
    if (!name) return null;
    const prescription = row.querySelector(':scope > strong')?.textContent || '';
    const match = prescription.match(/(\d+)\s*x\s*(\d+)\s*[-–]\s*(\d+)/i);
    return {
      name,
      sets: clampInt(match?.[1], 1, 5, 3),
      minReps: clampInt(match?.[2], 1, 30, 8),
      maxReps: clampInt(match?.[3], 1, 30, 12)
    };
  }

  function seedDraft(card) {
    const name = cardPlanName(card);
    if (!name || drafts.has(name)) return;
    const rows = [...card.querySelectorAll('.weekly-preview-exercise-panel ol > li')];
    const exercises = rows.map(parseExerciseRow).filter(Boolean);
    if (exercises.length) drafts.set(name, exercises);
  }

  function currentPreviewSignature(overlay) {
    const summary = overlay.querySelector('.weekly-preview-summary')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const names = [...overlay.querySelectorAll('.weekly-preview-day.workout')].map(cardPlanName).join('|');
    return `${summary}::${names}`;
  }

  function maybeResetForNewAnswers(overlay) {
    const next = currentPreviewSignature(overlay);
    if (!previewSignature) {
      previewSignature = next;
      return;
    }
    if (next && next !== previewSignature) {
      previewSignature = next;
      drafts.clear();
      dirtyPlans.clear();
    }
  }

  function draftFor(card) {
    seedDraft(card);
    return drafts.get(cardPlanName(card)) || [];
  }

  function markDirty(card) {
    const name = cardPlanName(card);
    if (name) dirtyPlans.add(name);
  }

  function normalizeDraftItem(item) {
    const minReps = clampInt(item.minReps, 1, 30, 8);
    const maxReps = clampInt(item.maxReps, minReps, 30, Math.max(minReps, 12));
    return {
      name: String(item.name || '').trim(),
      sets: clampInt(item.sets, 1, 5, 3),
      minReps,
      maxReps
    };
  }

  function defaultPrescription() {
    const summary = document.querySelector('#weeklyPlanWizard .weekly-preview-summary p')?.textContent?.toLowerCase() || '';
    if (summary.includes('improve endurance')) return { sets: 2, minReps: 12, maxReps: 15 };
    if (summary.includes('get stronger')) return { sets: 3, minReps: 6, maxReps: 10 };
    return { sets: 3, minReps: 8, maxReps: 12 };
  }

  function updateCardSummary(card) {
    const exercises = draftFor(card);
    const sets = exercises.reduce((sum, item) => sum + clampInt(item.sets, 1, 5, 3), 0);
    const small = card.querySelector(':scope > div > small');
    if (small) small.textContent = `${exercises.length} exercises · ${sets} work sets · ${targetTimeText(card)}`;
  }

  function viewRowMarkup(item, index, editing) {
    const normalized = normalizeDraftItem(item);
    const catalog = catalogByName(normalized.name);
    const equipment = catalog?.equipment || '';
    if (!editing) {
      return `<li class="weekly-editable-exercise-row">
        <span class="weekly-preview-exercise-number">${index + 1}</span>
        <span class="weekly-preview-exercise-copy"><b>${html(normalized.name)}</b>${equipment ? `<small>${html(equipment)}</small>` : ''}</span>
        <strong>${normalized.sets} x ${normalized.minReps}-${normalized.maxReps}</strong>
      </li>`;
    }
    return `<li class="weekly-editable-exercise-row editing" data-weekly-edit-index="${index}">
      <span class="weekly-preview-exercise-number">${index + 1}</span>
      <span class="weekly-preview-exercise-copy"><b>${html(normalized.name)}</b>${equipment ? `<small>${html(equipment)}</small>` : ''}</span>
      <div class="weekly-exercise-fields">
        <label><span>Sets</span><input type="number" inputmode="numeric" min="1" max="5" value="${normalized.sets}" data-weekly-field="sets"></label>
        <label><span>Reps</span><div><input type="number" inputmode="numeric" min="1" max="30" value="${normalized.minReps}" data-weekly-field="minReps"><i>to</i><input type="number" inputmode="numeric" min="1" max="30" value="${normalized.maxReps}" data-weekly-field="maxReps"></div></label>
      </div>
      <div class="weekly-exercise-row-actions">
        <button type="button" data-weekly-move="up" aria-label="Move ${html(normalized.name)} up">↑</button>
        <button type="button" data-weekly-move="down" aria-label="Move ${html(normalized.name)} down">↓</button>
        <button type="button" class="danger" data-weekly-remove aria-label="Remove ${html(normalized.name)}">Remove</button>
      </div>
    </li>`;
  }

  function searchResultsMarkup(card, query) {
    const draft = draftFor(card);
    const used = new Set(draft.map(item => item.name));
    const needle = String(query || '').trim().toLowerCase();
    const results = allCatalog().filter(item => {
      if (used.has(item.name)) return false;
      if (!needle) return true;
      const haystack = [item.name, item.equipment, ...(item.primary || []), ...(item.assists || [])].join(' ').toLowerCase();
      return haystack.includes(needle);
    }).slice(0, 12);

    if (!results.length) return '<p class="weekly-add-empty">No matching exercises found.</p>';
    return results.map(item => `<button type="button" class="weekly-add-result" data-weekly-add-name="${html(item.name)}">
      <span><b>${html(item.name)}</b><small>${html([...(item.primary || [])].join(', ') || item.equipment || 'Exercise')}</small></span>
      <strong>Add</strong>
    </button>`).join('');
  }

  function renderPanel(card) {
    const panel = card.querySelector('.weekly-preview-exercise-panel');
    if (!panel) return;
    const exercises = draftFor(card);
    const editing = panel.dataset.weeklyEditing === 'true';
    const searchOpen = editing && panel.dataset.weeklySearchOpen === 'true';
    const query = panel.dataset.weeklySearchQuery || '';

    panel.innerHTML = `<div class="weekly-preview-exercise-heading">
        <span>${editing ? 'EDIT WORKOUT' : 'PERSONALIZED WORKOUT'}</span>
        <small>${exercises.length} movement${exercises.length === 1 ? '' : 's'} · ${html(targetTimeText(card))}</small>
      </div>
      <ol>${exercises.map((item, index) => viewRowMarkup(item, index, editing)).join('')}</ol>
      ${editing ? `<div class="weekly-editor-actions">
        <button type="button" class="weekly-editor-add" data-weekly-toggle-add ${exercises.length >= MAX_EXERCISES ? 'disabled' : ''}>+ Add exercise</button>
        <button type="button" class="weekly-editor-done" data-weekly-done-editing>Done editing</button>
      </div>` : `<button type="button" class="weekly-editor-edit" data-weekly-start-editing>Edit workout</button>`}
      ${searchOpen ? `<section class="weekly-add-exercise-box">
        <div class="weekly-add-exercise-top"><strong>Add an exercise</strong><button type="button" data-weekly-close-add aria-label="Close exercise search">×</button></div>
        <input type="search" autocomplete="off" placeholder="Search by exercise, muscle, or equipment" value="${html(query)}" data-weekly-exercise-search>
        <div class="weekly-add-results">${searchResultsMarkup(card, query)}</div>
      </section>` : ''}
      <p class="weekly-v3-time-note">The selected time is a target that includes warm-up, normal rest, equipment setup and transitions. Actual workout time can vary.</p>`;

    updateCardSummary(card);
    bindPanel(card);
  }

  function updateDraftField(card, index, field, value) {
    const draft = draftFor(card).map(item => ({ ...item }));
    if (!draft[index]) return;
    draft[index][field] = value;
    draft[index] = normalizeDraftItem(draft[index]);
    drafts.set(cardPlanName(card), draft);
    markDirty(card);
    updateCardSummary(card);
  }

  function bindPanel(card) {
    const panel = card.querySelector('.weekly-preview-exercise-panel');
    if (!panel) return;

    panel.querySelector('[data-weekly-start-editing]')?.addEventListener('click', () => {
      panel.dataset.weeklyEditing = 'true';
      renderPanel(card);
    });

    panel.querySelector('[data-weekly-done-editing]')?.addEventListener('click', () => {
      panel.dataset.weeklyEditing = 'false';
      panel.dataset.weeklySearchOpen = 'false';
      renderPanel(card);
    });

    panel.querySelector('[data-weekly-toggle-add]')?.addEventListener('click', () => {
      panel.dataset.weeklySearchOpen = panel.dataset.weeklySearchOpen === 'true' ? 'false' : 'true';
      panel.dataset.weeklySearchQuery = '';
      renderPanel(card);
      if (panel.dataset.weeklySearchOpen === 'true') panel.querySelector('[data-weekly-exercise-search]')?.focus();
    });

    panel.querySelector('[data-weekly-close-add]')?.addEventListener('click', () => {
      panel.dataset.weeklySearchOpen = 'false';
      renderPanel(card);
    });

    panel.querySelector('[data-weekly-exercise-search]')?.addEventListener('input', event => {
      panel.dataset.weeklySearchQuery = event.target.value;
      const results = panel.querySelector('.weekly-add-results');
      if (results) results.innerHTML = searchResultsMarkup(card, event.target.value);
      bindAddResults(card);
    });

    panel.querySelectorAll('[data-weekly-edit-index]').forEach(row => {
      const index = Number(row.dataset.weeklyEditIndex);
      row.querySelectorAll('[data-weekly-field]').forEach(input => {
        input.addEventListener('change', () => {
          updateDraftField(card, index, input.dataset.weeklyField, input.value);
          renderPanel(card);
        });
      });

      row.querySelector('[data-weekly-remove]')?.addEventListener('click', () => {
        const draft = draftFor(card).map(item => ({ ...item }));
        if (draft.length <= 1) return;
        draft.splice(index, 1);
        drafts.set(cardPlanName(card), draft);
        markDirty(card);
        renderPanel(card);
      });

      row.querySelectorAll('[data-weekly-move]').forEach(button => {
        button.addEventListener('click', () => {
          const draft = draftFor(card).map(item => ({ ...item }));
          const target = button.dataset.weeklyMove === 'up' ? index - 1 : index + 1;
          if (target < 0 || target >= draft.length) return;
          [draft[index], draft[target]] = [draft[target], draft[index]];
          drafts.set(cardPlanName(card), draft);
          markDirty(card);
          renderPanel(card);
        });
      });
    });

    bindAddResults(card);
  }

  function bindAddResults(card) {
    const panel = card.querySelector('.weekly-preview-exercise-panel');
    panel?.querySelectorAll('[data-weekly-add-name]').forEach(button => {
      button.onclick = () => {
        const draft = draftFor(card).map(item => ({ ...item }));
        if (draft.length >= MAX_EXERCISES) return;
        const name = button.dataset.weeklyAddName;
        if (!name || draft.some(item => item.name === name) || !catalogByName(name)) return;
        const defaults = defaultPrescription();
        draft.push({ name, ...defaults });
        drafts.set(cardPlanName(card), draft);
        markDirty(card);
        panel.dataset.weeklySearchOpen = 'false';
        renderPanel(card);
      };
    });
  }

  function enhancePreview() {
    const overlay = document.getElementById('weeklyPlanWizard');
    if (!overlay || overlay.classList.contains('hidden') || !overlay.querySelector('.weekly-preview-summary')) return;
    maybeResetForNewAnswers(overlay);

    overlay.querySelectorAll('.weekly-preview-day.workout').forEach(card => {
      const panel = card.querySelector('.weekly-preview-exercise-panel');
      if (!panel) return;
      seedDraft(card);
      if (panel.dataset.weeklyEditorReady === 'true') return;
      panel.dataset.weeklyEditorReady = 'true';
      panel.dataset.weeklyEditing = 'false';
      renderPanel(card);
    });
  }

  function desiredSignature(items) {
    return JSON.stringify(items.map(item => {
      const x = normalizeDraftItem(item);
      return [x.name, x.sets, [x.minReps, x.maxReps]];
    }));
  }

  function planSignature(plan) {
    return JSON.stringify((plan?.exercises || []).map(item => [item.name, Number(item.sets) || 0, item.repRange || []]));
  }

  function buildSavedExercise(item, existingPlan) {
    const normalized = normalizeDraftItem(item);
    const catalog = catalogByName(normalized.name);
    if (!catalog) return null;
    const previous = existingPlan?.exercises?.find(exercise => exercise.name === normalized.name) || null;
    let id;
    try { id = typeof createSessionId === 'function' ? createSessionId() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
    catch { id = `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
    return {
      instanceId: previous?.instanceId || `preview-edit-${id}`,
      catalogId: catalog.id,
      name: catalog.name,
      category: catalog.category,
      equipment: catalog.equipment,
      muscle: catalog.primary?.[0] || '',
      primary: [...(catalog.primary || [])],
      assists: [...(catalog.assists || [])],
      sets: normalized.sets,
      repRange: [normalized.minReps, normalized.maxReps],
      note: previous?.note || 'Use controlled repetitions and stop while your technique is still clean.'
    };
  }

  function markV3Applied() {
    const cfg = readConfig();
    if (!cfg?.updatedAt) return;
    try {
      localStorage.setItem(`${V3_APPLIED_PREFIX}${accountId()}`, `${V3_VERSION}:${cfg.updatedAt}`);
    } catch {}
  }

  async function persistEdits() {
    if (!dirtyPlans.size) return;
    let profile;
    try { profile = typeof userProfile !== 'undefined' ? userProfile : null; }
    catch { profile = null; }
    if (!profile) return;

    let plans;
    try {
      plans = typeof customPlansForCurrentUser === 'function'
        ? customPlansForCurrentUser()
        : (Array.isArray(profile.customWorkouts) ? profile.customWorkouts : []);
    } catch {
      return;
    }
    if (!plans.some(plan => plan?.id?.startsWith(AUTO_PREFIX))) return;

    let changed = false;
    const now = Date.now();
    const next = plans.map((plan, index) => {
      if (!plan?.id?.startsWith(AUTO_PREFIX) || !dirtyPlans.has(plan.name)) return plan;
      const draft = drafts.get(plan.name);
      if (!draft?.length) return plan;
      if (planSignature(plan) === desiredSignature(draft)) return plan;
      const exercises = draft.map(item => buildSavedExercise(item, plan)).filter(Boolean);
      if (!exercises.length) return plan;
      changed = true;
      const candidate = {
        ...plan,
        revision: (Number(plan.revision) || 0) + 1,
        updatedAt: now + index,
        exercises
      };
      try { return typeof sanitizeCustomPlan === 'function' ? sanitizeCustomPlan(candidate) || plan : candidate; }
      catch { return candidate; }
    });

    markV3Applied();
    if (!changed) return;

    const previous = profile.customWorkouts;
    try {
      profile.customWorkouts = typeof sanitizeCustomPlans === 'function' ? sanitizeCustomPlans(next) : next;
      if (typeof markProfileDirty === 'function') markProfileDirty('customWorkout');
      if (typeof saveUserProfile === 'function' && !saveUserProfile()) {
        profile.customWorkouts = previous;
        return;
      }
      markV3Applied();
      if (typeof cloudReady !== 'undefined' && cloudReady && typeof saveCloudProfile === 'function') {
        try { await saveCloudProfile(); } catch {}
      }
      if (typeof renderPlans === 'function') renderPlans();
    } catch {
      profile.customWorkouts = previous;
    }
  }

  function schedulePersist() {
    [500, 900, 1500, 2500, 3800].forEach(delay => window.setTimeout(() => { void persistEdits(); }, delay));
  }

  document.addEventListener('click', event => {
    if (event.target.closest?.('[data-weekly-use]') && dirtyPlans.size) schedulePersist();
  }, true);

  if (!document.getElementById('weeklyPreviewEditorStyles')) {
    const style = document.createElement('style');
    style.id = 'weeklyPreviewEditorStyles';
    style.textContent = `
      .weekly-editor-edit,.weekly-editor-add,.weekly-editor-done{min-height:38px;border:1px solid rgba(255,77,87,.48);border-radius:12px;background:#15191d;color:#f5f7f8;font-weight:800;cursor:pointer;padding:0 13px}
      .weekly-editor-edit{width:100%;margin-top:10px}.weekly-editor-actions{display:flex;gap:10px;margin-top:12px}.weekly-editor-add{flex:1;text-align:left}.weekly-editor-done{background:#ff4d57;color:#080a0c;border-color:#ff4d57}.weekly-editor-add:disabled{opacity:.45;cursor:not-allowed}
      .weekly-editable-exercise-row.editing{grid-template-columns:28px minmax(145px,1fr) minmax(190px,auto);align-items:start}.weekly-exercise-fields{display:flex;gap:8px;flex-wrap:wrap}.weekly-exercise-fields label{display:grid;gap:4px;color:#8e969e;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.weekly-exercise-fields label>div{display:flex;align-items:center;gap:5px}.weekly-exercise-fields input{width:54px;height:34px;border:1px solid #30363c;border-radius:9px;background:#0b0e11;color:#f5f7f8;text-align:center;font-weight:800}.weekly-exercise-fields i{font-style:normal;color:#8e969e;font-size:11px;text-transform:none;letter-spacing:0}
      .weekly-exercise-row-actions{grid-column:2/-1;display:flex;gap:7px;justify-content:flex-end}.weekly-exercise-row-actions button{min-height:30px;border:1px solid #30363c;border-radius:9px;background:#0b0e11;color:#d9dee2;font-weight:800;padding:0 9px;cursor:pointer}.weekly-exercise-row-actions button.danger{border-color:rgba(255,77,87,.42);color:#ff7d85}
      .weekly-add-exercise-box{margin-top:12px;padding:12px;border:1px solid #2c3238;border-radius:14px;background:#0b0e11}.weekly-add-exercise-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px}.weekly-add-exercise-top strong{font-size:13px}.weekly-add-exercise-top button{width:30px;height:30px;border:0;border-radius:9px;background:#181c20;color:#f5f7f8;font-size:20px;cursor:pointer}.weekly-add-exercise-box input{width:100%;height:40px;border:1px solid #30363c;border-radius:11px;background:#111417;color:#f5f7f8;padding:0 12px;outline:none}.weekly-add-results{display:grid;gap:7px;max-height:270px;overflow:auto;margin-top:9px}.weekly-add-result{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:10px 11px;border:1px solid #252b30;border-radius:11px;background:#111417;color:#f5f7f8;text-align:left;cursor:pointer}.weekly-add-result span{display:grid;gap:3px}.weekly-add-result small{color:#8e969e}.weekly-add-result strong{color:#ff6b74}.weekly-add-empty{margin:10px 2px;color:#8e969e;font-size:12px}
      @media(max-width:720px){.weekly-editable-exercise-row.editing{grid-template-columns:26px minmax(0,1fr)}.weekly-exercise-fields{grid-column:2/-1}.weekly-exercise-row-actions{grid-column:2/-1;justify-content:flex-start}.weekly-editor-actions{flex-direction:column}.weekly-editor-done,.weekly-editor-add{width:100%}}
    `;
    document.head.appendChild(style);
  }

  const observer = new MutationObserver(() => {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      enhancePreview();
    });
  });

  function start() {
    enhancePreview();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();