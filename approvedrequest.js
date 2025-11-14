(function () {
  // Approved requests page - render only approved items
  const approvedContainer = document.getElementById('approvedList');
  if (!approvedContainer) return;

  const tpl = document.getElementById('approvedItemTemplate');
  const emptyMsg = document.getElementById('emptyMsg');

  function loadApprovals() { try { const raw = localStorage.getItem('approvals'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; } }

  function render() {
    const all = loadApprovals();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const approved = all.filter(function(a){ return a.status === 'approved'; });
    const visible = (role === 'admin') ? approved : approved.filter(function(a){ return a.submittedBy === username; });

    approvedContainer.innerHTML = '';
    if (!visible || visible.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    visible.forEach(function(a){
      var node = tpl.content.cloneNode(true);
      var wrapper = node.querySelector('.approval-item');
      if (wrapper) wrapper.dataset.id = a.id;
      var img = node.querySelector('.approval-image'); if (img) img.src = a.image || 'images/placeholder.png';
      var title = node.querySelector('.approval-title'); if (title) title.textContent = a.title;
      var meta = node.querySelector('.approval-meta'); if (meta) meta.textContent = 'Submitted by: ' + a.submittedBy + ' - ' + new Date(a.created).toLocaleString();
      var approvedAt = node.querySelector('.approval-approvedAt'); if (approvedAt) approvedAt.textContent = 'Approved: ' + (a.approvedAt ? new Date(a.approvedAt).toLocaleString() : '(unknown)');

      var viewBtn = node.querySelector('.approval-actions .view');
      var exportBtn = node.querySelector('.approval-actions .export');

      if (viewBtn) viewBtn.addEventListener('click', function(){ alert('Viewing: ' + a.title + '\n\n' + (a.reason || '(no reason)')); });
      if (exportBtn) exportBtn.addEventListener('click', function(){
        var blob = new Blob([JSON.stringify(a, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var aLink = document.createElement('a'); aLink.href = url; aLink.download = (a.id || 'approval') + '.json'; document.body.appendChild(aLink); aLink.click(); aLink.remove(); URL.revokeObjectURL(url);
      });

      approvedContainer.appendChild(node);
    });
  }

  render();
})();
