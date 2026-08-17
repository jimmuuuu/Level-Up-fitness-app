window.LEVEL_UP_SUPABASE = {
  url: 'https://wxeptxfijwrwmdzxvsuh.supabase.co',
  publishableKey: 'sb_publishable_iptY9q73dl1gKeM18zcwZA_Vz8d-Lu0'
};

// Load visual and navigation overrides separately so the large app files stay untouched.
(() => {
  if (!document.querySelector('link[data-level-up-theme]')) {
    const theme = document.createElement('link');
    theme.rel = 'stylesheet';
    theme.href = 'theme.css?v=2';
    theme.dataset.levelUpTheme = 'lime';
    document.head.appendChild(theme);
  }

  if (!document.querySelector('link[data-navigation-simplify]')) {
    const navigationStyle = document.createElement('link');
    navigationStyle.rel = 'stylesheet';
    navigationStyle.href = 'navigation-simplify.css?v=1';
    navigationStyle.dataset.navigationSimplify = 'true';
    document.head.appendChild(navigationStyle);
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', '#080a0c');

  // Workout is now the app's main landing section. Keep active/builder destinations intact.
  try {
    const key = 'levelUpFitnessLastPage';
    const remembered = sessionStorage.getItem(key) || '';
    if (!remembered || remembered === 'home') {
      sessionStorage.setItem(key, 'workout');
      document.documentElement.setAttribute('data-restoring-page', 'workout');
    }
  } catch {}

  // Load optional helpers only after the main app has finished loading.
  window.addEventListener('load', () => {
    if (!document.querySelector('script[data-navigation-simplify]')) {
      const navigation = document.createElement('script');
      navigation.src = 'navigation-simplify.js?v=1';
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
