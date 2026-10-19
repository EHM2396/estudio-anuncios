---
name: anuncio
description: Crea publicidad (imágenes y videos para redes) de cualquier proyecto. Analiza el proyecto, propone ángulos de anuncio y abre un menú interactivo para generar imágenes, video sin audio y luego voz y música, con revisión, ajustes, estilos y versiones. Usar con "/anuncio <ruta del proyecto>" o "/anuncio audio <marca>".
argument-hint: <ruta del proyecto> | audio <marca>
---

# /anuncio — publicidad de cualquier proyecto

Argumentos recibidos: `$ARGUMENTS`

**ESTUDIO** es la carpeta de esta skill: la que contiene este `SKILL.md`, que Claude Code indica como "Base directory for this skill". Si no la tienes, búscala en `~/.claude/skills/anuncio`. Ahí están el script `anunciar.mjs`, las plantillas y la documentación. Todos los comandos se corren como `node "<ESTUDIO>/anunciar.mjs" …` desde cualquier carpeta.

**DATOS** es donde viven las marcas y lo generado. Se crea solo y la muestra `verificar`; por defecto es `~/Documents/Anuncios`. Las marcas quedan en `DATOS/marcas/<slug>/` y lo generado en `DATOS/salidas/<slug>/`. El usuario nunca tiene que crear carpetas a mano.

Habla en español, con frases cortas y sin jerga técnica. Las decisiones del usuario se piden con AskUserQuestion: opciones claras, máximo 4 por pregunta y `multiSelect` cuando pueda elegir varias. Todo pasa en la misma conversación.

## 0. Preparación (siempre, en silencio si todo está bien)

Corre `node "<ESTUDIO>/anunciar.mjs" verificar`. Revisa Node 22+, FFmpeg y FFprobe, crea DATOS si no existe y lista las marcas.
- Si todo sale ✔, no lo comentes y sigue.
- Si falta algo, dile qué falta en una línea y ofrece instalarlo con el comando que sugiere `verificar` (por ejemplo `winget install Gyan.FFmpeg`). Corre la instalación solo si acepta y luego vuelve a verificar. En Windows, si después de instalar no encuentra el programa, puede hacer falta abrir una terminal nueva: díselo.

## Elige el modo según los argumentos

- **`audio <marca>`** → paso 8 con esa marca y después el menú.
- **Una ruta** → "Modo proyecto".
- **Vacío** → lista las marcas de `DATOS/marcas/` y pregunta si quiere un proyecto nuevo (que pegue la ruta) o seguir con una marca existente.

## Modo proyecto

### 1. ¿Ya existe la marca?

Busca en `DATOS/marcas/*/marca.json` una con `"origen"` igual a la ruta. Si existe, pregunta: "Usar la marca que ya tengo" o "Volver a analizar el proyecto". Si la usa, corre `node "<ESTUDIO>/anunciar.mjs" <slug> versiones`, cuéntale en una línea lo que ya hay y salta al menú (paso 5).

### 2. Analiza el proyecto (solo lectura)

Revisa lo necesario, sin leer todo el código:
- **Qué es y para quién:** README, `package.json`, `pubspec.yaml`, `app.json`, `fastlane/metadata/**` (descripciones de tienda), landing (`index.html`, `llms.txt`), textos de la app (`*.arb`, `i18n`, `locales`).
- **Dónde se usa:** Google Play o App Store (ids, enlaces, badges), web (dominio, ruta de la app web), si es gratis o de pago.
- **Marca:** colores del tema (`brand.dart`, `theme`, `tailwind.config`, variables CSS), logos (`assets/brand`, `public`, `*logo*.svg/png`), fuentes (`assets/fonts`, `@font-face`, Google Fonts) y eslogan.
- **Capturas:** `play-store/`, `screenshots/`, `fastlane/**/images`, `docs/`. Si es una web pública sin capturas, usa `npx hyperframes capture <url> -o <carpeta temporal>`.
- **Reglas del proyecto:** su `CLAUDE.md`, su `AGENTS.md` y la memoria del proyecto si existe (cosas que nunca decir, claims prohibidos, tono). Guárdalas en `reglas` de la marca.

