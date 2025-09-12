/* boards.js
 - GET /api/boards/
 - POST /api/boards/  {title}
*/
const API_BASE = "http://127.0.0.1:8000";
const token = localStorage.getItem("access");
if(!token){ location.href = "auth.html"; }

async function api(path, opts = {}) {
  opts.headers = opts.headers || {};
  opts.headers["Authorization"] = `Bearer ${token}`;
  return fetch(API_BASE + path, opts).then(r => r);
}

async function loadBoards(q="") {
  const res = await api("/api/boards/");
  if (!res.ok) { alert("Failed loading boards"); return; }
  const boards = await res.json();
  const cont = document.getElementById("boards");
  cont.innerHTML = "";
  const filtered = boards.filter(b => !q || b.title.toLowerCase().includes(q.toLowerCase()));
  filtered.forEach(b => {
    const el = document.createElement("div");
    el.className = "board-tile";
    el.innerHTML = `<strong>${escapeHtml(b.title)}</strong><div class="small-muted">Members: ${b.members?.length||1}</div>`;
    el.onclick = () => {
      // open board page, pass id as query param
      window.location.href = `board.html?id=${b.id}`;
    };
    cont.appendChild(el);
  });
}

document.getElementById("newBoardBtn").addEventListener("click", async () => {
  const title = prompt("Board title");
  if (!title) return;
  const res = await api("/api/boards/", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ title }) });
  if (res.ok) loadBoards();
  else alert("Create failed");
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  location.href = "auth.html";
});

document.getElementById("boardSearch").addEventListener("input", (e) => {
  loadBoards(e.target.value);
});

// small escaper
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

loadBoards();
