import {
  CloudFog, Droplets, Fan, FlaskConical, Lightbulb, type LucideIcon, PauseCircle, Play, PlugZap, Power, PowerOff,
  ServerOff, TestTubeDiagonal, WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Alert, Badge, EmptyState } from "../../../components/ui/Feedback";
import { PageLoader } from "../../../components/ui/Spinner";
import { useResource } from "../../../hooks/useResource";
import { ApiError } from "../../../lib/api/client";
import { commandApi, virtualDeviceApi } from "../../../lib/api/services";
import { ACTUATORS, CROP_FORMS, CROP_TYPES, PRIMARY_METRICS } from "../../../lib/catalog";
import { formatMetric, timeAgo } from "../../../lib/format";
import type { Actuator, ActuatorType, Command, Crop, CropProfile, VirtualDevice } from "../../../lib/api/types";
import { isDaylight, liveStatus, runningActuators, vigorOf } from "../live";
import { MetricTile } from "./MetricTile";
import { CropScene } from "./scene/CropScene";
import { SimulationPanel } from "./SimulationPanel";

const ICONS: Record<ActuatorType, LucideIcon> = {
  WATER_PUMP: Droplets,
  UV_LIGHT: Lightbulb,
  FAN: Fan,
  HUMIDIFIER: CloudFog,
  NUTRIENT_DOSER: FlaskConical,
  PH_DOSER: TestTubeDiagonal,
};

function duration(seconds: number): string {
  return seconds >= 60 ? `${seconds / 60} min` : `${seconds} s`;
}

interface LivePanelProps {
  crop: Crop;
  profile: CropProfile | undefined;
  actuators: Actuator[];
  commands: Command[];
  onChanged: () => void;
  onOpenDevice: () => void;
}

/**
 * El cultivo en vivo, real o virtual: su forma con la especie, el entorno y cada actuador encendido o apagado.
 * Solo se ilustra lo conectado. Un cultivo virtual suma aquí los controles de su simulación.
 */
