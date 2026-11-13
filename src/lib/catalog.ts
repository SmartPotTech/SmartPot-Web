import type {
    ActuatorType,
    CommandAction,
    CommandStatus,
    CropForm,
    CropKind,
    CropType,
    HealthLevel,
    MetricKey,
    Placement,
    PlacementSetting,
    SunExposure,
} from "./api/types";
import {t, type TranslationKey} from "./i18n";
import {resolvedTheme} from "./theme";

/** Objeto cuyos textos se traducen al leerlos: dentro de JSX o de un efecto siguen al idioma activo. */
function localized<K extends string>(keys: Record<K, TranslationKey>): Record<K, string>;
function localized<K extends string, E extends object>(keys: Record<K, TranslationKey>, extra: E): Record<K, string> & E;
function localized(keys: Record<string, TranslationKey>, extra: object = {}) {
    const target = {...extra};
    for (const [field, key] of Object.entries(keys)) {
        Object.defineProperty(target, field, {get: () => t(key), enumerable: true});
    }
    return target;
}

export const CROP_TYPES: Record<CropType, { label: string; hint: string }> = {
    LETTUCE: localized({label: "catalog.crop.LETTUCE", hint: "catalog.crop.LETTUCE.hint"}),
    TOMATO: localized({label: "catalog.crop.TOMATO", hint: "catalog.crop.TOMATO.hint"}),
    STRAWBERRY: localized({label: "catalog.crop.STRAWBERRY", hint: "catalog.crop.STRAWBERRY.hint"}),
    BASIL: localized({label: "catalog.crop.BASIL", hint: "catalog.crop.BASIL.hint"}),
    SPINACH: localized({label: "catalog.crop.SPINACH", hint: "catalog.crop.SPINACH.hint"}),
    PEPPER: localized({label: "catalog.crop.PEPPER", hint: "catalog.crop.PEPPER.hint"}),
};

export const CROP_KINDS: Record<CropKind, { label: string; hint: string }> = {
    REAL: localized({label: "catalog.kind.REAL", hint: "catalog.kind.REAL.hint"}),
    VIRTUAL: localized({label: "catalog.kind.VIRTUAL", hint: "catalog.kind.VIRTUAL.hint"}),
};

/** phrase completa frases como «Lechuga en tubos NFT». */
export const CROP_FORMS: Record<CropForm, { label: string; phrase: string; hint: string }> = {
    POT: localized({label: "catalog.form.POT", phrase: "catalog.form.POT.phrase", hint: "catalog.form.POT.hint"}),
    NFT: localized({label: "catalog.form.NFT", phrase: "catalog.form.NFT.phrase", hint: "catalog.form.NFT.hint"}),
    TOWER: localized({
        label: "catalog.form.TOWER",
        phrase: "catalog.form.TOWER.phrase",
        hint: "catalog.form.TOWER.hint",
    }),
    RAFT: localized({label: "catalog.form.RAFT", phrase: "catalog.form.RAFT.phrase", hint: "catalog.form.RAFT.hint"}),
};

export const PLACEMENT_SETTINGS: Record<PlacementSetting, { label: string; hint: string }> = {
    INDOOR: localized({label: "catalog.setting.INDOOR", hint: "catalog.setting.INDOOR.hint"}),
    OUTDOOR: localized({label: "catalog.setting.OUTDOOR", hint: "catalog.setting.OUTDOOR.hint"}),
};

const exposure = (sun: SunExposure, setting: PlacementSetting) => localized({
    label: `catalog.exposure.${sun}.${setting}` as TranslationKey,
    hint: `catalog.exposure.${sun}.${setting}.hint` as TranslationKey,
    phrase: `catalog.exposure.${sun}.${setting}.phrase` as TranslationKey,
});

/** La exposición se nombra distinto según el lugar: afuera cuenta el sol directo; adentro, la ventana. */
export const EXPOSURES: Record<SunExposure, Record<PlacementSetting, {
    label: string;
    hint: string;
    phrase: string
}>> = {
    FULL_SUN: {OUTDOOR: exposure("FULL_SUN", "OUTDOOR"), INDOOR: exposure("FULL_SUN", "INDOOR")},
    PARTIAL_SUN: {OUTDOOR: exposure("PARTIAL_SUN", "OUTDOOR"), INDOOR: exposure("PARTIAL_SUN", "INDOOR")},
    SHADE: {OUTDOOR: exposure("SHADE", "OUTDOOR"), INDOOR: exposure("SHADE", "INDOOR")},
};

