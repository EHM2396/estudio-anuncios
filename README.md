# /anuncio — ads for any project, from Claude Code

**English** · [Español](LEEME.md)

A [Claude Code](https://claude.com/claude-code) skill that creates ads for any project: **images** and **short videos** ready for social media, in landscape, portrait and 4:5.

Point it at your project and the skill:
1. analyzes it: what it is, who it's for, colors, logos and screenshots;
2. suggests what to advertise;
3. lets you pick what to generate.

Everything is interactive, through menus, and nothing gets lost: every version is kept.

```
/anuncio ~/projects/my-app
```

> The skill talks to you in Spanish by default. Ask it in English and it will follow, and it can produce ads in any language.

## What it does

- **Analyzes your project** and suggests ad angles based on real features, with no made-up claims.
- **Hooks that hold attention:** writes several hooks from proven formulas, scores them, and lets you generate the same ad with 2 or 3 different hooks to test which one keeps people watching. See [Hooks and retention](docs/en/hooks.md).
- **Builds the brand by itself:** colors, logos, fonts, screenshots and copy. You don't create any folders or files.
- **Image ads:** 5 designed pieces (question, benefit, number, list, before/after) in landscape 1920×1080, portrait 1080×1920 and 4:5 1080×1350.
- **14-second animated video that hooks:** the hook slams in from the very first frame, the camera orbits the phone in 3D and zooms into app details, transitions have character, and the button gets pressed at the end. It moves according to the creative direction and carries synced sound effects. **Every video you generate comes out different:** each benefit's shot (phone, big screenshot, giant number or type only), the phone's side, the camera turns, the hook and the closing all change. Landscape, portrait and 4:5.
- **Voice and music** with [ElevenLabs](https://elevenlabs.io), optional and added separately. Audio is mastered to the standard loudness for social media.
- **6 creative directions** so each project gets its own design, not just another color: editorial, poster, data, night, friendly and classic. You see them side by side before choosing. See [Creative directions](docs/en/directions.md).
- **Review and versions:** after each result you choose to approve, adjust, ask for something different, or go back to a previous version.
- **Step by step, so you don't overspend:** images and video are free. Voice and music cost credits, so they are only generated once you like the video.

## Requirements

| What | Why | How to get it |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | Runs the skill | — |
| Node.js 22+ | Runs the script | [nodejs.org](https://nodejs.org) |
| FFmpeg | Video, audio and images | `winget install Gyan.FFmpeg` · `brew install ffmpeg` · `sudo apt install ffmpeg` |
| ElevenLabs (optional) | Voice and music | Paid account + MCP, see [Voice and music](#voice-and-music-elevenlabs) |

The skill checks Node and FFmpeg every time it starts and offers to install anything that's missing. [HyperFrames](https://github.com/heygen-com/hyperframes), the rendering engine, is fetched with `npx` on first use. It also needs headless Chrome, which HyperFrames downloads by itself.

## Installation

### Easiest: ask Claude

Open Claude Code and tell it:

> Install the skill from https://github.com/EHM2396/estudio-anuncios into my Claude Code skills, in a folder named `anuncio`.

Claude clones the repo into `~/.claude/skills/anuncio`. Open a new chat and type `/anuncio`.

### By hand

Clone the repo into Claude Code's skills folder, named `anuncio`:

```bash
# macOS / Linux
git clone https://github.com/EHM2396/estudio-anuncios.git ~/.claude/skills/anuncio

# Windows (PowerShell)
git clone https://github.com/EHM2396/estudio-anuncios.git "$env:USERPROFILE\.claude\skills\anuncio"
```

That's all. Open a new Claude Code chat and type `/anuncio`.

To update: `git pull` inside that folder.

## How to use it

### 1. Start

```
/anuncio <path to your project>
```

The skill checks the requirements, analyzes the project and shows you a summary. Then it asks you:
- **what to advertise:** 3–4 angles, each with its hook and audience;
- anything it couldn't work out: where to download it, whether it's free, the tone;
- the **language**.

With that it creates the brand automatically and shows you 3 **creative directions** with your brand, side by side, so you can pick the one that fits its personality.

### 2. Main menu

| Option | What it does | Cost |
|---|---|---|
| **Imágenes** (images) | 5 static ads in the formats you choose | free |
| **Video sin voz** (video without voice) | The animated video with sound effects, to review it before spending | free |
| **Video con voz y música** (voice + music) | Adds voice and music to the video you already saw | ElevenLabs credits |
| **Terminar** (finish) | Summary of what was approved and where it is | — |

The menu comes back after every step, so you can do images, then the video, then the audio, all in the same chat.

### 3. Reviewing each result

| Option | What happens |
|---|---|
| **Approve** | It's approved and copied to `aprobado/`, ready to post. |
| **Adjust** | Describe the change in your own words (copy, colors, screenshots, button, a single piece…) and a new version is generated. |
| **Something different** | A different hook (A/B test), a different message (another angle and copy), a different creative direction, or message and direction at once. |
| **Previous version** | Approve it as is, or keep adjusting from there. |

### Other uses

- `/anuncio`, with no path: lists your brands and lets you continue with one.
- `/anuncio audio <brand>`: goes straight to adding voice and music to an approved video.
- If you pass the path of a project that already has a brand, it asks whether to reuse it or analyze it again.

## Where your files go

All your stuff lives **outside the repo**, in the data folder. It's created automatically at `~/Documents/Anuncios`:

```
Anuncios/
  marcas/<brand>/            ← marca.json, logos, screenshots, fonts, voz/, musica.mp3
  salidas/<brand>/
    imagenes/v1, v2, …/<format>/<piece>.png
    videos/v1, v2, …/<brand>-<format>[-sin-voz|-sin-audio].mp4
    aprobado/                ← only approved files: what you post
  plantillas/                ← your own templates (optional)
```

To use another folder, create `config.local.json` in the repo with `{ "carpetaDatos": "D:/MyAds" }` or set the `ANUNCIOS_DATOS` environment variable.

## Voice and music (ElevenLabs)

Voice and music are optional and use **your own** ElevenLabs account. The repo ships no keys and no one else's voices.

1. Create an ElevenLabs account on a paid plan (music isn't available on the free plan) and copy your API key (Settings → API Keys).
2. Install [`uv`](https://docs.astral.sh/uv/): `winget install astral-sh.uv` · `brew install uv` · `curl -LsSf https://astral.sh/uv/install.sh | sh`
3. Connect the official ElevenLabs MCP to Claude Code:
   ```bash
   claude mcp add elevenlabs -s user -e ELEVENLABS_API_KEY=YOUR_KEY -- uvx elevenlabs-mcp
   ```
4. Reconnect with `/mcp` or open a new chat.

The first time you ask for voice, the skill helps you **pick a voice** from your account or the ElevenLabs library. You can keep it as your default: it's saved in `config.local.json`, which only exists on your machine.

If you'd rather not use ElevenLabs, drop your own `musica.mp3` into the brand folder and the video will use it.

**Approximate cost** (ElevenLabs credits): voice ~1 credit per character (a 5-line script is about 250); music ~900 credits per minute (~210 for a 14 s video). The skill shows you the cost and asks for confirmation before generating.

## Manual use (without the skill)

You can run the script directly:

```bash
node anunciar.mjs verificar                    # requirements + data folder
node anunciar.mjs ganchos "spoken | on screen" # score one or more hooks (Spanish heuristics)
node anunciar.mjs <brand> muestras            # 2 pieces of each direction, side by side (no version)
node anunciar.mjs <brand> imagenes             # images (new version)
node anunciar.mjs <brand> video --sfx          # video without voice, with sound effects (new version)
node anunciar.mjs <brand> final                # video with the voice and music in the brand folder
node anunciar.mjs <brand> versiones            # list versions and which one is approved
node anunciar.mjs <brand> aprobar imagenes v3  # copy to aprobado/
node anunciar.mjs <brand> restaurar video v1   # restore marca.json to that version
```

Options:
- `--formatos horizontal,vertical,4x5`: only those formats.
- `--piezas numero,lista`: redo only those images.
- `--direccion editorial|poster|datos|nocturno|cercano|clasica`: creative direction for the images in this run.
- `--direcciones editorial,datos`: (with `muestras`) only those directions.
- `--estilo oscuro|claro|color|minimal`: color style of the classic image direction (and of the previous video template, `app-promo`).
- `--sfx`: (video) includes the sound effects in the video without voice. `final` always has them.
- `--variante 7`: (video) repeats that variant's shots and moves. Without it, each version uses its own number and comes out different.
- `--gancho 1,2,3`: uses those hooks from `ganchos` in `marca.json`, one version per hook.
- `--nota "what changed"`: describes the version.
- `--borrador`: fast draft render.
- `--preparar`: builds the HyperFrames project so you can open it in its Studio (`npx hyperframes preview`).

## Creative directions

Each direction is a whole design: typography, layout, shapes and how the app is shown. The brand brings its colors, logo and screenshots.

| Direction | Look |
|---|---|
| `editorial` | Magazine: big serif, paper, hairline rules, the app as a captioned photo |
| `poster` | Poster: huge condensed caps, flat colors, hard shadows, stickers |
| `datos` (data) | Swiss: visible grid, grotesque and mono type, line-drawn phone with callouts |
| `nocturno` (night) | Cinematic: near-black with colored light, grain, floating phone with a glow |
| `cercano` (friendly) | Warm: rounded type, handwritten notes with arrows, chat bubbles |
| `clasica` (classic) | The original, with 4 color styles: `oscuro`, `claro`, `color`, `minimal` |

The direction also defines how the video moves:

| Direction | Hook | Transition | Sound |
|---|---|---|---|
| `poster` | Words slam in with scale, spin and shake | Zoom with a flash | Bass hits |
| `datos` | Precise mask wipes | Color bars | Clicks and pings |
| `nocturno` | Blur to sharp with a glow | Light sweep | Whooshes and sparkles |
| `editorial` | Elegant rises from a mask | Page turn | Soft, ends with a chime |
| `cercano` | Chat bubble with "typing…" and bounces | Iris | Pops |
| `clasica` | Moderate slam | Zoom | Mixed |

In all of them, the camera orbits the phone between benefits and zooms into an app detail.

## Documentation

- [Hooks and retention](docs/en/hooks.md)
- [Creative directions](docs/en/directions.md)
- [Brand format (`marca.json`)](docs/en/brand.md)
- [Templates: how they work and how to create one](docs/en/templates.md)

## Troubleshooting

| Problem | Fix |
|---|---|
| `/anuncio` doesn't show up | Make sure the folder is named `anuncio` and sits in `~/.claude/skills/`, then open a new chat. |
| "FFmpeg ✗" in `verificar` | Install it with the suggested command and open a new terminal. |
| `EPERM` while generating | A viewer has a file from `salidas/` open. Close it and retry. The script already retries for a few seconds. |
| Slow render or out-of-memory | Close heavy apps. HyperFrames runs one Chrome per core; try `--borrador`. |
| No ElevenLabs tools | Follow [Voice and music](#voice-and-music-elevenlabs) and reconnect with `/mcp`. |
| A voice line doesn't fit its scene | The skill catches it and suggests speeding it up slightly or shortening it. |

## Privacy

- Your brands, screenshots and ads stay on your machine, in the data folder, outside the repo.
- Project analysis is done by Claude Code with your session.
- Only the script text and the music description are sent to ElevenLabs, and only after you confirm.

## Credits and license

- Rendering by [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache-2.0), animation with [GSAP](https://gsap.com).
- Default font: [Poppins](https://fonts.google.com/specimen/Poppins) (SIL Open Font License, see `recursos/fuentes/OFL.txt`).
- Sound effects: the library of HyperFrames' `media-use` skill (Pixabay license, commercial use without attribution); they're taken from there when rendering and aren't shipped in the repo.
- Direction fonts: Instrument Serif, Anton, Space Grotesk, JetBrains Mono, Sora, Fredoka and Caveat, from [Google Fonts](https://fonts.google.com) (SIL Open Font License, each with its own `recursos/fuentes/<Family>-OFL.txt`).
- Voice and music: [ElevenLabs](https://elevenlabs.io), with each user's own account.
- Hook formulas and scoring adapted from [instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill) (MIT) and [viral-hooks](https://github.com/omer-metin/skills-for-antigravity) (Apache-2.0).
- Code under the [MIT](LICENSE) license.
