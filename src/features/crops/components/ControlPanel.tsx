import { Bot, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { SelectField } from "../../../components/ui/Field";
import { Alert, Badge } from "../../../components/ui/Feedback";
import { Switch } from "../../../components/ui/Switch";
import { ApiError } from "../../../lib/api/client";
import { actuatorApi, commandApi } from "../../../lib/api/services";
import { ACTUATORS, COMMAND_STATUS } from "../../../lib/catalog";
import { describeAction, formatDateTime, timeAgo } from "../../../lib/format";
import type { Actuator, ActuatorType, Command, Crop } from "../../../lib/api/types";

interface ControlPanelProps {
  crop: Crop;
  actuators: Actuator[];
  commands: Command[];
  onAutomation: (enabled: boolean) => Promise<void>;
  onChanged: () => void;
}

export function ControlPanel({ crop, actuators, commands, onAutomation, onChanged }: ControlPanelProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newType, setNewType] = useState<ActuatorType | "">("");
  const available = (Object.keys(ACTUATORS) as ActuatorType[]).filter((type) => !actuators.some((a) => a.type === type));

  async function run(key: string, task: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await task();
      onChanged();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo completar la acción");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="card flex items-start justify-between gap-4 p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700"><Bot size={20} /></div>
          <div>
            <h3 className="font-semibold">Modo automático</h3>
            <p className="text-sm text-muted">
              El agente de IA ejecuta sus recomendaciones sobre los actuadores de esta maceta, con una pausa de 10 minutos
              entre acciones del mismo actuador.
            </p>
          </div>
        </div>
        <Switch label="Modo automático" checked={crop.automationEnabled} disabled={busy === "automation"}
          onChange={(enabled) => void run("automation", () => onAutomation(enabled))} />
      </section>

      {error && <Alert tone="danger">{error}</Alert>}
      {!crop.device.online && (
        <Alert tone="warning" title="La maceta está desconectada">
          Los comandos se envían, pero no se ejecutarán hasta que la maceta vuelva a conectarse.
        </Alert>
      )}

      <section className="card p-5">
        <h3 className="font-semibold">Actuadores</h3>
        <ul className="mt-3 divide-y divide-line">
          {actuators.map((actuator) => {
            const info = ACTUATORS[actuator.type];
            return (
              <li key={actuator.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{info.label}</p>
                  <p className="text-xs text-muted">
                    {actuator.active ? "Encendido" : "Apagado"}
                    {actuator.lastChangedAt ? ` · ${timeAgo(actuator.lastChangedAt)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {info.defaultSeconds && (
                    <Button size="sm" icon={<Power size={14} />} loading={busy === `${actuator.id}-timed`}
                      onClick={() => void run(`${actuator.id}-timed`,
                        () => commandApi.send(crop.id, actuator.id, "ACTIVATE", info.defaultSeconds))}>
                      {info.defaultSeconds >= 60 ? `${info.defaultSeconds / 60} min` : `${info.defaultSeconds} s`}
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" loading={busy === `${actuator.id}-on`}
                    onClick={() => void run(`${actuator.id}-on`, () => commandApi.send(crop.id, actuator.id, "ACTIVATE"))}>
                    Encender
                  </Button>
                  <Button size="sm" variant="secondary" icon={<PowerOff size={14} />} loading={busy === `${actuator.id}-off`}
                    onClick={() => void run(`${actuator.id}-off`, () => commandApi.send(crop.id, actuator.id, "DEACTIVATE"))}>
                    Apagar
                  </Button>
                  <Button size="sm" variant="ghost" aria-label={`Quitar ${info.label}`} loading={busy === `${actuator.id}-remove`}
                    onClick={() => void run(`${actuator.id}-remove`, () => actuatorApi.remove(crop.id, actuator.id))}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </li>
            );
          })}
          {actuators.length === 0 && <p className="py-3 text-sm text-muted">Este cultivo no tiene actuadores.</p>}
        </ul>
        {available.length > 0 && (
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-4">
            <SelectField label="Agregar actuador" className="min-w-56 flex-1" value={newType}
              onChange={(event) => setNewType(event.target.value as ActuatorType)}>
              <option value="">Elige un tipo</option>
              {available.map((type) => <option key={type} value={type}>{ACTUATORS[type].label}</option>)}
            </SelectField>
            <Button icon={<Plus size={16} />} disabled={!newType} loading={busy === "add"}
              onClick={() => newType && void run("add", async () => {
                await actuatorApi.add(crop.id, newType);
                setNewType("");
              })}>
              Agregar
            </Button>
          </div>
        )}
      </section>

      <section className="card p-5">
        <h3 className="font-semibold">Últimos comandos</h3>
        <ul className="mt-3 divide-y divide-line text-sm">
          {commands.map((command) => (
            <li key={command.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div>
                <p className="font-medium">
                  {describeAction(command.actuatorType, command.action, command.durationSeconds)}
                </p>
                <p className="text-xs text-muted">
                  {command.source === "AGENT" ? "Agente de IA" : "Tú"} · {formatDateTime(command.createdAt)}
                  {command.message ? ` · ${command.message}` : ""}
                </p>
              </div>
              <Badge tone={COMMAND_STATUS[command.status].tone}>{COMMAND_STATUS[command.status].label}</Badge>
            </li>
          ))}
          {commands.length === 0 && <p className="py-2 text-muted">Todavía no se han enviado comandos.</p>}
        </ul>
      </section>
    </div>
  );
}
