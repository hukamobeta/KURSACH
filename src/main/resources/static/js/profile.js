document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profile-form');
    const userInfo = document.querySelector('.user-info');
    const userDropdown = document.querySelector('.user-dropdown');

    function logout() {
        localStorage.removeItem('token');
        window.location.replace('/login');
    }

    if (userInfo) {
        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', (e) => {
        if (!userInfo?.contains(e.target)) {
            userDropdown?.classList.add('hidden');
        }
    });

    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', logout);
    });

    async function loadProfile() {
        try {
            const response = await fetch('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const user = await response.json();
            
            fillProfileForm(user);
        } catch (error) {
            console.error('Error loading profile:', error);
            showToast('Ошибка при загрузке профиля', 'error');
        }
    }
    function fillProfileForm(user) {
        const elements = {
            fullName: document.getElementById('fullName'),
            phoneNumber: document.getElementById('phoneNumber'),
            email: document.getElementById('email')
        };

        if (elements.fullName) elements.fullName.value = user.fullName || '';
        if (elements.phoneNumber) elements.phoneNumber.value = user.phoneNumber || '';
        if (elements.email) elements.email.value = user.email || '';
    }

    async function updateProfile(event) {
        event.preventDefault();
        
        const formData = {
            fullName: document.getElementById('fullName').value,
            phoneNumber: document.getElementById('phoneNumber').value
        };

        try {
            const response = await fetch('/api/users/me/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast('Профиль обновлен', 'success');
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Ошибка при обновлении профиля', 'error');
        }
    }

    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }

    if (document.getElementById('profile-view')) {
        loadProfile();
    }

    window.loadProfile = loadProfile;
});