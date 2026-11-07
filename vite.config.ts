import tailwindcss from "@tailwindcss/vite";
import type {Plugin} from "vite";
import solidPlugin from "vite-plugin-solid";
import {defineConfig} from "vitest/config";

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
    plugins: [solidPlugin({hot: !process.env.VITEST}), tailwindcss(), criticalAssets()],
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
