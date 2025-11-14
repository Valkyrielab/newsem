(function () {
  // Handle leave form submission and save to approvals storage
  const form = document.getElementById('leaveForm');
  if (!form) return;

  function loadApprovals() {
    try { const raw = localStorage.getItem('approvals'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  }
  function saveApprovals(arr) { localStorage.setItem('approvals', JSON.stringify(arr)); }

  // --- Hire date and balances ---
  const hireEl = document.getElementById('hireDate');
  const saveHireBtn = document.getElementById('saveHire');
  const clearHireBtn = document.getElementById('clearHire');
  const balSick = document.getElementById('balSick');
  const balAnnual = document.getElementById('balAnnual');
  const balCompassion = document.getElementById('balCompassion');
  const balMaternity = document.getElementById('balMaternity');

  function monthsBetween(start, end) {
    if (!(start instanceof Date) || !(end instanceof Date)) return 0;
    if (end < start) return 0;
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let total = years * 12 + months;
    // if end day is before start day, don't count the incomplete month
    if (end.getDate() < start.getDate()) total -= 1;
    return Math.max(0, total);
  }

  function computeBalances(hireDateStr) {
    if (!hireDateStr) return { sick: 0, annual: 0, compassion: 0, maternity: 0 };
    const hd = new Date(hireDateStr + 'T00:00:00');
    const today = new Date();
    const months = monthsBetween(hd, today);
    const sick = months * 2; // 2 days per month
    const annual = months * 1.5; // 1.5 days per month
    const compassion = Math.floor(months / 3) * 7; // 7 days every 3 months
    const maternity = Math.floor(months * 90 / 12); // 90 days (3 months) per 12 months
    return { sick, annual, compassion, maternity };
  }

  function loadHire() {
    const username = localStorage.getItem('username') || 'default';
    const key = 'hireDate_' + username;
    return localStorage.getItem(key) || '';
  }

  function saveHire(dateStr) {
    const username = localStorage.getItem('username') || 'default';
    const key = 'hireDate_' + username;
    if (!dateStr) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, dateStr);
    }
  }

  function renderBalances() {
    const dateStr = loadHire();
    if (hireEl) hireEl.value = dateStr;
    const b = computeBalances(dateStr);
    if (balSick) balSick.textContent = b.sick;
    if (balAnnual) balAnnual.textContent = b.annual.toFixed(1);
    if (balCompassion) balCompassion.textContent = b.compassion;
    if (balMaternity) balMaternity.textContent = b.maternity;
  }

  if (saveHireBtn) saveHireBtn.addEventListener('click', function () { saveHire(hireEl.value); renderBalances(); alert('Hire date saved.'); });
  if (clearHireBtn) clearHireBtn.addEventListener('click', function () { saveHire(''); renderBalances(); alert('Hire date cleared.'); });

  // initial render of balances
  renderBalances();

  function daysBetweenInclusive(s, e) {
    const start = new Date(s + 'T00:00:00');
    const end = new Date(e + 'T00:00:00');
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.floor((end - start) / msPerDay) + 1;
    return diff > 0 ? diff : 0;
  }

  function getAvailableForType(type) {
    const dateStr = loadHire();
    const b = computeBalances(dateStr);
    switch (type) {
      case 'Sick': return b.sick;
      case 'Annual': return b.annual;
      case 'Compassionate': return b.compassion;
      case 'Maternity': return b.maternity;
      default: return Infinity; // Unpaid or unknown
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reason = document.getElementById('reason').value.trim();
    const attachmentEl = document.getElementById('attachment');
    if (!leaveType || !startDate || !endDate) {
      alert('Please complete leave type, start and end dates.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      alert('End date must be the same or after start date.');
      return;
    }

    const all = loadApprovals();
    const id = 'a_' + Math.random().toString(36).slice(2, 9);
    const submittedBy = localStorage.getItem('username') || 'unknown';
    const created = Date.now();
    const title = `${leaveType} leave (${startDate} → ${endDate})`;
    const item = { id, title, submittedBy, created, status: 'pending', leaveType, startDate, endDate, reason };
    // Validate requested days against available balance (if profile exists)
    const requestedDays = daysBetweenInclusive(startDate, endDate);
    const available = getAvailableForType(leaveType);
    if (available !== Infinity && requestedDays > available) {
      if (!confirm('Requested days (' + requestedDays + ') exceed available balance (' + available + '). Submit anyway?')) {
        return; // abort submission
      }
    }

    // If there's an attached image, read it as a data URL and save it with the item.
    const file = attachmentEl && attachmentEl.files && attachmentEl.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        try {
          item.image = ev.target.result; // data URL
        } catch (err) {
          // ignore if reading fails
        }
        all.unshift(item);
        saveApprovals(all);
        window.location.href = 'ApprovalsSub.html';
      };
      reader.readAsDataURL(file);
    } else {
      all.unshift(item);
      saveApprovals(all);
      window.location.href = 'ApprovalsSub.html';
    }
  });
})();
