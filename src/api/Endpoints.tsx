// api endpoints

// URL base desde el archivo .env
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Auth
export const auth = `${BASE_URL}/auth/login`;
export const verifyToken = `${BASE_URL}/auth/verify`;

// User 
export const userUpdate =  `${BASE_URL}/Users/Update/`
export const userCreate =  `${BASE_URL}/Users/Create/`
// History
export const cropHistory = `${BASE_URL}/Records/crop/`;
export const cropHistoryRange = `${BASE_URL}/Records/crop/between/`;

// Crops
export const userCrop = `${BASE_URL}/Cultivos/User/`;
export const numCrop = `${BASE_URL}/Cultivos/count/`;

// Notifications
export const userNotifications = `${BASE_URL}/Notificaciones/`;
