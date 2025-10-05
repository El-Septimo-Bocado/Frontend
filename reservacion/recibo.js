document.addEventListener("DOMContentLoaded", () => {
  // Cargar borrador
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem("reservaDraft") || "null"); } catch {}
  if (!draft) {
    alert("⚠️ No hay datos de reserva. Redirigiendo…");
    window.location.href = "../principal/index.html";
    return;
  }

  const $ = (id) => document.getElementById(id);
  const money = (v) => `$${Number(v || 0).toLocaleString("es-CO")} COP`;

  // ---- Meta de película ----
  const meta = draft.meta || {};
  if (meta.poster) $("reciboPoster").src = meta.poster;
  $("reciboTitulo").textContent   = meta.titulo   || draft.pelicula || "Película";
  $("reciboDirector").textContent = meta.director || "—";
  $("reciboGeneros").textContent  = meta.generos  || "—";
  $("reciboDuracion").textContent = meta.duracion || "—";

  // ---- Detalles ----
  $("reciboFecha").textContent   = draft.fechaLarga || draft.fecha || "—";
  $("reciboHorario").textContent = draft.horario || "—";
  $("reciboAsientos").textContent =
    Array.isArray(draft.asientos) && draft.asientos.length
      ? draft.asientos.join(", ")
      : "—";

  // ---- Comidas (strings u objetos {nombre, precio}) ----
  const comidasNombres = Array.isArray(draft.comidas)
    ? draft.comidas
        .map(c => (typeof c === "string" ? c : c?.nombre))
        .filter(Boolean)
    : [];
  $("reciboComidas").textContent = comidasNombres.length
    ? comidasNombres.join(", ")
    : "—";

  // ---- Costos ----
  const boletas = draft?.costos?.boletas || 0;
  const comida  = draft?.costos?.comida  || 0;
  const cargo   = draft?.costos?.cargo   || 0;
  const total   = draft?.costos?.total   ?? (boletas + comida + cargo);

  $("reciboBoletas").textContent = money(boletas);
  $("reciboComida").textContent  = money(comida);
  $("reciboCargo").textContent   = money(cargo);
  $("reciboTotal").textContent   = money(total);
});
