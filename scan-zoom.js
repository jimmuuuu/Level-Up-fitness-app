(() => {
  let zoom = 1;
  let nativeZoom = false;
  let minZoom = 1;
  let maxZoom = 3;
  let stepZoom = 0.1;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let lastTrack = null;

  const clamp = value => Math.max(minZoom, Math.min(maxZoom, Number(value) || 1));
  const distance = touches => {
    if (!touches || touches.length < 2) return 0;
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  };

  function video() { return document.getElementById('scanCamera'); }
  function shell() { return document.querySelector('#scan .scan-shell'); }

  function ensureControls() {
    const root = shell();
    if (!root || document.getElementById('scanZoomControls')) return;
    const controls = document.createElement('div');
    controls.id = 'scanZoomControls';
    controls.className = 'scan-zoom-controls';
    controls.innerHTML = `
      <button type="button" data-zoom-step="-1" aria-label="Zoom out">−</button>
      <input id="scanZoomRange" type="range" min="1" max="3" step="0.1" value="1" aria-label="Camera zoom">
      <button type="button" data-zoom-step="1" aria-label="Zoom in">+</button>
      <span id="scanZoomLabel">1.0×</span>`;
    root.appendChild(controls);

    const range = document.getElementById('scanZoomRange');
    range?.addEventListener('input', () => { void setZoom(Number(range.value)); });
    controls.querySelectorAll('[data-zoom-step]').forEach(button => {
      button.onclick = () => { void setZoom(zoom + Number(button.dataset.zoomStep) * Math.max(stepZoom, 0.25)); };
    });

    root.addEventListener('touchstart', event => {
      if (event.touches.length !== 2) return;
      pinchStartDistance = distance(event.touches);
      pinchStartZoom = zoom;
    }, { passive: true });

    root.addEventListener('touchmove', event => {
      if (event.touches.length !== 2 || !pinchStartDistance) return;
      const ratio = distance(event.touches) / pinchStartDistance;
      void setZoom(pinchStartZoom * ratio);
      event.preventDefault();
    }, { passive: false });

    root.addEventListener('touchend', event => {
      if (event.touches.length < 2) pinchStartDistance = 0;
    }, { passive: true });
  }

  async function detectZoomSupport() {
    ensureControls();
    const camera = video();
    const track = camera?.srcObject?.getVideoTracks?.()[0] || null;
    if (!track || track === lastTrack) return;
    lastTrack = track;
    nativeZoom = false;
    minZoom = 1;
    maxZoom = 3;
    stepZoom = 0.1;
    try {
      const caps = track.getCapabilities?.() || {};
      if (caps.zoom && Number.isFinite(caps.zoom.min) && Number.isFinite(caps.zoom.max)) {
        nativeZoom = true;
        minZoom = Number(caps.zoom.min);
        maxZoom = Number(caps.zoom.max);
        stepZoom = Number(caps.zoom.step) || 0.1;
        const settings = track.getSettings?.() || {};
        zoom = clamp(Number(settings.zoom) || minZoom);
      } else {
        zoom = 1;
      }
    } catch {
      zoom = 1;
    }
    syncUi();
    await setZoom(zoom);
  }

  function syncUi() {
    const range = document.getElementById('scanZoomRange');
    const label = document.getElementById('scanZoomLabel');
    if (range) {
      range.min = String(minZoom);
      range.max = String(maxZoom);
      range.step = String(stepZoom);
      range.value = String(clamp(zoom));
    }
    if (label) label.textContent = `${zoom.toFixed(1)}×`;
  }

  async function setZoom(value) {
    zoom = clamp(value);
    const camera = video();
    const track = camera?.srcObject?.getVideoTracks?.()[0] || null;
    if (nativeZoom && track) {
      try {
        await track.applyConstraints({ advanced: [{ zoom }] });
        camera.style.transform = '';
      } catch {
        nativeZoom = false;
      }
    }
    if (!nativeZoom && camera) {
      camera.style.transformOrigin = '50% 50%';
      camera.style.transform = `scale(${zoom})`;
    }
    syncUi();
  }

  const observer = new MutationObserver(() => {
    ensureControls();
    void detectZoomSupport();
  });

  function start() {
    ensureControls();
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(() => { void detectZoomSupport(); }, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
