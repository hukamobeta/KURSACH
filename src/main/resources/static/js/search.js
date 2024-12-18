class SearchManager {
    constructor(parkingManager) {
        this.parkingManager = parkingManager;
        this.searchInput = document.querySelector('.search-input');
        this.initSearch();
    }

    initSearch() {
        let timeout = null;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
    }

    performSearch(query) {
        if (!query) {
            this.clearHighlight();
            return;
        }

        const spots = document.querySelectorAll('.parking-spot');
        spots.forEach(spot => {
            const number = spot.querySelector('.spot-number').textContent;
            if (this.matchSearch(number, query)) {
                this.highlightSpot(spot, number, query);
                spot.classList.add('search-match');
            } else {
                spot.classList.remove('search-match');
                this.clearSpotHighlight(spot);
            }
        });
    }

    matchSearch(text, query) {
        return text.toLowerCase().includes(query.toLowerCase());
    }

    highlightSpot(spot, text, query) {
        const number = spot.querySelector('.spot-number');
        const regex = new RegExp(`(${query})`, 'gi');
        number.innerHTML = text.replace(regex, '<span class="highlight">$1</span>');
    }

    clearSpotHighlight(spot) {
        const number = spot.querySelector('.spot-number');
        number.textContent = number.textContent;
    }

    clearHighlight() {
        document.querySelectorAll('.parking-spot').forEach(spot => {
            spot.classList.remove('search-match');
            this.clearSpotHighlight(spot);
        });
    }
}
