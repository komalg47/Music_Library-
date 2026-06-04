const userId = localStorage.getItem("userId");
const token  = localStorage.getItem("token");
if (!token || !userId) { window.location.href = "login.html"; }

let allSongs      = [];
let myFavoriteIds = new Set(); // songIds already in favorites
let selectedSongId = null;

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "login.html";
}

function esc(str) {
  return String(str ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Load songs + user favorites in parallel ───────────────────────────────────
Promise.all([
  fetch("http://localhost:8082/songs").then(r => r.json()),
  fetch(`http://localhost:8081/favorites/user/${userId}`).then(r => r.json())
])
.then(([songs, favs]) => {
  allSongs = songs.sort((a, b) => a.songName.localeCompare(b.songName));
  myFavoriteIds = new Set(favs.map(f => f.songId));
  document.getElementById("totalCount").textContent = allSongs.length;
  displaySongs(allSongs);
})
.catch(() => toast.error("Could not load songs. Is the server running?"));

// ── Render song cards ─────────────────────────────────────────────────────────
function displaySongs(list) {
  const container = document.getElementById("songsContainer");
  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <i class="bi bi-music-note-beamed"></i>
          <h3>No songs found</h3>
          <p>Try a different search term</p>
        </div>
      </div>`;
    return;
  }
  container.innerHTML = list.map(song => {
    const isFav = myFavoriteIds.has(song.songId);
    const img = song.coverImage
      ? `<img src="asserts/images/${esc(song.coverImage)}" alt="${esc(song.songName)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <span class="song-cover-placeholder" style="display:none;"><i class="bi bi-music-note"></i></span>`
      : `<span class="song-cover-placeholder"><i class="bi bi-music-note"></i></span>`;

    return `
      <div class="col-lg-3 col-md-4 col-sm-6">
        <div class="song-card">
          <div class="song-cover-wrap">${img}</div>
          <div class="song-title">${esc(song.songName)}</div>
          <div class="song-artist"><i class="bi bi-person-fill"></i> ${esc(song.artist)}</div>
          <div class="song-album"><i class="bi bi-disc"></i> ${esc(song.album)}</div>
          <div class="song-actions">
            <button id="fav-btn-${song.songId}"
              class="mv-btn mv-btn-sm ${isFav ? "fav-btn-added" : "mv-btn-danger"}"
              onclick="addFavorite(${song.songId})"
              ${isFav ? "disabled title='Already in favorites'" : "title='Add to favorites'"}>
              <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>
              ${isFav ? "In Favorites" : "Add to Favorites"}
            </button>
            <button class="mv-btn mv-btn-primary mv-btn-sm" onclick="openPlaylistModal(${song.songId})">
              <i class="bi bi-plus-lg"></i> Add to Playlist
            </button>
          </div>
        </div>
      </div>`;
  }).join("");
}

// ── Search + autocomplete ─────────────────────────────────────────────────────
const searchInput     = document.getElementById("searchSong");
const suggestionsList = document.getElementById("searchSuggestions");

searchInput.addEventListener("input", function () {
  const q = this.value.toLowerCase().trim();
  const filtered = q
    ? allSongs.filter(s =>
        s.songName.toLowerCase().includes(q)      ||
        s.artist.toLowerCase().includes(q)         ||
        s.album.toLowerCase().includes(q)          ||
        (s.musicDirector && s.musicDirector.toLowerCase().includes(q)))
    : allSongs;
  displaySongs(filtered);

  if (q.length < 1) { suggestionsList.classList.remove("open"); return; }
  const suggestions = new Set();
  allSongs.forEach(s => {
    if (s.songName.toLowerCase().includes(q))     suggestions.add({ label: s.songName,      icon: "bi-music-note",    type: "Song" });
    if (s.artist.toLowerCase().includes(q))        suggestions.add({ label: s.artist,        icon: "bi-person-fill",   type: "Artist" });
    if (s.album.toLowerCase().includes(q))         suggestions.add({ label: s.album,         icon: "bi-disc",          type: "Album" });
    if (s.musicDirector && s.musicDirector.toLowerCase().includes(q))
                                                    suggestions.add({ label: s.musicDirector, icon: "bi-music-player",  type: "Director" });
  });
  const unique = [...new Map([...suggestions].map(s => [s.label, s])).values()].slice(0, 6);
  if (unique.length === 0) { suggestionsList.classList.remove("open"); return; }
  suggestionsList.innerHTML = unique.map(s =>
    `<div class="autocomplete-item" onclick="applySuggestion('${esc(s.label)}')">
       <i class="bi ${s.icon}"></i>
       <span>${esc(s.label)}</span>
       <span style="margin-left:auto;font-size:0.73rem;color:var(--text-muted);">${s.type}</span>
     </div>`
  ).join("");
  suggestionsList.classList.add("open");
});

