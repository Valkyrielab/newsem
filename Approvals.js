(function () {
  // Approvals page logic (moved from ApprovalsSub.js)
  const pendingContainer = document.getElementById('approvalsList');
  if (!pendingContainer) return; // nothing to do if not on approvals page

  const tpl = document.getElementById('approvalItemTemplate');
  const emptyMsg = document.getElementById('emptyMsg');

  function loadApprovals() {
    try { const raw = localStorage.getItem('approvals'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  }
  function saveApprovals(arr) { localStorage.setItem('approvals', JSON.stringify(arr)); }

  function render() {
    const all = loadApprovals();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

  // Filter pending only (approved items are displayed on approvedrequest.html)
  const pending = all.filter(a => a.status === 'pending');
  // apply role filter for pending: users see their own pending; admins see all pending
  const pendingVisible = (role === 'admin') ? pending : pending.filter(a => a.submittedBy === username);

    // Render pending
    const pendingContainer = document.getElementById('approvalsList');
    pendingContainer.innerHTML = '';
    if (!pendingVisible || pendingVisible.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
    } else {
      if (emptyMsg) emptyMsg.style.display = 'none';
      pendingVisible.forEach(function (a) {
        const node = tpl.content.cloneNode(true);
        const wrapper = node.querySelector('.approval-item');
        if (wrapper) wrapper.dataset.id = a.id;

        const imgEl = node.querySelector('.approval-image');
        if (imgEl) imgEl.src = a.image || 'images/placeholder.png';

        const titleEl = node.querySelector('.approval-title');
        const metaEl = node.querySelector('.approval-meta');
        const statusEl = node.querySelector('.approval-status');
        const leaveTypeEl = node.querySelector('.approval-leaveType');

        if (titleEl) titleEl.textContent = a.title;
        if (metaEl) metaEl.textContent = 'Submitted by: ' + a.submittedBy + ' - ' + new Date(a.created).toLocaleString();
        if (leaveTypeEl) leaveTypeEl.textContent = a.leaveType;
        if (statusEl) {
          statusEl.className = 'approval-status status-' + a.status;
          statusEl.textContent = 'Status: ' + a.status.charAt(0).toUpperCase() + a.status.slice(1);
        }

        const viewBtn = node.querySelector('.approval-actions .view');
        const approveBtn = node.querySelector('.approval-actions .approve');
        const rejectBtn = node.querySelector('.approval-actions .reject');
        const withdrawBtn = node.querySelector('.approval-actions .withdraw');

        if (viewBtn) viewBtn.addEventListener('click', function () {
          alert('Viewing submission:\n\n' + a.title + '\n\nStatus: ' + a.status + '\n\nReason: ' + (a.reason || '(none)'));
        });

        if (approveBtn) {
          if (role === 'admin' && a.status === 'pending') {
            approveBtn.addEventListener('click', function () {
              if (!confirm('Approve this submission?')) return;
              const updated = loadApprovals().map(x => x.id === a.id ? { ...x, status: 'approved', approvedAt: Date.now(), approver: localStorage.getItem('username') || 'admin' } : x);
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
              const updated = loadApprovals().map(x => x.id === a.id ? { ...x, status: 'rejected' } : x);
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
              const remaining = loadApprovals().filter(x => x.id !== a.id);
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

    // Approved items are shown on the Approved Requests page (approvedrequest.html).
  }

  // Initial render
  render();
})();