### 3. Propón ángulos de anuncio

Muéstrale un resumen de 3 líneas (qué es, para quién, dónde se usa). Luego pregunta con `multiSelect` entre 3 y 4 **ángulos**. Cada uno lleva su gancho y su público, por ejemplo: "Ganancia neta al instante: '¿Sabes cuánto ganó tu negocio hoy?' (dueños de negocios de servicios)". Los ángulos salen de funciones reales del proyecto.

En la misma tanda pregunta lo que no se puede deducir, como máximo 3 cosas (dónde se descarga, si es gratis, el público o el tono), y además:
- el **idioma** (español por defecto);
- el **estilo visual**: Oscuro (fondo oscuro de marca), Claro (fondos blancos), Color (fondo del color de acento) o Minimal (casi solo tipografía).

### 4. Crea la marca (automático)

Crea `DATOS/marcas/<slug>/` (slug corto en minúsculas) y copia ahí todo lo necesario. El formato completo de `marca.json` está en `<ESTUDIO>/docs/es/marca.md`: léelo y síguelo. Puntos clave:
- `origen` (ruta del proyecto), `idioma`, `estilos` (`{"imagenes": "...", "video": "..."}`) y `reglas` (lista de cosas que respetar).
- **Logos:** `logo` es la versión para fondo oscuro y `logoClaro` la versión para fondo claro. Si solo hay uno, úsalo en ambos y avísale.
- **Pantallas:** 3 capturas verticales y limpias de la interfaz. Si son gráficos de tienda con titular, recorta solo la pantalla con ffmpeg (`crop=w:h:x:y`) y mira el resultado.
- **Fuentes:** `.ttf` de pesos 500, 600 y 700 si existen; si no, omite `fuentes` y se usa Poppins.
- **Textos** que quepan, según los límites de `docs/es/marca.md`, y **voz** (`voz.guion` siempre). `vozId`, `modelo` e `idioma` salen de `<ESTUDIO>/config.local.json → voz`, si no de `config.json → voz`. Si `vozId` está vacío, déjalo vacío: se elige en el paso 8.
- **Nada de claims inventados:** ni número de usuarios, ni porcentajes, ni premios. Los montos de ejemplo dentro de la interfaz sí valen. Respeta siempre `reglas`.

Al terminar, dile en una línea dónde quedó la marca.

### 5. Menú principal (se repite después de cada paso)

Muestra este menú con AskUserQuestion (una sola pregunta, sin `multiSelect`) y vuelve a él cada vez que termine un paso, hasta que elija "Terminar":

| Opción | Descripción para el usuario |
|---|---|
| **Imágenes** | "Anuncios fijos para publicar (gratis)" |
| **Video sin audio** | "El video animado, para revisar antes de gastar (gratis)" |
| **Video con voz y música** | "Le agrega voz y música al video que ya viste (cuesta créditos de ElevenLabs)" |
| **Terminar** | "Ver dónde quedó todo" |

- Añade a cada descripción el estado: por ejemplo "aprobadas: v3" o "última: v2, sin aprobar". Lo sacas de `versiones`.
- Si todavía no hay ningún video sin audio en `DATOS/salidas/<slug>/videos/`, en "Video con voz y música" aclara "primero se genera el video sin audio para que lo veas". Si lo elige igual, haz primero el paso 7 y luego pregunta si se lo agrega ya.
- Los **formatos** se preguntan la primera vez que pide cada tipo y se recuerdan durante la conversación:
  - Imágenes (`multiSelect`): Horizontal 1920×1080, Vertical 1080×1920 y 4:5 1080×1350.
  - Video: Horizontal y Vertical.

### 6. Imágenes

```bash
node "<ESTUDIO>/anunciar.mjs" <slug> imagenes --formatos <lista> --nota "<qué es esta versión>"
```

