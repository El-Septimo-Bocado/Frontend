// ===============================
// Config
// ===============================
const API_BASE = "http://localhost:8080";
const PRECIO_ASIENTO = 8000;

// Helpers
const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
const money = (v) => `$${Number(v||0).toLocaleString("es-CO")} COP`;

// ===============================
// 1) META de película desde #pm y detección de movieId
// ===============================
function parsePM() {
  if (location.hash.startsWith("#pm=")) {
    try {
      const raw = decodeURIComponent(location.hash.slice(4));
      const obj = JSON.parse(raw);
      history.replaceState(null, "", location.pathname + location.search);
      return obj;
    } catch {}
  }
  try { return JSON.parse(localStorage.getItem("pendingMovie") || "null"); } catch {}
  return null;
}

async function ensureMovieId(meta) {
  if (meta.movieId) return meta.movieId;
  const res = await fetch(`${API_BASE}/api/movies`);
  const movies = await res.json();
  const found = movies.find(m => (m.titulo || "").toLowerCase() === (meta.titulo||"").toLowerCase());
  return found?.id || null;
}

function paintMeta(meta) {
  $("#movieTitle").textContent = meta.titulo || "Película";
  $("#movieDirector").textContent = meta.director || "—";
  $("#movieGenres").textContent = meta.generos || "—";
  $("#movieDuration").textContent = meta.duracion || "—";
  if ($("#moviePoster") && meta.poster) $("#moviePoster").src = meta.poster;

  const main = $(".reserva-main");
  if (main && meta.fondo) {
    main.style.backgroundImage = `url('${meta.fondo}')`;
    main.style.backgroundSize = "cover";
    main.style.backgroundPosition = "center";
    main.style.backgroundBlendMode = "multiply";
  }
}

// ===============================
// 2) Carga de horarios, asientos y selección
// ===============================
function buildSeatGrid(filas=6, columnas=8) {
  const cont = $("#asientos");
  cont.innerHTML = "";
  for (let r=0; r<filas; r++) {
    const rowLetter = String.fromCharCode("A".charCodeAt(0)+r);
    const fila = document.createElement("div");
    fila.className = "fila";
    const span = document.createElement("span");
    span.className = "letra-fila";
    span.textContent = rowLetter;
    fila.appendChild(span);
    for (let c=1; c<=columnas; c++) {
      const btn = document.createElement("button");
      btn.className = "asiento";
      btn.textContent = `${rowLetter}${c}`;
      fila.appendChild(btn);
    }
    cont.appendChild(fila);
  }
}

async function loadShowtimes(movieId) {
  const wrap = $("#horarios");
  wrap.innerHTML = "<em>Cargando horarios…</em>";
  const res = await fetch(`${API_BASE}/api/showtimes?movieId=${encodeURIComponent(movieId)}`);
  if (!res.ok) { wrap.innerHTML = "<em>Error cargando horarios</em>"; return []; }
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) { wrap.innerHTML = "<em>Sin horarios</em>"; return []; }

  wrap.innerHTML = "";
  data.forEach(st => {
    const fecha = new Date(st.fechaHora);
    const etiqueta = `${fecha.toLocaleDateString("es-CO", { weekday:"short", day:"2-digit", month:"short" })} ${fecha.toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" })} — ${st.sala}`;
    const b = document.createElement("button");
    b.className = "btn-horario";
    b.textContent = etiqueta;
    b.dataset.id = st.id;
    b.addEventListener("click", () => selectShowtime(st, b));
    wrap.appendChild(b);
  });
  return data;
}

let selectedShowtime = null;
let selectedSeats = new Set();
let total = 0;

async function selectShowtime(st, btn) {
  $$(".btn-horario").forEach(b => b.classList.remove("seleccionado"));
  btn.classList.add("seleccionado");
  selectedShowtime = st;
  selectedSeats.clear();
  total = 0;
  updateTotal();

  await loadSeatsFromBackend(st.id, st.filas, st.columnas);

  $$(".asiento").forEach(a => {
    a.addEventListener("click", () => {
      if (a.classList.contains("ocupado") || a.dataset.locked === "1") return;
      const code = a.textContent.trim();
      if (a.classList.toggle("seleccionado")) {
        selectedSeats.add(code);
        total += PRECIO_ASIENTO;
      } else {
        selectedSeats.delete(code);
        total -= PRECIO_ASIENTO;
      }
      updateTotal();
    });
  });
}

