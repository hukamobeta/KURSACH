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

window.loadReservations = async function() {
    const response = await fetch('/api/reservations', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const reservations = await response.json();
    
    const container = document.getElementById('reservations-list');
    container.innerHTML = reservations.map(res => `
        <div class="reservation-card">
            <div class="reservation-header">
                <h3>Место ${res.spotNumber}</h3>
                <span class="status ${res.status.toLowerCase()}">${res.status}</span>
            </div>
            <div class="reservation-info">
                <p><i class="fas fa-clock"></i> Начало: ${new Date(res.startTime).toLocaleString()}</p>
                <p><i class="fas fa-clock"></i> Конец: ${new Date(res.endTime).toLocaleString()}</p>
                <p><i class="fas fa-money-bill"></i> Стоимость: ${res.totalPrice} ₽</p>
            </div>
            ${res.status === 'ACTIVE' ? 
                `<button class="cancel-btn" onclick="cancelReservation(${res.id})">
                    <i class="fas fa-times"></i> Отменить
                </button>` : 
                ''
            }
        </div>
    `).join('');
};

window.cancelReservation = async function(id) {
    try {
        await fetch(`/api/reservations/${id}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        loadReservations();
        showToast('Бронирование отменено', 'success');
    } catch (error) {
        showToast('Ошибка при отмене бронирования', 'error');
    }
};

window.loadStats = async function() {
    try {
        const response = await fetch('/api/spots/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load stats');
        }

        const stats = await response.json();
        console.log('Received stats:', stats);

        const totalSpots = document.getElementById('totalSpots');
        const occupiedSpots = document.getElementById('occupiedSpots');
        const occupancyRate = document.getElementById('occupancyRate');

        if (totalSpots) totalSpots.textContent = stats.totalSpots;
        if (occupiedSpots) occupiedSpots.textContent = stats.totalSpots - stats.availableSpots;
        if (occupancyRate) {
            const rate = ((stats.totalSpots - stats.availableSpots) / stats.totalSpots * 100).toFixed(1);
            occupancyRate.textContent = `${rate}%`;
        }

        if (window.hourlyChart) window.hourlyChart.destroy();
        if (window.dailyChart) window.dailyChart.destroy();

        if (Array.isArray(stats.hourlyStats)) {
            const hourlyCtx = document.getElementById('hourly-chart');
            if (hourlyCtx) {
                window.hourlyChart = createHourlyChart(hourlyCtx.getContext('2d'), stats.hourlyStats);
            }
        }
        
        if (Array.isArray(stats.dailyStats)) {
            const dailyCtx = document.getElementById('daily-chart');
            if (dailyCtx) {
                window.dailyChart = createDailyChart(dailyCtx.getContext('2d'), stats.dailyStats);
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Ошибка при загрузке статистики', 'error');
    }
};

window.loadProfile = async function() {
    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const user = await response.json();
        
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('phoneNumber').value = user.phoneNumber || '';
        document.getElementById('email').value = user.email || '';
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Ошибка при загрузке профиля', 'error');
    }
};

function createHourlyChart(ctx, data) {
    console.log('Hourly data:', data);
    
    const hours = Array.from({length: 24}, (_, i) => i);
    const occupancyData = hours.map(hour => {
        const hourData = data.find(d => d.hour === hour);
        return hourData ? hourData.occupancyRate * 100 : 0;
    });

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours.map(h => `${String(h).padStart(2, '0')}:00`),
            datasets: [{
                label: 'Загруженность (%)',
                data: occupancyData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Почасовая загрузка'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Загруженность (%)'
                    }
                }
            }
        }
    });
}

function createDailyChart(ctx, data) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const daysData = days.map((_, index) => {
        const dayData = data.find(d => d.dayOfWeek === index);
        return dayData ? dayData.occupancyRate * 100 : 0;
    });

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Загруженность (%)',
                data: daysData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Загрузка по дням недели'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Загруженность (%)'
                    }
                }
            }
        }
    });
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/login');
        return false;
    }
    return true;
}

async function makeApiRequest(url, options = {}) {
    if (!checkAuth()) return;
    
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}