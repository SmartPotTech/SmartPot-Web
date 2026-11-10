import {describe, expect, it} from "vitest";
import {
    SPECIES,
    SPECIES_DESCRIPTIONS,
    SPECIES_NAMES,
    SPECIES_RANGES,
} from "../features/landing/data";

describe("agronomic profiles synchronization (ARQ-07, AGRO-12)", () => {
    // Verifica que existan exactamente las 6 especies agronómicas del Stack B
    it("defines exactly the 6 canonical hydroponic species", () => {
        expect(SPECIES).toEqual(["LETTUCE", "TOMATO", "STRAWBERRY", "BASIL", "SPINACH", "PEPPER"]);
        expect(Object.keys(SPECIES_RANGES)).toHaveLength(6);
        expect(Object.keys(SPECIES_DESCRIPTIONS)).toHaveLength(6);
        expect(Object.keys(SPECIES_NAMES)).toHaveLength(6);
    });

    // Comprueba las descripciones canónicas exactas alineadas con SmartPot-AI/src/domain/profiles.rs
    it("has identical descriptions to the canonical AI domain profiles", () => {
        expect(SPECIES_DESCRIPTIONS.LETTUCE).toBe(
            "Cool-weather leafy green; bolts under excessive heat and light.",
        );
        expect(SPECIES_DESCRIPTIONS.TOMATO).toBe(
            "Fruit crop demanding in light, warmth, and nutrients during flowering.",
        );
        expect(SPECIES_DESCRIPTIONS.STRAWBERRY).toBe(
            "Sensitive to excess salts and high humidity, which promotes fungal growth.",
        );
        expect(SPECIES_DESCRIPTIONS.BASIL).toBe(
            "Warm-weather aromatic herb; tolerates dry environments.",
        );
        expect(SPECIES_DESCRIPTIONS.SPINACH).toBe(
            "Cool-weather leafy green with high nitrogen demand.",
        );
        expect(SPECIES_DESCRIPTIONS.PEPPER).toBe(
            "Warm-weather fruit crop; requires intense light and stable pH.",
        );
    });

    // Comprueba los rangos ideales numéricos exactos de las 6 especies
    it("has identical agronomic ideal ranges to the canonical AI domain profiles", () => {
        expect(SPECIES_RANGES.LETTUCE).toEqual({
            temperature: [15, 22],
            humidity: [50, 70],
            brightness: [300, 1400],
            ph: [5.5, 6.5],
            tds: [560, 840],
            soilMoisture: [60, 80],
        });

        expect(SPECIES_RANGES.TOMATO).toEqual({
            temperature: [20, 28],
            humidity: [60, 80],
            brightness: [600, 1800],
            ph: [5.5, 6.5],
            tds: [1400, 2800],
            soilMoisture: [55, 75],
        });

        expect(SPECIES_RANGES.STRAWBERRY).toEqual({
            temperature: [18, 26],
            humidity: [60, 75],
            brightness: [500, 1600],
            ph: [5.5, 6.2],
            tds: [700, 980],
            soilMoisture: [60, 80],
        });

        expect(SPECIES_RANGES.BASIL).toEqual({
            temperature: [20, 30],
            humidity: [40, 60],
            brightness: [500, 1600],
            ph: [5.5, 6.5],
            tds: [700, 1120],
            soilMoisture: [50, 70],
        });

        expect(SPECIES_RANGES.SPINACH).toEqual({
            temperature: [15, 24],
            humidity: [50, 70],
            brightness: [300, 1400],
            ph: [6, 7],
            tds: [1260, 1610],
            soilMoisture: [60, 80],
        });

        expect(SPECIES_RANGES.PEPPER).toEqual({
            temperature: [21, 29],
            humidity: [50, 70],
            brightness: [600, 1800],
            ph: [5.8, 6.5],
            tds: [1400, 2100],
            soilMoisture: [55, 75],
        });

        // Cada rango debe tener min estrictamente menor que max
        for (const species of SPECIES) {
            const ranges = SPECIES_RANGES[species];
            for (const [key, [min, max]] of Object.entries(ranges)) {
                expect(min, `${species}.${key} min < max`).toBeLessThan(max);
            }
        }
    });
});
