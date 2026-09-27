import { CheckCircle2, Database, GraduationCap, Hourglass, Radar, ShieldCheck } from "lucide-react";
import { HeaderStat, PageHeader } from "../../components/layout/PageHeader";
import { Alert, Badge, EmptyState } from "../../components/ui/Feedback";
import { PageLoader } from "../../components/ui/Spinner";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useResource } from "../../hooks/useResource";
import { insightApi } from "../../lib/api/services";
import { timeAgo } from "../../lib/format";
import type { CropTypeLearning, ModelCard } from "../../lib/api/types";

const STEPS = [
  ["Datos", "Cada lectura real llega a la IA con el cultivo seudonimizado: aprende de la serie, no de la persona."],
  ["Calidad", "Se mide la completitud y la validez, y se apartan los valores atípicos (rango intercuartílico)."],
  ["Etiquetas", "Lo que pasó en la hora siguiente enseña: ¿se secó el sustrato?, ¿subió la temperatura?"],
  ["Comparación", "Siete modelos compiten con validación cruzada temporal frente a una línea base."],
  ["Ajuste", "El mejor se afina con búsqueda de hiperparámetros y compite con el modelo vigente."],
  ["No supervisado", "K-Means descubre estados típicos y un Isolation Forest reconoce lo poco habitual."],
] as const;

/** Qué ha aprendido el asistente de las lecturas reales, especie por especie. Solo datos agregados. */
export function LearningPage() {
  usePageMeta("Aprendizaje de la IA");
  const status = useResource(() => insightApi.learning(), [], 60_000);
  const data = status.data;
  const trained = data?.cropTypes.reduce((total, item) =>
    total + item.models.filter((model) => model.status === "TRAINED").length, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inteligencia artificial" title="Aprendizaje" icon={<GraduationCap size={24} />}
        description="El asistente mejora con cada lectura real: aprende a anticipar riego y calor, estima el sustrato y reconoce lo poco habitual.">
        <div className="grid grid-cols-3 gap-3">
          <HeaderStat label="Lecturas reales" value={data ? data.storedReadings.toLocaleString("es-CO") : "—"} />
          <HeaderStat label="Especies" value={data ? data.cropTypes.length : "—"} />
          <HeaderStat label="Modelos entrenados" value={data ? trained : "—"} />
        </div>
      </PageHeader>

      <section className="card p-5" aria-labelledby="how-title">
        <h2 id="how-title" className="font-semibold">Cómo aprende</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(([title, text], index) => (
            <li key={title} className="flex gap-3 rounded-xl bg-surface p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-sm font-bold text-white">
                {index + 1}
              </span>
              <span className="text-sm"><strong className="block">{title}</strong><span className="text-muted">{text}</span></span>
            </li>
          ))}
        </ol>
        {data && (
          <p className="mt-3 text-xs text-muted">
            Una especie empieza a entrenar con {data.minSamples} lecturas y se reentrena cada {data.retrainEvery} lecturas
            nuevas. {data.persistent ? "Los modelos se guardan y sobreviven a los reinicios." : "Este servidor guarda lo aprendido solo en memoria."}
          </p>
        )}
      </section>

      {status.error && <Alert tone="info" title="El asistente no está disponible">{status.error}</Alert>}
      {status.loading && !data ? <PageLoader /> : data && data.cropTypes.length === 0 ? (
        <EmptyState icon={<Database size={24} />} title="Aún no hay lecturas reales">
          Conecta una maceta, física o virtual, y el asistente empezará a aprender de sus lecturas.
        </EmptyState>
      ) : (
        data?.cropTypes.map((item) => <SpeciesLearning key={item.cropType} item={item} />)
      )}
    </div>
  );
}

