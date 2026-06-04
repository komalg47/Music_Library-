/**
 * favorites.js — MusicVerse Favorites Page
 */

// ── Auth Guard ────────────────────────────────────────────────────────────────
const userId = localStorage.getItem("userId");
const token  = localStorage.getItem("token");

if (!token || !userId) {
    window.location.href = "login.html";
}

// ── Logout ────────────────────────────────────────────────────────────────────
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    window.location.href = "login.html";
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadFavorites();

// ── Load Favorites ────────────────────────────────────────────────────────────
function loadFavorites() {
    Promise.all([
        fetch(`http://localhost:8081/favorites/user/${userId}`).then(res => res.json()),
        fetch("http://localhost:8082/songs").then(res => res.json())
    ])
        .then(([favorites, songs]) => renderFavorites(favorites, songs))
        .catch(() => toast.error("Could not load favorites."));
}

function renderFavorites(favorites, songs) {
    const container = document.getElementById("favoritesGrid");

    // Filter out any favorites whose song no longer exists
    const validFavorites = favorites.filter(fav => songs.some(s => s.songId === fav.songId));

    if (!validFavorites.length) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <i class="bi bi-heart"></i>
                <h3>No favorites yet</h3>
                <p>Heart songs on the Songs page to add them here.</p>
                <a href="songs.html" class="mv-btn mv-btn-primary" style="margin-top:16px; text-decoration:none;">
                    <i class="bi bi-music-note-list"></i> Browse Songs
                </a>
            </div>`;
        return;
    }

    container.innerHTML = validFavorites.map(favorite => {
        const song = songs.find(s => s.songId === favorite.songId);
        if (!song) return "";

        const imgSrc = song.coverImage
            ? `asserts/images/${song.coverImage}`
            : null;

        const coverHtml = imgSrc
            ? `<img src="${imgSrc}" class="fav-cover-img" alt="${escapeHtml(song.songName)}"
                   onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : "";
        const placeholderStyle = imgSrc ? "display:none;" : "";

        return `
        <div class="fav-card">
            <div class="fav-cover-wrap">
                ${coverHtml}
                <div class="fav-cover-placeholder" style="${placeholderStyle}">🎵</div>
            </div>
            <div class="fav-body">
                <div class="fav-name">${escapeHtml(song.songName)}</div>
                <div class="fav-artist"><i class="bi bi-person-fill"></i> ${escapeHtml(song.artist || '—')}</div>
                <div class="fav-album"><i class="bi bi-disc"></i> ${escapeHtml(song.album || '—')}</div>
                <button class="fav-remove" onclick="removeFavorite(${favorite.id})">
                    <i class="bi bi-heart-slash"></i> Remove from Favorites
                </button>
            </div>
        </div>`;
    }).join("");
}

// ── Remove Favorite ───────────────────────────────────────────────────────────
function removeFavorite(id) {
    fetch(`http://localhost:8081/favorites/${id}`, { method: "DELETE" })
        .then(() => {
            toast.success("Removed from favorites.");
            loadFavorites();
        })
        .catch(() => toast.error("Could not remove favorite."));
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
