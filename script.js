/* ============================================================
   LO IMAGINAS, LO CONSTRUYES — script.js
   Catálogo dinámico + cotizador rápido + FAQ desplegable
   ============================================================ */

// ---------- Datos del catálogo (fuente: documento de la empresa) ----------
const CATALOGO = {
  "Cementos y morteros": {
    unidad: "bultos",
    promo: "5% de descuento desde 50 bultos · 8% desde 100 bultos",
    descuento: (qty) => (qty >= 100 ? 0.08 : qty >= 50 ? 0.05 : 0),
    productos: [
      { nombre: "Cemento gris CPC 30R", pres: "Bulto 50 kg", precio: 245 },
      { nombre: "Cemento blanco", pres: "Bulto 50 kg", precio: 410 },
      { nombre: "Mortero para pega", pres: "Bulto 50 kg", precio: 175 },
      { nombre: "Cal hidratada", pres: "Bulto 25 kg", precio: 95 },
      { nombre: "Yeso construcción", pres: "Bulto 40 kg", precio: 140 },
    ],
  },
  "Agregados": {
    unidad: "m³",
    promo: "Pedido mínimo de 3 m³ para entrega a domicilio",
    minimo: 3,
    descuento: () => 0,
    productos: [
      { nombre: "Arena de río", pres: "Por m³", precio: 420 },
      { nombre: "Grava 3/4\"", pres: "Por m³", precio: 460 },
      { nombre: "Tepetate", pres: "Por m³", precio: 280 },
      { nombre: "Jal (arena volcánica)", pres: "Por m³", precio: 350 },
    ],
  },
  "Block, tabique y ladrillo": {
    unidad: "piezas",
    promo: "10% de descuento en compras de 1,000 piezas o más del mismo producto",
    descuento: (qty) => (qty >= 1000 ? 0.10 : 0),
    productos: [
      { nombre: "Block hueco de concreto", pres: "15×20×40 cm", precio: 14.5 },
      { nombre: "Block macizo", pres: "15×20×40 cm", precio: 18 },
      { nombre: "Tabique rojo recocido", pres: "7×14×28 cm", precio: 3.8 },
      { nombre: "Tabicón ligero", pres: "10×14×28 cm", precio: 8.5 },
    ],
  },
  "Acero y varilla": {
    unidad: "piezas / kg / rollos",
    promo: null,
    descuento: () => 0,
    productos: [
      { nombre: "Varilla 3/8\" (9.5 mm)", pres: "Pieza 12 m", precio: 185 },
      { nombre: "Varilla 1/2\" (12.7 mm)", pres: "Pieza 12 m", precio: 325 },
      { nombre: "Varilla 5/8\" (15.9 mm)", pres: "Pieza 12 m", precio: 510 },
      { nombre: "Alambrón 1/4\"", pres: "Por kg", precio: 28 },
      { nombre: "Alambre recocido", pres: "Por kg", precio: 32 },
      { nombre: "Malla electrosoldada 6×6", pres: "Rollo 2.5×40 m", precio: 1850 },
    ],
  },
  "Tuberías y conexiones": {
    unidad: "tramos / rollos",
    promo: null,
    descuento: () => 0,
    productos: [
      { nombre: "Tubo PVC hidráulico 1/2\"", pres: "Tramo 6 m", precio: 95 },
      { nombre: "Tubo PVC sanitario 4\"", pres: "Tramo 6 m", precio: 310 },
      { nombre: "Tubo CPVC 1/2\"", pres: "Tramo 3 m", precio: 115 },
      { nombre: "Manguera negra 1/2\"", pres: "Rollo 100 m", precio: 680 },
    ],
  },
  "Impermeabilizantes y acabados": {
    unidad: "cubetas / bultos",
    promo: null,
    descuento: () => 0,
    productos: [
      { nombre: "Impermeabilizante acrílico 5 años", pres: "Cubeta 19 L", precio: 1150 },
      { nombre: "Sellador vinílico", pres: "Cubeta 19 L", precio: 720 },
      { nombre: "Pintura vinílica blanca", pres: "Cubeta 19 L", precio: 890 },
      { nombre: "Adhesivo para azulejo", pres: "Bulto 20 kg", precio: 165 },
      { nombre: "Boquilla sin arena", pres: "Bolsa 5 kg", precio: 85 },
    ],
  },
  "Herramientas": {
    unidad: "piezas",
    promo: null,
    descuento: () => 0,
    productos: [
      { nombre: "Carretilla 65 L reforzada", pres: "Pieza", precio: 1280 },
      { nombre: "Pala cuadrada mango largo", pres: "Pieza", precio: 265 },
      { nombre: "Cuchara de albañil 8\"", pres: "Pieza", precio: 145 },
      { nombre: "Nivel de aluminio 24\"", pres: "Pieza", precio: 220 },
      { nombre: "Flexómetro 5 m", pres: "Pieza", precio: 95 },
    ],
  },
};

