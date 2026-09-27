import { Plus, Sprout } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { HeaderStat, PageHeader } from "../../components/layout/PageHeader";
import { Alert, EmptyState } from "../../components/ui/Feedback";
import { PageLoader } from "../../components/ui/Spinner";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useResource } from "../../hooks/useResource";
import { cropApi } from "../../lib/api/services";
import { greeting } from "../../lib/format";
import { useAuth } from "../auth/AuthContext";
import { CreateCropDialog } from "./components/CreateCropDialog";
import { CropCard } from "./components/CropCard";

export function CropsPage() {
  usePageMeta("Mis cultivos");
  const { user } = useAuth();
  const crops = useResource(() => cropApi.list(), [], 30_000);
  const [creating, setCreating] = useState(false);

  const list = crops.data ?? [];
  const online = list.filter((crop) => crop.device.online).length;
  const attention = list.filter((crop) => crop.health && ["POOR", "CRITICAL"].includes(crop.health.level)).length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={`${greeting()}, ${user?.name ?? ""}`} title="Mis cultivos" icon={<Sprout size={24} />}
        description="Tus cultivos reales y virtuales con sus lecturas, su asistente y su control. Entra a uno para verlo en vivo."
        actions={<Button variant="light" icon={<Plus size={18} />} onClick={() => setCreating(true)}>Nuevo cultivo</Button>}>
        {list.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <HeaderStat label="Cultivos" value={list.length} />
            <HeaderStat label="En línea" value={online} />
            <HeaderStat label="Necesitan atención" value={attention} />
          </div>
        )}
      </PageHeader>

      {crops.error && <Alert tone="danger">{crops.error}</Alert>}
      {crops.loading && !crops.data ? <PageLoader /> : list.length === 0 && !crops.error ? (
        <EmptyState icon={<Sprout size={26} />} title="Crea tu primer cultivo"
          action={<Button icon={<Plus size={18} />} onClick={() => setCreating(true)}>Nuevo cultivo</Button>}>
          Elige si es real (un ESP32, físico o en Wokwi) o virtual (lo simula SmartPot), su especie y su forma: maceta,
          tubos NFT, torre o balsa.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((crop) => <CropCard key={crop.id} crop={crop} />)}
        </div>
      )}

      <CreateCropDialog open={creating} onClose={() => setCreating(false)} onCreated={() => void crops.reload()} />
    </div>
  );
}
