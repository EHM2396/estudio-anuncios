# Plantillas

[English](../en/templates.md) · **Español**

Una plantilla es el diseño de un anuncio. La marca pone los textos, colores y archivos, y la plantilla pone la composición y la animación. Hay dos tipos:

| Plantilla | Tipo | Qué genera |
|---|---|---|
| `promo` | video | 14 s por escenas: gancho con golpe, 3 beneficios con la cámara 3D alrededor del teléfono y acercamiento a un detalle, y cierre con el botón que se presiona. Se mueve según la dirección de la marca y lleva efectos de sonido. Horizontal, vertical y 4:5. **Es la de por defecto.** |
| `app-promo` | video | La anterior: 14 s, gancho, 3 beneficios con la app en un teléfono y cierre. Horizontal y vertical, con los estilos de color. |
| `piezas` | imágenes | 5 anuncios fijos: pregunta, beneficio, número, lista y antes/después. Horizontal, vertical y 4:5. Es la dirección clásica. |
| `piezas-<dirección>` | imágenes | Las mismas 5 piezas con otro diseño completo: `editorial`, `poster`, `datos`, `nocturno`, `cercano`. Ver [direcciones.md](direcciones.md). |

Todas son proyectos de [HyperFrames](https://github.com/heygen-com/hyperframes): HTML + CSS + una línea de tiempo de GSAP, que se renderizan a MP4 o PNG.

## Dónde viven

- `plantillas/<id>/` en el repo: las que vienen con la skill.
- `<datos>/plantillas/<id>/` en tu carpeta de datos: las tuyas. **Tienen prioridad.** Si existe una con el mismo nombre, se usa la tuya.

La marca elige la plantilla del video con `plantilla` y la dirección de las imágenes con `direccion` en `marca.json` (`plantillaImagenes` es solo para una copia propia de la clásica).

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

Una plantilla de dirección lleva además `direccion` (`id`, `nombre`, `sensacion`, `idealPara`) y `recursos`: archivos de `recursos/` del repo que se copian al proyecto (`{ "destino en el proyecto": "ruta en recursos/" }`), como sus tipografías y `assets/comun.js`. Cualquier plantilla, también la de video, puede usar `recursos`.

## Cómo se arma un proyecto

Para cada formato, `anunciar.mjs`:
1. copia la plantilla a `<datos>/salidas/<marca>/proyectos/<plantilla>-<formato>/`;
2. copia las fuentes de la marca como `assets/marca/fuente-500.ttf`, `-600` y `-700`, los archivos como `assets/marca/<clave>.<ext>` y los `recursos` de la plantilla;
3. cambia el formato y el estilo en el HTML: `data-formato="horizontal"` pasa a `data-formato="<formato>" data-estilo="<estilo>"` (sin `data-estilo` en las plantillas de dirección), y se ajustan `data-width`, `data-height` y el `viewport`;
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

## Contrato de una plantilla de video por dirección (`promo`)

Igual que la de video, salvo que recibe los datos como las de imágenes:
- `const D = "__DATOS__";` se reemplaza por `{ colores, textos, archivos, direccion, gancho, foco, proporcion, variante }`:
  - `archivos`: las rutas de los archivos de la marca en el proyecto.
  - `direccion`: la de la marca (o `--direccion`).
  - `gancho`: el tipo (`golpe`, `demo`, `chat`, o vacío para que decida la variante).
  - `foco`: el de `video.foco`.
  - `proporcion`: ancho/alto de las capturas, para dibujar el teléfono a su medida.
  - `variante`: el número de la versión, o `--variante`.
- Con `variante` como semilla de un generador determinista (nunca `Math.random`), la plantilla elige la toma de cada beneficio (`telefono`, `pantalla`, `cifra`, `tipo`), el lado del teléfono, los giros, el gancho, la transición al cierre y el tipo de cierre. Cada captura va siempre con su beneficio. Así cada versión sale distinta y la misma variante siempre da el mismo video.
- `{{img:<clave>}}` se reemplaza por la ruta del archivo de la marca.
- El script **no** pone `data-estilo`; la plantilla pone `data-direccion` en `#root` y cada dirección cambia variables de CSS y su perfil de movimiento en el JS.
- `plantilla.json` lleva además:
  - `direcciones`: las que soporta (si la marca pide otra, el script avisa).
  - `sfx`: por dirección, la lista de efectos `[segundo, nombre, volumen]`. Los nombres son archivos de la biblioteca de la skill `media-use` de HyperFrames (`whoosh`, `impact-bass-1`, `pop`, `click`, `ping`, `chime`…; la carpeta se puede cambiar con `carpetaSfx` en `config.json`). El script los copia al proyecto y los pone en pistas que no se pisan. Los tiempos tienen que coincidir con los golpes y transiciones del `index.html` (`T1`, `B`, `T2`, `IMPACTO`).
- Las escenas se superponen durante las transiciones y el orden de capas lo da el `z-index`. Lo que se anima en cada escena es un hijo `.marco`, nunca la `section.clip`.

## Contrato de una plantilla de imágenes

- Cada pieza es un `<section class="clip" data-start="<i>" data-duration="1">`, en el orden de `piezas`. El script saca una imagen de cada una en el segundo `i + 0.5`.
- `const D = "__DATOS__";` se reemplaza por `{ colores, textos, imagenes, archivos, estilo }` y el JS llena el diseño con eso.
- `{{img:<clave>}}` se reemplaza por la ruta del archivo de la marca, y `{{img:@<pieza>}}` por la pantalla elegida en `imagenes.<pieza>.pantalla`.
- Estilos con `[data-estilo="…"]` sobre `#root` (dirección clásica).
- Las plantillas de dirección cargan `assets/comun.js` y llaman a `armarPiezas(llenar)`. Esa función pone los colores como variables de CSS, arma el pie (`[data-pie]`), carga todas las fuentes y corre `llenar`. Después achica cada elemento con `data-ajustar` hasta que quepa en su contenedor `data-caja`. Devuelve una promesa, y en su `.then` la plantilla registra `window.__timelines["main"]` en su propio HTML, porque ahí la busca `hyperframes check`. Ayudas disponibles: `$`, `esc`, `resaltar(titulo, resaltado)` e `ICONOS`.

## Ajustar el ritmo para una sola marca

1. Copia `plantillas/promo` a `<datos>/plantillas/promo-<marca>`.
2. En la copia cambia en `index.html` los tiempos `T1` (fin del gancho), `B` (inicio de cada beneficio) y `T2` (inicio del cierre), los `data-start`/`data-duration` de `#root` y de las escenas, y en `plantilla.json` los campos `duracion`, `voz` y los tiempos de `sfx`.
3. Pon `"plantilla": "promo-<marca>"` en `marca.json`.

La skill lo hace sola si le pides "más lento" o "más tiempo en el cierre".

## Crear una plantilla nueva

1. Copia la más parecida (`app-promo`, `piezas` o una `piezas-<dirección>`) con otro nombre. Para una dirección nueva de imágenes, sigue [direcciones.md](direcciones.md#crear-una-dirección-nueva).
2. Cambia el diseño respetando el contrato.
3. Pruébala con una marca: `node anunciar.mjs <marca> video --plantilla <id> --preparar` y luego `npx hyperframes check` y `preview` en el proyecto generado.
4. Si es para todos, déjala en `plantillas/` del repo; si es solo tuya, en `<datos>/plantillas/`.

Ideas que faltan: video para webs (marco de navegador o laptop), video para servicios sin app (tipográfico), una versión de 30 s y carrusel de Instagram.
