/* board.js
Handles rendering lists/cards, drag/drop, card modal, comments, activity log
WebSocket: ws://<host>/ws/boards/{boardId}/
*/

const API_BASE = "http://127.0.0.1:8000";
const token = localStorage.getItem("access");
if(!token) location.href = "auth.html";

const urlParams = new URLSearchParams(window.location.search);
const boardId = urlParams.get("id");
if(!boardId) {
  alert("Board id missing");
  location.href = "boards.html";
}

async function api(path, opts={}) {
  opts.headers = opts.headers || {};
  opts.headers["Authorization"] = `Bearer ${token}`;
  return fetch(API_BASE + path, opts).then(r => r);
}

/* ------------------------
   Fetch Data
------------------------ */
async function fetchLists() {
  const res = await api("/api/lists/");
  if(!res.ok) throw new Error("lists failed");
  const all = await res.json();
  return all.filter(l => String(l.board) === String(boardId))
            .sort((a,b)=> (a.position||0)-(b.position||0));
}

async function fetchCards() {
  const res = await api("/api/cards/");
  if(!res.ok) throw new Error("cards failed");
  return await res.json();
}

async function loadActivity() {
  const res = await api(`/api/activity/?board=${boardId}`);
  if(!res.ok) return;
  const logs = await res.json();
  const logContainer = document.getElementById("activityLog");
  if(!logContainer) return;
  logContainer.innerHTML = "";
  logs.forEach(l => {
    const li = document.createElement("li");
    li.textContent = `${l.actor?.username || "Unknown"}: ${l.verb}`;
    logContainer.appendChild(li);
  });
}

/* ------------------------
   Render Board
------------------------ */
async function renderBoard() {
  // board title
  const br = await api("/api/boards/");
  if(br.ok) {
    const items = await br.json();
    const my = items.find(b => String(b.id) === String(boardId));
    document.getElementById("boardTitle").textContent = my ? my.title : "Board";
  }

  const listsEl = document.getElementById("lists");
  listsEl.innerHTML = "";
  const lists = await fetchLists();
  const cards = await fetchCards();

  for (const list of lists) {
    const listDiv = document.createElement("div");
    listDiv.className = "list";
    listDiv.dataset.id = list.id;
    listDiv.dataset.pos = list.position || 0;
    listDiv.innerHTML = `
      <h3>${escapeHtml(list.title)}</h3>
      <div class="cards" data-list="${list.id}"></div>
      <div class="add-inline" style="margin-top:8px">
        <input class="input-inline" placeholder="New card title" data-listinput="${list.id}" />
        <button class="btn" data-addcard="${list.id}">Add</button>
      </div>
    `;
    listsEl.appendChild(listDiv);
  }

  // append cards to lists
  for (const c of cards) {
    const listNode = listsEl.querySelector(`[data-list="${c.list}"]`);
    if (!listNode) continue;
    const cardDiv = document.createElement("div");
    cardDiv.className = "card-item";
    cardDiv.draggable = true;
    cardDiv.dataset.id = c.id;
    cardDiv.dataset.position = c.position || 0;
    cardDiv.innerHTML = `<div>${escapeHtml(c.title)}</div>`;
    listNode.querySelector(".cards").appendChild(cardDiv);
  }

  // add-card buttons
  document.querySelectorAll("[data-addcard]").forEach(btn=>{
    btn.onclick = async ()=>{
      const id = btn.dataset.addcard;
      const input = document.querySelector(`[data-listinput="${id}"]`);
      const title = input.value.trim();
      if(!title) return;
      const res = await api("/api/cards/", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ title, list: id }) });
      if(res.ok){ input.value=""; await renderBoard(); }
      else alert("Create card failed");
    };
  });

  enableDragDrop();
  await loadActivity();
}

/* ------------------------
   Drag & Drop
------------------------ */
function enableDragDrop(){
  document.querySelectorAll(".card-item").forEach(card=>{
    card.addEventListener("dragstart", (e)=>{
      e.dataTransfer.setData("cardId", card.dataset.id);
      e.dataTransfer.setData("fromList", card.closest(".list").dataset.id);
    });
    card.addEventListener("click", ()=> openCardModal(card.dataset.id));
  });

  document.querySelectorAll(".list").forEach(listEl=>{
    listEl.addEventListener("dragover", e=> e.preventDefault());
    listEl.addEventListener("drop", async (e)=>{
      e.preventDefault();
      const cardId = e.dataTransfer.getData("cardId");
      const toList = listEl.dataset.id;

      const cards = Array.from(listEl.querySelectorAll(".card-item")).filter(n=>n.dataset.id !== cardId);
      let prevPos = 0, nextPos = null;
      if(cards.length) {
        let insertIndex = cards.length;
        for(let i=0;i<cards.length;i++){
          const r = cards[i].getBoundingClientRect();
          if(e.clientY < r.top + r.height/2){ insertIndex = i; break; }
        }
        const prev = insertIndex-1>=0 ? parseInt(cards[insertIndex-1].dataset.position || 0) : null;
        const next = insertIndex<cards.length ? parseInt(cards[insertIndex].dataset.position || 0) : null;
        prevPos = prev || 0;
        nextPos = next;
      }
      let newPos = !prevPos ? (nextPos||0)-512 || 1024 : !nextPos ? prevPos+1024 : Math.floor((prevPos+nextPos)/2);

      const moving = document.querySelector(`.card-item[data-id="${cardId}"]`);
      if(moving) listEl.querySelector(".cards").appendChild(moving);

      const res = await api(`/api/cards/${cardId}/move/`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ to_list: toList, position: newPos })
      });
      if(!res.ok) { alert("Move failed"); await renderBoard(); }
      else { const updated = await res.json(); moving.dataset.position = updated.position; }
    });
  });
}

