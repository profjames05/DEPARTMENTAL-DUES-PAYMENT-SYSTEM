document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('receiptContainer');
  if (container) {
    container.innerHTML = '<div class="receipt-box"><h2>Receipt</h2><p>Demo receipt generated successfully.</p></div>';
  }
});
