# /anuncio — publicidad para cualquier proyecto, desde Claude Code

[English](README.md) · **Español**

Skill para [Claude Code](https://claude.com/claude-code) que crea publicidad de cualquier proyecto: **imágenes** y **videos cortos** listos para redes, en horizontal, vertical y 4:5.

Le pasas la ruta de tu proyecto y la skill:
1. lo analiza: qué es, para quién, colores, logos y capturas;
2. te propone de qué hacer publicidad;
3. te deja elegir qué generar.

Todo es interactivo, por menús, y nada se pierde: cada versión queda guardada.

```
/anuncio C:\proyectos\mi-app
```

## Qué hace

- **Analiza tu proyecto** y propone ángulos de anuncio basados en funciones reales, sin claims inventados.
- **Crea la marca sola:** colores, logos, fuentes, capturas y textos. No tienes que crear carpetas ni archivos.
- **Imágenes publicitarias:** 5 piezas diseñadas (pregunta, beneficio, número, lista, antes/después) en horizontal 1920×1080, vertical 1080×1920 y 4:5 1080×1350.
- **Video animado de 14 s:** gancho, 3 beneficios con la app en un teléfono y cierre con botón e insignias, en horizontal y vertical.
- **Voz y música** con [ElevenLabs](https://elevenlabs.io), opcionales y aparte. El audio se masteriza al volumen estándar de redes.
- **4 estilos visuales:** oscuro, claro, color y minimal.
- **Revisión y versiones:** después de cada resultado eliges aprobar, ajustar, pedir otras diferentes o volver a una versión anterior.
- **Por fases, para no gastar de más:** imágenes y video son gratis. La voz y la música, que cuestan créditos, solo se generan cuando ya te gustó el video.

## Requisitos

| Qué | Para qué | Cómo conseguirlo |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | Ejecuta la skill | — |
| Node.js 22 o superior | Corre el script | [nodejs.org](https://nodejs.org) |
| FFmpeg | Video, audio e imágenes | `winget install Gyan.FFmpeg` · `brew install ffmpeg` · `sudo apt install ffmpeg` |
| ElevenLabs (opcional) | Voz y música | Cuenta de pago + MCP, ver [Voz y música](#voz-y-música-elevenlabs) |

La skill revisa Node y FFmpeg cada vez que arranca y, si falta algo, te ofrece instalarlo. [HyperFrames](https://github.com/heygen-com/hyperframes), el motor de render, se descarga solo con `npx` la primera vez. También usa Chrome sin interfaz, que HyperFrames descarga solo.

## Instalación

### Lo más fácil: pídeselo a Claude

Abre Claude Code y escríbele:

> Instala la skill de https://github.com/<usuario>/<repo> en mis skills de Claude Code, en la carpeta `anuncio`.

Claude clona el repo en `~/.claude/skills/anuncio`. Abre un chat nuevo y escribe `/anuncio`.

### A mano

Clona el repo dentro de la carpeta de skills de Claude Code, con el nombre `anuncio`:

```bash
# macOS / Linux
git clone https://github.com/<usuario>/<repo>.git ~/.claude/skills/anuncio

# Windows (PowerShell)
git clone https://github.com/<usuario>/<repo>.git "$env:USERPROFILE\.claude\skills\anuncio"
```

No hay nada más que instalar. Abre un chat nuevo de Claude Code y escribe `/anuncio`.

Para actualizar: `git pull` dentro de esa carpeta.

## Cómo se usa

### 1. Empieza

```
/anuncio <ruta de tu proyecto>
```

La skill revisa los requisitos, analiza el proyecto y te muestra un resumen. Después te pregunta:
- **de qué hacer publicidad:** de 3 a 4 ángulos, cada uno con su gancho y su público;
- lo que no pudo deducir: dónde se descarga, si es gratis, el tono;
- el **idioma** y el **estilo visual**.

Con eso crea la marca automáticamente.

### 2. Menú principal

| Opción | Qué hace | Costo |
|---|---|---|
| **Imágenes** | 5 anuncios fijos en los formatos que elijas | gratis |
| **Video sin audio** | El video animado, para revisarlo antes de gastar | gratis |
| **Video con voz y música** | Le agrega voz y música al video que ya viste | créditos de ElevenLabs |
| **Terminar** | Resumen de lo aprobado y dónde está | — |

El menú vuelve después de cada paso, así que puedes hacer imágenes, luego el video y al final el audio, todo en la misma conversación.

### 3. Revisión de cada resultado

| Opción | Qué pasa |
|---|---|
| **Me gusta** | Se aprueba y se copia a `aprobado/`, lista para subir. |
| **Ajustar algo** | Dices el cambio con tus palabras (textos, colores, capturas, botón, una pieza sola…) y sale una versión nueva. |
| **Hacer otras diferentes** | Otro mensaje (otro ángulo y otros textos), otro estilo visual o las dos cosas. |
| **Volver a una versión anterior** | La apruebas tal cual o sigues ajustando desde ahí. |

### Otros usos

- `/anuncio`, sin ruta: lista tus marcas y te deja seguir con una.
- `/anuncio audio <marca>`: va directo a agregar voz y música a un video ya aprobado.
- Si pasas la ruta de un proyecto que ya tiene marca, te pregunta si la reutiliza o lo analiza de nuevo.

## Dónde quedan tus archivos

Todo lo tuyo vive **fuera del repo**, en la carpeta de datos. Se crea sola en `~/Documents/Anuncios`:

```
Anuncios/
  marcas/<marca>/            ← marca.json, logos, capturas, fuentes, voz/, musica.mp3
  salidas/<marca>/
    imagenes/v1, v2, …/<formato>/<pieza>.png
    videos/v1, v2, …/<marca>-<formato>[-sin-audio].mp4
    aprobado/                ← solo lo aprobado: lo que subes a redes
  plantillas/                ← plantillas propias (opcional)
```

Para usar otra carpeta, crea `config.local.json` en el repo con `{ "carpetaDatos": "D:/MisAnuncios" }` o define la variable de entorno `ANUNCIOS_DATOS`.

## Voz y música (ElevenLabs)

La voz y la música son opcionales y usan **tu propia cuenta** de ElevenLabs. El repo no incluye claves ni voces de nadie.

1. Crea una cuenta de ElevenLabs con plan de pago (la música no está en el plan gratis) y copia tu API key (Settings → API Keys).
2. Instala [`uv`](https://docs.astral.sh/uv/): `winget install astral-sh.uv` · `brew install uv` · `curl -LsSf https://astral.sh/uv/install.sh | sh`
3. Conecta el MCP oficial de ElevenLabs a Claude Code:
   ```bash
   claude mcp add elevenlabs -s user -e ELEVENLABS_API_KEY=TU_CLAVE -- uvx elevenlabs-mcp
   ```
4. Reconecta con `/mcp` o abre un chat nuevo.

La primera vez que pidas voz, la skill te ayuda a **elegir una voz** de tu cuenta o de la biblioteca de ElevenLabs. Puedes dejarla como voz por defecto: se guarda en `config.local.json`, que solo existe en tu equipo.

Si no quieres usar ElevenLabs, puedes poner tu propio `musica.mp3` en la carpeta de la marca y el video sale con esa música.

**Costo aproximado** (créditos de ElevenLabs): voz ~1 crédito por carácter (un guion de 5 frases ronda los 250); música ~900 créditos por minuto (~210 para un video de 14 s). La skill te muestra el costo y te pide confirmación antes de generar.

## Uso a mano (sin la skill)

El script se puede usar directamente:

```bash
node anunciar.mjs verificar                    # requisitos + carpeta de datos
node anunciar.mjs <marca> imagenes             # imágenes (versión nueva)
node anunciar.mjs <marca> video                # video sin audio (versión nueva)
node anunciar.mjs <marca> final                # video con voz y música de la carpeta de la marca
node anunciar.mjs <marca> versiones            # lista de versiones y cuál está aprobada
node anunciar.mjs <marca> aprobar imagenes v3  # copia a aprobado/
node anunciar.mjs <marca> restaurar video v1   # vuelve marca.json a como estaba en esa versión
```

Opciones:
- `--formatos horizontal,vertical,4x5`: solo esos formatos.
- `--piezas numero,lista`: rehace solo esas imágenes.
- `--estilo oscuro|claro|color|minimal`: estilo visual.
- `--nota "qué cambió"`: describe la versión.
- `--borrador`: render rápido.
- `--preparar`: arma el proyecto de HyperFrames para abrirlo en su Studio (`npx hyperframes preview`).

## Estilos

| Estilo | Cómo se ve |
|---|---|
| `oscuro` | Fondo oscuro de la marca, con alguna pieza clara |
| `claro` | Todo sobre fondo blanco o claro |
| `color` | Fondo del color de acento, con el logo en una placa blanca |
| `minimal` | Fondo liso y tipografía grande; las imágenes no llevan teléfono |

## Documentación

- [Formato de la marca (`marca.json`)](docs/es/marca.md)
- [Plantillas: cómo funcionan y cómo crear una nueva](docs/es/plantillas.md)

## Problemas frecuentes

| Problema | Solución |
|---|---|
| `/anuncio` no aparece | Revisa que la carpeta se llame `anuncio` y esté en `~/.claude/skills/`, y abre un chat nuevo. |
| "FFmpeg ✗" en `verificar` | Instálalo con el comando que muestra y abre una terminal nueva. |
| `EPERM` al generar | Un visor tiene abierto un archivo de `salidas/`. Ciérralo y repite. El script ya reintenta varios segundos. |
| Render lento o falla por memoria | Cierra programas pesados. HyperFrames usa un Chrome por núcleo; prueba con `--borrador`. |
| No hay herramientas de ElevenLabs | Sigue los pasos de [Voz y música](#voz-y-música-elevenlabs) y reconecta con `/mcp`. |
| Una frase de voz no cabe en su escena | La skill lo detecta y propone acelerarla un poco o acortarla. |

## Privacidad

- Tus marcas, capturas y anuncios se quedan en tu equipo, en la carpeta de datos, fuera del repo.
- El análisis del proyecto lo hace Claude Code con tu sesión.
- Solo se envía a ElevenLabs el texto del guion y la descripción de la música, y solo cuando lo confirmas.

## Créditos y licencia

- Render con [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache-2.0), animación con [GSAP](https://gsap.com).
- Fuente por defecto: [Poppins](https://fonts.google.com/specimen/Poppins) (SIL Open Font License, ver `recursos/fuentes/OFL.txt`).
- Voz y música: [ElevenLabs](https://elevenlabs.io), con la cuenta de cada usuario.
- Código bajo licencia [MIT](LICENSE).
