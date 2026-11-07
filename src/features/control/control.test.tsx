import {render, renderHook, screen, waitFor, within} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {ApiError} from "../../lib/api/client";
import type {BulkCommandResult, Crop} from "../../lib/api/types";
import {BulkResultList} from "./BulkResultList";
import {ControlPage} from "./ControlPage";
import {useBulkCommand} from "./useBulkCommand";

const api = vi.hoisted(() => ({
    list: vi.fn(),
    setAutomation: vi.fn(),
    setAutomationBulk: vi.fn(),
    bulk: vi.fn(),
}));

vi.mock("../../lib/api/services", () => ({
    cropApi: {list: api.list, setAutomation: api.setAutomation, setAutomationBulk: api.setAutomationBulk},
    commandApi: {bulk: api.bulk},
}));

function crop(id: string, name: string, automationEnabled = false): Crop {
    return {
        id,
        name,
        type: "LETTUCE",
        kind: "REAL",
        form: "POT",
        automationEnabled,
        device: {online: true, lastSeenAt: null, keyRotatedAt: null},
        health: null,
        latestReading: null,
        createdAt: "2026-11-01T00:00:00Z",
    };
}

const CROPS = [crop("c1", "Lechugas", true), crop("c2", "Tomates")];

const RESULT: BulkCommandResult = {
    sent: 1,
    skipped: 1,
    failed: 1,
    results: [
        {cropId: "c1", cropName: "Lechugas", status: "SENT", commandId: "k1", message: null},
        {cropId: "c2", cropName: "Tomates", status: "SKIPPED", commandId: null, message: "Ya estaba encendido."},
        {cropId: "c3", cropName: "Fresas", status: "FAILED", commandId: null, message: "El cultivo no respondió."},
    ],
};

const ORDER = {actuatorType: "WATER_PUMP" as const, action: "ACTIVATE" as const, durationSeconds: 15, cropIds: ["c1"]};

