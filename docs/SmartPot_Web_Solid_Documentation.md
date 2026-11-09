<!-- portada
eyebrow: Component Technical Documentation
titulo: SmartPot-Web
acento: Web
subtitulo: Next-Generation Progressive Web Application
bajada: Installable SolidJS PWA without Virtual DOM: overview dashboard, native SVG charts, conditional ETag revalidation, live SSE streaming, real and virtual crops, reactive SVG crop scene, AI assistant, control, continuous learning, alerts, Telegram, MCP connections, dark mode, and full English/Spanish i18n.
documento: SmartPot-Web Documentation
version: 1.1 · November 2026
equipo: SmartPotTech
proyecto: smartpot.app
-->

# SmartPot-Web

[English](#1-purpose) | [Español](#9-propósito-español)

<!-- parte: PART I | Component Overview -->

## 1. Purpose

### Document Sheet

| Field                  | Value                                                                                                                                                                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Project                | SmartPot · [smartpot.app](https://smartpot.app)                                                                                                                                                                                                                                                              |
| Component              | [SmartPot-Web](https://github.com/SmartPotTech/SmartPot-Web)                                                                                                                                                                                                                                                 |
| Version                | 1.1 · November 2026                                                                                                                                                                                                                                                                                          |
| Scope                  | Reactive SolidJS architecture, screens, native SVG charts, crop creation, live SVG crop scene, cross-tab `HttpOnly` cookie session + CSRF, `ETag` cache, bilingual i18n (`en`/`es`), dark mode, web security, configuration, and tests                                                                     |
| Platform Documentation | [Migration Documentation](https://github.com/SmartPotTech/.github/blob/main/docs/SmartPot_Migration.md), [Technical Documentation](https://github.com/SmartPotTech/.github/blob/main/docs/SmartPot_Technical_Documentation.md), and [Project Journey](https://github.com/SmartPotTech/.github/blob/main/docs/SmartPot_Project_Journey.md) |
| Maintenance            | Generated from `docs/` in this repository using `.github/docs/tools`; updated alongside component changes                                                                                                                                                                                                    |

### In Plain Terms

`SmartPot-Web` is the Progressive Web Application (PWA) of SmartPot, built with **SolidJS + TypeScript + Vite**. It displays every crop live, compares sensor readings against the ideal range for its species, lets users create real or virtual crops, send actuator commands, and inspect what the AI assistant diagnoses and learns, while minimizing bundle size and browser work via fine-grained reactivity without a Virtual DOM, native SVG charts, live SSE streaming with LTTB downsampling, conditional `ETag` revalidation, dark mode, and full bilingual support (**English and Spanish**).

| Screen                        | Capabilities                                                                                                                                                                           |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Public Landing                | Product overview, features, supported species, and FAQ; search-engine indexable                                                                                                        |
| Overview Dashboard            | Health ranking of every crop, single-metric comparison in native SVG, latest readings table, and AI fleet analysis across the account                                                  |
| My Crops                      | Crop cards with kind, species, form, device status, and health; step-by-step creation wizard                                                                                           |
| Crop Detail                   | Live SVG illustration of the crop in its placement above all tabs: summary, AI assistant with placement advice, switch controls, history, device (real) or simulation (virtual), settings |
| General Control & Actions     | Automatic mode and bulk commands; AI-suggested fleet actions and command history                                                                                                       |
| Learning, Alerts & Profile    | Continuous AI learning metrics, notifications, Applications (Telegram), personal MCP connections (`spt_...`), profile data, and password                                               |

## 2. Component Architecture

<!-- diagrama: SmartPot_Web_Solid_Global_Component | titulo=SmartPot-Web Internal Architecture | lamina=H -->

```mermaid
%%{init: {"theme": "base", "fontFamily": "Segoe UI, Arial, sans-serif", "themeVariables": {"fontFamily": "Segoe UI, Arial, sans-serif", "fontSize": "15px", "primaryColor": "#DDF5EA", "primaryTextColor": "#17261F", "primaryBorderColor": "#067A52", "secondaryColor": "#E3F2FB", "secondaryTextColor": "#17261F", "secondaryBorderColor": "#1F6FA0", "tertiaryColor": "#F2F7F4", "tertiaryTextColor": "#17261F", "tertiaryBorderColor": "#D5E3DC", "lineColor": "#5B6B63", "textColor": "#17261F", "mainBkg": "#DDF5EA", "nodeBorder": "#067A52", "clusterBkg": "#F7FAF8", "clusterBorder": "#D5E3DC", "edgeLabelBackground": "#FFFFFF", "actorBkg": "#067A52", "actorBorder": "#0B3D2B", "actorTextColor": "#FFFFFF", "actorLineColor": "#5B6B63", "signalColor": "#17261F", "signalTextColor": "#17261F", "labelBoxBkgColor": "#0B3D2B", "labelBoxBorderColor": "#0B3D2B", "labelTextColor": "#FFFFFF", "loopTextColor": "#0B3D2B", "noteBkgColor": "#FDF4DD", "noteBorderColor": "#C98D12", "noteTextColor": "#17261F", "activationBkgColor": "#DDF5EA", "activationBorderColor": "#067A52", "attributeBackgroundColorOdd": "#FFFFFF", "attributeBackgroundColorEven": "#F2F7F4"}, "layout": "elk", "elk": {"nodePlacementStrategy": "BRANDES_KOEPF", "mergeEdges": false, "cycleBreakingStrategy": "GREEDY"}}}%%
flowchart LR
  browser["Web Browser / PWA Client"]
  subgraph nginx["Unprivileged Nginx Container · port 80"]
    direction TB
    static["Static Assets<br/>dist/ · precompressed gzip & brotli"]
    csp["Security Headers<br/>CSP · HSTS · Referrer-Policy"]
  end
  subgraph solid["SolidJS Application Architecture"]
    direction TB
    shell["AppShell & Router<br/>hash routing · lazy views"]
    state["Signals & Resources<br/>session · crops · telemetry · theme · i18n"]
    scene["Reactive SVG CropScene<br/>dynamic plant illustration & actuators"]
    sse["SSE Realtime Client<br/>HTTP/2 streaming · reconnect backoff"]
  end
  api["SmartPot-API<br/>:8091"]
  browser -->|"HTTPS GET /"| nginx
  nginx --> static
  static --> solid
  solid -->|"REST + HttpOnly Cookie"| api
  solid -->|"SSE Telemetry Stream"| api
  classDef leaf fill:#DDF5EA,stroke:#067A52,color:#17261F
  classDef water fill:#E3F2FB,stroke:#1F6FA0,color:#17261F
  classDef sun fill:#FDF4DD,stroke:#C98D12,color:#17261F
  classDef clay fill:#FBE9E1,stroke:#B85A38,color:#17261F
  classDef core fill:#067A52,stroke:#0B3D2B,color:#FFFFFF
  classDef deep fill:#0B3D2B,stroke:#06281C,color:#FFFFFF
  classDef muted fill:#F2F7F4,stroke:#5B6B63,color:#17261F
  class browser,api core
  class nginx,static,csp deep
  class solid,shell,state,scene,sse leaf
```

Each domain feature lives in `src/features/<feature>` with its pages, components, and tests. `lib/api` is the single gateway to the API: it sends requests with `credentials: "include"` and `X-CSRF-Token`, manages the conditional `ETag` cache, maps errors to localized `ApiError` instances (`en`/`es`), and declares response types. `useResource` loads and refreshes SolidJS signals while the tab is visible.

<!-- parte: PART II | Crops and Live Scene -->

## 3. Creating a Crop

<!-- diagrama: SmartPot_Web_Solid_01_Crop_Creation_Flow | titulo=Crop Creation Flow -->

```mermaid
%%{init: {"theme": "base", "fontFamily": "Segoe UI, Arial, sans-serif", "themeVariables": {"fontFamily": "Segoe UI, Arial, sans-serif", "fontSize": "15px", "primaryColor": "#DDF5EA", "primaryTextColor": "#17261F", "primaryBorderColor": "#067A52", "secondaryColor": "#E3F2FB", "secondaryTextColor": "#17261F", "secondaryBorderColor": "#1F6FA0", "tertiaryColor": "#F2F7F4", "tertiaryTextColor": "#17261F", "tertiaryBorderColor": "#D5E3DC", "lineColor": "#5B6B63", "textColor": "#17261F", "mainBkg": "#DDF5EA", "nodeBorder": "#067A52", "clusterBkg": "#F7FAF8", "clusterBorder": "#D5E3DC", "edgeLabelBackground": "#FFFFFF", "actorBkg": "#067A52", "actorBorder": "#0B3D2B", "actorTextColor": "#FFFFFF", "actorLineColor": "#5B6B63", "signalColor": "#17261F", "signalTextColor": "#17261F", "labelBoxBkgColor": "#0B3D2B", "labelBoxBorderColor": "#0B3D2B", "labelTextColor": "#FFFFFF", "loopTextColor": "#0B3D2B", "noteBkgColor": "#FDF4DD", "noteBorderColor": "#C98D12", "noteTextColor": "#17261F", "activationBkgColor": "#DDF5EA", "activationBorderColor": "#067A52", "attributeBackgroundColorOdd": "#FFFFFF", "attributeBackgroundColorEven": "#F2F7F4"}}}%%
flowchart TB
  start(["My Crops › New Crop"]) --> kind{"Step 1 · Real or virtual?<br/>notice: cannot be changed later"}
  kind -->|"Real"| details["Step 2 · Name, species, and form<br/>pot · NFT channels · tower · raft<br/>preview with pump, UV light, and fan"]
  kind -->|"Virtual"| detailsv["Step 2 · Name, species, and form<br/>preview with all six actuators"]
  detailsv --> mode{"How does simulation start?"}
  mode -->|"Day & Night"| postv
  mode -->|"Real Weather"| place["Search location or use device GPS<br/>(dedicated dialog)"] --> postv
  mode -->|"Manual"| postv["POST /crops · kind VIRTUAL"]
  details --> post["POST /crops · kind REAL"]
  post --> guide["Step 3 · Connect device<br/>device key displayed once<br/>Physical ESP32 or Wokwi with config.json"]
  guide --> live(["Crop detail view<br/>with reactive illustration"])
  postv --> live
  classDef leaf fill:#DDF5EA,stroke:#067A52,color:#17261F
  classDef water fill:#E3F2FB,stroke:#1F6FA0,color:#17261F
  classDef sun fill:#FDF4DD,stroke:#C98D12,color:#17261F
  classDef clay fill:#FBE9E1,stroke:#B85A38,color:#17261F
  classDef core fill:#067A52,stroke:#0B3D2B,color:#FFFFFF
  classDef deep fill:#0B3D2B,stroke:#06281C,color:#FFFFFF
  classDef muted fill:#F2F7F4,stroke:#5B6B63,color:#17261F
  class start,live core
```

| Decision   | Detail                                                                                                                                                             |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Kind       | Real (an ESP32 running the firmware, physical or in Wokwi) or Virtual (simulated by SmartPot). Cannot be changed later; Settings explains how to create another    |
| Form       | Pot, NFT tubes, vertical tower, or floating raft; can be changed in Settings and updates the live illustration                                                     |
| Placement  | Indoor or outdoor, sun exposure, and city/coordinates; editable in Settings                                                                                        |
| Preview    | Live SVG crop scene with the selected species, form, and initial actuators                                                                                         |
| Real       | Displays the device key once along with the wiring guide, firmware repository, and ready-to-copy `config.json` with WiFi and embedded Broker CA (`/ca.crt`)        |
| Virtual    | Day/night cycle, real local weather, or manual sliders; opens the crop with full simulation controls in the Simulation tab                                         |

## 4. Reactive Crop Illustration and Native SVG Charts

<!-- diagrama: SmartPot_Web_Solid_02_Live_Scene | titulo=Dynamic Scene Rendering Engine | lamina=H -->

```mermaid
%%{init: {"theme": "base", "fontFamily": "Segoe UI, Arial, sans-serif", "themeVariables": {"fontFamily": "Segoe UI, Arial, sans-serif", "fontSize": "15px", "primaryColor": "#DDF5EA", "primaryTextColor": "#17261F", "primaryBorderColor": "#067A52", "secondaryColor": "#E3F2FB", "secondaryTextColor": "#17261F", "secondaryBorderColor": "#1F6FA0", "tertiaryColor": "#F2F7F4", "tertiaryTextColor": "#17261F", "tertiaryBorderColor": "#D5E3DC", "lineColor": "#5B6B63", "textColor": "#17261F", "mainBkg": "#DDF5EA", "nodeBorder": "#067A52", "clusterBkg": "#F7FAF8", "clusterBorder": "#D5E3DC", "edgeLabelBackground": "#FFFFFF", "actorBkg": "#067A52", "actorBorder": "#0B3D2B", "actorTextColor": "#FFFFFF", "actorLineColor": "#5B6B63", "signalColor": "#17261F", "signalTextColor": "#17261F", "labelBoxBkgColor": "#0B3D2B", "labelBoxBorderColor": "#0B3D2B", "labelTextColor": "#FFFFFF", "loopTextColor": "#0B3D2B", "noteBkgColor": "#FDF4DD", "noteBorderColor": "#C98D12", "noteTextColor": "#17261F", "activationBkgColor": "#DDF5EA", "activationBorderColor": "#067A52", "attributeBackgroundColorOdd": "#FFFFFF", "attributeBackgroundColorEven": "#F2F7F4"}}}%%
flowchart LR
  subgraph data["SolidJS Reactive Signals · refresh 5 to 20 s"]
    direction TB
    crop["crop()<br/>kind · form · type · health<br/>device.online · latestReading"]
    acts["actuators()<br/>active"]
    cmds["commands()<br/>executed timed commands"]
    simd["virtual-device()<br/>virtual crops only: weather, state,<br/>and simulator actuators"]
  end
  subgraph live["live.ts + createMemo"]
    direction TB
    status["liveStatus<br/>live · waiting · offline · paused · unavailable"]
    running["runningActuators<br/>indefinite or timed active state"]
    day["isDaylight<br/>weather · measured light · time"]
    vigor["vigorOf<br/>color mapped to health"]
  end
  empty["Empty placeholder<br/>see connection guide<br/>or switch to simulation"]
  subgraph scene["CropScene · Reactive SVG 360 × 220"]
    direction TB
    backdrop["Backdrop<br/>indoor window or local weather<br/>partial shade or outdoor tree"]
    system["System Form<br/>PotSystem · NftSystem<br/>TowerSystem · RaftSystem"]
    actrender["Actuator Overlays<br/>water pump · UV light<br/>fan · humidifier"]
    badge["Health Badge<br/>color and icon"]
  end
  data --> live
  live --> scene
  status -.->|"unavailable"| empty
  classDef leaf fill:#DDF5EA,stroke:#067A52,color:#17261F
  classDef water fill:#E3F2FB,stroke:#1F6FA0,color:#17261F
  classDef sun fill:#FDF4DD,stroke:#C98D12,color:#17261F
  classDef clay fill:#FBE9E1,stroke:#B85A38,color:#17261F
  classDef core fill:#067A52,stroke:#0B3D2B,color:#FFFFFF
  classDef deep fill:#0B3D2B,stroke:#06281C,color:#FFFFFF
  classDef muted fill:#F2F7F4,stroke:#5B6B63,color:#17261F
  class crop,acts,cmds,simd water
  class status,running,day,vigor leaf
  class backdrop,system,actrender,badge sun
  class empty muted
```

| Element            | Visual Representation                                                                                                                                                    |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Pot                | Reservoir with water pump, drip tube feeding the substrate, and nutrient/pH dosers on the lid                                                                            |
| NFT Tubes          | Three channels with four plants each, inlet manifold, and return line; nutrient film flows when the pump is active                                                       |
| Vertical Tower     | Column with staggered pockets; pump lifts the solution and droplets cascade inside                                                                                       |
| Floating Raft      | Deep-water basin with floating raft, submerged roots, and rising air-stone bubbles                                                                                       |
| UV Grow Light      | Overhead LED bar; illuminates the canopy when active                                                                                                                     |
| Fan & Humidifier   | Spinning blades with airflow lines; rising mist plume                                                                                                                    |
| Plants             | Species-accurate geometry (rosette lettuce, broadleaf spinach, paired basil leaves, staked tomato with flowers/fruit, strawberry, bell pepper) colored by health vigor   |

## 5. Session, Conditional ETag Cache, Internationalization, and Security

<!-- diagrama: SmartPot_Web_Solid_03_Session_And_Cache | titulo=Session Lifecycle and Offline Storage -->

```mermaid
%%{init: {"theme": "base", "fontFamily": "Segoe UI, Arial, sans-serif", "themeVariables": {"fontFamily": "Segoe UI, Arial, sans-serif", "fontSize": "15px", "primaryColor": "#DDF5EA", "primaryTextColor": "#17261F", "primaryBorderColor": "#067A52", "secondaryColor": "#E3F2FB", "secondaryTextColor": "#17261F", "secondaryBorderColor": "#1F6FA0", "tertiaryColor": "#F2F7F4", "tertiaryTextColor": "#17261F", "tertiaryBorderColor": "#D5E3DC", "lineColor": "#5B6B63", "textColor": "#17261F", "mainBkg": "#DDF5EA", "nodeBorder": "#067A52", "clusterBkg": "#F7FAF8", "clusterBorder": "#D5E3DC", "edgeLabelBackground": "#FFFFFF", "actorBkg": "#067A52", "actorBorder": "#0B3D2B", "actorTextColor": "#FFFFFF", "actorLineColor": "#5B6B63", "signalColor": "#17261F", "signalTextColor": "#17261F", "labelBoxBkgColor": "#0B3D2B", "labelBoxBorderColor": "#0B3D2B", "labelTextColor": "#FFFFFF", "loopTextColor": "#0B3D2B", "noteBkgColor": "#FDF4DD", "noteBorderColor": "#C98D12", "noteTextColor": "#17261F", "activationBkgColor": "#DDF5EA", "activationBorderColor": "#067A52", "attributeBackgroundColorOdd": "#FFFFFF", "attributeBackgroundColorEven": "#F2F7F4"}}}%%
flowchart TB
  login(["User Sign In"]) --> auth["POST /api/v1/auth/login"]
  auth --> cookies["Cookie: smartpot_session (HttpOnly; Secure; SameSite=Lax)<br/>Cookie: smartpot_csrf (HMAC-SHA256 signature)"]
  cookies --> sync["Multi-tab sync via BroadcastChannel('smartpot_session')"]
  sync --> client["lib/api/client<br/>credentials: 'include'<br/>Header: X-CSRF-Token + If-None-Match"]
  client --> api["SmartPot-API"]
  api -->|"200 OK + ETag"| cache["In-memory LTTB Cache"]
  api -->|"304 Not Modified"| useCache["Reuse cached series"]
  api -->|"401 Unauthorized"| signout(["Sign out & notify all tabs via BroadcastChannel"])
  classDef leaf fill:#DDF5EA,stroke:#067A52,color:#17261F
  classDef water fill:#E3F2FB,stroke:#1F6FA0,color:#17261F
  classDef sun fill:#FDF4DD,stroke:#C98D12,color:#17261F
  classDef clay fill:#FBE9E1,stroke:#B85A38,color:#17261F
  classDef core fill:#067A52,stroke:#0B3D2B,color:#FFFFFF
  classDef deep fill:#0B3D2B,stroke:#06281C,color:#FFFFFF
  classDef muted fill:#F2F7F4,stroke:#5B6B63,color:#17261F
  class login,signout core
  class auth,client,api water
  class cookies,sync,cache,useCache leaf
```

| Control               | Detail                                                                                                                                                                 |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CSP & CORP            | `script-src 'self'`, `style-src 'self'`, `connect-src` restricted to the API, and `Cross-Origin-Resource-Policy: same-origin`                                          |
| Security Headers      | `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, and `Permissions-Policy` (geolocation restricted to same-origin and explicit user action)                       |
| `ETag` Revalidation   | Client sends `If-None-Match` on `GET` requests; `SmartPot-API` replies `304 Not Modified` when unchanged and invalidates cache on any write                            |
| Session & CSRF        | `HttpOnly` cookie (`smartpot_session`) + signed double-submit CSRF token (`smartpot_csrf` / `X-CSRF-Token`), synchronized across tabs via `BroadcastChannel`           |
| Bilingual (`en`/`es`) | Reactive dictionary (`src/lib/i18n/en.ts`, `es.ts`) and dynamic API/AI message translation (`serverText.ts`) so the entire UI switches languages instantaneously       |
| Device Key            | Displayed only once upon real crop creation or key rotation                                                                                                            |

## 6. Configuration

| Variable       | Location              | Purpose                                                                                             |
|----------------|-----------------------|-----------------------------------------------------------------------------------------------------|
| `VITE_API_URL` | `.env` in development | Target API URL for `bun run dev`                                                                    |
| `API_URL`      | Container runtime     | Injected at startup into `/config.js` and the Nginx CSP header so a single image runs in any env    |
| `MCP_URL`      | Container runtime     | Optional public URL of `SmartPot-MCP` shown when generating MCP client snippets in Profile          |

## 7. Testing

Run `bun run lint`, `bun run typecheck`, `bun run test`, and `bun run build`. The Vitest and `@solidjs/testing-library` suite covers the HTTP client, `ETag` revalidation (`304 Not Modified`), `HttpOnly` session and CSRF flow, form validations, login, crop components, actuator switches, AI insights, continuous learning, Telegram channels, MCP connections, live SVG scenes, dark mode, `es`/`en` internationalization, and SEO/PWA compliance.

## 8. Operations

| Task          | Command / Mechanism                                                                                      |
|---------------|----------------------------------------------------------------------------------------------------------|
| Docker Image  | `ghcr.io/smartpottech/smartpot-web`: compiled with Bun Alpine and served by unprivileged Nginx           |
| `demo-beta`   | Runs as `web-smartpot` in `.github/docker/demo-beta/compose.yaml`                                        |
| Icons         | `bun run icons` regenerates all PWA PNG icons and Open Graph images from SVG sources                     |
| Browser Cache | Service worker version bump replaces the cached app shell on reload                                      |
