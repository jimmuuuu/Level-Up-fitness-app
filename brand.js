(() => {
  const EMBLEM = 'assets/level-up-emblem.svg';
  const APP_ICON = 'assets/level-up-app-icon.svg';

  const PREMADE_NAMES = {
    'Strong Start': 'Beginner Full Body',
    'Full Body Basics': 'Full Body Workout',
    'Upper Body Strength': 'Upper Body Workout',
    'Lower Body Strength': 'Lower Body Workout',
    'Push Day': 'Chest + Shoulders',
    'Pull Day': 'Back + Biceps',
    'Glutes & Legs': 'Legs + Glutes',
    'Core Builder': 'Core Workout',
    'Dumbbell Only': 'Dumbbell Full Body',
    'Machine Basics': 'Machine Full Body',
    'Cardio Starter': 'Cardio Starter',
    'Quick 20-Min Circuit': '20-Min Full Body',
    'Back & Biceps Blitz': 'Back + Biceps Plus'
  };

  function ensureHeadBranding() {
    document.title = 'Level Up Fitness';

    let favicon = document.querySelector('link[rel="icon"][data-level-up-brand]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/svg+xml';
      favicon.dataset.levelUpBrand = 'true';
      document.head.appendChild(favicon);
    }
    favicon.href = APP_ICON;

    let touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!touchIcon) {
      touchIcon = document.createElement('link');
      touchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(touchIcon);
    }
    touchIcon.href = APP_ICON;

    const titleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (titleMeta) titleMeta.setAttribute('content', 'Level Up Fitness');
  }

  function makeBrandImage() {
    const image = document.createElement('img');
    image.src = EMBLEM;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    return image;
  }

  function brandAuthGate() {
    const panel = document.querySelector('#authGate .auth-panel');
    const title = document.getElementById('authTitle');
    if (!panel || !title || panel.querySelector('.level-up-auth-brand')) return;

    const brand = document.createElement('div');
    brand.className = 'level-up-auth-brand';
    brand.setAttribute('aria-label', 'Level Up Fitness');
    brand.appendChild(makeBrandImage());

    const copy = document.createElement('div');
    copy.className = 'level-up-auth-brand-copy';
    copy.innerHTML = '<strong>LEVEL UP</strong><span>FITNESS</span>';
    brand.appendChild(copy);
    title.insertAdjacentElement('beforebegin', brand);
  }

  function brandWorkoutPage() {
    const page = document.getElementById('workout');
    const over = page?.querySelector(':scope > .over');
    if (!page || !over || page.querySelector('.level-up-workout-brand')) return;

    const brand = document.createElement('div');
    brand.className = 'level-up-workout-brand';
    brand.setAttribute('aria-label', 'Level Up Fitness');
    brand.appendChild(makeBrandImage());

    const copy = document.createElement('div');
    copy.className = 'level-up-workout-brand-copy';
    copy.innerHTML = '<strong>LEVEL UP</strong><span>FITNESS</span>';
    brand.appendChild(copy);
    over.insertAdjacentElement('beforebegin', brand);
  }

  function brandProfileSettings() {
    const panel = document.getElementById('profileSettingsPanel');
    if (!panel || panel.querySelector('.level-up-profile-brand')) return;

    const heading = panel.querySelector('.over');
    const brand = document.createElement('div');
    brand.className = 'level-up-profile-brand';
    brand.appendChild(makeBrandImage());

    const copy = document.createElement('div');
    copy.innerHTML = '<strong>Level Up Fitness</strong><span>Training, progress, and your gym profile in one place.</span>';
    brand.appendChild(copy);

    if (heading) heading.insertAdjacentElement('beforebegin', brand);
    else panel.prepend(brand);
  }

  function displayPlanName(plan) {
    return PREMADE_NAMES[plan?.name] || plan?.name || 'Workout';
  }

  function planGroup(plan) {
    const search = `${plan?.name || ''} ${plan?.type || ''}`.toLowerCase();
    if (search.includes('cardio')) return 'Cardio';
    if (search.includes('core')) return 'Core';

    const lower = new Set(['Legs', 'Glutes', 'Hamstrings', 'Calves']);
    const upper = new Set(['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms']);
    const muscles = (plan?.exercises || []).map(exercise => exercise.muscle).filter(Boolean);
    const hasLower = muscles.some(muscle => lower.has(muscle));
    const hasUpper = muscles.some(muscle => upper.has(muscle));

    if (hasLower && hasUpper) return 'Full Body';
    if (hasLower) return 'Lower Body';
    if (hasUpper) return 'Upper Body';
    return 'Full Body';
  }

  function planTarget(plan) {
    const search = `${plan?.name || ''} ${plan?.type || ''}`.toLowerCase();
    if (search.includes('cardio')) return 'cardio';
    if (search.includes('core')) return 'core';
    if (search.includes('push') || search.includes('chest')) return 'push';
    if (search.includes('pull') || search.includes('back & biceps')) return 'pull';

    const group = planGroup(plan);
    if (group === 'Lower Body') return 'lower';
    if (group === 'Upper Body') return 'upper';
    return 'full';
  }

  function anatomyMap(target) {
    return `
      <div class="lu-muscle-map" data-target="${target}" aria-hidden="true">
        <svg viewBox="0 0 64 84" focusable="false">
          <circle class="body-base" cx="32" cy="8" r="6"/>
          <path class="body-base" d="M25 16h14l5 15-5 19H25l-5-19z"/>
          <path class="body-base" d="M25 50h6v16l-3 14h-6l2-16zM33 50h6l1 14 2 16h-6l-3-14z"/>
          <path class="body-base" d="M21 21l-7 8-5 18h6l6-14 6-6zM43 21l7 8 5 18h-6l-6-14-6-6z"/>

          <path class="body-part part-chest" d="M25 21h6v10l-8-2zM33 21h6l2 8-8 2z"/>
          <rect class="body-part part-core" x="28" y="31" width="8" height="16" rx="3"/>
          <circle class="body-part part-shoulder" cx="21" cy="23" r="4"/>
          <circle class="body-part part-shoulder" cx="43" cy="23" r="4"/>
          <path class="body-part part-arm" d="M16 27h5l-4 17h-5zM43 27h5l4 17h-5z"/>
          <path class="body-part part-triceps" d="M14 31h3l-2 11h-3zM47 31h3l2 11h-3z"/>
          <path class="body-part part-lat" d="M23 28l5 4-3 12-5-6zM41 28l-5 4 3 12 5-6z"/>
          <path class="body-part part-glute" d="M25 48h7v8h-8zM32 48h7l1 8h-8z"/>
          <path class="body-part part-quad" d="M24 55h7v14l-4 4h-4zM33 55h7l1 18-4-4h-4z"/>
          <path class="body-part part-calf" d="M23 70h6l-1 10h-5zM35 70h6v10h-5z"/>
          <path class="body-line" d="M32 16v34M27 32h10M27 38h10M27 44h10" fill="none"/>
        </svg>
      </div>`;
  }

  function ensureTrainingHeader() {
    const page = document.getElementById('workout');
    if (!page) return;

    const over = page.querySelector(':scope > .over');
    const heading = page.querySelector(':scope > h1');
    if (over) over.textContent = 'WORKOUT LIBRARY';
    if (heading) heading.textContent = 'Training';

    if (heading && !page.querySelector('.lu-training-intro')) {
      const intro = document.createElement('p');
      intro.className = 'lu-training-intro';
      intro.textContent = 'Pick a ready-made routine, follow your weekly plan, or build a workout that fits you.';
      heading.insertAdjacentElement('afterend', intro);
    }

    const libraryHeading = page.querySelector('.library-heading');
    const libraryOver = libraryHeading?.querySelector('.over');
    const libraryTitle = document.getElementById('libraryTitle');
    if (libraryOver) libraryOver.textContent = 'READY-MADE ROUTINES';
    if (libraryTitle) libraryTitle.textContent = 'Premade workouts';

    const create = document.getElementById('create');
    if (create) create.textContent = 'Build custom workout';
  }

  function installTrainingFilters(list) {
    if (!list || document.querySelector('.lu-training-filters')) return;

    const filters = document.createElement('div');
    filters.className = 'lu-training-filters';
    filters.setAttribute('aria-label', 'Filter premade workouts');
    ['All', 'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Cardio'].forEach((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `lu-training-filter${index === 0 ? ' active' : ''}`;
      button.textContent = label;
      button.dataset.filter = label;
      button.onclick = () => {
        filters.querySelectorAll('.lu-training-filter').forEach(item => item.classList.toggle('active', item === button));
        const filter = button.dataset.filter;
        list.querySelectorAll('.lu-premade-card').forEach(card => {
          card.hidden = filter !== 'All' && card.dataset.group !== filter;
        });
      };
      filters.appendChild(button);
    });
    list.insertAdjacentElement('beforebegin', filters);
  }

  function renderPremadePlans() {
    const list = document.getElementById('planList');
    if (!list || typeof plans === 'undefined' || !Array.isArray(plans)) return;
    installTrainingFilters(list);

    if (list.querySelector(':scope > .lu-premade-card')) return;

    list.classList.add('lu-premade-list');
    list.innerHTML = plans.map(plan => {
      const group = planGroup(plan);
      const target = planTarget(plan);
      const displayName = displayPlanName(plan);
      const planId = typeof planIdFor === 'function' ? planIdFor(plan) : plan.name;
      const preview = (plan.exercises || []).slice(0, 3).map(exercise => `
        <div class="lu-premade-exercise">
          <span>${exercise.name}</span>
          <b>${exercise.muscle || ''}</b>
        </div>`).join('');
      return `
        <article class="lu-premade-card" data-group="${group}">
          <div class="lu-premade-head">
            <div class="lu-premade-title">
              <h3>${displayName}</h3>
              <p>${plan.exercises.length} exercises · ${plan.time}</p>
            </div>
            ${anatomyMap(target)}
          </div>
          <div class="lu-premade-preview">${preview}</div>
          <div class="lu-premade-footer">
            <small>${plan.type}</small>
            <button class="lu-premade-view" type="button" data-plan-id="${planId}" data-display-name="${displayName}">View all</button>
          </div>
        </article>`;
    }).join('');

    list.querySelectorAll('.lu-premade-view').forEach(button => {
      button.onclick = () => {
        if (typeof detail === 'function') detail(button.dataset.planId);
        requestAnimationFrame(() => {
          const title = document.getElementById('detailTitle');
          if (title && button.dataset.displayName) title.textContent = button.dataset.displayName;
        });
      };
    });

    list.querySelectorAll('.lu-premade-card').forEach(card => {
      card.addEventListener('click', event => {
        if (event.target.closest('button')) return;
        card.querySelector('.lu-premade-view')?.click();
      });
    });

    const activeFilter = document.querySelector('.lu-training-filter.active')?.dataset.filter || 'All';
    list.querySelectorAll('.lu-premade-card').forEach(card => {
      card.hidden = activeFilter !== 'All' && card.dataset.group !== activeFilter;
    });
  }

  function redesignTrainingLibrary() {
    ensureTrainingHeader();
    renderPremadePlans();
  }

  function applyBranding() {
    ensureHeadBranding();
    brandAuthGate();
    brandWorkoutPage();
    brandProfileSettings();
    redesignTrainingLibrary();
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyBranding();
    });
  });

  function start() {
    applyBranding();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('pageshow', applyBranding);
    document.addEventListener('click', event => {
      if (event.target?.closest?.('[data-page="workout"]')) setTimeout(redesignTrainingLibrary, 0);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
