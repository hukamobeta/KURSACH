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
        // Обработчик для формы
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Обработчик для кнопки закрытия
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hide();
            });
        }

        // Закрытие по клику вне модального окна
        document.addEventListener('click', (e) => {
            if (this.panel && !this.panel.contains(e.target) && !this.panel.classList.contains('hidden')) {
                this.hide();
            }
        });

        // Закрытие по кнопке Escape
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
        
        // Обновляем номер места
        const spotNumberElement = this.panel.querySelector('.spot-number');
        if (spotNumberElement) {
            spotNumberElement.textContent = spot.spotNumber;
        }
    
        // Показываем панель и фон
        this.panel.classList.remove('hidden');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.classList.remove('hidden');
    
        // Устанавливаем время
        const startTimeInput = this.form.querySelector('[name="startTime"]');
        const endTimeInput = this.form.querySelector('[name="endTime"]');
        
        if (startTimeInput && endTimeInput) {
            // Получаем текущее время и добавляем 5 минут для гарантии
            const now = new Date();
            now.setMinutes(now.getMinutes() + 5);
            // Округляем до ближайших 5 минут
            now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
            
            const startTime = now.toISOString().slice(0, 16);
            // Для времени окончания добавляем 2 часа
            const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
            
            // Устанавливаем значения
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
            // Скрываем фон
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
        
        // Получаем текущее время сервера и добавляем 5 минут
        const currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() + 5);
        
        // Создаем даты из формы
        const startDate = new Date(formData.get('startTime'));
        const endDate = new Date(formData.get('endTime'));
        
        // Проверяем, что даты в будущем
        if (startDate <= currentDate) {
            showToast('Время начала должно быть в будущем', 'error');
            return;
        }
        
        if (endDate <= startDate) {
            showToast('Время окончания должно быть после времени начала', 'error');
            return;
        }
        const vehicleNumber = formData.get('vehicleNumber'); // Пока оставим carNumber, т.к. в форме это поле так называется

        const reservationData = {
            spotId: this.currentSpot.id,
            startTime: startDate.toISOString().slice(0, 19), // Обрезаем до секунд
            endTime: endDate.toISOString().slice(0, 19),     // Обрезаем до секунд
            vehicleNumber: vehicleNumber // Теперь передаем значение из формы
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
            
            // Обновляем данные на странице
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.bookingPanel = new BookingPanel();
});