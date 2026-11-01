/** Lo que se pega en la configuración de un cliente MCP para usar una conexión de SmartPot por HTTP. */
export function mcpClientConfig(mcpUrl: string, token: string): string {
    const url = mcpUrl ? `${mcpUrl.replace(/\/+$/, "")}/mcp` : "<URL del servidor MCP>/mcp";
    return JSON.stringify(
        {
            mcpServers: {
                smartpot: {
                    type: "http",
                    url,
                    headers: {Authorization: `Bearer ${token}`},
                },
            },
        },
        null,
        2,
    );
}

/** Vigencias que ofrece la PWA; `undefined` es sin vencimiento. */
export const CONNECTION_EXPIRY: { label: string; days?: number }[] = [
    {label: "Sin vencimiento"},
    {label: "30 días", days: 30},
    {label: "90 días", days: 90},
    {label: "1 año", days: 365},
];
