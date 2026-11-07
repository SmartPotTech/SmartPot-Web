# SmartPot-Web

[English](#english) | [Español](#español)

---

## English

### Project Status

[![Bun CI](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/bun.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/bun.yml)
[![CodeQL Advanced](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/codeql.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/codeql.yml)
[![Publish Docker Images](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/packaging.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/packaging.yml)

### Description

`SmartPot-Web` is the next-generation **Progressive Web Application (PWA)** of SmartPot, built with **SolidJS**, **TypeScript**, and **Vite** to replace the legacy React frontend with fine-grained reactivity without a Virtual DOM, native SVG charts without heavy external charting libraries, conditional `ETag` revalidation (`If-None-Match` / `304 Not Modified`), live Server-Sent Events (SSE) with LTTB downsampling, bilingual support (**English and Spanish**), dark mode, and cross-tab `HttpOnly` session synchronization.

It preserves the complete functional and visual experience published at [smartpot.app](https://smartpot.app), installs on Android, iOS, and desktop, and allows users to:

- View all crops together in the **Overview dashboard**: health index for each crop, single-metric comparison across crops (6 h, 24 h, or 7 days), latest reading table against ideal species ranges, and AI fleet analysis across the entire account (shared environmental issues, clusters with similar conditions, and bulk actions).
- Use **General Control** to toggle automatic mode or send the same command (water, ventilate, light) to multiple crops at once.
- Review **Actions**: AI-suggested actions across crops and the complete command history filtered by status and source.
- Create **real** crops (an ESP32 running the firmware, physical or simulated in Wokwi, with its step-by-step connection guide) or **virtual** crops (simulated by SmartPot), across six species and four hydroponic forms: pot, NFT tubes, vertical tower, or floating raft, specifying their placement (indoor or outdoor, sun exposure, and city). Crop kind cannot be changed later; placement can be edited in Settings.
- View each crop **illustrated** live across all its tabs: its form and species (lettuce, tomato, strawberry…) colored by health vigor, in its placement (an indoor window, partial shade mesh, or outdoor tree) with real local weather and each actuator turned on or off.
- Inspect real-time sensor readings compared against the ideal range for the species, plus 6 h, 24 h, or 7-day history exportable to CSV.
- Consult the **AI Assistant** for each crop: health index and contributing factors, per-parameter diagnosis, expert system conclusions, ML model predictions, 3-hour trend forecast, **continuous learning insights from real crops** (operating state cluster, anomaly detection, 1-hour irrigation/cooling probability, and expected soil moisture), placement advice, and suggested actions.
- Explore **Learning** to see how the assistant improves with every real reading: data quality metrics, candidate model comparison against baseline, typical operating states per species, and Isolation Forest anomaly detection.
- Control **Simulation** of a virtual crop in two parts: live status with Pause and Resume at the top, and simulation mode (real local weather, manual sliders, or species day/night cycle) at the bottom.
- Link **Telegram** in Profile › Applications and configure per-crop alerts in Settings (instant or digest delivery, daily summary time, and shared chats), as well as manage personal **MCP connections** (`spt_...`) in Profile › Connections.
- Toggle water pump, UV light, fan, humidifier, and dosers with a **switch**, duration selector, and live countdown, or enable the **automatic agent mode**.
- Switch seamlessly between **English (`en`)** and **Spanish (`es`)**, and between light and dark themes.

The landing page is public and indexable; the application lives under `/app` and is excluded from search indexing.

### Architecture, Performance, and Security Highlights

- **Fine-grained reactivity without a Virtual DOM (`solid-js`).** Signals (`createSignal`, `createMemo`, `createEffect`) update only the exact DOM nodes or SVG attributes that change on each telemetry tick or actuator countdown.
- **Native SVG charts without Recharts.** `ReadingsChart` and `MetricComparison` render areas, ideal range bands, axes, legends, and interactive tooltips directly in reactive SVG. Route-level chunks stay small (the lazy detail view is under 50 kB gzip), and crop creation/simulation code is loaded only when needed.
- **First paint without blocking requests.** The build inlines the single stylesheet and a CSP-hashed theme bootstrap into `index.html`, preloads only the two latin font files (Geist and Outfit, each with a metric-matched local fallback so the swap does not shift the layout) and defers `/config.js`. Every route except the landing is a lazy chunk requested in parallel with the session check; private routes paint an app-shell skeleton and public routes ship their own static `<head>` (`login.html`, `register.html`…) with title, canonical and robots.
- **Conditional `ETag` revalidation (`If-None-Match` / `304 Not Modified`).** The HTTP client caches `GET` responses in memory keyed by session scope and weak `ETag` from `SmartPot-API`; when unchanged, the API returns `304` with no body. Any mutation (`POST`, `PUT`, `PATCH`, `DELETE`) or session change clears the cache immediately.
- **`HttpOnly` Cookie Session + Signed Double-Submit CSRF.** Session authentication uses an `HttpOnly` cookie (`smartpot_session`) paired with a signed CSRF token (`smartpot_csrf` / `X-CSRF-Token`), synchronized across open browser tabs via `BroadcastChannel` and `storage` events.
- **Full Bilingual UI (`es` / `en`).** Both static interface catalogs and dynamic API/AI messages adapt reactively to the active language. `serverText.ts` maps the expert-system rules, diagnoses, forecasts, placement advice, fleet analysis, learning status, notifications, and HTTP errors emitted by `SmartPot-AI` and `SmartPot-API`, including values interpolated into templates.
- **Hardened Unprivileged Nginx Container.** Serves pre-compressed Gzip (level 9) and Brotli (quality 11) static assets through `gzip_static` and a pinned `ngx_brotli` module, with strict CSP, `Cross-Origin-Resource-Policy: same-origin`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy`.

### Tech Stack

SolidJS 1.9 · `@solidjs/router` · TypeScript 6 · Vite 8 · Tailwind CSS 4 · `lucide-solid` · Vitest · `@solidjs/testing-library` · Bun 1.4.

### Project Structure

```text
SmartPot-Web/
├── public/
│   ├── icons/                  # Source SVG icons and generated PWA PNGs
│   ├── manifest.webmanifest    # Web App Manifest
│   ├── sw.js                   # Service worker: cached app shell, network-only API
│   ├── robots.txt, sitemap.xml # SEO
│   ├── og-image.svg / .png     # Open Graph social image
│   └── config.js               # Runtime API URL (rewritten by container entrypoint)
├── src/
│   ├── app/                    # Router, lazy routes with preloading, private layout and shell pages
│   ├── components/             # Brand, layouts, and SolidJS UI design system
│   ├── config/env.ts           # Runtime API and MCP URL resolution
│   ├── features/
│   │   ├── auth/               # Cross-tab reactive session, login, registration, recovery
│   │   ├── overview/           # Overview dashboard: ranking, native SVG charts, AI fleet panel
│   │   ├── control/            # General control: automatic mode and bulk commands
│   │   ├── actions/            # Suggested fleet actions and global command history
│   │   ├── crops/              # Real/virtual creation, live SVG scene, summary, AI, control, history, device, simulation, settings
│   │   ├── learning/           # AI continuous learning: quality, model comparison, states, anomalies
│   │   ├── landing/            # Public landing page and FAQ
│   │   ├── notifications/      # Account alerts
│   │   ├── profile/            # Profile, notification channels (Telegram), MCP connections, password, account deletion
│   │   └── pwa/                # Service worker registration and install prompt
│   ├── hooks/                  # Page metadata, visibility-aware resource polling, online status
│   ├── lib/                    # ETag HTTP client, API services/types, catalogs, formatters, theme, and i18n (es/en)
│   ├── services/stream.ts      # Live SSE telemetry stream with exponential backoff
│   └── styles/index.css        # SmartPot palette as Tailwind CSS tokens (light and dark)
├── nginx/                      # Unprivileged production Nginx config, CSP, CORP, caching
├── scripts/
│   ├── compress-assets.mjs     # Static pre-compression (Gzip level 9 and Brotli quality 11)
│   └── generate-icons.mjs      # PWA PNG generator from SVG sources
├── bun.lock                    # Deterministic Bun lockfile
└── Dockerfile                  # Multi-stage build with Bun Alpine and unprivileged Nginx runtime
```

### Visual Identity

The full design system (type, components, motion, copy rules and performance budget) is in [`DESIGN.md`](DESIGN.md).

| Token                                | Color                                         | Usage                                                   |
|--------------------------------------|-----------------------------------------------|---------------------------------------------------------|
| `leaf-900`                           | `#0B3D2B`                                     | Sidebar, navigation, headers, and PWA theme color       |
| `leaf-700`                           | `#067A52`                                     | Primary actions                                         |
| `leaf-500`                           | `#00B074`                                     | Brand green                                             |
| `water-500`                          | `#2D9CDB`                                     | Water, info, and logo signal accent                     |
| `sun-500`                            | `#F2B632`                                     | Light and warnings                                      |
| `clay-500`                           | `#D9734E`                                     | Pot illustration and temperature                        |
| `danger-500`                         | `#D64545`                                     | Errors                                                  |
| `ink` / `muted` / `line` / `surface` | `#17261F` / `#5B6B63` / `#D5E3DC` / `#F2F7F4` | Text, borders, and surfaces                             |

### Installation & Quick Start

#### One-Command Deployment

The image is public at `ghcr.io/smartpottech/smartpot-web`. Launch the full stack with a single command without cloning any repository:

```bash
curl -fsSL https://raw.githubusercontent.com/SmartPotTech/.github/main/docker/demo/compose.yaml | docker compose -f - up -d --wait
```

Open http://localhost:5173 and sign in with `demo@smartpot.app` / `SmartPot2026`. Stop with `docker compose -p smartpot-demo down`.

#### Local Development & Quality

```bash
bun install
bun run dev
bun run lint
bun run typecheck
bun run test
bun run build
```

### Documentation & License

Component documentation is available in [`docs/`](docs/SmartPot_Web_Solid_Documentation.md) (and in [DOCX](docs/SmartPot_Web_Solid_Documentation.docx) and [PDF](docs/SmartPot_Web_Solid_Documentation.pdf)). Licensed under the [MIT License](LICENSE).

---

## Español

### Estado del Proyecto

[![Bun CI](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/bun.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/bun.yml)
[![CodeQL Advanced](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/codeql.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/codeql.yml)
[![Publish Docker Images](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/packaging.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/packaging.yml)

### Descripción

`SmartPot-Web` es la nueva generación de la **aplicación web progresiva (PWA)** de SmartPot, reescrita sobre **SolidJS**, **TypeScript** y **Vite** para reemplazar la capa de React con reactividad de grano fino sin Virtual DOM, gráficos SVG nativos sin bibliotecas externas pesadas, revalidación condicional por `ETag` (`If-None-Match` / `304 Not Modified`), eventos en vivo por SSE con reducción LTTB, soporte bilingüe completo (**español e inglés**), modo oscuro y sincronización instantánea de sesión entre pestañas.

Conserva **idéntica** toda la experiencia funcional y gráfica de la aplicación publicada en [smartpot.app](https://smartpot.app), se instala en Android, iOS y escritorio, y permite:

- Ver todos los cultivos juntos en el **panel general**: salud de cada uno, comparación de una variable entre cultivos (6 h, 24 h o 7 días), tabla con la última lectura frente al rango ideal y el análisis del asistente sobre toda la cuenta (problemas compartidos del entorno, grupos con condiciones parecidas y acciones en bloque).
- Usar el **control general** para activar el modo automático o enviar la misma orden (regar, ventilar, luz) a varios cultivos a la vez.
- Revisar las **acciones**: las que sugiere el asistente para varios cultivos y el historial de todas las órdenes, filtrado por estado y origen.
- Crear cultivos **reales** (un ESP32 con el firmware, físico o simulado en Wokwi, con su guía de conexión) o **virtuales** (los simula SmartPot), de seis especies y cuatro formas: maceta, tubos NFT, torre vertical o balsa flotante, y decir dónde está: bajo techo o al aire libre, cuánto sol recibe y en qué ciudad. El tipo no cambia después; el lugar se edita en Ajustes.
- Ver cada cultivo **ilustrado** sobre todas sus secciones: su forma y su especie (lechuga, tomate, fresa…) con el color de su salud, en su lugar (una ventana con el cielo de afuera, una malla de media sombra o un árbol) con el clima real y cada actuador encendido o apagado. La ilustración no tiene botones: las órdenes se dan en Control. Si no está conectado, no se ilustra.
- Ver las lecturas en tiempo real, comparadas con el rango ideal de la especie, e historiales de 6 h, 24 h o 7 días exportables a CSV.
- Consultar al **asistente de IA** de cada cultivo: índice de salud y de qué variables depende, diagnóstico, conclusiones del sistema experto, predicciones de los modelos, pronóstico de las próximas horas, lo **aprendido de cultivos reales** (estado de operación, lectura habitual o no, riego o calor probables en la próxima hora y sustrato esperado), el consejo de lugar según la luz que pide la especie y acciones sugeridas.
- Ver en **Aprendizaje** cómo mejora el asistente con cada lectura: calidad de los datos, comparación de modelos con su puntaje frente a la línea base, estados típicos de cada especie y detector de lecturas poco habituales.
- Controlar la **simulación** de un cultivo virtual en dos partes, como Dispositivo: arriba el estado con Pausar y Reanudar; abajo cómo se simula (clima real del lugar, medidores manuales o el día y la noche de la especie) con «Aplicar cambios».
- Vincular **Telegram** en Perfil › Aplicaciones, administrar **conexiones MCP** (`spt_...`) en Perfil › Conexiones y elegir en Ajustes qué avisa cada cultivo: al instante o en resúmenes, un resumen diario y los chats con los que se comparte.
- Encender y apagar con un **switch** la bomba, la luz ultravioleta, el ventilador, el humidificador y los dosificadores, con su duración y su cuenta regresiva, y activar el **modo automático** del agente.
- Cambiar en cualquier momento entre **español (`es`)** e **inglés (`en`)**, así como entre tema claro y oscuro.

La página de inicio es pública e indexable; la aplicación vive bajo `/app` y no se indexa.

### Mejoras de Arquitectura, Rendimiento y Seguridad

- **Reactividad de grano fino sin Virtual DOM (`solid-js`).** Las señales (`createSignal`, `createMemo`, `createEffect`) actualizan únicamente los nodos del DOM o atributos SVG que cambian en cada sondeo de telemetría o cuenta regresiva de actuadores, sin reconciliar árboles de componentes.
- **Gráficos SVG nativos sin Recharts.** `ReadingsChart` y `MetricComparison` renderizan áreas, bandas de rango ideal, ejes, leyendas y *tooltips* interactivos directamente en SVG reactivo. Los trozos por ruta se mantienen pequeños (la vista de detalle diferida queda por debajo de 50 kB gzip) y el alta de cultivos y la simulación solo se descargan cuando se abren.
- **Primer pintado sin peticiones bloqueantes.** El build incrusta en `index.html` la única hoja de estilos y un arranque de tema autorizado por hash en la CSP, precarga solo los dos archivos latinos de las fuentes (Geist y Outfit, cada una con un respaldo local de métricas equivalentes para que el cambio no mueva el diseño) y difiere `/config.js`. Toda ruta salvo la landing es un trozo diferido que se pide en paralelo con la verificación de la sesión; las rutas privadas pintan un esqueleto del cromo de la app y las públicas tienen su propio `<head>` estático (`login.html`, `register.html`…) con título, canonical y robots.
- **Revalidación condicional `ETag` (`If-None-Match` / `304 Not Modified`).** El cliente HTTP guarda en memoria las respuestas `GET` junto con el `ETag` débil emitido por `SmartPot-API` y envía `If-None-Match` en los sondeos periódicos; cuando el recurso no cambió, la API responde `304` sin transferir cuerpo y la PWA reutiliza la copia en memoria. Cualquier mutación (`POST`, `PUT`, `PATCH`, `DELETE`) o cambio de sesión limpia la caché al instante.
- **Sesión en cookie `HttpOnly` + protección CSRF firmada.** La autenticación viaja en la cookie `smartpot_session` (`HttpOnly`, `SameSite=Lax`) acompañada del token CSRF de doble envío (`smartpot_csrf` / `X-CSRF-Token`) y sincronización entre pestañas con `BroadcastChannel`.
- **Interfaz Bilingüe (`es` / `en`).** Tanto los catálogos estáticos de la interfaz como los textos dinámicos provenientes de la API y del asistente de IA se muestran en el idioma elegido por la persona. `serverText.ts` cubre las reglas del sistema experto, diagnósticos, pronósticos, consejos de ubicación, análisis de flota, estado de aprendizaje, notificaciones y errores HTTP de `SmartPot-AI` y `SmartPot-API`, incluidos los valores interpolados en las plantillas.
- **Contenedor Nginx endurecido.** Sirve los activos precomprimidos con Gzip (nivel 9) y Brotli (calidad 11) mediante `gzip_static` y un módulo `ngx_brotli` fijado a la versión de la imagen, junto a la CSP estricta, `Cross-Origin-Resource-Policy: same-origin`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `Permissions-Policy`.

### Tecnologías

SolidJS 1.9 · `@solidjs/router` · TypeScript 6 · Vite 8 · Tailwind CSS 4 · `lucide-solid` · Vitest · `@solidjs/testing-library` · Bun 1.4.

### Estructura del Proyecto

```text
SmartPot-Web/
├── public/
│   ├── icons/                  # Íconos SVG fuente y PNG de la PWA
│   ├── manifest.webmanifest    # Instalación como app
│   ├── sw.js                   # Service worker: app shell en caché, API siempre en red
│   ├── robots.txt, sitemap.xml # SEO
│   ├── og-image.svg / .png     # Imagen para redes sociales
│   └── config.js               # URL de la API en desarrollo (el contenedor lo reescribe)
├── src/
│   ├── app/                    # Enrutador (@solidjs/router), carga diferida y páginas generales
│   ├── components/             # Marca, layouts y sistema de diseño en SolidJS
│   ├── config/env.ts           # URL de la API en tiempo de ejecución
│   ├── features/
│   │   ├── auth/               # Sesión reactiva sincronizada entre pestañas, ingreso, registro y recuperación
│   │   ├── overview/           # Panel general: ranking, comparativas SVG nativas y análisis de flota de la IA
│   │   ├── control/            # Control general: modo automático y órdenes en bloque
│   │   ├── actions/            # Acciones sugeridas e historial de todos los cultivos
│   │   ├── crops/              # Creación real o virtual, ilustración SVG, resumen, asistente, control, historial, dispositivo, simulación y ajustes
│   │   ├── learning/           # Aprendizaje de la IA: calidad, comparación de modelos, estados y atípicos
│   │   ├── landing/            # Página pública y preguntas frecuentes
│   │   ├── notifications/      # Alertas
│   │   ├── profile/            # Perfil, canales de notificación (Telegram), conexiones MCP, contraseña y borrado de cuenta
│   │   └── pwa/                # Registro del service worker e instalación
│   ├── hooks/                  # Metadatos por página, recursos con refresco por visibilidad y estado de red
│   ├── lib/                    # Cliente de la API con caché ETag, tipos, catálogos, formato, tema e i18n (es/en)
│   ├── services/stream.ts      # Lecturas en vivo por SSE con reconexión (respaldo: consulta con ETag)
│   └── styles/index.css        # Paleta SmartPot como tokens de Tailwind
├── nginx/                      # Servidor de producción en contenedor: CSP, CORP, caché y configuración
├── scripts/
│   ├── compress-assets.mjs     # Pre-compresión estática de activos (Gzip nivel 9 y Brotli calidad 11)
│   └── generate-icons.mjs      # PNG de la PWA a partir de los SVG
├── bun.lock                    # Árbol de dependencias determinista y versionable de Bun
└── Dockerfile                  # Compilación multi-stage con Bun Alpine y servicio Nginx unprivileged
```

### Identidad Visual

El sistema de diseño completo (tipografía, componentes, movimiento, reglas de redacción y presupuesto de rendimiento) está en [`DESIGN.md`](DESIGN.md).

| Token                                | Color                                         | Uso                                                               |
|--------------------------------------|-----------------------------------------------|-------------------------------------------------------------------|
| `leaf-900`                           | `#0B3D2B`                                     | Barra lateral, navegación, encabezados y color del tema de la PWA |
| `leaf-700`                           | `#067A52`                                     | Acciones principales                                              |
| `leaf-500`                           | `#00B074`                                     | Verde de marca                                                    |
| `water-500`                          | `#2D9CDB`                                     | Agua, información y señal del logo                                |
| `sun-500`                            | `#F2B632`                                     | Luz y advertencias                                                |
| `clay-500`                           | `#D9734E`                                     | Maceta de la ilustración y temperatura                            |
| `danger-500`                         | `#D64545`                                     | Errores                                                           |
| `ink` / `muted` / `line` / `surface` | `#17261F` / `#5B6B63` / `#D5E3DC` / `#F2F7F4` | Texto, bordes y superficies                                       |

### Guía de Instalación

#### Despliegue en un comando

La imagen es pública: `ghcr.io/smartpottech/smartpot-web`. La plataforma completa, con este servicio incluido, se levanta con un solo comando y sin descargar el código:

```bash
curl -fsSL https://raw.githubusercontent.com/SmartPotTech/.github/main/docker/demo/compose.yaml | docker compose -f - up -d --wait
```

Abre http://localhost:5173 e ingresa con `demo@smartpot.app` / `SmartPot2026`. Se detiene con `docker compose -p smartpot-demo down` (con `-v` borra también los datos).

#### Desarrollo y Calidad

```bash
bun install
bun run dev
bun run lint
bun run typecheck
bun run test
bun run build
```

### Documentación y Licencia

Su documentación propia está en [`docs/`](docs/SmartPot_Web_Solid_Documentation.md) (también en [DOCX](docs/SmartPot_Web_Solid_Documentation.docx) y [PDF](docs/SmartPot_Web_Solid_Documentation.pdf)), con sus diagramas en [`docs/diagrams`](docs/diagrams). Este proyecto está bajo la licencia [MIT](LICENSE).
