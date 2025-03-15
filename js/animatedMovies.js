let currentPage = 1;
const ITEMS_PER_PAGE = 16;

async function fetchMovies(page) {
    try {
        const response = await fetch(`https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=${page}&limit=${ITEMS_PER_PAGE}`);
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
    
    if (!movies || movies.length === 0) {
        movieContainer.innerHTML = '<p class="text-center">Không có phim nào.</p>';
        return;
    }
    
    console.log('Dữ liệu hoạt hình:', movies); // Debug dữ liệu từ API
    
    let moviesHTML = '';
    
    movies.forEach(movie => {
        const episodeCurrent = movie.episode_current || movie.current_episode || movie.episode || null;
        // Kiểm tra và chuẩn hóa poster_url
        let posterUrl = movie.poster_url || '';
        if (posterUrl && !posterUrl.startsWith('http')) {
            posterUrl = `https://phimimg.com/${posterUrl.startsWith('/') ? posterUrl.substring(1) : posterUrl}`;
        } else if (!posterUrl) {
            posterUrl = 'https://via.placeholder.com/300x450?text=No+Image';
        }

        moviesHTML += `
            <div class="col-lg-3 col-md-4 col-sm-6 col-12 my-3">
                <div class="card movie-card" data-slug="${movie.slug}">
                    <div class="card-poster">
                        <img src="${posterUrl}" 
                             class="card-img-top" 
                             alt="${movie.name || 'No Name'}"
                             loading="lazy"
                             onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'; this.onerror=null;">
                        <div class="card-overlay" onclick="location.href='./movieDetails.html?slug=${movie.slug}'">
                            <div class="overlay-content">
                                <span class="btn-play">
                                    <i class="fas fa-play-circle fa-3x"></i>
                                </span>
                            </div>
                        </div>
                        ${episodeCurrent ? `<div class="episode-badge">${episodeCurrent}</div>` : ''}
                        <div class="bookmark-badge" onclick="event.stopPropagation(); toggleBookmark(this.closest('.movie-card'));">
                            <i class="fas fa-bookmark"></i>
                        </div>
                    </div>
                    <div class="card-body" onclick="location.href='./movieDetails.html?slug=${movie.slug}'">
                        <h5 class="card-title" title="${movie.name || 'No Name'}">${movie.name || 'No Name'}</h5>
                        <p class="card-text" title="${movie.origin_name || 'No Origin Name'}">${movie.origin_name || 'No Origin Name'}</p>
                        <p class="card-text">
                            <small class="text">Năm: ${movie.year || 'N/A'}</small>
                            <small class="text ms-2">
                                ${episodeCurrent || `Thời lượng: ${movie.time || 'N/A'}`}
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        `;
    });
    
    movieContainer.innerHTML = moviesHTML;
    updateBookmarkIcons();
}

function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    const pageItems = pagination.querySelectorAll('li:not(:first-child):not(:last-child)');
    pageItems.forEach(item => item.remove());
    
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(startPage + 2, totalPages);
    
    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }
    
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
    
    prevButton.parentElement.classList.toggle('disabled', currentPage === 1);
    nextButton.parentElement.classList.toggle('disabled', currentPage === totalPages);
}

function toggleBookmark(movieCard) {
    if (!movieCard) return;

    try {
        const movie = {
            slug: movieCard.dataset.slug,
            name: movieCard.querySelector('.card-title').textContent.trim(),
            origin_name: movieCard.querySelector('.card-text[title]').getAttribute('title').trim(),
            poster_url: movieCard.querySelector('.card-img-top').src.replace('https://phimimg.com/', '').replace('https://via.placeholder.com/300x450?text=No+Image', ''),
            year: movieCard.querySelector('.text').textContent.replace('Năm: ', '').trim(),
            episode_current: movieCard.querySelector('.episode-badge')?.textContent || null,
            time: movieCard.querySelector('.text.ms-2')?.textContent.includes('Thời lượng') ? movieCard.querySelector('.text.ms-2').textContent.replace('Thời lượng: ', '').trim() : null
        };

        let bookmarks = [];
        const storedBookmarks = localStorage.getItem('movieBookmarks');
        if (storedBookmarks) {
            try {
                bookmarks = JSON.parse(storedBookmarks);
                if (!Array.isArray(bookmarks)) {
                    bookmarks = [bookmarks];
                }
            } catch (parseError) {
                console.error('Lỗi khi parse movieBookmarks:', parseError);
                bookmarks = [];
            }
        }

        const bookmarkIcon = movieCard.querySelector('.bookmark-badge');
        const existingIndex = bookmarks.findIndex(m => m.slug === movie.slug);

        if (existingIndex !== -1) {
            bookmarks.splice(existingIndex, 1);
            bookmarkIcon.classList.remove('active');
            showNotification('Đã xóa phim khỏi danh sách yêu thích');
        } else {
            bookmarks.push(movie);
            bookmarkIcon.classList.add('active');
            showNotification('Đã thêm phim vào danh sách yêu thích');
        }

        localStorage.setItem('movieBookmarks', JSON.stringify(bookmarks, null, 0));
        updateBookmarkCount();
        console.log('Danh sách bookmark sau khi cập nhật:', bookmarks);
    } catch (error) {
        console.error('Lỗi khi xử lý bookmark:', error);
    }
}

function updateBookmarkCount() {
    try {
        let bookmarks = [];
        const storedBookmarks = localStorage.getItem('movieBookmarks');
        if (storedBookmarks) {
            try {
                bookmarks = JSON.parse(storedBookmarks);
                if (!Array.isArray(bookmarks)) {
                    bookmarks = [bookmarks];
                }
            } catch (parseError) {
                console.error('Lỗi khi parse movieBookmarks trong updateBookmarkCount:', parseError);
                bookmarks = [];
            }
        }

        const countElement = document.querySelector('.bookmark-count');
        if (countElement) {
            countElement.textContent = bookmarks.length;
            countElement.style.display = bookmarks.length > 0 ? 'inline-block' : 'none';
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng bookmark:', error);
    }
}

function updateBookmarkIcons() {
    const bookmarks = JSON.parse(localStorage.getItem('movieBookmarks')) || [];

    document.querySelectorAll('.movie-card').forEach(card => {
        const movieSlug = card.dataset.slug;
        const bookmarkIcon = card.querySelector('.bookmark-badge');
        if (bookmarks.some(m => m.slug === movieSlug)) {
            bookmarkIcon.classList.add('active');
        } else {
            bookmarkIcon.classList.remove('active');
        }
    });
}

function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <i class="fas fa-bookmark me-2"></i>
        ${message}
    `;
    document.body.appendChild(toast);
    toast.style.display = 'block';
    setTimeout(() => toast.remove(), 2500);
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
        
        const pageTitle = document.querySelector('.section-title');
        if (pageTitle) {
            pageTitle.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({
                top: 500,
                behavior: 'smooth'
            });
        }
    });

    updateBookmarkCount();
});