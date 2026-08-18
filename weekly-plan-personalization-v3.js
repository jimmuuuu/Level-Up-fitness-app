(() => {
  const AUTO = 'custom-auto-weekly-';
  const CONFIG = 'levelUpFitnessWeeklyPlan:';
  const APPLIED = 'levelUpFitnessWeeklyPersonalizationV3:';
  const VERSION = 3;

  const candidates = {
    chest: {
      planet: ['Chest Press', 'Dumbbell Bench Press', 'Push-Up'],
      full: ['Barbell Bench Press', 'Dumbbell Bench Press', 'Chest Press'],
      home: ['Dumbbell Bench Press', 'Push-Up', 'Incline Dumbbell Press'],
      minimal: ['Push-Up']
    },
    incline: {
      planet: ['Incline Chest Press Machine', 'Incline Dumbbell Press', 'Chest Press'],
      full: ['Incline Barbell Bench Press', 'Incline Dumbbell Press', 'Chest Press'],
      home: ['Incline Dumbbell Press', 'Push-Up'],
      minimal: ['Push-Up']
    },
    chestIso: {
      planet: ['Pec Deck', 'Cable Chest Fly', 'Push-Up'],
      full: ['Cable Chest Fly', 'Pec Deck', 'Push-Up'],
      home: ['Push-Up'],
      minimal: ['Push-Up']
    },
    pull: {
      planet: ['Lat Pulldown', 'Close-Grip Lat Pulldown', 'Assisted Pull-Up'],
      full: ['Pull-Up', 'Lat Pulldown', 'Assisted Pull-Up'],
      home: ['Single-Arm Dumbbell Row', 'Dumbbell Row'],
      minimal: ['Back Extension']
    },
    row: {
      planet: ['Seated Row', 'Chest-Supported Row', 'Seated Cable Row'],
      full: ['Barbell Row', 'Seated Row', 'Single-Arm Dumbbell Row'],
      home: ['Single-Arm Dumbbell Row', 'Dumbbell Row', 'Chest-Supported Row'],
      minimal: ['Back Extension']
    },
    row2: {
      planet: ['Chest-Supported Row', 'Seated Cable Row', 'Seated Row'],
      full: ['Single-Arm Dumbbell Row', 'Seated Row', 'Barbell Row'],
      home: ['Dumbbell Row', 'Single-Arm Dumbbell Row'],
      minimal: ['Back Extension']
    },
    shoulder: {
      planet: ['Shoulder Press', 'Machine Shoulder Press', 'Dumbbell Shoulder Press'],
      full: ['Dumbbell Shoulder Press', 'Shoulder Press', 'Arnold Press'],
      home: ['Dumbbell Shoulder Press', 'Arnold Press'],
      minimal: ['Push-Up']
    },
    lateral: {
      planet: ['Cable Lateral Raise', 'Lateral Raise'],
      full: ['Lateral Raise', 'Cable Lateral Raise'],
      home: ['Lateral Raise'],
      minimal: []
    },
    rear: {
      planet: ['Reverse Pec Deck', 'Face Pull', 'Rear Delt Fly'],
      full: ['Face Pull', 'Rear Delt Fly', 'Reverse Pec Deck'],
      home: ['Rear Delt Fly'],
      minimal: []
    },
    squat: {
      planet: ['Leg Press', 'Smith Machine Squat', 'Goblet Squat'],
      full: ['Barbell Back Squat', 'Leg Press', 'Goblet Squat'],
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
    ham: {
      planet: ['Seated Leg Curl', 'Lying Leg Curl', 'Dumbbell Romanian Deadlift'],
      full: ['Seated Leg Curl', 'Romanian Deadlift', 'Dumbbell Romanian Deadlift'],
      home: ['Dumbbell Romanian Deadlift', 'Glute Bridge'],
      minimal: ['Glute Bridge']
    },
    glute: {
      planet: ['Glute Drive Machine', 'Smith Machine Hip Thrust', 'Hip Abductor Machine'],
      full: ['Hip Thrust', 'Cable Kickback', 'Glute Bridge'],
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
      planet: ['Cable Curl', 'Dumbbell Curl', 'Biceps Curl'],
      full: ['Dumbbell Curl', 'Cable Curl', 'Hammer Curl'],
      home: ['Dumbbell Curl', 'Hammer Curl'],
      minimal: []
    },
    biceps2: {
      planet: ['Hammer Curl', 'Biceps Curl', 'Cable Curl'],
      full: ['Hammer Curl', 'EZ-Bar Curl', 'Dumbbell Curl'],
      home: ['Hammer Curl', 'Dumbbell Curl'],
      minimal: []
    },
    triceps: {
      planet: ['Rope Triceps Pushdown', 'Triceps Pushdown', 'Overhead Cable Triceps Extension'],
      full: ['Triceps Pushdown', 'Dip', 'Dumbbell Triceps Extension'],
      home: ['Dumbbell Triceps Extension', 'Push-Up'],
      minimal: ['Push-Up']
    },
    triceps2: {
      planet: ['Overhead Cable Triceps Extension', 'Triceps Pushdown', 'Rope Triceps Pushdown'],
      full: ['Dumbbell Triceps Extension', 'Triceps Pushdown', 'Dip'],
      home: ['Dumbbell Triceps Extension', 'Push-Up'],
      minimal: ['Push-Up']
    },
    core: {
      planet: ['Ab Crunch Machine', 'Cable Crunch', 'Dead Bug'],
      full: ['Cable Crunch', 'Hanging Knee Raise', 'Dead Bug'],
      home: ['Dead Bug', 'Sit-Up', 'Russian Twist'],
      minimal: ['Dead Bug', 'Sit-Up', 'Russian Twist']
    },
    core2: {
      planet: ['Cable Crunch', 'Dead Bug', 'Ab Crunch Machine'],
      full: ['Dead Bug', 'Hanging Knee Raise', 'Cable Crunch'],
      home: ['Russian Twist', 'Sit-Up', 'Dead Bug'],
      minimal: ['Russian Twist', 'Sit-Up', 'Dead Bug']
    }
  };

  const templates = {
    'Full Body A': ['squat','chest','row','hinge','shoulder','pull','core','biceps','triceps'],
    'Full Body B': ['lunge','incline','pull','ham','row2','lateral','glute','core2','triceps2'],
    'Full Body C': ['quad','chest','row','glute','hinge','rear','calf','core','biceps2'],
    'Upper Body A': ['chest','pull','row','shoulder','incline','lateral','biceps','triceps','rear'],
    'Upper Body B': ['incline','row2','pull','shoulder','chestIso','rear','lateral','biceps2','triceps2'],
    'Lower Body A': ['squat','ham','quad','glute','hinge','calf','lunge','core'],
    'Lower Body B': ['hinge','quad','lunge','ham','glute','squat','calf','core2'],
    Push: ['chest','incline','shoulder','chestIso','lateral','triceps','triceps2','core'],
    Pull: ['pull','row','row2','rear','biceps','biceps2','hinge','core'],
    Legs: ['squat','hinge','quad','ham','glute','lunge','calf','core'],
    'Upper Body': ['chest','row','pull','shoulder','incline','rear','biceps','triceps','lateral'],
    'Lower Body': ['squat','hinge','quad','ham','glute','lunge','calf','core'],
    'Push A': ['chest','shoulder','incline','chestIso','lateral','triceps','triceps2','core'],
    'Pull A': ['pull','row','row2','rear','biceps','biceps2','core'],
    'Legs A': ['squat','ham','quad','glute','calf','lunge','core'],
    'Push B': ['incline','shoulder','chest','chestIso','lateral','triceps2','triceps','core2'],
    'Pull B': ['row2','pull','row','rear','biceps2','biceps','hinge','core2'],
    'Legs B': ['hinge','lunge','quad','ham','glute','squat','calf','core2'],
    'Recovery & Core': ['core','core2','rear','calf','glute']
  };

  const accessories = new Set(['chestIso','lateral','rear','quad','calf','biceps','biceps2','triceps','triceps2','core','core2']);

  function html(value) {
    return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  function accountId() {
    try {
      if (typeof cloudUser !== 'undefined' && cloudUser?.id) return cloudUser.id;
      if (typeof userProfile !== 'undefined') return userProfile?.accountKey || userProfile?.email?.trim().toLowerCase() || 'local';
    } catch {}
    return 'local';
  }

  function config() {
    try {
      const value = JSON.parse(localStorage.getItem(`${CONFIG}${accountId()}`) || 'null');
      return value?.version === 1 && value?.answers ? value : null;
    } catch { return null; }
  }

  function settings(value = {}) {
    return {
      goal: ['muscle','strength','fitness','endurance'].includes(value.goal) ? value.goal : 'muscle',
      experience: ['new','beginner','intermediate'].includes(value.experience) ? value.experience : 'beginner',
      location: ['planet','full','home','minimal'].includes(value.location) ? value.location : 'full',
      duration: [30,45,60,75].includes(Number(value.duration)) ? Number(value.duration) : 60
    };
  }

  function planNames(days) {
    return ({
      1: ['Full Body A'],
      2: ['Full Body A','Full Body B'],
      3: ['Full Body A','Full Body B','Full Body C'],
      4: ['Upper Body A','Lower Body A','Upper Body B','Lower Body B'],
      5: ['Push','Pull','Legs','Upper Body','Lower Body'],
      6: ['Push A','Pull A','Legs A','Push B','Pull B','Legs B'],
      7: ['Push A','Pull A','Legs A','Push B','Pull B','Legs B','Recovery & Core']
    })[Math.max(1,Math.min(7,Number(days)||4))] || [];
  }

  function timeLabel(duration) { return Number(duration) === 75 ? '75+ min' : `~${duration} min`; }
  function minutes(duration) { return Number(duration) === 75 ? 80 : Number(duration) || 60; }

  function exerciseCount(s, light) {
    if (light) return s.duration >= 60 ? 5 : 4;
    let count = ({30:4,45:5,60:6,75:8})[s.duration] || 6;
    if (s.experience === 'new' && s.duration >= 60) count -= 1;
    if (s.experience === 'intermediate' && s.duration >= 60) count += 1;
    return Math.max(4,Math.min(9,count));
  }

  function reps(s, role, light) {
    if (light) return [10,15];
    const accessory = accessories.has(role);
    if (s.goal === 'strength') return accessory ? [8,12] : [5,8];
    if (s.goal === 'endurance') return accessory ? [15,20] : [12,15];
    if (s.goal === 'fitness') return accessory ? [10,15] : [8,12];
    return accessory ? [10,15] : [8,12];
  }

  function setCount(s, role, light) {
    if (light) return 2;
    const accessory = accessories.has(role);
    let count = s.experience === 'new' ? (accessory ? 2 : (s.duration >= 60 ? 3 : 2))
      : s.experience === 'intermediate' ? 3
      : (accessory ? 2 : 3);
    if (s.goal === 'strength' && !accessory && s.experience !== 'new') count += 1;
    if (s.duration === 75 && accessory && s.experience !== 'new') count += 1;
    return Math.max(2,Math.min(4,count));
  }

  function note(s, role, light) {
    if (light) return 'Keep this session easy and controlled. Rest about 60 to 90 seconds between sets.';
    const accessory = accessories.has(role);
    let text = 'Rest about 60 to 90 seconds between sets.';
    if (s.goal === 'strength') text = accessory ? 'Rest about 75 to 120 seconds between sets.' : 'Rest about 2 to 3 minutes between sets.';
    else if (s.goal === 'muscle') text = accessory ? 'Rest about 60 to 90 seconds between sets.' : 'Rest about 90 to 120 seconds between sets.';
    else if (s.goal === 'endurance') text = 'Rest about 45 to 75 seconds between sets.';
    if (s.experience === 'new') text += ' Use a comfortable load and focus on technique.';
    return text;
  }

  function catalog(name) {
    try { return Array.isArray(exerciseCatalog) ? exerciseCatalog.find(x => x.name === name) || null : null; }
    catch { return null; }
  }

  function choose(role, s, variant, used) {
    const list = candidates[role]?.[s.location] || [];
    for (let i=0;i<list.length;i+=1) {
      const name = list[(variant+i)%list.length];
      if (used.has(name)) continue;
      const item = catalog(name);
      if (item) return item;
    }
    return null;
  }

  function exercise(item, s, role, light) {
    const range = reps(s,role,light);
    const uid = typeof createSessionId === 'function' ? createSessionId() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return {
      instanceId: `auto-personalized-${uid}`,
      catalogId: item.id,
      name: item.name,
      category: item.category,
      equipment: item.equipment,
      muscle: item.primary?.[0] || '',
      primary: [...(item.primary || [])],
      assists: [...(item.assists || [])],
      sets: setCount(s,role,light),
      repRange: range,
      note: note(s,role,light)
    };
  }

  function buildExercises(name,index,input) {
    const s = settings(input);
    const light = name === 'Recovery & Core';
    const target = exerciseCount(s,light);
    const used = new Set();
    const result = [];
    const fallback = s.location === 'minimal'
      ? ['chest','squat','lunge','hinge','core','core2','calf']
      : s.location === 'home'
        ? ['chest','row','squat','hinge','shoulder','core','biceps','triceps']
        : ['chest','pull','row','squat','hinge','shoulder','quad','ham','core','biceps','triceps'];
    const queue = light ? [...(templates[name]||[])] : [...(templates[name]||templates['Full Body A']),...fallback];

    queue.forEach((role,roleIndex) => {
      if (result.length >= target) return;
      const item = choose(role,s,index+roleIndex,used);
      if (!item) return;
      used.add(item.name);
      result.push(exercise(item,s,role,light));
    });
    return result;
  }

  const baseSanitize = typeof sanitizeCustomPlan === 'function' ? sanitizeCustomPlan : null;

  function applyTime(plan,cfg) {
    if (!plan?.id?.startsWith(AUTO) || !cfg?.answers) return plan;
    plan.time = timeLabel(cfg.answers.duration);
    plan.estimatedMinutes = minutes(cfg.answers.duration);
    return plan;
  }

  if (baseSanitize && !globalThis.__LEVEL_UP_WEEKLY_TIME_V3__) {
    globalThis.__LEVEL_UP_WEEKLY_TIME_V3__ = true;
    sanitizeCustomPlan = function(value) {
      return applyTime(baseSanitize(value),config());
    };
  }

  function buildPlan(name,index,cfg,existing) {
    if (!baseSanitize) return null;
    const now = Date.now();
    return applyTime(baseSanitize({
      id: `${AUTO}${index+1}`,
      name,
      revision: (Number(existing?.revision)||0)+1,
      createdAt: existing?.createdAt || now,
      updatedAt: now+index,
      exercises: buildExercises(name,index,cfg.answers)
    }),cfg);
  }

  function signature(plan) {
    return JSON.stringify((plan?.exercises||[]).map(x => [x.name,Number(x.sets)||0,x.repRange||[]]));
  }

  async function rebuild() {
    const cfg = config();
    if (!cfg?.planIds?.length || typeof userProfile === 'undefined' || !userProfile) return;
    const key = `${APPLIED}${accountId()}`;
    const stamp = `${VERSION}:${cfg.updatedAt}`;
    try { if (localStorage.getItem(key) === stamp) return; } catch {}

    const all = Array.isArray(userProfile.customWorkouts) ? userProfile.customWorkouts : [];
    const own = all.filter(x => !x?.id?.startsWith(AUTO));
    const existing = new Map(all.filter(x => x?.id?.startsWith(AUTO)).map(x => [x.id,x]));
    const names = planNames(cfg.answers.days);
    const generated = names.map((name,index) => buildPlan(name,index,cfg,existing.get(`${AUTO}${index+1}`))).filter(Boolean);
    if (generated.length !== names.length) return;

    const before = names.map((_,i) => signature(existing.get(`${AUTO}${i+1}`))).join('|');
    const after = generated.map(signature).join('|');
    if (before === after) {
      try { localStorage.setItem(key,stamp); } catch {}
      return;
    }

    const previous = userProfile.customWorkouts;
    try {
      userProfile.customWorkouts = typeof sanitizeCustomPlans === 'function' ? sanitizeCustomPlans([...generated,...own]) : [...generated,...own];
      if (typeof markProfileDirty === 'function') markProfileDirty('customWorkout');
      if (typeof saveUserProfile === 'function' && !saveUserProfile()) {
        userProfile.customWorkouts = previous;
        return;
      }
      try { localStorage.setItem(key,stamp); } catch {}
      if (typeof cloudReady !== 'undefined' && cloudReady && typeof saveCloudProfile === 'function') {
        try { await saveCloudProfile(); } catch {}
      }
      if (typeof renderPlans === 'function') renderPlans();
    } catch {
      userProfile.customWorkouts = previous;
    }
  }

  function previewSettings(overlay) {
    const copy = overlay.querySelector('.weekly-preview-summary p')?.textContent?.toLowerCase() || '';
    const timing = overlay.querySelector('.weekly-preview-summary strong')?.textContent || '';
    let location = 'full';
    if (copy.includes('machine-focused') || copy.includes('planet fitness')) location = 'planet';
    else if (copy.includes('home gym')) location = 'home';
    else if (copy.includes('minimal')) location = 'minimal';
    let goal = copy.includes('get stronger') ? 'strength' : copy.includes('general fitness') ? 'fitness' : copy.includes('improve endurance') ? 'endurance' : 'muscle';
    let experience = copy.includes('brand new') ? 'new' : copy.includes('intermediate') ? 'intermediate' : 'beginner';
    return settings({location,goal,experience,duration:Number(timing.match(/(30|45|60|75)\+?/)?.[1])||60});
  }

  function enhancePreview() {
    const overlay = document.getElementById('weeklyPlanWizard');
    if (!overlay || overlay.classList.contains('hidden') || !overlay.querySelector('.weekly-preview-summary')) return;
    const s = previewSettings(overlay);
    const sig = `${s.goal}:${s.experience}:${s.location}:${s.duration}`;

    overlay.querySelectorAll('.weekly-preview-day.workout').forEach((card,index) => {
      if (card.dataset.personalizedV3 === sig && card.querySelector('.weekly-preview-exercise-panel')) return;
      const name = card.querySelector('strong')?.textContent?.trim() || '';
      const exercises = buildExercises(name,index,s);
      if (!name || !exercises.length) return;
      const sets = exercises.reduce((sum,x)=>sum+(Number(x.sets)||0),0);
      const small = card.querySelector('div > small');
      if (small) small.textContent = `${exercises.length} exercises · ${sets} work sets · ${timeLabel(s.duration)} target`;

      card.querySelectorAll('.weekly-preview-view-exercises,.weekly-preview-exercise-panel').forEach(x=>x.remove());
      card.dataset.exercisePreviewReady = 'true';
      card.dataset.personalizedV3 = sig;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'weekly-preview-view-exercises';
      button.textContent = 'View exercises';
      button.setAttribute('aria-expanded','false');

      const panel = document.createElement('div');
      panel.className = 'weekly-preview-exercise-panel hidden';
      panel.innerHTML = `<div class="weekly-preview-exercise-heading"><span>PERSONALIZED WORKOUT</span><small>${exercises.length} movements · ${timeLabel(s.duration)} target</small></div>
        <ol>${exercises.map((x,i)=>`<li><span class="weekly-preview-exercise-number">${i+1}</span><span class="weekly-preview-exercise-copy"><b>${html(x.name)}</b><small>${html(x.equipment||'')}</small></span><strong>${x.sets} x ${x.repRange[0]}-${x.repRange[1]}</strong></li>`).join('')}</ol>
        <p class="weekly-v3-time-note">The selected time includes warm-up, normal rest, equipment setup and transitions. Actual workout time can vary.</p>`;

      button.onclick = () => {
        const open = !panel.classList.toggle('hidden');
        button.textContent = open ? 'Hide exercises' : 'View exercises';
        button.setAttribute('aria-expanded',open?'true':'false');
      };
      card.append(button,panel);
    });
  }

  function scheduleRebuild() {
    [300,700,1400,2400].forEach(ms => setTimeout(()=>{ void rebuild(); },ms));
  }

  if (!document.getElementById('weeklyPersonalizationV3Style')) {
    const style = document.createElement('style');
    style.id = 'weeklyPersonalizationV3Style';
    style.textContent = '.weekly-v3-time-note{margin:10px 2px 0;color:#8e969e;font-size:11px;line-height:1.45}';
    document.head.appendChild(style);
  }

  document.addEventListener('click',e => {
    if (e.target.closest?.('[data-weekly-use]')) scheduleRebuild();
  },true);

  const observer = new MutationObserver(() => requestAnimationFrame(() => {
    enhancePreview();
    void rebuild();
  }));

  function start() {
    enhancePreview();
    void rebuild();
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden){ enhancePreview(); scheduleRebuild(); } });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();