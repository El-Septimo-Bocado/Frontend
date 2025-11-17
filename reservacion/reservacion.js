(function () {
  const API_BASE = (window.Auth?.API_BASE) || "http://localhost:8080";
  const PRICE_PER_TICKET = 8000; // coincide con el texto "Boleta: $8.000"

  const qs = (sel) => document.querySelector(sel);
  const setText = (sel, text) => { const el = qs(sel); if (el) el.textContent = (text ?? ""); };
  const setAttr = (sel, attr, val) => { const el = qs(sel); if (el && val != null) el.setAttribute(attr, val); };

  // Estado en memoria
  let currentShowtimeId = null;
  let currentShowtimeLabel = "";
  let selectedSeats = new Set();

  // 🔹 OVERRIDE GLOBAL DEL BOTÓN CANCELAR
  // Cualquier click que salga de #btn-cancelar se intercepta aquí
  document.addEventListener("click", (ev) => {
    const btnCancelar = ev.target.closest("#btn-cancelar");
    if (!btnCancelar) return;

    ev.preventDefault();
    ev.stopPropagation();

    // 💥 limpiar todo rastro de la reserva
    try {
      localStorage.removeItem("reservaDraft");
      // Si algún día quieres que también se olvide la peli pendiente:
      // localStorage.removeItem("pendingMovie");
    } catch (_) {}

    // 🚪 salir inmediatamente al inicio
    window.location.href = "../principal/index.html";
  }, true); // <<--- capture = true para ganarle a otros listeners

  // ===========================
  // 1. Leer película pendiente (hash #pm o localStorage.pendingMovie)
  // ===========================
  function parsePM() {
    if (location.hash.startsWith("#pm=")) {
      try {
        const raw = decodeURIComponent(location.hash.slice(4));
        const obj = JSON.parse(raw);
        history.replaceState(null, "", location.pathname + location.search);
        return obj;
      } catch (e) {
        console.warn("[reservación] pm inválido:", e);
      }
    }
    try {
      return JSON.parse(localStorage.getItem("pendingMovie") || "null");
    } catch (e) {
      console.warn("[reservación] pendingMovie inválido:", e);
      return null;
    }
  }

  async function fetchMovieById(id) {
    const res = await fetch(`${API_BASE}/api/movies/${id}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  }

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

  // ===========================
  // 2. Pintar info de película
  // ===========================
  function fillMovieInfo(m) {
    const titulo   = m.titulo || m.title || "Película";
    const poster   = m.poster || m.caratula || "";
    const director = m.director || "";
    const generos  = m.generos || "";
    const duracion = m.duracion || "";

    document.title = `Reservar - ${titulo}`;

    setAttr("#moviePoster", "src", poster);
    setAttr("#moviePoster", "alt", `Poster ${titulo}`);

    setText("#movieTitle", titulo);
    setText("#movieDirector", director || "—");
    setText("#movieGenres", generos || "—");
    setText("#movieDuration", duracion || "—");
  }

  // ===========================
  // 3. Total según asientos seleccionados
  // ===========================
  function updateTotal() {
    const btn = qs("#btn-total");
    if (!btn) return;
    const total = selectedSeats.size * PRICE_PER_TICKET;
    btn.textContent = `$${total.toLocaleString("es-CO")} COP`;
  }

  // ===========================
  // 4. Cargar asientos para un showtime
  // ===========================
  async function loadSeats(showtimeId) {
    const cont = qs("#asientos");
    if (!cont) return;
    cont.innerHTML = "<em>Cargando asientos…</em>";

    try {
      const res = await fetch(`${API_BASE}/api/showtimes/${encodeURIComponent(showtimeId)}/seats`);
      if (!res.ok) {
        cont.innerHTML = "<em>Error cargando asientos.</em>";
        return;
      }
      const seats = await res.json();
      if (!Array.isArray(seats) || !seats.length) {
        cont.innerHTML = "<em>No hay asientos para esta función.</em>";
        return;
      }

      // Ordenar por código (A1, A2, ..., B1...)
      seats.sort((a, b) => {
        const [ra, ca] = splitSeatCode(a.seatCode);
        const [rb, cb] = splitSeatCode(b.seatCode);
        if (ra === rb) return ca - cb;
        return ra.localeCompare(rb);
      });

      // Agrupar por fila
      const filas = seats.reduce((acc, s) => {
        const [row] = splitSeatCode(s.seatCode);
        if (!acc[row]) acc[row] = [];
        acc[row].push(s);
        return acc;
      }, {});

      cont.innerHTML = Object.entries(filas).map(([row, rowSeats]) => {
        const botones = rowSeats.map(s => {
          const code = s.seatCode;
          const status = s.status; // DISPONIBLE, RESERVADO, OCUPADO

          let classes = "asiento";
          let disabled = "";
          if (status === "OCUPADO" || status === "RESERVADO") {
            classes += " ocupado";
            disabled = "disabled";
          }

          return `<button class="${classes}" data-seat="${code}" ${disabled}>${code}</button>`;
        }).join("");

        return `
          <div class="fila-asientos">
            <span class="fila-label">${row}</span>
            <div class="fila-botones">
              ${botones}
            </div>
          </div>
        `;
      }).join("");

      // Wire de selección de asientos
      selectedSeats = new Set();
      updateTotal();

      cont.querySelectorAll(".asiento").forEach(btn => {
        if (btn.classList.contains("ocupado")) return;

        btn.addEventListener("click", () => {
          const code = btn.getAttribute("data-seat");
          if (btn.classList.contains("seleccionado")) {
            btn.classList.remove("seleccionado");
            selectedSeats.delete(code);
          } else {
            btn.classList.add("seleccionado");
            selectedSeats.add(code);
          }
          updateTotal();
        });
      });

    } catch (e) {
      console.error("[reservación] error al cargar asientos:", e);
      cont.innerHTML = "<em>Error cargando asientos.</em>";
    }
  }

  function splitSeatCode(code) {
    if (!code) return ["", 0];
    const row = code[0];
    const col = parseInt(code.slice(1), 10) || 0;
    return [row, col];
  }

  // ===========================
  // 5. Cargar horarios
  // ===========================
  async function loadShowtimes(movieId) {
    const cont = document.getElementById("horarios");
    if (!cont) return;
    cont.innerHTML = "<em>Cargando horarios…</em>";

    const asientosCont = qs("#asientos");
    if (asientosCont) {
      asientosCont.innerHTML = "<em>Selecciona un horario para ver los asientos.</em>";
    }

    try {
      const res = await fetch(`${API_BASE}/api/showtimes?movieId=${encodeURIComponent(movieId)}`);
      if (!res.ok) {
        cont.innerHTML = "<em>Error cargando horarios</em>";
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) {
        cont.innerHTML = "<em>Sin horarios para esta película.</em>";
        return;
      }

      cont.innerHTML = data.map(st => {
        const fecha = new Date(st.fechaHora);
        const etiqueta =
          `${fecha.toLocaleDateString("es-CO",{ weekday:"short", day:"2-digit", month:"short" })} ` +
          `${fecha.toLocaleTimeString("es-CO",{ hour:"2-digit", minute:"2-digit" })} — ${st.sala}`;
        return `
          <button
            class="btn-horario"
            data-id="${st.id}"
            data-fecha="${st.fechaHora}"
            data-sala="${st.sala || ""}"
          >
            ${etiqueta}
          </button>
        `;
      }).join("");

      const botones = cont.querySelectorAll(".btn-horario");
      botones.forEach(btn => {
        btn.addEventListener("click", () => {
          botones.forEach(b => b.classList.remove("seleccionado"));
          btn.classList.add("seleccionado");

          currentShowtimeId = btn.getAttribute("data-id");
          currentShowtimeLabel = btn.textContent.trim();
          console.log("[reservación] horario seleccionado:", currentShowtimeId, currentShowtimeLabel);

          selectedSeats = new Set();
          updateTotal();
          loadSeats(currentShowtimeId);
        });
      });

    } catch (e) {
      console.error(e);
      cont.innerHTML = "<em>Error cargando horarios</em>";
    }
  }

  // ===========================
  // 6. Confirmar (hold + draft + ir a comida)
  // ===========================
  async function onConfirm() {
    // Validaciones básicas
    if (!currentShowtimeId) {
      setText("#mensaje-error", "Debes seleccionar un horario.");
      const chk = qs("#modal-error");
      if (chk) chk.checked = true;
      return;
    }
    if (!selectedSeats.size) {
      setText("#mensaje-error", "Debes seleccionar al menos un asiento.");
      const chk = qs("#modal-error");
      if (chk) chk.checked = true;
      return;
    }

    // Asegurarnos de que hay sesión (por si acaso)
    try { Auth.requireLogin(); } catch { return; }

    const seatCodes = Array.from(selectedSeats);
    console.log("[reservación] confirmando. showtime:", currentShowtimeId, " seats:", seatCodes);

    try {
      const res = await Auth.apiFetch(
        `${API_BASE}/api/showtimes/${encodeURIComponent(currentShowtimeId)}/seats/hold`,
        {
          method: "POST",
          body: JSON.stringify({ seatCodes })
        }
      );

      if (res.status === 409) {
        setText("#mensaje-error", "Alguno de los asientos ya no está disponible. Actualiza la página y vuelve a intentarlo.");
        const chk = qs("#modal-error");
        if (chk) chk.checked = true;
        return;
      }

      if (!res.ok) {
        console.error("[reservación] fallo hold:", res.status);
        setText("#mensaje-error", "No se pudieron bloquear los asientos. Intenta de nuevo.");
        const chk = qs("#modal-error");
        if (chk) chk.checked = true;
        return;
      }

      const data = await res.json(); // { holdId, expiresAt }
      const holdId = data.holdId;

      // Construir meta para el borrador de reserva
      const meta = {
        titulo:   qs("#movieTitle")?.textContent || "Película",
        poster:   qs("#moviePoster")?.getAttribute("src") || "",
        director: qs("#movieDirector")?.textContent || "",
        generos:  qs("#movieGenres")?.textContent || "",
        duracion: qs("#movieDuration")?.textContent || ""
      };

      const boletasTotal = selectedSeats.size * PRICE_PER_TICKET;

      const draft = {
        meta,
        showtimeId: currentShowtimeId,
        holdId,
        asientos: seatCodes,
        horario: currentShowtimeLabel || "",
        costos: {
          boletas: boletasTotal,
          comida:  0,
          cargo:   0,
          total:   boletasTotal
        }
      };

      localStorage.setItem("reservaDraft", JSON.stringify(draft));

      // Ir a página de comida
      window.location.href = "reservacionComida.html";

    } catch (e) {
      console.error("[reservación] error al confirmar:", e);
      setText("#mensaje-error", "Ocurrió un error al confirmar la reservación.");
      const chk = qs("#modal-error");
      if (chk) chk.checked = true;
    }
  }

  // ===========================
  // 7. Main
  // ===========================
  async function main() {
    // Extra: asegurarnos que haya login (por si alguien entra directo)
    try { Auth.requireLogin(); } catch { return; }

    try {
      const params = new URLSearchParams(location.search);
      let id = params.get("id") || params.get("movieId");

      const pm = parsePM();
      console.log("[reservación] pm:", pm, " queryId:", id);

      let movie = null;
      let movieId = null;

      if (id) {
        movie = await fetchMovieById(id);
        movieId = movie.id;
      } else if (pm && (pm.id || pm.movieId)) {
        movieId = pm.id || pm.movieId;
        movie = await fetchMovieById(movieId);
      } else if (pm) {
        fillMovieInfo(pm);
        movieId = await ensureMovieIdByTitle(pm.titulo || pm.title);
        if (movieId) {
          await loadShowtimes(movieId);
        }
        return;
      } else {
        throw new Error("Sin datos de película para la reservación.");
      }

      fillMovieInfo(movie);
      if (movieId) {
        await loadShowtimes(movieId);
      }

      // Wire del botón Confirmar
      const btnConfirmar = qs("#btn-confirmar");
      if (btnConfirmar) {
        btnConfirmar.addEventListener("click", onConfirm);
      }

    } catch (err) {
      console.error("[reservación] error:", err);
      const mainEl = qs(".reserva-main");
      if (mainEl) {
        mainEl.innerHTML = `
          <p style="color:#b00020; padding:20px;">
            No pude cargar la información de la película para la reservación.
          </p>`;
      }
    }
  }

  main();
})();
