(() => {
  const accessoryKeys = new Set(['lateral', 'rearDelt', 'biceps', 'triceps', 'calf', 'core', 'quad']);

  const candidates = {
    chest: {
      planet: ['Chest Press', 'Incline Chest Press Machine', 'Dumbbell Bench Press', 'Push-Up'],
      full: ['Barbell Bench Press', 'Dumbbell Bench Press', 'Chest Press', 'Push-Up'],
      home: ['Dumbbell Bench Press', 'Push-Up', 'Incline Dumbbell Press'],
      minimal: ['Push-Up']
    },
    inclineChest: {
      planet: ['Incline Chest Press Machine', 'Incline Dumbbell Press', 'Chest Press'],
      full: ['Incline Dumbbell Press', 'Incline Barbell Bench Press', 'Chest Press'],
      home: ['Incline Dumbbell Press', 'Push-Up'],
      minimal: ['Push-Up']
    },
    pull: {
      planet: ['Lat Pulldown', 'Close-Grip Lat Pulldown', 'Assisted Pull-Up'],
      full: ['Lat Pulldown', 'Pull-Up', 'Assisted Pull-Up'],
      home: ['Single-Arm Dumbbell Row', 'Dumbbell Row'],
      minimal: ['Back Extension']
    },
    row: {
      planet: ['Seated Row', 'Seated Cable Row', 'Chest-Supported Row'],
      full: ['Seated Row', 'Barbell Row', 'Single-Arm Dumbbell Row'],
      home: ['Single-Arm Dumbbell Row', 'Dumbbell Row', 'Chest-Supported Row'],
      minimal: ['Back Extension']
    },
    shoulder: {
      planet: ['Shoulder Press', 'Machine Shoulder Press', 'Dumbbell Shoulder Press'],
      full: ['Dumbbell Shoulder Press', 'Shoulder Press', 'Arnold Press'],
      home: ['Dumbbell Shoulder Press', 'Arnold Press'],
      minimal: ['Push-Up']
    },
    lateral: {
      planet: ['Lateral Raise', 'Cable Lateral Raise'],
      full: ['Lateral Raise', 'Cable Lateral Raise'],
      home: ['Lateral Raise'],
      minimal: []
    },
    rearDelt: {
      planet: ['Reverse Pec Deck', 'Face Pull', 'Rear Delt Fly'],
      full: ['Rear Delt Fly', 'Face Pull', 'Reverse Pec Deck'],
      home: ['Rear Delt Fly'],
      minimal: []
    },
    squat: {
      planet: ['Leg Press', 'Goblet Squat', 'Smith Machine Squat'],
      full: ['Goblet Squat', 'Barbell Back Squat', 'Leg Press'],
      home: ['Goblet Squat', 'Reverse Lunge', 'Walking Lunge'],
      minimal: ['Reverse Lunge', 'Walking Lunge']
    },
    hinge: {
      planet: ['Dumbbell Romanian Deadlift', 'Romanian Deadlift', 'Glute Bridge'],
      full: ['Romanian Deadlift', 'Dumbbell Romanian Deadlift', 'Hip Thrust'],
      home: ['Dumbbell Romanian Deadlift', 'Glute Bridge'],
      minimal: ['Glute Bridge']
    },
    quad: {
      planet: ['Leg Extension', 'Single-Leg Press', 'Leg Press'],
      full: ['Leg Extension', 'Bulgarian Split Squat', 'Step-Up'],
      home: ['Bulgarian Split Squat', 'Step-Up', 'Reverse Lunge'],
      minimal: ['Reverse Lunge', 'Step-Up']
    },
    hamstring: {
      planet: ['Seated Leg Curl', 'Lying Leg Curl', 'Dumbbell Romanian Deadlift'],
      full: ['Seated Leg Curl', 'Romanian Deadlift', 'Dumbbell Romanian Deadlift'],
      home: ['Dumbbell Romanian Deadlift', 'Glute Bridge'],
      minimal: ['Glute Bridge']
    },
    glute: {
      planet: ['Glute Drive Machine', 'Smith Machine Hip Thrust', 'Hip Abductor Machine'],
      full: ['Hip Thrust', 'Glute Bridge', 'Cable Kickback'],
      home: ['Glute Bridge', 'Hip Thrust'],
      minimal: ['Glute Bridge']
    },
    lunge: {
      planet: ['Reverse Lunge', 'Walking Lunge', 'Step-Up'],
      full: ['Bulgarian Split Squat', 'Walking Lunge', 'Reverse Lunge'],
      home: ['Reverse Lunge', 'Walking Lunge', 'Step-Up'],
      minimal: ['Reverse Lunge', 'Walking Lunge', 'Step-Up']
    },
    calf: {
      planet: ['Calf Raise', 'Seated Calf Raise'],
      full: ['Calf Raise', 'Seated Calf Raise'],
      home: ['Calf Raise'],
      minimal: ['Calf Raise']
    },
    biceps: {
      planet: ['Biceps Curl', 'Cable Curl', 'Dumbbell Curl'],
      full: ['Dumbbell Curl', 'Cable Curl', 'Hammer Curl'],
      home: ['Dumbbell Curl', 'Hammer Curl'],
      minimal: []
    },
    triceps: {
      planet: ['Triceps Pushdown', 'Rope Triceps Pushdown', 'Overhead Cable Triceps Extension'],
      full: ['Triceps Pushdown', 'Dumbbell Triceps Extension', 'Dip'],
      home: ['Dumbbell Triceps Extension', 'Push-Up'],
      minimal: ['Push-Up']
    },
    core: {
      planet: ['Ab Crunch Machine', 'Cable Crunch', 'Dead Bug'],
      full: ['Dead Bug', 'Cable Crunch', 'Hanging Knee Raise'],
      home: ['Dead Bug', 'Sit-Up', 'Russian Twist'],
      minimal: ['Dead Bug', 'Sit-Up', 'Russian Twist']
    }
  };

  const splitKeys = {
    'Full Body A': ['squat', 'chest', 'row', 'hinge', 'shoulder', 'core', 'biceps'],
    'Full Body B': ['lunge', 'inclineChest', 'pull', 'hamstring', 'lateral', 'core', 'triceps'],
    'Full Body C': ['quad', 'chest', 'row', 'glute', 'rearDelt', 'core', 'biceps'],
    'Upper Body A': ['chest', 'pull', 'row', 'shoulder', 'lateral', 'biceps', 'triceps'],
    'Lower Body A': ['squat', 'hamstring', 'quad', 'glute', 'calf', 'core'],
    'Upper Body B': ['inclineChest', 'row', 'pull', 'lateral', 'rearDelt', 'biceps', 'triceps'],
    'Lower Body B': ['quad', 'hinge', 'lunge', 'hamstring', 'calf', 'core'],
    Push: ['chest', 'inclineChest', 'shoulder', 'lateral', 'triceps', 'core'],
    Pull: ['pull', 'row', 'rearDelt', 'biceps', 'hinge', 'core'],
    Legs: ['squat', 'hinge', 'quad', 'hamstring', 'glute', 'calf', 'core'],
    'Upper Body': ['chest', 'row', 'pull', 'shoulder', 'biceps', 'triceps', 'core'],
    'Lower Body': ['squat', 'hinge', 'quad', 'hamstring', 'glute', 'calf', 'core'],
    'Push A': ['chest', 'shoulder', 'inclineChest', 'lateral', 'triceps', 'core'],
    'Pull A': ['pull', 'row', 'rearDelt', 'biceps', 'core'],
    'Legs A': ['squat', 'hamstring', 'quad', 'calf', 'core'],
    'Push B': ['inclineChest', 'shoulder', 'chest', 'lateral', 'triceps', 'core'],
    'Pull B': ['row', 'pull', 'rearDelt', 'biceps', 'core'],
    'Legs B': ['hinge', 'lunge', 'quad', 'glute', 'calf', 'core'],
    'Recovery & Core': ['core', 'rearDelt', 'calf', 'glute']
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function catalogItem(name) {
    try {
      if (typeof exerciseCatalog !== 'undefined' && Array.isArray(exerciseCatalog)) {
        return exerciseCatalog.find(item => item?.name === name) || null;
      }
    } catch {}
    return null;
  }

  function fallbackKeys(location) {
    if (location === 'minimal') return ['chest', 'squat', 'lunge', 'hinge', 'core', 'calf'];
    if (location === 'home') return ['chest', 'row', 'squat', 'hinge', 'shoulder', 'core', 'biceps', 'triceps'];
    return ['chest', 'pull', 'row', 'squat', 'hinge', 'shoulder', 'core', 'biceps', 'triceps', 'calf'];
  }

  function goalRanges(goal) {
    if (goal === 'strength') return { main: [6, 10], accessory: [8, 12] };
    if (goal === 'endurance') return { main: [12, 15], accessory: [12, 20] };
    return { main: [8, 12], accessory: [10, 15] };
  }

  function exerciseCount(duration, experience, light) {
    if (light) return Math.min(4, ({ 30: 3, 45: 4, 60: 4, 75: 4 })[duration] || 4);
    let count = ({ 30: 4, 45: 5, 60: 6, 75: 7 })[duration] || 6;
    if (experience === 'new') count = Math.min(count, 5);
    return count;
  }

  function setCount(experience, role, light) {
    if (light || experience === 'new') return 2;
    if (experience === 'intermediate') return 3;
    return role === 'main' ? 3 : 2;
  }

  function previewSettings(overlay) {
    const summary = (overlay.querySelector('.weekly-preview-summary p')?.textContent || '').toLowerCase();
    const timing = overlay.querySelector('.weekly-preview-summary strong')?.textContent || '';
    const durationMatch = timing.match(/(30|45|60|75)\+?\s*min/i);

    let location = 'full';
    if (summary.includes('machine-focused') || summary.includes('planet fitness')) location = 'planet';
    else if (summary.includes('home gym')) location = 'home';
    else if (summary.includes('minimal')) location = 'minimal';

    let goal = 'muscle';
    if (summary.includes('get stronger')) goal = 'strength';
    else if (summary.includes('general fitness')) goal = 'fitness';
    else if (summary.includes('improve endurance')) goal = 'endurance';

    let experience = 'beginner';
    if (summary.includes('brand new')) experience = 'new';
    else if (summary.includes('intermediate')) experience = 'intermediate';

    return {
      location,
      goal,
      experience,
      duration: Number(durationMatch?.[1]) || 60
    };
  }

  function buildExercisePreview(planName, settings) {
    const light = planName === 'Recovery & Core';
    const target = exerciseCount(settings.duration, settings.experience, light);
    const keys = [
      ...(splitKeys[planName] || splitKeys['Full Body A']),
      ...(light ? [] : fallbackKeys(settings.location))
    ];
    const ranges = goalRanges(settings.goal);
    const used = new Set();
    const exercises = [];

    for (const key of keys) {
      const names = candidates[key]?.[settings.location] || [];
      let chosen = null;
      for (const name of names) {
        const found = catalogItem(name);
        if (found) {
          chosen = found;
          break;
        }
      }
      if (!chosen && names.length) chosen = { name: names[0], equipment: '' };
      if (!chosen || used.has(chosen.name)) continue;

      const index = exercises.length;
      const role = accessoryKeys.has(key) || index >= 4 ? 'accessory' : 'main';
      const reps = light ? [10, 15] : ranges[role];
      exercises.push({
        name: chosen.name,
        equipment: chosen.equipment || '',
        sets: setCount(settings.experience, role, light),
        reps
      });
      used.add(chosen.name);
      if (exercises.length >= target) break;
    }

    return exercises;
  }

  function enhanceWorkoutPreview(overlay) {
    const preview = overlay.querySelector('.weekly-preview-summary');
    if (!preview) return;
    const settings = previewSettings(overlay);

    overlay.querySelectorAll('.weekly-preview-day.workout').forEach(card => {
      if (card.dataset.exercisePreviewReady === 'true') return;
      const planName = card.querySelector('strong')?.textContent?.trim() || '';
      if (!planName) return;

      const exercises = buildExercisePreview(planName, settings);
      if (!exercises.length) return;

      card.dataset.exercisePreviewReady = 'true';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'weekly-preview-view-exercises';
      button.textContent = 'View exercises';
      button.setAttribute('aria-expanded', 'false');

      const panel = document.createElement('div');
      panel.className = 'weekly-preview-exercise-panel hidden';
      panel.innerHTML = `<div class="weekly-preview-exercise-heading"><span>EXERCISES</span><small>${exercises.length} movements</small></div>
        <ol>${exercises.map((exercise, index) => `<li>
          <span class="weekly-preview-exercise-number">${index + 1}</span>
          <span class="weekly-preview-exercise-copy"><b>${escapeHtml(exercise.name)}</b>${exercise.equipment ? `<small>${escapeHtml(exercise.equipment)}</small>` : ''}</span>
          <strong>${exercise.sets} x ${exercise.reps[0]}-${exercise.reps[1]}</strong>
        </li>`).join('')}</ol>`;

      button.onclick = () => {
        const open = panel.classList.toggle('hidden') === false;
        button.textContent = open ? 'Hide exercises' : 'View exercises';
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
      };

      card.appendChild(button);
      card.appendChild(panel);
    });
  }

  function updateWeeklyPlanLabels() {
    const overlay = document.getElementById('weeklyPlanWizard');
    if (overlay) {
      const title = overlay.querySelector('#weeklyWizardTitle');
      if (title?.textContent?.trim() === 'Where do you usually train?') {
        title.textContent = 'What type of gym setup do you use?';
      }

      const intro = title?.nextElementSibling;
      if (intro?.tagName === 'P' && intro.textContent.includes('equipment you are likely to have access to')) {
        intro.textContent = 'Choose based on the equipment you actually have access to, not the name of your gym.';
      }

      const machineFocused = overlay.querySelector('[data-weekly-choice="planet"]');
      if (machineFocused) {
        const heading = machineFocused.querySelector('b');
        const detail = machineFocused.querySelector('small');
        if (heading) heading.textContent = 'Machine-focused gym';
        if (detail) detail.textContent = 'Mostly machines, cables, Smith machines and dumbbells';
      }

      const freeWeight = overlay.querySelector('[data-weekly-choice="full"]');
      if (freeWeight) {
        const heading = freeWeight.querySelector('b');
        const detail = freeWeight.querySelector('small');
        if (heading) heading.textContent = 'Free weight';
        if (detail) detail.textContent = 'Machines plus barbells, squat racks, benches and free weights';
      }

      const home = overlay.querySelector('[data-weekly-choice="home"]');
      if (home) {
        const heading = home.querySelector('b');
        const detail = home.querySelector('small');
        if (heading) heading.textContent = 'Home gym';
        if (detail) detail.textContent = 'Dumbbells and whatever strength equipment you have at home';
      }

      const minimal = overlay.querySelector('[data-weekly-choice="minimal"]');
      if (minimal) {
        const heading = minimal.querySelector('b');
        const detail = minimal.querySelector('small');
        if (heading) heading.textContent = 'Minimal equipment / bodyweight';
        if (detail) detail.textContent = 'Mostly bodyweight and simple equipment';
      }

      const longWorkout = overlay.querySelector('[data-weekly-choice="75"]');
      if (longWorkout) {
        const heading = longWorkout.querySelector('b');
        const detail = longWorkout.querySelector('small');
        if (heading) heading.textContent = '75+ minutes';
        if (detail) detail.textContent = 'Longer session with more exercises and accessories';
      }

      const previewCopy = overlay.querySelector('.weekly-preview-summary p');
      if (previewCopy) {
        previewCopy.textContent = previewCopy.textContent
          .replace(/Planet Fitness/g, 'Machine-focused gym')
          .replace(/Full gym/g, 'Free weight')
          .replace(/Full free-weight gym/g, 'Free weight')
          .replace(/Home gym \/ dumbbells/g, 'Home gym');
      }

      const previewTiming = overlay.querySelector('.weekly-preview-summary strong');
      if (previewTiming) {
        previewTiming.textContent = previewTiming.textContent
          .replace(/about 75 min each/gi, '75+ min each')
          .replace(/75 min each/gi, '75+ min each');
      }

      enhanceWorkoutPreview(overlay);
    }

    const planSection = document.getElementById('accountProgramLibrary');
    const planIntro = planSection?.querySelector('.program-intro');
    if (planIntro) {
      planIntro.textContent = planIntro.textContent
        .replace(/Planet Fitness/g, 'Machine-focused gym')
        .replace(/Full gym/g, 'Free weight')
        .replace(/Full free-weight gym/g, 'Free weight')
        .replace(/Home gym \/ dumbbells/g, 'Home gym');
    }

    const planToolbar = planSection?.querySelector('.weekly-plan-toolbar strong');
    if (planToolbar) {
      planToolbar.textContent = planToolbar.textContent
        .replace(/about 75 min\/workout/gi, '75+ min/workout')
        .replace(/75 min\/workout/gi, '75+ min/workout');
    }
  }

  function addStyles() {
    if (document.getElementById('weeklyPreviewExerciseStyles')) return;
    const style = document.createElement('style');
    style.id = 'weeklyPreviewExerciseStyles';
    style.textContent = `
      .weekly-preview-day.workout { grid-template-columns: 48px minmax(0, 1fr) auto; }
      .weekly-preview-view-exercises {
        align-self: center;
        min-height: 34px;
        padding: 0 11px;
        color: #f5f7f8;
        border: 1px solid rgba(255, 77, 87, .34);
        border-radius: 10px;
        background: #171b1f;
        font-size: 11px;
        font-weight: 850;
        white-space: nowrap;
      }
      .weekly-preview-view-exercises:hover,
      .weekly-preview-view-exercises:focus-visible { border-color: #ff4d57; outline: none; }
      .weekly-preview-exercise-panel {
        grid-column: 1 / -1;
        width: 100%;
        margin-top: 2px;
        padding-top: 12px;
        border-top: 1px solid #292e33;
      }
      .weekly-preview-exercise-panel.hidden { display: none !important; }
      .weekly-preview-exercise-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 8px;
      }
      .weekly-preview-exercise-heading span { color: #ff4d57; font-size: 10px; font-weight: 900; letter-spacing: 1.2px; }
      .weekly-preview-exercise-heading small { color: #747d84; font-size: 10px; }
      .weekly-preview-exercise-panel ol { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
      .weekly-preview-exercise-panel li {
        display: grid;
        grid-template-columns: 26px minmax(0, 1fr) auto;
        align-items: center;
        gap: 9px;
        padding: 9px 10px;
        border: 1px solid #252a2f;
        border-radius: 12px;
        background: #111417;
      }
      .weekly-preview-exercise-number {
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        color: #ff4d57;
        background: #221316;
        font-size: 10px;
        font-weight: 900;
      }
      .weekly-preview-exercise-copy b { display: block; font-size: 12px; }
      .weekly-preview-exercise-copy small { display: block; margin-top: 2px; color: #747d84; font-size: 9px; }
      .weekly-preview-exercise-panel li > strong { color: #f0c3c7; font-size: 11px; white-space: nowrap; }
      @media (max-width: 430px) {
        .weekly-preview-day.workout { grid-template-columns: 44px minmax(0, 1fr); }
        .weekly-preview-view-exercises { grid-column: 2; justify-self: start; margin-top: 2px; }
        .weekly-preview-exercise-panel { grid-column: 1 / -1; }
      }
    `;
    document.head.appendChild(style);
  }

  function start() {
    addStyles();
    updateWeeklyPlanLabels();
    const observer = new MutationObserver(() => requestAnimationFrame(updateWeeklyPlanLabels));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
