(function () {
  // User Management page
  const usersList = document.getElementById('usersList');
  const adminsList = document.getElementById('adminsList');
  
  // Only show this page to admins
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    document.body.innerHTML = '<main class="center"><section class="card"><h2>Access Denied</h2><p>Only admins can access this page.</p><a href="Dashboard.html" class="btn">Back to Dashboard</a></section></main>';
    return;
  }

  // User DB functions
  function loadUsers() {
    try { const raw = localStorage.getItem('users_db'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  }
  function saveUsers(arr) { localStorage.setItem('users_db', JSON.stringify(arr)); }

  function loadAdmins() {
    try { const raw = localStorage.getItem('admins_db'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  }
  function saveAdmins(arr) { localStorage.setItem('admins_db', JSON.stringify(arr)); }

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
      this.classList.add('active');
      const tabId = this.dataset.tab + 'Tab';
      document.getElementById(tabId).classList.add('active');
    });
  });

  // ===== REGULAR USERS =====
  const addUserBtn = document.getElementById('addUserBtn');
  const userForm = document.getElementById('userForm');
  const cancelUserBtn = document.getElementById('cancelUserBtn');
  const userTpl = document.getElementById('userItemTemplate');
  const emptyUsersMsg = document.getElementById('emptyUsersMsg');

  let editingUser = null;

  function renderUsers() {
    const users = loadUsers();
    usersList.innerHTML = '';
    if (users.length === 0) {
      if (emptyUsersMsg) emptyUsersMsg.style.display = 'block';
    } else {
      if (emptyUsersMsg) emptyUsersMsg.style.display = 'none';
      users.forEach(function(u) {
        const node = userTpl.content.cloneNode(true);
        const nameEl = node.querySelector('.user-name');
        const emailEl = node.querySelector('.user-email');
        const editBtn = node.querySelector('.btn.edit');
        const delBtn = node.querySelector('.btn.delete');

        if (nameEl) nameEl.textContent = u.fullName || u.username;
        if (emailEl) emailEl.textContent = u.email || '(no email)';

        if (editBtn) editBtn.addEventListener('click', function() {
          editingUser = u;
          document.getElementById('userName').value = u.username;
          document.getElementById('userPassword').value = u.password;
          document.getElementById('userEmail').value = u.email || '';
          document.getElementById('userFullName').value = u.fullName || '';
          userForm.style.display = 'block';
        });

        if (delBtn) delBtn.addEventListener('click', function() {
          if (confirm('Delete user ' + u.username + '?')) {
            const updated = users.filter(x => x.username !== u.username);
            saveUsers(updated);
            renderUsers();
          }
        });

        usersList.appendChild(node);
      });
    }
  }

  if (addUserBtn) addUserBtn.addEventListener('click', function() {
    editingUser = null;
    document.getElementById('userName').value = '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userFullName').value = '';
    userForm.style.display = 'block';
  });

  if (cancelUserBtn) cancelUserBtn.addEventListener('click', function() {
    userForm.style.display = 'none';
    editingUser = null;
  });

  if (userForm) userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('userName').value.trim();
    const password = document.getElementById('userPassword').value;
    if (!username || !password) { alert('Username and password required.'); return; }

    const users = loadUsers();
    if (editingUser) {
      // Update
      const idx = users.findIndex(x => x.username === editingUser.username);
      if (idx >= 0) {
        users[idx] = {
          username: username,
          password: password,
          email: document.getElementById('userEmail').value.trim(),
          fullName: document.getElementById('userFullName').value.trim(),
          role: 'user'
        };
      }
    } else {
      // New
      if (users.some(x => x.username === username)) { alert('Username already exists.'); return; }
      users.push({
        username: username,
        password: password,
        email: document.getElementById('userEmail').value.trim(),
        fullName: document.getElementById('userFullName').value.trim(),
        role: 'user'
      });
    }
    saveUsers(users);
    userForm.style.display = 'none';
    editingUser = null;
    renderUsers();
    alert('User saved.');
  });

  // ===== ADMIN USERS =====
  const addAdminBtn = document.getElementById('addAdminBtn');
  const adminForm = document.getElementById('adminForm');
  const cancelAdminBtn = document.getElementById('cancelAdminBtn');
  const adminTpl = document.getElementById('adminItemTemplate');
  const emptyAdminsMsg = document.getElementById('emptyAdminsMsg');

  let editingAdmin = null;

  function renderAdmins() {
    const admins = loadAdmins();
    adminsList.innerHTML = '';
    if (admins.length === 0) {
      if (emptyAdminsMsg) emptyAdminsMsg.style.display = 'block';
    } else {
      if (emptyAdminsMsg) emptyAdminsMsg.style.display = 'none';
      admins.forEach(function(a) {
        const node = adminTpl.content.cloneNode(true);
        const nameEl = node.querySelector('.user-name');
        const emailEl = node.querySelector('.user-email');
        const editBtn = node.querySelector('.btn.edit');
        const delBtn = node.querySelector('.btn.delete');

        if (nameEl) nameEl.textContent = a.fullName || a.username;
        if (emailEl) emailEl.textContent = a.email || '(no email)';

        if (editBtn) editBtn.addEventListener('click', function() {
          editingAdmin = a;
          document.getElementById('adminName').value = a.username;
          document.getElementById('adminPassword').value = a.password;
          document.getElementById('adminEmail').value = a.email || '';
          document.getElementById('adminFullName').value = a.fullName || '';
          adminForm.style.display = 'block';
        });

        if (delBtn) delBtn.addEventListener('click', function() {
          if (confirm('Delete admin ' + a.username + '?')) {
            const updated = admins.filter(x => x.username !== a.username);
            saveAdmins(updated);
            renderAdmins();
          }
        });

        adminsList.appendChild(node);
      });
    }
  }

  if (addAdminBtn) addAdminBtn.addEventListener('click', function() {
    editingAdmin = null;
    document.getElementById('adminName').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminFullName').value = '';
    adminForm.style.display = 'block';
  });

  if (cancelAdminBtn) cancelAdminBtn.addEventListener('click', function() {
    adminForm.style.display = 'none';
    editingAdmin = null;
  });

  if (adminForm) adminForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('adminName').value.trim();
    const password = document.getElementById('adminPassword').value;
    if (!username || !password) { alert('Username and password required.'); return; }

    const admins = loadAdmins();
    if (editingAdmin) {
      // Update
      const idx = admins.findIndex(x => x.username === editingAdmin.username);
      if (idx >= 0) {
        admins[idx] = {
          username: username,
          password: password,
          email: document.getElementById('adminEmail').value.trim(),
          fullName: document.getElementById('adminFullName').value.trim(),
          role: 'admin'
        };
      }
    } else {
      // New
      if (admins.some(x => x.username === username)) { alert('Username already exists.'); return; }
      admins.push({
        username: username,
        password: password,
        email: document.getElementById('adminEmail').value.trim(),
        fullName: document.getElementById('adminFullName').value.trim(),
        role: 'admin'
      });
    }
    saveAdmins(admins);
    adminForm.style.display = 'none';
    editingAdmin = null;
    renderAdmins();
    alert('Admin saved.');
  });

  // Initial render
  renderUsers();
  renderAdmins();
})();
