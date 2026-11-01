import {describe, expect, it} from "vitest";
import {nearestIndex, timeTicks, xTickCount} from "./chart";

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