/** Luz que pide cada especie, la misma base de conocimiento del asistente. */
export const LIGHT_NEEDS: Record<CropType, { exposure: SunExposure; note: string }> = {
    LETTUCE: localized({note: "catalog.light.LETTUCE"}, {exposure: "PARTIAL_SUN" as SunExposure}),
    SPINACH: localized({note: "catalog.light.SPINACH"}, {exposure: "PARTIAL_SUN" as SunExposure}),
    TOMATO: localized({note: "catalog.light.TOMATO"}, {exposure: "FULL_SUN" as SunExposure}),
    PEPPER: localized({note: "catalog.light.PEPPER"}, {exposure: "FULL_SUN" as SunExposure}),
    STRAWBERRY: localized({note: "catalog.light.STRAWBERRY"}, {exposure: "FULL_SUN" as SunExposure}),
    BASIL: localized({note: "catalog.light.BASIL"}, {exposure: "FULL_SUN" as SunExposure}),
};

/** «al aire libre a pleno sol en Medellín»; null si no se sabe dónde está. */
export function describePlacement(placement: Placement | null | undefined): string | null {
    if (!placement?.setting) return placement?.location ? t("catalog.inPlace", {name: placement.location.name}) : null;
    const parts = [PLACEMENT_SETTINGS[placement.setting].label.toLowerCase()];
    if (placement.exposure) parts.push(EXPOSURES[placement.exposure][placement.setting].phrase);
    if (placement.location) parts.push(t("catalog.inPlace", {name: placement.location.name}));
    return parts.join(" ");
}

/**
 * durations: cuánto tiempo puede quedar encendido al activarlo con el switch; unlimited permite dejarlo encendido
 * hasta apagarlo (nunca la bomba ni los dosificadores).
 */
export const ACTUATORS: Record<ActuatorType, {
    label: string; defaultSeconds: number | null; durations: number[];
    unlimited: boolean
}> = {
    WATER_PUMP: localized({label: "catalog.actuator.WATER_PUMP"}, {
        defaultSeconds: 15,
        durations: [5, 15, 30, 60],
        unlimited: false
    }),
    UV_LIGHT: localized({label: "catalog.actuator.UV_LIGHT"}, {
        defaultSeconds: 900,
        durations: [300, 900, 1800, 3600],
        unlimited: false
    }),
    FAN: localized({label: "catalog.actuator.FAN"}, {defaultSeconds: 600, durations: [300, 600, 1800], unlimited: true}),
    HUMIDIFIER: localized({label: "catalog.actuator.HUMIDIFIER"}, {
        defaultSeconds: 300,
        durations: [300, 600, 1800],
        unlimited: true
    }),
    NUTRIENT_DOSER: localized({label: "catalog.actuator.NUTRIENT_DOSER"}, {
        defaultSeconds: 3,
        durations: [1, 3, 5],
        unlimited: false
    }),
    PH_DOSER: localized({label: "catalog.actuator.PH_DOSER"}, {
        defaultSeconds: 3,
        durations: [1, 3, 5],
        unlimited: false
    }),
};

export interface MetricInfo {
    label: string;
    unit: string;
    decimals: number;
    color: string;
}

/** Color de gráficos: el tono claro sobre fondos claros y su versión aclarada sobre el verde profundo del modo oscuro. */
export function themed(light: string, dark: string): string {
    return resolvedTheme() === "dark" ? dark : light;
}

const metric = (key: MetricKey, unit: string, decimals: number, light: string, dark: string): MetricInfo =>
    Object.defineProperty(
        localized({label: `catalog.metric.${key}` as TranslationKey}, {unit, decimals}),
        "color",
        {get: () => themed(light, dark), enumerable: true},
    ) as MetricInfo;

export const METRICS: Record<MetricKey, MetricInfo> = {
    temperature: metric("temperature", "°C", 1, "#D9734E", "#F0956F"),
    humidity: metric("humidity", "%", 0, "#2D9CDB", "#7CC4EE"),
    soilMoisture: metric("soilMoisture", "%", 0, "#1F6FA0", "#4C9FD0"),
    brightness: metric("brightness", "lux", 0, "#946200", "#F2B632"),
    ph: metric("ph", "", 2, "#067A52", "#3FD39B"),
    tds: metric("tds", "ppm", 0, "#00B074", "#2FD29A"),
    atmosphere: metric("atmosphere", "hPa", 0, "#5B6B63", "#A9C4B8"),
};

