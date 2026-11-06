import {useLocation} from "@solidjs/router";
import {createEffect} from "solid-js";
import {t} from "../lib/i18n";

const BASE_TITLE = "SmartPot";

function setMeta(name: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!element) {
        element = document.createElement("meta");
        element.name = name;
        document.head.appendChild(element);
    }
    element.content = content;
}

function setCanonical(href: string) {
    let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!element) {
        element = document.createElement("link");
        element.rel = "canonical";
        document.head.appendChild(element);
    }
    element.href = href;
}

function browserPath(): string {
    return typeof window !== "undefined" && window.location.pathname
        ? window.location.pathname
        : "/";
}

/**
 * Ruta actual como accessor. `useLocation()` lanza fuera de un Router (pruebas de componentes sueltos), así que se
 * cae a `window.location` sin perder la reactividad cuando sí hay router.
 */
function usePathname(): () => string {
    try {
        const location = useLocation();
        return () => location.pathname || browserPath();
    } catch {
        return browserPath;
    }
}

/** Título, canonical y robots por página: la landing se indexa; la app privada no. */
export function usePageMeta(
    title: string | (() => string),
    {
        index = false,
        description,
        canonical,
    }: { index?: boolean; description?: string | (() => string); canonical?: string } = {},
) {
    const pathname = usePathname();

    createEffect(() => {
        const resolved = typeof title === "function" ? title() : title;
        document.title = resolved
            ? `${resolved} · ${BASE_TITLE}`
            : `${BASE_TITLE} — ${t("meta.defaultTitle")}`;
        setMeta("robots", index ? "index, follow" : "noindex, nofollow");
        if (description) setMeta("description", typeof description === "function" ? description() : description);

        // Se lee dentro del efecto para que el canonical siga a la navegación SPA, no a la ruta con la que se montó.
        const path = pathname();
        const normalized = path !== "/" ? path.replace(/\/+$/, "") : "/";
        const targetUrl = canonical ?? (normalized === "/" ? "https://smartpot.app/" : `https://smartpot.app${normalized}`);
        setCanonical(targetUrl);
    });
}
