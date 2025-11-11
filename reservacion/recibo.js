const API_BASE = "http://localhost:8080";
const $ = id => document.getElementById(id);
const money = (v) => `$${Number(v||0).toLocaleString("es-CO")} COP`;

async function loadReceipt(){
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem("reservaDraft") || "null"); } catch {}
  if (!draft) {
    alert("No hay datos de la reserva.");
    window.location.href = "../principal/index.html";
    return;
  }

  // Si hay orderId -> pedir al backend el recibo
  if (draft.orderId) {
    try{
      const r = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(draft.orderId)}/receipt`);
      if (r.ok) {
        const rec = await r.json();
        paintFromReceipt(rec);
        // Guardar valores para impresión offline
        localStorage.setItem("reservaReceiptCache", JSON.stringify(rec));
        return;
      }
    }catch(e){ console.warn("Fallo obteniendo recibo, uso draft/local:", e); }
  }

  // Fallback: usar lo que quedó en draft (sin backend)
  paintFromDraft(draft);
}

function paintFromReceipt(rec){
  // Meta
  if (rec?.meta?.poster) $("reciboPoster").src = rec.meta.poster;
  $("reciboTitulo").textContent   = rec?.meta?.titulo   || "Película";
  $("reciboDirector").textContent = rec?.meta?.director || "—";
  $("reciboGeneros").textContent  = rec?.meta?.generos  || "—";
  $("reciboDuracion").textContent = rec?.meta?.duracion || "—";

  // Detalles
  $("reciboFecha").textContent   = rec.fechaLarga || rec.fecha || "—";
  $("reciboHorario").textContent = rec.horario || "—";
  $("reciboAsientos").textContent = (rec.asientos||[]).join(", ") || "—";
  $("reciboComidas").textContent  = (rec.comidas||[]).join(", ") || "—";

  // Costos
  $("reciboBoletas").textContent = money(rec?.costos?.boletas||0);
  $("reciboComida").textContent  = money(rec?.costos?.comida||0);
  $("reciboCargo").textContent   = money(rec?.costos?.cargo||0);
  $("reciboTotal").textContent   = money(rec?.costos?.total ?? ((rec?.costos?.boletas||0)+(rec?.costos?.comida||0)+(rec?.costos?.cargo||0)));
}

function paintFromDraft(draft){
  const meta = draft.meta || {};
  if (meta.poster) $("reciboPoster").src = meta.poster;
  $("reciboTitulo").textContent   = meta.titulo || "Película";
  $("reciboDirector").textContent = meta.director || "—";
  $("reciboGeneros").textContent  = meta.generos  || "—";
  $("reciboDuracion").textContent = meta.duracion || "—";

  $("reciboFecha").textContent   = draft.fechaLarga || draft.fecha || "—";
  $("reciboHorario").textContent = draft.horario || "—";
  $("reciboAsientos").textContent = (draft.asientos||[]).join(", ") || "—";

  const comidasNombres = Array.isArray(draft.comidas)
    ? draft.comidas.map(c => typeof c === "string" ? c : c?.nombre).filter(Boolean)
    : [];
  $("reciboComidas").textContent = comidasNombres.join(", ") || "—";

  const boletas = draft?.costos?.boletas || 0;
  const comida  = draft?.costos?.comida  || 0;
  const cargo   = draft?.costos?.cargo   || 0;
  const total   = draft?.costos?.total   ?? (boletas + comida + cargo);

  $("reciboBoletas").textContent = money(boletas);
  $("reciboComida").textContent  = money(comida);
  $("reciboCargo").textContent   = money(cargo);
  $("reciboTotal").textContent   = money(total);
}

document.addEventListener("DOMContentLoaded", loadReceipt);