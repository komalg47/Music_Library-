if (localStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "admin-login.html";
}

const SONG_URL   = "http://localhost:8082/songs";
const ARTIST_URL = "http://localhost:8082/artists";

let allSongs   = [];
let allArtists = [];
let editingId  = null;   // song being edited in panel

loadArtists();
loadSongs();

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function logout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "admin-login.html";
}

// ── Load Artists ──────────────────────────────────────────────────────────────
function loadArtists() {
  fetch(ARTIST_URL)
    .then(r => r.json())
    .then(data => {
      allArtists = data.sort((a,b) => a.artistName.localeCompare(b.artistName));
      document.getElementById("artistBadge").textContent    = allArtists.length;
      document.getElementById("statArtistCount").textContent = allArtists.length;
      renderArtists(allArtists);
      setupArtistAutocomplete();
    })
    .catch(() => toast.error("Could not load artists."));
}

function renderArtists(list) {
  const container = document.getElementById("artistList");
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:40px 0;">
      <i class="bi bi-person-x"></i><h3>No artists yet</h3><p>Add your first artist above.</p></div>`;
    return;
  }
  container.innerHTML = list.map(a => `
    <div class="artist-row">
      <div class="artist-row-name">
        <div class="artist-avatar">${a.artistName.charAt(0).toUpperCase()}</div>
        <span>${esc(a.artistName)}</span>
      </div>
      <div class="artist-row-actions">
        <button class="mv-btn-icon" title="Edit" onclick="editArtist(${a.artistId},'${esc(a.artistName)}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="mv-btn-icon" title="Delete" onclick="deleteArtist(${a.artistId})"
          style="color:var(--danger);">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>`).join("");
}

// ── Load Songs ────────────────────────────────────────────────────────────────
function loadSongs() {
  fetch(SONG_URL)
    .then(r => r.json())
    .then(data => {
      allSongs = data.sort((a,b) => a.songName.localeCompare(b.songName));
      document.getElementById("songBadge").textContent    = allSongs.length;
      document.getElementById("statSongCount").textContent = allSongs.length;
      renderSongs(allSongs);
    })
    .catch(() => toast.error("Could not load songs."));
}

function renderSongs(list) {
  const tbody = document.getElementById("songTableBody");
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">
      <div class="empty-state" style="padding:40px 0;">
        <i class="bi bi-music-note-beamed"></i><h3>No songs yet</h3><p>Add your first song.</p>
      </div></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(s => `
    <tr class="song-row-clickable" onclick="openSongDetail(${s.songId})">
      <td>${esc(s.songName)}</td>
      <td class="muted">${esc(s.artist)}</td>
      <td class="muted">${esc(s.album)}</td>
      <td class="muted">${esc(s.musicDirector ?? "—")}</td>
      <td class="muted">${s.releaseDate ?? "—"}</td>
      <td onclick="event.stopPropagation()">
        <div style="display:flex;gap:6px;">
          <button class="mv-btn-icon" title="Edit" onclick="openEditPanel(${s.songId})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="mv-btn-icon" title="Delete" onclick="deleteSong(${s.songId})"
            style="color:var(--danger);">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join("");
}

// Admin song search filter
document.getElementById("adminSearchSong").addEventListener("input", function() {
  const q = this.value.toLowerCase();
  renderSongs(q ? allSongs.filter(s =>
    s.songName.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)   ||
    s.album.toLowerCase().includes(q)    ||
    (s.musicDirector && s.musicDirector.toLowerCase().includes(q))
  ) : allSongs);
});

// ── Cover image file picker preview ──────────────────────────────────────────
function previewCover(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById("coverFileName").textContent = file.name;
  document.getElementById("coverImage").value = file.name;

  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById("coverPreviewImg").src = e.target.result;
    document.getElementById("coverPreviewWrap").style.display = "block";
  };
  reader.readAsDataURL(file);
}

