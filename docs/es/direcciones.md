# Direcciones creativas

[English](../en/directions.md) · **Español**

Una dirección creativa es el diseño completo de los anuncios: tipografía, composición, formas, cómo se muestra la app y el tono visual. La marca pone sus colores, logo, fuente de texto y capturas; la dirección decide cómo se usan. Dos marcas con la misma dirección se parecen; dos marcas con direcciones distintas, no.

La misma dirección se usa en las **imágenes** y en el **video** (plantilla `promo`). En el video, además del aspecto, define cómo se mueve: cómo entran las palabras, la fuerza del golpe, la sacudida y el destello, los giros de cámara, la transición entre escenas y los efectos de sonido.

| Dirección | En el video |
|---|---|
| `poster` | Palabras que caen grandes y giradas, sacudida y destello fuertes, cámara con giros marcados; transición zoom con destello; golpes de bajo |
| `datos` | Barridos de máscara precisos, sin giros; transición de barras de color; clics y pings |
| `nocturno` | De desenfoque a nítido, cámara en órbita suave; transición de haz de luz; barridos y destello |
| `editorial` | Subidas elegantes desde una máscara, cámara lenta; transición de cambio de página; sonido suave |
| `cercano` | Rebotes, la pregunta en una burbuja de chat con "escribiendo…"; transición en iris; pops |
| `clasica` | Golpe moderado; transición zoom |

| Dirección | Se siente | Ideal para | Qué la distingue |
|---|---|---|---|
| `editorial` | Calmada, confiable, premium | Finanzas, servicios profesionales, salud, educación | Serif grande (Instrument Serif), papel, filetes finos, la app como foto con pie de foto, índice numerado |
| `poster` | Ruidosa, enérgica, directa | Apps de consumo, lanzamientos, promociones, públicos jóvenes | Condensada enorme en mayúsculas (Anton), colores planos, sombras duras, cintas y stickers, teléfono gigante cortado por el borde |
| `datos` | Precisa, técnica, clara | Software, SaaS, B2B, herramientas, reportes | Retícula suiza visible, grotesca apretada (Space Grotesk) y mono (JetBrains Mono), teléfono en línea con anotación, antes/después como tabla |
| `nocturno` | Premium, dramática, tecnológica | Tecnología, IA, productos premium, apps con interfaz oscura | Casi negro con luz del color de acento, grano, geométrica centrada (Sora), teléfono flotando con halo, vidrio esmerilado |
| `cercano` | Cálida, amable, humana | Negocios locales y de servicios, bienestar, comunidad, mensajería o reservas | Redondeada (Fredoka), notas a mano (Caveat) con flechas, la pregunta en burbuja de chat, manchas orgánicas, teléfono con marco de color |
| `clasica` | Limpia, de producto | Cuando nada de lo anterior encaja | La de siempre, con sus 4 estilos de color: `oscuro`, `claro`, `color`, `minimal` |

## Cómo se elige

1. Claude propone 2 o 3 direcciones según la personalidad de la marca (qué es, para quién, el tono de sus `reglas`) y no según el color: una app de finanzas puede ser `editorial` o `datos`; una barbería, `cercano` o `poster`.
2. Genera muestras para verlas lado a lado, sin crear versiones:
   ```bash
   node anunciar.mjs <marca> muestras --direcciones editorial,datos,cercano
   ```
   Deja `salidas/<marca>/muestras/hoja.png`, con la pieza "pregunta" y "beneficio" de cada una en 4:5.
3. La elegida queda en `marca.json` como `"direccion": "<id>"`.

Para probar otra en una sola corrida, sin cambiar la marca: `--direccion <id>`.

**Para que dos proyectos no se parezcan:** si ya hay otra marca de la misma empresa o del mismo público con una dirección, prefiere otra para la nueva.

## Cómo está hecha una dirección

Cada dirección es una plantilla de imágenes propia, `plantillas/piezas-<id>/`, con las mismas 5 piezas y los mismos datos de la marca (el contrato está en [plantillas.md](plantillas.md#contrato-de-una-plantilla-de-imágenes)). Lo que cambia es todo el diseño. Su `plantilla.json` lleva:

```json
"direccion": { "id": "editorial", "nombre": "Editorial", "sensacion": "…", "idealPara": "…" },
"recursos": {
  "assets/comun.js": "piezas/comun.js",
  "assets/fuentes/InstrumentSerif-Regular.ttf": "fuentes/InstrumentSerif-Regular.ttf"
}
```

- `recursos` copia archivos de `recursos/` al proyecto: las tipografías de la dirección y `comun.js`, con las ayudas comunes (llenar el pie, resaltar, ajustar el tamaño de los títulos para que siempre quepan).
- Los títulos con `data-ajustar` se achican solos hasta caber en su caja (`data-caja`), así un texto largo no se corta en ningún formato.
- El logo va en una caja de ancho y alto máximos (`object-fit: contain`): un logo ancho y uno cuadrado se ven del mismo peso.

## Crear una dirección nueva

1. Copia la más cercana (`plantillas/piezas-<id>`) como `piezas-<nueva>` en `plantillas/` o en `<datos>/plantillas/`.
2. Cambia `direccion` en `plantilla.json` y el diseño en `index.html`. Si usa otra tipografía, ponla en `recursos/fuentes/` con su licencia y agrégala a `recursos`.
3. Pruébala con 2 o 3 marcas distintas y los 3 formatos: `node anunciar.mjs <marca> imagenes --direccion <nueva>`. Mira las imágenes: textos largos, logos anchos, colores claros y oscuros.

Ideas de direcciones que faltan: brutalista (bordes negros gruesos, sin redondeos), collage (recortes y texturas de papel), retro (años 70, tonos cálidos), nativa (que parezca una publicación normal: nota del celular, captura de chat).

## Tipografías

Todas con licencia SIL Open Font License; cada una lleva su licencia en `recursos/fuentes/<Familia>-OFL.txt`: Instrument Serif, Anton, Space Grotesk, JetBrains Mono, Sora, Fredoka y Caveat (de [Google Fonts](https://fonts.google.com)).
