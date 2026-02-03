// Price calculator functionality
document.addEventListener('DOMContentLoaded', function() {
    // Price data
    const priceData = {
        toyota: {
            '2020-2024': { multiplier: 1.2 },
            '2015-2019': { multiplier: 1.0 },
            '2010-2014': { multiplier: 0.9 },
            '2005-2009': { multiplier: 0.8 },
            'до 2005': { multiplier: 0.7 }
        },
        volkswagen: {
            '2020-2024': { multiplier: 1.1 },
            '2015-2019': { multiplier: 1.0 },
            '2010-2014': { multiplier: 0.9 },
            '2005-2009': { multiplier: 0.8 },
            'до 2005': { multiplier: 0.7 }
        },
        bmw: {
            '2020-2024': { multiplier: 1.4 },
            '2015-2019': { multiplier: 1.2 },
            '2010-2014': { multiplier: 1.1 },
            '2005-2009': { multiplier: 1.0 },
            'до 2005': { multiplier: 0.9 }
        },
        mercedes: {
            '2020-2024': { multiplier: 1.4 },
            '2015-2019': { multiplier: 1.2 },
            '2010-2014': { multiplier: 1.1 },
            '2005-2009': { multiplier: 1.0 },
            'до 2005': { multiplier: 0.9 }
        },
        audi: {
            '2020-2024': { multiplier: 1.3 },
            '2015-2019': { multiplier: 1.1 },
            '2010-2014': { multiplier: 1.0 },
            '2005-2009': { multiplier: 0.9 },
            'до 2005': { multiplier: 0.8 }
        }
    };

    const servicePrices = {
        diagnostics: { work: 1500, parts: 0 },
        maintenance: { work: 2500, parts: 5000 },
        engine: { work: 8000, parts: 15000 },
        suspension: { work: 4000, parts: 8000 },
        brakes: { work: 3000, parts: 6000 },
        electrics: { work: 3500, parts: 4000 },
        tires: { work: 2000, parts: 0 }
    };

    // DOM Elements
    const calculateBtn = document.getElementById('calculate-btn');
    const carBrandSelect = document.getElementById('car-brand');
    const carYearSelect = document.getElementById('car-year');
    const serviceTypeSelect = document.getElementById('service-type');
    const workPriceEl = document.getElementById('work-price');
    const partsPriceEl = document.getElementById('parts-price');
    const totalPriceEl = document.getElementById('total-price');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tableButtons = document.querySelectorAll('.btn-table');
    const offerButtons = document.querySelectorAll('.offer-btn');

    // Initialize
    function initPrices() {
        setupEventListeners();
        loadSavedCalculations();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Calculate button
        calculateBtn.addEventListener('click', calculatePrice);

        // Table buttons (quick appointment)
        tableButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const service = this.dataset.service;
                showBookingModal(service);
            });
        });

        // Offer buttons
        offerButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const offer = this.dataset.offer;
                applyOffer(offer);
            });
        });

        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.dataset.filter;
                filterTables(filter);
            });
        });
    }

    // Calculate price
    function calculatePrice() {
        const brand = carBrandSelect.value;
        const year = carYearSelect.value;
        const service = serviceTypeSelect.value;

        // Validate inputs
        if (!brand || !year || !service) {
            showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }

        // Get base prices
        const basePrices = servicePrices[service];
        if (!basePrices) {
            showNotification('Ошибка в расчете цен', 'error');
            return;
        }

        // Apply multiplier based on brand and year
        let multiplier = 1.0;
        if (priceData[brand] && priceData[brand][year]) {
            multiplier = priceData[brand][year].multiplier;
        }

        // Calculate final prices
        const workPrice = Math.round(basePrices.work * multiplier);
        const partsPrice = Math.round(basePrices.parts * multiplier);
        const totalPrice = workPrice + partsPrice;

        // Update display
        workPriceEl.textContent = formatPrice(workPrice) + ' ₽';
        partsPriceEl.textContent = formatPrice(partsPrice) + ' ₽';
        totalPriceEl.textContent = formatPrice(totalPrice) + ' ₽';

        // Save calculation to localStorage
        saveCalculation({ brand, year, service, workPrice, partsPrice, totalPrice });

        // Show success message
        showNotification('Стоимость рассчитана!', 'success');
    }

    // Format price with spaces
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    // Save calculation to localStorage
    function saveCalculation(data) {
        let calculations = JSON.parse(localStorage.getItem('priceCalculations') || '[]');
        calculations.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 calculations
        if (calculations.length > 10) {
            calculations = calculations.slice(-10);
        }
        
        localStorage.setItem('priceCalculations', JSON.stringify(calculations));
    }

    // Load saved calculations
    function loadSavedCalculations() {
        const calculations = JSON.parse(localStorage.getItem('priceCalculations') || '[]');
        if (calculations.length > 0) {
            // Show last calculation
            const lastCalc = calculations[calculations.length - 1];
            
            // Set form values
            carBrandSelect.value = lastCalc.brand;
            carYearSelect.value = lastCalc.year;
            serviceTypeSelect.value = lastCalc.service;
            
            // Update prices
            workPriceEl.textContent = formatPrice(lastCalc.workPrice) + ' ₽';
            partsPriceEl.textContent = formatPrice(lastCalc.partsPrice) + ' ₽';
            totalPriceEl.textContent = formatPrice(lastCalc.totalPrice) + ' ₽';
            
            showNotification('Загружена последняя расчетная стоимость', 'info');
        }
    }

    // Show booking modal
    function showBookingModal(service) {
        // Create modal HTML
        const modalHTML = `
            <div class="modal active" id="booking-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Запись на услугу</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Вы выбрали: <strong>${service}</strong></p>
                        <p>Для завершения записи перейдите на страницу контактов</p>
                        <div class="modal-buttons">
                            <a href="contact.html#booking" class="btn btn-primary">
                                Перейти к записи
                            </a>
                            <button class="btn btn-outline modal-close-btn">
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        const modal = document.getElementById('booking-modal');
        const closeBtn = modal.querySelector('.modal-close');
        const closeBtn2 = modal.querySelector('.modal-close-btn');

        closeBtn.addEventListener('click', () => modal.remove());
        closeBtn2.addEventListener('click', () => modal.remove());

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Save selected service to localStorage for pre-filling form
        localStorage.setItem('selectedService', service);
    }

    // Apply special offer
    function applyOffer(offer) {
        // Parse offer
        let discount = 0;
        if (offer.includes('-20%')) discount = 0.2;
        else if (offer.includes('-15%')) discount = 0.15;
        else if (offer.includes('бесплатно')) discount = 1.0;

        // Update calculator with offer
        const currentWork = parseInt(workPriceEl.textContent.replace(/\s/g, '').replace('₽', ''));
        const currentParts = parseInt(partsPriceEl.textContent.replace(/\s/g, '').replace('₽', ''));
        
        if (!isNaN(currentWork) && !isNaN(currentParts)) {
            const newWork = Math.round(currentWork * (1 - discount));
            const newParts = Math.round(currentParts * (1 - discount));
            const newTotal = newWork + newParts;

            workPriceEl.textContent = formatPrice(newWork) + ' ₽';
            partsPriceEl.textContent = formatPrice(newParts) + ' ₽';
            totalPriceEl.textContent = formatPrice(newTotal) + ' ₽';

            // Save offer to localStorage
            localStorage.setItem('appliedOffer', JSON.stringify({
                offer,
                discount,
                original: { work: currentWork, parts: currentParts, total: currentWork + currentParts },
                discounted: { work: newWork, parts: newParts, total: newTotal }
            }));

            showNotification(`Предложение "${offer}" применено!`, 'success');
        } else {
            showNotification('Сначала рассчитайте стоимость', 'error');
        }
    }

    // Filter price tables
    function filterTables(filter) {
        const tables = document.querySelectorAll('.price-table');
        
        tables.forEach(table => {
            if (filter === 'all') {
                table.style.display = 'block';
            } else if (filter === 'popular') {
                // Simple logic: show tables with most rows
                const rows = table.querySelectorAll('tbody tr').length;
                table.style.display = rows >= 4 ? 'block' : 'none';
            } else if (filter === 'economy') {
                // Show cheaper services (simple implementation)
                const prices = Array.from(table.querySelectorAll('td:nth-child(3)'))
                    .map(td => parseInt(td.textContent.replace(/\s/g, '').replace('₽', '')))
                    .filter(price => !isNaN(price));
                
                const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                table.style.display = avgPrice < 3000 ? 'block' : 'none';
            }
        });

        // Update active filter button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }

    // Show notification
    function showNotification(message, type = 'success') {
        // Remove old notification
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) oldNotification.remove();

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto hide after 5 seconds
        const hideTimeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(hideTimeout);
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Initialize
    initPrices();
});