Cada corrida crea una versión nueva (`DATOS/salidas/<slug>/imagenes/vN/<formato>/<pieza>.png`) y nunca borra las anteriores. Arma una hoja de contacto con ffmpeg (`hstack`/`xstack`) en una carpeta temporal y mírala. Corrige solapamientos o textos cortados antes de mostrarla. Muéstrale la hoja y la ruta, y pasa a **Revisión** (6.1).

### 6.1 Revisión (después de cada imagen o video generado)

Pregunta con AskUserQuestion "¿Qué hacemos con esta versión?":

| Opción | Qué haces |
|---|---|
| **Me gusta** | `aprobar <imagenes\|video> vN`. Queda copiada en `DATOS/salidas/<slug>/aprobado/`, lista para subir. Vuelve al menú. |
| **Ajustar algo** | Pregunta qué quiere cambiar (lo dice con sus palabras). Edita `marca.json` y genera una versión nueva con `--nota` describiendo el cambio. Vuelve a la revisión. |
| **Hacer otras diferentes** | Ve a "Otras diferentes". |
| **Volver a una versión anterior** | Ve a "Versión anterior". |

**Qué se puede ajustar:**
- **Imágenes:** textos de cualquier pieza, colores, logo, qué captura sale en el teléfono (`imagenes.<pieza>.pantalla`) y el botón (`textos.cta`). Si solo cambian una o dos piezas, usa `--piezas <nombres>` (pregunta, beneficio, numero, lista, antes-despues): rehace solo esas y copia el resto de la versión anterior.
- **Video:** textos, capturas (`archivos.pantalla1..3`), colores y botón. El **ritmo** vive en la plantilla: copia `<ESTUDIO>/plantillas/app-promo` a `DATOS/plantillas/app-promo-<slug>`, ajusta en la copia los tiempos `B`, `CIERRE` y `FIN` de `index.html` y `duracion` y `voz` de `plantilla.json`, y pon `"plantilla": "app-promo-<slug>"` en `marca.json`. Las plantillas de DATOS tienen prioridad sobre las del estudio.
- Si el video ya tiene voz y cambia un texto que se dice en voz, avísale qué frase habría que regenerar y cuánto cuesta antes de hacerlo.

**Otras diferentes:** pregunta "¿Qué tipo de diferente?":
- **Otro mensaje:** propón otro ángulo del proyecto y textos nuevos (mismo diseño). Cuando lo elija, actualiza `marca.json` y genera.
- **Otro estilo visual:** ofrece los estilos que no está usando (Oscuro, Claro, Color, Minimal), actualiza `estilos` y genera. Para comparar sin cambiar la marca, usa `--estilo <nombre>` solo en esa corrida.
- **Las dos cosas.**

**Versión anterior:** corre `versiones` y pregunta cuál (las 4 más recientes como opciones, con fecha, estilo y nota). Luego pregunta "¿La apruebo tal como está o sigo ajustando desde ahí?":
- **Aprobar:** `aprobar <tipo> vN`.
- **Seguir ajustando:** `restaurar <tipo> vN`. Devuelve los textos y el estilo de `marca.json` a esa versión y guarda la actual en `DATOS/marcas/<slug>/historial/`.

### 7. Video sin audio

```bash
node "<ESTUDIO>/anunciar.mjs" <slug> video --formatos <lista> --nota "<qué es esta versión>"
```

Crea `DATOS/salidas/<slug>/videos/vN/<slug>-<formato>-sin-audio.mp4` (~30 s de render por formato). Saca 3–4 fotogramas de las transiciones, revísalos y muéstrale los fotogramas y las rutas. Pasa a **Revisión** (6.1).

### 8. Video con voz y música

Solo sobre un video sin audio que ya vio y aprobó.

