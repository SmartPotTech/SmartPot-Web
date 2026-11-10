import {A} from "@solidjs/router";
import {ArrowRight, Download} from "lucide-solid";
import {For, type JSX, Show} from "solid-js";
import {usePageMeta} from "../../hooks/usePageMeta";
import {ACTUATORS, CROP_TYPES, HEALTH, METRICS} from "../../lib/catalog";
import {formatNumber} from "../../lib/format";
import type {ActuatorType, MetricKey} from "../../lib/api/types";
import {intlLocale, t, type TranslationKey} from "../../lib/i18n";
import {useInstallPrompt} from "../pwa/pwa";
import {AssistantDemo, formatRange} from "./AssistantDemo";
import {COMPONENTS, RANGE_KEYS, SPECIES, SPECIES_RANGES} from "./data";
import {FAQ} from "./faq";

const SENSORS: MetricKey[] = ["temperature", "humidity", "brightness", "ph", "tds", "soilMoisture", "atmosphere"];
const ACTUATOR_LIST: ActuatorType[] = ["WATER_PUMP", "UV_LIGHT", "FAN", "HUMIDIFIER", "PH_DOSER", "NUTRIENT_DOSER"];
const ASSISTANT: TranslationKey[] = [
    "landing.features.ai1", "landing.features.ai2", "landing.features.ai3", "landing.features.ai4",
    "landing.features.ai5", "landing.features.ai6", "landing.features.ai7", "landing.features.ai8",
];

/** Lecturas de ejemplo de una lechuga en NFT: las mismas en el panel «en vivo» y en la respuesta del paso 2. */
const SAMPLE: { key: MetricKey; value: number; status: "ok" | "low" }[] = [
    {key: "temperature", value: 18.7, status: "ok"},
    {key: "humidity", value: 62, status: "ok"},
    {key: "soilMoisture", value: 70, status: "ok"},
    {key: "brightness", value: 92, status: "low"},
    {key: "ph", value: 5.98, status: "ok"},
    {key: "tds", value: 694, status: "ok"},
];

const TELEMETRY = `{
  "temperature": 18.7,
  "humidity": 62,
  "soilMoisture": 70,
  "brightness": 92,
  "ph": 5.98,
  "tds": 694
}`;

const percent = (value: number) => value.toLocaleString(intlLocale(), {style: "percent"});

function metricValue(key: MetricKey, value: number) {
    const info = METRICS[key];
    const number = formatNumber(value, key === "ph" ? 2 : info.decimals);
    return info.unit ? `${number} ${info.unit}` : number;
}

