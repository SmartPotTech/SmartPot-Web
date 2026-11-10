import {Check, Copy, Cpu, ExternalLink, MonitorPlay} from "lucide-solid";
import {createEffect, createSignal, For, type JSX, onCleanup, Show} from "solid-js";
import {Alert} from "../../../components/ui/Feedback";
import type {DeviceCredentials} from "../../../lib/api/types";
import {t, type TranslationKey} from "../../../lib/i18n";
import {
    BROKER_CA_PATH,
    FIRMWARE_PYTHON_REPO,
    FIRMWARE_RUST_REPO,
    firmwareConfig,
    type FirmwareTarget,
    WOKWI_PROJECT,
} from "../firmware";
import {CredentialsView} from "./CredentialsView";

const TARGETS: { id: FirmwareTarget; label: TranslationKey; hint: TranslationKey; icon: typeof Cpu }[] = [
    {id: "rust", label: "guide.targetRust", hint: "guide.targetRustHint", icon: Cpu},
    {id: "python", label: "guide.targetPython", hint: "guide.targetPythonHint", icon: Cpu},
    {id: "wokwi", label: "guide.targetWokwi", hint: "guide.targetWokwiHint", icon: MonitorPlay},
];

/** Pines del circuito físico con firmware Rust Embassy (main.rs / diagram.json). */
export const RUST_PINS: [TranslationKey, string][] = [
    ["guide.pin.rust.i2c", "SDA 21 · SCL 22"],
    ["guide.pin.rust.tds", "GPIO 34"],
    ["guide.pin.rust.ph", "GPIO 35"],
    ["guide.pin.rust.soil", "GPIO 32"],
    ["guide.pin.rust.pump", "GPIO 25"],
    ["guide.pin.rust.uv", "GPIO 26"],
    ["guide.pin.rust.fan", "GPIO 27"],
    ["guide.pin.rust.humidifier", "GPIO 5"],
];

/** Pines del circuito con firmware MicroPython / Wokwi (fs/main.py). */
export const PYTHON_PINS: [TranslationKey, string][] = [
    ["guide.pin.py.dht", "GPIO 15"],
    ["guide.pin.py.light", "GPIO 34"],
    ["guide.pin.py.ph", "GPIO 35"],
    ["guide.pin.py.tds", "GPIO 32"],
    ["guide.pin.py.soil", "GPIO 33"],
    ["guide.pin.py.pump", "GPIO 19"],
    ["guide.pin.py.uv", "GPIO 18"],
    ["guide.pin.py.fan", "GPIO 5"],
    ["guide.pin.py.lcd", "SCL 16 · SDA 17"],
];

/** Alias retrocompatible con pruebas e importadores existentes. */
export const PINS = PYTHON_PINS;

function Step(props: { number: number; title: string; children: JSX.Element }) {
    return (
        <li class="flex gap-3">
            <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-sm font-bold text-white">
                {props.number}
            </span>
            <div class="min-w-0 flex-1 space-y-2 text-sm">
                <p class="font-semibold text-ink">{props.title}</p>
                {props.children}
            </div>
        </li>
    );
}

/** La CA pública del broker, para incluirla en BROKER de config.json. */
function useBrokerCertificate(enabled: () => boolean) {
    const [certificate, setCertificate] = createSignal<string>();
    createEffect(() => {
        if (!enabled()) return;
        let active = true;
        fetch(BROKER_CA_PATH)
            .then((response) => (response.ok ? response.text() : ""))
            .then((text) => {
                if (active && text.includes("BEGIN CERTIFICATE")) setCertificate(text);
            })
            .catch(() => undefined);
        onCleanup(() => {
            active = false;
        });
    });
    return certificate;
}

function ConfigBlock(props: { credentials: DeviceCredentials; target: FirmwareTarget }) {
    const [copied, setCopied] = createSignal(false);
    const certificate = useBrokerCertificate(() => props.credentials.tls);
    const config = () => firmwareConfig(props.credentials, props.target, certificate());
    return (
        <div class="relative">
            <pre class="overflow-x-auto rounded-lg bg-leaf-950 p-3 pr-10 text-xs text-leaf-100">{config()}</pre>
            <button type="button" aria-label={t("guide.copyConfig")}
                    class="absolute right-2 top-2 rounded p-1 text-leaf-100/80 hover:text-white"
                    onClick={async () => {
                        await navigator.clipboard?.writeText(config());
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                    }}>
                <Show when={copied()} fallback={<Copy size={16}/>}>
                    <Check size={16}/>
                </Show>
            </button>
            <Show when={props.credentials.tls}>
                <p class="mt-1.5 text-xs text-muted">
                    <code>BROKER</code>{t("guide.caIncluded")}<a
                    href={BROKER_CA_PATH} download="" class="font-semibold text-accent">ca.crt</a>{t("guide.caClose")}
                </p>
            </Show>
        </div>
    );
}

function Link(props: { href: string; children: JSX.Element }) {
    return (
        <a href={props.href} target="_blank" rel="noreferrer"
           class="inline-flex items-center gap-1 font-semibold text-link hover:underline">
            {props.children} <ExternalLink size={13}/>
        </a>
    );
}

