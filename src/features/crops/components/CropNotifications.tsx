import {BellRing, Copy, ExternalLink, Save, Share2, Trash2} from "lucide-react";
import {useState} from "react";
import {Link} from "react-router";
import {Button} from "../../../components/ui/Button";
import {Alert} from "../../../components/ui/Feedback";
import {Switch} from "../../../components/ui/Switch";
import {useResource} from "../../../hooks/useResource";
import {ApiError} from "../../../lib/api/client";
import {cropChannelApi} from "../../../lib/api/services";
import {timeAgo} from "../../../lib/format";
import type {Crop, CropChannel, Delivery, LinkCode, NotificationType} from "../../../lib/api/types";

/** Qué puede avisar un cultivo (las novedades de la cuenta no son de un cultivo). */
const CROP_EVENTS: { type: NotificationType; label: string }[] = [
    {type: "ALERT", label: "Alertas de sus variables"},
    {type: "DEVICE", label: "Se desconecta"},
    {type: "AI", label: "Acciones del asistente"},
    {type: "COMMAND", label: "Órdenes que fallan o vencen"},
];
const DIGEST_HOURS = [1, 2, 3, 6, 12, 24];

/**
 * Avisos de este cultivo fuera de la app, por cada aplicación vinculada en el perfil (hoy Telegram). Si no hay
 * ninguna vinculada, solo se invita a vincularla; así la sección crece sola cuando se sumen más aplicaciones.
 */
export function CropNotifications({crop}: { crop: Crop }) {
    const channels = useResource(() => cropChannelApi.list(crop.id), [crop.id]);
    const ready = (channels.data ?? []).filter((channel) => channel.available && channel.linked);

    if (channels.error) return <Alert tone="danger">{channels.error}</Alert>;
    if (!channels.data) return null;
    if (ready.length === 0) {
        return (
            <section className="card p-5">
                <h3 className="flex items-center gap-2 font-semibold"><BellRing size={16}
                                                                                className="text-leaf-700"/> Avisos fuera
                    de SmartPot</h3>
                <p className="mt-1 text-sm text-muted">
                    Vincula una aplicación en <Link to="/app/profile"
                                                    className="font-semibold text-water-700 hover:underline">tu
                    perfil</Link> y aquí eliges qué avisa este cultivo, cada cuánto y con quién lo compartes.
                </p>
            </section>
        );
    }
    return (
        <>
            {ready.map((channel) => (
                <ChannelSettings
                    key={`${channel.type}-${channel.enabled}-${channel.delivery}-${channel.digestHours}-${channel.dailySummaryAt ?? ""}`}
                    crop={crop} channel={channel} onChanged={() => void channels.reload()}/>
            ))}
        </>
    );
}

