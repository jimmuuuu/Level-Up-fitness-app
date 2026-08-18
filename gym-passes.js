(() => {
  const STORAGE_PREFIX = 'levelUpFitnessGymPasses:';
  const MAX_PASSES = 8;
  const MAX_EDGE = 1200;
  const JPEG_QUALITY = 0.72;

  let passes = [];
  let ownerId = 'local';
  let draft = null;

  const byId = id => document.getElementById(id);
  const esc = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  async function resolveOwner() {
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (client) {
        const session = (await client.auth.getSession()).data?.session;
        if (session?.user?.id) return `supabase:${session.user.id}`;
      }
    } catch {}
    try {
      const accountKey = String(userProfile?.accountKey || '').trim();
      if (accountKey) return `profile:${accountKey}`;
      const email = String(userProfile?.email || '').trim().toLowerCase();
      if (email) return `email:${email}`;
    } catch {}
    return 'local';
  }

  function storageKey() {
    return `${STORAGE_PREFIX}${ownerId}`;
  }

  function loadPasses() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey()) || '[]');
      passes = Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, MAX_PASSES) : [];
    } catch {
      passes = [];
    }
  }

  function savePasses() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(passes.slice(0, MAX_PASSES)));
      return true;
    } catch {
      alert('This pass could not be saved. The stored images may be too large for this browser.');
      return false;
    }
  }

  function createUi() {
    const profile = byId('profile');
    if (!profile || byId('gymPassesSection')) return;

    const section = document.createElement('section');
    section.id = 'gymPassesSection';
    section.className = 'gym-passes-section';
    section.innerHTML = `
      <div class="gym-passes-heading">
        <div>
          <div class="over">GYM ACCESS</div>
          <h2>Gym Passes</h2>
          <p class="gym-passes-copy">Keep a physical membership card or a static digital pass inside Level Up for quick access.</p>
        </div>
        <button id="gymPassAdd" class="gym-pass-add" type="button">Add pass</button>
      </div>
      <div id="gymPassesList" class="gym-passes-list"></div>
      <p class="gym-pass-security-note">Pass images are stored only on this device and are not uploaded to Level Up. Some gyms use changing or app-only codes, so a saved image may not work for every membership.</p>`;

    const settings = byId('profileSettingsPanel');
    if (settings) settings.insertAdjacentElement('beforebegin', section);
    else profile.appendChild(section);

    const modal = document.createElement('div');
    modal.id = 'gymPassModal';
    modal.className = 'gym-pass-modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div id="gymPassSheet" class="gym-pass-sheet"></div>';
    document.body.appendChild(modal);

    byId('gymPassAdd').onclick = openAddMenu;
    modal.addEventListener('click', event => {
      if (event.target === modal) closeModal();
    });
  }

  function renderList() {
    const list = byId('gymPassesList');
    if (!list) return;
    if (!passes.length) {
      list.innerHTML = '<div class="gym-pass-empty">No memberships saved yet. Add a physical card, import a static digital pass, or enter membership details manually.</div>';
      return;
    }

    list.innerHTML = passes.map(pass => {
      const preview = pass.displayImage || pass.frontImage || pass.backImage || '';
      const badge = pass.source === 'digital' ? 'Digital import' : pass.source === 'physical' ? 'Scanned card' : 'Manual';
      return `
        <article class="gym-pass-card" data-pass-id="${esc(pass.id)}">
          <div class="gym-pass-card-top">
            <div>
              <h3 class="gym-pass-name">${esc(pass.gymName || 'Gym membership')}</h3>
              <p class="gym-pass-type">${esc(pass.membershipType || 'Membership')}</p>
            </div>
            <span class="gym-pass-badge">${esc(badge)}</span>
          </div>
          ${preview ? `<img class="gym-pass-preview" src="${preview}" alt="${esc(pass.gymName || 'Gym')} pass image">` : ''}
          ${pass.memberId ? `<div class="gym-pass-id"><strong>Member ID:</strong> ${esc(pass.memberId)}</div>` : ''}
          <div class="gym-pass-actions">
            <button class="gym-pass-open" type="button" data-open-pass="${esc(pass.id)}">Open pass</button>
            <button type="button" data-edit-pass="${esc(pass.id)}">Edit</button>
          </div>
        </article>`;
    }).join('');

    list.querySelectorAll('[data-open-pass]').forEach(button => button.onclick = () => openViewer(button.dataset.openPass));
    list.querySelectorAll('[data-edit-pass]').forEach(button => button.onclick = () => openEdit(button.dataset.editPass));
  }

  function sheetShell(title, over = 'GYM PASSES') {
    return `
      <div class="gym-pass-handle"></div>
      <div class="gym-pass-sheet-head">
        <div><div class="over">${esc(over)}</div><h2>${esc(title)}</h2></div>
        <button class="gym-pass-close" type="button" data-close-pass aria-label="Close">×</button>
      </div>`;
  }

  function openModal(html) {
    const modal = byId('gymPassModal');
    const sheet = byId('gymPassSheet');
    if (!modal || !sheet) return;
    sheet.innerHTML = html;
    modal.classList.remove('hidden');
    sheet.querySelector('[data-close-pass]')?.addEventListener('click', closeModal);
  }

  function closeModal() {
    byId('gymPassModal')?.classList.add('hidden');
    draft = null;
  }

  function openAddMenu() {
    if (passes.length >= MAX_PASSES) {
      alert(`You can store up to ${MAX_PASSES} gym passes on this device.`);
      return;
    }
    openModal(`${sheetShell('Add a gym membership')}
      <p>Choose the version that matches how your gym gives you access.</p>
      <div class="gym-pass-choice-grid">
        <button class="gym-pass-choice" type="button" data-add-mode="physical">Scan a physical card<small>Take a photo of the front and back of a membership card or key tag.</small></button>
        <button class="gym-pass-choice" type="button" data-add-mode="digital">Import a digital pass<small>Use a screenshot or saved image of a static barcode or QR membership pass.</small></button>
        <button class="gym-pass-choice" type="button" data-add-mode="manual">Enter details manually<small>Save the gym name, membership type, and member ID without a pass image.</small></button>
      </div>`);
    document.querySelectorAll('[data-add-mode]').forEach(button => button.onclick = () => startDraft(button.dataset.addMode));
  }

  function startDraft(source) {
    draft = {
      id: `gym-pass-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source,
      gymName: '',
      membershipType: '',
      memberId: '',
      barcodeValue: '',
      barcodeFormat: '',
      frontImage: '',
      backImage: '',
      displayImage: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (source === 'manual') openDetailsForm();
    else openCaptureForm();
  }

  function openCaptureForm() {
    const physical = draft?.source === 'physical';
    openModal(`${sheetShell(physical ? 'Scan your membership card' : 'Import your digital pass')}
      <p>${physical ? 'Add clear photos of both sides. Level Up will try to detect a barcode or QR code automatically when your browser supports it.' : 'Choose a screenshot or image that clearly shows the membership barcode or QR code.'}</p>
      <div class="gym-pass-photo-grid">
        <div class="gym-pass-photo-slot">
          <div id="gymPassFrontPreview">${draft?.frontImage ? `<img src="${draft.frontImage}" alt="Front of membership">` : '<div class="gym-pass-photo-placeholder">No image yet</div>'}</div>
          <div><strong>${physical ? 'Front' : 'Pass image'}</strong><p>${physical ? 'Take the front of the card.' : 'Choose the screenshot or membership image.'}</p><button type="button" data-pick-image="front">${draft?.frontImage ? 'Replace image' : 'Choose image'}</button></div>
        </div>
        ${physical ? `<div class="gym-pass-photo-slot">
          <div id="gymPassBackPreview">${draft?.backImage ? `<img src="${draft.backImage}" alt="Back of membership">` : '<div class="gym-pass-photo-placeholder">No image yet</div>'}</div>
          <div><strong>Back</strong><p>The barcode is often on this side.</p><button type="button" data-pick-image="back">${draft?.backImage ? 'Replace image' : 'Choose image'}</button></div>
        </div>` : ''}
      </div>
      <div id="gymPassDetectStatus" class="gym-pass-detect-status">No barcode detected yet. That is okay; you can still save the pass image.</div>
      <button id="gymPassCaptureNext" class="gym-pass-submit" type="button">Continue</button>
      <input id="gymPassImageInput" type="file" accept="image/*" capture="environment" hidden>`);

    let targetSide = 'front';
    document.querySelectorAll('[data-pick-image]').forEach(button => button.onclick = () => {
      targetSide = button.dataset.pickImage;
      byId('gymPassImageInput')?.click();
    });
    byId('gymPassImageInput')?.addEventListener('change', async event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      const dataUrl = await compressImage(file).catch(() => '');
      if (!dataUrl) return;
      if (targetSide === 'back') draft.backImage = dataUrl;
      else draft.frontImage = dataUrl;
      if (!draft.displayImage) draft.displayImage = dataUrl;
      const result = await detectBarcode(dataUrl);
      if (result) {
        draft.barcodeValue = result.rawValue || '';
        draft.barcodeFormat = result.format || '';
        draft.displayImage = dataUrl;
      }
      openCaptureForm();
      const status = byId('gymPassDetectStatus');
      if (status && draft.barcodeValue) status.textContent = `Barcode detected${draft.barcodeFormat ? ` (${draft.barcodeFormat})` : ''}.`;
    });
    if (draft?.barcodeValue) byId('gymPassDetectStatus').textContent = `Barcode detected${draft.barcodeFormat ? ` (${draft.barcodeFormat})` : ''}.`;
    byId('gymPassCaptureNext').onclick = () => {
      if (!draft.frontImage && !draft.backImage) {
        alert('Add at least one image first.');
        return;
      }
      openDetailsForm();
    };
  }

  function openDetailsForm(editing = false) {
    openModal(`${sheetShell(editing ? 'Edit gym pass' : 'Membership details')}
      <p>Add enough information so you can recognize the pass quickly at check-in.</p>
      <div class="gym-pass-form">
        <label class="gym-pass-field"><span>Gym name</span><input id="gymPassGymName" maxlength="60" autocomplete="organization" placeholder="Planet Fitness, Genesis Health Clubs..." value="${esc(draft?.gymName || '')}"></label>
        <label class="gym-pass-field"><span>Membership type</span><input id="gymPassType" maxlength="60" placeholder="Black Card, Basic, Student..." value="${esc(draft?.membershipType || '')}"></label>
        <label class="gym-pass-field"><span>Member ID (optional)</span><input id="gymPassMemberId" maxlength="100" autocomplete="off" placeholder="Membership number" value="${esc(draft?.memberId || '')}"></label>
      </div>
      ${draft?.barcodeValue ? `<div class="gym-pass-detect-status">Detected code: ${esc(draft.barcodeValue.slice(0, 80))}${draft.barcodeValue.length > 80 ? '…' : ''}</div>` : ''}
      <button id="gymPassSave" class="gym-pass-submit" type="button">${editing ? 'Save changes' : 'Save gym pass'}</button>
      ${editing ? '<button id="gymPassDelete" class="gym-pass-danger" type="button">Delete pass</button>' : ''}`);

    byId('gymPassSave').onclick = () => saveDraft(editing);
    if (editing) byId('gymPassDelete').onclick = () => deleteDraft();
  }

  function saveDraft(editing) {
    if (!draft) return;
    draft.gymName = byId('gymPassGymName')?.value.trim() || '';
    draft.membershipType = byId('gymPassType')?.value.trim() || '';
    draft.memberId = byId('gymPassMemberId')?.value.trim() || '';
    draft.updatedAt = Date.now();
    if (!draft.gymName) {
      alert('Enter the gym name first.');
      return;
    }
    if (!draft.membershipType) draft.membershipType = 'Membership';

    if (editing) {
      const index = passes.findIndex(pass => pass.id === draft.id);
      if (index >= 0) passes[index] = { ...draft };
    } else {
      passes.unshift({ ...draft });
    }
    if (!savePasses()) return;
    renderList();
    closeModal();
  }

  function deleteDraft() {
    if (!draft) return;
    const okay = confirm(`Delete ${draft.gymName || 'this gym pass'} from Level Up?`);
    if (!okay) return;
    passes = passes.filter(pass => pass.id !== draft.id);
    savePasses();
    renderList();
    closeModal();
  }

  function openEdit(id) {
    const pass = passes.find(item => item.id === id);
    if (!pass) return;
    draft = JSON.parse(JSON.stringify(pass));
    openDetailsForm(true);
  }

  function openViewer(id) {
    const pass = passes.find(item => item.id === id);
    if (!pass) return;
    const image = pass.displayImage || pass.backImage || pass.frontImage || '';
    openModal(`${sheetShell(pass.gymName || 'Gym pass', 'CHECK-IN PASS')}
      <p>${esc(pass.membershipType || 'Membership')}</p>
      ${image ? `<img class="gym-pass-viewer-image" src="${image}" alt="${esc(pass.gymName || 'Gym')} membership pass">` : '<div class="gym-pass-empty">This membership has no pass image. Use the member ID below if your gym accepts manual check-in.</div>'}
      <div class="gym-pass-viewer-meta">
        ${pass.memberId ? `<div><strong>Member ID:</strong> ${esc(pass.memberId)}</div>` : ''}
        ${pass.barcodeFormat ? `<div><strong>Detected code type:</strong> ${esc(pass.barcodeFormat)}</div>` : ''}
        <div>For static passes only. If your gym uses a changing QR code or requires its official app, open the official gym app instead.</div>
      </div>
      ${(pass.frontImage && pass.backImage && pass.frontImage !== pass.backImage) ? '<button id="gymPassFlip" class="gym-pass-submit" type="button">Show other side</button>' : ''}`);

    if (byId('gymPassFlip')) {
      let showingBack = image === pass.backImage;
      byId('gymPassFlip').onclick = () => {
        showingBack = !showingBack;
        const viewer = document.querySelector('.gym-pass-viewer-image');
        if (viewer) viewer.src = showingBack ? pass.backImage : pass.frontImage;
      };
    }
  }

  async function compressImage(file) {
    const image = await loadImageFromFile(file);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  }

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Unable to open image')); };
      image.src = url;
    });
  }

  function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });
  }

  async function detectBarcode(dataUrl) {
    if (!('BarcodeDetector' in window)) return null;
    try {
      let detector;
      try {
        const supported = await BarcodeDetector.getSupportedFormats?.();
        detector = Array.isArray(supported) && supported.length ? new BarcodeDetector({ formats: supported }) : new BarcodeDetector();
      } catch {
        detector = new BarcodeDetector();
      }
      const image = await loadImageFromDataUrl(dataUrl);
      const results = await detector.detect(image);
      return Array.isArray(results) && results.length ? results[0] : null;
    } catch {
      return null;
    }
  }

  async function refreshOwnerAndRender() {
    const nextOwner = await resolveOwner();
    if (nextOwner !== ownerId) ownerId = nextOwner;
    loadPasses();
    renderList();
  }

  function watchAuth() {
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      client?.auth?.onAuthStateChange?.(() => window.setTimeout(() => void refreshOwnerAndRender(), 0));
    } catch {}
  }

  function start() {
    createUi();
    void refreshOwnerAndRender();
    watchAuth();
  }

  window.LevelUpGymPasses = {
    refresh: refreshOwnerAndRender,
    add: openAddMenu,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
