<?php
// Conexión a MySQL
$conexion = new mysqli("localhost", "root", "1090273428", "cine");

if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}

// Consultas
$cartelera = $conexion->query("SELECT * FROM peliculas WHERE categoria = 'cartelera'");
$estrenos  = $conexion->query("SELECT * FROM peliculas WHERE categoria = 'estreno'");
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>El Séptimo Bocado</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Barra de Navegación -->
  <header class="navbar">
    <a href="../principal/index.php" class="logo">
      <img src="../iconos/logo.png" alt="El Séptimo Bocado" style="height:70px;">
    </a>
    <nav>
    <ul>
      <li><a href="../principal/index.html">Inicio</a></li>
      <li><a href="../cartelera/cartelera.html">Cartelera</a></li>
      <li><a href="../menu/menu.html">Menu</a></li>
      <li><a href="../eventos/eventos.html">Eventos</a></li>
              <li><a href="../login/login.html">Inicia Sesion</a></li>
      <li><a href="../contacto/contacto.html">Contacto</a></li>
    </ul>
    </nav>
  </header>

  <!-- Hero -->
  <section class="hero">
    <div class="hero-content">
      <img src="../iconos/bienvenido.png" alt="Bienvenido a" style="height:90px; display:block; margin:0 auto;">
      <div class="logo2">
        <img src="../iconos/logo.png" alt="El Séptimo Bocado" style="height:90px;">
      </div>
      <p>Disfruta del mejor cine mientras saboreas exquisitos platos.</p>
      <div class="buscador">
        <input type="text" placeholder="Buscar película...">
        <button>Buscar</button>
      </div>
    </div>
  </section>

  <!-- Cartelera -->
  <section class="cartelera">
    <h2>Cartelera</h2>
    <div class="peliculas">
      <?php while($peli = $cartelera->fetch_assoc()): ?>
        <div class="card">
          <img src="<?= $peli['imagen'] ?>" alt="<?= $peli['titulo'] ?>" style="width:100%; border-radius:8px; margin-bottom:10px;">
          <h3><?= $peli['titulo'] ?></h3>
          <p><?= str_repeat("⭐", $peli['rating']) . str_repeat("☆", 5 - $peli['rating']) ?></p>
          <a href="<?= $peli['enlace'] ?>"><button>Ver Detalles</button></a>
        </div>
      <?php endwhile; ?>
    </div>
  </section>

  <!-- Estrenos -->
  <section class="estrenos">
    <h2>Próximos Estrenos</h2>
    <div class="peliculas">
      <?php while($peli = $estrenos->fetch_assoc()): ?>
        <div class="card">
          <img src="<?= $peli['imagen'] ?>" alt="<?= $peli['titulo'] ?>" style="width:100%; border-radius:8px; margin-bottom:10px;">
          <h3><?= $peli['titulo'] ?></h3>
          <a href="<?= $peli['enlace'] ?>"><button>Ver Detalles</button></a>
        </div>
      <?php endwhile; ?>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <p>&copy; 2025 El Séptimo Bocado. Todos los derechos reservados.</p>
  </footer>
</body>
</html>
