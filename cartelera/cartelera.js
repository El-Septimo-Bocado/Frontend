const carteleraContainer = document.getElementById('cartelera-container');

// Limpiamos los datos quemados (solo dejamos el título principal)
carteleraContainer.innerHTML = '<h2 style="grid-column: 1 / -1; text-align: center; margin-bottom: 30px;">En cartelera y próximamente</h2>';

// Función para convertir títulos en nombres de archivo para los detalles
function generarLinkDetalle(titulo) {
  // Quita espacios y caracteres especiales
  return `../detalles/${titulo.replace(/[^a-zA-Z0-9]/g, '')}detalle.html`;
}

// Traer películas del backend
fetch("http://localhost:8080/swagger-ui/index.html#/Pel%C3%ADculas")
  .then(res => res.json())
  .then(peliculas => {
    peliculas.forEach(pelicula => {
      const tarjeta = document.createElement('a');
      tarjeta.classList.add('tarjeta');
      tarjeta.href = generarLinkDetalle(pelicula.titulo);

      tarjeta.innerHTML = `
        <div class="${pelicula.activo ? 'etiqueta' : 'etiquetaproximamente'}">
          ${pelicula.activo ? 'Estreno' : 'Próximamente'}
        </div>
        <img src="${pelicula.poster}" alt="${pelicula.titulo}">
        <h2>${pelicula.titulo}</h2>
      `;

      carteleraContainer.appendChild(tarjeta);
    });
  })
  .catch(err => console.error('Error cargando películas:', err));
