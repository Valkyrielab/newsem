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

  function loadUsers() {
    try {
      const raw = localStorage.getItem('users_db');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function loadConfirmations() {
    try {
      const raw = localStorage.getItem('confirmations');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function loadWarnings() {
    try {
      const raw = localStorage.getItem('warnings');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function loadDisciplinary() {
    try {
      const raw = localStorage.getItem('disciplinary');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function loadMaternity() {
    try {
      const raw = localStorage.getItem('maternity');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveConfirmations(data) {
    localStorage.setItem('confirmations', JSON.stringify(data));
  }

  function saveWarnings(data) {
    localStorage.setItem('warnings', JSON.stringify(data));
  }

  function saveDisciplinary(data) {
    localStorage.setItem('disciplinary', JSON.stringify(data));
  }

  function saveMaternity(data) {
    localStorage.setItem('maternity', JSON.stringify(data));
  }

  // ============= UI INITIALIZATION =============

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const sortSelect = document.getElementById('sortSelect');
  let currentSearchTerm = '';
  let currentSort = '';

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tabName = this.getAttribute('data-tab');
      
      // Update active button
      tabButtons.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      // Update active tab content
      tabContents.forEach(function (c) { c.classList.remove('active'); });
      document.getElementById(tabName).classList.add('active');
    });
  });

  // Search functionality
  function filterItems(searchTerm) {
    currentSearchTerm = searchTerm.toLowerCase().trim();
    renderAll();
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      filterItems(this.value);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      currentSearchTerm = '';
      renderAll();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      currentSort = this.value || '';
      renderAll();
    });
  }

  // ============= RENDER FUNCTIONS =============

  function matchesSearch(empName, username) {
    if (!currentSearchTerm) return true;
    return (empName && empName.toLowerCase().includes(currentSearchTerm)) ||
           (username && username.toLowerCase().includes(currentSearchTerm));
  }

  // Generic sorter used by the tab renderers
  function applySort(items, sortKey, tab) {
    if (!sortKey) return items.slice();
    var copy = items.slice();
    function byName(a,b){ var na=(a.empName||getEmployeeName(a.username)||'').toLowerCase(), nb=(b.empName||getEmployeeName(b.username)||'').toLowerCase(); return na<nb?-1:na>nb?1:0; }
    function byNameDesc(a,b){ return byName(b,a); }
    function byFieldDate(field){ return function(a,b){ var da=(a[field]||''), db=(b[field]||''); if(!da && !db) return 0; if(!da) return 1; if(!db) return -1; return da<db? -1 : da>db? 1 : 0; }; }

    switch (tab) {
      case 'contracts':
        if (sortKey === 'name-asc') return copy.sort(function(a,b){ return (getEmployeeName(a.username)||'').toLowerCase() < (getEmployeeName(b.username)||'').toLowerCase() ? -1 : (getEmployeeName(a.username)||'') > (getEmployeeName(b.username)||'') ? 1 : 0; });
        if (sortKey === 'name-desc') return copy.sort(function(a,b){ return (getEmployeeName(a.username)||'').toLowerCase() > (getEmployeeName(b.username)||'').toLowerCase() ? -1 : (getEmployeeName(a.username)||'') < (getEmployeeName(b.username)||'') ? 1 : 0; });
        if (sortKey === 'date-newest') return copy.sort(function(a,b){ var da=a.startDate||'', db=b.startDate||''; return db < da ? -1 : db > da ? 1 : 0; });
        if (sortKey === 'date-oldest') return copy.sort(function(a,b){ var da=a.startDate||'', db=b.startDate||''; return da < db ? -1 : da > db ? 1 : 0; });
        break;
      case 'confirmations':
        if (sortKey === 'name-asc') return copy.sort(byName);
        if (sortKey === 'name-desc') return copy.sort(byNameDesc);
        if (sortKey === 'date-newest') return copy.sort(function(a,b){ var da=a.issueDate||'', db=b.issueDate||''; return db < da ? -1 : db > da ? 1 : 0; });
        if (sortKey === 'date-oldest') return copy.sort(function(a,b){ var da=a.issueDate||'', db=b.issueDate||''; return da < db ? -1 : da > db ? 1 : 0; });
        break;
      case 'Maternity':
        if (sortKey === 'name-asc') return copy.sort(byName);
        if (sortKey === 'name-desc') return copy.sort(byNameDesc);
        if (sortKey === 'date-newest') return copy.sort(function(a,b){ var da=a.startDate||'', db=b.startDate||''; return db < da ? -1 : db > da ? 1 : 0; });
        if (sortKey === 'date-oldest') return copy.sort(function(a,b){ var da=a.startDate||'', db=b.startDate||''; return da < db ? -1 : da > db ? 1 : 0; });
        break;
      case 'warnings':
        if (sortKey === 'name-asc') return copy.sort(byName);
        if (sortKey === 'name-desc') return copy.sort(byNameDesc);
        if (sortKey === 'date-newest') return copy.sort(function(a,b){ var da=a.warningDate||'', db=b.warningDate||''; return db < da ? -1 : db > da ? 1 : 0; });
        if (sortKey === 'date-oldest') return copy.sort(function(a,b){ var da=a.warningDate||'', db=b.warningDate||''; return da < db ? -1 : da > db ? 1 : 0; });
        break;
      case 'disciplinary':
        if (sortKey === 'name-asc') return copy.sort(byName);
        if (sortKey === 'name-desc') return copy.sort(byNameDesc);
        if (sortKey === 'date-newest') return copy.sort(function(a,b){ var da=a.hearingDate||'', db=b.hearingDate||''; return db < da ? -1 : db > da ? 1 : 0; });
        if (sortKey === 'date-oldest') return copy.sort(function(a,b){ var da=a.hearingDate||'', db=b.hearingDate||''; return da < db ? -1 : da > db ? 1 : 0; });
        break;
    }
    return copy;
  }

  // Get employee name from contracts or users db
  function getEmployeeName(username) {
    const users = loadUsers();
    const user = users.find(function (u) { return u.username === username; });
    if (user && user.fullName) return user.fullName;
    
    // Try to find from contracts
    const contracts = loadContracts();
    for (var i = 0; i < contracts.length; i++) {
      const c = contracts[i];
      if (c.username === username && c.name) return c.name;
    }
    return username;
  }

  function renderContracts() {
    const list = document.getElementById('contractsList');
    const empty = document.getElementById('contractsEmpty');
    const contracts = loadContracts();
    const template = document.getElementById('contractItemTemplate');

    if (!list || !template) return;

    list.innerHTML = '';
    let count = 0;

  applySort(contracts, currentSort, 'contracts').forEach(function (contract) {
      const empName = getEmployeeName(contract.username);
      if (!matchesSearch(empName, contract.username)) return;

      count++;
      const clone = template.content.cloneNode(true);

      // Fill data
      clone.querySelector('.item-title').textContent = empName;
      clone.querySelector('.item-meta').textContent = 'Username: ' + (contract.username || '—');
      clone.querySelector('.position').textContent = contract.position || '—';
      clone.querySelector('.department').textContent = contract.department || '—';
      clone.querySelector('.empType').textContent = contract.empType || '—';
      clone.querySelector('.startDate').textContent = contract.startDate || '—';
      clone.querySelector('.salary').textContent = contract.salary || '—';
      clone.querySelector('.status').textContent = contract.status || 'Pending';

      // Actions
      const viewBtn = clone.querySelector('.btn.view');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          alert('Viewing contract for: ' + empName);
        });
      }

      const exportBtn = clone.querySelector('.btn.export');
      if (exportBtn) {
        exportBtn.addEventListener('click', function () {
          const data = 'Contract for: ' + empName + '\n' + JSON.stringify(contract, null, 2);
          downloadText(data, empName + '_contract.txt');
        });
      }

      const editBtn = clone.querySelector('.btn.edit');
      if (editBtn) {
        editBtn.addEventListener('click', function () {
          alert('Edit contract for: ' + empName);
        });
      }

      list.appendChild(clone);
    });

    if (empty) empty.style.display = count === 0 ? 'block' : 'none';
  }

  function renderConfirmations() {
    const list = document.getElementById('confirmationsList');
    const empty = document.getElementById('confirmationsEmpty');
    const confirmations = loadConfirmations();
    const template = document.getElementById('confirmationItemTemplate');

    if (!list || !template) return;

    list.innerHTML = '';
    let count = 0;

  applySort(confirmations, currentSort, 'confirmations').forEach(function (conf) {
      if (!matchesSearch(conf.empName, conf.username)) return;

      count++;
      const clone = template.content.cloneNode(true);

      clone.querySelector('.item-title').textContent = conf.empName || '—';
      clone.querySelector('.item-meta').textContent = 'ID: ' + (conf.id || '—');
      clone.querySelector('.empName').textContent = conf.empName || '—';
      clone.querySelector('.issueDate').textContent = conf.issueDate || '—';
      clone.querySelector('.confirmType').textContent = conf.confirmType || '—';
      clone.querySelector('.details').textContent = conf.details || '—';

      const viewBtn = clone.querySelector('.btn.view');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          alert('Viewing confirmation letter for: ' + (conf.empName || '—'));
        });
      }

      const exportBtn = clone.querySelector('.btn.export');
      if (exportBtn) {
        exportBtn.addEventListener('click', function () {
          const data = 'Confirmation Letter: ' + (conf.empName || '—') + '\n' + JSON.stringify(conf, null, 2);
          downloadText(data, (conf.empName || 'confirmation') + '_letter.txt');
        });
      }

      list.appendChild(clone);
    });

    if (empty) empty.style.display = count === 0 ? 'block' : 'none';
  }

  function renderMaternity() {
    const list = document.getElementById('maternityList');
    const empty = document.getElementById('maternityEmpty');
    const maternity = loadMaternity();
    const template = document.getElementById('maternityItemTemplate');

    if (!list || !template) return;

    list.innerHTML = '';
    let count = 0;

  applySort(maternity, currentSort, 'Maternity').forEach(function (mat) {
      if (!matchesSearch(mat.empName, mat.username)) return;

      count++;
      const clone = template.content.cloneNode(true);

      clone.querySelector('.item-title').textContent = mat.empName || '—';
      clone.querySelector('.item-meta').textContent = 'ID: ' + (mat.id || '—');
      clone.querySelector('.empName').textContent = mat.empName || '—';
      clone.querySelector('.startDate').textContent = mat.startDate || '—';
      clone.querySelector('.endDate').textContent = mat.endDate || '—';
      clone.querySelector('.duration').textContent = mat.duration || '—';
      clone.querySelector('.status').textContent = mat.status || 'Active';

      const viewBtn = clone.querySelector('.btn.view');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          alert('Viewing maternity agreement for: ' + (mat.empName || '—'));
        });
      }

      const exportBtn = clone.querySelector('.btn.export');
      if (exportBtn) {
        exportBtn.addEventListener('click', function () {
          const data = 'Maternity Agreement: ' + (mat.empName || '—') + '\n' + JSON.stringify(mat, null, 2);
          downloadText(data, (mat.empName || 'maternity') + '_agreement.txt');
        });
      }

      list.appendChild(clone);
    });

    if (empty) empty.style.display = count === 0 ? 'block' : 'none';
  }

  function renderWarnings() {
    const list = document.getElementById('warningsList');
    const empty = document.getElementById('warningsEmpty');
    const warnings = loadWarnings();
    const template = document.getElementById('warningItemTemplate');

    if (!list || !template) return;

    list.innerHTML = '';
    let count = 0;

  applySort(warnings, currentSort, 'warnings').forEach(function (warn, idx) {
      if (!matchesSearch(warn.empName, warn.username)) return;

      count++;
      const clone = template.content.cloneNode(true);

      clone.querySelector('.item-title').textContent = warn.empName || '—';
      clone.querySelector('.item-meta').textContent = 'Warning ID: ' + (warn.id || idx);
      clone.querySelector('.empName').textContent = warn.empName || '—';
      clone.querySelector('.warningDate').textContent = warn.warningDate || '—';
      const levelSpan = clone.querySelector('.level');
      levelSpan.textContent = warn.level || '—';
      levelSpan.setAttribute('data-level', warn.level || '');
      clone.querySelector('.reason').textContent = warn.reason || '—';
      clone.querySelector('.notes').textContent = warn.notes || '—';

      const viewBtn = clone.querySelector('.btn.view');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          alert('Viewing warning for: ' + (warn.empName || '—'));
        });
      }

      const deleteBtn = clone.querySelector('.btn.delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
          if (confirm('Delete this warning?')) {
            warnings.splice(idx, 1);
            saveWarnings(warnings);
            renderWarnings();
          }
        });
      }

      list.appendChild(clone);
    });

    if (empty) empty.style.display = count === 0 ? 'block' : 'none';
  }

  function renderDisciplinary() {
    const list = document.getElementById('disciplinaryList');
    const empty = document.getElementById('disciplinaryEmpty');
    const disciplinary = loadDisciplinary();
    const template = document.getElementById('disciplinaryItemTemplate');

    if (!list || !template) return;

    list.innerHTML = '';
    let count = 0;

  applySort(disciplinary, currentSort, 'disciplinary').forEach(function (disc, idx) {
      if (!matchesSearch(disc.empName, disc.username)) return;

      count++;
      const clone = template.content.cloneNode(true);

      clone.querySelector('.item-title').textContent = disc.empName || '—';
      clone.querySelector('.item-meta').textContent = 'Hearing ID: ' + (disc.id || idx);
      clone.querySelector('.empName').textContent = disc.empName || '—';
      clone.querySelector('.hearingDate').textContent = disc.hearingDate || '—';
      clone.querySelector('.hearingTime').textContent = disc.hearingTime || '—';
      clone.querySelector('.reason').textContent = disc.reason || '—';
      const statusSpan = clone.querySelector('.status');
      statusSpan.textContent = disc.status || 'Scheduled';
      statusSpan.setAttribute('data-status', disc.status || '');
      clone.querySelector('.panelMembers').textContent = disc.panelMembers || '—';

      const viewBtn = clone.querySelector('.btn.view');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          alert('Viewing disciplinary hearing for: ' + (disc.empName || '—'));
        });
      }

      const deleteBtn = clone.querySelector('.btn.delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
          if (confirm('Delete this hearing record?')) {
            disciplinary.splice(idx, 1);
            saveDisciplinary(disciplinary);
            renderDisciplinary();
          }
        });
      }

      list.appendChild(clone);
    });

    if (empty) empty.style.display = count === 0 ? 'block' : 'none';
  }

  function renderAll() {
    renderContracts();
    renderConfirmations();
    renderMaternity();
    renderWarnings();
    renderDisciplinary();
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

  // ============= PAGE LOAD =============

  renderAll();
})();
