let currentPage = 1;

async function fetchMovies(page) {
    try {
        const response = await fetch(`https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=${page}`);
        const data = await response.json();
        
        if (data.status === "success") {
            displayMovies(data.data.items);
            updatePagination(page, data.data.params.pagination.totalPages);
        } else {
            console.error('Lỗi:', data.msg);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

function displayMovies(movies) {
    const movieContainer = document.getElementById('movieList');
    movieContainer.innerHTML = '';
    
    // Tạo một fragment để giảm thiểu việc reflow/repaint
    const fragment = document.createDocumentFragment();
    
    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.className = 'col-lg-3 col-md-4 col-sm-6 col-12 my-3';
        movieDiv.onclick = () => location.href = `./movieDetails.html?slug=${movie.slug}`;
        
        // Thêm lazy loading cho ảnh
        movieDiv.innerHTML = `
            <div class="card movie-card">
                <img src="https://phimimg.com/${movie.poster_url}" 
                     class="card-img-top" 
                     alt="${movie.name}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div class="card-body">
                    <h5 class="card-title" title="${movie.name}">${movie.name}</h5>
                    <p class="card-text" title="${movie.origin_name}">${movie.origin_name}</p>
                    <p class="card-text">
                        <small class="text">Năm: ${movie.year}</small>
                        <small class="text ms-2">
                            ${movie.type === 'series' ? `${movie.episode_current}` : `Thời lượng: ${movie.time}`}
                        </small>
                    </p>
                </div>
            </div>
        `;
        
        fragment.appendChild(movieDiv);
    });
    
    movieContainer.appendChild(fragment);
}

function updatePagination(currentPage) {
    const pagination = document.getElementById('pagination');
    const pageLinks = pagination.querySelectorAll('.page-link[data-page]');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    // Xóa các nút số trang cũ
    const oldPageButtons = pagination.querySelectorAll('li:not(:first-child):not(:last-child)');
    oldPageButtons.forEach(button => button.remove());

    // Tính toán phạm vi số trang cần hiển thị
    let startPage = Math.max(1, currentPage - 1);
    let endPage = startPage + 2;
    
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
}

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
        } else if (pageLink.id === 'nextPage') {
            currentPage++;
            fetchMovies(currentPage);
        } else {
            const page = pageLink.getAttribute('data-page');
            if (page) {
                currentPage = parseInt(page);
                fetchMovies(currentPage);
            }
        }
    });
}); 