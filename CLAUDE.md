# Desarrollo de la skill /anuncio

Instrucciones para trabajar **en el código** de este repo. El flujo que ve el usuario está en `SKILL.md`, y la documentación para usuarios en `LEEME.md` / `README.md` y `docs/`.

## Estructura

```
SKILL.md          ← la skill: flujo interactivo de /anuncio (lo que lee Claude al invocarla)
anunciar.mjs      ← script sin dependencias: arma proyectos HyperFrames, renderiza, versiona
config.json       ← valores por defecto públicos (carpeta de datos, versión de HyperFrames, voz)
config.local.json ← valores de cada equipo (fuera de git), se mezcla sobre config.json
plantillas/       ← promo (video por escenas y direcciones), app-promo (video anterior),
                    piezas (imágenes, dirección clásica) y piezas-<dirección>
recursos/fuentes/ ← Poppins (por defecto) y las tipografías de las direcciones, cada una con su OFL
recursos/piezas/  ← comun.js: ayudas de las plantillas de dirección (pie, resaltar, ajustar títulos)
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
node anunciar.mjs ganchos "¿Otra vez una cita que se te olvidó? | ¿Otra cita olvidada?" "Agenda tus citas fácilmente"
node anunciar.mjs <marca> imagenes --formatos 4x5 --nota "prueba"
node anunciar.mjs <marca> imagenes --direccion <id> --nota "prueba"   # una dirección, los 3 formatos
node anunciar.mjs <marca> muestras                                    # todas las direcciones lado a lado
node anunciar.mjs <marca> video --formatos horizontal --borrador --nota "prueba"
node anunciar.mjs <marca> video --sfx --direccion poster --formatos vertical --nota "prueba"
node anunciar.mjs <marca> video --preparar --direccion <id> --formatos horizontal
# luego, en el proyecto: npx hyperframes check
# y fotogramas sin renderizar: npx hyperframes snapshot . --at 0,1.2,2.5,3.8,9.8,12.6 --no-end -o <carpeta>
# (deja contact-sheet-*.jpg para revisar de un vistazo)
```

Para revisar una plantilla, mira imágenes, no solo el log: contact sheets con ffmpeg (`hstack`/`xstack`) y fotogramas del video en las transiciones. Prueba los 4 estilos y los formatos que toques.

## Plantillas

El contrato de cada tipo de plantilla (qué reemplaza el script y qué debe tener el HTML) está en `docs/es/plantillas.md`. Reglas de HyperFrames que más afectan:
- Una sola línea de tiempo GSAP en pausa en `window.__timelines["main"]`.
- No animes `letterSpacing` ni propiedades que reacomodan texto: usa transformaciones y opacidad.
- No combines un `transform` de CSS con un tween de GSAP sobre la misma propiedad: GSAP lee el del CSS y lo suma al suyo (por ejemplo, un `translateY(100%)` en CSS más un tween de `yPercent` deja el elemento fuera de lugar). Fija el estado inicial con GSAP.
- En `promo`, las variables de cada dirección van en `#root[data-direccion="…"]`: sin el `#root`, las de la base (que están en `#root`) les ganan.
- No animes la `section.clip` de una escena: anima su hijo `.marco`.
- Después de una captura, Chrome puede tardar unos segundos en soltar la carpeta del proyecto (`EPERM`); el script ya reintenta.
