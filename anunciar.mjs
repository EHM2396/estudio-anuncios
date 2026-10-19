#!/usr/bin/env node
// Genera los anuncios de una marca por fases, guardando cada generación como una versión
// nueva (nunca se pisa la anterior) para poder comparar, volver atrás y aprobar.
//
//   node anunciar.mjs <marca> imagenes            1. imágenes publicitarias (gratis)
//   node anunciar.mjs <marca> video               2. video sin audio para revisar (gratis)
//   node anunciar.mjs <marca> final               3. video con voz y música (se generan antes con Claude + ElevenLabs)
//
//   node anunciar.mjs verificar                   revisa requisitos y crea la carpeta de datos
//   node anunciar.mjs <marca> versiones           lista las versiones y cuál está aprobada
//   node anunciar.mjs <marca> restaurar <imagenes|video> v2   vuelve los textos/estilo de la marca a esa versión
//   node anunciar.mjs <marca> aprobar <imagenes|video> v2     la copia a salidas/<marca>/aprobado/ (lista para subir)
//
//   --formatos horizontal,vertical   formatos a generar (por defecto: todos los de la plantilla)
//   --piezas numero,lista            (imágenes) rehace solo esas piezas; el resto se copia de la última versión
//   --estilo oscuro|claro|color|minimal   estilo visual (por defecto: el de marca.json, si no "oscuro")
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
const CON_VALOR = ["--formatos", "--plantilla", "--piezas", "--estilo", "--nota"];
const posicionales = args.filter((a, i) => !a.startsWith("--") && !CON_VALOR.includes(args[i - 1]));
if (posicionales[0] === "verificar") verificar();
const [marcaId, fase, tipoArg, versionArg] = posicionales;
const FASES = ["imagenes", "video", "final", "versiones", "restaurar", "aprobar"];
const opcion = (n) => args.includes("--" + n);
const valor = (n) => {
  const i = args.indexOf("--" + n);
  return i >= 0 ? args[i + 1] : undefined;
};

if (!marcaId || !FASES.includes(fase)) {
  const marcas = fs.readdirSync(path.join(DATOS, "marcas")).filter((m) => !m.startsWith("_"));
  console.log("Uso: node anunciar.mjs <marca> <imagenes|video|final|versiones|restaurar|aprobar> [opciones]");
  console.log("     node anunciar.mjs verificar");
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
const marca = JSON.parse(fs.readFileSync(archivoMarca, "utf8"));
const plantillaId = valor("plantilla") || marca.plantilla || "app-promo";
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
  const datos = { version: v, fecha: new Date().toISOString(), nota: valor("nota") || "", ...info, marca };
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
        `estilo ${info.estilo}`,
        info.formatos?.join("/"),
        tipo === "video" ? (info.audio ? "con voz y música" : "sin audio") : info.piezas ? `rehechas: ${info.piezas.join(", ")}` : "",
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
  const dir = path.join(dirSalida, "proyectos", nombre);
  // reintenta: el navegador de la captura anterior a veces tarda en soltar la carpeta
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 30, retryDelay: 500 });
  fs.mkdirSync(path.join(dir, "assets", "marca"), { recursive: true });
  for (const f of ["hyperframes.json", "package.json", "meta.json"]) {
    if (fs.existsSync(path.join(dirP, f))) fs.copyFileSync(path.join(dirP, f), path.join(dir, f));
  }
  return dir;
}

const aplicarFormato = (html, formato, ancho, alto, estilo) =>
  html
    .replace('data-formato="horizontal"', `data-formato="${formato}" data-estilo="${estilo}"`)
    .replace('data-width="1920"', `data-width="${ancho}"`)
    .replace('data-height="1080"', `data-height="${alto}"`)
    .replace('content="width=1920, height=1080"', `content="width=${ancho}, height=${alto}"`);

