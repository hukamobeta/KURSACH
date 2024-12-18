document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: document.getElementById("username").value,
                        password: document.getElementById("password").value 
                    })
                });
        
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.replace('/app');
                }
            } catch (error) {
                showError(error.message);
            }
        });
    }
});

function showError(message) {
    const modal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");
    
    if (errorMessage && modal) {
        errorMessage.textContent = message;
        modal.style.display = "flex";
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

document.addEventListener('DOMContentLoaded', checkAccess);