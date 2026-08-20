(() => {
  const basicWorkoutOrder = [
    { source: ['Strong Start', 'Full Body'], name: 'Full Body' },
    { source: ['Upper Body Strength', 'Upper Body'], name: 'Upper Body' },
    { source: ['Lower Body Strength', 'Lower Body'], name: 'Lower Body' },
    { source: ['Push Day', 'Push'], name: 'Push' },
    { source: ['Pull Day', 'Pull'], name: 'Pull' },
    { source: ['Core Builder', 'Core'], name: 'Core' },
    { source: ['Cardio Starter', 'Cardio'], name: 'Cardio' }
  ];

  function applyBasicWorkoutLibrary() {
    try {
      if (!Array.isArray(plans)) return;

      const selected = basicWorkoutOrder
        .map(config => {
          const plan = plans.find(candidate => config.source.includes(candidate?.name));
          if (!plan) return null;
          plan.name = config.name;
          return plan;
        })
        .filter(Boolean);

      if (!selected.length) return;

      plans.splice(0, plans.length, ...selected);

      try { if (typeof renderPlans === 'function') renderPlans(); } catch {}
      try { if (typeof renderHome === 'function') renderHome(); } catch {}

      if (selectedPlan && !plans.includes(selectedPlan)) selectedPlan = null;
      if (selectedPlan && typeof populatePlanDetail === 'function') {
        try { populatePlanDetail(selectedPlan); } catch {}
      }
    } catch (error) {
      console.warn('Level Up basic workout library could not load.', error);
    }
  }

  applyBasicWorkoutLibrary();
})();
