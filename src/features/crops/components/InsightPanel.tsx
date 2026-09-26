import { BrainCircuit, CircleHelp, Play, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Alert, Badge } from "../../../components/ui/Feedback";
import { ACTUATORS, METRICS } from "../../../lib/catalog";
import { formatMetric, timeAgo } from "../../../lib/format";
import type { Actuator, Insight } from "../../../lib/api/types";
import { HealthGauge } from "./HealthGauge";

interface InsightPanelProps {
  insight: Insight | undefined;
  error: string | null;
  loading: boolean;
  actuators: Actuator[];
  onRefresh: () => void;
  onRunAction: (action: Insight["actions"][number], actuator: Actuator) => Promise<void>;
}

const SEVERITY = { OK: "success", WARNING: "warning", CRITICAL: "danger" } as const;
const STATUS_TEXT = { LOW: "Bajo", OPTIMAL: "Ideal", HIGH: "Alto", REST: "Descanso" } as const;

export function InsightPanel({ insight, error, loading, actuators, onRefresh, onRunAction }: InsightPanelProps) {
  const [running, setRunning] = useState<string | null>(null);

  if (error && !insight) {
    return <Alert tone="info" title="El asistente todavía no puede evaluar">{error}</Alert>;
  }
  if (!insight) {
    return <p className="py-10 text-center text-sm text-muted">{loading ? "Analizando tu cultivo…" : "Sin evaluación."}</p>;
  }

  const issues = insight.diagnosis.filter((item) => item.status !== "OPTIMAL" && item.status !== "REST");

  return (
    <div className="space-y-5">
      <section className="card grid gap-6 p-5 md:grid-cols-[auto_1fr] md:items-center">
        <HealthGauge index={insight.health.index} level={insight.health.level} label={insight.health.label} />
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-leaf-700"><Sparkles size={16} /> Resumen del asistente</p>
          <p className="mt-2 text-lg leading-snug">{insight.summary}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted">
            <span>Evaluado {timeAgo(insight.evaluatedAt)}</span>
            <Button variant="ghost" size="sm" onClick={onRefresh} loading={loading} icon={<RefreshCw size={14} />}>
              Volver a evaluar
            </Button>
          </div>
        </div>
      </section>

      {insight.actions.length > 0 && (
        <section className="card p-5">
          <h3 className="font-semibold">Acciones sugeridas por el agente</h3>
          <ul className="mt-3 divide-y divide-line">
            {insight.actions.map((action) => {
              const actuator = actuators.find((item) => item.type === action.actuator);
              const key = `${action.actuator}-${action.action}`;
              return (
                <li key={key} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">
                      {action.action === "ACTIVATE" ? "Encender" : "Apagar"} {ACTUATORS[action.actuator].label.toLowerCase()}
                      {action.durationSeconds ? ` por ${action.durationSeconds} s` : ""}
                    </p>
                    <p className="text-sm text-muted">{action.reason}</p>
                  </div>
                  {actuator && (
                    <Button size="sm" variant="secondary" icon={<Play size={14} />} loading={running === key}
                      onClick={async () => {
                        setRunning(key);
                        try {
                          await onRunAction(action, actuator);
                        } finally {
                          setRunning(null);
                        }
                      }}>
                      Ejecutar
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="font-semibold">Diagnóstico por variable</h3>
          {issues.length === 0 && <p className="mt-2 text-sm text-muted">Todas las variables están en su rango ideal.</p>}
          <ul className="mt-3 space-y-3">
            {insight.diagnosis.map((item) => (
              <li key={item.parameter} className="rounded-xl bg-surface p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{METRICS[item.parameter]?.label ?? item.parameter}</p>
                  <Badge tone={item.status === "REST" ? "info" : SEVERITY[item.severity]}>{STATUS_TEXT[item.status]} · {formatMetric(item.parameter, item.value)}</Badge>
                </div>
                {item.status !== "OPTIMAL" && (
                  <>
                    <p className="mt-1 text-sm text-muted">{item.message}</p>
                    {item.recommendation && <p className="mt-1 text-sm text-leaf-800">{item.recommendation}</p>}
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-5">
          <section className="card p-5">
            <h3 className="flex items-center gap-2 font-semibold"><BrainCircuit size={18} className="text-leaf-700" /> Conclusiones del sistema experto</h3>
            <ul className="mt-3 space-y-3">
              {insight.conclusions.map((conclusion) => (
                <li key={conclusion.rule}>
                  <p className="text-sm font-semibold">{conclusion.title}
                    <span className="ml-2 text-xs font-normal text-muted">certeza {Math.round(conclusion.certainty * 100)} %</span>
                  </p>
                  <p className="text-sm text-muted">{conclusion.message}</p>
                </li>
              ))}
              {insight.conclusions.length === 0 && <p className="text-sm text-muted">Sin conclusiones para esta lectura.</p>}
            </ul>
          </section>

          <section className="card p-5">
            <h3 className="font-semibold">Predicciones de los modelos</h3>
            <ul className="mt-3 space-y-3">
              {insight.predictions.map((prediction) => (
                <li key={prediction.name}>
                  <div className="flex justify-between text-sm">
                    <span>{prediction.label}</span>
                    <span className="font-semibold">{Math.round(prediction.probability * 100)} %</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-surface">
                    <div className="h-2 rounded-full bg-leaf-500" style={{ width: `${Math.round(prediction.probability * 100)}%` }} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{prediction.model}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <details className="card p-5 text-sm">
        <summary className="flex cursor-pointer items-center gap-2 font-semibold"><CircleHelp size={16} /> ¿Cómo decide el asistente?</summary>
        <div className="mt-3 space-y-2 text-muted">
          <p><strong className="text-ink">Sistema experto:</strong> compara cada lectura con los rangos ideales de la especie y encadena reglas de agronomía; la certeza indica qué tan confiable es cada conclusión.</p>
          <p><strong className="text-ink">Lógica difusa:</strong> mide qué tan lejos está cada variable de su rango y lo resume en el índice de salud, dando más peso al pH, la temperatura y el sustrato.</p>
          <p><strong className="text-ink">Aprendizaje automático:</strong> una regresión logística estima la necesidad de ventilar, una red neuronal la de corregir el pH y un Isolation Forest detecta lecturas atípicas que pueden ser fallas de sensor.</p>
          <p><strong className="text-ink">Agente:</strong> con el modo automático activo ejecuta estas acciones por su cuenta, con una pausa de 10 minutos entre acciones del mismo actuador.</p>
        </div>
      </details>
    </div>
  );
}
