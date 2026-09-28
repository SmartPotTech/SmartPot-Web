import {
  CloudFog, Droplets, Fan, FlaskConical, Lightbulb, type LucideIcon, PauseCircle, PlugZap, ServerOff, TestTubeDiagonal,
  WifiOff,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ACTUATORS, CROP_FORMS, CROP_TYPES } from "../../../lib/catalog";
import { formatMetric, timeAgo } from "../../../lib/format";
import type { Actuator, ActuatorType, Command, Crop, VirtualDevice } from "../../../lib/api/types";
import { isDaylight, liveStatus, runningActuators, vigorOf } from "../live";
import { CropScene } from "./scene/CropScene";

const ICONS: Record<ActuatorType, LucideIcon> = {
  WATER_PUMP: Droplets,
  UV_LIGHT: Lightbulb,
  FAN: Fan,
  HUMIDIFIER: CloudFog,
  NUTRIENT_DOSER: FlaskConical,
  PH_DOSER: TestTubeDiagonal,
};

interface CropHeroProps {
  crop: Crop;
  actuators: Actuator[];
  commands: Command[];
  /** Solo en los virtuales: estado de la simulación (clima, conexión y actuadores del simulador). */
  simulation?: VirtualDevice | null;
  onOpenTab: (tab: string) => void;
}

function Unlit({ icon, title, children, link }: { icon: ReactNode; title: string; children: ReactNode;
  link?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex aspect-[36/22] w-full flex-col items-center justify-center gap-2 bg-surface px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700">{icon}</span>
      <p className="font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-muted">{children}</p>
      {link && (
        <button type="button" onClick={link.onClick} className="text-sm font-semibold text-water-700 hover:underline">
          {link.label}
        </button>
      )}
    </div>
  );
}

/**
 * La ilustración del cultivo, fija sobre todas sus secciones: su forma con la especie, el entorno y cada actuador
 * encendido o apagado. Solo muestra; las órdenes se dan en Control. Si el cultivo no está conectado no se dibuja.
 */
export function CropHero({ crop, actuators, commands, simulation, onOpenTab }: CropHeroProps) {
  const [now, setNow] = useState(() => Date.now());

  // Los encendidos por tiempo se apagan solos: la escena se revisa cada pocos segundos.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(timer);
  }, []);

  const virtual = crop.kind === "VIRTUAL";
  const status = liveStatus(crop, simulation);
  const measures = crop.latestReading?.measures ?? simulation?.lastReading ?? undefined;
  const weather = simulation?.active && simulation.mode === "WEATHER" ? simulation.weather : null;
  const running = runningActuators(actuators, commands, simulation?.activeActuators ?? [], now);
  const day = isDaylight(weather, measures);
  const connected = status === "live" || status === "waiting";
  const species = `${CROP_TYPES[crop.type].label} ${CROP_FORMS[crop.form].phrase}`;
  const on = actuators.filter((actuator) => running.has(actuator.type));
  const place = weather ? `${weather.label.toLowerCase()} en ${simulation?.location?.name ?? "el lugar elegido"}` : "bajo techo";
  const label = `${species}, ${place}, ${day ? "de día" : "de noche"}; ${on.length > 0
    ? `encendidos: ${on.map((actuator) => ACTUATORS[actuator.type].label.toLowerCase()).join(", ")}`
    : "actuadores apagados"}`;

  return (
    <section className="card overflow-hidden" aria-label="Ilustración del cultivo">
      <div className="grid md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="relative">
          {connected ? (
            <>
              <CropScene form={crop.form} type={crop.type} installed={actuators.map((actuator) => actuator.type)}
                running={running} condition={weather?.condition} isDay={day} vigor={vigorOf(crop.health?.level)}
                moisture={measures?.soilMoisture} label={label} />
              {status === "waiting" && (
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-leaf-800 shadow">
                  Esperando la primera lectura…
                </span>
              )}
            </>
          ) : status === "paused" ? (
            <Unlit icon={<PauseCircle size={24} />} title="La simulación está en pausa"
              link={{ label: "Ir a Simulación", onClick: () => onOpenTab("simulation") }}>
              Sin lecturas no hay nada que ilustrar. Reanúdala y el cultivo vuelve a crecer aquí.
            </Unlit>
          ) : status === "unavailable" ? (
            <Unlit icon={<ServerOff size={24} />} title="El simulador no está disponible">
              Este servidor no tiene el simulador de cultivos virtuales encendido. Tus datos siguen guardados.
            </Unlit>
          ) : virtual ? (
            <Unlit icon={<PlugZap size={24} />} title="Conectando la simulación…">
              En unos segundos el cultivo publica su primera lectura y aparece aquí.
            </Unlit>
          ) : (
            <Unlit icon={<WifiOff size={24} />} title="Tu cultivo no está conectado"
              link={{ label: "Ver cómo conectarlo", onClick: () => onOpenTab("device") }}>
              Sin conexión no hay nada que ilustrar. La última señal llegó {timeAgo(crop.device.lastSeenAt)}.
            </Unlit>
          )}
        </div>

        <div className="space-y-4 border-t border-line p-5 md:border-l md:border-t-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-leaf-700">{virtual ? "Cultivo virtual" : "Cultivo real"}</p>
            <p className="mt-0.5 font-display text-lg font-semibold">{species}</p>
            {connected && (
              <p className="mt-1 text-sm text-muted">
                {weather ? (
                  <>
                    {weather.label} en <strong className="text-ink">{simulation?.location?.name}</strong> ·{" "}
                    {weather.temperature.toFixed(1)} °C · humedad {Math.round(weather.humidity)} %
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
            {simulation?.weatherError && <p className="mt-1 text-xs text-clay-600">{simulation.weatherError}</p>}
          </div>

          {actuators.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Estado de los actuadores">
              {actuators.map((actuator) => {
                const Icon = ICONS[actuator.type];
                const active = connected && running.has(actuator.type);
                return (
                  <li key={actuator.id} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${active
                    ? "bg-leaf-700 font-semibold text-white" : "bg-surface text-muted"}`}>
                    <Icon size={13} className="shrink-0" />
                    <span>{ACTUATORS[actuator.type].label}</span>
                    <span className={active ? "text-leaf-100" : "text-muted"}>· {active ? "encendido" : "apagado"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
