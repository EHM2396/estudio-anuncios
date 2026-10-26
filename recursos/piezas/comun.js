// Ayudas comunes de las plantillas de imágenes por dirección (anunciar.mjs las copia a assets/comun.js).
// La plantilla define `const D = "__DATOS__"` y llama a armarPiezas(construir) con su función de llenado.

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const ICONOS = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  flecha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  globo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.8 3.9 6 3.9 9.5s-1.3 6.7-3.9 9.5c-2.6-2.8-3.9-6-3.9-9.5s1.3-6.7 3.9-9.5z"/></svg>',
};

// El título con la parte resaltada envuelta en <span class="resaltado"> (la última aparición)
function resaltar(titulo, resaltado) {
  const i = resaltado ? titulo.lastIndexOf(resaltado) : -1;
  if (i < 0) return esc(titulo);
  return esc(titulo.slice(0, i)) + `<span class="resaltado">${esc(resaltado)}</span>` + esc(titulo.slice(i + resaltado.length));
}

// Botón, insignias (tienda y web) y URL. Cada dirección les da su forma con CSS.
function pie(T, A) {
  const web = T.webLinea1 || T.webLinea2 ? `<span class="insignia-web">${ICONOS.globo}<span><small>${esc(T.webLinea1)}</small><b>${esc(T.webLinea2)}</b></span></span>` : "";
  const tienda = A.insignia ? `<img class="insignia" src="${A.insignia}" alt="" />` : "";
  return `<div class="pie-fila"><span class="cta"><span>${esc(T.cta)}</span>${ICONOS.flecha}</span>${tienda}${web}</div><span class="url">${esc(T.url)}</span>`;
}

// Proporción del teléfono (ancho/alto por fuera) para que la captura quepa sin recortarse por los lados:
// la de la captura más un poco, porque el marco del teléfono ocupa más en proporción a lo alto
const proporcionTelefono = (captura) => ((captura || 0.568) + 0.015).toFixed(3);

// ¿No cabe? Alto: el contenido de la caja contra su alto. Ancho: una palabra más larga que la línea
// (con margen, porque las cursivas sobresalen unos píxeles sin que sea un problema).
const desborda = (el, caja) =>
  caja.scrollHeight > caja.clientHeight + 1 || caja.scrollWidth > caja.clientWidth + 12 || el.scrollWidth > el.clientWidth + 12;

// Achica la letra de `el` hasta que quepa en `caja` (por defecto el propio elemento). El tamaño del CSS es el máximo.
function ajustar(el, caja = el, minimo = 0.45) {
  // con el contenido centrado o abajo, lo que se sale por arriba o por la izquierda no cuenta en
  // scrollHeight/scrollWidth: se mide alineado arriba a la izquierda
  const { justifyContent, alignItems } = caja.style;
  caja.style.justifyContent = "flex-start";
  caja.style.alignItems = "flex-start";
  const max = parseFloat(getComputedStyle(el).fontSize);
  if (desborda(el, caja)) {
    let lo = max * minimo;
    let hi = max;
    while (hi - lo > 0.5) {
      const medio = (lo + hi) / 2;
      el.style.fontSize = medio + "px";
      desborda(el, caja) ? (hi = medio) : (lo = medio);
    }
    el.style.fontSize = lo + "px";
  }
  Object.assign(caja.style, { justifyContent, alignItems });
}

// Llena las piezas cuando las fuentes ya cargaron (para medir bien) y ajusta los textos marcados con
// data-ajustar (data-caja="<selector del contenedor>"). Devuelve una promesa: la plantilla registra su
// línea de tiempo al terminar (en su propio HTML, donde la busca `hyperframes check`).
// Se cargan todas las @font-face a mano: el navegador solo pide una fuente cuando ya hay texto que la usa,
// y document.fonts.ready no esperaría a las del titular, que se llena después.
function armarPiezas(construir) {
  const root = $("root");
  for (const [k, val] of Object.entries(D.colores)) root.style.setProperty("--" + k, val);
  root.style.setProperty("--ar-tel", proporcionTelefono(D.proporcion));
  document.querySelectorAll("[data-pie]").forEach((el) => (el.innerHTML = pie(D.textos, D.archivos)));
  return Promise.all([...document.fonts].map((f) => f.load().catch(() => null))).then(() => {
    construir();
    for (const el of document.querySelectorAll("[data-ajustar]")) {
      const pieza = el.closest(".pieza");
      const antes = pieza.style.display;
      pieza.style.display = ""; // mide aunque el reproductor tenga la pieza oculta
      ajustar(el, el.dataset.caja ? el.closest(el.dataset.caja) : el, +(el.dataset.ajustar || 0.45));
      pieza.style.display = antes;
    }
  });
}
