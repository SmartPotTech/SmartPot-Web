// src/lib/i18n/serverText.ts
// Traduce textos dinámicos generados por el backend (mensajes de error, diagnósticos de IA,
// recomendaciones, conclusiones, alertas de flota y notificaciones) al español cuando
// locale() === "es", manteniéndolos intactos cuando locale() === "en".

import {locale} from "./index";

const EXACT_TRANSLATIONS: Record<string, string> = {
    // Errores de API y autenticación
    "Incorrect email or password": "Correo o contraseña incorrectos",
    "Current password is incorrect": "La contraseña actual no es correcta",
    "Please log in to continue": "Inicia sesión para continuar",
    "Your session is invalid or has expired. Please log in again": "Tu sesión es inválida o ha expirado. Por favor inicia sesión nuevamente",
    "Connections can only be managed from the application": "Las conexiones solo se administran desde la aplicación",
    "Account details can only be changed from the application": "Los datos de la cuenta solo se cambian desde la aplicación",
    "Notification channels can only be configured from the application": "Los canales de aviso solo se configuran desde la aplicación",
    "Device credentials can only be retrieved from the application": "Las credenciales del dispositivo solo se consultan desde la aplicación",
    "This connection is read-only": "Esta conexión es de solo lectura",
    "Connection does not exist": "La conexión no existe",
    "Crop not found": "Cultivo no encontrado",
    "Actuator not found": "Actuador no encontrado",
    "Virtual crop has no physical device or credentials": "Un cultivo virtual no tiene dispositivo físico ni credenciales",
    "You can have up to 5 virtual crops": "Puedes tener hasta 5 cultivos virtuales",
    "Invalid or missing parameter": "Parámetro inválido o faltante",
    "Invalid credentials": "Credenciales inválidas",
    "An unexpected error occurred. Please try again later": "Ocurrió un error inesperado. Por favor intenta más tarde",
    "Request rejected by CSRF protection": "Solicitud rechazada por protección CSRF",

    // Estados de actuadores
    "Water pump is already on": "La bomba de agua ya está encendida",
    "Water pump is already off": "La bomba de agua ya está apagada",
    "UV light is already on": "La luz UV ya está encendida",
    "UV light is already off": "La luz UV ya está apagada",
    "Fan is already on": "El ventilador ya está encendido",
    "Fan is already off": "El ventilador ya está apagado",
    "Humidifier is already on": "El humidificador ya está encendido",
    "Humidifier is already off": "El humidificador ya está apagado",
    "Nutrient doser is already on": "El dosificador de nutrientes ya está encendido",
    "Nutrient doser is already off": "El dosificador de nutrientes ya está apagado",
    "pH doser is already on": "El dosificador de pH ya está encendido",
    "pH doser is already off": "El dosificador de pH ya está apagado",

    // Validaciones de formulario
    "Name is required": "El nombre es obligatorio",
    "Name must be between 2 and 40 characters": "El nombre debe tener entre 2 y 40 caracteres",
    "Email is required": "El correo es obligatorio",
    "Email must be a valid email address": "El correo debe tener un formato válido",
    "Password is required": "La contraseña es obligatoria",
    "Password must be at least 8 characters": "La contraseña debe tener al menos 8 caracteres",
    "Crop type is required": "El tipo de cultivo es obligatorio",
    "Actuator type is required": "El tipo de actuador es obligatorio",
    "Action is required": "La acción es obligatoria",
    "Select at most 20 crops": "Selecciona hasta 20 cultivos",
    "Minimum duration is 1 second": "La duración mínima es de 1 segundo",
    "Maximum duration is 1 hour": "La duración máxima es de 1 hora",

    // Etiquetas de salud de IA
    "Healthy": "Saludable",
    "Excellent": "Excelente",
    "Good": "Bueno",
    "Fair": "Aceptable",
    "In danger": "En riesgo",
    "Critical": "Crítico",
    "Unknown": "Desconocido",

    // Resúmenes de IA
    "Overall crop status is healthy": "El estado general del cultivo es saludable",
    "Crop status is good": "El estado del cultivo es bueno",
    "Crop condition is fair with some parameters off optimal range": "La condición del cultivo es aceptable con algunos parámetros fuera del rango óptimo",
    "Crop is in danger: immediate intervention required": "El cultivo está en riesgo: se requiere intervención inmediata",
    "Critical state: urgent action required to prevent crop loss": "Estado crítico: se requiere acción urgente para evitar pérdida del cultivo",

    // Diagnósticos y recomendaciones de parámetros
    "Temperature is optimal": "La temperatura es óptima",
    "Temperature is below optimal range": "La temperatura está por debajo del rango óptimo",
    "Temperature is above optimal range": "La temperatura está por encima del rango óptimo",
    "Humidity is optimal": "La humedad es óptima",
    "Humidity is too low": "La humedad es muy baja",
    "Humidity is too high": "La humedad es muy alta",
    "Substrate moisture is optimal": "La humedad del sustrato es óptima",
    "Substrate is too dry": "El sustrato está muy seco",
    "Substrate is overwatered": "El sustrato está sobrehumedecido",
    "pH is optimal": "El pH es óptimo",
    "pH is too acidic": "El pH es muy ácido",
    "pH is too alkaline": "El pH es muy alcalino",
    "Nutrient concentration is optimal": "La concentración de nutrientes es óptima",
    "Nutrient concentration is too low": "La concentración de nutrientes es muy baja",
    "Nutrient concentration is too high": "La concentración de nutrientes es muy alta",
    "Light level is optimal": "El nivel de luz es óptimo",
    "Insufficient light": "Luz insuficiente",
    "Excessive light": "Luz excesiva",

    // Recomendaciones de IA
    "Run water pump to hydrate substrate without flooding": "Riega hasta humedecer el sustrato sin encharcarlo.",
    "Run water pump to hydrate substrate": "Riega hasta humedecer el sustrato.",
    "Reduce watering frequency and ensure proper drainage": "Reduce el riego y permite que el sustrato se airee.",
    "Turn on ventilation to lower temperature and humidity": "Enciende la ventilación para reducir la temperatura y humedad.",
    "Turn on humidifier to increase ambient humidity": "Enciende el humidificador para aumentar la humedad ambiental.",
    "Turn on UV grow light to supplement lighting": "Enciende la luz UV para complementar la iluminación.",
    "Turn off grow lights or move to shaded area": "Apaga las luces o traslada a un área con sombra.",
    "Add nutrients to raise solution concentration": "Agrega nutrientes para elevar la concentración.",
    "Dilute nutrient solution with fresh water": "Diluye con agua fresca para bajar la concentración.",
    "Dose pH Down to lower solution pH": "Dosifica corrector de pH para reducir la alcalinidad.",
    "Dose pH Up to raise solution pH": "Dosifica corrector de pH para reducir la acidez.",

    // Conclusiones del sistema experto
    "Drought": "Sequía",
    "Substrate is very dry.": "El sustrato está muy seco.",
    "Substrate is very dry": "El sustrato está muy seco",
    "Heat stress": "Estrés térmico",
    "High temperature combined with low humidity.": "Alta temperatura combinada con baja humedad.",
    "High temperature combined with low humidity": "Alta temperatura combinada con baja humedad",
    "Nutrient deficiency": "Deficiencia nutricional",
    "Nutrient burn risk": "Riesgo de quemadura por nutrientes",
    "Lighting deficit": "Déficit de iluminación",
    "Acidic drift": "Desviación ácida",
    "Alkaline drift": "Desviación alcalina",
    "Optimal conditions": "Condiciones óptimas",
    "All measured parameters are within optimal ranges.": "Todos los parámetros medidos están dentro de los rangos óptimos.",

    // Consejos de ubicación (Placement)
    "Ideal placement": "Lugar ideal",
    "Crop placement is well-suited for this species": "La ubicación del cultivo es adecuada para esta especie",
    "Insufficient exposure": "Exposición insuficiente",
    "Excessive sun exposure": "Exposición solar excesiva",
    "Consider moving the crop to an area with partial sun": "Considera trasladar el cultivo a una zona con sol parcial",
    "Consider moving the crop to full sun or adding grow lights": "Considera trasladar el cultivo a pleno sol o agregar iluminación",

    // Flota (Fleet)
    "All crops evaluated. No collective risks detected.": "Todos los cultivos evaluados. No se detectan riesgos colectivos.",
    "Fleet condition is good across all monitored crops.": "La flota se encuentra en buen estado en todos los cultivos monitoreados.",
    "Multiple crops require attention due to high temperature.": "Varios cultivos requieren atención debido a alta temperatura.",
    "Multiple crops show substrate drying.": "Varios cultivos muestran resecamiento del sustrato.",
    "Shared environmental issues detected across multiple crops.": "Se detectaron problemas ambientales compartidos en varios cultivos.",
    "Turn on ventilation on affected crops": "Encender ventilación en los cultivos afectados",
    "Water crops with dry substrate": "Regar los cultivos con sustrato seco",
    "Turn on supplemental lighting": "Encender iluminación suplementaria",

    // Notificaciones
    "Crop disconnected": "Cultivo desconectado",
    "Critical health alert": "Alerta crítica de salud",
    "Autonomous action taken": "Acción autónoma ejecutada",
};

