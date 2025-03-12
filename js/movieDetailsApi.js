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
                <button class="btn-play-movie btn-primary mt-5  mb-5" id="watchFirstEpisode">Xem phim</button>
            </div>
            <div class="col-md-8">
                <h1 class="sub-main">${movie.name}</h1>
                <h3 class="name-sub">${movie.origin_name}</h3>
                <div class="mt-3 body-test-details">
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
                    <p class="movie-content">${movie.content}</p>
                </div>
            </div>
        </div>
    `;

    // Thêm sự kiện click cho nút "Xem phim"
    document.getElementById('watchFirstEpisode').addEventListener('click', () => {
        // Kiểm tra xem có dữ liệu episodes không
        if (window.episodesData && window.episodesData.length > 0) {
            // Lấy server đầu tiên
            const firstServer = window.episodesData[0];
            
            // Kiểm tra xem server có dữ liệu tập phim không
            if (firstServer.server_data && firstServer.server_data.length > 0) {
                // Lấy tập đầu tiên
                const firstEpisode = firstServer.server_data[0];
                console.log('Phát tập đầu tiên:', firstEpisode);
                
                // Mở video với link_embed và tên tập
                playEpisode(firstEpisode.link_embed, firstEpisode.filename);
            } else {
                console.error('Không có tập phim nào trong server.');
            }
        } else {
            console.error('Không có dữ liệu tập phim.');
        }
    });
}

// Thêm biến toàn cục để lưu dữ liệu episodes
window.episodesData = null;

function displayEpisodes(episodes) {
    // Lưu dữ liệu episodes vào biến toàn cục để sử dụng sau này
    window.episodesData = episodes;
    
    const episodeContainer = document.getElementById('episodeList');
    
    if (!episodes || episodes.length === 0) {
        episodeContainer.innerHTML = '';
        return;
    }

    let episodeHTML = `
        <div class="episode-section mt-5">
            <h3 class="mb-4">Danh sách tập phim</h3>
    `;

    episodes.forEach(server => {
        episodeHTML += `
            <div class="server-section mb-4">
                <h5 class="server-name mb-3">${server.server_name}</h5>
                <div class="episode-grid d-block">
        `;

        server.server_data.forEach(episode => {
            episodeHTML += `
                <button class="btn btn-outline-primary m-1" 
                        onclick="playEpisode('${episode.link_embed}', '${episode.filename}')">
                    ${episode.name}
                </button>
            `;
        });

        episodeHTML += `
                </div>
            </div>
        `;
    });

    episodeHTML += `</div>`;
    episodeContainer.innerHTML = episodeHTML;
}

function playEpisode(embedLink, filename) {
    // Xóa player cũ nếu có
    const existingPlayer = document.getElementById('videoPlayerContainer');
    if (existingPlayer) {
        existingPlayer.remove();
    }

    // Tạo container cho video player
    const playerContainer = document.createElement('div');
    playerContainer.id = 'videoPlayerContainer';
    playerContainer.className = 'video-player-container';
    playerContainer.innerHTML = `
        <div class="video-player-wrapper">
            <h4 class="mb-3">${filename}</h4>
            <div class="ratio ratio-16x9">
                <iframe src="${embedLink}"
                        allowfullscreen
                        frameborder="0">
                </iframe>
            </div>
        </div>
    `;

    // Chèn player vào vị trí đúng (sau phần thông tin phim)
    const movieDetails = document.getElementById('movieDetails');
    movieDetails.parentNode.insertBefore(playerContainer, movieDetails.nextSibling);

    // Scroll to player
    playerContainer.scrollIntoView({ behavior: 'smooth' });
}

// Cập nhật CSS
const style = document.createElement('style');
style.textContent = `

    /* Màu sắc cho nút tập phim */
    .episode-grid button {
        background-color: #ffffff26; /* Màu nền */
        color: white; /* Màu chữ */
        border: 1px solid transparent; /* Biên nút */
        border-radius: 5px; /* Bo góc */
        padding: 0.5rem 1rem; /* Padding */
        transition: background-color 0.3s, border-color 0.3s; /* Hiệu ứng chuyển màu */
    }

    /* Màu hover cho nút tập phim */
    .episode-grid button:hover {
        background-color: #0056b3; /* Màu nền khi hover */
        border-color: #004085; /* Màu biên khi hover */
    }

    @media (max-width: 768px) {
        .episode-grid {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        }
        
        .video-player-container {
            padding: 1rem;
        }
    }
`;
document.head.appendChild(style);

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
}); 