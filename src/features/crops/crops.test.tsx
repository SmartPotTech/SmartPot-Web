import {createMemoryHistory, MemoryRouter, Route} from "@solidjs/router";
import {render, screen} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {describe, expect, it, vi} from "vitest";
import type {Crop, Insight} from "../../lib/api/types";
import {setLocale} from "../../lib/i18n";
import {actuatorApi, commandApi, cropApi, insightApi, readingApi} from "../../lib/api/services";
import {HealthGauge} from "./components/HealthGauge";
import {InsightPanel} from "./components/InsightPanel";
import {MetricTile} from "./components/MetricTile";
import CropDetailPage from "./CropDetailPage";
import {firmwareConfig} from "./firmware";

vi.mock("../../lib/api/services", () => ({
    cropApi: {get: vi.fn(), profiles: vi.fn(), weather: vi.fn(), setAutomation: vi.fn()},
    actuatorApi: {list: vi.fn()},
    commandApi: {list: vi.fn(), send: vi.fn()},
    insightApi: {get: vi.fn()},
    readingApi: {list: vi.fn(), exportCsv: vi.fn()},
    virtualDeviceApi: {get: vi.fn()},
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
        expect(config).toContain('"crop_id": "c1"');
        expect(config).toContain('"tls": True');
        expect(config).toContain("<CLAVE_DEL_DISPOSITIVO>");
        expect(config).toContain("<NOMBRE_DE_TU_RED>");
        expect(config).toContain('"CA_CRT": """<CA_DE_SMARTPOT>"""');
        expect(config).not.toContain("ca_file");
        expect(firmwareConfig({
            host: "h", port: 8883, tls: true, username: "c1", key: "k",
            topics: {telemetry: "t", commands: "c", commandAck: "a", status: "s"},
        }, "wokwi")).toContain('"ssid": "Wokwi-GUEST"');
    });

    it("lleva la CA del broker en BROKER, también sin TLS", () => {
        const credentials = {
            host: "h", port: 8883, tls: true, username: "c1",
            topics: {telemetry: "t", commands: "c", commandAck: "a", status: "s"},
        };
        const ca = "-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----";
        expect(firmwareConfig(credentials, "esp32", `${ca}\n`))
            .toContain(`BROKER = {\n    "CA_CRT": """${ca}"""\n}`);
        expect(firmwareConfig({...credentials, port: 1883, tls: false}, "esp32", ca))
            .toContain('"CA_CRT": """"""');
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
