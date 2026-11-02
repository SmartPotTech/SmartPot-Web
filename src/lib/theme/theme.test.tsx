import {render, screen} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {beforeAll, beforeEach, describe, expect, it} from "vitest";
import {PreferenceSelectors, ThemeToggle} from "../../components/ui/PreferenceControls";
import {initTheme, resolvedTheme, setThemePreference, THEME_COLORS, THEME_STORAGE_KEY, themePreference} from "./index";

/** matchMedia controlable: jsdom no lo trae. */
const media = {
    matches: false,
    listeners: new Set<(event: { matches: boolean }) => void>(),
    addEventListener(_: string, listener: (event: { matches: boolean }) => void) {
        this.listeners.add(listener);
    },
    removeEventListener(_: string, listener: (event: { matches: boolean }) => void) {
        this.listeners.delete(listener);
    },
    setSystemDark(dark: boolean) {
        this.matches = dark;
        this.listeners.forEach((listener) => listener({matches: dark}));
    },
};

const root = document.documentElement;
const metaColor = () => document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content;

beforeAll(() => {
    window.matchMedia = (() => media) as unknown as typeof window.matchMedia;
});

beforeEach(() => {
    media.matches = false;
    initTheme();
});

describe("tema", () => {
    it("sin preferencia sigue al sistema (claro)", () => {
        expect(themePreference()).toBe("system");
        expect(resolvedTheme()).toBe("light");
        expect(root.classList.contains("dark")).toBe(false);
        expect(root.dataset.theme).toBe("light");
        expect(metaColor()).toBe(THEME_COLORS.light);
    });

    it("oscuro aplica la clase, data-theme, theme-color y se guarda", () => {
        setThemePreference("dark");
        expect(root.classList.contains("dark")).toBe(true);
        expect(root.dataset.theme).toBe("dark");
        expect(metaColor()).toBe("#06281C");
        expect(document.head.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content).toBe("dark");
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

        setThemePreference("light");
        expect(root.classList.contains("dark")).toBe(false);
        expect(root.dataset.theme).toBe("light");
        expect(metaColor()).toBe("#0B3D2B");
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    });

    it("en automático reacciona a los cambios del sistema, pero no con un tema fijo", () => {
        setThemePreference("system");
        media.setSystemDark(true);
        expect(resolvedTheme()).toBe("dark");
        expect(root.classList.contains("dark")).toBe(true);

        media.setSystemDark(false);
        expect(resolvedTheme()).toBe("light");
        expect(root.classList.contains("dark")).toBe(false);

        setThemePreference("light");
        media.setSystemDark(true);
        expect(resolvedTheme()).toBe("light");
        expect(root.classList.contains("dark")).toBe(false);
    });

    it("recupera la preferencia guardada y la sincroniza entre pestañas", () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
        initTheme();
        expect(themePreference()).toBe("dark");
        expect(root.classList.contains("dark")).toBe(true);

        window.localStorage.setItem(THEME_STORAGE_KEY, "light");
        window.dispatchEvent(new StorageEvent("storage", {key: THEME_STORAGE_KEY, newValue: "light"}));
        expect(themePreference()).toBe("light");
        expect(root.classList.contains("dark")).toBe(false);
    });

    it("ignora valores guardados inválidos", () => {
        window.localStorage.setItem(THEME_STORAGE_KEY, "sepia");
        initTheme();
        expect(themePreference()).toBe("system");
    });
});

describe("controles de tema", () => {
    it("el botón recorre claro → oscuro → automático con una etiqueta accesible", async () => {
        setThemePreference("light");
        render(() => <ThemeToggle/>);
        const button = () => screen.getByRole("button");
        expect(button()).toHaveAccessibleName("Apariencia: Claro. Cambiar a Oscuro");

        await userEvent.click(button());
        expect(themePreference()).toBe("dark");
        expect(root.classList.contains("dark")).toBe(true);
        expect(button()).toHaveAccessibleName("Apariencia: Oscuro. Cambiar a Automático del sistema");

        await userEvent.click(button());
        expect(themePreference()).toBe("system");

        await userEvent.click(button());
        expect(themePreference()).toBe("light");
    });

    it("el selector del perfil elige explícitamente la apariencia", async () => {
        render(() => <PreferenceSelectors/>);
        expect(screen.getByRole("radio", {name: "Automático del sistema"})).toHaveAttribute("aria-checked", "true");

        await userEvent.click(screen.getByRole("radio", {name: "Oscuro"}));
        expect(screen.getByRole("radio", {name: "Oscuro"})).toHaveAttribute("aria-checked", "true");
        expect(root.classList.contains("dark")).toBe(true);
        expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

        await userEvent.click(screen.getByRole("radio", {name: "Claro"}));
        expect(root.classList.contains("dark")).toBe(false);
    });
});
