import {AlertTriangle, Bell, Bot, CheckCheck, Info, Radio, Trash2, Zap} from "lucide-react";
import {Link} from "react-router";
import {Button} from "../../components/ui/Button";
import {Alert, EmptyState} from "../../components/ui/Feedback";
import {PageLoader} from "../../components/ui/Spinner";
import {usePageMeta} from "../../hooks/usePageMeta";
import {useResource} from "../../hooks/useResource";
import {notificationApi} from "../../lib/api/services";
import {formatDateTime} from "../../lib/format";
import type {AppNotification} from "../../lib/api/types";

const ICONS: Record<AppNotification["type"], typeof Bell> = {
    INFO: Info,
    ALERT: AlertTriangle,
    COMMAND: Zap,
    DEVICE: Radio,
    AI: Bot,
};

export function NotificationsPage() {
    usePageMeta("Alertas");
    const notifications = useResource(() => notificationApi.list(), [], 30_000);
    const list = notifications.data ?? [];

    async function act(task: Promise<unknown>) {
        await task.catch(() => undefined);
        void notifications.reload();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="text-3xl font-bold">Alertas</h1>
                {list.some((item) => !item.read) && (
                    <Button variant="secondary" size="sm" icon={<CheckCheck size={16}/>}
                            onClick={() => void act(notificationApi.markAllRead())}>
                        Marcar todas como leídas
                    </Button>
                )}
            </div>
            {notifications.error && <Alert tone="danger">{notifications.error}</Alert>}
            {notifications.loading && !notifications.data ? <PageLoader/> : list.length === 0 ? (
                <EmptyState icon={<Bell size={26}/>} title="Sin alertas">
                    Aquí verás los avisos de tus cultivos, de sus dispositivos y del asistente de IA.
                </EmptyState>
            ) : (
                <ul className="space-y-2">
                    {list.map((item) => {
                        const Icon = ICONS[item.type] ?? Info;
                        return (
                            <li key={item.id}
                                className={`card flex gap-3 p-4 ${item.read ? "opacity-75" : "border-leaf-300"}`}>
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                  ${item.type === "ALERT" ? "bg-sun-100 text-sun-600" : "bg-leaf-50 text-leaf-700"}`}>
                                    <Icon size={18}/>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-muted">{item.message}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                                        <span>{formatDateTime(item.createdAt)}</span>
                                        {item.cropId && <Link to={`/app/crops/${item.cropId}`}
                                                              className="font-semibold text-leaf-700">Ver
                                            cultivo</Link>}
                                        {!item.read && (
                                            <button type="button" className="font-semibold text-leaf-700"
                                                    onClick={() => void act(notificationApi.markRead(item.id))}>
                                                Marcar como leída
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button type="button" aria-label="Eliminar alerta"
                                        className="self-start rounded-lg p-1.5 text-muted hover:text-danger-600"
                                        onClick={() => void act(notificationApi.remove(item.id))}>
                                    <Trash2 size={16}/>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
