import type { ActuatorType, CommandStatus, CropType, HealthLevel, MetricKey } from "./api/types";

export const CROP_TYPES: Record<CropType, { label: string; hint: string }> = {
  LETTUCE: { label: "Lechuga", hint: "Hoja de clima fresco, ideal para empezar." },
  TOMATO: { label: "Tomate", hint: "Fruto exigente en luz y nutrientes." },
  STRAWBERRY: { label: "Fresa", hint: "Sensible a las sales y a la humedad alta." },
  BASIL: { label: "Albahaca", hint: "Aromática de clima cálido." },
  SPINACH: { label: "Espinaca", hint: "Hoja de clima fresco con mucho nitrógeno." },
  PEPPER: { label: "Pimentón", hint: "Fruto de clima cálido y luz intensa." },
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
