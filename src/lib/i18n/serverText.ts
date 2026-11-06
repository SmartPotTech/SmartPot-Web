// src/lib/i18n/serverText.ts
// Traduce textos dinámicos generados por el backend (mensajes de error, diagnósticos de IA,
// recomendaciones, conclusiones, alertas de flota, aprendizaje y notificaciones) al español cuando
// locale() === "es", manteniéndolos intactos cuando locale() === "en".
//
// La traducción se hace por texto exacto y, cuando el backend interpola valores, por patrones.
// Los resúmenes del asistente y los cuerpos de notificación son concatenaciones de frases: si no
// hay una regla para el texto completo, se traduce cada oración y se vuelven a unir.

import {locale} from "./index";

const SPECIES: Record<string, string> = {
    lettuce: "lechuga",
    tomato: "tomate",
    strawberry: "fresa",
    basil: "albahaca",
    spinach: "espinaca",
    pepper: "pimiento",
    "bell pepper": "pimiento",
};

const RANGE_ARTICLES: Record<string, string> = {
    Temperature: "La temperatura",
    "Air humidity": "La humedad del aire",
    Light: "La luz",
    pH: "El pH",
    "Nutrient level (TDS)": "El nivel de nutrientes (TDS)",
    "Substrate moisture": "La humedad del sustrato",
};

const RANGE_NOUNS: Record<string, string> = {
    temperature: "temperatura",
    "air humidity": "humedad del aire",
    light: "luz",
    ph: "pH",
    "nutrient level (tds)": "nivel de nutrientes (TDS)",
    "substrate moisture": "humedad del sustrato",
};

const HEALTH_LABELS: Record<string, string> = {
    Excellent: "Excelente",
    Healthy: "Saludable",
    Good: "Bueno",
    Fair: "Aceptable",
    "At risk": "En riesgo",
    "In danger": "En riesgo",
    Critical: "Crítico",
    Unknown: "Desconocido",
    "No data": "Sin datos",
};

const FLEET_PHRASES: Record<string, string> = {
    "low temperature": "temperatura baja",
    "high temperature": "temperatura alta",
    "dry air": "aire seco",
    "very humid air": "aire muy húmedo",
    "low light": "poca luz",
    "excess light": "exceso de luz",
    "low ph": "pH bajo",
    "high ph": "pH alto",
    "low nutrients": "nutrientes bajos",
    "excess nutrients": "nutrientes en exceso",
    "dry substrate": "sustrato seco",
    "waterlogged substrate": "sustrato encharcado",
};

const MODEL_NAMES: Record<string, string> = {
    Baseline: "Línea base",
    "Logistic regression": "Regresión logística",
    "Logistic Regression": "Regresión logística",
    "K-nearest neighbors": "Vecinos más cercanos (KNN)",
    "Nearest neighbors": "Vecinos más cercanos (KNN)",
    "Decision tree": "Árbol de decisión",
    "Random forest": "Bosque aleatorio",
    "Gradient boosting": "Potenciación del gradiente",
    "Neural network (MLP)": "Red neuronal (MLP)",
    "MLP neural network": "Red neuronal (MLP)",
    "Ridge regression": "Regresión Ridge",
    "Isolation Forest": "Bosque de aislamiento",
    "Macro F1": "F1 macro",
    "Mean absolute error (%)": "Error absoluto medio (%)",
};

const WEATHER_LABELS: Record<string, string> = {
    Clear: "Despejado",
    "Mostly clear": "Mayormente despejado",
    "Partly cloudy": "Parcialmente nublado",
    Cloudy: "Nublado",
    Fog: "Niebla",
    Drizzle: "Llovizna",
    Rain: "Lluvia",
    Snow: "Nieve",
    Storm: "Tormenta",
};

