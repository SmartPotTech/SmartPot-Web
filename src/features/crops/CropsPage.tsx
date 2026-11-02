import {Plus, Sprout} from "lucide-solid";
import {createSignal, For, Show} from "solid-js";
import {Button} from "../../components/ui/Button";
import {HeaderStat, PageHeader} from "../../components/layout/PageHeader";
import {Alert, EmptyState} from "../../components/ui/Feedback";
import {PageLoader} from "../../components/ui/Spinner";
import {usePageMeta} from "../../hooks/usePageMeta";
import {useResource} from "../../hooks/useResource";
import {cropApi} from "../../lib/api/services";
import {greeting} from "../../lib/format";
import {t} from "../../lib/i18n";
import {useAuth} from "../auth/AuthContext";
import {CreateCropDialog} from "./components/CreateCropDialog";
import {CropCard} from "./components/CropCard";

export function CropsPage() {
    usePageMeta(() => t("crops.title"));
    const auth = useAuth();
    const crops = useResource(() => cropApi.list(), [], 30_000);
    const [creating, setCreating] = createSignal(false);

    const list = () => crops.data ?? [];
    const online = () => list().filter((crop) => crop.device.online).length;
    const attention = () => list().filter((crop) => crop.health && ["POOR", "CRITICAL"].includes(crop.health.level)).length;

    return (
        <div class="space-y-6">
            <PageHeader eyebrow={`${greeting()}, ${auth.user?.name ?? ""}`} title={t("crops.title")} icon={<Sprout size={24}/>}
                        description={t("crops.description")}
                        actions={<Button variant="light" icon={<Plus size={18}/>} onClick={() => setCreating(true)}>{t("crops.new")}</Button>}>
                <Show when={list().length > 0}>
                    <div class="grid grid-cols-3 gap-3">
                        <HeaderStat label={t("crops.statCrops")} value={list().length}/>
                        <HeaderStat label={t("crops.statOnline")} value={online()}/>
                        <HeaderStat label={t("crops.statAttention")} value={attention()}/>
                    </div>
                </Show>
            </PageHeader>

            <Show when={crops.error}>
                {(err) => <Alert tone="danger">{err()}</Alert>}
            </Show>
            <Show when={!(crops.loading && !crops.data)} fallback={<PageLoader/>}>
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

            <CreateCropDialog open={creating()} onClose={() => setCreating(false)}
                              onCreated={() => void crops.reload()}/>
        </div>
    );
}
