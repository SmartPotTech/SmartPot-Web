import { ArrowLeft, ArrowRight, Cpu, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { SelectField, TextField } from "../../../components/ui/Field";
import { Alert } from "../../../components/ui/Feedback";
import { ApiError } from "../../../lib/api/client";
import { cropApi } from "../../../lib/api/services";
import { CROP_FORMS, CROP_KINDS, CROP_TYPES } from "../../../lib/catalog";
import type { ActuatorType, Crop, CropCreated, CropForm, CropKind, CropType, VirtualMode } from "../../../lib/api/types";
import { ConnectionGuide } from "./ConnectionGuide";
import { LocationPicker, type PickedLocation } from "./LocationPicker";
import { CropScene } from "./scene/CropScene";
import { ModePicker } from "./SimulationPanel";

type Step = "kind" | "details" | "connect";

/** Actuadores con los que nace cada tipo: el firmware trae tres; la simulación, los seis. */
const STARTING_ACTUATORS: Record<CropKind, ActuatorType[]> = {
  REAL: ["WATER_PUMP", "UV_LIGHT", "FAN"],
  VIRTUAL: ["WATER_PUMP", "UV_LIGHT", "FAN", "HUMIDIFIER", "NUTRIENT_DOSER", "PH_DOSER"],
};
const KIND_ICONS: Record<CropKind, typeof Cpu> = { REAL: Cpu, VIRTUAL: Sparkles };
const NOTHING_RUNNING = new Set<ActuatorType>();

interface CreateCropDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (crop: Crop) => void;
}

/**
 * Crear un cultivo en tres pasos: real o virtual (no se puede cambiar después), sus datos con la vista previa de
 * la forma elegida y, si es real, la guía para conectar el ESP32 o la simulación de Wokwi con su clave.
 */
