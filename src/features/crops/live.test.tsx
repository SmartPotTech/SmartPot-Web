import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cropApi } from "../../lib/api/services";
import type { Actuator, ActuatorType, Command, Crop, VirtualDevice } from "../../lib/api/types";
import { ConnectionGuide } from "./components/ConnectionGuide";
import { CreateCropDialog } from "./components/CreateCropDialog";
import { CropHero } from "./components/CropHero";
import { CropScene, type CropSceneProps } from "./components/scene/CropScene";
import { liveStatus, runningActuators } from "./live";

vi.mock("../../lib/api/services", () => ({
  cropApi: { create: vi.fn() },
  commandApi: { send: vi.fn() },
  virtualDeviceApi: { get: vi.fn(), configure: vi.fn(), pause: vi.fn(), places: vi.fn() },
}));

const NOW = Date.parse("2026-09-27T12:00:00Z");
const ALL: ActuatorType[] = ["WATER_PUMP", "UV_LIGHT", "FAN", "HUMIDIFIER", "NUTRIENT_DOSER", "PH_DOSER"];

const CROP: Crop = {
  id: "c1", name: "Lechugas", type: "LETTUCE", kind: "REAL", form: "NFT", automationEnabled: false,
  device: { online: true, lastSeenAt: null, keyRotatedAt: null }, health: null, createdAt: "2026-09-26T00:00:00Z",
  latestReading: { id: "r1", cropId: "c1", measuredAt: "2026-09-27T11:59:30Z", source: "MQTT",
    measures: { temperature: 21, soilMoisture: 64, brightness: 900 } },
};

const actuator = (type: ActuatorType, active = false): Actuator =>
  ({ id: `a-${type}`, cropId: "c1", type, active, lastChangedAt: null });

const command = (type: ActuatorType, overrides: Partial<Command>): Command => ({
  id: `k-${type}`, cropId: "c1", actuatorId: `a-${type}`, actuatorType: type, action: "ACTIVATE", durationSeconds: 15,
  status: "EXECUTED", source: "USER", reason: null, message: null, createdAt: "2026-09-27T11:59:50Z",
  sentAt: "2026-09-27T11:59:50Z", completedAt: "2026-09-27T11:59:51Z", ...overrides,
});

function scene(props: Partial<CropSceneProps>) {
  return render(<CropScene form="POT" type="LETTUCE" installed={[]} running={new Set()} isDay vigor="healthy"
    label="Escena" {...props} />);
}