describe("control general", () => {
    beforeEach(() => {
        api.list.mockReset().mockResolvedValue(CROPS);
        api.setAutomation.mockReset().mockResolvedValue(CROPS[0]);
        api.setAutomationBulk.mockReset().mockResolvedValue(CROPS);
        api.bulk.mockReset().mockResolvedValue(RESULT);
    });

    const stat = (label: string) =>
        within(screen.getByRole("banner")).getByText(label).previousElementSibling?.textContent;

    it("lista los cultivos con sus contadores y el estado del modo automático", async () => {
        render(() => <ControlPage/>);

        expect(await screen.findByRole("switch", {name: "Modo automático de Lechugas"})).toBeInTheDocument();
        expect(screen.getAllByText("Tomates").length).toBeGreaterThan(0);
        expect(stat("Cultivos")).toBe("2");
        expect(stat("En modo automático")).toBe("1");
        expect(stat("Seleccionados")).toBe("2");
        expect(screen.getByRole("switch", {name: "Modo automático de Lechugas"})).toHaveAttribute("aria-checked", "true");
        expect(screen.getByRole("switch", {name: "Modo automático de Tomates"})).toHaveAttribute("aria-checked", "false");
    });

    it("conmuta el modo automático de un cultivo y de todos a la vez", async () => {
        render(() => <ControlPage/>);
        await screen.findByRole("switch", {name: "Modo automático de Lechugas"});

        await userEvent.click(screen.getByRole("switch", {name: "Modo automático de Lechugas"}));
        await waitFor(() => expect(api.setAutomation).toHaveBeenCalledWith("c1", false));
        await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));

        await userEvent.click(screen.getByRole("button", {name: "Activar en todos"}));
        await waitFor(() => expect(api.setAutomationBulk).toHaveBeenCalledWith(true, undefined));
        await waitFor(() => expect(api.list).toHaveBeenCalledTimes(3));

        await userEvent.click(screen.getByRole("button", {name: "Desactivar"}));
        await waitFor(() => expect(api.setAutomationBulk).toHaveBeenLastCalledWith(false, undefined));
    });

    it("deselecciona un cultivo y envía el atajo solo a los seleccionados", async () => {
        render(() => <ControlPage/>);
        await screen.findByRole("checkbox", {name: "Tomates"});

        await userEvent.click(screen.getByRole("checkbox", {name: "Tomates"}));
        expect(stat("Seleccionados")).toBe("1");

        await userEvent.click(screen.getByRole("button", {name: "Regar 15 s"}));
        await waitFor(() => expect(api.bulk).toHaveBeenCalledWith({
            label: "Regar 15 s",
            actuatorType: "WATER_PUMP",
            action: "ACTIVATE",
            durationSeconds: 15,
            cropIds: ["c1"],
        }));
    });

    it("envía la orden del formulario con el actuador, la acción y la duración elegidos", async () => {
        render(() => <ControlPage/>);
        await screen.findByRole("checkbox", {name: "Tomates"});

        await userEvent.selectOptions(screen.getByLabelText("Actuador"), "UV_LIGHT");
        await userEvent.selectOptions(screen.getByLabelText("Acción"), "DEACTIVATE");
        expect(screen.getByLabelText("Duración")).toBeDisabled();
        await userEvent.click(screen.getByRole("button", {name: "Apagar luz ultravioleta en 2 cultivos"}));

        await waitFor(() => expect(api.bulk).toHaveBeenCalledWith({
            actuatorType: "UV_LIGHT",
            action: "DEACTIVATE",
            durationSeconds: null,
            cropIds: undefined,
        }));
    });

    it("muestra el resultado por cultivo de una orden en bloque", async () => {
        api.bulk.mockResolvedValue({
            sent: 1,
            failed: 1,
            skipped: 0,
            results: [
                {cropId: "c1", cropName: "Lechugas", status: "SENT", commandId: "k1", message: null},
                {cropId: "c2", cropName: "Tomates", status: "FAILED", commandId: null, message: "El cultivo no respondió."},
            ],
        });
        render(() => <ControlPage/>);
        await screen.findByRole("checkbox", {name: "Tomates"});

        await userEvent.click(screen.getByRole("button", {name: "Regar 15 s"}));

        expect(await screen.findByText("1 enviado · 1 con error")).toBeInTheDocument();
        const result = screen.getByRole("status");
        expect(within(result).getByText(/Enviado/)).toBeInTheDocument();
        expect(within(result).getByText(/Falló/)).toBeInTheDocument();
        expect(within(result).getByText(/El cultivo no respondió/)).toBeInTheDocument();
    });

    it("muestra el error de permisos al cambiar el modo automático", async () => {
        api.setAutomationBulk.mockImplementation(() =>
            Promise.reject(new ApiError(403, "No tienes permiso para cambiar el modo automático.")));
        render(() => <ControlPage/>);
        await screen.findByRole("switch", {name: "Modo automático de Lechugas"});

        await userEvent.click(screen.getByRole("button", {name: "Activar en todos"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("No tienes permiso para cambiar el modo automático.");
        expect(screen.getByRole("switch", {name: "Modo automático de Lechugas"})).not.toBeDisabled();
    });

    it("muestra el estado vacío cuando la cuenta no tiene cultivos", async () => {
        api.list.mockResolvedValue([]);
        render(() => <ControlPage/>);

        expect(await screen.findByText("Sin cultivos para controlar")).toBeInTheDocument();
        expect(screen.queryByRole("checkbox")).toBeNull();
    });
});

describe("orden en bloque", () => {
    beforeEach(() => {
        api.bulk.mockReset();
    });

    it("envía la orden y avisa cuando termina", async () => {
        api.bulk.mockResolvedValue(RESULT);
        const onDone = vi.fn();
        const {result} = renderHook(() => useBulkCommand(onDone));

        await result.send("water", ORDER);

        expect(api.bulk).toHaveBeenCalledWith(ORDER);
        expect(result.result).toEqual(RESULT);
        expect(result.error).toBeNull();
        expect(result.sending).toBeNull();
        expect(onDone).toHaveBeenCalledOnce();
    });

    it("conserva el lote parcial cuando un cultivo falla y los demás siguen", async () => {
        api.bulk.mockResolvedValue({
            sent: 2,
            skipped: 0,
            failed: 1,
            results: [
                {cropId: "c1", cropName: "Lechugas", status: "SENT", commandId: "k1", message: null},
                {cropId: "c2", cropName: "Tomates", status: "SENT", commandId: "k2", message: null},
                {cropId: "c3", cropName: "Fresas", status: "FAILED", commandId: null, message: "El cultivo no respondió."},
            ],
        });
        const {result} = renderHook(() => useBulkCommand());

        await result.send("water", ORDER);

        expect(result.result?.sent).toBe(2);
        expect(result.result?.failed).toBe(1);
        expect(result.result?.results.map((item) => item.status)).toEqual(["SENT", "SENT", "FAILED"]);
        expect(result.error).toBeNull();
    });

    it("muestra el error de red sin resultado", async () => {
        api.bulk.mockImplementation(() => {
            throw new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión.");
        });
        const {result} = renderHook(() => useBulkCommand());

        await result.send("water", ORDER);

        expect(result.error).toBe("No se pudo conectar con el servidor. Revisa tu conexión.");
        expect(result.result).toBeNull();
        expect(result.sending).toBeNull();
    });

    it("mantiene el estado de carga mientras viaja la orden", async () => {
        let finish!: (value: BulkCommandResult) => void;
        api.bulk.mockReturnValue(new Promise((resolve) => {
            finish = resolve;
        }));
        const {result} = renderHook(() => useBulkCommand());

        const pending = result.send("water", ORDER);
        expect(result.sending).toBe("water");
        expect(result.result).toBeNull();

        finish(RESULT);
        await pending;
        expect(result.sending).toBeNull();
        expect(result.result).toEqual(RESULT);
    });

    it("limpia el error en el siguiente envío y permite descartar el resultado", async () => {
        api.bulk
            .mockImplementationOnce(() => {
                throw new ApiError(503, "El servicio no está disponible.");
            })
            .mockResolvedValueOnce(RESULT);
        const {result} = renderHook(() => useBulkCommand());

        await result.send("water", ORDER);
        expect(result.error).toBe("El servicio no está disponible.");

        await result.send("water", ORDER);
        expect(result.error).toBeNull();
        expect(result.result).toEqual(RESULT);

        result.clear();
        expect(result.result).toBeNull();
    });
});

describe("resultado en bloque", () => {
    it("pinta los tres estados con sus conteos", () => {
        render(() => <BulkResultList result={RESULT}/>);

        expect(screen.getByText("1 enviado · 1 omitido · 1 con error")).toBeInTheDocument();
        expect(screen.getByText(/Enviado/)).toBeInTheDocument();
        expect(screen.getByText(/Omitido/)).toBeInTheDocument();
        expect(screen.getByText(/Falló/)).toBeInTheDocument();
        expect(screen.getByText("Lechugas")).toBeInTheDocument();
        expect(screen.getByText("Tomates")).toBeInTheDocument();
        expect(screen.getByText("Fresas")).toBeInTheDocument();
    });

    it("expone el resultado como estado accesible con un elemento por cultivo", () => {
        render(() => <BulkResultList result={RESULT}/>);

        const result = screen.getByRole("status");
        expect(within(result).getAllByRole("listitem")).toHaveLength(3);
        expect(within(result).getByText(/Ya estaba encendido/)).toBeInTheDocument();
    });
});
