import {t} from "./i18n";

/** Lo que se pega en la configuración de un cliente MCP para usar una conexión de SmartPot por HTTP. */
export function mcpClientConfig(mcpUrl: string, token: string): string {
    const url = mcpUrl ? `${mcpUrl.replace(/\/+$/, "")}/mcp` : `${t("mcp.urlPlaceholder")}/mcp`;
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
    {
        get label() {
            return t("mcp.expiry.never");
        }
    },
    {
        get label() {
            return t("mcp.expiry.30");
        }, days: 30
    },
    {
        get label() {
            return t("mcp.expiry.90");
        }, days: 90
    },
    {
        get label() {
            return t("mcp.expiry.365");
        }, days: 365
    },
];
