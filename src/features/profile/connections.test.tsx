import {render, screen, waitFor, within} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Connection} from "../../lib/api/types";
import {mcpClientConfig} from "../../lib/mcp";

const TOKEN = "spt_" + "x".repeat(43);
const existing: Connection = {
    id: "c1", name: "Portátil", prefix: "spt_abcd1234", scope: "READ",
    createdAt: "2026-10-31T12:00:00Z", lastUsedAt: "2026-11-01T10:00:00Z",
};

const api = vi.hoisted(() => ({
    list: vi.fn(),
    create: vi.fn(),
    revoke: vi.fn(),
}));
vi.mock("../../lib/api/services", () => ({connectionApi: api}));

import {McpConnections} from "./McpConnections";

describe("conexiones MCP", () => {
    beforeEach(() => {
        api.list.mockReset().mockResolvedValue([existing]);
        api.create.mockReset();
        api.revoke.mockReset().mockResolvedValue(undefined);
    });

    it("arma la configuración del cliente con la URL y el token", () => {
        const config = JSON.parse(mcpClientConfig("http://localhost:8002/", TOKEN));
        expect(config.mcpServers.smartpot.url).toBe("http://localhost:8002/mcp");
        expect(config.mcpServers.smartpot.headers.Authorization).toBe(`Bearer ${TOKEN}`);
        expect(JSON.parse(mcpClientConfig("", TOKEN)).mcpServers.smartpot.url).toContain("URL del servidor MCP");
    });

    it("lista las conexiones sin mostrar el token", async () => {
        render(() => <McpConnections/>);
        expect(await screen.findByText("Portátil")).toBeInTheDocument();
        const list = screen.getByRole("list", {name: "Conexiones activas"});
        expect(within(list).getByText("Solo lectura")).toBeInTheDocument();
        expect(within(list).getByText("spt_abcd1234…")).toBeInTheDocument();
    });

    it("pide nombre, crea con el alcance elegido y muestra el token una sola vez", async () => {
        api.create.mockResolvedValue({connection: {...existing, id: "c2", name: "Asistente", scope: "CONTROL"}, token: TOKEN});
        render(() => <McpConnections/>);
        await screen.findByText("Portátil");

        await userEvent.click(screen.getByRole("button", {name: "Crear conexión"}));
        expect(screen.getByText(/Ponle un nombre/)).toBeInTheDocument();
        expect(api.create).not.toHaveBeenCalled();

        await userEvent.type(screen.getByLabelText("Nombre de la conexión"), "Asistente");
        await userEvent.click(screen.getByRole("radio", {name: /Control/}));
        await userEvent.click(screen.getByRole("button", {name: "Crear conexión"}));

        await waitFor(() => expect(api.create).toHaveBeenCalledWith({
            name: "Asistente", scope: "CONTROL", expiresInDays: 30,
        }));
        expect(await screen.findByText(/no se vuelve a mostrar/)).toBeInTheDocument();
        expect(screen.getAllByText(new RegExp(TOKEN)).length).toBeGreaterThan(0);

        await userEvent.click(screen.getByRole("button", {name: "Ya lo guardé"}));
        expect(screen.queryByText(/no se vuelve a mostrar/)).not.toBeInTheDocument();
        expect(screen.queryAllByText(new RegExp(TOKEN))).toHaveLength(0);
    });

    it("revoca tras confirmar", async () => {
        render(() => <McpConnections/>);
        await userEvent.click(await screen.findByRole("button", {name: "Revocar Portátil"}));
        await userEvent.click(screen.getByRole("button", {name: "Sí, revocar", hidden: true}));
        await waitFor(() => expect(api.revoke).toHaveBeenCalledWith("c1"));
        expect(await screen.findByText("Conexión «Portátil» revocada")).toBeInTheDocument();
    });
});