export const PRIMARY_METRICS: MetricKey[] = ["temperature", "humidity", "soilMoisture", "brightness", "ph", "tds"];

/**
 * Un color por cultivo en las comparativas, en orden fijo y nunca reciclado. Tonos de la marca más un
 * violeta solo para gráficos; el orden está validado para daltonismo (protan, deutan) y contraste entre vecinos.
 */
export const CROP_COLORS = ["#009A64", "#2D9CDB", "#D9734E", "#1F6FA0", "#C98D12", "#067A52", "#7A5AC8", "#B85A38"];

/** Máximo de cultivos en un mismo gráfico comparativo: uno por color de la paleta. */
export const MAX_COMPARED = CROP_COLORS.length;

const CROP_COLORS_DARK = ["#2FD29A", "#5DB8EE", "#F0956F", "#7AA7E6", "#F2B632", "#7FDBB0", "#A78BFA", "#E08A63"];

/** Color de la posición `slot` en las comparativas, ajustado al tema activo. */
export function cropColor(slot: number): string {
    return themed(CROP_COLORS[slot]!, CROP_COLORS_DARK[slot]!);
}

/** Órdenes frecuentes para aplicar a varios cultivos a la vez. */
export const QUICK_ACTIONS: {
    label: string; actuatorType: ActuatorType; action: CommandAction;
    durationSeconds: number | null
}[] = [
    localized({label: "catalog.quick.water"}, {
        actuatorType: "WATER_PUMP" as ActuatorType,
        action: "ACTIVATE" as CommandAction,
        durationSeconds: 15 as number | null
    }),
    localized({label: "catalog.quick.fan"}, {
        actuatorType: "FAN" as ActuatorType,
        action: "ACTIVATE" as CommandAction,
        durationSeconds: 600 as number | null
    }),
    localized({label: "catalog.quick.light"}, {
        actuatorType: "UV_LIGHT" as ActuatorType,
        action: "ACTIVATE" as CommandAction,
        durationSeconds: 900 as number | null
    }),
    localized({label: "catalog.quick.lightsOff"}, {
        actuatorType: "UV_LIGHT" as ActuatorType,
        action: "DEACTIVATE" as CommandAction,
        durationSeconds: null as number | null
    }),
    localized({label: "catalog.quick.fansOff"}, {
        actuatorType: "FAN" as ActuatorType,
        action: "DEACTIVATE" as CommandAction,
        durationSeconds: null as number | null
    }),
];

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export const COMMAND_STATUS: Record<CommandStatus, { label: string; tone: Tone }> = {
    PENDING: localized({label: "catalog.status.PENDING"}, {tone: "neutral" as Tone}),
    SENT: localized({label: "catalog.status.SENT"}, {tone: "info" as Tone}),
    EXECUTED: localized({label: "catalog.status.EXECUTED"}, {tone: "success" as Tone}),
    FAILED: localized({label: "catalog.status.FAILED"}, {tone: "danger" as Tone}),
    EXPIRED: localized({label: "catalog.status.EXPIRED"}, {tone: "warning" as Tone}),
};

const health = (level: HealthLevel, tone: Tone, light: string, dark: string): { label: string; tone: Tone; color: string } =>
    Object.defineProperty(
        localized({label: `catalog.health.${level}` as TranslationKey}, {tone}),
        "color",
        {get: () => themed(light, dark), enumerable: true},
    ) as { label: string; tone: Tone; color: string };

/** Devuelve la etiqueta localizada del nivel de salud del cultivo. */
export function healthLabel(value: { level: HealthLevel; label?: string }): string {
    return HEALTH[value.level]?.label ?? value.label ?? "";
}

export const HEALTH: Record<HealthLevel, { label: string; tone: Tone; color: string }> = {
    EXCELLENT: health("EXCELLENT", "success", "#00B074", "#00B074"),
    GOOD: health("GOOD", "success", "#009A64", "#2FD29A"),
    FAIR: health("FAIR", "warning", "#946200", "#F2B632"),
    POOR: health("POOR", "danger", "#D9734E", "#F0956F"),
    CRITICAL: health("CRITICAL", "danger", "#D64545", "#F07070"),
    UNKNOWN: health("UNKNOWN", "neutral", "#5B6B63", "#A9C4B8"),
};
