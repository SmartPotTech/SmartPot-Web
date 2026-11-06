/**
 * Largest-Triangle-Three-Buckets: reduce una serie a `threshold` puntos conservando picos y tendencias, para que los
 * gráficos SVG no dibujen miles de nodos. Devuelve un subconjunto de los puntos originales (primero y último incluidos).
 */
export function downsampleLTTB<T>(data: readonly T[], threshold: number, x: (p: T) => number, y: (p: T) => number): T[] {
    if (threshold <= 0) return [];
    if (data.length <= threshold) {
        return [...data];
    }
    // Para uno o dos puntos no hay triángulo que calcular; se conservan los extremos y se respeta el contrato.
    if (threshold === 1) {
        return [data[0]!];
    }
    if (threshold === 2) {
        return [data[0]!, data[data.length - 1]!];
    }
    const sampled: T[] = [data[0]!];
    const every = (data.length - 2) / (threshold - 2);
    let a = 0;

    for (let i = 0; i < threshold - 2; i++) {
        // Promedio del balde siguiente: el tercer vértice del triángulo.
        const nextStart = Math.floor((i + 1) * every) + 1;
        const nextEnd = Math.min(Math.floor((i + 2) * every) + 1, data.length);
        let avgX = 0;
        let avgY = 0;
        for (let j = nextStart; j < nextEnd; j++) {
            avgX += x(data[j]!);
            avgY += y(data[j]!);
        }
        const count = Math.max(1, nextEnd - nextStart);
        avgX /= count;
        avgY /= count;

        // En el balde actual se elige el punto que forma el triángulo de mayor área con el anterior y el promedio.
        const start = Math.floor(i * every) + 1;
        const end = Math.floor((i + 1) * every) + 1;
        const ax = x(data[a]!);
        const ay = y(data[a]!);
        let maxArea = -1;
        let chosen = start;
        for (let j = start; j < end; j++) {
            const area = Math.abs((ax - avgX) * (y(data[j]!) - ay) - (ax - x(data[j]!)) * (avgY - ay));
            if (area > maxArea) {
                maxArea = area;
                chosen = j;
            }
        }
        sampled.push(data[chosen]!);
        a = chosen;
    }
    sampled.push(data[data.length - 1]!);
    return sampled;
}
