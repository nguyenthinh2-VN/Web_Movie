let currentPage = 1;

// Hàm cập nhật trạng thái icon bookmark
function updateBookmarkIcons() {
    const bookmarks = JSON.parse(localStorage.getItem("movieBookmarks")) || [];
    document.querySelectorAll(".movie-card").forEach((card) => {
        const movieSlug = card.getAttribute("data-slug"); // Lấy slug từ data-slug
        const bookmarkIcon = card.querySelector(".bookmark-badge");
        if (bookmarks.some((m) => m.slug === movieSlug)) {
            bookmarkIcon.classList.add("active");
        } else {
            bookmarkIcon.classList.remove("active");
        }
    });
}

// Hàm lấy danh sách phim hoạt hình
async function fetchAnimatedMovies() {
    try {
        const response = await fetch("https://phimapi.com/v1/api/danh-sach/hoat-hinh");
        const data = await response.json();

        if (data.status === "success") {
            displayAnimatedMovies(data.data.items);
        } else {
            console.error("Lỗi:", data.msg);
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu phim hoạt hình:", error);
    }
}

// Hiển thị phim hoạt hình
function displayAnimatedMovies(movies) {
    const movieContainer = document.getElementById("recommendedMovies");
    movieContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();

    movies.slice(0, 8).forEach((movie) => {
        const movieDiv = document.createElement("div");
        movieDiv.className = "col-lg-3 col-md-4 col-sm-6 col-12 my-3 w-100";
        movieDiv.onclick = () => (location.href = `./movieDetails.html?slug=${movie.slug}`);

        movieDiv.innerHTML = `
            <div class="card movie-card" data-slug="${movie.slug}">
                <div class="card-poster">
                    <img src="https://phimimg.com/${movie.poster_url}" 
                        class="card-img-top" 
                        alt="${movie.name}"
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    <div class="card-overlay" onclick="location.href='./movieDetails.html?slug=${movie.slug}'">
                        <div class="overlay-content">
                            <span class="btn-play">
                                <i class="fas fa-play-circle fa-3x"></i>
                            </span>
                        </div>
                    </div>
                    ${
                        movie.episode_current
                            ? `<div class="episode-badge">${movie.episode_current}</div>`
                            : ""
                    }
                    <div class="bookmark-badge" onclick="event.stopPropagation(); toggleBookmark(this.closest('.movie-card'));">
                        <i class="fas fa-bookmark"></i>
                    </div>
                </div>
                <div class="card-body" onclick="location.href='./movieDetails.html?slug=${movie.slug}'">
                    <h5 class="card-title" title="${movie.name}">${movie.name}</h5>
                    <p class="card-text" title="${movie.origin_name}">${movie.origin_name}</p>
                    <p class="card-text">
                        <small class="text">Năm: ${movie.year}</small>
                        <small class="text ms-2">
                            ${
                                movie.type === "series"
                                    ? `Tập: ${movie.episode_current}`
                                    : `Thời lượng: ${movie.time}`
                            }
                        </small>
                    </p>
                </div>
            </div>
        `;

        fragment.appendChild(movieDiv);
    });

    movieContainer.appendChild(fragment);
    updateBookmarkIcons(); // Cập nhật trạng thái bookmark
    updateBookmarkCount(); // Cập nhật số lượng bookmark
}

// Hàm lấy danh sách phim mới
async function fetchMovies(page) {
    try {
        const response = await fetch(`https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${page}`);
        const data = await response.json();

        if (data.status === true) {
            displayNewMovies(data.items);
            const totalPages = data.pagination.totalPages;
            updatePagination(page, totalPages);
        } else {
            console.error("Lỗi:", data.msg);
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu phim mới:", error);
    }
}

// Hiển thị phim mới
function displayNewMovies(movies) {
    const movieContainer = document.getElementById("newMovies");
    movieContainer.innerHTML = "";

    console.log("Dữ liệu phim mới:", movies);

    const fragment = document.createDocumentFragment();

    movies.forEach((movie) => {
        const movieDiv = document.createElement("div");
        movieDiv.className = "col-lg-3 col-md-4 col-sm-6 col-12 my-3 w-100";
        movieDiv.onclick = () => (location.href = `./movieDetails.html?slug=${movie.slug}`);

        const episodeCurrent = movie.episode_current || movie.current_episode || movie.episode || null;

        movieDiv.innerHTML = `
            <div class="card movie-card" data-slug="${movie.slug}">
                <div class="card-poster">
                    <img src="${movie.poster_url}" 
                         class="card-img-top" 
                         alt="${movie.name}"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    <div class="card-overlay" onclick="location.href='./movieDetails.html?slug=${movie.slug}'">
                        <div class="overlay-content">
                            <span class="btn-play">
                                <i class="fas fa-play-circle fa-3x"></i>
                            </span>
                        </div>
                    </div>
                    ${
                        episodeCurrent
                            ? `<div class="episode-badge">${episodeCurrent}</div>`
                            : ""
                    }
                    <div class="bookmark-badge" onclick="event.stopPropagation(); toggleBookmark(this.closest('.movie-card'));">
                        <i class="fas fa-bookmark"></i>
                    </div>
                </div>
                <div class="card-body" onclick="location.href='./movieDetails.html?slug=${movie.slug}'">
                    <h5 class="card-title" title="${movie.name}">${movie.name}</h5>
                    <p class="card-text" title="${movie.origin_name}">${movie.origin_name}</p>
                    <p class="card-text">
                        <small class="text">Năm: ${movie.year}</small>
                        <small class="text ms-2">
                            ${
                                movie.type === "series"
                                    ? `Tập: ${episodeCurrent || "N/A"}`
                                    : movie.time
                                    ? `Thời lượng: ${movie.time}`
                                    : ""
                            }
                        </small>
                    </p>
                </div>
            </div>
        `;

        fragment.appendChild(movieDiv);
    });

    movieContainer.appendChild(fragment);
    updateBookmarkIcons(); // Cập nhật trạng thái bookmark
    updateBookmarkCount(); // Cập nhật số lượng bookmark
}

function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById("pagination");
    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");

    const oldPageButtons = pagination.querySelectorAll("li:not(:first-child):not(:last-child)");
    oldPageButtons.forEach((button) => button.remove());

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(startPage + 2, totalPages);

    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }

    const nextPageItem = pagination.querySelector("li:last-child");

    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement("li");
        li.className = "page-item";
        if (i === parseInt(currentPage)) {
            li.classList.add("active");
        }

        const a = document.createElement("a");
        a.className = "page-link";
        a.href = "#";
        a.setAttribute("data-page", i);
        a.textContent = i;

        li.appendChild(a);
        pagination.insertBefore(li, nextPageItem);
    }

    prevButton.parentElement.classList.toggle("disabled", currentPage === 1);
    nextButton.parentElement.classList.toggle("disabled", currentPage === totalPages);
}

