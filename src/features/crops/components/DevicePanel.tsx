import {KeyRound, Wifi, WifiOff} from "lucide-solid";
import {createSignal, Show} from "solid-js";
import {Button} from "../../../components/ui/Button";
import {Dialog} from "../../../components/ui/Dialog";
import {Alert} from "../../../components/ui/Feedback";
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
