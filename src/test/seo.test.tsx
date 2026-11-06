import {createMemoryHistory, MemoryRouter, Route, useNavigate} from "@solidjs/router";
import {render, screen, waitFor} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {existsSync} from "node:fs";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {describe, expect, it} from "vitest";
import {usePageMeta} from "../hooks/usePageMeta";

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

    it("el contenido para rastreadores tiene estilo propio y la app lo quita al montar", () => {
        const fallback = page.querySelector("#root > main.prerender");
        expect(fallback?.querySelector("h1")?.textContent).toContain("SmartPot");
        // Hoja aparte: la CSP (style-src 'self') bloquearía un <style> en línea.
        expect(page.querySelector('link[href="/prerender.css"]')).not.toBeNull();
        expect(read("public/prerender.css")).toContain(".prerender");
        expect(read("public/sw.js")).toContain('"/prerender.css"');
        // render() de Solid no vacía el contenedor: sin esto el bloque queda encima de la interfaz.
        expect(read("src/main.tsx")).toContain("root.replaceChildren()");
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

    it("la configuración de runtime se ejecuta antes del módulo principal", () => {
        const html = read("index.html");
        expect(html.indexOf('src="/config.js"')).toBeGreaterThan(-1);
        expect(html.indexOf('src="/config.js"')).toBeLessThan(html.indexOf('src="/src/main.tsx"'));
        expect(html).not.toMatch(/<script[^>]+src="\/config\.js"[^>]+(?:async|defer)/);
    });

    it("el grafo inicial del build no precarga la simulación ni el alta de cultivos", () => {
        const built = resolve(process.cwd(), "dist/index.html");
        if (!existsSync(built)) return;
        const html = readFileSync(built, "utf-8");
        expect(html).not.toContain("SimulationPanel");
        expect(html).not.toContain("CreateCropDialog");
        expect(html).not.toContain("PlacementPicker");
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
