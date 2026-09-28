import {ChartLine} from "lucide-react";
import {useMemo, useState} from "react";
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Alert} from "../../../components/ui/Feedback";
import {useResource} from "../../../hooks/useResource";
import {overviewApi} from "../../../lib/api/services";
import {MAX_COMPARED, METRICS, PRIMARY_METRICS} from "../../../lib/catalog";
import {formatDateTime, formatMetric, formatTime} from "../../../lib/format";
import type {Crop, MetricKey} from "../../../lib/api/types";
import {useComparedCrops} from "../useComparedCrops";

const PERIODS = [{hours: 6, label: "6 h"}, {hours: 24, label: "24 h"}, {hours: 168, label: "7 días"}];

export function MetricComparison({crops}: { crops: Crop[] }) {
    const [metric, setMetric] = useState<MetricKey>("temperature");
    const [hours, setHours] = useState(24);
    const compared = useComparedCrops(crops);
    const series = useResource(() => overviewApi.series(metric, hours), [metric, hours], 60_000);

    const rows = useMemo(() => {
        const byTime = new Map<number, { time: number; [cropId: string]: number }>();
        for (const item of series.data?.series ?? []) {
            for (const point of item.points) {
                const time = new Date(point.time).getTime();
                const row = byTime.get(time) ?? {time};
                row[item.cropId] = point.value;
                byTime.set(time, row);
            }
        }
        return [...byTime.values()].sort((a, b) => a.time - b.time);
    }, [series.data]);

    const info = METRICS[metric];
    const visible = compared.selected.filter((crop) => rows.some((row) => row[crop.id] !== undefined));

    return (
        <section className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <ChartLine size={18} className="text-leaf-700"/> Comparar cultivos
                    </h2>
                    <p className="text-sm text-muted">Promedio
                        de {info.label.toLowerCase()} cada {series.data?.bucketMinutes ?? "…"} min.</p>
                </div>
                <div className="flex rounded-xl bg-surface p-1" role="group" aria-label="Periodo">
                    {PERIODS.map((period) => (
                        <button key={period.hours} type="button" aria-pressed={hours === period.hours}
                                onClick={() => setHours(period.hours)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${hours === period.hours
                                    ? "bg-leaf-700 text-white" : "text-muted hover:text-ink"}`}>
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Variable">
                {PRIMARY_METRICS.map((key) => (
                    <button key={key} type="button" aria-pressed={metric === key} onClick={() => setMetric(key)}
                            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${metric === key
                                ? "border-leaf-700 bg-leaf-50 text-leaf-800" : "border-line text-muted hover:border-leaf-500"}`}>
                        {METRICS[key].label}
                    </button>
                ))}
            </div>

            {series.error && <div className="mt-4"><Alert tone="danger">{series.error}</Alert></div>}
            <div className="mt-4 h-72" role="img"
                 aria-label={`Comparación de ${info.label.toLowerCase()} entre ${visible.length} cultivos`}>
                {visible.length === 0 ? (
                    <p className="flex h-full items-center justify-center text-sm text-muted">
                        {series.loading ? "Cargando lecturas…" : "No hay lecturas en este periodo para los cultivos elegidos."}
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={rows} margin={{top: 8, right: 12, left: -8, bottom: 0}}>
                            <CartesianGrid stroke="#E4EEE9" vertical={false}/>
                            <XAxis dataKey="time" type="number" scale="time" domain={["dataMin", "dataMax"]}
                                   tickFormatter={(value) => hours > 24 ? new Date(value).toLocaleDateString("es-CO", {weekday: "short"})
                                       : formatTime(value)} stroke="#5B6B63" fontSize={12} tickLine={false}
                                   minTickGap={40}/>
                            <YAxis stroke="#5B6B63" fontSize={12} tickLine={false} axisLine={false} width={48}
                                   domain={["auto", "auto"]}/>
                            <Tooltip
                                labelFormatter={(value) => formatDateTime(new Date(Number(value)).toISOString())}
                                formatter={(value, name) => [formatMetric(metric, Number(value)), crops.find((c) => c.id === name)?.name ?? name]}
                                contentStyle={{borderRadius: 12, borderColor: "#D5E3DC", fontSize: 13}}/>
                            {visible.map((crop) => (
                                <Line key={crop.id} dataKey={crop.id} name={crop.id} stroke={compared.colorOf(crop.id)}
                                      strokeWidth={2}
                                      dot={false} connectNulls isAnimationActive={false}/>
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Cultivos comparados">
                {crops.map((crop) => {
                    const color = compared.colorOf(crop.id);
                    const disabled = !color && compared.isFull;
                    return (
                        <button key={crop.id} type="button" aria-pressed={Boolean(color)} disabled={disabled}
                                onClick={() => compared.toggle(crop.id)}
                                title={disabled ? `Máximo ${MAX_COMPARED} cultivos a la vez` : undefined}
                                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors disabled:opacity-40
                ${color ? "border-line bg-white text-ink" : "border-dashed border-line text-muted"}`}>
                            <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: color ?? "#D5E3DC"}}/>
                            {crop.name}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
