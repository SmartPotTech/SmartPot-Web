import tailwindcss from "@tailwindcss/vite";
import type {Plugin} from "vite";
import solidPlugin from "vite-plugin-solid";
import {defineConfig} from "vitest/config";
import {es} from "./src/lib/i18n/es";

const SITE = "https://smartpot.app";

/** Rutas públicas con su propio <head> estático: lo que lee un rastreador antes (o en vez) de ejecutar el JS. */
export const STATIC_ROUTES: { path: string; title: string; description: string; index: boolean }[] = [
    {path: "login", title: es["auth.login.title"], description: es["auth.login.description"], index: true},
    {path: "register", title: es["auth.register.title"], description: es["auth.register.description"], index: true},
    {path: "forgot-password", title: es["auth.forgot.title"], description: es["auth.login.description"], index: false},
    {path: "reset-password", title: es["auth.reset.title"], description: es["auth.login.description"], index: false},
];

const escapeAttribute = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** HTML de una ruta pública: el mismo documento con título, descripción, canonical y robots propios, sin el JSON-LD. */
export function routeHtml(html: string, route: (typeof STATIC_ROUTES)[number]): string {
    const title = `${route.title} · SmartPot`;
    const url = `${SITE}/${route.path}`;
    const description = escapeAttribute(route.description);
    // Reemplazos con función para que ningún texto se interprete como patrón «$&» de String.replace.
    return html
        .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeAttribute(title)}</title>`)
        .replace(/<meta content="[^"]*"\s*name="description"\/>/, () => `<meta content="${description}" name="description"/>`)
        .replace(/<meta content="[^"]*" name="robots"\/>/, () =>
            `<meta content="${route.index ? "index, follow" : "noindex, nofollow"}" name="robots"/>`)
        .replace(/<link href="[^"]*" rel="canonical"\/>/, () => `<link href="${url}" rel="canonical"/>`)
        .replace(/<link href="[^"]*" hreflang="es" rel="alternate"\/>/, () => `<link href="${url}" hreflang="es" rel="alternate"/>`)
        .replace(/<link href="[^"]*" hreflang="x-default" rel="alternate"\/>/, () => `<link href="${url}" hreflang="x-default" rel="alternate"/>`)
        .replace(/<meta content="[^"]*" property="og:url"\/>/, () => `<meta content="${url}" property="og:url"/>`)
        .replace(/<meta content="[^"]*" property="og:title"\/>/, () => `<meta content="${escapeAttribute(title)}" property="og:title"/>`)
        .replace(/<meta content="[^"]*" name="twitter:title"\/>/, () => `<meta content="${escapeAttribute(title)}" name="twitter:title"/>`)
        .replace(/<meta content="[^"]*"\s*property="og:description"\/>/, () => `<meta content="${description}" property="og:description"/>`)
        .replace(/<meta content="[^"]*"\s*name="twitter:description"\/>/, () => `<meta content="${description}" name="twitter:description"/>`)
        .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => "");
}

/** Emite login.html, register.html… junto a index.html; nginx los sirve con `try_files $uri $uri.html`. */
function staticRoutes(): Plugin {
    return {
        name: "smartpot-static-routes",
        apply: "build",
        enforce: "post",
        generateBundle(_options, bundle) {
            const index = bundle["index.html"];
            if (!index || index.type !== "asset") return;
            const html = String(index.source);
            for (const route of STATIC_ROUTES) {
                this.emitFile({type: "asset", fileName: `${route.path}.html`, source: routeHtml(html, route)});
            }
        },
    };
}

// Solo los archivos latinos: cubren el español y el inglés; los demás subconjuntos se piden por unicode-range.
const CRITICAL_FONTS = /^assets\/(?:geist|outfit)-latin-wght-normal-[\w-]+\.woff2$/;

const STYLESHEET = /\s*<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/g;

/**
 * Deja el primer pintado sin recursos bloqueantes: precarga en el <head> las dos fuentes de la primera pintura y
 * cambia la hoja de estilos (una sola, ~10 KB en Brotli) por un <style> en el <head>. La CSP admite estilos en línea
 * (style-src 'unsafe-inline') y el HTML viaja comprimido, así que el CSS llega en la misma respuesta que el documento.
 */
function criticalAssets(): Plugin {
    return {
        name: "smartpot-critical-assets",
        apply: "build",
        transformIndexHtml: {
            order: "post",
            handler(html, context) {
                const bundle = context.bundle ?? {};
                const links = Object.keys(bundle).filter((file) => CRITICAL_FONTS.test(file)).sort()
                    .map((file) => `<link rel="preload" href="/${file}" as="font" type="font/woff2" crossorigin>`)
                    .join("\n    ");
                let styles = "";
                const withoutLinks = html.replace(STYLESHEET, (tag: string, file: string) => {
                    const asset = bundle[file];
                    if (!asset || asset.type !== "asset") return tag;
                    styles += String(asset.source);
                    delete bundle[file];
                    return "";
                });
                // Reemplazos con función: el CSS podría traer secuencias «$&» que String.replace interpretaría.
                return withoutLinks
                    .replace(/<meta charset="UTF-8"\/?>/i, (meta) => (links ? `${meta}\n    ${links}` : meta))
                    .replace("</head>", () => (styles ? `<style>${styles}</style>\n</head>` : "</head>"));
            },
        },
    };
}

export default defineConfig({
    plugins: [solidPlugin({hot: !process.env.VITEST}), tailwindcss(), criticalAssets(), staticRoutes()],
    build: {
        target: "es2022",
        sourcemap: false,
        minify: true,
        cssMinify: true,
        rollupOptions: {
            output: {
                // Solid va aparte porque lo comparten todas las vistas; los íconos se quedan con el trozo que los usa.
                manualChunks(id) {
                    if (id.includes("node_modules/solid-js") || id.includes("node_modules/@solidjs")) {
                        return "solid-core";
                    }
                },
            },
        },
    },
    resolve: {
        conditions: ["development", "browser"],
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test/setup.ts"],
        css: false,
        // Bajo carga de CPU, jsdom tarda en arrancar; 15 s evita timeouts espurios sin ocultar pruebas lentas reales.
        testTimeout: 15000,
    },
});
