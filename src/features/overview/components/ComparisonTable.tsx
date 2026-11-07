import {A} from "@solidjs/router";
import {ArrowDown, ArrowUp, Table2} from "lucide-solid";
import {For, Show} from "solid-js";
import {CROP_TYPES, METRICS, PRIMARY_METRICS} from "../../../lib/catalog";
import {formatMetric, rangeStatus, timeAgo} from "../../../lib/format";
import {t} from "../../../lib/i18n";
import type {Crop} from "../../../lib/api/types";
import {useCropProfiles} from "../../crops/useCropProfiles";

const CELL = {
    low: "bg-water-100 text-link",
    high: "bg-clay-100 text-clay-fg",
    ok: "text-ink",
    unknown: "text-muted",
} as const;

/** De 22:00 a 6:00 la planta descansa: la luz baja no se marca (igual que en el asistente). */
function isRestHour(date: Date = new Date()): boolean {
    const hour = date.getHours();
    return hour >= 22 || hour < 6;
}

/** Última lectura de cada cultivo, marcando lo que está fuera del rango ideal de su especie. */
export function ComparisonTable(props: { crops: Crop[] }) {
    const profiles = useCropProfiles();
    const resting = isRestHour();
    return (
        <section class="card overflow-hidden">
            <div class="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
                <div>
                    <h2 class="flex items-center gap-2 text-lg font-semibold">
                        <Table2 size={18} class="text-accent"/> {t("table.title")}
                    </h2>
                    <p class="text-sm text-muted">{t("table.subtitle")}</p>
                </div>
                <p class="flex items-center gap-3 text-xs text-muted">
                    <span class="flex items-center gap-1"><ArrowDown size={12} class="text-link"/> {t("table.below")}</span>
                    <span class="flex items-center gap-1"><ArrowUp size={12} class="text-clay-fg"/> {t("table.above")}</span>
                </p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full min-w-[720px] text-sm">
                    <thead>
                    <tr class="bg-leaf-900 text-left text-xs uppercase tracking-wide text-leaf-100">
                        {/* La columna del cultivo queda fija al desplazar la tabla en pantallas angostas. */}
                        <th scope="col" class="sticky left-0 z-10 bg-leaf-900 px-4 py-2.5 font-semibold">{t("table.crop")}</th>
                        <For each={PRIMARY_METRICS}>
                            {(metric) => (
                                <th scope="col" class="px-3 py-2.5 text-right font-semibold">{METRICS[metric].label}</th>
                            )}
                        </For>
                    </tr>
                    </thead>
                    <tbody>
                    <For each={props.crops}>
                        {(crop, index) => {
                            const measures = () => crop.latestReading?.measures ?? {};
                            const profile = () => profiles[crop.type];
                            return (
                                <tr class={index() % 2 ? "bg-surface" : "bg-card"}>
                                    <th scope="row" class="sticky left-0 z-10 bg-inherit px-4 py-2.5 text-left font-normal">
                                        <A href={`/app/crops/${crop.id}`}
                                           class="font-semibold text-accent-strong hover:underline">{crop.name}</A>
                                        <span class="block text-xs text-muted tabular-nums">
                                            {CROP_TYPES[crop.type].label} · {timeAgo(crop.latestReading?.measuredAt)}
                                        </span>
                                    </th>
                                    <For each={PRIMARY_METRICS}>
                                        {(metric) => {
                                            const status = () => {
                                                const raw = rangeStatus(measures()[metric], profile()?.ranges[metric]);
                                                return raw === "low" && metric === "brightness" && resting ? "ok" : raw;
                                            };
                                            return (
                                                <td class="px-3 py-2.5 text-right">
                                                    <span
                                                        class={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-medium tabular-nums ${CELL[status()]}`}>
                                                        <Show when={status() === "low"}>
                                                            <ArrowDown size={12} aria-label={t("table.belowRange")}/>
                                                        </Show>
                                                        <Show when={status() === "high"}>
                                                            <ArrowUp size={12} aria-label={t("table.aboveRange")}/>
                                                        </Show>
                                                        {formatMetric(metric, measures()[metric])}
                                                    </span>
                                                </td>
                                            );
                                        }}
                                    </For>
                                </tr>
                            );
                        }}
                    </For>
                    </tbody>
                </table>
            </div>
        </section>
    );
}
