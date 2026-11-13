import {MemoryRouter, Route} from "@solidjs/router";
import {render, screen, waitFor, within} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {ApiError} from "../../lib/api/client";
import type {BulkCommandResult, Command, Crop, Fleet} from "../../lib/api/types";
import {ActionsPage} from "./ActionsPage";

const api = vi.hoisted(() => ({
    crops: vi.fn(),
    commands: vi.fn(),
    fleet: vi.fn(),
    bulk: vi.fn(),
}));

vi.mock("../../lib/api/services", () => ({
    cropApi: {list: api.crops},
    commandApi: {listAll: api.commands, bulk: api.bulk},
    overviewApi: {fleet: api.fleet},
}));

function crop(id: string, name: string): Crop {
    return {
        id,
        name,
        type: "LETTUCE",
        kind: "REAL",
        form: "POT",
        automationEnabled: false,
        device: {online: true, lastSeenAt: null, keyRotatedAt: null},
        health: null,
        latestReading: null,
        createdAt: "2026-11-01T00:00:00Z",
    };
}

function command(id: string, overrides: Partial<Command> = {}): Command {
    return {
        id,
        cropId: "c1",
        actuatorId: "a1",
        actuatorType: "WATER_PUMP",
        action: "ACTIVATE",
        durationSeconds: 15,
        status: "EXECUTED",
        source: "USER",
        reason: null,
        message: null,
        createdAt: "2026-11-05T10:00:00Z",
        sentAt: "2026-11-05T10:00:00Z",
        completedAt: "2026-11-05T10:00:01Z",
        ...overrides,
    };
}

const CROPS = [crop("c1", "Lechugas"), crop("c2", "Tomates")];

const COMMANDS = [
    command("k1"),
    command("k2", {
        cropId: "c2", actuatorType: "FAN", durationSeconds: 600, status: "SENT", source: "AGENT",
        reason: "La temperatura subió en el invernadero.",
    }),
    command("k3", {status: "FAILED", message: "El cultivo no respondió."}),
    command("k4", {
        cropId: "c2", actuatorType: "UV_LIGHT", action: "DEACTIVATE", durationSeconds: null,
        status: "EXPIRED", source: "AGENT",
    }),
];

const FLEET: Fleet = {
    averageHealth: 70,
    crops: [
        {id: "c1", name: "Lechugas", cropType: "LETTUCE", rank: 1, health: null, issues: []},
        {id: "c2", name: "Tomates", cropType: "TOMATO", rank: 2, health: null, issues: []},
    ],
    sharedIssues: [],
    groups: [],
    actions: [{
        actuator: "WATER_PUMP",
        action: "ACTIVATE",
        durationSeconds: 30,
        cropIds: ["c1", "c2"],
        reason: "El sustrato está seco: riego automático.",
    }],
    summary: "Hay dos cultivos con sed.",
};

const BULK: BulkCommandResult = {
    sent: 2,
    skipped: 0,
    failed: 0,
    results: [
        {cropId: "c1", cropName: "Lechugas", status: "SENT", commandId: "k1", message: null},
        {cropId: "c2", cropName: "Tomates", status: "SENT", commandId: "k2", message: null},
    ],
};

function renderPage() {
    render(() => (
        <MemoryRouter>
            <Route path="*" component={ActionsPage}/>
        </MemoryRouter>
    ));
}

describe("acciones sugeridas por la IA", () => {
    beforeEach(() => {
        api.crops.mockReset().mockResolvedValue(CROPS);
        api.commands.mockReset().mockResolvedValue(COMMANDS);
        api.fleet.mockReset().mockResolvedValue(FLEET);
        api.bulk.mockReset().mockResolvedValue(BULK);
    });

    it("lista las sugerencias de la flota y las aplica en bloque", async () => {
        renderPage();

        expect(await screen.findByText("Hay dos cultivos con sed.")).toBeInTheDocument();
        expect(screen.getByText("Lechugas, Tomates")).toBeInTheDocument();
        expect(screen.getByText("El sustrato está seco: riego automático.")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Aplicar en 2 cultivos"}));

        await waitFor(() => expect(api.bulk).toHaveBeenCalledWith({
            actuatorType: "WATER_PUMP",
            action: "ACTIVATE",
            durationSeconds: 30,
            cropIds: ["c1", "c2"],
        }));
        expect(await screen.findByText("2 enviados")).toBeInTheDocument();
        await waitFor(() => expect(api.commands).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(api.fleet).toHaveBeenCalledTimes(2));
    });

    it("no rompe la vista cuando el asistente no está disponible", async () => {
        api.fleet.mockImplementation(() => {
            throw new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión.");
        });
        renderPage();

        expect(await screen.findByText("El asistente no está disponible")).toBeInTheDocument();
        expect(screen.getByText("No se pudo conectar con el servidor. Revisa tu conexión.")).toBeInTheDocument();
        const suggestedTab = screen.getByRole("tab", {name: "Sugeridas por la IA"});
        expect(suggestedTab).toHaveAttribute("aria-selected", "true");
        expect(suggestedTab).toHaveAttribute("aria-controls", "actions-panel-suggested");
        const initialPanel = screen.getByRole("tabpanel");
        expect(initialPanel).toHaveAttribute("id", "actions-panel-suggested");
        expect(initialPanel).toHaveAttribute("aria-labelledby", suggestedTab.id);
    });

    it("muestra el estado vacío cuando el agente no propone acciones", async () => {
        api.fleet.mockResolvedValue({...FLEET, actions: []});
        renderPage();

        expect(await screen.findByText("El agente no propone acciones en este momento.")).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /Aplicar/})).toBeNull();
    });
});

