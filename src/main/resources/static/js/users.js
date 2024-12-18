window.api = {
    request(url, options = {}) {
        const token = localStorage.getItem('token');
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.replace('/login');
            }
            return response;
        });
    }
 };
 
 class UserManager {
    constructor() {
    }
 
    async loadUsers() {
        try {
            const response = await window.api.request('/api/users');
            if (!response.ok) {
                throw new Error('Failed to load users');
            }
            const users = await response.json();
            this.renderUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
            showToast('Ошибка при загрузке пользователей', 'error');
        }
    }
 
    async deleteUser(userId) {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
        
        try {
            const response = await window.api.request(`/api/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            
            await this.loadUsers();
            showToast('Пользователь успешно удален', 'success');
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast('Ошибка при удалении пользователя', 'error');
        }
    }
 
    renderUsers(users) {
        const tbody = document.getElementById('users-list');
        if (!tbody) return;
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.email}</td>
                <td>${user.fullName || '-'}</td>
                <td>${user.phoneNumber || '-'}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="window.userManager.deleteUser(${user.id})" class="delete-btn">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>
            </tr>
        `).join('');
    }
 }
 

 function getUserRole() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
 }
 
 function checkAccess() {
    const role = getUserRole();
    const isAdmin = role === 'ROLE_ADMIN';
    
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        element.style.display = isAdmin ? 'block' : 'none';
    });

    const statsLink = document.querySelector('a[data-view="stats"]');
    const usersLink = document.querySelector('a[data-view="users"]');
    
    if (statsLink) {
        statsLink.style.display = isAdmin ? 'block' : 'none';
    }
    
    if (usersLink) {
        usersLink.style.display = isAdmin ? 'block' : 'none';
    }
}
 
window.userManager = new UserManager();
 
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/login');
        return;
    }
 
    checkAccess();
 
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            
            if ((view === 'users' || view === 'stats') && getUserRole() !== 'ROLE_ADMIN') {
                showToast('Доступ запрещен', 'error');
                return;
            }
 
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            document.querySelectorAll('.view-container').forEach(container => {
                container.classList.add('hidden');
            });
            
            const viewContainer = document.getElementById(`${view}-view`);
            if (viewContainer) {
                viewContainer.classList.remove('hidden');
                
                switch(view) {
                    case 'users':
                        window.userManager.loadUsers();
                        break;
                    case 'history':
                        loadReservations();
                        break;
                    case 'stats':
                        loadStats();
                        break;
                    case 'profile':
                        loadProfile();
                        break;
                }
            }
        });
    });
 
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.replace('/login');
        });
    }
 });