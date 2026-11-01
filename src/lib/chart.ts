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
