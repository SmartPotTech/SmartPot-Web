import {A, useParams, useSearchParams} from "@solidjs/router";
import {ArrowLeft, FileDown} from "lucide-solid";
import {createEffect, createSignal, For, onCleanup, Show, untrack} from "solid-js";
import {Button} from "../../components/ui/Button";
import {Alert, Badge} from "../../components/ui/Feedback";
import {PageLoader} from "../../components/ui/Spinner";
import {usePageMeta} from "../../hooks/usePageMeta";
import {useResource} from "../../hooks/useResource";
import {ApiError} from "../../lib/api/client";
import {actuatorApi, commandApi, cropApi, insightApi, readingApi, virtualDeviceApi} from "../../lib/api/services";
import {CROP_FORMS, CROP_KINDS, CROP_TYPES, HEALTH, healthLabel, METRICS, PRIMARY_METRICS} from "../../lib/catalog";
import {formatMetric, timeAgo} from "../../lib/format";
import {t, type TranslationKey} from "../../lib/i18n";
import type {CropKind, MetricKey, Reading, VirtualDevice, Weather} from "../../lib/api/types";
import {subscribeTelemetryStream} from "../../services/stream";
import {ControlPanel} from "./components/ControlPanel";
import {DevicePanel} from "./components/DevicePanel";
import {CropHero} from "./components/CropHero";
import {InsightPanel} from "./components/InsightPanel";
import {MetricTile} from "./components/MetricTile";
import {ReadingsChart} from "./components/ReadingsChart";
import {SettingsPanel} from "./components/SettingsPanel";
import {SimulationPanel} from "./components/SimulationPanel";
import {useCropProfiles} from "./useCropProfiles";

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

export default function CropDetailPage() {
    const params = useParams<{ cropId: string }>();
    const cropId = () => params.cropId ?? "";
    const [searchParams, setSearchParams] = useSearchParams<{ tab?: string }>();
    const requested = () => (typeof searchParams.tab === "string" ? searchParams.tab : "summary");
    const wanted = () => ALIASES[requested()] ?? requested();
    const [metric, setMetric] = createSignal<MetricKey>("temperature");
    const [hours, setHours] = createSignal(24);
    const [exportError, setExportError] = createSignal<string | null>(null);

    const crop = useResource(() => cropApi.get(cropId()), () => [cropId()], 20_000);
    const readings = useResource(
        () => readingApi.list(cropId(), new Date(Date.now() - hours() * 3600_000), 2000),
        () => [cropId(), hours()],
        30_000,
    );
    // Las lecturas nuevas llegan en vivo por SSE y se suman a la serie; la consulta cada 30 s (con ETag) queda de
    // respaldo si el flujo no pasa por algún proxy.
    createEffect(() => {
        const id = cropId();
        const subscription = subscribeTelemetryStream(id, (reading: Reading) => {
            const current = untrack(() => readings.data);
            if (!current || current.some((item) => item.id === reading.id)) return;
            const since = Date.now() - untrack(hours) * 3600_000;
            readings.setData([...current.filter((item) => Date.parse(item.measuredAt) >= since), reading]);
        });
        onCleanup(() => subscription.unsubscribe());
    });
    const tabs = () => TABS.filter((item) => !item.only || !crop.data || item.only === crop.data.kind);
    const tab = () => tabs().find((item) => item.id === wanted())?.id ?? "summary";
    const isVirtual = () => crop.data?.kind === "VIRTUAL";
    // La ilustración está sobre todas las secciones: actuadores y órdenes se refrescan siempre, también lo que decide
    // el agente de IA por su cuenta.
    const actuators = useResource(() => actuatorApi.list(cropId()), () => [cropId()], 4_000);
    const commands = useResource(() => commandApi.list(cropId()), () => [cropId()], 4_000);
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

    const insight = useResource(
        () => (tab() === "assistant" ? insightApi.get(cropId()) : Promise.resolve(undefined)),
        () => [cropId(), tab() === "assistant"],
    );
    const profiles = useCropProfiles();

    usePageMeta(() => crop.data?.name ?? t("detail.defaultTitle"));

    const openTab = (id: string) => setSearchParams({tab: id === "summary" ? undefined : id}, {replace: true});

    async function exportCsv(currentName: string) {
        setExportError(null);
        try {
            const csv = await readingApi.exportCsv(cropId(), new Date(Date.now() - hours() * 3600_000));
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
        <Show when={!(crop.loading && !crop.data)} fallback={<PageLoader/>}>
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
                    const latest = () => current().latestReading;
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
                                        <p class="text-sm text-muted">
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
                                                <Badge tone={HEALTH[h().level]?.tone ?? "neutral"}>
                                                    {t("detail.healthBadge", {index: Math.round(h().index), label: healthLabel(h())})}
                                                </Badge>
                                            )}
                                        </Show>
                                    </div>
                                </div>
                            </div>

                            <CropHero crop={current()} actuators={actuators.data ?? []} commands={commands.data ?? []}
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
                                                    {t("detail.greenBand", {species: prof().name.toLowerCase()})}
                                                </p>
                                            )}
                                        </Show>
                                    </section>
                                </div>
                            </Show>

                            <Show when={tab() === "assistant"}>
                                <InsightPanel insight={insight.data} error={insight.error} loading={insight.loading}
                                              actuators={actuators.data ?? []}
                                              onRefresh={() => void insight.reload()}
                                              onRunAction={async (action, actuator) => {
                                                  await commandApi.send(cropId(), actuator.id, action.action, action.durationSeconds);
                                                  refreshSoon();
                                              }} onOpenTab={openTab}/>
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
                                    <p class="text-sm text-muted">{t("detail.readingsInPeriod", {count: readings.data?.length ?? 0})}</p>
                                    <div class="grid gap-5 lg:grid-cols-2">
                                        <For each={PRIMARY_METRICS}>
                                            {(key) => (
                                                <section class="card p-5">
                                                    <div class="flex items-baseline justify-between">
                                                        <h3 class="font-semibold">{METRICS[key].label}</h3>
                                                        <span class="text-sm text-muted">
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
                                <DevicePanel crop={current()}/>
                            </Show>
                            <Show when={tab() === "simulation"}>
                                <Show when={simulation.data} fallback={
                                    <Show when={simulation.error} fallback={<PageLoader/>}>
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
                                                <SimulationPanel crop={current()} simulation={sim()}
                                                                 profile={profile()}
                                                                 onSaved={(saved) => {
                                                                     simulation.setData(saved);
                                                                     void crop.reload();
                                                                 }}
                                                                 onPaused={() => void simulation.reload()}
                                                                 onOpenTab={openTab}/>
                                            </Show>
                                        </Show>
                                    )}
                                </Show>
                            </Show>
                            <Show when={tab() === "settings"}>
                                <SettingsPanel crop={current()} onSaved={(updated) => crop.setData(updated)}/>
                            </Show>
                        </div>
                    );
                }}
            </Show>
        </Show>
    );
}
