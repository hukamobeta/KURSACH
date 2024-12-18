class ParkingManager {
    constructor() {
        this.parkingGrid = document.getElementById('parkingContainer');
        this.loadData();
        this.currentSpot = null;
    }

    async loadData() {
        try {
            const response = await fetch('/api/spots', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const spots = await response.json();
            this.updateSpots(spots);
        } catch (error) {
            console.error('Failed to load spots:', error);
            showToast('Ошибка при загрузке данных парковки', 'error');
        }
    }

    updateSpots(spots) {
        if (!this.parkingGrid) return;
        
        // Группируем места по секциям
        const sections = spots.reduce((acc, spot) => {
            const section = spot.spotNumber.charAt(0);
            if (!acc[section]) {
                acc[section] = [];
            }
            acc[section].push(spot);
            return acc;
        }, {});

        // Очищаем текущую сетку
        this.parkingGrid.innerHTML = '';

        // Создаем секции
        Object.entries(sections).forEach(([sectionName, sectionSpots]) => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'parking-section';
            sectionElement.innerHTML = `<h3 class="section-title">Секция ${sectionName}</h3>`;

            const spotsContainer = document.createElement('div');
            spotsContainer.className = 'spots-container';

            sectionSpots.sort((a, b) => {
                const aNum = parseInt(a.spotNumber.slice(1));
                const bNum = parseInt(b.spotNumber.slice(1));
                return aNum - bNum;
            }).forEach(spot => {
                spotsContainer.appendChild(this.createSpotElement(spot));
            });

            sectionElement.appendChild(spotsContainer);
            this.parkingGrid.appendChild(sectionElement);
        });
    }

    createSpotElement(spot) {
        const element = document.createElement('div');
        element.className = `parking-spot ${spot.type.toLowerCase()} ${spot.status.toLowerCase()}`;
        element.innerHTML = `
            <div class="spot-number">${spot.spotNumber}</div>
            <div class="spot-info">
                <div class="spot-type">${this.getTypeText(spot.type)}</div>
                <div class="spot-price">${spot.pricePerHour} ₽/час</div>
                <div class="spot-status">${this.getStatusText(spot.status)}</div>
            </div>
        `;
        
        if (spot.status === 'AVAILABLE') {
            element.addEventListener('click', () => {
                this.handleSpotClick(spot);
            });
        }
        
        return element;
    }

    handleSpotClick(spot) {
        if (this.selectedSpot) {
            this.selectedSpot.classList.remove('selected');
        }
        
        const element = this.container.querySelector(`[data-id="${spot.id}"]`);
        if (element) {
            element.classList.add('selected');
            this.selectedSpot = element;
        }
    
        // Показываем панель бронирования через глобальный объект
        if (window.bookingPanel) {
            window.bookingPanel.show(spot);
        }
    }
    
    getTypeText(type) {
        const typeMap = {
            'STANDARD': 'Стандарт',
            'VIP': 'VIP',
            'ELECTRIC': 'Электро',
            'DISABLED': 'Для инвалидов'
        };
        return typeMap[type] || type;
    }

    getStatusText(status) {
        const statusMap = {
            'AVAILABLE': 'Свободно',
            'OCCUPIED': 'Занято',
            'RESERVED': 'Забронировано',
            'MAINTENANCE': 'Обслуживание'
        };
        return statusMap[status] || status;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.parkingManager = new ParkingManager();
});