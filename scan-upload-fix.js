(() => {
  function prepareScanFilePicker() {
    const input = document.getElementById('scanFile');
    if (!input) return;

    // On iPhone, capture="environment" forces this control straight into the
    // camera. Scan already has its own live camera button, so Upload should
    // remain a normal file/photo picker instead.
    input.removeAttribute('capture');
    input.setAttribute('accept', 'image/*');
  }

  document.addEventListener('click', event => {
    if (!event.target?.closest?.('#scanUpload')) return;
    // Run before scan-feature.js handles the same click and calls input.click().
    prepareScanFilePicker();
  }, true);

  window.addEventListener('pageshow', prepareScanFilePicker);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') prepareScanFilePicker();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prepareScanFilePicker, { once: true });
  } else {
    prepareScanFilePicker();
  }
})();