function applySuggestion(val) {
  searchInput.value = val;
  suggestionsList.classList.remove("open");
  searchInput.dispatchEvent(new Event("input"));
}
document.addEventListener("click", e => {
  if (!searchInput.contains(e.target)) suggestionsList.classList.remove("open");
});

// ── Favorites ─────────────────────────────────────────────────────────────────
function addFavorite(songId) {
  fetch("http://localhost:8081/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId, userId: parseInt(userId) })
  })
  .then(r => {
    if (r.status === 409) {
      toast.warning("Already in your favorites!");
      return null;
    }
    if (!r.ok) throw new Error();
    return r.json();
  })
  .then(data => {
    if (!data) return;
    // Mark as favorited in the set + update button UI instantly
    myFavoriteIds.add(songId);
    const btn = document.getElementById(`fav-btn-${songId}`);
    if (btn) {
      btn.disabled = true;
      btn.title = "Already in favorites";
      btn.className = "mv-btn mv-btn-sm fav-btn-added";
      btn.innerHTML = `<i class="bi bi-heart-fill"></i> In Favorites`;
    }
    toast.success("Added to your favorites ❤️");
  })
  .catch(() => toast.error("Could not add to favorites."));
}

// ── Playlist modal ────────────────────────────────────────────────────────────
function openPlaylistModal(songId) {
  selectedSongId = songId;
  document.getElementById("playlistModalOverlay").classList.add("open");
  document.getElementById("newPlaylistName").value = "";

  fetch(`http://localhost:8081/playlists/user/${userId}`)
    .then(r => r.json())
    .then(playlists => {
      // Fetch all playlist-songs to know which playlists already have this song
      return fetch("http://localhost:8081/playlist-songs")
        .then(r => r.json())
        .then(psongs => ({ playlists, psongs }));
    })
    .then(({ playlists, psongs }) => {
      const list = document.getElementById("playlistList");
      if (playlists.length === 0) {
        list.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;padding:8px 0;">No playlists yet. Create one below.</p>`;
        return;
      }
      list.innerHTML = playlists.map(p => {
        const alreadyIn = psongs.some(i => i.songId === selectedSongId && i.playlist?.playlistId === p.playlistId);
        return `
          <button class="playlist-pick-btn ${alreadyIn ? "playlist-pick-btn--added" : ""}"
            onclick="saveSongToPlaylist(${selectedSongId},${p.playlistId})"
            ${alreadyIn ? "disabled" : ""}>
            <i class="bi ${alreadyIn ? "bi-check-circle-fill" : "bi-collection-play"}"></i>
            <span>${esc(p.playlistName)}</span>
            ${alreadyIn ? '<span class="pl-pick-tag">Added</span>' : ''}
          </button>`;
      }).join("");
    })
    .catch(() => toast.error("Could not load playlists."));
}

function closePlaylistModal() {
  document.getElementById("playlistModalOverlay").classList.remove("open");
}
document.getElementById("playlistModalOverlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) closePlaylistModal();
});

function saveSongToPlaylist(songId, playlistId) {
  fetch("http://localhost:8081/playlist-songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId, playlist: { playlistId } })
  })
  .then(r => r.json())
  .then(() => {
    toast.success("Song added to playlist 🎵");
    closePlaylistModal();
  })
  .catch(() => toast.error("Could not add song to playlist."));
}

function createPlaylistAndAddSong() {
  const name = document.getElementById("newPlaylistName").value.trim();
  if (!name) { toast.warning("Please enter a playlist name."); return; }
  fetch("http://localhost:8081/playlists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playlistName: name, user: { userId: parseInt(userId) } })
  })
  .then(r => r.json())
  .then(np => {
    document.getElementById("newPlaylistName").value = "";
    saveSongToPlaylist(selectedSongId, np.playlistId);
  })
  .catch(() => toast.error("Could not create playlist."));
}
