import {Check, Copy, Download} from "lucide-solid";
import {createSignal, Show} from "solid-js";
import {Button} from "../../../components/ui/Button";
import {Alert} from "../../../components/ui/Feedback";
import type {DeviceCredentials} from "../../../lib/api/types";
import {formatDateTime} from "../../../lib/format";
import {t} from "../../../lib/i18n";
import {BROKER_CA_PATH, firmwareConfig} from "../firmware";

export function CopyRow(props: { label: string; value: string; secret?: boolean }) {
    const [copied, setCopied] = createSignal(false);
    return (
        <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">{props.label}</p>
            <div class="mt-1 flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
                <code
                    class={`flex-1 break-all text-sm ${props.secret ? "font-semibold text-accent-strong" : ""}`}>{props.value}</code>
                <button type="button" aria-label={t("cred.copy", {label: props.label.toLowerCase()})}
                        class="rounded p-1 text-muted hover:text-accent"
                        onClick={async () => {
                            await navigator.clipboard?.writeText(props.value);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                        }}>
                    <Show when={copied()} fallback={<Copy size={16}/>}>
                        <Check size={16}/>
                    </Show>
                </button>
            </div>
        </div>
    );
}

function triggerDownload(filename: string, content: string, mime = "text/plain") {
    const blob = new Blob([content], {type: mime});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generateConfigPy(credentials: DeviceCredentials, caCert?: string): string {
    const ca = credentials.tls ? (caCert?.trim() || "") : "";
    return `# SmartPot Device Provisioning - MicroPython Configuration
WIFI_SSID = "YourWiFiNetwork"
WIFI_PASSWORD = "YourWiFiPassword"

CROP_ID = "${credentials.username}"
DEVICE_KEY = "${credentials.key || ""}"

BROKER_HOST = "${credentials.host}"
BROKER_PORT = ${credentials.port}
BROKER_USE_TLS = ${credentials.tls ? "True" : "False"}
BROKER_CA_CRT = """${ca}"""
INTERVAL_SECONDS = 30
`;
}

function generateEnv(credentials: DeviceCredentials, caCert?: string): string {
    const ca = credentials.tls ? (caCert?.trim() || "") : "";
    return `# SmartPot Device Provisioning - Environment Configuration
SSID=YourWiFiNetwork
PASSWORD=YourWiFiPassword
CROP_ID=${credentials.username}
DEVICE_KEY=${credentials.key || ""}
BROKER_HOST=${credentials.host}
BROKER_PORT=${credentials.port}
USE_TLS=${credentials.tls ? "1" : "0"}
CA_CERT_PEM="${ca}"
`;
}

async function fetchCertificate(tls: boolean): Promise<string | undefined> {
    if (!tls) return undefined;
    try {
        const res = await fetch(BROKER_CA_PATH);
        if (res.ok) {
            const text = await res.text();
            if (text.includes("BEGIN CERTIFICATE")) return text;
        }
    } catch {
        // En caso de fallo de red se descarga la configuración sin CA incrustada
    }
    return undefined;
}

/** Datos de conexión del dispositivo. La clave solo llega al crear el cultivo o al rotarla. */
export function CredentialsView(props: { credentials: DeviceCredentials }) {
    return (
        <div class="space-y-4">
            <Show when={props.credentials.key}>
                <Alert tone="warning" title={t("cred.saveNow")}>
                    {t("cred.saveNowBody")}
                </Alert>
            </Show>
            <div class="grid gap-3 sm:grid-cols-2">
                <CopyRow label={t("cred.broker")}
                         value={`${props.credentials.host}:${props.credentials.port}${props.credentials.tls ? " (TLS)" : ""}`}/>
                <CopyRow label={t("cred.username")} value={props.credentials.username}/>
            </div>
            <Show when={props.credentials.key}>
                {(key) => <CopyRow label={t("cred.key")} value={key()} secret/>}
            </Show>
            <CopyRow label={t("cred.telemetry")} value={props.credentials.topics.telemetry}/>

            <Show when={props.credentials.keyRotatedAt}>
                {(rotated) => (
                    <p class="text-xs text-muted">{t("cred.lastRotated", {date: formatDateTime(rotated())})}</p>
                )}
            </Show>

            <div class="rounded-xl border border-line bg-surface p-3.5 space-y-2">
                <p class="text-xs font-semibold text-muted uppercase tracking-wide">{t("cred.downloadHint")}</p>
                <div class="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" icon={<Download size={14}/>}
                            onClick={async () => {
                                const ca = await fetchCertificate(props.credentials.tls);
                                triggerDownload("config.json", firmwareConfig(props.credentials, "esp32", ca), "application/json");
                            }}>
                        {t("cred.downloadJson")}
                    </Button>
                    <Button variant="secondary" size="sm" icon={<Download size={14}/>}
                            onClick={async () => {
                                const ca = await fetchCertificate(props.credentials.tls);
                                triggerDownload("config.py", generateConfigPy(props.credentials, ca), "text/x-python");
                            }}>
                        {t("cred.downloadPy")}
                    </Button>
                    <Button variant="secondary" size="sm" icon={<Download size={14}/>}
                            onClick={async () => {
                                const ca = await fetchCertificate(props.credentials.tls);
                                triggerDownload(".env", generateEnv(props.credentials, ca), "text/plain");
                            }}>
                        {t("cred.downloadEnv")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
