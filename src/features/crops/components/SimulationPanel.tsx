import { CloudSun, Hand, Pause, Play, SunMoon } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Alert, Badge } from "../../../components/ui/Feedback";
import { ApiError } from "../../../lib/api/client";
import { virtualDeviceApi } from "../../../lib/api/services";
import { METRICS, PRIMARY_METRICS } from "../../../lib/catalog";
import { formatMetric, timeAgo } from "../../../lib/format";
import type { CropProfile, Measures, MetricKey, VirtualDevice, VirtualMode } from "../../../lib/api/types";
import { LocationPicker, type PickedLocation } from "./LocationPicker";

const MODES: { id: VirtualMode; label: string; hint: string; icon: typeof CloudSun }[] = [
  { id: "AUTO", label: "Día y noche", hint: "Valores típicos de la especie con su ciclo diario.", icon: SunMoon },
  { id: "WEATHER", label: "Clima real", hint: "Sigue el clima del lugar que elijas: sol, nubes, lluvia y temperatura.", icon: CloudSun },
  { id: "MANUAL", label: "Manual", hint: "Mueve los medidores y mira cómo reacciona el asistente.", icon: Hand },
];

/** Escala de cada medidor, la misma de los sensores del firmware. */
const GAUGES: Record<MetricKey, { min: number; max: number; step: number }> = {
  temperature: { min: -5, max: 45, step: 0.5 },
  humidity: { min: 0, max: 100, step: 1 },
  soilMoisture: { min: 0, max: 100, step: 1 },
  brightness: { min: 0, max: 2000, step: 10 },
  ph: { min: 3, max: 10, step: 0.1 },
  tds: { min: 0, max: 3000, step: 10 },
  atmosphere: { min: 700, max: 1100, step: 1 },
};
const MANUAL_METRICS: MetricKey[] = [...PRIMARY_METRICS, "atmosphere"];

function startingGauges(device: VirtualDevice, profile: CropProfile | undefined): Measures {
  const values: Measures = {};
  for (const key of MANUAL_METRICS) {
    const range = profile?.ranges[key];
    values[key] = device.manual?.[key] ?? device.lastReading?.[key]
      ?? (range ? Math.round(((range.min + range.max) / 2) * 10) / 10 : key === "atmosphere" ? 1012 : GAUGES[key].min);
  }
  return values;
}

export function ModePicker({ value, onChange }: { value: VirtualMode; onChange: (mode: VirtualMode) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Modo de la simulación">
      {MODES.map(({ id, label, hint, icon: Icon }) => (
        <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)}
          className={`rounded-xl border p-3 text-left transition-colors ${value === id
            ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-white hover:bg-surface"}`}>
          <span className="flex items-center gap-2 font-semibold"><Icon size={16} className="text-leaf-700" />{label}</span>
          <span className="mt-1 block text-xs text-muted">{hint}</span>
        </button>
      ))}
    </div>
  );
}

interface SimulationPanelProps {
  cropId: string;
  simulation: VirtualDevice;
  profile: CropProfile | undefined;
  onSaved: (simulation: VirtualDevice) => void;
  onPaused: () => void;
}

/** Controles de la simulación de un cultivo virtual: modo, lugar, medidores, frecuencia y pausa. */
export function SimulationPanel({ cropId, simulation, profile, onSaved, onPaused }: SimulationPanelProps) {
  const [mode, setMode] = useState<VirtualMode>(simulation.mode ?? "AUTO");
  const [location, setLocation] = useState<PickedLocation | null>(simulation.location ?? null);
  const [gauges, setGauges] = useState<Measures>(() => startingGauges(simulation, profile));
  const [interval, setIntervalSeconds] = useState(simulation.intervalSeconds ?? 30);
  const [busy, setBusy] = useState<"save" | "pause" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (mode === "WEATHER" && !location) {
      setError("Elige el lugar cuyo clima seguirá el cultivo.");
      return;
    }
    setBusy("save");
    setError(null);
    try {
      onSaved(await virtualDeviceApi.configure(cropId, {
        mode,
        intervalSeconds: interval,
        ...(location ? { location } : {}),
        ...(mode === "MANUAL" ? { manual: gauges } : {}),
      }));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo guardar la simulación");
    } finally {
      setBusy(null);
    }
  }

  async function pause() {
    setBusy("pause");
    setError(null);
    try {
      await virtualDeviceApi.pause(cropId);
      onPaused();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo pausar la simulación");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card space-y-4 p-5" aria-labelledby="simulation-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="simulation-title" className="text-lg font-semibold">Simulación</h2>
          {simulation.active ? (
            <Badge tone={simulation.connected ? "success" : "warning"}>
              {simulation.connected ? "En marcha" : simulation.running ? "Conectando…" : "Reiniciando"}
            </Badge>
          ) : <Badge tone="neutral">En pausa</Badge>}
        </div>
        {simulation.active && (
          <Button size="sm" variant="secondary" icon={<Pause size={14} />} loading={busy === "pause"}
            onClick={() => void pause()}>Pausar</Button>
        )}
      </div>
      <p className="text-sm text-muted">
        SmartPot publica las lecturas de este cultivo virtual con su propia cuenta en el broker: pasan por la IA, las
        alertas y el modo automático igual que las de un dispositivo real, y los actuadores responden a tus órdenes.
      </p>
      {simulation.active && (
        <p className="text-sm">
          Última lectura {timeAgo(simulation.lastPublishedAt)} · cada {simulation.intervalSeconds} s
          {simulation.lastCommand && ` · último comando: ${simulation.lastCommand.message} (${timeAgo(simulation.lastCommand.at)})`}
        </p>
      )}
      {error && <Alert tone="danger">{error}</Alert>}

      <ModePicker value={mode} onChange={setMode} />
      {mode === "WEATHER" && <LocationPicker value={location} onChange={setLocation} />}
      {mode === "MANUAL" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {MANUAL_METRICS.map((key) => {
            const scale = GAUGES[key];
            const range = profile?.ranges[key];
            const value = gauges[key] ?? scale.min;
            return (
              <label key={key} className="block text-sm">
                <span className="flex justify-between gap-2">
                  <span className="font-semibold">{METRICS[key].label}</span>
                  <span className="tabular-nums">{formatMetric(key, value)}</span>
                </span>
                <input type="range" min={scale.min} max={scale.max} step={scale.step} value={value}
                  onChange={(event) => setGauges((previous) => ({ ...previous, [key]: Number(event.target.value) }))}
                  className="mt-1 w-full accent-leaf-700" aria-label={METRICS[key].label} />
                {range && <span className="text-xs text-muted">Ideal: {range.min}–{range.max} {range.unit}</span>}
              </label>
            );
          })}
        </div>
      )}

      <label className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">Una lectura cada</span>
        <select value={interval} onChange={(event) => setIntervalSeconds(Number(event.target.value))}
          className="h-9 rounded-lg border border-line bg-white px-2">
          {[15, 30, 60, 120].map((seconds) => <option key={seconds} value={seconds}>{seconds} s</option>)}
        </select>
      </label>

      <Button icon={<Play size={16} />} loading={busy === "save"} onClick={() => void save()}>
        {simulation.active ? "Aplicar cambios" : "Reanudar simulación"}
      </Button>
    </section>
  );
}