export function LivePanel({ crop, profile, actuators, commands, onChanged, onOpenDevice }: LivePanelProps) {
  const virtual = crop.kind === "VIRTUAL";
  const simulation = useResource<VirtualDevice | null>(
    () => (virtual ? virtualDeviceApi.get(crop.id) : Promise.resolve(null)), [crop.id, virtual], virtual ? 10_000 : undefined);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Los encendidos por tiempo se apagan solos: la escena se revisa cada pocos segundos.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(timer);
  }, []);

  if (virtual && simulation.loading && !simulation.data) return <PageLoader />;

  const sim = simulation.data ?? null;
  const status = liveStatus(crop, sim);
  const measures = crop.latestReading?.measures ?? sim?.lastReading ?? undefined;
  const weather = sim?.active && sim.mode === "WEATHER" ? sim.weather : null;
  const running = runningActuators(actuators, commands, sim?.activeActuators ?? [], now);
  const day = isDaylight(weather, measures);
  const connected = status === "live" || status === "waiting";
  const on = actuators.filter((actuator) => running.has(actuator.type));
  const place = weather ? `${weather.label.toLowerCase()} en ${sim?.location?.name ?? "el lugar elegido"}` : "bajo techo";
  const label = `${CROP_TYPES[crop.type].label} ${CROP_FORMS[crop.form].phrase}, ${place}, `
    + `${day ? "de día" : "de noche"}; ${on.length > 0
      ? `encendidos: ${on.map((actuator) => ACTUATORS[actuator.type].label.toLowerCase()).join(", ")}`
      : "actuadores apagados"}`;

  async function send(actuator: Actuator, action: "ACTIVATE" | "DEACTIVATE") {
    const key = `${actuator.id}-${action}`;
    setBusy(key);
    setError(null);
    try {
      await commandApi.send(crop.id, actuator.id, action,
        action === "ACTIVATE" ? ACTUATORS[actuator.type].defaultSeconds : null);
      onChanged();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo enviar la orden");
    } finally {
      setBusy(null);
    }
  }

  async function resume() {
    if (!sim) return;
    setBusy("resume");
    setError(null);
    try {
      simulation.setData(await virtualDeviceApi.configure(crop.id, {
        mode: sim.mode ?? "AUTO",
        intervalSeconds: sim.intervalSeconds ?? 30,
        ...(sim.location ? { location: sim.location } : {}),
        ...(sim.mode === "MANUAL" && sim.manual ? { manual: sim.manual } : {}),
      }));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo reanudar la simulación");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="card grid gap-5 p-5 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {connected ? (
            <div className="relative">
              <CropScene form={crop.form} type={crop.type} installed={actuators.map((actuator) => actuator.type)}
                running={running} condition={weather?.condition} isDay={day} vigor={vigorOf(crop.health?.level)}
                moisture={measures?.soilMoisture} label={label} />
              {status === "waiting" && (
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-leaf-800 shadow">
                  Esperando la primera lectura…
                </span>
              )}
            </div>
          ) : status === "paused" ? (
            <EmptyState icon={<PauseCircle size={26} />} title="La simulación está en pausa"
              action={<Button icon={<Play size={16} />} loading={busy === "resume"} onClick={() => void resume()}>Reanudar</Button>}>
              Sin lecturas no hay nada que ilustrar. Reanúdala y el cultivo vuelve a crecer aquí.
            </EmptyState>
          ) : status === "unavailable" ? (
            <EmptyState icon={<ServerOff size={26} />} title="El simulador no está disponible">
              Este servidor no tiene el simulador de cultivos virtuales encendido. Tus datos siguen guardados.
            </EmptyState>
          ) : virtual ? (
            <EmptyState icon={<PlugZap size={26} />} title="Conectando la simulación…">
              En unos segundos el cultivo virtual publica su primera lectura y aparece aquí.
            </EmptyState>
          ) : (
            <EmptyState icon={<WifiOff size={26} />} title="Tu cultivo no está conectado"
              action={<Button variant="secondary" onClick={onOpenDevice}>Ver cómo conectarlo</Button>}>
              Sin conexión no hay nada que ilustrar. Enciende el ESP32 o la simulación de Wokwi; la última señal
              llegó {timeAgo(crop.device.lastSeenAt)}.
            </EmptyState>
          )}
          {connected && (
            <p className="mt-2 text-sm text-muted">
              {weather ? (
                <>
                  {weather.label} en <strong className="text-ink">{sim?.location?.name}</strong> · {weather.temperature.toFixed(1)} °C ·
                  humedad {Math.round(weather.humidity)} % · nubes {Math.round(weather.cloudCover)} %
                  {weather.precipitation > 0 && ` · lluvia ${weather.precipitation.toFixed(1)} mm`}
                </>
              ) : (
                <>
                  Bajo techo · {day ? "de día" : "de noche"}
                  {measures?.brightness != null && ` · luz ${formatMetric("brightness", measures.brightness)}`}
                  {measures?.temperature != null && ` · ${formatMetric("temperature", measures.temperature)}`}
                </>
              )}
            </p>
          )}
          {sim?.weatherError && <p className="mt-1 text-xs text-clay-600">{sim.weatherError}</p>}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Actuadores</h2>
            <Badge tone={virtual ? "info" : "success"}>{virtual ? "Virtual" : "Real"}</Badge>
            <Badge>{CROP_FORMS[crop.form].label}</Badge>
          </div>
          {error && <Alert tone="danger">{error}</Alert>}
          <ul className="divide-y divide-line">
            {actuators.map((actuator) => {
              const info = ACTUATORS[actuator.type];
              const Icon = ICONS[actuator.type];
              const active = running.has(actuator.type);
              return (
                <li key={actuator.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active
                      ? "bg-leaf-700 text-white" : "bg-surface text-muted"}`}>
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{info.label}</span>
                      <span className={`block text-xs ${active ? "font-semibold text-leaf-700" : "text-muted"}`}>
                        {active ? "Encendido" : "Apagado"}
                      </span>
                    </span>
                  </span>
                  {active ? (
                    <Button size="sm" variant="secondary" icon={<PowerOff size={14} />} disabled={!connected}
                      className="shrink-0 whitespace-nowrap"
                      loading={busy === `${actuator.id}-DEACTIVATE`} onClick={() => void send(actuator, "DEACTIVATE")}>
                      Apagar
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" icon={<Power size={14} />} disabled={!connected}
                      className="shrink-0 whitespace-nowrap"
                      loading={busy === `${actuator.id}-ACTIVATE`} onClick={() => void send(actuator, "ACTIVATE")}>
                      {info.defaultSeconds ? duration(info.defaultSeconds) : "Encender"}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
          {actuators.length === 0 && <p className="text-sm text-muted">Este cultivo no tiene actuadores.</p>}
          <p className="text-xs text-muted">
            {connected
              ? "Cada orden llega por MQTT y la escena cambia cuando el dispositivo la confirma."
              : "Las órdenes se habilitan cuando el cultivo está conectado."}
          </p>
        </div>
      </section>

      {connected && measures && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {PRIMARY_METRICS.map((key) => (
            <MetricTile key={key} metric={key} value={measures[key]} range={profile?.ranges[key]} />
          ))}
        </div>
      )}

      {virtual && sim?.available && (
        // La llave reinicia el formulario con lo guardado cada vez que cambia la configuración.
        <SimulationPanel key={`${sim.active}-${sim.updatedAt ?? ""}`} cropId={crop.id} simulation={sim} profile={profile}
          onSaved={(saved) => simulation.setData(saved)} onPaused={() => void simulation.reload()} />
      )}
      {virtual && simulation.error && <Alert tone="danger">{simulation.error}</Alert>}
    </div>
  );
}
