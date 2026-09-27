export type CropType = "TOMATO" | "LETTUCE" | "STRAWBERRY" | "BASIL" | "SPINACH" | "PEPPER";
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
  device: DeviceCredentials;
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
  hoursToLimit: number | null;
  limit: "MIN" | "MAX" | null;
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
  summary: string;
  evaluatedAt: string;
}

export interface Overview {
  totals: {
    crops: number;
    online: number;
    automated: number;
    averageHealth: number | null;
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
  averageHealth: number | null;
  crops: { id: string; name: string; cropType: CropType; rank: number | null; health: InsightHealth | null;
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
