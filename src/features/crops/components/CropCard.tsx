import { Bot, ChevronRight, Sprout } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "../../../components/ui/Feedback";
import { CROP_FORMS, CROP_TYPES, HEALTH } from "../../../lib/catalog";
import { formatMetric, timeAgo } from "../../../lib/format";
import type { Crop } from "../../../lib/api/types";

export function CropCard({ crop }: { crop: Crop }) {
  const measures = crop.latestReading?.measures ?? {};
  const health = crop.health;
  const color = health ? HEALTH[health.level]?.color ?? "#5B6B63" : "#D5E3DC";
  return (
    <Link to={`/app/crops/${crop.id}`}
      className="card group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3 bg-linear-to-r from-leaf-50 to-white px-5 pb-3 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-700 text-white">
            <Sprout size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{crop.name}</h3>
            <p className="text-sm text-leaf-700">{CROP_TYPES[crop.type].label} · {CROP_FORMS[crop.form]?.label ?? "Maceta"}</p>
          </div>
        </div>
        <span className={`mt-1 flex items-center gap-1.5 text-xs font-semibold ${crop.device.online ? "text-leaf-700" : "text-muted"}`}>
          <span className={`h-2 w-2 rounded-full ${crop.device.online ? "animate-pulse bg-leaf-500" : "bg-line"}`} />
          {crop.device.online ? "En línea" : "Desconectado"}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {(["temperature", "soilMoisture", "ph"] as const).map((metric) => (
            <div key={metric} className="rounded-xl bg-surface px-2 py-2">
              <p className="text-sm font-semibold">{formatMetric(metric, measures[metric])}</p>
              <p className="text-[11px] text-muted">{metric === "temperature" ? "Temp." : metric === "ph" ? "pH" : "Sustrato"}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface" role="presentation">
            <div className="h-full rounded-full transition-all" style={{ width: `${health ? Math.round(health.index) : 0}%`,
              backgroundColor: color }} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={crop.kind === "VIRTUAL" ? "info" : "success"}>{crop.kind === "VIRTUAL" ? "Virtual" : "Real"}</Badge>
            {health ? <Badge tone={HEALTH[health.level]?.tone ?? "neutral"}>Salud {Math.round(health.index)} · {health.label}</Badge>
              : <Badge>Sin evaluar</Badge>}
            {crop.automationEnabled && <Badge tone="info"><Bot size={12} /> Automático</Badge>}
          </div>
          <ChevronRight size={18} className="text-leaf-700 transition-transform group-hover:translate-x-0.5" />
        </div>
        <p className="mt-3 text-xs text-muted">Última lectura {timeAgo(crop.latestReading?.measuredAt)}</p>
      </div>
    </Link>
  );
}
