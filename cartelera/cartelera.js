const API_URL = "http://localhost:8080/api/movies";
const container = document.getElementById("cartelera-container");

async function cargarPeliculas() {
  try {
    const response = await fetch(API_URL);
    const peliculas = await response.json();

    peliculas.forEach(pelicula => {
      const tarjeta = document.createElement("a");
      tarjeta.classList.add("tarjeta");
      tarjeta.href = `../detalles/${pelicula.id}.html`; // Puedes cambiar esto luego

      const etiqueta = document.createElement("div");
      etiqueta.classList.add(pelicula.activo ? "etiqueta" : "etiquetaproximamente");
      etiqueta.textContent = pelicula.activo ? "Estreno" : "Próximamente";

      const img = document.createElement("img");
      img.src = pelicula.poster;
      img.alt = pelicula.titulo;

      const titulo = document.createElement("h2");
      titulo.textContent = pelicula.titulo;

      tarjeta.appendChild(etiqueta);
      tarjeta.appendChild(img);
      tarjeta.appendChild(titulo);

      container.appendChild(tarjeta);
    });
  } catch (error) {
    console.error("Error cargando películas:", error);
  }
}

cargarPeliculas();
