class ParkingAPI {
    constructor() {
        this.baseUrl = '/api';
        this.token = localStorage.getItem('token');
    }

    async getParkingSpots() {
        try {
            const response = await fetch(`${this.baseUrl}/spots`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('Unauthorized');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Error fetching spots:', error);
            throw error;
        }
    }

    async createBooking(spotId, data) {
        try {
            const response = await fetch(`${this.baseUrl}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    spotId,
                    ...data
                })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }
}