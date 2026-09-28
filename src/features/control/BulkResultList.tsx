import {CheckCircle2, CircleSlash, XCircle} from "lucide-react";
import type {BulkCommandResult} from "../../lib/api/types";

const STATUS = {
    SENT: {icon: <CheckCircle2 size={16} className="text-leaf-600"/>, label: "Enviado"},
    SKIPPED: {icon: <CircleSlash size={16} className="text-muted"/>, label: "Omitido"},
    FAILED: {icon: <XCircle size={16} className="text-danger-500"/>, label: "Falló"},
} as const;

/** Resultado de una orden en bloque, cultivo por cultivo. */
export function BulkResultList({result}: { result: BulkCommandResult }) {
    return (
        <div className="rounded-xl bg-surface p-3" role="status">
            <p className="text-sm font-semibold">
                {result.sent} {result.sent === 1 ? "enviado" : "enviados"}
                {result.skipped > 0 && ` · ${result.skipped} ${result.skipped === 1 ? "omitido" : "omitidos"}`}
                {result.failed > 0 && ` · ${result.failed} con error`}
            </p>
            <ul className="mt-2 space-y-1.5">
                {result.results.map((item) => (
                    <li key={item.cropId} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5">{STATUS[item.status].icon}</span>
                        <span>
              <span className="font-medium">{item.cropName}</span>
              <span
                  className="text-muted"> · {STATUS[item.status].label}{item.message ? `: ${item.message}` : ""}</span>
            </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