const DYNAMIC_PATTERNS: Array<{ regex: RegExp; replace: (...args: string[]) => string }> = [
    {
        // «Lettuce» lost connection with SmartPot.
        regex: /^«(.+)» lost connection with SmartPot\.$/,
        replace: (_, name) => `«${name}» perdió la conexión con SmartPot.`,
    },
    {
        // Too many requests. Please try again in 24 seconds
        regex: /^Too many requests\. Please try again in (\d+) seconds?$/,
        replace: (_, sec) => `Demasiadas solicitudes. Por favor intenta de nuevo en ${sec} segundos.`,
    },
    {
        // Water pump active for 15 s
        regex: /^(.+) active for (\d+) s$/,
        replace: (_, act, sec) => `${translateServerText(act)} encendido por ${sec} s`,
    },
];

/**
 * Traduce un texto proveniente del servidor al español si el locale activo es "es".
 * Si el locale es "en" o el texto no tiene traducción conocida, se retorna el texto original.
 */
export function translateServerText(text: string | null | undefined): string {
    if (!text) return "";
    if (locale() === "en") return text;

    const trimmed = text.trim();
    if (EXACT_TRANSLATIONS[trimmed]) {
        return EXACT_TRANSLATIONS[trimmed];
    }

    for (const pattern of DYNAMIC_PATTERNS) {
        const match = trimmed.match(pattern.regex);
        if (match) {
            return pattern.replace(...match);
        }
    }

    return text;
}

/** Alias corto para uso en plantillas JSX */
export const st = translateServerText;
