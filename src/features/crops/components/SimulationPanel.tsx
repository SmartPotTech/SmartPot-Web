import {CloudSun, Hand, Pause, PauseCircle, Play, PlayCircle, Save, SunMoon} from "lucide-react";
import {useState} from "react";
import {Button} from "../../../components/ui/Button";
import {Alert} from "../../../components/ui/Feedback";
import {ApiError} from "../../../lib/api/client";
import {virtualDeviceApi} from "../../../lib/api/services";
import {describePlacement, METRICS, PRIMARY_METRICS} from "../../../lib/catalog";
import {formatMetric, timeAgo} from "../../../lib/format";
import type {
    Crop,
    CropProfile,
    Measures,
    MetricKey,
    VirtualDevice,
    VirtualDeviceRequest,
    VirtualMode
} from "../../../lib/api/types";
import {LocationPicker, type PickedLocation} from "./LocationPicker";

const MODES: { id: VirtualMode; label: string; hint: string; icon: typeof CloudSun }[] = [
    {id: "AUTO", label: "Día y noche", hint: "Valores típicos de la especie con su ciclo diario.", icon: SunMoon},
    {
        id: "WEATHER",
        label: "Clima real",
        hint: "Sigue el clima del lugar que elijas: sol, nubes, lluvia y temperatura.",
        icon: CloudSun
    },
    {id: "MANUAL", label: "Manual", hint: "Mueve los medidores y mira cómo reacciona el asistente.", icon: Hand},
];

/** Escala de cada medidor, la misma de los sensores del firmware. */
const GAUGES: Record<MetricKey, { min: number; max: number; step: number }> = {
    temperature: {min: -5, max: 45, step: 0.5},
    humidity: {min: 0, max: 100, step: 1},
    soilMoisture: {min: 0, max: 100, step: 1},
    brightness: {min: 0, max: 2000, step: 10},
    ph: {min: 3, max: 10, step: 0.1},
    tds: {min: 0, max: 3000, step: 10},
    atmosphere: {min: 700, max: 1100, step: 1},
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

export function ModePicker({value, onChange}: { value: VirtualMode; onChange: (mode: VirtualMode) => void }) {
    return (
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Modo de la simulación">
            {MODES.map(({id, label, hint, icon: Icon}) => (
                <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)}
                        className={`rounded-xl border p-3 text-left transition-colors ${value === id
                            ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-white hover:bg-surface"}`}>
                    <span className="flex items-center gap-2 font-semibold"><Icon size={16}
                                                                                  className="text-leaf-700"/>{label}</span>
                    <span className="mt-1 block text-xs text-muted">{hint}</span>
                </button>
            ))}
        </div>
    );
}

interface SimulationPanelProps {
    crop: Crop;
    simulation: VirtualDevice;
    profile: CropProfile | undefined;
    onSaved: (simulation: VirtualDevice) => void;
    onPaused: () => void;
    onOpenTab: (tab: string) => void;
}

/**
 * La simulación de un cultivo virtual, el equivalente a la pestaña Dispositivo de uno real: arriba su estado con
 * los botones para pausarla o reanudarla, independientes de la configuración; abajo cómo se simula (modo, lugar,
 * medidores y frecuencia), que se guarda con «Aplicar cambios».
 */
