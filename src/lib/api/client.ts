import {API_URL} from "../../config/env";
import {CSRF_HEADER_NAME} from "../../features/auth/session";
import {t, type TranslationKey} from "../i18n";
import {translateServerText} from "../i18n/serverText";

const TIMEOUT_MS = 15_000;
const MAX_ETAG_ENTRIES = 64;

export class ApiError extends Error {
    readonly status: number;
    readonly fields: Record<string, string>;

    constructor(status: number, message: string, fields: Record<string, string> = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fields = fields;
    }
}

interface ApiHooks {
    getCsrfToken?: () => string | null;
    setCsrfToken?: (token: string) => void;
    getCacheScope?: () => string | null;
    onUnauthorized: () => void;
}

interface CachedResource {
    etag: string;
    value: unknown;
}

let hooks: ApiHooks = {onUnauthorized: () => undefined};
const etagCache = new Map<string, CachedResource>();

export function configureApi(next: ApiHooks) {
    hooks = next;
    etagCache.clear();
}

export function clearApiCache() {
    etagCache.clear();
}

interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    auth?: boolean;
    signal?: AbortSignal;
    accept?: "json" | "text";
}

const FALLBACK_MESSAGES: Record<number, TranslationKey> = {
    400: "api.error400",
    401: "api.error401",
    403: "api.error403",
    404: "api.error404",
    409: "api.error409",
    429: "api.error429",
    503: "api.error503",
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {method = "GET", body, auth = true, signal, accept = "json"} = options;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, {once: true});

    const headers: Record<string, string> = {Accept: accept === "json" ? "application/json" : "text/csv"};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth && method !== "GET") {
        const csrf = hooks.getCsrfToken?.() ?? null;
        if (csrf) headers[CSRF_HEADER_NAME] = csrf;
    }

    const scope = auth ? (hooks.getCacheScope?.() ?? "session") : "public";
    const cacheKey = method === "GET" && accept === "json" ? `${scope}:${path}` : null;
    const cached = cacheKey ? etagCache.get(cacheKey) : undefined;
    if (cached) headers["If-None-Match"] = cached.etag;

    if (method !== "GET") {
        etagCache.clear();
    }

    // El timeout cubre toda la operación, no solo la llegada de las cabeceras: un cuerpo que se queda colgado
    // también debe liberar al recurso que espera la promesa.
    try {
        const response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            credentials: "include",
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: controller.signal,
        }).catch((error) => {
            if (signal?.aborted) throw error;
            const offline = typeof navigator !== "undefined" && !navigator.onLine;
            throw new ApiError(0, offline
                ? t("api.offline")
                : t("api.unreachable"));
        });

        const nextCsrf = response.headers?.get(CSRF_HEADER_NAME);
        if (nextCsrf) {
            hooks.setCsrfToken?.(nextCsrf);
        }

        if (response.status === 401 && auth) {
            etagCache.clear();
            hooks.onUnauthorized();
        }

        if (response.status === 304 && cached) {
            return structuredClone(cached.value) as T;
        }

        if (!response.ok) {
            let message = t(FALLBACK_MESSAGES[response.status] ?? "api.errorUnexpected");
            let fields: Record<string, string> = {};
            try {
                const data = await response.json();
                if (typeof data?.message === "string") message = translateServerText(data.message);
                if (data?.fields && typeof data.fields === "object") {
                    fields = {};
                    for (const [k, v] of Object.entries(data.fields)) {
                        fields[k] = typeof v === "string" ? translateServerText(v) : String(v);
                    }
                }
            } catch {
                // El cuerpo no es JSON: se usa el mensaje por defecto.
            }
            throw new ApiError(response.status, message, fields);
        }

        const text = response.status === 204 ? "" : await response.text();
        if (accept === "text") return text as T;
        const parsed = (text ? JSON.parse(text) : undefined) as T;

        const etag = response.headers?.get("ETag");
        if (cacheKey && etag && parsed !== undefined) {
            if (etagCache.size >= MAX_ETAG_ENTRIES) {
                const oldestKey = etagCache.keys().next().value;
                if (oldestKey !== undefined) etagCache.delete(oldestKey);
            }
            etagCache.set(cacheKey, {etag, value: parsed});
        }

        return parsed;
    } finally {
        clearTimeout(timeout);
        signal?.removeEventListener("abort", abort);
    }
}
