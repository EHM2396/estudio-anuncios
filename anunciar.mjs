#!/usr/bin/env node
// Genera los anuncios de una marca por fases, guardando cada generación como una versión
// nueva (nunca se pisa la anterior) para poder comparar, volver atrás y aprobar.
//
//   node anunciar.mjs <marca> imagenes            1. imágenes publicitarias (gratis)
//   node anunciar.mjs <marca> video               2. video sin audio para revisar (gratis)
//   node anunciar.mjs <marca> final               3. video con voz y música (se generan antes con Claude + ElevenLabs)
//
//   node anunciar.mjs verificar                   revisa requisitos y crea la carpeta de datos
//   node anunciar.mjs ganchos "hablado | pantalla" …   puntúa ganchos (docs/es/ganchos.md)
//   node anunciar.mjs <marca> muestras [--direcciones editorial,poster]   2 piezas de cada dirección, lado a lado (para elegir)
//   node anunciar.mjs <marca> versiones           lista las versiones y cuál está aprobada
//   node anunciar.mjs <marca> restaurar <imagenes|video> v2   vuelve los textos/estilo de la marca a esa versión
//   node anunciar.mjs <marca> aprobar <imagenes|video> v2     la copia a salidas/<marca>/aprobado/ (lista para subir)
//
//   --formatos horizontal,vertical   formatos a generar (por defecto: todos los de la plantilla)
//   --piezas numero,lista            (imágenes) rehace solo esas piezas; el resto se copia de la última versión
//   --direccion editorial|poster|datos|nocturno|cercano|clasica   (imágenes) dirección creativa (por defecto: la de marca.json)
//   --estilo oscuro|claro|color|minimal   estilo visual de la dirección clásica (por defecto: el de marca.json, si no "oscuro")
//   --gancho 1,2,3                   usa esos ganchos de marca.ganchos (una versión por gancho, para probarlos)
//   --variante 7                     (video promo) qué tomas, orden y movimientos usa; por defecto, el número de versión
//   --sfx                            (video) efectos de sonido en el video sin voz
//   --nota "texto"                   qué cambió en esta versión (aparece en "versiones")
//   --borrador                       render rápido de baja calidad
//   --preparar                       solo arma el proyecto (para abrirlo en el Studio y ajustar)
//
// Los datos (marcas/ y salidas/) viven fuera del código, en la carpeta de datos:
// ANUNCIOS_DATOS, o "carpetaDatos" en config.local.json / config.json, o ~/Documents/Anuncios.
// Resultado en <datos>/salidas/<marca>/: imagenes/vN/<formato>/, videos/vN/, aprobado/

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const RAIZ = path.dirname(fileURLToPath(import.meta.url));

// config.json (en el repo) + config.local.json (de cada equipo, fuera de git)
const leerJson = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {});
const CONFIG = { ...leerJson(path.join(RAIZ, "config.json")), ...leerJson(path.join(RAIZ, "config.local.json")) };
const HF = `npx --yes hyperframes@${CONFIG.hyperframes || "0.8.172"}`;
const expandir = (r) => (r.startsWith("~") ? path.join(os.homedir(), r.slice(1)) : r);
const DATOS = path.resolve(expandir(process.env.ANUNCIOS_DATOS || CONFIG.carpetaDatos || "~/Documents/Anuncios"));
for (const d of ["marcas", "salidas", "plantillas"]) fs.mkdirSync(path.join(DATOS, d), { recursive: true });
// plantillas propias (p. ej. una copia con otro ritmo para una marca) en <datos>/plantillas; si no, las del repo
const rutaPlantilla = (id) => [path.join(DATOS, "plantillas", id), path.join(RAIZ, "plantillas", id)].find((d) => fs.existsSync(d)) || path.join(RAIZ, "plantillas", id);
const ESTILOS = ["oscuro", "claro", "color", "minimal"];

const args = process.argv.slice(2);
const CON_VALOR = ["--formatos", "--plantilla", "--piezas", "--direccion", "--direcciones", "--estilo", "--gancho", "--variante", "--nota"];
const posicionales = args.filter((a, i) => !a.startsWith("--") && !CON_VALOR.includes(args[i - 1]));
if (posicionales[0] === "verificar") verificar();
if (posicionales[0] === "ganchos") puntuarGanchos(posicionales.slice(1));
const [marcaId, fase, tipoArg, versionArg] = posicionales;
const FASES = ["imagenes", "video", "final", "muestras", "versiones", "restaurar", "aprobar"];
const opcion = (n) => args.includes("--" + n);
const valor = (n) => {
  const i = args.indexOf("--" + n);
  return i >= 0 ? args[i + 1] : undefined;
};

if (!marcaId || !FASES.includes(fase)) {
  const marcas = fs.readdirSync(path.join(DATOS, "marcas")).filter((m) => !m.startsWith("_"));
  console.log("Uso: node anunciar.mjs <marca> <imagenes|video|final|muestras|versiones|restaurar|aprobar> [opciones]");
  console.log("     node anunciar.mjs verificar");
  console.log('     node anunciar.mjs ganchos "hablado | pantalla" ["otro gancho" …]');
  console.log(`Carpeta de datos: ${DATOS}`);
  console.log("Marcas disponibles: " + (marcas.join(", ") || "(ninguna todavía)"));
  process.exit(1);
}

