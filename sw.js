const CACHE = 'level-up-fitness-20260817-weightrecs';
const CORE = [
  './', './index.html', './app.css', './app.js', './supabase-config.js', './manifest.webmanifest',
  './theme.css', './navigation-simplify.css', './navigation-simplify.js',
  './set-history.css', './set-history.js', './workout-summary.css', './workout-summary.js',
  './weight-recommendations.css', './weight-recommendations.js',
  './assets/app-icon-180.png', './assets/app-icon-192.png', './assets/app-icon-512.png',
  './assets/MaleBody.png', './assets/MaleBodyFront.png', './assets/MaleBodyBack.png',
  './assets/workouts/kettlebell.png', './assets/workouts/functional-trainer.png',
  './assets/workouts/upper-body-tower.png', './assets/workouts/barbell.png',
  './assets/workouts/bench-press.png', './assets/workouts/lat-pulldown.png',
  './assets/workouts/hip-thrust.png', './assets/workouts/ab-wheel.png',
  './assets/workouts/dumbbell.png', './assets/workouts/machine.png',
  './assets/workouts/treadmill.png', './assets/workouts/timer.png',
  './assets/ranks/foundation.png', './assets/ranks/iron.png',
  './assets/ranks/bronze.png', './assets/ranks/silver.png',
  './assets/ranks/gold.png', './assets/ranks/platinum.png',
  './assets/ranks/diamond.png', './assets/ranks/champion.png',
  './assets/ranks/mythic.png', './assets/ranks/apex.png'
];
const SHELL = CORE.slice(0, 15);
const ASSETS = CORE.slice(15);
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
