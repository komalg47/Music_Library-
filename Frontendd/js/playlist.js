const userId = localStorage.getItem("userId");
const token  = localStorage.getItem("token");
if (!token || !userId) { window.location.href = "login.html"; }

const API_URL = "http://localhost:8081/playlists";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "login.html";
}

function esc(str) {
  return String(str ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ─────────────────────────────────────────────────────────────────────────────
// Player State
// ─────────────────────────────────────────────────────────────────────────────
const player = {
  queue:          [],     // array of song objects for the active playlist
  currentIndex:   -1,     // index in queue
  isPlaying:      false,
  isShuffle:      false,
  repeatMode:     "none", // "none" | "all" | "one"
  playlistId:     null,
  playlistName:   "",
  timer:          null,   // simulated auto-advance timer
};

// ── Play a specific song by queue index ──────────────────────────────────────
function playSongAt(index) {
  if (player.queue.length === 0) return;

  // Clamp
  index = ((index % player.queue.length) + player.queue.length) % player.queue.length;
  player.currentIndex = index;
  player.isPlaying    = true;

  const song = player.queue[index];

  // Update mini player UI
  updateMiniPlayer(song);

  // Update all song rows in the active playlist
  refreshSongRows();

  // Simulate song duration (10 seconds for demo, then auto-advance)
  clearTimeout(player.timer);
  player.timer = setTimeout(() => {
    if (player.isPlaying) autoAdvance();
  }, 10000);
}

function autoAdvance() {
  if (player.repeatMode === "one") {
    playSongAt(player.currentIndex);
    return;
  }
  if (player.isShuffle) {
    let next;
    do { next = Math.floor(Math.random() * player.queue.length); }
    while (player.queue.length > 1 && next === player.currentIndex);
    playSongAt(next);
    return;
  }
  const next = player.currentIndex + 1;
  if (next >= player.queue.length) {
    if (player.repeatMode === "all") {
      playSongAt(0);
    } else {
      stopPlayer();
    }
  } else {
    playSongAt(next);
  }
}

// ── Controls ─────────────────────────────────────────────────────────────────
function togglePlayPause() {
  if (player.queue.length === 0) return;
  if (player.currentIndex === -1)  { playSongAt(0); return; }

  player.isPlaying = !player.isPlaying;

  if (player.isPlaying) {
    // Resume — restart auto-advance timer
    player.timer = setTimeout(() => { if (player.isPlaying) autoAdvance(); }, 10000);
  } else {
    clearTimeout(player.timer);
  }

  updatePlayPauseIcon();
  refreshSongRows();
}

function playNext() {
  if (player.queue.length === 0) return;
  if (player.isShuffle) {
    let next;
    do { next = Math.floor(Math.random() * player.queue.length); }
    while (player.queue.length > 1 && next === player.currentIndex);
    playSongAt(next);
  } else {
    playSongAt(player.currentIndex + 1);
  }
}

function playPrev() {
  if (player.queue.length === 0) return;
  playSongAt(player.currentIndex - 1);
}

function stopPlayer() {
  clearTimeout(player.timer);
  player.isPlaying    = false;
  player.currentIndex = -1;

  updatePlayPauseIcon();

  // Hide mini player after a short delay
  setTimeout(() => {
    if (!player.isPlaying) document.getElementById("miniPlayer").classList.remove("visible");
  }, 200);

  refreshSongRows();
}

function toggleShuffle() {
  player.isShuffle = !player.isShuffle;
  document.getElementById("miniShuffle").classList.toggle("active", player.isShuffle);

  // Also sync the per-playlist shuffle button if visible
  if (player.playlistId) {
    const btn = document.getElementById(`shuffle-btn-${player.playlistId}`);
    if (btn) btn.classList.toggle("active", player.isShuffle);
  }

  toast.info(player.isShuffle ? "Shuffle on" : "Shuffle off");
}

function toggleRepeat() {
  const modes = ["none", "all", "one"];
  const next  = modes[(modes.indexOf(player.repeatMode) + 1) % modes.length];
  player.repeatMode = next;

  const btn  = document.getElementById("miniRepeat");
  const icon = btn.querySelector("i");

  if (next === "none") {
    btn.classList.remove("active");
    icon.className = "bi bi-repeat";
    toast.info("Repeat off");
  } else if (next === "all") {
    btn.classList.add("active");
    icon.className = "bi bi-repeat";
    toast.info("Repeat all");
  } else {
    btn.classList.add("active");
    icon.className = "bi bi-repeat-1";
    toast.info("Repeat one");
  }
}

// ── Start playlist (Play All) ────────────────────────────────────────────────
function playPlaylist(playlistId, playlistName, songs) {
  if (songs.length === 0) { toast.warning("This playlist has no songs yet."); return; }

  player.queue       = player.isShuffle ? shuffleArray([...songs]) : [...songs];
  player.playlistId  = playlistId;
  player.playlistName = playlistName;
  player.currentIndex = -1;

  playSongAt(0);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Play single song from row click ─────────────────────────────────────────
function playSongDirect(song, playlistId, playlistName, allSongs) {
  if (player.playlistId !== playlistId) {
    // Switch to this playlist's queue
    player.queue        = [...allSongs];
    player.playlistId   = playlistId;
    player.playlistName = playlistName;
  }
  const idx = player.queue.findIndex(s => s.songId === song.songId);
  playSongAt(idx !== -1 ? idx : 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// UI Update Helpers
// ─────────────────────────────────────────────────────────────────────────────
function updateMiniPlayer(song) {
  document.getElementById("miniSongName").textContent   = song.songName   || "—";
  document.getElementById("miniSongArtist").textContent = song.artist     || "—";
  document.getElementById("miniPlaylistName").textContent = player.playlistName || "—";

  // Cover image
  const coverEl = document.getElementById("miniCover");
  if (song.coverImage) {
    coverEl.innerHTML = `<img src="asserts/images/${esc(song.coverImage)}" alt="${esc(song.songName)}" onerror="this.parentElement.innerHTML='<i class=\\'bi bi-music-note\\'></i>'">`;
  } else {
    coverEl.innerHTML = `<i class="bi bi-music-note"></i>`;
  }

  updatePlayPauseIcon();
  document.getElementById("miniPlayer").classList.add("visible");
}

function updatePlayPauseIcon() {
  const icon = document.getElementById("miniPlayIcon");
  if (icon) {
    icon.className = player.isPlaying ? "bi bi-pause-fill" : "bi bi-play-fill";
  }
}

function refreshSongRows() {
  // Update the playing highlight on all song rows
  document.querySelectorAll(".pl-song-item").forEach(row => {
    row.classList.remove("playing");
    const wave = row.querySelector(".pl-song-wave");
    if (wave) wave.classList.remove("paused");
  });

  if (player.currentIndex === -1 || !player.isPlaying && player.currentIndex === -1) return;

  const activeSong = player.queue[player.currentIndex];
  if (!activeSong) return;

  const activeRow = document.getElementById(`song-row-${player.playlistId}-${activeSong.songId}`);
  if (activeRow) {
    activeRow.classList.add("playing");
    const wave = activeRow.querySelector(".pl-song-wave");
    if (wave && !player.isPlaying) wave.classList.add("paused");
  }

  // Update per-playlist play button icon
  if (player.playlistId) {
    const playBtn = document.getElementById(`play-btn-${player.playlistId}`);
    if (playBtn) {
      const icon = playBtn.querySelector("i");
      if (icon) icon.className = player.isPlaying ? "bi bi-pause-fill" : "bi bi-play-fill";
      playBtn.classList.toggle("active", player.isPlaying);
    }
  }

  // Now-playing label
  const label = document.getElementById(`now-playing-${player.playlistId}`);
  if (label && activeSong) {
    label.innerHTML = `<i class="bi bi-music-note-beamed"></i> ${esc(activeSong.songName)}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal helpers
// ─────────────────────────────────────────────────────────────────────────────
function openCreateModal() {
  document.getElementById("createModalOverlay").classList.add("open");
  setTimeout(() => document.getElementById("newPlaylistInput").focus(), 100);
}
function closeCreateModal() {
  document.getElementById("createModalOverlay").classList.remove("open");
  document.getElementById("newPlaylistInput").value = "";
}
document.getElementById("createModalOverlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeCreateModal();
});

// Rename modal
function renamePlaylist(id, current) {
  document.getElementById("renamePlaylistId").value    = id;
  document.getElementById("renamePlaylistInput").value = current;
  document.getElementById("renameModalOverlay").classList.add("open");
  setTimeout(() => document.getElementById("renamePlaylistInput").focus(), 100);
}
function closeRenameModal() {
  document.getElementById("renameModalOverlay").classList.remove("open");
}
function confirmRename() {
  const id      = document.getElementById("renamePlaylistId").value;
  const newName = document.getElementById("renamePlaylistInput").value.trim();
  if (!newName) { toast.warning("Please enter a name."); return; }
  closeRenameModal();
  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playlistName: newName, user: { userId: parseInt(userId) } })
  })
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(() => { toast.success("Playlist renamed."); loadPlaylists(); })
  .catch(() => toast.error("Could not rename playlist."));
}
document.getElementById("renameModalOverlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeRenameModal();
});

// Confirm delete modal
let _plConfirmResolve = null;
function showPlConfirm(msg) {
  document.getElementById("plConfirmMsg").textContent = msg;
  document.getElementById("plConfirmModal").classList.add("open");
  return new Promise(res => { _plConfirmResolve = res; });
}
function plConfirmResolve(val) {
  document.getElementById("plConfirmModal").classList.remove("open");
  if (_plConfirmResolve) { _plConfirmResolve(val); _plConfirmResolve = null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────
function createPlaylist() {
  const name = document.getElementById("newPlaylistInput").value.trim();
  if (!name) { toast.warning("Please enter a playlist name."); return; }

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playlistName: name, user: { userId: parseInt(userId) } })
  })
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(() => { toast.success(`Playlist "${name}" created.`); closeCreateModal(); loadPlaylists(); })
  .catch(() => toast.error("Could not create playlist."));
}

function deletePlaylist(id) {
  showPlConfirm("Delete this playlist? All songs inside will also be removed.").then(ok => {
    if (!ok) return;
    if (player.playlistId === id) stopPlayer();
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then(() => { toast.success("Playlist deleted."); loadPlaylists(); })
      .catch(() => toast.error("Could not delete playlist."));
  });
}

function removeSongFromPlaylist(psId) {
  fetch(`http://localhost:8081/playlist-songs/${psId}`, { method: "DELETE" })
    .then(() => { toast.success("Song removed from playlist."); loadPlaylists(); })
    .catch(() => toast.error("Could not remove song."));
}

function togglePlaylist(id) {
  document.getElementById(`pl-songs-${id}`).classList.toggle("open");
  document.getElementById(`plchev-${id}`).classList.toggle("open");
}

// ─────────────────────────────────────────────────────────────────────────────
// Load & render playlists
// ─────────────────────────────────────────────────────────────────────────────
function loadPlaylists() {
  Promise.all([
    fetch(`${API_URL}/user/${userId}`).then(r => r.json()),
    fetch("http://localhost:8081/playlist-songs").then(r => r.json()),
    fetch("http://localhost:8082/songs").then(r => r.json())
  ])
  .then(([playlists, psongs, songs]) => {
    const grid = document.getElementById("playlistGrid");

    if (playlists.length === 0) {
      grid.innerHTML = `<div class="empty-state">
        <i class="bi bi-collection-play"></i>
        <h3>No playlists yet</h3>
        <p>Hit "New Playlist" to create your first one.</p>
      </div>`;
      return;
    }

    grid.innerHTML = playlists.map(p => {
      const items     = psongs.filter(i => i.playlist?.playlistId === p.playlistId);
      const songObjs  = items.map(i => songs.find(x => x.songId === i.songId)).filter(Boolean);
      const isActive  = player.playlistId === p.playlistId;
      const isPlaying = isActive && player.isPlaying;

      // Song rows
      const songsHtml = songObjs.length === 0
        ? `<div class="pl-song-item" style="justify-content:center;cursor:default;">
             <i class="bi bi-music-note-list" style="opacity:0.3;"></i>
             <span style="color:var(--text-muted);font-size:0.82rem;">No songs added yet</span>
           </div>`
        : songObjs.map((s, idx) => {
            const activeRow = isActive && player.queue[player.currentIndex]?.songId === s.songId;
            const psItem    = items[songObjs.indexOf(s)]; // playlist-song record (has .id)
            return `
              <div class="pl-song-item ${activeRow ? "playing" : ""}"
                   id="song-row-${p.playlistId}-${s.songId}"
                   onclick="playSongDirect(${JSON.stringify(JSON.stringify(s))},${p.playlistId},'${esc(p.playlistName)}',${JSON.stringify(JSON.stringify(songObjs))})">
                <div class="pl-song-num">${idx + 1}</div>
                <div class="pl-song-wave ${activeRow && !player.isPlaying ? "paused" : ""}">
                  <span></span><span></span><span></span>
                </div>
                <div class="pl-song-info">
                  <div class="pl-song-title">${esc(s.songName)}</div>
                  <div class="pl-song-artist">${esc(s.artist)}</div>
                </div>
                <button class="pl-song-play-btn" title="Play"
                  onclick="event.stopPropagation();playSongDirect(${JSON.stringify(JSON.stringify(s))},${p.playlistId},'${esc(p.playlistName)}',${JSON.stringify(JSON.stringify(songObjs))})">
                  <i class="bi ${activeRow && player.isPlaying ? "bi-pause-fill" : "bi-play-fill"}"></i>
                </button>
                <button class="pl-song-remove-btn" title="Remove from playlist"
                  onclick="event.stopPropagation();removeSongFromPlaylist(${psItem.id})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>`;
          }).join("");

      return `
        <div class="pl-card">

          <!-- Card header -->
          <div class="pl-card-header" onclick="togglePlaylist(${p.playlistId})">
            <div class="pl-card-left">
              <div class="pl-icon"><i class="bi bi-collection-play-fill"></i></div>
              <div>
                <div class="pl-name">${esc(p.playlistName)}</div>
                <div class="pl-sub">${songObjs.length} song${songObjs.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
            <div class="pl-card-right">
              <button class="mv-btn-icon" title="Rename"
                onclick="event.stopPropagation();renamePlaylist(${p.playlistId},'${esc(p.playlistName)}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="mv-btn-icon" title="Delete"
                onclick="event.stopPropagation();deletePlaylist(${p.playlistId})"
                style="color:var(--danger);">
                <i class="bi bi-trash"></i>
              </button>
              <i class="bi bi-chevron-down pl-chevron" id="plchev-${p.playlistId}"></i>
            </div>
          </div>

          <!-- Expanded section -->
          <div class="pl-song-list" id="pl-songs-${p.playlistId}">

            <!-- Player toolbar -->
            <div class="pl-player-toolbar">
              <span class="pl-toolbar-label">Controls</span>

              <!-- Play / Pause -->
              <button class="pl-ctrl-btn play-btn ${isPlaying ? "active" : ""}"
                id="play-btn-${p.playlistId}"
                title="${isPlaying ? "Pause" : "Play all"}"
                onclick="${isActive ? "togglePlayPause()" : `playPlaylist(${p.playlistId},'${esc(p.playlistName)}',JSON.parse(${JSON.stringify(JSON.stringify(songObjs))}))`}">
                <i class="bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}"></i>
              </button>

              <!-- Stop -->
              <button class="pl-ctrl-btn" title="Stop" onclick="stopPlayer()">
                <i class="bi bi-stop-fill"></i>
              </button>

              <!-- Previous -->
              <button class="pl-ctrl-btn" title="Previous" onclick="playPrev()">
                <i class="bi bi-skip-start-fill"></i>
              </button>

              <!-- Next -->
              <button class="pl-ctrl-btn" title="Next" onclick="playNext()">
                <i class="bi bi-skip-end-fill"></i>
              </button>

              <!-- Shuffle -->
              <button class="pl-ctrl-btn ${player.isShuffle ? "active" : ""}"
                id="shuffle-btn-${p.playlistId}" title="Shuffle"
                onclick="toggleShuffle()">
                <i class="bi bi-shuffle"></i>
              </button>

              <!-- Repeat -->
              <button class="pl-ctrl-btn ${player.repeatMode !== "none" ? "active" : ""}"
                title="Repeat" onclick="toggleRepeat()">
                <i class="bi ${player.repeatMode === "one" ? "bi-repeat-1" : "bi-repeat"}"></i>
              </button>

              <!-- Now playing label -->
              <div class="pl-now-playing-label" id="now-playing-${p.playlistId}">
                ${isActive && player.currentIndex >= 0
                  ? `<i class="bi bi-music-note-beamed"></i> ${esc(player.queue[player.currentIndex]?.songName ?? "")}`
                  : ""}
              </div>
            </div>

            <!-- Song rows -->
            <div class="pl-song-items">${songsHtml}</div>

          </div>
        </div>`;
    }).join("");
  })
  .catch(() => toast.error("Could not load playlists."));
}

// ─────────────────────────────────────────────────────────────────────────────
// playSongDirect receives JSON-stringified song data via inline onclick
// because we can't pass objects directly through HTML attributes
// ─────────────────────────────────────────────────────────────────────────────
// Override the function to accept pre-serialised strings from HTML
const _playSongDirect = playSongDirect;
window.playSongDirect = function(songJson, playlistId, playlistName, allSongsJson) {
  const song     = typeof songJson     === "string" ? JSON.parse(songJson)     : songJson;
  const allSongs = typeof allSongsJson === "string" ? JSON.parse(allSongsJson) : allSongsJson;
  _playSongDirect(song, playlistId, playlistName, allSongs);
};

const _playPlaylist = playPlaylist;
window.playPlaylist = function(playlistId, playlistName, songsJson) {
  const songs = typeof songsJson === "string" ? JSON.parse(songsJson) : songsJson;
  _playPlaylist(playlistId, playlistName, songs);
};

loadPlaylists();
