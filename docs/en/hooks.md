# Hooks and retention

**English** · [Español](../es/ganchos.md)

The hook decides whether someone stays or keeps scrolling. A video gets about 2 seconds; an image, less than one. This is the guide `/anuncio` follows to write each brand's hooks, score them and test variants.

## Rules

1. **Two hooks at once, not the same sentence.** The on-screen one is read before it's heard: 6 words or fewer, no punctuation it doesn't need. The spoken one can be longer, up to about 10 words (~3 s).
2. **No preamble.** No "Hi", "Introducing", "In this video" or "Meet the new…". The ad starts at the sentence you'd normally reach at second 6.
3. **Front-load it.** The word that hooks (the problem, the number, the "you") goes in the first 3 words.
4. **A concrete situation, not a generic benefit.** "Another appointment you forgot?" hooks; "Manage your schedule easily" doesn't.
5. **If any competitor could say it, it isn't your hook.** Put in something only this brand can say: a real feature, a real screen, its exact audience.
6. **Deliver before the halfway mark.** If the hook opens a question, answer it early, or the attention you earned is lost.
7. **Nothing made up.** No figures, percentages, testimonials or "the best". A number is only allowed if it's real (from the UI, the price, the `reglas` or data the user provided).

## The right amount of curiosity

Curiosity is what the viewer wants to know minus what they already know.
- **Too little:** they already know the answer and have no reason to stay ("Book your appointments with Agendita").
- **Too much:** they can't tell what it's about or why it matters ("This changes everything").
- **Just right:** they recognize the situation, can't guess the way out, and believe there is one ("Still writing your sales in a notebook?").

The bigger the promise, the stronger what you show next has to be. Promise less, show more.

## Formulas

Each ad angle is tested with **3 different formulas**, not three rewrites of one line. The "On screen" column is in capitals only to set it apart; the design decides the casing. The "Piece" column says which design tells it best.

| # | Formula | Template | Spoken example | On screen | Piece |
|---|---|---|---|---|---|
| 1 | **Situation question** | Still / Again {concrete painful situation}? | Another appointment you forgot? | FORGOT ANOTHER ONE? | Typographic |
| 2 | **If this happens to you** | If {concrete situation}, watch this. | If clients text you at 11 p.m. to book, watch this. | BOOKINGS AT MIDNIGHT? | Typographic or demo |
| 3 | **Audience callout** | {Exact audience}: {what always happens to them}. | Barbershops: the client who doesn't show up costs you too. | BARBERSHOPS, THIS IS FOR YOU | Typographic |
| 4 | **Stop** | Stop {habit they recognize}. {What it does instead}. | Stop confirming appointments one by one. | STOP CONFIRMING BY HAND | Typographic |
| 5 | **You don't need** | You don't need {what they think they need}. | You don't need a spreadsheet to know what you made today. | NO SPREADSHEET | Typographic |
| 6 | **Cold open demo** | (The app is already doing the thing in the first frame.) Watch what happens when {action}. | Watch what happens when a client texts "any slots today?". | WATCH THIS | Demo / screenshot |
| 7 | **Before / after** | {Before}. {Now}. | Before: notebook and calculator. Now: your profit, instantly. | NOTEBOOK → APP | Comparison |
| 8 | **Head to head** | {The usual way} versus {the brand}. | Notebook versus Cuentaclara. | NOTEBOOK vs CUENTACLARA | Comparison |
| 9 | **Replacement** | {Brand} replaces {the things they use today}. | Cuentaclara replaces the notebook, the calculator and the WhatsApp group. | 3 THINGS → 1 APP | List / comparison |
| 10 | **Nobody tells you** | Nobody tells you that {uncomfortable truth about the problem}. | Nobody tells you that selling more isn't always earning more. | SELLING ≠ EARNING | Typographic |
| 11 | **The objection** | "{Objection in their words}." {Answer with a real feature}. | "I don't have time to learn another app." That's why it's one screen. | "I DON'T HAVE TIME" | Typographic |
| 12 | **List with a favorite** | {N} things it {does for you}. Number {k} is the one nobody expects. | 3 things Agendita does while you sleep. Nobody expects the third. | 3 THINGS WHILE YOU SLEEP | List |
| 13 | **Cost question** | What does {the problem} cost you? | What does every no-show cost you? | WHAT DOES IT COST YOU? | Number / typographic |
| 14 | **Mid-story start** | …and that's when {the turn}. | …and that's when the client said nobody ever confirmed. | NOBODY CONFIRMED | Typographic or demo |

