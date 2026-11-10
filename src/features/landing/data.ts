import type {ActuatorType, CropType, MetricKey} from "../../lib/api/types";
import type {TranslationKey} from "../../lib/i18n";

export type RangeKey = Exclude<MetricKey, "atmosphere">;
export type SpeciesRanges = Record<RangeKey, readonly [number, number]>;

/**
 * Rangos ideales por especie: copia exacta de `SmartPot-AI/src/domain/profiles.rs` (PROFILES). La landing es pública
 * y no puede pedir `/v1/crop-profiles`, que exige sesión; si el perfil cambia en la IA, se cambia aquí también.
 */
export const SPECIES_RANGES: Record<CropType, SpeciesRanges> = {
    LETTUCE: {temperature: [15, 22], humidity: [50, 70], brightness: [300, 1400], ph: [5.5, 6.5], tds: [560, 840], soilMoisture: [60, 80]},
    TOMATO: {temperature: [20, 28], humidity: [60, 80], brightness: [600, 1800], ph: [5.5, 6.5], tds: [1400, 2800], soilMoisture: [55, 75]},
    STRAWBERRY: {temperature: [18, 26], humidity: [60, 75], brightness: [500, 1600], ph: [5.5, 6.2], tds: [700, 980], soilMoisture: [60, 80]},
    BASIL: {temperature: [20, 30], humidity: [40, 60], brightness: [500, 1600], ph: [5.5, 6.5], tds: [700, 1120], soilMoisture: [50, 70]},
    SPINACH: {temperature: [15, 24], humidity: [50, 70], brightness: [300, 1400], ph: [6, 7], tds: [1260, 1610], soilMoisture: [60, 80]},
    PEPPER: {temperature: [21, 29], humidity: [50, 70], brightness: [600, 1800], ph: [5.8, 6.5], tds: [1400, 2100], soilMoisture: [55, 75]},
};

export const SPECIES: CropType[] = ["LETTUCE", "TOMATO", "STRAWBERRY", "BASIL", "SPINACH", "PEPPER"];
export const RANGE_KEYS: RangeKey[] = ["temperature", "humidity", "brightness", "ph", "tds", "soilMoisture"];

/**
 * Descripciones canónicas de las 6 especies: copia exacta de `SmartPot-AI/src/domain/profiles.rs`.
 */
export const SPECIES_DESCRIPTIONS: Record<CropType, string> = {
    LETTUCE: "Cool-weather leafy green; bolts under excessive heat and light.",
    TOMATO: "Fruit crop demanding in light, warmth, and nutrients during flowering.",
    STRAWBERRY: "Sensitive to excess salts and high humidity, which promotes fungal growth.",
    BASIL: "Warm-weather aromatic herb; tolerates dry environments.",
    SPINACH: "Cool-weather leafy green with high nitrogen demand.",
    PEPPER: "Warm-weather fruit crop; requires intense light and stable pH.",
};

export const SPECIES_NAMES: Record<CropType, string> = {
    LETTUCE: "Lettuce",
    TOMATO: "Tomato",
    STRAWBERRY: "Strawberry",
    BASIL: "Basil",
    SPINACH: "Spinach",
    PEPPER: "Bell pepper",
};

export type PresetKey = "optimal" | "heat" | "lockout" | "lowNutrients";

export interface PresetInfo {
    id: PresetKey;
    label: TranslationKey;
    values: (species: CropType) => Partial<DemoReading>;
}

export const PRESETS: PresetInfo[] = [
    {
        id: "optimal",
        label: "landing.demo.preset.optimal",
        values: (sp) => demoStart(sp),
    },
    {
        id: "heat",
        label: "landing.demo.preset.heat",
        values: (sp) => ({temperature: Number((SPECIES_RANGES[sp].temperature[1] + 5).toFixed(1))}),
    },
    {
        id: "lockout",
        label: "landing.demo.preset.lockout",
        values: (sp) => ({
            ph: Number((SPECIES_RANGES[sp].ph[1] + 1.0).toFixed(1)),
            tds: Number(SPECIES_RANGES[sp].tds[0] + 50),
        }),
    },
    {
        id: "lowNutrients",
        label: "landing.demo.preset.lowNutrients",
        values: (sp) => ({tds: Math.max(100, SPECIES_RANGES[sp].tds[0] - 200)}),
    },
];

export type DemoMetric = "temperature" | "ph" | "tds";
export type DemoStatus = "low" | "ok" | "high";

