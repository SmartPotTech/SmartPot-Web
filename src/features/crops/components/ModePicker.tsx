import {CloudSun, Hand, SunMoon} from "lucide-solid";
import {For} from "solid-js";
import {t, type TranslationKey} from "../../../lib/i18n";
import type {VirtualMode} from "../../../lib/api/types";

const MODES: { id: VirtualMode; label: TranslationKey; hint: TranslationKey; icon: typeof CloudSun }[] = [
    {id: "AUTO", label: "sim.mode.AUTO", hint: "sim.mode.AUTO.hint", icon: SunMoon},
    {id: "WEATHER", label: "sim.mode.WEATHER", hint: "sim.mode.WEATHER.hint", icon: CloudSun},
    {id: "MANUAL", label: "sim.mode.MANUAL", hint: "sim.mode.MANUAL.hint", icon: Hand},
];

/** Selector de modo de simulación, compartido por el alta de cultivos y la pestaña Simulación. */
export function ModePicker(props: { value: VirtualMode; onChange: (mode: VirtualMode) => void }) {
    return (
        <div class="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t("sim.modeLabel")}>
            <For each={MODES}>
                {(item) => {
                    const Icon = item.icon;
                    return (
                        <button type="button" role="radio" aria-checked={props.value === item.id}
                                onClick={() => props.onChange(item.id)}
                                class={`rounded-xl border p-3 text-left transition-colors ${props.value === item.id
                                    ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-card hover:bg-surface"}`}>
                            <span class="flex items-center gap-2 font-semibold">
                                <Icon size={16} class="text-accent"/>{t(item.label)}
                            </span>
                            <span class="mt-1 block text-xs text-muted">{t(item.hint)}</span>
                        </button>
                    );
                }}
            </For>
        </div>
    );
}
