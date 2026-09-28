import {LayoutDashboard, Plus, Sprout} from "lucide-react";
import {Link} from "react-router";
import {HeaderStat, PageHeader} from "../../components/layout/PageHeader";
import {Alert, EmptyState} from "../../components/ui/Feedback";
import {PageLoader} from "../../components/ui/Spinner";
import {usePageMeta} from "../../hooks/usePageMeta";
import {useResource} from "../../hooks/useResource";
import {overviewApi} from "../../lib/api/services";
import {greeting} from "../../lib/format";
import {useAuth} from "../auth/AuthContext";
import {ComparisonTable} from "./components/ComparisonTable";
import {FleetPanel} from "./components/FleetPanel";
import {HealthRanking} from "./components/HealthRanking";
import {MetricComparison} from "./components/MetricComparison";

/** Panel general: todos los cultivos a la vez, a diferencia del detalle de cada uno. */
export default function OverviewPage() {
    usePageMeta("Panel general");
    const {user} = useAuth();
    const overview = useResource(() => overviewApi.get(), [], 30_000);
    const totals = overview.data?.totals;
    const crops = overview.data?.crops ?? [];

    return (
        <div className="space-y-6">
            <PageHeader eyebrow={`${greeting()}, ${user?.name ?? ""}`} title="Panel general"
                        icon={<LayoutDashboard size={24}/>}
                        description="Tus cultivos juntos: cómo están, cómo se comparan y qué recomienda el asistente para todos."
                        actions={<Link to="/app/crops" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25
          bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20"><Sprout size={18}/> Ver cultivos</Link>}>
                {totals && totals.crops > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <HeaderStat label="Salud promedio"
                                    value={totals.averageHealth == null ? "—" : Math.round(totals.averageHealth)}
                                    hint="de 100"/>
                        <HeaderStat label="Cultivos en línea" value={`${totals.online}/${totals.crops}`}
                                    hint={`${totals.automated} en modo automático`}/>
                        <HeaderStat label="Necesitan atención" value={totals.needsAttention}
                                    hint={`${totals.unreadAlerts} alertas sin leer`}/>
                        <HeaderStat label="Comandos en 24 h" value={totals.commandsLast24h}/>
                    </div>
                )}
            </PageHeader>

            {overview.error && <Alert tone="danger">{overview.error}</Alert>}
            {overview.loading && !overview.data ? <PageLoader/> : crops.length === 0 && !overview.error ? (
                <EmptyState icon={<Sprout size={26}/>} title="Todavía no tienes cultivos"
                            action={<Link to="/app/crops" className="inline-flex h-11 items-center gap-2 rounded-xl bg-leaf-700 px-4 text-sm
            font-semibold text-white hover:bg-leaf-800"><Plus size={18}/> Crear un cultivo</Link>}>
                    Cuando tengas cultivos, aquí los verás juntos, comparados y analizados por el asistente.
                </EmptyState>
            ) : (
                <>
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                        <HealthRanking crops={crops}/>
                        <FleetPanel crops={crops}/>
                    </div>
                    <MetricComparison crops={crops}/>
                    <ComparisonTable crops={crops}/>
                </>
            )}
        </div>
    );
}