export function CreateCropDialog({ open, onClose, onCreated }: CreateCropDialogProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("kind");
  const [kind, setKind] = useState<CropKind | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<CropType>("LETTUCE");
  const [form, setForm] = useState<CropForm>("POT");
  const [mode, setMode] = useState<VirtualMode>("AUTO");
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const [created, setCreated] = useState<CropCreated | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function close() {
    setStep("kind");
    setKind(null);
    setName("");
    setType("LETTUCE");
    setForm("POT");
    setMode("AUTO");
    setLocation(null);
    setCreated(null);
    setError(null);
    onClose();
  }

  function openCrop(crop: Crop) {
    close();
    navigate(`/app/crops/${crop.id}`);
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!kind) return;
    if (name.trim().length < 2) {
      setError("Ponle un nombre de al menos 2 caracteres");
      return;
    }
    if (kind === "VIRTUAL" && mode === "WEATHER" && !location) {
      setError("Elige el lugar cuyo clima seguirá el cultivo.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await cropApi.create({
        name: name.trim(), type, kind, form,
        ...(kind === "VIRTUAL" ? { virtual: { mode, ...(mode === "WEATHER" && location ? { location } : {}) } } : {}),
      });
      onCreated(result.crop);
      if (result.device) {
        setCreated(result);
        setStep("connect");
      } else {
        openCrop(result.crop);
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo crear el cultivo");
    } finally {
      setSaving(false);
    }
  }

  const title = step === "connect" ? "Conecta tu dispositivo"
    : step === "details" && kind ? `Nuevo cultivo ${CROP_KINDS[kind].label.toLowerCase()}` : "Nuevo cultivo";
  // Cada botón lleva su clave: si React reutilizara «Siguiente» como «Crear cultivo», el mismo clic enviaría el formulario.
  const footer = step === "kind" ? (
    <>
      <Button key="cancel" variant="secondary" onClick={close}>Cancelar</Button>
      <Button key="next" icon={<ArrowRight size={16} />} disabled={!kind} onClick={() => setStep("details")}>Siguiente</Button>
    </>
  ) : step === "details" ? (
    <>
      <Button key="back" variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => setStep("kind")}>Atrás</Button>
      <Button key="create" type="submit" form="create-crop" loading={saving}>Crear cultivo</Button>
    </>
  ) : (
    <Button key="open" onClick={() => created && openCrop(created.crop)}>Ya lo guardé, ir al cultivo</Button>
  );

  return (
    <Dialog open={open} title={title} onClose={close} footer={footer} wide={step !== "kind"}>
      {step === "kind" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">¿Cómo llegarán las lecturas de este cultivo?</p>
          <div className="grid gap-3" role="radiogroup" aria-label="Tipo de cultivo">
            {(Object.keys(CROP_KINDS) as CropKind[]).map((option) => {
              const Icon = KIND_ICONS[option];
              return (
                <button key={option} type="button" role="radio" aria-checked={kind === option} onClick={() => setKind(option)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${kind === option
                    ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-white hover:bg-surface"}`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-700 text-white">
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block font-semibold">{CROP_KINDS[option].label}</span>
                    <span className="mt-0.5 block text-sm text-muted">{CROP_KINDS[option].hint}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {option === "REAL"
                        ? "Te damos la clave del dispositivo y la guía para conectarlo."
                        : "Sin hardware ni cuentas externas. Hasta 5 por cuenta."}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <Alert tone="warning">
            El tipo no se puede cambiar después: un cultivo real no pasa a virtual ni al revés. Si cambias de idea,
            crea otro.
          </Alert>
        </div>
      )}

      {step === "details" && kind && (
        // El buscador de lugar tiene su propio formulario: por eso el de creación envuelve solo los datos del cultivo.
        <div className="grid gap-5 sm:grid-cols-2">
          <form id="create-crop" onSubmit={create} className="space-y-4" noValidate>
            {error && <Alert tone="danger">{error}</Alert>}
            <TextField label="Nombre" placeholder="Lechugas del balcón" value={name} maxLength={60}
              onChange={(event) => setName(event.target.value)} />
            <SelectField label="Especie" value={type} onChange={(event) => setType(event.target.value as CropType)}
              hint={CROP_TYPES[type].hint}>
              {Object.entries(CROP_TYPES).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}
            </SelectField>
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">Forma del cultivo</legend>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Forma del cultivo">
                {(Object.keys(CROP_FORMS) as CropForm[]).map((option) => (
                  <button key={option} type="button" role="radio" aria-checked={form === option} onClick={() => setForm(option)}
                    title={CROP_FORMS[option].hint}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${form === option
                      ? "border-leaf-600 bg-leaf-50 text-leaf-800 ring-2 ring-leaf-600/30" : "border-line bg-white hover:bg-surface"}`}>
                    {CROP_FORMS[option].label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted">{CROP_FORMS[form].hint}</p>
            </fieldset>
          </form>
          <div className="space-y-3">
            <CropScene form={form} type={type} installed={STARTING_ACTUATORS[kind]} running={NOTHING_RUNNING} isDay
              vigor="healthy" label={`Vista previa: ${CROP_TYPES[type].label} ${CROP_FORMS[form].phrase}`} />
            <p className="text-xs text-muted">
              {kind === "REAL"
                ? "Nace con la bomba de agua, la luz de cultivo y el ventilador del firmware; puedes sumar más en Control."
                : "Nace con los seis actuadores: bomba, luz, ventilador, humidificador y dosificadores de nutrientes y pH."}
            </p>
          </div>
          {kind === "VIRTUAL" && (
            <div className="space-y-3 sm:col-span-2">
              <p className="text-sm font-semibold">¿Cómo empieza la simulación?</p>
              <ModePicker value={mode} onChange={setMode} />
              {mode === "WEATHER" && <LocationPicker value={location} onChange={setLocation} />}
              {mode === "MANUAL" && (
                <p className="text-xs text-muted">Empieza con los valores típicos de la especie; muévelos luego en la pestaña Simulación.</p>
              )}
            </div>
          )}
        </div>
      )}

      {step === "connect" && created?.device && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            «{created.crop.name}» está listo. Conéctalo con un ESP32 físico o con la simulación del mismo firmware en
            Wokwi: los dos son cultivos reales y usan esta clave.
          </p>
          <ConnectionGuide credentials={created.device} />
        </div>
      )}
    </Dialog>
  );
}