/* ------------------------
   Card Modal & Comments
------------------------ */
async function openCardModal(cardId) {
  const r = await api(`/api/cards/${cardId}/`);
  if(!r.ok){ alert("Failed loading card"); return; }
  const card = await r.json();
  const content = document.getElementById("modalContent");
  content.dataset.cardId = cardId;
  content.innerHTML = `
    <h3>${escapeHtml(card.title)}</h3>
    <p>${escapeHtml(card.description || "")}</p>
    <hr/>
    <h4>Comments</h4>
    <div id="commentList" class="activity"></div>
    <div style="margin-top:8px">
      <textarea id="commentText" placeholder="Write a comment" rows="3"></textarea>
      <div style="text-align:right;margin-top:8px"><button id="postComment" class="btn">Post</button></div>
    </div>
  `;
  document.getElementById("modalBack").style.display = "flex";
  document.getElementById("modalClose").onclick = ()=> document.getElementById("modalBack").style.display = "none";

  // load comments
  const cr = await api(`/api/comments/`);
  const allComments = cr.ok ? await cr.json() : [];
  const cardComments = allComments.filter(c=> String(c.card)===String(cardId))
                                  .sort((a,b)=> new Date(a.created_at)-new Date(b.created_at));
  const list = document.getElementById("commentList");
  list.innerHTML = "";
  cardComments.forEach(c=>{
    const el = document.createElement("div");
    el.style.padding="8px";
    el.style.borderBottom="1px solid #eee";
    el.innerHTML = `<strong>${escapeHtml(c.author?.username || "Unknown")}</strong><div style="font-size:13px">${escapeHtml(c.text)}</div><div class="small-muted">${new Date(c.created_at).toLocaleString()}</div>`;
    list.appendChild(el);
  });

  document.getElementById("postComment").onclick = async ()=>{
    const text = document.getElementById("commentText").value.trim();
    if(!text) return;
    const res = await api("/api/comments/", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ card: cardId, text }) });
    if(res.ok){ document.getElementById("commentText").value=""; setTimeout(()=>openCardModal(cardId),200); }
    else alert("Comment failed");
  };
}

/* ------------------------
   WebSocket
------------------------ */
let ws;
function connectWS(){
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;
  ws = new WebSocket(`${protocol}://${host}/ws/boards/${boardId}/`);
  ws.onopen = ()=> console.log("ws open");
  ws.onclose = ()=> { console.log("ws closed, reconnecting..."); setTimeout(connectWS,1000); };
  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      if(['card_moved','card_created','comment_added','member_added'].includes(data.type)){
        renderBoard().catch(()=>{});
        loadActivity().catch(()=>{});
      }
      const modalVisible = document.getElementById("modalBack").style.display !== "none";
      if(modalVisible && data.card === document.getElementById("modalContent")?.dataset.cardId){
        openCardModal(data.card);
      }
    } catch(err){ console.warn("ws parse err", err); }
  };
}

/* ------------------------
   Utilities
------------------------ */
function escapeHtml(s){ return (s||"").toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

/* ------------------------
   Event Listeners
------------------------ */
document.getElementById("addListBtn").addEventListener("click", async ()=>{
  const title = prompt("List title");
  if(!title) return;
  const res = await api("/api/lists/", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ title, board: boardId })});
  if(res.ok) renderBoard(); else alert("Create list failed");
});

document.getElementById("searchCard").addEventListener("input", async (e)=>{
  const term = e.target.value.trim().toLowerCase();
  if(!term) { renderBoard(); return; }
  const res = await api("/api/cards/");
  const all = res.ok ? await res.json() : [];
  const lists = await fetchLists();
  const listIds = lists.map(l=>String(l.id));
  const filtered = all.filter(c => listIds.includes(String(c.list)) && (c.title.toLowerCase().includes(term) || (c.labels||[]).some(lbl=> (lbl+"").toLowerCase().includes(term))));
  const listsEl = document.getElementById("lists");
  listsEl.innerHTML = `<div class="list"><h3>Search results</h3><div class="cards"></div></div>`;
  const container = listsEl.querySelector(".cards");
  filtered.forEach(c=>{
    const div = document.createElement("div");
    div.className="card-item"; div.dataset.id=c.id; div.dataset.position=c.position||0; div.draggable=true; div.innerText=c.title;
    container.appendChild(div);
  });
  enableDragDrop();
});

/* ------------------------
   Init
------------------------ */
connectWS();
renderBoard().catch(err=>console.error(err));
