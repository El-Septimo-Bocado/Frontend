// configuracion.js
(function () {
  const API_BASE  = (window.Auth?.API_BASE) || "http://localhost:8080";
  const LOGIN_URL = "../auth/login.html";

  const qs = (sel) => document.querySelector(sel);

  const formEditar = qs("#formEditarUsuario");
  const inputNombre = qs("#userNombre");
  const inputCorreo = qs("#userCorreo");

  const inputConfirmEliminar = qs("#confirmEliminar");
  const btnEliminar = qs(".btn-danger");      // botón "Eliminar Cuenta Permanentemente"
  const btnCerrarSesion = qs(".btn-update"); // botón "Cerrar Sesión"

  // --------------------------------------------------
  // Helpers para sesión: respetar { token, user }
  // --------------------------------------------------

  function readSession() {
    let session = null;

    // 1) Intentar usar Auth.getUser si existe
    try {
      if (window.Auth && typeof window.Auth.getUser === "function") {
        session = window.Auth.getUser();
      }
    } catch (_) {}

    // 2) Si no obtuvimos nada, intentamos localStorage
    if (!session) {
      try {
        const raw = localStorage.getItem("authUser");
        session = raw ? JSON.parse(raw) : null;
      } catch (_) {
        session = null;
      }
    }

    if (!session) {
      return { token: "", user: null, raw: null };
    }

    // Caso ideal: { token, user: { ... } }
    if (session.token || session.user) {
      const token = session.token || "";
      const user = session.user || null;
      return { token, user, raw: session };
    }

    // Caso degradado: solo user plano
    if (session.id || session.nombre || session.email) {
      const token = (localStorage.getItem("authToken") || "");
      return {
        token,
        user: session,
        raw: { token, user: session }
      };
    }

    return { token: "", user: null, raw: session };
  }

  function saveSessionTokenUser(token, user) {
    const session = { token: token || "", user: user || null };

    // Guardar en localStorage
    try {
      localStorage.setItem("authUser", JSON.stringify(session));
      if (token) {
        localStorage.setItem("authToken", token);
      }
    } catch (_) {}

    // Notificar a Auth si tiene setUser
    try {
      if (window.Auth && typeof window.Auth.setUser === "function") {
        window.Auth.setUser(session);
      }
    } catch (_) {}
  }

  function clearSession() {
    try {
      if (window.Auth && typeof window.Auth.clearSession === "function") {
        window.Auth.clearSession();
      }
    } catch (_) {}

    try {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
    } catch (_) {}
  }

  function redirectToLogin() {
    window.location.href = LOGIN_URL;
  }

  // --------------------------------------------------
  // Cargar perfil: GET /api/auth/me
  // --------------------------------------------------

  async function cargarPerfil(session) {
    const { token, user } = session;

    // Usar user local para rellenar rápido
    if (user) {
      if (inputNombre) inputNombre.value = user.nombre || user.name || "";
      if (inputCorreo) inputCorreo.value = user.email || "";
    }

    if (!token) {
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!resp.ok) {
        if (resp.status === 401) {
          redirectToLogin();
          return;
        }
        throw new Error("Error al obtener datos de usuario");
      }

      const data = await resp.json();

      if (inputNombre) inputNombre.value = data.nombre || "";
      if (inputCorreo) inputCorreo.value = data.email || "";

      const updatedUser = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol
      };
      saveSessionTokenUser(token, updatedUser);

    } catch (err) {
      console.error(err);
      alert("No se pudo refrescar tu información desde el servidor.");
    }
  }

  // --------------------------------------------------
  // Guardar cambios de NOMBRE: PUT /api/auth/me
  // --------------------------------------------------

  async function onSubmitEditar(ev) {
    ev.preventDefault();

    const session = readSession();
    const { token, user } = session;

    if (!user || !token) {
      alert("Tu sesión no es válida o expiró. Vuelve a iniciar sesión.");
      redirectToLogin();
      return;
    }

    const nombre = (inputNombre?.value || "").trim();
    if (!nombre) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    const btn = formEditar.querySelector("button[type='submit']");
    const originalText = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Guardando...";
    }

    try {
      const resp = await fetch(`${API_BASE}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ nombre })
      });

      if (!resp.ok) {
        if (resp.status === 400) {
          alert("Nombre inválido.");
        } else if (resp.status === 401) {
          alert("Tu sesión expiró. Vuelve a iniciar sesión.");
          redirectToLogin();
        } else {
          alert("Error al guardar los cambios.");
        }
        return;
      }

      const updated = await resp.json();

      const newUser = {
        id: updated.id,
        nombre: updated.nombre,
        email: updated.email,
        rol: updated.rol ?? user.rol
      };

      saveSessionTokenUser(token, newUser);

      if (inputNombre) inputNombre.value = updated.nombre || "";
      if (inputCorreo) inputCorreo.value = updated.email || "";

      alert("Nombre actualizado correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error de comunicación con el servidor al guardar los cambios.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  }

  // --------------------------------------------------
  // Cerrar sesión
  // --------------------------------------------------

  async function onCerrarSesion(ev) {
    ev.preventDefault();

    const session = readSession();
    const token = session.token;

    try {
      if (token) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }).catch(() => {});
      }
    } finally {
      clearSession();
      window.location.href = LOGIN_URL;
    }
  }

  // --------------------------------------------------
  // Eliminar cuenta: DELETE /api/auth/me
  // --------------------------------------------------

  async function onEliminarCuenta() {
    const session = readSession();
    const { token, user } = session;

    if (!user || !token) {
      alert("Tu sesión no es válida o expiró. Vuelve a iniciar sesión.");
      redirectToLogin();
      return;
    }

    const texto = (inputConfirmEliminar?.value || "").trim().toUpperCase();
    if (texto !== "ELIMINAR") {
      alert('Debes escribir exactamente "ELIMINAR" para confirmar.');
      return;
    }

    const seguro = window.confirm(
      "Esta acción es permanente. ¿Seguro que quieres eliminar tu cuenta?"
    );
    if (!seguro) return;

    try {
      const resp = await fetch(`${API_BASE}/api/auth/me`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!resp.ok && resp.status !== 404) {
        if (resp.status === 401) {
          alert("Tu sesión expiró. Vuelve a iniciar sesión.");
          redirectToLogin();
        } else {
          alert("Ocurrió un error al intentar eliminar la cuenta.");
        }
        return;
      }

      alert("Tu cuenta ha sido eliminada.");
      clearSession();
      window.location.href = LOGIN_URL;
    } catch (err) {
      console.error(err);
      alert("Error de comunicación con el servidor al eliminar la cuenta.");
    }
  }

  // --------------------------------------------------
  // Init
  // --------------------------------------------------

  function init() {
    const session = readSession();

    if (!session.user && !session.token) {
      redirectToLogin();
      return;
    }

    if (formEditar) {
      formEditar.addEventListener("submit", onSubmitEditar);
    }

    if (btnCerrarSesion) {
      btnCerrarSesion.addEventListener("click", onCerrarSesion);
    }

    if (btnEliminar) {
      btnEliminar.addEventListener("click", onEliminarCuenta);
    }

    cargarPerfil(session);
  }

  init();
})();
