type EnvValue = string | undefined;

/**
 * getEnv
 * Intenta obtener una variable primero de import.meta.env (build-time)
 * y luego de window.__ENV__ (runtime, inyectado desde public/env.js)
 *
 * @param key - Nombre de la variable VITE_XXX
 * @param defaultValue - Valor por defecto si no está definida
 * @param required - Si true, lanza error si no existe
 */
export function getEnv(key: string, defaultValue?: string, required = false): string {
    // Build-time variable (definida en el momento del build por Vite)
    const buildValue: EnvValue = (import.meta.env as Record<string, string | undefined>)[key];

    // Runtime variable (inyectada desde public/env.js)
    const runtimeValue: EnvValue = (window as any).__ENV__?.[key];

    // Orden de prioridad: build > runtime > default
    const value = runtimeValue ?? buildValue ?? defaultValue;

    if (value !== undefined && value !== "") {
        return value;
    }

    if (required) {
        throw new Error(`Environment variable "${key}" is required but was not found`);
    }

    return "";
}
