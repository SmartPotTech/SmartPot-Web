import {describe, expect, it} from "vitest";
import {nearestIndex, niceScale, stepDecimals, timeTicks, xTickCount} from "./chart";

describe("niceScale", () => {
    it("redondea el eje a múltiplos de un paso legible", () => {
        // Rango real del panel: 14,9 a 29,3 °C daba marcas 14.9 / 18.5 / 22.1 / 25.7 / 29.3.
        expect(niceScale(14.9, 29.3)).toEqual({min: 10, max: 30, step: 5, ticks: [10, 15, 20, 25, 30]});
        expect(niceScale(5.5, 6.5).ticks).toEqual([5.5, 5.75, 6, 6.25, 6.5]);
        expect(niceScale(560, 840).ticks).toEqual([500, 600, 700, 800, 900]);
    });

    it("abre un rango cuando todos los valores son iguales", () => {
        const scale = niceScale(20, 20);
        expect(scale.min).toBeLessThan(20);
        expect(scale.max).toBeGreaterThan(20);
        expect(niceScale(0, 0).ticks.length).toBeGreaterThan(1);
    });

    it("stepDecimals cuenta los decimales del paso", () => {
        expect(stepDecimals(5)).toBe(0);
        expect(stepDecimals(2.5)).toBe(1);
        expect(stepDecimals(0.25)).toBe(2);
    });
});

describe("gráficas", () => {
    it("nearestIndex elige el punto más cercano al puntero", () => {
        const xs = [10, 20, 30, 40];
        expect(nearestIndex([], 5)).toBeNull();
        expect(nearestIndex(xs, 0)).toBe(0);
        expect(nearestIndex(xs, 14)).toBe(0);
        expect(nearestIndex(xs, 16)).toBe(1);
        expect(nearestIndex(xs, 25)).toBe(1);
        expect(nearestIndex(xs, 39)).toBe(3);
        expect(nearestIndex(xs, 99)).toBe(3);
    });

    it("xTickCount usa menos marcas en pantallas angostas", () => {
        expect(xTickCount(320, 100)).toBe(3);
        expect(xTickCount(600, 100)).toBe(4);
        expect(xTickCount(1000, 100)).toBe(5);
        expect(xTickCount(1000, 2)).toBe(2);
    });
});

describe("timeTicks", () => {
    it("reparte las marcas por igual en el tiempo y alinea los extremos", () => {
        expect(timeTicks(0, 100, 3)).toEqual([
            {time: 0, anchor: "start"},
            {time: 50, anchor: "middle"},
            {time: 100, anchor: "end"},
        ]);
        expect(timeTicks(5, 5, 3)).toEqual([{time: 5, anchor: "middle"}]);
        expect(timeTicks(0, 10, 0)).toEqual([]);
    });
});
