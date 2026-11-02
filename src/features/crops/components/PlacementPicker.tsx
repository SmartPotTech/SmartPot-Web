import {Home, Trees} from "lucide-solid";
import {For, Show} from "solid-js";
import {EXPOSURES, LIGHT_NEEDS, PLACEMENT_SETTINGS} from "../../../lib/catalog";
import type {CropType, Placement, PlacementSetting, SunExposure} from "../../../lib/api/types";
import {t} from "../../../lib/i18n";
import {LocationPicker} from "./LocationPicker";

const SETTING_ICONS: Record<PlacementSetting, typeof Home> = {INDOOR: Home, OUTDOOR: Trees};
const SETTINGS = Object.keys(PLACEMENT_SETTINGS) as PlacementSetting[];
const EXPOSURE_ORDER: SunExposure[] = ["FULL_SUN", "PARTIAL_SUN", "SHADE"];

interface PlacementPickerProps {
    type: CropType;
    value: Placement;
    onChange: (placement: Placement) => void;
}

/**
 * Dónde está el cultivo: bajo techo o al aire libre, cuánto sol recibe y en qué lugar. Se puede elegir cualquier
 * combinación; la nota de la especie dice cuál le conviene y el asistente lo recomienda si la salud se resiente.
 * Tiene su propio buscador de lugar (un formulario): no va dentro de otro formulario.
 */
export function PlacementPicker(props: PlacementPickerProps) {
    const setting = () => props.value.setting ?? null;
    const need = () => LIGHT_NEEDS[props.type];
    return (
        <div class="space-y-3">
            <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("placement.where")}>
                <For each={SETTINGS}>
                    {(option) => {
                        const Icon = SETTING_ICONS[option];
                        return (
                            <button type="button" role="radio" aria-checked={setting() === option}
                                    onClick={() => props.onChange({
                                        ...props.value,
                                        setting: option,
                                        exposure: props.value.exposure ?? need().exposure,
                                    })}
                                    class={`rounded-xl border p-3 text-left transition-colors ${setting() === option
                                        ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-card hover:bg-surface"}`}>
                                <span class="flex items-center gap-2 text-sm font-semibold">
                                    <Icon size={16} class="text-accent"/>
                                    {PLACEMENT_SETTINGS[option].label}
                                </span>
                                <span class="mt-0.5 block text-xs text-muted">{PLACEMENT_SETTINGS[option].hint}</span>
                            </button>
                        );
                    }}
                </For>
            </div>

            <Show when={setting()}>
                {(currentSetting) => (
                    <div class="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t("placement.sun")}>
                        <For each={EXPOSURE_ORDER}>
                            {(option) => {
                                const info = () => EXPOSURES[option][currentSetting()];
                                const ideal = () => option === need().exposure && currentSetting() === "OUTDOOR";
                                return (
                                    <button type="button" role="radio" aria-checked={props.value.exposure === option}
                                            onClick={() => props.onChange({...props.value, exposure: option})}
                                            class={`rounded-xl border px-3 py-2 text-left transition-colors ${props.value.exposure === option
                                                ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-card hover:bg-surface"}`}>
                                        <span class="block text-sm font-semibold">
                                            {info().label}
                                            <Show when={ideal()}>
                                                <span class="ml-1.5 text-xs text-accent">{t("placement.ideal")}</span>
                                            </Show>
                                        </span>
                                        <span class="block text-xs text-muted">{info().hint}</span>
                                    </button>
                                );
                            }}
                        </For>
                    </div>
                )}
            </Show>
            <p class="text-xs text-muted">
                {t("placement.note", {note: need().note})}
            </p>

            <div class="space-y-1.5">
                <p class="text-sm font-semibold">{t("placement.location")}<span
                    class="font-normal text-muted">{t("placement.optional")}</span></p>
                <p class="text-xs text-muted">
                    {t("placement.locationHint")}
                </p>
                <LocationPicker value={props.value.location ?? null}
                                onChange={(location) => props.onChange({...props.value, location})}/>
            </div>
        </div>
    );
}
