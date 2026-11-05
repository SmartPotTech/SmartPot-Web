import {ArrowDown, ArrowUp, Check} from "lucide-solid";
import {Show} from "solid-js";
import {METRICS} from "../../../lib/catalog";
import {formatMetric, rangeStatus} from "../../../lib/format";
import type {MetricKey, ProfileRange} from "../../../lib/api/types";
import {t} from "../../../lib/i18n";

export function MetricTile(props: { metric: MetricKey; value?: number; range?: ProfileRange }) {
    const info = () => METRICS[props.metric];
    const statusKey = () => rangeStatus(props.value, props.range);

    return (
        <div class="card p-4">
            {/* La etiqueta va sola en su línea: en dos columnas de un teléfono la insignia la partía en tres. */}
            <p class="flex items-start gap-2 text-sm leading-snug text-muted">
                <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{"background-color": info().color}}/>
                {info().label}
            </p>
            <div class="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <p class="font-display text-2xl font-bold tabular-nums">{formatMetric(props.metric, props.value)}</p>
                <Show when={statusKey() !== "unknown"}>
                    <span
                        class={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            statusKey() === "low" ? "text-link bg-water-100"
                                : statusKey() === "high" ? "text-clay-fg bg-clay-100"
                                    : "text-accent-strong bg-leaf-50"
                        }`}>
                        {statusKey() === "low" ? <ArrowDown size={12}/>
                            : statusKey() === "high" ? <ArrowUp size={12}/>
                                : <Check size={12}/>}
                        {statusKey() === "low" ? t("tile.low") : statusKey() === "high" ? t("tile.high") : t("tile.ideal")}
                    </span>
                </Show>
            </div>
            <Show when={props.range}>
                {(range) => (
                    <p class="mt-1 text-xs text-muted">{t("tile.idealRange", {min: range().min, max: range().max, unit: range().unit})}</p>
                )}
            </Show>
        </div>
    );
}