/** Medidor compacto con la misma forma que en la app: etiqueta, valor y estado frente al rango. */
function SampleTiles(props: { dense?: boolean }) {
    return (
        <ul class={`grid gap-2 ${props.dense ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
            <For each={SAMPLE}>
                {(item) => (
                    <li class="rounded-xl bg-surface px-3 py-2.5">
                        <p class="text-xs text-muted">{METRICS[item.key].label}</p>
                        <p class="mt-0.5 flex items-baseline justify-between gap-2">
                            <span class="font-display text-lg font-semibold tabular-nums">{metricValue(item.key, item.value)}</span>
                            <span class={`text-xs font-semibold ${item.status === "ok" ? "text-accent-strong" : "text-link"}`}>
                                {t(item.status === "ok" ? "landing.demo.status.ok" : "landing.demo.status.low")}
                            </span>
                        </p>
                    </li>
                )}
            </For>
        </ul>
    );
}

/** Panel de la fila oscura: el fragmento de la app arriba y, debajo, qué es y para qué sirve. */
function ShowcasePanel(props: { title: TranslationKey; body: TranslationKey; children: JSX.Element }) {
    return (
        <li class="reveal w-[min(86vw,24rem)] shrink-0 snap-center">
            <div data-ui class="rounded-[var(--radius-card)] bg-card p-4 text-ink">{props.children}</div>
            <h3 class="mt-4 text-lg font-semibold text-white">{t(props.title)}</h3>
            <p class="mt-1 text-sm text-leaf-100/90">{t(props.body)}</p>
        </li>
    );
}

function Showcase() {
    // Serie de ejemplo de la humedad del sustrato: baja 1,4 puntos por hora hacia el mínimo de la lechuga (60 %).
    const forecast = [66.2, 65.9, 65.4, 65.1, 64.6, 64.2, 63.9, 63.3, 63.0, 62.6, 62.1, 61.8, 61.3, 61.0];
    const path = forecast.map((value, index) => `${index === 0 ? "M" : "L"}${(index * 300) / (forecast.length - 1)},${(68 - value) * 12}`).join(" ");
    const projected = `M300,${(68 - 61) * 12} L360,${(68 - 60) * 12 + 2}`;
    return (
        <section id="app" class="scroll-mt-20 bg-leaf-950 py-20 text-white md:py-28">
            <div class="mx-auto max-w-6xl px-4 md:px-6">
                <h2 class="reveal max-w-xl text-3xl font-bold md:text-4xl">{t("landing.showcase.title")}</h2>
                <p class="reveal mt-3 max-w-xl text-leaf-100/90">{t("landing.showcase.body")}</p>
            </div>
            <ul class="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-4 pb-4 [scrollbar-width:thin] md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
                aria-label={t("landing.showcase.title")}>
                <ShowcasePanel title="landing.showcase.live" body="landing.showcase.liveBody">
                    <p class="text-xs font-medium text-muted">{t("landing.showcase.example")}</p>
                    <div class="mt-3"><SampleTiles/></div>
                </ShowcasePanel>
                <ShowcasePanel title="landing.showcase.diagnosis" body="landing.showcase.diagnosisBody">
                    <p class="text-xs font-medium text-muted">{t("landing.showcase.example")}</p>
                    <p class="mt-3 flex items-baseline justify-between gap-2 text-sm font-semibold">
                        {t("landing.showcase.diagnosisRule")}
                        <span class="shrink-0 rounded-full bg-sun-100 px-2 py-0.5 text-xs text-sun-fg">
                            {t("landing.showcase.certainty", {value: percent(0.7)})}
                        </span>
                    </p>
                    <p class="mt-1.5 text-sm text-muted">{t("landing.showcase.diagnosisMessage")}</p>
                    <p class="mt-3 rounded-xl bg-leaf-50 px-3 py-2 text-sm text-accent-strong">{t("landing.showcase.diagnosisAction")}</p>
                </ShowcasePanel>
                <ShowcasePanel title="landing.showcase.forecast" body="landing.showcase.forecastBody">
                    <p class="text-xs font-medium text-muted">{METRICS.soilMoisture.label}</p>
                    <p class="mt-1 font-display text-2xl font-semibold tabular-nums">{metricValue("soilMoisture", 61)}</p>
                    <svg viewBox="0 0 360 110" class="mt-2 h-24 w-full" role="img"
                         aria-label={t("landing.showcase.forecastLimit", {min: metricValue("soilMoisture", 60)})}>
                        <rect x="0" y="0" width="360" height="96" class="fill-leaf-100/60"/>
                        <line x1="0" x2="360" y1="96" y2="96" class="stroke-clay-500" stroke-dasharray="4 4"/>
                        <path d={path} fill="none" class="stroke-water-700" stroke-width="2.5"/>
                        <path d={projected} fill="none" class="stroke-water-700" stroke-width="2.5" stroke-dasharray="5 5"/>
                    </svg>
                    <p class="text-xs text-muted">{t("landing.showcase.forecastTrend")} · {t("landing.showcase.forecastLimit", {min: metricValue("soilMoisture", 60)})}</p>
                    <p class="mt-3 rounded-xl bg-leaf-50 px-3 py-2 text-sm text-accent-strong">{t("landing.showcase.forecastAction")}</p>
                </ShowcasePanel>
                <ShowcasePanel title="landing.showcase.health" body="landing.showcase.healthBody">
                    <p class="text-xs font-medium text-muted">{t("landing.showcase.example")}</p>
                    <div class="mt-3 flex items-end gap-3">
                        <p class="font-display text-6xl font-bold leading-none tabular-nums text-accent-strong">93</p>
                        <p class="pb-1 text-sm text-muted">{t("landing.showcase.healthOf")} · <span class="font-semibold text-ink">{HEALTH.EXCELLENT.label}</span></p>
                    </div>
                    <div class="mt-4 h-2 overflow-hidden rounded-full bg-surface">
                        <div class="h-full w-full origin-left scale-x-[0.93] rounded-full bg-leaf-500"/>
                    </div>
                </ShowcasePanel>
                <ShowcasePanel title="landing.showcase.fleet" body="landing.showcase.fleetBody">
                    <ul class="space-y-3 text-sm">
                        <For each={[["landing.showcase.fleetCrop2", 40, "POOR"], ["landing.showcase.fleetCrop1", 93, "EXCELLENT"]] as const}>
                            {([name, score, level]) => (
                                <li>
                                    <p class="flex justify-between gap-2"><span>{t(name)}</span>
                                        <span class="tabular-nums"><strong>{score}</strong> · {HEALTH[level].label}</span></p>
                                    <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
                                        <div class="h-full w-full origin-left rounded-full"
                                             style={{transform: `scaleX(${score / 100})`, "background-color": HEALTH[level].color}}/>
                                    </div>
                                </li>
                            )}
                        </For>
                    </ul>
                    <p class="mt-4 rounded-xl bg-sun-100 px-3 py-2 text-sm text-sun-fg">{t("landing.showcase.fleetIssue")}</p>
                </ShowcasePanel>
            </ul>
        </section>
    );
}

function HowItStarts() {
    // Cada paso es una fila: a la izquierda lo que haces, a la derecha lo que devuelve SmartPot.
    const row = "grid gap-4 md:grid-cols-12 md:gap-x-10";
    return (
        <section id="como-funciona" class="scroll-mt-20 py-20 md:py-28">
            <div class="mx-auto max-w-6xl px-4 md:px-6">
                <h2 class="reveal text-3xl font-bold md:text-4xl">{t("landing.how.title")}</h2>

                <div class={`${row} mt-12`}>
                    <div class="reveal md:col-span-5">
                        <p class="text-xl font-medium">{t("landing.how.step1")}</p>
                        <dl data-ui class="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface p-4 text-sm">
                            <div><dt class="text-muted">{t("landing.demo.species")}</dt><dd class="mt-0.5 font-semibold">{CROP_TYPES.LETTUCE.label}</dd></div>
                            <div><dt class="text-muted">{t("landing.how.form")}</dt><dd class="mt-0.5 font-semibold">{t("catalog.form.NFT")}</dd></div>
                            <div><dt class="text-muted">{t("landing.how.kind")}</dt><dd class="mt-0.5 font-semibold">{t("catalog.kind.REAL")}</dd></div>
                        </dl>
                    </div>
                    <div class="reveal md:col-span-7 md:pt-10">
                        <p class="text-muted">{t("landing.how.step1Response")}</p>
                        <pre class="mt-3 overflow-x-auto rounded-xl bg-leaf-950 p-4 text-sm leading-relaxed text-leaf-100"><code translate="no">{`smartpot/v1/<cropId>/telemetry
smartpot/v1/<cropId>/commands
smartpot/v1/<cropId>/commands/ack
smartpot/v1/<cropId>/status`}</code></pre>
                    </div>
                </div>

                <div class={`${row} mt-16 md:mt-24`}>
                    <div class="reveal md:col-span-5">
                        <p class="text-xl font-medium">{t("landing.how.step2")}</p>
                        <pre class="mt-4 overflow-x-auto rounded-xl bg-leaf-950 p-4 text-sm leading-relaxed text-leaf-100"><code translate="no">{TELEMETRY}</code></pre>
                        <p class="mt-3 text-sm text-muted">{t("landing.how.step2Note")}</p>
                    </div>
                    <div class="reveal md:col-span-7 md:pt-10">
                        <p class="text-muted">{t("landing.how.step2Response")}</p>
                        <div data-ui class="mt-3"><SampleTiles dense/></div>
                    </div>
                </div>

                <div class={`${row} mt-16 md:mt-24`}>
                    <div class="reveal md:col-span-5">
                        <p class="text-xl font-medium">{t("landing.how.step3")}</p>
                        <p class="mt-2 text-muted">{t("landing.how.step3Response")}</p>
                    </div>
                    {/* El resultado final es lo que el visitante viene a ver: la tarjeta con más peso de la sección. */}
                    <div data-ui class="reveal rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)] md:col-span-7 md:p-6">
                        <p class="text-sm font-semibold text-accent-strong">{t("landing.how.suggested")}</p>
                        <div class="mt-2 flex flex-wrap items-center justify-between gap-4">
                            <div class="min-w-0">
                                <p class="text-lg font-semibold">{ACTUATORS.UV_LIGHT.label} · 15 min</p>
                                <p class="mt-1 text-sm text-muted">{t("landing.showcase.diagnosisAction")}</p>
                                <p class="mt-1 text-xs text-muted">{t("landing.showcase.diagnosisRule")} · {t("landing.showcase.certainty", {value: percent(0.7)})}</p>
                            </div>
                            <span aria-hidden="true" class="inline-flex h-10 items-center rounded-xl bg-leaf-700 px-4 text-sm font-semibold text-white">
                                {t("landing.how.apply")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SpeciesRanges() {
    const headers: MetricKey[] = RANGE_KEYS;
    return (
        <section id="especies" class="scroll-mt-20 bg-surface py-20 md:py-28">
            <div class="mx-auto max-w-6xl px-4 md:px-6">
                <h2 class="reveal text-3xl font-bold md:text-4xl">{t("landing.species.title")}</h2>
                <p class="reveal mt-3 max-w-xl">{t("landing.species.body")}</p>
                <table class="species-table reveal mt-10 w-full border-collapse text-left text-sm md:text-base">
                    <thead class="max-md:sr-only">
                        <tr class="text-muted">
                            <th scope="col" class="py-3 pr-4 font-medium">{t("landing.species.name")}</th>
                            <For each={headers}>{(key) => <th scope="col" class="py-3 pr-4 font-medium">{METRICS[key].label}</th>}</For>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={SPECIES}>
                            {(species) => (
                                <tr class="max-md:mb-8 max-md:grid max-md:grid-cols-2 max-md:gap-x-6 max-md:gap-y-3 md:odd:bg-card">
                                    <th scope="row" class="py-3 pr-4 font-display text-lg font-semibold max-md:col-span-2 max-md:py-0 md:pl-3">
                                        {CROP_TYPES[species].label}
                                    </th>
                                    <For each={RANGE_KEYS}>
                                        {(key) => (
                                            <td data-label={METRICS[key].label}
                                                class="py-3 pr-4 tabular-nums whitespace-nowrap max-md:py-0">
                                                {formatRange(key, SPECIES_RANGES[species][key])}
                                            </td>
                                        )}
                                    </For>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function Capabilities() {
    const group = (title: TranslationKey, items: string[], summary: TranslationKey) => (
        <div class="reveal">
            <h3 class="text-base font-semibold">{t(title)}</h3>
            <ul class="mt-4 gap-6 space-y-1.5 text-muted max-sm:columns-2 max-sm:text-sm">
                <For each={items}>{(item) => <li>{item}</li>}</For>
            </ul>
            <p class="mt-4 max-w-[30ch] text-sm">{t(summary)}</p>
        </div>
    );
    return (
        <section class="py-24 md:py-32">
            <div class="mx-auto max-w-6xl px-4 md:px-6">
                <h2 class="reveal text-3xl font-bold md:text-4xl">{t("landing.features.title")}</h2>
                <div class="mt-12 grid gap-10 sm:grid-cols-2 md:grid-cols-3">
                    {group("landing.features.sensors", SENSORS.map((key) => METRICS[key].label), "landing.features.sensorsBody")}
                    {group("landing.features.actuators", ACTUATOR_LIST.map((key) => ACTUATORS[key].label), "landing.features.actuatorsBody")}
                    {group("landing.features.assistant", ASSISTANT.map((key) => t(key)), "landing.features.assistantBody")}
                </div>
            </div>
        </section>
    );
}

function OpenSource() {
    return (
        <section class="pb-24 md:pb-32">
            <div class="mx-auto max-w-6xl px-4 md:px-6">
                <h2 class="reveal text-3xl font-bold md:text-4xl">{t("landing.open.title")}</h2>
                <p class="reveal mt-3 max-w-2xl">{t("landing.open.body")}</p>
                <table class="reveal mt-10 w-full border-collapse text-left text-sm md:text-base">
                    <thead class="max-md:sr-only">
                        <tr class="text-muted">
                            <th scope="col" class="py-3 pr-4 pl-3 font-medium">{t("landing.open.component")}</th>
                            <th scope="col" class="py-3 pr-4 font-medium">{t("landing.open.stack")}</th>
                            <th scope="col" class="py-3 pr-3 font-medium md:text-right">{t("landing.open.repo")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={COMPONENTS}>
                            {(item) => (
                                <tr class="odd:bg-surface max-md:block max-md:rounded-xl max-md:px-3 max-md:py-3">
                                    <td class="font-medium max-md:block md:py-3.5 md:pr-4 md:pl-3">{t(item.role)}</td>
                                    <td class="text-muted max-md:block md:py-3.5 md:pr-4" translate="no">{item.stack}</td>
                                    <td class="max-md:block md:py-3.5 md:pr-3 md:text-right">
                                        <a href={`https://github.com/SmartPotTech/${item.repo}`} target="_blank" rel="noopener noreferrer"
                                           translate="no" class="font-medium text-link underline-offset-4 hover:underline">{item.repo}</a>
                                    </td>
                                </tr>
                            )}
                        </For>
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function Questions() {
    const installPrompt = useInstallPrompt();
    return (
        <section id="preguntas" class="scroll-mt-20 bg-surface py-20 md:py-28">
            <div class="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-12 md:px-6">
                <h2 class="reveal text-3xl font-bold md:col-span-3 md:text-4xl">{t("landing.faqTitle")}</h2>
                <div class="md:col-span-9 md:col-start-4 lg:col-span-8 lg:col-start-5">
                    <div class="gap-14 md:columns-2">
                        <For each={FAQ}>
                            {(item) => (
                                <p class="reveal mb-5 break-inside-avoid leading-relaxed">
                                    <strong class="font-semibold">{t(item.question)}</strong> {t(item.answer)}
                                </p>
                            )}
                        </For>
                    </div>
                    <Show when={installPrompt.available}>
                        <button type="button" onClick={() => void installPrompt.install()}
                                class="touch-target mt-2 inline-flex h-11 items-center gap-2 rounded-xl bg-leaf-700 px-5 font-semibold text-white transition-colors hover:bg-leaf-800">
                            <Download size={18} aria-hidden="true"/> {t("landing.install")}
                        </button>
                    </Show>
                    <Show when={installPrompt.iosHint}>
                        <p class="mt-2 text-sm text-accent-strong">{t("landing.iosHint")}</p>
                    </Show>
                </div>
            </div>
        </section>
    );
}

export function LandingPage() {
    usePageMeta("", {index: true, description: () => t("landing.description")});

    return (
        <>
            {/* Primera pantalla: dos tonos del mismo verde. A la izquierda qué es y la acción; a la derecha el
                asistente en vivo. index.html trae una copia estática para que el primer pintado no espere al JS. */}
            <section class="relative bg-leaf-950 text-white">
                {/* El tono derecho cubre media pantalla; el contenido sigue el mismo contenedor que la barra. */}
                <div aria-hidden="true" class="absolute inset-y-0 right-0 hidden w-1/2 bg-leaf-900 md:block"/>
                <div class="relative mx-auto grid max-w-6xl md:grid-cols-2">
                    <div class="flex flex-col justify-end px-4 pt-14 pb-12 md:min-h-[min(46rem,calc(100dvh-4rem))] md:px-6 md:pr-10 md:pb-16">
                        <h1 class="max-w-[18ch] text-4xl leading-[1.05] font-bold md:text-5xl">{t("landing.heroTitle")}</h1>
                        <p class="mt-6 max-w-[44ch] text-lg text-leaf-100">{t("landing.heroBody")}</p>
                        <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                            <A href="/register" class="inline-flex h-12 items-center gap-2 rounded-xl bg-leaf-500 px-6 font-semibold text-leaf-950 transition-[background-color,transform] duration-150 hover:bg-leaf-300 active:translate-y-px">
                                {t("landing.ctaCreate")} <ArrowRight size={18} aria-hidden="true"/>
                            </A>
                            <a href="#demo" class="inline-flex h-12 items-center gap-2 rounded-xl border border-leaf-700 bg-leaf-900/60 px-5 font-semibold text-white transition-colors duration-150 hover:bg-leaf-800 hover:border-leaf-600">
                                {t("landing.ctaDemo")}
                            </a>
                        </div>
                        <p class="mt-4 text-sm text-leaf-100/90">{t("landing.heroNote")}</p>
                    </div>
                    <div class="flex items-center justify-center bg-leaf-900 px-4 py-10 md:bg-transparent md:py-16 md:pr-6 md:pl-10">
                        <AssistantDemo/>
                    </div>
                </div>
            </section>

            <HowItStarts/>
            <Showcase/>
            <SpeciesRanges/>
            <Capabilities/>
            <OpenSource/>
            <Questions/>

            <section class="mx-auto max-w-6xl px-4 pt-[18svh] pb-[14svh] md:px-6">
                <p class="reveal max-w-[34ch] text-xl md:ml-[16%] md:text-2xl">{t("landing.final")}</p>
                <A href="/register" class="reveal mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-leaf-700 px-5 font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-leaf-800 active:translate-y-px md:ml-[16%]">
                    {t("landing.ctaCreate")} <ArrowRight size={18} aria-hidden="true"/>
                </A>
            </section>
        </>
    );
}