describe("historial de acciones", () => {
    beforeEach(() => {
        api.crops.mockReset().mockResolvedValue(CROPS);
        api.commands.mockReset().mockResolvedValue(COMMANDS);
        api.fleet.mockReset().mockResolvedValue(FLEET);
        api.bulk.mockReset().mockResolvedValue(BULK);
    });

    async function openHistory() {
        renderPage();
        await screen.findByText("Hay dos cultivos con sed.");
        const historyTab = screen.getByRole("tab", {name: "Historial"});
        await userEvent.click(historyTab);
        const panel = screen.getByRole("tabpanel");
        expect(historyTab).toHaveAttribute("aria-controls", "actions-panel-history");
        expect(panel).toHaveAttribute("id", "actions-panel-history");
        expect(panel).toHaveAttribute("aria-labelledby", historyTab.id);
        await waitFor(() => expect(within(panel).getAllByRole("listitem")).toHaveLength(4));
        return panel;
    }

    it("filtra por estado y por origen sin volver a consultar la API", async () => {
        const panel = await openHistory();
        expect(within(panel).getAllByRole("listitem")).toHaveLength(4);

        await userEvent.selectOptions(within(panel).getByLabelText("Estado"), "EXECUTED");
        let list = within(panel).getByRole("list");
        expect(within(list).getAllByRole("listitem")).toHaveLength(1);
        expect(within(list).getByText("Ejecutado")).toBeInTheDocument();

        await userEvent.selectOptions(within(panel).getByLabelText("Estado"), "ALL");
        await userEvent.selectOptions(within(panel).getByLabelText("Origen"), "AGENT");
        list = within(panel).getByRole("list");
        expect(within(list).getAllByRole("listitem")).toHaveLength(2);
        expect(within(list).getAllByText("Agente")).toHaveLength(2);
        expect(within(list).getByText("Enviado")).toBeInTheDocument();
        expect(within(list).getByText("Sin respuesta")).toBeInTheDocument();

        await userEvent.selectOptions(within(panel).getByLabelText("Estado"), "EXPIRED");
        expect(within(within(panel).getByRole("list")).getAllByRole("listitem")).toHaveLength(1);
        expect(api.commands).toHaveBeenCalledTimes(1);
        expect(api.commands).toHaveBeenCalledWith(100);
    });

    it("muestra el estado vacío cuando ningún comando cumple los filtros", async () => {
        const panel = await openHistory();

        await userEvent.selectOptions(within(panel).getByLabelText("Estado"), "FAILED");
        await userEvent.selectOptions(within(panel).getByLabelText("Origen"), "AGENT");

        expect(within(panel).getByText("Sin acciones")).toBeInTheDocument();
        expect(within(panel).queryByRole("list")).toBeNull();
    });

    it("muestra el error de sesión sin quitar las pestañas", async () => {
        api.commands.mockImplementation(() => {
            throw new ApiError(401, "Tu sesión ha caducado. Vuelve a iniciar sesión.");
        });
        renderPage();
        await screen.findByText("Hay dos cultivos con sed.");

        await userEvent.click(screen.getByRole("tab", {name: "Historial"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("Tu sesión ha caducado. Vuelve a iniciar sesión.");
        expect(screen.getByRole("tab", {name: "Historial"})).toBeInTheDocument();
        expect(screen.getByRole("tab", {name: "Sugeridas por la IA"})).toBeInTheDocument();
    });

    it("enlaza cada comando con su cultivo y resume los contadores", async () => {
        const panel = await openHistory();

        const links = within(panel).getAllByRole("link");
        expect(links[0]).toHaveAttribute("href", "/app/crops/c1");
        expect(links[1]).toHaveAttribute("href", "/app/crops/c2");
        expect(screen.getByText("Ejecutadas (últimas 100)").previousElementSibling).toHaveTextContent("1");
        expect(screen.getByText("Del agente de IA").previousElementSibling).toHaveTextContent("2");
    });
});
