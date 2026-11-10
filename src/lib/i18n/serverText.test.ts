import {describe, expect, it} from "vitest";
import {setLocale} from "./index";
import {st, translateServerText} from "./serverText";

const RULE_TITLES: [string, string][] = [
    ["Heat stress", "Estrés por calor"],
    ["Fungal risk", "Riesgo de hongos"],
    ["Nutrient lockout", "Bloqueo de nutrientes"],
    ["Root rot risk", "Riesgo de pudrición radicular"],
    ["Drought", "Sequía"],
    ["Leggy growth", "Crecimiento ahilado (etiolación)"],
    ["Cold stress", "Estrés por frío"],
    ["Excess salts", "Exceso de sales"],
    ["Model recommends ventilation", "El modelo recomienda ventilar"],
    ["Possible sensor fault", "Posible falla del sensor"],
    ["Critical state", "Estado crítico"],
    ["Compound stress", "Estrés combinado"],
    ["Rapid drying", "Secado rápido"],
    ["Rising heat", "Calor en aumento"],
    ["Watering likely within the next hour", "Es probable que haya que regar en la próxima hora"],
    ["Heat likely within the next hour", "Es probable que haga calor en la próxima hora"],
    ["Unusual combination", "Combinación poco habitual"],
    ["It is raining", "Está lloviendo"],
    ["Sensor disagrees with outdoor weather", "El sensor no coincide con el clima de afuera"],
    ["Night rest", "Descanso nocturno"],
    ["Ideal conditions", "Condiciones ideales"],
];