function ChannelSettings({crop, channel, onChanged}: { crop: Crop; channel: CropChannel; onChanged: () => void }) {
    const [enabled, setEnabled] = useState(channel.enabled);
    const [events, setEvents] = useState<NotificationType[]>(channel.events);
    const [delivery, setDelivery] = useState<Delivery>(channel.delivery);
    const [digestHours, setDigestHours] = useState(channel.digestHours || 6);
    const [daily, setDaily] = useState(Boolean(channel.dailySummaryAt));
    const [dailyAt, setDailyAt] = useState(channel.dailySummaryAt ?? "07:00");
    const [code, setCode] = useState<LinkCode | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [message, setMessage] = useState<{ tone: "success" | "danger" | "info"; text: string } | null>(null);

    async function run(key: string, task: () => Promise<unknown>, success?: string) {
        setBusy(key);
        setMessage(null);
        try {
            await task();
            if (success) setMessage({tone: "success", text: success});
            onChanged();
        } catch (caught) {
            setMessage({tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo completar"});
        } finally {
            setBusy(null);
        }
    }

    const save = () => void run("save", () => cropChannelApi.update(crop.id, channel.type, {
        enabled, events, delivery, digestHours, dailySummaryAt: daily ? dailyAt : "",
    }), "Avisos guardados");

    const share = () => void run("share", async () => {
        const created = await cropChannelApi.share(crop.id, channel.type);
        setCode(created);
    });

    async function copy(url: string) {
        try {
            await navigator.clipboard.writeText(url);
            setMessage({tone: "info", text: "Enlace copiado: envíaselo a quien quieras que reciba los avisos."});
        } catch {
            setMessage({tone: "danger", text: "No se pudo copiar; selecciona el enlace y cópialo a mano."});
        }
    }

    return (
        <section className="card space-y-4 p-5" aria-label={`Avisos por ${channel.name}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="flex items-center gap-2 font-semibold"><BellRing size={16}
                                                                                    className="text-leaf-700"/> Avisos
                        por {channel.name}</h3>
                    <p className="text-sm text-muted">Lo que este cultivo te avisa a ti y a los chats con los que lo
                        compartes.</p>
                </div>
                <Switch checked={enabled} label={`Avisos de este cultivo por ${channel.name}`} onChange={setEnabled}/>
            </div>
            {message && <Alert tone={message.tone}>{message.text}</Alert>}

            <fieldset disabled={!enabled} className="space-y-4 disabled:opacity-60">
                <div>
                    <p className="text-sm font-semibold">Qué avisar</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {CROP_EVENTS.map((item) => (
                            <label key={item.type} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" className="h-4 w-4 accent-leaf-700"
                                       checked={events.includes(item.type)}
                                       onChange={(event) => setEvents((current) => event.target.checked
                                           ? [...new Set([...current, item.type])] : current.filter((type) => type !== item.type))}/>
                                {item.label}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-sm font-semibold">Cuándo</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm" role="radiogroup"
                         aria-label="Cuándo avisar">
                        <label className="flex items-center gap-2">
                            <input type="radio" name={`delivery-${channel.type}`} className="accent-leaf-700"
                                   checked={delivery === "INSTANT"} onChange={() => setDelivery("INSTANT")}/>
                            Al instante
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name={`delivery-${channel.type}`} className="accent-leaf-700"
                                   checked={delivery === "DIGEST"} onChange={() => setDelivery("DIGEST")}/>
                            Un resumen cada
                        </label>
                        <select value={digestHours} disabled={delivery !== "DIGEST"} aria-label="Horas entre resúmenes"
                                onChange={(event) => setDigestHours(Number(event.target.value))}
                                className="h-9 rounded-lg border border-line bg-white px-2 disabled:opacity-50">
                            {DIGEST_HOURS.map((hours) => <option key={hours}
                                                                 value={hours}>{hours === 1 ? "1 hora" : `${hours} horas`}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 accent-leaf-700" checked={daily}
                               onChange={(event) => setDaily(event.target.checked)}/>
                        <span className="font-semibold">Resumen diario</span> a las
                    </label>
                    <input type="time" value={dailyAt} disabled={!daily} aria-label="Hora del resumen diario"
                           onChange={(event) => setDailyAt(event.target.value)}
                           className="h-9 rounded-lg border border-line bg-white px-2 disabled:opacity-50"/>
                    <span className="text-xs text-muted">Salud, última lectura y lo que pasó en 24 h.</span>
                </div>
            </fieldset>

            <Button icon={<Save size={16}/>} loading={busy === "save"} onClick={save}>Guardar avisos</Button>

            <div className="border-t border-line pt-4">
                <p className="text-sm font-semibold">Compartido con</p>
                <p className="text-xs text-muted">
                    Si cuidas este cultivo con alguien, compártele un enlace: recibirá en su {channel.name} los mismos
                    avisos, sin
                    entrar a tu cuenta. Hasta 10 chats.
                </p>
                <ul className="mt-2 divide-y divide-line">
                    {channel.recipients.map((recipient) => (
                        <li key={recipient.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span>{recipient.displayName ?? "Chat sin nombre"}
                  {recipient.addedAt &&
                      <span className="text-muted"> · desde {timeAgo(recipient.addedAt)}</span>}</span>
                            <Button size="sm" variant="ghost" icon={<Trash2 size={14}/>}
                                    loading={busy === `remove-${recipient.id}`}
                                    aria-label={`Dejar de compartir con ${recipient.displayName ?? "este chat"}`}
                                    onClick={() => void run(`remove-${recipient.id}`,
                                        () => cropChannelApi.removeRecipient(crop.id, channel.type, recipient.id), "Dejaste de compartirlo")}>
                                Quitar
                            </Button>
                        </li>
                    ))}
                    {channel.recipients.length === 0 &&
                        <li className="py-2 text-sm text-muted">Todavía no lo compartes.</li>}
                </ul>
                <Button size="sm" variant="secondary" className="mt-2" icon={<Share2 size={14}/>}
                        loading={busy === "share"}
                        disabled={channel.recipients.length >= 10} onClick={share}>
                    Compartir con otro chat
                </Button>
                {code && (
                    <div className="mt-3 space-y-2 rounded-xl bg-surface p-3 text-sm">
                        <p>Envía este enlace; vence {timeAgo(code.expiresAt)} y sirve una sola vez.</p>
                        <p className="break-all font-mono text-xs">{code.url}</p>
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="secondary" icon={<Copy size={14}/>}
                                    onClick={() => void copy(code.url)}>Copiar enlace</Button>
                            <Button size="sm" variant="ghost" icon={<ExternalLink size={14}/>}
                                    onClick={() => window.open(code.url, "_blank", "noopener,noreferrer")}>Abrir</Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                                setCode(null);
                                onChanged();
                            }}>Ya lo usaron</Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
