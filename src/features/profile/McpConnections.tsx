import {Check, Copy, Plug, Plus, Trash2} from "lucide-solid";
import {createSignal, For, Show} from "solid-js";
import {Button} from "../../components/ui/Button";
import {Dialog} from "../../components/ui/Dialog";
import {SelectField, TextField} from "../../components/ui/Field";
import {Alert, Badge} from "../../components/ui/Feedback";
import {MCP_URL} from "../../config/env";
import {useResource} from "../../hooks/useResource";
import {ApiError} from "../../lib/api/client";
import {connectionApi} from "../../lib/api/services";
import type {Connection, ConnectionCreated, ConnectionScope} from "../../lib/api/types";
import {formatDateTime, timeAgo} from "../../lib/format";
import {t, type TranslationKey} from "../../lib/i18n";
import {CONNECTION_EXPIRY, DEFAULT_EXPIRY_INDEX, mcpClientConfig} from "../../lib/mcp";

type Message = { tone: "success" | "danger"; text: string } | null;

const SCOPES: { value: ConnectionScope; label: TranslationKey; description: TranslationKey }[] = [
    {value: "READ", label: "mcp.scope.read", description: "mcp.scope.readHint"},
    {value: "CONTROL", label: "mcp.scope.control", description: "mcp.scope.controlHint"},
];

/**
 * Conexiones personales para asistentes de IA compatibles con MCP. Cada una es un token propio, con su alcance, que
 * se revoca por separado: el asistente actúa a nombre de esta cuenta sin conocer la contraseña.
 */
