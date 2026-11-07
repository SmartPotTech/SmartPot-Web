/** Índice del valor de `xs` (ordenado de menor a mayor) más cercano a `x`; null si no hay valores. */
export function nearestIndex(xs: readonly number[], x: number): number | null {
    if (xs.length === 0) return null;
    let lo = 0;
    let hi = xs.length - 1;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (xs[mid]! < x) lo = mid + 1;
        else hi = mid;
    }
    if (lo > 0 && x - xs[lo - 1]! <= xs[lo]! - x) return lo - 1;
    return lo;
}

/** Posición horizontal del puntero en las coordenadas del SVG (su viewBox). */
export function pointerX(event: PointerEvent, svg: SVGSVGElement, viewBoxWidth: number): number {
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return ((event.clientX - rect.left) / rect.width) * viewBoxWidth;
}

/** Cantidad de marcas del eje X que caben sin encimarse en un gráfico de `width` píxeles. */
export function xTickCount(width: number, points: number): number {
    return Math.min(width < 480 ? 3 : width < 720 ? 4 : 5, points);
}

export interface ValueScale {
    min: number;
    max: number;
    step: number;
    ticks: number[];
}

/** Paso «redondo» (1, 2, 2,5 o 5 × 10ⁿ) más cercano por arriba a `raw`. */
function niceStep(raw: number): number {
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const fraction = raw / magnitude;
    const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
    return nice * magnitude;
}

/**
 * Escala del eje Y con marcas redondas: amplía [min, max] hasta múltiplos de un paso legible (14, 16, 18…; 5,5; 6;
 * 6,5…) en vez de repartir cuatro intervalos iguales que dan valores como 25,7 o 22,1.
 */
export function niceScale(min: number, max: number, targetTicks = 5): ValueScale {
    let low = Math.min(min, max);
    let high = Math.max(min, max);
    if (!Number.isFinite(low) || !Number.isFinite(high)) return {min: 0, max: 1, step: 1, ticks: [0, 1]};
    if (low === high) {
        const spread = Math.abs(low) * 0.1 || 1;
        low -= spread;
        high += spread;
    }
    const step = niceStep((high - low) / Math.max(1, targetTicks - 1));
    const start = Math.floor(low / step + 1e-9) * step;
    const end = Math.ceil(high / step - 1e-9) * step;
    const ticks: number[] = [];
    // Se redondea cada marca al número de decimales del paso para no arrastrar errores de coma flotante.
    const decimals = stepDecimals(step);
    for (let value = start; value <= end + step / 2; value += step) ticks.push(Number(value.toFixed(decimals)));
    return {min: start, max: end, step, ticks};
}

/** Decimales que necesita un paso para mostrarse sin perder información (2,5 → 1; 0,25 → 2; 5 → 0). */
export function stepDecimals(step: number): number {
    if (!Number.isFinite(step) || step <= 0) return 0;
    let decimals = 0;
    while (decimals < 4 && Math.abs(Math.round(step * 10 ** decimals) - step * 10 ** decimals) > 1e-6) decimals += 1;
    return decimals;
}

export type TickAnchor = "start" | "middle" | "end";

/**
 * Marcas del eje X repartidas por igual en el tiempo (no por índice: con huecos en las lecturas, elegir puntos por
 * índice las amontona). La primera y la última se alinean al borde para no salirse del gráfico.
 */
export function timeTicks(minTime: number, maxTime: number, count: number): { time: number; anchor: TickAnchor }[] {
    if (count <= 1 || maxTime <= minTime) return count > 0 ? [{time: minTime, anchor: "middle"}] : [];
    return Array.from({length: count}, (_, idx) => ({
        time: minTime + ((maxTime - minTime) * idx) / (count - 1),
        anchor: idx === 0 ? "start" : idx === count - 1 ? "end" : "middle",
    }));
}
