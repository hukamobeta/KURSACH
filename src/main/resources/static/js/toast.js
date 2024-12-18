const Toast = {
    show: function(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.warn('Toast элемент не найден');
            return;
        }
        
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        if (icon) {
            icon.className = 'toast-icon fas ' + {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                info: 'fa-info-circle'
            }[type];
        }
        
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.className = 'toast hidden';
        }, 3000);
    }
};

window.showToast = Toast.show;