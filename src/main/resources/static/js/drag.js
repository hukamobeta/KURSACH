class DragManager {
    constructor(parkingManager) {
        this.parkingManager = parkingManager;
        this.init();
    }

    init() {
        document.querySelectorAll('.parking-spot').forEach(spot => {
            if (!spot.classList.contains('occupied')) {
                this.makeSpotDraggable(spot);
            }
        });

        this.initDropZone();
    }

    makeSpotDraggable(spot) {
        spot.setAttribute('draggable', true);
        
        spot.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('spotId', spot.dataset.id);
            spot.classList.add('dragging');
        });

        spot.addEventListener('dragend', () => {
            spot.classList.remove('dragging');
        });
    }

    initDropZone() {
        const bookingPanel = document.querySelector('.booking-panel');

        bookingPanel.addEventListener('dragover', (e) => {
            e.preventDefault();
            bookingPanel.classList.add('drag-over');
        });

        bookingPanel.addEventListener('dragleave', () => {
            bookingPanel.classList.remove('drag-over');
        });

        bookingPanel.addEventListener('drop', (e) => {
            e.preventDefault();
            const spotId = e.dataTransfer.getData('spotId');
            this.parkingManager.showBookingForm(spotId);
            bookingPanel.classList.remove('drag-over');
        });
    }
}