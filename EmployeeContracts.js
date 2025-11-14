(function () {
  // ============= DATA FUNCTIONS =============
  
  function loadContracts() {
    try {
      const raw = localStorage.getItem('contracts');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveContracts(data) {
    localStorage.setItem('contracts', JSON.stringify(data));
  }

  function loadUsers() {
    try {
      const raw = localStorage.getItem('users_db');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // ============= UI INITIALIZATION =============

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const sortSelect = document.getElementById('sortSelect');
  const addNewBtn = document.getElementById('addNew');
  const contractModal = document.getElementById('contractModal');
  const contractForm = document.getElementById('contractForm');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelFormBtn = document.getElementById('cancelForm');
  const modalTitle = document.getElementById('modalTitle');

  let currentSearchTerm = '';
  let currentSort = '';
  let editingIndex = -1;

  // Search functionality
  function filterAndRender() {
    renderContracts();
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
  function openModal(title = 'Add New Contract', index = -1) {
    editingIndex = index;
    modalTitle.textContent = title;
    
    if (index === -1) {
      // New contract
      contractForm.reset();
      document.getElementById('formUsername').focus();
    } else {
      // Edit existing
      const contracts = loadContracts();
      const contract = contracts[index];
      document.getElementById('formUsername').value = contract.username || '';
      document.getElementById('formName').value = contract.name || '';
      document.getElementById('formPosition').value = contract.position || '';
      document.getElementById('formDepartment').value = contract.department || '';
      document.getElementById('formEmpType').value = contract.empType || 'Full-time';
      document.getElementById('formStartDate').value = contract.startDate || '';
      document.getElementById('formEndDate').value = contract.endDate || '';
      document.getElementById('formSalary').value = contract.salary || '';
      document.getElementById('formStatus').value = contract.status || 'Pending';
    }

    contractModal.classList.add('show');
  }

  function closeModal() {
    contractModal.classList.remove('show');
    contractForm.reset();
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
      openModal('Add New Contract', -1);
    });
  }

  // Form submission
  if (contractForm) {
    contractForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const contracts = loadContracts();
      const newContract = {
        username: document.getElementById('formUsername').value.trim(),
        name: document.getElementById('formName').value.trim(),
        position: document.getElementById('formPosition').value.trim(),
        department: document.getElementById('formDepartment').value.trim(),
        empType: document.getElementById('formEmpType').value,
        startDate: document.getElementById('formStartDate').value,
        endDate: document.getElementById('formEndDate').value,
        salary: document.getElementById('formSalary').value,
        status: document.getElementById('formStatus').value
      };

      if (!newContract.username || !newContract.name || !newContract.position) {
        alert('Please fill in required fields: Username, Name, and Position');
        return;
      }

      if (editingIndex === -1) {
        // Add new
        contracts.push(newContract);
      } else {
        // Update existing
        contracts[editingIndex] = newContract;
      }

      saveContracts(contracts);
      closeModal();
      filterAndRender();
    });
  }

  // ============= RENDER FUNCTIONS =============

  function matchesSearch(contract) {
    if (!currentSearchTerm) return true;
    const name = (contract.name || '').toLowerCase();
    const username = (contract.username || '').toLowerCase();
    return name.includes(currentSearchTerm) || username.includes(currentSearchTerm);
  }

  function applySort(contracts, sortKey) {
    if (!sortKey) return contracts.slice();
    var copy = contracts.slice();
    if (sortKey === 'name-asc') return copy.sort(function(a,b){ var na=(a.name||'').toLowerCase(), nb=(b.name||'').toLowerCase(); return na<nb?-1:na>nb?1:0; });
    if (sortKey === 'name-desc') return copy.sort(function(a,b){ var na=(a.name||'').toLowerCase(), nb=(b.name||'').toLowerCase(); return na>nb?-1:na<nb?1:0; });
    if (sortKey === 'date-newest') return copy.sort(function(a,b){ var da=a.startDate||'', db=b.startDate||''; return db < da ? -1 : db > da ? 1 : 0; });
    if (sortKey === 'date-oldest') return copy.sort(function(a,b){ var da=a.startDate||'', db=b.startDate||''; return da < db ? -1 : da > db ? 1 : 0; });
    return copy;
  }

  function renderContracts() {
  const list = document.getElementById('contractsList');
  const empty = document.getElementById('emptyMsg');
  const contracts = loadContracts();
  const template = document.getElementById('contractItemTemplate');
  const items = applySort(contracts, currentSort);

    if (!list || !template) return;

    list.innerHTML = '';
    let count = 0;

    items.forEach(function (contract, idx) {
      if (!matchesSearch(contract)) return;

      count++;
      const clone = template.content.cloneNode(true);

      clone.querySelector('.contract-name').textContent = contract.name || '—';
      clone.querySelector('.contract-username').textContent = contract.username || '—';
      clone.querySelector('.contract-position').textContent = contract.position || '—';
      clone.querySelector('.contract-department').textContent = contract.department || '—';
      clone.querySelector('.contract-startDate').textContent = contract.startDate || '—';
      clone.querySelector('.contract-salary').textContent = contract.salary ? '$' + contract.salary : '—';

      const statusBadge = clone.querySelector('.status-badge');
      statusBadge.textContent = contract.status || 'Pending';
      statusBadge.setAttribute('data-status', contract.status || 'Pending');

      // View button
      const viewBtn = clone.querySelector('.btn-small.view');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          alert('Viewing contract for: ' + (contract.name || '—'));
        });
      }

      // Edit button
      const editBtn = clone.querySelector('.btn-small.edit');
      if (editBtn) {
        editBtn.addEventListener('click', function () {
          // find the original index in the contracts array
          var realIndex = contracts.findIndex(function(c){ return (c.username === contract.username && c.name === contract.name && (c.startDate || '') === (contract.startDate || '')); });
          openModal('Edit Contract', realIndex === -1 ? idx : realIndex);
        });
      }

      // Export button
      const exportBtn = clone.querySelector('.btn-small.export');
      if (exportBtn) {
        exportBtn.addEventListener('click', function () {
          const data = 'Employment Contract\n' + JSON.stringify(contract, null, 2);
          downloadText(data, (contract.name || 'contract') + '_contract.txt');
        });
      }

      // Delete button
      const deleteBtn = clone.querySelector('.btn-small.delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
          if (confirm('Delete this contract?')) {
            var realIndex = contracts.findIndex(function(c){ return (c.username === contract.username && c.name === contract.name && (c.startDate || '') === (contract.startDate || '')); });
            if (realIndex !== -1) {
              contracts.splice(realIndex, 1);
              saveContracts(contracts);
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
    if (e.target === contractModal) {
      closeModal();
    }
  });

  // ============= PAGE LOAD =============

  renderContracts();
})();
