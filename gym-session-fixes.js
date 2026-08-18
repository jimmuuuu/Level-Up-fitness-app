(() => {
  const TARGET_ACCOUNT_ID = '7157999e-613b-4a48-92a7-42960d0cdca8';
  const DRAFT_KEY = 'levelUpFitnessActiveWorkout';
  const BACKUP_PREFIX = 'levelUpFitnessActiveWorkoutBackup:';
  const PREF_APPLIED_KEY = 'levelUpFitnessFieldNotesV1:';
  const REST_TAG = 'level-up-rest-timer';
  let cachedAuthId = '';
  let preferencePassRunning = false;
  let autosaveTimer = null;
  let restoringExtras = null;
  let cloudCheckpointTimer = null;
  let cloudRestoreRunning = false;
  const invalidatedSessions = new Set();

  if (typeof window.restTimerEndsAt !== 'number') window.restTimerEndsAt = 0;
  if (!('restTimerInterval' in window)) window.restTimerInterval = null;

  function currentAccountKey() {
    try {
      if (typeof draftAccountKey === 'function') return String(draftAccountKey() || '');
    } catch {}
    try {
      return String(userProfile?.accountKey || userProfile?.email?.trim().toLowerCase() || '');
    } catch {
      return '';
    }
  }

  async function authId() {
    if (cachedAuthId) return cachedAuthId;
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return '';
      const { data } = await client.auth.getSession();
      cachedAuthId = String(data?.session?.user?.id || '');
    } catch {}
    return cachedAuthId;
  }

  function rawDraft() {
    try {
      const value = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      return value && typeof value === 'object' ? value : null;
    } catch {
      return null;
    }
  }

  function backupKey(accountKey) {
    return accountKey ? `${BACKUP_PREFIX}${accountKey}` : '';
  }

  function readBackup(accountKey) {
    const key = backupKey(accountKey);
    if (!key) return null;
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value === 'object' && value.accountKey === accountKey ? value : null;
    } catch {
      return null;
    }
  }

  function collectInputs() {
    const setList = document.getElementById('setList');
    if (!setList) return [];
    const values = [];
    setList.querySelectorAll('input[id^="w-"], input[id^="r-"], select[data-type-log]').forEach(control => {
      if (control.readOnly || control.disabled) return;
      const key = control.id || `type-${control.dataset.typeLog || ''}`;
      if (!key) return;
      values.push({ key, value: String(control.value ?? '') });
    });
    return values;
  }

  function enrichDraft(draft) {
    if (!draft || typeof draft !== 'object') return draft;
    const existing = rawDraft();
    const captured = collectInputs();
    const pending = restoringExtras && restoringExtras.sessionId === draft.sessionId ? restoringExtras : null;
    draft.unsavedInputs = pending?.unsavedInputs || (captured.length ? captured : (existing?.sessionId === draft.sessionId ? existing.unsavedInputs : [])) || [];
    const currentRestEnd = Number(window.restTimerEndsAt) || 0;
    draft.restTimerEndsAt = pending?.restTimerEndsAt || currentRestEnd || (existing?.sessionId === draft.sessionId ? Number(existing.restTimerEndsAt) || 0 : 0);
    draft.lastAutosaveAt = Date.now();
    return draft;
  }

  function persistBackup(draft) {
    if (!draft?.accountKey || !draft?.sessionId) return;
    try { localStorage.setItem(backupKey(draft.accountKey), JSON.stringify(draft)); } catch {}
  }

  function draftSessionForCloud(draft) {
    const snapshot = draft?.planSnapshot || {};
    const exercises = Array.isArray(snapshot.exercises) ? snapshot.exercises : [];
    const muscles = [...new Set(exercises.flatMap(exercise => Array.isArray(exercise.primary) ? exercise.primary : []))];
    return {
      id: draft.sessionId,
      startedAt: Number(draft.startedAt) || Date.now(),
      completedAt: 0,
      durationMinutes: 0,
      planId: draft.planId || snapshot.id || '',
      plan: snapshot.name || 'Workout',
      program: snapshot.personal ? 'Weekly plan' : null,
      scheduledDay: snapshot.day || null,
      muscles,
      logs: Array.isArray(draft.logs) ? draft.logs : []
    };
  }

  async function checkpointDraftToCloud(draft) {
    try {
      if (!draft?.sessionId || invalidatedSessions.has(draft.sessionId)) return;
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;
      const { data } = await client.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;

      const session = draftSessionForCloud(draft);
      try {
        if (typeof cloudUser !== 'undefined' && !cloudUser) cloudUser = user;
      } catch {}
      try {
        if (typeof uploadCloudWorkoutSession === 'function') await uploadCloudWorkoutSession(session, 'active');
      } catch {
        const { error } = await client.from('workout_sessions').upsert({
          id: draft.sessionId,
          user_id: user.id,
          status: 'active',
          plan_id: session.planId,
          plan_name: session.plan,
          program: session.program,
          scheduled_day: session.scheduledDay,
          muscles: session.muscles,
          started_at: new Date(session.startedAt).toISOString(),
          completed_at: null,
          duration_minutes: 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        if (error) return;
      }
      await client.from('workout_sessions')
        .update({ draft_payload: draft, updated_at: new Date().toISOString() })
        .eq('id', draft.sessionId)
        .eq('user_id', user.id);
    } catch {}
  }

  async function cleanupCloudDraft(sessionId, completed) {
    if (!sessionId) return;
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;
      const { data } = await client.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;
      if (completed) {
        await client.from('workout_sessions')
          .update({ status: 'completed', draft_payload: null, updated_at: new Date().toISOString() })
          .eq('id', sessionId)
          .eq('user_id', user.id);
      } else {
        await client.from('workout_sets').delete().eq('session_id', sessionId).eq('user_id', user.id);
        await client.from('workout_sessions').delete().eq('id', sessionId).eq('user_id', user.id).eq('status', 'active');
      }
    } catch {}
  }

  function scheduleCloudCheckpoint(draft) {
    if (cloudCheckpointTimer) clearTimeout(cloudCheckpointTimer);
    const snapshot = draft ? JSON.parse(JSON.stringify(draft)) : rawDraft();
    cloudCheckpointTimer = setTimeout(() => {
      cloudCheckpointTimer = null;
      void checkpointDraftToCloud(snapshot || rawDraft());
    }, 650);
  }

  async function restoreDraftFromCloud() {
    if (cloudRestoreRunning) return false;
    cloudRestoreRunning = true;
    try {
      const accountKey = currentAccountKey();
      if (!accountKey) return false;
      const local = rawDraft() || readBackup(accountKey);
      if (local?.sessionId && local.accountKey === accountKey) return false;
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return false;
      const { data: sessionData } = await client.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return false;
      const { data, error } = await client.from('workout_sessions')
        .select('id,draft_payload,updated_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .not('draft_payload', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1);
      if (error || !data?.length || !data[0]?.draft_payload) return false;
      const draft = { ...data[0].draft_payload, accountKey };
      if (!draft.sessionId || !draft.planId || !Array.isArray(draft.logs)) return false;
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        persistBackup(draft);
      } catch { return false; }
      return true;
    } catch {
      return false;
    } finally {
      cloudRestoreRunning = false;
    }
  }

  try {
    if (typeof writeActiveWorkoutDraft === 'function') {
      const originalWrite = writeActiveWorkoutDraft;
      writeActiveWorkoutDraft = function(draft) {
        const enriched = enrichDraft({ ...draft });
        const ok = originalWrite(enriched);
        if (ok) {
          persistBackup(enriched);
          scheduleCloudCheckpoint(enriched);
        }
        return ok;
      };
    }
  } catch {}

  try {
    if (typeof loadActiveWorkoutDraft === 'function') {
      const originalLoad = loadActiveWorkoutDraft;
      loadActiveWorkoutDraft = function() {
        const accountKey = currentAccountKey();
        let draft = null;
        try { draft = originalLoad(); } catch {}
        if (draft && (!accountKey || draft.accountKey === accountKey)) return draft;
        if (accountKey) return readBackup(accountKey);
        return draft;
      };
    }
  } catch {}

  try {
    if (typeof clearActiveWorkoutDraft === 'function') {
      const originalClear = clearActiveWorkoutDraft;
      clearActiveWorkoutDraft = function() {
        const draft = rawDraft();
        const accountKey = draft?.accountKey || currentAccountKey();
        const sessionId = String(draft?.sessionId || '');
        let completed = false;
        try { completed = Boolean(sessionId && Array.isArray(workoutHistory) && workoutHistory.some(session => session?.id === sessionId)); } catch {}
        if (cloudCheckpointTimer) {
          clearTimeout(cloudCheckpointTimer);
          cloudCheckpointTimer = null;
        }
        if (sessionId) invalidatedSessions.add(sessionId);
        originalClear();
        if (accountKey) {
          try { localStorage.removeItem(backupKey(accountKey)); } catch {}
        }
        if (sessionId) {
          void cleanupCloudDraft(sessionId, completed);
          setTimeout(() => { void cleanupCloudDraft(sessionId, completed); }, 1200);
        }
      };
    }
  } catch {}

  function restoreInputs(draft) {
    if (!draft || !Array.isArray(draft.unsavedInputs)) return;
    draft.unsavedInputs.forEach(entry => {
      const key = String(entry?.key || '');
      if (!key) return;
      let control = null;
      if (key.startsWith('type-')) {
        const wanted = key.slice(5);
        control = [...document.querySelectorAll('#setList [data-type-log]')].find(node => node.dataset.typeLog === wanted) || null;
      } else {
        control = document.getElementById(key);
      }
      if (!control || control.readOnly || control.disabled) return;
      control.value = String(entry.value ?? '');
    });
  }

  function restoreRest(draft) {
    const end = Number(draft?.restTimerEndsAt) || 0;
    if (!end || end <= Date.now()) return;
    window.restTimerEndsAt = end;
    try {
      if (window.restTimerInterval) clearInterval(window.restTimerInterval);
      if (typeof updateRestTimer === 'function') updateRestTimer();
      window.restTimerInterval = setInterval(() => {
        try { if (typeof updateRestTimer === 'function') updateRestTimer(); } catch {}
      }, 1000);
    } catch {}
  }

  try {
    if (typeof applyActiveDraft === 'function') {
      const originalApply = applyActiveDraft;
      applyActiveDraft = function(draft, plan) {
        restoringExtras = draft;
        try {
          const value = originalApply(draft, plan);
          restoreInputs(draft);
          restoreRest(draft);
          try { if (typeof persistActiveWorkout === 'function') persistActiveWorkout(); } catch {}
          return value;
        } finally {
          restoringExtras = null;
        }
      };
    }
  } catch {}

  function scheduleAutosave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      autosaveTimer = null;
      try {
        if (typeof activePlan !== 'undefined' && activePlan && typeof persistActiveWorkout === 'function') {
          persistActiveWorkout();
          scheduleCloudCheckpoint(rawDraft());
        }
      } catch {}
    }, 180);
  }

  document.addEventListener('input', event => {
    if (event.target?.closest?.('#setList')) scheduleAutosave();
  }, true);
  document.addEventListener('change', event => {
    if (event.target?.closest?.('#setList')) scheduleAutosave();
  }, true);

  function formatRest(seconds) {
    const value = Math.max(0, Math.ceil(Number(seconds) || 0));
    const minutes = Math.floor(value / 60);
    const remainder = value % 60;
    return `${minutes}:${String(remainder).padStart(2, '0')}`;
  }

  async function showNotification(title, body, tag = REST_TAG) {
    try {
      if (!('Notification' in window)) return false;
      let permission = Notification.permission;
      if (permission === 'default') permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;
      const registration = await navigator.serviceWorker?.ready;
      if (registration?.showNotification) {
        await registration.showNotification(title, {
          body,
          tag,
          renotify: true,
          requireInteraction: true,
          icon: './assets/app-icon-192.png',
          badge: './assets/app-icon-192.png',
          data: { url: location.href }
        });
        return true;
      }
      new Notification(title, { body, tag });
      return true;
    } catch {
      return false;
    }
  }

  function updateRestTimerEnhanced() {
    const timer = document.getElementById('restTimer');
    if (!timer) return;
    const end = Number(window.restTimerEndsAt) || 0;
    if (!end) {
      timer.classList.add('hidden');
      timer.innerHTML = '';
      return;
    }
    const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    if (remaining <= 0) {
      timer.classList.remove('hidden');
      timer.classList.add('rest-complete');
      timer.innerHTML = '<span>REST COMPLETE</span><strong>Go when ready</strong>';
      window.restTimerEndsAt = 0;
      if (window.restTimerInterval) clearInterval(window.restTimerInterval);
      window.restTimerInterval = null;
      try { if (typeof persistActiveWorkout === 'function') persistActiveWorkout(); } catch {}
      void showNotification('Rest complete', 'Your next set is ready when you are.', `${REST_TAG}-done`);
      setTimeout(() => {
        timer.classList.add('hidden');
        timer.classList.remove('rest-complete');
        timer.innerHTML = '';
      }, 8000);
      return;
    }
    timer.classList.remove('hidden', 'rest-complete');
    timer.innerHTML = `
      <div class="rest-timer-main"><span>REST TIMER</span><strong>${formatRest(remaining)}</strong></div>
      <div class="rest-timer-controls">
        <button type="button" data-rest-adjust="-30" aria-label="Remove 30 seconds">−30</button>
        <button type="button" data-rest-skip aria-label="End rest timer">Skip</button>
        <button type="button" data-rest-adjust="30" aria-label="Add 30 seconds">+30</button>
      </div>`;
  }

  try {
    updateRestTimer = updateRestTimerEnhanced;
  } catch {}

  try {
    if (typeof startRestTimer === 'function') {
      startRestTimer = function(seconds = 90) {
        const duration = Math.max(15, Math.min(600, Number(seconds) || 90));
        window.restTimerEndsAt = Date.now() + duration * 1000;
        if (window.restTimerInterval) clearInterval(window.restTimerInterval);
        updateRestTimerEnhanced();
        window.restTimerInterval = setInterval(updateRestTimerEnhanced, 1000);
        try { if (typeof persistActiveWorkout === 'function') persistActiveWorkout(); } catch {}
        const endLabel = new Date(window.restTimerEndsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        void showNotification(`Rest ${formatRest(duration)}`, `Rest ends at ${endLabel}. Your workout is autosaved.`);
      };
    }
  } catch {}

  document.addEventListener('click', event => {
    const adjust = event.target.closest?.('[data-rest-adjust]');
    if (adjust) {
      const seconds = Number(adjust.dataset.restAdjust) || 0;
      const currentEnd = Number(window.restTimerEndsAt) || Date.now();
      window.restTimerEndsAt = Math.max(Date.now() + 1000, currentEnd + seconds * 1000);
      updateRestTimerEnhanced();
      try { if (typeof persistActiveWorkout === 'function') persistActiveWorkout(); } catch {}
      return;
    }
    if (event.target.closest?.('[data-rest-skip]')) {
      window.restTimerEndsAt = 0;
      if (window.restTimerInterval) clearInterval(window.restTimerInterval);
      window.restTimerInterval = null;
      updateRestTimerEnhanced();
      try { if (typeof persistActiveWorkout === 'function') persistActiveWorkout(); } catch {}
    }
  }, true);

  function customExercise(name, primary, assists, sets, repRange, equipment = 'Machine') {
    let source = null;
    try { source = Array.isArray(exerciseCatalog) ? exerciseCatalog.find(item => item.name === name) : null; } catch {}
    if (source) {
      try {
        const made = typeof builderExerciseFromCatalog === 'function' ? builderExerciseFromCatalog(source) : null;
        if (made) return { ...made, sets, repRange };
      } catch {}
    }
    return {
      instanceId: `field-note-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      catalogId: `field-note-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      category: primary.includes('Calves') ? 'Legs' : primary.includes('Core') ? 'Core' : 'Legs',
      equipment,
      muscle: primary[0] || '',
      primary,
      assists,
      sets,
      repRange,
      note: ''
    };
  }

  function preferredExercise(exercise) {
    if (!exercise) return exercise;
    const name = String(exercise.name || '');
    if (/^(calf raise|seated calf raise)$/i.test(name)) {
      return { ...customExercise('Calf Extension', ['Calves'], [], exercise.sets || 3, exercise.repRange || [10, 15]), instanceId: exercise.instanceId || undefined };
    }
    if (/leg raise|knee raise/i.test(name)) {
      return { ...customExercise('Ab Crunch Machine', ['Core'], [], exercise.sets || 2, exercise.repRange || [10, 15]), instanceId: exercise.instanceId || undefined };
    }
    return exercise;
  }

  function preferredPlanCopy(plan) {
    if (!plan?.exercises) return plan;
    return { ...plan, exercises: plan.exercises.map(preferredExercise) };
  }

  try {
    if (typeof startWorkout === 'function') {
      const originalStartWorkout = startWorkout;
      startWorkout = function() {
        let currentId = cachedAuthId;
        try { currentId = currentId || String(cloudUser?.id || ''); } catch {}
        if (currentId === TARGET_ACCOUNT_ID) {
          try { selectedPlan = preferredPlanCopy(selectedPlan); } catch {}
        }
        return originalStartWorkout();
      };
    }
  } catch {}

  function dedicatedLegExercises() {
    return [
      customExercise('Leg Press', ['Legs', 'Glutes'], ['Hamstrings'], 3, [8, 12]),
      customExercise('Leg Extension', ['Legs'], [], 3, [10, 15]),
      customExercise('Seated Leg Curl', ['Hamstrings'], ['Calves'], 3, [10, 15]),
      customExercise('Smith Machine Squat', ['Legs', 'Glutes'], ['Hamstrings'], 2, [8, 12], 'Smith machine'),
      customExercise('Hip Abductor Machine', ['Glutes'], [], 2, [12, 15]),
      customExercise('Calf Extension', ['Calves'], [], 3, [10, 15])
    ];
  }

  async function applyPersonalFieldNotes() {
    if (preferencePassRunning) return;
    preferencePassRunning = true;
    try {
      const id = await authId();
      if (id !== TARGET_ACCOUNT_ID) return;
      if (!userProfile || !Array.isArray(userProfile.customWorkouts)) return;
      const plans = userProfile.customWorkouts;
      let changed = false;
      let legDayApplied = plans.some(plan => /^leg day$/i.test(String(plan?.name || '')));
      const next = plans.map(plan => {
        if (!String(plan?.id || '').startsWith('custom-auto-weekly-')) return plan;
        const marker = `${PREF_APPLIED_KEY}${id}:${plan.id}:${plan.createdAt || 0}`;
        let updated = { ...plan, exercises: (plan.exercises || []).map(preferredExercise) };
        if (JSON.stringify(updated.exercises) !== JSON.stringify(plan.exercises || [])) changed = true;

        const lowerCandidate = /lower body|legs/i.test(String(plan.name || ''));
        if (!legDayApplied && lowerCandidate && localStorage.getItem(marker) !== 'leg-day') {
          updated = {
            ...updated,
            name: 'Leg Day',
            type: 'Legs',
            time: plan.time || '45-60 min',
            revision: (Number(plan.revision) || 0) + 1,
            updatedAt: Date.now(),
            exercises: dedicatedLegExercises()
          };
          try { localStorage.setItem(marker, 'leg-day'); } catch {}
          legDayApplied = true;
          changed = true;
        } else if (lowerCandidate) {
          legDayApplied = true;
        }
        return updated;
      });
      if (!changed) return;
      try {
        userProfile.customWorkouts = typeof sanitizeCustomPlans === 'function' ? sanitizeCustomPlans(next) : next;
      } catch {
        userProfile.customWorkouts = next;
      }
      try { if (typeof markProfileDirty === 'function') markProfileDirty('customWorkout'); } catch {}
      try { if (typeof saveUserProfile === 'function') saveUserProfile(); } catch {}
      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      try { if (typeof saveCloudProfile === 'function') await saveCloudProfile(); } catch {}
    } finally {
      preferencePassRunning = false;
    }
  }

  function resumeProtectedWorkout() {
    try {
      const accountKey = currentAccountKey();
      if (!accountKey) return;
      let draft = rawDraft();
      if (!draft || draft.accountKey !== accountKey) draft = readBackup(accountKey);
      if (!draft?.sessionId) {
        void restoreDraftFromCloud().then(restored => { if (restored) setTimeout(resumeProtectedWorkout, 60); });
        return;
      }
      if (typeof activePlan !== 'undefined' && activePlan) {
        if (document.getElementById('active')?.classList.contains('hidden') && typeof go === 'function') go('active');
        return;
      }
      if (typeof restoreActiveWorkout === 'function' && restoreActiveWorkout(true)) return;
    } catch {}
  }

  function emergencyPersist() {
    try {
      if (typeof activePlan !== 'undefined' && activePlan && typeof persistActiveWorkout === 'function') {
        persistActiveWorkout();
        scheduleCloudCheckpoint(rawDraft());
      }
    } catch {}
  }

  window.addEventListener('pagehide', emergencyPersist, { capture: true });
  window.addEventListener('beforeunload', emergencyPersist, { capture: true });
  window.addEventListener('pageshow', () => {
    cachedAuthId = '';
    setTimeout(resumeProtectedWorkout, 250);
    void applyPersonalFieldNotes();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') emergencyPersist();
    else {
      cachedAuthId = '';
      setTimeout(resumeProtectedWorkout, 120);
      if (Number(window.restTimerEndsAt) > Date.now()) updateRestTimerEnhanced();
      void applyPersonalFieldNotes();
    }
  });

  [300, 900, 1800, 3500].forEach(delay => setTimeout(() => {
    void authId().then(() => {
      void applyPersonalFieldNotes();
      resumeProtectedWorkout();
    });
  }, delay));
})();
