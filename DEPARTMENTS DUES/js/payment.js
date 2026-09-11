document.addEventListener('DOMContentLoaded', () => {
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      window.showToast && window.showToast('Demo payment captured and sent for verification.');
    });
  }
});
