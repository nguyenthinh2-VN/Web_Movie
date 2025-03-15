// Load bookmarks when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadBookmarks();
  updateBookmarkCount();
});

// Function to load and display bookmarks
function loadBookmarks() {
  const bookmarksContainer = document.getElementById("bookmarks-container");
  const noBookmarksMessage = document.getElementById("no-bookmarks");

  // Lấy danh sách bookmark từ localStorage
  let bookmarks = [];
  const storedBookmarks = localStorage.getItem("movieBookmarks");
  if (storedBookmarks) {
    try {
      bookmarks = JSON.parse(storedBookmarks);
      if (!Array.isArray(bookmarks)) {
        bookmarks = [bookmarks];
      }
    } catch (parseError) {
      console.error(
        "Lỗi khi parse movieBookmarks trong loadBookmarks:",
        parseError
      );
      bookmarks = [];
    }
  }

  if (bookmarks.length === 0) {
    bookmarksContainer.innerHTML = "";
    noBookmarksMessage.classList.remove("d-none");
    return;
  }

  noBookmarksMessage.classList.add("d-none");

  bookmarksContainer.innerHTML = bookmarks
    .map((movie) => {
      // Chuẩn hóa poster_url
      let posterUrl = movie.poster_url || "";
      if (posterUrl && !posterUrl.startsWith("http")) {
        posterUrl = `https://phimimg.com/${posterUrl.startsWith("/") ? posterUrl.substring(1) : posterUrl}`;
      } else if (!posterUrl) {
        posterUrl = "https://via.placeholder.com/300x450?text=No+Image";
      }

      return `
        <div class="col-lg-3 col-md-4 col-sm-6 col-12 my-3">
          <div class="movie-card" data-slug="${movie.slug}">
            <div class="card-poster">
              <img src="${posterUrl}" 
                   class="card-img-top" 
                   alt="${movie.name || "No Name"}"
                   loading="lazy"
                   onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'; this.onerror=null;">
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
              <div class="bookmark-badge" onclick="event.stopPropagation(); removeBookmark('${movie.slug}', this);">
                <i class="fas fa-times"></i>
              </div>
            </div>
            <div class="card-body" onclick="location.href='./movieDetails.html?slug=${movie.slug}'">
              <h5 class="card-title" title="${movie.name || "No Name"}">${movie.name || "No Name"}</h5>
              <p class="card-text" title="${movie.origin_name || "No Origin Name"}">${movie.origin_name || "No Origin Name"}</p>
              <p class="card-text">
                <small class="text">Năm: ${movie.year || "N/A"}</small>
              </p>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Function to remove bookmark
function removeBookmark(movieSlug, element) {
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
        console.error(
          "Lỗi khi parse movieBookmarks trong removeBookmark:",
          parseError
        );
        bookmarks = [];
      }
    }

    // Xóa phim dựa trên slug
    bookmarks = bookmarks.filter((movie) => movie.slug !== movieSlug);
    localStorage.setItem("movieBookmarks", JSON.stringify(bookmarks, null, 0));

    const movieCard = element.closest(".movie-card");
    if (movieCard) {
      movieCard.parentElement.remove(); // Xóa cả div cha (col-*)
    }

    if (bookmarks.length === 0) {
      document.getElementById("no-bookmarks").classList.remove("d-none");
    }

    updateBookmarkCount();
    showNotification("Đã xóa phim khỏi danh sách yêu thích");
  } catch (error) {
    console.error("Lỗi khi xóa bookmark:", error);
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

// Cập nhật số lượng bookmark
function updateBookmarkCount() {
  try {
    const bookmarks = JSON.parse(localStorage.getItem("movieBookmarks")) || [];
    const countElement = document.querySelector(".bookmark-count");
    if (countElement) {
      const newCount = bookmarks.length;
      countElement.textContent = newCount;
      countElement.style.display = newCount > 0 ? "inline-block" : "none";
      // Thêm kiểm tra để tránh lỗi hiển thị
      if (isNaN(newCount) || newCount < 0) {
        countElement.textContent = "0";
        countElement.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng bookmark:", error);
    const countElement = document.querySelector(".bookmark-count");
    if (countElement) {
      countElement.textContent = "0";
      countElement.style.display = "none";
    }
  }
}