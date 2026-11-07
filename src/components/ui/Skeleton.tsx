import {type JSX} from "solid-js";

/** Elemento base de esqueleto con animación de pulso y colores de superficie. */
export function Skeleton(props: { class?: string }) {
    return (
        <div
            aria-hidden="true"
            class={`animate-pulse rounded-xl bg-line/50 dark:bg-surface/60 ${props.class ?? "h-5 w-full"}`}
        />
    );
}

/** Esqueleto para los 4 indicadores del PageHeader. */
export function SkeletonHeaderStats() {
    return (
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4" aria-busy="true">
            <div class="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 animate-pulse">
                <div class="h-7 w-16 rounded-lg bg-white/20"/>
                <div class="mt-2 h-3.5 w-24 rounded bg-white/15"/>
            </div>
            <div class="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 animate-pulse">
                <div class="h-7 w-20 rounded-lg bg-white/20"/>
                <div class="mt-2 h-3.5 w-20 rounded bg-white/15"/>
            </div>
            <div class="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 animate-pulse">
                <div class="h-7 w-12 rounded-lg bg-white/20"/>
                <div class="mt-2 h-3.5 w-28 rounded bg-white/15"/>
            </div>
            <div class="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 animate-pulse">
                <div class="h-7 w-14 rounded-lg bg-white/20"/>
                <div class="mt-2 h-3.5 w-24 rounded bg-white/15"/>
            </div>
        </div>
    );
}

/** Esqueleto para una tarjeta de contenido estándar. */
export function SkeletonCard(props: { height?: string; children?: JSX.Element }) {
    return (
        <div class={`card p-5 ${props.height ?? ""}`} aria-busy="true">
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                    <Skeleton class="h-5 w-5 rounded-md"/>
                    <Skeleton class="h-5 w-36"/>
                </div>
                <Skeleton class="h-4 w-20 rounded-full"/>
            </div>
            <Skeleton class="mt-2.5 h-3.5 w-56"/>
            {props.children ?? (
                <div class="mt-5 space-y-3">
                    <Skeleton class="h-12 w-full"/>
                    <Skeleton class="h-12 w-full"/>
                    <Skeleton class="h-12 w-full"/>
                </div>
            )}
        </div>
    );
}

/** Esqueleto completo para el panel general (OverviewPage). */
export function OverviewSkeleton() {
    return (
        <div class="space-y-6" aria-busy="true">
            <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <SkeletonCard height="min-h-[380px]">
                    <div class="mt-5 space-y-3">
                        <Skeleton class="h-14 w-full rounded-2xl"/>
                        <Skeleton class="h-14 w-full rounded-2xl"/>
                        <Skeleton class="h-14 w-full rounded-2xl"/>
                        <Skeleton class="h-14 w-full rounded-2xl"/>
                    </div>
                </SkeletonCard>
                <SkeletonCard height="min-h-96 lg:min-h-[603px]">
                    <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <Skeleton class="h-28 rounded-2xl"/>
                        <Skeleton class="h-28 rounded-2xl"/>
                        <Skeleton class="h-28 rounded-2xl"/>
                        <Skeleton class="h-28 rounded-2xl"/>
                        <Skeleton class="h-28 rounded-2xl"/>
                        <Skeleton class="h-28 rounded-2xl"/>
                    </div>
                </SkeletonCard>
            </div>
            <SkeletonCard height="min-h-[460px]">
                <div class="mt-5 h-72 w-full rounded-2xl bg-line/30 dark:bg-surface/40 animate-pulse"/>
            </SkeletonCard>
        </div>
    );
}

/** Esqueleto para la grilla de cultivos (CropsPage). */
export function CropsGridSkeleton() {
    return (
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            <div class="card p-5 space-y-4">
                <div class="flex items-center justify-between">
                    <Skeleton class="h-6 w-32"/>
                    <Skeleton class="h-5 w-16 rounded-full"/>
                </div>
                <Skeleton class="h-32 w-full rounded-2xl"/>
                <div class="grid grid-cols-2 gap-2">
                    <Skeleton class="h-10 rounded-xl"/>
                    <Skeleton class="h-10 rounded-xl"/>
                </div>
            </div>
            <div class="card p-5 space-y-4">
                <div class="flex items-center justify-between">
                    <Skeleton class="h-6 w-28"/>
                    <Skeleton class="h-5 w-16 rounded-full"/>
                </div>
                <Skeleton class="h-32 w-full rounded-2xl"/>
                <div class="grid grid-cols-2 gap-2">
                    <Skeleton class="h-10 rounded-xl"/>
                    <Skeleton class="h-10 rounded-xl"/>
                </div>
            </div>
            <div class="card p-5 space-y-4">
                <div class="flex items-center justify-between">
                    <Skeleton class="h-6 w-36"/>
                    <Skeleton class="h-5 w-16 rounded-full"/>
                </div>
                <Skeleton class="h-32 w-full rounded-2xl"/>
                <div class="grid grid-cols-2 gap-2">
                    <Skeleton class="h-10 rounded-xl"/>
                    <Skeleton class="h-10 rounded-xl"/>
                </div>
            </div>
        </div>
    );
}

/** Esqueleto para la vista de detalle de un cultivo (CropDetailPage). */
export function CropDetailSkeleton() {
    return (
        <div class="space-y-6" aria-busy="true">
            <div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
                <div class="card p-5 space-y-4">
                    <Skeleton class="h-64 w-full rounded-2xl"/>
                    <div class="grid grid-cols-3 gap-2">
                        <Skeleton class="h-16 rounded-xl"/>
                        <Skeleton class="h-16 rounded-xl"/>
                        <Skeleton class="h-16 rounded-xl"/>
                    </div>
                </div>
                <div class="card p-5 space-y-4">
                    <Skeleton class="h-8 w-48"/>
                    <Skeleton class="h-4 w-72"/>
                    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <Skeleton class="h-24 rounded-2xl"/>
                        <Skeleton class="h-24 rounded-2xl"/>
                        <Skeleton class="h-24 rounded-2xl"/>
                        <Skeleton class="h-24 rounded-2xl"/>
                        <Skeleton class="h-24 rounded-2xl"/>
                        <Skeleton class="h-24 rounded-2xl"/>
                    </div>
                </div>
            </div>
        </div>
    );
}
