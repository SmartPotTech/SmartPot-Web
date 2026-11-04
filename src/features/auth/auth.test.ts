import {afterEach, describe, expect, it} from "vitest";
import {
    clearSession,
    CSRF_COOKIE_NAME,
    currentCsrfToken,
    hasSessionCookie,
    loadSession,
    saveSession,
    setCsrfToken,
} from "./session";
import {passwordStrength, validateEmail, validateName, validatePassword} from "./validation";

const AUTH = {
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    user: {id: "u1", name: "Ana", lastName: "Demo", email: "ana@example.com", role: "USER", createdAt: ""},
};

afterEach(() => {
    clearSession();
});

describe("sesión con cookie HttpOnly y CSRF", () => {
    it("mantiene la sesión en memoria sin escribir tokens en localStorage ni sessionStorage", () => {
        window.localStorage.setItem("smartpot.session", "legacy-jwt");
        window.sessionStorage.setItem("smartpot.session", "legacy-jwt");

        saveSession(AUTH);
        expect(window.localStorage.getItem("smartpot.session")).toBeNull();
        expect(window.sessionStorage.getItem("smartpot.session")).toBeNull();
        expect(loadSession()?.user.email).toBe("ana@example.com");
    });

    it("sincroniza el token CSRF desde cabecera o cookie de doble envío", () => {
        expect(hasSessionCookie()).toBe(false);
        document.cookie = `${CSRF_COOKIE_NAME}=csrf-cookie-123; Path=/`;
        expect(currentCsrfToken()).toBe("csrf-cookie-123");
        expect(hasSessionCookie()).toBe(true);

        setCsrfToken("csrf-header-456");
        expect(currentCsrfToken()).toBe("csrf-header-456");
    });

    it("descarta sesiones vencidas y limpia el estado y la cookie CSRF", () => {
        setCsrfToken("csrf-123");
        saveSession({...AUTH, expiresAt: new Date(Date.now() - 1000).toISOString()});
        expect(loadSession()).toBeNull();
        clearSession();
        expect(currentCsrfToken()).toBeNull();
    });
});

describe("validaciones", () => {
    it("replica la política de contraseñas de la API", () => {
        expect(validatePassword("corta1A")).toBeDefined();
        expect(validatePassword("sinmayuscula1")).toBeDefined();
        expect(validatePassword("Tomate2026")).toBeUndefined();
    });

    it("valida correo y nombres", () => {
        expect(validateEmail("ana@")).toBe("El correo no es válido");
        expect(validateEmail("ana@example.com")).toBeUndefined();
        expect(validateName("María José", "nombre", 40)).toBeUndefined();
        expect(validateName("R2D2", "nombre", 40)).toMatch(/solo puede tener letras/);
    });

    it("mide la fuerza de la contraseña", () => {
        expect(passwordStrength("abc").label).toBe("Muy débil");
        expect(passwordStrength("Tomate2026!Seguro").score).toBeGreaterThanOrEqual(4);
    });
});
