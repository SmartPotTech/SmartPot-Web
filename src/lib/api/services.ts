import { request } from "./client";
import type {
  Actuator,
  ActuatorType,
  AppNotification,
  AuthResponse,
  Command,
  CommandAction,
  Crop,
  CropCreated,
  CropProfile,
  CropType,
  DeviceCredentials,
  BulkCommandResult,
  Fleet,
  Insight,
  Measures,
  MetricKey,
  MetricSeries,
  Overview,
  Reading,
  ReadingSummary,
  User,
} from "./types";

const V1 = "/api/v1";

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>(`${V1}/auth/login`, { method: "POST", body: { email, password }, auth: false }),
  register: (data: { name: string; lastName: string; email: string; password: string }) =>
    request<AuthResponse>(`${V1}/auth/register`, { method: "POST", body: data, auth: false }),
  forgotPassword: (email: string) =>
    request<void>(`${V1}/auth/password/forgot`, { method: "POST", body: { email }, auth: false }),
  resetPassword: (token: string, password: string) =>
    request<void>(`${V1}/auth/password/reset`, { method: "POST", body: { token, password }, auth: false }),
};

export const userApi = {
  me: () => request<User>(`${V1}/users/me`),
  update: (data: { name: string; lastName: string }) => request<User>(`${V1}/users/me`, { method: "PUT", body: data }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>(`${V1}/users/me/password`, { method: "PUT", body: { currentPassword, newPassword } }),
  remove: () => request<void>(`${V1}/users/me`, { method: "DELETE" }),
};

export const cropApi = {
  list: () => request<Crop[]>(`${V1}/crops`),
  get: (id: string) => request<Crop>(`${V1}/crops/${id}`),
  create: (data: { name: string; type: CropType }) => request<CropCreated>(`${V1}/crops`, { method: "POST", body: data }),
  update: (id: string, data: { name: string; type: CropType }) =>
    request<Crop>(`${V1}/crops/${id}`, { method: "PUT", body: data }),
  remove: (id: string) => request<void>(`${V1}/crops/${id}`, { method: "DELETE" }),
  setAutomation: (id: string, enabled: boolean) =>
    request<Crop>(`${V1}/crops/${id}/automation`, { method: "PUT", body: { enabled } }),
  /** Sin ids, se aplica a todos los cultivos de la cuenta. */
  setAutomationBulk: (enabled: boolean, cropIds?: string[]) =>
    request<Crop[]>(`${V1}/crops/automation`, { method: "PUT", body: { enabled, cropIds: cropIds ?? null } }),
  device: (id: string) => request<DeviceCredentials>(`${V1}/crops/${id}/device`),
  rotateKey: (id: string) => request<DeviceCredentials>(`${V1}/crops/${id}/device/key`, { method: "POST" }),
  profiles: () => request<CropProfile[]>(`${V1}/crop-profiles`, { auth: false }),
};

export const readingApi = {
  list: (cropId: string, from?: Date, limit?: number) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from.toISOString());
    if (limit) params.set("limit", String(limit));
    return request<Reading[]>(`${V1}/crops/${cropId}/readings?${params}`);
  },
  summary: (cropId: string, hours: number) =>
    request<ReadingSummary>(`${V1}/crops/${cropId}/readings/summary?hours=${hours}`),
  create: (cropId: string, measures: Measures) =>
    request<Reading>(`${V1}/crops/${cropId}/readings`, { method: "POST", body: measures }),
  exportCsv: (cropId: string, from: Date) =>
    request<string>(`${V1}/crops/${cropId}/readings/export?from=${encodeURIComponent(from.toISOString())}`,
      { accept: "text" }),
};

export const actuatorApi = {
  list: (cropId: string) => request<Actuator[]>(`${V1}/crops/${cropId}/actuators`),
  add: (cropId: string, type: ActuatorType) =>
    request<Actuator>(`${V1}/crops/${cropId}/actuators`, { method: "POST", body: { type } }),
  remove: (cropId: string, actuatorId: string) =>
    request<void>(`${V1}/crops/${cropId}/actuators/${actuatorId}`, { method: "DELETE" }),
};

export const commandApi = {
  list: (cropId: string, limit = 20) => request<Command[]>(`${V1}/crops/${cropId}/commands?limit=${limit}`),
  send: (cropId: string, actuatorId: string, action: CommandAction, durationSeconds?: number | null) =>
    request<Command>(`${V1}/crops/${cropId}/commands`, {
      method: "POST",
      body: { actuatorId, action, durationSeconds: durationSeconds ?? null },
    }),
  listAll: (limit = 50) => request<Command[]>(`${V1}/commands?limit=${limit}`),
  bulk: (body: { actuatorType: ActuatorType; action: CommandAction; durationSeconds?: number | null; cropIds?: string[] }) =>
    request<BulkCommandResult>(`${V1}/commands/bulk`, {
      method: "POST",
      body: { ...body, durationSeconds: body.durationSeconds ?? null, cropIds: body.cropIds ?? null },
    }),
};

export const overviewApi = {
  get: () => request<Overview>(`${V1}/overview`),
  series: (metric: MetricKey, hours: number) =>
    request<MetricSeries>(`${V1}/overview/series?metric=${metric}&hours=${hours}`),
  fleet: () => request<Fleet>(`${V1}/overview/fleet`),
};

export const insightApi = {
  get: (cropId: string) => request<Insight>(`${V1}/crops/${cropId}/insights`),
};

export const notificationApi = {
  list: (unreadOnly = false) => request<AppNotification[]>(`${V1}/notifications?unreadOnly=${unreadOnly}&limit=50`),
  unreadCount: () => request<{ unread: number }>(`${V1}/notifications/unread-count`),
  markRead: (id: string) => request<AppNotification>(`${V1}/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () => request<void>(`${V1}/notifications/read-all`, { method: "PUT" }),
  remove: (id: string) => request<void>(`${V1}/notifications/${id}`, { method: "DELETE" }),
};
