// api endpoints

// URL base desde el archivo .env
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Auth
export const auth = `${BASE_URL}/auth/login`;
export const verifyToken = `${BASE_URL}/auth/verify`;

// History
export const cropHistory = `${BASE_URL}/Historial/crop/`;

// Crops
export const userCrop = `${BASE_URL}/Cultivos/User/`;

// Notifications
export const userNotifications = `${BASE_URL}/Notificiaciones/`;
