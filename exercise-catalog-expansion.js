(() => {
  const TARGET_EXERCISE_COUNT = 250;

  const additionalExercises = [
    ["Dumbbell Floor Press", "Chest", "Dumbbells", ["Chest"], ["Triceps", "Shoulders"]],
    ["Barbell Floor Press", "Chest", "Barbell", ["Chest"], ["Triceps"]],
    ["Neutral-Grip Dumbbell Bench Press", "Chest", "Dumbbells", ["Chest"], ["Triceps", "Shoulders"]],
    ["Close-Grip Bench Press", "Chest", "Barbell", ["Chest", "Triceps"], ["Shoulders"]],
    ["Wide-Grip Bench Press", "Chest", "Barbell", ["Chest"], ["Shoulders"]],
    ["Spoto Press", "Chest", "Barbell", ["Chest"], ["Triceps", "Shoulders"]],
    ["Paused Bench Press", "Chest", "Barbell", ["Chest"], ["Triceps", "Shoulders"]],
    ["Larsen Press", "Chest", "Barbell", ["Chest"], ["Triceps", "Shoulders"]],
    ["Incline Smith Machine Press", "Chest", "Smith machine", ["Chest"], ["Shoulders", "Triceps"]],
    ["Decline Smith Machine Press", "Chest", "Smith machine", ["Chest"], ["Triceps"]],
    ["Horizontal Chest Press Machine", "Chest", "Machine", ["Chest"], ["Shoulders", "Triceps"]],
    ["Plate-Loaded Chest Press", "Chest", "Plate loaded machine", ["Chest"], ["Shoulders", "Triceps"]],
    ["Single-Arm Chest Press Machine", "Chest", "Machine", ["Chest"], ["Shoulders", "Triceps"]],
    ["Single-Arm Cable Chest Press", "Chest", "Cable", ["Chest"], ["Shoulders", "Triceps"]],
    ["Standing Cable Chest Press", "Chest", "Cable", ["Chest"], ["Shoulders", "Triceps"]],
    ["Low-to-High Cable Fly", "Chest", "Cable", ["Chest"], ["Shoulders"]],
    ["High-to-Low Cable Fly", "Chest", "Cable", ["Chest"], ["Shoulders"]],
    ["Single-Arm Cable Fly", "Chest", "Cable", ["Chest"], ["Shoulders"]],
    ["Dumbbell Fly", "Chest", "Dumbbells", ["Chest"], ["Shoulders"]],
    ["Incline Dumbbell Fly", "Chest", "Dumbbells", ["Chest"], ["Shoulders"]],
    ["Decline Dumbbell Fly", "Chest", "Dumbbells", ["Chest"], ["Shoulders"]],
    ["Svend Press", "Chest", "Plate", ["Chest"], ["Shoulders", "Triceps"]],
    ["Medicine Ball Push-Up", "Chest", "Bodyweight / medicine ball", ["Chest"], ["Shoulders", "Triceps"]],
    ["Incline Push-Up", "Chest", "Bodyweight", ["Chest"], ["Shoulders", "Triceps"]],

    ["Wide-Grip Lat Pulldown", "Back", "Cable / machine", ["Back"], ["Biceps"]],
    ["Underhand Lat Pulldown", "Back", "Cable / machine", ["Back"], ["Biceps"]],
    ["Neutral-Grip Lat Pulldown", "Back", "Cable / machine", ["Back"], ["Biceps"]],
    ["Single-Arm Lat Pulldown", "Back", "Cable", ["Back"], ["Biceps"]],
    ["Kneeling Single-Arm Lat Pulldown", "Back", "Cable", ["Back"], ["Biceps"]],
    ["Half-Kneeling Lat Pulldown", "Back", "Cable", ["Back"], ["Biceps"]],
    ["Machine High Row", "Back", "Machine", ["Back"], ["Biceps", "Shoulders"]],
    ["Plate-Loaded High Row", "Back", "Plate loaded machine", ["Back"], ["Biceps", "Shoulders"]],
    ["Iso-Lateral Row Machine", "Back", "Machine", ["Back"], ["Biceps", "Shoulders"]],
    ["Single-Arm Seated Cable Row", "Back", "Cable", ["Back"], ["Biceps", "Shoulders"]],
    ["Wide-Grip Seated Cable Row", "Back", "Cable", ["Back"], ["Biceps", "Shoulders"]],
    ["Close-Grip Seated Cable Row", "Back", "Cable", ["Back"], ["Biceps"]],
    ["Meadows Row", "Back", "Barbell / landmine", ["Back"], ["Biceps", "Core"]],
    ["Pendlay Row", "Back", "Barbell", ["Back"], ["Biceps", "Core"]],
    ["Seal Row", "Back", "Barbell", ["Back"], ["Biceps"]],
    ["Dumbbell Pullover", "Back", "Dumbbell", ["Back"], ["Chest", "Triceps"]],
    ["Cable Pullover", "Back", "Cable", ["Back"], ["Triceps"]],
    ["Inverted Row", "Back", "Bodyweight", ["Back"], ["Biceps", "Core"]],
    ["TRX Row", "Back", "Bodyweight / suspension trainer", ["Back"], ["Biceps", "Core"]],
    ["Rack Pull", "Back", "Barbell", ["Back", "Hamstrings"], ["Glutes", "Core"]],
    ["Snatch-Grip Deadlift", "Back", "Barbell", ["Back", "Hamstrings"], ["Glutes", "Core"]],
    ["Landmine Row", "Back", "Barbell / landmine", ["Back"], ["Biceps", "Core"]],
    ["Chest-Supported Dumbbell Row", "Back", "Dumbbells", ["Back"], ["Biceps", "Shoulders"]],
    ["Machine Pullover", "Back", "Machine", ["Back"], ["Triceps"]],
    ["Scapular Pull-Up", "Back", "Bodyweight", ["Back"], ["Shoulders"]],

    ["Barbell Overhead Press", "Shoulders", "Barbell", ["Shoulders"], ["Triceps"]],
    ["Seated Barbell Shoulder Press", "Shoulders", "Barbell", ["Shoulders"], ["Triceps"]],
    ["Standing Dumbbell Shoulder Press", "Shoulders", "Dumbbells", ["Shoulders"], ["Triceps"]],
    ["Seated Dumbbell Shoulder Press", "Shoulders", "Dumbbells", ["Shoulders"], ["Triceps"]],
    ["Single-Arm Dumbbell Shoulder Press", "Shoulders", "Dumbbell", ["Shoulders"], ["Triceps", "Core"]],
    ["Landmine Press", "Shoulders", "Barbell / landmine", ["Shoulders"], ["Chest", "Triceps"]],
    ["Half-Kneeling Landmine Press", "Shoulders", "Barbell / landmine", ["Shoulders"], ["Chest", "Triceps", "Core"]],
    ["Single-Arm Cable Shoulder Press", "Shoulders", "Cable", ["Shoulders"], ["Triceps"]],
    ["Cable Front Raise", "Shoulders", "Cable", ["Shoulders"], []],
    ["Plate Front Raise", "Shoulders", "Plate", ["Shoulders"], []],
    ["Lean-Away Cable Lateral Raise", "Shoulders", "Cable", ["Shoulders"], []],
    ["Machine Lateral Raise", "Shoulders", "Machine", ["Shoulders"], []],
    ["Seated Dumbbell Lateral Raise", "Shoulders", "Dumbbells", ["Shoulders"], []],
    ["Incline Dumbbell Lateral Raise", "Shoulders", "Dumbbells", ["Shoulders"], []],
    ["Y-Raise", "Shoulders", "Dumbbells", ["Shoulders"], ["Back"]],
    ["Cable Y-Raise", "Shoulders", "Cable", ["Shoulders"], ["Back"]],
    ["Prone Y-Raise", "Shoulders", "Dumbbells", ["Shoulders"], ["Back"]],
    ["Reverse Cable Fly", "Shoulders", "Cable", ["Shoulders"], ["Back"]],
    ["Cable Rear Delt Fly", "Shoulders", "Cable", ["Shoulders"], ["Back"]],
    ["Chest-Supported Rear Delt Raise", "Shoulders", "Dumbbells", ["Shoulders"], ["Back"]],
    ["Barbell Shrug", "Shoulders", "Barbell", ["Shoulders", "Back"], []],
    ["Smith Machine Shrug", "Shoulders", "Smith machine", ["Shoulders", "Back"], []],

    ["Incline Dumbbell Curl", "Arms", "Dumbbells", ["Biceps"], []],
    ["Spider Curl", "Arms", "Dumbbells / EZ-bar", ["Biceps"], []],
    ["Bayesian Cable Curl", "Arms", "Cable", ["Biceps"], []],
    ["Rope Hammer Curl", "Arms", "Cable", ["Biceps"], []],
    ["Cross-Body Hammer Curl", "Arms", "Dumbbells", ["Biceps"], []],
    ["Zottman Curl", "Arms", "Dumbbells", ["Biceps"], []],
    ["Reverse Curl", "Arms", "Barbell / EZ-bar", ["Biceps"], []],
    ["Barbell Curl", "Arms", "Barbell", ["Biceps"], []],
    ["Wide-Grip Barbell Curl", "Arms", "Barbell", ["Biceps"], []],
    ["Close-Grip Barbell Curl", "Arms", "Barbell", ["Biceps"], []],
    ["Drag Curl", "Arms", "Barbell", ["Biceps"], []],
    ["Machine Curl", "Arms", "Machine", ["Biceps"], []],
    ["Single-Arm Cable Curl", "Arms", "Cable", ["Biceps"], []],
    ["High Cable Curl", "Arms", "Cable", ["Biceps"], []],
    ["Behind-the-Body Cable Curl", "Arms", "Cable", ["Biceps"], []],
    ["Waiter Curl", "Arms", "Dumbbell", ["Biceps"], []],
    ["Dumbbell Preacher Curl", "Arms", "Dumbbell", ["Biceps"], []],
    ["Cable Preacher Curl", "Arms", "Cable", ["Biceps"], []],
    ["Single-Arm Preacher Curl", "Arms", "Dumbbell / cable", ["Biceps"], []],
    ["JM Press", "Arms", "Barbell", ["Triceps"], ["Chest", "Shoulders"]],
    ["Close-Grip Push-Up", "Arms", "Bodyweight", ["Triceps", "Chest"], ["Shoulders"]],
    ["Diamond Push-Up", "Arms", "Bodyweight", ["Triceps", "Chest"], ["Shoulders"]],
    ["Bench Dip", "Arms", "Bodyweight", ["Triceps"], ["Chest", "Shoulders"]],
    ["Cable Skull Crusher", "Arms", "Cable", ["Triceps"], []],
    ["Lying Dumbbell Triceps Extension", "Arms", "Dumbbells", ["Triceps"], []],
    ["Single-Arm Cable Triceps Extension", "Arms", "Cable", ["Triceps"], []],
    ["Cross-Body Cable Triceps Extension", "Arms", "Cable", ["Triceps"], []],
    ["Rope Overhead Triceps Extension", "Arms", "Cable", ["Triceps"], []],
    ["Machine Triceps Extension", "Arms", "Machine", ["Triceps"], []],
    ["Dumbbell Tate Press", "Arms", "Dumbbells", ["Triceps"], ["Chest"]],

    ["Safety Bar Squat", "Legs", "Barbell / safety squat bar", ["Legs", "Glutes"], ["Hamstrings", "Core"]],
    ["Zercher Squat", "Legs", "Barbell", ["Legs", "Glutes"], ["Core"]],
    ["Box Squat", "Legs", "Barbell", ["Legs", "Glutes"], ["Hamstrings", "Core"]],
    ["Pause Squat", "Legs", "Barbell", ["Legs", "Glutes"], ["Core"]],
    ["Tempo Squat", "Legs", "Barbell", ["Legs", "Glutes"], ["Core"]],
    ["Belt Squat", "Legs", "Machine / belt squat", ["Legs", "Glutes"], ["Hamstrings"]],
    ["Pendulum Squat", "Legs", "Machine", ["Legs", "Glutes"], ["Hamstrings"]],
    ["V-Squat", "Legs", "Machine", ["Legs", "Glutes"], ["Hamstrings"]],
    ["Sissy Squat", "Legs", "Bodyweight / machine", ["Legs"], []],
    ["Dumbbell Squat", "Legs", "Dumbbells", ["Legs", "Glutes"], ["Hamstrings", "Core"]],
    ["Split Squat", "Legs", "Dumbbells / bodyweight", ["Legs", "Glutes"], ["Hamstrings", "Core"]],
    ["Front-Foot Elevated Split Squat", "Legs", "Dumbbells / bodyweight", ["Legs", "Glutes"], ["Hamstrings"]],
    ["Rear-Foot Elevated Split Squat", "Legs", "Dumbbells / bodyweight", ["Legs", "Glutes"], ["Hamstrings", "Core"]],
    ["Curtsy Lunge", "Legs", "Dumbbells / bodyweight", ["Legs", "Glutes"], ["Hamstrings"]],
    ["Forward Lunge", "Legs", "Dumbbells / bodyweight", ["Legs", "Glutes"], ["Hamstrings", "Core"]],
    ["Lateral Lunge", "Legs", "Dumbbells / bodyweight", ["Legs", "Glutes"], ["Hamstrings"]],
    ["Deficit Reverse Lunge", "Legs", "Dumbbells", ["Legs", "Glutes"], ["Hamstrings", "Core"]],
    ["Smith Machine Lunge", "Legs", "Smith machine", ["Legs", "Glutes"], ["Hamstrings"]],
    ["Walking Barbell Lunge", "Legs", "Barbell", ["Legs", "Glutes"], ["Hamstrings", "Core"]],
    ["Leg Press Calf Raise", "Legs", "Machine", ["Calves"], []],
    ["Standing Calf Raise", "Legs", "Machine / bodyweight", ["Calves"], []],
    ["Donkey Calf Raise", "Legs", "Machine / bodyweight", ["Calves"], []],
    ["Single-Leg Calf Raise", "Legs", "Bodyweight / dumbbell", ["Calves"], []],
    ["Tibialis Raise", "Legs", "Bodyweight / tibialis machine", ["Calves"], []],
    ["Nordic Hamstring Curl", "Legs", "Bodyweight", ["Hamstrings"], ["Glutes"]],
    ["Glute-Ham Raise", "Legs", "Machine / bodyweight", ["Hamstrings", "Glutes"], ["Calves"]],
    ["Standing Leg Curl", "Legs", "Machine", ["Hamstrings"], ["Calves"]],
    ["Single-Leg Seated Leg Curl", "Legs", "Machine", ["Hamstrings"], ["Calves"]],
    ["Single-Leg Lying Leg Curl", "Legs", "Machine", ["Hamstrings"], ["Calves"]],
    ["Cable Leg Curl", "Legs", "Cable", ["Hamstrings"], ["Calves"]],
    ["Dumbbell Step-Up", "Legs", "Dumbbells", ["Legs", "Glutes"], ["Hamstrings"]],
    ["Barbell Step-Up", "Legs", "Barbell", ["Legs", "Glutes"], ["Hamstrings", "Core"]],

    ["Single-Leg Hip Thrust", "Glutes", "Bodyweight / dumbbell", ["Glutes"], ["Hamstrings", "Core"]],
    ["Dumbbell Hip Thrust", "Glutes", "Dumbbell", ["Glutes"], ["Hamstrings"]],
    ["Banded Hip Thrust", "Glutes", "Resistance band", ["Glutes"], ["Hamstrings"]],
    ["Frog Pump", "Glutes", "Bodyweight / dumbbell", ["Glutes"], ["Hamstrings"]],
    ["Single-Leg Glute Bridge", "Glutes", "Bodyweight", ["Glutes"], ["Hamstrings", "Core"]],
    ["Banded Glute Bridge", "Glutes", "Resistance band", ["Glutes"], ["Hamstrings"]],
    ["Cable Pull-Through", "Glutes", "Cable", ["Glutes", "Hamstrings"], ["Back", "Core"]],
    ["Kettlebell Swing", "Glutes", "Kettlebell", ["Glutes", "Hamstrings"], ["Back", "Core"]],
    ["Reverse Hyperextension", "Glutes", "Machine / bodyweight", ["Glutes", "Hamstrings"], ["Back"]],
    ["45-Degree Hip Extension", "Glutes", "Bodyweight / machine", ["Glutes", "Hamstrings"], ["Back"]],
    ["Kneeling Cable Kickback", "Glutes", "Cable", ["Glutes"], ["Hamstrings"]],
    ["Standing Hip Abduction", "Glutes", "Cable / resistance band", ["Glutes"], []],

    ["Plank", "Core", "Bodyweight", ["Core"], ["Shoulders", "Glutes"]],
    ["Side Plank", "Core", "Bodyweight", ["Core"], ["Shoulders", "Glutes"]],
    ["RKC Plank", "Core", "Bodyweight", ["Core"], ["Shoulders", "Glutes"]],
    ["Long-Lever Plank", "Core", "Bodyweight", ["Core"], ["Shoulders"]],
    ["Hollow Body Hold", "Core", "Bodyweight", ["Core"], []],
    ["Hollow Rock", "Core", "Bodyweight", ["Core"], []],
    ["Bicycle Crunch", "Core", "Bodyweight", ["Core"], []],
    ["Reverse Crunch", "Core", "Bodyweight", ["Core"], []],
    ["V-Up", "Core", "Bodyweight", ["Core"], []],
    ["Toe Touch", "Core", "Bodyweight", ["Core"], []],
    ["Flutter Kick", "Core", "Bodyweight", ["Core"], []],
    ["Mountain Climber", "Core", "Bodyweight", ["Core"], ["Shoulders"]],
    ["Hanging Leg Raise", "Core", "Bodyweight", ["Core"], []],
    ["Lying Leg Raise", "Core", "Bodyweight", ["Core"], []],
    ["Decline Sit-Up", "Core", "Bodyweight / bench", ["Core"], []],
    ["Stability Ball Crunch", "Core", "Stability ball", ["Core"], []],
    ["Kneeling Pallof Press", "Core", "Cable", ["Core"], ["Shoulders"]],
    ["Cable Wood Chop", "Core", "Cable", ["Core"], ["Shoulders"]],
    ["Reverse Cable Wood Chop", "Core", "Cable", ["Core"], ["Shoulders"]]
  ];

  const exerciseIdFor = name => `exercise-${String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`;

  function installExerciseExpansion() {
    try {
      if (typeof exerciseCatalog === 'undefined' || !Array.isArray(exerciseCatalog)) return;

      const existingNames = new Set(exerciseCatalog.map(exercise => String(exercise?.name || '').toLowerCase()));
      const existingIds = new Set(exerciseCatalog.map(exercise => String(exercise?.id || '')));

      for (const [name, category, equipment, primary, assists] of additionalExercises) {
        if (exerciseCatalog.length >= TARGET_EXERCISE_COUNT) break;

        const normalizedName = name.toLowerCase();
        const id = exerciseIdFor(name);
        if (existingNames.has(normalizedName) || existingIds.has(id)) continue;

        exerciseCatalog.push({
          id,
          name,
          category,
          equipment,
          primary: [...primary],
          assists: [...assists]
        });
        existingNames.add(normalizedName);
        existingIds.add(id);
      }

      globalThis.LEVEL_UP_EXERCISE_COUNT = exerciseCatalog.length;

      const builderIntro = document.querySelector('.builder-intro');
      if (builderIntro) {
        builderIntro.textContent = `Choose from ${exerciseCatalog.length} exercises across machines, free weights, cables, and bodyweight movements.`;
      }

      const builderSearch = document.getElementById('exerciseSearch');
      if (builderSearch) builderSearch.placeholder = `Search ${exerciseCatalog.length} exercises...`;

      const libraryIntro = document.querySelector('.exercise-library-intro');
      if (libraryIntro) {
        libraryIntro.textContent = `Browse ${exerciseCatalog.length} exercises, see what they train, and add them to a workout.`;
      }

      const librarySearch = document.getElementById('exerciseLibrarySearch');
      if (librarySearch) librarySearch.placeholder = `Search ${exerciseCatalog.length} exercises...`;

      if (document.getElementById('builder')?.classList.contains('hidden') === false
        && typeof renderBuilderCatalog === 'function') {
        renderBuilderCatalog();
      }
    } catch (error) {
      console.warn('Level Up exercise catalog expansion could not load.', error);
    }
  }

  installExerciseExpansion();
})();
