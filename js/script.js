// Основной JavaScript файл для автосервиса

// ========== ТЕМНАЯ ТЕМА ==========
const themeSwitcher = document.getElementById('theme-switcher');
const themeIcon = themeSwitcher.querySelector('i');

// Проверяем сохраненную тему
const savedTheme = localStorage.getItem('autoTheme') || 'light';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme === 'system' ? (prefersDark ? 'dark' : 'light') : savedTheme;

// Устанавливаем начальную тему
document.documentElement.classList.toggle('dark-theme', initialTheme === 'dark');
updateThemeIcon(initialTheme);

// Обработчик переключения темы
themeSwitcher.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('autoTheme', theme);
    updateThemeIcon(theme);
    
    // Показываем уведомление
    showNotification(`Тема изменена на ${isDark ? 'темную' : 'светлую'}`);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ========== МОБИЛЬНОЕ МЕНЮ ==========
const menuToggle = document.querySelector('.menu-toggle');
const navList = document.querySelector('.nav-list');

if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        const isExpanded = navList.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
        menuToggle.innerHTML = isExpanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!navList.contains(e.target) && !menuToggle.contains(e.target) && navList.classList.contains('active')) {
            navList.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

// ========== СТАТИСТИКА И СЧЕТЧИКИ ==========
function initializeStats() {
    // Инициализируем статистику из localStorage
    const stats = {
        completedRepairs: localStorage.getItem('completedRepairs') || 2547,
        satisfiedClients: localStorage.getItem('satisfiedClients') || 98,
        dailyCars: localStorage.getItem('dailyCars') || 12,
        onlineToday: localStorage.getItem('onlineToday') || 47,
        totalReviews: localStorage.getItem('totalReviews') || 127,
        visitCount: localStorage.getItem('visitCount') || 0
    };

    // Увеличиваем счетчик посещений
    stats.visitCount = parseInt(stats.visitCount) + 1;
    localStorage.setItem('visitCount', stats.visitCount);

    // Обновляем отображение
    updateCounter('completed-repairs', stats.completedRepairs);
    updateCounter('satisfied-clients', stats.satisfiedClients, '%');
    updateCounter('daily-cars', stats.dailyCars);
    updateCounter('online-today', stats.onlineToday);
    
    // Обновляем счетчик отзывов
    const reviewCount = document.querySelector('#review-count strong');
    if (reviewCount) {
        reviewCount.textContent = stats.totalReviews;
    }

    // Симулируем случайное изменение статистики
    simulateStatsChanges();
}

// Анимация счетчиков
function updateCounter(elementId, targetValue, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    let current = parseInt(element.textContent.replace(/[^0-9]/g, ''));
    const target = parseInt(targetValue);
    const increment = target > current ? 1 : -1;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current + suffix;
        
        if (current === target) {
            clearInterval(timer);
        }
    }, 20);
}

// Симуляция изменения статистики
function simulateStatsChanges() {
    setInterval(() => {
        // Увеличиваем счетчик ремонтов
        const repairs = parseInt(localStorage.getItem('completedRepairs') || 2547);
        const newRepairs = repairs + Math.floor(Math.random() * 3);
        localStorage.setItem('completedRepairs', newRepairs);
        updateCounter('completed-repairs', newRepairs);

        // Обновляем онлайн пользователей
        const online = Math.floor(Math.random() * 20) + 40;
        localStorage.setItem('onlineToday', online);
        updateCounter('online-today', online);
    }, 30000); // Каждые 30 секунд
}

// ========== ФОРМА ОТЗЫВОВ ==========
const reviewModal = document.getElementById('review-modal');
const addReviewBtn = document.getElementById('add-review-btn');
const modalClose = reviewModal?.querySelector('.modal-close');
const reviewForm = document.getElementById('review-form');
const ratingInputs = document.querySelectorAll('.rating-input i');

