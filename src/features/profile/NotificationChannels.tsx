import {AppWindow, ExternalLink, Send, Unlink} from "lucide-solid";
import {createSignal, For, Show} from "solid-js";
import {Button} from "../../components/ui/Button";
import {Alert, Badge} from "../../components/ui/Feedback";
import {Switch} from "../../components/ui/Switch";
import {useResource} from "../../hooks/useResource";
import {ApiError} from "../../lib/api/client";
import {channelApi} from "../../lib/api/services";
import {timeAgo} from "../../lib/format";
import {t, type TranslationKey} from "../../lib/i18n";
import type {ChannelLink, ChannelOption, LinkCode, NotificationType} from "../../lib/api/types";

const EVENT_LABELS: Record<NotificationType, TranslationKey> = {
    ALERT: "channels.event.ALERT",
    DEVICE: "channels.event.DEVICE",
    AI: "channels.event.AI",
    COMMAND: "channels.event.COMMAND",
    INFO: "channels.event.INFO",
};
const EVENTS = Object.keys(EVENT_LABELS) as NotificationType[];

type Message = { tone: "success" | "danger" | "info"; text: string } | null;

/**
 * Aplicaciones donde llegan los avisos fuera de SmartPot. Hoy Telegram; el servidor dice cuáles ofrece y, si falta
 * configurar una, se ve en gris con lo que necesita. Aquí se vincula el chat y se eligen los avisos por defecto; cada
 * cultivo afina los suyos en Ajustes.
 */
export function NotificationChannels() {
    const channels = useResource(() => channelApi.list(), []);
    const [code, setCode] = createSignal<LinkCode | null>(null);
    const [message, setMessage] = createSignal<Message>(null);
    const [busy, setBusy] = createSignal<string | null>(null);

    async function run(key: string, action: () => Promise<unknown>, success?: string) {
        setBusy(key);
        setMessage(null);
        try {
            await action();
            if (success) setMessage({tone: "success", text: success});
            await channels.reload();
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : t("channels.failed")});
        } finally {
            setBusy(null);
        }
    }

    async function startLink() {
        await run("link", async () => {
            const created = await channelApi.link("telegram");
            setCode(created);
            window.open(created.url, "_blank", "noopener,noreferrer");
        });
    }

    return (
        <section class="card space-y-4 p-5" aria-labelledby="channels-title">
            <div>
                <h2 id="channels-title" class="flex items-center gap-2 text-lg font-semibold">
                    <AppWindow size={18} class="text-accent"/> {t("channels.title")}
                </h2>
                <p class="text-sm text-muted">
                    {t("channels.description")}
                </p>
            </div>
            <Show when={message()}>
                {(msg) => <Alert tone={msg().tone}>{msg().text}</Alert>}
            </Show>
            <Show when={channels.error}>
                {(err) => <Alert tone="danger">{err()}</Alert>}
            </Show>
            <For each={channels.data ?? []}>
                {(option) => (
                    <ChannelRow option={option} code={code()} busy={busy()}
                                onLink={() => void startLink()}
                                onRefresh={() => void channels.reload()}
                                onUpdate={(link, body) => void run(`update-${link.id}`, () => channelApi.update(link.id, body))}
                                onTest={(link) => void run(`test-${link.id}`, () => channelApi.test(link.id), t("channels.testSent"))}
                                onUnlink={(link) => void run(`unlink-${link.id}`, () => channelApi.unlink(link.id), t("channels.unlinked"))}/>
                )}
            </For>
        </section>
    );
}

interface ChannelRowProps {
    option: ChannelOption;
    code: LinkCode | null;
    busy: string | null;
    onLink: () => void;
    onRefresh: () => void;
    onUpdate: (link: ChannelLink, body: { enabled?: boolean; events?: NotificationType[] }) => void;
    onTest: (link: ChannelLink) => void;
    onUnlink: (link: ChannelLink) => void;
}

