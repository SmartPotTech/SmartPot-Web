import { Bot, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "../../../components/ui/Feedback";
import { CROP_TYPES, HEALTH } from "../../../lib/catalog";
import { formatMetric, timeAgo } from "../../../lib/format";
import type { Crop } from "../../../lib/api/types";

export function CropCard({ crop }: { crop: Crop }) {
  const measures = crop.latestReading?.measures ?? {};
  const health = crop.health;
  return (
    <Link to={`/app/crops/${crop.id}`} className="card group flex flex-col p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{crop.name}</h3>
          <p className="text-sm text-muted">{CROP_TYPES[crop.type].label}</p>
        </div>
        <span className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${crop.device.online ? "text-leaf-700" : "text-muted"}`}>
          <span className={`h-2 w-2 rounded-full ${crop.device.online ? "bg-leaf-500" : "bg-line"}`} />
          {crop.device.online ? "En línea" : "Desconectada"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {(["temperature", "soilMoisture", "ph"] as const).map((metric) => (
          <div key={metric} className="rounded-xl bg-surface px-2 py-2">
            <p className="text-sm font-semibold">{formatMetric(metric, measures[metric])}</p>
            <p className="text-[11px] text-muted">{metric === "temperature" ? "Temp." : metric === "ph" ? "pH" : "Sustrato"}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {health ? <Badge tone={HEALTH[health.level]?.tone ?? "neutral"}>Salud {Math.round(health.index)} · {health.label}</Badge>
            : <Badge>Sin evaluar</Badge>}
          {crop.automationEnabled && <Badge tone="info"><Bot size={12} /> Automático</Badge>}
        </div>
        <ChevronRight size={18} className="text-muted transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-3 text-xs text-muted">Última lectura {timeAgo(crop.latestReading?.measuredAt)}</p>
    </Link>
  );
}
