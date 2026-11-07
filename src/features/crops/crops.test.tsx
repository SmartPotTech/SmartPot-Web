import {createMemoryHistory, MemoryRouter, Route} from "@solidjs/router";
import {fireEvent, render, screen, waitFor} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from "vitest";
import {ApiError} from "../../lib/api/client";
import type {Actuator, Crop, Insight, VirtualDevice} from "../../lib/api/types";
import {setLocale} from "../../lib/i18n";
import {actuatorApi, commandApi, cropApi, cropChannelApi, insightApi, readingApi, virtualDeviceApi} from "../../lib/api/services";
import {ControlPanel} from "./components/ControlPanel";
import {CreateCropDialog} from "./components/CreateCropDialog";
import {HealthGauge} from "./components/HealthGauge";
import {InsightPanel} from "./components/InsightPanel";
import {MetricTile} from "./components/MetricTile";
import {SettingsPanel} from "./components/SettingsPanel";
import {SimulationPanel} from "./components/SimulationPanel";
import CropDetailPage from "./CropDetailPage";
import {firmwareConfig} from "./firmware";

vi.mock("../../lib/api/services", () => ({
    cropApi: {
        get: vi.fn(), profiles: vi.fn(), weather: vi.fn(), setAutomation: vi.fn(),
        create: vi.fn(), update: vi.fn(), remove: vi.fn(),
    },
    actuatorApi: {list: vi.fn(), add: vi.fn(), remove: vi.fn()},
    commandApi: {list: vi.fn(), send: vi.fn()},
    cropChannelApi: {list: vi.fn(), update: vi.fn(), share: vi.fn(), removeRecipient: vi.fn()},
    insightApi: {get: vi.fn()},
    readingApi: {list: vi.fn(), exportCsv: vi.fn()},
    virtualDeviceApi: {get: vi.fn(), configure: vi.fn(), pause: vi.fn(), places: vi.fn()},
}));

vi.mock("../../services/stream", () => ({
    subscribeTelemetryStream: vi.fn(() => ({unsubscribe: vi.fn()})),
}));

const INSIGHT: Insight = {
    cropType: "LETTUCE",
    health: {index: 41.5, level: "POOR", label: "En riesgo"},
    diagnosis: [
        {
            parameter: "soilMoisture", value: 35, status: "LOW", severity: "CRITICAL",
            message: "La humedad del sustrato (35 %) está por debajo del rango ideal (60–80 %).",
            recommendation: "Riega hasta humedecer el sustrato sin encharcarlo.",
        },
        {
            parameter: "ph",
            value: 6.1,
            status: "OPTIMAL",
            severity: "OK",
            message: "El pH está en el rango ideal.",
            recommendation: null,
        },
    ],
    conclusions: [{rule: "drought", title: "Sequía", message: "El sustrato está muy seco.", certainty: 0.9}],
    predictions: [{
        name: "ventilation",
        label: "Necesidad de ventilación",
        probability: 0.12,
        model: "Regresión logística",
    }],
    actions: [{
        actuator: "WATER_PUMP",
        action: "ACTIVATE",
        durationSeconds: 30,
        reason: "El sustrato está seco: riego automático.",
    }],
    summary: "Tu lechuga está en estado «En riesgo» (42/100). Revisa la humedad del sustrato.",
    evaluatedAt: new Date().toISOString(),
};

