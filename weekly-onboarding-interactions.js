(() => {
  const WIZARD_ID = 'weeklyPlanWizard';
  const QUESTION_COUNT = 6;

  let wizardWasOpen = false;
  let clearingSuggestedDays = false;
  const answeredSteps = new Set();
  const preparedSteps = new Set();

  function overlay() {
    return document.getElementById(WIZARD_ID);
  }

  function isOpen(node) {
    return Boolean(node && !node.classList.contains('hidden'));
  }

  function currentStep(node) {
    const kicker = node?.querySelector('.weekly-slide-kicker')?.textContent?.trim() || '';
    const match = kicker.match(/^(\d+)\s+OF\s+6/i);
    if (match) return Math.max(0, Math.min(QUESTION_COUNT - 1, Number(match[1]) - 1));
    if (node?.querySelector('.weekly-preview-summary')) return QUESTION_COUNT;

    const bars = [...(node?.querySelectorAll('.weekly-slide-progress i') || [])];
    const active = bars.findIndex(item => item.classList.contains('active'));
    return active >= 0 ? active : 0;
  }

  function resetSession() {
    answeredSteps.clear();
    preparedSteps.clear();
  }

  function clearSuggestedTrainingDays(node) {
    if (preparedSteps.has(3)) return;
    preparedSteps.add(3);

    const selected = [...node.querySelectorAll('.weekly-day-grid [data-weekly-choice].selected')];
    if (!selected.length) return;

    clearingSuggestedDays = true;
    try {
      selected.forEach(button => button.click());
    } finally {
      clearingSuggestedDays = false;
    }
  }

  function removeAutomaticSelection(node, step) {
    if (preparedSteps.has(step)) return;

    if (step === 3) {
      clearSuggestedTrainingDays(node);
      return;
    }

    preparedSteps.add(step);
    if (answeredSteps.has(step)) return;

    node.querySelectorAll('[data-weekly-choice].selected').forEach(button => {
      button.classList.remove('selected');
    });
  }

  function clickBackOnce() {
    const node = overlay();
    const back = node?.querySelector('.weekly-slide-back:not([disabled])');
    if (back) back.click();
  }

  function goToStep(targetStep) {
    const node = overlay();
    if (!node) return;

    const from = currentStep(node);
    const target = Math.max(0, Math.min(QUESTION_COUNT - 1, Number(targetStep)));
    if (target >= from) return;

    let remaining = from - target;
    const walkBack = () => {
      if (remaining <= 0) return;
      const current = overlay();
      const back = current?.querySelector('.weekly-slide-back:not([disabled])');
      if (!back) return;
      remaining -= 1;
      back.click();
      if (remaining > 0) window.setTimeout(walkBack, 35);
    };
    walkBack();
  }

  function enhanceProgress(node) {
    const step = currentStep(node);
    const bars = [...node.querySelectorAll('.weekly-slide-progress i')];

    bars.forEach((bar, index) => {
      const canGoBack = index < Math.min(step, QUESTION_COUNT);
      bar.dataset.weeklyProgressIndex = String(index);
      bar.classList.toggle('weekly-progress-clickable', canGoBack);
      if (canGoBack) {
        bar.setAttribute('role', 'button');
        bar.setAttribute('tabindex', '0');
        bar.setAttribute('aria-label', `Go back to question ${index + 1}`);
      } else {
        bar.removeAttribute('role');
        bar.removeAttribute('tabindex');
        bar.removeAttribute('aria-label');
      }
    });

    const close = node.querySelector('.weekly-slide-close');
    if (close) {
      close.setAttribute('aria-label', step > 0 ? 'Go back' : 'Close setup');
      close.title = step > 0 ? 'Go back' : 'Close setup';
    }
  }

  function enhance() {
    const node = overlay();
    const open = isOpen(node);

    if (open && !wizardWasOpen) resetSession();
    wizardWasOpen = open;
    if (!open || !node) return;

    const step = currentStep(node);
    if (step < QUESTION_COUNT) removeAutomaticSelection(node, step);
    enhanceProgress(node);
  }

  document.addEventListener('click', event => {
    const node = overlay();
    if (!isOpen(node) || !node?.contains(event.target)) return;

    const step = currentStep(node);
    const choice = event.target.closest('[data-weekly-choice]');
    if (choice && !clearingSuggestedDays) {
      answeredSteps.add(step);
      if (step === 2) {
        // Choosing a new weekly frequency means the user should choose the actual weekdays again.
        answeredSteps.delete(3);
        preparedSteps.delete(3);
      }
    }

    const progress = event.target.closest('.weekly-slide-progress i[data-weekly-progress-index]');
    if (progress) {
      const target = Number(progress.dataset.weeklyProgressIndex);
      if (Number.isFinite(target) && target < step) {
        event.preventDefault();
        event.stopImmediatePropagation();
        goToStep(target);
      }
      return;
    }

    const close = event.target.closest('.weekly-slide-close');
    if (close && step > 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      clickBackOnce();
    }
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const progress = event.target.closest?.('.weekly-slide-progress i.weekly-progress-clickable');
    if (!progress) return;
    event.preventDefault();
    const target = Number(progress.dataset.weeklyProgressIndex);
    if (Number.isFinite(target)) goToStep(target);
  });

  if (!document.getElementById('weeklyOnboardingInteractionStyles')) {
    const style = document.createElement('style');
    style.id = 'weeklyOnboardingInteractionStyles';
    style.textContent = `
      .weekly-slide-progress i.weekly-progress-clickable {
        cursor: pointer;
        transition: transform .15s ease, filter .15s ease;
      }
      .weekly-slide-progress i.weekly-progress-clickable:hover,
      .weekly-slide-progress i.weekly-progress-clickable:focus-visible {
        transform: scaleY(1.8);
        filter: brightness(1.25);
        outline: none;
      }
    `;
    document.head.appendChild(style);
  }

  const observer = new MutationObserver(() => requestAnimationFrame(enhance));
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance, { once: true });
  } else {
    enhance();
  }
})();
