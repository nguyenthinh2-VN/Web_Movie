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
        // Cắt ngắn tên phụ nếu quá dài
        const maxLength = 25; // Giảm độ dài tối đa cho tên phụ
        let originName = movie.origin_name || '';
        if (originName.length > maxLength) {
            originName = originName.substring(0, maxLength) + '...';
        }
        
        suggestionsHTML += `
            <div class="suggestion-item" onclick="location.href='./movieDetails.html?slug=${movie.slug}'">
                <img src="https://phimimg.com/${movie.poster_url}" 
                     class="suggestion-poster" 
                     alt="${movie.name}"
                     onerror="this.src='https://via.placeholder.com/50x70?text=No+Image'">
                <div class="suggestion-info">
                    <div class="suggestion-title">${movie.name}</div>
                    <div class="suggestion-meta">
                        ${originName} (${movie.year})
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
        // Lấy tất cả kết quả từ API
        const response = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=100`);
        const data = await response.json();
        
        if (data.status === "success") {
            // Tạo phân trang thủ công từ dữ liệu
            const allItems = data.data.items || [];
            const itemsPerPage = 20;
            const totalPages = Math.ceil(allItems.length / itemsPerPage);
            
            // Tính toán các mục cho trang hiện tại
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, allItems.length);
            const paginatedItems = allItems.slice(startIndex, endIndex);
            
            // Trả về dữ liệu đã phân trang
            return {
                items: paginatedItems,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: allItems.length,
                    itemsPerPage: itemsPerPage
                }
            };
        }
        return null;
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        return null;
    }
}

// Hiển thị kết quả tìm kiếm trên trang search.html
function displaySearchResults(data) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (!data || !data.items || data.items.length === 0) {
        resultsContainer.innerHTML = `
            <div class="col-12">
                <div class="no-results">
                    <i class="fas fa-search fa-3x mb-3"></i>
                    <h3>Không tìm thấy kết quả phù hợp</h3>
                    <p>Vui lòng thử lại với từ khóa khác</p>
                </div>
            </div>
        `;
        // Ẩn phân trang nếu không có kết quả
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    
    let resultsHTML = '';
    
    data.items.forEach(movie => {
        resultsHTML += `
            <div class="col-lg-3 col-md-4 col-sm-6 col-12 my-3">
                <a href="movieDetails.html?slug=${movie.slug}" class="text-decoration-none">
                    <div class="card movie-card">
                        <div class="card-poster">
                            <img src="https://phimimg.com/${movie.poster_url}" 
                                class="card-img-top" 
                                alt="${movie.name}"
                                loading="lazy"
                                onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                            <div class="card-overlay">
                                <div class="overlay-content">
                                    <span class="btn-play">
                                        <i class="fas fa-play-circle fa-3x"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title" title="${movie.name}">${movie.name}</h5>
                            <p class="card-text" title="${movie.origin_name}">${movie.origin_name || ''}</p>
                            <p class="card-text">
                                <small class="text">Năm: ${movie.year}</small>
                                <small class="text ms-2">
                                    ${movie.type === 'series' ? `${movie.episode_current}` : `Thời lượng: ${movie.time || 'N/A'}`}
                                </small>
                            </p>
                        </div>
                    </div>
                </a>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHTML;
    
    // Hiển thị phân trang
    updatePagination(data.pagination);
    
    // Hiển thị phân trang
    document.getElementById('pagination').style.display = 'flex';
}

// Cập nhật phân trang
function updatePagination(pagination) {
    if (!pagination) return;
    
    const paginationContainer = document.getElementById('pagination');
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;
    
    // Xóa các nút số trang cũ
    const pageItems = paginationContainer.querySelectorAll('li:not(:first-child):not(:last-child)');
    pageItems.forEach(item => item.remove());
    
    // Nút Previous
    const prevButton = document.getElementById('prevPage');
    prevButton.parentElement.classList.toggle('disabled', currentPage <= 1);
    
    // Nút Next
    const nextButton = document.getElementById('nextPage');
    nextButton.parentElement.classList.toggle('disabled', currentPage >= totalPages);
    
    // Thêm các nút số trang mới
    const nextPageItem = paginationContainer.querySelector('li:last-child');
    
    // Tính toán phạm vi số trang cần hiển thị
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(startPage + 2, totalPages);
    
    // Điều chỉnh startPage nếu endPage đã ở cuối
    if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 2);
    }
    
    // Thêm các nút số trang
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item${i === currentPage ? ' active' : ''}`;
        
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.setAttribute('data-page', i);
        a.textContent = i;
        
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page'));
            const keyword = document.getElementById('searchKeyword').textContent;
            loadSearchResults(keyword, page);
        });
        
        li.appendChild(a);
        paginationContainer.insertBefore(li, nextPageItem);
    }
    
    // Thêm sự kiện cho nút Previous và Next
    prevButton.onclick = function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            const keyword = document.getElementById('searchKeyword').textContent;
            loadSearchResults(keyword, currentPage - 1);
        }
    };
    
    nextButton.onclick = function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            const keyword = document.getElementById('searchKeyword').textContent;
            loadSearchResults(keyword, currentPage + 1);
        }
    };
    
    // Hiển thị thông tin về kết quả
    const totalItems = pagination.totalItems;
    const startItem = (currentPage - 1) * pagination.itemsPerPage + 1;
    const endItem = Math.min(startItem + pagination.itemsPerPage - 1, totalItems);
    
    // Thêm thông tin về kết quả hiển thị
    const searchHeader = document.querySelector('.search-header');
    const resultInfo = document.createElement('p');
    resultInfo.className = 'text-muted mt-2';
    resultInfo.textContent = `Hiển thị ${startItem}-${endItem} của ${totalItems} kết quả`;
    
    // Xóa thông tin cũ nếu có
    const oldInfo = searchHeader.querySelector('.text-muted');
    if (oldInfo) {
        oldInfo.remove();
    }
    
    searchHeader.appendChild(resultInfo);
}