describe("componentes del cultivo", () => {
    it("MetricTile marca el valor frente al rango ideal", () => {
        render(() => <MetricTile metric="ph" value={7.2} range={{min: 5.5, max: 6.5, unit: "pH", label: "el pH"}}/>);
        expect(screen.getByText("7,2")).toBeInTheDocument();
        expect(screen.getByText("Alto")).toBeInTheDocument();
        expect(screen.getByText("Ideal: 5.5–6.5 pH")).toBeInTheDocument();
    });

    it("HealthGauge anuncia el índice de salud", () => {
        render(() => <HealthGauge index={82.4} level="GOOD" label="Saludable"/>);
        expect(screen.getByLabelText("Salud 82 de 100, Saludable")).toBeInTheDocument();
    });

    it("InsightPanel muestra diagnóstico, conclusiones y ejecuta acciones", async () => {
        const onRunAction = vi.fn().mockResolvedValue(undefined);
        const pump = {id: "a1", cropId: "c1", type: "WATER_PUMP" as const, active: false, lastChangedAt: null};
        render(() => <InsightPanel insight={INSIGHT} error={null} loading={false} actuators={[pump]}
                                   onRefresh={() => undefined} onRunAction={onRunAction}/>);

        expect(screen.getByText(INSIGHT.summary)).toBeInTheDocument();
        expect(screen.getByText("Sequía")).toBeInTheDocument();
        expect(screen.getByText("Riega hasta humedecer el sustrato sin encharcarlo.")).toBeInTheDocument();
        expect(screen.getByText("12 %")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Ejecutar"}));
        expect(onRunAction).toHaveBeenCalledWith(INSIGHT.actions[0], pump);
    });

    it("InsightPanel presenta la luz baja nocturna como descanso", () => {
        const night: Insight = {
            ...INSIGHT, actions: [], diagnosis: [
                {
                    parameter: "brightness", value: 20, status: "REST", severity: "OK",
                    message: "Es de noche: la planta descansa y la luz baja (20 lux) es normal entre las 22:00 y las 6:00.",
                    recommendation: null,
                },
            ],
        };
        render(() => <InsightPanel insight={night} error={null} loading={false} actuators={[]}
                                   onRefresh={() => undefined} onRunAction={vi.fn()}/>);

        expect(screen.getByText(/^Descanso/)).toBeInTheDocument();
        expect(screen.getByText(/Es de noche: la planta descansa/)).toBeInTheDocument();
        expect(screen.getByText("Todas las variables están en su rango ideal.")).toBeInTheDocument();
    });

    it("InsightPanel muestra el pronóstico y de qué depende el índice", () => {
        const withForecast: Insight = {
            ...INSIGHT, actions: [],
            health: {...INSIGHT.health, byParameter: {soilMoisture: 20, ph: 100}},
            forecasts: [{
                parameter: "soilMoisture", current: 64, slopePerHour: -6, expectedIn3h: 46, trend: "FALLING",
                hoursToLimit: 0.66, limit: "MIN", confidence: 1,
                message: "La humedad del sustrato baja 6 % por hora: llegará al mínimo (60 %) en unos 40 minutos.",
            },
            {
                parameter: "ph", current: 6.1, slopePerHour: 0, expectedIn3h: 6.1, trend: "STABLE", confidence: 1,
                message: "El pH se mantiene estable.",
            }],
        };
        render(() => <InsightPanel insight={withForecast} error={null} loading={false} actuators={[]}
                                   onRefresh={() => undefined} onRunAction={vi.fn()}/>);

        expect(screen.getByText("Pronóstico de las próximas horas")).toBeInTheDocument();
        expect(screen.getByText("Saldrá del rango ideal en unos 40 min")).toBeInTheDocument();
        expect(screen.getAllByText(/Saldrá del rango ideal/)).toHaveLength(1);
        expect(screen.getByText("De qué depende el índice")).toBeInTheDocument();
    });

    it("genera la configuración del firmware sin exponer claves ausentes", () => {
        const config = firmwareConfig({
            host: "mqtt.smartpot.app", port: 8883, tls: true, username: "c1",
            topics: {telemetry: "t", commands: "c", commandAck: "a", status: "s"},
        });
        const parsed = JSON.parse(config);
        expect(parsed.SMARTPOT).toMatchObject({crop_id: "c1", tls: true, host: "mqtt.smartpot.app", port: 8883});
        expect(parsed.SMARTPOT.device_key).toBe("<CLAVE_DEL_DISPOSITIVO>");
        expect(parsed.WIFI.ssid).toBe("<NOMBRE_DE_TU_RED>");
        expect(parsed.BROKER).toEqual({CA_CRT: "<CA_DE_SMARTPOT>"});
        expect(Object.keys(parsed)).toEqual(["WIFI", "SMARTPOT", "BROKER"]);
        expect(firmwareConfig({
            host: "h", port: 8883, tls: true, username: "c1", key: "k",
            topics: {telemetry: "t", commands: "c", commandAck: "a", status: "s"},
        }, "wokwi")).toContain('"ssid": "Wokwi-GUEST"');
        // Mismas claves que config.example.json de los dos firmwares.
        expect(Object.keys(JSON.parse(firmwareConfig({
            host: "h", port: 8883, tls: true, username: "c1", key: "k",
            topics: {telemetry: "t", commands: "c", commandAck: "a", status: "s"},
        })).SMARTPOT)).toEqual(["crop_id", "device_key", "host", "port", "tls", "interval_seconds"]);
    });

    it("lleva la CA del broker en BROKER, también sin TLS", () => {
        const credentials = {
            host: "h", port: 8883, tls: true, username: "c1",
            topics: {telemetry: "t", commands: "c", commandAck: "a", status: "s"},
        };
        const ca = "-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----";
        expect(JSON.parse(firmwareConfig(credentials, "esp32", `${ca}\n`)).BROKER.CA_CRT).toBe(ca);
        expect(JSON.parse(firmwareConfig({...credentials, port: 1883, tls: false}, "esp32", ca)).BROKER.CA_CRT)
            .toBe("");
    });
});

const CROP: Crop = {
    id: "c1",
    name: "Lechuga del balcón",
    type: "LETTUCE",
    kind: "REAL",
    form: "POT",
    automationEnabled: false,
    device: {online: true, lastSeenAt: null, keyRotatedAt: null},
    health: {index: 82.4, level: "GOOD", label: "Healthy", evaluatedAt: new Date().toISOString()},
    latestReading: {
        id: "r1", cropId: "c1", measuredAt: new Date().toISOString(), source: "MQTT",
        measures: {temperature: 21, soilMoisture: 64},
    },
    createdAt: new Date().toISOString(),
};

const PROFILE = {
    type: "LETTUCE" as const,
    name: "Lettuce",
    description: "",
    ranges: {
        temperature: {min: 15, max: 22, unit: "°C", label: "temperature"},
        soilMoisture: {min: 60, max: 80, unit: "%", label: "substrate moisture"},
    },
};

const EN_INSIGHT: Insight = {
    cropType: "LETTUCE",
    health: {index: 82.4, level: "GOOD", label: "Healthy"},
    diagnosis: [
        {
            parameter: "temperature", value: 21, status: "OPTIMAL", severity: "OK",
            message: "Temperature is within the optimal range (15–22 °C).", recommendation: null,
        },
    ],
    conclusions: [{
        rule: "ideal_conditions",
        title: "Ideal conditions",
        message: "All measured variables are within their optimal range. Great job!",
        certainty: 1,
    }],
    predictions: [{name: "ventilation", label: "Ventilation need", probability: 0.12, model: "Logistic regression"}],
    actions: [],
    forecasts: [{
        parameter: "soilMoisture", current: 64, slopePerHour: -2, expectedIn3h: 58, trend: "FALLING",
        hoursToLimit: 1.4, limit: "MIN", confidence: 1,
        message: "Substrate moisture is falling 2 % per hour: it will reach the minimum (60 %) in about 1 h.",
    }],
    summary: "Your lettuce is in \"Healthy\" condition (82/100). All measured variables are within their optimal range.",
    evaluatedAt: new Date().toISOString(),
};

describe("asistente IA en el detalle", () => {
    it("sale de Analizando al abrir la pestaña y pinta resumen, medidor, reglas y pronóstico en es y en", async () => {
        vi.mocked(cropApi.get).mockResolvedValue(CROP);
        vi.mocked(cropApi.profiles).mockResolvedValue([PROFILE]);
        vi.mocked(actuatorApi.list).mockResolvedValue([]);
        vi.mocked(commandApi.list).mockResolvedValue([]);
        vi.mocked(readingApi.list).mockResolvedValue([]);
        vi.mocked(insightApi.get).mockClear();
        vi.mocked(insightApi.get).mockResolvedValue(EN_INSIGHT);
        await setLocale("es", {persist: false});

        const history = createMemoryHistory();
        history.set({value: "/app/crops/c1"});
        render(() => (
            <MemoryRouter history={history}>
                <Route path="/app/crops/:cropId" component={CropDetailPage}/>
            </MemoryRouter>
        ));

        expect(await screen.findByRole("heading", {name: "Lechuga del balcón"})).toBeInTheDocument();
        expect(insightApi.get).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole("button", {name: "Asistente IA"}));

        expect(await screen.findByText(/Tu lechuga está en condición "Saludable" \(82\/100\)/)).toBeInTheDocument();
        expect(insightApi.get).toHaveBeenCalledWith("c1");
        expect(screen.queryByText(/Analizando tu cultivo/)).toBeNull();
        expect(screen.getByText("Condiciones ideales")).toBeInTheDocument();
        expect(screen.getByText("Pronóstico de las próximas horas")).toBeInTheDocument();
        expect(screen.getByLabelText(/Salud 82 de 100/)).toBeInTheDocument();

        await setLocale("en", {persist: false});
        expect(await screen.findByText(/Your lettuce is in "Healthy" condition \(82\/100\)/)).toBeInTheDocument();
        expect(screen.getByText("Ideal conditions")).toBeInTheDocument();
        expect(screen.getByText("Forecast for the next hours")).toBeInTheDocument();
        expect(screen.getByLabelText(/Health 82 of 100/)).toBeInTheDocument();
    });
});

