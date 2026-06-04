const token     = localStorage.getItem("token");
const userId    = localStorage.getItem("userId");
const userEmail = localStorage.getItem("userEmail");
const userName  = localStorage.getItem("userName");

if (!token || !userId) { window.location.href = "login.html"; }

// Show logged-in user's name
const welcomeEl = document.getElementById("welcomeUser");
if (welcomeEl && userName) {
  welcomeEl.textContent = `Welcome back, ${userName} 👋`;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "login.html";
}

// Playlists Count (user-scoped)
fetch(`http://localhost:8081/playlists/user/${userId}`)
  .then(r => r.json())
  .then(data => { document.getElementById("playlistCount").textContent = data.length; })
  .catch(() => toast.error("Could not load playlist count."));

// Favorites Count (user-scoped) — only count favorites where the song still exists
Promise.all([
  fetch(`http://localhost:8081/favorites/user/${parseInt(userId)}`).then(r => r.json()),
  fetch("http://localhost:8082/songs").then(r => r.json())
])
.then(([favs, songs]) => {
  const validCount = favs.filter(f => songs.some(s => s.songId === f.songId)).length;
  document.getElementById("favoriteCount").textContent = validCount;
})
.catch(() => { document.getElementById("favoriteCount").textContent = "0"; });

// Artist Count
fetch("http://localhost:8082/artists")
  .then(r => r.json())
  .then(data => { document.getElementById("artistCount").textContent = data.length; })
  .catch(() => toast.error("Could not load artist count."));