// Tải kết quả tìm kiếm
async function loadSearchResults(keyword, page = 1) {
    // Hiển thị loading
    document.getElementById('searchResults').innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-3">Đang tìm kiếm...</p>
        </div>
    `;
    
    // Lấy dữ liệu
    const data = await fetchSearchResults(keyword, page);
    
    // Hiển thị kết quả
    displaySearchResults(data);
    
    // Cập nhật URL với trang hiện tại
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.history.replaceState({}, '', url);
    
    // Scroll lên đầu trang
    window.scrollTo(0, 0);
}

// Khởi tạo trang tìm kiếm
function initSearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword');
    const page = parseInt(urlParams.get('page')) || 1;
    
    if (keyword) {
        document.getElementById('searchKeyword').textContent = keyword;
        document.title = `Tìm kiếm: ${keyword} - Yuki Movie`;
        
        // Đặt giá trị từ khóa vào ô tìm kiếm
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = keyword;
        }
        
        loadSearchResults(keyword, page);
    }
}

// Thêm CSS cho tìm kiếm
const searchStyle = document.createElement('style');
searchStyle.textContent = `
    .search-header {
        margin-bottom: 2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 1rem;
    }
    
    .search-keyword {
        color: var(--primary-light);
        font-weight: 500;
    }
    
    .no-results {
        text-align: center;
        padding: 3rem 1rem;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin: 2rem 0;
    }
    
    .no-results i {
        color: var(--primary-light);
        margin-bottom: 1rem;
    }
    
    /* Card styling */
    .movie-card {
        position: relative;
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        height: 100%;
        background-color: var(--dark-bg-lighter, #1c1e25);
        border: none;
        border-radius: 8px;
    }
    
    .movie-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    }
    
    .card-poster {
        position: relative;
        overflow: hidden;
    }
    
    .card-img-top {
        height: 350px;
        object-fit: cover;
        transition: transform 0.5s ease;
    }
    
    .movie-card:hover .card-img-top {
        transform: scale(1.05);
    }
    
    .card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 60%);
        opacity: 0;
        transition: opacity 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .movie-card:hover .card-overlay {
        opacity: 1;
    }
    
    .overlay-content {
        text-align: center;
    }
    
    .btn-play {
        color: var(--primary-light);
        margin-bottom: 10px;
        display: block;
    }
    
    .movie-type {
        background-color: var(--primary-color);
        color: white;
        padding: 3px 10px;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-top: 10px;
    }
    
    .card-body {
        padding: 1rem;
    }
    
    .card-title {
        font-size: 1rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: white;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .card-text {
        font-size: 0.85rem;
        color: var(--text-muted, #b0b0b0);
        margin-bottom: 0.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .text {
        color: var(--text-muted, #b0b0b0);
        font-size: 0.8rem;
    }
    
    /* Pagination styling */
    .pagination {
        margin-top: 2rem;
    }
    
    .page-link {
        background-color: var(--dark-bg-lighter, #1c1e25);
        border-color: rgba(255, 255, 255, 0.1);
        color: white;
        transition: background-color 0.3s ease;
    }
    
    .page-link:hover {
        background-color: var(--primary-dark);
        border-color: var(--primary-dark);
        color: white;
    }
    
    .page-item.active .page-link {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
    }
    
    .page-item.disabled .page-link {
        background-color: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
    }
`;
document.head.appendChild(searchStyle);

// Khởi tạo trang tìm kiếm nếu đang ở trang search.html
if (window.location.pathname.includes('search.html')) {
    document.addEventListener('DOMContentLoaded', initSearchPage);
} 