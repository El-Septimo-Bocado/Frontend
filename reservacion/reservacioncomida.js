const API_BASE = "http://localhost:8080";
const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
const money = (v) => `$${Number(v||0).toLocaleString("es-CO")} COP`;

let draft = null;
let total = 0;

function mapItem(raw){
  return {
    id: raw.id,
    nombre: raw.nombre || "Producto",
    descripcion: raw.descripcion || "",
    precio: raw.precio ?? 0,
    imagen: raw.imageUrl || raw.imagenUrl || raw.poster || "",
  };
}

function cardHTML(it){
  const alt = it.nombre.replace(/"/g,"&quot;");
  const img = it.imagen
    ? `<img src="${it.imagen}" alt="${alt}" style="width:100%; border-radius:8px; margin-bottom:10px;">`
    : `<div style="width:100%;height:160px;border-radius:8px;margin-bottom:10px;background:#eee;display:flex;align-items:center;justify-content:center;color:#666;">Sin imagen</div>`;
  return `
    <div class="card" data-id="${it.id}" data-nombre="${it.nombre}" data-precio="${it.precio}">
      ${img}
      <h3>${it.nombre}</h3>
      ${it.descripcion ? `<p>${it.descripcion}</p>` : ""}
      <span class="price">${money(it.precio)}</span>
      <button type="button" class="btn-comprar">Agregar</button>
    </div>
  `;
}

function actualizarTotal(){
  $("#btn-total").textContent = money(total);
}

function wireCards(){
  $$(".card .btn-comprar").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const card = btn.closest(".card");
      const precio = parseInt(card.dataset.precio||"0",10);
      const nombre = card.dataset.nombre || "Producto";
      const id     = card.dataset.id;

      if (card.classList.contains("seleccionado")) {
        card.classList.remove("seleccionado");
        draft.comidas = (draft.comidas||[]).filter(c => c.reference !== id);
        total -= precio;
        btn.textContent = "Agregar";
      } else {
        card.classList.add("seleccionado");
        draft.comidas = [...(draft.comidas||[]), { reference:id, nombre, precio, qty:1 }];
        total += precio;
        btn.textContent = "Quitar";
      }
      actualizarTotal();
    });
  });
}

async function loadMenu(){
  const grid = $("#menu-grid");
  grid.innerHTML = "<em>Cargando menú…</em>";
  try{
    const res = await fetch(`${API_BASE}/api/menu`);
    if(!res.ok) throw new Error("HTTP "+res.status);
    const data = await res.json();
    const items = (Array.isArray(data)?data:[]).map(mapItem);
    if(!items.length){ grid.innerHTML = "<em>Sin productos</em>"; return; }
    grid.innerHTML = items.map(cardHTML).join("");
    wireCards();
  }catch(e){
    console.error(e);
    grid.innerHTML = `<p style="color:#b00020;">No pude cargar el menú</p>`;
  }
}

async function crearOrdenYRedirigir(){
  // seguridad
  if(!(draft?.showtimeId) || !(draft?.holdId) || !(draft?.asientos?.length)) {
    alert("Falta información de la reservación. Regresa y selecciona horario/asientos.");
    window.location.href = "reservacion.html";
    return;
  }

  // construir payload items [{reference, qty}]
  const items = (draft.comidas||[]).map(c => ({ reference: c.reference, qty: c.qty||1 }));

  // POST /api/orders
  const res = await fetch(`${API_BASE}/api/orders`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      showtimeId: draft.showtimeId,
      holdId: draft.holdId,
      items
    })
  });
  if(!res.ok){ alert("No pude crear la orden."); return; }
  const order = await res.json(); // {id,...}

  // Pagar (marca SOLD)
  const resPay = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(order.id)}/pay`, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ holdId: draft.holdId })
  });
  if(!resPay.ok){ alert("No se pudo confirmar el pago/reserva."); return; }

  // Guardar orderId y saltar a recibo
  draft.orderId = order.id;
  localStorage.setItem("reservaDraft", JSON.stringify(draft));
  window.location.href = "recibo.html";
}

(async function init(){
  try { draft = JSON.parse(localStorage.getItem("reservaDraft") || "null"); } catch {}
  if(!draft || !draft.showtimeId || !draft.holdId){
    alert("Primero elige horario y asientos.");
    window.location.href = "reservacion.html";
    return;
  }
  total = Number(draft?.costos?.boletas || 0);
  actualizarTotal();
  await loadMenu();

  $("#btn-continuar")?.addEventListener("click", async ()=>{
    // recalcular total comida
    const totalComida = (draft.comidas||[]).reduce((s,c)=> s+(c.precio||0)*(c.qty||1),0);
    draft.costos = {
      boletas: Number(draft?.costos?.boletas||0),
      comida : totalComida,
      cargo  : 0,
      total  : Number(draft?.costos?.boletas||0) + totalComida
    };
    localStorage.setItem("reservaDraft", JSON.stringify(draft));
    await crearOrdenYRedirigir();
  });
})();