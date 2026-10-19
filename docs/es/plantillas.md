# Plantillas

[English](../en/templates.md) · **Español**

Una plantilla es el diseño de un anuncio. La marca pone los textos, colores y archivos, y la plantilla pone la composición y la animación. Hay dos tipos:

| Plantilla | Tipo | Qué genera |
|---|---|---|
| `app-promo` | video | 14 s: gancho, 3 beneficios con la app en un teléfono y cierre con botón e insignias. Horizontal y vertical. |
| `piezas` | imágenes | 5 anuncios fijos: pregunta, beneficio, número, lista y antes/después. Horizontal, vertical y 4:5. |

Ambas son proyectos de [HyperFrames](https://github.com/heygen-com/hyperframes): HTML + CSS + una línea de tiempo de GSAP, que se renderizan a MP4 o PNG.

## Dónde viven

- `plantillas/<id>/` en el repo: las que vienen con la skill.
- `<datos>/plantillas/<id>/` en tu carpeta de datos: las tuyas. **Tienen prioridad.** Si existe una con el mismo nombre, se usa la tuya.

La marca elige su plantilla con `plantilla` (video) y `plantillaImagenes` (imágenes) en `marca.json`.

## Archivos de una plantilla

```
plantillas/app-promo/
  index.html        ← la composición
  plantilla.json    ← formatos, archivos que espera, tiempos de voz…
  hyperframes.json  ← configuración de HyperFrames
  package.json, meta.json
```

### `plantilla.json` de video

```json
{
  "nombre": "app-promo",
  "descripcion": "…",
  "duracion": 14,
  "formatos": { "horizontal": { "ancho": 1920, "alto": 1080 }, "vertical": { "ancho": 1080, "alto": 1920 } },
  "archivos": ["logo", "logoClaro", "insignia", "pantalla1", "pantalla2", "pantalla3"],
  "pesosFuente": ["500", "600", "700"],
  "voz": { "gancho": { "inicio": 0.3, "max": 2.5 }, "beneficio1": { "inicio": 2.8, "max": 2.35 } },
  "volumenMusica": 0.18
}
```

- `voz`: en qué segundo entra la frase de cada escena (`inicio`) y cuántos segundos caben (`max`). El script avisa si una frase dura más.
- `volumenMusica`: volumen de la música bajo la voz (0–1).

### `plantilla.json` de imágenes

```json
{
  "nombre": "piezas",
  "tipo": "imagenes",
  "formatos": { "horizontal": { … }, "vertical": { … }, "4x5": { "ancho": 1080, "alto": 1350 } },
  "piezas": ["pregunta", "beneficio", "numero", "lista", "antes-despues"],
  "archivos": ["logo", "logoClaro", "insignia", "pantalla1", "pantalla2", "pantalla3"],
  "pesosFuente": ["500", "600", "700"]
}
```

## Cómo se arma un proyecto

Para cada formato, `anunciar.mjs`:
1. copia la plantilla a `<datos>/salidas/<marca>/proyectos/<plantilla>-<formato>/`;
2. copia las fuentes de la marca como `assets/marca/fuente-500.ttf`, `-600` y `-700`, y los archivos como `assets/marca/<clave>.<ext>`;
3. cambia el formato y el estilo en el HTML: `data-formato="horizontal"` pasa a `data-formato="<formato>" data-estilo="<estilo>"`, y se ajustan `data-width`, `data-height` y el `viewport`;
4. mete los datos de la marca (ver el contrato de cada tipo, abajo);
5. renderiza con `npx hyperframes render` (video) o `snapshot` (imágenes).

Con `--preparar` se queda en el paso 4, para abrir el proyecto en el Studio de HyperFrames (`npx hyperframes preview`) y revisarlo con `npx hyperframes check`.

## Contrato de una plantilla de video

- Raíz `#root` con `data-composition-id="main"`, `data-formato="horizontal"`, `data-width="1920"`, `data-height="1080"` y `data-duration`.
- Variables declaradas en `<html data-composition-variables='[…]'>`. El script pone como valor por defecto el de la marca: cada clave de `colores`, `textos` y `archivos` con el mismo `id`. Los colores quedan disponibles como `var(--colorFondo)`, etc.
- Imágenes de la marca con `data-var-src="<clave>" src="assets/marca/<clave>.png"`: el script pone el `src` real. Si la marca no tiene ese archivo, queda vacío y conviene ocultar el elemento desde el JS.
- Fuente `font-family: "Marca"` con `@font-face` a `assets/marca/fuente-<peso>.ttf`.
- Comentario `<!-- AUDIO: … -->` dentro de `#root`: ahí el script inserta los `<audio>` de voz y música en la fase `final`.
- Una sola línea de tiempo de GSAP en pausa: `window.__timelines["main"] = tl`.
- Formatos y estilos con CSS: `#root[data-formato="vertical"] …` y `#root[data-estilo="claro"] …`.

## Contrato de una plantilla de imágenes

- Cada pieza es un `<section class="clip" data-start="<i>" data-duration="1">`, en el orden de `piezas`. El script saca una imagen de cada una en el segundo `i + 0.5`.
- `const D = "__DATOS__";` se reemplaza por `{ colores, textos, imagenes, archivos, estilo }` y el JS llena el diseño con eso.
- `{{img:<clave>}}` se reemplaza por la ruta del archivo de la marca, y `{{img:@<pieza>}}` por la pantalla elegida en `imagenes.<pieza>.pantalla`.
- Estilos con `[data-estilo="…"]` sobre `#root`.

## Ajustar el ritmo para una sola marca

1. Copia `plantillas/app-promo` a `<datos>/plantillas/app-promo-<marca>`.
2. En la copia cambia en `index.html` los tiempos `B` (inicio de cada beneficio), `CIERRE` y `FIN`, los `data-duration` de `#root` y de las escenas, y en `plantilla.json` los campos `duracion` y `voz`.
3. Pon `"plantilla": "app-promo-<marca>"` en `marca.json`.

La skill lo hace sola si le pides "más lento" o "más tiempo en el cierre".

## Crear una plantilla nueva

1. Copia la más parecida (`app-promo` o `piezas`) con otro nombre.
2. Cambia el diseño respetando el contrato.
3. Pruébala con una marca: `node anunciar.mjs <marca> video --plantilla <id> --preparar` y luego `npx hyperframes check` y `preview` en el proyecto generado.
4. Si es para todos, déjala en `plantillas/` del repo; si es solo tuya, en `<datos>/plantillas/`.

Ideas que faltan: video para webs (marco de navegador o laptop), video para servicios sin app (tipográfico), una versión de 30 s y carrusel de Instagram.
