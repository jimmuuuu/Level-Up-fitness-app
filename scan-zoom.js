(() => {
  let zoom = 1;
  let nativeZoom = false;
  let minZoom = 1;
  let maxZoom = 3;
  let stepZoom = 0.1;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let lastTrack = null;
  let captureWrapped = false;

  const clamp = value => Math.max(minZoom, Math.min(maxZoom, Number(value) || 1));
  const distance = touches => {
    if (!touches || touches.length < 2) return 0;
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  };

  function video() { return document.getElementById('scanCamera'); }
  function shell() { return document.querySelector('#scan .scan-shell'); }

  function important(element, property, value) {
    if (!element) return;
    element.style.setProperty(property, value, 'important');
  }

  function alignScanLayout() {
    const root = shell();
    if (!root) return;

    const narrow = window.innerWidth <= 380;
    const compact = window.innerHeight <= 760;
    const topEdge = narrow ? '14px' : '20px';
    const controlEdge = narrow ? '14px' : '22px';
    const stackWidth = narrow ? 'calc(100vw - 44px)' : 'min(calc(100vw - 72px), 360px)';
    const statusBottom = compact
      ? 'calc(218px + max(8px, env(safe-area-inset-bottom)))'
      : 'calc(250px + max(10px, env(safe-area-inset-bottom)))';
    const zoomBottom = compact
      ? 'calc(152px + max(8px, env(safe-area-inset-bottom)))'
      : 'calc(178px + max(10px, env(safe-area-inset-bottom)))';
    const controlsBottom = compact
      ? 'calc(54px + max(8px, env(safe-area-inset-bottom)))'
      : 'calc(64px + max(10px, env(safe-area-inset-bottom)))';

    const topbar = root.querySelector('.scan-topbar');
    important(topbar, 'left', topEdge);
    important(topbar, 'right', topEdge);
    important(topbar, 'top', compact
      ? 'calc(env(safe-area-inset-top) + 10px)'
      : 'calc(env(safe-area-inset-top) + 14px)');
    important(topbar, 'display', 'grid');
    important(topbar, 'grid-template-columns', narrow ? 'minmax(0, 1fr) 42px' : 'minmax(0, 1fr) 44px');
    important(topbar, 'gap', narrow ? '10px' : '12px');
    important(topbar, 'align-items', 'start');

    const copyCard = root.querySelector('.scan-copy-card');
    important(copyCard, 'width', '100%');
    important(copyCard, 'max-width', 'none');
    important(copyCard, 'min-width', '0');
    important(copyCard, 'box-sizing', 'border-box');
    important(copyCard, 'margin', '0');
    important(copyCard, 'filter', 'none');
    important(copyCard, 'backdrop-filter', 'none');
    important(copyCard, '-webkit-backdrop-filter', 'none');

    const title = copyCard?.querySelector('strong');
    important(title, 'text-shadow', 'none');
    important(title, 'filter', 'none');

    const body = copyCard?.querySelector('span');
    if (body) {
      body.textContent = 'Point your camera at a machine or workout tool. Level Up will identify it and explain how to use it.';
    }

    const about = document.getElementById('scanAbout');
    const aboutSize = narrow ? '42px' : '44px';
    important(about, 'width', aboutSize);
    important(about, 'height', aboutSize);
    important(about, 'min-width', aboutSize);
    important(about, 'min-height', aboutSize);
    important(about, 'justify-self', 'end');
    important(about, 'align-self', 'start');

    const status = document.getElementById('scanStatus');
    if (status?.textContent?.startsWith('Center the machine in the frame')) {
      status.textContent = 'Center the machine, then tap scan.';
    }
    important(status, 'left', '50%');
    important(status, 'right', 'auto');
    important(status, 'width', stackWidth);
    important(status, 'max-width', 'none');
    important(status, 'transform', 'translateX(-50%)');
    important(status, 'bottom', statusBottom);
    important(status, 'box-sizing', 'border-box');
    important(status, 'margin', '0');

    const zoomControls = document.getElementById('scanZoomControls');
    important(zoomControls, 'left', '50%');
    important(zoomControls, 'right', 'auto');
    important(zoomControls, 'width', stackWidth);
    important(zoomControls, 'max-width', 'none');
    important(zoomControls, 'transform', 'translateX(-50%)');
    important(zoomControls, 'bottom', zoomBottom);
    important(zoomControls, 'box-sizing', 'border-box');
    important(zoomControls, 'grid-template-columns', narrow
      ? '36px minmax(0, 1fr) 36px 44px'
      : '36px minmax(0, 1fr) 36px 46px');

    const controls = root.querySelector('.scan-controls');
    important(controls, 'left', controlEdge);
    important(controls, 'right', controlEdge);
    important(controls, 'bottom', controlsBottom);
    important(controls, 'grid-template-columns', narrow
      ? '60px minmax(0, 1fr) 60px'
      : '66px minmax(0, 1fr) 66px');
    important(controls, 'gap', narrow ? '10px' : '14px');
    important(controls, 'margin', '0');

    root.querySelectorAll('.scan-control-small').forEach(button => {
      const sideSize = narrow ? '60px' : '66px';
      important(button, 'width', sideSize);
      important(button, 'min-width', sideSize);
      important(button, 'box-sizing', 'border-box');
      important(button, 'justify-self', 'center');
    });

    const capture = document.getElementById('scanCapture');
    const captureSize = compact ? '74px' : '80px';
    important(capture, 'width', captureSize);
    important(capture, 'height', captureSize);
    important(capture, 'justify-self', 'center');
  }

  function ensureControls() {
    const root = shell();
    if (!root) return;

    let controls = document.getElementById('scanZoomControls');
    if (!controls) {
      controls = document.createElement('div');
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

    alignScanLayout();
  }

  function installCaptureZoom() {
    if (captureWrapped) return;
    try {
      if (typeof canvasDataUrl !== 'function') return;
      const originalCanvasDataUrl = canvasDataUrl;
      const wrapped = function(source, width, height) {
        const camera = video();
        if (source !== camera || nativeZoom || zoom <= 1.001) {
          return originalCanvasDataUrl(source, width, height);
        }

        const sourceWidth = Number(width) || camera?.videoWidth || 0;
        const sourceHeight = Number(height) || camera?.videoHeight || 0;
        if (!sourceWidth || !sourceHeight) return originalCanvasDataUrl(source, width, height);

        const cropWidth = sourceWidth / zoom;
        const cropHeight = sourceHeight / zoom;
        const sourceX = (sourceWidth - cropWidth) / 2;
        const sourceY = (sourceHeight - cropHeight) / 2;
        const scale = Math.min(1, 1280 / Math.max(cropWidth, cropHeight));
        const outputWidth = Math.max(1, Math.round(cropWidth * scale));
        const outputHeight = Math.max(1, Math.round(cropHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const context = canvas.getContext('2d', { alpha: false });
        context.drawImage(source, sourceX, sourceY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
        return canvas.toDataURL('image/jpeg', 0.82);
      };
      wrapped.__scanZoomWrapped = true;
      canvasDataUrl = wrapped;
      captureWrapped = true;
    } catch {}
  }

  async function detectZoomSupport() {
    ensureControls();
    installCaptureZoom();
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
    installCaptureZoom();
    alignScanLayout();
    void detectZoomSupport();
  });

  function start() {
    ensureControls();
    installCaptureZoom();
    alignScanLayout();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', alignScanLayout, { passive: true });
    window.addEventListener('orientationchange', alignScanLayout, { passive: true });
    setInterval(() => {
      installCaptureZoom();
      alignScanLayout();
      void detectZoomSupport();
    }, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();