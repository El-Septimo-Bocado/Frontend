// auth/registro.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const err  = document.getElementById("regError");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.style.display = "none";

    const nombre   = document.getElementById("username").value.trim();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await Auth.register(nombre, email, password);
      // tras registro ya hay sesión activa
      Auth.redirectPostAuth();
    } catch (ex) {
      console.error(ex);
      err.textContent = "No se pudo registrar. ¿Correo ya usado?";
      err.style.display = "block";
    }
  });
});
