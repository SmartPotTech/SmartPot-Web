import {type Accessor, createSignal, onCleanup} from "solid-js";

export interface ElementSize {
    width: number;
    height: number;
}

/**
 * Tamaño en píxeles de un elemento, al día con ResizeObserver. Sirve para dibujar un SVG a escala 1:1 y que el
 * texto mida lo mismo en un teléfono que en un monitor. Sin ResizeObserver (pruebas) se queda con `fallback`.
 */
export function useElementSize(fallback: ElementSize): { ref: (element: HTMLElement) => void; size: Accessor<ElementSize> } {
    const [size, setSize] = createSignal(fallback, {
        equals: (prev, next) => prev.width === next.width && prev.height === next.height,
    });
    let observer: ResizeObserver | undefined;

    const ref = (element: HTMLElement) => {
        observer?.disconnect();
        if (typeof ResizeObserver === "undefined") return;
        observer = new ResizeObserver(([entry]) => {
            const box = entry?.contentRect;
            if (box && box.width > 0 && box.height > 0) {
                setSize({width: Math.round(box.width), height: Math.round(box.height)});
            }
        });
        observer.observe(element);
    };

    onCleanup(() => observer?.disconnect());
    return {ref, size};
}
