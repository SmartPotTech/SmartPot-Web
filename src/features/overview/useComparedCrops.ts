import {useState} from "react";
import {CROP_COLORS, MAX_COMPARED} from "../../lib/catalog";
import type {Crop} from "../../lib/api/types";

/**
 * Cultivos incluidos en la comparación, cada uno con un color que conserva mientras siga
 * seleccionado: quitar o agregar otro no repinta a los demás.
 */
export function useComparedCrops(crops: Crop[]) {
    const [slots, setSlots] = useState<Record<string, number> | null>(null);
    const current = slots ?? Object.fromEntries(crops.slice(0, MAX_COMPARED).map((crop, index) => [crop.id, index]));

    function toggle(cropId: string) {
        const next = {...current};
        if (cropId in next) {
            delete next[cropId];
        } else {
            const used = new Set(Object.values(next));
            const free = CROP_COLORS.findIndex((_, index) => !used.has(index));
            if (free < 0) return;
            next[cropId] = free;
        }
        setSlots(next);
    }

    return {
        selected: crops.filter((crop) => crop.id in current),
        colorOf: (cropId: string) => {
            const slot = current[cropId];
            return slot === undefined ? undefined : CROP_COLORS[slot];
        },
        isFull: Object.keys(current).length >= MAX_COMPARED,
        toggle,
    };
}
