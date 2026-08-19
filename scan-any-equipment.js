(() => {
  function updateScanCopy() {
    const scan = document.getElementById('scan');
    if (!scan) return;

    const strong = scan.querySelector('.scan-copy-card strong');
    const detail = scan.querySelector('.scan-copy-card span');
    if (strong) strong.textContent = 'Scan gym equipment';
    if (detail) detail.textContent = 'Point your camera at any machine, dumbbell, barbell, bench, cable attachment, cardio machine, or other workout tool. Level Up will identify it and explain what it is used for.';

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

  function refresh() {
    updateScanCopy();
    updateResultCopy();
  }

  document.addEventListener('click', event => {
    if (event.target?.closest?.('[data-page="scan"], #scanCapture, #scanUpload, [data-scan-retake]')) {
      setTimeout(refresh, 0);
      setTimeout(refresh, 250);
    }
  }, true);

  const attachResultObserver = () => {
    const sheet = document.getElementById('scanResultSheet');
    if (!sheet || sheet.dataset.anyEquipmentObserver === 'true') return;
    sheet.dataset.anyEquipmentObserver = 'true';
    const observer = new MutationObserver(updateResultCopy);
    observer.observe(sheet, { childList: true });
  };

  function start() {
    refresh();
    attachResultObserver();
    setTimeout(() => { refresh(); attachResultObserver(); }, 300);
    setTimeout(() => { refresh(); attachResultObserver(); }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
