// URL base desde el archivo variables de entorno
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "__VITE_API_BASE_URL__";

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
export const userCrop = `${BASE_URL}/Crops/user/`;
export const numCrop = `${BASE_URL}/Crops/count/`;

// Notifications
export const userNotifications = `${BASE_URL}/Notificaciones/`;
