async function fetchMovieDetails(slug) {
    try {
        console.log(`Fetching details for slug: ${slug}`);
        const response = await fetch(`https://phimapi.com/phim/${slug}`);
        const data = await response.json();
        
        console.log('API Response:', data);

        if (data.status === true) {
            displayMovieDetails(data.movie);
            displayEpisodes(data.episodes);
        } else {
            console.error('Lỗi:', data.msg);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

function displayMovieDetails(movie) {
    const detailsContainer = document.getElementById('movieDetails');
    // Kiểm tra xem director có phải là "Đang cập nhật" hay không
    const showDirectorBadge = movie.director && 
                            movie.director.length === 1 && 
                            movie.director[0] === "Đang cập nhật";
    
    // Thêm class cho container nhưng không sử dụng ảnh nền từ API
    const mainContainer = document.querySelector('.container.mt-4');
    mainContainer.classList.add('movie-details-bg');
    
    // Sử dụng màu nền tối thay vì ảnh nền
    mainContainer.style.backgroundColor = 'var(--dark-bg-lighter)';
    
    // Tính toán số sao dựa trên vote_average
    const totalStars = 5;
    let voteAverage = parseFloat(movie.tmdb.vote_average); // Lấy vote_average từ API và chuyển đổi thành số

    // Kiểm tra giá trị voteAverage
    if (isNaN(voteAverage) || voteAverage < 0) {
        console.error('Invalid vote_average:', voteAverage);
        voteAverage = 0; // Đặt về 0 nếu không hợp lệ
    }

    // Tính số sao dựa trên voteAverage (mỗi sao tương ứng với 2 điểm)
    const filledStars = Math.max(0, Math.min(totalStars, Math.floor(voteAverage / 2))); // Số sao đầy
    const halfStar = (voteAverage % 2) >= 1 ? 1 : 0; // Kiểm tra có sao rưỡi không
    const emptyStars = totalStars - filledStars - halfStar; // Số sao trống

    // Đảm bảo không có giá trị âm cho emptyStars
    if (emptyStars < 0) {
        console.error('Invalid emptyStars:', emptyStars);
        emptyStars = 0; // Đặt về 0 nếu không hợp lệ
    }
    
    // Kiểm tra xem phim đã được bookmark chưa (dùng slug)
    const bookmarks = JSON.parse(localStorage.getItem('movieBookmarks')) || [];
    const isBookmarked = bookmarks.some(m => m.slug === movie.slug);
    
    // Hiển thị thông tin chi tiết phim
    detailsContainer.innerHTML = `
        <div class="row movie-details">
            <div class="col-md-4">
                <img src="${movie.poster_url}" 
                    class="img-fluid rounded shadow" 
                    alt="${movie.name}">
                <div class="movie-meta mt-3">
                    <span class="badge bg-primary me-2">${movie.quality}</span>
                    <span class="badge bg-secondary me-2">${movie.lang}</span>
                    ${showDirectorBadge ? `<span class="badge bg-success me-2">${movie.director}</span>` : ''}
                    ${movie.is_copyright ? '<span class="badge bg-danger">Bản quyền</span>' : ''}
                </div>
                <div class="movie-buttons">
                    <button class="btn-play-movie" id="watchFirstEpisode">Xem phim</button>
                    <button class="btn-follow-movie ${isBookmarked ? 'active' : ''}" id="followMovie">
                        <i class="fa-solid fa-bookmark"></i>
                    </button>
                </div>
            </div>
            <div class="col-md-8">
                <h1 class="sub-main">${movie.name}</h1>
                <h3 class="name-sub">${movie.origin_name}</h3>
                <div class="mt-3 body-test-details" style="background-color: var(--dark-bg); padding: 15px; border-radius: 8px;">
                    <p><strong>Trạng thái:</strong> <span class="status-badge">${movie.episode_current}</span></p>
                    <p><strong>Năm phát hành:</strong> ${movie.year}</p>
                    <p><strong>Thời lượng:</strong> ${movie.time}</p>
                    <p><strong>Thể loại:</strong> ${movie.category.map(cat => cat.name).join(', ')}</p>
                    <p><strong>Quốc gia:</strong> ${movie.country.map(country => country.name).join(', ')}</p>
                    <p><strong>Đạo diễn:</strong> ${movie.director.join(', ')}</p>
                    <p><strong>Diễn viên:</strong> ${movie.actor.join(', ')}</p>
                    <p class="text-warning"><strong>Yêu thích:</strong> ${'★'.repeat(filledStars)}${halfStar ? '☆' : ''}${'☆'.repeat(emptyStars)} (${voteAverage}/10)</p>
                </div>
                <div class="mt-4">
                    <h4>Nội dung phim</h4>
                    <p class="movie-content" style="background-color: var(--dark-bg); padding: 15px; border-radius: 8px;">${movie.content}</p>
                </div>
            </div>
        </div>
    `;

    // Thêm sự kiện click cho nút "Xem phim"
    document.getElementById('watchFirstEpisode').addEventListener('click', () => {
        const slug = new URLSearchParams(window.location.search).get('slug');
        if (slug) {
            // Chuyển hướng đến trang xem phim với tập đầu tiên
            window.location.href = `watchMovie.html?slug=${slug}&ep=tap-01`;
        } else {
            console.error('Không có thông tin slug để mở trang xem phim.');
        }
    });
    
    // Thêm sự kiện click cho nút "Theo Dõi"/"Hủy theo dõi"
    document.getElementById('followMovie').addEventListener('click', () => {
        toggleFollowMovie(movie);
    });
}

// Hàm xử lý theo dõi/hủy theo dõi phim
function toggleFollowMovie(movie) {
    try {
        // Tạo đối tượng phim để lưu vào bookmark
        const movieData = {
            slug: movie.slug,
            name: movie.name,
            origin_name: movie.origin_name,
            poster_url: movie.poster_url,
            year: movie.year,
            episode_current: movie.episode_current,
            time: movie.time
        };
        
        // Lấy danh sách bookmark hiện tại
        let bookmarks = [];
        try {
            const storedBookmarks = localStorage.getItem('movieBookmarks');
            bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
            if (!Array.isArray(bookmarks)) bookmarks = [];
        } catch (e) {
            console.error('Error parsing bookmarks:', e);
            bookmarks = [];
        }
        
        const followButton = document.getElementById('followMovie');
        
        // Kiểm tra xem phim đã được bookmark chưa (dùng slug)
        const existingIndex = bookmarks.findIndex(m => m.slug === movie.slug);
        
        if (existingIndex !== -1) {
            // Nếu phim đã tồn tại, xóa khỏi danh sách
            bookmarks.splice(existingIndex, 1);
            followButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
            followButton.classList.remove('active');
            showNotification('Đã xóa phim khỏi danh sách yêu thích');
        } else {
            // Nếu phim chưa tồn tại, thêm vào danh sách
            bookmarks.push(movieData);
            followButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
            followButton.classList.add('active');
            showNotification('Đã thêm phim vào danh sách yêu thích');
        }
        
        // Lưu lại danh sách đã cập nhật
        localStorage.setItem('movieBookmarks', JSON.stringify(bookmarks, null, 0));
        
        // Cập nhật số lượng bookmark
        updateBookmarkCount();
    } catch (error) {
        console.error('Lỗi khi xử lý theo dõi phim:', error);
    }
}

// Hiển thị thông báo
function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <i class="fas fa-bookmark me-2"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.remove();
    }, 2500);
}

// Cập nhật số lượng bookmark
function updateBookmarkCount() {
    try {
        const bookmarks = JSON.parse(localStorage.getItem('movieBookmarks')) || [];
        const countElement = document.querySelector('.bookmark-count');
        if (countElement) {
            countElement.textContent = bookmarks.length;
            countElement.style.display = bookmarks.length > 0 ? 'inline-block' : 'none';
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng bookmark:', error);
    }
}

// Lấy slug từ URL và load thông tin phim
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    console.log(`Slug from URL: ${slug}`);

    if (slug) {
        fetchMovieDetails(slug);
    } else {
        document.getElementById('movieDetails').innerHTML = '<h2>Không tìm thấy phim</h2>';
    }

    // Cập nhật số lượng bookmark khi tải trang
    updateBookmarkCount();
});