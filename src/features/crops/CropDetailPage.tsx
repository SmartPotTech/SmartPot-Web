import { ArrowLeft, FileDown } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Button } from "../../components/ui/Button";
import { Alert, Badge } from "../../components/ui/Feedback";
import { PageLoader } from "../../components/ui/Spinner";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useResource } from "../../hooks/useResource";
import { ApiError } from "../../lib/api/client";
import { actuatorApi, commandApi, cropApi, insightApi, readingApi, virtualDeviceApi } from "../../lib/api/services";
import { CROP_FORMS, CROP_TYPES, HEALTH, METRICS, PRIMARY_METRICS } from "../../lib/catalog";
import { formatMetric, timeAgo } from "../../lib/format";
import type { CropKind, MetricKey, VirtualDevice } from "../../lib/api/types";
import { ControlPanel } from "./components/ControlPanel";
import { DevicePanel } from "./components/DevicePanel";
import { CropHero } from "./components/CropHero";
import { InsightPanel } from "./components/InsightPanel";
import { MetricTile } from "./components/MetricTile";
import { ReadingsChart } from "./components/ReadingsChart";
import { SettingsPanel } from "./components/SettingsPanel";
import { SimulationPanel } from "./components/SimulationPanel";
import { useCropProfiles } from "./useCropProfiles";

/** Los reales se configuran en Dispositivo; los virtuales, en Simulación. */
const TABS: { id: string; label: string; only?: CropKind }[] = [
  { id: "summary", label: "Resumen" },
  { id: "assistant", label: "Asistente IA" },
  { id: "control", label: "Control" },
  { id: "history", label: "Historial" },
  { id: "device", label: "Dispositivo", only: "REAL" },
  { id: "simulation", label: "Simulación", only: "VIRTUAL" },
  { id: "settings", label: "Ajustes" },
];

/** Enlaces antiguos: la ilustración ya vive sobre todas las secciones. */
const ALIASES: Record<string, string> = { live: "summary", virtual: "simulation" };

const RANGES = [
  { hours: 6, label: "6 h" },
  { hours: 24, label: "24 h" },
  { hours: 168, label: "7 días" },
];