const EXACT_TRANSLATIONS: Record<string, string> = {
    // Errores de API y autenticación
    "Incorrect email or password": "Correo o contraseña incorrectos",
    "Current password is incorrect": "La contraseña actual no es correcta",
    "Please log in to continue": "Inicia sesión para continuar",
    "Log in to continue": "Inicia sesión para continuar",
    "Your session is invalid or has expired. Please log in again": "Tu sesión no es válida o ha expirado. Inicia sesión de nuevo",
    "Your account no longer exists. Please log in again": "Tu cuenta ya no existe. Inicia sesión de nuevo",
    "Connections can only be managed from the application": "Las conexiones solo se administran desde la aplicación",
    "Account details can only be changed from the application": "Los datos de la cuenta solo se cambian desde la aplicación",
    "Notification channels can only be configured from the application": "Los canales de aviso solo se configuran desde la aplicación",
    "Device credentials can only be retrieved from the application": "Las credenciales del dispositivo solo se consultan desde la aplicación",
    "This connection is read-only": "Esta conexión es de solo lectura",
    "Connection does not exist": "La conexión no existe",
    "Connection token is invalid or has been revoked": "El token de conexión no es válido o fue revocado",
    "You reached the limit of 10 connections; revoke one to create a new one": "Llegaste al límite de 10 conexiones; revoca una para crear otra",
    "Crop does not exist": "El cultivo no existe",
    "Crop not found": "El cultivo no existe",
    "Actuator does not exist in this crop": "El actuador no existe en este cultivo",
    "Actuator not found": "El actuador no existe",
    "A virtual crop does not use credentials: SmartPot simulates it for you": "Un cultivo virtual no usa credenciales: SmartPot lo simula por ti",
    "A virtual crop has no physical device or credentials": "Un cultivo virtual no tiene dispositivo físico ni credenciales",
    "Virtual crop has no physical device or credentials": "Un cultivo virtual no tiene dispositivo físico ni credenciales",
    "You can have up to 5 virtual crops": "Puedes tener hasta 5 cultivos virtuales",
    "Invalid or missing parameter": "Parámetro inválido o faltante",
    "Invalid credentials": "Credenciales inválidas",
    "An unexpected error occurred. Please try again later": "Ocurrió un error inesperado. Intenta de nuevo más tarde",
    "Request rejected by CSRF protection": "Solicitud rechazada por protección CSRF",
    "The requested route does not exist": "La ruta solicitada no existe",
    "Method not allowed for this route": "Método no permitido para esta ruta",
    "Request body is not valid JSON": "El cuerpo de la solicitud no es un JSON válido",
    "Invalid input data": "Datos de entrada inválidos",
    "Period must be between 1 and 168 hours": "El período debe estar entre 1 y 168 horas",
    "Start date must be before end date": "La fecha de inicio debe ser anterior a la fecha de fin",
    "The crop has no readings yet": "El cultivo aún no tiene lecturas",
    "No readings to analyze yet for this crop": "Aún no hay lecturas para analizar en este cultivo",
    "The crop already has an actuator of that type": "El cultivo ya tiene un actuador de ese tipo",
    "A crop cannot transition between real and virtual: create a new one": "Un cultivo no puede pasar de real a virtual ni de virtual a real: crea uno nuevo",
    "Only virtual crops have simulation": "Solo los cultivos virtuales tienen simulación",
    "The crop does not have a device key: please create it again": "El cultivo no tiene clave de dispositivo: créalo de nuevo",
    "This is a real crop: readings come from its physical device": "Este es un cultivo real: las lecturas vienen de su dispositivo físico",
    "Select a location so the crop follows its weather": "Selecciona una ubicación para que el cultivo siga el clima de ese lugar",
    "Enter between 2 and 80 characters to search for a location": "Escribe entre 2 y 80 caracteres para buscar una ubicación",
    "Virtual crops are not enabled on this server": "Los cultivos virtuales no están habilitados en este servidor",
    "The virtual crop simulator is not available at this moment": "El simulador de cultivos virtuales no está disponible en este momento",
    "Could not query location service": "No se pudo consultar el servicio de ubicación",
    "Device communication is not enabled on this server": "La comunicación con dispositivos no está habilitada en este servidor",
    "The device did not confirm the command in time": "El dispositivo no confirmó el comando a tiempo",
    "The device did not respond to the command. Verify that it is connected.": "El dispositivo no respondió al comando. Verifica que esté conectado.",
    "without detail": "sin detalle",
    "The MQTT broker is not available at this moment": "El broker MQTT no está disponible en este momento",
    "The crop does not have this actuator": "El cultivo no tiene este actuador",
    "There is already a command in progress for this actuator": "Ya hay un comando en curso para este actuador",
    "There is already a command in progress for this actuator: wait for confirmation": "Ya hay un comando en curso para este actuador: espera la confirmación",
    "Bulk action": "Acción en bloque",
    "Notification does not exist": "La notificación no existe",
    "Channel does not exist": "El canal no existe",
    "Channel is not linked": "El canal no está vinculado",
    "That chat does not receive alerts for this crop": "Ese chat no recibe avisos de este cultivo",
    "You can share a crop with up to 10 chats": "Puedes compartir un cultivo con hasta 10 chats",
    "Telegram did not respond": "Telegram no respondió",
    "The AI assistant is not available at this moment": "El asistente de IA no está disponible en este momento",
    "The AI assistant is disabled on this server": "El asistente de IA está deshabilitado en este servidor",
    "Create your first crop so the assistant can compare it.": "Crea tu primer cultivo para que el asistente pueda compararlo.",
    "Could not fetch weather; using last known reading.": "No se pudo consultar el clima; se usa la última lectura conocida.",
    "An account with this email already exists": "Ya existe una cuenta con este correo",
    "Password reset link is invalid or has expired": "El enlace para restablecer la contraseña no es válido o ha expirado",
    "Password is too long (maximum 72 bytes)": "La contraseña es demasiado larga (máximo 72 bytes)",
    "Password must contain at least one uppercase letter, one lowercase letter, and one number": "La contraseña debe incluir al menos una mayúscula, una minúscula y un número",
    "You do not have permission to perform this action": "No tienes permiso para realizar esta acción",
    "Reading does not contain any measurement value": "La lectura no contiene ningún valor de medición",
    "Invalid data": "Datos inválidos",
    "Required field": "Campo obligatorio",

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
    "Name can only contain letters and spaces": "El nombre solo puede tener letras y espacios",
    "Last name is required": "El apellido es obligatorio",
    "Last name must be between 2 and 60 characters": "El apellido debe tener entre 2 y 60 caracteres",
    "Last name can only contain letters and spaces": "El apellido solo puede tener letras y espacios",
    "Email is required": "El correo es obligatorio",
    "Email must be a valid email address": "El correo debe tener un formato válido",
    "Invalid email address": "Correo electrónico inválido",
    "Email is too long": "El correo es demasiado largo",
    "Password is required": "La contraseña es obligatoria",
    "Password must be at least 8 characters": "La contraseña debe tener al menos 8 caracteres",
    "Password is too long": "La contraseña es demasiado larga",
    "Password reset link is invalid": "El enlace para restablecer la contraseña no es válido",
    "New password is required": "La nueva contraseña es obligatoria",
    "Current password is required": "La contraseña actual es obligatoria",
    "Crop name is required": "El nombre del cultivo es obligatorio",
    "Crop name must be between 2 and 60 characters": "El nombre del cultivo debe tener entre 2 y 60 caracteres",
    "Crop type is required": "El tipo de cultivo es obligatorio",
    "Indicate whether automation remains active": "Indica si la automatización sigue activa",
    "Select at most 20 crops": "Selecciona hasta 20 cultivos",
    "Actuator is required": "El actuador es obligatorio",
    "Action is required": "La acción es obligatoria",
    "Actuator type is required": "El tipo de actuador es obligatorio",
    "Minimum duration is 1 second": "La duración mínima es de 1 segundo",
    "Maximum duration is 1 hour": "La duración máxima es de 1 hora",
    "Choose the simulation mode": "Elige el modo de simulación",
    "Minimum interval is 10 seconds": "El intervalo mínimo es de 10 segundos",
    "Maximum interval is 300 seconds": "El intervalo máximo es de 300 segundos",
    "Value out of range": "Valor fuera de rango",
    "Location name is required": "El nombre de la ubicación es obligatorio",
    "Location name is too long": "El nombre de la ubicación es demasiado largo",
    "Latitude is required": "La latitud es obligatoria",
    "Longitude is required": "La longitud es obligatoria",
    "Latitude is out of range": "La latitud está fuera de rango",
    "Longitude is out of range": "La longitud está fuera de rango",
    "Select at most 5 event types": "Selecciona hasta 5 tipos de aviso",
    "Digest interval must be at least 1 hour": "El intervalo del resumen debe ser de al menos 1 hora",
    "Digest interval must be at most 24 hours": "El intervalo del resumen debe ser de máximo 24 horas",
    "Use HH:mm format, for example 07:30": "Usa el formato HH:mm, por ejemplo 07:30",

    // Etiquetas de salud de IA
    "Healthy": "Saludable",
    "Excellent": "Excelente",
    "Good": "Bueno",
    "Fair": "Aceptable",
    "In danger": "En riesgo",
    "At risk": "En riesgo",
    "Critical": "Crítico",
    "Unknown": "Desconocido",
    "No data": "Sin datos",

    // Títulos de las 21 reglas del sistema experto
    "Heat stress": "Estrés por calor",
    "Fungal risk": "Riesgo de hongos",
    "Nutrient lockout": "Bloqueo de nutrientes",
    "Root rot risk": "Riesgo de pudrición radicular",
    "Drought": "Sequía",
    "Leggy growth": "Crecimiento ahilado (etiolación)",
    "Cold stress": "Estrés por frío",
    "Excess salts": "Exceso de sales",
    "Model recommends ventilation": "El modelo recomienda ventilar",
    "Possible sensor fault": "Posible falla del sensor",
    "Critical state": "Estado crítico",
    "Compound stress": "Estrés combinado",
    "Rapid drying": "Secado rápido",
    "Rising heat": "Calor en aumento",
    "Watering likely within the next hour": "Es probable que haya que regar en la próxima hora",
    "Heat likely within the next hour": "Es probable que haga calor en la próxima hora",
    "Unusual combination": "Combinación poco habitual",
    "It is raining": "Está lloviendo",
    "Sensor disagrees with outdoor weather": "El sensor no coincide con el clima de afuera",
    "Night rest": "Descanso nocturno",
    "Ideal conditions": "Condiciones ideales",

    // Mensajes estáticos de las reglas
    "Heat with dry air: the plant loses water faster than it absorbs it.": "Calor con aire seco: la planta pierde agua más rápido de lo que la absorbe.",
    "High humidity with warm temperature: favorable conditions for fungi and mold.": "Humedad alta con temperatura cálida: condiciones favorables para hongos y moho.",
    "Nutrients are present in the solution, but out-of-range pH prevents absorption. Correct pH before adding more nutrients.": "Los nutrientes están presentes en la solución, pero un pH fuera de rango impide la absorción. Corrige el pH antes de agregar más nutrientes.",
    "Waterlogged and warm substrate: roots lose oxygen and pathogens appear.": "Sustrato encharcado y cálido: las raíces pierden oxígeno y aparecen patógenos.",
    "The substrate is very dry: water soon to prevent wilting.": "El sustrato está muy seco: riega pronto para evitar que la planta se marchite.",
    "Low light with warm temperature: the plant stretches its stems seeking light and weakens.": "Poca luz con temperatura cálida: la planta estira los tallos buscando luz y se debilita.",
    "Temperature is too low for this species: growth stops.": "La temperatura es demasiado baja para esta especie: el crecimiento se detiene.",
    "Salt concentration is high enough to burn roots. Dilute the solution.": "La concentración de sales es suficiente para quemar las raíces. Diluye la solución.",
    "The reading is anomalous compared to history and multiple variables are at extreme values. Check sensor wiring and calibration before acting.": "La lectura es atípica respecto al historial y varias variables están en valores extremos. Revisa el cableado y la calibración del sensor antes de actuar.",
    "Multiple stress factors are acting simultaneously; correct the most severe one first and monitor the response.": "Varios factores de estrés actúan al mismo tiempo; corrige primero el más grave y observa la respuesta.",
    "This combination of values has rarely been seen in crops of this species. If nothing changed in the crop, check the sensors.": "Esta combinación de valores se ha visto pocas veces en cultivos de esta especie. Si nada cambió en el cultivo, revisa los sensores.",
    "The plant is in its dark period: there is no need to turn on the UV light until morning.": "La planta está en su período oscuro: no hace falta encender la luz UV hasta la mañana.",
    "All measured variables are within their optimal range. Great job!": "Todas las variables medidas están dentro de su rango óptimo. ¡Buen trabajo!",
    "Relocating the crop is also recommended.": "También se recomienda cambiar el cultivo de lugar.",

    // Otras conclusiones del sistema experto
    "Substrate is very dry.": "El sustrato está muy seco.",
    "Substrate is very dry": "El sustrato está muy seco",
    "High temperature combined with low humidity.": "Alta temperatura combinada con baja humedad.",
    "High temperature combined with low humidity": "Alta temperatura combinada con baja humedad",
    "Nutrient deficiency": "Deficiencia nutricional",
    "Nutrient burn risk": "Riesgo de quemadura por nutrientes",
    "Lighting deficit": "Déficit de iluminación",
    "Acidic drift": "Desviación ácida",
    "Alkaline drift": "Desviación alcalina",
    "Optimal conditions": "Condiciones óptimas",
    "All measured parameters are within optimal ranges.": "Todos los parámetros medidos están dentro de los rangos óptimos.",

    // Resúmenes antiguos de IA
    "Overall crop status is healthy": "El estado general del cultivo es saludable",
    "Crop status is good": "El estado del cultivo es bueno",
    "Crop condition is fair with some parameters off optimal range": "La condición del cultivo es aceptable con algunos parámetros fuera del rango óptimo",
    "Crop is in danger: immediate intervention required": "El cultivo está en riesgo: se requiere intervención inmediata",
    "Critical state: urgent action required to prevent crop loss": "Estado crítico: se requiere acción urgente para evitar pérdida del cultivo",

    // Recomendaciones de diagnóstico
    "Move the crop away from cold drafts or use a gentle heat source.": "Aleja el cultivo de las corrientes de aire frío o usa una fuente de calor suave.",
    "Ventilate the space and avoid direct sunlight during the hottest hours.": "Ventila el espacio y evita el sol directo en las horas de más calor.",
    "Increase ambient humidity with a humidifier or by grouping plants together.": "Aumenta la humedad ambiental con un humidificador o agrupando las plantas.",
    "Improve air circulation to prevent fungal growth.": "Mejora la circulación del aire para evitar hongos.",
    "Turn on the UV light or move the crop closer to a light source.": "Enciende la luz UV o acerca el cultivo a una fuente de luz.",
    "Reduce light hours or move the lamp farther away to prevent leaf burn.": "Reduce las horas de luz o aleja la lámpara para evitar quemar las hojas.",
    "Add pH Up solution in small doses.": "Agrega solución pH Up en dosis pequeñas.",
    "Add pH Down solution in small doses.": "Agrega solución pH Down en dosis pequeñas.",
    "Add nutrient solutions A and B according to the growth stage.": "Agrega las soluciones nutritivas A y B según la etapa de crecimiento.",
    "Dilute the solution with clean water to lower salt concentration.": "Diluye la solución con agua limpia para bajar la concentración de sales.",
    "Water until the substrate is moist without waterlogging it.": "Riega hasta que el sustrato quede húmedo sin encharcarlo.",
    "Pause watering and check drainage to prevent root rot.": "Suspende el riego y revisa el drenaje para evitar la pudrición de raíces.",

    // Consejos de ubicación
    "Good location": "Buena ubicación",
    "Needs more sun": "Necesita más sol",
    "Would do better with more sun": "Le vendría mejor más sol",
    "Too much sun": "Demasiado sol",
    "Would do better with less sun": "Le vendría mejor menos sol",
    "It is sunny outside right now.": "Ahora mismo hace sol afuera.",
    "If direct sunlight hits the sensor, shade it so it measures air temperature.": "Si el sol directo le da al sensor, dale sombra para que mida la temperatura del aire.",
    "Check the sensor or confirm that the crop is actually outdoors.": "Revisa el sensor o confirma que el cultivo esté realmente al aire libre.",
    "outdoors in full sun": "al aire libre a pleno sol",
    "outdoors in partial shade": "al aire libre en semisombra",
    "outdoors in shade": "al aire libre en sombra",
    "indoors next to a sunny window": "bajo techo junto a una ventana soleada",
    "indoors with indirect light": "bajo techo con luz indirecta",
    "indoors without natural light": "bajo techo sin luz natural",
    "move it to full sun": "muévelo a pleno sol",
    "move it outdoors to full sun or, if not possible, place it next to the sunniest window": "muévelo al aire libre a pleno sol o, si no es posible, ponlo junto a la ventana más soleada",
    "Lettuce prefers partial shade: under strong sun it overheats, bolts, and turns bitter.": "La lechuga prefiere la semisombra: con sol fuerte se recalienta, se espiga y amarga.",
    "Spinach grows best in partial shade and cool weather.": "La espinaca crece mejor en semisombra y con clima fresco.",
    "Tomatoes are sun-loving: they need 6 to 8 hours of direct sunlight to flower and fruit.": "El tomate ama el sol: necesita de 6 a 8 horas de sol directo para florecer y dar fruto.",
    "Bell peppers are sun-loving: they need 6 to 8 hours of direct sunlight.": "El pimiento ama el sol: necesita de 6 a 8 horas de sol directo.",
    "Strawberries need at least 6 hours of direct sunlight to produce sweet fruit.": "La fresa necesita al menos 6 horas de sol directo para dar fruta dulce.",
    "Basil is sun-loving: with 6 hours of direct sunlight it grows compact and aromatic.": "La albahaca ama el sol: con 6 horas de sol directo crece compacta y aromática.",

    // Flota
    "There are no readings yet to compare your crops.": "Todavía no hay lecturas para comparar tus cultivos.",
    "Within range": "Dentro del rango",
    "Group variables are, on average, within their optimal range.": "En promedio, las variables del grupo están dentro de su rango óptimo.",
    "Similar conditions": "Condiciones similares",
    "All crops are under similar conditions.": "Todos los cultivos están en condiciones similares.",
    "low temperature": "temperatura baja",
    "high temperature": "temperatura alta",
    "dry air": "aire seco",
    "very humid air": "aire muy húmedo",
    "low light": "poca luz",
    "excess light": "exceso de luz",
    "low pH": "pH bajo",
    "high pH": "pH alto",
    "low nutrients": "nutrientes bajos",
    "excess nutrients": "nutrientes en exceso",
    "dry substrate": "sustrato seco",
    "waterlogged substrate": "sustrato encharcado",

    // Etiquetas de predicción y modelos
    "Ventilation need": "Necesidad de ventilación",
    "pH correction need": "Necesidad de corrección de pH",
    "Anomalous reading": "Lectura atípica",
    "Logistic regression": "Regresión logística",
    "Neural network (MLP)": "Red neuronal (MLP)",
    "Isolation Forest": "Bosque de aislamiento",
    "Will the substrate dry out in the next hour?": "¿Se secará el sustrato en la próxima hora?",
    "Will the temperature exceed the maximum in the next hour?": "¿Superará la temperatura el máximo en la próxima hora?",
    "Substrate moisture in one hour": "Humedad del sustrato dentro de una hora",
    "Macro F1": "F1 macro",
    "Mean absolute error (%)": "Error absoluto medio (%)",
    "Baseline": "Línea base",
    "K-nearest neighbors": "Vecinos más cercanos (KNN)",
    "Decision tree": "Árbol de decisión",
    "Random forest": "Bosque aleatorio",
    "Gradient boosting": "Potenciación del gradiente",
    "Ridge regression": "Regresión Ridge",

    // Razones del agente
    "The substrate is dry: automatic irrigation.": "El sustrato está seco: riego automático.",
    "Preventive irrigation: the substrate will reach the minimum in less than 1 h.": "Riego preventivo: el sustrato llegará al mínimo en menos de 1 h.",
    "Preventive irrigation: learned models for this species anticipate the substrate will dry out within the next hour.": "Riego preventivo: los modelos aprendidos para esta especie anticipan que el sustrato se secará en la próxima hora.",
    "It is nighttime: turning off the UV light to respect the plant's rest period.": "Es de noche: apago la luz UV para respetar el descanso de la planta.",
    "Insufficient light: turning on the UV light for 15 minutes.": "Luz insuficiente: enciendo la luz UV durante 15 minutos.",
    "Excess light: turning off the UV light.": "Exceso de luz: apago la luz UV.",
    "High heat or humidity: ventilating for 10 minutes.": "Calor o humedad altos: ventilo durante 10 minutos.",
    "Preventive ventilation: temperature will exceed the maximum in less than 1 h.": "Ventilación preventiva: la temperatura superará el máximo en menos de 1 h.",
    "Preventive ventilation: learned models for this species anticipate heat within the next hour.": "Ventilación preventiva: los modelos aprendidos para esta especie anticipan calor en la próxima hora.",
    "Low temperature: turning off ventilation.": "Temperatura baja: apago la ventilación.",
    "Dry air: running the humidifier for 5 minutes.": "Aire seco: enciendo el humidificador durante 5 minutos.",
    "High pH: short dose of pH Down solution.": "pH alto: dosis corta de solución pH Down.",
    "Low nutrients: short dose of nutrient solution.": "Nutrientes bajos: dosis corta de solución nutritiva.",

    // Aprendizaje y Trainer
    "All variables remain within their ideal range.": "Todas las variables se mantienen dentro de su rango ideal.",
    "Ideal conditions in the morning": "Condiciones ideales por la mañana",
    "Ideal conditions in the afternoon": "Condiciones ideales por la tarde",
    "Ideal conditions at night": "Condiciones ideales por la noche",
    "No model beat the baseline on the most recent readings; continuing to learn.": "Ningún modelo superó la línea base en las lecturas más recientes; sigo aprendiendo.",

    // Notificaciones
    "Welcome to SmartPot!": "¡Bienvenido a SmartPot!",
    "Create your first crop, real or virtual, to start monitoring it.": "Crea tu primer cultivo, real o virtual, para empezar a monitorearlo.",
    "Password updated": "Contraseña actualizada",
    "Your password was updated using the recovery link.": "Tu contraseña se actualizó con el enlace de recuperación.",
    "SmartPot test notification": "Notificación de prueba de SmartPot",
    "This is how crop alerts will reach you. You can configure alert preferences in your profile.": "Así te llegarán los avisos de tus cultivos. Puedes configurar las preferencias de alertas en tu perfil.",
    "Receive alerts, digests, and assistant actions in a chat with the SmartPot bot.": "Recibe alertas, resúmenes y acciones del asistente en un chat con el bot de SmartPot.",
    "Crop disconnected": "Cultivo desconectado",
    "Health: not evaluated yet": "Salud: aún sin evaluar",
    "Connection: online": "Conexión: en línea",
    "Connection: offline": "Conexión: desconectada",
    "Latest reading: no data": "Última lectura: sin datos",

    // Clima
    Clear: "Despejado",
    "Mostly clear": "Mayormente despejado",
    "Partly cloudy": "Parcialmente nublado",
    Cloudy: "Nublado",
    Fog: "Niebla",
    Drizzle: "Llovizna",
    Rain: "Lluvia",
    Snow: "Nieve",
    Storm: "Tormenta",
};

