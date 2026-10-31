import {describe, expect, it} from "vitest";
import {downsampleLTTB} from "./lttb";

interface Point {
    t: number;
    v: number;
}

const series = (n: number): Point[] => Array.from({length: n}, (_, t) => ({t, v: Math.sin(t / 20)}));

describe("downsampleLTTB", () => {
    it("reduce la serie al umbral y conserva los extremos", () => {
        const data = series(2000);
        const out = downsampleLTTB(data, 400, (p) => p.t, (p) => p.v);
        expect(out).toHaveLength(400);
        expect(out[0]).toBe(data[0]);
        expect(out[out.length - 1]).toBe(data[data.length - 1]);
        expect(out.every((p, i) => i === 0 || p.t > out[i - 1]!.t)).toBe(true);
    });

    it("no pierde un pico aislado", () => {
        const data = series(1000).map((p) => ({...p, v: 0}));
        data[501] = {t: 501, v: 50};
        const out = downsampleLTTB(data, 100, (p) => p.t, (p) => p.v);
        expect(out.some((p) => p.v === 50)).toBe(true);
    });

    it("deja intacta una serie corta", () => {
        const data = series(10);
        expect(downsampleLTTB(data, 400, (p) => p.t, (p) => p.v)).toEqual(data);
    });
});
