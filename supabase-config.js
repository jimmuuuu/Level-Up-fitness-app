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

  if (!document.querySelector('link[data-weekly-plan-onboarding-base]')) {
    const weeklyPlanOnboardingBase = document.createElement('link');
    weeklyPlanOnboardingBase.rel = 'stylesheet';
    weeklyPlanOnboardingBase.href = 'weekly-plan-onboarding.css?v=1';
    weeklyPlanOnboardingBase.dataset.weeklyPlanOnboardingBase = 'true';
    document.head.appendChild(weeklyPlanOnboardingBase);
  }

  if (!document.querySelector('link[data-weekly-plan-onboarding-style]')) {
    const weeklyPlanOnboardingStyle = document.createElement('link');
    weeklyPlanOnboardingStyle.rel = 'stylesheet';
    weeklyPlanOnboardingStyle.href = 'weekly-plan-onboarding-v2.css?v=1';
    weeklyPlanOnboardingStyle.dataset.weeklyPlanOnboardingStyle = 'true';
    document.head.appendChild(weeklyPlanOnboardingStyle);
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
      setHistory.src = 'set-history.js?v=2';
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

    if (!document.querySelector('script[data-weekly-plan-onboarding]')) {
      const weeklyPlanOnboarding = document.createElement('script');
      weeklyPlanOnboarding.src = 'weekly-plan-onboarding.js?v=2';
      weeklyPlanOnboarding.dataset.weeklyPlanOnboarding = 'true';
      document.body.appendChild(weeklyPlanOnboarding);
    }

    if (!document.querySelector('script[data-gym-category-labels]')) {
      const gymCategoryLabels = document.createElement('script');
      gymCategoryLabels.src = 'gym-category-labels.js?v=4';
      gymCategoryLabels.dataset.gymCategoryLabels = 'true';
      document.body.appendChild(gymCategoryLabels);
    }

    if (!document.querySelector('script[data-weekly-onboarding-interactions]')) {
      const weeklyOnboardingInteractions = document.createElement('script');
      weeklyOnboardingInteractions.src = 'weekly-onboarding-interactions.js?v=1';
      weeklyOnboardingInteractions.dataset.weeklyOnboardingInteractions = 'true';
      document.body.appendChild(weeklyOnboardingInteractions);
    }

    if (!document.querySelector('script[data-start-workout-navigation-fix]')) {
      const startWorkoutNavigationFix = document.createElement('script');
      startWorkoutNavigationFix.src = 'start-workout-navigation-fix.js?v=1';
      startWorkoutNavigationFix.dataset.startWorkoutNavigationFix = 'true';
      document.body.appendChild(startWorkoutNavigationFix);
    }

    const loadWeeklyPreviewEditor = () => {
      if (document.querySelector('script[data-weekly-preview-editor]')) return;
      const weeklyPreviewEditor = document.createElement('script');
      weeklyPreviewEditor.src = 'weekly-preview-editor.js?v=1';
      weeklyPreviewEditor.dataset.weeklyPreviewEditor = 'true';
      document.body.appendChild(weeklyPreviewEditor);
    };

    const existingPersonalization = document.querySelector('script[data-weekly-plan-personalization]');
    if (!existingPersonalization) {
      const weeklyPlanPersonalization = document.createElement('script');
      weeklyPlanPersonalization.src = 'weekly-plan-personalization-v3.js?v=1';
      weeklyPlanPersonalization.dataset.weeklyPlanPersonalization = 'true';
      weeklyPlanPersonalization.addEventListener('load', loadWeeklyPreviewEditor, { once: true });
      document.body.appendChild(weeklyPlanPersonalization);
    } else if (existingPersonalization.dataset.loaded === 'true') {
      loadWeeklyPreviewEditor();
    } else {
      existingPersonalization.addEventListener('load', loadWeeklyPreviewEditor, { once: true });
      // If the existing script already finished before this listener was attached, load the editor on the next task.
      window.setTimeout(loadWeeklyPreviewEditor, 300);
    }
  }, { once: true });
})();