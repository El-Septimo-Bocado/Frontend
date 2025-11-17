// auth/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const err  = document.getElementById("loginError");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.style.display = "none";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await Auth.login(email, password);
      Auth.redirectPostAuth(); // vuelve a reservación con #pm guardado
    } catch (ex) {
      console.error(ex);
      err.textContent = "No se pudo iniciar sesión. Verifica tus credenciales.";
      err.style.display = "block";
    }
  });
});
