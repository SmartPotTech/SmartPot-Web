export function Spinner({size = 20, label}: { size?: number; label?: string }) {
    return (
        <span role="status" className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3"/>
        <path d="M22 12a10 10 0 0 0-10-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <span className={label ? "text-sm text-muted" : "sr-only"}>{label ?? "Cargando"}</span>
    </span>
    );
}

export function PageLoader({label = "Cargando…"}: { label?: string }) {
    return (
        <div className="flex min-h-[40vh] items-center justify-center text-leaf-700">
            <Spinner size={28} label={label}/>
        </div>
    );
}