// Costos de envío por zona (0 = recoger en tienda)
const ENVIOS = { 0: 0, 1: 150, 2: 250, 3: 350, 4: 450 };
const ENVIO_GRATIS_GLOBAL = 10000; // pedido mínimo para envío gratis a cualquier zona
const ENVIO_GRATIS_Z1 = 3000;      // pedido mínimo para envío gratis en Zona 1

// Formato de moneda MXN
const mxn = (n) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

// ============================================================
// CATÁLOGO: pestañas por categoría + tarjetas de producto
// ============================================================
const tabsEl = document.getElementById("tabs-catalogo");
const gridEl = document.getElementById("grid-catalogo");

function renderCatalogo(categoriaActiva) {
  // Pestañas
  tabsEl.innerHTML = "";
  Object.keys(CATALOGO).forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", cat === categoriaActiva ? "true" : "false");
    btn.textContent = cat;
    btn.addEventListener("click", () => renderCatalogo(cat));
    tabsEl.appendChild(btn);
  });

  // Tarjetas
  const data = CATALOGO[categoriaActiva];
  gridEl.innerHTML = "";

  if (data.promo) {
    const promo = document.createElement("p");
    promo.className = "cat-promo";
    promo.textContent = "⚠ " + data.promo;
    gridEl.appendChild(promo);
  }

  data.productos.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${p.nombre}</h3>
      <p class="pres">${p.pres}</p>
      <p class="precio">${mxn(p.precio)} <small>IVA incluido</small></p>
    `;
    gridEl.appendChild(card);
  });
}

renderCatalogo(Object.keys(CATALOGO)[0]);

// ============================================================
// COTIZADOR RÁPIDO
// ============================================================
const selCat = document.getElementById("q-categoria");
const selProd = document.getElementById("q-producto");
const inpQty = document.getElementById("q-cantidad");
const selZona = document.getElementById("q-zona");
const unidadHint = document.getElementById("q-unidad");

const rSubtotal = document.getElementById("r-subtotal");
const rDescuento = document.getElementById("r-descuento");
const rDescuentoLabel = document.getElementById("r-descuento-label");
const rowDescuento = document.getElementById("row-descuento");
const rEnvio = document.getElementById("r-envio");
const rTotal = document.getElementById("r-total");
const rNota = document.getElementById("r-nota");

// Llenar categorías
Object.keys(CATALOGO).forEach((cat) => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  selCat.appendChild(opt);
});

function llenarProductos() {
  const cat = CATALOGO[selCat.value];
  selProd.innerHTML = "";
  cat.productos.forEach((p, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${p.nombre} — ${mxn(p.precio)}`;
    selProd.appendChild(opt);
  });
  unidadHint.textContent = `(${cat.unidad})`;
}

