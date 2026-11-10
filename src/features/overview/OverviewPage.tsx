import {A} from "@solidjs/router";
import {Download, LayoutDashboard, Plus, Sprout} from "lucide-solid";
import {Show} from "solid-js";
import {HeaderStat, PageHeader} from "../../components/layout/PageHeader";
import {Alert, EmptyState} from "../../components/ui/Feedback";
import {OverviewSkeleton, SkeletonHeaderStats} from "../../components/ui/Skeleton";
import {usePageMeta} from "../../hooks/usePageMeta";
import {useResource} from "../../hooks/useResource";
import {overviewApi} from "../../lib/api/services";
import {greeting} from "../../lib/format";
import {t} from "../../lib/i18n";
import {useAuth} from "../auth/AuthContext";
import {ComparisonTable} from "./components/ComparisonTable";
import {FleetPanel} from "./components/FleetPanel";
import {HealthRanking} from "./components/HealthRanking";
import {MetricComparison} from "./components/MetricComparison";

/** Panel general: todos los cultivos a la vez, a diferencia del detalle de cada uno. */
export default function OverviewPage() {
    usePageMeta(() => t("overview.title"));
    const auth = useAuth();
    const overview = useResource(() => overviewApi.get(), [], 30_000);
    const totals = () => overview.data?.totals;
    const crops = () => overview.data?.crops ?? [];

    function exportFleetCsv() {
        const cropList = crops();
        if (!cropList.length) return;
        const headers = [
            "id",
            "name",
            "type",
            "kind",
            "form",
            "health_level",
            "health_index",
            "online",
            "last_seen",
            "automation_enabled",
            "temperature",
            "humidity",
            "brightness",
            "ph",
            "tds",
            "soil_moisture",
            "latest_reading_time",
        ];
        const rows = cropList.map((c) => [
            c.id,
            `"${c.name.replace(/"/g, '""')}"`,
            c.type,
            c.kind,
            c.form,
            c.health?.level ?? "UNKNOWN",
            c.health?.index ?? "",
            c.device.online ? "YES" : "NO",
            c.device.lastSeenAt ?? "",
            c.automationEnabled ? "YES" : "NO",
            c.latestReading?.measures.temperature ?? "",
            c.latestReading?.measures.humidity ?? "",
            c.latestReading?.measures.brightness ?? "",
            c.latestReading?.measures.ph ?? "",
            c.latestReading?.measures.tds ?? "",
            c.latestReading?.measures.soilMoisture ?? "",
            c.latestReading?.measuredAt ?? "",
        ]);
        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `smartpot_fleet_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function exportFleetJson() {
        const data = {
            exportedAt: new Date().toISOString(),
            totals: totals(),
            crops: crops(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `smartpot_fleet_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    return (
        <div class="space-y-6">
            <PageHeader eyebrow={`${greeting()}, ${auth.user?.name ?? ""}`} title={t("overview.title")}
                        icon={<LayoutDashboard size={24}/>}
                        description={t("overview.description")}
                        actions={
                            <div class="flex flex-wrap items-center gap-2">
                                <Show when={crops().length > 0}>
                                    <button type="button" onClick={exportFleetCsv}
                                            class="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/20"
                                            title={t("overview.exportCsv")}>
                                        <Download size={16}/> {t("overview.exportCsv")}
                                    </button>
                                    <button type="button" onClick={exportFleetJson}
                                            class="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/20"
                                            title={t("overview.exportJson")}>
                                        <Download size={16}/> {t("overview.exportJson")}
                                    </button>
                                </Show>
                                <A href="/app/crops" class="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20">
                                    <Sprout size={18}/> {t("overview.viewCrops")}
                                </A>
                            </div>
                        }>
                <Show when={totals() && totals()!.crops > 0} fallback={<Show when={overview.loading && !overview.data}><SkeletonHeaderStats/></Show>}>
                    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <HeaderStat label={t("overview.avgHealth")}
                                    value={totals()!.averageHealth == null ? "—" : Math.round(totals()!.averageHealth!)}
                                    hint={t("overview.outOf100")}/>
                        <HeaderStat label={t("overview.online")} value={`${totals()!.online}/${totals()!.crops}`}
                                    hint={t("overview.automated", {count: totals()!.automated})}/>
                        <HeaderStat label={t("overview.needsAttention")} value={totals()!.needsAttention}
                                    hint={t("overview.unreadAlerts", {count: totals()!.unreadAlerts})}/>
                        <HeaderStat label={t("overview.commands24h")} value={totals()!.commandsLast24h}/>
                    </div>
                </Show>
            </PageHeader>

            <Show when={overview.error}>
                {(err) => <Alert tone="danger">{err()}</Alert>}
            </Show>
            <Show when={!(overview.loading && !overview.data)} fallback={<OverviewSkeleton/>}>
                <Show when={!(crops().length === 0 && !overview.error)} fallback={
                    <EmptyState icon={<Sprout size={26}/>} title={t("overview.emptyTitle")}
                                action={<A href="/app/crops" class="inline-flex h-11 items-center gap-2 rounded-xl bg-leaf-700 px-4 text-sm
            font-semibold text-white hover:bg-leaf-800"><Plus size={18}/> {t("overview.createCrop")}</A>}>
                        {t("overview.emptyBody")}
                    </EmptyState>
                }>
                    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
                        <HealthRanking crops={crops()}/>
                        <FleetPanel crops={crops()}/>
                    </div>
                    <MetricComparison crops={crops()}/>
                    <ComparisonTable crops={crops()}/>
                </Show>
            </Show>
        </div>
    );
}
