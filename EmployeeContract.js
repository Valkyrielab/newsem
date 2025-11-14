(function () {
  // Employee contract page logic
  const contractView = document.getElementById('contractView');
  if (!contractView) return;

  const form = document.getElementById('contractForm');
  const editBtn = document.getElementById('editBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const signBtn = document.getElementById('signBtn');
  const backBtn = document.getElementById('backBtn');

  function loadContract() {
    try {
      const username = localStorage.getItem('username') || 'default';
      const key = 'contract_' + username;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveContract(obj) {
    const username = localStorage.getItem('username') || 'default';
    const key = 'contract_' + username;
    localStorage.setItem(key, JSON.stringify(obj));
  }

  function render() {
    const contract = loadContract();

    // Populate display view
    document.getElementById('empName').textContent = contract.name || '—';
    document.getElementById('empPosition').textContent = contract.position || '—';
    document.getElementById('empDept').textContent = contract.dept || '—';
    document.getElementById('empId').textContent = contract.empId || '—';
    document.getElementById('empType').textContent = contract.empType || '—';
    document.getElementById('startDate').textContent = contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '—';
    document.getElementById('endDate').textContent = contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '(Ongoing)';
    document.getElementById('salary').textContent = contract.salary ? '$' + parseFloat(contract.salary).toFixed(2) : '—';
    document.getElementById('reportsTo').textContent = contract.reportsTo || '—';
    document.getElementById('workHours').textContent = contract.workHours || '—';
    document.getElementById('location').textContent = contract.location || '—';
    document.getElementById('leaveAnnual').textContent = contract.leaveAnnual || '—';
    document.getElementById('leaveSick').textContent = contract.leaveSick || '—';
    document.getElementById('leaveCompassion').textContent = contract.leaveCompassion || '—';
    document.getElementById('effectiveDate').textContent = contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'TBD';
    document.getElementById('contractStatus').textContent = contract.status || 'Draft';
    document.getElementById('contractSigned').textContent = contract.signed ? 'Yes (' + new Date(contract.signed).toLocaleDateString() + ')' : 'No';

    // Populate form
    document.getElementById('formName').value = contract.name || '';
    document.getElementById('formPosition').value = contract.position || '';
    document.getElementById('formDept').value = contract.dept || '';
    document.getElementById('formEmpId').value = contract.empId || '';
    document.getElementById('formEmpType').value = contract.empType || 'Full-time';
    document.getElementById('formStartDate').value = contract.startDate || '';
    document.getElementById('formEndDate').value = contract.endDate || '';
    document.getElementById('formSalary').value = contract.salary || '';
    document.getElementById('formReportsTo').value = contract.reportsTo || '';
    document.getElementById('formWorkHours').value = contract.workHours || '';
    document.getElementById('formLocation').value = contract.location || '';
    document.getElementById('formLeaveAnnual').value = contract.leaveAnnual || '';
    document.getElementById('formLeaveSick').value = contract.leaveSick || '';
    document.getElementById('formLeaveCompassion').value = contract.leaveCompassion || '';
  }

  // Edit button
  if (editBtn) editBtn.addEventListener('click', function () {
    contractView.style.display = 'none';
    if (form) form.style.display = 'block';
  });

  // Cancel edit
  if (cancelBtn) cancelBtn.addEventListener('click', function () {
    render();
    contractView.style.display = 'block';
    if (form) form.style.display = 'none';
  });

  // Save form
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    const contract = {
      name: document.getElementById('formName').value,
      position: document.getElementById('formPosition').value,
      dept: document.getElementById('formDept').value,
      empId: document.getElementById('formEmpId').value,
      empType: document.getElementById('formEmpType').value,
      startDate: document.getElementById('formStartDate').value,
      endDate: document.getElementById('formEndDate').value,
      salary: document.getElementById('formSalary').value,
      reportsTo: document.getElementById('formReportsTo').value,
      workHours: document.getElementById('formWorkHours').value,
      location: document.getElementById('formLocation').value,
      leaveAnnual: document.getElementById('formLeaveAnnual').value,
      leaveSick: document.getElementById('formLeaveSick').value,
      leaveCompassion: document.getElementById('formLeaveCompassion').value,
      status: 'Draft'
    };
    saveContract(contract);
    render();
    contractView.style.display = 'block';
    if (form) form.style.display = 'none';
    alert('Contract saved.');
  });

  // Download (simplified text download)
  if (downloadBtn) downloadBtn.addEventListener('click', function () {
    const contract = loadContract();
    if (!contract.name) {
      alert('No contract to download. Please create one first.');
      return;
    }
    const text = JSON.stringify(contract, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (contract.name || 'contract').replace(/\s+/g, '_') + '.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Sign button
  if (signBtn) signBtn.addEventListener('click', function () {
    const contract = loadContract();
    if (!contract.name) {
      alert('No contract to sign. Please create one first.');
      return;
    }
    if (contract.signed) {
      alert('This contract is already signed.');
      return;
    }
    if (confirm('Sign this contract?')) {
      contract.signed = Date.now();
      contract.status = 'Active';
      saveContract(contract);
      render();
      alert('Contract signed successfully.');
    }
  });

  // Back button
  if (backBtn) backBtn.addEventListener('click', function () {
    window.location.href = 'Contracts.html';
  });

  // Initial render
  render();
})();
