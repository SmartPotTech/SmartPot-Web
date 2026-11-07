import {ChartLine} from "lucide-solid";
import {createMemo, createSignal, For, Show} from "solid-js";
import {Alert} from "../../../components/ui/Feedback";
import {useElementSize} from "../../../hooks/useElementSize";
import {useResource} from "../../../hooks/useResource";
import {overviewApi} from "../../../lib/api/services";
import {MAX_COMPARED, METRICS, PRIMARY_METRICS} from "../../../lib/catalog";
import {nearestIndex, niceScale, pointerX, stepDecimals, timeTicks, xTickCount} from "../../../lib/chart";
import {formatDateTime, formatMetric, formatNumber, formatTime} from "../../../lib/format";
import {intlLocale, t} from "../../../lib/i18n";
import type {Crop, MetricKey} from "../../../lib/api/types";
import {useComparedCrops} from "../useComparedCrops";

const PERIODS = [
    {hours: 6, label: () => "6 h"},
    {hours: 24, label: () => "24 h"},
    {hours: 168, label: () => t("compare.days7")},
];

export function MetricComparison(props: { crops: Crop[] }) {
    const [metric, setMetric] = createSignal<MetricKey>("temperature");
    const [hours, setHours] = createSignal(24);
    const [hoverIdx, setHoverIdx] = createSignal<number | null>(null);
    // El SVG se dibuja al tamaño real del contenedor (h-72): en un teléfono el texto no se encoge ni sobra alto.
    const box = useElementSize({width: 760, height: 288});
    const compared = useComparedCrops(() => props.crops);
    const series = useResource(() => overviewApi.series(metric(), hours()), () => [metric(), hours()], 60_000);

    const rows = createMemo(() => {
        const byTime = new Map<number, { time: number; values: Record<string, number> }>();
        for (const item of series.data?.series ?? []) {
            for (const point of item.points) {
                const time = new Date(point.time).getTime();
                const row = byTime.get(time) ?? {time, values: {}};
                row.values[item.cropId] = point.value;
                byTime.set(time, row);
            }
        }
        return [...byTime.values()].sort((a, b) => a.time - b.time);
    });

    const info = () => METRICS[metric()];
    const visible = createMemo(() =>
        compared.selected.filter((crop) => rows().some((row) => row.values[crop.id] !== undefined)),
    );

    const chart = createMemo(() => {
        const currentRows = rows();
        const currentVisible = visible();
        if (currentRows.length === 0 || currentVisible.length === 0) return null;

        const width = Math.max(260, box.size().width);
        const height = box.size().height;
        const padLeft = 48;
        const padRight = 16;
        const padTop = 12;
        const padBottom = 28;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        const allValues: number[] = [];
        for (const row of currentRows) {
            for (const crop of currentVisible) {
                const val = row.values[crop.id];
                if (val !== undefined) allValues.push(val);
            }
        }
        if (allValues.length === 0) return null;

        // Marcas redondas (10, 15, 20…) en vez de cuartos exactos del rango; el redondeo deja el margen.
        const scale = niceScale(Math.min(...allValues), Math.max(...allValues));
        const minVal = scale.min;
        const maxVal = scale.max;

        const minTime = currentRows[0]!.time;
        const maxTime = currentRows[currentRows.length - 1]!.time;
        const timeSpan = Math.max(1, maxTime - minTime);

        const toX = (t: number) =>
            currentRows.length === 1 ? padLeft + plotW / 2 : padLeft + ((t - minTime) / timeSpan) * plotW;
        const toY = (v: number) => padTop + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;

        const lines = currentVisible.map((crop) => {
            const pts = currentRows
                .filter((row) => row.values[crop.id] !== undefined)
                .map((row) => ({x: toX(row.time), y: toY(row.values[crop.id]!)}));
            const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
            return {crop, color: compared.colorOf(crop.id) ?? "#067A52", path};
        });

        const yTicks = scale.ticks.map((value) => ({
            value,
            label: formatNumber(value, stepDecimals(scale.step)),
            y: toY(value),
        }));

        const xTicks = timeTicks(minTime, maxTime, xTickCount(width, currentRows.length))
            .map((tick) => ({...tick, x: toX(tick.time)}));

        const rowCoords = currentRows.map((row) => ({...row, x: toX(row.time)}));
        const xs = rowCoords.map((row) => row.x);

        return {width, height, padLeft, padRight, padTop, padBottom, plotW, plotH, lines, yTicks, xTicks, rowCoords, xs};
    });

    return (
        <section class="card p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 class="flex items-center gap-2 text-lg font-semibold">
                        <ChartLine size={18} class="text-accent"/> {t("compare.title")}
                    </h2>
                    <p class="text-sm text-muted">{t("compare.average", {
                        metric: info().label.toLowerCase(),
                        minutes: series.data?.bucketMinutes ?? "…",
                    })}</p>
                </div>
                <div class="flex rounded-xl bg-surface p-1" role="group" aria-label={t("compare.period")}>
                    <For each={PERIODS}>
                        {(period) => (
                            <button type="button" aria-pressed={hours() === period.hours}
                                    onClick={() => setHours(period.hours)}
                                    class={`touch-target rounded-lg px-3 py-1.5 text-sm font-semibold ${hours() === period.hours
                                        ? "bg-leaf-700 text-white" : "text-muted hover:text-ink"}`}>
                                {period.label()}
                            </button>
                        )}
                    </For>
                </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("compare.variable")}>
                <For each={PRIMARY_METRICS}>
                    {(key) => (
                        <button type="button" aria-pressed={metric() === key} onClick={() => setMetric(key)}
                                class={`touch-target rounded-full border px-3 py-1 text-sm font-medium transition-colors ${metric() === key
                                    ? "border-leaf-700 bg-leaf-50 text-accent-strong" : "border-line text-muted hover:border-leaf-500"}`}>
                            {METRICS[key].label}
                        </button>
                    )}
                </For>
            </div>

            <Show when={series.error}>
                {(err) => <div class="mt-4"><Alert tone="danger">{err()}</Alert></div>}
            </Show>
            <div class="relative mt-4 h-72 select-none" role="img" ref={box.ref}
                 aria-label={t("compare.chartLabel", {metric: info().label.toLowerCase(), count: visible().length})}>
                <Show when={chart()} fallback={
                    <p class="flex h-full items-center justify-center text-sm text-muted">
                        {series.loading ? t("compare.loading") : t("compare.noData")}
                    </p>
                }>
                    {(g) => {
                        const hoveredRow = () => {
                            const idx = hoverIdx();
                            return idx !== null ? g().rowCoords[idx] : null;
                        };
                        // Puntero y dedo usan el mismo camino: la fila más cercana en X.
                        const track = (event: PointerEvent & { currentTarget: SVGSVGElement }) =>
                            setHoverIdx(nearestIndex(g().xs, pointerX(event, event.currentTarget, g().width)));
                        return (
                            <>
                                <svg viewBox={`0 0 ${g().width} ${g().height}`} class="h-full w-full overflow-visible"
                                     style={{"touch-action": "pan-y"}} onPointerMove={track} onPointerDown={track}
                                     onPointerLeave={(event) => event.pointerType === "mouse" && setHoverIdx(null)}>
                                    <For each={g().yTicks}>
                                        {(tick) => (
                                            <g>
                                                <line x1={g().padLeft} x2={g().width - g().padRight}
                                                      y1={tick.y} y2={tick.y} class="stroke-line"/>
                                                <text x={g().padLeft - 8} y={tick.y + 4} text-anchor="end"
                                                      class="fill-muted tabular-nums" font-size="11">
                                                    {tick.label}
                                                </text>
                                            </g>
                                        )}
                                    </For>
                                    <For each={g().lines}>
                                        {(line) => (
                                            <path d={line.path} fill="none" stroke={line.color} stroke-width="2"
                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                        )}
                                    </For>
                                    <For each={g().xTicks}>
                                        {(tick) => (
                                            <text x={tick.x} y={g().height - 6} text-anchor={tick.anchor}
                                                  class="fill-muted tabular-nums" font-size="11">
                                                {hours() > 24
                                                    ? new Date(tick.time).toLocaleDateString(intlLocale(), {weekday: "short"})
                                                    : formatTime(tick.time)}
                                            </text>
                                        )}
                                    </For>
                                    <Show when={hoveredRow()}>
                                        {(row) => (
                                            <line x1={row().x} x2={row().x} y1={g().padTop}
                                                  y2={g().height - g().padBottom} class="stroke-line"/>
                                        )}
                                    </Show>
                                </svg>
                                <Show when={hoveredRow()}>
                                    {(row) => (
                                        <div
                                            class="pointer-events-none absolute right-3 top-2 rounded-xl border border-line bg-card/95 px-3 py-1.5 text-xs shadow-sm">
                                            <p class="font-medium text-muted">
                                                {formatDateTime(new Date(row().time).toISOString())}
                                            </p>
                                            <For each={visible()}>
                                                {(crop) => (
                                                    <Show when={row().values[crop.id] !== undefined}>
                                                        <p class="font-semibold text-ink tabular-nums">
                                                            {crop.name}: {formatMetric(metric(), row().values[crop.id])}
                                                        </p>
                                                    </Show>
                                                )}
                                            </For>
                                        </div>
                                    )}
                                </Show>
                            </>
                        );
                    }}
                </Show>
            </div>

            <div class="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("compare.compared")}>
                <For each={props.crops}>
                    {(crop) => {
                        const color = () => compared.colorOf(crop.id);
                        const disabled = () => !color() && compared.isFull;
                        return (
                            <button type="button" aria-pressed={Boolean(color())} disabled={disabled()}
                                    onClick={() => compared.toggle(crop.id)}
                                    title={disabled() ? t("compare.max", {max: MAX_COMPARED}) : undefined}
                                    class={`touch-target flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-40
                    ${color() ? "border-line bg-card text-ink" : "border-dashed border-line text-muted"}`}>
                                <span class={`h-2.5 w-2.5 rounded-full ${color() ? "" : "bg-line"}`}
                                      style={{"background-color": color()}}/>
                                {crop.name}
                            </button>
                        );
                    }}
                </For>
            </div>
        </section>
    );
}
