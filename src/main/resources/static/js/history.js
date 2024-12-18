document.addEventListener('DOMContentLoaded', function() {
    const reservationsList = document.getElementById('reservations-list');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');

    async function loadReservations() {
        try {
            const response = await fetch('/api/reservations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const reservations = await response.json();
            console.log(reservations);
            displayReservations(filterReservations(reservations));
        } catch (error) {
            console.error('Ошибка загрузки бронирований:', error);
            showToast('Ошибка при загрузке бронирований', 'error');
        }
    }

    function filterReservations(reservations) {
        return reservations.filter(res => {
            const statusMatch = statusFilter.value === 'all' || res.status === statusFilter.value;
            const dateMatch = !dateFilter.value || 
                new Date(res.startTime).toLocaleDateString() === new Date(dateFilter.value).toLocaleDateString();
            return statusMatch && dateMatch;
        });
    }

    function displayReservations(reservations) {
        if (!reservationsList) return;
    
        reservationsList.innerHTML = reservations.map(res => `
            <tr>
                <td>${res.spotNumber}</td>
                <td>${res.vehicleNumber}</td>
                <td>${new Date(res.startTime).toLocaleString()}</td>
                <td>${new Date(res.endTime).toLocaleString()}</td>
                <td><span class="status-badge ${res.status.toLowerCase()}">${res.status}</span></td>
                <td>${res.totalPrice} ₽</td>
                <td>
                    ${res.status === 'ACTIVE' ?
                        `<button class="cancel-btn" onclick="cancelReservation(${res.id})">
                            <i class="fas fa-times"></i> Отменить
                        </button>` :
                        ''
                    }
                </td>
            </tr>
        `).join('');
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            loadReservations();
        });
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            loadReservations();
        });
    }

    window.loadReservations = loadReservations;
});