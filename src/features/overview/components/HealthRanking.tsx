import {A} from "@solidjs/router";
import {HeartPulse, WifiOff} from "lucide-solid";
import {For, Show} from "solid-js";
import {HEALTH, healthLabel} from "../../../lib/catalog";
import type {Crop} from "../../../lib/api/types";
import {t} from "../../../lib/i18n";

/** Salud de cada cultivo, del que más atención necesita al que menos. */
export function HealthRanking(props: { crops: Crop[] }) {
    const ranked = () => [...props.crops].sort((a, b) => (a.health?.index ?? 101) - (b.health?.index ?? 101));
    return (
        <section class="card p-5">
            <h2 class="flex items-center gap-2 text-lg font-semibold">
                <HeartPulse size={18} class="text-accent"/> {t("ranking.title")}
            </h2>
            <p class="text-sm text-muted">{t("ranking.subtitle")}</p>
            <ul class="mt-4 space-y-3">
                <For each={ranked()}>
                    {(crop) => {
                        const health = crop.health;
                        const color = health ? HEALTH[health.level]?.color : undefined;
                        return (
                            <li>
                                <A href={`/app/crops/${crop.id}`} class="group block rounded-xl p-1 hover:bg-leaf-50">
                                    <div class="flex items-center justify-between gap-2 text-sm">
                                        <span class="flex min-w-0 items-center gap-2 font-medium">
                                            <span class="truncate group-hover:text-accent-strong">{crop.name}</span>
                                            <Show when={!crop.device.online}>
                                                <WifiOff size={14} class="shrink-0 text-muted"
                                                         aria-label={t("ranking.offline")}/>
                                            </Show>
                                        </span>
                                        <span class="shrink-0 text-muted">
                                            {health ? <><span
                                                class="font-semibold text-ink">{Math.round(health.index)}</span> · {healthLabel(health)}</> : t("ranking.unrated")}
                                        </span>
                                    </div>
                                    <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-surface" role="meter"
                                         aria-valuemin={0}
                                         aria-valuemax={100} aria-valuenow={health ? Math.round(health.index) : 0}
                                         aria-label={t("ranking.healthOf", {name: crop.name})}>
                                        <div class="h-full rounded-full"
                                             style={{"width": `${health?.index ?? 0}%`, "background-color": color}}/>
                                    </div>
                                </A>
                            </li>
                        );
                    }}
                </For>
            </ul>
        </section>
    );
}
