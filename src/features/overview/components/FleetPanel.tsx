import { AlertTriangle, RefreshCw, Sparkles, Users } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Feedback";
import { useResource } from "../../../hooks/useResource";
import { overviewApi } from "../../../lib/api/services";
import type { Crop } from "../../../lib/api/types";
import { FleetActionsList } from "./FleetActionsList";

/** Lo que el asistente ve al mirar todos los cultivos juntos. */
export function FleetPanel({ crops }: { crops: Crop[] }) {
  const fleet = useResource(() => overviewApi.fleet(), [], 5 * 60_000);
  const names = (ids: string[]) => ids.map((id) => crops.find((crop) => crop.id === id)?.name ?? "Cultivo");
  const data = fleet.data;

  return (
    <section className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 bg-linear-to-r from-leaf-50 to-white p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles size={18} className="text-leaf-700" /> Asistente de IA · todos tus cultivos
          </h2>
          <p className="mt-1 text-sm leading-snug text-ink">
            {data?.summary ?? (fleet.loading ? "Analizando tus cultivos…" : "")}
          </p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} loading={fleet.loading}
          onClick={() => void fleet.reload()} aria-label="Volver a analizar" />
      </div>

      <div className="space-y-5 p-5 pt-2">
        {fleet.error && <Alert tone="info" title="El asistente no está disponible">{fleet.error}</Alert>}

        {data && data.sharedIssues.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-clay-600">
              <AlertTriangle size={16} /> Problemas del entorno
            </h3>
            <ul className="mt-2 space-y-2">
              {data.sharedIssues.map((issue) => (
                <li key={`${issue.parameter}-${issue.status}`} className="rounded-xl bg-sun-100 p-3 text-sm text-ink">
                  {issue.message}
                  <span className="mt-1 block text-xs text-muted">{names(issue.cropIds).join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data && data.groups.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-leaf-800">
              <Users size={16} /> Grupos con condiciones parecidas
            </h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {data.groups.map((group) => (
                <li key={group.label} className="rounded-xl border border-line p-3">
                  <p className="text-sm font-semibold">{group.label}</p>
                  <p className="text-xs text-muted">{group.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {names(group.cropIds).map((name, index) => (
                      <span key={`${group.label}-${index}`} className="rounded-full bg-leaf-50 px-2 py-0.5 text-xs text-leaf-800">
                        {name}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data && (
          <div>
            <h3 className="text-sm font-semibold text-leaf-800">Acciones sugeridas en bloque</h3>
            <div className="mt-1">
              <FleetActionsList actions={data.actions} crops={crops} onApplied={() => void fleet.reload()} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
