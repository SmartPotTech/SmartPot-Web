import {createMemoryHistory, MemoryRouter, Route, useNavigate} from "@solidjs/router";
import {render, screen, waitFor} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {createHash} from "node:crypto";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import {describe, expect, it} from "vitest";
import {FAQ} from "../features/landing/faq";
import {usePageMeta} from "../hooks/usePageMeta";
import {es} from "../lib/i18n/es";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf-8");

describe("SEO y PWA", () => {
    const page = new DOMParser().parseFromString(read("index.html"), "text/html");
    const attribute = (selector: string, name: string) => page.querySelector(selector)?.getAttribute(name) ?? "";

    it("index.html trae metadatos, Open Graph y datos estructurados en español", () => {
        expect(page.documentElement.lang).toBe("es");
        expect(attribute('meta[name="description"]', "content").length).toBeGreaterThanOrEqual(80);
        expect(attribute('meta[name="description"]', "content").length).toBeLessThanOrEqual(160);
        expect(attribute('link[rel="canonical"]', "href")).toBe("https://smartpot.app/");
        expect(attribute('meta[property="og:image"]', "content")).toBe("https://smartpot.app/og-image.png");
        expect(attribute('link[rel="manifest"]', "href")).toBe("/manifest.webmanifest");
        const jsonLd = page.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}";
        const types = JSON.parse(jsonLd)["@graph"].map((node: { "@type": string }) => node["@type"]);
        expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "SoftwareApplication", "FAQPage"]));
    });

    it("el FAQPage publica las mismas preguntas y respuestas que la landing", () => {
        const jsonLd = page.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}";
        const faq = JSON.parse(jsonLd)["@graph"].find((node: { "@type": string }) => node["@type"] === "FAQPage");
        const published = faq.mainEntity.map((entry: { name: string; acceptedAnswer: { text: string } }) =>
            [entry.name, entry.acceptedAnswer.text]);
        expect(published).toEqual(FAQ.map((item) => [es[item.question], es[item.answer]]));
    });

    it("el contenido para rastreadores copia el hero y la app lo quita al montar", () => {
        const fallback = page.querySelector("#root > .prerender");
        expect(fallback?.querySelector("h1")?.textContent).toBe(es["landing.heroTitle"]);
        expect(fallback?.querySelector('a[href="/register"].bg-leaf-500')?.textContent).toBe(es["landing.ctaCreate"]);
        expect(attribute('meta[name="description"]', "content")).toBe(es["landing.description"]);
        // Sin hojas aparte que bloqueen el primer pintado: la CSP admite estilos en línea.
        expect(page.querySelector('link[rel="stylesheet"]')).toBeNull();
        expect(page.querySelector("head > style")?.textContent).toContain(".prerender");
        expect(read("nginx/security-headers.inc.template")).toContain("style-src 'self' 'unsafe-inline'");
        expect(read("public/sw.js")).not.toMatch(/prerender\.css|theme-init\.js/);
        // render() de Solid no vacía el contenedor: sin esto el bloque queda encima de la interfaz.
        expect(read("src/main.tsx")).toContain("root.replaceChildren()");
    });

    it("el script en línea del <head> está autorizado por su hash en la CSP", () => {
        const inline = [...read("index.html").matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1] ?? "");
        expect(inline).toHaveLength(1);
        const script = inline[0] ?? "";
        const hash = `'sha256-${createHash("sha256").update(script, "utf8").digest("base64")}'`;
        expect(read("nginx/security-headers.inc.template")).toContain(`script-src 'self' ${hash};`);
        // Si existe el build, Vite no debe haber tocado el script: el hash sigue siendo el mismo.
        const built = resolve(process.cwd(), "dist/index.html");
        if (existsSync(built)) expect(readFileSync(built, "utf-8")).toContain(`<script>${script}</script>`);
    });

    it("el manifiesto es instalable", () => {
        const manifest = JSON.parse(read("public/manifest.webmanifest"));
        expect(manifest.display).toBe("standalone");
        expect(manifest.lang).toBe("es");
        const sizes = manifest.icons.map((icon: { sizes: string; purpose: string }) => `${icon.sizes}:${icon.purpose}`);
        expect(sizes).toEqual(expect.arrayContaining(["192x192:any", "512x512:any", "512x512:maskable"]));
    });

    it("robots bloquea la app privada y publica el sitemap", () => {
        const robots = read("public/robots.txt");
        expect(robots).toContain("Disallow: /app");
        expect(robots).toContain("Sitemap: https://smartpot.app/sitemap.xml");
        expect(read("public/sitemap.xml")).toContain("<loc>https://smartpot.app/</loc>");
    });

    it("el service worker no guarda la API ni la configuración", () => {
        const worker = read("public/sw.js");
        expect(worker).toContain('url.origin !== self.location.origin || url.pathname === "/config.js"');
    });

    it("la configuración de runtime es diferida y se ejecuta antes del módulo principal", () => {
        const html = read("index.html");
        // `defer` y los módulos se ejecutan en orden de documento: config.js debe ir antes que el módulo, también en
        // el build, donde Vite mueve el módulo al <head>.
        expect(html).toMatch(/<script defer src="\/config\.js"><\/script>\s*<\/head>/);
        expect(html.indexOf('src="/config.js"')).toBeLessThan(html.indexOf('src="/src/main.tsx"'));
        expect(html).not.toMatch(/<script[^>]+src="\/config\.js"[^>]*\basync\b/);
        const built = resolve(process.cwd(), "dist/index.html");
        if (!existsSync(built)) return;
        const output = readFileSync(built, "utf-8");
        expect(output.indexOf('src="/config.js"')).toBeLessThan(output.search(/<script type="module"[^>]+src="\/assets\//));
    });

    it("el build incrusta la hoja de estilos y precarga solo las dos fuentes latinas", () => {
        const built = resolve(process.cwd(), "dist/index.html");
        if (!existsSync(built)) return;
        const output = readFileSync(built, "utf-8");
        expect(output).not.toMatch(/<link rel="stylesheet"[^>]+\/assets\//);
        const fonts = [...output.matchAll(/<link rel="preload" href="\/assets\/([\w-]+)\.woff2"/g)].map((m) => m[1] ?? "");
        expect(fonts).toHaveLength(2);
        expect(fonts.every((name) => /^(geist|outfit)-latin-wght-normal-/.test(name))).toBe(true);
    });

    it("el grafo inicial del build no precarga la simulación ni el alta de cultivos", () => {
        const built = resolve(process.cwd(), "dist/index.html");
        if (!existsSync(built)) return;
        const html = readFileSync(built, "utf-8");
        expect(html).not.toContain("SimulationPanel");
        expect(html).not.toContain("CreateCropDialog");
        expect(html).not.toContain("PlacementPicker");
        // Las vistas privadas y el traductor de mensajes del servidor tampoco viajan con la landing.
        for (const chunk of ["PrivateLayout", "OverviewPage", "CropsPage", "ControlPage", "ProfilePage", "serverText"]) {
            expect(html).not.toContain(chunk);
        }
    });
});

function CanonicalPage(props: { title: string; next?: string }) {
    usePageMeta(props.title);
    const navigate = useNavigate();
    return (
        <button type="button" onClick={() => props.next && navigate(props.next)}>go</button>
    );
}

describe("canonical SPA", () => {
    it("apunta a la ruta actual al navegar, no a la anterior", async () => {
        document.head.querySelector('link[rel="canonical"]')?.remove();
        const history = createMemoryHistory();
        history.set({value: "/app/crops"});
        render(() => (
            <MemoryRouter history={history}>
                <Route path="/app/crops" component={() => <CanonicalPage title="Cultivos" next="/app/learning"/>}/>
                <Route path="/app/learning" component={() => <CanonicalPage title="Aprendizaje"/>}/>
            </MemoryRouter>
        ));

        await waitFor(() => expect(
            document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        ).toBe("https://smartpot.app/app/crops"));

        await userEvent.click(screen.getByRole("button", {name: "go"}));

        await waitFor(() => expect(
            document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        ).toBe("https://smartpot.app/app/learning"));
    });
});
