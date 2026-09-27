export type CropType = "TOMATO" | "LETTUCE" | "STRAWBERRY" | "BASIL" | "SPINACH" | "PEPPER";
/** Real: un dispositivo con el firmware (ESP32 físico o Wokwi). Virtual: lo simula SmartPot. No cambia tras crearlo. */
export type CropKind = "REAL" | "VIRTUAL";
/** Forma del sistema hidropónico: maceta, tubos NFT, torre vertical o balsa flotante. */
export type CropForm = "POT" | "NFT" | "TOWER" | "RAFT";
export type ActuatorType = "WATER_PUMP" | "UV_LIGHT" | "FAN" | "HUMIDIFIER" | "NUTRIENT_DOSER" | "PH_DOSER";
export type CommandAction = "ACTIVATE" | "DEACTIVATE";
export type CommandStatus = "PENDING" | "SENT" | "EXECUTED" | "FAILED" | "EXPIRED";
export type HealthLevel = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL" | "UNKNOWN";
export type MetricKey = "temperature" | "humidity" | "brightness" | "ph" | "tds" | "soilMoisture" | "atmosphere";

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export type Measures = Partial<Record<MetricKey, number>>;

export interface Reading {
  id: string;
  cropId: string;
  measuredAt: string;
  measures: Measures;
  source: string;
}

export interface CropHealth {
  index: number;
  level: HealthLevel;
  label: string;
  evaluatedAt: string;
}

export interface Crop {
  id: string;
  name: string;
  type: CropType;
  kind: CropKind;
  form: CropForm;
  automationEnabled: boolean;
  device: { online: boolean; lastSeenAt: string | null; keyRotatedAt: string | null };
  health: CropHealth | null;
  latestReading: Reading | null;
  createdAt: string;
}

export interface DeviceCredentials {
  host: string;
  port: number;
  tls: boolean;
  websocketUrl?: string;
  username: string;
  key?: string;
  topics: { telemetry: string; commands: string; commandAck: string; status: string };
  keyRotatedAt?: string;
}

export interface CropCreated {
  crop: Crop;
  /** Solo en los cultivos reales: la clave se muestra esta única vez. */
  device?: DeviceCredentials | null;
}

export interface CropCreateRequest {
  name: string;
  type: CropType;
  kind: CropKind;
  form: CropForm;
  /** Solo para los virtuales: cómo arranca la simulación. */
  virtual?: VirtualDeviceRequest;
}

export interface Actuator {
  id: string;
  cropId: string;
  type: ActuatorType;
  active: boolean;
  lastChangedAt: string | null;
}

export interface Command {
  id: string;
  cropId: string;
  actuatorId: string;
  actuatorType: ActuatorType;
  action: CommandAction;
  durationSeconds: number | null;
  status: CommandStatus;
  source: "USER" | "AGENT";
  reason: string | null;
  message: string | null;
  createdAt: string;
  sentAt: string | null;
  completedAt: string | null;
}

