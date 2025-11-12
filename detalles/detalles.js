
(function () {
  const API_BASE = (window.Auth?.API_BASE) || "http://localhost:8080";

  const qs = (sel) => document.querySelector(sel);
  const setText = (sel, text) => { const el = qs(sel); if (el) el.textContent = (text ?? ""); };
  const setAttr = (sel, attr, val) => { const el = qs(sel); if (el && val != null) el.setAttribute(attr, val); };
  const setStyle = (sel, prop, val) => { const el = qs(sel); if (el && val) el.style.setProperty(prop, val); };

  // ⭐ 0..5 → estrellitas (acepta medios)
  function stars(r) {
    const num = (typeof r === "number") ? r : (r ? Number(r) : NaN);
    if (Number.isNaN(num)) return "—";
    const full = Math.floor(num);
    const half  = (num - full) >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "☆" : "") + "☆".repeat(empty);
  }

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

  async function fetchMovieById(id) {
    const res = await fetch(`${API_BASE}/api/movies/${id}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  }

  // Para cuando venimos sin id pero con título (busca por título)
  async function ensureMovieIdByTitle(title) {
    if (!title) return null;
    const res = await fetch(`${API_BASE}/api/movies`);
    if (!res.ok) return null;
    const all = await res.json();
    const found = (Array.isArray(all) ? all : []).find(m =>
      (m.titulo || "").toLowerCase() === title.toLowerCase()
    );
    return found?.id || null;
  }

  function wireReserveButton(movieMeta) {
    const btn = document.querySelector(".btn-reservar");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const meta = {
        movieId:  movieMeta.id || movieMeta.movieId || null,
        titulo:   movieMeta.titulo || movieMeta.title || "Película",
        poster:   movieMeta.poster || movieMeta.caratula || "",
        fondo:    movieMeta.fondo  || "",
        director: movieMeta.director || "",
        generos:  movieMeta.generos || "",
        duracion: movieMeta.duracion || ""
      };

      // recordamos destino + meta para regresar tras login
      if (window.Auth?.rememberReservation) {
        Auth.rememberReservation(meta, "../reservacion/reservacion.html");
      } else {
        localStorage.setItem("pendingMovie", JSON.stringify(meta));
        localStorage.setItem("reservacionDestino", "../reservacion/reservacion.html");
      }

      // Si ya hay sesión → vamos directo con #pm
      if (window.Auth?.requireLogin) {
        try {
          Auth.requireLogin(() => {
            const pm = encodeURIComponent(JSON.stringify(meta));
            window.location.href = `../reservacion/reservacion.html#pm=${pm}`;
          });
        } catch { /* redirigido a /auth/login.html */ }
      } else {
        // fallback sin módulo Auth
        const pm = encodeURIComponent(JSON.stringify(meta));
        window.location.href = `../auth/login.html#pm=${pm}`;
      }
    });
  }

  function fillDOM(m) {
    const titulo   = m.titulo || m.title || "Película";
    const poster   = m.poster || m.caratula || "";
    const fondo    = m.fondo || m.poster || "";
    const director = m.director || "";
    const generos  = m.generos || "";
    const duracion = m.duracion || "";
    const rating   = (typeof m.rating === "number") ? m.rating : (m.rating ? Number(m.rating) : null);
    const desc     = m.descripcion || m.description || m.sinopsis || "";
    const activo   = (typeof m.activo === "boolean") ? m.activo : true;

    document.title = titulo;
    setStyle("main.detalle-pelicula", "--fondo-pelicula", fondo ? `url('${fondo}')` : "");
    setAttr("#poster-img", "src", poster);
    setAttr("#poster-img", "alt", `Poster ${titulo}`);

    setText("#titulo",  titulo);
    setText("#genero",  generos);
    setText("#rating",  (rating != null) ? `${stars(rating)} (${rating}/5)` : "—");
    setText("#sinopsis", desc);
    setText("#director", director || "—");
    setText("#duracion", duracion || "—");
    setText("#estado",   activo ? "En cartelera" : "Próximo estreno");

    wireReserveButton(m);
  }

  async function loadShowtimes(movieId) {
    const cont = document.getElementById("horarios-grid");
    if (!cont) return;
    cont.innerHTML = "<em>Cargando horarios…</em>";

    try {
      const res = await fetch(`${API_BASE}/api/showtimes?movieId=${encodeURIComponent(movieId)}`);
      if (!res.ok) { cont.innerHTML = "<em>Error cargando horarios</em>"; return; }
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) { cont.innerHTML = "<em>Sin horarios</em>"; return; }

      cont.innerHTML = data.map(st => {
        const fecha = new Date(st.fechaHora);
        const etiqueta =
          `${fecha.toLocaleDateString("es-CO",{weekday:"short",day:"2-digit",month:"short"})} ` +
          `${fecha.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"})} — ${st.sala}`;
        return `<div class="horario">${etiqueta}</div>`;
      }).join("");
    } catch (e) {
      console.error(e);
      cont.innerHTML = "<em>Error cargando horarios</em>";
    }
  }

  async function main() {
    try {
      let movie = null;
      let movieId = null;

      // 1) ?id=…
      const params = new URLSearchParams(location.search);
      const id = params.get("id");
      if (id) {
        movie = await fetchMovieById(id);
        fillDOM(movie);
        await loadShowtimes(movie.id);
        return;
      }

      // 2) #pm=…
      const pm = parsePM();
      if (pm && pm.id) {
        movie = await fetchMovieById(pm.id);
        fillDOM(movie);
        await loadShowtimes(movie.id);
        return;
      }

      // 3) Fallback: solo meta (sin id) → pintar y buscar id por título
      if (pm) {
        fillDOM(pm);
        movieId = await ensureMovieIdByTitle(pm.titulo || pm.title);
        if (movieId) await loadShowtimes(movieId);
        return;
      }

      throw new Error("Sin id/pm para cargar detalles.");
    } catch (err) {
      console.error("[detalles] error:", err);
      const cont = document.querySelector(".detalle-pelicula .info");
      if (cont) cont.innerHTML =
        `<p style="color:#b00020;">No pude cargar los detalles de la película.</p>`;
    }
  }

  main();
})();

