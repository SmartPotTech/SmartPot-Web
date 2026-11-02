import {A} from "@solidjs/router";
import {BellRing, Copy, ExternalLink, Save, Share2, Trash2} from "lucide-solid";
import {createSignal, For, Show} from "solid-js";
import {Button} from "../../../components/ui/Button";
import {Alert} from "../../../components/ui/Feedback";
import {Switch} from "../../../components/ui/Switch";
import {useResource} from "../../../hooks/useResource";
import {ApiError} from "../../../lib/api/client";
import {cropChannelApi} from "../../../lib/api/services";
import {timeAgo} from "../../../lib/format";
import {t, type TranslationKey} from "../../../lib/i18n";
import type {Crop, CropChannel, Delivery, LinkCode, NotificationType} from "../../../lib/api/types";

/** Qué puede avisar un cultivo (las novedades de la cuenta no son de un cultivo). */
const CROP_EVENTS: { type: NotificationType; label: TranslationKey }[] = [
    {type: "ALERT", label: "cropNotif.event.ALERT"},
    {type: "DEVICE", label: "cropNotif.event.DEVICE"},
    {type: "AI", label: "cropNotif.event.AI"},
    {type: "COMMAND", label: "cropNotif.event.COMMAND"},
];
const DIGEST_HOURS = [1, 2, 3, 6, 12, 24];

/**
 * Avisos de este cultivo fuera de la app, por cada aplicación vinculada en el perfil (hoy Telegram). Si no hay
 * ninguna vinculada, solo se invita a vincularla; así la sección crece sola cuando se sumen más aplicaciones.
 */
export function CropNotifications(props: { crop: Crop }) {
    const channels = useResource(() => cropChannelApi.list(props.crop.id), () => [props.crop.id]);
    const ready = () => (channels.data ?? []).filter((channel) => channel.available && channel.linked);

    return (
        <Show when={!channels.error} fallback={<Alert tone="danger">{channels.error}</Alert>}>
            <Show when={channels.data}>
                <Show when={ready().length > 0} fallback={
                    <section class="card p-5">
                        <h3 class="flex items-center gap-2 font-semibold"><BellRing size={16} class="text-accent"/> {t("cropNotif.outsideTitle")}</h3>
                        <p class="mt-1 text-sm text-muted">
                            {t("cropNotif.linkBefore")}<A href="/app/profile"
                                                         class="font-semibold text-link hover:underline">{t("cropNotif.linkProfile")}</A>{t("cropNotif.linkAfter")}
                        </p>
                    </section>
                }>
                    <For each={ready()}>
                        {(channel) => (
                            <ChannelSettings crop={props.crop} channel={channel}
                                             onChanged={() => void channels.reload()}/>
                        )}
                    </For>
                </Show>
            </Show>
        </Show>
    );
}

