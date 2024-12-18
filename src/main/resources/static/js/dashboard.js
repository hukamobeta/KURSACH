class Dashboard {
    constructor() {
        if (!localStorage.getItem('token')) {
            window.location.replace('/login');
            return;
        }

        window.addEventListener('unhandledrejection', event => {
            if (event.reason?.message === 'Unauthorized') {
                localStorage.removeItem('token');
                window.location.replace('/login');
            }
        });

        this.api = new ParkingAPI();
        this.grid = new ParkingGrid('parkingGrid');

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/parking`;

        this.socket = new ParkingSocket(wsUrl, (data) => {
            this.handleWebSocketMessage(data);
        });

        this.loadData();
        this.setupEventListeners();
    }

    handleWebSocketMessage(data) {
        console.log('WebSocket message received:', data);
        switch(data.type) {
            case 'SPOT_UPDATE':
                this.grid.updateSpotStatus(data.spotId, data.status);
                this.loadData();
                break;
            case 'RESERVATION_UPDATE':
                this.loadData();
                break;
        }
    }

    async loadData() {
        try {
            console.log('Loading parking spots...');
            const spots = await this.api.getParkingSpots();
            console.log('Loaded spots:', spots);
            this.grid.render(spots);
            this.updateStatusCounts(spots);
            if (this.grid.startTimers) {
                this.grid.startTimers();
            }
        } catch (error) {
            console.error('Failed to load spots:', error);
            this.showError('Не удалось загрузить данные парковки');
        }
    }

    setupEventListeners() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
            });
        }
    }

    updateStatusCounts(spots) {
        const counts = spots.reduce((acc, spot) => {
            acc[spot.status] = (acc[spot.status] || 0) + 1;
            return acc;
        }, {});

        const availableElement = document.querySelector('.status-value.available');
        const occupiedElement = document.querySelector('.status-value.occupied');
        
        if (availableElement) {
            availableElement.textContent = counts.available || 0;
        }
        if (occupiedElement) {
            occupiedElement.textContent = (counts.occupied || 0) + (counts.reserved || 0);
        }
    }

    showError(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.className = 'toast error show';
            const msgElem = toast.querySelector('.toast-message');
            if (msgElem) msgElem.textContent = message;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        } else {
            console.error(message);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const user = await response.json();
                const userNameElement = document.querySelector('.user-name');
                const userAvatarElement = document.querySelector('.user-avatar');

                if (userNameElement) {
                    userNameElement.textContent = user.fullName || user.email;
                }

                if (userAvatarElement) {
                    userAvatarElement.src = user.avatarUrl || '/images/avatar-placeholder.png';
                }
            } else {
                console.error('Не удалось загрузить профиль пользователя:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при загрузке профиля:', error);
        }
    }
});