const VIRTUAL: Crop = {...CROP, kind: "VIRTUAL"};

const PUMP: Actuator = {id: "a1", cropId: "c1", type: "WATER_PUMP", active: false, lastChangedAt: null};

const SIMULATION: VirtualDevice = {
    cropId: "c1",
    available: true,
    active: true,
    running: true,
    connected: true,
    mode: "AUTO",
    manual: null,
    location: null,
    intervalSeconds: 30,
    lastPublishedAt: "2026-11-05T10:00:00Z",
    activeActuators: [],
};

const PLACE = {
    name: "Medellín", latitude: 6.2518, longitude: -75.5636, country: "Colombia", region: "Antioquia",
};
const LOCATION = {name: PLACE.name, latitude: PLACE.latitude, longitude: PLACE.longitude};

const MEDELLIN_LOCATION = {
    temperature: 24, humidity: 55, cloudCover: 10, radiation: 700, precipitation: 0, pressure: 850,
    windSpeed: 3, isDay: true, code: 1, condition: "MOSTLY_CLEAR" as const, label: "Mayormente despejado",
    observedAt: "2026-11-05T10:00:00Z",
};

function renderCreate(onCreated = vi.fn()) {
    render(() => (
        <MemoryRouter>
            <Route path="*" component={() => <CreateCropDialog open onClose={vi.fn()} onCreated={onCreated}/>}/>
        </MemoryRouter>
    ));
    return onCreated;
}

