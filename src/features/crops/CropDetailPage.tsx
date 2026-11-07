import {A, useParams, useSearchParams} from "@solidjs/router";
import {ArrowLeft, FileDown} from "lucide-solid";
import {createEffect, createSignal, For, lazy, onCleanup, Show, Suspense, untrack} from "solid-js";
import {Button} from "../../components/ui/Button";
import {Alert, Badge} from "../../components/ui/Feedback";
import {CropDetailSkeleton, SkeletonCard} from "../../components/ui/Skeleton";
import {usePageMeta} from "../../hooks/usePageMeta";
import {useResource} from "../../hooks/useResource";
import {ApiError} from "../../lib/api/client";
import {actuatorApi, commandApi, cropApi, insightApi, readingApi, virtualDeviceApi} from "../../lib/api/services";
import {CROP_FORMS, CROP_KINDS, CROP_TYPES, HEALTH, healthLabel, METRICS, PRIMARY_METRICS} from "../../lib/catalog";
import {formatMetric, timeAgo} from "../../lib/format";
import {t, type TranslationKey} from "../../lib/i18n";
import {st} from "../../lib/i18n/serverText";
import type {Actuator, Command, CropKind, MetricKey, Reading, VirtualDevice, Weather} from "../../lib/api/types";
import {subscribeTelemetryStream} from "../../services/stream";
import {ControlPanel} from "./components/ControlPanel";
import {CropHero} from "./components/CropHero";
import {InsightPanel} from "./components/InsightPanel";
import {MetricTile} from "./components/MetricTile";
import {ReadingsChart} from "./components/ReadingsChart";
import {useCropProfiles} from "./useCropProfiles";

// La simulación, el dispositivo y los ajustes solo se descargan al abrir su pestaña: no pesan en el resto del detalle
// (los ajustes traen el selector de lugar y el mapa; el dispositivo, la guía y las plantillas del firmware).
const SimulationPanel = lazy(async () => {
    const module = await import("./components/SimulationPanel");
    return {default: module.SimulationPanel};
});
const DevicePanel = lazy(async () => {
    const module = await import("./components/DevicePanel");
    return {default: module.DevicePanel};
});
const SettingsPanel = lazy(async () => {
    const module = await import("./components/SettingsPanel");
    return {default: module.SettingsPanel};
});

/** Los reales se configuran en Dispositivo; los virtuales, en Simulación. */
const TABS: { id: string; label: TranslationKey; only?: CropKind }[] = [
    {id: "summary", label: "detail.tab.summary"},
    {id: "assistant", label: "detail.tab.assistant"},
    {id: "control", label: "detail.tab.control"},
    {id: "history", label: "detail.tab.history"},
    {id: "device", label: "detail.tab.device", only: "REAL"},
    {id: "simulation", label: "detail.tab.simulation", only: "VIRTUAL"},
    {id: "settings", label: "detail.tab.settings"},
];

/** Enlaces antiguos: la ilustración ya vive sobre todas las secciones. */
const ALIASES: Record<string, string> = {live: "summary", virtual: "simulation"};

const RANGES = [
    {hours: 6, label: () => "6 h"},
    {hours: 24, label: () => "24 h"},
    {hours: 168, label: () => t("compare.days7")},
];

/** Tras una orden, el estado se vuelve a pedir en estos momentos para ver pronto la confirmación del dispositivo. */
const FOLLOW_UP_MS = [700, 2_000, 4_500];
const ACTIVE_POLL_MS = 4_000;
const IDLE_POLL_MS = 15_000;
/** Bucket de un minuto para que la URL de /readings sea estable y el ETag pueda responder 304. */
const READINGS_BUCKET_MS = 60_000;

interface AssistantTabProps {
    cropId: string;
    actuators: Actuator[];
    onChanged: () => void;
    onOpenTab: (tab: string) => void;
}