export interface AppNotification {
  id: string;
  cropId: string | null;
  type: "INFO" | "ALERT" | "COMMAND" | "DEVICE" | "AI";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface MetricSummary {
  min: number | null;
  avg: number | null;
  max: number | null;
}

export interface ReadingSummary {
  from: string;
  to: string;
  count: number;
  metrics: Partial<Record<MetricKey, MetricSummary>>;
}

export interface ProfileRange {
  min: number;
  max: number;
  unit: string;
  label: string;
}

export interface CropProfile {
  type: CropType;
  name: string;
  description: string;
  ranges: Partial<Record<MetricKey, ProfileRange>>;
}

export interface Forecast {
  parameter: MetricKey;
  current: number;
  slopePerHour: number;
  expectedIn3h: number;
  trend: "RISING" | "FALLING" | "STABLE";
  /** La API omite los campos vacíos: sin límite próximo llega ausente. */
  hoursToLimit?: number | null;
  limit?: "MIN" | "MAX" | null;
  confidence: number;
  message: string;
}

export interface InsightHealth {
  index: number;
  level: HealthLevel;
  label: string;
  /** Salud de 0 a 100 de cada variable: explica de dónde sale el índice. */
  byParameter?: Partial<Record<MetricKey, number>>;
}

export interface SuggestedAction {
  actuator: ActuatorType;
  action: CommandAction;
  durationSeconds: number | null;
  reason: string;
}

export interface Insight {
  cropType: CropType;
  health: InsightHealth;
  diagnosis: {
    parameter: MetricKey;
    value: number;
    status: "LOW" | "OPTIMAL" | "HIGH" | "REST";
    severity: "OK" | "WARNING" | "CRITICAL";
    message: string;
    recommendation: string | null;
  }[];
  conclusions: { rule: string; title: string; message: string; certainty: number }[];
  predictions: { name: string; label: string; probability: number; model: string }[];
  actions: SuggestedAction[];
  forecasts?: Forecast[];
  learning?: Learning | null;
  summary: string;
  evaluatedAt: string;
}

/** Lo aprendido de las lecturas reales de la especie; source BASE mientras no hay modelos entrenados. */
export interface Learning {
  source: "LEARNED" | "BASE";
  readings: number;
  trainedAt?: string | null;
  message: string;
  predictions?: { name: "needs_water" | "overheat"; label: string; probability: number; model: string;
    metric: string; score?: number | null }[];
  moisture?: { expectedIn1h: number; model: string; mae?: number | null } | null;
  state?: { label: string; description: string; share: number } | null;
  anomaly?: { score: number; unusual: boolean } | null;
}

export interface ModelCard {
  task: "needs_water" | "overheat" | "moisture_1h";
  label: string;
  status: "TRAINED" | "PENDING";
  reason?: string | null;
  metric: string;
  model?: string | null;
  score?: number | null;
  std?: number | null;
  holdout?: number | null;
  baseline?: number | null;
  samples: number;
  positives?: number | null;
  version: number;
  trainedAt?: string | null;
  params?: Record<string, number | string | null>;
  candidates: { model: string; score?: number | null; std?: number | null }[];
}

export interface CropTypeLearning {
  cropType: CropType;
  name: string;
  readings: number;
  crops: number;
  newSinceTraining: number;
  training: boolean;
  trainedAt?: string | null;
  quality?: { rows: number; completeness: number; validity: number; outliers: number; score: number } | null;
  models: ModelCard[];
  states?: { k: number; silhouette: number; clusters: { label: string; description: string; share: number }[] } | null;
  anomaly?: { samples: number; contamination: number } | null;
}

export interface LearningStatus {
  enabled: boolean;
  persistent: boolean;
  storedReadings: number;
  minSamples: number;
  retrainEvery: number;
  cropTypes: CropTypeLearning[];
}

export type NotificationType = AppNotification["type"];

export interface ChannelLink {
  id: string;
  type: "TELEGRAM";
  displayName?: string | null;
  enabled: boolean;
  events: NotificationType[];
  linkedAt?: string | null;
  lastDeliveredAt?: string | null;
}

export interface ChannelOption {
  type: "TELEGRAM";
  name: string;
  available: boolean;
  handle?: string | null;
  link?: ChannelLink | null;
}

export interface LinkCode {
  type: "TELEGRAM";
  code: string;
  url: string;
  expiresAt: string;
}

export type VirtualMode = "AUTO" | "MANUAL" | "WEATHER";
export type WeatherCondition = "CLEAR" | "MOSTLY_CLEAR" | "PARTLY_CLOUDY" | "CLOUDY" | "FOG" | "DRIZZLE" | "RAIN"
  | "SNOW" | "STORM";

export interface Weather {
  temperature: number;
  humidity: number;
  cloudCover: number;
  radiation: number;
  precipitation: number;
  pressure: number;
  windSpeed: number;
  isDay: boolean;
  code: number;
  condition: WeatherCondition;
  label: string;
  observedAt: string;
}

export interface Place {
  name: string;
  latitude: number;
  longitude: number;
  country?: string | null;
  region?: string | null;
}

export interface VirtualDevice {
  cropId: string;
  available: boolean;
  active: boolean;
  running: boolean;
  mode?: VirtualMode | null;
  manual?: Measures | null;
  location?: { name: string; latitude: number; longitude: number } | null;
  intervalSeconds?: number | null;
  connected: boolean;
  lastReading?: Measures | null;
  lastPublishedAt?: string | null;
  weather?: Weather | null;
  weatherError?: string | null;
  activeActuators: { actuator: ActuatorType; until: string }[];
  lastCommand?: { id: string; status: string; message: string; at: string } | null;
  updatedAt?: string | null;
}

export interface VirtualDeviceRequest {
  mode: VirtualMode;
  manual?: Measures;
  location?: { name: string; latitude: number; longitude: number };
  intervalSeconds?: number;
}

export interface Overview {
  totals: {
    crops: number;
    online: number;
    automated: number;
    /** Ausente si ningún cultivo tiene evaluación: la API omite los campos vacíos. */
    averageHealth?: number | null;
    needsAttention: number;
    unreadAlerts: number;
    commandsLast24h: number;
  };
  crops: Crop[];
}

export interface MetricSeries {
  metric: MetricKey;
  hours: number;
  bucketMinutes: number;
  series: { cropId: string; name: string; type: CropType; points: { time: string; value: number }[] }[];
}

export interface FleetAction extends SuggestedAction {
  cropIds: string[];
}

export interface Fleet {
  averageHealth?: number | null;
  crops: { id: string; name: string; cropType: CropType; rank?: number | null; health?: InsightHealth | null;
    issues: string[] }[];
  sharedIssues: { parameter: MetricKey; status: "LOW" | "HIGH"; cropIds: string[]; share: number; message: string }[];
  groups: { label: string; cropIds: string[]; description: string }[];
  actions: FleetAction[];
  summary: string;
}

export interface BulkCommandResult {
  sent: number;
  skipped: number;
  failed: number;
  results: { cropId: string; cropName: string; status: "SENT" | "FAILED" | "SKIPPED"; commandId: string | null;
    message: string | null }[];
}