**¿Está ElevenLabs?** Comprueba si tienes las herramientas del MCP `elevenlabs` (`text_to_speech`, `compose_music`, `check_subscription`). Si no están, explícale que la voz y la música usan ElevenLabs y guíalo:
1. Necesita una cuenta de ElevenLabs con plan de pago (la música no funciona en el plan gratis) y su API key (elevenlabs.io → Settings → API Keys).
2. Necesita `uv`. Si no lo tiene, ofrece instalarlo: `winget install astral-sh.uv` (Windows), `brew install uv` (Mac) o `curl -LsSf https://astral.sh/uv/install.sh | sh` (Linux).
3. Pídele que corra **él mismo** en su terminal, para que la clave no quede en el chat: `claude mcp add elevenlabs -s user -e ELEVENLABS_API_KEY=SU_CLAVE -- uvx elevenlabs-mcp`. Si en Windows no encuentra `uvx`, que use la ruta completa (`%LOCALAPPDATA%\Microsoft\WinGet\Links\uvx.exe`).
4. Que reconecte con `/mcp` o abra un chat nuevo, y vuelva a elegir esta opción.

Mientras tanto ofrece una alternativa gratis: poner su propio `musica.mp3` en `DATOS/marcas/<slug>/` y renderizar `final` solo con música.

**Con ElevenLabs disponible:**
1. Pregunta (`multiSelect`): "Voz" y/o "Música de fondo". Si `DATOS/marcas/<slug>/musica.mp3` ya existe, ofrece reutilizarla gratis.
   - **Elegir voz (primera vez):** si la marca no tiene `voz.vozId` y `config.local.json → voz.vozId` (o `config.json`) está vacío, ayúdale a elegir. Busca entre sus voces con `search_voices`, o en la biblioteca con `search_voice_library` (idioma del anuncio y el tono que pida). Muéstrale 3–4 opciones con su descripción y escuchen la vista previa si la hay. Guarda la elegida en la marca (`voz.vozId`, `voz.nombreVoz`) y pregunta si la quiere como voz por defecto para todas sus marcas. Si dice que sí, escríbela en `<ESTUDIO>/config.local.json` (archivo de su equipo, fuera de git) con `vozId`, `nombre`, `modelo` e `idioma`.
2. Lee `voz.guion` de la marca y los tiempos de `voz` en el `plantilla.json` de la plantilla (`inicio` y `max` por escena). Muestra el guion y el costo estimado: ~1 crédito por carácter de voz y ~900 créditos por minuto de música (~210 para 14 s). Puedes ver el saldo con `check_subscription`. Pide confirmación.
3. **Voz:** por cada escena, `text_to_speech` con `text` (la frase), `voice_id` (`voz.vozId`), `model_id` (`voz.modelo`, **siempre explícito**, porque el MCP no lo toma solo), `language` (`voz.idioma`), `speed` (`voz.velocidad[escena]` o 1.0) y `output_directory` = `DATOS/marcas/<slug>/voz`. El MCP guarda `tts_<texto>_<fecha>.mp3`: renómbralo a `<escena>.mp3` (gancho, beneficio1, beneficio2, beneficio3, cierre).
4. Mide cada frase sin silencios (`ffprobe -v error -show_entries format=duration -of csv=p=0 <archivo>`; el script recorta los silencios del principio y del final) contra `max`. Si no cabe: quita comas, sube `speed` (1.1–1.2) o propone una frase más corta. Si cambias el guion, avísale y actualiza `marca.json`.
5. **Música:** `compose_music` con `music_length_ms` = `duracion` de la plantilla × 1000, `force_instrumental: true`, un prompt acorde a la marca (instrumental, que deje espacio para la voz, con un pequeño impulso hacia el cierre) y `output_directory` = carpeta de la marca. Renombra el archivo a `musica.mp3`.
6. Corre `node "<ESTUDIO>/anunciar.mjs" <slug> final --formatos <los del video> --nota "con voz y música"`. Crea una versión nueva con el audio ya mezclado y masterizado a -14 LUFS (el volumen estándar de redes). Pasa a **Revisión** (6.1).

### 9. Terminar

Corre `versiones` y resume en una tabla corta:
- qué quedó aprobado y su ruta (`DATOS/salidas/<slug>/aprobado/`), que es lo que se sube a redes;
- cuántas versiones hay de cada cosa;
- cuánto se gastó en créditos, si se gastó algo.
