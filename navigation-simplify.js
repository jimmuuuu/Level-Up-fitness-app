(() => {
  const LAST_PAGE_KEY = 'levelUpFitnessLastPage';

  function workoutTab() {
    return document.querySelector('.tabs button[data-page="workout"]');
  }

  function redirectHomeToWorkout() {
    const home = document.getElementById('home');
    if (!home || home.classList.contains('hidden')) return;
    const tab = workoutTab();
    if (tab) tab.click();
  }

  function setupProfileSettings() {
    const profile = document.getElementById('profile');
    const signOut = document.getElementById('signOut');
    if (!profile || !signOut || document.getElementById('profileSettingsPanel')) return;

    const panel = document.createElement('section');
    panel.id = 'profileSettingsPanel';
    panel.className = 'profile-settings-panel';
    panel.setAttribute('aria-labelledby', 'profileSettingsTitle');
    panel.innerHTML = `
      <div class="over">SETTINGS</div>
      <h2 id="profileSettingsTitle">Account & app</h2>
      <p class="profile-settings-copy">Manage account options here. More app settings can be added as Level Up grows.</p>
    `;

    const note = profile.querySelector('.signout-note');
    signOut.parentNode.insertBefore(panel, signOut);
    panel.appendChild(signOut);
    if (note) panel.appendChild(note);

    const shortcut = document.createElement('button');
    shortcut.type = 'button';
    shortcut.className = 'profile-settings-shortcut';
    shortcut.textContent = 'Settings';
    shortcut.setAttribute('aria-controls', panel.id);
    shortcut.onclick = () => panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) syncStatus.insertAdjacentElement('afterend', shortcut);
    else profile.querySelector('.profile-email')?.insertAdjacentElement('afterend', shortcut);
  }

  function loadFeature(styleFlag, styleHref, scriptFlag, scriptSrc) {
    if (!document.querySelector(`link[${styleFlag}]`)) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = styleHref;
      style.setAttribute(styleFlag, 'true');
      document.head.appendChild(style);
    }
    if (!document.querySelector(`script[${scriptFlag}]`)) {
      const script = document.createElement('script');
      script.async = false;
      script.src = scriptSrc;
      script.setAttribute(scriptFlag, 'true');
      document.body.appendChild(script);
    }
  }

  function loadScript(flag, src) {
    if (document.querySelector(`script[${flag}]`)) return;
    const script = document.createElement('script');
    script.async = false;
    script.src = src;
    script.setAttribute(flag, 'true');
    document.body.appendChild(script);
  }

  function loadScanFeature() { loadFeature('data-scan-feature-style', 'scan-feature.css?v=1', 'data-scan-feature', 'scan-feature.js?v=1'); }
  function loadScanZoom() { loadFeature('data-scan-zoom-style', 'scan-zoom.css?v=3', 'data-scan-zoom', 'scan-zoom.js?v=2'); }
  function loadGymPasses() { loadFeature('data-gym-passes-style', 'gym-passes.css?v=1', 'data-gym-passes', 'gym-passes.js?v=1'); }
  function loadGymSessionFixes() { loadFeature('data-gym-session-fixes-style', 'gym-session-fixes.css?v=2', 'data-gym-session-fixes', 'gym-session-fixes.js?v=1'); }
  function loadLegDayStartFix() { loadScript('data-leg-day-start-fix', 'leg-day-start-fix.js?v=2'); }
  function loadFinalFieldNotes() { loadFeature('data-field-notes-final-style', 'field-notes-final.css?v=1', 'data-field-notes-final', 'field-notes-final.js?v=1'); }
  function loadFiveDayPlan() { loadScript('data-five-day-plan', 'five-day-plan.js?v=2'); }
  function loadRestTimerV3() { loadFeature('data-rest-timer-v3-style', 'rest-timer-v3.css?v=2', 'data-rest-timer-v3', 'rest-timer-v3.js?v=6'); }
  function loadPersistentPause() { loadFeature('data-rest-timer-pause-visible-style', 'rest-timer-pause-visible.css?v=1', 'data-rest-timer-pause-visible', 'rest-timer-pause-visible.js?v=1'); }
  function loadActiveWorkoutCompanion() { loadFeature('data-active-workout-companion-style', 'active-workout-companion.css?v=1', 'data-active-workout-companion', 'active-workout-companion.js?v=1'); }
  function loadRestAlertGuidance() { loadScript('data-rest-alert-guidance', 'rest-alert-guidance.js?v=2'); }
  function loadProfileSettingsPage() { loadFeature('data-profile-settings-page-style', 'profile-settings-page.css?v=1', 'data-profile-settings-page', 'profile-settings-page.js?v=1'); }
  function loadRestTimerSettingsBridge() { loadScript('data-rest-timer-settings-bridge', 'rest-timer-settings-bridge.js?v=5'); }
  function loadExerciseSwap() { loadFeature('data-exercise-swap-style', 'exercise-swap.css?v=2', 'data-exercise-swap', 'exercise-swap.js?v=3'); }
  function loadExerciseFacts() { loadFeature('data-exercise-facts-style', 'exercise-history-facts.css?v=1', 'data-exercise-facts', 'exercise-history-facts.js?v=2'); }
  function loadWorkoutCalendar() { loadFeature('data-workout-calendar-style', 'workout-calendar.css?v=2', 'data-workout-calendar', 'workout-calendar.js?v=3'); }
  function loadExerciseLibraryPage() { loadFeature('data-exercise-library-page-style', 'exercise-library-page.css?v=2', 'data-exercise-library-page', 'exercise-library-page.js?v=3'); }
  function loadGymProfiles() { loadFeature('data-gym-profiles-style', 'gym-profiles.css?v=1', 'data-gym-profiles', 'gym-profiles.js?v=2'); }
  function loadGymOnboardingIntegration() { loadScript('data-gym-onboarding-integration', 'gym-onboarding-integration.js?v=1'); }
  function loadWorkoutCheckIn() { loadFeature('data-workout-checkin-style', 'workout-checkin.css?v=1', 'data-workout-checkin', 'workout-checkin.js?v=2'); }
  function loadProgressInsights() { loadFeature('data-progress-insights-style', 'progress-insights.css?v=1', 'data-progress-insights', 'progress-insights.js?v=2'); }
  function loadTrainingQuests() { loadFeature('data-training-quests-style', 'training-quests.css?v=2', 'data-training-quests', 'training-quests.js?v=3'); }
  function loadProfileLevelAvatar() { loadFeature('data-profile-level-avatar-style', 'profile-level-avatar.css?v=2', 'data-profile-level-avatar', 'profile-level-avatar.js?v=2'); }
  function loadWorkoutNotes() { loadFeature('data-workout-notes-style', 'workout-notes.css?v=2', 'data-workout-notes', 'workout-notes.js?v=3'); }
  function loadExpandedSettings() { loadFeature('data-settings-expanded-style', 'settings-expanded.css?v=1', 'data-settings-expanded', 'settings-expanded.js?v=4'); }
  function loadHistoryEnrichment() { loadScript('data-history-enrichment', 'history-enrichment.js?v=3'); }
  function loadCompanionQuality() { loadFeature('data-companion-quality-style', 'companion-quality.css?v=1', 'data-companion-quality', 'companion-quality.js?v=1'); }
  function loadNoEmDashes() { loadScript('data-no-em-dashes', 'no-em-dashes.js?v=2'); }
  function disableWeightRecommendations() { loadFeature('data-disable-weight-recommendations-style', 'disable-weight-recommendations.css?v=2', 'data-disable-weight-recommendations', 'disable-weight-recommendations.js?v=2'); }

  function start() {
    try {
      const remembered = sessionStorage.getItem(LAST_PAGE_KEY) || '';
      if (!remembered || remembered === 'home') sessionStorage.setItem(LAST_PAGE_KEY, 'workout');
    } catch {}

    setupProfileSettings();
    loadScanFeature();
    loadScanZoom();
    loadGymPasses();
    loadGymSessionFixes();
    loadLegDayStartFix();
    loadFinalFieldNotes();
    loadFiveDayPlan();
    loadRestTimerV3();
    loadPersistentPause();
    loadActiveWorkoutCompanion();
    loadRestAlertGuidance();
    loadProfileSettingsPage();
    loadRestTimerSettingsBridge();
    loadExerciseSwap();
    loadExerciseFacts();
    loadWorkoutCalendar();
    loadExerciseLibraryPage();
    loadGymProfiles();
    loadGymOnboardingIntegration();
    loadWorkoutCheckIn();
    loadProgressInsights();
    loadTrainingQuests();
    loadProfileLevelAvatar();
    loadWorkoutNotes();
    loadExpandedSettings();
    loadHistoryEnrichment();
    loadCompanionQuality();
    loadNoEmDashes();
    disableWeightRecommendations();
    redirectHomeToWorkout();

    const home = document.getElementById('home');
    if (home) {
      const observer = new MutationObserver(redirectHomeToWorkout);
      observer.observe(home, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
