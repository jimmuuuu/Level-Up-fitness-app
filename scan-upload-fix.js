(() => {
  const STYLE_ID = 'levelUpScanMobileStability';
  let drag = null;

  function installStabilityStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html:has(#scan.page:not(.hidden)),
      body:has(#scan.page:not(.hidden)) {
        overflow: hidden !important;
        overscroll-behavior: none !important;
      }

      #appShell:has(#scan.page:not(.hidden)) {
        padding: 0 !important;
        overflow: hidden !important;
      }

      #scan.page {
        position: fixed !important;
        z-index: 10 !important;
        inset: 0 !important;
        width: 100vw !important;
        max-width: none !important;
        height: 100svh !important;
        height: 100dvh !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        transform: none !important;
        background: #050708 !important;
      }

      #scan .scan-shell {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 0 !important;
        overflow: hidden !important;
        touch-action: pan-y !important;
      }

      #scan .scan-camera,
      #scan .scan-photo-preview {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        max-width: none !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center center !important;
        transition: none !important;
      }

      #scan .scan-reticle,
      #scan .scan-reticle::before,
      #scan .scan-reticle::after {
        display: none !important;
      }

      #scan .scan-controls {
        position: absolute !important;
        z-index: 8 !important;
        right: 14px !important;
        bottom: calc(72px + max(10px, env(safe-area-inset-bottom))) !important;
        left: 14px !important;
        grid-template-columns: 68px minmax(92px, 1fr) 68px !important;
        gap: 12px !important;
        margin: 0 !important;
      }

      #scan .scan-status {
        right: 14px !important;
        bottom: calc(230px + max(10px, env(safe-area-inset-bottom))) !important;
        left: 14px !important;
        margin: 0 !important;
      }

      #scan .scan-topbar {
        top: max(10px, env(safe-area-inset-top)) !important;
        right: 12px !important;
        left: 12px !important;
      }

      #scan .scan-result-sheet {
        transform: translate3d(0, var(--scan-sheet-drag, 0px), 0);
        transition: transform 180ms cubic-bezier(.22,.8,.3,1), opacity 180ms ease;
        will-change: transform;
        touch-action: pan-y;
      }

      #scan .scan-result-sheet.scan-sheet-dragging {
        transition: none !important;
      }

      #scan .scan-sheet-handle {
        position: relative;
        width: 76px !important;
        height: 28px !important;
        margin: -7px auto 2px !important;
        border-radius: 999px !important;
        background: transparent !important;
        touch-action: none !important;
        cursor: grab;
      }

      #scan .scan-sheet-handle::after {
        position: absolute;
        top: 10px;
        left: 50%;
        width: 48px;
        height: 5px;
        border-radius: 999px;
        background: #596169;
        transform: translateX(-50%);
        content: '';
      }

      #scan .scan-sheet-handle:active {
        cursor: grabbing;
      }

      @media (max-height: 760px) {
        #scan .scan-controls {
          bottom: calc(64px + max(8px, env(safe-area-inset-bottom))) !important;
        }

        #scan .scan-status {
          bottom: calc(206px + max(8px, env(safe-area-inset-bottom))) !important;
        }
      }

      @media (max-width: 380px) {
        #scan .scan-controls {
          right: 9px !important;
          left: 9px !important;
          grid-template-columns: 58px minmax(82px, 1fr) 58px !important;
          gap: 8px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function prepareScanFilePicker() {
    const input = document.getElementById('scanFile');
    if (!input) return;
    input.removeAttribute('capture');
    input.setAttribute('accept', 'image/*');
  }

  function updateScanCopy() {
    const scan = document.getElementById('scan');
    if (!scan) return;

    const strong = scan.querySelector('.scan-copy-card strong');
    const detail = scan.querySelector('.scan-copy-card span');
    if (strong) strong.textContent = 'Scan gym equipment';
    if (detail) detail.textContent = 'Point your camera at any machine, dumbbell, barbell, bench, cable attachment, cardio machine, or other workout tool. Level Up will identify it and explain how it is commonly used.';

    const loadingTitle = scan.querySelector('.scan-loading-card strong');
    const loadingText = scan.querySelector('.scan-loading-card p');
    if (loadingTitle) loadingTitle.textContent = 'Identifying equipment';
    if (loadingText) loadingText.textContent = 'Analyzing what the equipment is and how it is commonly used.';

    const status = document.getElementById('scanStatus');
    if (status && /Center the machine/i.test(status.textContent || '')) {
      status.textContent = 'Center the equipment in view, then tap the red scan button.';
    }
  }

  function updateResultCopy() {
    const sheet = document.getElementById('scanResultSheet');
    if (!sheet || sheet.classList.contains('hidden')) return;

    sheet.querySelectorAll('.over').forEach(node => {
      if ((node.textContent || '').trim() === 'MACHINE IDENTIFIED') node.textContent = 'EQUIPMENT IDENTIFIED';
    });

    sheet.querySelectorAll('.scan-muscle-chip').forEach(node => {
      if ((node.textContent || '').trim() === 'Muscles need confirmation') {
        node.textContent = 'Muscles vary by exercise or need confirmation';
      }
    });
  }

  function resultSheet() {
    return document.getElementById('scanResultSheet');
  }

  function attachResultObserver() {
    const sheet = resultSheet();
    if (!sheet || sheet.dataset.scanEquipmentObserver === 'true') return;
    sheet.dataset.scanEquipmentObserver = 'true';
    const observer = new MutationObserver(updateResultCopy);
    observer.observe(sheet, { childList: true });
  }

  function resetSheet(sheet) {
    if (!sheet) return;
    sheet.classList.remove('scan-sheet-dragging');
    sheet.style.removeProperty('--scan-sheet-drag');
    sheet.style.removeProperty('opacity');
  }

  function closeResultSheet(sheet) {
    if (!sheet) return;
    const distance = Math.max(window.innerHeight, sheet.offsetHeight + 80);
    sheet.classList.remove('scan-sheet-dragging');
    sheet.style.setProperty('--scan-sheet-drag', `${distance}px`);
    sheet.style.opacity = '0.35';

    window.setTimeout(() => {
      const retake = sheet.querySelector('[data-scan-retake]');
      if (retake) retake.click();
      else sheet.classList.add('hidden');
      resetSheet(sheet);
      updateScanCopy();
    }, 170);
  }

  function beginSheetDrag(event) {
    const handle = event.target?.closest?.('#scanResultSheet .scan-sheet-handle');
    if (!handle) return;
    const sheet = resultSheet();
    if (!sheet || sheet.classList.contains('hidden')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    resetSheet(sheet);
    drag = {
      pointerId: event.pointerId,
      sheet,
      handle,
      startY: event.clientY,
      lastY: event.clientY,
      startTime: performance.now(),
      lastTime: performance.now(),
    };
    sheet.classList.add('scan-sheet-dragging');
    try { handle.setPointerCapture(event.pointerId); } catch {}
    event.preventDefault();
  }

  function moveSheetDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dy = Math.max(0, event.clientY - drag.startY);
    const now = performance.now();
    drag.lastY = event.clientY;
    drag.lastTime = now;
    drag.sheet.style.setProperty('--scan-sheet-drag', `${dy}px`);
    drag.sheet.style.opacity = String(Math.max(0.55, 1 - dy / Math.max(500, drag.sheet.offsetHeight * 1.25)));
    event.preventDefault();
  }

  function endSheetDrag(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const current = drag;
    drag = null;

    const dy = Math.max(0, event.clientY - current.startY);
    const elapsed = Math.max(16, performance.now() - current.startTime);
    const velocity = dy / elapsed;
    const threshold = Math.min(120, Math.max(72, current.sheet.offsetHeight * 0.14));

    try { current.handle.releasePointerCapture(event.pointerId); } catch {}

    if (!cancelled && (dy >= threshold || (dy >= 42 && velocity >= 0.55))) {
      closeResultSheet(current.sheet);
      return;
    }

    current.sheet.classList.remove('scan-sheet-dragging');
    current.sheet.style.setProperty('--scan-sheet-drag', '0px');
    current.sheet.style.opacity = '1';
    window.setTimeout(() => resetSheet(current.sheet), 190);
  }

  function refreshScanUi() {
    installStabilityStyles();
    prepareScanFilePicker();
    updateScanCopy();
    updateResultCopy();
    attachResultObserver();
  }

  document.addEventListener('click', event => {
    if (event.target?.closest?.('#scanUpload')) prepareScanFilePicker();
    if (event.target?.closest?.('[data-page="scan"], #scanCapture, #scanUpload, [data-scan-retake]')) {
      setTimeout(refreshScanUi, 0);
      setTimeout(refreshScanUi, 250);
    }
  }, true);

  document.addEventListener('pointerdown', beginSheetDrag, true);
  document.addEventListener('pointermove', moveSheetDrag, { capture: true, passive: false });
  document.addEventListener('pointerup', event => endSheetDrag(event, false), true);
  document.addEventListener('pointercancel', event => endSheetDrag(event, true), true);

  window.addEventListener('pageshow', () => {
    refreshScanUi();
    resetSheet(resultSheet());
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    refreshScanUi();
  });

  refreshScanUi();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshScanUi, { once: true });
  } else {
    refreshScanUi();
  }
})();
