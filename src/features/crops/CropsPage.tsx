import {Plus, Sprout} from "lucide-solid";
import {createSignal, For, lazy, Show, Suspense} from "solid-js";
import {Button} from "../../components/ui/Button";
import {HeaderStat, PageHeader} from "../../components/layout/PageHeader";
import {Alert, EmptyState} from "../../components/ui/Feedback";
import {CropsGridSkeleton} from "../../components/ui/Skeleton";
import {Spinner} from "../../components/ui/Spinner";
import {usePageMeta} from "../../hooks/usePageMeta";
import {useResource} from "../../hooks/useResource";
import {cropApi} from "../../lib/api/services";
import {greeting} from "../../lib/format";
import {t} from "../../lib/i18n";
import {useAuth} from "../auth/AuthContext";
import {CropCard} from "./components/CropCard";

// El diálogo de alta (y con él la simulación y la escena) se descarga solo al pulsar «Nuevo cultivo».
const CreateCropDialog = lazy(async () => {
    const module = await import("./components/CreateCropDialog");
    return {default: module.CreateCropDialog};
});

export function CropsPage() {
    usePageMeta(() => t("crops.title"));
    const auth = useAuth();
    const crops = useResource(() => cropApi.list(), [], 30_000);
    const [creating, setCreating] = createSignal(false);

    const list = () => crops.data ?? [];
    const online = () => list().filter((crop) => crop.device.online).length;
    const attention = () => list().filter((crop) => crop.health && ["POOR", "CRITICAL"].includes(crop.health.level)).length;
    const virtualCount = () => list().filter((crop) => crop.kind === "VIRTUAL").length;
    const atQuota = () => list().length >= 20;

    return (
        <div class="space-y-6">
            <PageHeader eyebrow={`${greeting()}, ${auth.user?.name ?? ""}`} title={t("crops.title")} icon={<Sprout size={24}/>}
                        description={t("crops.description")}
                        actions={
                            <div class="flex items-center gap-2">
                                <Button variant="light" icon={<Plus size={18}/>} disabled={atQuota()}
                                        title={atQuota() ? t("crops.quotaMaxReached") : undefined}
                                        onClick={() => setCreating(true)}>
                                    {t("crops.new")}
                                </Button>
                            </div>
                        }>
                <Show when={list().length > 0}>
                    <div class="grid grid-cols-3 gap-3">
                        <HeaderStat label={t("crops.statCrops")} value={`${list().length}/20`}
                                    hint={t("crops.quotaVirtualUsage", {current: virtualCount(), max: 5})}/>
                        <HeaderStat label={t("crops.statOnline")} value={online()}/>
                        <HeaderStat label={t("crops.statAttention")} value={attention()}/>
                    </div>
                </Show>
            </PageHeader>

            <Show when={crops.error}>
                {(err) => <Alert tone="danger">{err()}</Alert>}
            </Show>
            <Show when={!(crops.loading && !crops.data)} fallback={<CropsGridSkeleton/>}>
                <Show when={!(list().length === 0 && !crops.error)} fallback={
                    <EmptyState icon={<Sprout size={26}/>} title={t("crops.emptyTitle")}
                                action={<Button icon={<Plus size={18}/>} onClick={() => setCreating(true)}>{t("crops.new")}</Button>}>
                        {t("crops.emptyBody")}
                    </EmptyState>
                }>
                    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <For each={list()}>
                            {(crop) => <CropCard crop={crop}/>}
                        </For>
                    </div>
                </Show>
            </Show>

            <Show when={creating()}>
                <Suspense fallback={
                    <div class="fixed inset-0 z-50 grid place-items-center bg-leaf-950/40">
                        <Spinner size={28}/>
                    </div>
                }>
                    <CreateCropDialog open onClose={() => setCreating(false)}
                                      cropsCount={list().length} virtualCount={virtualCount()}
                                      onCreated={() => void crops.reload()}/>
                </Suspense>
            </Show>
        </div>
    );
}
