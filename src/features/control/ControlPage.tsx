import { Bot, Send, SlidersHorizontal, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { HeaderStat, PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { SelectField } from "../../components/ui/Field";
import { Alert, EmptyState } from "../../components/ui/Feedback";
import { PageLoader } from "../../components/ui/Spinner";
import { Switch } from "../../components/ui/Switch";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useResource } from "../../hooks/useResource";
import { ApiError } from "../../lib/api/client";
import { cropApi } from "../../lib/api/services";
import { ACTUATORS, CROP_TYPES, QUICK_ACTIONS } from "../../lib/catalog";
import { describeAction, formatDuration } from "../../lib/format";
import type { ActuatorType, CommandAction, Crop } from "../../lib/api/types";
import { BulkResultList } from "./BulkResultList";
import { useBulkCommand } from "./useBulkCommand";

const DURATIONS = [5, 15, 30, 60, 300, 600, 900, 1800, 3600];

/** Control general: modo automático y órdenes a varios cultivos a la vez. */
export function ControlPage() {
  usePageMeta("Control general");
  const crops = useResource(() => cropApi.list(), [], 30_000);
  const list = crops.data ?? [];
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [automationBusy, setAutomationBusy] = useState<string | null>(null);
  const [automationError, setAutomationError] = useState<string | null>(null);
  const bulk = useBulkCommand(() => void crops.reload());
  const [actuator, setActuator] = useState<ActuatorType>("WATER_PUMP");
  const [action, setAction] = useState<CommandAction>("ACTIVATE");
  const [duration, setDuration] = useState<number>(ACTUATORS.WATER_PUMP.defaultSeconds ?? 15);

  const selected = list.filter((crop) => !excluded.has(crop.id));
  const selectedIds = selected.length === list.length ? undefined : selected.map((crop) => crop.id);
  const automated = list.filter((crop) => crop.automationEnabled).length;

  function toggleCrop(cropId: string) {
    setExcluded((current) => {
      const next = new Set(current);
      if (next.has(cropId)) next.delete(cropId);
      else next.add(cropId);
      return next;
    });
  }

  async function setAutomation(key: string, enabled: boolean, cropIds?: string[]) {
    setAutomationBusy(key);
    setAutomationError(null);
    try {
      const [only] = cropIds ?? [];
      if (cropIds?.length === 1 && only) await cropApi.setAutomation(only, enabled);
      else await cropApi.setAutomationBulk(enabled, cropIds);
      await crops.reload();
    } catch (caught) {
      setAutomationError(caught instanceof ApiError ? caught.message : "No se pudo cambiar el modo automático");
    } finally {
      setAutomationBusy(null);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void bulk.send("custom", { actuatorType: actuator, action, durationSeconds: action === "ACTIVATE" ? duration : null,
      cropIds: selectedIds });
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Todos tus cultivos a la vez" title="Control general" icon={<SlidersHorizontal size={24} />}
        description="Activa el modo automático o envía la misma orden a varias macetas sin entrar a cada una.">
        {list.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <HeaderStat label="Cultivos" value={list.length} />
            <HeaderStat label="En modo automático" value={automated} />
            <HeaderStat label="Seleccionados" value={selected.length} />
          </div>
        )}
      </PageHeader>

      {crops.error && <Alert tone="danger">{crops.error}</Alert>}
      {crops.loading && !crops.data ? <PageLoader /> : list.length === 0 ? (
        <EmptyState icon={<SlidersHorizontal size={26} />} title="Sin cultivos para controlar">
          Crea un cultivo para poder controlar sus actuadores desde aquí.
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold"><Bot size={18} className="text-leaf-700" /> Modo automático</h2>
                <p className="text-sm text-muted">El agente de IA actúa por su cuenta en los cultivos activados.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" loading={automationBusy === "all-on"} onClick={() => void setAutomation("all-on", true)}>
                  Activar en todos
                </Button>
                <Button size="sm" variant="secondary" loading={automationBusy === "all-off"}
                  onClick={() => void setAutomation("all-off", false)}>Desactivar</Button>
              </div>
            </div>
            {automationError && <div className="mt-3"><Alert tone="danger">{automationError}</Alert></div>}
            <ul className="mt-4 divide-y divide-line">
              {list.map((crop: Crop) => (
                <li key={crop.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{crop.name}</p>
                    <p className="text-xs text-muted">{CROP_TYPES[crop.type].label} · {crop.device.online ? "En línea" : "Desconectada"}</p>
                  </div>
                  <Switch checked={crop.automationEnabled} label={`Modo automático de ${crop.name}`}
                    disabled={automationBusy !== null}
                    onChange={(enabled) => void setAutomation(crop.id, enabled, [crop.id])} />
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Zap size={18} className="text-leaf-700" /> Órdenes en bloque</h2>
            <p className="text-sm text-muted">Elige los cultivos y la orden. Los que no tengan ese actuador se omiten.</p>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Cultivos</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {list.map((crop) => {
                  const on = !excluded.has(crop.id);
                  return (
                    <label key={crop.id} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm
                      ${on ? "border-leaf-600 bg-leaf-50 text-leaf-800" : "border-line text-muted"}`}>
                      <input type="checkbox" className="accent-leaf-700" checked={on} onChange={() => toggleCrop(crop.id)} />
                      {crop.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-5">
              <p className="text-sm font-semibold">Atajos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((quick) => (
                  <Button key={quick.label} size="sm" variant="secondary" disabled={selected.length === 0}
                    loading={bulk.sending === quick.label}
                    onClick={() => void bulk.send(quick.label, { ...quick, cropIds: selectedIds })}>
                    {quick.label}
                  </Button>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-surface p-4" noValidate>
              <div className="col-span-2">
                <SelectField label="Actuador" value={actuator} onChange={(event) => {
                  const next = event.target.value as ActuatorType;
                  setActuator(next);
                  setDuration(ACTUATORS[next].defaultSeconds ?? 15);
                }}>
                  {Object.entries(ACTUATORS).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
                </SelectField>
              </div>
              <SelectField label="Acción" value={action} onChange={(event) => setAction(event.target.value as CommandAction)}>
                <option value="ACTIVATE">Encender</option>
                <option value="DEACTIVATE">Apagar</option>
              </SelectField>
              <SelectField label="Duración" value={String(duration)} disabled={action === "DEACTIVATE"}
                onChange={(event) => setDuration(Number(event.target.value))}>
                {DURATIONS.map((seconds) => <option key={seconds} value={seconds}>{formatDuration(seconds)}</option>)}
              </SelectField>
              <Button type="submit" className="col-span-2" icon={<Send size={16} />} loading={bulk.sending === "custom"}
                disabled={selected.length === 0}>
                {describeAction(actuator, action, action === "ACTIVATE" ? duration : null)} en {selected.length}{" "}
                {selected.length === 1 ? "cultivo" : "cultivos"}
              </Button>
            </form>

            <div className="mt-4 space-y-3">
              {bulk.error && <Alert tone="danger">{bulk.error}</Alert>}
              {bulk.result && <BulkResultList result={bulk.result} />}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
