(() => {
  const PAGE_ID = 'scan';
  const TAB_SELECTOR = '.tabs';
  const MAX_IMAGE_EDGE = 1280;
  const JPEG_QUALITY = 0.82;

  const state = {
    stream: null,
    imageDataUrl: '',
    result: null,
    catalogItem: null,
    analyzing: false,
  };

  const byId = id => document.getElementById(id);

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function catalog() {
    try { return Array.isArray(exerciseCatalog) ? exerciseCatalog : []; }
    catch { return []; }
  }

  function catalogByName(name) {
    const normalized = String(name || '').trim().toLowerCase();
    if (!normalized) return null;
    return catalog().find(item => String(item?.name || '').trim().toLowerCase() === normalized) || null;
  }

  function currentCustomPlans() {
    try {
      if (typeof customPlansForCurrentUser === 'function') return customPlansForCurrentUser();
    } catch {}
    try { return Array.isArray(userProfile?.customWorkouts) ? userProfile.customWorkouts : []; }
    catch { return []; }
  }

  function makeExercise(item) {
    if (!item) return null;
    try {
      if (typeof builderExerciseFromCatalog === 'function') return builderExerciseFromCatalog(item);
    } catch {}
    try {
      if (typeof sanitizeCustomExercise === 'function') {
        return sanitizeCustomExercise({
          instanceId: `scan-exercise-${typeof createSessionId === 'function' ? createSessionId() : Date.now()}`,
          catalogId: item.id,
          name: item.name,
          category: item.category,
          equipment: item.equipment,
          muscle: item.primary?.[0] || '',
          primary: [...(item.primary || [])],
          assists: [...(item.assists || [])],
          sets: 3,
          repRange: [8, 12],
        });
      }
    } catch {}
    return {
      instanceId: `scan-exercise-${Date.now()}`,
      catalogId: item.id,
      name: item.name,
      category: item.category,
      equipment: item.equipment,
      muscle: item.primary?.[0] || '',
      primary: [...(item.primary || [])],
      assists: [...(item.assists || [])],
      sets: 3,
      repRange: [8, 12],
    };
  }

  function ensureUi() {
    const app = byId('appShell');
    const tabs = document.querySelector(TAB_SELECTOR);
    if (!app || !tabs) return false;

    if (!byId(PAGE_ID)) {
      const section = document.createElement('section');
      section.id = PAGE_ID;
      section.className = 'page hidden';
      section.innerHTML = `
        <div class="scan-shell">
          <video id="scanCamera" class="scan-camera" playsinline muted></video>
          <img id="scanPhotoPreview" class="scan-photo-preview hidden" alt="Captured gym equipment">
          <div class="scan-shade" aria-hidden="true"></div>
          <div class="scan-reticle" aria-hidden="true"></div>

          <div class="scan-topbar">
            <div class="scan-copy-card">
              <strong>Scan gym equipment</strong>
              <span>Point your camera at a machine. Level Up can identify it, show the muscles it trains, explain the movement, and add it to a workout.</span>
            </div>
            <button id="scanAbout" class="scan-about-button" type="button" aria-label="About Scan">?</button>
          </div>

          <div id="scanStatus" class="scan-status" role="status" aria-live="polite">Opening camera...</div>

          <div class="scan-controls">
            <button id="scanUpload" class="scan-control-small" type="button">Upload</button>
            <button id="scanCapture" class="scan-capture" type="button" aria-label="Scan machine" disabled></button>
            <button id="scanManual" class="scan-control-small" type="button">Choose</button>
          </div>
          <input id="scanFile" type="file" accept="image/*" capture="environment" hidden>

          <div id="scanLoading" class="scan-loading hidden" aria-live="polite">
            <div class="scan-loading-card">
              <div class="scan-spinner" aria-hidden="true"></div>
              <strong>Identifying equipment</strong>
              <p>Checking the machine and matching it to the Level Up exercise library.</p>
            </div>
          </div>

          <section id="scanResultSheet" class="scan-result-sheet hidden" aria-label="Scan result"></section>
          <section id="scanPicker" class="scan-picker hidden" aria-label="Choose workout"></section>
          <section id="scanAboutPanel" class="scan-about-panel hidden" aria-label="About Scan"></section>
          <section id="scanManualPanel" class="scan-manual-panel hidden" aria-label="Choose exercise manually"></section>
        </div>`;
      tabs.insertAdjacentElement('beforebegin', section);
    }

    let tab = tabs.querySelector('button[data-page="scan"]');
    if (!tab) {
      tab = document.createElement('button');
      tab.type = 'button';
      tab.dataset.page = 'scan';
      tab.textContent = 'Scan';
      tab.setAttribute('aria-label', 'Scan gym equipment');
      const profile = tabs.querySelector('button[data-page="profile"]');
      if (profile) profile.insertAdjacentElement('beforebegin', tab);
      else tabs.appendChild(tab);
    }

    tab.onclick = () => openScan();
    return true;
  }

  function isScanVisible() {
    const page = byId(PAGE_ID);
    return Boolean(page && !page.classList.contains('hidden'));
  }

  function showPage() {
    try {
      if (typeof go === 'function') {
        go(PAGE_ID);
      } else {
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
        byId(PAGE_ID)?.classList.remove('hidden');
        document.querySelectorAll('.tabs button').forEach(button => button.classList.toggle('active', button.dataset.page === PAGE_ID));
      }
    } catch {
      document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
      byId(PAGE_ID)?.classList.remove('hidden');
    }
    try { sessionStorage.setItem('levelUpFitnessLastPage', PAGE_ID); } catch {}
  }

  async function openScan() {
    ensureUi();
    showPage();
    closeSheets();
    await startCamera();
  }

  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      state.stream = null;
    }
    const video = byId('scanCamera');
    if (video) video.srcObject = null;
    const capture = byId('scanCapture');
    if (capture) capture.disabled = true;
  }

  async function startCamera() {
    const video = byId('scanCamera');
    const preview = byId('scanPhotoPreview');
    const capture = byId('scanCapture');
    const status = byId('scanStatus');
    if (!video || !capture) return;

    state.imageDataUrl = '';
    state.result = null;
    state.catalogItem = null;
    preview?.classList.add('hidden');
    video.classList.remove('hidden');
    stopCamera();

    if (!navigator.mediaDevices?.getUserMedia) {
      if (status) status.textContent = 'Camera access is not available here. Use Upload to take or choose a photo.';
      return;
    }

    if (status) status.textContent = 'Opening camera...';
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      video.srcObject = state.stream;
      await video.play();
      capture.disabled = false;
      if (status) status.textContent = 'Center the machine in the frame, then tap the red scan button.';
    } catch {
      if (status) status.textContent = 'Camera permission was not available. Tap Upload to use your camera or photo library.';
    }
  }

  function canvasDataUrl(source, width, height) {
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height));
    const outputWidth = Math.max(1, Math.round(width * scale));
    const outputHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext('2d', { alpha: false });
    context.drawImage(source, 0, 0, outputWidth, outputHeight);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  }

  async function capturePhoto() {
    const video = byId('scanCamera');
    if (!video || video.readyState < 2 || !video.videoWidth) return;
    state.imageDataUrl = canvasDataUrl(video, video.videoWidth, video.videoHeight);
    showCapturedPhoto();
    await analyzePhoto();
  }

  function showCapturedPhoto() {
    const preview = byId('scanPhotoPreview');
    const video = byId('scanCamera');
    if (!preview || !state.imageDataUrl) return;
    preview.src = state.imageDataUrl;
    preview.classList.remove('hidden');
    video?.classList.add('hidden');
    stopCamera();
  }

  async function fileToDataUrl(file) {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        try { resolve(canvasDataUrl(image, image.naturalWidth, image.naturalHeight)); }
        catch (error) { reject(error); }
        finally { URL.revokeObjectURL(url); }
      };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Unable to read image')); };
      image.src = url;
    });
  }

  async function useFile(file) {
    if (!file || !file.type?.startsWith('image/')) return;
    try {
      state.imageDataUrl = await fileToDataUrl(file);
      showCapturedPhoto();
      await analyzePhoto();
    } catch {
      setStatus('That image could not be opened. Try another photo.');
    }
  }

  function setStatus(text) {
    const status = byId('scanStatus');
    if (status) status.textContent = text;
  }

  function loading(show) {
    state.analyzing = show;
    byId('scanLoading')?.classList.toggle('hidden', !show);
  }

  function catalogPayload() {
    return catalog().map(item => ({
      name: item.name,
      equipment: item.equipment || '',
      primary: Array.isArray(item.primary) ? item.primary : [],
      assists: Array.isArray(item.assists) ? item.assists : [],
    }));
  }

  async function analyzePhoto() {
    if (!state.imageDataUrl || state.analyzing) return;
    loading(true);
    closeSheets();
    setStatus('Analyzing machine...');

    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client?.functions?.invoke) throw new Error('Sign in to use AI Scan.');

      const { data, error } = await client.functions.invoke('scan-machine', {
        body: { imageDataUrl: state.imageDataUrl, catalog: catalogPayload() },
      });
      if (error) {
        const message = String(error?.context?.body?.error || error?.message || 'AI scan failed.');
        throw new Error(message);
      }
      if (!data?.result) throw new Error(data?.error || 'The scanner did not return a result.');

      const result = data.result;
      const item = catalogByName(result.catalogName) || catalogByName(result.identifiedName);
      state.result = result;
      state.catalogItem = item;
      renderResult(result, item);
      setStatus(item ? `Found ${item.name}.` : `Found ${result.identifiedName || 'gym equipment'}.`);
    } catch (error) {
      renderScanError(error?.message || 'The machine could not be identified.');
      setStatus('Scan could not finish. You can choose the exercise manually.');
    } finally {
      loading(false);
    }
  }

  function closeSheets(except = '') {
    ['scanResultSheet', 'scanPicker', 'scanAboutPanel', 'scanManualPanel'].forEach(id => {
      if (id !== except) byId(id)?.classList.add('hidden');
    });
  }

  function confidenceLabel(value) {
    const confidence = ['high', 'medium', 'low'].includes(String(value).toLowerCase()) ? String(value).toLowerCase() : 'low';
    return `${confidence} confidence`;
  }

  function videoUrl(name) {
    const query = encodeURIComponent(`${name} exercise machine proper form tutorial`);
    return `https://www.youtube.com/results?search_query=${query}`;
  }

  function resultMuscles(result, item) {
    const primary = Array.isArray(item?.primary) && item.primary.length ? item.primary : (Array.isArray(result?.primary) ? result.primary : []);
    const secondary = Array.isArray(item?.assists) && item.assists.length ? item.assists : (Array.isArray(result?.secondary) ? result.secondary : []);
    return { primary, secondary };
  }

  function renderResult(result, item) {
    const sheet = byId('scanResultSheet');
    if (!sheet) return;
    closeSheets('scanResultSheet');
    const name = item?.name || result?.identifiedName || 'Gym equipment';
    const muscles = resultMuscles(result, item);
    const steps = Array.isArray(result?.howTo) ? result.howTo.slice(0, 6).filter(Boolean) : [];
    const safety = result?.safety || 'Use a comfortable load, move under control, and follow the instructions printed on the machine.';
    const chips = [
      ...muscles.primary.map(muscle => `<span class="scan-muscle-chip">${esc(muscle)} · primary</span>`),
      ...muscles.secondary.map(muscle => `<span class="scan-muscle-chip">${esc(muscle)}</span>`),
    ].join('');

    sheet.innerHTML = `
      <div class="scan-sheet-handle"></div>
      <div class="scan-result-heading">
        <div>
          <div class="over">MACHINE IDENTIFIED</div>
          <h2>${esc(name)}</h2>
          <span class="scan-confidence">${esc(confidenceLabel(result?.confidence))}</span>
        </div>
        <button class="scan-close-button" type="button" data-scan-retake aria-label="Scan another machine">×</button>
      </div>
      <div class="scan-muscle-groups">${chips || '<span class="scan-muscle-chip">Muscles need confirmation</span>'}</div>
      <div class="scan-section-card">
        <h3>How to use it</h3>
        ${steps.length ? `<ol class="scan-howto">${steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol>` : '<p class="scan-safety">Follow the setup diagram on the machine and use controlled repetitions.</p>'}
        <p class="scan-safety">${esc(safety)}</p>
      </div>
      <div class="scan-actions">
        ${item ? '<button class="primary" type="button" data-scan-add>Add to workout</button>' : '<button class="primary" type="button" data-scan-manual>Choose matching exercise</button>'}
        <a href="${videoUrl(name)}" target="_blank" rel="noopener noreferrer">Watch form video</a>
        <div class="scan-secondary-row">
          <button type="button" data-scan-manual>Not the right machine?</button>
          <button type="button" data-scan-retake>Scan another</button>
        </div>
      </div>`;
    sheet.classList.remove('hidden');
    sheet.querySelectorAll('[data-scan-retake]').forEach(button => button.onclick = retake);
    sheet.querySelectorAll('[data-scan-manual]').forEach(button => button.onclick = openManualPicker);
    sheet.querySelector('[data-scan-add]')?.addEventListener('click', openWorkoutPicker);
  }

  function renderScanError(message) {
    const sheet = byId('scanResultSheet');
    if (!sheet) return;
    closeSheets('scanResultSheet');
    const setupHint = /not configured|missing_openai_key|AI scan is not configured/i.test(message)
      ? 'The camera experience is ready, but the server still needs its AI key before automatic identification can run.'
      : message;
    sheet.innerHTML = `
      <div class="scan-sheet-handle"></div>
      <div class="scan-result-heading">
        <div><div class="over">SCAN RESULT</div><h2>Could not identify it</h2></div>
        <button class="scan-close-button" type="button" data-scan-retake aria-label="Scan another machine">×</button>
      </div>
      <p class="scan-error">${esc(setupHint)}</p>
      <div class="scan-actions">
        <button class="primary" type="button" data-scan-manual>Choose the machine manually</button>
        <button type="button" data-scan-retake>Retake photo</button>
      </div>`;
    sheet.classList.remove('hidden');
    sheet.querySelectorAll('[data-scan-retake]').forEach(button => button.onclick = retake);
    sheet.querySelector('[data-scan-manual]')?.addEventListener('click', openManualPicker);
  }

  async function retake() {
    closeSheets();
    state.imageDataUrl = '';
    state.result = null;
    state.catalogItem = null;
    await startCamera();
  }

  function manualItems(query = '') {
    const needle = String(query || '').trim().toLowerCase();
    const machineFirst = catalog().filter(item => {
      const haystack = `${item.name} ${item.category || ''} ${item.equipment || ''}`.toLowerCase();
      return !needle || haystack.includes(needle);
    });
    return machineFirst.slice(0, 60);
  }

  function openManualPicker() {
    const panel = byId('scanManualPanel');
    if (!panel) return;
    closeSheets('scanManualPanel');
    panel.innerHTML = `
      <div class="scan-sheet-handle"></div>
      <div class="scan-manual-heading">
        <div><div class="over">MANUAL MATCH</div><h2>Choose the exercise</h2></div>
        <button class="scan-close-button" type="button" data-close>×</button>
      </div>
      <p>If Scan is unsure, pick the exercise that matches the machine in front of you.</p>
      <input id="scanManualSearch" class="scan-manual-search" type="search" autocomplete="off" placeholder="Search chest press, leg press, row...">
      <div id="scanManualList" class="scan-manual-list"></div>`;
    panel.classList.remove('hidden');
    panel.querySelector('[data-close]').onclick = () => panel.classList.add('hidden');
    const search = byId('scanManualSearch');
    const render = () => {
      const list = byId('scanManualList');
      if (!list) return;
      const items = manualItems(search?.value || '');
      list.innerHTML = items.map(item => `
        <button class="scan-manual-option" type="button" data-manual-id="${esc(item.id)}">
          ${esc(item.name)}
          <small>${esc(item.equipment || item.category || 'Exercise')} · ${esc((item.primary || []).join(', '))}</small>
        </button>`).join('');
      list.querySelectorAll('[data-manual-id]').forEach(button => {
        button.onclick = () => {
          const item = catalog().find(exercise => String(exercise.id) === button.dataset.manualId);
          if (!item) return;
          state.catalogItem = item;
          state.result = {
            identifiedName: item.name,
            catalogName: item.name,
            confidence: 'confirmed',
            primary: item.primary || [],
            secondary: item.assists || [],
            howTo: item.note ? [item.note] : [],
            safety: 'Use a comfortable load, move under control, and follow the setup instructions printed on the machine.',
          };
          renderResult(state.result, item);
        };
      });
    };
    search?.addEventListener('input', render);
    render();
  }

  function activeWorkoutAvailable() {
    try { return Boolean(activePlan && activeSessionId); }
    catch { return false; }
  }

  function planLabel(plan) {
    const count = Array.isArray(plan?.exercises) ? plan.exercises.length : 0;
    return `${count} exercise${count === 1 ? '' : 's'}`;
  }

  function openWorkoutPicker() {
    const item = state.catalogItem;
    const picker = byId('scanPicker');
    if (!item || !picker) return;
    closeSheets('scanPicker');
    const plans = currentCustomPlans();
    picker.innerHTML = `
      <div class="scan-sheet-handle"></div>
      <div class="scan-picker-heading">
        <div><div class="over">ADD EXERCISE</div><h2>Add ${esc(item.name)}</h2></div>
        <button class="scan-close-button" type="button" data-close>×</button>
      </div>
      <div class="scan-picker-list">
        ${activeWorkoutAvailable() ? '<button class="scan-plan-option primary" type="button" data-add-active>Current active workout<small>Add it to the workout you are doing now</small></button>' : ''}
        ${plans.map(plan => `<button class="scan-plan-option" type="button" data-add-plan="${esc(plan.id)}">${esc(plan.name)}<small>${esc(planLabel(plan))}</small></button>`).join('')}
        <button class="scan-plan-option" type="button" data-create-plan>New workout with this exercise<small>Create a custom workout you can edit later</small></button>
      </div>`;
    picker.classList.remove('hidden');
    picker.querySelector('[data-close]').onclick = () => picker.classList.add('hidden');
    picker.querySelector('[data-add-active]')?.addEventListener('click', () => addToActiveWorkout(item));
    picker.querySelectorAll('[data-add-plan]').forEach(button => button.onclick = () => addToSavedPlan(button.dataset.addPlan, item));
    picker.querySelector('[data-create-plan]')?.addEventListener('click', () => createPlanWithExercise(item));
  }

  function showPickerMessage(message, success = true) {
    const picker = byId('scanPicker');
    if (!picker) return;
    let node = picker.querySelector('.scan-error');
    if (!node) {
      node = document.createElement('p');
      node.className = 'scan-error';
      picker.appendChild(node);
    }
    node.textContent = message;
    if (success) window.setTimeout(() => picker.classList.add('hidden'), 1100);
  }

  function addToActiveWorkout(item) {
    try {
      if (!activePlan || !activeSessionId) throw new Error('There is no active workout right now.');
      const exercise = makeExercise(item);
      if (!exercise) throw new Error('This exercise could not be added.');
      const exercises = Array.isArray(activePlan.exercises) ? activePlan.exercises : [];
      if (exercises.some(existing => existing.catalogId === exercise.catalogId || existing.name === exercise.name)) {
        throw new Error('That exercise is already in the active workout.');
      }
      activePlan = { ...activePlan, exercises: [...exercises, exercise] };
      if (typeof persistActiveWorkout === 'function') persistActiveWorkout();
      if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
      showPickerMessage(`${item.name} was added to your active workout.`);
    } catch (error) {
      showPickerMessage(error?.message || 'Could not add that exercise.', false);
    }
  }

  async function addToSavedPlan(id, item) {
    try {
      if (!userProfile) throw new Error('Sign in or create a profile first.');
      const all = Array.isArray(userProfile.customWorkouts) ? userProfile.customWorkouts : [];
      const target = all.find(plan => String(plan.id) === String(id));
      if (!target) throw new Error('That workout could not be found.');
      const exercise = makeExercise(item);
      if (!exercise) throw new Error('This exercise could not be added.');
      const exercises = Array.isArray(target.exercises) ? target.exercises : [];
      if (exercises.some(existing => existing.catalogId === exercise.catalogId || existing.name === exercise.name)) {
        throw new Error('That exercise is already in this workout.');
      }
      const limit = typeof MAX_CUSTOM_EXERCISES !== 'undefined' ? MAX_CUSTOM_EXERCISES : 20;
      if (exercises.length >= limit) throw new Error('That workout is already at its exercise limit.');

      const updated = {
        ...target,
        exercises: [...exercises, exercise],
        revision: (Number(target.revision) || 0) + 1,
        updatedAt: Date.now(),
      };
      const next = all.map(plan => String(plan.id) === String(id) ? updated : plan);
      userProfile.customWorkouts = typeof sanitizeCustomPlans === 'function' ? sanitizeCustomPlans(next) : next;
      if (typeof markProfileDirty === 'function') markProfileDirty('customWorkout');
      if (typeof saveUserProfile === 'function' && !saveUserProfile()) throw new Error('The workout could not be saved.');
      try {
        if (typeof cloudReady !== 'undefined' && cloudReady && typeof saveCloudProfile === 'function') await saveCloudProfile();
      } catch {}
      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      showPickerMessage(`${item.name} was added to ${target.name}.`);
    } catch (error) {
      showPickerMessage(error?.message || 'Could not add that exercise.', false);
    }
  }

  async function createPlanWithExercise(item) {
    try {
      if (!userProfile) throw new Error('Sign in or create a profile first.');
      const exercise = makeExercise(item);
      if (!exercise) throw new Error('This exercise could not be added.');
      const all = Array.isArray(userProfile.customWorkouts) ? userProfile.customWorkouts : [];
      const maxPlans = typeof MAX_CUSTOM_WORKOUTS !== 'undefined' ? MAX_CUSTOM_WORKOUTS : 12;
      if (all.length >= maxPlans) throw new Error('You are already at the custom workout limit.');
      const now = Date.now();
      const plan = {
        id: `custom-scan-${typeof createSessionId === 'function' ? createSessionId() : now}`,
        name: `${item.name} Workout`,
        type: item.category || 'Custom workout',
        time: 'Custom',
        icon: 'machine',
        revision: 1,
        createdAt: now,
        updatedAt: now,
        exercises: [exercise],
      };
      const sanitized = typeof sanitizeCustomPlan === 'function' ? sanitizeCustomPlan(plan) : plan;
      if (!sanitized) throw new Error('The workout could not be created.');
      const next = [...all, sanitized];
      userProfile.customWorkouts = typeof sanitizeCustomPlans === 'function' ? sanitizeCustomPlans(next) : next;
      if (typeof markProfileDirty === 'function') markProfileDirty('customWorkout');
      if (typeof saveUserProfile === 'function' && !saveUserProfile()) throw new Error('The workout could not be saved.');
      try {
        if (typeof cloudReady !== 'undefined' && cloudReady && typeof saveCloudProfile === 'function') await saveCloudProfile();
      } catch {}
      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      showPickerMessage(`Created ${sanitized.name}.`);
    } catch (error) {
      showPickerMessage(error?.message || 'Could not create the workout.', false);
    }
  }

  function openAbout() {
    const panel = byId('scanAboutPanel');
    if (!panel) return;
    closeSheets('scanAboutPanel');
    panel.innerHTML = `
      <div class="scan-sheet-handle"></div>
      <div class="scan-about-heading">
        <div><div class="over">ABOUT SCAN</div><h2>What Scan does</h2></div>
        <button class="scan-close-button" type="button" data-close>×</button>
      </div>
      <p>Scan is built for those moments when you see a machine at the gym and do not know what it is. Take a clear photo of the equipment and Level Up will try to match it to an exercise in the app.</p>
      <div class="scan-section-card">
        <h3>After a scan</h3>
        <p class="scan-safety">You can see the machine name, primary and assisting muscles, basic setup guidance, a form-video shortcut, and options to add the exercise to a workout.</p>
      </div>
      <div class="scan-section-card">
        <h3>AI can be wrong</h3>
        <p class="scan-safety">Machines can look similar. If the result does not match the label or movement in front of you, use Not the right machine and choose the correct exercise. Follow the instructions printed on the equipment.</p>
      </div>`;
    panel.classList.remove('hidden');
    panel.querySelector('[data-close]').onclick = () => panel.classList.add('hidden');
  }

  function bindUi() {
    byId('scanCapture')?.addEventListener('click', capturePhoto);
    byId('scanUpload')?.addEventListener('click', () => byId('scanFile')?.click());
    byId('scanFile')?.addEventListener('change', event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      void useFile(file);
    });
    byId('scanManual')?.addEventListener('click', openManualPicker);
    byId('scanAbout')?.addEventListener('click', openAbout);
  }

  function watchPage() {
    const page = byId(PAGE_ID);
    if (!page) return;
    const observer = new MutationObserver(() => {
      if (isScanVisible()) {
        if (!state.stream && !state.imageDataUrl && !state.analyzing) void startCamera();
      } else {
        stopCamera();
        closeSheets();
      }
    });
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  }

  function loadStyles() {
    if (document.querySelector('link[data-scan-feature-style]')) return;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'scan-feature.css?v=1';
    style.dataset.scanFeatureStyle = 'true';
    document.head.appendChild(style);
  }

  function start() {
    loadStyles();
    if (!ensureUi()) return;
    bindUi();
    watchPage();
  }

  window.LevelUpScan = {
    open: openScan,
    retake,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
