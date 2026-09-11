document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotPasswordForm');

  if (loginForm && typeof window.getUserByEmail === 'function') {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const user = window.getUserByEmail(email);
      if (!user || user.password !== password) {
        window.showToast && window.showToast('Invalid email or password.', 'error');
        return;
      }
      window.setCurrentUser(user);
      window.showToast && window.showToast('Login successful.');
      setTimeout(() => {
        const route = { student: 'student-dashboard.html', treasurer: 'treasurer-dashboard.html', admin: 'administrator-dashboard.html' };
        window.location.href = route[user.role] || 'index.html';
      }, 600);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (document.getElementById('regPassword').value !== document.getElementById('regConfirmPassword').value) {
        window.showToast && window.showToast('Passwords do not match.', 'error');
        return;
      }
      window.showToast && window.showToast('Registration successful. Please log in.');
      setTimeout(() => window.location.href = 'login.html', 600);
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (event) => {
      event.preventDefault();
      window.showToast && window.showToast('Demo reset instructions have been generated.');
    });
  }
});
