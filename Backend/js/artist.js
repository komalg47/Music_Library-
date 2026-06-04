const token = localStorage.getItem("token");
if (!token) { window.location.href = "login.html"; }

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "login.html";
}

let allArtists = [];
let allSongs   = [];

Promise.all([
  fetch("http://localhost:8082/artists").then(r => r.json()),
  fetch("http://localhost:8082/songs").then(r => r.json())
])
.then(([artists, songs]) => {
  allSongs = songs;

  if (artists.length > 0) {
    // Use artists table — match songs by artist name field (case-insensitive)
    allArtists = artists.sort((a, b) => a.artistName.localeCompare(b.artistName));
  } else {
    // Fallback: derive artists from songs' artist field
    const nameSet = new Set();
    allArtists = songs
      .map(s => s.artist?.trim())
      .filter(name => name && !nameSet.has(name.toLowerCase()) && nameSet.add(name.toLowerCase()))
      .sort()
      .map((name, i) => ({ artistId: `derived-${i}`, artistName: name }));
  }

  renderArtists(allArtists);
  document.getElementById("artistPageCount").textContent =
    `${allArtists.length} artist${allArtists.length !== 1 ? "s" : ""}`;
})
.catch(() => toast.error("Could not load artists."));

function esc(str) {
  return String(str ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function renderArtists(list) {
  const grid = document.getElementById("artistGrid");
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-person-x"></i>
        <h3>No artists found</h3>
        <p>Add artists and songs from the admin panel.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(a => {
    const songs = allSongs.filter(s =>
      (s.artist || "").trim().toLowerCase() === a.artistName.trim().toLowerCase()
    );

    const songsHtml = songs.length > 0
      ? songs.map(s => `
          <div class="artist-song-item">
            <i class="bi bi-music-note"></i>
            <span>${esc(s.songName)}</span>
            <span style="margin-left:auto;font-size:0.78rem;color:var(--text-muted);">${esc(s.album)}</span>
          </div>`).join("")
      : `<div class="no-songs"><i class="bi bi-info-circle"></i> No songs added yet</div>`;

    return `
      <div class="artist-card">
        <div class="artist-header" onclick="toggleArtist('${a.artistId}')">
          <div class="artist-header-left">
            <div class="artist-big-avatar">${a.artistName.charAt(0).toUpperCase()}</div>
            <div>
              <div class="artist-name">${esc(a.artistName)}</div>
              <div class="artist-meta">${songs.length} song${songs.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <i class="bi bi-chevron-down artist-chevron" id="chevron-${a.artistId}"></i>
        </div>
        <div class="artist-songs" id="songs-${a.artistId}">${songsHtml}</div>
      </div>`;
  }).join("");
}

function toggleArtist(id) {
  const panel   = document.getElementById(`songs-${id}`);
  const chevron = document.getElementById(`chevron-${id}`);
  if (!panel) return;
  const isOpen = panel.classList.contains("open");
  panel.classList.toggle("open",   !isOpen);
  chevron.classList.toggle("open", !isOpen);
}

document.getElementById("searchArtist").addEventListener("input", function () {
  const q = this.value.toLowerCase().trim();
  renderArtists(q
    ? allArtists.filter(a => a.artistName.toLowerCase().includes(q))
    : allArtists
  );
});
