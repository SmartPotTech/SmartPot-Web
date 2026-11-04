import {afterEach, describe, expect, it, vi} from "vitest";
import {ApiError, configureApi, request} from "./client";

function respond(status: number, body?: unknown, headers?: Record<string, string>) {
    return vi.fn().mockImplementation(() =>
        Promise.resolve(new Response(body === undefined ? null : JSON.stringify(body), {status, headers})),
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
    configureApi({onUnauthorized: () => undefined});
});

describe("request", () => {
    it("envía credenciales de cookie HttpOnly y captura el token CSRF de respuesta", async () => {
        const fetchMock = respond(200, {ok: true}, {"X-CSRF-Token": "csrf-nuevo"});
        const setCsrfToken = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        configureApi({getCsrfToken: () => "csrf-123", setCsrfToken, onUnauthorized: () => undefined});

        await expect(request("/api/v1/crops")).resolves.toEqual({ok: true});
        const [url, init] = fetchMock.mock.calls[0]!;
        expect(url).toBe("http://localhost:8091/api/v1/crops");
        expect(init.credentials).toBe("include");
        expect(init.headers.Authorization).toBeUndefined();
        expect(init.headers["X-CSRF-Token"]).toBeUndefined();
        expect(setCsrfToken).toHaveBeenCalledWith("csrf-nuevo");
    });

    it("adjunta la cabecera X-CSRF-Token en escrituras autenticadas y la omite en rutas públicas", async () => {
        const fetchMock = respond(200, {ok: true});
        vi.stubGlobal("fetch", fetchMock);
        configureApi({getCsrfToken: () => "csrf-activo", onUnauthorized: () => undefined});

        await request("/api/v1/crops", {method: "POST", body: {name: "Albahaca"}});
        expect(fetchMock.mock.calls[0]![1].headers["X-CSRF-Token"]).toBe("csrf-activo");

        await request("/api/v1/auth/login", {method: "POST", body: {}, auth: false});
        expect(fetchMock.mock.calls[1]![1].headers["X-CSRF-Token"]).toBeUndefined();
    });

    it("traduce los errores de la API con sus campos", async () => {
        vi.stubGlobal("fetch", respond(400, {
            message: "Revisa los datos enviados",
            fields: {email: "El correo no es válido"}
        }));

        await expect(request("/api/v1/auth/register", {method: "POST", body: {}})).rejects.toMatchObject({
            status: 400,
            message: "Revisa los datos enviados",
            fields: {email: "El correo no es válido"},
        });
    });

    it("cierra la sesión ante un 401 en rutas autenticadas", async () => {
        const onUnauthorized = vi.fn();
        vi.stubGlobal("fetch", respond(401, {message: "Tu sesión no es válida o expiró"}));
        configureApi({onUnauthorized});

        await expect(request("/api/v1/crops")).rejects.toBeInstanceOf(ApiError);
        expect(onUnauthorized).toHaveBeenCalledOnce();
    });

    it("usa un mensaje en español cuando no hay red", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

        await expect(request("/api/v1/crops")).rejects.toMatchObject({status: 0});
    });

    it("acepta respuestas sin cuerpo", async () => {
        vi.stubGlobal("fetch", respond(202));
        await expect(request("/api/v1/auth/password/forgot", {method: "POST", body: {}})).resolves.toBeUndefined();
    });

    it("revalida con If-None-Match y reutiliza el cuerpo ante un 304", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response(JSON.stringify([{id: "c1"}]), {status: 200, headers: {ETag: '"v1"'}}))
            .mockResolvedValueOnce(new Response(null, {status: 304}));
        vi.stubGlobal("fetch", fetchMock);
        configureApi({getCacheScope: () => "u1", onUnauthorized: () => undefined});

        await expect(request("/api/v1/crops")).resolves.toEqual([{id: "c1"}]);
        await expect(request("/api/v1/crops")).resolves.toEqual([{id: "c1"}]);
        expect(fetchMock.mock.calls[1]![1].headers["If-None-Match"]).toBe('"v1"');
    });
});
