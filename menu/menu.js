// menu.js - cliente fetch para /api/menu
const API_BASE = "http://localhost:8080/api/menu";

/* HELPERS */

// Convierte link de Drive "file/d/ID/view" a link usable <img>
function driveToViewUrl(url) {
  try {
    if (!url) return url;
    // si ya es uc?export=view...
    if (url.includes("uc?export=view")) return url;
    const m = url.match(/\/d\/([^\/]+)\//);
    if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
    return url;
  } catch (e) { return url; }
}

/* CRUD */

// GET todos
async function getMenuProductos() {
  const resp = await fetch(API_BASE);
  if (!resp.ok) throw new Error(`Error ${resp.status}`);
  const data = await resp.json();
  // convertir drive links si hay
  return data.map(p => ({ ...p, imageUrl: driveToViewUrl(p.imageUrl) }));
}

// GET por id
async function getProductoById(id) {
  const resp = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
  if (!resp.ok) throw new Error(`Producto ${id} no encontrado (${resp.status})`);
  const p = await resp.json();
  p.imageUrl = driveToViewUrl(p.imageUrl);
  return p;
}

// POST crear
async function createProducto(producto) {
  // backend espera JSON con todos los campos (todos obligatorios según confirmaste)
  const body = { ...producto };
  const resp = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Error creando producto ${resp.status}: ${t}`);
  }
  return await resp.json();
}

// PUT actualizar
async function updateProducto(id, producto) {
  const resp = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(producto)
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Error actualizando ${resp.status}: ${t}`);
  }
  return await resp.json();
}

// DELETE
async function deleteProducto(id) {
  const resp = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Error eliminando ${resp.status}: ${t}`);
  }
  return;
}

// BUSCAR con query params (nombre, categoria, activo, precioMin, precioMax)
async function buscarMenuProductos({ nombre, categoria, activo, precioMin, precioMax }) {
  const params = new URLSearchParams();
  if (nombre) params.append("nombre", nombre);
  if (categoria) params.append("categoria", categoria);
  if (activo !== undefined && activo !== null && activo !== "") params.append("activo", activo);
  if (precioMin !== undefined && precioMin !== null && precioMin !== "") params.append("precioMin", precioMin);
  if (precioMax !== undefined && precioMax !== null && precioMax !== "") params.append("precioMax", precioMax);

  const resp = await fetch(`${API_BASE}/buscar?${params.toString()}`);
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Error buscando ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  return data.map(p => ({ ...p, imageUrl: driveToViewUrl(p.imageUrl) }));
}
