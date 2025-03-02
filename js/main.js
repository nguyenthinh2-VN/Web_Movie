// Hàm debounce
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

// Dữ liệu mẫu cho phim (có thể xóa vì đã có trong movieData.js)
const sampleMovies = movieData.movies;

// Hàm hiển thị danh sách phim
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    movies.forEach(movie => {
        const movieElement = `
            <div class="movie-card" onclick="showMovieDetails(${movie.id})">
                <img src="${movie.poster_path}" alt="${movie.title}" class="movie-poster">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-info">
                    <span>${new Date(movie.release_date).getFullYear()}</span>
                    <span>⭐ ${movie.vote_average.toFixed(1)}</span>
                </div>
            </div>
        `;
        container.innerHTML += movieElement;
    });
}

// Hàm chuyển hướng đến trang chi tiết phim
function showMovieDetails(movieId) {
    window.location.href = `aboutMovie.html?id=${movieId}`;
}

// Load dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    displayMovies(sampleMovies, 'recommendedMovies');
    displayMovies(sampleMovies.slice().reverse(), 'newMovies');

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.btn-outline-light');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    // Hàm hiển thị gợi ý
    function displaySuggestions(movies, query) {
        if (movies.length === 0) {
            suggestionsContainer.classList.remove('active');
            return;
        }

        suggestionsContainer.innerHTML = movies.map(movie => `
            <div class="suggestion-item" onclick="showMovieDetails(${movie.id})">
                <img src="${movie.poster_path}" alt="${movie.title}" class="suggestion-poster">
                <div class="suggestion-info">
                    <div class="suggestion-title">${highlightMatch(movie.title, query)}</div>
                    <div class="suggestion-meta">
                        ${new Date(movie.release_date).getFullYear()} | ⭐ ${movie.vote_average}
                        <br>
                        ${movie.genres ? movie.genres.join(', ') : ''}
                    </div>
                </div>
            </div>
        `).join('');

        suggestionsContainer.classList.add('active');
    }

    // Hàm highlight từ khóa tìm kiếm
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Hàm tìm kiếm với debounce
    const debouncedSearch = debounce((query) => {
        if (query.length >= 2) {
            const results = sampleMovies.filter(movie => {
                const searchStr = movie.title.toLowerCase();
                return searchStr.includes(query.toLowerCase());
            }).slice(0, 5);
            displaySuggestions(results, query);
        } else {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('active');
        }
    }, 800);

    // Thêm xử lý click cho nút tìm kiếm
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    });

    // Lắng nghe sự kiện input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        debouncedSearch(query);
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.remove('active');
        }
    });

    // Xử lý khi nhấn Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim().length >= 2) {
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });
}); 