async function openVirtual(name: string) {
    await userEvent.click(screen.getByRole("radio", {name: /Virtual/}));
    await userEvent.click(screen.getByRole("button", {name: "Siguiente"}));
    await userEvent.type(screen.getByLabelText("Nombre"), name);
}

describe("alta de un cultivo virtual", () => {
    beforeAll(() => {
        HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
            this.setAttribute("open", "");
        };
        HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
            this.removeAttribute("open");
        };
        Object.defineProperty(window, "scrollTo", {configurable: true, writable: true, value: vi.fn()});
    });
    beforeEach(() => {
        vi.mocked(cropApi.create).mockReset();
        vi.mocked(virtualDeviceApi.places).mockReset().mockResolvedValue([PLACE]);
    });

    it("configura el modo clima real con la ubicación buscada", async () => {
        vi.mocked(cropApi.create).mockResolvedValue({
            crop: {...CROP, name: "Tomates del techo", type: "TOMATO", kind: "VIRTUAL"},
        });
        const onCreated = renderCreate();

        await openVirtual("Tomates del techo");
        await userEvent.selectOptions(screen.getByLabelText("Especie"), "TOMATO");
        await userEvent.click(screen.getByRole("radio", {name: /Al aire libre/}));
        await userEvent.click(screen.getByRole("radio", {name: /Clima real/}));
        await userEvent.type(screen.getByLabelText("Buscar ciudad o municipio"), "Medellín");
        await userEvent.click(screen.getByRole("button", {name: "Buscar"}));
        await userEvent.click(await screen.findByRole("button", {name: /Medellín/}));
        expect(screen.getByText(/Sigue el clima de Medellín/)).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Crear cultivo"}));

        await waitFor(() => expect(cropApi.create).toHaveBeenCalledWith({
            name: "Tomates del techo",
            type: "TOMATO",
            kind: "VIRTUAL",
            form: "POT",
            placement: {setting: "OUTDOOR", exposure: "FULL_SUN", location: LOCATION},
            virtual: {mode: "WEATHER", location: LOCATION},
        }));
        expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({name: "Tomates del techo"}));
    });

    it("exige un nombre de al menos dos caracteres", async () => {
        renderCreate();
        await openVirtual("A");

        await userEvent.click(screen.getByRole("button", {name: "Crear cultivo"}));

        expect(await screen.findByText("Ponle un nombre de al menos 2 caracteres")).toBeInTheDocument();
        expect(cropApi.create).not.toHaveBeenCalled();
    });

    it("exige la ubicación cuando el modo es clima real", async () => {
        renderCreate();
        await openVirtual("Orquídeas del balcón");
        await userEvent.click(screen.getByRole("radio", {name: /Clima real/}));

        await userEvent.click(screen.getByRole("button", {name: "Crear cultivo"}));

        expect(await screen.findByText("Elige la ubicación del cultivo: su clima es el que se simula.")).toBeInTheDocument();
        expect(cropApi.create).not.toHaveBeenCalled();
    });

    it("muestra el conflicto de nombre que devuelve la API", async () => {
        vi.mocked(cropApi.create).mockImplementation(() =>
            Promise.reject(new ApiError(409, "Ya tienes un cultivo con ese nombre.")));
        const onCreated = renderCreate();

        await userEvent.click(screen.getByRole("radio", {name: /Real/}));
        await userEvent.click(screen.getByRole("button", {name: "Siguiente"}));
        await userEvent.type(screen.getByLabelText("Nombre"), "Lechugas");
        await userEvent.click(screen.getByRole("button", {name: "Crear cultivo"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("Ya tienes un cultivo con ese nombre.");
        expect(screen.getByRole("button", {name: "Crear cultivo"})).toBeInTheDocument();
        expect(onCreated).not.toHaveBeenCalled();
    });
});

describe("simulación del cultivo virtual", () => {
    beforeEach(() => {
        vi.mocked(virtualDeviceApi.configure).mockReset();
        vi.mocked(virtualDeviceApi.pause).mockReset().mockResolvedValue(undefined);
    });

    function renderSimulation(simulation: VirtualDevice = SIMULATION, onSaved = vi.fn()) {
        render(() => (
            <SimulationPanel crop={VIRTUAL} simulation={simulation} profile={PROFILE}
                             onSaved={onSaved} onPaused={vi.fn()} onOpenTab={vi.fn()}/>
        ));
        return onSaved;
    }

    it("guarda el modo manual con los medidores y la frecuencia elegidos", async () => {
        vi.mocked(virtualDeviceApi.configure).mockResolvedValue({...SIMULATION, mode: "MANUAL", intervalSeconds: 60});
        const onSaved = renderSimulation();

        await userEvent.click(screen.getByRole("radio", {name: /Manual/}));
        expect(screen.getByRole("slider", {name: "Temperatura"})).toHaveValue("18.5");
        fireEvent.input(screen.getByRole("slider", {name: "Temperatura"}), {target: {value: "21"}});
        await userEvent.selectOptions(screen.getByLabelText("Una lectura cada"), "60");
        await userEvent.click(screen.getByRole("button", {name: "Aplicar cambios"}));

        await waitFor(() => expect(virtualDeviceApi.configure).toHaveBeenCalledWith("c1", {
            mode: "MANUAL",
            intervalSeconds: 60,
            manual: expect.objectContaining({temperature: 21, soilMoisture: 70}),
        }));
        expect(onSaved).toHaveBeenCalled();
        expect(await screen.findByText("Cambios aplicados")).toBeInTheDocument();
    });

    it("cambia a clima real y conserva el lugar ya guardado", async () => {
        const saved = {...SIMULATION, location: LOCATION, mode: "WEATHER" as const};
        vi.mocked(virtualDeviceApi.configure).mockResolvedValue(saved);
        const onSaved = renderSimulation({...SIMULATION, location: LOCATION});

        await userEvent.click(screen.getByRole("radio", {name: /Clima real/}));
        await userEvent.click(screen.getByRole("button", {name: "Aplicar cambios"}));

        await waitFor(() => expect(virtualDeviceApi.configure).toHaveBeenCalledWith("c1", {
            mode: "WEATHER",
            intervalSeconds: 30,
            location: LOCATION,
        }));
        expect(onSaved).toHaveBeenCalledWith(saved);
    });

    it("exige un lugar antes de guardar el clima real", async () => {
        renderSimulation();
        await userEvent.click(screen.getByRole("radio", {name: /Clima real/}));

        await userEvent.click(screen.getByRole("button", {name: "Aplicar cambios"}));

        expect(await screen.findByText("Elige el lugar cuyo clima seguirá el cultivo.")).toBeInTheDocument();
        expect(virtualDeviceApi.configure).not.toHaveBeenCalled();
    });

    it("muestra el error del servidor al guardar la simulación", async () => {
        vi.mocked(virtualDeviceApi.configure).mockImplementation(() =>
            Promise.reject(new ApiError(503, "El simulador no está disponible.")));
        const onSaved = renderSimulation();

        await userEvent.click(screen.getByRole("button", {name: "Aplicar cambios"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("El simulador no está disponible.");
        expect(onSaved).not.toHaveBeenCalled();
        expect(screen.queryByText("Cambios aplicados")).toBeNull();
    });

    it("refleja la configuración guardada al abrir la pestaña", () => {
        renderSimulation({
            ...SIMULATION,
            mode: "MANUAL",
            manual: {temperature: 24, soilMoisture: 70},
            intervalSeconds: 60,
            weather: MEDELLIN_LOCATION,
        });

        expect(screen.getByRole("radio", {name: /Manual/})).toHaveAttribute("aria-checked", "true");
        expect(screen.getByRole("slider", {name: "Temperatura"})).toHaveValue("24");
        expect(screen.getByLabelText("Una lectura cada")).toHaveValue("60");
    });
});

describe("ajustes del cultivo", () => {
    beforeEach(() => {
        vi.mocked(cropApi.update).mockReset();
        vi.mocked(cropApi.remove).mockReset();
        vi.mocked(cropChannelApi.list).mockReset().mockResolvedValue([]);
    });

    function renderSettings(onSaved = vi.fn()) {
        render(() => (
            <MemoryRouter>
                <Route path="*" component={() => <SettingsPanel crop={CROP} onSaved={onSaved}/>}/>
            </MemoryRouter>
        ));
        return onSaved;
    }

    it("actualiza nombre, especie y forma del cultivo", async () => {
        const updated = {...CROP, name: "Tomates del balcón", type: "TOMATO" as const, form: "TOWER" as const};
        vi.mocked(cropApi.update).mockResolvedValue(updated);
        const onSaved = renderSettings();

        const name = screen.getByLabelText("Nombre");
        await userEvent.clear(name);
        await userEvent.type(name, "Tomates del balcón");
        await userEvent.selectOptions(screen.getByLabelText("Especie"), "TOMATO");
        await userEvent.selectOptions(screen.getByLabelText("Forma del cultivo"), "TOWER");
        await userEvent.click(screen.getByRole("button", {name: "Guardar cambios"}));

        await waitFor(() => expect(cropApi.update).toHaveBeenCalledWith("c1", {
            name: "Tomates del balcón",
            type: "TOMATO",
            form: "TOWER",
            placement: undefined,
        }));
        expect(onSaved).toHaveBeenCalledWith(updated);
        expect(await screen.findByText("Cambios guardados")).toBeInTheDocument();
    });

    it("valida el nombre antes de enviar los ajustes", async () => {
        renderSettings();

        const name = screen.getByLabelText("Nombre");
        await userEvent.clear(name);
        await userEvent.type(name, "A");
        await userEvent.click(screen.getByRole("button", {name: "Guardar cambios"}));

        expect(await screen.findByText("El nombre debe tener al menos 2 caracteres")).toBeInTheDocument();
        expect(cropApi.update).not.toHaveBeenCalled();
    });

    it("muestra el conflicto al guardar los ajustes", async () => {
        vi.mocked(cropApi.update).mockImplementation(() =>
            Promise.reject(new ApiError(409, "Ya existe un cultivo con ese nombre.")));
        renderSettings();

        await userEvent.click(screen.getByRole("button", {name: "Guardar cambios"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe un cultivo con ese nombre.");
    });

    it("guarda el lugar del cultivo por separado", async () => {
        vi.mocked(cropApi.update).mockResolvedValue({...CROP, placement: {setting: "OUTDOOR", exposure: "PARTIAL_SUN"}});
        renderSettings();

        await userEvent.click(screen.getByRole("radio", {name: /Al aire libre/}));
        await userEvent.click(screen.getByRole("button", {name: "Guardar lugar"}));

        await waitFor(() => expect(cropApi.update).toHaveBeenCalledWith("c1", {
            name: CROP.name,
            type: CROP.type,
            form: CROP.form,
            placement: {setting: "OUTDOOR", exposure: "PARTIAL_SUN"},
        }));
        expect(await screen.findByText("Lugar guardado: la ilustración y el asistente ya lo usan")).toBeInTheDocument();
    });
});

describe("automatización y actuadores del cultivo", () => {
    beforeEach(() => {
        vi.mocked(actuatorApi.add).mockReset();
        vi.mocked(actuatorApi.remove).mockReset().mockResolvedValue(undefined);
    });

    function renderControl(crop: Crop = CROP, actuators: Actuator[] = [PUMP], onAutomation = vi.fn()) {
        const onChanged = vi.fn();
        const view = render(() => (
            <ControlPanel crop={crop} actuators={actuators} commands={[]}
                          onAutomation={onAutomation} onChanged={onChanged}/>
        ));
        return {onAutomation, onChanged, unmount: view.unmount};
    }

    it("activa y desactiva el modo automático del cultivo", async () => {
        const enabled = vi.fn().mockResolvedValue(undefined);
        const first = renderControl(CROP, [PUMP], enabled);
        await userEvent.click(screen.getByRole("switch", {name: "Modo automático"}));
        await waitFor(() => expect(enabled).toHaveBeenLastCalledWith(true));
        expect(first.onChanged).toHaveBeenCalled();

        first.unmount();
        const disabled = vi.fn().mockResolvedValue(undefined);
        render(() => (
            <ControlPanel crop={{...CROP, automationEnabled: true}} actuators={[PUMP]} commands={[]}
                          onAutomation={disabled} onChanged={vi.fn()}/>
        ));
        await userEvent.click(screen.getByRole("switch", {name: "Modo automático"}));
        await waitFor(() => expect(disabled).toHaveBeenLastCalledWith(false));
    });

    it("muestra el error de permisos al cambiar la automatización", async () => {
        const denied = vi.fn().mockImplementation(() =>
            Promise.reject(new ApiError(403, "No tienes permiso para automatizar este cultivo.")));
        renderControl(CROP, [PUMP], denied);

        await userEvent.click(screen.getByRole("switch", {name: "Modo automático"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("No tienes permiso para automatizar este cultivo.");
        expect(screen.getByRole("switch", {name: "Modo automático"})).not.toBeDisabled();
    });

    it("agrega y quita actuadores", async () => {
        vi.mocked(actuatorApi.add).mockResolvedValue({...PUMP, id: "a2", type: "FAN"});
        const {onChanged} = renderControl();

        await userEvent.selectOptions(screen.getByLabelText("Agregar actuador"), "FAN");
        await userEvent.click(screen.getByRole("button", {name: "Agregar"}));

        await waitFor(() => expect(actuatorApi.add).toHaveBeenCalledWith("c1", "FAN"));
        expect(onChanged).toHaveBeenCalledTimes(1);

        await userEvent.click(screen.getByRole("button", {name: "Quitar Bomba de agua"}));

        await waitFor(() => expect(actuatorApi.remove).toHaveBeenCalledWith("c1", "a1"));
        expect(onChanged).toHaveBeenCalledTimes(2);
    });
});

describe("exportar lecturas a CSV", () => {
    const CSV = "measuredAt,temperature\n2026-11-05T10:00:00Z,21\n";
    const createObjectURL = vi.fn((blob: Blob) => `blob:smartpot-${blob.size}`);
    const revokeObjectURL = vi.fn((url: string) => {
        void url;
    });
    beforeAll(() => {
        Object.defineProperty(URL, "createObjectURL", {configurable: true, writable: true, value: createObjectURL});
        Object.defineProperty(URL, "revokeObjectURL", {configurable: true, writable: true, value: revokeObjectURL});
    });
    beforeEach(() => {
        createObjectURL.mockClear();
        revokeObjectURL.mockClear();
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
        vi.mocked(cropApi.get).mockResolvedValue(CROP);
        vi.mocked(cropApi.profiles).mockResolvedValue([PROFILE]);
        vi.mocked(actuatorApi.list).mockResolvedValue([]);
        vi.mocked(commandApi.list).mockResolvedValue([]);
        vi.mocked(readingApi.list).mockResolvedValue([]);
    });
    afterEach(() => vi.restoreAllMocks());

    it("llama al endpoint y descarga el archivo con el nombre del cultivo", async () => {
        vi.mocked(readingApi.exportCsv).mockResolvedValue(CSV);
        const history = createMemoryHistory();
        history.set({value: "/app/crops/c1"});
        render(() => (
            <MemoryRouter history={history}>
                <Route path="/app/crops/:cropId" component={CropDetailPage}/>
            </MemoryRouter>
        ));
        expect(await screen.findByRole("heading", {name: "Lechuga del balcón"})).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Historial"}));
        await userEvent.click(screen.getByRole("button", {name: "Exportar CSV"}));

        await waitFor(() => expect(readingApi.exportCsv).toHaveBeenCalledWith("c1", expect.any(Date)));
        const blob = createObjectURL.mock.calls[0]?.[0];
        expect(blob).toBeInstanceOf(Blob);
        expect(blob?.type).toBe("text/csv;charset=utf-8");
        expect(await blob!.text()).toBe(CSV);
        const anchor = vi.mocked(HTMLAnchorElement.prototype.click).mock.instances[0] as HTMLAnchorElement | undefined;
        expect(anchor?.download).toBe("smartpot-lechuga-del-balcón.csv");
        expect(anchor?.getAttribute("href")).toBe(`blob:smartpot-${CSV.length}`);
        expect(revokeObjectURL).toHaveBeenCalledWith(`blob:smartpot-${CSV.length}`);
    });

    it("muestra el error del servidor sin descargar nada", async () => {
        vi.mocked(readingApi.exportCsv).mockImplementation(() =>
            Promise.reject(new ApiError(503, "No se pudo exportar el historial.")));
        const history = createMemoryHistory();
        history.set({value: "/app/crops/c1"});
        render(() => (
            <MemoryRouter history={history}>
                <Route path="/app/crops/:cropId" component={CropDetailPage}/>
            </MemoryRouter>
        ));
        await screen.findByRole("heading", {name: "Lechuga del balcón"});

        await userEvent.click(screen.getByRole("button", {name: "Historial"}));
        await userEvent.click(screen.getByRole("button", {name: "Exportar CSV"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo exportar el historial.");
        expect(createObjectURL).not.toHaveBeenCalled();
    });
});

describe("detalle de un cultivo ajeno", () => {
    beforeEach(() => {
        vi.mocked(cropApi.get).mockImplementation(() =>
            Promise.reject(new ApiError(404, "El cultivo no existe")));
        vi.mocked(cropApi.profiles).mockResolvedValue([PROFILE]);
        vi.mocked(actuatorApi.list).mockResolvedValue([]);
        vi.mocked(commandApi.list).mockResolvedValue([]);
        vi.mocked(readingApi.list).mockResolvedValue([]);
    });

    it("muestra el 404 y vuelve a la lista de cultivos", async () => {
        const history = createMemoryHistory();
        history.set({value: "/app/crops/missing"});
        render(() => (
            <MemoryRouter history={history}>
                <Route path="/app/crops/:cropId" component={CropDetailPage}/>
            </MemoryRouter>
        ));

        expect(await screen.findByRole("alert")).toHaveTextContent("El cultivo no existe");
        expect(screen.getByRole("link", {name: "Mis cultivos"})).toHaveAttribute("href", "/app/crops");
    });
});
