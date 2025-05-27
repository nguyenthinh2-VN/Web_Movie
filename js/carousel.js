// Biến lưu trạng thái carousel
let carouselState = {
    currentIndex: 0,
    totalItems: 0,
    itemsPerView: 6, // Số phim hiển thị cùng lúc (mặc định cho desktop)
    movies: []
};

// Hàm fetch data từ API
async function fetchCarouselMovies() {
    try {
        const response = await fetch("https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1");
        const data = await response.json();

        if (data.status === true) {
            carouselState.movies = data.items;
            carouselState.totalItems = data.items.length;
            displayCarouselMovies();
            setupCarouselControls();
        } else {
            console.error("Lỗi khi lấy dữ liệu phim:", data.msg);
        }
    } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
    }
}

// Tạo ảnh mờ từ URL ảnh gốc
function createBlurredPlaceholder(imageUrl) {
    // Placeholder mặc định nếu không thể tạo ảnh mờ
    const defaultPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgNDUwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzM0MzQzNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2FhYWFhYSI+TG9hZGluZyBJbWFnZS4uLjwvdGV4dD48L3N2Zz4=';
    
    // Nếu không có URL hình ảnh, trả về placeholder mặc định
    if (!imageUrl) return defaultPlaceholder;
    
    // Kiểm tra xem URL có phải là URL hợp lệ không
    try {
        new URL(imageUrl);
    } catch (e) {
        return defaultPlaceholder;
    }
    
    return defaultPlaceholder;
}

// Hiển thị phim trong carousel với tối ưu tải ảnh tiệm tiến
function displayCarouselMovies() {
    const carouselTrack = document.getElementById('carouselMovies');
    if (!carouselTrack) return;

    carouselTrack.innerHTML = '';
    
    // Cập nhật số lượng phim hiển thị dựa trên kích thước màn hình
    updateItemsPerView();

    carouselState.movies.forEach((movie, index) => {
        const movieCard = document.createElement('div');
        movieCard.className = 'carousel-movie-card';
        movieCard.style.width = `calc(100% / ${carouselState.itemsPerView})`;
        
        // Tạo placeholder cho ảnh
        const placeholderSrc = createBlurredPlaceholder(movie.poster_url);
        
        movieCard.innerHTML = `
            <div class="card" data-slug="${movie.slug}">
                <div class="card-img-container">
                    <div class="progressive-image">
                        <!-- Ảnh placeholder mờ kích thước nhỏ -->
                        <img 
                            src="${placeholderSrc}" 
                            class="img-blur-placeholder"
                            alt="${movie.name}"
                        >
                        
                        <!-- Ảnh chính tải với độ ưu tiên thấp -->
                        <img 
                            src="${movie.poster_url}" 
                            class="img-main"
                            alt="${movie.name}"
                            loading="lazy"
                            onload="this.classList.add('img-loaded')" 
                            onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'; this.classList.add('img-loaded')"
                        >
                    </div>
                    <div class="card-overlay">
                        <h5 class="card-title">${movie.name}</h5>
                        <p class="card-text">${movie.origin_name || ''}</p>
                        <p class="card-text">
                            <small>${movie.year}</small>
                            ${movie.episode_current ? `<small class="ms-2">Tập: ${movie.episode_current}</small>` : ''}
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Thêm sự kiện click để chuyển đến trang chi tiết
        movieCard.addEventListener('click', () => {
            window.location.href = `./movieDetails.html?slug=${movie.slug}`;
        });

        carouselTrack.appendChild(movieCard);
    });

    // Di chuyển đến vị trí đầu tiên
    updateCarouselPosition();
}

// Cập nhật số lượng phim hiển thị dựa trên kích thước màn hình
// Update the itemsPerView settings
function updateItemsPerView() {
    const width = window.innerWidth;
    
    if (width >= 1200) {
        carouselState.itemsPerView = 5; // Large Desktop
    } else if (width >= 992) {
        carouselState.itemsPerView = 4; // Desktop
    } else if (width >= 768) {
        carouselState.itemsPerView = 3; // Tablet
    } else if (width >= 576) {
        carouselState.itemsPerView = 2; // Phablet
    } else {
        carouselState.itemsPerView = 2; // Mobile
    }
}

// Update the carousel display function
function displayCarouselMovies() {
    const carouselTrack = document.getElementById('carouselMovies');
    if (!carouselTrack) return;

    carouselTrack.innerHTML = '';
    updateItemsPerView();

    carouselState.movies.forEach((movie, index) => {
        const movieCard = document.createElement('div');
        movieCard.className = 'carousel-movie-card';
        movieCard.style.width = `calc(100% / ${carouselState.itemsPerView})`;
        
        // Tạo placeholder cho ảnh
        const placeholderSrc = createBlurredPlaceholder(movie.poster_url);
        
        movieCard.innerHTML = `
            <div class="card" data-slug="${movie.slug}">
                <div class="card-img-container">
                    <div class="progressive-image">
                        <!-- Ảnh placeholder mờ kích thước nhỏ -->
                        <img 
                            src="${placeholderSrc}" 
                            class="img-blur-placeholder"
                            alt="${movie.name}"
                        >
                        
                        <!-- Ảnh chính tải với độ ưu tiên thấp -->
                        <img 
                            src="${movie.poster_url}" 
                            class="img-main"
                            alt="${movie.name}"
                            loading="lazy"
                            onload="this.classList.add('img-loaded')" 
                            onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'; this.classList.add('img-loaded')"
                        >
                    </div>
                    <div class="card-overlay">
                        <h5 class="card-title">${movie.name}</h5>
                        <p class="card-text">${movie.origin_name || ''}</p>
                        <p class="card-text">
                            <small>${movie.year}</small>
                            ${movie.episode_current ? `<small class="ms-2">Tập: ${movie.episode_current}</small>` : ''}
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Thêm sự kiện click để chuyển đến trang chi tiết
        movieCard.addEventListener('click', () => {
            window.location.href = `./movieDetails.html?slug=${movie.slug}`;
        });

        carouselTrack.appendChild(movieCard);
    });
}

