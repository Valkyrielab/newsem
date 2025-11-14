(function () {
  // Contracts page logic (moved from auth.js)
  const listContainer = document.getElementById('contractsList');
  if (!listContainer) return; // nothing to do if not on contracts page

  const tpl = document.getElementById('contractItemTemplate');
  const emptyMsg = document.getElementById('emptyMsg');
  const createBtn = document.getElementById('createContract');
  const exportBtn = document.getElementById('exportContracts');
  const pageTitle = document.getElementById('pageTitle');

  // load contracts from localStorage (demo only)
  function loadContracts() {
    try {
      const raw = localStorage.getItem('contracts');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveContracts(arr) {
    localStorage.setItem('contracts', JSON.stringify(arr));
  }

  function render() {
    const all = loadContracts();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    // Admin sees all, user sees only their contracts
    const items = (role === 'admin') ? all : all.filter(c => c.owner === username);

    listContainer.innerHTML = '';
    if (!items || items.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    items.forEach(function (c) {
      const node = tpl.content.cloneNode(true);
      const wrapper = node.querySelector('.contract-item');
      if (wrapper) wrapper.dataset.id = c.id;
      const titleEl = node.querySelector('.contract-title');
      const metaEl = node.querySelector('.contract-meta');
      if (titleEl) titleEl.textContent = c.title;
      if (metaEl) metaEl.textContent = `Owner: ${c.owner} — ${new Date(c.created).toLocaleString()}`;

      const viewBtn = node.querySelector('.contract-actions .view');
      const exportBtnNode = node.querySelector('.contract-actions .export');
      const delBtn = node.querySelector('.contract-actions .delete');

      if (viewBtn) viewBtn.addEventListener('click', function () {
        alert(`Viewing contract:\n\n${c.title}\n\n(placeholder view)`);
      });
      if (exportBtnNode) exportBtnNode.addEventListener('click', function () {
        downloadJSON(c, `${(c.title || 'contract').replace(/\s+/g,'_')}.json`);
      });
      // Only admin or owner can delete
      if (delBtn) {
        if (role === 'admin' || username === c.owner) {
          delBtn.addEventListener('click', function () {
            if (!confirm('Delete this contract?')) return;
            const remaining = loadContracts().filter(x => x.id !== c.id);
            saveContracts(remaining);
            render();
          });
        } else {
          delBtn.style.display = 'none';
        }
      }

      listContainer.appendChild(node);
    });
  }

  function downloadJSON(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Create contract flow — uses prompt for demo simplicity
  if (createBtn) createBtn.addEventListener('click', function () {
    const title = prompt('Contract title');
    if (!title) return;
    const all = loadContracts();
    const id = 'c_' + Math.random().toString(36).slice(2, 9);
    const owner = localStorage.getItem('username') || 'unknown';
    const created = Date.now();
    const item = { id, title, owner, created };
    all.unshift(item);
    saveContracts(all);
    render();
  });

  if (exportBtn) exportBtn.addEventListener('click', function () {
    const all = loadContracts();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const items = (role === 'admin') ? all : all.filter(c => c.owner === username);
    if (!items || items.length === 0) { alert('No contracts to export'); return; }
    downloadJSON(items, `contracts_${role || 'guest'}.json`);
  });

  // initial render
  render();
})();