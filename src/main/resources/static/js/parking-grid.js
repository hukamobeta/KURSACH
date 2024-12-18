class ParkingGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.spots = [];
        this.selectedSpot = null;
        this.parkingSocket = null;
        this.initializeWebSocket();
    }

    initializeWebSocket() {
        this.parkingSocket = new ParkingSocket((data) => {
            this.handleWebSocketMessage(data);
        });
    }

    render(spots) {
        if (!this.container) return;
        
        this.spots = spots;
        this.container.innerHTML = '';
        
        const layout = document.createElement('div');
        layout.className = 'parking-layout';

        const sections = this.groupBySection(spots);
        
        Object.entries(sections).forEach(([sectionKey, sectionSpots]) => {
            const sectionGroup = document.createElement('div');
            sectionGroup.className = 'section-group';
            
            const title = document.createElement('div');
            title.className = 'section-title';
            title.textContent = `Секция ${sectionKey}`;
            sectionGroup.appendChild(title);
            
            const section = document.createElement('div');
            section.className = 'parking-section';
            
            sectionSpots.forEach(spot => {
                section.appendChild(this.createSpotElement(spot));
            });
            
            sectionGroup.appendChild(section);
            layout.appendChild(sectionGroup);
        });

        this.container.appendChild(layout);
    }


    createSection(sectionKey, spots) {
        const section = document.createElement('div');
        section.className = 'parking-section';
        
        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = `Секция ${sectionKey}`;
        section.appendChild(title);
        
        const spotsGrid = document.createElement('div');
        spotsGrid.className = 'spots-grid';
        
        spots.forEach(spot => {
            spotsGrid.appendChild(this.createSpotElement(spot));
        });
        
        section.appendChild(spotsGrid);
        return section;
    }

    createParkingRow(spots, position) {
        const row = document.createElement('div');
        row.className = `parking-row ${position}-row`;
        
        spots.forEach(spot => {
            const spotWrapper = document.createElement('div');
            spotWrapper.className = 'spot-wrapper';
            spotWrapper.appendChild(this.createSpotElement(spot));
            row.appendChild(spotWrapper);
        });
        
        return row;
    }

    createSpotElement(spot) {
        const element = document.createElement('div');
        element.className = `parking-spot ${spot.type.toLowerCase()} ${spot.status.toLowerCase()}`;
        element.dataset.id = spot.id;
    
        const [section, ...numberParts] = spot.spotNumber.split('');
        const number = numberParts.join('');
    
        element.innerHTML = `
            <div class="spot-content">
                <div>
                    <div class="spot-number">
                        <span class="section">${section}</span>
                        <span class="number">${number}</span>
                    </div>
                    <div class="spot-price">${spot.pricePerHour}₽/час</div>
                </div>
                
                ${spot.type === 'VIP' ? 
                    '<div class="vip-badge">VIP</div>' : 
                    `<div class="spot-type">${this.getTypeIcon(spot.type)}</div>`
                }
                
                ${spot.status === 'AVAILABLE' ? 
                    '<button class="book-btn">Забронировать</button>' : 
                    `<div class="spot-status ${spot.status.toLowerCase()}">${this.getStatusText(spot.status)}</div>`
                }
            </div>
        `;
    
        if (spot.status === 'AVAILABLE') {
            const bookBtn = element.querySelector('.book-btn');
            if (bookBtn) {
                bookBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleSpotClick(spot);
                });
            }
        }
    
        if (spot.status === 'AVAILABLE') {
            element.addEventListener('click', () => {
                this.handleSpotClick(spot);
            });
        }
    
        return element;
    }
    addSpotEventListeners(element, spot) {
        element.addEventListener('mouseenter', () => {
            if (spot.status === 'AVAILABLE') {
                element.style.transform = 'scale(1.02)';
                element.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
            element.style.boxShadow = 'none';
        });

        const bookBtn = element.querySelector('.book-btn');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => this.handleSpotClick(spot));
        }
    }

    createInnerRoad() {
        const road = document.createElement('div');
        road.className = 'inner-road';
        road.innerHTML = `
            <div class="road-markings"></div>
            <div class="direction-arrows">
                <span class="arrow">→</span>
                <span class="arrow">→</span>
            </div>
        `;
        return road;
    }

    createRoad() {
        const road = document.createElement('div');
        road.className = 'main-road';
        road.innerHTML = `
            <div class="road-markings"></div>
            <div class="direction-arrows">
                <span class="arrow">↓</span>
                <span class="arrow">↓</span>
            </div>
        `;
        return road;
    }

    getTypeBackground(type) {
        const backgrounds = {
            STANDARD: 'bg-blue',
            VIP: 'bg-gold',
            ELECTRIC: 'bg-green',
            DISABLED: 'bg-purple'
        };
        return backgrounds[type] || backgrounds.STANDARD;
    }

    getTypeIcon(type) {
        const icons = {
            STANDARD: '<i class="fas fa-car"></i>',
            VIP: '<i class="fas fa-star"></i>',
            ELECTRIC: '<i class="fas fa-charging-station"></i>',
            DISABLED: '<i class="fas fa-wheelchair"></i>'
        };
        return icons[type] || icons.STANDARD;
    }
    
    getTypeLabel(type) {
        const labels = {
            STANDARD: 'Стандарт',
            VIP: 'VIP',
            ELECTRIC: 'Электро',
            DISABLED: 'Инвалид'
        };
        return labels[type] || type;
    }
    
    getStatusText(status) {
        const texts = {
            AVAILABLE: 'Свободно',
            OCCUPIED: 'Занято',
            RESERVED: 'Забронировано'
        };
        return texts[status] || status;
    }

    handleWebSocketMessage(data) {
        if (Array.isArray(data)) {
            this.render(data);
            return;
        }

        if (data.type === 'SPOT_UPDATE') {
            this.updateSpotStatus(data.spotId, data.status);
        }
    }

    handleSpotClick(spot) {
        if (spot.status !== 'AVAILABLE') {
            return;
        }
    
        if (this.selectedSpot) {
            this.selectedSpot.classList.remove('selected');
        }
        
        const element = this.container.querySelector(`[data-id="${spot.id}"]`);
        if (element) {
            element.classList.add('selected');
            this.selectedSpot = element;
        }
    
        if (!window.bookingPanel) {
            console.error('BookingPanel not initialized');
            showToast('Ошибка инициализации панели бронирования', 'error');
            return;
        }
    
        window.bookingPanel.show(spot);
    }

    updateSpotStatus(spotId, newStatus) {
        const spotElement = this.container.querySelector(`[data-id="${spotId}"]`);
        if (!spotElement) return;

        spotElement.className = `parking-spot ${newStatus.toLowerCase()}`;
        
        const statusContainer = spotElement.querySelector('.spot-status, .book-btn');
        if (statusContainer) {
            if (newStatus === 'AVAILABLE') {
                statusContainer.outerHTML = '<button class="book-btn">Забронировать</button>';
                const newBtn = spotElement.querySelector('.book-btn');
                if (newBtn) {
                    newBtn.addEventListener('click', () => {
                        const spot = this.spots.find(s => s.id === parseInt(spotId));
                        if (spot) this.handleSpotClick(spot);
                    });
                }
            } else {
                statusContainer.outerHTML = `<div class="spot-status ${newStatus.toLowerCase()}">${this.getStatusText(newStatus)}</div>`;
            }
        }
    }

    groupBySection(spots) {
        return spots.reduce((acc, spot) => {
            const section = spot.spotNumber.charAt(0);
            if (!acc[section]) acc[section] = [];
            acc[section].push(spot);
            return acc;
        }, {});
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const parkingGrid = new ParkingGrid('parkingContainer');
});