export function McpConnections() {
    const connections = useResource(() => connectionApi.list(), []);
    const [name, setName] = createSignal("");
    const [scope, setScope] = createSignal<ConnectionScope>("READ");
    const [expiry, setExpiry] = createSignal(DEFAULT_EXPIRY_INDEX);
    const [nameError, setNameError] = createSignal<string | undefined>();
    const [created, setCreated] = createSignal<ConnectionCreated | null>(null);
    const [revoking, setRevoking] = createSignal<Connection | null>(null);
    const [message, setMessage] = createSignal<Message>(null);
    const [busy, setBusy] = createSignal<string | null>(null);
    const count = () => (connections.data ?? []).length;
    const atQuota = () => count() >= 10;

    async function create(event: SubmitEvent) {
        event.preventDefault();
        const trimmed = name().trim();
        if (!trimmed || trimmed.length > 60) {
            setNameError(trimmed ? t("mcp.nameMax") : t("mcp.nameRequired"));
            return;
        }
        setNameError(undefined);
        setBusy("create");
        setMessage(null);
        try {
            const result = await connectionApi.create({
                name: trimmed,
                scope: scope(),
                expiresInDays: CONNECTION_EXPIRY[expiry()]?.days,
            });
            setCreated(result);
            setName("");
            setExpiry(DEFAULT_EXPIRY_INDEX);
            await connections.reload();
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : t("mcp.createFailed")});
        } finally {
            setBusy(null);
        }
    }

    async function revoke(connection: Connection) {
        setBusy(`revoke-${connection.id}`);
        setMessage(null);
        try {
            await connectionApi.revoke(connection.id);
            if (created()?.connection.id === connection.id) setCreated(null);
            setMessage({tone: "success", text: t("mcp.revoked", {name: connection.name})});
            await connections.reload();
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : t("mcp.revokeFailed")});
        } finally {
            setBusy(null);
            setRevoking(null);
        }
    }

    return (
        <section class="card space-y-4 p-5" aria-labelledby="connections-title">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 id="connections-title" class="flex items-center gap-2 text-lg font-semibold">
                        <Plug size={18} class="text-accent"/> {t("mcp.title")}
                    </h2>
                    <p class="text-sm text-muted">
                        {t("mcp.description")}
                    </p>
                </div>
                <Badge tone={atQuota() ? "warning" : "neutral"}>
                    {t("mcp.quotaUsage", {current: count(), max: 10})}
                </Badge>
            </div>

            <Show when={message()}>
                {(msg) => <Alert tone={msg().tone}>{msg().text}</Alert>}
            </Show>

            <Show when={atQuota()}>
                <Alert tone="warning">{t("mcp.quotaReached")}</Alert>
            </Show>

            <Show when={created()}>
                {(result) => <CreatedConnection result={result()} onDone={() => setCreated(null)}/>}
            </Show>

            <form class="space-y-3 rounded-xl bg-surface p-4" onSubmit={(event) => void create(event)}>
                <TextField label={t("mcp.nameLabel")} value={name()} maxLength={60} error={nameError()}
                           placeholder={t("mcp.namePlaceholder")}
                           onChange={(event) => setName(event.currentTarget.value)}/>
                <fieldset>
                    <legend class="mb-1.5 text-sm font-medium text-ink">{t("mcp.scope")}</legend>
                    <div class="grid gap-2 sm:grid-cols-2">
                        <For each={SCOPES}>
                            {(option) => (
                                <label class={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${scope() === option.value
                                    ? "border-leaf-600 bg-card" : "border-line bg-card/60"}`}>
                                    <input type="radio" name="connection-scope" value={option.value} class="mt-1"
                                           checked={scope() === option.value}
                                           onChange={() => setScope(option.value)}/>
                                    <span>
                                        <span class="block font-semibold">{t(option.label)}</span>
                                        <span class="text-muted">{t(option.description)}</span>
                                    </span>
                                </label>
                            )}
                        </For>
                    </div>
                </fieldset>
                <SelectField label={t("mcp.expiry")} value={String(expiry())}
                             onChange={(event) => setExpiry(Number(event.currentTarget.value))}>
                    <For each={CONNECTION_EXPIRY}>
                        {(option, index) => <option value={String(index())}>{option.label}</option>}
                    </For>
                </SelectField>
                <Button type="submit" size="sm" icon={<Plus size={16}/>} loading={busy() === "create"} disabled={atQuota()}>
                    {t("mcp.create")}
                </Button>
            </form>

            <Show when={connections.error}>
                {(err) => <Alert tone="danger">{err()}</Alert>}
            </Show>
            <Show when={(connections.data ?? []).length > 0} fallback={
                <Show when={!connections.loading}>
                    <p class="text-sm text-muted">{t("mcp.none")}</p>
                </Show>
            }>
                <ul class="divide-y divide-line" aria-label={t("mcp.active")}>
                    <For each={connections.data ?? []}>
                        {(connection) => (
                            <ConnectionItem connection={connection} busy={busy() === `revoke-${connection.id}`}
                                            onRevoke={() => setRevoking(connection)}/>
                        )}
                    </For>
                </ul>
            </Show>

            <Dialog open={revoking() !== null} title={t("mcp.revokeTitle")} onClose={() => setRevoking(null)}
                    footer={<>
                        <Button variant="secondary" onClick={() => setRevoking(null)}>{t("common.cancel")}</Button>
                        <Button variant="danger" loading={busy()?.startsWith("revoke-") ?? false}
                                onClick={() => {
                                    const target = revoking();
                                    if (target) void revoke(target);
                                }}>{t("mcp.revokeConfirm")}</Button>
                    </>}>
                <p class="text-sm text-muted">
                    {t("mcp.revokeBody", {name: revoking()?.name ?? ""})}
                </p>
            </Dialog>
        </section>
    );
}

export function ConnectionItem(props: { connection: Connection; busy: boolean; onRevoke: () => void }) {
    const expired = () => {
        const expires = props.connection.expiresAt;
        return expires !== undefined && new Date(expires).getTime() <= Date.now();
    };
    return (
        <li class="flex flex-wrap items-start justify-between gap-3 py-3">
            <div class="min-w-0">
                <p class="flex flex-wrap items-center gap-2 font-semibold">
                    {props.connection.name}
                    <Badge tone={props.connection.scope === "CONTROL" ? "warning" : "info"}>
                        {props.connection.scope === "CONTROL" ? t("mcp.scope.control") : t("mcp.scope.read")}
                    </Badge>
                    <Show when={expired()}><Badge tone="danger">{t("mcp.expired")}</Badge></Show>
                </p>
                <p class="mt-0.5 font-mono text-xs text-muted">{props.connection.prefix}…</p>
                <p class="mt-1 text-xs text-muted">
                    {t("mcp.created", {
                        date: formatDateTime(props.connection.createdAt),
                        usage: props.connection.lastUsedAt
                            ? t("mcp.lastUsed", {time: timeAgo(props.connection.lastUsedAt)}) : t("mcp.neverUsed"),
                    })}
                    <Show when={props.connection.expiresAt && !expired()}>
                        {t("mcp.expires", {date: formatDateTime(props.connection.expiresAt)})}
                    </Show>
                </p>
            </div>
            <Button variant="ghost" size="sm" icon={<Trash2 size={16}/>} loading={props.busy}
                    aria-label={t("mcp.revokeLabel", {name: props.connection.name})} onClick={() => props.onRevoke()}>
                {t("mcp.revoke")}
            </Button>
        </li>
    );
}

export function CreatedConnection(props: { result: ConnectionCreated; onDone: () => void }) {
    const config = () => mcpClientConfig(MCP_URL, props.result.token);
    return (
        <div class="min-w-0 space-y-3 rounded-xl border border-sun-500/40 bg-sun-100/60 p-4">
            <Alert tone="warning">
                {t("mcp.copyToken", {name: props.result.connection.name})}
            </Alert>
            <CopyBlock label={t("mcp.tokenLabel")} value={props.result.token}/>
            <CopyBlock label={t("mcp.configLabel")} value={config()}/>
            <Show when={!MCP_URL}>
                <p class="text-xs text-muted">
                    {t("mcp.replaceUrl")}
                </p>
            </Show>
            <Button variant="secondary" size="sm" onClick={() => props.onDone()}>{t("mcp.saved")}</Button>
        </div>
    );
}

function CopyBlock(props: { label: string; value: string }) {
    const [copied, setCopied] = createSignal(false);
    const [copyError, setCopyError] = createSignal(false);
    async function copy() {
        try {
            if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
            await navigator.clipboard.writeText(props.value);
            setCopyError(false);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
            setCopyError(true);
        }
    }
    return (
        <div>
            <div class="mb-1 flex items-center justify-between gap-2">
                <p class="text-sm font-medium text-ink">{props.label}</p>
                <Button variant="ghost" size="sm" icon={copied() ? <Check size={16}/> : <Copy size={16}/>}
                        aria-label={t("mcp.copyLabel", {label: props.label.toLowerCase()})} onClick={() => void copy()}>
                    {copied() ? t("mcp.copied") : t("mcp.copy")}
                </Button>
            </div>
            <Show when={copyError()}>
                <p role="status" class="mt-1 text-xs text-danger-fg">{t("common.copyFailed")}</p>
            </Show>
            <pre class="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-card p-3 font-mono text-xs text-ink">
                <code>{props.value}</code>
            </pre>
        </div>
    );
}
