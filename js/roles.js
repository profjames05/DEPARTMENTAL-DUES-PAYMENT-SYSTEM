(function () {
  const ROLE_ROUTES = {
    student: 'student-dashboard.html',
    treasurer: 'treasurer-dashboard.html',
    admin: 'admin-dashboard.html'
  };

  function getCurrentUser() {
    return window.UENRStorage ? window.UENRStorage.getCurrentUser() : JSON.parse(localStorage.getItem('uenr_demo_current_user') || 'null');
  }

  function requireRole(requiredRole) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html';
      return null;
    }
    if (requiredRole && currentUser.role !== requiredRole) {
      const fallback = ROLE_ROUTES[currentUser.role] || 'login.html';
      window.location.href = fallback;
      return null;
    }
    return currentUser;
  }

  function applyRoleProtection() {
    const pageRole = document.body.dataset.role;
    if (!pageRole) return;
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
    if (pageRole !== currentUser.role) {
      const fallback = ROLE_ROUTES[currentUser.role] || 'login.html';
      window.location.href = fallback;
    }
  }

  window.requireRole = requireRole;
  window.applyRoleProtection = applyRoleProtection;
})();
