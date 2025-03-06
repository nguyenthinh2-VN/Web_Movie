// pageLoadEffects.js

// Hàm để ẩn loader sau một khoảng thời gian
function hideLoader() {
    const loading = document.getElementById("loading");
    if (loading) {
        setTimeout(function () {
            loading.style.display = "none";

            // Thêm lớp 'visible' để kích hoạt hiệu ứng cho các phần tử
            const elements = document.querySelectorAll(".animate-me");
            elements.forEach((element) => {
                element.classList.add("visible");
            });
        }, 2000); // Thay đổi thời gian nếu cần
    }
}

// Hàm để xử lý hiệu ứng navbar khi cuộn
function handleNavbarScroll() {
    window.addEventListener("scroll", function () {
        const navbar = document.querySelector(".navbar");
        if (window.scrollY > 100) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

// Gọi các hàm khi DOM đã được tải
document.addEventListener("DOMContentLoaded", function () {
    hideLoader();
    handleNavbarScroll();
});