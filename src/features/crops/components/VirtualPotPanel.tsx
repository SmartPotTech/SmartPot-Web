import { CloudSun, Hand, Power, RefreshCw, SunMoon } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Alert, Badge } from "../../../components/ui/Feedback";
import { PageLoader } from "../../../components/ui/Spinner";
import { useResource } from "../../../hooks/useResource";
import { ApiError } from "../../../lib/api/client";
import { virtualDeviceApi } from "../../../lib/api/services";
import { ACTUATORS, METRICS, PRIMARY_METRICS } from "../../../lib/catalog";
import { formatMetric, timeAgo } from "../../../lib/format";
import type { CropProfile, Measures, MetricKey, VirtualDevice, VirtualMode } from "../../../lib/api/types";
import { LocationPicker, type PickedLocation } from "./LocationPicker";
import { MetricTile } from "./MetricTile";
import { WeatherScene } from "./WeatherScene";

const MODES: { id: VirtualMode; label: string; hint: string; icon: typeof CloudSun }[] = [
  { id: "WEATHER", label: "Clima real", hint: "Sigue el clima del lugar que elijas: sol, nubes, lluvia y temperatura.", icon: CloudSun },
  { id: "MANUAL", label: "Manual", hint: "Mueve los medidores y mira cómo reacciona el asistente.", icon: Hand },
  { id: "AUTO", label: "Día y noche", hint: "Valores típicos de la especie con su ciclo diario.", icon: SunMoon },
];

/** Escala de cada medidor, la misma de los sensores de la maceta. */
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

function startingGauges(device: VirtualDevice | undefined, profile: CropProfile | undefined): Measures {
  const values: Measures = {};
  for (const key of MANUAL_METRICS) {
    const range = profile?.ranges[key];
    values[key] = device?.manual?.[key] ?? device?.lastReading?.[key]
      ?? (range ? Math.round(((range.min + range.max) / 2) * 10) / 10 : key === "atmosphere" ? 1012 : GAUGES[key].min);
  }
  return values;
}

