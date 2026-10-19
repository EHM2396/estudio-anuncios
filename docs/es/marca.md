# Formato de la marca (`marca.json`)

[English](../en/brand.md) · **Español**

Cada proyecto tiene su marca en `<datos>/marcas/<slug>/`. La skill `/anuncio` la crea sola al analizar el proyecto. Este documento sirve para entenderla o editarla a mano.

```
marcas/agendita/
  marca.json
  logo.svg            ← para fondo oscuro (texto claro)
  logo-claro.svg      ← para fondo claro (texto oscuro)
  insignia.png        ← badge de tienda (opcional)
  pantallas/          ← 3 capturas verticales de la interfaz
  fuentes/            ← .ttf de la marca (opcional)
  voz/                ← se llena al generar la voz
  musica.mp3          ← se crea al generar la música (o pon la tuya)
  historial/          ← copias de marca.json al restaurar versiones
```

## Ejemplo completo

```json
{
  "origen": "C:\\proyectos\\agendita",
  "idioma": "es",
  "estilos": { "imagenes": "oscuro", "video": "oscuro" },
  "reglas": ["No decir que es la app número uno.", "Hablar de tú, tono cercano."],
  "plantilla": "app-promo",
  "plantillaImagenes": "piezas",
  "fuentes": {
    "500": "fuentes/Inter-Medium.ttf",
    "600": "fuentes/Inter-SemiBold.ttf",
    "700": "fuentes/Inter-Bold.ttf"
  },
  "archivos": {
    "logo": "logo.svg",
    "logoClaro": "logo-claro.svg",
    "insignia": "insignia.png",
    "pantalla1": "pantallas/inicio.png",
    "pantalla2": "pantallas/nueva-cita.png",
    "pantalla3": "pantallas/clientes.png"
  },
  "colores": {
    "colorFondo": "#1E3A5F",
    "colorFondo2": "#0B1B2E",
    "colorAcento": "#4F8EF7",
    "colorTexto": "#FFFFFF",
    "colorSobreAcento": "#0B1B2E",
    "colorClaro": "#EAF1FD"
  },
  "textos": {
    "nombre": "Agendita",
    "kicker": "Para negocios con citas",
    "hookLinea1": "¿Otra vez una cita",
    "hookLinea2": "que se te olvidó?",
    "titulo1": "Tu agenda del día, siempre a mano",
    "titulo2": "Recordatorios automáticos por WhatsApp",
    "titulo3": "Tus clientes y su historial en un lugar",
    "chip1Etiqueta": "Citas de hoy",
    "chip1Valor": "8 citas",
    "chip2Etiqueta": "Recordatorios enviados",
    "chip2Valor": "12",
    "chip3Etiqueta": "Clientes",
    "chip3Valor": "140 clientes",
    "eslogan": "Tu agenda, en orden.",
    "cta": "Pruébala gratis",
    "url": "agendita.app",
    "webLinea1": "Úsala en tu",
    "webLinea2": "Navegador"
  },
  "voz": {
    "vozId": "",
    "nombreVoz": "",
    "modelo": "eleven_multilingual_v2",
    "idioma": "es",
    "guion": {
      "gancho": "¿Otra vez una cita que se te olvidó?",
      "beneficio1": "Tu agenda del día, siempre a mano.",
      "beneficio2": "Recordatorios automáticos por WhatsApp.",
      "beneficio3": "Tus clientes en un solo lugar.",
      "cierre": "Agendita. Pruébala gratis hoy."
    },
    "velocidad": { "beneficio2": 1.1 }
  },
  "imagenes": {
    "pregunta": {
      "titulo": "¿Otra vez una cita que se te olvidó?",
      "resaltado": "se te olvidó?",
      "subtitulo": "Agendita te recuerda cada cita y avisa a tus clientes por ti."
    },
    "beneficio": {
      "kicker": "Para negocios con citas",
      "titulo": "Recordatorios automáticos por WhatsApp",
      "subtitulo": "Menos ausencias, sin escribir uno por uno.",
      "pantalla": "pantalla2",
      "tarjeta": { "etiqueta": "Recordatorios de hoy", "valor": "12 enviados" }
    },
    "numero": {
      "etiqueta": "Tus citas de hoy",
      "valor": "8",
      "subtitulo": "Todo tu día en una sola pantalla.",
      "pantalla": "pantalla1"
    },
    "lista": {
      "titulo": "Tu negocio de citas en una app",
      "items": ["Agenda siempre a mano", "Recordatorios automáticos", "Historial de cada cliente"],
      "pantalla": "pantalla3"
    },
    "antes-despues": {
      "antesTitulo": "Antes",
      "antes": ["Agenda de papel", "Citas olvidadas", "Mensajes uno por uno"],
      "despuesTitulo": "Con Agendita",
      "despues": ["Tu agenda en el celular", "Recordatorios solos", "Clientes que sí llegan"]
    }
  }
}
```

