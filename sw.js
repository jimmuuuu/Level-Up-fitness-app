const CACHE = 'level-up-fitness-20260819-scan-any-equipment-v35';
const CORE = [
  './', './index.html', './app.css', './app.js', './supabase-config.js', './manifest.webmanifest',
  './theme.css', './navigation-simplify.css', './navigation-simplify.js',
  './set-history.css', './set-history.js', './set-history-v6.js', './cloud-history-v5.js', './workout-summary.css', './workout-summary.js',
  './summary-red-override.css', './post-workout-auto-summary.js',
  './weight-recommendations.css', './weight-recommendations.js',
  './weekly-workout-review.css', './weekly-workout-review.js', './rank-threshold.js',
  './weekly-plan-onboarding.css', './weekly-plan-onboarding-v2.css', './weekly-plan-onboarding.js',
  './gym-category-labels.js', './weekly-onboarding-interactions.js', './weekly-plan-personalization-v3.js',
  './weekly-preview-editor.js', './start-workout-navigation-fix.js', './account-history-isolation.js', './account-history-truth.js',
  './authoritative-history-sync.js', './auth-session-fix.js', './account-switch-fix-v2.js',
  './scan-feature.css', './scan-feature.js', './scan-zoom.css', './scan-zoom.js', './scan-upload-fix.js',
  './gym-passes.css', './gym-passes.js', './gym-session-fixes.css', './gym-session-fixes.js', './leg-day-start-fix.js',
  './field-notes-final.css', './field-notes-final.js', './five-day-plan.js', './rest-timer-v3.css', './rest-timer-v3.js',
  './rest-timer-pause-visible.css', './rest-timer-pause-visible.js',
  './active-workout-companion.css', './active-workout-companion.js', './rest-alert-guidance.js',
  './profile-settings-page.css', './profile-settings-page.js', './rest-timer-settings-bridge.js',
  './disable-weight-recommendations.css', './disable-weight-recommendations.js',
  './exercise-swap.css', './exercise-swap.js',
  './exercise-history-facts.css', './exercise-history-facts.js',
  './workout-calendar.css', './workout-calendar.js',
  './exercise-library-page.css', './exercise-library-page.js',
  './gym-profiles.css', './gym-profiles.js', './gym-onboarding-integration.js',
  './workout-checkin.css', './workout-checkin.js',
  './progress-insights.css', './progress-insights.js',
  './training-quests.css', './training-quests.js',
  './profile-level-avatar.css', './profile-level-avatar.js', './profile-photo-save-fix.js',
  './workout-notes.css', './workout-notes.js',
  './settings-expanded.css', './settings-expanded.js', './history-enrichment.js',
  './companion-quality.css', './companion-quality.js', './no-em-dashes.js',
  './assets/app-icon-180.png', './assets/app-icon-192.png', './assets/app-icon-512.png',
  './assets/MaleBody.png', './assets/MaleBodyFront.png', './assets/MaleBodyBack.png',
  './assets/workouts/kettlebell.png', './assets/workouts/functional-trainer.png',
  './assets/workouts/upper-body-tower.png', './assets/workouts/barbell.png',
  './assets/workouts/bench-press.png', './assets/workouts/lat-pulldown.png',
  './assets/workouts/hip-thrust.png', './assets/workouts/ab-wheel.png',
  './assets/workouts/dumbbell.png', './assets/workouts/machine.png', './assets/workouts/treadmill.png', './assets/workouts/timer.png',
  './assets/ranks/foundation.png', './assets/ranks/iron.png', './assets/ranks/bronze.png', './assets/ranks/silver.png',
  './assets/ranks/gold.png', './assets/ranks/platinum.png', './assets/ranks/diamond.png', './assets/ranks/champion.png',
  './assets/ranks/mythic.png', './assets/ranks/apex.png'
];
const SHELL = CORE.slice(0, 88);
const ASSETS = CORE.slice(88);
const scopedUrl = path => new URL(path, self.registration.scope).href;

async function cachePath(cache, path, requireImage = false) {
  const request = new Request(scopedUrl(path), { cache: 'reload' });
  const response = await fetch(request);
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || (requireImage && !contentType.startsWith('image/'))) {
    throw new Error(`Unable to cache ${path}`);
  }
  await cache.put(request, response);
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(SHELL.map(path => cachePath(cache, path)));
    await Promise.allSettled(ASSETS.map(path => cachePath(cache, path, true)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const target = new URL(event.notification?.data?.url || './', self.registration.scope).href;
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find(client => client.url.startsWith(self.registration.scope));
    if (existing) {
      try { await existing.navigate(target); } catch {}
      await existing.focus();
      return;
    }
    await self.clients.openWindow(target);
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const freshRequest = new Request(request, { cache: 'reload' });
        const response = await fetch(freshRequest);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(scopedUrl('./index.html'), response.clone());
        }
        return response;
      } catch {
        return caches.match(scopedUrl('./index.html'));
      }
    })());
    return;
  }

  if (request.destination === 'image') {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.startsWith('image/')) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      const freshRequest = new Request(request, { cache: 'reload' });
      const response = await fetch(freshRequest);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw error;
    }
  })());
});
