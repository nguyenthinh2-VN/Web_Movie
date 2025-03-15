// Biến toàn cục để lưu trữ dữ liệu phim và tập phim
let movieData = null;
let episodesData = null;
let currentEpisode = null;

// Hàm lấy danh sách bookmark từ localStorage (sử dụng movieBookmarks)
function getBookmarks() {
    const bookmarks = localStorage.getItem('movieBookmarks');
    return bookmarks ? JSON.parse(bookmarks) : [];
}

// Hàm cập nhật số lượng bookmark trong navbar
function updateBookmarkCount() {
    const bookmarks = getBookmarks();
    const bookmarkCountElement = document.querySelector('.bookmark-count');
    if (bookmarkCountElement) {
        bookmarkCountElement.textContent = bookmarks.length;
        bookmarkCountElement.style.display = bookmarks.length > 0 ? 'inline-block' : 'none';
    }
}

// Hàm khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    // Lấy thông tin từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const episodeSlug = urlParams.get('ep') || 'tap-01'; // Mặc định là tập 1
    
    // Cập nhật số lượng bookmark ngay khi trang tải
    updateBookmarkCount();

    if (slug) {
        // Lưu slug vào localStorage để sử dụng cho nút "Quay lại trang chi tiết"
        localStorage.setItem('lastMovieSlug', slug);
        
        // Tải thông tin phim
        fetchMovieData(slug, episodeSlug);
    } else {
        showError('Không tìm thấy thông tin phim');
    }
    
    // Thiết lập sự kiện cho nút "Quay lại trang chi tiết"
    document.getElementById('backToDetails').addEventListener('click', (e) => {
        e.preventDefault();
        const movieSlug = localStorage.getItem('lastMovieSlug');
        if (movieSlug) {
            window.location.href = `movieDetails.html?slug=${movieSlug}`;
        } else {
            window.location.href = 'index.html';
        }
    });
});

// Hàm tải dữ liệu phim từ API
async function fetchMovieData(slug, episodeSlug) {
    try {
        const response = await fetch(`https://phimapi.com/phim/${slug}`);
        const data = await response.json();
        
        if (data.status === true) {
            // Lưu dữ liệu vào biến toàn cục
            movieData = data.movie;
            episodesData = data.episodes;
            
            // Hiển thị thông tin phim
            displayMovieInfo(movieData);
            
            // Hiển thị danh sách tập phim
            displayEpisodeList(episodesData);
            
            // Phát tập phim được chọn
            playEpisode(episodeSlug);
        } else {
            showError('Không thể tải thông tin phim: ' + data.msg);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        showError('Đã xảy ra lỗi khi tải dữ liệu phim');
    }
}

// Hiển thị thông tin phim
function displayMovieInfo(movie) {
    const movieInfoContainer = document.getElementById('movieInfo');
    
    movieInfoContainer.innerHTML = `
        <h1 class="mb-3 name-main">${movie.name}</h1>
        <h3 class="mb-5 name-sub">${movie.origin_name}</h3>
    `;
    
    // Cập nhật tiêu đề trang
    document.title = `Xem phim ${movie.name} - Yuki Movie`;
}

// Hiển thị danh sách tập phim
function displayEpisodeList(episodes) {
    const episodeListContainer = document.getElementById('episodeList');
    
    if (!episodes || episodes.length === 0) {
        episodeListContainer.innerHTML = '<p>Không có tập phim nào</p>';
        return;
    }
    
    let episodeHTML = '';
    
    episodes.forEach(server => {
        episodeHTML += `
            <div class="server-section mb-4">
                <h5 class="server-name">${server.server_name}</h5>
                <div class="episode-grid">
        `;
        
        server.server_data.forEach(episode => {
            episodeHTML += `
                <button class="episode-button" 
                        data-link="${episode.link_embed}" 
                        data-name="${episode.filename}"
                        data-slug="${episode.slug}"
                        onclick="changeEpisode(this)">
                    ${episode.name}
                </button>
            `;
        });
        
        episodeHTML += `
                </div>
            </div>
        `;
    });
    
    episodeListContainer.innerHTML = episodeHTML;
}

// Phát tập phim
function playEpisode(episodeSlug) {
    // Tìm tập phim theo slug
    let foundEpisode = null;
    
    if (episodesData) {
        for (const server of episodesData) {
            for (const episode of server.server_data) {
                if (episode.slug === episodeSlug) {
                    foundEpisode = episode;
                    break;
                }
            }
            if (foundEpisode) break;
        }
    }
    
    // Nếu không tìm thấy tập theo slug, lấy tập đầu tiên
    if (!foundEpisode && episodesData && episodesData.length > 0 && 
        episodesData[0].server_data && episodesData[0].server_data.length > 0) {
        foundEpisode = episodesData[0].server_data[0];
    }
    
    if (foundEpisode) {
        currentEpisode = foundEpisode;
        
        // Cập nhật tiêu đề tập phim
        document.getElementById('episodeTitle').textContent = foundEpisode.filename;
        
        // Cập nhật player
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.innerHTML = `
            <iframe 
                src="${foundEpisode.link_embed}" 
                allowfullscreen 
                frameborder="0">
            </iframe>
        `;
        
        // Đánh dấu tập đang xem
        highlightCurrentEpisode(foundEpisode.slug);
        
        // Cập nhật URL để có thể chia sẻ hoặc làm mới trang
        const movieSlug = localStorage.getItem('lastMovieSlug');
        if (movieSlug) {
            const newUrl = `watchMovie.html?slug=${movieSlug}&ep=${foundEpisode.slug}`;
            history.pushState({}, '', newUrl);
        }
    } else {
        showError('Không tìm thấy tập phim');
    }
}

// Đánh dấu tập phim đang xem
function highlightCurrentEpisode(episodeSlug) {
    // Xóa trạng thái active của tất cả các nút
    document.querySelectorAll('.episode-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Thêm trạng thái active cho nút tập phim đang xem
    document.querySelectorAll(`.episode-button[data-slug="${episodeSlug}"]`).forEach(button => {
        button.classList.add('active');
    });
}

// Thay đổi tập phim khi nhấn vào nút tập
function changeEpisode(button) {
    const link = button.getAttribute('data-link');
    const name = button.getAttribute('data-name');
    const slug = button.getAttribute('data-slug');
    
    // Cập nhật tiêu đề tập phim
    document.getElementById('episodeTitle').textContent = name;
    
    // Cập nhật player
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.innerHTML = `
        <iframe 
            src="${link}" 
            allowfullscreen 
            frameborder="0">
        </iframe>
    `;
    
    // Đánh dấu tập đang xem
    highlightCurrentEpisode(slug);
    
    // Cập nhật URL
    const movieSlug = localStorage.getItem('lastMovieSlug');
    if (movieSlug) {
        const newUrl = `watchMovie.html?slug=${movieSlug}&ep=${slug}`;
        history.pushState({}, '', newUrl);
    }
    
    // Cuộn lên đầu player
    document.querySelector('.video-container').scrollIntoView({ behavior: 'smooth' });
}

// Hiển thị lỗi
function showError(message) {
    const movieInfoContainer = document.getElementById('movieInfo');
    movieInfoContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;
    
    document.getElementById('episodeTitle').textContent = 'Lỗi';
    document.getElementById('videoPlayer').innerHTML = '';
    document.getElementById('episodeList').innerHTML = '';
}