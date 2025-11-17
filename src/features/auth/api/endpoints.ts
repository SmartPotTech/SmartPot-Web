// URL base desde el archivo variables de entorno
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "__VITE_API_BASE_URL__";

// Auth
export const auth = `${BASE_URL}/auth/login`;
export const verifyToken = `${BASE_URL}/auth/verify`;
export const authRegister = `${BASE_URL}/auth/register`;