// ── Add Song (with duplicate check + all fields required) ─────────────────────
function addSong() {
  const fields = {
    songName:      document.getElementById("songName").value.trim(),
    artist:        document.getElementById("artist").value.trim(),
    album:         document.getElementById("album").value.trim(),
    musicDirector: document.getElementById("musicDirector").value.trim(),
    releaseDate:   document.getElementById("releaseDate").value,
    coverImage:    document.getElementById("coverImage").value.trim(),
    visible:       true
  };

  // All fields mandatory
  const missing = Object.entries(fields)
    .filter(([k,v]) => k !== "visible" && !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    toast.warning(`Please fill in: ${missing.join(", ")}`);
    return;
  }

  // Duplicate check — same songName + same artist (case-insensitive)
  const duplicate = allSongs.find(s =>
    s.songName.toLowerCase() === fields.songName.toLowerCase() &&
    s.artist.toLowerCase()   === fields.artist.toLowerCase()
  );
  if (duplicate) {
    toast.warning(`"${fields.songName}" by ${fields.artist} already exists in the library.`, "Duplicate Song");
    return;
  }

  fetch(SONG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields)
  })
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(() => {
    toast.success(`"${fields.songName}" added successfully.`);
    ["songName","artist","album","musicDirector","releaseDate","coverImage"]
      .forEach(id => document.getElementById(id).value = "");
    document.getElementById("coverFileName").textContent = "No file chosen";
    document.getElementById("coverPreviewWrap").style.display = "none";
    document.getElementById("coverImageFile").value = "";
    loadSongs();
  })
  .catch(() => toast.error("Could not add song."));
}

// ── Shared confirm modal ──────────────────────────────────────────────────────
let _confirmResolve = null;
function showConfirm(title, msg, okLabel = "Delete") {
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMsg").textContent   = msg;
  document.getElementById("confirmOkBtn").innerHTML   = `<i class="bi bi-trash"></i> ${okLabel}`;
  document.getElementById("confirmModal").classList.add("open");
  return new Promise(res => { _confirmResolve = res; });
}
function confirmResolve(val) {
  document.getElementById("confirmModal").classList.remove("open");
  if (_confirmResolve) { _confirmResolve(val); _confirmResolve = null; }
}

// ── Edit Artist Modal ─────────────────────────────────────────────────────────
function editArtist(id, currentName) {
  document.getElementById("editArtistId").value   = id;
  document.getElementById("editArtistName").value = currentName;
  document.getElementById("editArtistModal").classList.add("open");
  setTimeout(() => document.getElementById("editArtistName").focus(), 100);
}
function closeEditArtistModal() {
  document.getElementById("editArtistModal").classList.remove("open");
}
function saveArtistEdit() {
  const id      = document.getElementById("editArtistId").value;
  const newName = document.getElementById("editArtistName").value.trim();
  if (!newName) { toast.warning("Artist name cannot be empty."); return; }
  closeEditArtistModal();
  fetch(`${ARTIST_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artistName: newName })
  })
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(() => { toast.success("Artist updated."); loadArtists(); loadSongs(); })
  .catch(() => toast.error("Could not update artist."));
}

// ── Delete Artist ─────────────────────────────────────────────────────────────
function deleteArtist(id) {
  showConfirm("Delete Artist", "Delete this artist? This cannot be undone.").then(ok => {
    if (!ok) return;
    fetch(`${ARTIST_URL}/${id}`, { method: "DELETE" })
      .then(() => { toast.success("Artist deleted."); loadArtists(); })
      .catch(() => toast.error("Could not delete artist."));
  });
}

// ── Delete Song ───────────────────────────────────────────────────────────────
function deleteSong(id) {
  showConfirm("Delete Song", "Delete this song? This cannot be undone.").then(ok => {
    if (!ok) return;
    fetch(`${SONG_URL}/${id}`, { method: "DELETE" })
      .then(() => { toast.success("Song deleted."); closePanel(); loadSongs(); })
      .catch(() => toast.error("Could not delete song."));
  });
}

// ── Song Detail Panel (read mode) ─────────────────────────────────────────────
function openSongDetail(id) {
  const song = allSongs.find(s => s.songId === id);
  if (!song) return;
  editingId = null;

  document.getElementById("panelTitle").textContent = "Song Details";
  const imgHtml = song.coverImage
    ? `<img src="asserts/images/${esc(song.coverImage)}" class="cover-preview" alt="${esc(song.songName)}">`
    : `<div style="width:100%;height:140px;border-radius:12px;background:var(--dark-3);display:flex;align-items:center;justify-content:center;font-size:2.5rem;opacity:0.3;margin-bottom:20px;">🎵</div>`;

  document.getElementById("panelBody").innerHTML = `
    ${imgHtml}
    ${detailField("Song Name",      song.songName,      "bi-music-note")}
    ${detailField("Artist",         song.artist,        "bi-person-fill")}
    ${detailField("Album",          song.album,         "bi-disc")}
    ${detailField("Music Director", song.musicDirector, "bi-music-player")}
    ${detailField("Release Date",   song.releaseDate,   "bi-calendar3")}
    ${detailField("Cover Image",    song.coverImage,    "bi-image")}
    ${detailField("Visible",        song.visible ? "Yes" : "No", "bi-eye")}
  `;

  document.getElementById("panelFooter").innerHTML = `
    <button class="mv-btn mv-btn-primary" style="flex:1;" onclick="openEditPanel(${id})">
      <i class="bi bi-pencil"></i> Edit
    </button>
    <button class="mv-btn mv-btn-danger" onclick="deleteSong(${id})">
      <i class="bi bi-trash"></i> Delete
    </button>
  `;

  openPanel();
}

function detailField(label, value, icon) {
  return `
    <div class="detail-field">
      <label><i class="bi ${icon}" style="margin-right:5px;"></i>${label}</label>
      <div class="detail-value">${esc(value ?? "—")}</div>
    </div>`;
}

// ── Song Edit Panel ───────────────────────────────────────────────────────────
function openEditPanel(id) {
  const song = allSongs.find(s => s.songId === id);
  if (!song) return;
  editingId = id;

  document.getElementById("panelTitle").textContent = "Edit Song";
  document.getElementById("panelBody").innerHTML = `
    ${editField("eSongName",      "Song Name",      song.songName)}
    ${editField("eArtist",        "Artist",         song.artist)}
    ${editField("eAlbum",         "Album",          song.album)}
    ${editField("eDirector",      "Music Director", song.musicDirector)}
    ${editField("eReleaseDate",   "Release Date",   song.releaseDate, "date")}
    ${editField("eCoverImage",    "Cover Image",    song.coverImage)}
  `;

  document.getElementById("panelFooter").innerHTML = `
    <button class="mv-btn mv-btn-success" style="flex:1;" onclick="saveSongEdit(${id})">
      <i class="bi bi-check-lg"></i> Save Changes
    </button>
    <button class="mv-btn mv-btn-outline" onclick="openSongDetail(${id})">Cancel</button>
  `;

  openPanel();
}

function editField(id, label, value, type = "text") {
  return `
    <div class="mv-form-group">
      <label class="mv-label">${label}</label>
      <input type="${type}" id="${id}" class="mv-input" value="${esc(value ?? "")}">
    </div>`;
}

function saveSongEdit(id) {
  const updated = {
    songName:      document.getElementById("eSongName").value.trim(),
    artist:        document.getElementById("eArtist").value.trim(),
    album:         document.getElementById("eAlbum").value.trim(),
    musicDirector: document.getElementById("eDirector").value.trim(),
    releaseDate:   document.getElementById("eReleaseDate").value,
    coverImage:    document.getElementById("eCoverImage").value.trim(),
    visible:       true
  };

  if (!updated.songName || !updated.artist || !updated.album) {
    toast.warning("Song Name, Artist and Album are required."); return;
  }

  fetch(`${SONG_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated)
  })
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(() => { toast.success("Song updated."); closePanel(); loadSongs(); })
  .catch(() => toast.error("Could not update song. Make sure PUT /songs/{id} exists on the backend."));
}

