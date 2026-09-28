import type {ReactNode} from "react";

export function AuthCard({title, subtitle, children, footer}: {
    title: string; subtitle?: string; children: ReactNode;
    footer?: ReactNode
}) {
    return (
        <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-surface px-4 py-10">
            <div className="w-full max-w-md">
                <div className="card p-6 md:p-8">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
                {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}
            </div>
        </div>
    );
}