// Khởi tạo khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
    fetchAnimatedMovies();
    fetchMovies(1);

    const pagination = document.getElementById("pagination");

    pagination.addEventListener("click", async (e) => {
        e.preventDefault();
        const pageLink = e.target.closest(".page-link");
        if (!pageLink) return;

        let newPage = currentPage;

        if (pageLink.id === "prevPage" && currentPage > 1) {
            newPage = currentPage - 1;
        } else if (pageLink.id === "nextPage") {
            newPage = currentPage + 1;
        } else {
            const page = pageLink.getAttribute("data-page");
            if (page) {
                newPage = parseInt(page);
            }
        }

        if (newPage !== currentPage) {
            currentPage = newPage;
            const pageItems = pagination.querySelectorAll(".page-item");
            pageItems.forEach((item) => {
                const pageNum = item.querySelector(".page-link")?.getAttribute("data-page");
                if (pageNum === currentPage.toString()) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });

            await fetchMovies(currentPage);

            // Cuộn đến tiêu đề "Phim Hoạt Hình" hoặc vị trí mặc định
            const pageTitle = document.querySelector(".page-title");
            if (pageTitle) {
                pageTitle.scrollIntoView({ behavior: "smooth" });
            } else {
                window.scrollTo({
                    top: 1670,
                    behavior: "smooth",
                });
            }
        }
    });

    // Cập nhật trạng thái bookmark và số lượng bookmark khi trang tải
    updateBookmarkIcons();
    updateBookmarkCount();
});

