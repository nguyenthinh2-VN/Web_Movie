let searchTimeout;
const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');
let currentSearchPage = 1;

// Hàm tìm kiếm với debounce
searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const keyword = this.value.trim();
    
    if (keyword.length > 0) {
        searchTimeout = setTimeout(() => {
            fetchSearchSuggestions(keyword);
        }, 500);
    } else {
        searchSuggestions.innerHTML = '';
        searchSuggestions.classList.remove('active');
    }
});

// Xử lý khi người dùng nhấn Enter
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const keyword = this.value.trim();
        if (keyword.length > 0) {
            window.location.href = `./search.html?keyword=${encodeURIComponent(keyword)}`;
        }
    }
});

// Xử lý khi click nút tìm kiếm
document.querySelector('.btn-outline-light').addEventListener('click', function() {
    const keyword = searchInput.value.trim();
    if (keyword.length > 0) {
        window.location.href = `./search.html?keyword=${encodeURIComponent(keyword)}`;
    }
});

// Hàm fetch gợi ý tìm kiếm
async function fetchSearchSuggestions(keyword) {
    try {
        const response = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=50`);
        const data = await response.json();
        
        if (data.status === "success") {
            displaySuggestions(data.data.items.slice(0, 10)); // Chỉ hiển thị 10 gợi ý đầu tiên
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

//Gợi ý trong dropdown
function displaySuggestions(movies) {
    if (!movies || movies.length === 0) {
        searchSuggestions.classList.remove('active');
        return;
    } 

    let suggestionsHTML = '';
    movies.forEach(movie => {
        suggestionsHTML += `
            <div class="suggestion-item" onclick="location.href='./movieDetails.html?slug=${movie.slug}'">
                <img src="https://phimimg.com/${movie.poster_url}" 
                     class="suggestion-poster" 
                     alt="${movie.name}"
                     onerror="this.src='https://via.placeholder.com/50x70?text=No+Image'">
                <div class="suggestion-info">
                    <div class="suggestion-title">${movie.name}</div>
                    <div class="suggestion-meta">
                        ${movie.origin_name} (${movie.year})
                    </div>
                </div>
            </div>
        `;
    });

    searchSuggestions.innerHTML = suggestionsHTML;
    searchSuggestions.classList.add('active');
}

// Đóng dropdown khi click ra ngoài
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-suggestions') && !e.target.closest('#searchInput')) {
        searchSuggestions.classList.remove('active');
    }
});

// Hàm fetch kết quả tìm kiếm cho trang search.html
async function fetchSearchResults(keyword, page = 1) {
    try {
        const response = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=50`);
        const data = await response.json();
        
        if (data.status === "success") {
            const allItems = data.data.items;
            const totalItems = allItems.length;
            const itemsPerPage = 10;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            
            // Tính toán items cho trang hiện tại
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = allItems.slice(start, end);
            
            displaySearchResults(pageItems);
            updateSearchPagination(page, totalPages, keyword);
        } else {
            displaySearchResults([]);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        displaySearchResults([]);
    }
}

// Hiển thị kết quả tìm kiếm
function displaySearchResults(movies) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    if (movies.length === 0) {
        searchResults.innerHTML = '<p class="text-center mt-4">Không tìm thấy kết quả phù hợp</p>';
        return;
    }

    searchResults.innerHTML = '';
    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.className = 'col-lg-3 col-md-4 col-sm-6 col-12 my-3';
        movieDiv.innerHTML = `
            <div class="card movie-card" onclick="location.href='movieDetails.html?slug=${movie.slug}'">
                <img src="https://phimimg.com/${movie.poster_url}" 
                     class="card-img-top" 
                     alt="${movie.name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="card-body">
                    <h5 class="card-title" title="${movie.name}">${movie.name}</h5>
                    <p class="card-text" title="${movie.origin_name}">${movie.origin_name}</p>
                    <p class="card-text">
                        <small class="text-muted">Năm: ${movie.year}</small>
                        ${movie.episode_current ? `<small class="text-muted ms-2">${movie.episode_current}</small>` : ''}
                    </p>
                </div>
            </div>
        `;
        searchResults.appendChild(movieDiv);
    });
}

// Hàm cập nhật phân trang cho kết quả tìm kiếm
function updateSearchPagination(currentPage, totalPages, keyword) {
    const pagination = document.getElementById('searchPagination');
    if (!pagination) return;

    // Xóa các nút trang cũ
    pagination.innerHTML = '';

    // Tính toán phạm vi số trang cần hiển thị
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(startPage + 2, totalPages);
    
    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }

    // Tạo HTML cho phân trang
    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Thêm các nút số trang
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    pagination.innerHTML = paginationHTML;

    // Thêm sự kiện click cho các nút phân trang
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            if (link.parentElement.classList.contains('disabled')) return;

            const newPage = parseInt(link.getAttribute('data-page'));
            if (newPage && newPage !== currentPage) {
                // Cập nhật URL với trang mới
                const url = new URL(window.location);
                url.searchParams.set('page', newPage);
                window.history.pushState({}, '', url);

                // Fetch dữ liệu trang mới
                await fetchSearchResults(keyword, newPage);
                
                // Scroll lên đầu kết quả
                document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Cập nhật lại phần xử lý DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('search.html')) {
        const params = new URLSearchParams(window.location.search);
        const keyword = params.get('keyword');
        const page = parseInt(params.get('page')) || 1;
        
        if (keyword) {
            document.getElementById('searchInput').value = keyword;
            fetchSearchResults(keyword, page);
        }
    }
}); 