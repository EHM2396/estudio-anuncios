# Brand format (`marca.json`)

**English** · [Español](../es/marca.md)

Each project has its brand in `<data>/marcas/<slug>/`. The `/anuncio` skill creates it automatically when it analyzes the project. This page is for understanding it or editing it by hand.

> Field names are in Spanish because the tool was built in Spanish; their meaning is explained below.

```
marcas/agendita/
  marca.json
  logo.svg            ← for dark backgrounds (light text)
  logo-claro.svg      ← for light backgrounds (dark text)
  insignia.png        ← store badge (optional)
  pantallas/          ← 3 portrait screenshots of the UI
  fuentes/            ← brand .ttf fonts (optional)
  voz/                ← filled when the voice is generated
  musica.mp3          ← created when music is generated (or drop in your own)
  historial/          ← marca.json backups made when restoring versions
```

## Full example

See the [Spanish page](../es/marca.md#ejemplo-completo) for a complete `marca.json` for a fictional app ("Agendita"). The structure is the same in any language; only the copy changes.

## Fields

### General

| Field | Meaning |
|---|---|
| `origen` | Path of the analyzed project. The skill uses it to recognize the brand next time. |
| `idioma` | Language of the ads (`es`, `en`…). |
| `estilos` | Default visual style for `imagenes` (images) and `video`: `oscuro` (dark), `claro` (light), `color` or `minimal`. |
| `reglas` | Rules the copy and voice must always follow (banned phrases, tone, claims that can't be made). |
| `plantilla` | Video template (default `app-promo`). |
| `plantillaImagenes` | Image template (default `piezas`). |

### `archivos` (files) and `fuentes` (fonts)

Paths relative to the brand folder.

| Key | Meaning | Required? |
|---|---|---|
| `logo` | Logo for dark backgrounds. SVG or transparent PNG, ideally without the tagline. | Yes |
| `logoClaro` | Logo for light backgrounds. Used by the light, color and minimal styles and the "benefit" piece. | No (falls back to `logo`) |
| `insignia` | Official store badge (Google Play, App Store). | No |
| `pantalla1..3` | Clean portrait screenshots of the UI, no headlines or frames, close to 852×1500. | Yes |
| `fuentes.500/600/700` | `.ttf` files per weight. A missing weight uses the closest one. | No (Poppins) |

### `colores` (colors)

| Key | Use |
|---|---|
| `colorFondo` | Main dark brand color (backgrounds). |
| `colorFondo2` | Deeper shade, for gradients and text on light backgrounds. |
| `colorAcento` | Accent color: buttons, highlights, icons. |
| `colorTexto` | Text on dark backgrounds (usually `#FFFFFF`). |
| `colorSobreAcento` | Text on the accent color: dark and readable. |
| `colorClaro` | Soft light background, for the light style and the "benefit" piece. |

### `textos` (video copy)

Limits are guidelines so the copy fits the design.

| Key | Where it shows | Limit |
|---|---|---|
| `hookLinea1`, `hookLinea2` | Opening hook; line 2 is highlighted | ≤ 22 chars each |
| `titulo1..3` | One benefit per scene | ≤ 45 |
| `chip1..3Etiqueta` / `chip1..3Valor` | Floating card for each benefit (label / value); numeric values count up | label ≤ 26, short value |
| `kicker` | Small label above the titles | ≤ 30 |
| `nombre` | Brand name (giant background text) | — |
| `eslogan` | Closing headline (tagline) | ≤ 32 |
| `cta` | Button text | ≤ 20 |
| `url` | Website, below the badges | — |
| `webLinea1`, `webLinea2` | "Use it in your / Browser" badge. Leave empty if there's no web version. | — |

### `imagenes` (image copy)

Each piece has its own copy, separate from the video.

| Piece | Fields |
|---|---|
| `pregunta` (question) | `titulo`, `resaltado` (part of the title shown in color), `subtitulo` |
| `beneficio` (benefit) | `kicker`, `titulo`, `subtitulo`, `pantalla` (`pantalla1..3`), `tarjeta.etiqueta`, `tarjeta.valor` |
| `numero` (number) | `etiqueta`, `valor` (the hero figure), `subtitulo`, `pantalla` |
| `lista` (list) | `titulo`, `items` (3, ≤ 30 chars), `pantalla` |
| `antes-despues` (before/after) | `antesTitulo`, `antes` (3), `despuesTitulo`, `despues` (3) |

### `voz` (voice)

| Key | Meaning |
|---|---|
| `vozId`, `nombreVoz` | ElevenLabs voice. If empty, the skill helps you pick one the first time. |
| `modelo` | ElevenLabs model (for example `eleven_multilingual_v2`). |
| `idioma` | Voice language. |
| `guion` | One line per scene: `gancho` (hook), `beneficio1..3`, `cierre` (closing). About 6 words per benefit; the closing can be longer. |
| `velocidad` | Optional per-scene speed (0.7–1.2) to make a line fit. |

Defaults for `vozId`, `modelo` and `idioma` come from the repo's `config.local.json → voz`, falling back to `config.json → voz`.

## Copy rules

- No made-up claims: no user counts, improvement percentages or awards. Sample amounts and data shown inside the UI are fine.
- Concrete benefits rather than features ("Know what you earn", not "Reports module").
- Follow the brand's `reglas`.
