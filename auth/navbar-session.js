// auth/navbar-session.js
(function () {

  // ✅ RUTA CORRECTA DE LA PÁGINA DE CONFIGURACIÓN
  const USER_CONFIG_URL = "../configuracion/configuracion.html";

  // ✔️ Ruta correcta del login (esto ya estaba bien)
  const LOGIN_URL = "../auth/login.html";

  const qs  = (sel) => document.querySelector(sel);
  const qsa = (sel) => document.querySelectorAll(sel);

  function getNavbarList() {
    const nav = qs(".navbar nav ul");
    return nav || null;
  }

  function findLoginItem(navList) {
    if (!navList) return null;
    const items = Array.from(navList.querySelectorAll("li"));
    for (const li of items) {
      const a = li.querySelector("a");
      if (!a) continue;
      const text = (a.textContent || "").toLowerCase().trim();
      if (
        text.includes("inicia sesion") ||
        text.includes("inicia sesión") ||
        text.includes("iniciar sesión")
      ) {
        return { li, a };
      }
    }
    return null;
  }

  function ensureGuestLoginLink(navList) {
    const item = findLoginItem(navList);
    if (!item) return;
    item.a.textContent = "Inicia Sesión";
    item.a.setAttribute("href", LOGIN_URL);
    item.a.setAttribute("title", "Inicia sesión en El Séptimo Bocado");
  }

  function formatUserName(user) {
    const raw =
      user?.nombre ||
      user?.name ||
      user?.username ||
      user?.email ||
      "Mi cuenta";

    const trimmed = String(raw).trim();
    if (!trimmed) return "Mi cuenta";
    return trimmed.split(" ")[0] || trimmed;
  }

  function ensureUserLink(navList, user) {
    const item = findLoginItem(navList);
    if (!item) return;

    const displayName = formatUserName(user);
    item.a.textContent = displayName;
    item.a.setAttribute("href", USER_CONFIG_URL);
    item.a.setAttribute("title", "Configurar mi cuenta");
  }

  function ensureAdminLink(navList, user) {
    if (!navList || !user) return;

    const rol = (user.rol || user.role || "").toUpperCase();
    if (rol !== "ADMIN") return;

    const existing = Array.from(navList.querySelectorAll("a")).find((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      const text = (a.textContent || "").toLowerCase();
      return href.includes("/admin/admin.html") || text.includes("panel admin");
    });
    if (existing) return;

    const li = document.createElement("li");
    const a  = document.createElement("a");
    a.textContent = "Panel Admin";
    a.href = "../admin/admin.html";
    a.title = "Ir al panel de administración";

    li.appendChild(a);
    navList.appendChild(li);
  }

  function initNavbar() {
    const navList = getNavbarList();
    if (!navList) return;

    if (!window.Auth) {
      ensureGuestLoginLink(navList);
      return;
    }

    let data;
    try {
      data = Auth.getUser();
    } catch {
      data = null;
    }

    const user = data?.user;

    if (!user) {
      ensureGuestLoginLink(navList);
      return;
    }

    ensureUserLink(navList, user);
    ensureAdminLink(navList, user);
  }

  document.addEventListener("DOMContentLoaded", initNavbar);
})();
