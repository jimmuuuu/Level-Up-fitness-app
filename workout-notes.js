(() => {
  const WORKOUT_PREFIX = 'levelUpFitnessWorkoutNote:';
  const EXERCISE_PREFIX = 'levelUpFitnessExerciseNotes:';
  const MAX_WORKOUT_NOTE = 1000;
  const MAX_EXERCISE_NOTE = 700;
  let saveTimer = null;

  function sessionId() {
    try { return String(activeSessionId || ''); } catch { return ''; }
  }

  function accountKey() {
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return String(cloudUser.id);
      if (typeof userProfile !== 'undefined' && userProfile?.accountKey) return String(userProfile.accountKey);
      if (typeof userProfile !== 'undefined' && userProfile?.email) return String(userProfile.email).trim().toLowerCase();
    } catch {}
    return 'local';
  }

  function workoutKey(id = sessionId()) { return `${WORKOUT_PREFIX}${accountKey()}:${id}`; }
  function exerciseKey(id = sessionId()) { return `${EXERCISE_PREFIX}${accountKey()}:${id}`; }

  function readWorkout(id = sessionId()) {
    if (!id) return '';
    try { return String(localStorage.getItem(workoutKey(id)) || ''); } catch { return ''; }
  }

  function writeWorkout(value, id = sessionId()) {
    const clean = String(value || '').slice(0, MAX_WORKOUT_NOTE);
    if (!id) return clean;
    try { localStorage.setItem(workoutKey(id), clean); } catch {}
    return clean;
  }

  function sanitizeExerciseNotes(value) {
    const input = value && typeof value === 'object' ? value : {};
    const clean = {};
    Object.entries(input).forEach(([rawIndex, raw]) => {
      const index = Number(rawIndex);
      if (!Number.isInteger(index) || index < 0 || index > 99) return;
      const note = String(raw?.note || '').trim().slice(0, MAX_EXERCISE_NOTE);
      const exercise = String(raw?.exercise || '').trim().slice(0, 100);
      if (!note) return;
      clean[String(index)] = { exercise, note, updatedAt: Number(raw?.updatedAt) || Date.now() };
    });
    return clean;
  }

  function readExerciseNotes(id = sessionId()) {
    if (!id) return {};
    try {
      const parsed = JSON.parse(localStorage.getItem(exerciseKey(id)) || '{}');
      return sanitizeExerciseNotes(parsed);
    } catch { return {}; }
  }

  function writeExerciseNotes(notes, id = sessionId()) {
    const clean = sanitizeExerciseNotes(notes);
    if (!id) return clean;
    try { localStorage.setItem(exerciseKey(id), JSON.stringify(clean)); } catch {}
    return clean;
  }

  function writeExerciseNote(index, exercise, value, id = sessionId()) {
    const notes = readExerciseNotes(id);
    const clean = String(value || '').slice(0, MAX_EXERCISE_NOTE).trim();
    const key = String(index);
    if (clean) notes[key] = { exercise: String(exercise || '').slice(0, 100), note: clean, updatedAt: Date.now() };
    else delete notes[key];
    return writeExerciseNotes(notes, id);
  }

  async function saveCloud(id = sessionId(), attempt = 0) {
    if (!id) return;
    const workoutNote = readWorkout(id);
    const exerciseNotes = readExerciseNotes(id);
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;
      const { data } = await client.auth.getSession();
      const userId = data?.session?.user?.id || '';
      if (!userId) return;
      const { data: rows, error } = await client.from('workout_sessions')
        .update({
          workout_note: workoutNote || null,
          exercise_notes: exerciseNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select('id');
      if (error) throw error;
      if ((!rows || !rows.length) && attempt < 4) {
        setTimeout(() => void saveCloud(id, attempt + 1), 1000 * (attempt + 1));
      }
    } catch {
      if (attempt < 3) setTimeout(() => void saveCloud(id, attempt + 1), 1500 * (attempt + 1));
    }
  }

  function scheduleCloudSave(id = sessionId(), statusNode = null) {
    clearTimeout(saveTimer);
    if (statusNode) statusNode.textContent = 'Saving';
    saveTimer = setTimeout(() => {
      void saveCloud(id);
      if (statusNode) statusNode.textContent = 'Saved';
    }, 450);
  }

  function currentExerciseName(index) {
    try { return String(activePlan?.exercises?.[index]?.name || 'Exercise'); }
    catch { return 'Exercise'; }
  }

  function decorateExerciseNotes() {
    const id = sessionId();
    const list = document.getElementById('setList');
    if (!id || !list) return;
    const saved = readExerciseNotes(id);

    [...list.querySelectorAll(':scope > .set-row')].forEach((row, index) => {
      if (row.dataset.personalExerciseNoteReady === 'true') return;
      row.dataset.personalExerciseNoteReady = 'true';
      const heading = row.querySelector('.exercise-heading');
      if (!heading) return;

      const exercise = currentExerciseName(index);
      const existing = saved[String(index)];
      const note = existing?.exercise === exercise ? existing.note : '';

      const details = document.createElement('details');
      details.className = 'exercise-personal-note';
      details.dataset.exerciseNoteIndex = String(index);
      if (note) details.classList.add('has-note');
      details.innerHTML = `
        <summary><span>${note ? 'Exercise note saved' : 'Add exercise note'}</span><small>Only for ${escapeHtmlSafe(exercise)}</small></summary>
        <div class="exercise-personal-note-body">
          <textarea maxlength="${MAX_EXERCISE_NOTE}" rows="2" placeholder="Machine setup, seat position, technique cue, or anything to remember next time."></textarea>
          <span class="exercise-personal-note-status">Saved on this device</span>
        </div>`;
      heading.insertAdjacentElement('afterend', details);

      const input = details.querySelector('textarea');
      const status = details.querySelector('.exercise-personal-note-status');
      input.value = note;
      input.addEventListener('input', () => {
        const next = writeExerciseNote(index, exercise, input.value, id);
        const hasNote = Boolean(next[String(index)]?.note);
        details.classList.toggle('has-note', hasNote);
        details.querySelector('summary span').textContent = hasNote ? 'Exercise note saved' : 'Add exercise note';
        scheduleCloudSave(id, status);
      });
    });
  }

  function escapeHtmlSafe(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[ch]);
  }

  function ensureWorkoutCard() {
    const finishSection = document.getElementById('endWorkoutSection');
    const id = sessionId();
    if (!finishSection || !id) return null;
    let card = document.getElementById('workoutNotesCard');
    if (card && card.dataset.sessionId !== id) card.remove();
    card = document.getElementById('workoutNotesCard');
    if (card) return card;

    card = document.createElement('section');
    card.id = 'workoutNotesCard';
    card.dataset.sessionId = id;
    card.className = 'workout-notes-card';
    card.innerHTML = `
      <div class="workout-notes-heading">
        <div><div class="over">WHOLE WORKOUT NOTE</div><h2>Remember this session</h2></div>
        <span id="workoutNotesStatus">Saved on this device</span>
      </div>
      <textarea id="workoutNotesInput" maxlength="${MAX_WORKOUT_NOTE}" rows="4" placeholder="Anything about the workout as a whole that you want to remember next time."></textarea>
      <p>Exercise notes stay with individual movements. This note is for the entire workout.</p>`;
    finishSection.insertAdjacentElement('beforebegin', card);

    const input = card.querySelector('#workoutNotesInput');
    const status = card.querySelector('#workoutNotesStatus');
    input.value = readWorkout(id);
    input.addEventListener('input', () => {
      writeWorkout(input.value, id);
      scheduleCloudSave(id, status);
    });
    return card;
  }

  function removeIfInactive() {
    let active = false;
    try { active = Boolean(activePlan && activeSessionId); } catch {}
    if (!active) document.getElementById('workoutNotesCard')?.remove();
  }

  function clearSwappedExerciseNote(event) {
    const id = sessionId();
    const index = Number(event?.detail?.index);
    if (!id || !Number.isInteger(index)) return;
    const notes = readExerciseNotes(id);
    if (!notes[String(index)]) return;
    delete notes[String(index)];
    writeExerciseNotes(notes, id);
    scheduleCloudSave(id);
  }

  function start() {
    decorateExerciseNotes();
    ensureWorkoutCard();

    const list = document.getElementById('setList');
    if (list) {
      new MutationObserver(() => requestAnimationFrame(decorateExerciseNotes))
        .observe(list, { childList: true });
    }

    window.addEventListener('pageshow', () => {
      removeIfInactive();
      decorateExerciseNotes();
      ensureWorkoutCard();
    });
    window.addEventListener('levelup:exercise-swapped', clearSwappedExerciseNote);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        removeIfInactive();
        decorateExerciseNotes();
        ensureWorkoutCard();
      }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest?.('#finish')) return;
      const id = sessionId();
      if (id) void saveCloud(id);
    }, true);
    setInterval(() => {
      removeIfInactive();
      decorateExerciseNotes();
      ensureWorkoutCard();
    }, 1800);
  }

  window.LevelUpWorkoutNotes = {
    get: readWorkout,
    getWorkout: readWorkout,
    getExercises: readExerciseNotes,
    save: value => {
      const id = sessionId();
      const note = writeWorkout(value, id);
      void saveCloud(id);
      return note;
    },
    saveExercise: (index, exercise, value) => {
      const id = sessionId();
      const notes = writeExerciseNote(index, exercise, value, id);
      void saveCloud(id);
      return notes;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