## Campos

### Generales

| Campo | Qué es |
|---|---|
| `origen` | Ruta del proyecto analizado. La skill la usa para reconocer la marca la próxima vez. |
| `idioma` | Idioma de los anuncios (`es`, `en`…). |
| `estilos` | Estilo visual por defecto de `imagenes` y `video`: `oscuro`, `claro`, `color` o `minimal`. |
| `reglas` | Cosas que los textos y la voz siempre deben respetar (frases prohibidas, tono, claims que no se pueden hacer). |
| `plantilla` | Plantilla del video (por defecto `app-promo`). |
| `plantillaImagenes` | Plantilla de las imágenes (por defecto `piezas`). |

### `archivos` y `fuentes`

Rutas relativas a la carpeta de la marca.

| Clave | Qué es | ¿Obligatorio? |
|---|---|---|
| `logo` | Logo para fondo oscuro. SVG o PNG con transparencia, sin eslogan pegado si se puede. | Sí |
| `logoClaro` | Logo para fondo claro. Lo usan los estilos claro, color y minimal y la pieza "beneficio". | No (se usa `logo`) |
| `insignia` | Badge oficial de la tienda (Google Play, App Store). | No |
| `pantalla1..3` | Capturas verticales y limpias de la interfaz, sin titulares ni marcos, cercanas a 852×1500. | Sí |
| `fuentes.500/600/700` | Archivos `.ttf` por peso. Si falta uno, se usa el más cercano. | No (Poppins) |

### `colores`

| Clave | Uso |
|---|---|
| `colorFondo` | Color oscuro principal de la marca (fondos). |
| `colorFondo2` | Versión más profunda, para degradados y textos sobre fondos claros. |
| `colorAcento` | Color de acento: botones, resaltados, iconos. |
| `colorTexto` | Texto sobre fondos oscuros (normalmente `#FFFFFF`). |
| `colorSobreAcento` | Texto sobre el color de acento: oscuro y legible. |
| `colorClaro` | Fondo claro suave, para el estilo claro y la pieza "beneficio". |

### `textos` (video)

Los límites son orientativos para que el texto quepa en el diseño.

| Clave | Dónde sale | Límite |
|---|---|---|
| `hookLinea1`, `hookLinea2` | Gancho inicial; la línea 2 va resaltada | ≤ 22 caracteres cada una |
| `titulo1..3` | Un beneficio por escena | ≤ 45 |
| `chip1..3Etiqueta` / `chip1..3Valor` | Tarjeta flotante de cada beneficio; si el valor lleva número, se anima contando | etiqueta ≤ 26, valor corto |
| `kicker` | Etiqueta pequeña sobre los títulos | ≤ 30 |
| `nombre` | Nombre de la marca (texto gigante de fondo) | — |
| `eslogan` | Titular del cierre | ≤ 32 |
| `cta` | Texto del botón | ≤ 20 |
| `url` | Web, debajo de las insignias | — |
| `webLinea1`, `webLinea2` | Insignia "Úsala en tu / Navegador". Déjalos vacíos si no hay versión web. | — |

### `imagenes`

Textos propios de cada pieza, distintos a los del video.

| Pieza | Campos |
|---|---|
| `pregunta` | `titulo`, `resaltado` (parte del título que va en color), `subtitulo` |
| `beneficio` | `kicker`, `titulo`, `subtitulo`, `pantalla` (`pantalla1..3`), `tarjeta.etiqueta`, `tarjeta.valor` |
| `numero` | `etiqueta`, `valor` (la cifra protagonista), `subtitulo`, `pantalla` |
| `lista` | `titulo`, `items` (3, de ≤ 30 caracteres), `pantalla` |
| `antes-despues` | `antesTitulo`, `antes` (3), `despuesTitulo`, `despues` (3) |

### `voz`

| Clave | Qué es |
|---|---|
| `vozId`, `nombreVoz` | Voz de ElevenLabs. Si está vacía, la skill te ayuda a elegir una la primera vez. |
| `modelo` | Modelo de ElevenLabs (por ejemplo `eleven_multilingual_v2`). |
| `idioma` | Idioma de la voz. |
| `guion` | Una frase por escena: `gancho`, `beneficio1`, `beneficio2`, `beneficio3` y `cierre`. Unas 6 palabras por beneficio; el cierre puede ser más larga. |
| `velocidad` | Opcional: velocidad por escena (0.7–1.2) para que una frase quepa. |

Los valores por defecto de `vozId`, `modelo` e `idioma` salen de `config.local.json → voz` del repo y, si no hay, de `config.json → voz`.

## Reglas para los textos

- Nada de claims inventados: ni número de usuarios, ni porcentajes de mejora, ni premios. Los montos y datos de ejemplo que se ven dentro de la interfaz sí valen.
- Beneficios concretos en lugar de funciones ("Sabes cuánto ganas", no "Módulo de reportes").
- Respeta las `reglas` de la marca.
