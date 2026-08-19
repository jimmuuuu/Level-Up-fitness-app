(() => {
  let saving = false;

  function statusNode() {
    return document.getElementById('photoStatus');
  }

  function setStatus(message) {
    const status = statusNode();
    if (status) status.textContent = message;
  }

  function saveFunction() {
    try {
      if (typeof window.confirmProfilePhoto === 'function') return window.confirmProfilePhoto;
    } catch {}
    try {
      if (typeof confirmProfilePhoto === 'function') return confirmProfilePhoto;
    } catch {}
    return null;
  }

  async function savePhoto(event) {
    const button = event.target?.closest?.('#confirmProfilePhoto');
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (saving) return;
    const save = saveFunction();
    if (!save) {
      setStatus('Photo save is not ready yet. Close and reopen Level Up, then try again.');
      return;
    }

    saving = true;
    button.disabled = true;
    button.textContent = 'Saving...';
    setStatus('Saving photo...');

    try {
      await save();

      const actions = document.getElementById('profilePhotoActions');
      const saved = !actions || actions.classList.contains('hidden');
      if (!saved) {
        setStatus('The photo is still in preview. Tap Save photo again, or choose a different image.');
      }
    } catch (error) {
      setStatus('The photo could not be saved. Try a different image.');
      console.error('Level Up profile photo save failed', error);
    } finally {
      saving = false;
      const currentButton = document.getElementById('confirmProfilePhoto');
      const currentActions = document.getElementById('profilePhotoActions');
      if (currentButton && currentActions && !currentActions.classList.contains('hidden')) {
        currentButton.disabled = false;
        currentButton.textContent = 'Save photo';
      }
    }
  }

  // Capture phase makes this reliable even if Profile is rerendered and its
  // direct onclick handler is temporarily replaced during the same session.
  document.addEventListener('click', event => {
    if (!event.target?.closest?.('#confirmProfilePhoto')) return;
    void savePhoto(event);
  }, true);
})();
