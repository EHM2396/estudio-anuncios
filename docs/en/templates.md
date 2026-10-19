# Templates

**English** · [Español](../es/plantillas.md)

A template is the design of an ad. The brand supplies copy, colors and files; the template supplies layout and animation. There are two kinds:

| Template | Kind | Output |
|---|---|---|
| `app-promo` | video | 14 s: hook, 3 benefits with the app on a phone, and a closing with button and badges. Landscape and portrait. |
| `piezas` | images | 5 static ads: question, benefit, number, list and before/after. Landscape, portrait and 4:5. |

Both are [HyperFrames](https://github.com/heygen-com/hyperframes) projects: HTML + CSS + a GSAP timeline, rendered to MP4 or PNG.

## Where they live

- `plantillas/<id>/` in the repo: the ones that ship with the skill.
- `<data>/plantillas/<id>/` in your data folder: your own. **They take priority.** If one has the same name, yours is used.

A brand picks its templates with `plantilla` (video) and `plantillaImagenes` (images) in `marca.json`.

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

## How a project is built

For each format, `anunciar.mjs`:
1. copies the template to `<data>/salidas/<brand>/proyectos/<template>-<format>/`;
2. copies the brand fonts as `assets/marca/fuente-500.ttf`, `-600` and `-700`, and the files as `assets/marca/<key>.<ext>`;
3. sets format and style in the HTML: `data-formato="horizontal"` becomes `data-formato="<format>" data-estilo="<style>"`, and `data-width`, `data-height` and the `viewport` are adjusted;
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

## Image template contract

- Each piece is a `<section class="clip" data-start="<i>" data-duration="1">`, in `piezas` order. The script grabs one image of each at second `i + 0.5`.
- `const D = "__DATOS__";` is replaced with `{ colores, textos, imagenes, archivos, estilo }`, and the JS fills the design from it.
- `{{img:<key>}}` becomes the path to the brand file; `{{img:@<piece>}}` becomes the screenshot chosen in `imagenes.<piece>.pantalla`.
- Styles via `[data-estilo="…"]` on `#root`.

## Adjusting the pace for one brand

1. Copy `plantillas/app-promo` to `<data>/plantillas/app-promo-<brand>`.
2. In the copy, edit the `B` (start of each benefit), `CIERRE` and `FIN` times in `index.html`, the `data-duration` of `#root` and the scenes, and `duracion` and `voz` in `plantilla.json`.
3. Set `"plantilla": "app-promo-<brand>"` in `marca.json`.

The skill does this for you if you ask for "slower" or "more time on the closing".

## Creating a new template

1. Copy the closest one (`app-promo` or `piezas`) under a new name.
2. Change the design while keeping the contract.
3. Test it with a brand: `node anunciar.mjs <brand> video --plantilla <id> --preparar`, then `npx hyperframes check` and `preview` in the generated project.
4. If it's for everyone, put it in the repo's `plantillas/`; if it's just yours, in `<data>/plantillas/`.

Missing ideas: a web video (browser or laptop frame), a typographic video for services without an app, a 30 s version, and an Instagram carousel.
