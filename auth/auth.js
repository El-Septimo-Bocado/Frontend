// auth/auth.js
(function (global) {
  const API_BASE = "http://localhost:8080";

  // Claves en localStorage
  const KEYS = {
    USER: "authUser",
    RETURN: "returnTo"
  };

  // ----------------- Helpers base -----------------
  const getUser = () => {
    try { return JSON.parse(localStorage.getItem(KEYS.USER) || "null"); }
    catch { return null; }
  };

  const setUser = (u) => localStorage.setItem(KEYS.USER, JSON.stringify(u));
  const clearUser = () => localStorage.removeItem(KEYS.USER);

  // Sacar token del objeto guardado: { token, user: {...} }
  const getToken = () => {
    const data = getUser();
    if (!data) return null;
    if (typeof data.token === "string" && data.token.length > 0) {
      return data.token;
    }
    return null;
  };

  const isLoggedIn = () => !!getToken();

  async function apiFetch(url, opts = {}) {
    const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    const token = getToken();
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }
    return fetch(url, { ...opts, headers });
  }

  // ----------------- Auth real (usa tu backend) -----------------
  async function login(email, password) {
    const res = await apiFetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("LOGIN_FAIL");
    const data = await res.json(); // { token, user: {...} }
    setUser(data);
    return data;
  }

  async function register(nombre, email, password) {
    const res = await apiFetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      body: JSON.stringify({ nombre, email, password })
    });
    if (!res.ok) throw new Error("REGISTER_FAIL");
    const data = await res.json();
    setUser(data); // auto-login
    return data;
  }

  function logout() { clearUser(); }

  // ----------------- “Return to” -----------------
  function setReturnTo(url) {
    localStorage.setItem(KEYS.RETURN, url);
  }

  function redirectPostAuth() {
    const destino = localStorage.getItem(KEYS.RETURN) || "../principal/index.html";
    localStorage.removeItem(KEYS.RETURN);
    window.location.href = destino;
  }

  // Si no hay sesión, manda a login y recuerda dónde volver
  function requireLogin(onAlreadyLogged) {
    console.log("[Auth.requireLogin] loggedIn?", isLoggedIn());
    if (isLoggedIn()) {
      if (typeof onAlreadyLogged === "function") onAlreadyLogged();
      return;
    }

    // si no hay returnTo aún, ponemos uno por defecto (lo puede sobrescribir detalles.js)
    if (!localStorage.getItem(KEYS.RETURN)) {
      setReturnTo("../reservacion/reservacion.html");
    }

    window.location.href = "../auth/login.html";
    throw new Error("NEED_LOGIN");
  }

  // Exponer global
  global.Auth = {
    API_BASE,
    apiFetch,
    isLoggedIn,
    getUser,
    logout,
    login,
    register,
    setReturnTo,
    redirectPostAuth,
    requireLogin
  };
})(window);