/** Límites de los controles del ejemplo: cubren los rangos de las seis especies con margen a ambos lados. */
export const DEMO_CONTROLS: Record<DemoMetric, { min: number; max: number; step: number }> = {
    temperature: {min: 8, max: 36, step: 0.5},
    ph: {min: 4.5, max: 8, step: 0.1},
    tds: {min: 200, max: 3200, step: 20},
};

export interface DemoReading {
    temperature: number;
    ph: number;
    tds: number;
}

/** Punto de partida: el centro del rango de la especie, redondeado al paso del control. */
export function demoStart(species: CropType): DemoReading {
    const ranges = SPECIES_RANGES[species];
    const middle = (metric: DemoMetric) => {
        const [low, high] = ranges[metric];
        const step = DEMO_CONTROLS[metric].step;
        return Number((Math.round((low + high) / 2 / step) * step).toFixed(2));
    };
    return {temperature: middle("temperature"), ph: middle("ph"), tds: middle("tds")};
}

export function demoStatus(value: number, [low, high]: readonly [number, number]): DemoStatus {
    return value < low ? "low" : value > high ? "high" : "ok";
}

export interface DemoAction {
    actuator: ActuatorType;
    text: TranslationKey;
}

export interface DemoOutcome {
    status: Record<DemoMetric, DemoStatus>;
    actions: DemoAction[];
    /** Regla «nutrient_lockout» del sistema experto (certeza 0,85). */
    lockout: boolean;
    /** pH bajo: el agente no tiene dosificador de pH Up y solo lo informa. */
    lowPhNotice: boolean;
}

/**
 * Lo que haría el agente con esas tres lecturas, de día, en modo automático y con todos los actuadores. Reproduce las
 * reglas de `SmartPot-AI/src/engine/agent.rs` y `rules.rs` para estas variables:
 * - temperatura alta → ventilador 10 min (600 s); baja → se apaga el ventilador;
 * - pH alto → dosis de 3 s de pH Down (si el modelo de corrección de pH la confirma); pH bajo → solo diagnóstico;
 * - nutrientes bajos → dosis de 3 s de solución nutritiva;
 * - pH fuera de rango con nutrientes en rango o altos → regla «bloqueo de nutrientes».
 */
export function demoOutcome(species: CropType, reading: DemoReading): DemoOutcome {
    const ranges = SPECIES_RANGES[species];
    const status = {
        temperature: demoStatus(reading.temperature, ranges.temperature),
        ph: demoStatus(reading.ph, ranges.ph),
        tds: demoStatus(reading.tds, ranges.tds),
    };
    const actions: DemoAction[] = [];
    if (status.temperature === "high") actions.push({actuator: "FAN", text: "landing.demo.actionFanOn"});
    if (status.temperature === "low") actions.push({actuator: "FAN", text: "landing.demo.actionFanOff"});
    if (status.ph === "high") actions.push({actuator: "PH_DOSER", text: "landing.demo.actionPhDown"});
    if (status.tds === "low") actions.push({actuator: "NUTRIENT_DOSER", text: "landing.demo.actionNutrients"});
    return {
        status,
        actions,
        lockout: status.ph !== "ok" && status.tds !== "low",
        lowPhNotice: status.ph === "low",
    };
}

/** Repositorios públicos de la organización, con lo que hace cada uno. */
export const COMPONENTS: { repo: string; role: TranslationKey; stack: string }[] = [
    {repo: "SmartPot-Web", role: "landing.open.web", stack: "SolidJS · TypeScript"},
    {repo: "SmartPot-API", role: "landing.open.api", stack: "Go · Echo"},
    {repo: "SmartPot-AI", role: "landing.open.ai", stack: "Rust · Axum · gRPC"},
    {repo: "SmartPot-Trainer", role: "landing.open.trainer", stack: "Python · scikit-learn"},
    {repo: "SmartPot-IoT", role: "landing.open.iot", stack: "Rust · Embassy · ESP32"},
    {repo: "SmartPot-IoT-Python", role: "landing.open.iotPython", stack: "MicroPython · Wokwi"},
    {repo: "SmartPot-DataGenerator", role: "landing.open.simulator", stack: "Rust · MQTT"},
    {repo: "SmartPot-Broker", role: "landing.open.broker", stack: "EMQX · TLS"},
    {repo: "SmartPot-DB", role: "landing.open.db", stack: "PostgreSQL · TimescaleDB"},
    {repo: "SmartPot-MCP", role: "landing.open.mcp", stack: "Python · MCP"},
];
