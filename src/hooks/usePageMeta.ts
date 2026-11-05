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

/** Título, canonical y robots por página: la landing se indexa; la app privada no. */
export function usePageMeta(
    title: string | (() => string),
    {
        index = false,
        description,
        canonical,
    }: { index?: boolean; description?: string | (() => string); canonical?: string } = {},
) {
    createEffect(() => {
        const resolved = typeof title === "function" ? title() : title;
        document.title = resolved
            ? `${resolved} · ${BASE_TITLE}`
            : `${BASE_TITLE} — ${t("meta.defaultTitle")}`;
        setMeta("robots", index ? "index, follow" : "noindex, nofollow");
        if (description) setMeta("description", typeof description === "function" ? description() : description);

        if (typeof window !== "undefined" && window.location) {
            const pathname = window.location.pathname || "/";
            const targetUrl = canonical ?? (pathname === "/" ? "https://smartpot.app/" : `https://smartpot.app${pathname}`);
            setCanonical(targetUrl);
        }
    });
}
