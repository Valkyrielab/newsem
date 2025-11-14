(function () {
  // ============= DATA FUNCTIONS =============
  
  function loadLetters() {
    try {
      const raw = localStorage.getItem('confirmations');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLetters(data) {
    localStorage.setItem('confirmations', JSON.stringify(data));
  }

  // ============= UI INITIALIZATION =============

  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const sortSelect = document.getElementById('sortSelect');
  const addNewBtn = document.getElementById('addNew');
  const letterModal = document.getElementById('letterModal');
  const letterForm = document.getElementById('letterForm');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelFormBtn = document.getElementById('cancelForm');
  const modalTitle = document.getElementById('modalTitle');

  let currentSearchTerm = '';
  let currentSort = '';
  let editingIndex = -1;

  // Search functionality
  function filterAndRender() {
    renderLetters();
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentSearchTerm = this.value.toLowerCase().trim();
      filterAndRender();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      currentSort = this.value || '';
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

  // Modal controls
  function openModal(title = 'Issue New Confirmation Letter', index = -1) {
    editingIndex = index;
    modalTitle.textContent = title;
    
    if (index === -1) {
      // New letter
      letterForm.reset();
      document.getElementById('formUsername').focus();
    } else {
      // Edit existing
      const letters = loadLetters();
      const letter = letters[index];
      document.getElementById('formUsername').value = letter.username || '';
      document.getElementById('formEmpName').value = letter.empName || '';
      document.getElementById('formLetterType').value = letter.letterType || '';
      document.getElementById('formIssueDate').value = letter.issueDate || '';
      document.getElementById('formDetails').value = letter.details || '';
      document.getElementById('formStatus').value = letter.status || 'Draft';
    }

    letterModal.classList.add('show');
  }

  function closeModal() {
    letterModal.classList.remove('show');
    letterForm.reset();
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
      openModal('Issue New Confirmation Letter', -1);
    });
  }

  // Form submission
  if (letterForm) {
    letterForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const letters = loadLetters();
      const newLetter = {
        id: Date.now().toString(),
        username: document.getElementById('formUsername').value.trim(),
        empName: document.getElementById('formEmpName').value.trim(),
        letterType: document.getElementById('formLetterType').value,
        issueDate: document.getElementById('formIssueDate').value,
        details: document.getElementById('formDetails').value.trim(),
        status: document.getElementById('formStatus').value
      };

      if (!newLetter.username || !newLetter.empName || !newLetter.letterType || !newLetter.issueDate) {
        alert('Please fill in all required fields');
        return;
      }

      if (editingIndex === -1) {
        // Add new
        letters.push(newLetter);
      } else {
        // Update existing
        newLetter.id = letters[editingIndex].id;
        letters[editingIndex] = newLetter;
      }

      saveLetters(letters);
      closeModal();
      filterAndRender();
    });
  }

  // ============= RENDER FUNCTIONS =============

  function matchesSearch(letter) {
    if (!currentSearchTerm) return true;
    const name = (letter.empName || '').toLowerCase();
    const username = (letter.username || '').toLowerCase();
    return name.includes(currentSearchTerm) || username.includes(currentSearchTerm);
  }

  function applySort(letters, sortKey) {
    if (!sortKey) return letters.slice();
    var copy = letters.slice();
    if (sortKey === 'name-asc') return copy.sort(function(a,b){ var na=(a.empName||'').toLowerCase(), nb=(b.empName||'').toLowerCase(); return na<nb?-1:na>nb?1:0; });
    if (sortKey === 'name-desc') return copy.sort(function(a,b){ var na=(a.empName||'').toLowerCase(), nb=(b.empName||'').toLowerCase(); return na>nb?-1:na<nb?1:0; });
    if (sortKey === 'date-newest') return copy.sort(function(a,b){ var da=a.issueDate||'', db=b.issueDate||''; return db < da ? -1 : db > da ? 1 : 0; });
    if (sortKey === 'date-oldest') return copy.sort(function(a,b){ var da=a.issueDate||'', db=b.issueDate||''; return da < db ? -1 : da > db ? 1 : 0; });
    return copy;
  }

  function renderLetters() {
  const list = document.getElementById('lettersList');
  const empty = document.getElementById('emptyMsg');
  const letters = loadLetters();
  const template = document.getElementById('letterItemTemplate');
  const items = applySort(letters, currentSort);

    if (!list || !template) return;

    list.innerHTML = '';
    let count = 0;

    items.forEach(function (letter, idx) {
      if (!matchesSearch(letter)) return;

      count++;
      const clone = template.content.cloneNode(true);

      clone.querySelector('.letter-title').textContent = letter.letterType || '—';
      clone.querySelector('.letter-meta').textContent = 'ID: ' + (letter.id || '—');
      clone.querySelector('.empName').textContent = letter.empName || '—';
      clone.querySelector('.issueDate').textContent = letter.issueDate || '—';
      clone.querySelector('.letterType').textContent = letter.letterType || '—';

      const statusBadge = clone.querySelector('.status');
      statusBadge.textContent = letter.status || 'Draft';
      statusBadge.setAttribute('data-status', letter.status || 'Draft');

      // View button
      const viewBtn = clone.querySelector('.btn-small.view');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          alert('Viewing confirmation letter for: ' + (letter.empName || '—'));
        });
      }

      // Edit button
      const editBtn = clone.querySelector('.btn-small.edit');
      if (editBtn) {
        editBtn.addEventListener('click', function () {
          // find real index by id
          var realIndex = letters.findIndex(function(l){ return l.id === letter.id; });
          openModal('Edit Confirmation Letter', realIndex === -1 ? idx : realIndex);
        });
      }

      // Export button
      const exportBtn = clone.querySelector('.btn-small.export');
      if (exportBtn) {
        exportBtn.addEventListener('click', function () {
          const data = 'Confirmation Letter\n' + JSON.stringify(letter, null, 2);
          downloadText(data, (letter.empName || 'letter') + '_confirmation.txt');
        });
      }

      // Delete button
      const deleteBtn = clone.querySelector('.btn-small.delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
          if (confirm('Delete this letter?')) {
            var realIndex = letters.findIndex(function(l){ return l.id === letter.id; });
            if (realIndex !== -1) {
              letters.splice(realIndex, 1);
              saveLetters(letters);
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
    if (e.target === letterModal) {
      closeModal();
    }
  });

  // ============= PAGE LOAD =============

  renderLetters();
})();