/**
 * El asistente se monta solo con su pestaña. Así el recurso nace con una clave estable (el cultivo), no depende de
 * `searchParams` y no queda un estado de carga falso cuando se abre la pestaña después de cargar la página.
 */
export function AssistantTab(props: AssistantTabProps) {
    const insight = useResource(() => insightApi.get(props.cropId), () => [props.cropId]);
    return (
        <InsightPanel insight={insight.data} error={insight.error} loading={insight.loading}
                      actuators={props.actuators}
                      onRefresh={() => void insight.reload()}
                      onRunAction={async (action, actuator) => {
                          await commandApi.send(props.cropId, actuator.id, action.action, action.durationSeconds);
                          props.onChanged();
                      }} onOpenTab={props.onOpenTab}/>
    );
}

export default function CropDetailPage(props: { cropId?: string } = {}) {
    const params = useParams<{ cropId: string }>();
    const cropId = () => props.cropId ?? params.cropId ?? "";
    const [searchParams, setSearchParams] = useSearchParams<{ tab?: string }>();
    const requested = () => (typeof searchParams.tab === "string" ? searchParams.tab : "summary");
    const wanted = () => ALIASES[requested()] ?? requested();
    const [metric, setMetric] = createSignal<MetricKey>("temperature");
    const [hours, setHours] = createSignal(24);
    const [exportError, setExportError] = createSignal<string | null>(null);
    const [liveReading, setLiveReading] = createSignal<Reading | null>(null);

    const crop = useResource(() => cropApi.get(cropId()), () => [cropId()], 20_000);
    // El `from` se ancla a un bucket de un minuto: dentro de la misma ventana la URL no cambia, el cliente reutiliza
    // el ETag y el sondeo de 30 s recibe 304 en vez de descargar la serie completa.
    const readingsFrom = () => new Date(
        Math.floor((Date.now() - hours() * 3600_000) / READINGS_BUCKET_MS) * READINGS_BUCKET_MS,
    );
    const readings = useResource(
        () => readingApi.list(cropId(), readingsFrom(), 2000),
        () => [cropId(), hours()],
        30_000,
    );
    // Las lecturas nuevas llegan en vivo por SSE y se suman a la serie; la consulta cada 30 s (con ETag) queda de
    // respaldo si el flujo no pasa por algún proxy. El mismo evento actualiza la última lectura del cultivo para que
    // los medidores y la escena no esperen al sondeo de 20 s.
    createEffect(() => {
        const id = cropId();
        const subscription = subscribeTelemetryStream(id, (reading: Reading) => {
            setLiveReading((previous) => !previous || Date.parse(reading.measuredAt) >= Date.parse(previous.measuredAt)
                ? reading
                : previous);
            const currentCrop = untrack(() => crop.data);
            if (currentCrop) {
                const previous = currentCrop.latestReading;
                if (!previous || Date.parse(previous.measuredAt) < Date.parse(reading.measuredAt)) {
                    crop.setData({
                        ...currentCrop,
                        latestReading: reading,
                        device: {...currentCrop.device, online: true, lastSeenAt: reading.measuredAt},
                    });
                }
            }
            const current = untrack(() => readings.data) ?? [];
            if (current.some((item) => item.id === reading.id)) return;
            const since = Date.now() - untrack(hours) * 3600_000;
            readings.setData([...current.filter((item) => Date.parse(item.measuredAt) >= since), reading]);
        });
        onCleanup(() => subscription.unsubscribe());
    });
    const tabs = () => TABS.filter((item) => !item.only || !crop.data || item.only === crop.data.kind);
    const tab = () => tabs().find((item) => item.id === wanted())?.id ?? "summary";
    const isVirtual = () => crop.data?.kind === "VIRTUAL";
    // La ilustración está sobre todas las secciones: actuadores y órdenes se refrescan siempre, también lo que decide
    // el agente de IA por su cuenta. Con una orden en viaje se consulta cada 4 s para ver su confirmación; en reposo
    // basta cada 15 s (el agente evalúa cada minuto y las lecturas llegan por SSE).
    const commandInFlight = (): boolean =>
        (commands.data ?? []).some((item) => item.status === "PENDING" || item.status === "SENT");
    const pollMs = (): number => (commandInFlight() ? ACTIVE_POLL_MS : IDLE_POLL_MS);
    const actuators = useResource(() => actuatorApi.list(cropId()), () => [cropId()], pollMs);
    const commands = useResource<Command[]>(() => commandApi.list(cropId()), () => [cropId()], pollMs);
    const simulation = useResource<VirtualDevice | null>(
        () => (isVirtual() ? virtualDeviceApi.get(cropId()) : Promise.resolve(null)),
        () => [cropId(), isVirtual()],
        8_000,
    );
    const locationKey = () => {
        const loc = crop.data?.placement?.location;
        return loc ? `${loc.latitude},${loc.longitude}` : "";
    };
    const weather = useResource<Weather | null>(
        () => (locationKey() ? cropApi.weather(cropId()).then((value) => value ?? null) : Promise.resolve(null)),
        () => [cropId(), locationKey()],
        600_000,
    );

    let followUps: number[] = [];
    const refreshSoon = () => {
        followUps.forEach((timer) => window.clearTimeout(timer));
        followUps = FOLLOW_UP_MS.map((delay) => window.setTimeout(() => {
            void actuators.reload();
            void commands.reload();
            if (isVirtual()) void simulation.reload();
        }, delay));
        void commands.reload();
    };
    onCleanup(() => followUps.forEach((timer) => window.clearTimeout(timer)));

    const profiles = useCropProfiles();

    usePageMeta(() => crop.data?.name ?? t("detail.defaultTitle"));

    const openTab = (id: string) => setSearchParams({tab: id === "summary" ? undefined : id}, {replace: true});

    async function exportCsv(currentName: string) {
        setExportError(null);
        try {
            const csv = await readingApi.exportCsv(cropId(), readingsFrom());
            const url = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"}));
            const link = document.createElement("a");
            link.href = url;
            link.download = `smartpot-${currentName.replace(/\s+/g, "-").toLowerCase()}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (caught) {
            setExportError(caught instanceof ApiError ? caught.message : t("detail.exportFailed"));
        }
    }

    return (
        <Show when={!(crop.loading && !crop.data)} fallback={<CropDetailSkeleton/>}>
            <Show when={crop.data} fallback={
                <div class="space-y-4">
                    <A href="/app/crops"
                       class="touch-target inline-flex items-center gap-1 text-sm font-semibold text-accent"><ArrowLeft
                        size={16}/> {t("detail.backToCrops")}</A>
                    <Alert tone="danger">{crop.error ?? t("detail.notFound")}</Alert>
                </div>
            }>
                {(current) => {
                    const profile = () => profiles[current().type];
                    // La lectura en vivo manda sobre la del sondeo si es más reciente: un sondeo que salió antes del
                    // evento SSE no puede hacer retroceder los medidores.
                    const latest = () => {
                        const polled = current().latestReading;
                        const live = liveReading();
                        if (!live) return polled;
                        if (!polled) return live;
                        return Date.parse(live.measuredAt) >= Date.parse(polled.measuredAt) ? live : polled;
                    };
                    const heroCrop = () => {
                        const polled = current();
                        const reading = latest();
                        return reading && reading !== polled.latestReading
                            ? {...polled, latestReading: reading}
                            : polled;
                    };
                    const virtual = () => current().kind === "VIRTUAL";

                    return (
                        <div class="space-y-6">
                            <div>
                                <A href="/app/crops"
                                   class="touch-target inline-flex items-center gap-1 text-sm font-semibold text-accent"><ArrowLeft
                                    size={16}/> {t("detail.backToCrops")}</A>
                                <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h1 class="text-3xl font-bold">{current().name}</h1>
                                        <p class="text-sm text-muted tabular-nums">
                                            {t("detail.headline", {
                                                species: CROP_TYPES[current().type].label,
                                                form: CROP_FORMS[current().form].phrase,
                                                status: current().device.online ? t("card.online") : t("card.offline"),
                                                time: timeAgo(latest()?.measuredAt),
                                            })}
                                        </p>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <Show when={virtual()}>
                                            <Badge tone="info">{CROP_KINDS.VIRTUAL.label}</Badge>
                                        </Show>
                                        <Show when={current().health}>
                                            {(h) => (
                                                <Badge tone={HEALTH[h().level]?.tone ?? "neutral"} class="tabular-nums">
                                                    {t("detail.healthBadge", {index: Math.round(h().index), label: healthLabel(h())})}
                                                </Badge>
                                            )}
                                        </Show>
                                    </div>
                                </div>
                            </div>

                            <CropHero crop={heroCrop()} actuators={actuators.data ?? []} commands={commands.data ?? []}
                                      simulation={simulation.data} weather={weather.data} onOpenTab={openTab}/>

                            <nav class="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4"
                                 aria-label={t("detail.sections")}>
                                <For each={tabs()}>
                                    {(item) => (
                                        <button type="button" onClick={() => openTab(item.id)}
                                                aria-current={tab() === item.id ? "page" : undefined}
                                                class={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${tab() === item.id
                                                    ? "border-leaf-600 text-accent-strong" : "border-transparent text-muted hover:text-ink"}`}>
                                            {t(item.label)}
                                        </button>
                                    )}
                                </For>
                            </nav>

                            <Show when={tab() === "summary"}>
                                <div class="space-y-5">
                                    <Show when={!latest()}>
                                        <Alert tone="info" title={t("detail.noReadings")}>
                                            {virtual() ? t("detail.noReadingsVirtual") : t("detail.noReadingsReal")}
                                        </Alert>
                                    </Show>
                                    <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
                                        <For each={PRIMARY_METRICS}>
                                            {(key) => (
                                                <MetricTile metric={key} value={latest()?.measures[key]}
                                                            range={profile()?.ranges[key]}/>
                                            )}
                                        </For>
                                    </div>
                                    <section class="card p-5">
                                        <div class="flex flex-wrap items-center justify-between gap-3">
                                            <h2 class="text-lg font-semibold">
                                                {t("detail.metricLast", {metric: METRICS[metric()].label, range: RANGES.find((range) => range.hours === hours())?.label() ?? ""})}
                                            </h2>
                                            <select value={metric()}
                                                    onChange={(event) => setMetric(event.currentTarget.value as MetricKey)}
                                                    aria-label={t("detail.variable")}
                                                    class="h-9 rounded-lg border border-line bg-card px-2 text-sm">
                                                <For each={PRIMARY_METRICS}>
                                                    {(key) => <option value={key}>{METRICS[key].label}</option>}
                                                </For>
                                            </select>
                                        </div>
                                        <div class="mt-4">
                                            <ReadingsChart readings={readings.data ?? []} metric={metric()}
                                                           range={profile()?.ranges[metric()]}/>
                                        </div>
                                        <Show when={profile()}>
                                            {(prof) => (
                                                <p class="mt-2 text-xs text-muted">
                                                    {t("detail.greenBand", {species: st(prof().name).toLowerCase()})}
                                                </p>
                                            )}
                                        </Show>
                                    </section>
                                </div>
                            </Show>

                            <Show when={tab() === "assistant"}>
                                <AssistantTab cropId={cropId()} actuators={actuators.data ?? []}
                                              onChanged={refreshSoon} onOpenTab={openTab}/>
                            </Show>

                            <Show when={tab() === "control"}>
                                <ControlPanel crop={current()} actuators={actuators.data ?? []}
                                              commands={commands.data ?? []}
                                              onAutomation={async (enabled) => crop.setData(await cropApi.setAutomation(cropId(), enabled))}
                                              onChanged={refreshSoon}/>
                            </Show>

                            <Show when={tab() === "history"}>
                                <div class="space-y-5">
                                    <div class="flex flex-wrap items-center justify-between gap-3">
                                        <div class="flex gap-1 rounded-xl bg-surface p-1">
                                            <For each={RANGES}>
                                                {(range) => (
                                                    <button type="button" onClick={() => setHours(range.hours)}
                                                            class={`touch-target rounded-lg px-3 py-1.5 text-sm font-semibold ${hours() === range.hours ? "bg-card text-accent-strong shadow-sm" : "text-muted"}`}>
                                                        {range.label()}
                                                    </button>
                                                )}
                                            </For>
                                        </div>
                                        <Button variant="secondary" size="sm" icon={<FileDown size={16}/>}
                                                onClick={() => void exportCsv(current().name)}>{t("detail.exportCsv")}</Button>
                                    </div>
                                    <Show when={exportError()}>
                                        {(err) => <Alert tone="danger">{err()}</Alert>}
                                    </Show>
                                    <p class="text-sm text-muted tabular-nums">{t("detail.readingsInPeriod", {count: readings.data?.length ?? 0})}</p>
                                    <div class="grid gap-5 lg:grid-cols-2">
                                        <For each={PRIMARY_METRICS}>
                                            {(key) => (
                                                <section class="card p-5">
                                                    <div class="flex items-baseline justify-between">
                                                        <h3 class="font-semibold">{METRICS[key].label}</h3>
                                                        <span class="text-sm text-muted tabular-nums">
                                                            {formatMetric(key, latest()?.measures[key])}
                                                        </span>
                                                    </div>
                                                    <div class="mt-3">
                                                        <ReadingsChart readings={readings.data ?? []} metric={key}
                                                                       range={profile()?.ranges[key]} height={200}/>
                                                    </div>
                                                </section>
                                            )}
                                        </For>
                                    </div>
                                </div>
                            </Show>

                            <Show when={tab() === "device"}>
                                <Suspense fallback={<SkeletonCard height="min-h-[280px]"/>}>
                                    <DevicePanel crop={current()}/>
                                </Suspense>
                            </Show>
                            <Show when={tab() === "simulation"}>
                                <Show when={simulation.data} fallback={
                                    <Show when={simulation.error} fallback={<SkeletonCard height="min-h-[280px]"/>}>
                                        {(err) => <Alert tone="danger">{err()}</Alert>}
                                    </Show>
                                }>
                                    {(sim) => (
                                        <Show when={sim().available} fallback={
                                            <Alert tone="info" title={t("hero.simUnavailable")}>
                                                {t("detail.simUnavailable")}
                                            </Alert>
                                        }>
                                            <Show when={`${sim().active}-${sim().updatedAt ?? ""}`} keyed>
                                                <Suspense fallback={<SkeletonCard height="min-h-[280px]"/>}>
                                                    <SimulationPanel crop={current()} simulation={sim()}
                                                                     profile={profile()}
                                                                     onSaved={(saved) => {
                                                                         simulation.setData(saved);
                                                                         void crop.reload();
                                                                     }}
                                                                     onPaused={() => void simulation.reload()}
                                                                     onOpenTab={openTab}/>
                                                </Suspense>
                                            </Show>
                                        </Show>
                                    )}
                                </Show>
                            </Show>
                            <Show when={tab() === "settings"}>
                                <Suspense fallback={<SkeletonCard height="min-h-[280px]"/>}>
                                    <SettingsPanel crop={current()} onSaved={(updated) => crop.setData(updated)}/>
                                </Suspense>
                            </Show>
                        </div>
                    );
                }}
            </Show>
        </Show>
    );
}
