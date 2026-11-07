import {MemoryRouter, Route} from "@solidjs/router";
import {render, screen, waitFor, within} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {AppShell} from "../../components/layout/AppShell";
import {ApiError} from "../../lib/api/client";
import type {AppNotification} from "../../lib/api/types";
import {AuthProvider} from "../auth/AuthProvider";
import {NotificationsPage} from "./NotificationsPage";

const api = vi.hoisted(() => ({
    list: vi.fn(),
    unreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    remove: vi.fn(),
    authSession: vi.fn(),
    authLogout: vi.fn(),
}));

vi.mock("../../lib/api/services", () => ({
    notificationApi: {
        list: api.list,
        unreadCount: api.unreadCount,
        markRead: api.markRead,
        markAllRead: api.markAllRead,
        remove: api.remove,
    },
    authApi: {session: api.authSession, logout: api.authLogout},
}));

const ALERTS: AppNotification[] = [
    {
        id: "n1",
        cropId: "c1",
        type: "ALERT",
        title: "Humedad baja en el sustrato",
        message: "Riega la lechuga antes de que se seque.",
        read: false,
        createdAt: "2026-11-05T10:00:00Z",
    },
    {
        id: "n2",
        cropId: null,
        type: "INFO",
        title: "Bienvenido a SmartPot",
        message: "Tu cuenta está lista.",
        read: true,
        createdAt: "2026-11-04T10:00:00Z",
    },
    {
        id: "n3",
        cropId: "c2",
        type: "AI",
        title: "El asistente recomienda ventilar",
        message: "La temperatura subió en el invernadero.",
        read: false,
        createdAt: "2026-11-05T11:00:00Z",
    },
];

function renderPage() {
    render(() => (
        <MemoryRouter>
            <Route path="*" component={NotificationsPage}/>
        </MemoryRouter>
    ));
}

