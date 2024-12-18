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

        const elements = {
            totalSpots: document.getElementById('totalSpots'),
            occupiedSpots: document.getElementById('occupiedSpots'),
            occupancyRate: document.getElementById('occupancyRate')
        };

        if (elements.totalSpots) {
            elements.totalSpots.textContent = stats.totalSpots || 0;
        }
        if (elements.occupiedSpots) {
            elements.occupiedSpots.textContent = (stats.totalSpots - stats.availableSpots) || 0;
        }
        if (elements.occupancyRate && stats.totalSpots > 0) {
            const rate = ((stats.totalSpots - stats.availableSpots) / stats.totalSpots * 100).toFixed(1);
            elements.occupancyRate.textContent = `${rate}%`;
        }

        if (window.hourlyChart) {
            window.hourlyChart.destroy();
        }
        if (window.dailyChart) {
            window.dailyChart.destroy();
        }

        const hourlyCtx = document.getElementById('hourly-chart');
        const dailyCtx = document.getElementById('daily-chart');

        if (hourlyCtx && stats.hourlyStats) {
            window.hourlyChart = createHourlyChart(hourlyCtx.getContext('2d'), stats.hourlyStats);
        }
        if (dailyCtx && stats.dailyStats) {
            window.dailyChart = createDailyChart(dailyCtx.getContext('2d'), stats.dailyStats);
        }

    } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Ошибка при загрузке статистики', 'error');
    }
};