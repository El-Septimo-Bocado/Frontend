// auth/auth.js
const Auth = (() => {
  const API_BASE = "http://localhost:8080";

  // ===== Claves y helpers =====
  const USER_KEY    = "authUser";          // { id, nombre, email, token? }
  const RETURN_URL  = "returnAfterAuth";   // URL completa de retorno

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch { return null; }
  };
  const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u || null));
  const clearUser = () => localStorage.removeItem(USER_KEY);
  const isLoggedIn = () => !!getUser();

  function getToken() {
    const u = getUser();
    return u && u.token ? u.token : null;
  }

  // fetch que inyecta Authorization si hay token
  async function apiFetch(url, opts = {}) {
    const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(url, { ...opts, headers });
  }

  // ===== Endpoints reales de auth (ajusta rutas si difieren) =====
  async function login(email, password) {
    const res = await apiFetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("LOGIN_FAIL");
    const data = await res.json(); // { id, nombre, email, token? }
    setUser(data);
    return data;
  }

  async function register(name, email, password) {
    const res = await apiFetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error("REGISTER_FAIL");
    const data = await res.json(); // { id, nombre, email, token? }
    setUser(data); // auto-login
    return data;
  }

  function logout() { clearUser(); }

  // ===== Navegación/retorno tras login =====
  function setReturnTo(url) {
    // Guarda la URL COMPLETA a donde quieres volver (incluyendo ?id=123 o lo que sea)
    localStorage.setItem(RETURN_URL, url);
  }

  // Úsalo justo antes de mandar a login si NO hay sesión.
  // targetUrl: a dónde quieres volver tras login (incluye params, p.ej. "../reservacion/reservacion.html?id=123")
  function requireLogin(targetUrl) {
    if (isLoggedIn()) return true;
    setReturnTo(targetUrl || "../reservacion/reservacion.html");
    // mando a login (en la misma origem, distinta carpeta)
    window.location.href = "../auth/login.html";
    return false;
  }

  // Llamar desde login/registro tras éxito
  function redirectPostAuth() {
    const url = localStorage.getItem(RETURN_URL) || "../reservacion/reservacion.html";
    localStorage.removeItem(RETURN_URL);
    window.location.href = url; // NO tocamos nada más: la URL ya trae ?id=...
  }

  // ===== Helpers prácticos =====
  // Construye la URL de reserva con el movieId
  function buildReservationUrl(movieId) {
    const base = "../reservacion/reservacion.html";
    if (!movieId) return base;
    const u = new URL(base, window.location.origin);
    u.searchParams.set("id", String(movieId));
    // Devolvemos ruta relativa con query (para SPA estático)
    return `${base}?id=${encodeURIComponent(String(movieId))}`;
  }

  return {
    API_BASE, apiFetch,
    isLoggedIn, getUser, logout, getToken,
    login, register,
    setReturnTo, requireLogin, redirectPostAuth,
    buildReservationUrl
  };
})();
