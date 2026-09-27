import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Alert } from "../../../components/ui/Feedback";
import type { DeviceCredentials } from "../../../lib/api/types";

export function CopyRow({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-1 flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
        <code className={`flex-1 break-all text-sm ${secret ? "font-semibold text-leaf-900" : ""}`}>{value}</code>
        <button type="button" aria-label={`Copiar ${label.toLowerCase()}`} className="rounded p-1 text-muted hover:text-leaf-700"
          onClick={async () => {
            await navigator.clipboard?.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

/** Datos de conexión del dispositivo. La clave solo llega al crear el cultivo o al rotarla. */
export function CredentialsView({ credentials }: { credentials: DeviceCredentials }) {
  return (
    <div className="space-y-4">
      {credentials.key && (
        <Alert tone="warning" title="Guarda la clave ahora">
          Por seguridad no volveremos a mostrarla. Si la pierdes, genera una nueva desde la pestaña Dispositivo.
        </Alert>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <CopyRow label="Broker" value={`${credentials.host}:${credentials.port}${credentials.tls ? " (TLS)" : ""}`} />
        <CopyRow label="Usuario (id del cultivo)" value={credentials.username} />
      </div>
      {credentials.key && <CopyRow label="Clave del dispositivo" value={credentials.key} secret />}
      <CopyRow label="Tópico de telemetría" value={credentials.topics.telemetry} />
    </div>
  );
}
