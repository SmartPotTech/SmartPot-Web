import {useCallback, useEffect, useRef, useState} from "react";
import {ApiError} from "../lib/api/client";

interface Resource<T> {
    data: T | undefined;
    error: string | null;
    loading: boolean;
    reload: () => Promise<void>;
    setData: (value: T | undefined) => void;
}

/**
 * Carga un recurso de la API y, con intervalo, lo refresca mientras la pestaña está visible.
 * Al cambiar las dependencias conserva los datos anteriores hasta que llegan los nuevos.
 */
export function useResource<T>(loader: () => Promise<T>, deps: unknown[], intervalMs?: number): Resource<T> {
    const [data, setData] = useState<T>();
    const [error, setError] = useState<string | null>(null);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const loaderRef = useRef(loader);
    const key = JSON.stringify(deps);

    useEffect(() => {
        loaderRef.current = loader;
    });

    const load = useCallback(async (forKey: string) => {
        try {
            const value = await loaderRef.current();
            setData(value);
            setError(null);
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : "Ocurrió un error inesperado.");
        } finally {
            setLoadedKey(forKey);
        }
    }, []);

    useEffect(() => {
        void load(key);
        if (!intervalMs) return;
        const refresh = () => {
            if (document.visibilityState === "visible") void load(key);
        };
        const timer = window.setInterval(refresh, intervalMs);
        document.addEventListener("visibilitychange", refresh);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", refresh);
        };
    }, [key, intervalMs, load]);

    const reload = useCallback(() => load(key), [key, load]);

    return {data, error, loading: loadedKey !== key, reload, setData};
}