describe("cultivo en vivo", () => {
  it("dibuja cada forma con su sistema", () => {
    for (const form of ["POT", "NFT", "TOWER", "RAFT"] as const) {
      const { container, unmount } = scene({ form });
      expect(container.querySelector(`[data-form="${form}"]`)).not.toBeNull();
      unmount();
    }
    const { container } = scene({ form: "NFT" });
    expect(container.querySelectorAll("[data-plant='LETTUCE']")).toHaveLength(12);
  });

  it("dibuja solo los actuadores instalados y anima los encendidos", () => {
    const { container } = scene({ installed: ALL, running: new Set<ActuatorType>(["WATER_PUMP", "FAN", "HUMIDIFIER"]) });
    for (const type of ALL) expect(container.querySelector(`[data-actuator="${type}"]`)).not.toBeNull();
    expect(container.querySelector('[data-actuator="WATER_PUMP"]')).toHaveAttribute("data-on", "true");
    expect(container.querySelector('[data-actuator="UV_LIGHT"]')).toHaveAttribute("data-on", "false");
    expect(container.querySelector('[data-actuator="FAN"] .scene-spin')).not.toBeNull();
    expect(container.querySelectorAll('[data-actuator="HUMIDIFIER"] .scene-mist')).toHaveLength(3);
    expect(container.querySelector('[data-actuator="WATER_PUMP"] .scene-flow')).not.toBeNull();

    const { container: bare } = scene({ installed: ["WATER_PUMP"], running: new Set<ActuatorType>(["FAN"]) });
    expect(bare.querySelector('[data-actuator="FAN"]')).toBeNull();
  });

  it("usa el clima del lugar o el interior, de día o de noche", () => {
    const { container, rerender } = scene({ condition: "RAIN" });
    expect(container.querySelector('[data-backdrop="outdoor"]')).not.toBeNull();
    expect(container.querySelectorAll(".scene-rain line").length).toBeGreaterThan(10);
    expect(container.querySelector(".scene-sun")).toBeNull();
    rerender(<CropScene form="POT" type="TOMATO" installed={[]} running={new Set()} condition="CLEAR" isDay
      vigor="critical" label="Despejado" />);
    expect(container.querySelector(".scene-sun")).not.toBeNull();
    expect(container.querySelector("[data-plant='TOMATO']")).toHaveAttribute("data-vigor", "critical");
    rerender(<CropScene form="POT" type="TOMATO" installed={[]} running={new Set()} isDay={false} vigor="healthy"
      label="Interior" />);
    expect(container.querySelector('[data-backdrop="indoor"]')).not.toBeNull();
  });

  it("sabe qué actuadores siguen encendidos", () => {
    const actuators = [actuator("UV_LIGHT", true), actuator("WATER_PUMP"), actuator("FAN"), actuator("HUMIDIFIER")];
    const commands = [
      command("WATER_PUMP", {}),
      command("FAN", { createdAt: "2026-09-27T11:00:00Z", completedAt: "2026-09-27T11:00:01Z" }),
    ];
    const simulated = [{ actuator: "HUMIDIFIER" as const, until: "2026-09-27T12:03:00Z" }];
    expect([...runningActuators(actuators, commands, simulated, NOW)].sort())
      .toEqual(["HUMIDIFIER", "UV_LIGHT", "WATER_PUMP"]);
    expect(runningActuators(actuators, commands, [], NOW + 60_000).has("WATER_PUMP")).toBe(false);
  });

  it("solo ilustra lo que está conectado", () => {
    expect(liveStatus(CROP)).toBe("live");
    expect(liveStatus({ ...CROP, device: { ...CROP.device, online: false } })).toBe("offline");
    const virtual: Crop = { ...CROP, kind: "VIRTUAL", device: { ...CROP.device, online: false } };
    const simulation = { available: true, active: false, connected: false } as VirtualDevice;
    expect(liveStatus(virtual, simulation)).toBe("paused");
    expect(liveStatus(virtual, { ...simulation, active: true, connected: true })).toBe("live");
    expect(liveStatus({ ...CROP, latestReading: null })).toBe("waiting");
  });

  it("dibuja la especie de cada cultivo en todas las formas", () => {
    const species = ["LETTUCE", "TOMATO", "STRAWBERRY", "BASIL", "SPINACH", "PEPPER"] as const;
    for (const type of species) {
      for (const form of ["POT", "NFT", "TOWER", "RAFT"] as const) {
        const { container, unmount } = scene({ form, type });
        const plants = [...container.querySelectorAll("[data-plant]")].map((plant) => plant.getAttribute("data-plant"));
        expect(plants.length).toBeGreaterThan(0);
        expect(new Set(plants)).toEqual(new Set([type]));
        unmount();
      }
    }
  });

  it("un cultivo real desconectado no se ilustra y lleva a la guía", async () => {
    const onOpenTab = vi.fn();
    render(<CropHero crop={{ ...CROP, device: { ...CROP.device, online: false } }} actuators={[actuator("WATER_PUMP")]}
      commands={[]} onOpenTab={onOpenTab} />);
    expect(screen.getByText("Tu cultivo no está conectado")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("· apagado")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ver cómo conectarlo" }));
    expect(onOpenTab).toHaveBeenCalledWith("device");
  });

  it("la ilustración muestra el estado sin botones de acción", () => {
    render(<CropHero crop={CROP} actuators={[actuator("UV_LIGHT", true), actuator("FAN")]} commands={[]}
      onOpenTab={vi.fn()} />);
    expect(screen.getByRole("img", { name: /Lechuga en tubos NFT, bajo techo, de día; encendidos: luz de cultivo/ }))
      .toBeInTheDocument();
    expect(screen.getByText("· encendido")).toBeInTheDocument();
    expect(screen.getByText("· apagado")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("un cultivo virtual en pausa lleva a su simulación", async () => {
    const onOpenTab = vi.fn();
    const paused = { available: true, active: false, connected: false, running: false, activeActuators: [] } as unknown as VirtualDevice;
    render(<CropHero crop={{ ...CROP, kind: "VIRTUAL" }} actuators={[]} commands={[]} simulation={paused}
      onOpenTab={onOpenTab} />);
    expect(screen.getByText("La simulación está en pausa")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ir a Simulación" }));
    expect(onOpenTab).toHaveBeenCalledWith("simulation");
  });
});

describe("crear un cultivo", () => {
  // jsdom no abre <dialog> con showModal: basta con marcarlo abierto.
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
    };
  });
  beforeEach(() => vi.mocked(cropApi.create).mockReset());

  it("uno virtual arranca su simulación y no pide conexión", async () => {
    vi.mocked(cropApi.create).mockResolvedValue({ crop: { ...CROP, kind: "VIRTUAL" } });
    const onCreated = vi.fn();
    render(<MemoryRouter><CreateCropDialog open onClose={vi.fn()} onCreated={onCreated} /></MemoryRouter>);

    expect(screen.getByText(/El tipo no se puede cambiar después/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: /Virtual/ }));
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await userEvent.type(screen.getByLabelText("Nombre"), "Fresas del patio");
    await userEvent.click(screen.getByRole("radio", { name: "Torre vertical" }));
    expect(screen.getByRole("img", { name: /torre vertical/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Crear cultivo" }));

    expect(cropApi.create).toHaveBeenCalledWith({ name: "Fresas del patio", type: "LETTUCE", kind: "VIRTUAL",
      form: "TOWER", virtual: { mode: "AUTO" } });
    expect(onCreated).toHaveBeenCalled();
    expect(screen.queryByText(/Conecta tu dispositivo/)).toBeNull();
  });

  it("uno real muestra la clave y la guía del ESP32 y de Wokwi", async () => {
    vi.mocked(cropApi.create).mockResolvedValue({ crop: CROP, device: { host: "mqtt.smartpot.app", port: 8883,
      tls: true, username: "c1", key: "clave-secreta-0001",
      topics: { telemetry: "t", commands: "c", commandAck: "a", status: "s" } } });
    render(<MemoryRouter><CreateCropDialog open onClose={vi.fn()} onCreated={vi.fn()} /></MemoryRouter>);

    await userEvent.click(screen.getByRole("radio", { name: /Real/ }));
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await userEvent.type(screen.getByLabelText("Nombre"), "Lechugas");
    await userEvent.click(screen.getByRole("button", { name: "Crear cultivo" }));

    expect(await screen.findByText("Guarda la clave ahora")).toBeInTheDocument();
    expect(screen.getByText("clave-secreta-0001")).toBeInTheDocument();
    expect(screen.getByText("Arma el circuito")).toBeInTheDocument();
    expect(vi.mocked(cropApi.create).mock.calls[0]?.[0]).not.toHaveProperty("virtual");
  });
});

describe("guía de conexión", () => {
  it("Wokwi usa su red y advierte sobre proyectos públicos", async () => {
    render(<ConnectionGuide credentials={{ host: "mqtt.smartpot.app", port: 8883, tls: true, username: "c1",
      topics: { telemetry: "t", commands: "c", commandAck: "a", status: "s" } }} />);
    expect(screen.getByText(/<NOMBRE_DE_TU_RED>/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: /Simulado en Wokwi/ }));
    expect(screen.getByText(/"ssid": "Wokwi-GUEST"/)).toBeInTheDocument();
    expect(screen.getByText(/Deja tu copia del proyecto como privada/)).toBeInTheDocument();
  });
});
