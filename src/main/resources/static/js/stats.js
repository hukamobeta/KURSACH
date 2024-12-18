class ParkingStats {
    constructor() {
        this.statsEndpoint = '/api/spots/stats';
        this.availableElement = document.querySelector('.status-value.available');
        this.occupiedElement = document.querySelector('.status-value.occupied');
        
        this.initStats();
        setInterval(() => this.updateStats(), 30000);
    }

    async initStats() {
        await this.updateStats();
    }

    async updateStats() {
        try {
            const response = await fetch('/api/spots/stats');
            const stats = await response.json();
            
            if (this.availableElement) {
                this.availableElement.textContent = stats.availableSpots;
            }
            
            if (this.occupiedElement) {
                this.occupiedElement.textContent = stats.totalSpots - stats.availableSpots;
            }
        } catch (error) {
            console.error('Failed to update parking stats:', error);
        }
    }
}

class ParkingCalendar {
    constructor() {
        this.calendarWrapper = document.querySelector('.calendar-wrapper');
        this.initCalendar();
    }

    initCalendar() {
        const today = new Date();
        this.renderCalendar(today);
    }

    renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const calendarHTML = `
            <div class="calendar-header">
                <span class="calendar-title">${this.getMonthName(month)} ${year} г.</span>
                <div class="calendar-nav">
                    <button class="prev-month">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <button class="next-month">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            ${this.generateCalendarGrid(date)}
        `;

        if (this.calendarWrapper) {
            this.calendarWrapper.innerHTML = calendarHTML;
            this.attachEventListeners();
        }
    }

    generateCalendarGrid(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        let calendarHTML = `
            <div class="calendar-weekdays">
                ${this.getWeekDays().map(day => `
                    <div class="calendar-weekday">${day}</div>
                `).join('')}
            </div>
            <div class="calendar-grid">
        `;

        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day disabled"></div>';
        }

        for (let day = 1; day <= totalDays; day++) {
            const isToday = this.isToday(year, month, day);
            calendarHTML += `
                <div class="calendar-day${isToday ? ' active' : ''}" data-date="${year}-${month + 1}-${day}">
                    ${day}
                </div>
            `;
        }

        calendarHTML += '</div>';
        return calendarHTML;
    }

    getWeekDays() {
        return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    }

    getMonthName(month) {
        const months = [
            'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
            'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
        ];
        return months[month];
    }

    isToday(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year &&
               today.getMonth() === month &&
               today.getDate() === day;
    }

    attachEventListeners() {
        const prevButton = this.calendarWrapper.querySelector('.prev-month');
        const nextButton = this.calendarWrapper.querySelector('.next-month');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => this.changeMonth(-1));
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.changeMonth(1));
        }

        const days = this.calendarWrapper.querySelectorAll('.calendar-day:not(.disabled)');
        days.forEach(day => {
            day.addEventListener('click', (e) => this.selectDate(e.target));
        });
    }

    changeMonth(delta) {
        const currentTitle = this.calendarWrapper.querySelector('.calendar-title').textContent;
        const [month, year] = currentTitle.split(' ');
        const currentDate = new Date(year, this.getMonthIndex(month));
        currentDate.setMonth(currentDate.getMonth() + delta);
        this.renderCalendar(currentDate);
    }

    getMonthIndex(monthName) {
        const months = [
            'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
            'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
        ];
        return months.indexOf(monthName.toLowerCase());
    }

    selectDate(dayElement) {
        this.calendarWrapper.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('active');
        });
        
        dayElement.classList.add('active');
        
        const selectedDate = dayElement.dataset.date;
        console.log('Selected date:', selectedDate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ParkingStats();
});