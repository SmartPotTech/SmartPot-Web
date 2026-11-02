import {createMemoryHistory, MemoryRouter, Route} from "@solidjs/router";
import {render, screen} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {describe, expect, it} from "vitest";
import {PreferenceSelectors, PreferenceToggles} from "../../components/ui/PreferenceControls";
import {AuthProvider} from "../../features/auth/AuthProvider";
import {LoginPage} from "../../features/auth/LoginPage";
import {validateEmail} from "../../features/auth/validation";
import {describeAction, formatDateTime, formatMetric, timeAgo} from "../format";
import {en} from "./en";
import {es} from "./es";
import {initI18n, intlLocale, LOCALE_STORAGE_KEY, locale, setLocale, t} from "./index";

describe("diccionarios", () => {
    it("es y en tienen exactamente las mismas llaves y los mismos parámetros", () => {
        expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
        const params = (text: string) => [...text.matchAll(/\{(\w+)[,}]/g)].map((match) => match[1]).sort();
        for (const key of Object.keys(es) as (keyof typeof es)[]) {
            expect(params(en[key]), key).toEqual(params(es[key]));
            expect(en[key].trim(), key).not.toBe("");
        }
    });
});

describe("motor de traducción", () => {
    it("usa español por defecto", () => {
        expect(locale()).toBe("es");
        expect(t("common.close")).toBe("Cerrar");
        expect(intlLocale()).toBe("es-CO");
    });

    it("cambia a inglés, persiste, actualiza el atributo lang y vuelve", () => {
        setLocale("en");
        expect(t("common.close")).toBe("Close");
        expect(intlLocale()).toBe("en-US");
        expect(document.documentElement.lang).toBe("en");
        expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");

        setLocale("es");
        expect(document.documentElement.lang).toBe("es");
        expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("es");
    });

    it("interpola parámetros y resuelve plurales según el idioma", () => {
        expect(t("profile.memberSince", {email: "ana@example.com", date: "hoy"})).toBe("ana@example.com · miembro desde hoy");
        expect(t("learning.readings", {count: 1})).toBe("1 lectura");
        expect(t("learning.readings", {count: 2})).toBe("2 lecturas");
        setLocale("en");
        expect(t("learning.readings", {count: 1})).toBe("1 reading");
        expect(t("learning.readings", {count: 3})).toBe("3 readings");
        expect(t("profile.memberSince", {email: "ana@example.com", date: "today"})).toBe("ana@example.com · member since today");
    });

    it("recupera el idioma guardado y se sincroniza con otras pestañas", async () => {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, "en");
        await initI18n();
        expect(locale()).toBe("en");
        expect(document.documentElement.lang).toBe("en");

        window.localStorage.setItem(LOCALE_STORAGE_KEY, "es");
        window.dispatchEvent(new StorageEvent("storage", {key: LOCALE_STORAGE_KEY, newValue: "es"}));
        expect(locale()).toBe("es");
        expect(document.documentElement.lang).toBe("es");
    });

    it("ignora valores guardados que no son un idioma", async () => {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, "fr");
        await initI18n();
        expect(locale()).toBe("es");
    });
});

describe("formateadores y catálogos", () => {
    it("siguen el idioma activo", () => {
        const now = Date.parse("2026-09-26T12:00:00Z");
        expect(timeAgo("2026-09-26T11:58:00Z", now)).toBe("hace 2 minutos");
        expect(describeAction("WATER_PUMP", "ACTIVATE", 15)).toBe("Encender bomba de agua por 15 s");
        expect(formatMetric("temperature", 23.456)).toBe("23,5 °C");
        expect(validateEmail("")).toBe("El correo es obligatorio");

        setLocale("en");
        expect(timeAgo("2026-09-26T11:58:00Z", now)).toBe("2 minutes ago");
        expect(timeAgo(null, now)).toBe("never");
        expect(describeAction("WATER_PUMP", "ACTIVATE", 15)).toBe("Turn on water pump for 15 s");
        expect(describeAction("UV_LIGHT", "DEACTIVATE")).toBe("Turn off uv light");
        expect(formatMetric("temperature", 23.456)).toBe("23.5 °C");
        expect(formatDateTime("2026-09-26T12:00:00Z")).toMatch(/Sep/);
        expect(validateEmail("")).toBe("Email is required");
    });
});

function renderLogin() {
    const history = createMemoryHistory();
    history.set({value: "/login"});
    render(() => (
        <AuthProvider>
            <MemoryRouter history={history}>
                <Route path="/login" component={() => <><PreferenceToggles/><LoginPage/></>}/>
            </MemoryRouter>
        </AuthProvider>
    ));
}

describe("cambio de idioma en una vista", () => {
    it("traduce la pantalla de ingreso en tiempo real y conserva el idioma", async () => {
        renderLogin();
        expect(screen.getByRole("heading", {name: "Ingresa a SmartPot"})).toBeInTheDocument();
        expect(screen.getByLabelText("Correo")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: /Cambiar a English/}));

        expect(screen.getByRole("heading", {name: "Sign in to SmartPot"})).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Sign in"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /Switch to Español/})).toBeInTheDocument();
        expect(document.title).toContain("Sign in");
        expect(document.documentElement.lang).toBe("en");

        await userEvent.click(screen.getByRole("button", {name: "Sign in"}));
        expect(await screen.findByText("Email is required")).toBeInTheDocument();
    });

    it("el selector del perfil marca el idioma activo y lo cambia", async () => {
        render(() => <PreferenceSelectors/>);
        const spanish = screen.getByRole("radio", {name: "Español"});
        const english = screen.getByRole("radio", {name: "English"});
        expect(spanish).toHaveAttribute("aria-checked", "true");
        expect(english).toHaveAttribute("aria-checked", "false");

        await userEvent.click(english);

        expect(english).toHaveAttribute("aria-checked", "true");
        expect(screen.getByRole("radiogroup", {name: "Language"})).toBeInTheDocument();
        expect(screen.getByRole("radio", {name: "Dark"})).toBeInTheDocument();
    });
});
