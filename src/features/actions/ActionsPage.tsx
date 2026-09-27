import { Bot, History, ListChecks, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { HeaderStat, PageHeader } from "../../components/layout/PageHeader";
import { Alert, Badge, EmptyState } from "../../components/ui/Feedback";
import { PageLoader } from "../../components/ui/Spinner";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useResource } from "../../hooks/useResource";
import { commandApi, cropApi, overviewApi } from "../../lib/api/services";
import { COMMAND_STATUS } from "../../lib/catalog";
import { describeAction, formatDateTime, timeAgo } from "../../lib/format";
import type { Command, CommandStatus } from "../../lib/api/types";
import { FleetActionsList } from "../overview/components/FleetActionsList";

type Tab = "suggested" | "history";
type SourceFilter = "ALL" | Command["source"];

/** Acciones: lo que sugiere el asistente para todos los cultivos y todo lo que se ha ejecutado. */
export function ActionsPage() {
  usePageMeta("Acciones");
  const [tab, setTab] = useState<Tab>("suggested");
  const [status, setStatus] = useState<CommandStatus | "ALL">("ALL");
  const [source, setSource] = useState<SourceFilter>("ALL");
  const crops = useResource(() => cropApi.list(), [], 60_000);
  const commands = useResource(() => commandApi.listAll(100), [], 20_000);
  const fleet = useResource(() => overviewApi.fleet(), [], 5 * 60_000);

  const cropName = (id: string) => crops.data?.find((crop) => crop.id === id)?.name ?? "Cultivo eliminado";
  const history = (commands.data ?? []).filter((command) => (status === "ALL" || command.status === status)
    && (source === "ALL" || command.source === source));
  const executed = (commands.data ?? []).filter((command) => command.status === "EXECUTED").length;
  const byAgent = (commands.data ?? []).filter((command) => command.source === "AGENT").length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Centro de acciones" title="Acciones" icon={<ListChecks size={24} />}
        description="Aplica lo que recomienda el asistente a varios cultivos y revisa todo lo que se ha ejecutado.">
        <div className="grid grid-cols-3 gap-3">
          <HeaderStat label="Sugeridas ahora" value={fleet.data?.actions.length ?? "—"} />
          <HeaderStat label="Ejecutadas (últimas 100)" value={commands.data ? executed : "—"} />
          <HeaderStat label="Del agente de IA" value={commands.data ? byAgent : "—"} />
        </div>
      </PageHeader>

      <div className="flex gap-2 rounded-xl bg-white p-1 shadow-[var(--shadow-card)] sm:w-fit" role="tablist">
        {([["suggested", "Sugeridas por la IA", Sparkles], ["history", "Historial", History]] as const).map(([key, label, Icon]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold sm:flex-none
              ${tab === key ? "bg-leaf-700 text-white" : "text-muted hover:text-ink"}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === "suggested" ? (
        <section className="card p-5" role="tabpanel">
          {fleet.error && <Alert tone="info" title="El asistente no está disponible">{fleet.error}</Alert>}
          {fleet.loading && !fleet.data ? <PageLoader /> : fleet.data && (
            <>
              <p className="mb-2 text-sm text-muted">{fleet.data.summary}</p>
              <FleetActionsList actions={fleet.data.actions} crops={crops.data ?? []}
                onApplied={() => { void commands.reload(); void fleet.reload(); }} />
            </>
          )}
        </section>
      ) : (
        <section className="card p-5" role="tabpanel">
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              <span className="mr-2 font-semibold">Estado</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as CommandStatus | "ALL")}
                className="rounded-lg border border-line bg-white px-2 py-1">
                <option value="ALL">Todos</option>
                {Object.entries(COMMAND_STATUS).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="mr-2 font-semibold">Origen</span>
              <select value={source} onChange={(event) => setSource(event.target.value as SourceFilter)}
                className="rounded-lg border border-line bg-white px-2 py-1">
                <option value="ALL">Todos</option>
                <option value="USER">Personas</option>
                <option value="AGENT">Agente de IA</option>
              </select>
            </label>
          </div>
          {commands.error && <div className="mt-3"><Alert tone="danger">{commands.error}</Alert></div>}
          {commands.loading && !commands.data ? <PageLoader /> : history.length === 0 ? (
            <div className="mt-4"><EmptyState icon={<History size={24} />} title="Sin acciones">
              Aquí aparecerán las órdenes enviadas a tus macetas, por ti o por el agente.
            </EmptyState></div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {history.map((command) => (
                <li key={command.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{describeAction(command.actuatorType, command.action, command.durationSeconds)}</p>
                    <p className="text-sm text-muted">
                      <Link to={`/app/crops/${command.cropId}`} className="font-medium text-leaf-800 hover:underline">
                        {cropName(command.cropId)}
                      </Link>
                      {command.reason ? ` · ${command.reason}` : ""}
                    </p>
                    {command.message && <p className="text-xs text-muted">{command.message}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-1.5">
                      <Badge tone={command.source === "AGENT" ? "info" : "neutral"}>
                        {command.source === "AGENT" ? <><Bot size={12} /> Agente</> : <><UserRound size={12} /> Persona</>}
                      </Badge>
                      <Badge tone={COMMAND_STATUS[command.status].tone}>{COMMAND_STATUS[command.status].label}</Badge>
                    </div>
                    <time dateTime={command.createdAt} title={formatDateTime(command.createdAt)} className="text-xs text-muted">
                      {timeAgo(command.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
