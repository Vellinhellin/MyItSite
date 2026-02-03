// Gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    // Gallery data
    const galleryData = [
        {
            id: 1,
            title: "Капитальный ремонт двигателя",
            category: "engine",
            date: "15.05.2024",
            likes: 42,
            description: "Полный разбор и восстановление двигателя Toyota Camry",
            popular: true
        },
        {
            id: 2,
            title: "Замена амортизаторов",
            category: "suspension",
            date: "12.05.2024",
            likes: 28,
            description: "Замена амортизаторов на Volkswagen Passat",
            popular: true
        },
        {
            id: 3,
            title: "Покраска бампера",
            category: "body",
            date: "10.05.2024",
            likes: 35,
            description: "Восстановление и покраска переднего бампера",
            popular: false
        },
        {
            id: 4,
            title: "Компьютерная диагностика",
            category: "diagnostics",
            date: "08.05.2024",
            likes: 19,
            description: "Диагностика электронных систем Mercedes",
            popular: true
        },
        {
            id: 5,
            title: "Сезонная замена шин",
            category: "tires",
            date: "05.05.2024",
            likes: 31,
            description: "Замена зимней резины на летнюю с балансировкой",
            popular: false
        },
        {
            id: 6,
            title: "Ремонт тормозной системы",
            category: "repair",
            date: "03.05.2024",
            likes: 24,
            description: "Замена тормозных колодок и дисков",
            popular: true
        },
        {
            id: 7,
            title: "Ремонт кузова после ДТП",
            category: "body",
            date: "28.04.2024",
            likes: 47,
            description: "Восстановление геометрии кузова",
            popular: true
        },
        {
            id: 8,
            title: "Диагностика подвески",
            category: "diagnostics",
            date: "25.04.2024",
            likes: 22,
            description: "Комплексная проверка ходовой части",
            popular: false
        },
        {
            id: 9,
            title: "Ремонт электрики",
            category: "repair",
            date: "22.04.2024",
            likes: 18,
            description: "Устранение неисправностей электрооборудования",
            popular: false
        }
    ];

    // DOM Elements
    const galleryGrid = document.getElementById('gallery-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-gallery');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    const lightboxDate = document.getElementById('lightbox-date');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxLikes = document.getElementById('lightbox-likes');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadBtn = document.getElementById('upload-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Variables
    let currentFilter = 'all';
    let currentSort = 'newest';
    let currentPage = 1;
    const itemsPerPage = 6;
    let currentLightboxIndex = 0;
    let filteredGallery = [...galleryData];
    let uploadedFiles = [];

    // Initialize gallery
    function initGallery() {
        renderGallery();
        updateStats();
        setupEventListeners();
        
        // Load gallery from localStorage if exists
        const savedGallery = localStorage.getItem('galleryData');
        if (savedGallery) {
            try {
                const parsed = JSON.parse(savedGallery);
                if (Array.isArray(parsed)) {
                    galleryData.push(...parsed);
                    renderGallery();
                }
            } catch (e) {
                console.error('Error loading gallery from localStorage:', e);
            }
        }
    }

    // Render gallery items
    function renderGallery() {
        galleryGrid.innerHTML = '';
        
        // Filter and sort
        filterAndSortGallery();
        
        // Get items for current page
        const startIndex = 0; // For simplicity, show all
        const endIndex = currentPage * itemsPerPage;
        const itemsToShow = filteredGallery.slice(0, endIndex);
        
        if (itemsToShow.length === 0) {
            galleryGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-images"></i>
                    <h3>Нет фотографий</h3>
                    <p>В этой категории пока нет фотографий</p>
                </div>
            `;
            return;
        }
        
        // Create gallery items
        itemsToShow.forEach((item, index) => {
            const galleryItem = createGalleryItem(item, index);
            galleryGrid.appendChild(galleryItem);
        });
        
        // Update load more button
        if (endIndex >= filteredGallery.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
        
        // Hide loading
        document.querySelector('.gallery-loading').style.display = 'none';
    }

    // Create gallery item HTML
    function createGalleryItem(item, index) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';
        itemDiv.dataset.index = index;
        itemDiv.dataset.category = item.category;
        
        // Generate placeholder image based on category
        const colors = {
            engine: '1d3557',
            suspension: '457b9d',
            body: 'e63946',
            diagnostics: '2a9d8f',
            tires: 'f4a261',
            repair: 'e76f51',
            'before-after': '9d4edd'
        };
        
        const color = colors[item.category] || '6c757d';
        
        itemDiv.innerHTML = `
            <img src="https://via.placeholder.com/300x250/${color}/ffffff?text=${encodeURIComponent(item.title)}" 
                 alt="${item.title}">
            <div class="gallery-overlay">
                <span class="gallery-category">${getCategoryName(item.category)}</span>
                <h3 class="gallery-title">${item.title}</h3>
                <div class="gallery-date">
                    <i class="far fa-calendar"></i> ${item.date}
                </div>
            </div>
            <div class="gallery-actions">
                <a href="#" class="gallery-like" title="Нравится">
                    <i class="far fa-heart"></i>
                </a>
                <a href="#" class="gallery-download" title="Скачать" download>
                    <i class="fas fa-download"></i>
                </a>
            </div>
        `;
        
        // Add click event
        itemDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.gallery-actions')) {
                openLightbox(index);
            }
        });
        
        // Add like event
        const likeBtn = itemDiv.querySelector('.gallery-like');
        likeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLike(item.id);
        });
        
        return itemDiv;
    }

    // Get category name in Russian
    function getCategoryName(category) {
        const categories = {
            all: 'Все',
            engine: 'Двигатель',
            suspension: 'Подвеска',
            body: 'Кузов',
            diagnostics: 'Диагностика',
            tires: 'Шины',
            repair: 'Ремонт',
            'before-after': 'До/После'
        };
        return categories[category] || category;
    }

    // Filter and sort gallery
    function filterAndSortGallery() {
        // Filter
        if (currentFilter === 'all') {
            filteredGallery = [...galleryData];
        } else {
            filteredGallery = galleryData.filter(item => item.category === currentFilter);
        }
        
        // Sort
        switch (currentSort) {
            case 'newest':
                filteredGallery.sort((a, b) => new Date(b.date.split('.').reverse().join('-')) - new Date(a.date.split('.').reverse().join('-')));
                break;
            case 'oldest':
                filteredGallery.sort((a, b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));
                break;
            case 'popular':
                filteredGallery.sort((a, b) => b.likes - a.likes);
                break;
        }
    }

    // Update statistics
    function updateStats() {
        document.getElementById('total-photos').textContent = galleryData.length;
        document.getElementById('cars-repaired').textContent = Math.floor(galleryData.length * 0.8);
        document.getElementById('projects-completed').textContent = galleryData.length;
        
        // Calculate total likes
        const totalLikes = galleryData.reduce((sum, item) => sum + item.likes, 0);
        document.getElementById('gallery-likes').textContent = formatNumber(totalLikes);
    }

    // Format number with K
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Handle like
    function handleLike(itemId) {
        const item = galleryData.find(item => item.id === itemId);
        if (item) {
            item.likes++;
            updateStats();
            renderGallery();
            
            // Save to localStorage
            localStorage.setItem('galleryLikes', JSON.stringify(galleryData));
            
            // Show notification
            showNotification('Спасибо за лайк!', 'success');
        }
    }

    // Open lightbox
    function openLightbox(index) {
        currentLightboxIndex = index;
        const item = filteredGallery[currentLightboxIndex];
        
        // Update lightbox content
        lightboxImage.src = `https://via.placeholder.com/800x600/1d3557/ffffff?text=${encodeURIComponent(item.title)}`;
        lightboxImage.alt = item.title;
        lightboxTitle.textContent = item.title;
        lightboxDescription.textContent = item.description;
        lightboxDate.textContent = `Дата: ${item.date}`;
        lightboxCategory.textContent = `Категория: ${getCategoryName(item.category)}`;
        lightboxLikes.textContent = `❤️ ${item.likes}`;
        
        // Show lightbox
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close lightbox
    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Navigate lightbox
    function navigateLightbox(direction) {
        currentLightboxIndex += direction;
        
        if (currentLightboxIndex < 0) {
            currentLightboxIndex = filteredGallery.length - 1;
        } else if (currentLightboxIndex >= filteredGallery.length) {
            currentLightboxIndex = 0;
        }
        
        openLightbox(currentLightboxIndex);
    }

    // File upload handling
    function setupFileUpload() {
        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop area
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropArea.classList.add('dragover');
        }

        function unhighlight() {
            dropArea.classList.remove('dragover');
        }

        // Handle dropped files
        dropArea.addEventListener('drop', handleDrop, false);
        fileInput.addEventListener('change', handleFiles, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles({ target: { files } });
        }

        function handleFiles(e) {
            const files = [...e.target.files];
            uploadedFiles = [...uploadedFiles, ...files];
            updatePreview();
            updateUploadButton();
        }

        // Clear button
        clearBtn.addEventListener('click', () => {
            uploadedFiles = [];
            updatePreview();
            updateUploadButton();
        });

        // Upload button
        uploadBtn.addEventListener('click', handleUpload);
    }

    // Update preview
    function updatePreview() {
        uploadPreview.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <div class="preview-remove" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </div>
                `;
                uploadPreview.appendChild(previewItem);
                
                // Remove button
                previewItem.querySelector('.preview-remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    uploadedFiles.splice(index, 1);
                    updatePreview();
                    updateUploadButton();
                });
            };
            reader.readAsDataURL(file);
        });
    }

    // Update upload button state
    function updateUploadButton() {
        uploadBtn.disabled = uploadedFiles.length === 0;
    }

    // Handle upload
    function handleUpload() {
        if (uploadedFiles.length === 0) return;
        
        // Simulate upload
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
        uploadBtn.disabled = true;
        
        setTimeout(() => {
            // Add to gallery
            uploadedFiles.forEach((file, index) => {
                const newItem = {
                    id: galleryData.length + index + 1,
                    title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                    category: 'uploaded',
                    date: new Date().toLocaleDateString('ru-RU'),
                    likes: 0,
                    description: 'Загруженное фото',
                    popular: false
                };
                galleryData.unshift(newItem);
            });
            
            // Save to localStorage
            localStorage.setItem('galleryData', JSON.stringify(galleryData));
            
            // Reset
            uploadedFiles = [];
            updatePreview();
            updateUploadButton();
            
            // Update gallery
            renderGallery();
            updateStats();
            
            // Show success message
            showNotification('Фотографии успешно загружены!', 'success');
            
            // Reset button
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Загрузить фото';
        }, 2000);
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

    // Setup event listeners
    function setupEventListeners() {
        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                currentPage = 1;
                renderGallery();
            });
        });

        // Sort select
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            renderGallery();
        });

        // Load more button
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderGallery();
        });

        // Lightbox navigation
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
        lightboxNext.addEventListener('click', () => navigateLightbox(1));
        
        // Close lightbox on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (lightboxModal.classList.contains('active')) {
                if (e.key === 'ArrowLeft') navigateLightbox(-1);
                if (e.key === 'ArrowRight') navigateLightbox(1);
            }
        });

        // File upload
        setupFileUpload();
    }

    // Initialize
    initGallery();
});