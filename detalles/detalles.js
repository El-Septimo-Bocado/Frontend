document.querySelectorAll(".btn-reservar").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    // 1) Datos desde los data-*
    const movie = {
      titulo:   btn.dataset.pelicula || "Película",
      poster:   btn.dataset.poster   || "",
      fondo:    btn.dataset.fondo    || "",
      director: btn.dataset.director || "",
      generos:  btn.dataset.generos  || "",
      duracion: btn.dataset.duracion || ""
    };

    // 2) Guardar película y destino NUEVO
    localStorage.setItem("pendingMovie", JSON.stringify(movie));
    localStorage.setItem("reservacionDestino", "../reservacion/reservacion.html");

    // 3) Ir al login
    window.location.href = "../login/login.html";
  });
});