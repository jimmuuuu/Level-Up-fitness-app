(() => {
  const TARGET_ACCOUNT_IDS = new Set([
    '7157999e-613b-4a48-92a7-42960d0cdca8',
    '981bc688-a50f-4eb3-b9d7-2145acb2b6f5'
  ]);
  const PREF_MARK = 'levelUpFitnessFieldNotesFinalV1:';
  const REST_ALERT_KEY = 'levelUpFitnessRestAlertsEnabled';
  let dragState = null;
  let applyingPrefs = false;
  let autosaveInterval = null;

  const byId = id => document.getElementById(id);

  async function authId() {
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return '';
      const { data } = await client.auth.getSession();
      return String(data?.session?.user?.id || '');
    } catch { return ''; }
  }

  function isTargetUser(id) {
    return TARGET_ACCOUNT_IDS.has(String(id || ''));
  }

  function catalog() {
    try { return Array.isArray(exerciseCatalog) ? exerciseCatalog : []; }
    catch { return []; }
  }

  function ensureCalfExtensionCatalog() {
    try {
      if (catalog().some(item => item?.name === 'Calf Extension')) return;
      const source = catalog().find(item => item?.name === 'Seated Calf Raise') || catalog().find(item => item?.name === 'Calf Raise');
      if (!source) return;
      exerciseCatalog.push({
        ...source,
        id: 'exercise-calf-extension',
        name: 'Calf Extension',
        category: 'Legs',
        equipment: 'Machine',
        primary: ['Calves'],
        assists: []
      });
    } catch {}
  }

  function makeExercise(name, sets, repRange, note = '') {
    const item = catalog().find(exercise => exercise?.name === name) || null;
    if (item) {
      try {
        if (typeof builderExerciseFromCatalog === 'function') {
          const made = builderExerciseFromCatalog(item);
          if (made) return { ...made, sets, repRange, note: note || made.note || '' };
        }
      } catch {}
      return {
        instanceId: `field-final-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
        catalogId: item.id,
        name: item.name,
        category: item.category,
        equipment: item.equipment,
        muscle: item.primary?.[0] || '',
        primary: [...(item.primary || [])],
        assists: [...(item.assists || [])],
        sets,
        repRange,
        note
      };
    }
    return {
      instanceId: `field-final-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      catalogId: `field-final-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,
      name,
      category: /calf|leg|squat|hip/i.test(name) ? 'Legs' : 'Core',
      equipment: 'Machine',
      muscle: /calf/i.test(name) ? 'Calves' : /ab crunch/i.test(name) ? 'Core' : 'Legs',
      primary: /calf/i.test(name) ? ['Calves'] : /ab crunch/i.test(name) ? ['Core'] : ['Legs'],
      assists: [],
      sets,
      repRange,
      note
    };
  }

  function preferredExercise(exercise) {
    if (!exercise) return exercise;
    const name = String(exercise.name || '');
    if (/^(calf raise|seated calf raise)$/i.test(name)) {
      const replacement = makeExercise('Calf Extension', exercise.sets || 3, exercise.repRange || [10,15], 'Use the calf-extension machine and keep the reps controlled.');
      return { ...replacement, instanceId: exercise.instanceId || replacement.instanceId };
    }
    if (/leg raise|knee raise/i.test(name)) {
      const replacement = makeExercise('Ab Crunch Machine', exercise.sets || 2, exercise.repRange || [10,15], 'Use a controlled core movement that does not bother your knees.');
      return { ...replacement, instanceId: exercise.instanceId || replacement.instanceId };
    }
    return exercise;
  }

  function dedicatedLegDay() {
    return [
      makeExercise('Leg Press', 3, [8,12], 'Controlled reps. Keep your feet planted and avoid locking your knees.'),
      makeExercise('Leg Extension', 3, [10,15], 'Use a comfortable range and stop if it causes knee pain.'),
      makeExercise('Seated Leg Curl', 3, [10,15], 'Keep your hips against the pad and control the return.'),
      makeExercise('Smith Machine Squat', 2, [8,12], 'Use a comfortable load and controlled depth.'),
      makeExercise('Hip Abductor Machine', 2, [12,15], 'Controlled reps for the side glutes.'),
      makeExercise('Calf Extension', 3, [10,15], 'Use the calf-extension machine and control every rep.')
    ];
  }

  async function applyPreferences() {
    if (applyingPrefs) return;
    applyingPrefs = true;
    try {
      ensureCalfExtensionCatalog();
      const id = await authId();
      if (!isTargetUser(id)) return;
      if (typeof userProfile === 'undefined' || !userProfile || !Array.isArray(userProfile.customWorkouts)) return;

      const plans = userProfile.customWorkouts;
      let changed = false;
      let hasLegDay = plans.some(plan => /^leg day$/i.test(String(plan?.name || '')));
      const next = plans.map(plan => {
        if (!String(plan?.id || '').startsWith('custom-auto-weekly-')) return plan;
        let updated = { ...plan, exercises: (plan.exercises || []).map(preferredExercise) };
        if (JSON.stringify(updated.exercises) !== JSON.stringify(plan.exercises || [])) changed = true;

        const lower = /lower body|legs/i.test(String(plan?.name || ''));
        if (!hasLegDay && lower) {
          updated = {
            ...updated,
            name: 'Leg Day',
            type: 'Legs',
            time: plan.time || '45-60 min',
            revision: (Number(plan.revision) || 0) + 1,
            updatedAt: Date.now(),
            exercises: dedicatedLegDay()
          };
          hasLegDay = true;
          changed = true;
        }
        return updated;
      });

      if (!changed) return;
      try { userProfile.customWorkouts = typeof sanitizeCustomPlans === 'function' ? sanitizeCustomPlans(next) : next; }
      catch { userProfile.customWorkouts = next; }
      try { localStorage.setItem(`${PREF_MARK}${id}`, String(Date.now())); } catch {}
      try { if (typeof markProfileDirty === 'function') markProfileDirty('customWorkout'); } catch {}
      try { if (typeof saveUserProfile === 'function') saveUserProfile(); } catch {}
      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      try { if (typeof renderHome === 'function') renderHome(); } catch {}
      try { if (typeof saveCloudProfile === 'function') await saveCloudProfile(); } catch {}
    } finally {
      applyingPrefs = false;
    }
  }

  function currentZoom() {
    const range = byId('scanZoomRange');
    return Math.max(1, Number(range?.value) || 1);
  }

  function isDigitalZoom() {
    const video = byId('scanCamera');
    if (!video) return false;
    const transform = video.style.transform || '';
    return /scale\(/.test(transform) && currentZoom() > 1.001;
  }

  async function captureDigitalZoom(event) {
    if (!event.target.closest?.('#scanCapture') || !isDigitalZoom()) return;
    const video = byId('scanCamera');
    const input = byId('scanFile');
    if (!video || !input || video.readyState < 2 || !video.videoWidth) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    try {
      const zoom = currentZoom();
      const sourceWidth = video.videoWidth / zoom;
      const sourceHeight = video.videoHeight / zoom;
      const sourceX = (video.videoWidth - sourceWidth) / 2;
      const sourceY = (video.videoHeight - sourceHeight) / 2;
      const scale = Math.min(1, 1280 / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const context = canvas.getContext('2d', { alpha: false });
      context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .84));
      if (!blob) throw new Error('capture failed');
      const transfer = new DataTransfer();
      transfer.items.add(new File([blob], `level-up-scan-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } catch {
      const videoTransform = video.style.transform;
      video.style.transform = '';
      window.setTimeout(() => {
        byId('scanCapture')?.click();
        video.style.transform = videoTransform;
      }, 0);
    }
  }

  function bindSheetDragging() {
    if (document.body.dataset.scanSheetDraggingBound === 'true') return;
    document.body.dataset.scanSheetDraggingBound = 'true';

    document.addEventListener('touchstart', event => {
      const handle = event.target.closest?.('#scan .scan-sheet-handle');
      if (!handle || event.touches.length !== 1) return;
      const panel = handle.closest('.scan-result-sheet, .scan-picker, .scan-about-panel, .scan-manual-panel');
      if (!panel) return;
      dragState = { panel, startY: event.touches[0].clientY, distance: 0 };
      panel.classList.add('scan-sheet-dragging');
    }, { passive: true });

    document.addEventListener('touchmove', event => {
      if (!dragState || event.touches.length !== 1) return;
      const delta = Math.max(0, event.touches[0].clientY - dragState.startY);
      dragState.distance = delta;
      dragState.panel.style.transform = `translateY(${delta}px)`;
      dragState.panel.style.opacity = String(Math.max(.55, 1 - delta / 420));
      if (delta > 4) event.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', () => {
      if (!dragState) return;
      const { panel, distance } = dragState;
      dragState = null;
      panel.classList.remove('scan-sheet-dragging');
      if (distance >= 72) {
        panel.style.transform = 'translateY(105%)';
        panel.style.opacity = '0';
        window.setTimeout(() => {
          panel.style.transform = '';
          panel.style.opacity = '';
          if (panel.id === 'scanResultSheet' && window.LevelUpScan?.retake) {
            void window.LevelUpScan.retake();
          } else {
            panel.classList.add('hidden');
          }
        }, 170);
      } else {
        panel.style.transform = '';
        panel.style.opacity = '';
      }
    }, { passive: true });
  }

  function alertsEnabled() {
    try { return localStorage.getItem(REST_ALERT_KEY) === 'true' && Notification.permission === 'granted'; }
    catch { return false; }
  }

  function updateAlertButton() {
    const button = byId('fieldRestAlerts');
    if (!button) return;
    const enabled = 'Notification' in window && alertsEnabled();
    button.classList.toggle('enabled', enabled);
    button.textContent = enabled ? 'Lock-screen rest alerts on' : 'Enable lock-screen rest alerts';
  }

  function ensureAlertButton() {
    const active = byId('active');
    if (!active || byId('fieldRestAlerts')) return;
    if (!('Notification' in window)) return;
    const button = document.createElement('button');
    button.id = 'fieldRestAlerts';
    button.className = 'field-rest-alerts';
    button.type = 'button';
    updateAlertButton();
    button.onclick = async () => {
      try {
        const permission = await Notification.requestPermission();
        localStorage.setItem(REST_ALERT_KEY, permission === 'granted' ? 'true' : 'false');
      } catch {}
      updateAlertButton();
    };
    const rest = byId('restTimer');
    if (rest) rest.insertAdjacentElement('beforebegin', button);
    else active.querySelector('.active-session-clock')?.insertAdjacentElement('afterend', button);
  }

  function emergencyPersist() {
    try {
      if (typeof activePlan !== 'undefined' && activePlan && typeof persistActiveWorkout === 'function') persistActiveWorkout();
    } catch {}
    try {
      if (typeof activePlan !== 'undefined' && activePlan) sessionStorage.setItem('levelUpFitnessLastPage', 'active');
    } catch {}
  }

  function start() {
    ensureCalfExtensionCatalog();
    bindSheetDragging();
    ensureAlertButton();
    document.addEventListener('click', event => { void captureDigitalZoom(event); }, true);

    window.addEventListener('pagehide', emergencyPersist, { capture: true });
    window.addEventListener('beforeunload', emergencyPersist, { capture: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') emergencyPersist();
      else {
        ensureAlertButton();
        void applyPreferences();
      }
    });

    if (autosaveInterval) clearInterval(autosaveInterval);
    autosaveInterval = setInterval(() => {
      emergencyPersist();
      ensureAlertButton();
    }, 1500);

    [0, 500, 1400, 3000].forEach(delay => window.setTimeout(() => void applyPreferences(), delay));
  }

  window.LevelUpFieldNotesFinal = { applyPreferences };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
