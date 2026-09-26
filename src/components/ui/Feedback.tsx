import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { Tone } from "../../lib/catalog";

const BADGE: Record<Tone, string> = {
  neutral: "bg-surface text-muted",
  info: "bg-water-100 text-water-700",
  success: "bg-leaf-100 text-leaf-800",
  warning: "bg-sun-100 text-sun-600",
  danger: "bg-danger-100 text-danger-600",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[tone]}`}>
      {children}
    </span>
  );
}

const ALERT: Record<Exclude<Tone, "neutral">, { box: string; icon: ReactNode }> = {
  info: { box: "border-water-500/30 bg-water-100 text-water-700", icon: <Info size={18} /> },
  success: { box: "border-leaf-500/30 bg-leaf-50 text-leaf-800", icon: <CheckCircle2 size={18} /> },
  warning: { box: "border-sun-500/40 bg-sun-100 text-sun-600", icon: <AlertTriangle size={18} /> },
  danger: { box: "border-danger-500/30 bg-danger-100 text-danger-600", icon: <XCircle size={18} /> },
};

export function Alert({ tone = "info", title, children }: { tone?: Exclude<Tone, "neutral">; title?: string;
  children?: ReactNode }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex gap-3 rounded-xl border p-3 text-sm ${ALERT[tone].box}`}>
      <span className="mt-0.5 shrink-0">{ALERT[tone].icon}</span>
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode;
  action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <p className="mt-1 max-w-md text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
