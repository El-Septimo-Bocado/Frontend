// admin/admin.js
(function () {
  const API_BASE = (window.Auth?.API_BASE) || "http://localhost:8080";

  const qs  = (sel) => document.querySelector(sel);
  const qsa = (sel) => document.querySelectorAll(sel);

  // Mapea lo que ve el admin en el combo a lo que guarda el back
  const categoriaMap = {
    "Comida": "plato",
    "Postre": "postre",
    "Bebida": "bebida"
  };

  // Para mostrar bonito en tablas/combos cuando viene del back
  const categoriaLabelMap = {
    "plato":  "Platos estrella",
    "postre": "Postres y dulces",
    "bebida": "Bebidas"
  };

  // ============================
  // Helpers de estado película
  // ============================
  function estadoToLabel(estado, activo) {
    const e = (estado || "").toUpperCase();
    if (e === "ACTIVA")        return "Activa";
    if (e === "PROXIMAMENTE")  return "Próximamente";
    if (e === "INACTIVA")      return "Inactiva";
    // Fallback por si hay pelis viejas sin estado
    return activo ? "Activa" : "Inactiva";
  }

  function uiEstadoToBackend(value) {
    // value viene del <select> o <radio>: "Activa", "Proximamente", "Inactiva"
    if (value === "Activa")       return { estado: "ACTIVA",       activo: true };
    if (value === "Proximamente") return { estado: "PROXIMAMENTE", activo: true };
    if (value === "Inactiva")     return { estado: "INACTIVA",     activo: false };
    // fallback
    return { estado: "ACTIVA", activo: true };
  }

  function backendEstadoToUi(estado, activo) {
    const e = (estado || "").toUpperCase();
    if (e === "ACTIVA")       return "Activa";
    if (e === "PROXIMAMENTE") return "Proximamente";
    if (e === "INACTIVA")     return "Inactiva";
    // Fallback según activo
    return activo ? "Activa" : "Inactiva";
  }

  // ============================
  // Helpers estado MENÚ
  // ============================
  function estadoMenuToLabel(estado, activo) {
    const e = (estado || "").toUpperCase();
    if (e === "ACTIVO")   return "Activo";
    if (e === "INACTIVO") return "Inactivo";
    return activo ? "Activo" : "Inactivo";
  }

  // ============================
  // 0. Proteger pantalla admin
  // ============================
  function ensureAdmin() {
    try {
      Auth.requireLogin();
    } catch {
      return;
    }
    const data = Auth.getUser();
    const user = data?.user;
    const rol  = (user?.rol || user?.role || "").toUpperCase();

    if (rol !== "ADMIN") {
      // si no es admin, lo sacamos al inicio
      window.location.href = "../principal/index.html";
    }
  }

  // ============================
  // 1. PELÍCULAS
  // ============================

  async function loadPeliculas() {
    const tbody = qs("#tablaPeliculas");
    const selEditar = qs("#selectPeliculaEditar");
    const selBorrar = qs("#deletePelicula");
    if (!tbody || !selEditar || !selBorrar) return;

    tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;
    selEditar.innerHTML = `<option value="">-- Selecciona una película --</option>`;
    selBorrar.innerHTML = `<option value="">-- Selecciona una película --</option>`;

    try {
      const res = await Auth.apiFetch(`${API_BASE}/api/movies`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      if (!Array.isArray(data) || !data.length) {
        tbody.innerHTML = `<tr><td colspan="5">Sin películas registradas.</td></tr>`;
        return;
      }

      tbody.innerHTML = "";
      data.forEach(m => {
        const estadoLabel = estadoToLabel(m.estado, m.activo);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${m.titulo || ""}</td>
          <td>${m.duracion || ""}</td>
          <td>${m.generos || ""}</td>
          <td>${estadoLabel}</td>
          <td>${m.director || ""}</td>
        `;
        tbody.appendChild(tr);

        const opt1 = document.createElement("option");
        opt1.value = m.id;
        opt1.textContent = m.titulo;
        selEditar.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = m.id;
        opt2.textContent = m.titulo;
        selBorrar.appendChild(opt2);
      });
    } catch (e) {
      console.error(e);
      tbody.innerHTML = `<tr><td colspan="5" style="color:#b00020">Error cargando películas.</td></tr>`;
    }
  }

  function wireCrearPelicula() {
    const form = qs("#formCrearPelicula");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo   = qs("#peliculaTitulo").value.trim();
      const durMin   = qs("#peliculaDuracion").value.trim();
      const clasif   = qs("#peliculaClasificacion").value.trim();
      const director = qs("#peliculaReparto").value.trim();
      const sinopsis = qs("#peliculaSinopsis").value.trim();

      const poster   = qs("#peliculaPoster")?.value.trim() || "";
      const fondo    = qs("#peliculaFondo")?.value.trim() || "";
      const caratula = qs("#peliculaCaratula")?.value.trim() || "";
      const rating   = qs("#peliculaRating")?.value.trim() || "";
      const trailer  = qs("#peliculaTrailer")?.value.trim() || "";

      const estadoUi = qs("#peliculaEstado")?.value || "Activa";
      const { estado, activo } = uiEstadoToBackend(estadoUi);

      if (!titulo || !durMin || !clasif || !director || !sinopsis) {
        alert("Por favor completa todos los campos obligatorios de la película.");
        return;
      }

      const payload = {
        titulo,
        duracion: durMin + " min",
        generos: clasif,
        director,
        descripcion: sinopsis,
        poster: poster || null,
        fondo: fondo || null,
        caratula: caratula || null,
        rating: rating ? Number(rating) : null,
        estado,          // ACTIVA / PROXIMAMENTE / INACTIVA
        activo,          // true / false
        trailerUrl: trailer || null
      };

      try {
        const res = await Auth.apiFetch(`${API_BASE}/api/movies`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        await loadPeliculas();
        alert("Película creada correctamente.");
      } catch (e) {
        console.error(e);
        alert("Error al crear película.");
      }
    });
  }

  function wireEditarPelicula() {
    const sel = qs("#selectPeliculaEditar");
    const form = qs("#formEditarPelicula");
    if (!sel || !form) return;

    let peliculasCache = [];

    async function refreshCache() {
      try {
        const res = await Auth.apiFetch(`${API_BASE}/api/movies`);
        if (!res.ok) throw new Error();
        peliculasCache = await res.json();
      } catch {
        peliculasCache = [];
      }
    }

    // Cargamos cache al iniciar
    refreshCache();

    sel.addEventListener("change", () => {
      const id = sel.value;
      if (!id) {
        form.reset();
        return;
      }
      const m = peliculasCache.find(p => String(p.id) === String(id));
      if (!m) return;

      qs("#editTitulo").value    = m.titulo || "";
      qs("#editDirector").value  = m.director || "";
      qs("#editDuracion").value  = (m.duracion || "").replace(" min", "");
      qs("#editSinopsis").value  = m.descripcion || "";
      qs("#editGeneros").value   = m.generos || "";
      qs("#editPoster").value    = m.poster || "";
      qs("#editFondo").value     = m.fondo || "";
      qs("#editCaratula").value  = m.caratula || "";
      qs("#editRating").value    = (m.rating != null ? m.rating : "");
      qs("#editTrailer").value   = m.trailerUrl || "";

      const estadoUi = backendEstadoToUi(m.estado, m.activo);
      const estadoRadios = qsa("input[name='estado']");
      estadoRadios.forEach(r => {
        r.checked = (r.value === estadoUi);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = sel.value;
      if (!id) {
        alert("Selecciona una película para editar.");
        return;
      }

      const titulo   = qs("#editTitulo").value.trim();
      const director = qs("#editDirector").value.trim();
      const durMin   = qs("#editDuracion").value.trim();
      const sinopsis = qs("#editSinopsis").value.trim();
      const generos  = qs("#editGeneros").value.trim();

      const poster   = qs("#editPoster").value.trim();
      const fondo    = qs("#editFondo").value.trim();
      const caratula = qs("#editCaratula").value.trim();
      const rating   = qs("#editRating").value.trim();
      const trailer  = qs("#editTrailer").value.trim();

      const estadoRadios = qsa("input[name='estado']");
      let estadoUi = "Activa";
      estadoRadios.forEach(r => {
        if (r.checked) estadoUi = r.value; // "Activa" / "Proximamente" / "Inactiva"
      });
      const { estado, activo } = uiEstadoToBackend(estadoUi);

      const payload = {
        titulo,
        duracion: durMin ? durMin + " min" : "",
        descripcion: sinopsis,
        director,
        generos,
        poster: poster || null,
        fondo: fondo || null,
        caratula: caratula || null,
        rating: rating ? Number(rating) : null,
        estado,       // ACTIVA / PROXIMAMENTE / INACTIVA
        activo,
        trailerUrl: trailer || null
      };

      try {
        const res = await Auth.apiFetch(`${API_BASE}/api/movies/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        await Promise.all([loadPeliculas(), refreshCache()]);
        alert("Película actualizada.");
      } catch (e) {
        console.error(e);
        alert("Error al actualizar película.");
      }
    });
  }

  function wireEliminarPelicula() {
    const form = qs("#formEliminarPelicula");
    const sel = qs("#deletePelicula");
    if (!form || !sel) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = sel.value;
      if (!id) {
        alert("Selecciona una película para marcar como inactiva.");
        return;
      }

      if (!confirm(
        "¿Seguro que deseas marcar esta película como INACTIVA?\n" +
        "- Ya no aparecerá en cartelera ni próximos estrenos.\n" +
        "- Se mantiene en el sistema para historial y funciones antiguas."
      )) {
        return;
      }

      try {
        const res = await Auth.apiFetch(`${API_BASE}/api/movies/${encodeURIComponent(id)}`, {
          method: "DELETE"
        });
        if (!res.ok && res.status !== 204) throw new Error("HTTP " + res.status);

        sel.value = "";
        await loadPeliculas();
        alert("Película marcada como inactiva correctamente.");
      } catch (e) {
        console.error(e);
        alert("Error al marcar la película como inactiva.");
      }
    });
  }

  // ============================
  // 2. MENÚ
  // ============================

  async function loadMenu() {
    const tbody = qs("#tablaMenu");
    const selEditar = qs("#selectMenuEditar");
    const selEliminar = qs("#selectMenuEliminar");
    if (!tbody || !selEditar || !selEliminar) return;

    tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;
    selEditar.innerHTML   = `<option value="">-- Selecciona un item --</option>`;
    selEliminar.innerHTML = `<option value="">-- Selecciona un item --</option>`;

    try {
      const res = await Auth.apiFetch(`${API_BASE}/api/menu`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      if (!Array.isArray(data) || !data.length) {
        tbody.innerHTML = `<tr><td colspan="5">Sin ítems en el menú.</td></tr>`;
        return;
      }

      tbody.innerHTML = "";
      data.forEach(item => {
        const labelSeccion = categoriaLabelMap[item.categoria] || item.categoria || "";
        const estadoLabel  = estadoMenuToLabel(item.estado, item.activo);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${labelSeccion}</td>
          <td>${item.nombre || ""}</td>
          <td>${item.descripcion || ""}</td>
          <td>$ ${item.precio != null ? item.precio : ""}</td>
          <td>${estadoLabel}</td>
        `;
        tbody.appendChild(tr);

        const opt1 = document.createElement("option");
        opt1.value = item.id;
        opt1.textContent = `${labelSeccion} - ${item.nombre}`;
        selEditar.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = item.id;
        opt2.textContent = `${labelSeccion} - ${item.nombre}`;
        selEliminar.appendChild(opt2);
      });
    } catch (e) {
      console.error(e);
      tbody.innerHTML = `<tr><td colspan="5" style="color:#b00020">Error cargando menú.</td></tr>`;
    }
  }

  function wireCrearMenu() {
    const form = qs("#formCrearMenu");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const seccion = qs("#menuSeccion").value; // Comida / Postre / Bebida
      const nombre  = qs("#menuNombre").value.trim();
      const desc    = qs("#menuDescripcion").value.trim();
      const precio  = qs("#menuPrecio").value.trim();
      const imagen  = qs("#menuImagen")?.value.trim() || "";

      if (!nombre || !desc || !precio) {
        alert("Completa todos los campos del ítem.");
        return;
      }

      const categoria = categoriaMap[seccion] || "plato"; // fallback

      const payload = {
        nombre,
        descripcion: desc,
        precio: Number(precio),
        imageUrl: imagen || null,
        categoria // plato/postre/bebida
        // activo/estado se resuelven en el backend
      };

      try {
        const res = await Auth.apiFetch(`${API_BASE}/api/menu`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        await loadMenu();
        alert("Ítem del menú creado.");
      } catch (e) {
        console.error(e);
        alert("Error al crear ítem del menú.");
      }
    });
  }

  function wireEditarMenu() {
    const sel = qs("#selectMenuEditar");
    const form = qs("#formEditarMenu");
    if (!sel || !form) return;

    let menuCache = [];

    async function refreshCache() {
      try {
        const res = await Auth.apiFetch(`${API_BASE}/api/menu`);
        if (!res.ok) throw new Error();
        menuCache = await res.json();
      } catch {
        menuCache = [];
      }
    }

    // carga inicial
    refreshCache();

    sel.addEventListener("change", () => {
      const id = sel.value;
      if (!id) {
        form.reset();
        return;
      }
      const item = menuCache.find(i => String(i.id) === String(id));
      if (!item) return;

      qs("#editMenuNombre").value       = item.nombre || "";
      qs("#editMenuDescripcion").value  = item.descripcion || "";
      qs("#editMenuPrecio").value       = item.precio != null ? item.precio : "";
      qs("#editMenuImagen").value       = item.imageUrl || "";

      const cat = (item.categoria || "").toLowerCase(); // plato / postre / bebida
      const radios = qsa("input[name='tipoMenu']");
      radios.forEach(r => {
        if (cat === "plato"  && r.value === "Comida")  r.checked = true;
        if (cat === "postre" && r.value === "Postre")  r.checked = true;
        if (cat === "bebida" && r.value === "Bebida")  r.checked = true;
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = sel.value;
      if (!id) {
        alert("Selecciona un ítem para editar.");
        return;
      }

      const nombre = qs("#editMenuNombre").value.trim();
      const desc   = qs("#editMenuDescripcion").value.trim();
      const precio = qs("#editMenuPrecio").value.trim();
      const imagen = qs("#editMenuImagen").value.trim();

      let seccion = "Comida";
      const radios = qsa("input[name='tipoMenu']");
      radios.forEach(r => {
        if (r.checked) seccion = r.value; // Comida/Postre/Bebida
      });

      const categoria = categoriaMap[seccion] || "plato";

      const payload = {
        nombre,
        descripcion: desc,
        precio: Number(precio),
        imageUrl: imagen || null,
        categoria
        // estado/activo quedan igual o se recalculan en back si hace falta
      };

      try {
        const res = await Auth.apiFetch(`${API_BASE}/api/menu/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        await Promise.all([loadMenu(), refreshCache()]);
        alert("Ítem del menú actualizado.");
      } catch (e) {
        console.error(e);
        alert("Error al actualizar ítem del menú.");
      }
    });
  }

  function wireEliminarMenu() {
    const form = qs("#formEliminarMenu");
    const sel = qs("#selectMenuEliminar");
    if (!form || !sel) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = sel.value;
      if (!id) {
        alert("Selecciona un ítem para marcar como inactivo.");
        return;
      }

      if (!confirm(
        "¿Seguro que deseas marcar este ítem como INACTIVO?\n" +
        "- Ya no aparecerá en el menú para los clientes.\n" +
        "- Se mantiene guardado en el sistema."
      )) {
        return;
      }

      try {
        const res = await Auth.apiFetch(`${API_BASE}/api/menu/${encodeURIComponent(id)}`, {
          method: "DELETE"
        });
        if (!res.ok && res.status !== 204) throw new Error("HTTP " + res.status);

        sel.value = "";
        await loadMenu();
        alert("Ítem marcado como inactivo correctamente.");
      } catch (e) {
        console.error(e);
        alert("Error al marcar el ítem como inactivo.");
      }
    });
  }

  // ============================
  // 3. BOTÓN "ACTUALIZAR"
  // ============================
  function wireRefreshButton() {
    const btn = qs(".btn-update");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      await Promise.all([loadPeliculas(), loadMenu()]);
      alert("Datos recargados.");
    });
  }

  // ============================
  // 4. MAIN
  // ============================
  async function main() {
    ensureAdmin();
    await Promise.all([loadPeliculas(), loadMenu()]);

    wireCrearPelicula();
    wireEditarPelicula();
    wireEliminarPelicula();

    wireCrearMenu();
    wireEditarMenu();
    wireEliminarMenu();

    wireRefreshButton();
  }

  document.addEventListener("DOMContentLoaded", main);
})();
