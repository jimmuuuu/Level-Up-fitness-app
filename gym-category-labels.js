(() => {
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

      const previewCopy = overlay.querySelector('.weekly-preview-summary p');
      if (previewCopy) {
        previewCopy.textContent = previewCopy.textContent
          .replace(/Planet Fitness/g, 'Machine-focused gym')
          .replace(/Full gym/g, 'Free weight')
          .replace(/Full free-weight gym/g, 'Free weight')
          .replace(/Home gym \/ dumbbells/g, 'Home gym');
      }
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
  }

  function start() {
    updateWeeklyPlanLabels();
    const observer = new MutationObserver(() => requestAnimationFrame(updateWeeklyPlanLabels));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
