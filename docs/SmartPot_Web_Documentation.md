<!-- portada
eyebrow: Documentación del componente
titulo: SmartPot-Web
acento: Web
subtitulo: La aplicación de SmartPot
bajada: PWA instalable: panel general, creación de cultivos reales o virtuales, ilustración de cada cultivo con su especie y sus actuadores, asistente de IA, control, aprendizaje, alertas y Telegram, con su seguridad, configuración y pruebas.
documento: SmartPot-Web
version: 1.0 · septiembre 2026
equipo: SmartPotTech
proyecto: smartpot.app
-->

# SmartPot-Web

## Ficha del documento

| Campo | Valor |
| --- | --- |
| Proyecto | SmartPot · [smartpot.app](https://smartpot.app) |
| Componente | [SmartPot-Web](https://github.com/SmartPotTech/SmartPot-Web) |
| Versión | 1.0 · septiembre 2026 |
| Alcance | Pantallas, creación de cultivos, ilustración del cultivo, sesión, caché, identidad visual, seguridad web, configuración y pruebas |
| Documentación de la plataforma | [Documentación técnica](https://github.com/SmartPotTech/.github/blob/main/docs/SmartPot_Technical_Documentation.md), [recorrido del proyecto](https://github.com/SmartPotTech/.github/blob/main/docs/SmartPot_Project_Journey.md), [ciclo de vida](https://github.com/SmartPotTech/.github/blob/main/docs/SmartPot_Software_Lifecycle.md) y [diagramas generales](https://github.com/SmartPotTech/.github/blob/main/docs/README.md#diagramas-generales) |
| Mantenimiento | Se genera desde `docs/` de este repositorio con las herramientas de `.github/docs/tools`; se actualiza con cada cambio del componente |

<!-- parte: PARTE I | El componente -->

## 1. Propósito

### En palabras simples

SmartPot-Web es lo que ve la persona: una página pública que explica SmartPot y, tras ingresar, una aplicación que se instala en el teléfono o el computador. Muestra cada cultivo en vivo, lo compara con el rango ideal de su especie, deja crear cultivos reales o virtuales, dar órdenes a los actuadores y ver qué piensa y qué aprende el asistente. Todo lo que muestra viene de la API.

| Pantalla | Qué permite |
| --- | --- |
| Inicio público | Presentación, funciones, especies y preguntas frecuentes; indexable |
| Panel general | Salud de cada cultivo, comparación de una variable, últimas lecturas y análisis de la IA de toda la cuenta |
| Mis cultivos | Tarjetas con tipo, especie, forma, estado y salud; asistente de creación |
| Detalle | La ilustración del cultivo sobre todas las secciones: resumen, asistente IA, control, historial, dispositivo (reales) o simulación (virtuales) y ajustes |
| Control general y acciones | Modo automático y órdenes en bloque; sugerencias e historial de órdenes |
| Aprendizaje, alertas y perfil | Lo que aprende la IA, notificaciones, Telegram, datos y contraseña |

## 2. Arquitectura del componente

<!-- diagrama: SmartPot_Web_Global_Component | titulo=SmartPot-Web por dentro | lamina=H -->
```mermaid
%%{init: {"theme": "base", "fontFamily": "Segoe UI, Arial, sans-serif", "themeVariables": {"fontFamily": "Segoe UI, Arial, sans-serif", "fontSize": "15px", "primaryColor": "#DDF5EA", "primaryTextColor": "#17261F", "primaryBorderColor": "#067A52", "secondaryColor": "#E3F2FB", "secondaryTextColor": "#17261F", "secondaryBorderColor": "#1F6FA0", "tertiaryColor": "#F2F7F4", "tertiaryTextColor": "#17261F", "tertiaryBorderColor": "#D5E3DC", "lineColor": "#5B6B63", "textColor": "#17261F", "mainBkg": "#DDF5EA", "nodeBorder": "#067A52", "clusterBkg": "#F7FAF8", "clusterBorder": "#D5E3DC", "edgeLabelBackground": "#FFFFFF", "actorBkg": "#067A52", "actorBorder": "#0B3D2B", "actorTextColor": "#FFFFFF", "actorLineColor": "#5B6B63", "signalColor": "#17261F", "signalTextColor": "#17261F", "labelBoxBkgColor": "#0B3D2B", "labelBoxBorderColor": "#0B3D2B", "labelTextColor": "#FFFFFF", "loopTextColor": "#0B3D2B", "noteBkgColor": "#FDF4DD", "noteBorderColor": "#C98D12", "noteTextColor": "#17261F", "activationBkgColor": "#DDF5EA", "activationBorderColor": "#067A52", "attributeBackgroundColorOdd": "#FFFFFF", "attributeBackgroundColorEven": "#F2F7F4"}, "layout": "elk", "elk": {"nodePlacementStrategy": "BRANDES_KOEPF", "mergeEdges": false, "cycleBreakingStrategy": "GREEDY"}}}%%
flowchart LR
  person(["Persona<br/>navegador o PWA instalada"])
  subgraph imagen["Imagen smartpot-web · nginx sin privilegios"]
    direction TB
    nginx["nginx<br/>CSP · X-Frame-Options · Permissions-Policy<br/>API_URL → /config.js y connect-src"]
    sw["sw.js<br/>app shell y recursos con hash<br/>la API nunca en caché"]
  end
  subgraph app["src · React 19 + TypeScript"]
    direction TB
    router["app · React Router 7<br/>landing pública · /app protegida"]
    auth["features/auth<br/>sesión · ingreso · registro · recuperación"]
    overview["features/overview · control · actions<br/>panel general · órdenes en bloque · historial"]
    crops["features/crops<br/>CreateCropDialog · CropHero · CropScene<br/>SimulationPanel · ConnectionGuide · DevicePanel"]
    learning["features/learning · notifications · profile<br/>aprendizaje · alertas · Telegram"]
    landing["features/landing · pwa<br/>FAQ · instalación"]
    lib["lib<br/>api/client · services · types<br/>catalog · format"]
  end
  api["SmartPot-API<br/>/api/v1"]
  person --> nginx --> router
  sw -.-> router
  router --> auth & overview & crops & learning & landing
  auth & overview & crops & learning --> lib
  lib -->|"fetch + Bearer JWT"| api
  classDef leaf fill:#DDF5EA,stroke:#067A52,color:#17261F
  classDef water fill:#E3F2FB,stroke:#1F6FA0,color:#17261F
  classDef sun fill:#FDF4DD,stroke:#C98D12,color:#17261F
  classDef clay fill:#FBE9E1,stroke:#B85A38,color:#17261F
  classDef core fill:#067A52,stroke:#0B3D2B,color:#FFFFFF
  classDef deep fill:#0B3D2B,stroke:#06281C,color:#FFFFFF
  classDef muted fill:#F2F7F4,stroke:#5B6B63,color:#17261F
  class person,api water
  class nginx,sw sun
  class router core
  class auth,overview,crops,learning,landing leaf
  class lib muted
```

Cada función vive en `src/features/<función>` con sus páginas, componentes y pruebas. `lib/api` es el único lugar que habla con la API: arma las peticiones con el token, traduce los errores a `ApiError` en español y declara los tipos de cada respuesta. `useResource` carga y refresca los datos mientras la pestaña está visible.

<!-- parte: PARTE II | Cultivos -->

## 3. Crear un cultivo

<!-- diagrama: SmartPot_Web_01_Crop_Creation_Flow | titulo=Asistente para crear un cultivo -->
```mermaid
%%{init: {"theme": "base", "fontFamily": "Segoe UI, Arial, sans-serif", "themeVariables": {"fontFamily": "Segoe UI, Arial, sans-serif", "fontSize": "15px", "primaryColor": "#DDF5EA", "primaryTextColor": "#17261F", "primaryBorderColor": "#067A52", "secondaryColor": "#E3F2FB", "secondaryTextColor": "#17261F", "secondaryBorderColor": "#1F6FA0", "tertiaryColor": "#F2F7F4", "tertiaryTextColor": "#17261F", "tertiaryBorderColor": "#D5E3DC", "lineColor": "#5B6B63", "textColor": "#17261F", "mainBkg": "#DDF5EA", "nodeBorder": "#067A52", "clusterBkg": "#F7FAF8", "clusterBorder": "#D5E3DC", "edgeLabelBackground": "#FFFFFF", "actorBkg": "#067A52", "actorBorder": "#0B3D2B", "actorTextColor": "#FFFFFF", "actorLineColor": "#5B6B63", "signalColor": "#17261F", "signalTextColor": "#17261F", "labelBoxBkgColor": "#0B3D2B", "labelBoxBorderColor": "#0B3D2B", "labelTextColor": "#FFFFFF", "loopTextColor": "#0B3D2B", "noteBkgColor": "#FDF4DD", "noteBorderColor": "#C98D12", "noteTextColor": "#17261F", "activationBkgColor": "#DDF5EA", "activationBorderColor": "#067A52", "attributeBackgroundColorOdd": "#FFFFFF", "attributeBackgroundColorEven": "#F2F7F4"}}}%%
flowchart TB
  start(["Mis cultivos › Nuevo cultivo"]) --> kind{"Paso 1 · ¿Real o virtual?<br/>aviso: no se puede cambiar después"}
  kind -->|"Real"| details["Paso 2 · nombre, especie y forma<br/>maceta · tubos NFT · torre · balsa<br/>vista previa con la bomba, la luz y el ventilador"]
  kind -->|"Virtual"| detailsv["Paso 2 · nombre, especie y forma<br/>vista previa con los seis actuadores"]
  detailsv --> mode{"¿Cómo empieza la simulación?"}
  mode -->|"Día y noche"| postv
  mode -->|"Clima real"| place["Buscar el lugar o usar la ubicación<br/>(formulario aparte)"] --> postv
  mode -->|"Manual"| postv["POST /crops · kind VIRTUAL · virtual"]
  details --> post["POST /crops · kind REAL"]
  post --> guide["Paso 3 · Conecta tu dispositivo<br/>clave mostrada una sola vez<br/>ESP32 físico o Wokwi con su config.py"]
  guide --> live(["Detalle del cultivo<br/>con su ilustración"])
  postv --> live
  classDef leaf fill:#DDF5EA,stroke:#067A52,color:#17261F
  classDef water fill:#E3F2FB,stroke:#1F6FA0,color:#17261F
  classDef sun fill:#FDF4DD,stroke:#C98D12,color:#17261F
  classDef clay fill:#FBE9E1,stroke:#B85A38,color:#17261F
  classDef core fill:#067A52,stroke:#0B3D2B,color:#FFFFFF
  classDef deep fill:#0B3D2B,stroke:#06281C,color:#FFFFFF
  classDef muted fill:#F2F7F4,stroke:#5B6B63,color:#17261F
  class start,live core
  class kind,mode sun
  class details,detailsv,place leaf
  class post,postv water
  class guide clay
```

| Decisión | Detalle |
| --- | --- |
| Tipo | Real (un ESP32 con el firmware, físico o en Wokwi) o virtual (lo simula SmartPot). No cambia después; Ajustes lo muestra y explica cómo crear otro |
| Forma | Maceta, tubos NFT, torre vertical o balsa flotante; se puede cambiar en Ajustes y solo afecta la ilustración |
| Vista previa | La escena del cultivo con la especie y la forma elegidas y los actuadores con los que nace |
| Real | Muestra la clave una sola vez y la guía: circuito y pines, firmware y `config.py` con la red WiFi, o el proyecto de Wokwi con la red `Wokwi-GUEST` |
| Virtual | Día y noche, clima real (buscador de lugares o ubicación del dispositivo) o manual; abre el cultivo y su configuración queda en la pestaña Simulación |

## 4. Ilustración del cultivo

<!-- diagrama: SmartPot_Web_02_Live_Scene | titulo=Cómo se dibuja la ilustración del cultivo | lamina=H -->
```mermaid
%%{init: {"theme": "base", "fontFamily": "Segoe UI, Arial, sans-serif", "themeVariables": {"fontFamily": "Segoe UI, Arial, sans-serif", "fontSize": "15px", "primaryColor": "#DDF5EA", "primaryTextColor": "#17261F", "primaryBorderColor": "#067A52", "secondaryColor": "#E3F2FB", "secondaryTextColor": "#17261F", "secondaryBorderColor": "#1F6FA0", "tertiaryColor": "#F2F7F4", "tertiaryTextColor": "#17261F", "tertiaryBorderColor": "#D5E3DC", "lineColor": "#5B6B63", "textColor": "#17261F", "mainBkg": "#DDF5EA", "nodeBorder": "#067A52", "clusterBkg": "#F7FAF8", "clusterBorder": "#D5E3DC", "edgeLabelBackground": "#FFFFFF", "actorBkg": "#067A52", "actorBorder": "#0B3D2B", "actorTextColor": "#FFFFFF", "actorLineColor": "#5B6B63", "signalColor": "#17261F", "signalTextColor": "#17261F", "labelBoxBkgColor": "#0B3D2B", "labelBoxBorderColor": "#0B3D2B", "labelTextColor": "#FFFFFF", "loopTextColor": "#0B3D2B", "noteBkgColor": "#FDF4DD", "noteBorderColor": "#C98D12", "noteTextColor": "#17261F", "activationBkgColor": "#DDF5EA", "activationBorderColor": "#067A52", "attributeBackgroundColorOdd": "#FFFFFF", "attributeBackgroundColorEven": "#F2F7F4"}}}%%
flowchart LR
  subgraph datos["Datos · refresco cada 5 a 20 s"]
    direction TB
    crop["crop<br/>kind · form · type · health<br/>device.online · latestReading"]
    acts["actuators<br/>active"]
    cmds["commands<br/>órdenes por tiempo ejecutadas"]
    simd["virtual-device<br/>solo virtuales: clima, estado<br/>y actuadores del simulador"]
  end
  subgraph live["live.ts"]
    direction TB
    status["liveStatus<br/>live · waiting · offline · paused · unavailable"]
    running["runningActuators<br/>encendidos sin límite o por tiempo"]
    day["isDaylight<br/>clima · luz medida · hora"]
    vigor["vigorOf<br/>color según la salud"]
  end
  empty["Aviso sin ilustración<br/>ver cómo conectarlo<br/>o ir a Simulación"]
  subgraph scene["CropScene · SVG 360 × 220"]
    direction TB
    backdrop["Backdrop<br/>interior o clima del lugar"]
    system["Forma<br/>PotSystem · NftSystem<br/>TowerSystem · RaftSystem"]
    plant["Plant<br/>lechuga · espinaca · albahaca<br/>tomate · fresa · pimentón"]
    equip["Equipment<br/>WaterPump · GrowLight · Fan<br/>Humidifier · Doser"]
  end
  crop --> status & day & vigor
  simd --> status & day & running
  acts & cmds --> running
  status -->|"offline · paused · unavailable"| empty
  status -->|"live · waiting"| scene
  running --> equip
  day --> backdrop
  vigor --> plant
  system --> plant & equip
  classDef leaf fill:#DDF5EA,stroke:#067A52,color:#17261F
  classDef water fill:#E3F2FB,stroke:#1F6FA0,color:#17261F
  classDef sun fill:#FDF4DD,stroke:#C98D12,color:#17261F
  classDef clay fill:#FBE9E1,stroke:#B85A38,color:#17261F
  classDef core fill:#067A52,stroke:#0B3D2B,color:#FFFFFF
  classDef deep fill:#0B3D2B,stroke:#06281C,color:#FFFFFF
  classDef muted fill:#F2F7F4,stroke:#5B6B63,color:#17261F
  class crop,acts,cmds,simd water
  class status,running,day,vigor sun
  class empty clay
  class backdrop,system,plant,equip leaf
```

| Pieza | Qué dibuja |
| --- | --- |
| Maceta | Depósito con la bomba, tubo que gotea sobre el sustrato y dosificadores sobre la tapa |
| Tubos NFT | Tres tubos con cuatro plantas cada uno, colector de entrada y retorno al depósito; la película de solución corre si la bomba está encendida |
| Torre vertical | Columna con bolsillos escalonados; la bomba sube la solución y cae en gotas por dentro |
| Balsa flotante | Estanque con la balsa, raíces en la solución y burbujas desde la piedra difusora |
| Luz de cultivo | Barra con LED; encendida ilumina las plantas |
| Ventilador y humidificador | Aspas que giran con corriente de aire; bruma que sube |
| Plantas | La especie tal como es: lechuga en roseta, espinaca de hoja ancha, albahaca de hojas pareadas, tomate con tutor, flores y frutos rojos, fresa con flor blanca y frutos, pimentón rojo y amarillo; las hojas con el color de su salud: verde sano, amarillento en riesgo, ocre crítico |

La escena usa la paleta de SmartPot, anuncia su contenido con `aria-label` (qué se ve y qué está encendido) y sus animaciones se detienen si la persona prefiere menos movimiento. Va encima de todas las secciones del detalle (`CropHero`). Junto a ella, cada actuador aparece como una etiqueta con su estado; no hay botones: las órdenes se dan en Control. Si el cultivo no está conectado no se ilustra: se explica cómo conectarlo (reales) o se lleva a la pestaña Simulación para reanudarla (virtuales). La configuración de la simulación (modo, lugar, medidores, frecuencia y pausa) vive en esa pestaña, que solo aparece en los cultivos virtuales.

<!-- parte: PARTE III | Operación -->

## 5. Sesión, caché y seguridad

<!-- diagrama: SmartPot_Web_03_Session_And_Cache | titulo=Sesión y caché de la PWA -->
```mermaid
%%{init: {"theme": "base", "fontFamily": "Segoe UI, Arial, sans-serif", "themeVariables": {"fontFamily": "Segoe UI, Arial, sans-serif", "fontSize": "15px", "primaryColor": "#DDF5EA", "primaryTextColor": "#17261F", "primaryBorderColor": "#067A52", "secondaryColor": "#E3F2FB", "secondaryTextColor": "#17261F", "secondaryBorderColor": "#1F6FA0", "tertiaryColor": "#F2F7F4", "tertiaryTextColor": "#17261F", "tertiaryBorderColor": "#D5E3DC", "lineColor": "#5B6B63", "textColor": "#17261F", "mainBkg": "#DDF5EA", "nodeBorder": "#067A52", "clusterBkg": "#F7FAF8", "clusterBorder": "#D5E3DC", "edgeLabelBackground": "#FFFFFF", "actorBkg": "#067A52", "actorBorder": "#0B3D2B", "actorTextColor": "#FFFFFF", "actorLineColor": "#5B6B63", "signalColor": "#17261F", "signalTextColor": "#17261F", "labelBoxBkgColor": "#0B3D2B", "labelBoxBorderColor": "#0B3D2B", "labelTextColor": "#FFFFFF", "loopTextColor": "#0B3D2B", "noteBkgColor": "#FDF4DD", "noteBorderColor": "#C98D12", "noteTextColor": "#17261F", "activationBkgColor": "#DDF5EA", "activationBorderColor": "#067A52", "attributeBackgroundColorOdd": "#FFFFFF", "attributeBackgroundColorEven": "#F2F7F4"}}}%%
flowchart TB
  login(["Ingreso"]) --> keep{"¿Mantener sesión iniciada?"}
  keep -->|"Sí"| local["JWT en localStorage"]
  keep -->|"No"| session["JWT en sessionStorage"]
  local & session --> request["lib/api/client<br/>Authorization: Bearer"]
  request --> resp{"Respuesta de la API"}
  resp -->|"401"| logout["Cierra la sesión y vuelve al ingreso"]
  resp -->|"4xx y 5xx"| error["ApiError con el mensaje en español"]
  resp -->|"2xx"| data["Datos a la pantalla"]
  subgraph sw["Service worker"]
    direction LR
    shell["App shell y recursos con hash<br/>desde caché"]
    net["API y /config.js<br/>siempre desde la red"]
  end
  request -.-> net
  classDef leaf fill:#DDF5EA,stroke:#067A52,color:#17261F
  classDef water fill:#E3F2FB,stroke:#1F6FA0,color:#17261F
  classDef sun fill:#FDF4DD,stroke:#C98D12,color:#17261F
  classDef clay fill:#FBE9E1,stroke:#B85A38,color:#17261F
  classDef core fill:#067A52,stroke:#0B3D2B,color:#FFFFFF
  classDef deep fill:#0B3D2B,stroke:#06281C,color:#FFFFFF
  classDef muted fill:#F2F7F4,stroke:#5B6B63,color:#17261F
  class login,data core
  class keep,resp sun
  class local,session,request leaf
  class logout,error clay
  class shell,net water
```

| Control | Detalle |
| --- | --- |
| CSP | `script-src 'self'`, `style-src 'self'`, `connect-src` limitado a la API |
| Cabeceras | `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` y `Permissions-Policy` (geolocalización solo del propio sitio y solo cuando la persona la pide) |
| Sesión | JWT en `sessionStorage`, o en `localStorage` con «Mantener sesión iniciada»; un 401 la cierra |
| Clave del dispositivo | Solo se muestra al crear un cultivo real o al rotarla |
| SEO | Metadatos, Open Graph, JSON-LD (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`), `robots.txt` y `sitemap.xml`; `/app` no se indexa |

## 6. Configuración

| Variable | Dónde | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `.env` en desarrollo | URL de la API para `pnpm dev` |
| `API_URL` | Contenedor | Se escribe al arrancar en `/config.js` y en la CSP: la misma imagen sirve para cualquier entorno |

Identidad visual: tokens de la paleta SmartPot en `src/styles/index.css`, tipografías Outfit e Inter servidas desde la app y una paleta categórica de 8 colores validada para daltonismo en las comparativas.

## 7. Pruebas

`pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`. Las 54 pruebas de Vitest y Testing Library cubren el cliente HTTP y sus errores, la sesión, las validaciones, el ingreso, los componentes del cultivo, el asistente con pronóstico y lo aprendido, la comparación de modelos, Telegram, el panel general, la ilustración del cultivo (formas, especies, actuadores, clima y conexión), la creación real o virtual, la guía de conexión y los requisitos de SEO y PWA.

## 8. Operación

| Tarea | Cómo |
| --- | --- |
| Imagen | `ghcr.io/smartpottech/smartpot-web`: nginx sin privilegios, solo lectura con `tmpfs` |
| Despliegue | Cada cambio en `main` pasa por el CI, publica la imagen y pide el despliegue central de `.github` |
| Íconos | `pnpm icons` regenera los PNG de la PWA desde los SVG |
| Caché del navegador | Una versión nueva del service worker reemplaza el app shell al recargar |