function cotizar() {
  const cat = CATALOGO[selCat.value];
  const prod = cat.productos[Number(selProd.value)];
  const qty = Math.max(1, Number(inpQty.value) || 1);
  const zona = Number(selZona.value);

  const subtotal = prod.precio * qty;

  // Descuento por volumen según la categoría
  const tasa = cat.descuento(qty);
  const descuento = subtotal * tasa;
  const conDescuento = subtotal - descuento;

  // Envío
  let envio = ENVIOS[zona];
  let nota = "";

  if (zona === 0) {
    nota = "Recoger en tienda: tu pedido queda listo en 2 horas.";
  } else if (conDescuento > ENVIO_GRATIS_GLOBAL) {
    envio = 0;
    nota = "¡Envío gratis por compra mayor a $10,000!";
  } else if (zona === 1 && conDescuento >= ENVIO_GRATIS_Z1) {
    envio = 0;
    nota = "Envío gratis en Zona 1 por compra desde $3,000.";
  }

  // Regla de pedido mínimo para agregados a domicilio
  if (cat.minimo && zona !== 0 && qty < cat.minimo) {
    nota = `Los agregados requieren un pedido mínimo de ${cat.minimo} m³ para entrega a domicilio.`;
  }

  // Pintar resultado
  rSubtotal.textContent = mxn(subtotal);

  if (descuento > 0) {
    rowDescuento.hidden = false;
    rDescuentoLabel.textContent = `Descuento por volumen (${Math.round(tasa * 100)}%)`;
    rDescuento.textContent = "−" + mxn(descuento);
  } else {
    rowDescuento.hidden = true;
  }

  rEnvio.textContent = envio === 0 ? "GRATIS" : mxn(envio);
  rTotal.textContent = mxn(conDescuento + envio);
  rNota.textContent = nota || "Estimado sin compromiso. Precios de referencia con IVA.";
}

selCat.addEventListener("change", () => { llenarProductos(); cotizar(); });
selProd.addEventListener("change", cotizar);
inpQty.addEventListener("input", cotizar);
selZona.addEventListener("change", cotizar);

llenarProductos();
cotizar();

// ============================================================
// PREGUNTAS FRECUENTES
// ============================================================
const FAQS = [
  {
    q: "¿Cuánto cemento necesito para una losa?",
    a: "Como referencia, una losa de concreto de 10 cm de espesor usa aproximadamente 7 bultos de cemento por cada 10 m², más arena, grava y acero. Pide asesoría con nuestro equipo para calcular tu obra exacta.",
  },
  {
    q: "¿Venden por mayoreo?",
    a: "Sí. Tenemos descuentos por volumen y atención especial a constructoras. Pregunta por tu asesor de mayoreo al 33 1234 5678.",
  },
  {
    q: "¿Hacen entregas el mismo día?",
    a: "En Zona 1 (Zapopan centro e industrial) sí, siempre que el pedido se confirme y pague antes de las 13:00 h.",
  },
  {
    q: "¿Puedo pagar cuando me entreguen?",
    a: "Sí, contra entrega en efectivo hasta $8,000 MXN. Montos mayores requieren pago anticipado por transferencia o tarjeta.",
  },
  {
    q: "¿Tienen tienda física?",
    a: "Sí, en Av. de los Constructores #1250, Col. Industrial, Zapopan. Puedes recoger tu pedido ahí sin costo de envío.",
  },
  {
    q: "¿Aceptan devoluciones?",
    a: "Dentro de 7 días naturales, con producto sin abrir y en buen estado, presentando ticket. No aplica en agregados ni producto cortado a medida.",
  },
];

const faqList = document.getElementById("faq-list");

FAQS.forEach(({ q, a }) => {
  const item = document.createElement("div");
  item.className = "faq-item";
  item.innerHTML = `
    <button type="button" class="faq-q" aria-expanded="false">${q}</button>
    <div class="faq-a">${a}</div>
  `;
  const btn = item.querySelector(".faq-q");
  btn.addEventListener("click", () => {
    const abierto = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", abierto ? "true" : "false");
  });
  faqList.appendChild(item);
});
