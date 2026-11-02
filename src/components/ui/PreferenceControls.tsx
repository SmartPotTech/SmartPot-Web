import {Monitor, Moon, Sun} from "lucide-solid";
import {For} from "solid-js";
import {type Locale, LOCALES, locale, setLocale, t, type TranslationKey} from "../../lib/i18n";
import {resolvedTheme, setThemePreference, type ThemePreference, themePreference} from "../../lib/theme";

const THEME_ORDER: ThemePreference[] = ["light", "dark", "system"];
const THEME_LABEL: Record<ThemePreference, TranslationKey> = {
    light: "prefs.light",
    dark: "prefs.dark",
    system: "prefs.system",
};
const LOCALE_LABEL: Record<Locale, TranslationKey> = {es: "prefs.spanish", en: "prefs.english"};

/** «dark» sobre fondos verdes oscuros (barra lateral, pie); «auto» sobre superficies del tema. */
type Surface = "auto" | "dark";

const BUTTON: Record<Surface, string> = {
    auto: "text-muted hover:bg-surface hover:text-ink",
    dark: "text-leaf-100 hover:bg-leaf-800 hover:text-white",
};

/** Alterna claro → oscuro → automático. */
export function ThemeToggle(props: { surface?: Surface }) {
    const next = () => THEME_ORDER[(THEME_ORDER.indexOf(themePreference()) + 1) % THEME_ORDER.length]!;
    return (
        <button type="button" onClick={() => setThemePreference(next())}
                aria-label={t("prefs.themeNow", {
                    current: t(THEME_LABEL[themePreference()]),
                    next: t(THEME_LABEL[next()]),
                })}
                title={t(THEME_LABEL[themePreference()])}
                class={`touch-target inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${BUTTON[props.surface ?? "auto"]}`}>
            {themePreference() === "system" ? <Monitor size={18}/> : resolvedTheme() === "dark" ? <Moon size={18}/> :
                <Sun size={18}/>}
        </button>
    );
}

/** Alterna entre español e inglés. */
export function LocaleToggle(props: { surface?: Surface }) {
    const next = (): Locale => (locale() === "es" ? "en" : "es");
    return (
        <button type="button" onClick={() => setLocale(next())}
                aria-label={t("prefs.languageNow", {
                    current: t(LOCALE_LABEL[locale()]),
                    next: t(LOCALE_LABEL[next()]),
                })}
                title={t(LOCALE_LABEL[locale()])}
                class={`touch-target inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-xs font-bold uppercase transition-colors ${BUTTON[props.surface ?? "auto"]}`}>
            {locale()}
        </button>
    );
}

/** Los dos conmutadores juntos, para cabeceras y barras. */
export function PreferenceToggles(props: { surface?: Surface }) {
    return (
        <div class="flex items-center">
            <LocaleToggle surface={props.surface}/>
            <ThemeToggle surface={props.surface}/>
        </div>
    );
}

/** Selector explícito para el perfil: dos grupos de opciones. */
export function PreferenceSelectors() {
    const option = (active: boolean) =>
        `touch-target flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${active
            ? "bg-leaf-700 text-white" : "text-muted hover:bg-surface hover:text-ink"}`;
    return (
        <div class="grid gap-4 sm:grid-cols-2">
            <div role="radiogroup" aria-label={t("prefs.language")}>
                <p class="mb-1.5 text-sm font-medium">{t("prefs.language")}</p>
                <div class="flex gap-1 rounded-xl border border-line bg-card p-1">
                    <For each={LOCALES}>
                        {(code) => (
                            <button type="button" role="radio" aria-checked={locale() === code}
                                    onClick={() => setLocale(code)} class={option(locale() === code)}>
                                {t(LOCALE_LABEL[code])}
                            </button>
                        )}
                    </For>
                </div>
            </div>
            <div role="radiogroup" aria-label={t("prefs.theme")}>
                <p class="mb-1.5 text-sm font-medium">{t("prefs.theme")}</p>
                <div class="flex gap-1 rounded-xl border border-line bg-card p-1">
                    <For each={THEME_ORDER}>
                        {(mode) => (
                            <button type="button" role="radio" aria-checked={themePreference() === mode}
                                    onClick={() => setThemePreference(mode)}
                                    class={option(themePreference() === mode)}>
                                {t(THEME_LABEL[mode])}
                            </button>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
}
