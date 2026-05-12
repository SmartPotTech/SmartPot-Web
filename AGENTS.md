# AGENTS.md — SmartPot-Web

## Quick start

```bash
pnpm install --frozen-lockfile   # pnpm is the only supported package manager
pnpm dev                         # start Vite dev server
pnpm build                       # typecheck (tsc -b) + vite build
pnpm lint                        # ESLint flat config
pnpm preview                     # serve production build locally
```

## Stack

- **React 19** + **TypeScript 6** + **Vite 8** (SPA, no SSR)
- **pnpm** (locked via `packageManager` field — do NOT use npm/yarn)
- **Tailwind CSS v4** (`@tailwindcss/postcss` plugin, not the old v3 CLI)
- **Two UI libraries coexist**: `antd` 6 and `@mui/material` 9. Check existing components before picking one.
- **react-router-dom v7** with `createBrowserRouter`
- **plotly.js** for charts (via `react-plotly.js`)

## Build notes

- `pnpm build` runs `tsc -b` (project references mode). The root `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`. Do NOT run `tsc` without `-b`.
- `noUnusedLocals` and `noUnusedParameters` are `true` — unused code breaks the build.
- `noEmit: true` — tsc only typechecks; Vite handles bundling.
- Imports use explicit `.ts` / `.tsx` extensions (e.g. `import X from './foo.tsx'`).
- `pnpm-workspace.yaml` allows `es5-ext` native builds. If a native module fails, check whether it needs a similar entry.

## Vite polyfills

The Vite config aliases Node built-ins for browser compatibility. When adding dependencies that rely on Node APIs, you may need to configure extra aliases:

```ts
// vite.config.ts resolve.alias
buffer  → 'buffer/'
stream  → 'stream-browserify'
assert  → 'assert'
```

And globals:
```ts
'process.env' → {}
'global'      → 'window'
```

## Environment variables

- `VITE_API_BASE_URL` in `.env` (gitignored). See `.example.env` for template.
- `import.meta.env.VITE_API_BASE_URL` (Vite env syntax, not `process.env`).
- The fallback string `"__VITE_API_BASE_URL__"` in `src/features/auth/api/endpoints.ts:2` is intentional — it's a placeholder that `entrypoint.sh` replaces at Docker runtime via `public/runtime.envmap`. Never hardcode the real API URL in source.

## Auth

- Custom auth scheme: `Authorization: SmartPot-OAuth <token>` (`src/shared/utils/api.ts:11`).
- Auth is handled via React Context (`src/features/auth/contexts/AuthContext.tsx`).
- Root layout (`src/routes/root.tsx`) redirects unauthenticated users to `/auth/login`.
- API endpoint URLs are defined in `src/features/auth/api/endpoints.ts`.

## Testing

- No test runner configured. `package.json` has no `test` script. CI (`node.js.yml`) runs `pnpm test` with `continue-on-error: true` as a placeholder. Do not add test tooling without discussion.

## Docker

- Multi-stage build: stage 1 builds via pnpm, stage 2 serves with `serve` on port 5173.
- Runtime env replacement: `entrypoint.sh` reads `public/runtime.envmap` and substitutes placeholders in built `.js` files. The format is `ENV_NAME=PLACEHOLDER|DEFAULT`.
- `public/_redirects` (Netlify SPA fallback) is included in the image but only used on Netlify.

## Source layout

```
src/
  pages/app.tsx           # root App, router definition
  routes/                 # layout + leaf route components
  features/               # domain modules (auth, dashboard, historical-data, notifications, profile)
  shared/                 # cross-cutting: components, hooks, utils, styles, patterns
  types/                  # ambient declarations (e.g. plotly.js-dist-min)
```

- Feature modules follow a `pages/`, `components/`, `api/`, `contexts/` pattern.

## CI

- All workflows run on `push`/`PR` to `main`.
- CI installs **pnpm 11** (matching the `packageManager` field).
- `node.js.yml` matrix: Node 20/22/24.
- Lint step has `continue-on-error: true` — passing build is the hard gate.

## Style

- Tailwind `darkMode: "class"`.
- Custom brand colors in `tailwind.config.js`: `main-colour` (#00B074), `secondary-color` (#2D9CDB), `page-background` (#F3F2F7).
- PostCSS config is CJS (`.cjs`) — Tailwind v4 PostCSS requires it.
- No Prettier or formatter configured — do not auto-format on save unless asked.
