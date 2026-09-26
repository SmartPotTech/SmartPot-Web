import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf-8");

describe("SEO y PWA", () => {
  const html = read("index.html");

  it("index.html trae metadatos, Open Graph y datos estructurados en español", () => {
    expect(html).toContain('<html lang="es">');
    expect(html).toMatch(/<meta name="description" content="[^"]{80,160}"/);
    expect(html).toContain('<link rel="canonical" href="https://smartpot.app/"');
    expect(html).toContain('property="og:image" content="https://smartpot.app/og-image.png"');
    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest"');
    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "{}";
    const types = JSON.parse(jsonLd)["@graph"].map((node: { "@type": string }) => node["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "SoftwareApplication", "FAQPage"]));
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
});