async function loadSeatsFromBackend(showtimeId, filas=6, columnas=8) {
  buildSeatGrid(filas, columnas);
  const res = await fetch(`${API_BASE}/api/showtimes/${encodeURIComponent(showtimeId)}/seats`);
  if (!res.ok) return;
  const data = await res.json();

  data.forEach(s => {
    const btn = findSeatButton(s.seatCode);
    if (!btn) return;
    if (s.status === "OCUPADO" || s.status === "RESERVADO") {
      btn.classList.add("ocupado");
      btn.dataset.locked = "1";
    }
  });
}

function findSeatButton(code) {
  return $$(".asiento").find(b => b.textContent.trim() === code);
}

function updateTotal() {
  const btn = $("#btn-total");
  if (btn) btn.textContent = money(total);
}

// ===============================
// 3) Confirmar: HOLD y pasar a comidas
// ===============================
async function confirmAndHold() {
  if (!selectedShowtime || selectedSeats.size === 0) {
    const mod = $("#modal-error");
    const msg = $("#mensaje-error");
    if (mod && msg) { msg.textContent = "Debes seleccionar un horario y al menos un asiento."; mod.checked = true; }
    else alert("Debes seleccionar un horario y al menos un asiento.");
    return;
  }

  const res = await fetch(`${API_BASE}/api/showtimes/${selectedShowtime.id}/seats/hold`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ seatCodes: Array.from(selectedSeats) })
  });
  if (!res.ok) { alert("No se pudo bloquear los asientos. Intenta de nuevo."); return; }
  const hold = await res.json();

  let draft = {};
  try { draft = JSON.parse(localStorage.getItem("reservaDraft") || "{}"); } catch {}
  draft.id         = draft.id || ("r_" + Date.now());
  draft.showtimeId = selectedShowtime.id;
  draft.holdId     = hold.holdId;
  draft.holdExp    = hold.expiresAt;
  draft.asientos   = Array.from(selectedSeats);
  draft.fecha      = new Date().toLocaleDateString("es-CO");
  draft.horario    = $(`.btn-horario.seleccionado`)?.textContent?.trim() || "";
  draft.costos     = { boletas: total, comida: 0, cargo: 0, total };
  localStorage.setItem("reservaDraft", JSON.stringify(draft));

  window.location.href = "reservacioncomida.html";
}

// ===============================
// 4) Cancelar
// ===============================
function wireCancel() {
  const btnSi = $("#btn-si-cancelar");
  if (btnSi) {
    btnSi.addEventListener("click", () => {
      localStorage.removeItem("reservaDraft");
      localStorage.removeItem("pendingMovie");
    });
  }
}

// ===============================
// Init
// ===============================
(async function init() {
  const pm = parsePM() || {};
  const meta = {
    movieId : pm.movieId || null,
    titulo  : pm.titulo || "Película",
    poster  : pm.poster || "",
    fondo   : pm.fondo || "",
    director: pm.director || "",
    generos : pm.generos || "",
    duracion: pm.duracion || ""
  };
  paintMeta(meta);

  let draft = {};
  try { draft = JSON.parse(localStorage.getItem("reservaDraft") || "{}"); } catch {}
  draft.meta = { ...(draft.meta||{}), ...meta };
  draft.pelicula = meta.titulo;
  localStorage.setItem("reservaDraft", JSON.stringify(draft));

  const movieId = meta.movieId || await ensureMovieId(meta);
  if (!movieId) {
    alert("No pude identificar la película. Regresa a cartelera.");
    window.location.href = "../cartelera/cartelera.html";
    return;
  }

  await loadShowtimes(movieId);
  buildSeatGrid();

  $("#btn-confirmar")?.addEventListener("click", confirmAndHold);
  wireCancel();
})();
