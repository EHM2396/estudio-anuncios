# Desarrollo de la skill /anuncio

Instrucciones para trabajar **en el código** de este repo. El flujo que ve el usuario está en `SKILL.md`, y la documentación para usuarios en `LEEME.md` / `README.md` y `docs/`.

## Estructura

```
SKILL.md          ← la skill: flujo interactivo de /anuncio (lo que lee Claude al invocarla)
anunciar.mjs      ← script sin dependencias: arma proyectos HyperFrames, renderiza, versiona
config.json       ← valores por defecto públicos (carpeta de datos, versión de HyperFrames, voz)
config.local.json ← valores de cada equipo (fuera de git), se mezcla sobre config.json
plantillas/       ← app-promo (video) y piezas (imágenes)
recursos/fuentes/ ← Poppins, fuente por defecto (OFL)
docs/es, docs/en  ← formato de marca y plantillas
```

Los datos de cada usuario (`marcas/`, `salidas/`, `plantillas/` propias) **nunca** van en el repo: viven en la carpeta de datos (por defecto `~/Documents/Anuncios`) y el script la crea sola.

## Reglas

- `anunciar.mjs` no lleva dependencias de npm: solo Node 22+, FFmpeg y `npx hyperframes@<versión de config.json>`.
- Toda generación crea una versión nueva (`imagenes/vN`, `videos/vN`, con `version.json` y copia de la marca). Nunca sobrescribas versiones.
- Si una generación falla, no debe quedar una versión vacía (el `try/catch` del final la borra).
- Nada personal en el repo: ni marcas, ni claves, ni IDs de voz de alguien. Lo de cada equipo va en `config.local.json`.
- La documentación va en español e inglés (`LEEME.md`/`README.md`, `docs/es`/`docs/en`). Si cambias una, cambia la otra.
- Textos de anuncios sin claims inventados, y respetando `reglas` de cada marca.

## Probar cambios

```bash
node anunciar.mjs verificar
node anunciar.mjs <marca> imagenes --formatos 4x5 --nota "prueba"
node anunciar.mjs <marca> video --formatos horizontal --borrador --nota "prueba"
node anunciar.mjs <marca> video --preparar --formatos horizontal   # luego, en el proyecto: npx hyperframes check
```

Para revisar una plantilla, mira imágenes, no solo el log: contact sheets con ffmpeg (`hstack`/`xstack`) y fotogramas del video en las transiciones. Prueba los 4 estilos y los formatos que toques.

## Plantillas

El contrato de cada tipo de plantilla (qué reemplaza el script y qué debe tener el HTML) está en `docs/es/plantillas.md`. Reglas de HyperFrames que más afectan:
- Una sola línea de tiempo GSAP en pausa en `window.__timelines["main"]`.
- No animes `letterSpacing` ni propiedades que reacomodan texto: usa transformaciones y opacidad.
- No combines un `transform` de CSS con un tween de GSAP sobre la misma propiedad.
- Después de una captura, Chrome puede tardar unos segundos en soltar la carpeta del proyecto (`EPERM`); el script ya reintenta.
