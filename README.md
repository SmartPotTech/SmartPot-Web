# SmartPot-Web

## Estado del Proyecto

[![Node.js CI](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/node.js.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/node.js.yml)
[![CodeQL Advanced](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/codeql.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/codeql.yml)
[![Publish Package to GHCR](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/packaging.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/packaging.yml)

## Descripción

SmartPot-Web es la **aplicación web progresiva (PWA)** de SmartPot, publicada en [smartpot.app](https://smartpot.app). Se instala en Android, iOS y escritorio, y permite:

- Crear cultivos de seis especies y conectar su maceta con las credenciales MQTT que entrega la API.
- Ver las lecturas en tiempo real, comparadas con el rango ideal de la especie, e historiales de 6 h, 24 h o 7 días exportables a CSV.
- Consultar al **asistente de IA**: índice de salud, diagnóstico por variable, conclusiones del sistema experto, predicciones de los modelos y acciones sugeridas.
- Encender y apagar la bomba, la luz de cultivo y el ventilador, y activar el **modo automático** del agente.
- Recibir alertas del cultivo, del dispositivo y del asistente.

La página de inicio es pública e indexable; la aplicación vive bajo `/app` y no se indexa.

## Tecnologías

React 19 · TypeScript 6 · Vite 8 · Tailwind CSS 4 · React Router 7 · Recharts · Lucide · Vitest · Testing Library · pnpm 11.

## Estructura del Proyecto

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
│   ├── app/                    # Enrutador y páginas generales
│   ├── components/             # Marca, layouts y componentes de interfaz
│   ├── config/env.ts           # URL de la API en tiempo de ejecución
│   ├── features/
│   │   ├── auth/               # Sesión, ingreso, registro y recuperación
│   │   ├── crops/              # Panel, detalle, asistente, control, dispositivo y ajustes
│   │   ├── landing/            # Página pública y preguntas frecuentes
│   │   ├── notifications/      # Alertas
│   │   ├── profile/            # Perfil, contraseña y borrado de cuenta
│   │   └── pwa/                # Registro del service worker e instalación
│   ├── hooks/                  # Metadatos por página, recursos con refresco y conexión
│   ├── lib/                    # Cliente de la API, tipos, catálogos y formato en español
│   └── styles/index.css        # Paleta SmartPot como tokens de Tailwind
├── nginx/                      # Servidor de la imagen: CSP, caché y configuración en tiempo de ejecución
├── scripts/generate-icons.mjs  # PNG de la PWA a partir de los SVG
└── Dockerfile
```

## Identidad Visual

| Token | Color | Uso |
| --- | --- | --- |
| `leaf-900` | `#0B3D2B` | Fondos de marca, color del tema de la PWA |
| `leaf-700` | `#067A52` | Acciones principales |
| `leaf-500` | `#00B074` | Verde de marca |
| `water-500` | `#2D9CDB` | Agua, información y señal del logo |
| `sun-500` | `#F2B632` | Luz y advertencias |
| `clay-500` | `#D9734E` | Maceta y temperatura |
| `danger-500` | `#D64545` | Errores |
| `ink` / `muted` / `line` / `surface` | `#17261F` / `#5B6B63` / `#D5E3DC` / `#F2F7F4` | Texto, bordes y superficies |

Tipografías: **Outfit** para títulos e **Inter** para el cuerpo, servidas desde la propia app (sin CDNs).

## SEO y PWA

- `index.html` trae descripción, palabras clave, URL canónica, Open Graph, Twitter Card y datos estructurados JSON-LD (`Organization`, `WebSite`, `SoftwareApplication` y `FAQPage`), además de contenido estático que leen los rastreadores sin JavaScript.
- Cada página ajusta su título y `robots`: la landing, el ingreso y el registro se indexan; `/app` no.
- El manifiesto declara íconos normales y adaptables, accesos directos y el color `#0B3D2B`. El botón «Instalar app» aparece cuando el navegador lo permite; en iPhone se explica «Compartir → Agregar a inicio».
- El service worker guarda el app shell y los recursos con hash; la API y `/config.js` nunca se guardan en caché.

## Seguridad

- CSP estricta (`script-src 'self'`, `style-src 'self'`, `connect-src` limitado a la API), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy` y `Permissions-Policy`.
- El token JWT se guarda en `localStorage` solo si el usuario marca «Mantener sesión iniciada»; si no, en `sessionStorage`. Un 401 cierra la sesión.
- La clave del dispositivo se muestra una sola vez, al crear el cultivo o al rotarla.

## Guía de Instalación

### Requisitos Previos

- Node.js 22 o 24 y pnpm 11 (`corepack enable`)
- La API de SmartPot en `http://localhost:8091` (el entorno completo está en [SmartPotTech/.github](https://github.com/SmartPotTech/.github))

### Desarrollo

```bash
git clone https://github.com/SmartPotTech/SmartPot-Web.git
cd SmartPot-Web
pnpm install
pnpm dev
```

### Calidad

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Las pruebas cubren el cliente HTTP y sus errores en español, la sesión, las validaciones, el ingreso, los componentes del cultivo, el panel del asistente y los requisitos de SEO y PWA.

### Imagen Docker

```bash
docker build -t smartpot-web .
docker run --rm -p 5173:8080 -e API_URL=http://localhost:8091 \
  --read-only --tmpfs /tmp --tmpfs /etc/nginx/conf.d:uid=101,gid=101 smartpot-web
```

`API_URL` se inyecta al arrancar en `/config.js` y en la CSP, así la misma imagen sirve para cualquier entorno. Imagen publicada: `ghcr.io/smartpottech/smartpot-web:latest`.

### Íconos

Tras cambiar los SVG de `public/icons` o `public/og-image.svg`:

```bash
pnpm icons
```

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
