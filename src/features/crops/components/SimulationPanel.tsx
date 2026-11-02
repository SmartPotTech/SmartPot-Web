import {CloudSun, Hand, Pause, PauseCircle, Play, PlayCircle, Save, SunMoon} from "lucide-solid";
import {createSignal, For, Show} from "solid-js";
import {Button} from "../../../components/ui/Button";
import {Alert} from "../../../components/ui/Feedback";
import {ApiError} from "../../../lib/api/client";
import {virtualDeviceApi} from "../../../lib/api/services";
import {describePlacement, METRICS, PRIMARY_METRICS} from "../../../lib/catalog";
import {formatMetric, timeAgo} from "../../../lib/format";
import type {
    Crop,
    CropProfile,
    Measures,
    MetricKey,
    VirtualDevice,
    VirtualDeviceRequest,
    VirtualMode,
} from "../../../lib/api/types";
import {t, type TranslationKey} from "../../../lib/i18n";
import {LocationPicker, type PickedLocation} from "./LocationPicker";

const MODES: { id: VirtualMode; label: TranslationKey; hint: TranslationKey; icon: typeof CloudSun }[] = [
    {id: "AUTO", label: "sim.mode.AUTO", hint: "sim.mode.AUTO.hint", icon: SunMoon},
    {id: "WEATHER", label: "sim.mode.WEATHER", hint: "sim.mode.WEATHER.hint", icon: CloudSun},
    {id: "MANUAL", label: "sim.mode.MANUAL", hint: "sim.mode.MANUAL.hint", icon: Hand},
];

/** Escala de cada medidor, la misma de los sensores del firmware. */
const GAUGES: Record<MetricKey, { min: number; max: number; step: number }> = {
    temperature: {min: -5, max: 45, step: 0.5},
    humidity: {min: 0, max: 100, step: 1},
    soilMoisture: {min: 0, max: 100, step: 1},
    brightness: {min: 0, max: 2000, step: 10},
    ph: {min: 3, max: 10, step: 0.1},
    tds: {min: 0, max: 3000, step: 10},
    atmosphere: {min: 700, max: 1100, step: 1},
};
const MANUAL_METRICS: MetricKey[] = [...PRIMARY_METRICS, "atmosphere"];

function startingGauges(device: VirtualDevice, profile: CropProfile | undefined): Measures {
    const values: Measures = {};
    for (const key of MANUAL_METRICS) {
        const range = profile?.ranges[key];
        values[key] = device.manual?.[key] ?? device.lastReading?.[key]
            ?? (range ? Math.round(((range.min + range.max) / 2) * 10) / 10 : key === "atmosphere" ? 1012 : GAUGES[key].min);
    }
    return values;
}

export function ModePicker(props: { value: VirtualMode; onChange: (mode: VirtualMode) => void }) {
    return (
        <div class="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t("sim.modeLabel")}>
            <For each={MODES}>
                {(item) => {
                    const Icon = item.icon;
                    return (
                        <button type="button" role="radio" aria-checked={props.value === item.id}
                                onClick={() => props.onChange(item.id)}
                                class={`rounded-xl border p-3 text-left transition-colors ${props.value === item.id
                                    ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-card hover:bg-surface"}`}>
                            <span class="flex items-center gap-2 font-semibold">
                                <Icon size={16} class="text-accent"/>{t(item.label)}
                            </span>
                            <span class="mt-1 block text-xs text-muted">{t(item.hint)}</span>
                        </button>
                    );
                }}
            </For>
        </div>
    );
}

interface SimulationPanelProps {
    crop: Crop;
    simulation: VirtualDevice;
    profile: CropProfile | undefined;
    onSaved: (simulation: VirtualDevice) => void;
    onPaused: () => void;
    onOpenTab: (tab: string) => void;
}

/**
 * La simulación de un cultivo virtual, el equivalente a la pestaña Dispositivo de uno real: arriba su estado con
 * los botones para pausarla o reanudarla, independientes de la configuración; abajo cómo se simula (modo, lugar,
 * medidores y frecuencia), que se guarda con «Aplicar cambios».
 */
