class ParkingSocket {
    constructor(onUpdate) {
        this.onUpdate = onUpdate;
        this.connect();
    }

    connect() {
        const socket = new SockJS('/ws/parking');
        this.stompClient = Stomp.over(socket);
        
        const headers = {};
        if (localStorage.getItem('token')) {
            headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        }

        this.stompClient.connect(headers, 
            () => {
                console.log('Connected to WebSocket');
                this.stompClient.subscribe('/topic/parking', (message) => {
                    const data = JSON.parse(message.body);
                    if (this.onUpdate) this.onUpdate(data);
                });
                
                this.stompClient.send("/app/parking.getSpots", {}, {});
            },
            (error) => {
                console.error('WebSocket connection error:', error);
                setTimeout(() => this.connect(), 5000);
            }
        );
    }
}