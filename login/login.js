// login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  // util: normaliza rutas viejas a la nueva
  const normalizeReserva = (url) => {
    if (!url) return "../reservacion/reservacion.html";
    const legacy = [
      "reservacionbackfuture2.html",
      "reservacionkillbill2.html",
      "reservacionsawv.html",
      "reservacionstarwars3.html",
      "reservacionthesocialnetwork.html"
    ];
    if (legacy.some(p => url.endsWith(p))) {
      return "../reservacion/reservacion.html";
    }
    return url;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1) A dónde ir
    let redirectTo = localStorage.getItem("reservacionDestino");
    redirectTo = normalizeReserva(redirectTo);

    // 2) Película guardada en detalles (no inventamos defaults aquí)
    let movie = null;
    try { movie = JSON.parse(localStorage.getItem("pendingMovie") || "null"); } catch {}

    // 3) Armamos hash solo si hay movie real
    let url = redirectTo;
    if (movie && typeof movie === "object") {
      const pm = encodeURIComponent(JSON.stringify(movie));
      url += `#pm=${pm}`;
    }

    // 4) Redirigir
    window.location.href = url;

    // 5) Limpiar llaves que ya no necesitamos
    localStorage.removeItem("reservacionDestino");
    
  });
});
