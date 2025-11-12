// reservacion/reservacion.js
const API_BASE = Auth.API_BASE;
const PRECIO_ASIENTO = 8000;

const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
const money = (v) => `$${Number(v||0).toLocaleString("es-CO")} COP`;

// ========= 1) movieId sólo desde URL =========
function getMovieIdFromUrl() {
  const sp = new URLSearchParams(location.search);
  const id = sp.get("id");
  if (id) return id;

  // fallback: si alguien vino con #id=123
  if (location.hash.startsWith("#id=")) {
    try {
      const raw = decodeURIComponent(location.hash.slice(4));
      history.replaceState(null, "", location.pathname + location.search);
      return raw;
    } catch {}
  }
  return null;
}

// ========= 2) Cargar meta de la película desde el backend =========
async function fetchMovieById(id) {
  const res = await fetch(`${API_BASE}/api/movies/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}

function paintMeta(meta) {
  $("#movieTitle").textContent    = meta.titulo || "Película";
  $("#movieDirector").textContent = meta.director || "—";
  $("#movieGenres").textContent   = meta.generos || "—";
  $("#movieDuration").textContent = meta.duracion || "—";
  if (meta.poster) $("#moviePoster").src = meta.poster;

  const main = $(".reserva-main");
  if (main && meta.fondo) {
    main.style.backgroundImage = `url('${meta.fondo}')`;
    main.style.backgroundSize = "cover";
    main.style.backgroundPosition = "center";
    main.style.backgroundBlendMode = "multiply";
  }
}

// ========= 3) Horarios y asientos =========
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
        selectedSeats.add(code); total += PRECIO_ASIENTO;
      } else {
        selectedSeats.delete(code); total -= PRECIO_ASIENTO;
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

function findSeatButton(code) { return $$(".asiento").find(b => b.textContent.trim() === code); }
function updateTotal() { $("#btn-total").textContent = money(total); }

// ========= 4) Confirmar (HOLD) y pasar a comidas =========
async function confirmAndHold() {
  // Si no hay sesión, mandamos a login y volvemos EXACTAMENTE a esta página con ?id=...
  const currentUrl = window.location.pathname + window.location.search;
  if (!Auth.requireLogin(currentUrl)) return; // se va a login y volverá aquí

  if (!selectedShowtime || selectedSeats.size === 0) {
    const mod = $("#modal-error"), msg = $("#mensaje-error");
    if (mod && msg) { msg.textContent = "Debes seleccionar un horario y al menos un asiento."; mod.checked = true; }
    else alert("Debes seleccionar un horario y al menos un asiento.");
    return;
  }

  // HOLD en backend
  const res = await Auth.apiFetch(`${API_BASE}/api/showtimes/${selectedShowtime.id}/seats/hold`, {
    method: "POST",
    body: JSON.stringify({ seatCodes: Array.from(selectedSeats) })
  });
  if (!res.ok) { alert("No se pudo bloquear los asientos. Intenta de nuevo."); return; }
  const hold = await res.json(); // {holdId, expiresAt}

  // Guardamos draft mínimo en localStorage (solo para siguiente paso)
  const draft = {
    id         : "r_" + Date.now(),
    movieId    : currentMovieId,
    showtimeId : selectedShowtime.id,
    holdId     : hold.holdId,
    holdExp    : hold.expiresAt,
    asientos   : Array.from(selectedSeats),
    fecha      : new Date().toLocaleDateString("es-CO"),
    horario    : $(`.btn-horario.seleccionado`)?.textContent?.trim() || "",
    costos     : { boletas: total, comida: 0, cargo: 0, total }
  };
  localStorage.setItem("reservaDraft", JSON.stringify(draft));

  // Vamos a la comida (no necesitamos pasar PM; la orden la completa desde backend)
  window.location.href = "reservacionComida.html?showtimeId=" + encodeURIComponent(selectedShowtime.id);
}

// ========= 5) Cancelar =========
function wireCancel() {
  const btnSi = $("#btn-si-cancelar");
  if (btnSi) {
    btnSi.addEventListener("click", () => {
      localStorage.removeItem("reservaDraft");
    });
  }
}

// ========= Init =========
let currentMovieId = null;

(async function init() {
  try {
    currentMovieId = getMovieIdFromUrl();
    if (!currentMovieId) {
      alert("No se indicó la película. Vuelve a la cartelera.");
      window.location.href = "../cartelera/cartelera.html";
      return;
    }

    // Cargar película real desde BD
    const movie = await fetchMovieById(currentMovieId);
    // Normaliza meta para pintar
    const meta = {
      titulo  : movie.titulo || movie.title || "Película",
      poster  : movie.poster || movie.caratula || "",
      fondo   : movie.fondo || movie.poster || "",
      director: movie.director || "",
      generos : movie.generos || "",
      duracion: movie.duracion || ""
    };
    paintMeta(meta);

    // Horarios y grilla base
    await loadShowtimes(currentMovieId);
    buildSeatGrid();

    // Botones
    $("#btn-confirmar")?.addEventListener("click", confirmAndHold);
    wireCancel();
  } catch (err) {
    console.error(err);
    alert("No pude cargar la reservación. Intenta desde la cartelera.");
    window.location.href = "../cartelera/cartelera.html";
  }
})();
