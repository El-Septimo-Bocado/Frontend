// usuarios.js - servicio + helpers para el CRUD (fetch)
// ponlo en la misma carpeta que usuarios.html / edit_usuario.html
const API_URL = "http://localhost:8080/api/usuarios";

/**
 * Devuelve array de usuarios (JSON).
 */
async function getUsuarios() {
  const resp = await fetch(API_URL);
  if (!resp.ok) {
    throw new Error(`Error ${resp.status}`);
  }
  return await resp.json();
}

/**
 * Obtener usuario por id
 */
async function getUsuarioById(id) {
  const resp = await fetch(`${API_URL}/${encodeURIComponent(id)}`);
  if (!resp.ok) throw new Error(`Usuario ${id} no encontrado (${resp.status})`);
  return await resp.json();
}

/**
 * Crear usuario. usuario = { nombre, email, edad }
 */
async function createUsuario(usuario) {
  const resp = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Error creando usuario ${resp.status}: ${txt}`);
  }
  return await resp.json();
}

/**
 * Actualizar usuario por id (PUT)
 */
async function updateUsuario(id, usuario) {
  const resp = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Error actualizando usuario ${resp.status}: ${txt}`);
  }
  return await resp.json();
}

/**
 * Eliminar usuario
 */
async function deleteUsuario(id) {
  const resp = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Error eliminando usuario ${resp.status}: ${txt}`);
  }
  // devuelve void (204)
  return;
}

/**
 * Buscar usuarios: nombre obligatorio (según controller),
 * email opcional, edad obligatoria según firma (pero controller pasa email opcional).
 * Para evitar 400, si edad es vacío lo pasamos como 0? Mejor pasarlo solo si existe.
 */
async function buscarUsuarios(nombre, email, edad) {
  if (!nombre) throw new Error("Nombre requerido para buscar");
  const params = new URLSearchParams();
  params.append("nombre", nombre);
  if (email) params.append("email", email);
  if (edad !== "" && edad !== undefined && edad !== null) params.append("edad", String(edad));
  const resp = await fetch(`${API_URL}/buscar?${params.toString()}`);
  if (!resp.ok) throw new Error(`Error buscando usuarios ${resp.status}`);
  return await resp.json();
}

/**
 * Obtener usuario por token (envía header Authorization)
 * token debe ser 'Bearer <token>' o lo que tu backend espere.
 */
async function getUserByToken(token) {
  const resp = await fetch(`${API_URL}/auth`, {
    headers: { "Authorization": token }
  });
  if (!resp.ok) throw new Error(`Token inválido (${resp.status})`);
  return await resp.json();
}