describe("serverText", () => {
    it("traduce errores al español cuando el locale es es", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("Incorrect email or password")).toBe("Correo o contraseña incorrectos");
        expect(translateServerText("Current password is incorrect")).toBe("La contraseña actual no es correcta");
        expect(translateServerText("Please log in to continue")).toBe("Inicia sesión para continuar");
        expect(translateServerText("Water pump is already on")).toBe("La bomba de agua ya está encendida");
        expect(translateServerText("The device did not confirm the command in time")).toBe("El dispositivo no confirmó el comando a tiempo");
    });

    it("mantiene el texto original en inglés cuando el locale es en", async () => {
        await setLocale("en", {persist: false});
        expect(translateServerText("Incorrect email or password")).toBe("Incorrect email or password");
        expect(translateServerText("Water pump is already on")).toBe("Water pump is already on");
        expect(st("Crop disconnected")).toBe("Crop disconnected");
    });

    it("traduce los 21 títulos de las reglas del sistema experto", async () => {
        await setLocale("es", {persist: false});
        for (const [english, spanish] of RULE_TITLES) {
            expect(translateServerText(english), english).toBe(spanish);
        }
    });

    it("traduce las reglas dinámicas y sus mensajes", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("Logistic regression estimates a 90% ventilation need based on temperature and humidity."))
            .toBe("La regresión logística estima una necesidad de ventilación del 90% según la temperatura y la humedad.");
        expect(translateServerText("3 variables are at a critical level: the crop requires immediate attention."))
            .toBe("3 variables están en nivel crítico: el cultivo requiere atención inmediata.");
        expect(translateServerText("The substrate is drying quickly: it will reach the minimum in 1.4 h if the trend continues. Watering soon is advised."))
            .toContain("llegará al mínimo en 1.4 h");
        expect(translateServerText("Models learned from this species estimate a 74% probability that temperature will exceed the maximum within the next hour."))
            .toContain("probabilidad del 74%");
        expect(translateServerText("It is raining where the crop is located (1.2 mm): the rain waters it for you. If the substrate gets waterlogged, cover it or check drainage."))
            .toContain("Está lloviendo donde está el cultivo (1.2 mm)");
        expect(translateServerText("The sensor reads 31.0 °C while outdoors it is 24.0 °C. Check the sensor or confirm that the crop is actually outdoors."))
            .toBe("El sensor marca 31.0 °C mientras que afuera hay 24.0 °C. Revisa el sensor o confirma que el cultivo esté realmente al aire libre.");
    });

    it("traduce diagnósticos con rangos variables y recomendaciones", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("Temperature is within the optimal range (15–22 °C)."))
            .toBe("La temperatura está dentro del rango óptimo (15–22 °C).");
        expect(translateServerText("Substrate moisture is below the optimal range (60–80 %)."))
            .toBe("La humedad del sustrato está por debajo del rango óptimo (60–80 %).");
        expect(translateServerText("Temperature (30 °C) is above the optimal range (15–22 °C)."))
            .toBe("La temperatura (30 °C) está por encima del rango óptimo (15–22 °C).");
        expect(translateServerText("pH (7.2 pH) is above the optimal range (5.5–6.5 pH)."))
            .toBe("El pH (7.2 pH) está por encima del rango óptimo (5.5–6.5 pH).");
        expect(translateServerText("Nutrient level (TDS) (369.3 ppm) is below the optimal range (700–1120 ppm)."))
            .toBe("El nivel de nutrientes (TDS) (369.3 ppm) está por debajo del rango óptimo (700–1120 ppm).");
        expect(translateServerText("Substrate moisture (100 %) is above the optimal range (60–80 %)."))
            .toBe("La humedad del sustrato (100 %) está por encima del rango óptimo (60–80 %).");
        expect(translateServerText("It is nighttime: the plant is resting and low light (20 lux) is normal between 22:00 and 6:00."))
            .toContain("Es de noche: la planta está descansando");
        expect(translateServerText("Water until the substrate is moist without waterlogging it."))
            .toBe("Riega hasta que el sustrato quede húmedo sin encharcarlo.");
    });

    it("traduce pronósticos, flota, insights y ubicación", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("Substrate moisture is falling 2 % per hour: it will reach the minimum (60 %) in about 6 h."))
            .toBe("La humedad del sustrato está bajando 2 % por hora: alcanzará el mínimo (60 %) en unas 6 h.");
        expect(translateServerText("Temperature is rising 0.5 °C per hour."))
            .toBe("La temperatura está subiendo 0.5 °C por hora.");
        expect(translateServerText("Air humidity is rising 1 % per hour: it will reach the maximum (80 %) in about 4 h."))
            .toBe("La humedad del aire está subiendo 1 % por hora: alcanzará el máximo (80 %) en unas 4 h.");
        expect(translateServerText("pH is falling 0 pH per hour.")).toBe("El pH está bajando 0 pH por hora.");

        expect(translateServerText("Your 4 crops with readings average 97/100 health. The one needing the most attention is \"Balcony Lettuce\" (41/100). There is 1 shared environmental issue. The assistant suggests 2 bulk actions."))
            .toBe("Tus 4 cultivos con lecturas promedian 97/100 de salud. El que más atención necesita es \"Balcony Lettuce\" (41/100). Hay 1 problema ambiental compartido. El asistente sugiere 2 acciones en bloque.");
        expect(translateServerText("High temperature in 3 of 4 crops: likely an environmental issue rather than an individual crop."))
            .toBe("Temperatura alta en 3 de 4 cultivos: probablemente sea un problema del entorno y no de un cultivo en particular.");
        expect(translateServerText("On average: low temperature, dry air.")).toBe("En promedio: temperatura baja, aire seco.");
        expect(translateServerText("Low temperature and dry air")).toBe("Temperatura baja y aire seco");
        expect(translateServerText("Low pH and excess nutrients")).toBe("pH bajo y nutrientes en exceso");
        expect(translateServerText("Within range")).toBe("Dentro del rango");
        expect(translateServerText("Similar conditions")).toBe("Condiciones similares");

        expect(translateServerText("Your lettuce is in \"At risk\" condition (42/100). Check temperature and substrate moisture. The assistant suggests 1 action. Relocating the crop is also recommended."))
            .toBe("Tu lechuga está en condición \"En riesgo\" (42/100). Revisa temperatura y humedad del sustrato. El asistente sugiere 1 acción. También se recomienda cambiar el cultivo de lugar.");

        expect(translateServerText("Where is your tomato?")).toBe("¿Dónde está tu tomate?");
        expect(translateServerText("Good location")).toBe("Buena ubicación");
        expect(translateServerText("Lettuce prefers partial shade: under strong sun it overheats, bolts, and turns bitter. It is outdoors in partial shade, just what it needs."))
            .toBe("La lechuga prefiere la semisombra: con sol fuerte se recalienta, se espiga y amarga. Está al aire libre en semisombra, justo lo que necesita.");
        expect(translateServerText("It is outdoors in full sun and light is low: move it outdoors in partial shade. UV light helps, but it does not replace sunlight. Lettuce prefers partial shade: under strong sun it overheats, bolts, and turns bitter."))
            .toContain("Está al aire libre a pleno sol y la luz es baja");
        expect(translateServerText("It is indoors with indirect light. Tomatoes are sun-loving: they need 6 to 8 hours of direct sunlight to flower and fruit. It is fine today; if you see leggy stems and few flowers, move it outdoors to full sun or, if not possible, place it next to the sunniest window."))
            .toContain("Hoy está bien; si ves tallos larguiruchos y pocas flores");
    });

    it("traduce aprendizaje, modelos y notificaciones", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("Still learning from lettuce crops: 120 real readings collected, and the first training starts at 200."))
            .toBe("Todavía aprendo de cultivos de lechuga: 120 lecturas reales recolectadas y el primer entrenamiento empieza a las 200 lecturas.");
        expect(translateServerText("Learned from 12,345 real tomato readings: 3 of 3 supervised models trained."))
            .toBe("Aprendí de 12,345 lecturas reales de tomate: 3 de 3 modelos supervisados entrenados.");
        expect(translateServerText("Will the substrate dry out in the next hour?")).toBe("¿Se secará el sustrato en la próxima hora?");
        expect(translateServerText("Random forest")).toBe("Bosque aleatorio");
        expect(translateServerText("Neural network (MLP)")).toBe("Red neuronal (MLP)");
        expect(translateServerText("Baseline")).toBe("Línea base");
        expect(translateServerText("Macro F1")).toBe("F1 macro");
        expect(translateServerText("Not enough positive cases yet (12 of 50): the model learns as the situation occurs."))
            .toBe("Aún no hay suficientes casos positivos (12 de 50): el modelo aprende a medida que ocurre la situación.");
        expect(translateServerText("Insufficient readings with a one-hour future window: 40 of 200."))
            .toBe("Lecturas insuficientes con una ventana de una hora hacia adelante: 40 de 200.");
        expect(translateServerText("Low temperature in the morning")).toBe("Temperatura baja por la mañana");
        expect(translateServerText("Furthest from ideal: low temperature, dry air.")).toBe("Lo más lejos de lo ideal: temperatura baja, aire seco.");

        expect(translateServerText("Attention needed on Balcony Lettuce")).toBe("Se necesita atención en Balcony Lettuce");
        expect(translateServerText("The assistant acted on Balcony Lettuce")).toBe("El asistente actuó en Balcony Lettuce");
        expect(translateServerText("Unexecuted command on Balcony Lettuce")).toBe("Comando no ejecutado en Balcony Lettuce");
        expect(translateServerText("Welcome to SmartPot!")).toBe("¡Bienvenido a SmartPot!");
        expect(translateServerText("Receive alerts, digests, and assistant actions in a chat with the SmartPot bot."))
            .toBe("Recibe alertas, resúmenes y acciones del asistente en un chat con el bot de SmartPot.");
        expect(translateServerText("Attention needed on Balcony Lettuce. Temperature (30 °C) is above the optimal range (15–22 °C). Ventilate the space and avoid direct sunlight during the hottest hours."))
            .toContain("Se necesita atención en Balcony Lettuce");
    });

    it("traduce clima y especies sin depender de mayúsculas", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("cloudy")).toBe("Nublado");
        expect(translateServerText("Mostly clear")).toBe("Mayormente despejado");
        expect(translateServerText("lettuce")).toBe("Lechuga");
        expect(translateServerText("bell pepper")).toBe("Pimiento");
    });

    it("maneja patrones dinámicos correctamente en español", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("«Lettuce» lost connection with SmartPot.")).toBe("«Lettuce» perdió la conexión con SmartPot.");
        expect(translateServerText("Too many requests. Please try again in 15 seconds")).toBe("Demasiadas solicitudes. Por favor intenta de nuevo en 15 segundos.");
    });

    it("traduce el digest multilínea completo de Telegram y resúmenes diarios", async () => {
        await setLocale("es", {persist: false});

        // Digest con ventana de varias horas
        const multilineDigest = [
            "3 notices in the last 4 hours:",
            "• 10:00 Alert: Low temperature in the morning",
            "• 11:30 Assistant: Welcome to SmartPot!",
            "• 12:15 Connection: online",
            "… and 2 more in the app.",
        ].join("\n");

        const expectedDigest = [
            "3 avisos en las últimas 4 horas:",
            "• 10:00 Alerta: Temperatura baja por la mañana",
            "• 11:30 Asistente: ¡Bienvenido a SmartPot!",
            "• 12:15 Conexión: en línea",
            "… y 2 más en la app.",
        ].join("\n");

        expect(translateServerText(multilineDigest)).toBe(expectedDigest);

        // Digest con ventana de una hora
        const singleNotice = "1 notice in the last hour:\n• 09:15 Alert: Low temperature in the morning";
        expect(translateServerText(singleNotice)).toBe("1 aviso en la última hora:\n• 09:15 Alerta: Temperatura baja por la mañana");

        // Resumen diario con métricas y estado
        const summary = [
            "Health: Good (85/100)",
            "Connection: online",
            "Latest reading: 22.5 °C · humidity 65 % · soil 70 % · light 12000 lux",
            "Last 24 h: 2 alerts and 5 commands",
        ].join("\n");

        const expectedSummary = [
            "Salud: Bueno (85/100)",
            "Conexión: en línea",
            "Última lectura: 22.5 °C · humedad 65 % · sustrato 70 % · luz 12000 lux",
            "Últimas 24 h: 2 alertas y 5 comandos",
        ].join("\n");

        expect(translateServerText(summary)).toBe(expectedSummary);
    });

    it("traduce mensajes de validación de cuotas, duración e intervalos", async () => {
        await setLocale("es", {persist: false});
        expect(translateServerText("You reached the maximum of 20 crops per account"))
            .toBe("Llegaste al máximo de 20 cultivos por cuenta");
        expect(translateServerText("You can have up to 5 virtual crops"))
            .toBe("Puedes tener hasta 5 cultivos virtuales");
        expect(translateServerText("Minimum duration is 1 second"))
            .toBe("La duración mínima es de 1 segundo");
        expect(translateServerText("Maximum duration is 1 hour"))
            .toBe("La duración máxima es de 1 hora");
        expect(translateServerText("Minimum interval is 10 seconds"))
            .toBe("El intervalo mínimo es de 10 segundos");
        expect(translateServerText("Maximum interval is 300 seconds"))
            .toBe("El intervalo máximo es de 300 segundos");
    });
});