function ChannelSettings(props: { crop: Crop; channel: CropChannel; onChanged: () => void }) {
    const [enabled, setEnabled] = createSignal(props.channel.enabled);
    const [events, setEvents] = createSignal<NotificationType[]>(props.channel.events);
    const [delivery, setDelivery] = createSignal<Delivery>(props.channel.delivery);
    const [digestHours, setDigestHours] = createSignal(props.channel.digestHours || 6);
    const [daily, setDaily] = createSignal(Boolean(props.channel.dailySummaryAt));
    const [dailyAt, setDailyAt] = createSignal(props.channel.dailySummaryAt ?? "07:00");
    const [code, setCode] = createSignal<LinkCode | null>(null);
    const [busy, setBusy] = createSignal<string | null>(null);
    const [message, setMessage] = createSignal<{ tone: "success" | "danger" | "info"; text: string } | null>(null);

    async function run(key: string, task: () => Promise<unknown>, success?: string) {
        setBusy(key);
        setMessage(null);
        try {
            await task();
            if (success) setMessage({tone: "success", text: success});
            props.onChanged();
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : t("channels.failed")});
        } finally {
            setBusy(null);
        }
    }

    const save = () => void run("save", () => cropChannelApi.update(props.crop.id, props.channel.type, {
        enabled: enabled(),
        events: events(),
        delivery: delivery(),
        digestHours: digestHours(),
        dailySummaryAt: daily() ? dailyAt() : "",
    }), t("cropNotif.saved"));

    const share = () => void run("share", async () => {
        const created = await cropChannelApi.share(props.crop.id, props.channel.type);
        setCode(created);
    });

    async function copy(url: string) {
        try {
            await navigator.clipboard.writeText(url);
            setMessage({tone: "info", text: t("cropNotif.copied")});
        } catch {
            setMessage({tone: "danger", text: t("cropNotif.copyFailed")});
        }
    }

    return (
        <section class="card space-y-4 p-5" aria-label={t("cropNotif.region", {name: props.channel.name})}>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h3 class="flex items-center gap-2 font-semibold"><BellRing size={16} class="text-accent"/> {t("cropNotif.byChannel", {name: props.channel.name})}</h3>
                    <p class="text-sm text-muted">{t("cropNotif.byChannelBody")}</p>
                </div>
                <Switch checked={enabled()} label={t("cropNotif.toggle", {name: props.channel.name})}
                        onChange={setEnabled}/>
            </div>
            <Show when={message()}>
                {(msg) => <Alert tone={msg().tone}>{msg().text}</Alert>}
            </Show>

            <fieldset disabled={!enabled()} class="space-y-4 disabled:opacity-60">
                <div>
                    <p class="text-sm font-semibold">{t("cropNotif.what")}</p>
                    <div class="mt-2 grid gap-2 sm:grid-cols-2">
                        <For each={CROP_EVENTS}>
                            {(item) => (
                                <label class="flex items-center gap-2 text-sm">
                                    <input type="checkbox" class="h-4 w-4 accent-leaf-700"
                                           checked={events().includes(item.type)}
                                           onChange={(event) => setEvents((current) => event.currentTarget.checked
                                               ? [...new Set([...current, item.type])]
                                               : current.filter((type) => type !== item.type))}/>
                                    {t(item.label)}
                                </label>
                            )}
                        </For>
                    </div>
                </div>

                <div>
                    <p class="text-sm font-semibold">{t("cropNotif.when")}</p>
                    <div class="mt-2 flex flex-wrap items-center gap-4 text-sm" role="radiogroup"
                         aria-label={t("cropNotif.whenLabel")}>
                        <label class="flex items-center gap-2">
                            <input type="radio" name={`delivery-${props.channel.type}`} class="accent-leaf-700"
                                   checked={delivery() === "INSTANT"} onChange={() => setDelivery("INSTANT")}/>
                            {t("cropNotif.instant")}
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" name={`delivery-${props.channel.type}`} class="accent-leaf-700"
                                   checked={delivery() === "DIGEST"} onChange={() => setDelivery("DIGEST")}/>
                            {t("cropNotif.digestEvery")}
                        </label>
                        <select value={digestHours()} disabled={delivery() !== "DIGEST"}
                                aria-label={t("cropNotif.digestLabel")}
                                onChange={(event) => setDigestHours(Number(event.currentTarget.value))}
                                class="h-9 rounded-lg border border-line bg-card px-2 disabled:opacity-50">
                            <For each={DIGEST_HOURS}>
                                {(hours) => <option value={hours}>{t("cropNotif.hours", {count: hours})}</option>}
                            </For>
                        </select>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 text-sm">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" class="h-4 w-4 accent-leaf-700" checked={daily()}
                               onChange={(event) => setDaily(event.currentTarget.checked)}/>
                        <span class="font-semibold">{t("cropNotif.dailySummary")}</span>{t("cropNotif.at")}
                    </label>
                    <input type="time" value={dailyAt()} disabled={!daily()} aria-label={t("cropNotif.dailyLabel")}
                           onChange={(event) => setDailyAt(event.currentTarget.value)}
                           class="h-9 rounded-lg border border-line bg-card px-2 disabled:opacity-50"/>
                    <span class="text-xs text-muted">{t("cropNotif.dailyBody")}</span>
                </div>
            </fieldset>

            <Button icon={<Save size={16}/>} loading={busy() === "save"} onClick={save}>{t("cropNotif.saveAlerts")}</Button>

            <div class="border-t border-line pt-4">
                <p class="text-sm font-semibold">{t("cropNotif.sharedWith")}</p>
                <p class="text-xs text-muted">
                    {t("cropNotif.shareBody", {name: props.channel.name})}
                </p>
                <ul class="mt-2 divide-y divide-line">
                    <For each={props.channel.recipients}>
                        {(recipient) => (
                            <li class="flex items-center justify-between gap-2 py-2 text-sm">
                                <span>{recipient.displayName ?? t("cropNotif.unnamedChat")}
                                    {recipient.addedAt &&
                                        <span class="text-muted">{t("cropNotif.since", {time: timeAgo(recipient.addedAt)})}</span>}</span>
                                <Button size="sm" variant="ghost" icon={<Trash2 size={14}/>}
                                        loading={busy() === `remove-${recipient.id}`}
                                        aria-label={t("cropNotif.stopShareLabel", {name: recipient.displayName ?? t("cropNotif.thisChat")})}
                                        onClick={() => void run(`remove-${recipient.id}`,
                                            () => cropChannelApi.removeRecipient(props.crop.id, props.channel.type, recipient.id), t("cropNotif.stopped"))}>
                                    {t("cropNotif.remove")}
                                </Button>
                            </li>
                        )}
                    </For>
                    <Show when={props.channel.recipients.length === 0}>
                        <li class="py-2 text-sm text-muted">{t("cropNotif.notShared")}</li>
                    </Show>
                </ul>
                <Button size="sm" variant="secondary" class="mt-2" icon={<Share2 size={14}/>}
                        loading={busy() === "share"}
                        disabled={props.channel.recipients.length >= 10} onClick={share}>
                    {t("cropNotif.shareButton")}
                </Button>
                <Show when={code()}>
                    {(c) => (
                        <div class="mt-3 space-y-2 rounded-xl bg-surface p-3 text-sm">
                            <p>{t("cropNotif.sendLink", {time: timeAgo(c().expiresAt)})}</p>
                            <p class="break-all font-mono text-xs">{c().url}</p>
                            <div class="flex flex-wrap gap-2">
                                <Button size="sm" variant="secondary" icon={<Copy size={14}/>}
                                        onClick={() => void copy(c().url)}>{t("cropNotif.copyLink")}</Button>
                                <Button size="sm" variant="ghost" icon={<ExternalLink size={14}/>}
                                        onClick={() => window.open(c().url, "_blank", "noopener,noreferrer")}>{t("cropNotif.open")}</Button>
                                <Button size="sm" variant="ghost" onClick={() => {
                                    setCode(null);
                                    props.onChanged();
                                }}>{t("cropNotif.used")}</Button>
                            </div>
                        </div>
                    )}
                </Show>
            </div>
        </section>
    );
}
