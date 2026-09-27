import { Save, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../../components/ui/Button";
import { SelectField, TextField } from "../../../components/ui/Field";
import { Alert } from "../../../components/ui/Feedback";
import { Dialog } from "../../../components/ui/Dialog";
import { ApiError } from "../../../lib/api/client";
import { cropApi } from "../../../lib/api/services";
import { CROP_TYPES } from "../../../lib/catalog";
import type { Crop, CropType } from "../../../lib/api/types";

export function SettingsPanel({ crop, onSaved }: { crop: Crop; onSaved: (crop: Crop) => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState(crop.name);
  const [type, setType] = useState<CropType>(crop.type);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [open, setOpen] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setMessage({ tone: "danger", text: "El nombre debe tener al menos 2 caracteres" });
      return;
    }
    setSaving(true);
    try {
      onSaved(await cropApi.update(crop.id, { name: name.trim(), type }));
      setMessage({ tone: "success", text: "Cambios guardados" });
    } catch (caught) {
      setMessage({ tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo guardar" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await cropApi.remove(crop.id);
      navigate("/app/crops", { replace: true });
    } catch (caught) {
      setMessage({ tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo eliminar" });
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={save} className="card space-y-4 p-5">
        <h3 className="font-semibold">Datos del cultivo</h3>
        {message && <Alert tone={message.tone}>{message.text}</Alert>}
        <TextField label="Nombre" value={name} maxLength={60} onChange={(event) => setName(event.target.value)} />
        <SelectField label="Especie" value={type} onChange={(event) => setType(event.target.value as CropType)}
          hint="Cambiar la especie cambia los rangos ideales que usa el asistente.">
          {Object.entries(CROP_TYPES).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
        </SelectField>
        <Button type="submit" icon={<Save size={16} />} loading={saving}>Guardar cambios</Button>
      </form>

      <section className="card border-danger-500/30 p-5">
        <h3 className="font-semibold text-danger-600">Eliminar cultivo</h3>
        <p className="mt-1 text-sm text-muted">Se borran sus lecturas, comandos y actuadores, y la clave de la maceta deja de funcionar.</p>
        <Button variant="danger" className="mt-4" icon={<Trash2 size={16} />} onClick={() => setOpen(true)}>Eliminar</Button>
      </section>

      <Dialog open={open} title="Eliminar cultivo" onClose={() => setOpen(false)}
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} disabled={confirmName !== crop.name} onClick={() => void remove()}>
            Eliminar definitivamente
          </Button>
        </>}>
        <p className="mb-3 text-sm text-muted">Esta acción no se puede deshacer. Escribe <strong>{crop.name}</strong> para confirmar.</p>
        <TextField label="Nombre del cultivo" value={confirmName} onChange={(event) => setConfirmName(event.target.value)} />
      </Dialog>
    </div>
  );
}
