import {ArrowDown, ArrowUp, Table2} from "lucide-react";
import {Link} from "react-router";
import {CROP_TYPES, METRICS, PRIMARY_METRICS} from "../../../lib/catalog";
import {formatMetric, rangeStatus, timeAgo} from "../../../lib/format";
import type {Crop} from "../../../lib/api/types";
import {useCropProfiles} from "../../crops/useCropProfiles";

const CELL = {
    low: "bg-water-100 text-water-700",
    high: "bg-clay-100 text-clay-600",
    ok: "text-ink",
    unknown: "text-muted",
} as const;

/** De 22:00 a 6:00 la planta descansa: la luz baja no se marca (igual que en el asistente). */
function isRestHour(date: Date = new Date()): boolean {
    const hour = date.getHours();
    return hour >= 22 || hour < 6;
}

/** Última lectura de cada cultivo, marcando lo que está fuera del rango ideal de su especie. */
export function ComparisonTable({crops}: { crops: Crop[] }) {
    const profiles = useCropProfiles();
    const resting = isRestHour();
    return (
        <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <Table2 size={18} className="text-leaf-700"/> Última lectura de cada cultivo
                    </h2>
                    <p className="text-sm text-muted">Frente al rango ideal de su especie.</p>
                </div>
                <p className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1"><ArrowDown size={12} className="text-water-700"/> Por debajo</span>
                    <span className="flex items-center gap-1"><ArrowUp size={12} className="text-clay-600"/> Por encima</span>
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                    <thead>
                    <tr className="bg-leaf-900 text-left text-xs uppercase tracking-wide text-leaf-100">
                        <th scope="col" className="px-4 py-2.5 font-semibold">Cultivo</th>
                        {PRIMARY_METRICS.map((metric) => (
                            <th key={metric} scope="col"
                                className="px-3 py-2.5 text-right font-semibold">{METRICS[metric].label}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {crops.map((crop, index) => {
                        const measures = crop.latestReading?.measures ?? {};
                        const profile = profiles[crop.type];
                        return (
                            <tr key={crop.id} className={index % 2 ? "bg-surface/60" : "bg-white"}>
                                <th scope="row" className="px-4 py-2.5 text-left font-normal">
                                    <Link to={`/app/crops/${crop.id}`}
                                          className="font-semibold text-leaf-800 hover:underline">{crop.name}</Link>
                                    <span className="block text-xs text-muted">
                      {CROP_TYPES[crop.type].label} · {timeAgo(crop.latestReading?.measuredAt)}
                    </span>
                                </th>
                                {PRIMARY_METRICS.map((metric) => {
                                    const raw = rangeStatus(measures[metric], profile?.ranges[metric]);
                                    const status = raw === "low" && metric === "brightness" && resting ? "ok" : raw;
                                    return (
                                        <td key={metric} className="px-3 py-2.5 text-right">
                        <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-medium ${CELL[status]}`}>
                          {status === "low" && <ArrowDown size={12} aria-label="por debajo del rango"/>}
                            {status === "high" && <ArrowUp size={12} aria-label="por encima del rango"/>}
                            {formatMetric(metric, measures[metric])}
                        </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