/**
 * Guía para conectar un cultivo real: firmware canónico en Rust (Embassy), firmware en MicroPython
 * o simulación en Wokwi. Todos usan la cuenta MQTT del cultivo real.
 */
export function ConnectionGuide(props: { credentials: DeviceCredentials; initialTarget?: FirmwareTarget }) {
    const [target, setTarget] = createSignal<FirmwareTarget>(props.initialTarget ?? "rust");
    const activeTarget = () => (target() === "esp32" ? "rust" : target());

    return (
        <div class="space-y-5">
            <CredentialsView credentials={props.credentials}/>

            <div class="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t("guide.where")}>
                <For each={TARGETS}>
                    {(item) => {
                        const Icon = item.icon;
                        const isChecked = () => activeTarget() === item.id;
                        return (
                            <button type="button" role="radio" aria-checked={isChecked()}
                                    onClick={() => setTarget(item.id)}
                                    class={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${isChecked()
                                        ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-card hover:bg-surface"}`}>
                                <Icon size={20} class="mt-0.5 shrink-0 text-accent"/>
                                <span>
                                    <span class="block font-semibold">{t(item.label)}</span>
                                    <span class="block text-xs text-muted">{t(item.hint)}</span>
                                </span>
                            </button>
                        );
                    }}
                </For>
            </div>

            <Show when={activeTarget() === "rust"}>
                <ol class="space-y-4">
                    <Step number={1} title={t("guide.rust.step1")}>
                        <ul class="grid gap-x-4 gap-y-1 text-muted sm:grid-cols-2">
                            <For each={RUST_PINS}>
                                {([part, pin]) => (
                                    <li class="flex justify-between gap-2 border-b border-line/70 py-0.5">
                                        <span>{t(part)}</span><span class="font-medium text-ink">{pin}</span>
                                    </li>
                                )}
                            </For>
                        </ul>
                    </Step>
                    <Step number={2} title={t("guide.rust.step2")}>
                        <p class="text-muted">
                            {t("guide.rust.step2Body1")}
                            <Link href={FIRMWARE_RUST_REPO}>{t("guide.rust.step2Link")}</Link>
                            {t("guide.rust.step2Body2")}
                            <code class="rounded bg-surface px-1.5 py-0.5 font-mono text-ink">cargo +esp run --release</code>.
                        </p>
                    </Step>
                    <Step number={3} title={t("guide.rust.step3")}>
                        <ConfigBlock credentials={props.credentials} target="rust"/>
                    </Step>
                    <Step number={4} title={t("guide.rust.step4")}>
                        <p class="text-muted">{t("guide.p4Body1")}<strong class="text-ink">{t("card.online")}</strong>{t("guide.p4Body2")}</p>
                    </Step>
                </ol>
            </Show>

            <Show when={activeTarget() === "python"}>
                <ol class="space-y-4">
                    <Step number={1} title={t("guide.py.step1")}>
                        <ul class="grid gap-x-4 gap-y-1 text-muted sm:grid-cols-2">
                            <For each={PYTHON_PINS}>
                                {([part, pin]) => (
                                    <li class="flex justify-between gap-2 border-b border-line/70 py-0.5">
                                        <span>{t(part)}</span><span class="font-medium text-ink">{pin}</span>
                                    </li>
                                )}
                            </For>
                        </ul>
                    </Step>
                    <Step number={2} title={t("guide.py.step2")}>
                        <p class="text-muted">
                            {t("guide.py.step2Body1")}<code>fs/</code>{t("guide.py.step2Body2")}
                            <Link href={FIRMWARE_PYTHON_REPO}>{t("guide.py.step2Link")}</Link>
                            {t("guide.py.step2Body3")}<code>mpremote</code>.
                        </p>
                    </Step>
                    <Step number={3} title={t("guide.py.step3")}>
                        <ConfigBlock credentials={props.credentials} target="python"/>
                    </Step>
                    <Step number={4} title={t("guide.py.step4")}>
                        <p class="text-muted">{t("guide.p4Body1")}<strong class="text-ink">{t("card.online")}</strong>{t("guide.p4Body2")}</p>
                    </Step>
                </ol>
            </Show>

            <Show when={activeTarget() === "wokwi"}>
                <ol class="space-y-4">
                    <Step number={1} title={t("guide.w1")}>
                        <p class="text-muted">
                            <Link href={WOKWI_PROJECT}>{t("guide.w1Link")}</Link>{t("guide.w1Body")}
                        </p>
                    </Step>
                    <Step number={2} title={t("guide.w2")}>
                        <ConfigBlock credentials={props.credentials} target="wokwi"/>
                    </Step>
                    <Step number={3} title={t("guide.w3")}>
                        <p class="text-muted">{t("guide.w3Body1")}<code>Wokwi-GUEST</code>{t("guide.w3Body2")}</p>
                    </Step>
                </ol>
                <Alert tone="warning">
                    {t("guide.private1")}<code>config.json</code>{t("guide.private2")}
                </Alert>
            </Show>
        </div>
    );
}
