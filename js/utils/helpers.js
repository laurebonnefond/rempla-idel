export function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function showSnackbar(message) {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.className = 'show';
    setTimeout(() => { snackbar.className = snackbar.className.replace('show', ''); }, 3000);
}

export function openModal(htmlContent) {
    const container = document.getElementById('modal-container');
    container.innerHTML = `<div class="modal-content">${htmlContent}</div>`;
    container.style.display = 'block';
    if (window.lucide) lucide.createIcons();
}

export function closeModal() {
    document.getElementById('modal-container').style.display = 'none';
}
