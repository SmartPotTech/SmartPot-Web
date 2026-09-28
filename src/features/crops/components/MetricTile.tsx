import {ArrowDown, ArrowUp, Check} from "lucide-react";
import {METRICS} from "../../../lib/catalog";
import {formatMetric, rangeStatus} from "../../../lib/format";
import type {MetricKey, ProfileRange} from "../../../lib/api/types";

const STATUS = {
    low: {text: "Bajo", className: "text-water-700 bg-water-100", icon: <ArrowDown size={12}/>},
    high: {text: "Alto", className: "text-clay-600 bg-clay-100", icon: <ArrowUp size={12}/>},
    ok: {text: "Ideal", className: "text-leaf-800 bg-leaf-100", icon: <Check size={12}/>},
    unknown: null,
};

export function MetricTile({metric, value, range}: { metric: MetricKey; value?: number; range?: ProfileRange }) {
    const info = METRICS[metric];
    const status = STATUS[rangeStatus(value, range)];
    return (
        <div className="card p-4">
            <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm text-muted">
                    <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: info.color}}/>
                    {info.label}
                </p>
                {status && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>
            {status.icon}{status.text}
          </span>
                )}
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{formatMetric(metric, value)}</p>
            {range && (
                <p className="mt-1 text-xs text-muted">Ideal: {range.min}–{range.max} {range.unit}</p>
            )}
        </div>
    );
}
