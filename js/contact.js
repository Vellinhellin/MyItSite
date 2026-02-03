// Contact page functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const contactForm = document.getElementById('contact-form');
    const formTabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const successModal = document.getElementById('success-modal');
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    const faqQuestions = document.querySelectorAll('.faq-question');
    const todayBookingsEl = document.getElementById('today-bookings');
    const onlineNowEl = document.getElementById('online-now');
    const dateInput = document.getElementById('date');
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    const fileCheckbox = document.getElementById('consult-file');
    const fileUpload = document.getElementById('file-upload');

    // Initialize
    function initContactPage() {
        setupFormValidation();
        setupDateInput();
        setupPhoneMask();
        setupFileUpload();
        setupFAQ();
        loadStats();
        setupEventListeners();
        
        // Set minimum date to tomorrow
        setMinDate();
        
        // Load saved form data if exists
        loadSavedFormData();
    }

    // Setup form validation
    function setupFormValidation() {
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get active tab
            const activeTab = document.querySelector('.tab-btn.active');
            const tabType = activeTab.dataset.tab;
            
            // Validate based on tab
            let isValid = true;
            
            if (tabType === 'booking') {
                isValid = validateBookingForm();
            } else if (tabType === 'consultation') {
                isValid = validateConsultationForm();
            } else if (tabType === 'callback') {
                isValid = validateCallbackForm();
            }
            
            if (isValid) {
                saveFormData();
                showSuccessModal(tabType);
                contactForm.reset();
                updateTodayBookings();
            }
        });
    }

    // Validate booking form
    function validateBookingForm() {
        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
        const carBrand = document.getElementById('car-brand');
        const serviceType = document.getElementById('service-type');
        const date = document.getElementById('date');
        const time = document.getElementById('time');
        
        let isValid = true;
        
        // Reset errors
        resetErrors();
        
        // Validate name
        if (!name.value.trim()) {
            showError(name, 'Введите ваше имя');
            isValid = false;
        }
        
        // Validate phone
        if (!phone.value.trim()) {
            showError(phone, 'Введите номер телефона');
            isValid = false;
        } else if (!isValidPhone(phone.value)) {
            showError(phone, 'Введите корректный номер телефона');
            isValid = false;
        }
        
        // Validate car brand
        if (!carBrand.value) {
            showError(carBrand, 'Выберите марку автомобиля');
            isValid = false;
        }
        
        // Validate service type
        if (!serviceType.value) {
            showError(serviceType, 'Выберите тип услуги');
            isValid = false;
        }
        
        // Validate date
        if (!date.value) {
            showError(date, 'Выберите дату');
            isValid = false;
        } else if (new Date(date.value) < new Date()) {
            showError(date, 'Дата должна быть в будущем');
            isValid = false;
        }
        
        // Validate time
        if (!time.value) {
            showError(time, 'Выберите время');
            isValid = false;
        }
        
        return isValid;
    }

    // Validate consultation form
    function validateConsultationForm() {
        const name = document.getElementById('consult-name');
        const phone = document.getElementById('consult-phone');
        const message = document.getElementById('consult-message');
        
        let isValid = true;
        
        resetErrors();
        
        if (!name.value.trim()) {
            showError(name, 'Введите ваше имя');
            isValid = false;
        }
        
        if (!phone.value.trim()) {
            showError(phone, 'Введите номер телефона');
            isValid = false;
        } else if (!isValidPhone(phone.value)) {
            showError(phone, 'Введите корректный номер телефона');
            isValid = false;
        }
        
        if (!message.value.trim()) {
            showError(message, 'Опишите ваш вопрос');
            isValid = false;
        }
        
        return isValid;
    }

    // Validate callback form
    function validateCallbackForm() {
        const name = document.getElementById('callback-name');
        const phone = document.getElementById('callback-phone');
        const time = document.getElementById('callback-time');
        
        let isValid = true;
        
        resetErrors();
        
        if (!name.value.trim()) {
            showError(name, 'Введите ваше имя');
            isValid = false;
        }
        
        if (!phone.value.trim()) {
            showError(phone, 'Введите номер телефона');
            isValid = false;
        } else if (!isValidPhone(phone.value)) {
            showError(phone, 'Введите корректный номер телефона');
            isValid = false;
        }
        
        if (!time.value) {
            showError(time, 'Выберите удобное время для звонка');
            isValid = false;
        }
        
        return isValid;
    }

    // Phone validation
    function isValidPhone(phone) {
        const phoneRegex = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
        return phoneRegex.test(phone);
    }

    // Show error
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        
        // Remove existing error
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        // Add error class to input
        input.classList.add('error');
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        formGroup.appendChild(errorDiv);
        
        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Reset errors
    function resetErrors() {
        // Remove error classes
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
        
        // Remove error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });
    }

    // Setup date input
    function setupDateInput() {
        if (!dateInput) return;
        
        // Set minimum date to tomorrow
        setMinDate();
        
        // Set maximum date to 3 months from now
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Disable weekends if needed
        dateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const day = selectedDate.getDay();
            
            if (day === 0 || day === 6) { // Sunday or Saturday
                alert('В выходные дни доступны только экстренные услуги. Пожалуйста, выберите будний день или позвоните нам для уточнения.');
            }
        });
    }

    // Set minimum date
    function setMinDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        
        if (dateInput) {
            dateInput.min = minDate;
            dateInput.value = minDate; // Set default to tomorrow
        }
    }

    // Setup phone mask
    function setupPhoneMask() {
        phoneInputs.forEach(input => {
            input.addEventListener('input', function(e) {
                let value = this.value.replace(/\D/g, '');
                
                if (value.length === 0) return;
                
                if (value[0] === '7' || value[0] === '8') {
                    value = value.substring(1);
                }
                
                let formattedValue = '+7 ';
                
                if (value.length > 0) {
                    formattedValue += '(' + value.substring(0, 3);
                }
                if (value.length >= 4) {
                    formattedValue += ') ' + value.substring(3, 6);
                }
                if (value.length >= 7) {
                    formattedValue += '-' + value.substring(6, 8);
                }
                if (value.length >= 9) {
                    formattedValue += '-' + value.substring(8, 10);
                }
                
                this.value = formattedValue;
            });
            
            // Remove error on input
            input.addEventListener('input', function() {
                this.classList.remove('error');
                const errorMsg = this.closest('.form-group')?.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
        });
    }

    // Setup file upload
    function setupFileUpload() {
        if (!fileCheckbox || !fileUpload) return;
        
        fileCheckbox.addEventListener('change', function() {
            if (this.checked) {
                fileUpload.style.display = 'block';
                fileUpload.required = true;
            } else {
                fileUpload.style.display = 'none';
                fileUpload.required = false;
                fileUpload.value = '';
            }
        });
        
        // File size validation
        fileUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
            
            if (file.size > maxSize) {
                alert('Файл слишком большой. Максимальный размер: 5MB');
                this.value = '';
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                alert('Допустимы только изображения (JPG, PNG, GIF) и видео (MP4)');
                this.value = '';
                return;
            }
        });
    }

    // Setup FAQ accordion
    function setupFAQ() {
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const item = this.closest('.faq-item');
                const isActive = item.classList.contains('active');
                
                // Close all items
                document.querySelectorAll('.faq-item').forEach(el => {
                    el.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    // Load statistics
    function loadStats() {
        // Load today's bookings
        const today = new Date().toDateString();
        let bookings = JSON.parse(localStorage.getItem('todayBookings') || '[]');
        
        // Remove old bookings
        bookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.timestamp).toDateString();
            return bookingDate === today;
        });
        
        // Update counter
        todayBookingsEl.textContent = bookings.length;
        
        // Save cleaned array
        localStorage.setItem('todayBookings', JSON.stringify(bookings));
        
        // Update online users (random between 15-35)
        const onlineUsers = Math.floor(Math.random() * 20) + 15;
        onlineNowEl.textContent = onlineUsers;
        
        // Update every minute
        setInterval(() => {
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            let current = parseInt(onlineNowEl.textContent);
            current = Math.max(10, Math.min(50, current + change));
            onlineNowEl.textContent = current;
        }, 60000);
    }

    // Update today's bookings
    function updateTodayBookings() {
        const today = new Date().toDateString();
        let bookings = JSON.parse(localStorage.getItem('todayBookings') || '[]');
        
        // Add new booking
        bookings.push({
            timestamp: new Date().toISOString(),
            type: document.querySelector('.tab-btn.active').dataset.tab
        });
        
        // Save
        localStorage.setItem('todayBookings', JSON.stringify(bookings));
        
        // Update display
        todayBookingsEl.textContent = bookings.length;
    }

    // Save form data to localStorage
    function saveFormData() {
        const activeTab = document.querySelector('.tab-btn.active');
        const tabType = activeTab.dataset.tab;
        
        let formData = {};
        
        if (tabType === 'booking') {
            formData = {
                type: 'booking',
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                carBrand: document.getElementById('car-brand').value,
                carModel: document.getElementById('car-model').value,
                serviceType: document.getElementById('service-type').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                problem: document.getElementById('problem').value,
                timestamp: new Date().toISOString()
            };
        } else if (tabType === 'consultation') {
            formData = {
                type: 'consultation',
                name: document.getElementById('consult-name').value,
                phone: document.getElementById('consult-phone').value,
                email: document.getElementById('consult-email').value,
                topic: document.getElementById('consult-topic').value,
                message: document.getElementById('consult-message').value,
                hasFile: document.getElementById('consult-file').checked,
                timestamp: new Date().toISOString()
            };
        } else if (tabType === 'callback') {
            formData = {
                type: 'callback',
                name: document.getElementById('callback-name').value,
                phone: document.getElementById('callback-phone').value,
                time: document.getElementById('callback-time').value,
                topic: document.getElementById('callback-topic').value,
                urgent: document.getElementById('callback-urgent').checked,
                timestamp: new Date().toISOString()
            };
        }
        
        // Save to localStorage
        const savedForms = JSON.parse(localStorage.getItem('contactForms') || '[]');
        savedForms.push(formData);
        
        // Keep only last 50 forms
        if (savedForms.length > 50) {
            savedForms.splice(0, savedForms.length - 50);
        }
        
        localStorage.setItem('contactForms', JSON.stringify(savedForms));
        
        // Generate request number
        const requestNumber = 'APF-' + new Date().getFullYear() + '-' + 
                            String(savedForms.length).padStart(3, '0');
        document.getElementById('request-number').textContent = requestNumber;
        
        // Save request number with form data
        formData.requestNumber = requestNumber;
        localStorage.setItem('lastRequest', JSON.stringify(formData));
    }

    // Load saved form data
    function loadSavedFormData() {
        const savedData = localStorage.getItem('lastRequest');
        if (!savedData) return;
        
        try {
            const data = JSON.parse(savedData);
            
            // Pre-fill form based on type
            switch(data.type) {
                case 'booking':
                    document.querySelector('.tab-btn[data-tab="booking"]').click();
                    if (document.getElementById('name')) document.getElementById('name').value = data.name || '';
                    if (document.getElementById('phone')) document.getElementById('phone').value = data.phone || '';
                    break;
                    
                case 'consultation':
                    document.querySelector('.tab-btn[data-tab="consultation"]').click();
                    break;
                    
                case 'callback':
                    document.querySelector('.tab-btn[data-tab="callback"]').click();
                    break;
            }
        } catch (e) {
            console.error('Error loading saved form data:', e);
        }
    }

    // Show success modal
    function showSuccessModal(type) {
        if (!successModal) return;
        
        // Update modal content based on form type
        let message = '';
        
        switch(type) {
            case 'booking':
                message = 'Мы свяжемся с вами в течение 15 минут для подтверждения записи.';
                break;
            case 'consultation':
                message = 'Наш специалист ответит вам в течение 30 минут.';
                break;
            case 'callback':
                message = 'Мы перезвоним вам в выбранное время.';
                break;
        }
        
        const modalBody = successModal.querySelector('.modal-body p');
        if (modalBody) {
            modalBody.textContent = message;
        }
        
        // Show modal
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Auto close after 10 seconds
        setTimeout(() => {
            if (successModal.classList.contains('active')) {
                closeModal();
            }
        }, 10000);
    }

    // Close modal
    function closeModal() {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Setup event listeners
    function setupEventListeners() {
        // Tab switching
        formTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Update active tab
                formTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId + '-tab') {
                        content.classList.add('active');
                    }
                });
                
                // Reset errors when switching tabs
                resetErrors();
            });
        });

        // Modal close buttons
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        // Close modal on outside click
        successModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Close modal on ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && successModal.classList.contains('active')) {
                closeModal();
            }
        });

        // Emergency button animation
        const emergencyBtn = document.querySelector('.btn-emergency');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('mouseenter', function() {
                this.style.animation = 'pulse 1s infinite';
            });
            
            emergencyBtn.addEventListener('mouseleave', function() {
                this.style.animation = 'pulse 2s infinite';
            });
        }

        // Social media cards hover effect
        const socialCards = document.querySelectorAll('.social-card');
        socialCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.social-icon');
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            });
            
            card.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.social-icon');
                icon.style.transform = 'scale(1) rotate(0deg)';
            });
        });

        // Form auto-save
        contactForm?.addEventListener('input', function() {
            debounce(saveFormDraft, 1000)();
        });

        // Load form draft on page load
        window.addEventListener('load', loadFormDraft);
    }

    // Save form draft
    function saveFormDraft() {
        const activeTab = document.querySelector('.tab-btn.active');
        const tabType = activeTab.dataset.tab;
        
        let draftData = {};
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name && input.type !== 'file') {
                draftData[input.name] = input.value;
            }
        });
        
        draftData.activeTab = tabType;
        draftData.timestamp = new Date().toISOString();
        
        localStorage.setItem('contactFormDraft', JSON.stringify(draftData));
    }

    // Load form draft
    function loadFormDraft() {
        const draftData = localStorage.getItem('contactFormDraft');
        if (!draftData) return;
        
        try {
            const data = JSON.parse(draftData);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const draftTime = new Date(data.timestamp);
            
            // Only load if draft is less than 1 hour old
            if (draftTime > oneHourAgo) {
                // Switch to saved tab
                const savedTab = document.querySelector(`.tab-btn[data-tab="${data.activeTab}"]`);
                if (savedTab) {
                    savedTab.click();
                }
                
                // Fill form fields
                const inputs = contactForm.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.name && data[input.name] !== undefined) {
                        input.value = data[input.name];
                    }
                });
                
                // Show notification
                setTimeout(() => {
                    showNotification('Загружен черновик формы. Заполните недостающие поля и отправьте заявку.', 'info');
                }, 1000);
            } else {
                // Clear old draft
                localStorage.removeItem('contactFormDraft');
            }
        } catch (e) {
            console.error('Error loading form draft:', e);
        }
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Remove old notification
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) oldNotification.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'info' ? 'info-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Add styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--card-bg);
                    color: var(--text-color);
                    padding: 16px 20px;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    z-index: 5000;
                    transform: translateX(150%);
                    transition: transform 0.3s ease;
                    border-left: 4px solid var(--primary-color);
                    max-width: 400px;
                }
                
                .notification.notification-info {
                    border-left-color: var(--accent-color);
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .notification-content i {
                    font-size: 1.2rem;
                }
                
                .notification.notification-info .notification-content i {
                    color: var(--accent-color);
                }
                
                .notification.notification-success .notification-content i {
                    color: var(--success-color);
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-light);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
                
                .notification-close:hover {
                    color: var(--text-color);
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Show
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto hide
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

    // Initialize the page
    initContactPage();
});