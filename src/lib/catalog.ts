import type { ActuatorType, CommandAction, CommandStatus, CropForm, CropKind, CropType, HealthLevel, MetricKey } from "./api/types";

export const CROP_TYPES: Record<CropType, { label: string; hint: string }> = {
  LETTUCE: { label: "Lechuga", hint: "Hoja de clima fresco, ideal para empezar." },
  TOMATO: { label: "Tomate", hint: "Fruto exigente en luz y nutrientes." },
  STRAWBERRY: { label: "Fresa", hint: "Sensible a las sales y a la humedad alta." },
  BASIL: { label: "Albahaca", hint: "Aromática de clima cálido." },
  SPINACH: { label: "Espinaca", hint: "Hoja de clima fresco con mucho nitrógeno." },
  PEPPER: { label: "Pimentón", hint: "Fruto de clima cálido y luz intensa." },
};

export const CROP_KINDS: Record<CropKind, { label: string; hint: string }> = {
  REAL: { label: "Real", hint: "Un ESP32 con el firmware de SmartPot, físico o simulado en Wokwi, con sus sensores y actuadores." },
  VIRTUAL: { label: "Virtual", hint: "SmartPot lo simula por ti, siempre encendido: clima real, día y noche o valores a mano." },
};

/** phrase completa frases como «Lechuga en tubos NFT». */
export const CROP_FORMS: Record<CropForm, { label: string; phrase: string; hint: string }> = {
  POT: { label: "Maceta", phrase: "en maceta", hint: "Una planta en su maceta con depósito y riego por goteo." },
  NFT: { label: "Tubos NFT", phrase: "en tubos NFT", hint: "Tubos horizontales por los que corre una película de solución nutritiva." },
  TOWER: { label: "Torre vertical", phrase: "en torre vertical", hint: "Bolsillos escalonados; la bomba sube la solución y baja por gravedad." },
  RAFT: { label: "Balsa flotante", phrase: "en balsa flotante", hint: "Plantas sobre una balsa que flota en un estanque de solución aireada." },
};

export const ACTUATORS: Record<ActuatorType, { label: string; defaultSeconds: number | null }> = {
  WATER_PUMP: { label: "Bomba de agua", defaultSeconds: 15 },
  UV_LIGHT: { label: "Luz de cultivo", defaultSeconds: 900 },
  FAN: { label: "Ventilador", defaultSeconds: 600 },
  HUMIDIFIER: { label: "Humidificador", defaultSeconds: 300 },
  NUTRIENT_DOSER: { label: "Dosificador de nutrientes", defaultSeconds: 3 },
  PH_DOSER: { label: "Dosificador de pH", defaultSeconds: 3 },
};

export interface MetricInfo {
  label: string;
  unit: string;
  decimals: number;
  color: string;
}

export const METRICS: Record<MetricKey, MetricInfo> = {
  temperature: { label: "Temperatura", unit: "°C", decimals: 1, color: "#D9734E" },
  humidity: { label: "Humedad del aire", unit: "%", decimals: 0, color: "#2D9CDB" },
  soilMoisture: { label: "Humedad del sustrato", unit: "%", decimals: 0, color: "#1F6FA0" },
  brightness: { label: "Luz", unit: "lux", decimals: 0, color: "#F2B632" },
  ph: { label: "pH", unit: "", decimals: 2, color: "#067A52" },
  tds: { label: "Nutrientes (TDS)", unit: "ppm", decimals: 0, color: "#00B074" },
  atmosphere: { label: "Presión", unit: "hPa", decimals: 0, color: "#5B6B63" },
};

export const PRIMARY_METRICS: MetricKey[] = ["temperature", "humidity", "soilMoisture", "brightness", "ph", "tds"];

/**
 * Un color por cultivo en las comparativas, en orden fijo y nunca reciclado. Tonos de la marca más un
 * violeta solo para gráficos; el orden está validado para daltonismo (protan, deutan) y contraste entre vecinos.
 */
export const CROP_COLORS = ["#009A64", "#2D9CDB", "#D9734E", "#1F6FA0", "#C98D12", "#067A52", "#7A5AC8", "#B85A38"];

/** Máximo de cultivos en un mismo gráfico comparativo: uno por color de la paleta. */
export const MAX_COMPARED = CROP_COLORS.length;

/** Órdenes frecuentes para aplicar a varios cultivos a la vez. */
export const QUICK_ACTIONS: { label: string; actuatorType: ActuatorType; action: CommandAction;
  durationSeconds: number | null }[] = [
  { label: "Regar 15 s", actuatorType: "WATER_PUMP", action: "ACTIVATE", durationSeconds: 15 },
  { label: "Ventilar 10 min", actuatorType: "FAN", action: "ACTIVATE", durationSeconds: 600 },
  { label: "Luz 15 min", actuatorType: "UV_LIGHT", action: "ACTIVATE", durationSeconds: 900 },
  { label: "Apagar luces", actuatorType: "UV_LIGHT", action: "DEACTIVATE", durationSeconds: null },
  { label: "Apagar ventiladores", actuatorType: "FAN", action: "DEACTIVATE", durationSeconds: null },
];

export const COMMAND_STATUS: Record<CommandStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pendiente", tone: "neutral" },
  SENT: { label: "Enviado", tone: "info" },
  EXECUTED: { label: "Ejecutado", tone: "success" },
  FAILED: { label: "Falló", tone: "danger" },
  EXPIRED: { label: "Sin respuesta", tone: "warning" },
};

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export const HEALTH: Record<HealthLevel, { tone: Tone; color: string }> = {
  EXCELLENT: { tone: "success", color: "#00B074" },
  GOOD: { tone: "success", color: "#009A64" },
  FAIR: { tone: "warning", color: "#F2B632" },
  POOR: { tone: "danger", color: "#D9734E" },
  CRITICAL: { tone: "danger", color: "#D64545" },
  UNKNOWN: { tone: "neutral", color: "#5B6B63" },
};
