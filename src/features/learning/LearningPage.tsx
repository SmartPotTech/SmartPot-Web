import {CheckCircle2, Database, GraduationCap, Hourglass, Radar, ShieldCheck} from "lucide-solid";
import {For, Show} from "solid-js";
import {HeaderStat, PageHeader} from "../../components/layout/PageHeader";
import {Alert, Badge, EmptyState} from "../../components/ui/Feedback";
import {PageLoader} from "../../components/ui/Spinner";
import {usePageMeta} from "../../hooks/usePageMeta";
import {useResource} from "../../hooks/useResource";
import {insightApi} from "../../lib/api/services";
import {timeAgo} from "../../lib/format";
import {intlLocale, t, type TranslationKey} from "../../lib/i18n";
import type {CropTypeLearning, ModelCard} from "../../lib/api/types";

const STEPS: [TranslationKey, TranslationKey][] = [
    ["learning.step1", "learning.step1Body"],
    ["learning.step2", "learning.step2Body"],
    ["learning.step3", "learning.step3Body"],
    ["learning.step4", "learning.step4Body"],
    ["learning.step5", "learning.step5Body"],
    ["learning.step6", "learning.step6Body"],
];

/** Qué ha aprendido el asistente de las lecturas reales, especie por especie. Solo datos agregados. */
export function LearningPage() {
    usePageMeta(() => t("learning.pageTitle"));
    const status = useResource(() => insightApi.learning(), [], 60_000);
    const data = () => status.data;
    const trained = () => data()?.cropTypes.reduce((total, item) =>
        total + item.models.filter((model) => model.status === "TRAINED").length, 0) ?? 0;

    return (
        <div class="space-y-6">
            <PageHeader eyebrow={t("learning.eyebrow")} title={t("learning.title")} icon={<GraduationCap size={24}/>}
                        description={t("learning.description")}>
                <div class="grid grid-cols-3 gap-3">
                    <HeaderStat label={t("learning.statReadings")}
                                value={data() ? data()!.storedReadings.toLocaleString(intlLocale()) : "—"}/>
                    <HeaderStat label={t("learning.statSpecies")} value={data() ? data()!.cropTypes.length : "—"}/>
                    <HeaderStat label={t("learning.statModels")} value={data() ? trained() : "—"}/>
                </div>
            </PageHeader>

            <section class="card p-5" aria-labelledby="how-title">
                <h2 id="how-title" class="font-semibold">{t("learning.howTitle")}</h2>
                <ol class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <For each={STEPS}>
                        {([title, text], index) => (
                            <li class="flex gap-3 rounded-xl bg-surface p-3">
                                <span
                                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-sm font-bold text-white">
                                    {index() + 1}
                                </span>
                                <span class="text-sm"><strong class="block">{t(title)}</strong><span
                                    class="text-muted">{t(text)}</span></span>
                            </li>
                        )}
                    </For>
                </ol>
                <Show when={data()}>
                    {(d) => (
                        <p class="mt-3 text-xs text-muted">
                            {t("learning.thresholds", {min: d().minSamples, every: d().retrainEvery})}
                            {d().persistent ? t("learning.persistent") : t("learning.memoryOnly")}
                        </p>
                    )}
                </Show>
            </section>

            <Show when={status.error}>
                {(err) => <Alert tone="info" title={t("actions.unavailable")}>{err()}</Alert>}
            </Show>
            <Show when={!(status.loading && !data())} fallback={<PageLoader/>}>
                <Show when={!(data() && data()!.cropTypes.length === 0)} fallback={
                    <EmptyState icon={<Database size={24}/>} title={t("learning.emptyTitle")}>
                        {t("learning.emptyBody")}
                    </EmptyState>
                }>
                    <For each={data()?.cropTypes ?? []}>
                        {(item) => <SpeciesLearning item={item}/>}
                    </For>
                </Show>
            </Show>
        </div>
    );
}