function openPanel() {
  document.getElementById("panelOverlay").classList.add("open");
  document.getElementById("detailPanel").classList.add("open");
}
function closePanel() {
  document.getElementById("panelOverlay").classList.remove("open");
  document.getElementById("detailPanel").classList.remove("open");
  editingId = null;
}

// ── Add Artist ────────────────────────────────────────────────────────────────
function addArtist() {
  const el   = document.getElementById("artistName");
  const name = el.value.trim();
  if (!name) { toast.warning("Please enter an artist name."); el.focus(); return; }

  fetch(ARTIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artistName: name })
  })
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(() => { toast.success(`Artist "${name}" added.`); el.value = ""; loadArtists(); })
  .catch(() => toast.error("Could not add artist."));
}

// ── Autocomplete for Artist + Director inputs ─────────────────────────────────
function setupArtistAutocomplete() {
  attachAutocomplete("artist",      "artistSuggest");
  attachAutocomplete("musicDirector","directorSuggest");
}

function attachAutocomplete(inputId, listId) {
  const input = document.getElementById(inputId);
  const list  = document.getElementById(listId);

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { list.classList.remove("open"); return; }
    const matches = allArtists
      .filter(a => a.artistName.toLowerCase().includes(q))
      .slice(0, 8);
    if (matches.length === 0) { list.classList.remove("open"); return; }
    list.innerHTML = matches.map(a =>
      `<div class="autocomplete-item" onmousedown="pickArtist('${esc(a.artistName)}','${inputId}','${listId}')">
         <i class="bi bi-person-fill"></i> ${esc(a.artistName)}
       </div>`).join("");
    list.classList.add("open");
  });
  input.addEventListener("blur", () => setTimeout(() => list.classList.remove("open"), 150));
}

function pickArtist(name, inputId, listId) {
  document.getElementById(inputId).value = name;
  document.getElementById(listId).classList.remove("open");
}
