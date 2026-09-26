import { Plus, Sprout } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { SelectField, TextField } from "../../components/ui/Field";
import { Alert, EmptyState } from "../../components/ui/Feedback";
import { PageLoader } from "../../components/ui/Spinner";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useResource } from "../../hooks/useResource";
import { ApiError } from "../../lib/api/client";
import { cropApi } from "../../lib/api/services";
import { CROP_TYPES } from "../../lib/catalog";
import { greeting } from "../../lib/format";
import type { CropCreated, CropType } from "../../lib/api/types";
import { useAuth } from "../auth/AuthContext";
import { CropCard } from "./components/CropCard";
import { CredentialsView } from "./components/CredentialsView";

export function DashboardPage() {
  usePageMeta("Mis cultivos");
  const { user } = useAuth();
  const navigate = useNavigate();
  const crops = useResource(() => cropApi.list(), [], 30_000);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CropCreated | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<CropType>("LETTUCE");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const list = crops.data ?? [];
  const online = list.filter((crop) => crop.device.online).length;
  const attention = list.filter((crop) => crop.health && ["POOR", "CRITICAL"].includes(crop.health.level)).length;

  async function create(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Ponle un nombre de al menos 2 caracteres");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await cropApi.create({ name: name.trim(), type });
      setCreating(false);
      setCreated(result);
      setName("");
      void crops.reload();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo crear el cultivo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{greeting()}, {user?.name}</p>
          <h1 className="text-3xl font-bold">Mis cultivos</h1>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setCreating(true)}>Nuevo cultivo</Button>
      </div>

      {list.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[["Cultivos", list.length], ["En línea", online], ["Necesitan atención", attention]].map(([label, value]) => (
            <div key={label} className="card p-4">
              <p className="font-display text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      )}

      {crops.error && <Alert tone="danger">{crops.error}</Alert>}
      {crops.loading && !crops.data ? <PageLoader /> : list.length === 0 && !crops.error ? (
        <EmptyState icon={<Sprout size={26} />} title="Crea tu primer cultivo"
          action={<Button icon={<Plus size={18} />} onClick={() => setCreating(true)}>Nuevo cultivo</Button>}>
          Elige la especie, conecta tu maceta con la clave que te daremos y empieza a recibir lecturas.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((crop) => <CropCard key={crop.id} crop={crop} />)}
        </div>
      )}

      <Dialog open={creating} title="Nuevo cultivo" onClose={() => setCreating(false)}
        footer={<>
          <Button variant="secondary" onClick={() => setCreating(false)}>Cancelar</Button>
          <Button type="submit" form="create-crop" loading={saving}>Crear cultivo</Button>
        </>}>
        <form id="create-crop" onSubmit={create} className="space-y-4" noValidate>
          {error && <Alert tone="danger">{error}</Alert>}
          <TextField label="Nombre" placeholder="Lechugas del balcón" value={name} maxLength={60}
            onChange={(event) => setName(event.target.value)} />
          <SelectField label="Especie" value={type} onChange={(event) => setType(event.target.value as CropType)}
            hint={CROP_TYPES[type].hint}>
            {Object.entries(CROP_TYPES).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
          </SelectField>
          <p className="text-xs text-muted">Se agregan la bomba de agua, la luz de cultivo y el ventilador; puedes cambiarlos después.</p>
        </form>
      </Dialog>

      <Dialog open={Boolean(created)} title="Conecta tu maceta" onClose={() => setCreated(null)}
        footer={<Button onClick={() => {
          const id = created?.crop.id;
          setCreated(null);
          if (id) navigate(`/app/crops/${id}`);
        }}>Ir al cultivo</Button>}>
        {created && <CredentialsView credentials={created.device} />}
      </Dialog>
    </div>
  );
}
