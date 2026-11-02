import {Check, Copy} from "lucide-solid";
import {createSignal, Show} from "solid-js";
import {Alert} from "../../../components/ui/Feedback";
import type {DeviceCredentials} from "../../../lib/api/types";
import {t} from "../../../lib/i18n";

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
        </div>
    );
}
