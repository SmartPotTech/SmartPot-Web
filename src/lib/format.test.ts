import { describe, expect, it } from "vitest";
import { formatMetric, greeting, rangeStatus, timeAgo } from "./format";

describe("formatMetric", () => {
  it("usa la unidad y los decimales de cada variable", () => {
    expect(formatMetric("temperature", 23.456)).toBe("23,5 °C");
    expect(formatMetric("ph", 6.1234)).toBe("6,12");
    expect(formatMetric("tds", 812.7)).toBe("813 ppm");
  });

  it("muestra una raya cuando no hay dato", () => {
    expect(formatMetric("humidity", undefined)).toBe("—");
    expect(formatMetric("humidity", Number.NaN)).toBe("—");
  });
});

describe("rangeStatus", () => {
  const range = { min: 5.5, max: 6.5, unit: "pH", label: "el pH" };

  it("clasifica respecto al rango ideal", () => {
    expect(rangeStatus(5, range)).toBe("low");
    expect(rangeStatus(6, range)).toBe("ok");
    expect(rangeStatus(7, range)).toBe("high");
    expect(rangeStatus(undefined, range)).toBe("unknown");
    expect(rangeStatus(6, undefined)).toBe("unknown");
  });
});

describe("timeAgo y greeting", () => {
  it("expresa tiempos relativos en español", () => {
    const now = Date.parse("2026-09-26T12:00:00Z");
    expect(timeAgo("2026-09-26T11:58:00Z", now)).toBe("hace 2 minutos");
    expect(timeAgo(null, now)).toBe("nunca");
  });

  it("saluda según la hora", () => {
    expect(greeting(new Date(2026, 0, 1, 8))).toBe("Buenos días");
    expect(greeting(new Date(2026, 0, 1, 15))).toBe("Buenas tardes");
    expect(greeting(new Date(2026, 0, 1, 21))).toBe("Buenas noches");
  });
});
