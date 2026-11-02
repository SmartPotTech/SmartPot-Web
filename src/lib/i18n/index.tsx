import {createSignal} from "solid-js";
import {es, type TranslationDictionary, type TranslationKey} from "./es";

export type Locale = "es" | "en";
export type {TranslationDictionary, TranslationKey};
export type TranslationParams = Record<string, string | number>;

export const LOCALE_STORAGE_KEY = "smartpot_locale";
export const LOCALES: Locale[] = ["es", "en"];

const INTL_LOCALES: Record<Locale, string> = {es: "es-CO", en: "en-US"};

// El español viaja con la app; el inglés es un trozo aparte que se descarga solo al elegirlo (mantiene ligero el
// paquete inicial). Mientras llega se sigue mostrando el idioma anterior, nunca llaves sueltas.
let english: TranslationDictionary | undefined;

/** Descarga el diccionario del idioma si hace falta. */
export async function loadLocale(language: Locale): Promise<void> {
    if (language === "en" && !english) english = (await import("./en")).en;
}

function dictionary(language: Locale): TranslationDictionary {
    return language === "en" && english ? english : es;
}

function readLocale(): Locale {
    try {
        const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
        if (stored === "es" || stored === "en") return stored;
    } catch {
        // Almacenamiento no disponible: se usa el idioma por defecto.
    }
    return "es";
}

// Se parte en español hasta que initI18n() carga el idioma guardado.
const [locale, setLocaleSignal] = createSignal<Locale>("es");

export {locale};

/** Locale de Intl para fechas, números y tiempos relativos (es-CO o en-US). */
export function intlLocale(): string {
    return INTL_LOCALES[locale()];
}

/** Aplica el idioma al documento. */
export function applyLocale() {
    if (typeof document !== "undefined") document.documentElement.lang = locale();
}

function activate(next: Locale) {
    setLocaleSignal(next);
    applyLocale();
}

/** Cambia el idioma; si su diccionario aún no está descargado, lo hace efectivo al llegar. */
export function setLocale(next: Locale, {persist = true}: { persist?: boolean } = {}): Promise<void> {
    if (persist) {
        try {
            window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
        } catch {
            // Sin almacenamiento el idioma dura solo esta sesión.
        }
    }
    if (next !== "en" || english) {
        activate(next);
        return Promise.resolve();
    }
    return loadLocale(next).then(() => activate(next), () => undefined);
}

const PLURAL = /\{(\w+), plural, one \{([^}]*)\} other \{([^}]*)\}\}/g;

/**
 * Traduce una llave. Admite `{nombre}` y pluralización simple: `{count, plural, one {# cultivo} other {# cultivos}}`.
 * Lee la señal del idioma, así que dentro de JSX o de un efecto se actualiza sola al cambiar de idioma.
 */
export function translate(language: Locale, key: TranslationKey, params?: TranslationParams): string {
    let text: string = dictionary(language)[key] ?? es[key] ?? key;
    if (!params) return text;
    const rules = new Intl.PluralRules(INTL_LOCALES[language]);
    text = text.replace(PLURAL, (_, name: string, one: string, other: string) => {
        const count = Number(params[name] ?? 0);
        const formatted = new Intl.NumberFormat(INTL_LOCALES[language]).format(count);
        return (rules.select(count) === "one" ? one : other).replaceAll("#", formatted);
    });
    return text.replace(/\{(\w+)}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

export function t(key: TranslationKey, params?: TranslationParams): string {
    return translate(locale(), key, params);
}

let started = false;

/** Aplica el idioma guardado y sincroniza pestañas. Se espera antes de render() para no pintar el idioma equivocado. */
export async function initI18n(): Promise<void> {
    if (!started && typeof window !== "undefined") {
        started = true;
        window.addEventListener("storage", (event) => {
            if (event.key === LOCALE_STORAGE_KEY || event.key === null) void setLocale(readLocale(), {persist: false});
        });
    }
    await setLocale(readLocale(), {persist: false});
}

export function useI18n() {
    return {t, locale, setLocale, intlLocale};
}
