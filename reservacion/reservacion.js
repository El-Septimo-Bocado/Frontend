// =====================================================
// reservacion.js — Carga de meta, asientos y comidas
// =====================================================

// ====== 1) CARGA Y PINTADO DE PELÍCULA DESDE #pm O localStorage ======
(function initMeta() {
  const $ = (s, ctx=document) => ctx.querySelector(s);

  function getPM() {
    // a) hash #pm=...
    if (location.hash.startsWith("#pm=")) {
      try {
        const raw = decodeURIComponent(location.hash.slice(4));
        const obj = JSON.parse(raw);
        // limpiar el hash para que no moleste al refrescar
        history.replaceState(null, "", location.pathname + location.search);
        return obj;
      } catch (e) {
        console.error("[reservacion] pm en hash inválido:", e);
      }
    }
    // b) compat: localStorage.pendingMovie (por si refrescan)
    try {
      return JSON.parse(localStorage.getItem("pendingMovie") || "null");
    } catch {}
    return null;
  }

  function paint(meta) {
    const posterEl = $("#moviePoster");
    const titleEl  = $("#movieTitle");
    const dirEl    = $("#movieDirector");
    const genEl    = $("#movieGenres");
    const durEl    = $("#movieDuration");

    if (titleEl) titleEl.textContent = meta.titulo || "Película";
    if (dirEl)   dirEl.textContent   = meta.director || "—";
    if (genEl)   genEl.textContent   = meta.generos  || "—";
    if (durEl)   durEl.textContent   = meta.duracion || "—";
    if (posterEl && meta.poster) posterEl.src = meta.poster;

    const main = $(".reserva-main");
    if (main && meta.fondo) {
      main.style.backgroundImage = `url('${meta.fondo}')`;
      main.style.backgroundSize = "cover";
      main.style.backgroundPosition = "center";
      main.style.backgroundBlendMode = "multiply";
    }
  }

  const pm = getPM();
  const meta = {
    titulo:   pm?.titulo   || "Película",
    poster:   pm?.poster   || "",
    fondo:    pm?.fondo    || "",
    director: pm?.director || "",
    generos:  pm?.generos  || "",
    duracion: pm?.duracion || "",
  };

  // Pintar en el DOM
  paint(meta);

  // Guardar/mergar en reservaDraft (sin pisar lo existente)
  try {
    const draft = JSON.parse(localStorage.getItem("reservaDraft") || "{}");
    draft.id       = draft.id || ("r_" + Date.now());
    draft.pelicula = draft.pelicula || meta.titulo;
    draft.meta     = { ...(draft.meta || {}), ...meta };
    localStorage.setItem("reservaDraft", JSON.stringify(draft));
  } catch (e) {
    console.warn("[reservacion] no pude actualizar reservaDraft", e);
  }
})();

// ====== 2) INTERACCIÓN EN RESERVA (horario, asientos, total de boletas) ======
(() => {
  const PRECIO_ASIENTO = 8000;
  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  let total = 0;
  let horarioSeleccionado = null;
  let asientosSeleccionados = [];

  const btnTotal      = $("#btn-total");
  const btnConfirmar  = $("#btn-confirmar");
  const horariosBtns  = $$(".btn-horario");
  const asientosBtns  = $$(".asiento");
  const modalErrorIn  = $("#modal-error");
  const mensajeError  = $("#mensaje-error");

  const actualizarTotal = () => {
    if (btnTotal) btnTotal.textContent = `$${Number(total).toLocaleString("es-CO")} COP`;
  };
  actualizarTotal();

  // Horarios
  horariosBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      horariosBtns.forEach(b => b.classList.remove("seleccionado"));
      btn.classList.add("seleccionado");
      horarioSeleccionado = btn.textContent.trim();
    });
  });

  // Asientos
  asientosBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("ocupado")) return;

      const id = btn.textContent.trim();
      const ahoraSeleccionado = btn.classList.toggle("seleccionado");

      if (ahoraSeleccionado) {
        asientosSeleccionados.push(id);
        total += PRECIO_ASIENTO;
      } else {
        asientosSeleccionados = asientosSeleccionados.filter(x => x !== id);
        total -= PRECIO_ASIENTO;
      }
      actualizarTotal();
    });
  });

  // Confirmar -> valida, guarda draft (NO pierde meta) y va a comidas
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", () => {
      if (!horarioSeleccionado || asientosSeleccionados.length === 0) {
        if (modalErrorIn && mensajeError) {
          mensajeError.textContent = "Debes seleccionar un horario y al menos un asiento.";
          modalErrorIn.checked = true;
        } else {
          alert("Debes seleccionar un horario y al menos un asiento.");
        }
        return;
      }

      let draft = null;
      try { draft = JSON.parse(localStorage.getItem("reservaDraft") || "null"); } catch {}
      if (!draft) draft = {};

      draft.id         = draft.id || ("r_" + Date.now());
      draft.pelicula   = draft.pelicula || ($(".reserva-detalles h2")?.textContent || "Película");
      draft.meta       = draft.meta || {}; // ya está cargado en initMeta
      draft.fecha      = new Date().toLocaleDateString("es-CO");
      draft.fechaLarga = new Date().toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
      draft.horario    = horarioSeleccionado;
      draft.asientos   = [...asientosSeleccionados];
      draft.comidas    = draft.comidas || [];
      draft.costos     = {
        boletas: total,
        comida : draft.costos?.comida || 0,
        cargo  : draft.costos?.cargo  || 0,
        total  : total + (draft.costos?.comida || 0) + (draft.costos?.cargo || 0)
      };
      draft.estado     = "activa";

      localStorage.setItem("reservaDraft", JSON.stringify(draft));
      localStorage.setItem("totalBoletas", String(total)); // compat vieja
      window.location.href = "reservacioncomida.html";
    });
  }
})();