export function SimulationPanel(props: SimulationPanelProps) {
    const [mode, setMode] = createSignal<VirtualMode>(props.simulation.mode ?? "AUTO");
    const [location, setLocation] = createSignal<PickedLocation | null>(props.simulation.location ?? null);
    const [gauges, setGauges] = createSignal<Measures>(startingGauges(props.simulation, props.profile));
    const [intervalSeconds, setIntervalSeconds] = createSignal(props.simulation.intervalSeconds ?? 30);
    const [busy, setBusy] = createSignal<"save" | "pause" | "resume" | null>(null);
    const [error, setError] = createSignal<string | null>(null);
    const [saved, setSaved] = createSignal(false);
    const place = () => describePlacement({...props.crop.placement, location: null});

    async function configure(key: "save" | "resume", body: VirtualDeviceRequest) {
        if (body.mode === "WEATHER" && !body.location && !props.simulation.location) {
            setError(t("sim.pickPlace"));
            return;
        }
        setBusy(key);
        setError(null);
        setSaved(false);
        try {
            props.onSaved(await virtualDeviceApi.configure(props.crop.id, body));
            if (key === "save") setSaved(true);
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : t("sim.saveFailed"));
        } finally {
            setBusy(null);
        }
    }

    /** Reanuda con lo que estaba guardado, sin tocar lo que se esté editando abajo. */
    function resume() {
        void configure("resume", {
            mode: props.simulation.mode ?? "AUTO",
            intervalSeconds: props.simulation.intervalSeconds ?? 30,
            ...(props.simulation.location ? {location: props.simulation.location} : {}),
        });
    }

    function apply() {
        void configure("save", {
            mode: mode(),
            intervalSeconds: intervalSeconds(),
            ...(location() ? {location: location()!} : {}),
            ...(mode() === "MANUAL" ? {manual: gauges()} : {}),
        });
    }

    async function pause() {
        setBusy("pause");
        setError(null);
        try {
            await virtualDeviceApi.pause(props.crop.id);
            props.onPaused();
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : t("sim.pauseFailed"));
        } finally {
            setBusy(null);
        }
    }

    const active = () => props.simulation.active;
    const state = () => !active() ? t("sim.statePaused") : props.simulation.connected ? t("sim.stateRunning")
        : props.simulation.running ? t("sim.stateConnecting") : t("sim.stateRestarting");

    return (
        <div class="space-y-5">
            <section class="card flex flex-wrap items-center justify-between gap-4 p-5"
                     aria-label={t("sim.statusLabel")}>
                <div class="flex items-center gap-4">
                    <div
                        class={`flex h-11 w-11 items-center justify-center rounded-xl ${active() && props.simulation.connected
                            ? "bg-leaf-50 text-accent" : "bg-surface text-muted"}`}>
                        <Show when={active()} fallback={<PauseCircle size={22}/>}>
                            <PlayCircle size={22}/>
                        </Show>
                    </div>
                    <div>
                        <p class="font-semibold">{state()}</p>
                        <p class="text-sm text-muted">
                            <Show when={active()} fallback={t("sim.pausedBody")}>
                                {t("sim.lastReading", {
                                    time: timeAgo(props.simulation.lastPublishedAt),
                                    seconds: props.simulation.intervalSeconds ?? 30,
                                })}
                                {props.simulation.lastCommand && t("sim.lastCommand", {message: props.simulation.lastCommand.message})}
                            </Show>
                        </p>
                    </div>
                </div>
                <Show when={active()} fallback={
                    <Button icon={<Play size={16}/>} loading={busy() === "resume"} onClick={resume}>{t("sim.resume")}</Button>
                }>
                    <Button variant="secondary" icon={<Pause size={16}/>} loading={busy() === "pause"}
                            onClick={() => void pause()}>
                        {t("sim.pause")}
                    </Button>
                </Show>
            </section>

            <Show when={error()}>
                {(err) => <Alert tone="danger">{err()}</Alert>}
            </Show>

            <section class="card space-y-4 p-5" aria-labelledby="simulation-title">
                <div>
                    <h3 id="simulation-title" class="font-semibold">{t("sim.howTitle")}</h3>
                    <p class="mt-1 text-sm text-muted">
                        {t("sim.howBody")}
                    </p>
                </div>

                <ModePicker value={mode()} onChange={setMode}/>
                <Show when={mode() === "WEATHER"}>
                    <div class="space-y-2">
                        <p class="text-sm">
                            {t("sim.weatherArrives")}{place() ?
                            <strong>{place()}</strong> : t("sim.openAir")}{t("sim.weatherNote")}
                            <button type="button" onClick={() => props.onOpenTab("settings")}
                                    class="font-semibold text-link hover:underline">{t("sim.changeWhere")}
                            </button>
                        </p>
                        <LocationPicker value={location()} onChange={setLocation}/>
                    </div>
                </Show>
                <Show when={mode() === "MANUAL"}>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <For each={MANUAL_METRICS}>
                            {(key) => {
                                const scale = GAUGES[key];
                                const range = () => props.profile?.ranges[key];
                                const value = () => gauges()[key] ?? scale.min;
                                return (
                                    <label class="block text-sm">
                                        <span class="flex justify-between gap-2">
                                            <span class="font-semibold">{METRICS[key].label}</span>
                                            <span class="tabular-nums">{formatMetric(key, value())}</span>
                                        </span>
                                        <input type="range" min={scale.min} max={scale.max} step={scale.step}
                                               value={value()}
                                               onInput={(event) => setGauges((previous) => ({
                                                   ...previous,
                                                   [key]: Number(event.currentTarget.value),
                                               }))}
                                               class="mt-1 w-full accent-leaf-700" aria-label={METRICS[key].label}/>
                                        <Show when={range()}>
                                            {(r) => (
                                                <span class="text-xs text-muted">{t("sim.ideal", {min: r().min, max: r().max, unit: r().unit})}</span>
                                            )}
                                        </Show>
                                    </label>
                                );
                            }}
                        </For>
                    </div>
                </Show>

                <label class="flex flex-wrap items-center gap-2 text-sm">
                    <span class="font-semibold">{t("sim.every")}</span>
                    <select value={intervalSeconds()}
                            onChange={(event) => setIntervalSeconds(Number(event.currentTarget.value))}
                            class="h-9 rounded-lg border border-line bg-card px-2">
                        <For each={[15, 30, 60, 120]}>
                            {(seconds) => <option value={seconds}>{seconds} s</option>}
                        </For>
                    </select>
                </label>

                <div class="flex flex-wrap items-center gap-3">
                    <Button icon={<Save size={16}/>} loading={busy() === "save"} onClick={apply}>
                        {active() ? t("sim.apply") : t("sim.applyResume")}
                    </Button>
                    <Show when={saved()}>
                        <span class="text-sm text-accent">{t("sim.applied")}</span>
                    </Show>
                </div>
            </section>
        </div>
    );
}
