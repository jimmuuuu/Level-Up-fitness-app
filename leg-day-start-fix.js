(() => {
  const TARGET_USERS = new Set([
    '7157999e-613b-4a48-92a7-42960d0cdca8',
    '981bc688-a50f-4eb3-b9d7-2145acb2b6f5'
  ]);

  function currentUserId() {
    try {
      const value = String(window.LevelUpAuthoritativeHistory?.userId || '');
      if (value) return value;
    } catch {}
    try {
      const value = String(cloudUser?.id || '');
      if (value) return value;
    } catch {}
    try {
      const value = String(userProfile?.cloudUserId || '');
      if (value) return value;
    } catch {}
    return '';
  }

  function catalogItem(name) {
    try {
      return Array.isArray(exerciseCatalog)
        ? exerciseCatalog.find(item => String(item?.name || '').toLowerCase() === String(name).toLowerCase()) || null
        : null;
    } catch {
      return null;
    }
  }

  function makeExercise(name, primary, assists, sets, repRange, equipment = 'Machine') {
    const source = catalogItem(name);
    if (source) {
      try {
        if (typeof builderExerciseFromCatalog === 'function') {
          const made = builderExerciseFromCatalog(source);
          if (made) return { ...made, sets, repRange };
        }
      } catch {}
      return {
        instanceId: `field-leg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        catalogId: source.id,
        name: source.name,
        category: source.category,
        equipment: source.equipment,
        muscle: source.primary?.[0] || primary[0] || '',
        primary: [...(source.primary || primary)],
        assists: [...(source.assists || assists)],
        sets,
        repRange
      };
    }
    return {
      instanceId: `field-leg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      catalogId: `exercise-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
      name,
      category: 'Legs',
      equipment,
      muscle: primary[0] || '',
      primary,
      assists,
      sets,
      repRange,
      note: name === 'Calf Extension' ? 'Use a calf-extension or leg-press calf-press setup that feels comfortable.' : ''
    };
  }

  function addCalfExtensionToCatalog() {
    try {
      if (!Array.isArray(exerciseCatalog) || catalogItem('Calf Extension')) return;
      exerciseCatalog.push({
        id: 'exercise-calf-extension',
        name: 'Calf Extension',
        category: 'Legs',
        equipment: 'Machine',
        primary: ['Calves'],
        assists: []
      });
    } catch {}
  }

  function dedicatedLegDay(plan) {
    const originalName = String(plan?.name || '');
    if (!/^(lower body a|legs a)$/i.test(originalName)) return plan;
    return {
      ...plan,
      name: 'Leg Day',
      type: 'Legs',
      time: plan.time || '45-60 min',
      exercises: [
        makeExercise('Leg Press', ['Legs', 'Glutes'], ['Hamstrings'], 3, [8, 12]),
        makeExercise('Leg Extension', ['Legs'], [], 3, [10, 15]),
        makeExercise('Seated Leg Curl', ['Hamstrings'], ['Calves'], 3, [10, 15]),
        makeExercise('Smith Machine Squat', ['Legs', 'Glutes'], ['Hamstrings'], 2, [8, 12], 'Smith machine'),
        makeExercise('Hip Abductor Machine', ['Glutes'], [], 2, [12, 15]),
        makeExercise('Calf Extension', ['Calves'], [], 3, [10, 15])
      ]
    };
  }

  function mapComfortPreferences(plan) {
    if (!plan?.exercises) return plan;
    return {
      ...plan,
      exercises: plan.exercises.map(exercise => {
        const name = String(exercise?.name || '');
        if (/^(calf raise|seated calf raise)$/i.test(name)) {
          return { ...makeExercise('Calf Extension', ['Calves'], [], exercise.sets || 3, exercise.repRange || [10, 15]), instanceId: exercise.instanceId || undefined };
        }
        if (/leg raise|knee raise/i.test(name)) {
          return { ...makeExercise('Ab Crunch Machine', ['Core'], [], exercise.sets || 2, exercise.repRange || [10, 15]), instanceId: exercise.instanceId || undefined };
        }
        return exercise;
      })
    };
  }

  function personalizeSelectedPlan() {
    const userId = currentUserId();
    if (!TARGET_USERS.has(userId)) return;
    try {
      if (typeof selectedPlan === 'undefined' || !selectedPlan) return;
      selectedPlan = mapComfortPreferences(dedicatedLegDay(selectedPlan));
    } catch {}
  }

  function install() {
    addCalfExtensionToCatalog();
    try {
      if (typeof startWorkout === 'function' && !startWorkout.__fieldLegDayWrapped) {
        const previous = startWorkout;
        const wrapped = function(...args) {
          personalizeSelectedPlan();
          return previous.apply(this, args);
        };
        wrapped.__fieldLegDayWrapped = true;
        startWorkout = wrapped;
        const startButton = document.getElementById('start');
        if (startButton) startButton.onclick = startWorkout;
      }
    } catch {}
  }

  install();
  window.addEventListener('pageshow', install);
  window.addEventListener('levelup:authoritative-history-ready', install);
  setTimeout(install, 500);
  setTimeout(install, 1600);
})();
