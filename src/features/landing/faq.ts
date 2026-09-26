// Las mismas preguntas se publican como datos estructurados (FAQPage) en index.html.
export const FAQ = [
  {
    question: "¿Qué es SmartPot?",
    answer: "Es una plataforma abierta para monitorear y automatizar cultivos hidropónicos. Una maceta con ESP32 envía sus lecturas por MQTT y la aplicación las muestra, las analiza con inteligencia artificial y puede controlar la bomba, la luz y el ventilador.",
  },
  {
    question: "¿Necesito una maceta física?",
    answer: "No. Puedes usar la simulación de Wokwi con el mismo firmware, o conectar una placa ESP32 con sensores reales. En ambos casos basta con el id del cultivo y la clave del dispositivo.",
  },
  {
    question: "¿Qué cultivos soporta?",
    answer: "Lechuga, tomate, fresa, albahaca, espinaca y pimentón, cada uno con sus rangos ideales de temperatura, humedad, luz, pH, nutrientes y humedad del sustrato.",
  },
  {
    question: "¿Cómo decide el asistente de IA?",
    answer: "Combina un sistema experto con reglas de agronomía, lógica difusa para calcular un índice de salud, modelos de aprendizaje automático y un agente reactivo. Cada recomendación muestra las reglas y la certeza que la respaldan.",
  },
  {
    question: "¿Es seguro conectar mi maceta?",
    answer: "Sí. La conexión va cifrada con TLS, cada maceta tiene su propia clave y el servidor solo le permite publicar y recibir mensajes de su propio cultivo.",
  },
  {
    question: "¿Cuánto cuesta?",
    answer: "SmartPot es gratuito y de código abierto bajo licencia MIT. Puedes usarlo en smartpot.app o desplegarlo en tu propio servidor.",
  },
];
