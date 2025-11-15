// URL base desde el archivo variables de entorno
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "__VITE_API_BASE_URL__";

// Notifications
export const userNotifications = `${BASE_URL}/Notificaciones/`;
