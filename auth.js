(function () {
  // --------- Database functions ---------
  function loadUsers() {
    try { const raw = localStorage.getItem('users_db'); 
      return raw ? JSON.parse(raw) : [];
     } 
     catch (e) 
     { return []; }
  }
  function loadAdmins() {
    try { const raw = localStorage.getItem('admins_db'); 
      return raw ? JSON.parse(raw) : [];
     } 
     catch (e) 
     { return []; }
  }

  // Default demo credentials (fallback if no users exist)
  const defaultCredentials = {
    admin: { password: 'admin123', role: 'admin' },
    user: { password: 'user123', role: 'user' }
  };

  // --------- Login page logic ---------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const err = document.getElementById('error');
    function goToDashboard() {
      window.location.href = 'Dashboard.html';
    }

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (err) err.textContent = '';
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      if (!username || !password) {
        if (err) err.textContent = 'Enter username and password.';
        return;
      }

      // Check users database first
      const users = loadUsers();
      const userAccount = users.find(u => u.username === username);
      if (userAccount && userAccount.password === password) {
        localStorage.setItem('role', 'user');
        localStorage.setItem('username', username);
        goToDashboard();
        return;
      }

      // Check admins database
      const admins = loadAdmins();
      const adminAccount = admins.find(a => a.username === username);
      if (adminAccount && adminAccount.password === password) {
        localStorage.setItem('role', 'admin');
        localStorage.setItem('username', username);
        goToDashboard();
        return;
      }

      // Fallback to demo credentials
      const account = defaultCredentials[username];
      if (account && account.password === password) {
        localStorage.setItem('role', account.role);
        localStorage.setItem('username', username);
        goToDashboard();
        return;
      }

      if (err) err.textContent = 'Invalid username or password.';
    });

    // Demo quick-fill buttons
    const demoAdmin = document.getElementById('demoAdmin');
    const demoUser = document.getElementById('demoUser');
    if (demoAdmin) demoAdmin.addEventListener('click', function () {
      document.getElementById('username').value = 'admin';
      document.getElementById('password').value = 'admin123';
    });
    if (demoUser) demoUser.addEventListener('click', function () {
      document.getElementById('username').value = 'user';
      document.getElementById('password').value = 'user123';
    });
  }

  // --------- Dashboard page logic ---------
  const adminPanel = document.getElementById('adminPanel');
  const userPanel = document.getElementById('userPanel');
  const greeting = document.getElementById('greeting');
  const userArea = document.getElementById('userArea');
  const notAuth = document.getElementById('notAuth');

  if (adminPanel || userPanel || userArea) {
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    function showLoggedOut() {
      if (adminPanel) adminPanel.hidden = true;
      if (userPanel) userPanel.hidden = true;
      if (notAuth) notAuth.hidden = false;
      if (userArea) userArea.innerHTML = '<a href="Login.html" class="btn">Sign in</a>';
    }

    if (!role) {
      showLoggedOut();
    } else {
      // show common user area: username + logout
      if (userArea) userArea.innerHTML = '';
      if (userArea) {
        const nameSpan = document.createElement('span');
        nameSpan.textContent = (username || '') + ' (' + role + ')';
        nameSpan.className = 'muted';
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'btn';
        logoutBtn.addEventListener('click', function () {
          localStorage.removeItem('role');
          localStorage.removeItem('username');
          window.location.href = 'Login.html';
        });
        userArea.appendChild(nameSpan);
        userArea.appendChild(document.createTextNode(' '));
        userArea.appendChild(logoutBtn);
      }

      if (notAuth) notAuth.hidden = true;
      if (role === 'admin') {
        if (adminPanel) adminPanel.hidden = false;
        if (userPanel) userPanel.hidden = true;
        if (greeting) greeting.textContent = 'Welcome, ' + (username || 'Admin') + '!';
      } else if (role === 'user') {
        if (adminPanel) adminPanel.hidden = true;
        if (userPanel) userPanel.hidden = false;
        if (greeting) greeting.textContent = 'Welcome, ' + (username || 'User') + '!';
      } else {
        showLoggedOut();
      }

      // Also toggle role-only nav links
      document.querySelectorAll('.role-only').forEach(function (el) { el.style.display = 'none'; });
      if (role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(function (el) { el.style.display = 'inline-block'; });
      } else if (role === 'user') {
        document.querySelectorAll('.user-only').forEach(function (el) { el.style.display = 'inline-block'; });
      }
    }
  }
})();