const dirMarca = path.join(DATOS, "marcas", marcaId);
const archivoMarca = path.join(dirMarca, "marca.json");
if (!fs.existsSync(archivoMarca)) {
  console.error(`✗ No existe la marca "${marcaId}" (${archivoMarca}).`);
  process.exit(1);
}
const marcaBase = JSON.parse(fs.readFileSync(archivoMarca, "utf8"));
// la marca de cada generación: la base, o la base con otro gancho (--gancho)
let marca = marcaBase;
let ganchoActivo = 0;
const plantillaId = valor("plantilla") || marca.plantilla || "promo";
const dirPlantilla = rutaPlantilla(plantillaId);
const plantilla = JSON.parse(fs.readFileSync(path.join(dirPlantilla, "plantilla.json"), "utf8"));
const dirSalida = path.join(DATOS, "salidas", marcaId);
validarArchivos();
const avisos = [];

// Requisitos y carpeta de datos (la skill lo corre al empezar)
function verificar() {
  const ok = (cond, txt, ayuda) => {
    console.log(`${cond ? "✔" : "✗"} ${txt}${cond || !ayuda ? "" : `\n    → ${ayuda}`}`);
    return cond;
  };
  const existe = (cmd) => {
    try {
      execSync(`${cmd} -version`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  };
  const mayor = +process.versions.node.split(".")[0];
  const instalar = process.platform === "win32" ? "winget install Gyan.FFmpeg" : process.platform === "darwin" ? "brew install ffmpeg" : "sudo apt install ffmpeg";
  const todo = [
    ok(mayor >= 22, `Node.js ${process.versions.node}`, "Se necesita Node 22 o superior: https://nodejs.org"),
    ok(existe("ffmpeg"), "FFmpeg", instalar),
    ok(existe("ffprobe"), "FFprobe (viene con FFmpeg)", instalar),
  ].every(Boolean);
  console.log(`✔ Carpeta de datos: ${DATOS}`);
  const marcas = fs.readdirSync(path.join(DATOS, "marcas")).filter((m) => !m.startsWith("_"));
  console.log(`  Marcas: ${marcas.join(", ") || "(ninguna todavía)"}`);
  process.exit(todo ? 0 : 1);
}

// Puntúa ganchos en español con los criterios de docs/es/ganchos.md. Cada frase: "hablado | pantalla".
// Es una guía rápida: el criterio más flojo pesa más, porque basta uno para que el pulgar siga.
function puntuarGanchos(frases) {
  if (!frases.length) {
    console.log('Uso: node anunciar.mjs ganchos "hablado | pantalla" ["otro gancho" …]');
    process.exit(1);
  }
  const normal = (t) => t.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const palabras = (t) => t.match(/[\p{L}\p{N}$%]+/gu) || [];
  const EN_JUEGO = /^(sigues|sigue|todavia|aun|otra|pierd|perd|olvid|nunca|nadie|nada|deja|dejas|sin|error|cuest|cost|pagas|gastas|mano|cuaderno|tarde|problema|hart|cansad|falla|no)/;
  const A_TI = /^(tu|tus|te|ti|contigo|usted|ustedes|sabes|tienes|sigues|pierdes|quieres|puedes|haces|vendes|cobras|ganas|pagas|gastas|olvidas|necesitas|usas|anotas|confirmas|respondes|escribes|\p{L}+(aste|iste))$/u;
  const ORDEN = /^(mira|deja|prueba|imagina|olvida|haz|pon|guarda|cobra|agenda|vende|descarga|empieza)$/;
  const NUMERO = /^(\$?\d[\d.,]*%?|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|cien|mil)$/;
  const FOLLETO = /^(solucion|soluciones|facil|facilmente|optimiza|optimizar|innovador|innovadora|revoluciona|revolucionaria|potencia|eficiente|eficiencia|gestiona|gestionar|increible|mejor|transforma|herramienta|plataforma|nivel|experiencia|integral|simplifica|inteligente|moderna|moderno|completa|completo|ideal|perfecta|perfecto)$/;
  const INVALIDO = [
    [/^\W*(hola|bienvenid|te presentamos|presentamos|conoce (a|la|el|nuestr))/, "empieza con preámbulo: arranca directo en lo que engancha"],
    [/(en este video|te voy a (mostrar|ensenar|contar)|hacer scroll|hagas scroll|scrollear|no deslices)/, "pide atención en vez de ganarla"],
  ];
  const CLAIM = /(\d\s?%|\b(el|la) mejor\b|\bnumero (uno|1)\b|#1|\blider\b|\b(miles|millones) de\b|garantiza|\b(el|la) unic[oa]\b)/;

  const puntuar = (frase) => {
    const [hablado, pantalla] = frase.split("|").map((s) => s.trim());
    const orig = palabras(hablado);
    const w = orig.map(normal);
    const txt = normal(hablado);
    const fuerte = (p, i) => EN_JUEGO.test(p) || A_TI.test(p) || ORDEN.test(p) || NUMERO.test(p) || (i > 0 && /^\p{Lu}/u.test(orig[i]));

    let largo = w.length <= 10 ? 100 : w.length <= 12 ? 75 : w.length <= 15 ? 45 : 15;
    if (pantalla) {
      const n = palabras(pantalla).length;
      largo = Math.min(largo, n <= 6 ? 100 : n <= 8 ? 50 : 20);
    }
    const concreto = Math.max(0, Math.min(100,
      55 + (w.some((p) => NUMERO.test(p) && p !== "una" && p !== "uno") ? 25 : 0) +
      (orig.some((p, i) => i > 0 && /^\p{Lu}/u.test(p)) || /[«"“]/.test(hablado) ? 20 : 0) -
      15 * w.filter((p) => FOLLETO.test(p)).length));
    const enJuego = Math.min(100, 20 + (w.some((p) => EN_JUEGO.test(p)) ? 45 : 0) + (hablado.includes("?") ? 15 : 0) +
      (/\b(otra vez|sigues|todavia|aun)\b/.test(txt) ? 15 : 0) +
      (hablado.includes("?") && /\b(cuant[oa]s?|sabes|por que|que pasa)\b/.test(txt) ? 20 : 0));
    const i = w.findIndex(fuerte);
    const alFrente = i < 0 ? 15 : i < 3 ? 100 : i < 5 ? 70 : i < 8 ? 40 : 15;
    const aTi = w.some((p) => A_TI.test(p)) ? 100 : ORDEN.test(w[0] || "") || hablado.includes("?") ? 70 : w.some((p) => /^nuestr/.test(p)) ? 25 : 35;

    const criterios = { largo, concreto, "en juego": enJuego, "al frente": alFrente, "a ti": aTi };
    const valores = Object.values(criterios);
    const flojo = Object.keys(criterios).find((k) => criterios[k] === Math.min(...valores));
    const invalido = INVALIDO.filter(([re]) => re.test(txt)).map(([, msg]) => msg);
    let total = Math.round(0.6 * (valores.reduce((a, b) => a + b) / valores.length) + 0.4 * Math.min(...valores));
    if (invalido.length) total = Math.min(total, 35);
    // sin nada en juego ni pregunta es un eslogan, no un gancho
    if (enJuego <= 20) {
      invalido.push("suena a eslogan: no hay nada en juego ni una pregunta");
      total = Math.min(total, 49);
    }
    return { frase: pantalla ? `${hablado}  |  ${pantalla}` : hablado, total, criterios, flojo, invalido, claim: CLAIM.test(txt) };
  };

  for (const r of frases.map(puntuar).sort((a, b) => b.total - a.total)) {
    const banda = r.total >= 75 ? "FUERTE" : r.total >= 50 ? "SIRVE " : "DÉBIL ";
    console.log(`\n${String(r.total).padStart(3)}  ${banda}  ${r.frase}`);
    console.log(`     ${Object.entries(r.criterios).map(([k, v]) => `${k} ${v}`).join(" · ")}   → más flojo: ${r.flojo}`);
    for (const m of r.invalido) console.log(`     ✗ ${m}`);
    if (r.claim) console.log("     ⚠ posible claim: verifica que sea real (reglas de la marca) o quítalo");
  }
  process.exit(0);
}

// Avisa de archivos que la marca menciona pero no existen (logo, pantallas, fuentes)
function validarArchivos() {
  const faltan = [...Object.values(marca.archivos || {}), ...Object.values(marca.fuentes || {})].filter((f) => !fs.existsSync(path.join(dirMarca, f)));
  if (faltan.length) {
    console.error(`✗ La marca "${marcaId}" menciona archivos que no están en ${dirMarca}:\n  - ${faltan.join("\n  - ")}`);
    process.exit(1);
  }
}

function correr(cmd, cwd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

function estiloDe(tipo) {
  const e = valor("estilo") || marca.estilos?.[tipo] || "oscuro";
  if (!ESTILOS.includes(e)) throw new Error(`Estilo "${e}" no existe. Opciones: ${ESTILOS.join(", ")}`);
  return e;
}

// La marca con el gancho n de marca.ganchos en lugar del suyo (mismo anuncio, otro gancho)
function conGancho(n) {
  if (!n) return marcaBase;
  const g = marcaBase.ganchos?.[n - 1];
  if (!g) throw new Error(`La marca no tiene el gancho ${n} (tiene ${marcaBase.ganchos?.length || 0} en "ganchos").`);
  const m = structuredClone(marcaBase);
  const [l1, l2 = ""] = g.pantalla;
  Object.assign(m.textos, { hookLinea1: l1, hookLinea2: l2 });
  if (m.voz?.guion) m.voz.guion.gancho = g.voz;
  if (m.imagenes?.pregunta) Object.assign(m.imagenes.pregunta, g.imagen || { titulo: `${l1} ${l2}`.trim(), resaltado: l2 });
  return m;
}

// ---------- Versiones ----------

const carpetaTipo = (tipo) => path.join(dirSalida, tipo === "imagenes" ? "imagenes" : "videos");

function versiones(tipo) {
  const dir = carpetaTipo(tipo);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((d) => /^v\d+$/.test(d))
    .sort((a, b) => a.slice(1) - b.slice(1));
}

function nuevaVersion(tipo, info) {
  const lista = versiones(tipo);
  const v = "v" + ((lista.length ? +lista.at(-1).slice(1) : 0) + 1);
  const dir = path.join(carpetaTipo(tipo), v);
  fs.mkdirSync(dir, { recursive: true });
  const datos = { version: v, fecha: new Date().toISOString(), nota: valor("nota") || "", ...info, gancho: ganchoActivo || undefined, marca };
  fs.writeFileSync(path.join(dir, "version.json"), JSON.stringify(datos, null, 2));
  return { v, dir };
}

const leerAprobado = () => {
  const f = path.join(dirSalida, "aprobado", "aprobado.json");
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {};
};

function listarVersiones() {
  const aprobado = leerAprobado();
  for (const tipo of ["imagenes", "video"]) {
    console.log(`\n${tipo === "imagenes" ? "Imágenes" : "Videos"}:`);
    const lista = versiones(tipo);
    if (!lista.length) console.log("  (ninguna todavía)");
    for (const v of lista) {
      const info = JSON.parse(fs.readFileSync(path.join(carpetaTipo(tipo), v, "version.json"), "utf8"));
      const partes = [
        new Date(info.fecha).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" }),
        info.direccion ? `dirección ${info.direccion}` : `estilo ${info.estilo}`,
        info.variante && `variante ${info.variante}`,
        info.formatos?.join("/"),
        tipo === "video" ? (info.audio ? "con voz y música" : info.sfx ? "solo efectos" : "sin audio") : info.piezas ? `rehechas: ${info.piezas.join(", ")}` : "",
        info.gancho && `gancho ${info.gancho}${info.marca.ganchos?.[info.gancho - 1]?.formula ? ` (${info.marca.ganchos[info.gancho - 1].formula})` : ""}`,
        info.nota,
      ].filter(Boolean);
      console.log(`  ${v}${aprobado[tipo] === v ? "  ✔ APROBADA" : ""}  ·  ${partes.join("  ·  ")}`);
    }
  }
}

function restaurar(tipo, v) {
  const f = path.join(carpetaTipo(tipo), v, "version.json");
  if (!fs.existsSync(f)) throw new Error(`No existe ${tipo} ${v}`);
  const { marca: anterior } = JSON.parse(fs.readFileSync(f, "utf8"));
  // copia de seguridad de la marca actual antes de reemplazarla
  const dirHist = path.join(dirMarca, "historial");
  fs.mkdirSync(dirHist, { recursive: true });
  fs.copyFileSync(archivoMarca, path.join(dirHist, `marca-${new Date().toISOString().replace(/[:.]/g, "-")}.json`));
  fs.writeFileSync(archivoMarca, JSON.stringify(anterior, null, 2) + "\n");
  console.log(`marca.json vuelve a como estaba en ${tipo} ${v} (la versión actual quedó en marcas/${marcaId}/historial/).`);
}

function aprobar(tipo, v) {
  const origen = path.join(carpetaTipo(tipo), v);
  if (!fs.existsSync(origen)) throw new Error(`No existe ${tipo} ${v}`);
  const destino = path.join(dirSalida, "aprobado", tipo === "imagenes" ? "imagenes" : "videos");
  fs.rmSync(destino, { recursive: true, force: true });
  fs.cpSync(origen, destino, { recursive: true, filter: (f) => !f.endsWith("version.json") });
  const aprobado = { ...leerAprobado(), [tipo]: v };
  fs.writeFileSync(path.join(dirSalida, "aprobado", "aprobado.json"), JSON.stringify(aprobado, null, 2));
  console.log(`${tipo} ${v} aprobada → ${destino}`);
}

// ---------- Construcción de proyectos ----------

// Fuentes de la marca por peso (la más cercana si falta alguno); sin fuentes, Poppins de recursos/
function copiarFuentes(dir, pesosPlantilla) {
  const fuentes = marca.fuentes && Object.keys(marca.fuentes).length ? marca.fuentes : null;
  for (const peso of pesosPlantilla) {
    let origen;
    if (fuentes) {
      const cercano = Object.keys(fuentes).sort((a, b) => Math.abs(a - peso) - Math.abs(b - peso))[0];
      origen = path.join(dirMarca, fuentes[cercano]);
    } else {
      const nombre = { 500: "Poppins-Medium.ttf", 600: "Poppins-SemiBold.ttf" }[peso] || "Poppins-Bold.ttf";
      origen = path.join(RAIZ, "recursos", "fuentes", nombre);
    }
    fs.copyFileSync(origen, path.join(dir, "assets", "marca", `fuente-${peso}.ttf`));
  }
}

function proyectoBase(dirP, nombre) {
  // carpeta aparte por gancho: con --gancho 1,2,3 van seguidos y Chrome aún no suelta la anterior
  const dir = path.join(dirSalida, "proyectos", nombre + (ganchoActivo ? `-g${ganchoActivo}` : ""));
  // reintenta: el navegador de la captura anterior a veces tarda en soltar la carpeta
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 30, retryDelay: 500 });
  fs.mkdirSync(path.join(dir, "assets", "marca"), { recursive: true });
  for (const f of ["hyperframes.json", "package.json", "meta.json"]) {
    if (fs.existsSync(path.join(dirP, f))) fs.copyFileSync(path.join(dirP, f), path.join(dir, f));
  }
  return dir;
}

// Recursos compartidos que pide la plantilla ("recursos": { "destino en el proyecto": "ruta en recursos/" }):
// tipografías de la dirección, ayudas de JS comunes…
function copiarRecursos(dir, p) {
  for (const [destino, origen] of Object.entries(p.recursos || {})) {
    fs.mkdirSync(path.dirname(path.join(dir, destino)), { recursive: true });
    fs.copyFileSync(path.join(RAIZ, "recursos", origen), path.join(dir, destino));
  }
}

const aplicarFormato = (html, formato, ancho, alto, estilo) =>
  html
    .replace('data-formato="horizontal"', `data-formato="${formato}"${estilo ? ` data-estilo="${estilo}"` : ""}`)
    .replace('data-width="1920"', `data-width="${ancho}"`)
    .replace('data-height="1080"', `data-height="${alto}"`)
    .replace('content="width=1920, height=1080"', `content="width=${ancho}, height=${alto}"`);

// Proyecto del video: plantilla + recursos de la marca
function prepararVideo(formato, conAudio, estilo) {
  const { ancho, alto } = plantilla.formatos[formato];
  const dir = proyectoBase(dirPlantilla, `${plantillaId}-${formato}`);
  copiarFuentes(dir, plantilla.pesosFuente);
  copiarRecursos(dir, plantilla);

  const variables = { ...marca.colores, ...marca.textos };
  for (const clave of plantilla.archivos) {
    const origen = marca.archivos?.[clave];
    if (!origen) {
      variables[clave] = "";
      continue;
    }
    const destino = `assets/marca/${clave}${path.extname(origen)}`;
    fs.copyFileSync(path.join(dirMarca, origen), path.join(dir, destino));
    variables[clave] = destino;
  }
  variables.logoClaro ||= variables.logo;

  let html = fs.readFileSync(path.join(dirPlantilla, "index.html"), "utf8");
  if (html.includes('"__DATOS__"')) {
    // plantilla por escenas (promo): recibe los datos de la marca como las de imágenes
    const archivos = Object.fromEntries(plantilla.archivos.map((k) => [k, variables[k] || ""]));
    const datos = { colores: marca.colores, textos: marca.textos, archivos, direccion: direccionVideo(), gancho: tipoGancho(), foco: marca.video?.foco, proporcion: proporcionPantallas(), variante: varianteVideo() };
    html = html
      .replace(/\{\{img:([\w-]+)\}\}/g, (_, k) => archivos[k] || "")
      .replace('"__DATOS__"', JSON.stringify(datos).replace(/</g, "\\u003c"));
  } else {
    // Los valores de la marca se escriben como valores por defecto de la composición,
    // así el Studio, el render y las imágenes muestran lo mismo sin flags extra.
    html = html.replace(/data-composition-variables='([\s\S]*?)'/, (_, json) => {
      const decl = JSON.parse(json.replace(/&#39;/g, "'"));
      for (const d of decl) if (d.id in variables) d.default = variables[d.id];
      return `data-composition-variables='${JSON.stringify(decl).replace(/'/g, "&#39;")}'`;
    });
    // src real de cada imagen variable (por si la marca usa .png en vez de .svg, etc.)
    html = html.replace(/data-var-src="(\w+)" src="[^"]*"/g, (m, id) => (id in variables ? `data-var-src="${id}" src="${variables[id]}"` : m));
  }
  html = aplicarFormato(html, formato, ancho, alto, estilo);
  const etiquetas = (conAudio ? audio(dir) : "") + (conAudio || opcion("sfx") ? efectos(dir) : "");
  html = html.replace(/\s*<!-- AUDIO:[^>]*-->/, etiquetas);
  fs.writeFileSync(path.join(dir, "index.html"), html);
  return dir;
}

// Dirección del video: la de la marca (la misma de las imágenes) si la plantilla la soporta
function direccionVideo() {
  const d = valor("direccion") || marca.direccion || "clasica";
  if (plantilla.direcciones && !plantilla.direcciones.includes(d)) throw new Error(`La plantilla ${plantillaId} no tiene la dirección "${d}". Opciones: ${plantilla.direcciones.join(", ")}`);
  return d;
}

// Variante del video: la plantilla elige con ella las tomas de cada beneficio, el orden de las capturas, el lado
// del teléfono, los giros y la transición al cierre. Por defecto es el número de la versión que se va a crear,
// así cada video nuevo sale distinto; con --gancho 1,2,3 todas las versiones del lote comparten la misma.
let varianteLote;
function varianteVideo() {
  const ultima = versiones("video").at(-1);
  varianteLote ??= +(valor("variante") || (ultima ? +ultima.slice(1) + 1 : 1));
  return varianteLote;
}

// Tipo de gancho del video: el de marca.video.gancho, "demo" si el gancho activo es una demo en frío,
// y si no, el que decida la plantilla según la dirección
function tipoGancho() {
  if (marca.video?.gancho) return marca.video.gancho;
  const activo = ganchoActivo ? marca.ganchos?.[ganchoActivo - 1] : marca.ganchos?.find((g) => g.voz === marca.voz?.guion?.gancho);
  return /demo/i.test(activo?.formula || "") ? "demo" : undefined;
}

// Efectos de sonido de la dirección (plantilla.json → sfx), sincronizados con los golpes y las transiciones.
// Salen de la biblioteca de la skill media-use de HyperFrames (licencia de Pixabay) o de config "carpetaSfx".
function efectos(dir) {
  const cues = plantilla.sfx?.[direccionVideo()];
  if (!cues) return "";
  const origen = [CONFIG.carpetaSfx && expandir(CONFIG.carpetaSfx), path.join(os.homedir(), ".claude", "skills", "media-use", "audio", "assets", "sfx")].find((d) => d && fs.existsSync(d));
  if (!origen) {
    avisos.push("No encontré la biblioteca de efectos de sonido (skill media-use de HyperFrames): el video sale sin efectos.");
    return "";
  }
  fs.mkdirSync(path.join(dir, "assets", "sfx"), { recursive: true });
  const pistas = []; // fin de lo último que suena en cada pista, para no encimar dos efectos en la misma
  const tags = [];
  cues.forEach(([t, nombre, volumen], i) => {
    const archivo = path.join(origen, `${nombre}.mp3`);
    if (!fs.existsSync(archivo)) return avisos.push(`No existe el efecto "${nombre}".`);
    fs.copyFileSync(archivo, path.join(dir, "assets", "sfx", `${nombre}.mp3`));
    const dur = Math.min(duracion(archivo), plantilla.duracion - t);
    let pista = pistas.findIndex((fin) => fin <= t);
    if (pista < 0) pista = pistas.push(0) - 1;
    pistas[pista] = t + dur;
    tags.push(`<audio id="sfx-${i}" src="assets/sfx/${nombre}.mp3" data-start="${t}" data-duration="${dur.toFixed(3)}" data-track-index="${20 + pista}" data-volume="${volumen}"></audio>`);
  });
  return tags.map((t) => "\n      " + t).join("");
}

// Ancho/alto de las capturas (la primera), para dibujar el teléfono a su medida y que no se recorten
function proporcionPantallas() {
  const f = marca.archivos?.pantalla1 && path.join(dirMarca, marca.archivos.pantalla1);
  if (!f || !fs.existsSync(f)) return undefined;
  const [w, h] = execSync(`ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "${f}"`, { encoding: "utf8" }).trim().split(",").map(Number);
  return w && h ? +(w / h).toFixed(3) : undefined;
}

function duracion(archivo) {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${archivo}"`, { encoding: "utf8" });
  return parseFloat(out);
}

// Voz (marcas/<marca>/voz/<escena>.mp3) y música (marcas/<marca>/musica.mp3), si existen
function audio(dir) {
  const tags = [];
  for (const [escena, { inicio, max }] of Object.entries(plantilla.voz || {})) {
    // con --gancho, la voz del gancho es voz/gancho-<n>.mp3
    const archivo = escena === "gancho" && ganchoActivo ? `gancho-${ganchoActivo}.mp3` : `${escena}.mp3`;
    const origen = path.join(dirMarca, "voz", archivo);
    if (!fs.existsSync(origen)) {
      if (archivo !== `${escena}.mp3`) avisos.push(`Falta voz/${archivo}: el gancho ${ganchoActivo} sale sin voz.`);
      continue;
    }
    // sin el silencio que ElevenLabs deja al principio y al final
    const destino = path.join(dir, "assets", "marca", `voz-${escena}.mp3`);
    const sinSilencio = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03";
    execSync(`ffmpeg -v error -y -i "${origen}" -af "${sinSilencio},areverse,${sinSilencio.replace("0.03", "0.08")},areverse" "${destino}"`);
    const dur = duracion(destino);
    if (dur > max) avisos.push(`La voz de "${escena}" dura ${dur.toFixed(2)} s y cabe ${max} s: se solapará con la escena siguiente.`);
    tags.push(`<audio id="voz-${escena}" src="assets/marca/voz-${escena}.mp3" data-start="${inicio}" data-duration="${dur.toFixed(3)}" data-track-index="10" data-volume="1"></audio>`);
  }
  const musica = path.join(dirMarca, "musica.mp3");
  if (fs.existsSync(musica)) {
    // ajustada a la duración del anuncio, con fundido de entrada y de salida
    const d = plantilla.duracion;
    execSync(
      `ffmpeg -v error -y -i "${musica}" -t ${d} -af "afade=t=in:d=0.4,afade=t=out:st=${d - 1.5}:d=1.5" "${path.join(dir, "assets", "marca", "musica.mp3")}"`,
    );
    tags.push(`<audio id="musica" src="assets/marca/musica.mp3" data-start="0" data-duration="${plantilla.duracion}" data-track-index="11" data-volume="${plantilla.volumenMusica ?? 0.18}"></audio>`);
  }
  if (!tags.length && !plantilla.sfx) avisos.push("No hay voz ni música en la carpeta de la marca: el video final sale mudo. Pídele a Claude que las genere (ver CLAUDE.md).");
  else if (!tags.length) avisos.push("No hay voz ni música en la carpeta de la marca: el video final sale solo con efectos de sonido.");
  return tags.map((t) => "\n      " + t).join("");
}

// Volumen estándar de redes (-14 LUFS, pico -1.5 dB) sin recodificar el video
function masterizar(mp4) {
  const tmp = mp4.replace(/\.mp4$/, ".tmp.mp4");
  execSync(`ffmpeg -v error -y -i "${mp4}" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 "${tmp}"`);
  fs.renameSync(tmp, mp4);
}

// ---------- Imágenes (plantilla de tipo "imagenes", diseñada aparte del video) ----------

// Direcciones creativas: cada una es una plantilla de imágenes propia (piezas-<id>); "clasica" es "piezas"
const plantillaDeDireccion = (d) => (d === "clasica" ? "piezas" : `piezas-${d}`);
function direcciones() {
  const ids = new Set(["clasica"]);
  for (const base of [path.join(RAIZ, "plantillas"), path.join(DATOS, "plantillas")]) {
    for (const d of fs.existsSync(base) ? fs.readdirSync(base) : []) {
      const f = path.join(base, d, "plantilla.json");
      if (fs.existsSync(f) && JSON.parse(fs.readFileSync(f, "utf8")).direccion) ids.add(d.replace(/^piezas-/, ""));
    }
  }
  return [...ids];
}

function generarImagenes() {
  const direccion = valor("direccion") || marca.direccion || "clasica";
  if (!direcciones().includes(direccion)) throw new Error(`La dirección "${direccion}" no existe. Opciones: ${direcciones().join(", ")}`);
  // plantillaImagenes es una copia propia de la clásica: se usa cuando la dirección es la clásica
  const id = direccion === "clasica" && marca.plantillaImagenes ? marca.plantillaImagenes : plantillaDeDireccion(direccion);
  const dirP = rutaPlantilla(id);
  const p = JSON.parse(fs.readFileSync(path.join(dirP, "plantilla.json"), "utf8"));
  const formatos = valor("formatos") ? valor("formatos").split(",") : Object.keys(p.formatos);
  const soloPiezas = valor("piezas") ? valor("piezas").split(",") : null;
  for (const f of formatos) if (!p.formatos[f]) throw new Error(`La plantilla ${id} no tiene el formato "${f}"`);
  for (const pz of soloPiezas || []) if (!p.piezas.includes(pz)) throw new Error(`No existe la pieza "${pz}". Piezas: ${p.piezas.join(", ")}`);
  // los estilos (oscuro, claro…) son variantes de la dirección clásica; las demás direcciones tienen su propio diseño
  const estilo = p.direccion ? undefined : estiloDe("imagenes");

  // al rehacer solo algunas piezas, se parte de la última versión
  const anterior = soloPiezas && versiones("imagenes").at(-1);
  const { v, dir: dirVersion } = nuevaVersion("imagenes", { plantilla: id, direccion: p.direccion && direccion, estilo, formatos, piezas: soloPiezas });
  if (anterior) fs.cpSync(path.join(carpetaTipo("imagenes"), anterior), dirVersion, { recursive: true, filter: (f) => !f.endsWith("version.json") });

  for (const formato of formatos) {
    console.log(`\n=== ${marcaId} · ${id} · ${formato} · ${estilo || direccion} → imagenes/${v} ===`);
    renderizarPiezas(id, p, formato, path.join(dirVersion, formato), estilo, soloPiezas);
  }
  console.log(`\nVersión nueva: ${dirVersion}`);
}

// Arma el proyecto de una plantilla de imágenes en un formato y guarda <pieza>.png en `destino`
function renderizarPiezas(id, p, formato, destino, estilo, soloPiezas) {
  const dirP = rutaPlantilla(id);
  const { ancho, alto } = p.formatos[formato];
  const dir = proyectoBase(dirP, `${id}-${formato}`);
  copiarFuentes(dir, p.pesosFuente);
  copiarRecursos(dir, p);
  const archivos = {};
  for (const clave of p.archivos) {
    const origen = marca.archivos?.[clave];
    if (!origen) continue;
    archivos[clave] = `assets/marca/${clave}${path.extname(origen)}`;
    fs.copyFileSync(path.join(dirMarca, origen), path.join(dir, archivos[clave]));
  }
  archivos.logoClaro ??= archivos.logo;

  const datos = { colores: marca.colores, textos: marca.textos, imagenes: marca.imagenes, archivos, estilo, proporcion: proporcionPantallas() };
  let html = fs
    .readFileSync(path.join(dirP, "index.html"), "utf8")
    // {{img:clave}} → archivo de la marca; {{img:@pieza}} → la pantalla elegida para esa pieza
    .replace(/\{\{img:(@?)([\w-]+)\}\}/g, (_, arroba, k) => archivos[arroba ? marca.imagenes[k]?.pantalla : k] || "")
    .replace('"__DATOS__"', JSON.stringify(datos).replace(/</g, "\\u003c"));
  fs.writeFileSync(path.join(dir, "index.html"), aplicarFormato(html, formato, ancho, alto, estilo));

  fs.mkdirSync(destino, { recursive: true });
  const piezas = p.piezas.map((nombre, i) => ({ nombre, t: i + 0.5 })).filter((x) => !soloPiezas || soloPiezas.includes(x.nombre));
  correr(`${HF} snapshot . --at ${piezas.map((x) => x.t).join(",")} --no-end --keep -o "${destino}"`, dir);
  for (const { nombre, t } of piezas) {
    const archivo = path.join(destino, `at-${t}s.png`);
    if (fs.existsSync(archivo)) fs.renameSync(archivo, path.join(destino, `${nombre}.png`));
  }
}

// Muestras para elegir dirección: unas piezas en 4:5 de cada dirección, lado a lado en muestras/hoja.png.
// No crea versiones: se rehacen cada vez.
function muestras() {
  const lista = (valor("direcciones") || direcciones().join(",")).split(",");
  const piezas = valor("piezas") ? valor("piezas").split(",") : ["pregunta", "beneficio"];
  for (const d of lista) if (!direcciones().includes(d)) throw new Error(`La dirección "${d}" no existe. Opciones: ${direcciones().join(", ")}`);
  const base = path.join(dirSalida, "muestras");
  fs.rmSync(base, { recursive: true, force: true, maxRetries: 30, retryDelay: 500 });
  const columnas = [];
  for (const d of lista) {
    const id = plantillaDeDireccion(d);
    const p = JSON.parse(fs.readFileSync(path.join(rutaPlantilla(id), "plantilla.json"), "utf8"));
    console.log(`\n=== ${marcaId} · muestra ${d} ===`);
    renderizarPiezas(id, p, "4x5", path.join(base, d), p.direccion ? undefined : estiloDe("imagenes"), piezas);
    columnas.push({ d, nombre: p.direccion?.nombre || "Clásica" });
  }
  // una columna por dirección, con su nombre arriba (drawtext con la fuente de recursos/, por ruta relativa)
  const entradas = columnas.flatMap(({ d }) => piezas.map((pz) => `-i "${path.join(base, d, pz + ".png")}"`)).join(" ");
  const n = piezas.length;
  let filtro = "";
  columnas.forEach(({ nombre }, c) => {
    const ins = piezas.map((_, k) => `[${c * n + k}]scale=432:-1[e${c}_${k}];`).join("");
    const pila = piezas.map((_, k) => `[e${c}_${k}]`).join("");
    filtro += `${ins}${pila}vstack=inputs=${n},pad=iw+24:ih+80:12:80:white,drawtext=fontfile=Poppins-Bold.ttf:text='${nombre}':x=16:y=22:fontsize=36:fontcolor=0x111111[c${c}];`;
  });
  filtro += columnas.map((_, c) => `[c${c}]`).join("") + (columnas.length > 1 ? `hstack=inputs=${columnas.length}` : "null");
  const hoja = path.join(base, "hoja.png");
  execSync(`ffmpeg -v error -y ${entradas} -filter_complex "${filtro}" "${hoja}"`, { cwd: path.join(RAIZ, "recursos", "fuentes") });
  console.log(`\nMuestras: ${hoja}`);
}

// ---------- Video ----------

function generarVideo(conAudio) {
  const formatos = (valor("formatos") || Object.keys(plantilla.formatos).join(",")).split(",");
  for (const f of formatos) if (!plantilla.formatos[f]) throw new Error(`La plantilla ${plantillaId} no tiene el formato "${f}"`);
  const estilo = estiloDe("video");
  if (opcion("preparar")) {
    for (const formato of formatos) {
      const dir = prepararVideo(formato, conAudio, estilo);
      console.log(`Proyecto listo en ${dir}\nPara verlo: cd "${dir}" && ${HF} preview`);
    }
    return;
  }
  // plantillas por dirección (promo): se mueven según la dirección de la marca; las demás usan los estilos
  const direccion = plantilla.direcciones ? direccionVideo() : undefined;
  const variante = plantilla.direcciones ? varianteVideo() : undefined; // antes de crear la versión: es su número
  const sfx = !conAudio && opcion("sfx");
  const { v, dir: dirVersion } = nuevaVersion("video", { plantilla: plantillaId, direccion, variante, estilo, formatos, audio: conAudio, sfx: sfx || undefined });
  for (const formato of formatos) {
    console.log(`\n=== ${marcaId} · ${plantillaId} · ${formato} · ${direccion || estilo} → videos/${v} ===`);
    const dir = prepararVideo(formato, conAudio, estilo);
    const mp4 = path.join(dirVersion, `${marcaId}-${formato}${conAudio ? "" : sfx ? "-sin-voz" : "-sin-audio"}.mp4`);
    correr(`${HF} render . -q ${opcion("borrador") ? "draft" : "high"} -o "${mp4}"`, dir);
    if (conAudio || sfx) masterizar(mp4);
  }
  console.log(`\nVersión nueva: ${dirVersion}`);
}

// ---------- Principal ----------

fs.mkdirSync(dirSalida, { recursive: true });
const tipoValido = (t) => (["imagenes", "video"].includes(t) ? t : (console.error('Indica "imagenes" o "video"'), process.exit(1)));
if (fase === "versiones") listarVersiones();
else if (fase === "muestras") muestras();
else if (fase === "restaurar") restaurar(tipoValido(tipoArg), versionArg);
else if (fase === "aprobar") aprobar(tipoValido(tipoArg), versionArg);
else {
  const tipo = fase === "imagenes" ? "imagenes" : "video";
  // una generación (y una versión) por gancho pedido; sin --gancho, la de la marca tal cual
  for (const n of valor("gancho") ? valor("gancho").split(",").map(Number) : [0]) {
    const antes = versiones(tipo);
    try {
      ganchoActivo = n;
      marca = conGancho(n);
      fase === "imagenes" ? generarImagenes() : generarVideo(fase === "final");
    } catch (e) {
      for (const v of versiones(tipo)) if (!antes.includes(v)) fs.rmSync(path.join(carpetaTipo(tipo), v), { recursive: true, force: true });
      console.error(`
✗ Falló la generación${n ? ` del gancho ${n}` : ""}; no se guardó versión nueva. ${e.message}`);
      process.exit(1);
    }
  }
}

for (const a of new Set(avisos)) console.warn(`\n⚠ ${a}`);
