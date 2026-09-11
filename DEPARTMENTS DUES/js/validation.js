window.UENRValidation = {
  escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  },
  emailIsValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  },
  passwordMeetsPolicy(value) {
    const pass = String(value || '');
    return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass);
  },
  showError(elementId, message) {
    const target = document.getElementById(elementId);
    const errorNode = document.getElementById(`${elementId}-error`);
    if (!target) return;
    if (errorNode) {
      errorNode.textContent = message;
      errorNode.hidden = !message;
      return;
    }
    const node = document.createElement('div');
    node.id = `${elementId}-error`;
    node.className = 'field-error';
    node.textContent = message || '';
    node.hidden = !message;
    target.parentElement.appendChild(node);
  },
  clearError(elementId) {
    const node = document.getElementById(`${elementId}-error`);
    if (node) {
      node.textContent = '';
      node.hidden = true;
    }
  }
};

window.showToast = function (message, tone = 'success') {
  let toast = document.getElementById('uenr-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'uenr-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast-${tone}`;
  toast.classList.add('show');
  clearTimeout(window.__uenrToastTimer);
  window.__uenrToastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
};
