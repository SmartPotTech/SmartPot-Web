import {Cpu, KeyRound, Wifi, WifiOff} from "lucide-solid";
import {createSignal, For, Show} from "solid-js";
import {Button} from "../../../components/ui/Button";
import {Dialog} from "../../../components/ui/Dialog";
import {Alert, Badge} from "../../../components/ui/Feedback";
import {useResource} from "../../../hooks/useResource";
import {ApiError} from "../../../lib/api/client";
import {cropApi} from "../../../lib/api/services";
import {formatDateTime, timeAgo} from "../../../lib/format";
import type {Crop, DeviceCredentials} from "../../../lib/api/types";
import {t} from "../../../lib/i18n";
import {ConnectionGuide} from "./ConnectionGuide";
import {CredentialsView} from "./CredentialsView";

export function DevicePanel(props: { crop: Crop }) {
    const device = useResource(() => cropApi.device(props.crop.id), () => [props.crop.id]);
    const [confirming, setConfirming] = createSignal(false);
    const [rotated, setRotated] = createSignal<DeviceCredentials | null>(null);
    const [error, setError] = createSignal<string | null>(null);
    const [loading, setLoading] = createSignal(false);

    async function rotate() {
        setLoading(true);
        setError(null);
        try {
            setRotated(await cropApi.rotateKey(props.crop.id));
            setConfirming(false);
            void device.reload();
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : t("device.rotateFailed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div class="space-y-5">
            <section class="card flex items-center gap-4 p-5">
                <div class={`flex h-11 w-11 items-center justify-center rounded-xl ${props.crop.device.online
                    ? "bg-leaf-50 text-accent" : "bg-surface text-muted"}`}>
                    <Show when={props.crop.device.online} fallback={<WifiOff size={22}/>}>
                        <Wifi size={22}/>
                    </Show>
                </div>
                <div>
                    <p class="font-semibold">{props.crop.device.online ? t("device.online") : t("device.offline")}</p>
                    <p class="text-sm text-muted">{t("device.lastSignal", {time: timeAgo(props.crop.device.lastSeenAt)})}</p>
                </div>
            </section>

            <Show when={props.crop.device.capabilities}>
                {(caps) => (
                    <section class="card space-y-4 p-5" aria-labelledby="hardware-specs-title">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 id="hardware-specs-title" class="flex items-center gap-2 font-semibold text-ink">
                                    <Cpu size={18} class="text-accent"/> {t("device.specsTitle")}
                                </h3>
                                <Show when={props.crop.device.capabilitiesUpdatedAt}>
                                    {(updated) => (
                                        <p class="text-xs text-muted">{t("device.specsUpdated", {time: timeAgo(updated())})}</p>
                                    )}
                                </Show>
                            </div>
                            <Show when={props.crop.device.capabilitiesStale}>
                                <Badge tone="warning">{t("device.specsStale")}</Badge>
                            </Show>
                        </div>

                        <div class="grid gap-3 sm:grid-cols-2">
                            <Show when={caps().device?.firmware}>
                                <div class="rounded-lg bg-surface p-3">
                                    <p class="text-xs font-semibold uppercase text-muted">{t("device.specsFirmware")}</p>
                                    <p class="mt-0.5 text-sm font-medium text-ink">{caps().device!.firmware}</p>
                                </div>
                            </Show>
                            <Show when={caps().device?.hardware}>
                                <div class="rounded-lg bg-surface p-3">
                                    <p class="text-xs font-semibold uppercase text-muted">{t("device.specsHardware")}</p>
                                    <p class="mt-0.5 text-sm font-medium text-ink">{caps().device!.hardware}</p>
                                </div>
                            </Show>
                        </div>

                        <Show when={caps().device?.telemetry?.formats?.length}>
                            <div class="rounded-lg bg-surface p-3">
                                <p class="text-xs font-semibold uppercase text-muted">{t("device.specsTelemetry")}</p>
                                <div class="mt-1 flex flex-wrap gap-1.5">
                                    <For each={caps().device!.telemetry!.formats!}>
                                        {(fmt) => <Badge tone="neutral">{fmt}</Badge>}
                                    </For>
                                    <Show when={caps().device?.telemetry?.compactBytes}>
                                        <span class="self-center text-xs text-muted">({caps().device!.telemetry!.compactBytes} bytes)</span>
                                    </Show>
                                </div>
                            </div>
                        </Show>

                        <Show when={caps().sensors?.length}>
                            <div>
                                <p class="mb-2 text-xs font-semibold uppercase text-muted">{t("device.specsSensors")}</p>
                                <div class="grid gap-2 sm:grid-cols-2">
                                    <For each={caps().sensors}>
                                        {(sensor) => (
                                            <div class="flex items-center justify-between rounded-lg border border-line bg-card p-2.5 text-xs">
                                                <span class="font-semibold text-ink">{sensor.key}</span>
                                                <div class="flex items-center gap-2 text-muted">
                                                    <Show when={sensor.unit}><Badge tone="success">{sensor.unit}</Badge></Show>
                                                    <Show when={sensor.range && sensor.range.length === 2 && sensor.range[0] != null && sensor.range[1] != null}>
                                                        <span>{sensor.range![0]}..{sensor.range![1]}</span>
                                                    </Show>
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </div>
                        </Show>

                        <Show when={caps().actuators?.length}>
                            <div>
                                <p class="mb-1.5 text-xs font-semibold uppercase text-muted">{t("device.specsActuators")}</p>
                                <div class="flex flex-wrap gap-1.5">
                                    <For each={caps().actuators}>
                                        {(actuator) => <Badge tone="neutral">{actuator}</Badge>}
                                    </For>
                                </div>
                            </div>
                        </Show>
                    </section>
                )}
            </Show>

            <section class="card p-5">
                <h3 class="font-semibold">{t("device.howTitle")}</h3>
                <p class="mt-1 text-sm text-muted">
                    {t("device.howBody")}
                </p>
                <div class="mt-4">
                    <Show when={device.data} fallback={
                        <Show when={device.error} fallback={<p class="text-sm text-muted">{t("common.loading")}</p>}>
                            {(err) => <Alert tone="danger">{err()}</Alert>}
                        </Show>
                    }>
                        {(data) => <ConnectionGuide credentials={data()}/>}
                    </Show>
                </div>
            </section>

            <section class="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                    <h3 class="font-semibold">{t("device.keyTitle")}</h3>
                    <p class="text-sm text-muted">{t("device.keyGenerated", {date: formatDateTime(props.crop.device.keyRotatedAt)})}</p>
                </div>
                <Button variant="secondary" icon={<KeyRound size={16}/>} onClick={() => setConfirming(true)}>{t("device.newKey")}</Button>
            </section>

            <Dialog open={confirming()} title={t("device.confirmTitle")} onClose={() => setConfirming(false)}
                    footer={<>
                        <Button variant="secondary" onClick={() => setConfirming(false)}>{t("common.cancel")}</Button>
                        <Button onClick={() => void rotate()} loading={loading()}>{t("device.generate")}</Button>
                    </>}>
                <Show when={error()}>
                    {(err) => <div class="mb-3"><Alert tone="danger">{err()}</Alert></div>}
                </Show>
                <p class="text-sm text-muted">
                    {t("device.confirmBody")}
                </p>
            </Dialog>

            <Dialog open={Boolean(rotated())} title={t("device.newKeyTitle")} onClose={() => setRotated(null)}
                    footer={<Button onClick={() => setRotated(null)}>{t("device.saved")}</Button>}>
                <Show when={rotated()}>
                    {(cred) => <CredentialsView credentials={cred()}/>}
                </Show>
            </Dialog>
        </div>
    );
}