// Thiết lập các nút điều khiển carousel
function setupCarouselControls() {
    const prevButton = document.querySelector('.movie-carousel-prev');
    const nextButton = document.querySelector('.movie-carousel-next');
    const indicators = document.querySelectorAll('.carousel-indicators-custom .indicator');
    
    if (!prevButton || !nextButton) return;

    // Xử lý sự kiện nút điều hướng
    prevButton.addEventListener('click', () => {
        navigateCarousel(-1);
    });
    
    nextButton.addEventListener('click', () => {
        navigateCarousel(1);
    });

    // Xử lý sự kiện click indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            const slideIndex = parseInt(indicator.getAttribute('data-index'));
            carouselState.currentIndex = slideIndex * carouselState.itemsPerView;
            if (carouselState.currentIndex >= carouselState.totalItems) {
                carouselState.currentIndex = carouselState.totalItems - carouselState.itemsPerView;
            }
            updateCarouselPosition();
            updateIndicators();
        });
    });

    // Tự động chuyển slide sau mỗi 5 giây
    setInterval(() => {
        navigateCarousel(1);
    }, 4000);
}

// Di chuyển carousel
function navigateCarousel(direction) {
    // Tính toán index mới
    carouselState.currentIndex += direction * carouselState.itemsPerView;
    
    // Xử lý trường hợp đặc biệt: quay lại từ đầu nếu đã đến cuối
    if (carouselState.currentIndex >= carouselState.totalItems) {
        carouselState.currentIndex = 0;
    }
    
    // Xử lý trường hợp đặc biệt: nhảy đến cuối nếu đang ở đầu và di chuyển ngược
    if (carouselState.currentIndex < 0) {
        carouselState.currentIndex = Math.floor((carouselState.totalItems - 1) / carouselState.itemsPerView) * carouselState.itemsPerView;
    }
    
    updateCarouselPosition();
    updateIndicators();
}

// Cập nhật vị trí hiển thị của carousel
function updateCarouselPosition() {
    const track = document.getElementById('carouselMovies');
    if (!track) return;
    
    const percentage = -(carouselState.currentIndex / carouselState.totalItems) * 100;
    track.style.transform = `translateX(${percentage}%)`;
}

