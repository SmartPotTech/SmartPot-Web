type EnvValue = string | undefined;

/**
 * getEnv
 * @param key - Nombre de la variable VITE_XXX
 * @param defaultValue - Valor por defecto si no está definida
 * @param required - Si true, lanza error si no existe
 */
export function getEnv(key: string, defaultValue?: string, required = false): string {
    const value: EnvValue = (import.meta.env as Record<string, string | undefined>)[key];

    if (value !== undefined && value !== "") {
        return value;
    }

    if (defaultValue !== undefined) {
        return defaultValue;
    }

    if (required) {
        throw new Error(`Environment variable "${key}" is required but was not found`);
    }

    return "";
}
