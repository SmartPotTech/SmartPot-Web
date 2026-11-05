import {createSignal} from "solid-js";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "smartpot_theme";

/** Color de la barra del navegador (meta theme-color) en cada tema: leaf-900 en claro y fondo carbón en oscuro. */
export const THEME_COLORS: Record<ResolvedTheme, string> = {light: "#0B3D2B", dark: "#0A0E0C"};

const PREFERENCES: ThemePreference[] = ["light", "dark", "system"];

function systemQuery(): MediaQueryList | null {
    return typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
}

function readPreference(): ThemePreference {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (PREFERENCES.includes(stored as ThemePreference)) return stored as ThemePreference;
    } catch {
        // Almacenamiento no disponible: se sigue al sistema.
    }
    return "system";
}

const [preference, setPreferenceSignal] = createSignal<ThemePreference>(readPreference());
const [systemDark, setSystemDark] = createSignal(systemQuery()?.matches ?? false);

export function themePreference(): ThemePreference {
    return preference();
}

/** Tema efectivo: la preferencia, o el del sistema cuando es «system». */
export function resolvedTheme(): ResolvedTheme {
    const current = preference();
    if (current === "system") return systemDark() ? "dark" : "light";
    return current;
}

function setMeta(name: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!element) {
        element = document.createElement("meta");
        element.name = name;
        document.head.appendChild(element);
    }
    element.content = content;
}

/** Refleja el tema efectivo en <html> y en los metadatos del navegador. */
export function applyTheme() {
    if (typeof document === "undefined") return;
    const theme = resolvedTheme();
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    setMeta("theme-color", THEME_COLORS[theme]);
    setMeta("color-scheme", theme);
}

export function setThemePreference(next: ThemePreference, {persist = true}: { persist?: boolean } = {}) {
    setPreferenceSignal(next);
    if (persist) {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            // Sin almacenamiento la preferencia dura solo esta sesión.
        }
    }
    applyTheme();
}

let started = false;

/** Aplica el tema guardado y se mantiene al día con el sistema y con otras pestañas. Se llama antes de render(). */
export function initTheme() {
    setPreferenceSignal(readPreference());
    const query = systemQuery();
    if (query) setSystemDark(query.matches);
    applyTheme();
    if (started || typeof window === "undefined") return;
    started = true;
    query?.addEventListener?.("change", (event) => {
        setSystemDark(event.matches);
        applyTheme();
    });
    window.addEventListener("storage", (event) => {
        if (event.key === THEME_STORAGE_KEY || event.key === null) {
            setPreferenceSignal(readPreference());
            applyTheme();
        }
    });
}

export function useTheme() {
    return {preference: themePreference, resolved: resolvedTheme, setPreference: setThemePreference};
}
