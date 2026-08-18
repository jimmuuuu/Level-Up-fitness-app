(() => {
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const STEP = 0.1;
  let zoom = 1;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let bound = false;

  const byId = id => document.getElementById(id);
  const clamp = value => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(value) || 1));

  function distance(touches) {
    if (!touches || touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function ensureControl() {
    const shell = document.querySelector('#scan .scan-shell');
    if (!shell || byId('scanZoomControl')) return;
    const control = document.createElement('div');
    control.id = 'scanZoomControl';
    control.className = 'scan-zoom-control';
    control.innerHTML = `
      <button type="button" data-zoom-reset>1×</button>
      <input id="scanZoomRange" type="range" min="1" max="3" step="0.1" value="1" aria-label="Camera zoom">
      <output id="scanZoomValue" for="scanZoomRange">1.0×</output>`;
    const controls = shell.querySelector('.scan-controls');
    if (controls) controls.insertAdjacentElement('beforebegin', control);
    else shell.appendChild(control);

    byId('scanZoomRange')?.addEventListener('input', event => setZoom(event.target.value));
    control.querySelector('[data-zoom-reset]')?.addEventListener('click', () => setZoom(1));
  }

  function setZoom(value) {
    zoom = Math.round(clamp(value) * 10) / 10;
    const video = byId('scanCamera');
    const range = byId('scanZoomRange');
    const output = byId('scanZoomValue');
    if (video) {
      video.classList.toggle('scan-digital-zoom', zoom > 1.001);
      video.style.transform = zoom > 1.001 ? `scale(${zoom})` : '';
    }
    if (range) range.value = String(zoom);
    if (output) output.textContent = `${zoom.toFixed(1)}×`;
  }

  function visibleCamera() {
    const video = byId('scanCamera');
    return Boolean(video && !video.classList.contains('hidden') && video.srcObject && video.videoWidth);
  }

  async function captureCroppedFrame(event) {
    if (zoom <= 1.001 || !visibleCamera()) return;
    const video = byId('scanCamera');
    const input = byId('scanFile');
    if (!video || !input) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    try {
      const cropWidth = video.videoWidth / zoom;
      const cropHeight = video.videoHeight / zoom;
      const sourceX = (video.videoWidth - cropWidth) / 2;
      const sourceY = (video.videoHeight - cropHeight) / 2;
      const maxEdge = 1280;
      const scale = Math.min(1, maxEdge / Math.max(cropWidth, cropHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(cropWidth * scale));
      canvas.height = Math.max(1, Math.round(cropHeight * scale));
      const context = canvas.getContext('2d', { alpha: false });
      context.drawImage(
        video,
        sourceX,
        sourceY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.84));
      if (!blob) throw new Error('Unable to capture zoomed image');
      const file = new File([blob], `level-up-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } catch {
      /* If browser file injection is unavailable, fall back to the normal capture path. */
      const clone = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
      window.setTimeout(() => {
        const capture = byId('scanCapture');
        if (!capture) return;
        const oldZoom = zoom;
        setZoom(1);
        capture.dispatchEvent(clone);
        setZoom(oldZoom);
      }, 0);
    }
  }

  function bindPinch() {
    const video = byId('scanCamera');
    if (!video || video.dataset.zoomBound === 'true') return;
    video.dataset.zoomBound = 'true';

    video.addEventListener('touchstart', event => {
      if (event.touches.length !== 2) return;
      pinchStartDistance = distance(event.touches);
      pinchStartZoom = zoom;
    }, { passive: true });

    video.addEventListener('touchmove', event => {
      if (event.touches.length !== 2 || !pinchStartDistance) return;
      const ratio = distance(event.touches) / pinchStartDistance;
      setZoom(pinchStartZoom * ratio);
    }, { passive: true });

    video.addEventListener('touchend', event => {
      if (event.touches.length < 2) pinchStartDistance = 0;
    }, { passive: true });
  }

  function updateVisibility() {
    const control = byId('scanZoomControl');
    const video = byId('scanCamera');
    if (!control || !video) return;
    control.classList.toggle('hidden', video.classList.contains('hidden'));
  }

  function bind() {
    ensureControl();
    bindPinch();
    updateVisibility();
    if (bound) return;
    bound = true;

    document.addEventListener('click', event => {
      if (!event.target.closest('#scanCapture')) return;
      void captureCroppedFrame(event);
    }, true);

    const scan = byId('scan');
    if (scan) {
      new MutationObserver(() => {
        ensureControl();
        bindPinch();
        updateVisibility();
      }).observe(scan, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
  }

  function start() {
    const wait = () => {
      if (byId('scanCamera')) bind();
      else window.setTimeout(wait, 120);
    };
    wait();
  }

  window.LevelUpScanZoom = {
    getZoom: () => zoom,
    setZoom
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