// Cập nhật trạng thái active của indicators
function updateIndicators() {
    const indicators = document.querySelectorAll('.carousel-indicators-custom .indicator');
    const currentGroup = Math.floor(carouselState.currentIndex / carouselState.itemsPerView);
    
    indicators.forEach((indicator, index) => {
        if (index === currentGroup) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Xử lý sự kiện resize cửa sổ
window.addEventListener('resize', () => {
    const oldItemsPerView = carouselState.itemsPerView;
    updateItemsPerView();
    
    // Chỉ cập nhật lại nếu số lượng hiển thị thay đổi
    if (oldItemsPerView !== carouselState.itemsPerView) {
        // Tính toán lại vị trí hiện tại
        const currentGroup = Math.floor(carouselState.currentIndex / oldItemsPerView);
        carouselState.currentIndex = currentGroup * carouselState.itemsPerView;
        
        updateCarouselPosition();
    }
});

// Khởi tạo carousel khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    fetchCarouselMovies();
});


// Fetch movie data from local JSON file instead of API
async function fetchMovieData() {
    try {
        const response = await fetch('../data/sample-movies.json');
        const data = await response.json();
        
        // Check if data has the expected structure
        if (data && data.status === true && Array.isArray(data.items)) {
            return data.items; // Return all items from sample data
        } else {
            console.error('Invalid JSON data format:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching sample data:', error);
        return [];
    }
}

// Initialize the 3D carousel
async function initialize3DCarousel() {
    const movies = await fetchMovieData();
    const carouselContainer = document.querySelector('.carousel-container');
    
    if (!carouselContainer || !movies.length) {
        console.error('Carousel container not found or no movies available');
        return;
    }
    
    // Clear existing content
    carouselContainer.innerHTML = '';
    
    // Create radio buttons
    movies.forEach((_, index) => {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'position';
        radio.className = 'carousel-radio';
        if (index === 0) radio.checked = true;
        carouselContainer.appendChild(radio);
    });
    
    // Create carousel
    const carousel = document.createElement('main');
    carousel.id = 'carousel';
    
    // Create carousel items
    movies.forEach((movie, index) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.style.setProperty('--offset', index + 1);
        
        // Create movie card content with hidden caption that shows on hover
        item.innerHTML = `
            <img 
                src="${movie.thumb_url}" 
                alt="${movie.name}"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450?text=No+Image';"
            >
            <div class="carousel-caption">
                <h5>${movie.name}</h5>
                <button class="view-more-btn">Xem Thêm</button>
            </div>
        `;
        
        // Add click event to navigate to movie details
        item.querySelector('.view-more-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent item click event
            window.location.href = `./movieDetails.html?slug=${movie.slug}`;
        });
        
        carousel.appendChild(item);
    });
    
    carouselContainer.appendChild(carousel);
    
    // Add navigation buttons
    const prevButton = document.createElement('div');
    prevButton.className = 'carousel-nav prev';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.addEventListener('click', () => navigate3DCarousel('prev'));
    
    const nextButton = document.createElement('div');
    nextButton.className = 'carousel-nav next';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.addEventListener('click', () => navigate3DCarousel('next'));
    
    carouselContainer.appendChild(prevButton);
    carouselContainer.appendChild(nextButton);
}

// Navigate 3D carousel with buttons
function navigate3DCarousel(direction) {
    const radios = document.querySelectorAll('.carousel-radio');
    if (!radios || radios.length === 0) return;
    
    const currentIndex = Array.from(radios).findIndex(radio => radio.checked);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : radios.length - 1;
    } else {
        newIndex = currentIndex < radios.length - 1 ? currentIndex + 1 : 0;
    }
    
    radios[newIndex].checked = true;
}

// Auto rotate carousel
function startCarouselAutoRotation() {
    setInterval(() => {
        navigate3DCarousel('next');
    }, 5000); // Change slide every 5 seconds
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initialize3DCarousel();
    setTimeout(startCarouselAutoRotation, 1000);
});
