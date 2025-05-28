// Hàm tải dữ liệu phim tương tự từ file JSON
async function fetchSimilarMovies() {
    try {
        const response = await fetch('../data/slide-movies-Detail.json');
        const data = await response.json();
        
        if (data.status === true && data.items && data.items.length > 0) {
            displaySimilarMovies(data.items);
        } else {
            console.error('Không có dữ liệu phim tương tự');
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu phim tương tự:', error);
    }
}

// Hàm hiển thị phim tương tự
function displaySimilarMovies(movies) {
    const sliderContainer = document.querySelector('.similar-movies-slider');
    
    // Xóa nội dung hiện tại
    sliderContainer.innerHTML = '';
    
    // Hiển thị tất cả phim có trong dữ liệu
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        sliderContainer.appendChild(movieCard);
    });
    
    // Khởi tạo các nút điều hướng slider
    initSliderNavigation();
    
    // Khởi tạo sự kiện lazy loading cho ảnh
    initLazyLoading();
}

// Hàm tạo thẻ movie card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    // Tạo tên gốc ngắn gọn nếu quá dài
    const originName = movie.origin_name.length > 25 ? 
        movie.origin_name.substring(0, 25) + '...' : 
        movie.origin_name;
    
    card.innerHTML = `
        <a href="movieDetails.html?slug=${movie.slug}" class="movie-link">
            <div class="movie-card-poster">
                <div class="placeholder"></div>
                <img data-src="${movie.poster_url}" alt="${movie.name}" loading="lazy">
            </div>
            <div class="movie-card-info">
                <h4 class="movie-card-title">${movie.name}</h4>
                <div class="movie-card-subtitle">
                    <span title="${movie.origin_name}">${originName}</span>
                    <span>${movie.year}</span>
                </div>
            </div>
        </a>
    `;
    return card;
}

// Hàm khởi tạo các nút điều hướng slider
function initSliderNavigation() {
    const slider = document.querySelector('.similar-movies-slider');
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');
    
    // Số phim hiển thị trên một lần lướt (5 trên desktop, 2 trên mobile)
    const getVisibleCount = () => window.innerWidth >= 768 ? 5 : 2;
    
    // Tính toán chiều rộng của một card (bao gồm cả margin)
    const getCardWidth = () => {
        const card = document.querySelector('.movie-card');
        if (!card) return 0;
        
        const cardStyle = window.getComputedStyle(card);
        const width = card.offsetWidth;
        const marginRight = parseInt(cardStyle.marginRight) || 15; // Mặc định gap là 15px
        
        return width + marginRight;
    };
    
    // Xử lý sự kiện click nút Previous
    prevBtn.addEventListener('click', () => {
        const cardWidth = getCardWidth();
        const visibleCount = getVisibleCount();
        slider.scrollBy({ left: -cardWidth * visibleCount, behavior: 'smooth' });
    });
    
    // Xử lý sự kiện click nút Next
    nextBtn.addEventListener('click', () => {
        const cardWidth = getCardWidth();
        const visibleCount = getVisibleCount();
        slider.scrollBy({ left: cardWidth * visibleCount, behavior: 'smooth' });
    });
    
    // Kiểm tra và cập nhật trạng thái của các nút điều hướng
    const updateArrowState = () => {
        const isAtStart = slider.scrollLeft <= 10;
        const isAtEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10;
        
        prevBtn.disabled = isAtStart;
        prevBtn.style.opacity = isAtStart ? '0.3' : '1';
        
        nextBtn.disabled = isAtEnd;
        nextBtn.style.opacity = isAtEnd ? '0.3' : '1';
    };
    
    // Thêm sự kiện scroll để cập nhật trạng thái nút
    slider.addEventListener('scroll', updateArrowState);
    
    // Cập nhật ban đầu
    updateArrowState();
    
    // Cập nhật khi thay đổi kích thước màn hình
    window.addEventListener('resize', updateArrowState);
}

// Hàm khởi tạo lazy loading cho ảnh
function initLazyLoading() {
    const images = document.querySelectorAll('.movie-card-poster img[data-src]');
    
    const loadImage = (img) => {
        const src = img.getAttribute('data-src');
        if (!src) return;
        
        // Tạo một ảnh tạm để kiểm tra khi tải xong
        const tempImg = new Image();
        tempImg.onload = () => {
            // Khi ảnh tạm tải xong, gán src cho ảnh chính
            img.src = src;
            img.classList.add('loaded');
            const placeholder = img.previousElementSibling;
            if (placeholder && placeholder.classList.contains('placeholder')) {
                placeholder.style.opacity = '0';
            }
        };
        
        tempImg.onerror = () => {
            // Nếu có lỗi, hiển thị ảnh mặc định
            img.src = 'https://via.placeholder.com/300x450?text=No+Image';
            img.classList.add('loaded');
            const placeholder = img.previousElementSibling;
            if (placeholder && placeholder.classList.contains('placeholder')) {
                placeholder.style.opacity = '0';
            }
        };
        
        // Bắt đầu tải ảnh tạm
        tempImg.src = src;
    };
    
    // Sử dụng Intersection Observer nếu trình duyệt hỗ trợ
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px' });
        
        images.forEach(img => observer.observe(img));
    } else {
        // Fallback cho trình duyệt không hỗ trợ Intersection Observer
        images.forEach(img => loadImage(img));
    }
}

// Tải phim tương tự khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Chỉ tải phim tương tự sau khi đã tải xong thông tin phim chính
    const checkMovieDetailsLoaded = setInterval(() => {
        if (document.querySelector('#movieDetails .movie-details')) {
            clearInterval(checkMovieDetailsLoaded);
            fetchSimilarMovies();
        }
    }, 500);
    
    // Fallback: Nếu sau 5 giây vẫn chưa tải được thông tin phim chính, vẫn tải phim tương tự
    setTimeout(() => {
        clearInterval(checkMovieDetailsLoaded);
        if (!document.querySelector('#similarMovies .movie-card')) {
            fetchSimilarMovies();
        }
    }, 5000);
});
