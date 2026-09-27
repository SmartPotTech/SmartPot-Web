import { BellRing, ExternalLink, Send, Unlink } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Alert, Badge } from "../../components/ui/Feedback";
import { Switch } from "../../components/ui/Switch";
import { useResource } from "../../hooks/useResource";
import { ApiError } from "../../lib/api/client";
import { channelApi } from "../../lib/api/services";
import { timeAgo } from "../../lib/format";
import type { ChannelLink, ChannelOption, LinkCode, NotificationType } from "../../lib/api/types";

const EVENT_LABELS: Record<NotificationType, string> = {
  ALERT: "Alertas del cultivo",
  DEVICE: "Maceta desconectada",
  AI: "Acciones del asistente",
  COMMAND: "Comandos que fallan o vencen",
  INFO: "Novedades de la cuenta",
};
const EVENTS = Object.keys(EVENT_LABELS) as NotificationType[];

type Message = { tone: "success" | "danger" | "info"; text: string } | null;

/** Canales fuera de la app donde llegan las alertas. Hoy Telegram; el servidor dice cuáles tiene configurados. */
export function NotificationChannels() {
  const channels = useResource(() => channelApi.list(), []);
  const [code, setCode] = useState<LinkCode | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, action: () => Promise<unknown>, success?: string) {
    setBusy(key);
    setMessage(null);
    try {
      await action();
      if (success) setMessage({ tone: "success", text: success });
      await channels.reload();
    } catch (caught) {
      setMessage({ tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo completar" });
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
    <section className="card space-y-4 p-5" aria-labelledby="channels-title">
      <div>
        <h2 id="channels-title" className="flex items-center gap-2 text-lg font-semibold">
          <BellRing size={18} className="text-leaf-700" /> Notificaciones fuera de la app
        </h2>
        <p className="text-sm text-muted">Recibe las alertas de tus cultivos donde ya conversas.</p>
      </div>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      {channels.error && <Alert tone="danger">{channels.error}</Alert>}
      {channels.data?.map((option) => (
        <ChannelRow key={option.type} option={option} code={code} busy={busy}
          onLink={() => void startLink()}
          onRefresh={() => void channels.reload()}
          onUpdate={(link, body) => void run(`update-${link.id}`, () => channelApi.update(link.id, body))}
          onTest={(link) => void run(`test-${link.id}`, () => channelApi.test(link.id), "Mensaje de prueba enviado")}
          onUnlink={(link) => void run(`unlink-${link.id}`, () => channelApi.unlink(link.id), "Canal desvinculado")} />
      ))}
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

export function ChannelRow({ option, code, busy, onLink, onRefresh, onUpdate, onTest, onUnlink }: ChannelRowProps) {
  const link = option.link;
  if (!option.available) {
    return (
      <div className="rounded-xl bg-surface p-4 text-sm">
        <p className="font-semibold">{option.name}</p>
        <p className="text-muted">Este servidor todavía no tiene configurado el bot de {option.name}.</p>
      </div>
    );
  }
  if (!link) {
    return (
      <div className="rounded-xl bg-surface p-4">
        <p className="font-semibold">{option.name} <span className="font-normal text-muted">{option.handle}</span></p>
        <p className="mt-1 text-sm text-muted">
          Toca «Vincular»: se abrirá {option.name} con un código de un solo uso. Presiona <strong>Iniciar</strong> en el
          chat del bot y listo.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" icon={<ExternalLink size={14} />} loading={busy === "link"} onClick={onLink}>
            Vincular {option.name}
          </Button>
          {code && <Button size="sm" variant="secondary" onClick={onRefresh}>Ya lo vinculé</Button>}
        </div>
        {code && (
          <p className="mt-2 text-xs text-muted">
            Si no se abrió, entra a <a className="font-semibold text-water-700 underline" href={code.url} target="_blank"
              rel="noopener noreferrer">{code.url.replace(/\?.*$/, "")}</a> y escribe <code>/start {code.code}</code>.
            El código vence {timeAgo(code.expiresAt)}.
          </p>
        )}
      </div>
    );
  }

  const toggle = (event: NotificationType, checked: boolean) => {
    const events = checked ? [...new Set([...link.events, event])] : link.events.filter((item) => item !== event);
    onUpdate(link, { events });
  };

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-semibold">{option.name}
            <Badge tone={link.enabled ? "success" : "neutral"}>{link.enabled ? "Activo" : "En pausa"}</Badge>
          </p>
          <p className="text-sm text-muted">
            Vinculado a {link.displayName ?? "tu chat"}
            {link.lastDeliveredAt ? ` · último aviso ${timeAgo(link.lastDeliveredAt)}` : ""}
          </p>
        </div>
        <Switch checked={link.enabled} label={`Recibir avisos por ${option.name}`}
          onChange={(enabled) => onUpdate(link, { enabled })} />
      </div>
      <fieldset className="mt-3">
        <legend className="text-sm font-semibold">Qué quieres recibir</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {EVENTS.map((event) => (
            <label key={event} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-leaf-700" checked={link.events.includes(event)}
                onChange={(changed) => toggle(event, changed.target.checked)} />
              {EVENT_LABELS[event]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" icon={<Send size={14} />} loading={busy === `test-${link.id}`}
          onClick={() => onTest(link)}>Enviar prueba</Button>
        <Button size="sm" variant="ghost" icon={<Unlink size={14} />} loading={busy === `unlink-${link.id}`}
          onClick={() => onUnlink(link)}>Desvincular</Button>
      </div>
    </div>
  );
}
