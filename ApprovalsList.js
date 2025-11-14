(function () {
  // Render approvals on the standalone ApprovalsList page
  const pendingContainer = document.getElementById('approvalsList');
  const approvedContainer = document.getElementById('approvedList');
  if (!pendingContainer && !approvedContainer) return;

  const tpl = document.getElementById('approvalItemTemplate');
  const approvedTpl = document.getElementById('approvedItemTemplate');
  const emptyMsg = document.getElementById('emptyMsg');

  function loadApprovals() {
    try { const raw = localStorage.getItem('approvals'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  }
  function saveApprovals(arr) { localStorage.setItem('approvals', JSON.stringify(arr)); }

  function render() {
    const all = loadApprovals();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const pending = all.filter(function(a){ return a.status === 'pending'; });
    const approved = all.filter(function(a){ return a.status === 'approved'; });

    const pendingVisible = (role === 'admin') ? pending : pending.filter(function(a){ return a.submittedBy === username; });

    // pending
    if (pendingContainer) {
      pendingContainer.innerHTML = '';
      if (!pendingVisible || pendingVisible.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
      } else {
        if (emptyMsg) emptyMsg.style.display = 'none';
        pendingVisible.forEach(function (a) {
          var node = tpl.content.cloneNode(true);
          var wrapper = node.querySelector('.approval-item');
          if (wrapper) wrapper.dataset.id = a.id;

          var imgEl = node.querySelector('.approval-image');
          if (imgEl) imgEl.src = a.image || 'images/placeholder.png';

          var titleEl = node.querySelector('.approval-title');
          var metaEl = node.querySelector('.approval-meta');
          var statusEl = node.querySelector('.approval-status');
          var leaveTypeEl = node.querySelector('.approval-leaveType');

          if (titleEl) titleEl.textContent = a.title;
          if (metaEl) metaEl.textContent = 'Submitted by: ' + a.submittedBy + ' - ' + new Date(a.created).toLocaleString();
          if (leaveTypeEl) leaveTypeEl.textContent = a.leaveType;
          if (statusEl) {
            statusEl.className = 'approval-status status-' + a.status;
            statusEl.textContent = 'Status: ' + (a.status.charAt(0).toUpperCase() + a.status.slice(1));
          }

          var viewBtn = node.querySelector('.approval-actions .view');
          var approveBtn = node.querySelector('.approval-actions .approve');
          var rejectBtn = node.querySelector('.approval-actions .reject');
          var withdrawBtn = node.querySelector('.approval-actions .withdraw');

          if (viewBtn) viewBtn.addEventListener('click', function () {
            alert('Viewing submission:\n\n' + a.title + '\n\nStatus: ' + a.status + '\n\nReason: ' + (a.reason || '(none)'));
          });

          if (approveBtn) {
            if (role === 'admin' && a.status === 'pending') {
              approveBtn.addEventListener('click', function () {
                if (!confirm('Approve this submission?')) return;
                var updated = loadApprovals().map(function(x){ return x.id === a.id ? Object.assign({}, x, { status: 'approved', approvedAt: Date.now(), approver: localStorage.getItem('username') || 'admin' }) : x; });
                saveApprovals(updated);
                render();
              });
            } else {
              approveBtn.style.display = 'none';
            }
          }

          if (rejectBtn) {
            if (role === 'admin' && a.status === 'pending') {
              rejectBtn.addEventListener('click', function () {
                if (!confirm('Reject this submission?')) return;
                var updated = loadApprovals().map(function(x){ return x.id === a.id ? Object.assign({}, x, { status: 'rejected' }) : x; });
                saveApprovals(updated);
                render();
              });
            } else {
              rejectBtn.style.display = 'none';
            }
          }

          if (withdrawBtn) {
            if (username === a.submittedBy && a.status === 'pending') {
              withdrawBtn.addEventListener('click', function () {
                if (!confirm('Withdraw this submission?')) return;
                var remaining = loadApprovals().filter(function(x){ return x.id !== a.id; });
                saveApprovals(remaining);
                render();
              });
            } else {
              withdrawBtn.style.display = 'none';
            }
          }

          pendingContainer.appendChild(node);
        });
      }
    }

    // approved
    if (approvedContainer) {
      approvedContainer.innerHTML = '';
      var visibleApproved = (role === 'admin') ? approved : approved.filter(function(a){ return a.submittedBy === username; });
      visibleApproved.forEach(function (a) {
        var node = approvedTpl.content.cloneNode(true);
        var wrapper = node.querySelector('.approval-item');
        if (wrapper) wrapper.dataset.id = a.id;
        var imgEl = node.querySelector('.approval-image');
        if (imgEl) imgEl.src = a.image || 'images/placeholder.png';
        var titleEl = node.querySelector('.approval-title');
        var metaEl = node.querySelector('.approval-meta');
        var statusEl = node.querySelector('.approval-status');
        var leaveTypeEl = node.querySelector('.approval-leaveType');
        var approvedAtEl = node.querySelector('.approval-approvedAt');
        if (titleEl) titleEl.textContent = a.title;
        if (metaEl) metaEl.textContent = 'Submitted by: ' + a.submittedBy + ' - ' + new Date(a.created).toLocaleString();
        if (leaveTypeEl) leaveTypeEl.textContent = a.leaveType;
        if (statusEl) { statusEl.className = 'approval-status status-' + a.status; statusEl.textContent = 'Status: Approved'; }
        if (approvedAtEl) approvedAtEl.textContent = 'Approved: ' + (a.approvedAt ? new Date(a.approvedAt).toLocaleString() : '(unknown)');

        approvedContainer.appendChild(node);
      });
    }
  }

  render();
})();
