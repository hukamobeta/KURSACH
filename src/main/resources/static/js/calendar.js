class Calendar {
    constructor(container, onSelect) {
        this.container = container;
        this.onSelect = onSelect;
        this.selectedDate = new Date();
        this.init();
    }

    init() {
        this.render();
        this.attachEvents();
    }

    render() {
        const now = new Date();
        const daysInMonth = new Date(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + 1,
            0
        ).getDate();

        let html = `
            <div class="calendar-header">
                <button class="prev-month">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h3>${this.selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button class="next-month">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-grid">
                ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => 
                    `<div class="calendar-weekday">${day}</div>`
                ).join('')}
        `;

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), i);
            const isDisabled = date < now;
            const isSelected = this.selectedDate.getDate() === i;

            html += `
                <div class="calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}"
                     data-date="${date.toISOString()}">
                    ${i}
                </div>
            `;
        }

        html += '</div>';
        this.container.innerHTML = html;
    }

    attachEvents() {
        this.container.addEventListener('click', e => {
            const day = e.target.closest('.calendar-day');
            if (day && !day.classList.contains('disabled')) {
                this.selectDate(new Date(day.dataset.date));
            }

            if (e.target.closest('.prev-month')) {
                this.prevMonth();
            }

            if (e.target.closest('.next-month')) {
                this.nextMonth();
            }
        });
    }

    selectDate(date) {
        this.selectedDate = date;
        this.render();
        this.onSelect(date);
    }

    prevMonth() {
        this.selectedDate = new Date(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() - 1,
            1
        );
        this.render();
    }

    nextMonth() {
        this.selectedDate = new Date(
            this.selectedDate.getFullYear(),
            this.selectedDate.getMonth() + 1,
            1
        );
        this.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const calendarContainer = document.querySelector('.calendar-wrapper');
    if (calendarContainer) {
        new Calendar(calendarContainer, (selectedDate) => {
            console.log('Выбрана дата:', selectedDate);
        });
    }
});