// Proyecto del video: plantilla + recursos de la marca
function prepararVideo(formato, conAudio, estilo) {
  const { ancho, alto } = plantilla.formatos[formato];
  const dir = proyectoBase(dirPlantilla, `${plantillaId}-${formato}`);
  copiarFuentes(dir, plantilla.pesosFuente);

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

  // Los valores de la marca se escriben como valores por defecto de la composición,
  // así el Studio, el render y las imágenes muestran lo mismo sin flags extra.
  let html = fs.readFileSync(path.join(dirPlantilla, "index.html"), "utf8");
  html = html.replace(/data-composition-variables='([\s\S]*?)'/, (_, json) => {
    const decl = JSON.parse(json.replace(/&#39;/g, "'"));
    for (const d of decl) if (d.id in variables) d.default = variables[d.id];
    return `data-composition-variables='${JSON.stringify(decl).replace(/'/g, "&#39;")}'`;
  });
  // src real de cada imagen variable (por si la marca usa .png en vez de .svg, etc.)
  html = html.replace(/data-var-src="(\w+)" src="[^"]*"/g, (m, id) => (id in variables ? `data-var-src="${id}" src="${variables[id]}"` : m));
  html = aplicarFormato(html, formato, ancho, alto, estilo);
  html = html.replace(/\s*<!-- AUDIO:[^>]*-->/, conAudio ? audio(dir) : "");
  fs.writeFileSync(path.join(dir, "index.html"), html);
  return dir;
}

function duracion(archivo) {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${archivo}"`, { encoding: "utf8" });
  return parseFloat(out);
}

// Voz (marcas/<marca>/voz/<escena>.mp3) y música (marcas/<marca>/musica.mp3), si existen
function audio(dir) {
  const tags = [];
  for (const [escena, { inicio, max }] of Object.entries(plantilla.voz || {})) {
    const origen = path.join(dirMarca, "voz", `${escena}.mp3`);
    if (!fs.existsSync(origen)) continue;
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
  if (!tags.length) avisos.push("No hay voz ni música en la carpeta de la marca: el video final sale mudo. Pídele a Claude que las genere (ver CLAUDE.md).");
  return tags.map((t) => "\n      " + t).join("");
}

// Volumen estándar de redes (-14 LUFS, pico -1.5 dB) sin recodificar el video
function masterizar(mp4) {
  const tmp = mp4.replace(/\.mp4$/, ".tmp.mp4");
  execSync(`ffmpeg -v error -y -i "${mp4}" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 "${tmp}"`);
  fs.renameSync(tmp, mp4);
}

// ---------- Imágenes (plantilla de tipo "imagenes", diseñada aparte del video) ----------

function generarImagenes() {
  const id = marca.plantillaImagenes || "piezas";
  const dirP = rutaPlantilla(id);
  const p = JSON.parse(fs.readFileSync(path.join(dirP, "plantilla.json"), "utf8"));
  const formatos = valor("formatos") ? valor("formatos").split(",") : Object.keys(p.formatos);
  const soloPiezas = valor("piezas") ? valor("piezas").split(",") : null;
  for (const f of formatos) if (!p.formatos[f]) throw new Error(`La plantilla ${id} no tiene el formato "${f}"`);
  for (const pz of soloPiezas || []) if (!p.piezas.includes(pz)) throw new Error(`No existe la pieza "${pz}". Piezas: ${p.piezas.join(", ")}`);
  const estilo = estiloDe("imagenes");

  // al rehacer solo algunas piezas, se parte de la última versión
  const anterior = soloPiezas && versiones("imagenes").at(-1);
  const { v, dir: dirVersion } = nuevaVersion("imagenes", { plantilla: id, estilo, formatos, piezas: soloPiezas });
  if (anterior) fs.cpSync(path.join(carpetaTipo("imagenes"), anterior), dirVersion, { recursive: true, filter: (f) => !f.endsWith("version.json") });

  for (const formato of formatos) {
    console.log(`\n=== ${marcaId} · ${id} · ${formato} · ${estilo} → imagenes/${v} ===`);
    const { ancho, alto } = p.formatos[formato];
    const dir = proyectoBase(dirP, `${id}-${formato}`);
    copiarFuentes(dir, p.pesosFuente);
    const archivos = {};
    for (const clave of p.archivos) {
      const origen = marca.archivos?.[clave];
      if (!origen) continue;
      archivos[clave] = `assets/marca/${clave}${path.extname(origen)}`;
      fs.copyFileSync(path.join(dirMarca, origen), path.join(dir, archivos[clave]));
    }
    archivos.logoClaro ??= archivos.logo;

    const datos = { colores: marca.colores, textos: marca.textos, imagenes: marca.imagenes, archivos, estilo };
    let html = fs
      .readFileSync(path.join(dirP, "index.html"), "utf8")
      // {{img:clave}} → archivo de la marca; {{img:@pieza}} → la pantalla elegida para esa pieza
      .replace(/\{\{img:(@?)([\w-]+)\}\}/g, (_, arroba, k) => archivos[arroba ? marca.imagenes[k]?.pantalla : k] || "")
      .replace('"__DATOS__"', JSON.stringify(datos).replace(/</g, "\\u003c"));
    fs.writeFileSync(path.join(dir, "index.html"), aplicarFormato(html, formato, ancho, alto, estilo));

    const destino = path.join(dirVersion, formato);
    fs.mkdirSync(destino, { recursive: true });
    const piezas = p.piezas.map((nombre, i) => ({ nombre, t: i + 0.5 })).filter((x) => !soloPiezas || soloPiezas.includes(x.nombre));
    correr(`${HF} snapshot . --at ${piezas.map((x) => x.t).join(",")} --no-end --keep -o "${destino}"`, dir);
    for (const { nombre, t } of piezas) {
      const archivo = path.join(destino, `at-${t}s.png`);
      if (fs.existsSync(archivo)) fs.renameSync(archivo, path.join(destino, `${nombre}.png`));
    }
  }
  console.log(`\nVersión nueva: ${dirVersion}`);
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
  const { v, dir: dirVersion } = nuevaVersion("video", { plantilla: plantillaId, estilo, formatos, audio: conAudio });
  for (const formato of formatos) {
    console.log(`\n=== ${marcaId} · ${plantillaId} · ${formato} · ${estilo} → videos/${v} ===`);
    const dir = prepararVideo(formato, conAudio, estilo);
    const mp4 = path.join(dirVersion, `${marcaId}-${formato}${conAudio ? "" : "-sin-audio"}.mp4`);
    correr(`${HF} render . -q ${opcion("borrador") ? "draft" : "high"} -o "${mp4}"`, dir);
    if (conAudio) masterizar(mp4);
  }
  console.log(`\nVersión nueva: ${dirVersion}`);
}

// ---------- Principal ----------

fs.mkdirSync(dirSalida, { recursive: true });
const tipoValido = (t) => (["imagenes", "video"].includes(t) ? t : (console.error('Indica "imagenes" o "video"'), process.exit(1)));
if (fase === "versiones") listarVersiones();
else if (fase === "restaurar") restaurar(tipoValido(tipoArg), versionArg);
else if (fase === "aprobar") aprobar(tipoValido(tipoArg), versionArg);
else {
  const tipo = fase === "imagenes" ? "imagenes" : "video";
  const antes = versiones(tipo);
  try {
    fase === "imagenes" ? generarImagenes() : generarVideo(fase === "final");
  } catch (e) {
    for (const v of versiones(tipo)) if (!antes.includes(v)) fs.rmSync(path.join(carpetaTipo(tipo), v), { recursive: true, force: true });
    console.error(`
✗ Falló la generación; no se guardó versión nueva. ${e.message}`);
    process.exit(1);
  }
}

for (const a of new Set(avisos)) console.warn(`\n⚠ ${a}`);
