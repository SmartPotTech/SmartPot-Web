import {API_URL} from "../config/env";
import type {Reading} from "../lib/api/types";

export interface StreamSubscription {
    unsubscribe: () => void;
}

const DEFAULT_RETRY_MS = 5000;
const MAX_RETRY_MS = 60_000;

/**
 * Recibe en vivo las lecturas de un cultivo (Server-Sent Events). Usa fetch con credenciales para enviar la cookie
 * HttpOnly de sesión, entiende el flujo tanto con chunked (HTTP/1.1) como sin él (HTTP/1.0 hasta el cierre) y se
 * reconecta solo con espera creciente. Si el navegador o un proxy no dejan pasar el flujo, la página sigue con su
 * consulta periódica (con ETag).
 */
export function subscribeTelemetryStream(cropId: string, onReading: (reading: Reading) => void): StreamSubscription {
    if (typeof ReadableStream === "undefined" || typeof fetch !== "function") {
        return {unsubscribe: () => undefined};
    }
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let active = true;
    let retryMs = DEFAULT_RETRY_MS;
    let failures = 0;

    const schedule = () => {
        if (!active) return;
        // El primer reintento debe respetar los 5000 ms anunciados: failures ya se incrementó antes de programar.
        const wait = Math.min(retryMs * 2 ** Math.min(Math.max(failures - 1, 0), 4), MAX_RETRY_MS);
        timer = setTimeout(() => void connect(), wait);
    };

    const handleBlock = (block: string) => {
        let event = "message";
        const data: string[] = [];
        for (const raw of block.split("\n")) {
            const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
            if (line.startsWith(":")) continue;
            const colon = line.indexOf(":");
            const field = colon === -1 ? line : line.slice(0, colon);
            const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
            if (field === "event") event = value;
            else if (field === "data") data.push(value);
            else if (field === "retry" && /^\d+$/.test(value)) retryMs = Math.max(1_000, Number(value));
        }
        if (event !== "reading" || data.length === 0) return;
        try {
            onReading(JSON.parse(data.join("\n")) as Reading);
        } catch {
            // Un evento mal formado no corta el flujo.
        }
    };

    async function connect() {
        controller = new AbortController();
        try {
            const response = await fetch(`${API_URL}/api/v1/crops/${encodeURIComponent(cropId)}/stream`, {
                headers: {Accept: "text/event-stream"},
                credentials: "include",
                signal: controller.signal,
                cache: "no-store",
            });
            if (!response.ok || !response.body) {
                failures += 1;
                // Sin permiso no tiene sentido insistir.
                if (response.status !== 401 && response.status !== 403 && response.status !== 404) schedule();
                return;
            }
            failures = 0;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while (active) {
                const {done, value} = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {stream: true}).replace(/\r\n/g, "\n");
                let cut = buffer.indexOf("\n\n");
                while (cut !== -1) {
                    handleBlock(buffer.slice(0, cut));
                    buffer = buffer.slice(cut + 2);
                    cut = buffer.indexOf("\n\n");
                }
            }
            schedule();
        } catch {
            if (!active) return;
            failures += 1;
            schedule();
        }
    }

    void connect();

    return {
        unsubscribe: () => {
            active = false;
            if (timer) clearTimeout(timer);
            controller?.abort();
        },
    };
}
