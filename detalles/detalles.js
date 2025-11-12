(function () {
  const API_MOVIES = "http://localhost:8080/api/movies";
  const API_SHOW   = "http://localhost:8080/api/showtimes";

  const qs = (s) => document.querySelector(s);
  const setText = (sel, t) => { const el = qs(sel); if (el) el.textContent = t ?? ""; };
  const setAttr = (sel, a, v) => { const el = qs(sel); if (el && v!=null) el.setAttribute(a, v); };
  const setStyle = (sel, prop, val) => { const el = qs(sel); if (el) el.style.setProperty(prop, val); };

  // ⭐ 0..5 a estrellitas (permite medios)
  function stars(r) {
    if (typeof r !== "number") return "—";
    const full = Math.floor(r);
    const half = (r - full) >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "☆" : "") + "☆".repeat(empty);
  }

  // formato: "Mié 12/11 — 18:00 (Sala 2) • $20.000"
  function fmtShowtime(s) {
    const dt = new Date(s.fechaHora);
    const dia = dt.toLocaleDateString("es-CO", { weekday: "short" });
    const f   = dt.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" });
    const h   = dt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
    const sala= s.sala || "Sala";
    const price = (s.basePrice!=null) ? ` • $${(s.basePrice).toLocaleString("es-CO")}` : "";
    return `${dia} ${f} — ${h} (${sala})${price}`;
  }

  async function fetchMovieById(id) {
    const r = await fetch(`${API_MOVIES}/${id}`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  }

  async function fetchShowtimes(movieId) {
    const r = await fetch(`${API_SHOW}?movieId=${encodeURIComponent(movieId)}`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  }

  function fillMovie(m) {
    const titulo   = m.titulo || "Película";
    const poster   = m.caratula || m.poster || "";
    const fondo    = m.fondo || m.poster || "";
    const director = m.director || "";
    const generos  = m.generos || "";
    const duracion = m.duracion || "";
    const rating   = (typeof m.rating === "number") ? m.rating : (m.rating ? Number(m.rating) : null);
    const desc     = m.descripcion || "";

    document.title = titulo;
    setStyle("main.detalle-pelicula", "--fondo-pelicula", fondo ? `url('${fondo}')` : "");
    setAttr(".poster img", "src", poster);
    setAttr(".poster img", "alt", `Poster ${titulo}`);

    setText("#titulo",  titulo);
    setText("#genero",  generos);
    setText("#rating",  rating!=null ? `${stars(rating)} (${rating}/5)` : "—");
    setText("#sinopsis",desc);
    setText("#director",director);
    setText("#duracion",duracion);
    setText("#estado",  (m.activo!==false) ? "En cartelera" : "Próximo estreno");

    // prepara botón reservar para flujo de login → reservación
    const btn = qs("#btn-reservar");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        // si el usuario presiona aquí sin seleccionar horario,
        // lo mandamos a reservación con la movieId para que allá escoja un horario
        location.href = `../reservacion/reservacion.html?movieId=${m.id}`;
      });
    }
  }

  function renderShowtimes(movie, list) {
    const cont = qs("#horarios-grid");
    if (!cont) return;
    if (!Array.isArray(list) || list.length===0) {
      cont.innerHTML = `<p style="opacity:.7">No hay horarios disponibles.</p>`;
      return;
    }
    cont.innerHTML = list.map(s => `
      <button class="horario"
        data-id="${s.id}"
        title="${new Date(s.fechaHora).toLocaleString('es-CO')}">
        ${fmtShowtime(s)}
      </button>
    `).join("");

    cont.querySelectorAll("button.horario").forEach(btn => {
      btn.addEventListener("click", () => {
        const sid = btn.getAttribute("data-id");
        // navega a reservación con movieId y showtimeId
        location.href = `../reservacion/reservacion.html?movieId=${movie.id}&showtimeId=${sid}`;
      });
    });
  }

  async function main() {
    try {
      const p = new URLSearchParams(location.search);
      const movieId = p.get("id");
      if (!movieId) throw new Error("Falta ?id=... en la URL");

      const [movie, showtimes] = await Promise.all([
        fetchMovieById(movieId),
        fetchShowtimes(movieId)
      ]);

      fillMovie(movie);
      renderShowtimes(movie, showtimes);
    } catch (e) {
      console.error("[detalles] error:", e);
      const cont = qs(".detalle-pelicula .info");
      if (cont) cont.insertAdjacentHTML("beforeend",
        `<p style="color:#b00020;">No pude cargar los detalles/horarios.</p>`);
    }
  }

  main();
})();
