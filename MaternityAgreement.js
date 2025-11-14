(function () {
  // ============= DATA FUNCTIONS =============
  
  function loadAgreements() {
    try {
      const raw = localStorage.getItem('maternity');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAgreements(data) {
    localStorage.setItem('maternity', JSON.stringify(data));
  }

  // ============= UI INITIALIZATION =============

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const sortSelect = document.getElementById('sortSelect');
  const addNewBtn = document.getElementById('addNew');
  const agreementModal = document.getElementById('agreementModal');
  const agreementForm = document.getElementById('agreementForm');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelFormBtn = document.getElementById('cancelForm');
  const modalTitle = document.getElementById('modalTitle');
  const startDateInput = document.getElementById('formStartDate');
  const endDateInput = document.getElementById('formEndDate');
  const durationInput = document.getElementById('formDuration');

  let currentSearchTerm = '';
  let currentSort = '';
  let editingIndex = -1;

  // Calculate duration when dates change
  function calculateDuration() {
    const start = startDateInput.value;
    const end = endDateInput.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const timeDiff = endDate - startDate;
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      durationInput.value = daysDiff > 0 ? daysDiff : 0;
    } else {
      durationInput.value = '';
    }
  }

  if (startDateInput) {
    startDateInput.addEventListener('change', calculateDuration);
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', calculateDuration);
  }

  // Search functionality
  function filterAndRender() {
    renderAgreements();
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentSearchTerm = this.value.toLowerCase().trim();
      filterAndRender();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      currentSearchTerm = '';
      filterAndRender();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      currentSort = this.value || '';
      filterAndRender();
    });
  }

  // Modal controls
  function openModal(title = 'Create New Maternity Agreement', index = -1) {
    editingIndex = index;
    modalTitle.textContent = title;
    
    if (index === -1) {
      // New agreement
      agreementForm.reset();
      durationInput.value = '';
      document.getElementById('formUsername').focus();
    } else {
      // Edit existing
      const agreements = loadAgreements();
      const agreement = agreements[index];
      document.getElementById('formUsername').value = agreement.username || '';
      document.getElementById('formEmpName').value = agreement.empName || '';
      document.getElementById('formStartDate').value = agreement.startDate || '';
      document.getElementById('formEndDate').value = agreement.endDate || '';
      document.getElementById('formDuration').value = agreement.duration || '';
      document.getElementById('formPosition').value = agreement.position || '';
      document.getElementById('formDepartment').value = agreement.department || '';
      document.getElementById('formStatus').value = agreement.status || 'Active';
      document.getElementById('formNotes').value = agreement.notes || '';
    }

    agreementModal.classList.add('show');
  }

  function closeModal() {
    agreementModal.classList.remove('show');
    agreementForm.reset();
    durationInput.value = '';
    editingIndex = -1;
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (cancelFormBtn) {
    cancelFormBtn.addEventListener('click', closeModal);
  }

  if (addNewBtn) {
    addNewBtn.addEventListener('click', function () {
      openModal('Create New Maternity Agreement', -1);
    });
  }

  // Form submission
  if (agreementForm) {
    agreementForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const agreements = loadAgreements();
      const newAgreement = {
        id: Date.now().toString(),
        username: document.getElementById('formUsername').value.trim(),
        empName: document.getElementById('formEmpName').value.trim(),
        startDate: document.getElementById('formStartDate').value,
        endDate: document.getElementById('formEndDate').value,
        duration: document.getElementById('formDuration').value,
        position: document.getElementById('formPosition').value.trim(),
        department: document.getElementById('formDepartment').value.trim(),
        status: document.getElementById('formStatus').value,
        notes: document.getElementById('formNotes').value.trim()
      };

      if (!newAgreement.username || !newAgreement.empName || !newAgreement.startDate || !newAgreement.endDate) {
        alert('Please fill in all required fields');
        return;
      }

      if (editingIndex === -1) {
        // Add new
        agreements.push(newAgreement);
      } else {
        // Update existing
        newAgreement.id = agreements[editingIndex].id;
        agreements[editingIndex] = newAgreement;
      }

      saveAgreements(agreements);
      closeModal();
      filterAndRender();
    });
  }

  // ============= RENDER FUNCTIONS =============

  function matchesSearch(agreement) {
    if (!currentSearchTerm) return true;
    const name = (agreement.empName || '').toLowerCase();
    const username = (agreement.username || '').toLowerCase();
    return name.includes(currentSearchTerm) || username.includes(currentSearchTerm);
  }

  function applySort(agreements, sortKey) {
    if (!sortKey) return agreements.slice();
    var copy = agreements.slice();
    if (sortKey === 'name-asc') return copy.sort(function(a,b){ var na=(a.empName||'').toLowerCase(), nb=(b.empName||'').toLowerCase(); return na<nb?-1:na>nb?1:0; });
    if (sortKey === 'name-desc') return copy.sort(function(a,b){ var na=(a.empName||'').toLowerCase(), nb=(b.empName||'').toLowerCase(); return na>nb?-1:na<nb?1:0; });
    if (sortKey === 'date-newest') return copy.sort(function(a,b){ var da=a.startDate||'', db=b.startDate||''; return db < da ? -1 : db > da ? 1 : 0; });
    if (sortKey === 'date-oldest') return copy.sort(function(a,b){ var da=a.startDate||'', db=b.startDate||''; return da < db ? -1 : da > db ? 1 : 0; });
    return copy;
  }

  function renderAgreements() {
    const list = document.getElementById('agreementsList');
    const empty = document.getElementById('emptyMsg');
  const agreements = loadAgreements();
  const template = document.getElementById('agreementItemTemplate');
  const items = applySort(agreements, currentSort);

    if (!list || !template) return;

    list.innerHTML = '';
    let count = 0;

    items.forEach(function (agreement, idx) {
      if (!matchesSearch(agreement)) return;

      count++;
      const clone = template.content.cloneNode(true);

      clone.querySelector('.agreement-title').textContent = 'Maternity Leave - ' + (agreement.empName || '—');
      clone.querySelector('.agreement-meta').textContent = 'ID: ' + (agreement.id || '—');
      clone.querySelector('.empName').textContent = agreement.empName || '—';
      clone.querySelector('.startDate').textContent = agreement.startDate || '—';
      clone.querySelector('.endDate').textContent = agreement.endDate || '—';
      clone.querySelector('.duration').textContent = agreement.duration || '—';

      const statusBadge = clone.querySelector('.status');
      statusBadge.textContent = agreement.status || 'Active';
      statusBadge.setAttribute('data-status', agreement.status || 'Active');

      // View button
      const viewBtn = clone.querySelector('.btn-small.view');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          alert('Viewing maternity agreement for: ' + (agreement.empName || '—') + '\n\nStart: ' + (agreement.startDate || '—') + '\nEnd: ' + (agreement.endDate || '—') + '\nDuration: ' + (agreement.duration || '—') + ' days');
        });
      }

      // Edit button
      const editBtn = clone.querySelector('.btn-small.edit');
      if (editBtn) {
        editBtn.addEventListener('click', function () {
          var realIndex = agreements.findIndex(function(a){ return a.id === agreement.id; });
          openModal('Edit Maternity Agreement', realIndex === -1 ? idx : realIndex);
        });
      }

      // Export button
      const exportBtn = clone.querySelector('.btn-small.export');
      if (exportBtn) {
        exportBtn.addEventListener('click', function () {
          const data = 'Maternity Agreement\n' + JSON.stringify(agreement, null, 2);
          downloadText(data, (agreement.empName || 'maternity') + '_agreement.txt');
        });
      }

      // Delete button
      const deleteBtn = clone.querySelector('.btn-small.delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
          if (confirm('Delete this agreement?')) {
            var realIndex = agreements.findIndex(function(a){ return a.id === agreement.id; });
            if (realIndex !== -1) {
              agreements.splice(realIndex, 1);
              saveAgreements(agreements);
              filterAndRender();
            }
          }
        });
      }

      list.appendChild(clone);
    });

    if (empty) empty.style.display = count === 0 ? 'block' : 'none';
  }

  // ============= HELPER FUNCTIONS =============

  function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Close modal when clicking outside
  window.addEventListener('click', function (e) {
    if (e.target === agreementModal) {
      closeModal();
    }
  });

  // ============= PAGE LOAD =============

  renderAgreements();
})();