**What to watch for in each:**
- **1, 2, 3:** the situation must be concrete and recognizable. "If you want to grow" isn't a situation; "Entrepreneurs" or "Businesses" isn't an audience.
- **4:** the habit must be one the audience recognizes in themselves.
- **5:** removing the blocker and putting nothing in its place leaves the ad empty; the second half is the ad.
- **6:** if the result is slow, cut straight to it. The first frame already shows the app in action.
- **7:** one change. Three changes at once stop being believable.
- **8:** there must be a clear winner.
- **9:** don't overstate it: if it replaces part of the job, say which part.
- **10:** if everyone already says it, it isn't a secret.
- **11:** the objection comes from what the audience really says (reviews, comments, the user), not made up.
- **12:** 5 things at most; nobody believes you have 9 good ones.
- **13:** it's a question, not a figure: don't make up the cost.
- **14:** give the context before second 8 or it looks like a mistake.

**Only with real data.** Statistic formulas ("33% of…"), a customer's result, "I tried it for N days" and superlatives ("the fastest") are only used if the user provides the figure or the source and it's written down in `reglas`. Otherwise, no.

## Score

Each hook is scored by the script. The heuristics are tuned for **Spanish** copy; for other languages, use the criteria as a checklist.

```bash
node anunciar.mjs ganchos "¿Otra vez una cita que se te olvidó? | ¿OTRA CITA OLVIDADA?" "Agenda tus citas fácilmente"
```

Each line can be `spoken | on screen`. It rates five things from 0 to 100:

| Criterion | What it checks |
|---|---|
| **Length** (`largo`) | The spoken line fits in ~3 s (≤ 10 words) and the on-screen one in ≤ 6. |
| **Concrete** (`concreto`) | Numbers, names, objects; subtracts brochure words ("solution", "easy", "optimize", "innovative"). |
| **Stakes** (`en juego`) | Something lost, forgotten or painful ("again", "still", "you lose", "nobody", "stop"). |
| **Front-loaded** (`al frente`) | The hook word is in the first 3 words. |
| **To you** (`a ti`) | It speaks to one person ("you", "your business", a question or a command), not to "our users". |

The total weighs the weakest criterion more: one weak spot is enough for the thumb to keep moving. **75+: strong. 50–74: usable. Under 50: not the hook yet.** Openers like "Hi", "In this video", "Introducing" or "Stop scrolling" are marked invalid, a line with no stakes and no question is flagged as a slogan, and possible claims ("the best", "%", "thousands of", "guaranteed") are flagged for you to verify.

The score is a quick guide, not a judge: between two similar hooks, pick the one the user would say out loud.

## Retention in video

| Moment | What happens |
|---|---|
| **0–2 s · Hook** | Text and motion from the very first frame: never fade in from an empty background. On-screen and spoken hooks land together. |
| **2–5 s · Why it matters** | One line: what the viewer gains or stops losing. |
| **Body** | One idea per beat and **a visual change every 1.5–2.5 s**: cut, zoom into an app detail, change of shot. The promise is delivered before the halfway mark. |
| **Last 3 s · Close** | A single call to action. |
| **Last line · Loop** | Echo a word from the hook so the replay joins cleanly. |

The `promo` template already follows this pace. Its hook comes in three types (`video.gancho` in the brand): `golpe` (typographic slam, for almost every formula), `demo` (the camera starts glued to the app and pulls back; for formula 6, "Cold open demo", picked automatically) and `chat` (the question arrives as a message; good for formulas 1, 2 and 11, and the default for the `cercano` direction).

Also:
- **Captions** whenever there's voice: many people watch muted.
- **Length:** 15 to 30 s for ads; under 10 there's room for nothing but the hook.
- **Test 2 or 3 hooks** on the same video body: the cheapest test and the one that teaches the most.

## Retention in images

- **Break the feed's pattern:** strong contrast, an unexpected layout, a close-up of an app detail that doesn't explain itself, or almost nothing but huge type.
- **One idea per piece** and the headline on the first line read.
- **What looks like a "polished ad" gets skipped.** A real app screenshot often stops people more than a generic layout.
- **One piece per formula**, not five of the same kind: that's how you learn which one works.
- In a carousel or Reel cover, the first image is the hook and the last one echoes it with the call to action.

## Hook variants (A/B test)

The brand keeps its hooks in `ganchos` (see [brand.md](brand.md#ganchos-hooks)). To compare, the same ad is generated with each one:

```bash
node anunciar.mjs <brand> video --gancho 1,2,3 --formatos vertical --nota "hook test"
node anunciar.mjs <brand> imagenes --gancho 2 --piezas pregunta
```

Each variant becomes its own version. Post them all with the same budget and keep the one that holds attention longest.

## Credits

Ideas adapted from [instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill) (MIT): formulas with an on-screen version and their typical failure, and the scoring criteria. And from [viral-hooks](https://github.com/omer-metin/skills-for-antigravity) (Apache-2.0): calibrating curiosity and delivering on the promise.