export default function CropDetailPage() {
  const { cropId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab") ?? "summary";
  const wanted = ALIASES[requested] ?? requested;
  const [metric, setMetric] = useState<MetricKey>("temperature");
  const [hours, setHours] = useState(24);
  const [exportError, setExportError] = useState<string | null>(null);

  const crop = useResource(() => cropApi.get(cropId), [cropId], 20_000);
  const readings = useResource(() => readingApi.list(cropId, new Date(Date.now() - hours * 3600_000), 2000),
    [cropId, hours], 30_000);
  const tabs = TABS.filter((item) => !item.only || !crop.data || item.only === crop.data.kind);
  const tab = tabs.find((item) => item.id === wanted)?.id ?? "summary";
  const isVirtual = crop.data?.kind === "VIRTUAL";
  // La ilustración está sobre todas las secciones: actuadores y órdenes se refrescan siempre.
  const actuators = useResource(() => actuatorApi.list(cropId), [cropId], 10_000);
  const commands = useResource(() => commandApi.list(cropId), [cropId], tab === "control" ? 5_000 : 10_000);
  const simulation = useResource<VirtualDevice | null>(
    () => (isVirtual ? virtualDeviceApi.get(cropId) : Promise.resolve(null)), [cropId, isVirtual], isVirtual ? 10_000 : undefined);
  const insight = useResource(() => (tab === "assistant" ? insightApi.get(cropId) : Promise.resolve(undefined)),
    [cropId, tab === "assistant"]);
  const profiles = useCropProfiles();

  usePageMeta(crop.data?.name ?? "Cultivo");

  if (crop.loading && !crop.data) return <PageLoader />;
  if (!crop.data) {
    return (
      <div className="space-y-4">
        <Link to="/app/crops" className="inline-flex items-center gap-1 text-sm font-semibold text-leaf-700"><ArrowLeft size={16} /> Mis cultivos</Link>
        <Alert tone="danger">{crop.error ?? "El cultivo no existe"}</Alert>
      </div>
    );
  }

  const current = crop.data;
  const profile = profiles[current.type];
  const latest = current.latestReading;
  const virtual = current.kind === "VIRTUAL";
  const openTab = (id: string) => setParams(id === "summary" ? {} : { tab: id }, { replace: true });

  async function exportCsv() {
    setExportError(null);
    try {
      const csv = await readingApi.exportCsv(cropId, new Date(Date.now() - hours * 3600_000));
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `smartpot-${current.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setExportError(caught instanceof ApiError ? caught.message : "No se pudo exportar");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/crops" className="inline-flex items-center gap-1 text-sm font-semibold text-leaf-700"><ArrowLeft size={16} /> Mis cultivos</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{current.name}</h1>
            <p className="text-sm text-muted">
              {CROP_TYPES[current.type].label} {CROP_FORMS[current.form].phrase} · {current.device.online
                ? "En línea" : "Desconectado"} · última lectura {timeAgo(latest?.measuredAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={virtual ? "info" : "success"}>{virtual ? "Virtual" : "Real"}</Badge>
            {current.health && (
              <Badge tone={HEALTH[current.health.level]?.tone ?? "neutral"}>
                Salud {Math.round(current.health.index)}/100 · {current.health.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <CropHero crop={current} actuators={actuators.data ?? []} commands={commands.data ?? []}
        simulation={simulation.data} onOpenTab={openTab} />

      <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4" aria-label="Secciones del cultivo">
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => openTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${tab === item.id
              ? "border-leaf-600 text-leaf-800" : "border-transparent text-muted hover:text-ink"}`}>
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "summary" && (
        <div className="space-y-5">
          {!latest && (
            <Alert tone="info" title="Aún no hay lecturas">
              {virtual
                ? "La simulación publica la primera lectura en unos segundos; su configuración está en la pestaña Simulación."
                : "Conecta tu ESP32 o la simulación de Wokwi con la guía de la pestaña Dispositivo; las lecturas aparecerán aquí en segundos."}
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {PRIMARY_METRICS.map((key) => (
              <MetricTile key={key} metric={key} value={latest?.measures[key]} range={profile?.ranges[key]} />
            ))}
          </div>
          <section className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {METRICS[metric].label} · últimas {RANGES.find((range) => range.hours === hours)?.label}
              </h2>
              <select value={metric} onChange={(event) => setMetric(event.target.value as MetricKey)} aria-label="Variable"
                className="h-9 rounded-lg border border-line bg-white px-2 text-sm">
                {PRIMARY_METRICS.map((key) => <option key={key} value={key}>{METRICS[key].label}</option>)}
              </select>
            </div>
            <div className="mt-4">
              <ReadingsChart readings={readings.data ?? []} metric={metric} range={profile?.ranges[metric]} />
            </div>
            {profile && <p className="mt-2 text-xs text-muted">La franja verde es el rango ideal para {profile.name.toLowerCase()}.</p>}
          </section>
        </div>
      )}

      {tab === "assistant" && (
        <InsightPanel insight={insight.data} error={insight.error} loading={insight.loading} actuators={actuators.data ?? []}
          onRefresh={() => void insight.reload()}
          onRunAction={async (action, actuator) => {
            await commandApi.send(cropId, actuator.id, action.action, action.durationSeconds);
            void commands.reload();
          }} />
      )}

      {tab === "control" && (
        <ControlPanel crop={current} actuators={actuators.data ?? []} commands={commands.data ?? []}
          onAutomation={async (enabled) => crop.setData(await cropApi.setAutomation(cropId, enabled))}
          onChanged={() => {
            void actuators.reload();
            void commands.reload();
          }} />
      )}

      {tab === "history" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-xl bg-surface p-1">
              {RANGES.map((range) => (
                <button key={range.hours} type="button" onClick={() => setHours(range.hours)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${hours === range.hours ? "bg-white text-leaf-800 shadow-sm" : "text-muted"}`}>
                  {range.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm" icon={<FileDown size={16} />} onClick={() => void exportCsv()}>Exportar CSV</Button>
          </div>
          {exportError && <Alert tone="danger">{exportError}</Alert>}
          <p className="text-sm text-muted">{readings.data?.length ?? 0} lecturas en el periodo.</p>
          <div className="grid gap-5 lg:grid-cols-2">
            {PRIMARY_METRICS.map((key) => (
              <section key={key} className="card p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold">{METRICS[key].label}</h3>
                  <span className="text-sm text-muted">{formatMetric(key, latest?.measures[key])}</span>
                </div>
                <div className="mt-3">
                  <ReadingsChart readings={readings.data ?? []} metric={key} range={profile?.ranges[key]} height={200} />
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {tab === "device" && <DevicePanel crop={current} />}
      {tab === "simulation" && (
        simulation.data ? (
          simulation.data.available ? (
            // La llave reinicia el formulario con lo guardado cada vez que cambia la configuración.
            <SimulationPanel key={`${simulation.data.active}-${simulation.data.updatedAt ?? ""}`} cropId={cropId}
              simulation={simulation.data} profile={profile} onSaved={(saved) => simulation.setData(saved)}
              onPaused={() => void simulation.reload()} />
          ) : (
            <Alert tone="info" title="El simulador no está disponible">
              Este servidor no tiene el simulador de cultivos virtuales encendido. La configuración sigue guardada.
            </Alert>
          )
        ) : simulation.error ? <Alert tone="danger">{simulation.error}</Alert> : <PageLoader />
      )}
      {tab === "settings" && <SettingsPanel crop={current} onSaved={(updated) => crop.setData(updated)} />}
    </div>
  );
}
