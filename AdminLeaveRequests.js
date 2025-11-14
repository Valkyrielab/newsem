 (function(){
  // Admin page to review leave requests stored under 'approvals'
  function loadApprovals(){ try{ const raw = localStorage.getItem('approvals'); return raw ? JSON.parse(raw) : []; } catch(e){ return []; } }
  function saveApprovals(arr){ localStorage.setItem('approvals', JSON.stringify(arr)); }

  const list = document.getElementById('approvalsList');
  const approvedContainer = document.getElementById('approvedList');
  const emptyMsg = document.getElementById('emptyMsg');
  const tpl = document.getElementById('approvalItemTemplate');
  const approvedTpl = document.getElementById('approvedItemTemplate');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');

  if (!list || !tpl) return;

  let currentSearch = '';

  function matches(item){ if(!currentSearch) return true; var s = currentSearch; return (item.submittedBy||'').toLowerCase().includes(s) || (item.title||'').toLowerCase().includes(s); }

  function render(){
    const all = loadApprovals();
    const pending = all.filter(a => a.status === 'pending');
    const approved = all.filter(a => a.status && a.status !== 'pending');

    // Pending
    list.innerHTML = '';
    let count = 0;
    pending.forEach(function(a){ if(!matches(a)) return; count++; const node = tpl.content.cloneNode(true); const wrapper = node.querySelector('.approval-item'); if(wrapper) wrapper.dataset.id = a.id; const img = node.querySelector('.approval-image'); if(img) img.src = a.image || 'images/placeholder.png'; const title = node.querySelector('.approval-title'); const meta = node.querySelector('.approval-meta'); const status = node.querySelector('.approval-status'); const leaveTypeEl = node.querySelector('.approval-leaveType'); if(title) title.textContent = a.title || '(no title)'; if(meta) meta.textContent = `Submitted by: ${a.submittedBy} — ${new Date(a.created).toLocaleString()}`; if(status) { status.textContent = 'Status: ' + (a.status || 'pending'); } if(leaveTypeEl) leaveTypeEl.textContent = a.leaveType || '';

      const viewBtn = node.querySelector('.approval-actions .view');
      const approveBtn = node.querySelector('.approval-actions .approve');
      const rejectBtn = node.querySelector('.approval-actions .reject');

      if(viewBtn) viewBtn.addEventListener('click', function(){ alert(`Request: ${a.title}\nSubmitted by: ${a.submittedBy}\nType: ${a.leaveType}\nDates: ${a.startDate} → ${a.endDate}\nReason: ${a.reason || '(none)'}`); });

      if(approveBtn) approveBtn.addEventListener('click', function(){ if(!confirm('Approve this leave request?')) return; const updated = loadApprovals().map(x => x.id === a.id ? { ...x, status: 'approved', approvedAt: Date.now(), approver: localStorage.getItem('username') || 'admin' } : x); saveApprovals(updated); render(); });

      if(rejectBtn) rejectBtn.addEventListener('click', function(){ if(!confirm('Reject this leave request?')) return; const updated = loadApprovals().map(x => x.id === a.id ? { ...x, status: 'rejected', approver: localStorage.getItem('username') || 'admin' } : x); saveApprovals(updated); render(); });

      list.appendChild(node);
    });
    if (emptyMsg) emptyMsg.style.display = count === 0 ? 'block' : 'none';

    // Approved / rejected
    if (approvedContainer && approvedTpl) {
      approvedContainer.innerHTML = '';
      approved.forEach(function(a){ if(!matches(a)) return; const node = approvedTpl.content.cloneNode(true); const wrapper = node.querySelector('.approval-item'); if(wrapper) wrapper.dataset.id = a.id; const img = node.querySelector('.approval-image'); if(img) img.src = a.image || 'images/placeholder.png'; const title = node.querySelector('.approval-title'); const meta = node.querySelector('.approval-meta'); const status = node.querySelector('.approval-status'); const leaveTypeEl = node.querySelector('.approval-leaveType'); const approvedAtEl = node.querySelector('.approval-approvedAt'); if(title) title.textContent = a.title || '(no title)'; if(meta) meta.textContent = `Submitted by: ${a.submittedBy} — ${new Date(a.created).toLocaleString()}`; if(status) status.textContent = 'Status: ' + (a.status || '(unknown)'); if(leaveTypeEl) leaveTypeEl.textContent = a.leaveType || ''; if(approvedAtEl) approvedAtEl.textContent = a.approvedAt ? ('Approved: ' + new Date(a.approvedAt).toLocaleString()) : (a.status === 'rejected' ? 'Rejected' : '');
        const viewBtn = node.querySelector('.approval-actions .view'); if(viewBtn) viewBtn.addEventListener('click', function(){ alert(`Request: ${a.title}\nSubmitted by: ${a.submittedBy}\nType: ${a.leaveType}\nDates: ${a.startDate} → ${a.endDate}\nStatus: ${a.status}\nReason: ${a.reason || '(none)'}\nApprover: ${a.approver || '(none)'}\nApproved At: ${a.approvedAt ? new Date(a.approvedAt).toLocaleString() : '(n/a)'}`); }); approvedContainer.appendChild(node);
      });
    }
  }

  if (searchInput) searchInput.addEventListener('input', function(){ currentSearch = this.value.toLowerCase().trim(); render(); });
  if (clearBtn) clearBtn.addEventListener('click', function(){ if (searchInput) searchInput.value = ''; currentSearch = ''; render(); });

  // initial render
  render();

 })();