// ====== 3) PANTALLA COMIDAS (solo si existen controles) ======
(() => {
  const $  = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
  const money = (v) => `$${Number(v||0).toLocaleString("es-CO")} COP`;

  const botonesComida = $$(".btn-comprar");
  const btnContinuar  = $("#btn-continuar");
  const btnTotal      = $("#btn-total");

  // Si no estamos en la pantalla de comidas, no hacemos nada
  if (!botonesComida.length && !btnContinuar) return;

  // Cargar draft y total inicial con boletas
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem("reservaDraft") || "null"); } catch {}
  if (!draft) draft = {};

  let total = Number(draft?.costos?.boletas || 0);
  const actualizarTotal = () => { if (btnTotal) btnTotal.textContent = money(total); };
  actualizarTotal();

  // Toggle selección de comidas
  botonesComida.forEach(btn => {
    btn.addEventListener("click", () => {
      const card   = btn.closest(".card");
      const nombre = btn.dataset.comida || "Producto";
      const precio = parseInt(btn.dataset.precio || "0", 10) || 0;

      if (card.classList.contains("seleccionado")) {
        // Quitar
        card.classList.remove("seleccionado");
        draft.comidas = (draft.comidas || []).filter(c => c.nombre !== nombre);
        total -= precio;
      } else {
        // Agregar
        card.classList.add("seleccionado");
        draft.comidas = [...(draft.comidas || []), { nombre, precio }];
        total += precio;
      }
      actualizarTotal();
    });
  });

  // Continuar -> consolida totales y va a recibo
  if (btnContinuar) {
    btnContinuar.addEventListener("click", () => {
      // Seguridad: debe venir de Reservación con horario + asientos
      if (!(draft.asientos && draft.asientos.length) || !draft.horario) {
        alert("⚠️ Primero selecciona horario y asientos.");
        return;
      }

      // 1) Tomar exactamente lo seleccionado en la UI
      const seleccionadas = Array.from($$(".card.seleccionado .btn-comprar"))
        .map(b => ({
          nombre: b.dataset.comida || "Producto",
          precio: parseInt(b.dataset.precio || "0", 10) || 0
        }));

      // 2) Guardar esa selección en el borrador
      draft.comidas = seleccionadas;

      // 3) Recalcular totales
      const boletas = Number(draft.costos?.boletas || 0);
      const totalComida = seleccionadas.reduce((s, c) => s + (c.precio || 0), 0);

      draft.costos = {
        boletas,
        comida: totalComida,
        cargo:  0,
        total:  boletas + totalComida
      };

      // 4) Persistir y navegar
      localStorage.setItem("reservaDraft", JSON.stringify(draft));
      window.location.href = "recibo.html";
    });
  }
})();

// ====== 4) CANCELAR (si existe el modal de cancelar) ======
(() => {
  const btnSiCancelar = document.querySelector("#btn-si-cancelar");
  if (btnSiCancelar) {
    btnSiCancelar.addEventListener("click", () => {
      localStorage.removeItem("reservaDraft");
      localStorage.removeItem("totalBoletas");
    });
  }
})();
