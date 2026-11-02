import {useNavigate} from "@solidjs/router";
import {ArrowLeft, ArrowRight, Cpu, Sparkles} from "lucide-solid";
import {createSignal, For, Match, Show, Switch} from "solid-js";
import {Button} from "../../../components/ui/Button";
import {Dialog} from "../../../components/ui/Dialog";
import {SelectField, TextField} from "../../../components/ui/Field";
import {Alert} from "../../../components/ui/Feedback";
import {ApiError} from "../../../lib/api/client";
import {cropApi} from "../../../lib/api/services";
import {CROP_FORMS, CROP_KINDS, CROP_TYPES} from "../../../lib/catalog";
import {t} from "../../../lib/i18n";
import type {
    ActuatorType,
    Crop,
    CropCreated,
    CropForm,
    CropKind,
    CropType,
    Placement,
    VirtualMode,
} from "../../../lib/api/types";
import {ConnectionGuide} from "./ConnectionGuide";
import {PlacementPicker} from "./PlacementPicker";
import {CropScene} from "./scene/CropScene";
import {ModePicker} from "./SimulationPanel";

type Step = "kind" | "details" | "connect";

/** Actuadores con los que nace cada tipo: el firmware trae tres; la simulación, los seis. */
const STARTING_ACTUATORS: Record<CropKind, ActuatorType[]> = {
    REAL: ["WATER_PUMP", "UV_LIGHT", "FAN"],
    VIRTUAL: ["WATER_PUMP", "UV_LIGHT", "FAN", "HUMIDIFIER", "NUTRIENT_DOSER", "PH_DOSER"],
};
const KIND_ICONS: Record<CropKind, typeof Cpu> = {REAL: Cpu, VIRTUAL: Sparkles};
const NOTHING_RUNNING = new Set<ActuatorType>();

interface CreateCropDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated: (crop: Crop) => void;
}

/**
 * Crear un cultivo en tres pasos: real o virtual (no se puede cambiar después), sus datos y su lugar con la vista
 * previa y, si es real, la guía para conectar el ESP32 o la simulación de Wokwi con su clave.
 */
