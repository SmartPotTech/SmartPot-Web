import { GraduationCap, Radar, Waves } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "../../../components/ui/Feedback";
import { formatMetric, timeAgo } from "../../../lib/format";
import type { Learning } from "../../../lib/api/types";

/** Lo que el asistente aprendió de las lecturas reales de la especie, aplicado a la lectura actual. */
export function LearningCard({ learning }: { learning: Learning }) {
  const learned = learning.source === "LEARNED";
  const predictions = learning.predictions ?? [];

  return (
    <section className="card p-5" aria-labelledby="learning-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id="learning-title" className="flex items-center gap-2 font-semibold">
            <GraduationCap size={18} className="text-leaf-700" /> Aprendido de macetas reales
          </h3>
          <p className="text-sm text-muted">{learning.message}</p>
        </div>
        <Badge tone={learned ? "success" : "neutral"}>
          {learned ? `Entrenado ${learning.trainedAt ? timeAgo(learning.trainedAt) : ""}`.trim() : "Aprendiendo"}
        </Badge>
      </div>

      {learned && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {learning.state && (
            <div className="rounded-xl bg-surface p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <Radar size={14} /> Estado de operación
              </p>
              <p className="mt-1 font-semibold">{learning.state.label}</p>
              <p className="text-xs text-muted">
                {learning.state.description} Aparece en el {Math.round(learning.state.share * 100)} % de las lecturas.
              </p>
            </div>
          )}
          {learning.moisture && (
            <div className="rounded-xl bg-surface p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <Waves size={14} /> Sustrato en 1 hora
              </p>
              <p className="mt-1 font-semibold">{formatMetric("soilMoisture", learning.moisture.expectedIn1h)}</p>
              <p className="text-xs text-muted">
                {learning.moisture.model}
                {learning.moisture.mae != null && ` · error medio ${learning.moisture.mae.toFixed(1)} %`}
              </p>
            </div>
          )}
          {learning.anomaly && (
            <div className={`rounded-xl p-3 ${learning.anomaly.unusual ? "bg-sun-100" : "bg-surface"}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lectura para la especie</p>
              <p className="mt-1 font-semibold">{learning.anomaly.unusual ? "Poco habitual" : "Habitual"}</p>
              <p className="text-xs text-muted">Isolation Forest entrenado con lecturas reales</p>
            </div>
          )}
        </div>
      )}

      {predictions.length > 0 && (
        <ul className="mt-4 space-y-3">
          {predictions.map((prediction) => (
            <li key={prediction.name}>
              <div className="flex justify-between gap-3 text-sm">
                <span>{prediction.label}</span>
                <span className="font-semibold">{Math.round(prediction.probability * 100)} %</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-surface">
                <div className="h-2 rounded-full bg-water-500" style={{ width: `${Math.round(prediction.probability * 100)}%` }} />
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {prediction.model}
                {prediction.score != null && ` · ${prediction.metric} ${prediction.score.toFixed(2)} en las lecturas más recientes`}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-muted">
        <Link to="/app/learning" className="font-semibold text-water-700 hover:underline">
          Ver cómo aprende el asistente
        </Link>
      </p>
    </section>
  );
}
