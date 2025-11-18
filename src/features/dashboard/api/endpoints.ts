// URL base desde el archivo variables de entorno
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "__VITE_API_BASE_URL__";

// Crops
export const userCrop = `${BASE_URL}/Crops/user/`;
export const numCrop = `${BASE_URL}/Crops/count/`;

//Commands Endpoints
export const activateUV = `${BASE_URL}/Commands/ActivateUVLight`;