// Открытие модального окна
if (addReviewBtn) {
    addReviewBtn.addEventListener('click', () => {
        reviewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// Закрытие модального окна
if (modalClose) {
    modalClose.addEventListener('click', () => {
        reviewModal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Закрытие по клику вне окна
reviewModal?.addEventListener('click', (e) => {
    if (e.target === reviewModal) {
        reviewModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Рейтинг звездочками
ratingInputs?.forEach(star => {
    star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        document.getElementById('review-rating').value = rating;
        
        ratingInputs.forEach((s, index) => {
            if (index < rating) {
                s.className = 'fas fa-star active';
            } else {
                s.className = 'far fa-star';
            }
        });
    });
    
    star.addEventListener('mouseover', () => {
        const rating = parseInt(star.dataset.rating);
        ratingInputs.forEach((s, index) => {
            if (index < rating) {
                s.className = 'fas fa-star';
            } else {
                s.className = 'far fa-star';
            }
        });
    });
});

// Отправка формы отзыва
if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('review-name').value,
            car: document.getElementById('review-car').value,
            rating: document.getElementById('review-rating').value,
            text: document.getElementById('review-text').value,
            date: new Date().toISOString()
        };
        
        // Сохраняем в localStorage
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        reviews.push(formData);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        // Обновляем счетчик отзывов
        const totalReviews = reviews.length;
        localStorage.setItem('totalReviews', totalReviews);
        
        const reviewCount = document.querySelector('#review-count strong');
        if (reviewCount) {
            reviewCount.textContent = totalReviews;
            updateCounter('review-count', totalReviews);
        }
        
        // Показываем уведомление
        showNotification('Спасибо за ваш отзыв! Он будет опубликован после модерации.');
        
        // Закрываем модальное окно и сбрасываем форму
        reviewModal.classList.remove('active');
        document.body.style.overflow = '';
        reviewForm.reset();
        
        // Сбрасываем звездочки
        ratingInputs?.forEach((s, index) => {
            s.className = index < 5 ? 'fas fa-star active' : 'far fa-star';
        });
        document.getElementById('review-rating').value = 5;
    });
}

// ========== ЗАПИСЬ НА СЕРВИС ==========
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: bookingForm.querySelector('[name="name"]').value,
            phone: bookingForm.querySelector('[name="phone"]').value,
            car: bookingForm.querySelector('[name="car"]').value,
            service: bookingForm.querySelector('[name="service"]').value,
            date: bookingForm.querySelector('[name="date"]').value,
            time: bookingForm.querySelector('[name="time"]').value,
            timestamp: new Date().toISOString()
        };
        
        // Сохраняем запись
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(formData);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Показываем подтверждение
        showNotification(`Запись успешно создана на ${formData.date} в ${formData.time}! Мы позвоним вам для подтверждения.`);
        
        // Сбрасываем форму
        bookingForm.reset();
    });
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message, type = 'success') {
    // Удаляем старое уведомление если есть
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Создаем новое уведомление
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
    
    // Показываем с анимацией
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Авто-скрытие через 5 секунд
    const hideTimeout = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Кнопка закрытия
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(hideTimeout);
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация статистики
    initializeStats();
    
    // Устанавливаем активную ссылку в навигации
    setActiveNavLink();
    
    // Устанавливаем минимальную дату для формы записи (завтра)
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Максимум на 3 месяца вперед
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        dateInput.max = maxDate.toISOString().split('T')[0];
    }
    
    // Приветственное сообщение для новых посетителей
    if (!localStorage.getItem('welcomeShown')) {
        setTimeout(() => {
            showNotification('Добро пожаловать в AutoProFix! Запишитесь на обслуживание онлайн и получите скидку 10% на первую услугу!');
            localStorage.setItem('welcomeShown', 'true');
        }, 2000);
    }
});

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-list a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Стили для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
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
        z-index: 3000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        border-left: 4px solid var(--success-color);
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-error {
        border-left-color: var(--primary-color);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-content i {
        font-size: 1.2rem;
        color: var(--success-color);
    }
    
    .notification-error .notification-content i {
        color: var(--primary-color);
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
document.head.appendChild(notificationStyles);