export function CreateCropDialog(props: CreateCropDialogProps) {
    const navigate = useNavigate();
    const [step, setStep] = createSignal<Step>("kind");
    const [kind, setKind] = createSignal<CropKind | null>(null);
    const [name, setName] = createSignal("");
    const [type, setType] = createSignal<CropType>("LETTUCE");
    const [form, setForm] = createSignal<CropForm>("POT");
    const [mode, setMode] = createSignal<VirtualMode>("AUTO");
    const [placement, setPlacement] = createSignal<Placement>({});
    const [created, setCreated] = createSignal<CropCreated | null>(null);
    const [error, setError] = createSignal<string | null>(null);
    const [saving, setSaving] = createSignal(false);

    function close() {
        setStep("kind");
        setKind(null);
        setName("");
        setType("LETTUCE");
        setForm("POT");
        setMode("AUTO");
        setPlacement({});
        setCreated(null);
        setError(null);
        props.onClose();
    }

    function openCrop(crop: Crop) {
        close();
        navigate(`/app/crops/${crop.id}`);
    }

    async function create(event: SubmitEvent) {
        event.preventDefault();
        const k = kind();
        if (!k) return;
        if (name().trim().length < 2) {
            setError(t("create.nameTooShort"));
            return;
        }
        const pl = placement();
        const location = pl.location ?? null;
        if (k === "VIRTUAL" && mode() === "WEATHER" && !location) {
            setError(t("create.locationRequired"));
            return;
        }
        const placed = pl.setting || pl.location ? {placement: pl} : {};
        setSaving(true);
        setError(null);
        try {
            const result = await cropApi.create({
                name: name().trim(),
                type: type(),
                kind: k,
                form: form(),
                ...placed,
                ...(k === "VIRTUAL" ? {virtual: {mode: mode(), ...(mode() === "WEATHER" && location ? {location} : {})}} : {}),
            });
            props.onCreated(result.crop);
            if (result.device) {
                setCreated(result);
                setStep("connect");
            } else {
                openCrop(result.crop);
            }
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : t("create.failed"));
        } finally {
            setSaving(false);
        }
    }

    const title = () => step() === "connect" ? t("create.titleConnect")
        : step() === "details" && kind() ? t("create.titleKind", {kind: CROP_KINDS[kind()!].label.toLowerCase()}) : t("create.titleNew");

    return (
        <Dialog open={props.open} title={title()} onClose={close} wide={step() !== "kind"}
                footer={
                    <Switch>
                        <Match when={step() === "kind"}>
                            <Button variant="secondary" onClick={close}>{t("common.cancel")}</Button>
                            <Button icon={<ArrowRight size={16}/>} disabled={!kind()}
                                    onClick={() => setStep("details")}>{t("create.next")}</Button>
                        </Match>
                        <Match when={step() === "details"}>
                            <Button variant="secondary" icon={<ArrowLeft size={16}/>}
                                    onClick={() => setStep("kind")}>{t("create.back")}</Button>
                            <Button type="submit" form="create-crop" loading={saving()}>{t("create.submit")}</Button>
                        </Match>
                        <Match when={step() === "connect"}>
                            <Button onClick={() => {
                                const c = created();
                                if (c) openCrop(c.crop);
                            }}>{t("create.goToCrop")}</Button>
                        </Match>
                    </Switch>
                }>
            <Show when={step() === "kind"}>
                <div class="space-y-4">
                    <p class="text-sm text-muted">{t("create.howReadings")}</p>
                    <div class="grid gap-3" role="radiogroup" aria-label={t("create.kindLabel")}>
                        <For each={Object.keys(CROP_KINDS) as CropKind[]}>
                            {(option) => {
                                const Icon = KIND_ICONS[option];
                                return (
                                    <button type="button" role="radio" aria-checked={kind() === option}
                                            onClick={() => setKind(option)}
                                            class={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${kind() === option
                                                ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-card hover:bg-surface"}`}>
                                        <span
                                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-700 text-white">
                                            <Icon size={20}/>
                                        </span>
                                        <span>
                                            <span class="block font-semibold">{CROP_KINDS[option].label}</span>
                                            <span class="mt-0.5 block text-sm text-muted">{CROP_KINDS[option].hint}</span>
                                            <span class="mt-1 block text-xs text-muted">
                                                {option === "REAL" ? t("create.realNote") : t("create.virtualNote")}
                                            </span>
                                        </span>
                                    </button>
                                );
                            }}
                        </For>
                    </div>
                    <Alert tone="warning">
                        {t("create.kindWarning")}
                    </Alert>
                </div>
            </Show>

            <Show when={step() === "details" && kind()}>
                {(currentKind) => (
                    <div class="grid gap-5 sm:grid-cols-2">
                        <form id="create-crop" onSubmit={create} class="space-y-4" noValidate>
                            <Show when={error()}>
                                {(err) => <Alert tone="danger">{err()}</Alert>}
                            </Show>
                            <TextField label={t("create.name")} placeholder={t("create.namePlaceholder")} value={name()} maxLength={60}
                                       onChange={(event) => setName(event.currentTarget.value)}/>
                            <SelectField label={t("create.species")} value={type()}
                                         onChange={(event) => setType(event.currentTarget.value as CropType)}
                                         hint={CROP_TYPES[type()].hint}>
                                <For each={Object.entries(CROP_TYPES)}>
                                    {([value, info]) => <option value={value}>{info.label}</option>}
                                </For>
                            </SelectField>
                            <fieldset>
                                <legend class="mb-1.5 text-sm font-semibold">{t("create.form")}</legend>
                                <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("create.form")}>
                                    <For each={Object.keys(CROP_FORMS) as CropForm[]}>
                                        {(option) => (
                                            <button type="button" role="radio" aria-checked={form() === option}
                                                    onClick={() => setForm(option)}
                                                    title={CROP_FORMS[option].hint}
                                                    class={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${form() === option
                                                        ? "border-leaf-600 bg-leaf-50 text-accent-strong ring-2 ring-leaf-600/30" : "border-line bg-card hover:bg-surface"}`}>
                                                {CROP_FORMS[option].label}
                                            </button>
                                        )}
                                    </For>
                                </div>
                                <p class="mt-1.5 text-xs text-muted">{CROP_FORMS[form()].hint}</p>
                            </fieldset>
                        </form>
                        <div class="space-y-3">
                            <CropScene form={form()} type={type()} installed={STARTING_ACTUATORS[currentKind()]}
                                       running={NOTHING_RUNNING} isDay
                                       setting={placement().setting} exposure={placement().exposure}
                                       vigor="healthy"
                                       label={t("create.preview", {species: CROP_TYPES[type()].label, form: CROP_FORMS[form()].phrase})}/>
                            <p class="text-xs text-muted">
                                {currentKind() === "REAL" ? t("create.realStarts") : t("create.virtualStarts")}
                            </p>
                        </div>
                        <div class="space-y-2 sm:col-span-2">
                            <p class="text-sm font-semibold">{t("create.where")}<span class="font-normal text-muted">{t("create.whereHint")}</span>
                            </p>
                            <PlacementPicker type={type()} value={placement()} onChange={setPlacement}/>
                        </div>
                        <Show when={currentKind() === "VIRTUAL"}>
                            <div class="space-y-3 sm:col-span-2">
                                <p class="text-sm font-semibold">{t("create.simStart")}</p>
                                <ModePicker value={mode()} onChange={setMode}/>
                                <Show when={mode() === "WEATHER"}>
                                    <p class="text-xs text-muted">
                                        {placement().location
                                            ? t("create.weatherFollows", {name: placement().location!.name})
                                            : t("create.weatherPick")}
                                    </p>
                                </Show>
                                <Show when={mode() === "MANUAL"}>
                                    <p class="text-xs text-muted">{t("create.manualStart")}</p>
                                </Show>
                            </div>
                        </Show>
                    </div>
                )}
            </Show>

            <Show when={step() === "connect" && created()?.device}>
                <div class="space-y-4">
                    <p class="text-sm text-muted">
                        {t("create.ready", {name: created()!.crop.name})}
                    </p>
                    <ConnectionGuide credentials={created()!.device!}/>
                </div>
            </Show>
        </Dialog>
    );
}
