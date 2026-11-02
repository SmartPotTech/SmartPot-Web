import "@testing-library/jest-dom/vitest";
import {cleanup} from "@solidjs/testing-library";
import {afterEach} from "vitest";
import {loadLocale, setLocale} from "../lib/i18n";
import {setThemePreference} from "../lib/theme";

// El inglés se descarga bajo demanda en la app; en las pruebas ya está listo para que el cambio sea inmediato.
await loadLocale("en");

afterEach(() => {
    cleanup();
    setLocale("es", {persist: false});
    setThemePreference("system", {persist: false});
    window.localStorage.clear();
    window.sessionStorage.clear();
});