// Hàm toggleBookmark để thêm hoặc xóa bookmark
function toggleBookmark(movieCard) {
    if (!movieCard) return;

    try {
        const bookmarkIcon = movieCard.querySelector(".bookmark-badge");
        bookmarkIcon.classList.add("clicked");

        setTimeout(() => {
            bookmarkIcon.classList.remove("clicked");
        }, 500);

        const movie = {
            id: movieCard.dataset.id || null,
            name: movieCard.querySelector(".card-title").textContent.trim(),
            origin_name: movieCard.querySelector(".card-text[title]").getAttribute("title").trim(),
            poster_url: movieCard.querySelector(".card-img-top").src,
            year: movieCard.querySelector(".text").textContent.replace("Năm: ", "").trim(),
            episode_current: movieCard.querySelector(".episode-badge")?.textContent || null,
            slug: movieCard.getAttribute("data-slug"), // Lấy slug từ data-slug
        };

        let bookmarks = [];
        const storedBookmarks = localStorage.getItem("movieBookmarks");
        if (storedBookmarks) {
            try {
                bookmarks = JSON.parse(storedBookmarks);
                if (!Array.isArray(bookmarks)) {
                    bookmarks = [bookmarks];
                }
            } catch (parseError) {
                console.error("Lỗi khi parse movieBookmarks:", parseError);
                bookmarks = [];
            }
        }

        const existingIndex = bookmarks.findIndex((m) => m.slug === movie.slug);

        if (existingIndex !== -1) {
            bookmarks.splice(existingIndex, 1);
            bookmarkIcon.classList.remove("active");
            showNotification("Đã xóa phim khỏi danh sách yêu thích");
        } else {
            bookmarks.push(movie);
            bookmarkIcon.classList.add("active");
            showNotification("Đã thêm phim vào danh sách yêu thích");
        }

        localStorage.setItem("movieBookmarks", JSON.stringify(bookmarks, null, 0));
        updateBookmarkCount();

        console.log("Danh sách bookmark sau khi cập nhật:", bookmarks);
    } catch (error) {
        console.error("Lỗi khi xử lý bookmark:", error);
    }
}

// Cập nhật số lượng bookmark trên navbar
function updateBookmarkCount() {
    try {
        let bookmarks = [];
        const storedBookmarks = localStorage.getItem("movieBookmarks");
        if (storedBookmarks) {
            try {
                bookmarks = JSON.parse(storedBookmarks);
                if (!Array.isArray(bookmarks)) {
                    bookmarks = [bookmarks];
                }
            } catch (parseError) {
                console.error("Lỗi khi parse movieBookmarks trong updateBookmarkCount:", parseError);
                bookmarks = [];
                localStorage.removeItem("movieBookmarks"); // Xóa dữ liệu lỗi
            }
        }

        const countElement = document.querySelector(".bookmark-count");
        if (countElement) {
            countElement.textContent = bookmarks.length;
            countElement.style.display = bookmarks.length > 0 ? "inline-block" : "none";
            console.log("Số lượng bookmark:", bookmarks.length); // Gỡ lỗi
        } else {
            console.error("Không tìm thấy phần tử .bookmark-count trong DOM");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật số lượng bookmark:", error);
    }
}

// Hiển thị thông báo
function showNotification(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerHTML = `
        <i class="fas fa-bookmark me-2"></i>
        ${message}
    `;
    document.body.appendChild(toast);
    toast.style.display = "block";
    setTimeout(() => toast.remove(), 2500);
}