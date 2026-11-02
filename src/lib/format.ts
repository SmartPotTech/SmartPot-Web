import {ACTUATORS, METRICS} from "./catalog";
import type {ActuatorType, CommandAction, MetricKey, ProfileRange} from "./api/types";
import {intlLocale, locale, t} from "./i18n";

const formatters = new Map<string, Intl.DateTimeFormat | Intl.RelativeTimeFormat>();

/** Intl cuesta construirlo: un formateador por idioma y tipo. */
function cached<T extends Intl.DateTimeFormat | Intl.RelativeTimeFormat>(key: string, create: () => T): T {
    let found = formatters.get(key) as T | undefined;
    if (!found) {
        found = create();
        formatters.set(key, found);
    }
    return found;
}

const dateTime = () => cached(`dt:${intlLocale()}`, () => new Intl.DateTimeFormat(intlLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
}));
const time = () => cached(`t:${intlLocale()}`, () => new Intl.DateTimeFormat(intlLocale(), {
    hour: "2-digit",
    minute: "2-digit",
}));
const relative = () => cached(`r:${locale()}`, () => new Intl.RelativeTimeFormat(locale(), {numeric: "auto"}));

export function formatMetric(key: MetricKey, value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    const info = METRICS[key];
    const number = value.toLocaleString(intlLocale(), {
        minimumFractionDigits: 0,
        maximumFractionDigits: info.decimals,
    });
    return info.unit ? `${number} ${info.unit}` : number;
}

export function formatDateTime(value: string | null | undefined): string {
    return value ? dateTime().format(new Date(value)) : "—";
}

export function formatTime(value: string | number): string {
    return time().format(new Date(value));
}

export function timeAgo(value: string | null | undefined, now: number = Date.now()): string {
    if (!value) return t("common.never");
    const seconds = Math.round((new Date(value).getTime() - now) / 1000);
    const abs = Math.abs(seconds);
    const format = relative();
    if (abs < 60) return format.format(seconds, "second");
    if (abs < 3600) return format.format(Math.round(seconds / 60), "minute");
    if (abs < 86_400) return format.format(Math.round(seconds / 3600), "hour");
    return format.format(Math.round(seconds / 86_400), "day");
}

export type RangeStatus = "low" | "ok" | "high" | "unknown";

export function rangeStatus(value: number | null | undefined, range: ProfileRange | undefined): RangeStatus {
    if (value === null || value === undefined || !range) return "unknown";
    if (value < range.min) return "low";
    if (value > range.max) return "high";
    return "ok";
}

export function formatDuration(seconds: number | null | undefined): string {
    if (!seconds) return "";
    if (seconds < 60) return `${seconds} s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    return `${(seconds / 3600).toLocaleString(intlLocale(), {maximumFractionDigits: 1})} h`;
}

/** «Encender bomba de agua por 15 s», «Apagar luz ultravioleta». */
export function describeAction(actuator: ActuatorType, action: CommandAction, durationSeconds?: number | null): string {
    const name = ACTUATORS[actuator].label.toLowerCase();
    if (action !== "ACTIVATE") return t("format.action.deactivate", {actuator: name});
    return durationSeconds
        ? t("format.action.activateFor", {actuator: name, duration: formatDuration(durationSeconds)})
        : t("format.action.activate", {actuator: name});
}

/** Horas hasta un límite en lenguaje natural: «unos 40 min», «unas 3 h». */
export function formatHoursAhead(hours: number): string {
    if (hours < 1) return t("format.hoursMinutes", {minutes: Math.max(5, Math.round((hours * 60) / 5) * 5)});
    return hours < 1.5 ? t("format.aboutOneHour") : t("format.hours", {hours: Math.round(hours)});
}

export function greeting(date: Date = new Date()): string {
    const hour = date.getHours();
    // De madrugada todavía se saluda con «buenas noches».
    if (hour < 5) return t("format.greetingNight");
    if (hour < 12) return t("format.greetingMorning");
    if (hour < 19) return t("format.greetingAfternoon");
    return t("format.greetingEvening");
}
