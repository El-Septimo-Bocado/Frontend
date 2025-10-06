// =====================================================
// menu.js — Carga del menú desde el backend
// =====================================================

(function () {
  // Dirección del backend
  const API = "http://localhost:8080/api/menu";

  // Normaliza los campos para que coincidan con lo que pinta el HTML
  const mapItem = (raw) => ({
    id: raw.id,
    nombre: raw.nombre || raw.title || "Producto sin nombre",
    descripcion: raw.descripcion || raw.description || "",
    precio: raw.precio ?? raw.price ?? 0,
    imagen: raw.imageUrl || raw.imagen || raw.poster || "",
    categoria: (raw.categoria || raw.category || "general").toLowerCase()
  });

  // Formatea el precio en formato colombiano
  const money = (v) => {
    const n = Number(v || 0);
    return `$${n.toLocaleString("es-CO")} COP`;
  };

  // Crea el HTML de una tarjeta
  function cardHTML(item) {
    const alt = item.nombre?.replace(/"/g, "&quot;") || "Producto";
    const desc = item.descripcion ? `<p>${item.descripcion}</p>` : "";
    const img = item.imagen
      ? `<img src="${item.imagen}" alt="${alt}" style="width:100%; border-radius:8px; margin-bottom:10px;">`
      : `<div style="width:100%;height:180px;border-radius:8px;margin-bottom:10px;background:#eee;display:flex;align-items:center;justify-content:center;color:#666;">Sin imagen</div>`;
    return `
      <div class="card">
        ${img}
        <h3>${item.nombre}</h3>
        ${desc}
        <span class="price">${money(item.precio)}</span>
      </div>
    `;
  }

  // Renderiza las tarjetas en un contenedor
  function renderList(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!items.length) {
      el.innerHTML = `<p style="opacity:.7;">No hay elementos para mostrar.</p>`;
      return;
    }
    el.innerHTML = items.map(cardHTML).join("");
  }

  // Mostrar mensaje "Cargando..."
  const loading = document.getElementById("menu-platos");
  if (loading) {
    loading.innerHTML = `<p style="opacity:.7;">Cargando menú...</p>`;
  }

  // Llamada al backend
  fetch(API)
    .then(res => {
      if (!res.ok) throw new Error("Error HTTP " + res.status);
      return res.json();
    })
    .then(data => {
      const items = Array.isArray(data) ? data.map(mapItem) : [];

      // Si tu backend tiene categorías (platos, postres, bebidas)
      const platos = items.filter(i =>
        ["plato", "comida", "food", "general"].includes(i.categoria)
      );
      const postres = items.filter(i =>
        ["postre", "dessert"].includes(i.categoria)
      );
      const bebidas = items.filter(i =>
        ["bebida", "drink"].includes(i.categoria)
      );

      renderList("menu-platos", platos.length ? platos : items);
      renderList("menu-postres", postres);
      renderList("menu-bebidas", bebidas);
    })
    .catch(err => {
      console.error("[menu] Error al cargar /api/menu:", err);
      const all = document.getElementById("menu-platos");
      if (all) {
        all.innerHTML = `
          <p style="color:#b00020;">No pude cargar el menú desde el backend.</p>
          <p style="opacity:.7;">Verifica que el backend está corriendo en <code>${API}</code> y que CORS está habilitado.</p>
        `;
      }
    });
})();