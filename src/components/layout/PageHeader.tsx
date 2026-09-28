import type {ReactNode} from "react";

interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
}

/** Encabezado de sección con el degradado verde de la marca. */
export function PageHeader({eyebrow, title, description, icon, actions, children}: PageHeaderProps) {
    return (
        <header className="relative overflow-hidden rounded-[var(--radius-card)] bg-linear-to-br from-leaf-900 via-leaf-800
      to-leaf-700 px-5 py-6 text-white shadow-[var(--shadow-card)] md:px-7 md:py-7">
            <div aria-hidden="true"
                 className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-leaf-500/25 blur-2xl"/>
            <div aria-hidden="true"
                 className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-water-500/20 blur-2xl"/>
            <div className="relative flex flex-wrap items-end justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    {icon && <span className="mt-1 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10
            text-leaf-300 sm:flex">{icon}</span>}
                    <div className="min-w-0">
                        {eyebrow && <p className="text-sm font-medium text-leaf-300">{eyebrow}</p>}
                        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
                        {description && <p className="mt-1 max-w-2xl text-sm text-leaf-100/90">{description}</p>}
                    </div>
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
            {children && <div className="relative mt-5">{children}</div>}
        </header>
    );
}

/** Indicador para el interior de un PageHeader. */
export function HeaderStat({label, value, hint}: { label: string; value: ReactNode; hint?: string }) {
    return (
        <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
            <p className="font-display text-2xl font-bold leading-tight">{value}</p>
            <p className="text-xs text-leaf-100/90">{label}</p>
            {hint && <p className="mt-0.5 text-[11px] text-leaf-300">{hint}</p>}
        </div>
    );
}