function SpeciesLearning(props: { item: CropTypeLearning }) {
    return (
        <section class="card p-5" aria-labelledby={`species-${props.item.cropType}`}>
            <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 id={`species-${props.item.cropType}`} class="text-lg font-semibold">{props.item.name}</h2>
                    <p class="text-sm text-muted">
                        {t("learning.summary", {
                            readings: t("learning.readings", {count: props.item.readings}),
                            crops: t("learning.crops", {count: props.item.crops}),
                        })}
                        {props.item.trainedAt
                            ? t("learning.trained", {
                                time: timeAgo(props.item.trainedAt),
                                fresh: t("learning.newReadings", {count: props.item.newSinceTraining}),
                            })
                            : t("learning.untrained")}
                    </p>
                </div>
                {props.item.training ? <Badge tone="info"><Hourglass size={12}/> {t("learning.training")}</Badge>
                    : props.item.trainedAt ? <Badge tone="success"><CheckCircle2 size={12}/> {t("learning.upToDate")}</Badge>
                        : <Badge tone="neutral">{t("learning.gathering")}</Badge>}
            </div>

            <Show when={props.item.quality}>
                {(q) => (
                    <p class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span class="flex items-center gap-1.5 font-semibold"><ShieldCheck size={16}
                                                                                           class="text-accent"/>
                            {t("learning.quality", {score: Math.round(q().score * 100)})}</span>
                        <span class="text-muted">{t("learning.completeness", {value: Math.round(q().completeness * 100)})}</span>
                        <span class="text-muted">{t("learning.validity", {value: Math.round(q().validity * 100)})}</span>
                        <span class="text-muted">{t("learning.outliers", {count: q().outliers})}</span>
                    </p>
                )}
            </Show>

            <div class="mt-4 grid gap-4 lg:grid-cols-3">
                <For each={props.item.models}>
                    {(model) => <ModelSummary model={model}/>}
                </For>
            </div>

            <Show when={props.item.states || props.item.anomaly}>
                <div class="mt-4 grid gap-4 lg:grid-cols-2">
                    <Show when={props.item.states}>
                        {(states) => (
                            <div class="rounded-xl border border-line p-4">
                                <h3 class="flex items-center gap-2 text-sm font-semibold"><Radar size={16}
                                                                                                 class="text-accent"/>
                                    {t("learning.states")}</h3>
                                <p class="text-xs text-muted">{t("learning.statesBody", {
                                    k: states().k,
                                    silhouette: states().silhouette.toFixed(2),
                                })}</p>
                                <ul class="mt-3 space-y-2">
                                    <For each={states().clusters}>
                                        {(cluster) => (
                                            <li>
                                                <div class="flex justify-between gap-3 text-sm">
                                                    <span class="font-medium">{cluster.label}</span>
                                                    <span class="text-muted">{Math.round(cluster.share * 100)} %</span>
                                                </div>
                                                <div class="mt-1 h-2 rounded-full bg-surface">
                                                    <div class="h-2 rounded-full bg-leaf-600"
                                                         style={{"width": `${Math.round(cluster.share * 100)}%`}}/>
                                                </div>
                                                <p class="mt-0.5 text-xs text-muted">{cluster.description}</p>
                                            </li>
                                        )}
                                    </For>
                                </ul>
                            </div>
                        )}
                    </Show>
                    <Show when={props.item.anomaly}>
                        {(anomaly) => (
                            <div class="rounded-xl border border-line p-4 text-sm">
                                <h3 class="font-semibold">{t("learning.anomalyTitle")}</h3>
                                <p class="mt-1 text-muted">
                                    {t("learning.anomalyBody", {
                                        samples: anomaly().samples.toLocaleString(intlLocale()),
                                        share: Math.round(anomaly().contamination * 100),
                                    })}
                                </p>
                            </div>
                        )}
                    </Show>
                </div>
            </Show>
        </section>
    );
}

/** Tarjeta de una tarea: modelo elegido, su puntaje frente a la línea base y la comparación de candidatos. */
export function ModelSummary(props: { model: ModelCard }) {
    const lowerIsBetter = () => props.model.task === "moisture_1h";
    const format = (value: number | null | undefined) => value == null ? "—" : value.toFixed(2);
    const ranked = () => [...props.model.candidates].sort((a, b) =>
        lowerIsBetter() ? (a.score ?? Infinity) - (b.score ?? Infinity) : (b.score ?? -Infinity) - (a.score ?? -Infinity));

    return (
        <article class="rounded-xl border border-line p-4">
            <div class="flex items-start justify-between gap-2">
                <h3 class="text-sm font-semibold">{props.model.label}</h3>
                <Badge tone={props.model.status === "TRAINED" ? "success" : "neutral"}>
                    {props.model.status === "TRAINED" ? `v${props.model.version}` : t("learning.pending")}
                </Badge>
            </div>
            <Show when={props.model.status === "TRAINED"}>
                <p class="mt-1 text-sm">
                    <strong>{props.model.model}</strong>
                    <span class="block text-xs text-muted">
                        {t("learning.holdout", {
                            metric: props.model.metric,
                            value: format(props.model.holdout),
                            baseline: format(props.model.baseline),
                        })}
                    </span>
                </p>
            </Show>
            <Show when={props.model.reason}>
                <p class="mt-1 text-xs text-muted">{props.model.reason}</p>
            </Show>
            <Show when={ranked().length > 0}>
                <table class="mt-3 w-full text-xs">
                    <caption class="sr-only">{t("learning.compare", {label: props.model.label})}</caption>
                    <thead>
                    <tr class="text-left text-muted">
                        <th scope="col" class="py-1 font-medium">{t("learning.colModel")}</th>
                        <th scope="col"
                            class="py-1 text-right font-medium">{lowerIsBetter() ? t("learning.colError") : t("learning.colF1")}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <For each={ranked()}>
                        {(candidate) => (
                            <tr class={candidate.model === props.model.model ? "font-semibold text-accent-strong" : ""}>
                                <td class="py-0.5">{candidate.model}</td>
                                <td class="py-0.5 text-right tabular-nums">
                                    {format(candidate.score)}{candidate.std != null &&
                                    <span class="text-muted"> ± {candidate.std.toFixed(2)}</span>}
                                </td>
                            </tr>
                        )}
                    </For>
                    </tbody>
                </table>
            </Show>
            <p class="mt-2 text-xs text-muted">{t("learning.examples", {count: props.model.samples.toLocaleString(intlLocale())})}
                {props.model.positives != null && t("learning.positives", {count: props.model.positives.toLocaleString(intlLocale())})}</p>
        </article>
    );
}
