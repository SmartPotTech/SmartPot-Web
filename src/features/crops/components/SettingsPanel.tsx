import {MapPinned, Save, Trash2} from "lucide-react";
import {type FormEvent, useState} from "react";
import {useNavigate} from "react-router";
import {Button} from "../../../components/ui/Button";
import {SelectField, TextField} from "../../../components/ui/Field";
import {Alert} from "../../../components/ui/Feedback";
import {Dialog} from "../../../components/ui/Dialog";
import {ApiError} from "../../../lib/api/client";
import {cropApi} from "../../../lib/api/services";
import {CROP_FORMS, CROP_KINDS, CROP_TYPES} from "../../../lib/catalog";
import type {Crop, CropForm, CropType, Placement} from "../../../lib/api/types";
import {CropNotifications} from "./CropNotifications";
import {PlacementPicker} from "./PlacementPicker";

export function SettingsPanel({crop, onSaved}: { crop: Crop; onSaved: (crop: Crop) => void }) {
    const navigate = useNavigate();
    const [name, setName] = useState(crop.name);
    const [type, setType] = useState<CropType>(crop.type);
    const [form, setForm] = useState<CropForm>(crop.form);
    const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmName, setConfirmName] = useState("");
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState<Placement>(crop.placement ?? {});
    const [placementMessage, setPlacementMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
    const [placing, setPlacing] = useState(false);

    async function savePlacement() {
        setPlacing(true);
        setPlacementMessage(null);
        try {
            onSaved(await cropApi.update(crop.id, {name: crop.name, type: crop.type, form: crop.form, placement}));
            setPlacementMessage({tone: "success", text: "Lugar guardado: la ilustración y el asistente ya lo usan"});
        } catch (caught) {
            setPlacementMessage({
                tone: "danger",
                text: caught instanceof ApiError ? caught.message : "No se pudo guardar"
            });
        } finally {
            setPlacing(false);
        }
    }

    async function save(event: FormEvent) {
        event.preventDefault();
        if (name.trim().length < 2) {
            setMessage({tone: "danger", text: "El nombre debe tener al menos 2 caracteres"});
            return;
        }
        setSaving(true);
        try {
            onSaved(await cropApi.update(crop.id, {
                name: name.trim(),
                type,
                form,
                placement: crop.placement ?? undefined
            }));
            setMessage({tone: "success", text: "Cambios guardados"});
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo guardar"});
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        setDeleting(true);
        try {
            await cropApi.remove(crop.id);
            navigate("/app/crops", {replace: true});
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo eliminar"});
            setDeleting(false);
            setOpen(false);
        }
    }

    return (
        <div className="space-y-5">
            <form onSubmit={save} className="card space-y-4 p-5">
                <h3 className="font-semibold">Datos del cultivo</h3>
                {message && <Alert tone={message.tone}>{message.text}</Alert>}
                <TextField label="Nombre" value={name} maxLength={60}
                           onChange={(event) => setName(event.target.value)}/>
                <SelectField label="Especie" value={type} onChange={(event) => setType(event.target.value as CropType)}
                             hint="Cambiar la especie cambia los rangos ideales que usa el asistente.">
                    {Object.entries(CROP_TYPES).map(([value, info]) => <option key={value}
                                                                               value={value}>{info.label}</option>)}
                </SelectField>
                <SelectField label="Forma del cultivo" value={form}
                             onChange={(event) => setForm(event.target.value as CropForm)}
                             hint={`${CROP_FORMS[form].hint} Cambia cómo se ilustra el cultivo.`}>
                    {Object.entries(CROP_FORMS).map(([value, info]) => <option key={value}
                                                                               value={value}>{info.label}</option>)}
                </SelectField>
                <div className="rounded-xl bg-surface px-3 py-2 text-sm">
                    <p><span
                        className="font-semibold">Tipo: {CROP_KINDS[crop.kind].label}.</span> {CROP_KINDS[crop.kind].hint}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">No se puede cambiar: para pasar de real a virtual, o al
                        revés, crea otro cultivo.</p>
                </div>
                <Button type="submit" icon={<Save size={16}/>} loading={saving}>Guardar cambios</Button>
            </form>

            <section className="card space-y-4 p-5" aria-labelledby="placement-title">
                <div>
                    <h3 id="placement-title" className="flex items-center gap-2 font-semibold">
                        <MapPinned size={16} className="text-leaf-700"/> Dónde está
                    </h3>
                    <p className="text-sm text-muted">
                        Cambia cómo se ilustra y lo que recomienda el asistente{crop.kind === "VIRTUAL"
                        ? "; en un cultivo virtual también cambia el clima que simula" : ""}.
                    </p>
                </div>
                {placementMessage && <Alert tone={placementMessage.tone}>{placementMessage.text}</Alert>}
                <PlacementPicker type={crop.type} value={placement} onChange={setPlacement}/>
                <Button icon={<Save size={16}/>} loading={placing} onClick={() => void savePlacement()}>Guardar
                    lugar</Button>
            </section>

            <CropNotifications crop={crop}/>

            <section className="card border-danger-500/30 p-5">
                <h3 className="font-semibold text-danger-600">Eliminar cultivo</h3>
                <p className="mt-1 text-sm text-muted">Se borran sus lecturas, comandos y actuadores; la clave del
                    dispositivo deja de funcionar y, si es virtual, se apaga su simulación.</p>
                <Button variant="danger" className="mt-4" icon={<Trash2 size={16}/>}
                        onClick={() => setOpen(true)}>Eliminar</Button>
            </section>

            <Dialog open={open} title="Eliminar cultivo" onClose={() => setOpen(false)}
                    footer={<>
                        <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button variant="danger" loading={deleting} disabled={confirmName !== crop.name}
                                onClick={() => void remove()}>
                            Eliminar definitivamente
                        </Button>
                    </>}>
                <p className="mb-3 text-sm text-muted">Esta acción no se puede deshacer.
                    Escribe <strong>{crop.name}</strong> para confirmar.</p>
                <TextField label="Nombre del cultivo" value={confirmName}
                           onChange={(event) => setConfirmName(event.target.value)}/>
            </Dialog>
        </div>
    );
}
