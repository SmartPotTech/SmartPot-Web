import { Play } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Feedback";
import { describeAction } from "../../../lib/format";
import type { Crop, FleetAction } from "../../../lib/api/types";
import { BulkResultList } from "../../control/BulkResultList";
import { useBulkCommand } from "../../control/useBulkCommand";

interface FleetActionsListProps {
  actions: FleetAction[];
  crops: Crop[];
  onApplied?: () => void;
}

/** Acciones que el agente propone para varios cultivos, aplicables en un solo paso. */
export function FleetActionsList({ actions, crops, onApplied }: FleetActionsListProps) {
  const bulk = useBulkCommand(onApplied);
  const names = (ids: string[]) => ids.map((id) => crops.find((crop) => crop.id === id)?.name ?? "Cultivo").join(", ");

  if (actions.length === 0) {
    return <p className="text-sm text-muted">El agente no propone acciones en este momento.</p>;
  }
  return (
    <div className="space-y-3">
      {bulk.error && <Alert tone="danger">{bulk.error}</Alert>}
      {bulk.result && <BulkResultList result={bulk.result} />}
      <ul className="divide-y divide-line">
        {actions.map((action) => {
          const key = `${action.actuator}-${action.action}`;
          return (
            <li key={key} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium">{describeAction(action.actuator, action.action, action.durationSeconds)}</p>
                <p className="text-sm text-muted">{action.reason}</p>
                <p className="mt-0.5 text-xs text-leaf-700">{names(action.cropIds)}</p>
              </div>
              <Button size="sm" icon={<Play size={14} />} loading={bulk.sending === key}
                onClick={() => void bulk.send(key, { actuatorType: action.actuator, action: action.action,
                  durationSeconds: action.durationSeconds, cropIds: action.cropIds })}>
                {action.cropIds.length === 1 ? "Aplicar" : `Aplicar a ${action.cropIds.length}`}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
