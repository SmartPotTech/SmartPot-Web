import { KeyRound, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { Alert } from "../../../components/ui/Feedback";
import { useResource } from "../../../hooks/useResource";
import { ApiError } from "../../../lib/api/client";
import { cropApi } from "../../../lib/api/services";
import { formatDateTime, timeAgo } from "../../../lib/format";
import type { Crop, DeviceCredentials } from "../../../lib/api/types";
import { ConnectionGuide } from "./ConnectionGuide";
import { CredentialsView } from "./CredentialsView";

export function DevicePanel({ crop }: { crop: Crop }) {
  const device = useResource(() => cropApi.device(crop.id), [crop.id]);
  const [confirming, setConfirming] = useState(false);
  const [rotated, setRotated] = useState<DeviceCredentials | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function rotate() {
    setLoading(true);
    setError(null);
    try {
      setRotated(await cropApi.rotateKey(crop.id));
      setConfirming(false);
      void device.reload();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo generar la clave");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="card flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${crop.device.online
          ? "bg-leaf-50 text-leaf-700" : "bg-surface text-muted"}`}>
          {crop.device.online ? <Wifi size={22} /> : <WifiOff size={22} />}
        </div>
        <div>
          <p className="font-semibold">{crop.device.online ? "Dispositivo en línea" : "Dispositivo desconectado"}</p>
          <p className="text-sm text-muted">Última señal {timeAgo(crop.device.lastSeenAt)}</p>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold">Cómo conectarlo</h3>
        <p className="mt-1 text-sm text-muted">
          Un cultivo real recibe sus lecturas de un ESP32 con el firmware de SmartPot, físico o simulado en Wokwi. Los
          dos usan estos datos; la clave solo se muestra al crear el cultivo o al generar una nueva.
        </p>
        <div className="mt-4">
          {device.data ? <ConnectionGuide credentials={device.data} />
            : device.error ? <Alert tone="danger">{device.error}</Alert>
              : <p className="text-sm text-muted">Cargando…</p>}
        </div>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h3 className="font-semibold">Clave del dispositivo</h3>
          <p className="text-sm text-muted">Generada el {formatDateTime(crop.device.keyRotatedAt)}</p>
        </div>
        <Button variant="secondary" icon={<KeyRound size={16} />} onClick={() => setConfirming(true)}>Generar nueva clave</Button>
      </section>

      <Dialog open={confirming} title="¿Generar una nueva clave?" onClose={() => setConfirming(false)}
        footer={<>
          <Button variant="secondary" onClick={() => setConfirming(false)}>Cancelar</Button>
          <Button onClick={() => void rotate()} loading={loading}>Generar</Button>
        </>}>
        {error && <div className="mb-3"><Alert tone="danger">{error}</Alert></div>}
        <p className="text-sm text-muted">
          La clave actual deja de funcionar y el dispositivo se desconecta hasta que lo configures con la nueva.
        </p>
      </Dialog>

      <Dialog open={Boolean(rotated)} title="Nueva clave del dispositivo" onClose={() => setRotated(null)}
        footer={<Button onClick={() => setRotated(null)}>Ya la guardé</Button>}>
        {rotated && <CredentialsView credentials={rotated} />}
      </Dialog>
    </div>
  );
}
