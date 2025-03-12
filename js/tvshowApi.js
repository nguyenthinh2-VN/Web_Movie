let currentPage = 1;
const ITEMS_PER_PAGE = 16; // Số phim hiển thị trên mỗi trang

// Hàm lấy danh sách TV Show

async function fetchMovies(page) {

    try {

        const response = await fetch(`https://phimapi.com/v1/api/danh-sach/tv-shows?page=${page}&limit=${ITEMS_PER_PAGE}`);

        const data = await response.json();

        

        if (data.status === "success") {

            displayMovies(data.data.items);

            // Cập nhật số trang tối đa từ pagination

            const totalPages = data.data.params.pagination.totalPages;

            updatePagination(page, totalPages);

        } else {

            console.error('Lỗi:', data.msg);

        }

    } catch (error) {

        console.error('Lỗi khi tải dữ liệu TV Show:', error);

    }

}

// Hiển thị danh sách TV Show
function displayMovies(movies) {
    const movieContainer = document.getElementById('movieList');
    
    if (!movies || movies.length === 0) {
        movieContainer.innerHTML = '<p class="text-center">Không có phim nào.</p>';
        return;
    }
    
    let moviesHTML = '';
    
    movies.forEach(movie => {
        moviesHTML += `
            <div class="col-lg-3 col-md-4 col-sm-6 col-12 my-3">
                <a href="./movieDetails.html?slug=${movie.slug}" class="text-decoration-none">
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
                            <p class="card-text" title="${movie.origin_name}">${movie.origin_name}</p>
                            <p class="card-text">
                                <small class="text">Năm: ${movie.year}</small>
                                <small class="text ms-2">
                                    ${movie.episode_current}
                                </small>
                            </p>
                        </div>
                    </div>
                </a>
            </div>
        `;
    });
    
    movieContainer.innerHTML = moviesHTML;
}

function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    // Xóa các nút số trang hiện tại
    const pageItems = pagination.querySelectorAll('li:not(:first-child):not(:last-child)');
    pageItems.forEach(item => item.remove());
    
    // Tính toán phạm vi số trang cần hiển thị (chỉ 3 số)
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(startPage + 2, totalPages);
    
    // Điều chỉnh startPage nếu endPage đã ở cuối
    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }
    
    // Thêm các nút số trang mới
    const nextPageItem = pagination.querySelector('li:last-child');
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item${i === currentPage ? ' active' : ''}`;
        
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.setAttribute('data-page', i);
        a.textContent = i;
        
        li.appendChild(a);
        pagination.insertBefore(li, nextPageItem);
    }
    
    // Cập nhật trạng thái nút Prev và Next
    prevButton.parentElement.classList.toggle('disabled', currentPage === 1);
    nextButton.parentElement.classList.toggle('disabled', currentPage === totalPages);
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies(1);
    
    const pagination = document.getElementById('pagination');
    
    pagination.addEventListener('click', (e) => {
        e.preventDefault();
        const pageLink = e.target.closest('.page-link');
        if (!pageLink) return;
        
        if (pageLink.id === 'prevPage' && currentPage > 1) {
            currentPage--;
            fetchMovies(currentPage);
        } else if (pageLink.id === 'nextPage' && !pageLink.parentElement.classList.contains('disabled')) {
            currentPage++;
            fetchMovies(currentPage);
        } else {
            const page = pageLink.getAttribute('data-page');
            if (page) {
                currentPage = parseInt(page);
                fetchMovies(currentPage);
            }
        }
        
        // Cuộn đến tiêu đề "TV Show"
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback nếu không tìm thấy tiêu đề
            window.scrollTo({
                top: 500,
                behavior: 'smooth'
            });
        }
    });
}); 