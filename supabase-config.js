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
      .sync-status { display: none !important; }
    `;
    document.head.appendChild(criticalNavigation);
  }

  if (!document.querySelector('link[data-level-up-theme]')) {
    const theme = document.createElement('link');
    theme.rel = 'stylesheet';
    theme.href = 'theme.css?v=4';
    theme.dataset.levelUpTheme = 'red';
    document.head.appendChild(theme);
  }

  if (!document.querySelector('link[data-navigation-simplify]')) {
    const navigationStyle = document.createElement('link');
    navigationStyle.rel = 'stylesheet';
    navigationStyle.href = 'navigation-simplify.css?v=2';
    navigationStyle.dataset.navigationSimplify = 'true';
    document.head.appendChild(navigationStyle);
  }

  if (!document.querySelector('link[data-weight-recommendations-style]')) {
    const weightRecommendationsStyle = document.createElement('link');
    weightRecommendationsStyle.rel = 'stylesheet';
    weightRecommendationsStyle.href = 'weight-recommendations.css?v=1';
    weightRecommendationsStyle.dataset.weightRecommendationsStyle = 'true';
    document.head.appendChild(weightRecommendationsStyle);
  }

  if (!document.querySelector('link[data-weekly-workout-review-style]')) {
    const weeklyWorkoutReviewStyle = document.createElement('link');
    weeklyWorkoutReviewStyle.rel = 'stylesheet';
    weeklyWorkoutReviewStyle.href = 'weekly-workout-review.css?v=1';
    weeklyWorkoutReviewStyle.dataset.weeklyWorkoutReviewStyle = 'true';
    document.head.appendChild(weeklyWorkoutReviewStyle);
  }

  if (!document.querySelector('link[data-workout-summary-style]')) {
    const workoutSummaryStyle = document.createElement('link');
    workoutSummaryStyle.rel = 'stylesheet';
    workoutSummaryStyle.href = 'workout-summary.css?v=3';
    workoutSummaryStyle.dataset.workoutSummaryStyle = 'true';
    document.head.appendChild(workoutSummaryStyle);
  }

  if (!document.querySelector('link[data-summary-red-override]')) {
    const summaryRedOverride = document.createElement('link');
    summaryRedOverride.rel = 'stylesheet';
    summaryRedOverride.href = 'summary-red-override.css?v=1';
    summaryRedOverride.dataset.summaryRedOverride = 'true';
    document.head.appendChild(summaryRedOverride);
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
    if (!document.querySelector('script[data-auth-session-fix]')) {
      const authSessionFix = document.createElement('script');
      authSessionFix.src = 'auth-session-fix.js?v=2';
      authSessionFix.dataset.authSessionFix = 'true';
      document.body.appendChild(authSessionFix);
    }

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
      workoutSummary.src = 'workout-summary.js?v=2';
      workoutSummary.dataset.workoutSummaryFeature = 'true';
      document.body.appendChild(workoutSummary);
    }

    if (!document.querySelector('script[data-post-workout-auto-summary]')) {
      const postWorkoutAutoSummary = document.createElement('script');
      postWorkoutAutoSummary.src = 'post-workout-auto-summary.js?v=1';
      postWorkoutAutoSummary.dataset.postWorkoutAutoSummary = 'true';
      document.body.appendChild(postWorkoutAutoSummary);
    }

    if (!document.querySelector('script[data-weight-recommendations]')) {
      const weightRecommendations = document.createElement('script');
      weightRecommendations.src = 'weight-recommendations.js?v=1';
      weightRecommendations.dataset.weightRecommendations = 'true';
      document.body.appendChild(weightRecommendations);
    }

    if (!document.querySelector('script[data-weekly-workout-review]')) {
      const weeklyWorkoutReview = document.createElement('script');
      weeklyWorkoutReview.src = 'weekly-workout-review.js?v=2';
      weeklyWorkoutReview.dataset.weeklyWorkoutReview = 'true';
      document.body.appendChild(weeklyWorkoutReview);
    }

    if (!document.querySelector('script[data-rank-threshold]')) {
      const rankThreshold = document.createElement('script');
      rankThreshold.src = 'rank-threshold.js?v=1';
      rankThreshold.dataset.rankThreshold = 'true';
      document.body.appendChild(rankThreshold);
    }
  }, { once: true });
})();