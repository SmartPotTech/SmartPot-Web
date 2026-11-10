import {useNavigate} from "@solidjs/router";
import {MapPinned, Save, Trash2} from "lucide-solid";
import {createEffect, createSignal, For, Show} from "solid-js";
import {Button} from "../../../components/ui/Button";
import {SelectField, TextField} from "../../../components/ui/Field";
import {Alert} from "../../../components/ui/Feedback";
import {Dialog} from "../../../components/ui/Dialog";
import {ApiError} from "../../../lib/api/client";
import {cropApi} from "../../../lib/api/services";
import {CROP_FORMS, CROP_KINDS, CROP_TYPES} from "../../../lib/catalog";
import type {Crop, CropForm, CropType, Placement} from "../../../lib/api/types";
import {t} from "../../../lib/i18n";
import {CropNotifications} from "./CropNotifications";
import {PlacementPicker} from "./PlacementPicker";

export function SettingsPanel(props: { crop: Crop; onSaved: (crop: Crop) => void }) {
    const navigate = useNavigate();
    const [name, setName] = createSignal(props.crop.name);
    const [type, setType] = createSignal<CropType>(props.crop.type);
    const [form, setForm] = createSignal<CropForm>(props.crop.form);
    const [message, setMessage] = createSignal<{ tone: "success" | "danger"; text: string } | null>(null);
    const [saving, setSaving] = createSignal(false);
    const [deleting, setDeleting] = createSignal(false);
    const [confirmName, setConfirmName] = createSignal("");
    const [open, setOpen] = createSignal(false);
    const [placement, setPlacement] = createSignal<Placement | undefined>(props.crop.placement ?? undefined);
    const [placementMessage, setPlacementMessage] = createSignal<{ tone: "success" | "danger"; text: string } | null>(null);
    const [placing, setPlacing] = createSignal(false);

    // Mantiene sincronizado el estado del selector si el cultivo cambia externamente.
    createEffect(() => {
        setPlacement(props.crop.placement ?? undefined);
    });

    async function savePlacement() {
        setPlacing(true);
        setPlacementMessage(null);
        try {
            props.onSaved(await cropApi.update(props.crop.id, {
                name: name().trim(),
                type: type(),
                form: form(),
                placement: placement() ?? {},
            }));
            setPlacementMessage({tone: "success", text: t("settings.placementSaved")});
        } catch (caught) {
            setPlacementMessage({
                tone: "danger",
                text: caught instanceof ApiError ? caught.message : t("settings.saveFailed"),
            });
        } finally {
            setPlacing(false);
        }
    }

    async function save(event: SubmitEvent) {
        event.preventDefault();
        if (name().trim().length < 2) {
            setMessage({tone: "danger", text: t("settings.nameTooShort")});
            return;
        }
        setSaving(true);
        try {
            props.onSaved(await cropApi.update(props.crop.id, {
                name: name().trim(),
                type: type(),
                form: form(),
                placement: placement(),
            }));
            setMessage({tone: "success", text: t("settings.changesSaved")});
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : t("settings.saveFailed")});
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        setDeleting(true);
        try {
            await cropApi.remove(props.crop.id);
            navigate("/app/crops", {replace: true});
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : t("settings.deleteFailed")});
            setDeleting(false);
            setOpen(false);
        }
    }

    return (
        <div class="space-y-5">
            <form onSubmit={save} class="card space-y-4 p-5">
                <h3 class="font-semibold">{t("settings.dataTitle")}</h3>
                <Show when={message()}>
                    {(msg) => <Alert tone={msg().tone}>{msg().text}</Alert>}
                </Show>
                <TextField label={t("create.name")} value={name()} maxLength={60}
                           onChange={(event) => setName(event.currentTarget.value)}/>
                <SelectField label={t("create.species")} value={type()}
                             onChange={(event) => setType(event.currentTarget.value as CropType)}
                             hint={t("settings.speciesHint")}>
                    <For each={Object.entries(CROP_TYPES)}>
                        {([value, info]) => <option value={value}>{info.label}</option>}
                    </For>
                </SelectField>
                <SelectField label={t("create.form")} value={form()}
                             onChange={(event) => setForm(event.currentTarget.value as CropForm)}
                             hint={t("settings.formHint", {hint: CROP_FORMS[form()].hint})}>
                    <For each={Object.entries(CROP_FORMS)}>
                        {([value, info]) => <option value={value}>{info.label}</option>}
                    </For>
                </SelectField>
                <div class="rounded-xl bg-surface px-3 py-2 text-sm">
                    <p><span
                        class="font-semibold">{t("settings.kind", {kind: CROP_KINDS[props.crop.kind].label})}</span> {CROP_KINDS[props.crop.kind].hint}
                    </p>
                    <p class="mt-0.5 text-xs text-muted">{t("settings.kindFixed")}</p>
                </div>
                <Button type="submit" icon={<Save size={16}/>} loading={saving()}>{t("settings.saveChanges")}</Button>
            </form>

            <section class="card space-y-4 p-5" aria-labelledby="placement-title">
                <div>
                    <h3 id="placement-title" class="flex items-center gap-2 font-semibold">
                        <MapPinned size={16} class="text-accent"/> {t("settings.whereTitle")}
                    </h3>
                    <p class="text-sm text-muted">
                        {t("settings.whereBody", {extra: props.crop.kind === "VIRTUAL" ? t("settings.whereExtra") : ""})}
                    </p>
                </div>
                <Show when={placementMessage()}>
                    {(msg) => <Alert tone={msg().tone}>{msg().text}</Alert>}
                </Show>
                <PlacementPicker type={props.crop.type} value={placement() ?? {}} onChange={setPlacement}/>
                <Button icon={<Save size={16}/>} loading={placing()} onClick={() => void savePlacement()}>{t("settings.savePlace")}</Button>
            </section>

            <CropNotifications crop={props.crop}/>

            <section class="card border-danger-500/30 p-5">
                <h3 class="font-semibold text-danger-fg">{t("settings.deleteTitle")}</h3>
                <p class="mt-1 text-sm text-muted">{t("settings.deleteBody")}</p>
                <Button variant="danger" class="mt-4" icon={<Trash2 size={16}/>}
                        onClick={() => setOpen(true)}>{t("common.delete")}</Button>
            </section>

            <Dialog open={open()} title={t("settings.deleteTitle")} onClose={() => setOpen(false)}
                    footer={<>
                        <Button variant="secondary" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
                        <Button variant="danger" loading={deleting()} disabled={confirmName() !== props.crop.name}
                                onClick={() => void remove()}>
                            {t("settings.deleteForever")}
                        </Button>
                    </>}>
                <p class="mb-3 text-sm text-muted">{t("settings.deleteWarning")}<strong>{props.crop.name}</strong>{t("settings.deleteToConfirm")}</p>
                <TextField label={t("settings.cropName")} value={confirmName()}
                           onChange={(event) => setConfirmName(event.currentTarget.value)}/>
            </Dialog>
        </div>
    );
}