function SpeciesLearning({ item }: { item: CropTypeLearning }) {
  return (
    <section className="card p-5" aria-labelledby={`species-${item.cropType}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`species-${item.cropType}`} className="text-lg font-semibold">{item.name}</h2>
          <p className="text-sm text-muted">
            {item.readings.toLocaleString("es-CO")} lecturas de {item.crops} {item.crops === 1 ? "maceta" : "macetas"}
            {item.trainedAt ? ` · entrenado ${timeAgo(item.trainedAt)}` : ""} · {item.newSinceTraining} nuevas desde el último entrenamiento
          </p>
        </div>
        {item.training ? <Badge tone="info"><Hourglass size={12} /> Entrenando</Badge>
          : item.trainedAt ? <Badge tone="success"><CheckCircle2 size={12} /> Al día</Badge>
            : <Badge tone="neutral">Juntando datos</Badge>}
      </div>

      {item.quality && (
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5 font-semibold"><ShieldCheck size={16} className="text-leaf-700" />
            Calidad de datos {Math.round(item.quality.score * 100)} %</span>
          <span className="text-muted">completitud {Math.round(item.quality.completeness * 100)} %</span>
          <span className="text-muted">validez {Math.round(item.quality.validity * 100)} %</span>
          <span className="text-muted">{item.quality.outliers} atípicos apartados</span>
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {item.models.map((model) => <ModelSummary key={model.task} model={model} />)}
      </div>

      {(item.states || item.anomaly) && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {item.states && (
            <div className="rounded-xl border border-line p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Radar size={16} className="text-leaf-700" />
                Estados de operación</h3>
              <p className="text-xs text-muted">K-Means con {item.states.k} grupos elegidos por silueta ({item.states.silhouette.toFixed(2)}).</p>
              <ul className="mt-3 space-y-2">
                {item.states.clusters.map((cluster) => (
                  <li key={cluster.label}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-medium">{cluster.label}</span>
                      <span className="text-muted">{Math.round(cluster.share * 100)} %</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-surface">
                      <div className="h-2 rounded-full bg-leaf-600" style={{ width: `${Math.round(cluster.share * 100)}%` }} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{cluster.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.anomaly && (
            <div className="rounded-xl border border-line p-4 text-sm">
              <h3 className="font-semibold">Lecturas poco habituales</h3>
              <p className="mt-1 text-muted">
                Un Isolation Forest entrenado con {item.anomaly.samples.toLocaleString("es-CO")} lecturas reales marca como poco
                habitual el {Math.round(item.anomaly.contamination * 100)} % más raro. Si una maceta cae ahí sin que nada cambie,
                conviene revisar los sensores.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Tarjeta de una tarea: modelo elegido, su puntaje frente a la línea base y la comparación de candidatos. */
export function ModelSummary({ model }: { model: ModelCard }) {
  const lowerIsBetter = model.task === "moisture_1h";
  const format = (value: number | null | undefined) => value == null ? "—" : value.toFixed(2);
  const ranked = [...model.candidates].sort((a, b) =>
    lowerIsBetter ? (a.score ?? Infinity) - (b.score ?? Infinity) : (b.score ?? -Infinity) - (a.score ?? -Infinity));

  return (
    <article className="rounded-xl border border-line p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold">{model.label}</h3>
        <Badge tone={model.status === "TRAINED" ? "success" : "neutral"}>
          {model.status === "TRAINED" ? `v${model.version}` : "Pendiente"}
        </Badge>
      </div>
      {model.status === "TRAINED" ? (
        <p className="mt-1 text-sm">
          <strong>{model.model}</strong>
          <span className="block text-xs text-muted">
            {model.metric} {format(model.holdout)} en las lecturas más recientes (línea base {format(model.baseline)})
          </span>
        </p>
      ) : null}
      {model.reason && <p className="mt-1 text-xs text-muted">{model.reason}</p>}
      {ranked.length > 0 && (
        <table className="mt-3 w-full text-xs">
          <caption className="sr-only">Comparación de modelos para {model.label}</caption>
          <thead>
            <tr className="text-left text-muted">
              <th scope="col" className="py-1 font-medium">Modelo</th>
              <th scope="col" className="py-1 text-right font-medium">{lowerIsBetter ? "Error" : "F1"} (validación)</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((candidate) => (
              <tr key={candidate.model} className={candidate.model === model.model ? "font-semibold text-leaf-800" : ""}>
                <td className="py-0.5">{candidate.model}</td>
                <td className="py-0.5 text-right tabular-nums">
                  {format(candidate.score)}{candidate.std != null && <span className="text-muted"> ± {candidate.std.toFixed(2)}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-2 text-[11px] text-muted">{model.samples.toLocaleString("es-CO")} ejemplos
        {model.positives != null && ` · ${model.positives.toLocaleString("es-CO")} casos positivos`}</p>
    </article>
  );
}
