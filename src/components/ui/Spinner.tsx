import {t} from "../../lib/i18n";

export function Spinner(props: { size?: number; label?: string }) {
    const size = () => props.size ?? 20;
    return (
        <span role="status" class="inline-flex items-center gap-2">
            <svg width={size()} height={size()} viewBox="0 0 24 24" class="animate-spin" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="3"/>
                <path d="M22 12a10 10 0 0 0-10-10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <span class={props.label ? "text-sm text-muted" : "sr-only"}>{props.label ?? t("common.loadingSr")}</span>
        </span>
    );
}

export function PageLoader(props: { label?: string }) {
    return (
        <div class="flex min-h-[40vh] items-center justify-center text-accent">
            <Spinner size={28} label={props.label ?? t("common.loading")}/>
        </div>
    );
}