export function SimulationPanel({crop, simulation, profile, onSaved, onPaused, onOpenTab}: SimulationPanelProps) {
    const [mode, setMode] = useState<VirtualMode>(simulation.mode ?? "AUTO");
    const [location, setLocation] = useState<PickedLocation | null>(simulation.location ?? null);
    const [gauges, setGauges] = useState<Measures>(() => startingGauges(simulation, profile));
    const [interval, setIntervalSeconds] = useState(simulation.intervalSeconds ?? 30);
    const [busy, setBusy] = useState<"save" | "pause" | "resume" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const place = describePlacement({...crop.placement, location: null});

    async function configure(key: "save" | "resume", body: VirtualDeviceRequest) {
        if (body.mode === "WEATHER" && !body.location && !simulation.location) {
            setError("Elige el lugar cuyo clima seguirá el cultivo.");
            return;
        }
        setBusy(key);
        setError(null);
        setSaved(false);
        try {
            onSaved(await virtualDeviceApi.configure(crop.id, body));
            if (key === "save") setSaved(true);
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : "No se pudo guardar la simulación");
        } finally {
            setBusy(null);
        }
    }

    /** Reanuda con lo que estaba guardado, sin tocar lo que se esté editando abajo. */
    function resume() {
        void configure("resume", {
            mode: simulation.mode ?? "AUTO",
            intervalSeconds: simulation.intervalSeconds ?? 30,
            ...(simulation.location ? {location: simulation.location} : {}),
        });
    }

    function apply() {
        void configure("save", {
            mode,
            intervalSeconds: interval,
            ...(location ? {location} : {}),
            ...(mode === "MANUAL" ? {manual: gauges} : {}),
        });
    }

    async function pause() {
        setBusy("pause");
        setError(null);
        try {
            await virtualDeviceApi.pause(crop.id);
            onPaused();
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : "No se pudo pausar la simulación");
        } finally {
            setBusy(null);
        }
    }

    const active = simulation.active;
    const state = !active ? "Simulación en pausa" : simulation.connected ? "Simulación en marcha"
        : simulation.running ? "Conectando la simulación…" : "Reiniciando la simulación…";

    return (
        <div className="space-y-5">
            <section className="card flex flex-wrap items-center justify-between gap-4 p-5"
                     aria-label="Estado de la simulación">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${active && simulation.connected
                            ? "bg-leaf-50 text-leaf-700" : "bg-surface text-muted"}`}>
                        {active ? <PlayCircle size={22}/> : <PauseCircle size={22}/>}
                    </div>
                    <div>
                        <p className="font-semibold">{state}</p>
                        <p className="text-sm text-muted">
                            {active
                                ? <>Última lectura {timeAgo(simulation.lastPublishedAt)} ·
                                    cada {simulation.intervalSeconds} s
                                    {simulation.lastCommand && ` · última orden: ${simulation.lastCommand.message}`}</>
                                : "No publica lecturas; su configuración sigue guardada."}
                        </p>
                    </div>
                </div>
                {active ? (
                    <Button variant="secondary" icon={<Pause size={16}/>} loading={busy === "pause"}
                            onClick={() => void pause()}>
                        Pausar
                    </Button>
                ) : (
                    <Button icon={<Play size={16}/>} loading={busy === "resume"} onClick={resume}>Reanudar</Button>
                )}
            </section>

            {error && <Alert tone="danger">{error}</Alert>}

            <section className="card space-y-4 p-5" aria-labelledby="simulation-title">
                <div>
                    <h3 id="simulation-title" className="font-semibold">Cómo se simula</h3>
                    <p className="mt-1 text-sm text-muted">
                        SmartPot publica las lecturas de este cultivo virtual con su propia cuenta en el broker: pasan
                        por la IA, las
                        alertas y el modo automático igual que las de un dispositivo real. En todos los modos, lo que
                        enciendes en
                        Control (o el asistente) cambia las lecturas: el ventilador enfría, el humidificador humedece,
                        la luz
                        ultravioleta ilumina y la bomba moja el sustrato.
                    </p>
                </div>

                <ModePicker value={mode} onChange={setMode}/>
                {mode === "WEATHER" && (
                    <div className="space-y-2">
                        <p className="text-sm">
                            El clima llega {place ?
                            <strong>{place}</strong> : "como si estuviera al aire libre a pleno sol"}: bajo techo
                            se amortigua y la sombra baja la luz y el calor.{" "}
                            <button type="button" onClick={() => onOpenTab("settings")}
                                    className="font-semibold text-water-700 hover:underline">Cambiar dónde está
                            </button>
                        </p>
                        <LocationPicker value={location} onChange={setLocation}/>
                    </div>
                )}
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
                                           onChange={(event) => setGauges((previous) => ({
                                               ...previous,
                                               [key]: Number(event.target.value)
                                           }))}
                                           className="mt-1 w-full accent-leaf-700" aria-label={METRICS[key].label}/>
                                    {range && <span
                                        className="text-xs text-muted">Ideal: {range.min}–{range.max} {range.unit}</span>}
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

                <div className="flex flex-wrap items-center gap-3">
                    <Button icon={<Save size={16}/>} loading={busy === "save"} onClick={apply}>
                        {active ? "Aplicar cambios" : "Aplicar y reanudar"}
                    </Button>
                    {saved && <span className="text-sm text-leaf-700">Cambios aplicados</span>}
                </div>
            </section>
        </div>
    );
}
