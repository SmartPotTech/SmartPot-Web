import {describe, expect, it} from "vitest";
import {setLocale} from "./index";
import {st, translateServerText} from "./serverText";

describe("serverText", () => {
    it("traduce errores al español cuando el locale es es", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("Incorrect email or password")).toBe("Correo o contraseña incorrectos");
        expect(translateServerText("Current password is incorrect")).toBe("La contraseña actual no es correcta");
        expect(translateServerText("Please log in to continue")).toBe("Inicia sesión para continuar");
        expect(translateServerText("Water pump is already on")).toBe("La bomba de agua ya está encendida");
    });

    it("mantiene el texto original en inglés cuando el locale es en", async () => {
        await setLocale("en", {persist: false});
        expect(translateServerText("Incorrect email or password")).toBe("Incorrect email or password");
        expect(translateServerText("Water pump is already on")).toBe("Water pump is already on");
        expect(st("Crop disconnected")).toBe("Crop disconnected");
    });

    it("maneja patrones dinámicos correctamente en español", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("«Lettuce» lost connection with SmartPot.")).toBe("«Lettuce» perdió la conexión con SmartPot.");
        expect(translateServerText("Too many requests. Please try again in 15 seconds")).toBe("Demasiadas solicitudes. Por favor intenta de nuevo en 15 segundos.");
    });
});
