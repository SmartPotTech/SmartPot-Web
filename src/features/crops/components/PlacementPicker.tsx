import { Home, Trees } from "lucide-react";
import { EXPOSURES, LIGHT_NEEDS, PLACEMENT_SETTINGS } from "../../../lib/catalog";
import type { CropType, Placement, PlacementSetting, SunExposure } from "../../../lib/api/types";
import { LocationPicker } from "./LocationPicker";

const SETTING_ICONS: Record<PlacementSetting, typeof Home> = { INDOOR: Home, OUTDOOR: Trees };
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
export function PlacementPicker({ type, value, onChange }: PlacementPickerProps) {
  const setting = value.setting ?? null;
  const need = LIGHT_NEEDS[type];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Dónde está">
        {SETTINGS.map((option) => {
          const Icon = SETTING_ICONS[option];
          return (
            <button key={option} type="button" role="radio" aria-checked={setting === option}
              onClick={() => onChange({ ...value, setting: option, exposure: value.exposure ?? need.exposure })}
              className={`rounded-xl border p-3 text-left transition-colors ${setting === option
                ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-white hover:bg-surface"}`}>
              <span className="flex items-center gap-2 text-sm font-semibold"><Icon size={16} className="text-leaf-700" />
                {PLACEMENT_SETTINGS[option].label}</span>
              <span className="mt-0.5 block text-xs text-muted">{PLACEMENT_SETTINGS[option].hint}</span>
            </button>
          );
        })}
      </div>

      {setting && (
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Cuánto sol recibe">
          {EXPOSURE_ORDER.map((option) => {
            const info = EXPOSURES[option][setting];
            const ideal = option === need.exposure && setting === "OUTDOOR";
            return (
              <button key={option} type="button" role="radio" aria-checked={value.exposure === option}
                onClick={() => onChange({ ...value, exposure: option })}
                className={`rounded-xl border px-3 py-2 text-left transition-colors ${value.exposure === option
                  ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-white hover:bg-surface"}`}>
                <span className="block text-sm font-semibold">
                  {info.label}
                  {ideal && <span className="ml-1.5 text-xs text-leaf-700">· ideal</span>}
                </span>
                <span className="block text-xs text-muted">{info.hint}</span>
              </button>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted">
        {need.note} Puedes ponerlo donde quieras: si el lugar afecta su salud, el asistente te recomendará moverlo.
      </p>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold">Ubicación <span className="font-normal text-muted">(opcional)</span></p>
        <p className="text-xs text-muted">
          Sirve para ilustrarlo con el clima del lugar y para comparar los sensores con el clima de afuera.
        </p>
        <LocationPicker value={value.location ?? null} onChange={(location) => onChange({ ...value, location })} />
      </div>
    </div>
  );
}
