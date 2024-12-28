document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggle-btn");
    const navLinks = document.getElementById("nav-links");
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");
    const googleMap = document.getElementById("google-map");

    toggleBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
            const encodedQuery = encodeURIComponent(query);
            const mapUrl = `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodedQuery}`;
            googleMap.src = mapUrl;
        } else {
            alert("Please enter a search term.");
        }
    });
});

