# Creative directions

**English** · [Español](../es/direcciones.md)

A creative direction is the whole design of the ads: typography, layout, shapes, how the app is shown and the visual tone. The brand brings its colors, logo, body font and screenshots; the direction decides how they're used. Two brands with the same direction look alike; two brands with different directions don't.

The same direction drives the **images** and the **video** (`promo` template). In the video, besides the look, it defines how things move: how words enter, how hard the hit is, the shake and flash, the camera turns, the transition between scenes and the sound effects.

| Direction | In the video |
|---|---|
| `poster` | Words slam in big and rotated, strong shake and flash, sharp camera turns; zoom-with-flash transition; bass hits |
| `datos` | Precise mask wipes, no rotation; color-bar transition; clicks and pings |
| `nocturno` | Blur to sharp, smooth camera orbit; light-sweep transition; whooshes and a sparkle |
| `editorial` | Elegant rises from a mask, slow camera; page-turn transition; soft sound |
| `cercano` | Bounces, the question in a chat bubble with "typing…"; iris transition; pops |
| `clasica` | Moderate slam; zoom transition |

| Direction | Feels | Best for | What sets it apart |
|---|---|---|---|
| `editorial` | Calm, trustworthy, premium | Finance, professional services, health, education | Big serif (Instrument Serif), paper, hairline rules, the app as a captioned photo, numbered index |
| `poster` | Loud, energetic, direct | Consumer apps, launches, promotions, young audiences | Huge condensed caps (Anton), flat colors, hard shadows, tapes and stickers, giant phone cropped by the edge |
| `datos` (data) | Precise, technical, clear | Software, SaaS, B2B, tools, reporting | Visible Swiss grid, tight grotesque (Space Grotesk) and mono (JetBrains Mono), line-drawn phone with a callout, before/after as a table |
| `nocturno` (night) | Premium, dramatic, high-tech | Technology, AI, premium products, apps with a dark UI | Near-black with light in the accent color, grain, centered geometric type (Sora), floating phone with a glow, frosted glass |
| `cercano` (friendly) | Warm, kind, human | Local and service businesses, wellness, community, messaging or booking apps | Rounded type (Fredoka), handwritten notes (Caveat) with arrows, the question in a chat bubble, organic blobs, phone with a colored frame |
| `clasica` (classic) | Clean, product-focused | When none of the above fits | The original, with its 4 color styles: `oscuro`, `claro`, `color`, `minimal` |

## How one is chosen

1. Claude suggests 2 or 3 directions based on the brand's personality (what it is, who it's for, the tone of its `reglas`), not its colors: a finance app could be `editorial` or `datos`; a barbershop, `cercano` or `poster`.
2. It renders samples to compare them side by side, without creating versions:
   ```bash
   node anunciar.mjs <brand> muestras --direcciones editorial,datos,cercano
   ```
   This leaves `salidas/<brand>/muestras/hoja.png`, with the "question" and "benefit" pieces of each one in 4:5.
3. The chosen one is saved in `marca.json` as `"direccion": "<id>"`.

To try another one for a single run without changing the brand: `--direccion <id>`.

**So that two projects don't look alike:** if another brand from the same company or for the same audience already uses a direction, prefer a different one for the new brand.

## How a direction is built

Each direction is its own image template, `plantillas/piezas-<id>/`, with the same 5 pieces and the same brand data (the contract is in [templates.md](templates.md#image-template-contract)). What changes is the whole design. Its `plantilla.json` includes:

```json
"direccion": { "id": "editorial", "nombre": "Editorial", "sensacion": "…", "idealPara": "…" },
"recursos": {
  "assets/comun.js": "piezas/comun.js",
  "assets/fuentes/InstrumentSerif-Regular.ttf": "fuentes/InstrumentSerif-Regular.ttf"
}
```

- `recursos` copies files from `recursos/` into the project: the direction's fonts and `comun.js`, with shared helpers (filling the footer, highlighting, fitting titles so they always fit).
- Titles with `data-ajustar` shrink until they fit their box (`data-caja`), so long copy never gets cut off in any format.
- The logo sits in a box with a maximum width and height (`object-fit: contain`): a wide logo and a square one carry the same weight.

## Creating a new direction

1. Copy the closest one (`plantillas/piezas-<id>`) as `piezas-<new>` in `plantillas/` or in `<data>/plantillas/`.
2. Change `direccion` in `plantilla.json` and the design in `index.html`. If it uses another font, put it in `recursos/fuentes/` with its license and add it to `recursos`.
3. Test it with 2 or 3 different brands and all 3 formats: `node anunciar.mjs <brand> imagenes --direccion <new>`. Look at the images: long copy, wide logos, light and dark colors.

Directions still missing: brutalist (thick black borders, no rounding), collage (cut-outs and paper textures), retro (70s, warm tones), native (looks like a regular post: phone note, chat screenshot).

## Fonts

All under the SIL Open Font License; each one ships with its license in `recursos/fuentes/<Family>-OFL.txt`: Instrument Serif, Anton, Space Grotesk, JetBrains Mono, Sora, Fredoka and Caveat (from [Google Fonts](https://fonts.google.com)).
