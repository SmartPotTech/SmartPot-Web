import tailwindcss from "@tailwindcss/vite";
import type {Plugin} from "vite";
import solidPlugin from "vite-plugin-solid";
import {defineConfig} from "vitest/config";

// Solo los archivos latinos: cubren el español y el inglés; los demás subconjuntos se piden por unicode-range.
const CRITICAL_FONTS = /^assets\/(?:geist|outfit)-latin-wght-normal-[\w-]+\.woff2$/;

/** Precarga en el <head> las dos fuentes de la primera pintura para que lleguen antes de que se necesiten. */
function criticalFonts(): Plugin {
    return {
        name: "smartpot-critical-fonts",
        apply: "build",
        transformIndexHtml: {
            order: "post",
            handler(html, context) {
                const files = Object.keys(context.bundle ?? {}).filter((file) => CRITICAL_FONTS.test(file)).sort();
                const links = files
                    .map((file) => `<link rel="preload" href="/${file}" as="font" type="font/woff2" crossorigin>`)
                    .join("\n    ");
                return links ? html.replace(/(<meta charset="UTF-8"\/?>)/i, `$1\n    ${links}`) : html;
            },
        },
    };
}

export default defineConfig({
    plugins: [solidPlugin({hot: !process.env.VITEST}), tailwindcss(), criticalFonts()],
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
