(() => {
  const nameMap = new Map([
    ['Strong Start', 'Full Body'],
    ['Full Body Basics', 'Beginner Full Body'],
    ['Upper Body Strength', 'Upper Body'],
    ['Lower Body Strength', 'Lower Body'],
    ['Push Day', 'Push'],
    ['Pull Day', 'Pull'],
    ['Glutes & Legs', 'Legs & Glutes'],
    ['Core Builder', 'Core'],
    ['Dumbbell Only', 'Dumbbell Full Body'],
    ['Machine Basics', 'Machine Full Body'],
    ['Cardio Starter', 'Cardio'],
    ['Quick 20-Min Circuit', '20-Min Full Body'],
    ['Back & Biceps Blitz', 'Back & Biceps']
  ]);

  function applySimpleWorkoutNames() {
    try {
      if (!Array.isArray(plans)) return;

      let changed = false;
      plans.forEach(plan => {
        const nextName = nameMap.get(plan?.name);
        if (!nextName || nextName === plan.name) return;
        plan.name = nextName;
        changed = true;
      });

      if (!changed) return;

      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      try { if (typeof renderHome === 'function') renderHome(); } catch {}

      if (selectedPlan && typeof populatePlanDetail === 'function') {
        try { populatePlanDetail(selectedPlan); } catch {}
      }
    } catch (error) {
      console.warn('Level Up simple workout names could not load.', error);
    }
  }

  applySimpleWorkoutNames();
})();
