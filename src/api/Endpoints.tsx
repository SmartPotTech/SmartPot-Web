import { getEnv } from "../config/env";

// URL base desde el archivo variables de entorno
const BASE_URL = getEnv("VITE_API_BASE_URL", "http://localhost:8091", true);

// Auth
export const auth = `${BASE_URL}/auth/login`;
export const verifyToken = `${BASE_URL}/auth/verify`;
export const authRegister = `${BASE_URL}/auth/register`;
// User 
export const userUpdate = `${BASE_URL}/Users/Update/`

// History
export const cropHistory = `${BASE_URL}/Records/crop/`;
export const cropHistoryRange = `${BASE_URL}/Records/crop/between/`;

// Crops
export const userCrop = `${BASE_URL}/Cultivos/User/`;
export const numCrop = `${BASE_URL}/Cultivos/count/`;

// Notifications
export const userNotifications = `${BASE_URL}/Notificaciones/`;
