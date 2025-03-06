let currentPage = 1;

// Hàm lấy danh sách phim hoạt hình
async function fetchAnimatedMovies() {
    try {
        const response = await fetch('https://phimapi.com/v1/api/danh-sach/hoat-hinh');
        const data = await response.json();
        
        if (data.status === "success") {
            displayAnimatedMovies(data.data.items);
        } else {
            console.error('Lỗi:', data.msg);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu phim hoạt hình:', error);
    }
}

// Hiển thị phim hoạt hình
function displayAnimatedMovies(movies) {
    const movieContainer = document.getElementById('recommendedMovies');
    movieContainer.innerHTML = '';
    
    // Tạo một fragment để giảm thiểu việc reflow/repaint
    const fragment = document.createDocumentFragment();
    
    movies.slice(0, 8).forEach(movie => { // Chỉ lấy 8 phim đầu tiên
        const movieDiv = document.createElement('div');
        movieDiv.className = 'col-lg-3 col-md-4 col-sm-6 col-12 my-3';
        movieDiv.onclick = () => location.href = `./movieDetails.html?slug=${movie.slug}`;
        
        movieDiv.innerHTML = `
            <div class="card movie-card">
                <img src="https://phimimg.com/${movie.poster_url}" 
                     class="card-img-top ld ld-bounce-in" 
                     alt="${movie.name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="card-body">
                    <h5 class="card-title" title="${movie.name}">${movie.name}</h5>
                    <p class="card-text" title="${movie.origin_name}">${movie.origin_name}</p>
                    <p class="card-text">
                        <small class="text">Năm: ${movie.year}</small>
                        <small class="text" ms-2">
                            ${movie.type === 'series' ? `Tập: ${movie.episode_current}` : `Thời lượng: ${movie.time}`}
                        </small>
                    </p>
                </div>
            </div>
        `;
        
        fragment.appendChild(movieDiv);
    });
    
    movieContainer.appendChild(fragment);
}

// Hàm lấy danh sách phim mới
async function fetchMovies(page) {
    try {
        const response = await fetch(`https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${page}`);
        const data = await response.json();
        
        if (data.status === true) {
            displayNewMovies(data.items);
            // Cập nhật số trang tối đa từ pagination
            const totalPages = data.pagination.totalPages;
            updatePagination(page, totalPages);
        } else {
            console.error('Lỗi:', data.msg);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu phim mới:', error);
    }
}

// Hiển thị phim mới
function displayNewMovies(movies) {
    const movieContainer = document.getElementById('newMovies');
    movieContainer.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    
    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.className = 'col-lg-3 col-md-4 col-sm-6 col-12 my-3';
        movieDiv.onclick = () => location.href = `./movieDetails.html?slug=${movie.slug}`;
        
        movieDiv.innerHTML = `
            <div class="card movie-card">
                <img src="${movie.poster_url}" 
                     class="card-img-top" 
                     alt="${movie.name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="card-body">
                    <h5 class="card-title" title="${movie.name}">${movie.name}</h5>
                    <p class="card-text" title="${movie.origin_name}">${movie.origin_name}</p>
                    <p class="card-text">
                        <small class="text">Năm: ${movie.year}</small>
                    </p>
                </div>
            </div>
        `;
        
        fragment.appendChild(movieDiv);
    });
    
    movieContainer.appendChild(fragment);
}

function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    // Xóa các nút số trang cũ
    const oldPageButtons = pagination.querySelectorAll('li:not(:first-child):not(:last-child)');
    oldPageButtons.forEach(button => button.remove());

    // Tính toán phạm vi số trang cần hiển thị
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(startPage + 2, totalPages);
    
    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }
    
    // Thêm các nút số trang mới
    const nextPageItem = pagination.querySelector('li:last-child');
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = 'page-item';
        if (i === parseInt(currentPage)) {
            li.classList.add('active');
        }
        
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
    fetchAnimatedMovies();
    fetchMovies(1);
    
    const pagination = document.getElementById('pagination');
    
    pagination.addEventListener('click', async (e) => {
        e.preventDefault();
        const pageLink = e.target.closest('.page-link');
        if (!pageLink) return;
        
        let newPage = currentPage;
        
        if (pageLink.id === 'prevPage' && currentPage > 1) {
            newPage = currentPage - 1;
        } else if (pageLink.id === 'nextPage') {
            newPage = currentPage + 1;
        } else {
            const page = pageLink.getAttribute('data-page');
            if (page) {
                newPage = parseInt(page);
            }
        }
        
        if (newPage !== currentPage) {
            currentPage = newPage;
            // Thêm class active cho trang hiện tại
            const pageItems = pagination.querySelectorAll('.page-item');
            pageItems.forEach(item => {
                const pageNum = item.querySelector('.page-link')?.getAttribute('data-page');
                if (pageNum === currentPage.toString()) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            await fetchMovies(currentPage);
            
            // Scroll lên đầu danh sách phim
            document.getElementById('newMovies').scrollIntoView({ behavior: 'smooth' });
        }
    });
}); 