export function VirtualPotPanel({ cropId, profile }: { cropId: string; profile: CropProfile | undefined }) {
  const device = useResource(() => virtualDeviceApi.get(cropId), [cropId], 10_000);
  const current = device.data;
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (device.loading && !current) return <PageLoader />;
  if (!current) return <Alert tone="danger">{device.error ?? "No se pudo cargar la maceta virtual"}</Alert>;
  if (!current.available) {
    return (
      <Alert tone="info" title="Macetas virtuales no disponibles">
        Este servidor no tiene el simulador de macetas. Puedes conectar una maceta física o probar el firmware en Wokwi
        con los datos de la pestaña Dispositivo.
      </Alert>
    );
  }

  async function stop() {
    setStopping(true);
    setError(null);
    try {
      await virtualDeviceApi.stop(cropId);
      await device.reload();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo apagar");
    } finally {
      setStopping(false);
    }
  }

  const weather = current.active && current.mode === "WEATHER" ? current.weather : null;
  const actuators = current.activeActuators.map((item) => item.actuator);
  const sceneLabel = weather
    ? `${weather.label}, ${weather.isDay ? "de día" : "de noche"}, en ${current.location?.name ?? "el lugar elegido"}`
    : current.active ? "Maceta virtual bajo techo" : "Maceta virtual apagada";

  return (
    <div className="space-y-5">
      <section className="card grid gap-5 p-5 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <WeatherScene condition={weather?.condition} isDay={weather?.isDay ?? true} label={sceneLabel}
            active={actuators} />
          {weather && (
            <p className="mt-2 text-sm text-muted">
              {weather.label} en <strong className="text-ink">{current.location?.name}</strong> · {weather.temperature.toFixed(1)} °C ·
              humedad {Math.round(weather.humidity)} % · nubes {Math.round(weather.cloudCover)} %
              {weather.precipitation > 0 && ` · lluvia ${weather.precipitation.toFixed(1)} mm`}
            </p>
          )}
          {current.weatherError && <p className="mt-1 text-xs text-clay-600">{current.weatherError}</p>}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Maceta virtual</h2>
            {current.active ? (
              <Badge tone={current.connected ? "success" : "warning"}>
                {current.connected ? "Conectada" : current.running ? "Conectando…" : "Reiniciando"}
              </Badge>
            ) : <Badge tone="neutral">Apagada</Badge>}
          </div>
          <p className="text-sm text-muted">
            Una maceta simulada siempre encendida que usa las credenciales de este cultivo: sus lecturas pasan por la
            IA y el modo automático como las de una maceta real. Si tienes una maceta física conectada, apágala antes.
          </p>
          {current.active && (
            <p className="text-sm">
              Última lectura {timeAgo(current.lastPublishedAt)} · cada {current.intervalSeconds} s
            </p>
          )}
          {actuators.length > 0 && (
            <p className="text-sm">Encendidos: {actuators.map((type) => ACTUATORS[type]?.label ?? type).join(", ")}</p>
          )}
          {current.lastCommand && (
            <p className="text-xs text-muted">Último comando: {current.lastCommand.message} ({timeAgo(current.lastCommand.at)})</p>
          )}
          {error && <Alert tone="danger">{error}</Alert>}
          {current.active && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" icon={<RefreshCw size={14} />} onClick={() => void device.reload()}>
                Actualizar
              </Button>
              <Button size="sm" variant="danger" icon={<Power size={14} />} loading={stopping}
                onClick={() => void stop()}>Apagar</Button>
            </div>
          )}
        </div>
      </section>

      {current.active && current.lastReading && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {PRIMARY_METRICS.map((key) => (
            <MetricTile key={key} metric={key} value={current.lastReading?.[key]} range={profile?.ranges[key]} />
          ))}
        </div>
      )}

      {/* La llave reinicia el formulario con lo guardado cada vez que cambia la configuración. */}
      <VirtualPotForm key={`${current.active}-${current.updatedAt ?? ""}`} cropId={cropId} device={current}
        profile={profile} onSaved={(saved) => device.setData(saved)} />
    </div>
  );
}

function VirtualPotForm({ cropId, device, profile, onSaved }: { cropId: string; device: VirtualDevice;
  profile: CropProfile | undefined; onSaved: (device: VirtualDevice) => void }) {
  const current = device;
  const [mode, setMode] = useState<VirtualMode>(device.mode ?? "WEATHER");
  const [location, setLocation] = useState<PickedLocation | null>(device.location ?? null);
  const [gauges, setGauges] = useState<Measures>(() => startingGauges(device, profile));
  const [interval, setIntervalSeconds] = useState(device.intervalSeconds ?? 30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (mode === "WEATHER" && !location) {
      setError("Elige el lugar cuyo clima seguirá la maceta.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onSaved(await virtualDeviceApi.configure(cropId, {
        mode,
        intervalSeconds: interval,
        ...(location ? { location } : {}),
        ...(mode === "MANUAL" ? { manual: gauges } : {}),
      }));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo guardar la maceta virtual");
      setBusy(false);
    }
  }

  return (
    <section className="card space-y-4 p-5" aria-labelledby="virtual-config">
      <h2 id="virtual-config" className="text-lg font-semibold">{current.active ? "Cambiar la maceta" : "Encender una maceta virtual"}</h2>
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Modo de la maceta virtual">
        {MODES.map(({ id, label, hint, icon: Icon }) => (
          <button key={id} type="button" role="radio" aria-checked={mode === id} onClick={() => setMode(id)}
            className={`rounded-xl border p-3 text-left transition-colors ${mode === id
              ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-white hover:bg-surface"}`}>
            <span className="flex items-center gap-2 font-semibold"><Icon size={16} className="text-leaf-700" />{label}</span>
            <span className="mt-1 block text-xs text-muted">{hint}</span>
          </button>
        ))}
      </div>

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

      <Button icon={<Power size={16} />} loading={busy} onClick={() => void save()}>
        {current.active ? "Aplicar cambios" : "Encender maceta virtual"}
      </Button>
    </section>
  );
}