function group(match: RegExpExecArray, index: number): string {
    return match[index] ?? "";
}

function capitalize(text: string): string {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function species(text: string): string {
    return SPECIES[text.trim().toLowerCase()] ?? text;
}

function healthLabel(text: string): string {
    return HEALTH_LABELS[text.trim()] ?? text;
}

function rangeArticle(label: string): string | undefined {
    return RANGE_ARTICLES[label.trim()];
}

function rangeNoun(label: string): string | undefined {
    return RANGE_NOUNS[label.trim().toLowerCase()];
}

function fleetPhrase(text: string): string | undefined {
    return FLEET_PHRASES[text.trim().toLowerCase()];
}

function modelName(text: string): string {
    const trimmed = text.trim();
    const direct = MODEL_NAMES[trimmed];
    if (direct) return direct;
    if (trimmed.endsWith(" + LoRA")) {
        const base = trimmed.slice(0, -" + LoRA".length);
        return `${MODEL_NAMES[base] ?? base} + LoRA`;
    }
    return text;
}

function weatherLabel(text: string): string | undefined {
    const key = Object.keys(WEATHER_LABELS).find((item) => item.toLowerCase() === text.trim().toLowerCase());
    return key ? WEATHER_LABELS[key] : undefined;
}

function hoursText(value: string): string {
    if (value.startsWith("about ")) {
        const rest = value.slice("about ".length);
        return rest.endsWith("minutes") ? `unos ${rest}` : `unas ${rest}`;
    }
    if (value === "around 1 h") return "alrededor de 1 h";
    return value;
}

function translateTraitList(text: string): string {
    return text
        .split(",")
        .map((item) => fleetPhrase(item) ?? item.trim().toLowerCase())
        .join(", ");
}

function translateStateBase(text: string): string | undefined {
    const exact = EXACT_TRANSLATIONS[text.trim()];
    if (exact) return exact;
    const parts = text.split(" and ");
    if (parts.length === 2) {
        const left = fleetPhrase(parts[0] ?? "");
        const right = fleetPhrase(parts[1] ?? "");
        if (left && right) return `${capitalize(left)} y ${right}`;
    }
    const single = fleetPhrase(text);
    return single ? capitalize(single) : undefined;
}

type Rule = (input: string) => string | null;

const DYNAMIC_RULES: Rule[] = [
    // Reglas del sistema experto con valores
    (input) => {
        const m = /^Logistic regression estimates a (.+) ventilation need based on temperature and humidity\.$/.exec(input);
        return m ? `La regresión logística estima una necesidad de ventilación del ${group(m, 1)} según la temperatura y la humedad.` : null;
    },
    (input) => {
        const m = /^(\d+) variables are at a critical level: the crop requires immediate attention\.$/.exec(input);
        return m ? `${group(m, 1)} variables están en nivel crítico: el cultivo requiere atención inmediata.` : null;
    },
    (input) => {
        const m = /^The substrate is drying quickly: it will reach the minimum in (.+) h if the trend continues\. Watering soon is advised\.$/.exec(input);
        return m ? `El sustrato se está secando rápido: llegará al mínimo en ${group(m, 1)} h si sigue la tendencia. Se recomienda regar pronto.` : null;
    },
    (input) => {
        const m = /^Temperature is rising and will exceed the maximum in (.+) h: ventilate or move the crop out of direct sun beforehand\.$/.exec(input);
        return m ? `La temperatura está subiendo y superará el máximo en ${group(m, 1)} h: ventila o mueve el cultivo fuera del sol directo antes de que ocurra.` : null;
    },
    (input) => {
        const m = /^Models learned from this species estimate a (.+) probability that substrate moisture will drop below the minimum within the next hour\.$/.exec(input);
        return m ? `Los modelos aprendidos de esta especie estiman una probabilidad del ${group(m, 1)} de que la humedad del sustrato caiga por debajo del mínimo en la próxima hora.` : null;
    },
    (input) => {
        const m = /^Models learned from this species estimate a (.+) probability that temperature will exceed the maximum within the next hour\.$/.exec(input);
        return m ? `Los modelos aprendidos de esta especie estiman una probabilidad del ${group(m, 1)} de que la temperatura supere el máximo en la próxima hora.` : null;
    },
    (input) => {
        const m = /^It is raining where the crop is located \((.+) mm\): the rain waters it for you\. If the substrate gets waterlogged, cover it or check drainage\.$/.exec(input);
        return m ? `Está lloviendo donde está el cultivo (${group(m, 1)} mm): la lluvia lo riega por ti. Si el sustrato se encharca, cúbrelo o revisa el drenaje.` : null;
    },
    (input) => {
        const m = /^The sensor reads (.+) °C while outdoors it is (.+) °C\. (.+)$/.exec(input);
        if (!m) return null;
        const advice = translateText(group(m, 3), 1);
        return `El sensor marca ${group(m, 1)} °C mientras que afuera hay ${group(m, 2)} °C. ${advice}`;
    },

    // Diagnóstico por variable
    (input) => {
        const m = /^It is nighttime: the plant is resting and low light \((.+)\) is normal between 22:00 and 6:00\.$/.exec(input);
        return m ? `Es de noche: la planta está descansando y una luz baja (${group(m, 1)}) es normal entre las 22:00 y las 6:00.` : null;
    },
    (input) => {
        const m = /^(.+?) is within the optimal range \((.+?)–(.+?) (.+?)\)\.$/.exec(input);
        if (!m) return null;
        const label = rangeArticle(group(m, 1));
        if (!label) return null;
        return `${label} está dentro del rango óptimo (${group(m, 2)}–${group(m, 3)} ${group(m, 4)}).`;
    },
    (input) => {
        const m = /^(.+?) is (below|above) the optimal range \((.+?)–(.+?) (.+?)\)\.$/.exec(input);
        if (!m) return null;
        const label = rangeArticle(group(m, 1));
        if (!label) return null;
        const direction = group(m, 2) === "below" ? "por debajo" : "por encima";
        return `${label} está ${direction} del rango óptimo (${group(m, 3)}–${group(m, 4)} ${group(m, 5)}).`;
    },
    (input) => {
        const m = /^Nutrient level \(TDS\) \((.+?) (.+?)\) is (below|above) the optimal range \((.+?)–(.+?) (.+?)\)\.$/.exec(input);
        if (!m) return null;
        const direction = group(m, 3) === "below" ? "por debajo" : "por encima";
        return `El nivel de nutrientes (TDS) (${group(m, 1)} ${group(m, 2)}) está ${direction} del rango óptimo (${group(m, 4)}–${group(m, 5)} ${group(m, 6)}).`;
    },
    (input) => {
        const m = /^(.+?) \((.+?) (.+?)\) is (below|above) the optimal range \((.+?)–(.+?) (.+?)\)\.$/.exec(input);
        if (!m) return null;
        const label = rangeArticle(group(m, 1));
        if (!label) return null;
        const direction = group(m, 4) === "below" ? "por debajo" : "por encima";
        return `${label} (${group(m, 2)} ${group(m, 3)}) está ${direction} del rango óptimo (${group(m, 5)}–${group(m, 6)} ${group(m, 7)}).`;
    },

    // Pronóstico
    (input) => {
        const m = /^(.+?) remains stable\.$/.exec(input);
        if (!m) return null;
        const label = rangeArticle(group(m, 1));
        return label ? `${label} se mantiene estable.` : null;
    },
    (input) => {
        const m = /^(.+?) (is rising|is falling) (.+?) per hour: it will reach the (maximum|minimum) \((.+?) (.+?)\) in (about \d+ minutes|about \d+ h|around 1 h)\.$/.exec(input);
        if (!m) return null;
        const label = rangeArticle(group(m, 1));
        if (!label) return null;
        const verb = group(m, 2) === "is rising" ? "está subiendo" : "está bajando";
        const bound = group(m, 4) === "maximum" ? "máximo" : "mínimo";
        return `${label} ${verb} ${group(m, 3)} por hora: alcanzará el ${bound} (${group(m, 5)} ${group(m, 6)}) en ${hoursText(group(m, 7))}.`;
    },
    (input) => {
        const m = /^(.+?) (is rising|is falling) (.+?) per hour\.$/.exec(input);
        if (!m) return null;
        const label = rangeArticle(group(m, 1));
        if (!label) return null;
        const verb = group(m, 2) === "is rising" ? "está subiendo" : "está bajando";
        return `${label} ${verb} ${group(m, 3)} por hora.`;
    },

    // Consejo de ubicación
    (input) => {
        const m = /^Where is your (.+)\?$/.exec(input);
        return m ? `¿Dónde está tu ${species(group(m, 1))}?` : null;
    },
    (input) => {
        const m = /^(.+) Set whether it is indoors or outdoors and how much sun it receives in Settings, and the assistant will tell you if the spot suits it\.$/.exec(input);
        if (!m) return null;
        const note = translateText(group(m, 1), 1);
        return `${note} Indica en Ajustes si está bajo techo o al aire libre y cuánto sol recibe, y el asistente te dirá si el lugar le conviene.`;
    },
    (input) => {
        const m = /^(.+) It is (outdoors in full sun|outdoors in partial shade|outdoors in shade|indoors next to a sunny window|indoors with indirect light|indoors without natural light), just what it needs\.$/.exec(input);
        if (!m) return null;
        return `${translateText(group(m, 1), 1)} Está ${translateText(group(m, 2), 1)}, justo lo que necesita.`;
    },
    (input) => {
        const m = /^It is (outdoors in full sun|outdoors in partial shade|outdoors in shade|indoors next to a sunny window|indoors with indirect light|indoors without natural light) and light is low: (.+?)\.( It is sunny outside right now\.)? UV light helps, but it does not replace sunlight\. (.+)$/.exec(input);
        if (!m) return null;
        const extra = m[3] ? ` ${translateText(group(m, 3).trim(), 1)}` : "";
        return `Está ${translateText(group(m, 1), 1)} y la luz es baja: ${translateText(group(m, 2), 1)}.${extra} La luz UV ayuda, pero no reemplaza la luz del sol. ${translateText(group(m, 4), 1)}`;
    },
    (input) => {
        const m = /^It is (outdoors in full sun|outdoors in partial shade|outdoors in shade|indoors next to a sunny window|indoors with indirect light|indoors without natural light)\. (.+?) It is fine today; if you see leggy stems and few flowers, (.+?)\.$/.exec(input);
        if (!m) return null;
        return `Está ${translateText(group(m, 1), 1)}. ${translateText(group(m, 2), 1)} Hoy está bien; si ves tallos larguiruchos y pocas flores, ${translateText(group(m, 3), 1)}.`;
    },
    (input) => {
        const m = /^It is (outdoors in full sun|outdoors in partial shade|outdoors in shade|indoors next to a sunny window|indoors with indirect light|indoors without natural light) and heat or excess light is already noticeable: move it (.+?) or cover it with shade cloth during peak sun hours\. (.+)$/.exec(input);
        if (!m) return null;
        return `Está ${translateText(group(m, 1), 1)} y ya se nota el calor o el exceso de luz: muévelo ${translateText(group(m, 2), 1)} o cúbrelo con malla de sombra en las horas de más sol. ${translateText(group(m, 3), 1)}`;
    },
    (input) => {
        const m = /^It is (outdoors in full sun|outdoors in partial shade|outdoors in shade|indoors next to a sunny window|indoors with indirect light|indoors without natural light)\. (.+?) It is fine today; if you see scorched leaves or bolting, move it (.+?)\.$/.exec(input);
        if (!m) return null;
        return `Está ${translateText(group(m, 1), 1)}. ${translateText(group(m, 2), 1)} Hoy está bien; si ves hojas quemadas o que se espiga, muévelo ${translateText(group(m, 3), 1)}.`;
    },

    // Resumen de flota
    (input) => {
        const m = /^Your (\d+) crops with readings average (.+)\/100 health\.$/.exec(input);
        return m ? `Tus ${group(m, 1)} cultivos con lecturas promedian ${group(m, 2)}/100 de salud.` : null;
    },
    (input) => {
        const m = /^The one needing the most attention is "(.+)" \((.+)\/100\)\.$/.exec(input);
        return m ? `El que más atención necesita es "${group(m, 1)}" (${group(m, 2)}/100).` : null;
    },
    (input) => {
        const m = /^There (?:is|are) (\d+) shared environmental issues?\.$/.exec(input);
        if (!m) return null;
        const count = Number(group(m, 1));
        return count === 1
            ? "Hay 1 problema ambiental compartido."
            : `Hay ${group(m, 1)} problemas ambientales compartidos.`;
    },
    (input) => {
        const m = /^The assistant suggests (\d+) bulk actions?\.$/.exec(input);
        if (!m) return null;
        return Number(group(m, 1)) === 1
            ? "El asistente sugiere 1 acción en bloque."
            : `El asistente sugiere ${group(m, 1)} acciones en bloque.`;
    },
    (input) => {
        const m = /^(.+?) in (\d+) of (\d+) crops: likely an environmental issue rather than an individual crop\.$/.exec(input);
        if (!m) return null;
        const phrase = fleetPhrase(group(m, 1));
        if (!phrase) return null;
        return `${capitalize(phrase)} en ${group(m, 2)} de ${group(m, 3)} cultivos: probablemente sea un problema del entorno y no de un cultivo en particular.`;
    },
    (input) => {
        const m = /^On average: (.+)\.$/.exec(input);
        return m ? `En promedio: ${translateTraitList(group(m, 1))}.` : null;
    },
    (input) => {
        if (!input.includes(" and ")) return null;
        const parts = input.split(" and ");
        if (parts.length !== 2) return null;
        const left = fleetPhrase(parts[0] ?? "");
        const right = fleetPhrase(parts[1] ?? "");
        return left && right ? `${capitalize(left)} y ${right}` : null;
    },

    // Resumen de insights
    (input) => {
        const m = /^Your (.+?) is in "(.+?)" condition \((\d+)\/100\)\.$/.exec(input);
        if (!m) return null;
        return `Tu ${species(group(m, 1))} está en condición "${healthLabel(group(m, 2))}" (${group(m, 3)}/100).`;
    },
    (input) => {
        const m = /^Check (.+)\.$/.exec(input);
        if (!m) return null;
        const names = group(m, 1).split(" and ");
        const translated = names.map((name) => rangeNoun(name));
        if (translated.some((name) => !name)) return null;
        return `Revisa ${translated.join(" y ")}.`;
    },
    (input) => {
        const m = /^The assistant suggests (\d+) actions?\.$/.exec(input);
        if (!m) return null;
        return Number(group(m, 1)) === 1
            ? "El asistente sugiere 1 acción."
            : `El asistente sugiere ${group(m, 1)} acciones.`;
    },

    // Aprendizaje
    (input) => {
        const m = /^Still learning from (.+) crops: (\d+) real readings collected, and the first training starts at (\d+)\.$/.exec(input);
        return m ? `Todavía aprendo de cultivos de ${species(group(m, 1))}: ${group(m, 2)} lecturas reales recolectadas y el primer entrenamiento empieza a las ${group(m, 3)} lecturas.` : null;
    },
    (input) => {
        const m = /^Learned from ([\d.,]+) real (.+) readings: (\d+) of 3 supervised models trained\.$/.exec(input);
        return m ? `Aprendí de ${group(m, 1)} lecturas reales de ${species(group(m, 2))}: ${group(m, 3)} de 3 modelos supervisados entrenados.` : null;
    },
    (input) => {
        const m = /^Insufficient readings with a one-hour future window: (\d+) of (\d+)\.$/.exec(input);
        return m ? `Lecturas insuficientes con una ventana de una hora hacia adelante: ${group(m, 1)} de ${group(m, 2)}.` : null;
    },
    (input) => {
        const m = /^Insufficient readings with a one-hour follow-up value: (\d+) of (\d+)\.$/.exec(input);
        return m ? `Lecturas insuficientes con un valor de seguimiento a una hora: ${group(m, 1)} de ${group(m, 2)}.` : null;
    },
    (input) => {
        const m = /^Not enough (positive|negative) cases yet \((\d+) of (\d+)\): the model learns as the situation occurs\.$/.exec(input);
        if (!m) return null;
        const kind = group(m, 1) === "positive" ? "positivos" : "negativos";
        return `Aún no hay suficientes casos ${kind} (${group(m, 2)} de ${group(m, 3)}): el modelo aprende a medida que ocurre la situación.`;
    },
    (input) => {
        const m = /^The active model remains better on recent readings \((.+?) vs (.+?)\)\.$/.exec(input);
        return m ? `El modelo activo sigue siendo mejor en las lecturas recientes (${group(m, 1)} vs ${group(m, 2)}).` : null;
    },
    (input) => {
        const m = /^Furthest from ideal: (.+)\.$/.exec(input);
        return m ? `Lo más lejos de lo ideal: ${translateTraitList(group(m, 1))}.` : null;
    },
    (input) => {
        const m = /^(.+) (in the morning|in the afternoon|at night)$/.exec(input);
        if (!m) return null;
        const base = translateStateBase(group(m, 1));
        if (!base) return null;
        const when = group(m, 2) === "in the morning" ? "por la mañana"
            : group(m, 2) === "in the afternoon" ? "por la tarde" : "por la noche";
        return `${base} ${when}`;
    },
    (input) => {
        const base = translateStateBase(input);
        return base ?? null;
    },
    (input) => {
        const value = modelName(input);
        return value !== input ? value : null;
    },

    // Modelos con adaptador LoRA
    (input) => {
        const m = /^(.+) \+ LoRA$/.exec(input);
        if (!m) return null;
        const base = MODEL_NAMES[group(m, 1)];
        return base ? `${base} + LoRA` : null;
    },

    // Notificaciones y comandos
    (input) => {
        const m = /^Attention needed on (.+)$/.exec(input);
        return m ? `Se necesita atención en ${group(m, 1)}` : null;
    },
    (input) => {
        const m = /^The assistant acted on (.+)$/.exec(input);
        return m ? `El asistente actuó en ${group(m, 1)}` : null;
    },
    (input) => {
        const m = /^Unexecuted command on (.+)$/.exec(input);
        return m ? `Comando no ejecutado en ${group(m, 1)}` : null;
    },
    (input) => {
        const m = /^The device could not execute the command: (.+)$/.exec(input);
        return m ? `El dispositivo no pudo ejecutar el comando: ${translateText(group(m, 1), 1)}` : null;
    },
    (input) => {
        const m = /^Digest for «(.+)»$/.exec(input);
        return m ? `Resumen de «${group(m, 1)}»` : null;
    },
    (input) => {
        const m = /^Daily summary for «(.+)»$/.exec(input);
        return m ? `Resumen diario de «${group(m, 1)}»` : null;
    },
    (input) => {
        const m = /^(\d+) avisos? en the last (\d+) hours?:$/.exec(input);
        return m ? `${group(m, 1)} avisos en las últimas ${group(m, 2)} horas:` : null;
    },
    (input) => {
        const m = /^… and (\d+) more in the app\.$/.exec(input);
        return m ? `… y ${group(m, 1)} más en la app.` : null;
    },
    (input) => {
        const m = /^• (.+?) Connection: (.+)$/.exec(input);
        return m ? `• ${group(m, 1)} Conexión: ${translateText(group(m, 2), 1)}` : null;
    },
    (input) => {
        const m = /^Health: (.+?) \((\d+)\/100\)$/.exec(input);
        return m ? `Salud: ${healthLabel(group(m, 1))} (${group(m, 2)}/100)` : null;
    },
    (input) => {
        const m = /^Last 24 h: (\d+) alerts? and (\d+) commands?$/.exec(input);
        return m ? `Últimas 24 h: ${group(m, 1)} alertas y ${group(m, 2)} comandos` : null;
    },
    (input) => {
        const m = /^Latest reading: (.+)$/.exec(input);
        return m ? `Última lectura: ${translateText(group(m, 1), 1)}` : null;
    },
    (input) => {
        const m = /^«(.+)» lost connection with SmartPot\.$/.exec(input);
        return m ? `«${group(m, 1)}» perdió la conexión con SmartPot.` : null;
    },
    (input) => {
        const m = /^(.+) active for (\d+) s$/.exec(input);
        return m ? `${translateText(group(m, 1), 1)} encendido por ${group(m, 2)} s` : null;
    },

    // Errores dinámicos de la API
    (input) => {
        const m = /^Too many requests\. Please try again in (\d+) seconds?$/.exec(input);
        return m ? `Demasiadas solicitudes. Por favor intenta de nuevo en ${group(m, 1)} segundos.` : null;
    },
    (input) => {
        const m = /^Unknown crop type: (.+)$/.exec(input);
        return m ? `Tipo de cultivo desconocido: ${group(m, 1)}` : null;
    },
    (input) => {
        const m = /^Must be less than or equal to (-?\d+)$/.exec(input);
        return m ? `Debe ser menor o igual a ${group(m, 1)}` : null;
    },
    (input) => {
        const m = /^Must be greater than or equal to (-?\d+)$/.exec(input);
        return m ? `Debe ser mayor o igual a ${group(m, 1)}` : null;
    },
    (input) => {
        const m = /^Must be one of: (.+)$/.exec(input);
        return m ? `Debe ser uno de: ${group(m, 1)}` : null;
    },
    (input) => {
        const m = /^Must be at (least|most) (\d+) characters?$/.exec(input);
        if (!m) return null;
        return `Debe tener como ${group(m, 1) === "least" ? "mínimo" : "máximo"} ${group(m, 2)} ${group(m, 2) === "1" ? "carácter" : "caracteres"}`;
    },
    (input) => {
        const m = /^Must have at (least|most) (\d+) items?\(?s?\)?$/.exec(input);
        if (!m) return null;
        return `Debe tener como ${group(m, 1) === "least" ? "mínimo" : "máximo"} ${group(m, 2)} ${group(m, 2) === "1" ? "elemento" : "elementos"}`;
    },
    (input) => {
        const m = /^You reached the maximum of (\d+) crops per account$/.exec(input);
        return m ? `Llegaste al máximo de ${group(m, 1)} cultivos por cuenta` : null;
    },
    (input) => {
        const m = /^Value for (.+) \((.+)\) is out of range \((.+) to (.+)\)$/.exec(input);
        return m ? `El valor de ${translateParameter(group(m, 1))} (${group(m, 2)}) está fuera de rango (${group(m, 3)} a ${group(m, 4)})` : null;
    },
    (input) => {
        const m = /^Channel (.+) is not configured on this server$/.exec(input);
        return m ? `El canal ${group(m, 1)} no está configurado en este servidor` : null;
    },
    (input) => {
        const m = /^Could not send test message: (.+)$/.exec(input);
        return m ? `No se pudo enviar el mensaje de prueba: ${group(m, 1)}` : null;
    },
    (input) => {
        const m = /^Simulator rejected configuration: (.+)$/.exec(input);
        return m ? `El simulador rechazó la configuración: ${group(m, 1)}` : null;
    },
    (input) => {
        const m = /^Telegram rejected the message \((\d+)\)$/.exec(input);
        return m ? `Telegram rechazó el mensaje (${group(m, 1)})` : null;
    },
];

function translateParameter(text: string): string {
    const labels: Record<string, string> = {
        temperature: "temperatura",
        humidity: "humedad",
        brightness: "luz",
        ph: "pH",
        tds: "TDS",
        atmosphere: "presión atmosférica",
        soilMoisture: "humedad del sustrato",
        "soil moisture": "humedad del sustrato",
    };
    return labels[text] ?? labels[text.toLowerCase()] ?? text;
}

function translateSentences(input: string, depth: number): string | null {
    const parts = input.split(/(?<=[.!?])\s+/);
    if (parts.length < 2) return null;
    let changed = false;
    const translated = parts.map((part) => {
        const value = translateText(part, depth + 1);
        if (value !== part) changed = true;
        return value;
    });
    return changed ? translated.join(" ") : null;
}

function translateText(input: string, depth: number): string {
    if (!input || depth > 4) return input;
    const exact = EXACT_TRANSLATIONS[input];
    if (exact) return exact;
    const weather = weatherLabel(input);
    if (weather) return weather;
    const crop = SPECIES[input.trim().toLowerCase()];
    if (crop) return capitalize(crop);
    for (const rule of DYNAMIC_RULES) {
        const value = rule(input);
        if (value !== null) return value;
    }
    const composed = translateSentences(input, depth);
    return composed ?? input;
}

/**
 * Traduce un texto proveniente del servidor al español si el locale activo es "es".
 * Si el locale es "en" o el texto no tiene traducción conocida, se retorna el texto original.
 */
export function translateServerText(text: string | null | undefined): string {
    if (!text) return "";
    if (locale() === "en") return text;

    const trimmed = text.trim();
    const translated = translateText(trimmed, 0);
    return translated === trimmed ? text : translated;
}

/** Alias corto para uso en plantillas JSX */
export const st = translateServerText;
