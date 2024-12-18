class BookingPanel {
    constructor() {
        console.log('Initializing BookingPanel...');
        
        this.panel = document.querySelector('.booking-panel');
        this.form = document.getElementById('bookingForm');
        this.closeBtn = this.panel.querySelector('.close-btn');
        this.currentSpot = null;

        console.log('Found panel:', this.panel);
        console.log('Found form:', this.form);
        console.log('Found close button:', this.closeBtn);

        this.initialize();
    }

    initialize() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hide();
            });
        }

        document.addEventListener('click', (e) => {
            if (this.panel && !this.panel.contains(e.target) && !this.panel.classList.contains('hidden')) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.panel.classList.contains('hidden')) {
                this.hide();
            }
        });
    }

    show(spot) {
        console.log('Showing booking panel for spot:', spot);
        
        if (!this.panel) {
            console.error('Booking panel element not found');
            return;
        }
    
        this.currentSpot = spot;
        
        const spotNumberElement = this.panel.querySelector('.spot-number');
        if (spotNumberElement) {
            spotNumberElement.textContent = spot.spotNumber;
        }
    
        this.panel.classList.remove('hidden');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.classList.remove('hidden');
    
        const startTimeInput = this.form.querySelector('[name="startTime"]');
        const endTimeInput = this.form.querySelector('[name="endTime"]');
        
        if (startTimeInput && endTimeInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 5);
            now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
            
            const startTime = now.toISOString().slice(0, 16);
            const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
            
            startTimeInput.min = startTime;
            endTimeInput.min = startTime;
            startTimeInput.value = startTime;
            endTimeInput.value = endTime;
        }
    }

    hide() {
        console.log('Hiding booking panel');
        if (this.panel) {
            this.panel.classList.add('hidden');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.classList.add('hidden');
            }
            if (this.form) {
                this.form.reset();
            }
            this.currentSpot = null;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.currentSpot) {
            showToast('Ошибка: место не выбрано', 'error');
            return;
        }

        const formData = new FormData(this.form);
        
        const currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() + 5);
        
        const startDate = new Date(formData.get('startTime'));
        const endDate = new Date(formData.get('endTime'));
        
        if (startDate <= currentDate) {
            showToast('Время начала должно быть в будущем', 'error');
            return;
        }
        
        if (endDate <= startDate) {
            showToast('Время окончания должно быть после времени начала', 'error');
            return;
        }
        const vehicleNumber = formData.get('vehicleNumber');

        const reservationData = {
            spotId: this.currentSpot.id,
            startTime: startDate.toISOString().slice(0, 19),
            endTime: endDate.toISOString().slice(0, 19),
            vehicleNumber: vehicleNumber
        };

        console.log('Sending reservation data:', reservationData);

        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(reservationData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                showToast(errorData.message || 'Ошибка при создании бронирования', 'error');
                return;
            }

            showToast('Бронирование успешно создано', 'success');
            this.hide();
            

            window.loadReservations && window.loadReservations();
            window.loadStats && window.loadStats();
            
            if (window.parkingGrid && typeof window.parkingGrid.loadSpots === 'function') {
                window.parkingGrid.loadSpots();
            }
        } catch (error) {
            console.error('Error creating reservation:', error);
            showToast('Ошибка при создании бронирования', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.bookingPanel = new BookingPanel();
});