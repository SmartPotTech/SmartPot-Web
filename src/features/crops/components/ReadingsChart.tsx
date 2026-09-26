import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { METRICS } from "../../../lib/catalog";
import { formatDateTime, formatMetric, formatTime } from "../../../lib/format";
import type { MetricKey, ProfileRange, Reading } from "../../../lib/api/types";

interface ReadingsChartProps {
  readings: Reading[];
  metric: MetricKey;
  range?: ProfileRange;
  height?: number;
}

/** Serie de una variable con la franja del rango ideal de la especie. */
export function ReadingsChart({ readings, metric, range, height = 280 }: ReadingsChartProps) {
  const info = METRICS[metric];
  const data = readings
    .filter((reading) => reading.measures[metric] !== undefined)
    .map((reading) => ({ time: new Date(reading.measuredAt).getTime(), value: reading.measures[metric] }));

  if (data.length === 0) {
    return <p className="flex h-40 items-center justify-center text-sm text-muted">Sin lecturas de {info.label.toLowerCase()} en este periodo.</p>;
  }

  return (
    <div style={{ height }} role="img" aria-label={`Gráfica de ${info.label.toLowerCase()} con ${data.length} lecturas`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="#E4EEE9" vertical={false} />
          {range && <ReferenceArea y1={range.min} y2={range.max} fill="#00B074" fillOpacity={0.08} ifOverflow="extendDomain" />}
          <XAxis dataKey="time" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={formatTime}
            stroke="#5B6B63" fontSize={12} tickLine={false} minTickGap={40} />
          <YAxis stroke="#5B6B63" fontSize={12} tickLine={false} axisLine={false} width={48}
            domain={["auto", "auto"]} />
          <Tooltip
            labelFormatter={(value) => formatDateTime(new Date(Number(value)).toISOString())}
            formatter={(value) => [formatMetric(metric, Number(value)), info.label]}
            contentStyle={{ borderRadius: 12, borderColor: "#D5E3DC", fontSize: 13 }}
          />
          <Line type="monotone" dataKey="value" stroke={info.color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
