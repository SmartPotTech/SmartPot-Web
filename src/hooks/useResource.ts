import {createEffect, createMemo, createSignal, onCleanup, untrack} from "solid-js";
import {ApiError} from "../lib/api/client";
import {t} from "../lib/i18n";

export interface Resource<T> {
    readonly data: T | undefined;
    readonly error: string | null;
    readonly loading: boolean;
    reload: () => Promise<void>;
    setData: (value: T | undefined) => void;
}

/**
 * Carga un recurso de la API y, con intervalo, lo refresca mientras la pestaña está visible.
 * Al cambiar las dependencias conserva los datos anteriores hasta que llegan los nuevos.
 *
 * Cada carga lleva un número de generación: si mientras viaja la respuesta cambian las dependencias, se desmonta la
 * vista o se lanza otra recarga, la respuesta vieja se descarta en vez de pisar el estado actual. Así una petición
 * lenta no deja `loading` bloqueado ni muestra datos de un cultivo anterior.
 */
export function useResource<T>(
    loader: () => Promise<T>,
    deps: (() => unknown) | unknown[] = [],
    // Un número fijo o un accessor: si cambia (por ejemplo, más rápido mientras hay una orden pendiente), el
    // temporizador se reinicia con el nuevo ritmo sin volver a pedir el recurso.
    intervalMs?: number | (() => number | undefined),
): Resource<T> {
    const [data, setDataSignal] = createSignal<T | undefined>(undefined);
    const [error, setError] = createSignal<string | null>(null);
    const [loadedKey, setLoadedKey] = createSignal<string | null>(null);
    let generation = 0;

    const key = createMemo(() => {
        const raw = typeof deps === "function"
            ? deps()
            : deps.map((item) => (typeof item === "function" ? (item as () => unknown)() : item));
        return JSON.stringify(raw);
    });

    const load = async (forKey: string) => {
        const run = ++generation;
        try {
            const value = await untrack(loader);
            if (run !== generation) return;
            setDataSignal(() => value);
            setError(null);
        } catch (caught) {
            if (run !== generation) return;
            setError(caught instanceof ApiError ? caught.message : t("api.errorUnexpected"));
        } finally {
            if (run === generation) setLoadedKey(forKey);
        }
    };

    createEffect(() => {
        void load(key());
    });

    // El ritmo se lee dentro del efecto (que corre después de montar), no en un memo: así el accessor puede depender de
    // este mismo recurso o de otro declarado más abajo sin tocarlo antes de que exista.
    createEffect(() => {
        const currentKey = key();
        const period = typeof intervalMs === "function" ? intervalMs() : intervalMs;
        if (!period) return;
        const refresh = () => {
            if (document.visibilityState === "visible") void load(currentKey);
        };
        const timer = window.setInterval(refresh, period);
        document.addEventListener("visibilitychange", refresh);
        onCleanup(() => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", refresh);
        });
    });

    // Al desmontar, cualquier respuesta que siga en vuelo deja de escribir en los signals de esta vista.
    onCleanup(() => {
        generation += 1;
    });

    return {
        get data() {
            return data();
        },
        get error() {
            return error();
        },
        get loading() {
            return loadedKey() !== key();
        },
        reload: () => load(key()),
        setData: (value: T | undefined) => setDataSignal(() => value),
    };
}
