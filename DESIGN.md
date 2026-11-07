# SmartPot Web Design System

[English](#english) | [Español](#español)

---

## English

The single source of truth for how SmartPot looks, reads and moves. Tokens live in `src/styles/index.css`; this file
explains what they are for and what is not allowed. If code and this document disagree, fix one of them in the same
commit.

### 1. Atmosphere

A calibrated instrument for a living thing. The interface is calm and precise: deep forest greens frame the brand,
quiet tinted neutrals carry the data, and every number can be traced to a real reading.

| Dial | Public site | App |
| --- | --- | --- |
| Density | 4 · airy, one idea per section | 6 · balanced daily tool |
| Variance | 6 · offset, asymmetric splits | 3 · predictable grids |
| Motion | 3 · restrained CSS | 3 · state changes only |

### 2. Color

Only the SmartPot palette. One accent; semantic hues carry meaning, never decoration.

| Token | Hex (light) | Role |
| --- | --- | --- |
| `leaf-950` | `#06281C` | Deep fields: hero band, footer |
| `leaf-900` | `#0B3D2B` | App chrome (sidebar, mobile bars), dark surfaces |
| `leaf-700` | `#067A52` | **The accent**: primary buttons, active navigation, table headers |
| `leaf-500` | `#00B074` | Brand mark, accent on dark backgrounds, focus ring |
| `leaf-100` | `#DDF5EA` | Tints, ideal-range band in charts |
| `water-500` / `water-700` | `#2D9CDB` / `#1F6FA0` | Information, links, water |
| `sun-500` | `#F2B632` | Light, warnings, unread badge |
| `clay-500` | `#D9734E` | Pot, warm data series, poor health |
| `danger-500` | `#D64545` | Errors and destructive actions |
| `ink` | `#17261F` | Text |
| `muted` | `#5B6B63` | Secondary text |
| `line` | `#D5E3DC` | Hairlines and borders |
| `surface` / `page` | `#F2F7F4` / `#F7FAF8` | Section and page backgrounds |

Dark mode (`:root.dark`) keeps the hues and swaps the neutrals: page `#0A0E0C`, card `#121815`, surface `#18221D`,
line `#22332A`, text `#F2F7F4`. Semantic foregrounds (`accent-strong`, `link`, `sun-fg`, `clay-fg`, `danger-fg`) are
lightened there to keep WCAG AA. Never pure black, no neon glows, no purple or blue "AI" gradients, no gradient text.

### 3. Typography

| Role | Family | Weights | Notes |
| --- | --- | --- | --- |
| Display (h1–h3, wordmark, large values) | Outfit Variable | 600–700 | `tracking-tight`, `text-balance` |
| Text and UI | Geist Variable | 400–600 | `text-pretty` on paragraphs |

- Scale: 12 · 14 · 16 (body) · 18 · 20 · 24 · `clamp(1.75rem, 1.2rem + 2vw, 2.5rem)` (h2) ·
  `clamp(2.25rem, 1.3rem + 4vw, 4rem)` (h1).
- Body copy stays at or under 65 characters per line (`max-w-prose` or `max-w-xl`).
- Every metric, table column, chart tick and timer uses `tabular-nums` and `Intl.NumberFormat` with the active locale
  (`es-CO` → `6,5`, `en-US` → `6.5`). `toFixed()` never reaches the screen.
- Only the two latin files are preloaded. Each family has a metric-matched local fallback (`Outfit Fallback`,
  `Geist Fallback`) so the swap does not move the layout.
- Brand names and code tokens (`SmartPot`, `MQTT`, `ESP32`, `pH`, `TDS`) carry `translate="no"` where they stand alone.

### 4. Components

- **Buttons**: primary is a solid `leaf-700` fill, `leaf-800` on hover and a 1 px press (`active:translate-y-px`);
  secondary is an outline on `line`; ghost for toolbars. One primary action per view. Transitions list their
  properties (`transition-colors`, `transition-transform`), never `transition-all`.
- **Cards**: only when the elevation groups something (a crop, a panel). Inside a card use dividers and spacing, not
  nested cards. Radius 20 px (`--radius-card`), tinted shadow (`--shadow-card`).
- **Metric tile**: label (14 px, `muted`) → value (Outfit 24–28 px, tabular) → ideal range (12 px). Status uses text
  plus icon (Ideal / Low / High), never color alone.
- **Charts**: inline SVG, ideal range as a `leaf-100` band, rounded "nice" ticks formatted with `Intl`, one series
  color per metric (`src/lib/catalog.ts`), pointer and keyboard readout, `aria-label` with the summary.
- **Forms**: label above, hint or error below, `autocomplete` on every auth field, `spellcheck=false` on e-mail and
  codes, errors announced (`role="alert"`).
- **States**: skeletons that match the final layout (no spinners for page loads), composed empty states with the next
  action, inline errors with a retry.
- **Navigation**: sidebar on desktop, five-item bottom bar on mobile, a skip link to `#main` on every layout.

### 5. Layout

- Public pages: `max-w-6xl` container, sections separated by `clamp(3rem, 8vw, 6rem)`; no row of three identical
  cards; alternate composition anchors (offset split, full-width diagram, table with side caption, diptych).
- App: `max-w-6xl` main column; grids align items to the start so short cards never stretch into empty boxes.
- Mobile first: everything collapses to one column under 768 px, no horizontal page scroll, wide tables scroll inside
  their card with a visible edge fade, 44 × 44 px touch targets (`touch-target` utility), `touch-action: manipulation`.
- Full-height areas use `min-h-dvh`, never `h-screen`; sticky bars respect `env(safe-area-inset-*)`.

### 6. Motion

- Only `transform` and `opacity`, 150–250 ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Loops are reserved for the crop scene (water, fan, light) and the online dot; all of them stop with
  `prefers-reduced-motion: reduce`.
- No staggered list reveals, no scroll-jacking, no parallax.

### 7. Imagery

The product draws itself: crop scenes (pot, NFT pipes, tower, raft) are SVG built from `src/features/crops/components/
scene`. No stock photos and no generated photos presented as real installations. Example data is always labelled as
an example.

### 8. Copy

- Spanish first (neutral, «tú»), English mirror in `src/lib/i18n/en.ts`; server messages go through `st()`.
- Short, active sentences that state what happens. Every number must be traceable to the code or a reading.
- Banned: emojis, exclamation marks in UI, "revolutionary", "seamless", "next-gen", "unleash", "elevate", "powerful",
  and their Spanish versions («revoluciona», «sin fisuras», «de próxima generación», «potencia», «lleva al siguiente
  nivel»). No invented percentages, testimonials or user counts.

### 9. Performance budget

| Metric (Lighthouse, simulated mobile) | Budget |
| --- | --- |
| LCP | ≤ 2.5 s on every view |
| CLS | ≤ 0.05 (desktop and mobile) |
| TBT | ≤ 150 ms public, ≤ 200 ms app |
| Initial JS for `/` | ≤ 60 KB Brotli |
| Fonts | 2 preloaded latin files |
| Score | ≥ 95 performance, 100 accessibility, best practices and SEO on public pages |

Private routes are lazy chunks preloaded in parallel with the session check; the crop page polls actuators every
15 s (4 s only while a command is pending) and receives readings by SSE.

### 10. Not allowed

Centered generic hero with a badge pill and a floating glass card · three equal feature cards · glassmorphism ·
radial glow backgrounds · gradient text · pure black · custom cursors · fake live data · decorative charts ·
`transition-all` · `outline-none` without a visible replacement · images without dimensions · hard-coded number or
date formats.

---

## Español

La fuente única de cómo se ve, se lee y se mueve SmartPot. Los tokens viven en `src/styles/index.css`; este archivo
explica para qué sirven y qué no se permite. Si el código y este documento no coinciden, se corrige uno de los dos en
el mismo commit.

### 1. Atmósfera

Un instrumento calibrado para algo vivo. La interfaz es tranquila y precisa: los verdes de bosque enmarcan la marca,
los neutros teñidos y discretos llevan los datos, y cada número se puede rastrear hasta una lectura real.

| Dial | Sitio público | App |
| --- | --- | --- |
| Densidad | 4 · aireada, una idea por sección | 6 · herramienta diaria equilibrada |
| Variación | 6 · desplazada, divisiones asimétricas | 3 · rejillas predecibles |
| Movimiento | 3 · CSS contenido | 3 · solo cambios de estado |

### 2. Color

Solo la paleta SmartPot. Un acento; los tonos semánticos llevan significado, nunca decoración.

| Token | Hex (claro) | Uso |
| --- | --- | --- |
| `leaf-950` | `#06281C` | Fondos profundos: franja del hero, pie de página |
| `leaf-900` | `#0B3D2B` | Cromo de la app (barra lateral, barras móviles), superficies oscuras |
| `leaf-700` | `#067A52` | **El acento**: botones primarios, navegación activa, cabeceras de tabla |
| `leaf-500` | `#00B074` | Marca, acento sobre fondos oscuros, anillo de foco |
| `leaf-100` | `#DDF5EA` | Tintes, franja del rango ideal en las gráficas |
| `water-500` / `water-700` | `#2D9CDB` / `#1F6FA0` | Información, enlaces, agua |
| `sun-500` | `#F2B632` | Luz, advertencias, insignia de no leídas |
| `clay-500` | `#D9734E` | Maceta, series cálidas, salud mala |
| `danger-500` | `#D64545` | Errores y acciones destructivas |
| `ink` | `#17261F` | Texto |
| `muted` | `#5B6B63` | Texto secundario |
| `line` | `#D5E3DC` | Líneas finas y bordes |
| `surface` / `page` | `#F2F7F4` / `#F7FAF8` | Fondos de sección y de página |

El modo oscuro (`:root.dark`) conserva los tonos y cambia los neutros: página `#0A0E0C`, tarjeta `#121815`, superficie
`#18221D`, línea `#22332A`, texto `#F2F7F4`. Los primeros planos semánticos (`accent-strong`, `link`, `sun-fg`,
`clay-fg`, `danger-fg`) se aclaran para mantener WCAG AA. Nunca negro puro, sin resplandores neón, sin degradados
morados o azules «de IA», sin texto con degradado.

### 3. Tipografía

| Uso | Familia | Pesos | Notas |
| --- | --- | --- | --- |
| Títulos (h1–h3, logotipo, valores grandes) | Outfit Variable | 600–700 | `tracking-tight`, `text-balance` |
| Texto e interfaz | Geist Variable | 400–600 | `text-pretty` en párrafos |

- Escala: 12 · 14 · 16 (cuerpo) · 18 · 20 · 24 · `clamp(1.75rem, 1.2rem + 2vw, 2.5rem)` (h2) ·
  `clamp(2.25rem, 1.3rem + 4vw, 4rem)` (h1).
- El texto corrido no pasa de 65 caracteres por línea (`max-w-prose` o `max-w-xl`).
- Toda métrica, columna de tabla, marca de eje y contador usa `tabular-nums` e `Intl.NumberFormat` con el idioma activo
  (`es-CO` → `6,5`, `en-US` → `6.5`). `toFixed()` nunca llega a la pantalla.
- Solo se precargan los dos archivos latinos. Cada familia tiene un respaldo local con métricas equivalentes
  (`Outfit Fallback`, `Geist Fallback`) para que el cambio de fuente no mueva el diseño.
- Los nombres de marca y de protocolo (`SmartPot`, `MQTT`, `ESP32`, `pH`, `TDS`) llevan `translate="no"` cuando van
  solos.

### 4. Componentes

- **Botones**: el primario es un relleno sólido `leaf-700`, `leaf-800` al pasar el cursor y un hundimiento de 1 px
  (`active:translate-y-px`); el secundario es un contorno en `line`; el fantasma, para barras de herramientas. Una sola
  acción primaria por vista. Las transiciones nombran sus propiedades (`transition-colors`, `transition-transform`),
  nunca `transition-all`.
- **Tarjetas**: solo cuando la elevación agrupa algo (un cultivo, un panel). Dentro de una tarjeta se usan divisores y
  espacio, no tarjetas anidadas. Radio de 20 px (`--radius-card`), sombra teñida (`--shadow-card`).
- **Medidor**: etiqueta (14 px, `muted`) → valor (Outfit 24–28 px, tabular) → rango ideal (12 px). El estado usa texto e
  ícono (Ideal / Bajo / Alto), nunca solo color.
- **Gráficas**: SVG en línea, el rango ideal como franja `leaf-100`, marcas de eje redondeadas con `Intl`, un color por
  métrica (`src/lib/catalog.ts`), lectura con puntero y teclado, `aria-label` con el resumen.
- **Formularios**: etiqueta arriba, ayuda o error abajo, `autocomplete` en cada campo de acceso, `spellcheck=false` en
  correo y códigos, errores anunciados (`role="alert"`).
- **Estados**: esqueletos con la forma del diseño final (sin spinners para cargar páginas), vacíos compuestos con la
  siguiente acción, errores en línea con reintento.
- **Navegación**: barra lateral en escritorio, barra inferior de cinco lugares en móvil y un enlace para saltar a
  `#main` en cada diseño.

### 5. Diseño

- Páginas públicas: contenedor `max-w-6xl`, secciones separadas por `clamp(3rem, 8vw, 6rem)`; ninguna fila de tres
  tarjetas idénticas; se alternan los anclajes de composición (división desplazada, diagrama a todo el ancho, tabla con
  leyenda lateral, díptico).
- App: columna principal `max-w-6xl`; las rejillas alinean al inicio para que una tarjeta corta nunca se estire en una
  caja vacía.
- Móvil primero: bajo 768 px todo pasa a una columna, sin desplazamiento horizontal de la página, las tablas anchas se
  desplazan dentro de su tarjeta con un desvanecido visible en el borde, áreas táctiles de 44 × 44 px (utilidad
  `touch-target`) y `touch-action: manipulation`.
- Las áreas de alto completo usan `min-h-dvh`, nunca `h-screen`; las barras fijas respetan `env(safe-area-inset-*)`.

### 6. Movimiento

- Solo `transform` y `opacity`, de 150 a 250 ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Los bucles se reservan para la escena del cultivo (agua, ventilador, luz) y el punto de «en línea»; todos se detienen
  con `prefers-reduced-motion: reduce`.
- Sin listas que aparecen en cascada, sin secuestrar el desplazamiento, sin parallax.

### 7. Imágenes

El producto se dibuja a sí mismo: las escenas de cultivo (maceta, tubos NFT, torre, balsa) son SVG hechos con
`src/features/crops/components/scene`. Sin fotos de banco ni fotos generadas presentadas como instalaciones reales.
Los datos de ejemplo siempre se rotulan como ejemplo.

### 8. Textos

- Primero en español (neutro, «tú»), con su espejo en inglés en `src/lib/i18n/en.ts`; los mensajes del servidor pasan
  por `st()`.
- Frases cortas y activas que dicen qué pasa. Cada número se puede rastrear hasta el código o una lectura.
- Prohibido: emojis, signos de exclamación en la interfaz, «revoluciona», «sin fisuras», «de próxima generación»,
  «potencia», «lleva al siguiente nivel» y sus equivalentes en inglés ("revolutionary", "seamless", "next-gen",
  "unleash", "elevate", "powerful"). Sin porcentajes, testimonios ni cifras de usuarios inventados.

### 9. Presupuesto de rendimiento

| Métrica (Lighthouse, móvil simulado) | Presupuesto |
| --- | --- |
| LCP | ≤ 2,5 s en cada vista |
| CLS | ≤ 0,05 (escritorio y móvil) |
| TBT | ≤ 150 ms en lo público, ≤ 200 ms en la app |
| JS inicial de `/` | ≤ 60 KB en Brotli |
| Fuentes | 2 archivos latinos precargados |
| Puntaje | ≥ 95 en rendimiento y 100 en accesibilidad, buenas prácticas y SEO en las páginas públicas |

Las rutas privadas son trozos diferidos que se precargan en paralelo con la verificación de la sesión; la página del
cultivo consulta los actuadores cada 15 s (cada 4 s solo mientras hay una orden pendiente) y recibe las lecturas por
SSE.

### 10. No se permite

Hero centrado genérico con píldora y tarjeta de vidrio flotante · tres tarjetas de funciones iguales · vidrio
esmerilado · fondos con resplandor radial · texto con degradado · negro puro · cursores personalizados · datos en vivo
falsos · gráficas decorativas · `transition-all` · `outline-none` sin reemplazo visible · imágenes sin dimensiones ·
formatos de número o fecha fijos en el código.
