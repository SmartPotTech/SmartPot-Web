import type { UserData } from "../../features/auth/types";

/**
 * Genera los headers de autenticación para las peticiones HTTP
 * @param user - Datos del usuario autenticado
 * @returns Headers con el token de autorización
 */
export function getAuthHeaders(user: UserData) {
    return {
        headers: {
            Authorization: "SmartPot-OAuth " + user.authToken,
        }
    }
}
