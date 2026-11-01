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
import {CONNECTION_EXPIRY, mcpClientConfig} from "../../lib/mcp";

type Message = { tone: "success" | "danger"; text: string } | null;

const SCOPES: { value: ConnectionScope; label: string; description: string }[] = [
    {value: "READ", label: "Solo lectura", description: "Consulta cultivos, lecturas, diagnósticos y avisos."},
    {
        value: "CONTROL",
        label: "Control",
        description: "Además crea, edita y borra cultivos y acciona actuadores (el asistente pide confirmación).",
    },
];

/**
 * Conexiones personales para asistentes de IA compatibles con MCP. Cada una es un token propio, con su alcance, que
 * se revoca por separado: el asistente actúa a nombre de esta cuenta sin conocer la contraseña.
 */
export function McpConnections() {
    const connections = useResource(() => connectionApi.list(), []);
    const [name, setName] = createSignal("");
    const [scope, setScope] = createSignal<ConnectionScope>("READ");
    const [expiry, setExpiry] = createSignal(0);
    const [nameError, setNameError] = createSignal<string | undefined>();
    const [created, setCreated] = createSignal<ConnectionCreated | null>(null);
    const [revoking, setRevoking] = createSignal<Connection | null>(null);
    const [message, setMessage] = createSignal<Message>(null);
    const [busy, setBusy] = createSignal<string | null>(null);

    async function create(event: SubmitEvent) {
        event.preventDefault();
        const trimmed = name().trim();
        if (!trimmed || trimmed.length > 60) {
            setNameError(trimmed ? "Máximo 60 caracteres" : "Ponle un nombre, por ejemplo el del asistente");
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
            await connections.reload();
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo crear"});
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
            setMessage({tone: "success", text: `Conexión «${connection.name}» revocada`});
            await connections.reload();
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo revocar"});
        } finally {
            setBusy(null);
            setRevoking(null);
        }
    }

    return (
        <section class="card space-y-4 p-5" aria-labelledby="connections-title">
            <div>
                <h2 id="connections-title" class="flex items-center gap-2 text-lg font-semibold">
                    <Plug size={18} class="text-leaf-700"/> Conexiones con asistentes de IA
                </h2>
                <p class="text-sm text-muted">
                    Conecta un asistente compatible con MCP para que consulte o maneje tus cultivos. Cada conexión tiene
                    su propio token y alcance, y la revocas cuando quieras sin cambiar tu contraseña.
                </p>
            </div>

            <Show when={message()}>
                {(msg) => <Alert tone={msg().tone}>{msg().text}</Alert>}
            </Show>

            <Show when={created()}>
                {(result) => <CreatedConnection result={result()} onDone={() => setCreated(null)}/>}
            </Show>

            <form class="space-y-3 rounded-xl bg-surface p-4" onSubmit={(event) => void create(event)}>
                <TextField label="Nombre de la conexión" value={name()} maxLength={60} error={nameError()}
                           placeholder="Asistente del portátil"
                           onChange={(event) => setName(event.currentTarget.value)}/>
                <fieldset>
                    <legend class="mb-1.5 text-sm font-medium text-ink">Alcance</legend>
                    <div class="grid gap-2 sm:grid-cols-2">
                        <For each={SCOPES}>
                            {(option) => (
                                <label class={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${scope() === option.value
                                    ? "border-leaf-600 bg-white" : "border-line bg-white/60"}`}>
                                    <input type="radio" name="connection-scope" value={option.value} class="mt-1"
                                           checked={scope() === option.value}
                                           onChange={() => setScope(option.value)}/>
                                    <span>
                                        <span class="block font-semibold">{option.label}</span>
                                        <span class="text-muted">{option.description}</span>
                                    </span>
                                </label>
                            )}
                        </For>
                    </div>
                </fieldset>
                <SelectField label="Vigencia" value={String(expiry())}
                             onChange={(event) => setExpiry(Number(event.currentTarget.value))}>
                    <For each={CONNECTION_EXPIRY}>
                        {(option, index) => <option value={String(index())}>{option.label}</option>}
                    </For>
                </SelectField>
                <Button type="submit" size="sm" icon={<Plus size={16}/>} loading={busy() === "create"}>
                    Crear conexión
                </Button>
            </form>

            <Show when={connections.error}>
                {(err) => <Alert tone="danger">{err()}</Alert>}
            </Show>
            <Show when={(connections.data ?? []).length > 0} fallback={
                <Show when={!connections.loading}>
                    <p class="text-sm text-muted">Todavía no tienes conexiones.</p>
                </Show>
            }>
                <ul class="divide-y divide-line" aria-label="Conexiones activas">
                    <For each={connections.data ?? []}>
                        {(connection) => (
                            <ConnectionItem connection={connection} busy={busy() === `revoke-${connection.id}`}
                                            onRevoke={() => setRevoking(connection)}/>
                        )}
                    </For>
                </ul>
            </Show>

            <Dialog open={revoking() !== null} title="¿Revocar la conexión?" onClose={() => setRevoking(null)}
                    footer={<>
                        <Button variant="secondary" onClick={() => setRevoking(null)}>Cancelar</Button>
                        <Button variant="danger" loading={busy()?.startsWith("revoke-") ?? false}
                                onClick={() => {
                                    const target = revoking();
                                    if (target) void revoke(target);
                                }}>Sí, revocar</Button>
                    </>}>
                <p class="text-sm text-muted">
                    El asistente que use «{revoking()?.name}» perderá el acceso al instante. Puedes crear otra
                    conexión cuando quieras.
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
                        {props.connection.scope === "CONTROL" ? "Control" : "Solo lectura"}
                    </Badge>
                    <Show when={expired()}><Badge tone="danger">Vencida</Badge></Show>
                </p>
                <p class="mt-0.5 font-mono text-xs text-muted">{props.connection.prefix}…</p>
                <p class="mt-1 text-xs text-muted">
                    Creada {formatDateTime(props.connection.createdAt)} · {props.connection.lastUsedAt
                    ? `último uso ${timeAgo(props.connection.lastUsedAt)}` : "sin usar todavía"}
                    <Show when={props.connection.expiresAt && !expired()}>
                        {" "}· vence {formatDateTime(props.connection.expiresAt)}
                    </Show>
                </p>
            </div>
            <Button variant="ghost" size="sm" icon={<Trash2 size={16}/>} loading={props.busy}
                    aria-label={`Revocar ${props.connection.name}`} onClick={() => props.onRevoke()}>
                Revocar
            </Button>
        </li>
    );
}

export function CreatedConnection(props: { result: ConnectionCreated; onDone: () => void }) {
    const config = () => mcpClientConfig(MCP_URL, props.result.token);
    return (
        <div class="min-w-0 space-y-3 rounded-xl border border-sun-500/40 bg-sun-100/60 p-4">
            <Alert tone="warning">
                Copia el token de «{props.result.connection.name}» ahora: por seguridad no se vuelve a mostrar.
            </Alert>
            <CopyBlock label="Token de conexión" value={props.result.token}/>
            <CopyBlock label="Configuración del cliente MCP (HTTP)" value={config()}/>
            <Show when={!MCP_URL}>
                <p class="text-xs text-muted">
                    Reemplaza la URL por la del servidor MCP de SmartPot (en la demo, http://localhost:8002).
                </p>
            </Show>
            <Button variant="secondary" size="sm" onClick={() => props.onDone()}>Ya lo guardé</Button>
        </div>
    );
}

function CopyBlock(props: { label: string; value: string }) {
    const [copied, setCopied] = createSignal(false);
    async function copy() {
        try {
            await navigator.clipboard.writeText(props.value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }
    return (
        <div>
            <div class="mb-1 flex items-center justify-between gap-2">
                <p class="text-sm font-medium text-ink">{props.label}</p>
                <Button variant="ghost" size="sm" icon={copied() ? <Check size={16}/> : <Copy size={16}/>}
                        aria-label={`Copiar ${props.label.toLowerCase()}`} onClick={() => void copy()}>
                    {copied() ? "Copiado" : "Copiar"}
                </Button>
            </div>
            <pre class="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-white p-3 font-mono text-xs text-ink">
                <code>{props.value}</code>
            </pre>
        </div>
    );
}