export function ChannelRow(props: ChannelRowProps) {
    const link = () => props.option.link;
    const requirements = () => props.option.requirements ?? [];

    return (
        <Show when={props.option.available} fallback={
            <div class="rounded-xl border border-dashed border-line bg-surface p-4 text-sm opacity-75"
                 aria-disabled="true">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <p class="font-semibold text-muted">{props.option.name}</p>
                    <Badge tone="neutral">{t("channels.unavailable")}</Badge>
                </div>
                <Show when={props.option.description}>
                    <p class="mt-1 text-muted">{props.option.description}</p>
                </Show>
                <Button size="sm" class="mt-3" disabled>{t("channels.linkButton", {name: props.option.name})}</Button>
                <details class="mt-3 text-xs text-muted">
                    <summary class="touch-target cursor-pointer font-semibold">{t("channels.technical")}</summary>
                    <p class="mt-1">
                        {t("channels.notOffered", {name: props.option.name})}
                        <For each={requirements()}>
                            {(name, index) => (
                                <span>
                                    <code>{name}</code>
                                    {index() < requirements().length - 2 ? ", " : index() === requirements().length - 2 ? t("channels.and") : ""}
                                </span>
                            )}
                        </For>{" "}
                        {t("channels.restart")}
                    </p>
                </details>
            </div>
        }>
            <Show when={link()} fallback={
                <div class="rounded-xl bg-surface p-4">
                    <p class="font-semibold">{props.option.name} <span
                        class="font-normal text-muted">{props.option.handle}</span></p>
                    <Show when={props.option.description}>
                        <p class="mt-1 text-sm text-muted">{props.option.description}</p>
                    </Show>
                    <p class="mt-1 text-sm text-muted">
                        {t("channels.linkHelp", {name: props.option.name})}<strong>{t("channels.linkHelpStart")}</strong>{t("channels.linkHelpEnd")}
                    </p>
                    <div class="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" icon={<ExternalLink size={14}/>} loading={props.busy === "link"}
                                onClick={props.onLink}>
                            {t("channels.linkButton", {name: props.option.name})}
                        </Button>
                        <Show when={props.code}>
                            <Button size="sm" variant="secondary" onClick={props.onRefresh}>{t("channels.alreadyLinked")}</Button>
                        </Show>
                    </div>
                    <Show when={props.code}>
                        {(c) => (
                            <p class="mt-2 text-xs text-muted">
                                {t("channels.notOpened")}<a class="font-semibold text-link underline" href={c().url}
                                                           target="_blank"
                                                           rel="noopener noreferrer">{c().url.replace(/\?.*$/, "")}</a>{t("channels.andType")}<code>/start {c().code}</code>.{" "}
                                {t("channels.codeExpires", {time: timeAgo(c().expiresAt)})}
                            </p>
                        )}
                    </Show>
                </div>
            }>
                {(currentLink) => {
                    const toggle = (event: NotificationType, checked: boolean) => {
                        const events = checked
                            ? [...new Set([...currentLink().events, event])]
                            : currentLink().events.filter((item) => item !== event);
                        props.onUpdate(currentLink(), {events});
                    };

                    return (
                        <div class="rounded-xl border border-line p-4">
                            <div class="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p class="flex items-center gap-2 font-semibold">{props.option.name}
                                        <Badge
                                            tone={currentLink().enabled ? "success" : "neutral"}>
                                            {currentLink().enabled ? t("channels.active") : t("channels.paused")}
                                        </Badge>
                                    </p>
                                    <p class="text-sm text-muted">
                                        {t("channels.linkedTo", {name: currentLink().displayName ?? t("channels.yourChat")})}
                                        {currentLink().address && <>{t("channels.chatId")}<code>{currentLink().address}</code></>}
                                        {currentLink().lastDeliveredAt ? t("channels.lastAlert", {time: timeAgo(currentLink().lastDeliveredAt)}) : ""}
                                    </p>
                                </div>
                                <Switch checked={currentLink().enabled}
                                        label={t("channels.receiveVia", {name: props.option.name})}
                                        onChange={(enabled) => props.onUpdate(currentLink(), {enabled})}/>
                            </div>
                            <fieldset class="mt-3">
                                <legend class="text-sm font-semibold">{t("channels.defaults")}</legend>
                                <div class="mt-2 grid gap-2 sm:grid-cols-2">
                                    <For each={EVENTS}>
                                        {(event) => (
                                            <label class="flex items-center gap-2 text-sm">
                                                <input type="checkbox" class="h-4 w-4 accent-leaf-700"
                                                       checked={currentLink().events.includes(event)}
                                                       onChange={(changed) => toggle(event, changed.currentTarget.checked)}/>
                                                {t(EVENT_LABELS[event])}
                                            </label>
                                        )}
                                    </For>
                                </div>
                            </fieldset>
                            <div class="mt-3 flex flex-wrap gap-2">
                                <Button size="sm" variant="secondary" icon={<Send size={14}/>}
                                        loading={props.busy === `test-${currentLink().id}`}
                                        onClick={() => props.onTest(currentLink())}>{t("channels.test")}</Button>
                                <Button size="sm" variant="ghost" icon={<Unlink size={14}/>}
                                        loading={props.busy === `unlink-${currentLink().id}`}
                                        onClick={() => props.onUnlink(currentLink())}>{t("channels.unlink")}</Button>
                            </div>
                        </div>
                    );
                }}
            </Show>
        </Show>
    );
}
