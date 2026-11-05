import {Bot, Send, SlidersHorizontal, Zap} from "lucide-solid";
import {createSignal, For, Show} from "solid-js";
import {HeaderStat, PageHeader} from "../../components/layout/PageHeader";
import {Button} from "../../components/ui/Button";
import {SelectField} from "../../components/ui/Field";
import {Alert, EmptyState} from "../../components/ui/Feedback";
import {SkeletonCard} from "../../components/ui/Skeleton";
import {Switch} from "../../components/ui/Switch";
import {usePageMeta} from "../../hooks/usePageMeta";
import {useResource} from "../../hooks/useResource";
import {ApiError} from "../../lib/api/client";
import {cropApi} from "../../lib/api/services";
import {ACTUATORS, CROP_TYPES, QUICK_ACTIONS} from "../../lib/catalog";
import {describeAction, formatDuration} from "../../lib/format";
import {t} from "../../lib/i18n";
import type {ActuatorType, CommandAction, Crop} from "../../lib/api/types";
import {BulkResultList} from "./BulkResultList";
import {useBulkCommand} from "./useBulkCommand";

const DURATIONS = [5, 15, 30, 60, 300, 600, 900, 1800, 3600];

/** Control general: modo automático y órdenes a varios cultivos a la vez. */
export function ControlPage() {
    usePageMeta(() => t("control.title"));
    const crops = useResource(() => cropApi.list(), [], 30_000);
    const list = () => crops.data ?? [];
    const [excluded, setExcluded] = createSignal<Set<string>>(new Set());
    const [automationBusy, setAutomationBusy] = createSignal<string | null>(null);
    const [automationError, setAutomationError] = createSignal<string | null>(null);
    const bulk = useBulkCommand(() => void crops.reload());
    const [actuator, setActuator] = createSignal<ActuatorType>("WATER_PUMP");
    const [action, setAction] = createSignal<CommandAction>("ACTIVATE");
    const [duration, setDuration] = createSignal<number>(ACTUATORS.WATER_PUMP.defaultSeconds ?? 15);

    const selected = () => list().filter((crop) => !excluded().has(crop.id));
    const selectedIds = () => selected().length === list().length ? undefined : selected().map((crop) => crop.id);
    const automated = () => list().filter((crop) => crop.automationEnabled).length;

    function toggleCrop(cropId: string) {
        setExcluded((current) => {
            const next = new Set(current);
            if (next.has(cropId)) next.delete(cropId);
            else next.add(cropId);
            return next;
        });
    }

    async function setAutomation(key: string, enabled: boolean, cropIds?: string[]) {
        setAutomationBusy(key);
        setAutomationError(null);
        try {
            const [only] = cropIds ?? [];
            if (cropIds?.length === 1 && only) await cropApi.setAutomation(only, enabled);
            else await cropApi.setAutomationBulk(enabled, cropIds);
            await crops.reload();
        } catch (caught) {
            setAutomationError(caught instanceof ApiError ? caught.message : t("control.autoFailed"));
        } finally {
            setAutomationBusy(null);
        }
    }

    function submit(event: SubmitEvent) {
        event.preventDefault();
        void bulk.send("custom", {
            actuatorType: actuator(),
            action: action(),
            durationSeconds: action() === "ACTIVATE" ? duration() : null,
            cropIds: selectedIds(),
        });
    }

    return (
        <div class="space-y-6">
            <PageHeader eyebrow={t("control.eyebrow")} title={t("control.title")}
                        icon={<SlidersHorizontal size={24}/>}
                        description={t("control.description")}>
                <Show when={list().length > 0}>
                    <div class="grid grid-cols-3 gap-3">
                        <HeaderStat label={t("control.statCrops")} value={list().length}/>
                        <HeaderStat label={t("control.statAutomatic")} value={automated()}/>
                        <HeaderStat label={t("control.statSelected")} value={selected().length}/>
                    </div>
                </Show>
            </PageHeader>

            <Show when={crops.error}>
                {(err) => <Alert tone="danger">{err()}</Alert>}
            </Show>
            <Show when={!(crops.loading && !crops.data)} fallback={
                <div class="grid gap-6 lg:grid-cols-2">
                    <SkeletonCard height="min-h-[340px]"/>
                    <SkeletonCard height="min-h-[340px]"/>
                </div>
            }>
                <Show when={list().length > 0} fallback={
                    <EmptyState icon={<SlidersHorizontal size={26}/>} title={t("control.emptyTitle")}>
                        {t("control.emptyBody")}
                    </EmptyState>
                }>
                    <div class="grid gap-6 lg:grid-cols-2">
                        <section class="card p-5">
                            <div class="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 class="flex items-center gap-2 text-lg font-semibold"><Bot size={18}
                                                                                                   class="text-accent"/> {t("control.autoTitle")}</h2>
                                    <p class="text-sm text-muted">{t("control.autoBody")}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Button size="sm" loading={automationBusy() === "all-on"}
                                            onClick={() => void setAutomation("all-on", true)}>
                                        {t("control.enableAll")}
                                    </Button>
                                    <Button size="sm" variant="secondary" loading={automationBusy() === "all-off"}
                                            onClick={() => void setAutomation("all-off", false)}>{t("control.disableAll")}</Button>
                                </div>
                            </div>
                            <Show when={automationError()}>
                                {(err) => <div class="mt-3"><Alert tone="danger">{err()}</Alert></div>}
                            </Show>
                            <ul class="mt-4 divide-y divide-line">
                                <For each={list()}>
                                    {(crop: Crop) => (
                                        <li class="flex items-center justify-between gap-3 py-3">
                                            <div class="min-w-0">
                                                <p class="truncate font-medium">{crop.name}</p>
                                                <p class="text-xs text-muted">{CROP_TYPES[crop.type].label} · {crop.device.online ? t("control.online") : t("control.offline")}</p>
                                            </div>
                                            <Switch checked={crop.automationEnabled}
                                                    label={t("control.autoOf", {name: crop.name})}
                                                    disabled={automationBusy() !== null}
                                                    onChange={(enabled) => void setAutomation(crop.id, enabled, [crop.id])}/>
                                        </li>
                                    )}
                                </For>
                            </ul>
                        </section>

                        <section class="card p-5">
                            <h2 class="flex items-center gap-2 text-lg font-semibold"><Zap size={18}
                                                                                           class="text-accent"/> {t("control.bulkTitle")}</h2>
                            <p class="text-sm text-muted">{t("control.bulkBody")}</p>

                            <fieldset class="mt-4">
                                <legend class="text-sm font-semibold">{t("control.crops")}</legend>
                                <div class="mt-2 flex flex-wrap gap-2">
                                    <For each={list()}>
                                        {(crop) => {
                                            const on = () => !excluded().has(crop.id);
                                            return (
                                                <label class={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm
                          ${on() ? "border-leaf-600 bg-leaf-50 text-accent-strong" : "border-line text-muted"}`}>
                                                    <input type="checkbox" class="accent-leaf-700" checked={on()}
                                                           onChange={() => toggleCrop(crop.id)}/>
                                                    {crop.name}
                                                </label>
                                            );
                                        }}
                                    </For>
                                </div>
                            </fieldset>

                            <div class="mt-5">
                                <p class="text-sm font-semibold">{t("control.shortcuts")}</p>
                                <div class="mt-2 flex flex-wrap gap-2">
                                    <For each={QUICK_ACTIONS}>
                                        {(quick) => (
                                            <Button size="sm" variant="secondary"
                                                    disabled={selected().length === 0}
                                                    loading={bulk.sending === quick.label}
                                                    onClick={() => void bulk.send(quick.label, {
                                                        ...quick,
                                                        cropIds: selectedIds(),
                                                    })}>
                                                {quick.label}
                                            </Button>
                                        )}
                                    </For>
                                </div>
                            </div>

                            <form onSubmit={submit} class="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-surface p-4"
                                  noValidate>
                                <div class="col-span-2">
                                    <SelectField label={t("control.actuator")} value={actuator()} onChange={(event) => {
                                        const next = event.currentTarget.value as ActuatorType;
                                        setActuator(next);
                                        setDuration(ACTUATORS[next].defaultSeconds ?? 15);
                                    }}>
                                        <For each={Object.entries(ACTUATORS)}>
                                            {([value, info]) => <option value={value}>{info.label}</option>}
                                        </For>
                                    </SelectField>
                                </div>
                                <SelectField label={t("control.action")} value={action()}
                                             onChange={(event) => setAction(event.currentTarget.value as CommandAction)}>
                                    <option value="ACTIVATE">{t("control.turnOn")}</option>
                                    <option value="DEACTIVATE">{t("control.turnOff")}</option>
                                </SelectField>
                                <SelectField label={t("control.duration")} value={String(duration())}
                                             disabled={action() === "DEACTIVATE"}
                                             onChange={(event) => setDuration(Number(event.currentTarget.value))}>
                                    <For each={DURATIONS}>
                                        {(seconds) => <option value={seconds}>{formatDuration(seconds)}</option>}
                                    </For>
                                </SelectField>
                                <Button type="submit" class="col-span-2" icon={<Send size={16}/>}
                                        loading={bulk.sending === "custom"}
                                        disabled={selected().length === 0}>
                                    {t("control.submit", {
                                        action: describeAction(actuator(), action(), action() === "ACTIVATE" ? duration() : null),
                                        count: selected().length,
                                    })}
                                </Button>
                            </form>

                            <div class="mt-4 space-y-3">
                                <Show when={bulk.error}>
                                    {(err) => <Alert tone="danger">{err()}</Alert>}
                                </Show>
                                <Show when={bulk.result}>
                                    {(res) => <BulkResultList result={res()}/>}
                                </Show>
                            </div>
                        </section>
                    </div>
                </Show>
            </Show>
        </div>
    );
}
