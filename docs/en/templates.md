# Templates

**English** · [Español](../es/plantillas.md)

A template is the design of an ad. The brand supplies copy, colors and files; the template supplies layout and animation. There are two kinds:

| Template | Kind | Output |
|---|---|---|
| `promo` | video | 14 s built from scenes: a hook that slams in, 3 benefits with a 3D camera orbiting the phone and zooming into a detail, and a closing where the button gets pressed. It moves according to the brand's direction and carries sound effects. Landscape, portrait and 4:5. **The default.** |
| `app-promo` | video | The previous one: 14 s, hook, 3 benefits with the app on a phone, and a closing. Landscape and portrait, with the color styles. |
| `piezas` | images | 5 static ads: question, benefit, number, list and before/after. Landscape, portrait and 4:5. The classic direction. |
| `piezas-<direction>` | images | The same 5 pieces with a whole different design: `editorial`, `poster`, `datos`, `nocturno`, `cercano`. See [directions.md](directions.md). |

All of them are [HyperFrames](https://github.com/heygen-com/hyperframes) projects: HTML + CSS + a GSAP timeline, rendered to MP4 or PNG.

## Where they live

- `plantillas/<id>/` in the repo: the ones that ship with the skill.
- `<data>/plantillas/<id>/` in your data folder: your own. **They take priority.** If one has the same name, yours is used.

A brand picks its video template with `plantilla` and its image direction with `direccion` in `marca.json` (`plantillaImagenes` is only for your own copy of the classic one).

## Template files

```
plantillas/app-promo/
  index.html        ← the composition
  plantilla.json    ← formats, expected files, voice timing…
  hyperframes.json  ← HyperFrames config
  package.json, meta.json
```

### Video `plantilla.json`

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

- `duracion`: length in seconds. `formatos`: width/height per format (`ancho`/`alto`).
- `archivos`: brand files the template expects. `pesosFuente`: font weights.
- `voz`: second at which each scene's voice line starts (`inicio`) and how many seconds fit (`max`). The script warns when a line is too long.
- `volumenMusica`: music volume under the voice (0–1).

### Image `plantilla.json`

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

A direction template also has `direccion` (`id`, `nombre`, `sensacion`, `idealPara`) and `recursos`: files from the repo's `recursos/` copied into the project (`{ "destination in the project": "path in recursos/" }`), such as its fonts and `assets/comun.js`. Any template, video included, can use `recursos`.

## How a project is built

For each format, `anunciar.mjs`:
1. copies the template to `<data>/salidas/<brand>/proyectos/<template>-<format>/`;
2. copies the brand fonts as `assets/marca/fuente-500.ttf`, `-600` and `-700`, the files as `assets/marca/<key>.<ext>`, and the template's `recursos`;
3. sets format and style in the HTML: `data-formato="horizontal"` becomes `data-formato="<format>" data-estilo="<style>"` (no `data-estilo` in direction templates), and `data-width`, `data-height` and the `viewport` are adjusted;
4. injects the brand data (see each kind's contract below);
5. renders with `npx hyperframes render` (video) or `snapshot` (images).

`--preparar` stops after step 4, so you can open the project in the HyperFrames Studio (`npx hyperframes preview`) and validate it with `npx hyperframes check`.

## Video template contract

- Root `#root` with `data-composition-id="main"`, `data-formato="horizontal"`, `data-width="1920"`, `data-height="1080"` and `data-duration`.
- Variables declared in `<html data-composition-variables='[…]'>`. The script sets each default to the brand's value: every key in `colores`, `textos` and `archivos` with the same `id`. Colors are available as `var(--colorFondo)`, etc.
- Brand images use `data-var-src="<key>" src="assets/marca/<key>.png"`; the script fills in the real `src`. If the brand doesn't have that file, the value is empty and the JS should hide the element.
- `font-family: "Marca"` with `@font-face` pointing to `assets/marca/fuente-<weight>.ttf`.
- A `<!-- AUDIO: … -->` comment inside `#root`: the script inserts the voice and music `<audio>` tags there in the `final` step.
- A single paused GSAP timeline: `window.__timelines["main"] = tl`.
- Formats and styles via CSS: `#root[data-formato="vertical"] …` and `#root[data-estilo="claro"] …`.

## Direction-driven video template contract (`promo`)

Same as a video template, except it receives the data the way image templates do:
- `const D = "__DATOS__";` is replaced with `{ colores, textos, archivos, direccion, gancho, foco, proporcion, variante }`:
  - `archivos`: the paths to the brand files in the project.
  - `direccion`: the brand's direction (or `--direccion`).
  - `gancho`: the hook type (`golpe`, `demo`, `chat`, or empty to let the variant decide).
  - `foco`: comes from `video.foco`.
  - `proporcion`: the screenshots' width/height, to draw the phone to fit them.
  - `variante`: the version number, or `--variante`.
- Using `variante` as the seed of a deterministic generator (never `Math.random`), the template picks each benefit's shot (`telefono`, `pantalla`, `cifra`, `tipo`), the screenshot order, the phone's side, the camera turns, the hook, the transition into the closing and the closing layout. Each version comes out different, and the same variant always gives the same video.
- `{{img:<key>}}` becomes the path to the brand file.
- The script does **not** set `data-estilo`; the template sets `data-direccion` on `#root`, and each direction changes CSS variables and its motion profile in the JS.
- `plantilla.json` also includes:
  - `direcciones`: the directions it supports (the script complains if the brand asks for another one).
  - `sfx`: per direction, a list of effects `[second, name, volume]`. Names are files in the library of HyperFrames' `media-use` skill (`whoosh`, `impact-bass-1`, `pop`, `click`, `ping`, `chime`…; the folder can be changed with `carpetaSfx` in `config.json`). The script copies them into the project on tracks that don't overlap. Times must match the hits and transitions in `index.html` (`T1`, `B`, `T2`, `IMPACTO`).
- Scenes overlap during transitions and layering comes from `z-index`. What gets animated in each scene is a `.marco` child, never the `section.clip`.

## Image template contract

- Each piece is a `<section class="clip" data-start="<i>" data-duration="1">`, in `piezas` order. The script grabs one image of each at second `i + 0.5`.
- `const D = "__DATOS__";` is replaced with `{ colores, textos, imagenes, archivos, estilo }`, and the JS fills the design from it.
- `{{img:<key>}}` becomes the path to the brand file; `{{img:@<piece>}}` becomes the screenshot chosen in `imagenes.<piece>.pantalla`.
- Styles via `[data-estilo="…"]` on `#root` (classic direction).
- Direction templates load `assets/comun.js` and call `armarPiezas(fill)`: it sets the colors as CSS variables, builds the footer (`[data-pie]`), loads every font, runs `fill`, and shrinks every element with `data-ajustar` until it fits its `data-caja` container. It returns a promise; in its `.then` the template registers `window.__timelines["main"]` in its own HTML, where `hyperframes check` looks for it. Helpers: `$`, `esc`, `resaltar(title, highlight)`, `ICONOS`.

## Adjusting the pace for one brand

1. Copy `plantillas/promo` to `<data>/plantillas/promo-<brand>`.
2. In the copy, edit the `T1` (end of the hook), `B` (start of each benefit) and `T2` (start of the closing) times in `index.html`, the `data-start`/`data-duration` of `#root` and the scenes, and `duracion`, `voz` and the `sfx` times in `plantilla.json`.
3. Set `"plantilla": "promo-<brand>"` in `marca.json`.

The skill does this for you if you ask for "slower" or "more time on the closing".

## Creating a new template

1. Copy the closest one (`app-promo`, `piezas` or a `piezas-<direction>`) under a new name. For a new image direction, follow [directions.md](directions.md#creating-a-new-direction).
2. Change the design while keeping the contract.
3. Test it with a brand: `node anunciar.mjs <brand> video --plantilla <id> --preparar`, then `npx hyperframes check` and `preview` in the generated project.
4. If it's for everyone, put it in the repo's `plantillas/`; if it's just yours, in `<data>/plantillas/`.

Missing ideas: a web video (browser or laptop frame), a typographic video for services without an app, a 30 s version, and an Instagram carousel.
