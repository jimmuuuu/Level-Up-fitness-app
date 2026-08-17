window.LEVEL_UP_SUPABASE = {
  url: 'https://wxeptxfijwrwmdzxvsuh.supabase.co',
  publishableKey: 'sb_publishable_iptY9q73dl1gKeM18zcwZA_Vz8d-Lu0'
};

// Load visual and navigation overrides separately so the large app files stay untouched.
(() => {
  if (!document.querySelector('style[data-navigation-critical]')) {
    const criticalNavigation = document.createElement('style');
    criticalNavigation.dataset.navigationCritical = 'true';
    criticalNavigation.textContent = `
      #home, .tabs button[data-page="home"] { display: none !important; }
      .tabs { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      #workout > .back, #progress > .back, #profile > .back { display: none !important; }
    `;
    document.head.appendChild(criticalNavigation);
  }

  if (!document.querySelector('link[data-level-up-theme]')) {
    const theme = document.createElement('link');
    theme.rel = 'stylesheet';
    theme.href = 'theme.css?v=3';
    theme.dataset.levelUpTheme = 'lime';
    document.head.appendChild(theme);
  }

  if (!document.querySelector('link[data-navigation-simplify]')) {
    const navigationStyle = document.createElement('link');
    navigationStyle.rel = 'stylesheet';
    navigationStyle.href = 'navigation-simplify.css?v=2';
    navigationStyle.dataset.navigationSimplify = 'true';
    document.head.appendChild(navigationStyle);
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', '#080a0c');

  // Workout is the app's main landing section. Keep active/builder destinations intact.
  try {
    const key = 'levelUpFitnessLastPage';
    const remembered = sessionStorage.getItem(key) || '';
    if (!remembered || remembered === 'home') {
      sessionStorage.setItem(key, 'workout');
      document.documentElement.setAttribute('data-restoring-page', 'workout');
    }
  } catch {}

  const forceWorkoutIfHome = () => {
    const home = document.getElementById('home');
    const workout = document.getElementById('workout');
    if (!home || !workout || home.classList.contains('hidden')) return;
    const workoutTab = document.querySelector('.tabs button[data-page="workout"]');
    if (workoutTab) workoutTab.click();
    else {
      home.classList.add('hidden');
      workout.classList.remove('hidden');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceWorkoutIfHome, { once: true });
  } else {
    forceWorkoutIfHome();
  }

  // Load optional helpers only after the main app has finished loading.
  window.addEventListener('load', () => {
    if (!document.querySelector('script[data-navigation-simplify]')) {
      const navigation = document.createElement('script');
      navigation.src = 'navigation-simplify.js?v=2';
      navigation.dataset.navigationSimplify = 'true';
      document.body.appendChild(navigation);
    }

    if (!document.querySelector('script[data-set-history-feature]')) {
      const setHistory = document.createElement('script');
      setHistory.src = 'set-history.js?v=1';
      setHistory.dataset.setHistoryFeature = 'true';
      document.body.appendChild(setHistory);
    }

    if (!document.querySelector('script[data-workout-summary-feature]')) {
      const workoutSummary = document.createElement('script');
      workoutSummary.src = 'workout-summary.js?v=1';
      workoutSummary.dataset.workoutSummaryFeature = 'true';
      document.body.appendChild(workoutSummary);
    }
  }, { once: true });
})();