describe("alertas de la cuenta", () => {
    beforeEach(() => {
        api.list.mockReset().mockResolvedValue(ALERTS);
        api.unreadCount.mockReset().mockResolvedValue({unread: 2});
        api.markRead.mockReset().mockResolvedValue({...ALERTS[0], read: true});
        api.markAllRead.mockReset().mockResolvedValue(undefined);
        api.remove.mockReset().mockResolvedValue(undefined);
        api.authSession.mockReset();
        api.authLogout.mockReset().mockResolvedValue(undefined);
    });

    it("lista las alertas, enlaza su cultivo y cuenta las no leídas", async () => {
        renderPage();

        expect(await screen.findByText("Humedad baja en el sustrato")).toBeInTheDocument();
        expect(screen.getByText("Riega la lechuga antes de que se seque.")).toBeInTheDocument();
        expect(screen.getByText("Bienvenido a SmartPot")).toBeInTheDocument();
        expect(screen.getAllByRole("link", {name: "Ver cultivo"})[0]).toHaveAttribute("href", "/app/crops/c1");
        expect(screen.getAllByRole("button", {name: "Marcar como leída"})).toHaveLength(2);
        expect(screen.getAllByRole("button", {name: "Eliminar alerta"})).toHaveLength(3);
        expect(screen.getByRole("button", {name: "Marcar todas como leídas"})).toBeInTheDocument();
    });

    it("marca una alerta como leída y recarga la lista", async () => {
        api.list
            .mockResolvedValueOnce([ALERTS[0]])
            .mockResolvedValueOnce([{...ALERTS[0], read: true}]);
        renderPage();
        await screen.findByText("Humedad baja en el sustrato");

        await userEvent.click(screen.getByRole("button", {name: "Marcar como leída"}));

        await waitFor(() => expect(api.markRead).toHaveBeenCalledWith("n1"));
        await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
        expect(screen.queryByRole("button", {name: "Marcar como leída"})).toBeNull();
        expect(screen.queryByRole("button", {name: "Marcar todas como leídas"})).toBeNull();
    });

    it("marca todas como leídas de una vez", async () => {
        api.list
            .mockResolvedValueOnce(ALERTS)
            .mockResolvedValueOnce(ALERTS.map((alert) => ({...alert, read: true})));
        renderPage();
        await screen.findByText("Humedad baja en el sustrato");

        await userEvent.click(screen.getByRole("button", {name: "Marcar todas como leídas"}));

        await waitFor(() => expect(api.markAllRead).toHaveBeenCalledOnce());
        await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
        expect(screen.queryByRole("button", {name: "Marcar como leída"})).toBeNull();
        expect(screen.queryByRole("button", {name: "Marcar todas como leídas"})).toBeNull();
    });

    it("borra una alerta y la quita de la lista", async () => {
        api.list
            .mockResolvedValueOnce(ALERTS)
            .mockResolvedValueOnce(ALERTS.slice(1));
        renderPage();
        await screen.findByText("Humedad baja en el sustrato");

        await userEvent.click(screen.getAllByRole("button", {name: "Eliminar alerta"})[0]!);

        await waitFor(() => expect(api.remove).toHaveBeenCalledWith("n1"));
        await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
        expect(screen.queryByText("Humedad baja en el sustrato")).toBeNull();
        expect(screen.getByText("Bienvenido a SmartPot")).toBeInTheDocument();
    });

    it("si borrar devuelve 404 conserva la alerta y no rompe la vista", async () => {
        api.remove.mockImplementation(() => Promise.reject(new ApiError(404, "La alerta no existe.")));
        renderPage();
        await screen.findByText("Humedad baja en el sustrato");

        await userEvent.click(screen.getAllByRole("button", {name: "Eliminar alerta"})[0]!);

        await waitFor(() => expect(api.remove).toHaveBeenCalledWith("n1"));
        expect(await screen.findByText("Humedad baja en el sustrato")).toBeInTheDocument();
        expect(screen.getByRole("heading", {name: "Alertas"})).toBeInTheDocument();
    });

    it("muestra el estado vacío cuando no hay alertas", async () => {
        api.list.mockResolvedValue([]);
        renderPage();

        expect(await screen.findByText("Sin alertas")).toBeInTheDocument();
        expect(screen.getByText(/Aquí verás los avisos de tus cultivos/)).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Marcar todas como leídas"})).toBeNull();
    });

    it("muestra el error de red sin perder el encabezado", async () => {
        api.list.mockImplementation(() => {
            throw new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión.");
        });
        renderPage();

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor. Revisa tu conexión.");
        expect(screen.getByRole("heading", {name: "Alertas"})).toBeInTheDocument();
    });

    it("un 401 tampoco rompe la vista", async () => {
        api.list.mockImplementation(() => {
            throw new ApiError(401, "Tu sesión ha caducado. Vuelve a iniciar sesión.");
        });
        renderPage();

        expect(await screen.findByRole("alert")).toHaveTextContent("Tu sesión ha caducado. Vuelve a iniciar sesión.");
        expect(screen.getByRole("heading", {name: "Alertas"})).toBeInTheDocument();
    });

    it("pide a la API solo las no leídas cuando se activa el filtro", async () => {
        const actual = await vi.importActual<typeof import("../../lib/api/services")>("../../lib/api/services");
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response("[]", {status: 200, headers: {"Content-Type": "application/json"}}),
        );

        await actual.notificationApi.list(true);

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("/notifications?unreadOnly=true&limit=50"),
            expect.anything(),
        );
        fetchMock.mockRestore();
    });
});

describe("contador de alertas", () => {
    beforeEach(() => {
        api.unreadCount.mockReset().mockResolvedValue({unread: 3});
        api.authSession.mockReset();
        api.authLogout.mockReset().mockResolvedValue(undefined);
    });

    it("muestra las no leídas en la navegación", async () => {
        render(() => (
            <MemoryRouter>
                <Route path="*" component={() => (
                    <AuthProvider>
                        <AppShell>
                            <p>Contenido</p>
                        </AppShell>
                    </AuthProvider>
                )}/>
            </MemoryRouter>
        ));

        const counter = await screen.findByText("3");
        expect(counter.closest("a")).toHaveAttribute("href", "/app/notifications");
        expect(within(counter.closest("a") as HTMLElement).getByText("Alertas")).toBeInTheDocument();
    });
});
