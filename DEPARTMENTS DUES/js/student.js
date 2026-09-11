document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('departmental_dues_current_user') || 'null');
  if (currentUser && document.querySelector('[data-user-name]')) {
    document.querySelector('[data-user-name]').textContent = currentUser.name;
  }
});
