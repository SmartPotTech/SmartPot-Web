import {
  ArrowRight, Bot, BrainCircuit, Download, FileDown, Gauge, Radio, ShieldCheck, Smartphone, Sprout, Wifi,
} from "lucide-react";
import { Link } from "react-router";
import { LogoMark } from "../../components/brand/Logo";
import { usePageMeta } from "../../hooks/usePageMeta";
import { CROP_TYPES } from "../../lib/catalog";
import { useInstallPrompt } from "../pwa/pwa";
import { FAQ } from "./faq";

const FEATURES = [
  { icon: Radio, title: "Monitoreo en tiempo real",
    text: "Temperatura, humedad del aire y del sustrato, luz, pH y nutrientes llegan desde tu maceta cada 30 segundos por MQTT." },
  { icon: BrainCircuit, title: "Asistente de inteligencia artificial",
    text: "Un sistema experto, lógica difusa y modelos de aprendizaje automático diagnostican tu cultivo y te dicen qué hacer." },
  { icon: Bot, title: "Automatización con un agente",
    text: "Activa el modo automático y el agente riega, ventila o enciende la luz de cultivo cuando hace falta." },
  { icon: Gauge, title: "Índice de salud",
    text: "Un puntaje de 0 a 100 resume el estado de cada planta para que sepas de un vistazo cuál necesita atención." },
  { icon: FileDown, title: "Historial y exportación",
    text: "Gráficas con el rango ideal de cada especie y descarga de tus lecturas en CSV para analizarlas." },
  { icon: ShieldCheck, title: "Seguro por diseño",
    text: "Conexión cifrada con TLS, una clave distinta por maceta y aislamiento: nadie puede leer ni controlar tus cultivos." },
];

const STEPS = [
  { title: "Crea tu cultivo", text: "Elige la especie y SmartPot carga sus rangos ideales de temperatura, pH, nutrientes y luz." },
  { title: "Conecta tu maceta", text: "Configura el ESP32 (o la simulación en Wokwi) con el id del cultivo y su clave de dispositivo." },
  { title: "Cuida con datos", text: "Sigue las lecturas, recibe alertas y deja que el asistente te recomiende o actúe por ti." },
];

export function LandingPage() {
  usePageMeta("", {
    index: true,
    description: "SmartPot monitorea tus cultivos hidropónicos en tiempo real y un asistente de IA te dice qué necesitan o actúa por ti. Gratis, instalable y de código abierto.",
  });
  const { available, install, iosHint } = useInstallPrompt();

  return (
    <>
      <section className="relative overflow-hidden bg-leaf-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(0,176,116,0.35),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold
              text-leaf-300">
              <Sprout size={14} /> Hidroponía + IoT + inteligencia artificial
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
              Tu huerto hidropónico, <span className="text-leaf-500">en tu bolsillo</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-leaf-100/85">
              SmartPot monitorea tus cultivos en tiempo real y un asistente de IA te dice qué necesitan cada planta,
              o actúa por ti cuando activas el modo automático.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-leaf-500 px-6 font-semibold
                text-leaf-950 hover:bg-leaf-300">
                Crear cuenta gratis <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="inline-flex h-12 items-center rounded-xl border border-white/25 px-6 font-semibold
                hover:bg-white/10">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <LogoMark size={44} />
                <div>
                  <p className="font-display text-lg font-semibold">Lechugas del balcón</p>
                  <p className="text-sm text-leaf-300">En línea · hace 12 s</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {[["Temperatura", "19,4 °C"], ["Sustrato", "68 %"], ["pH", "6,05"], ["Nutrientes", "712 ppm"]].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-white/5 p-3">
                    <p className="text-leaf-300/80">{k}</p>
                    <p className="mt-1 text-lg font-semibold">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-leaf-500/15 p-3 text-sm">
                <p className="font-semibold text-leaf-300">Salud 92/100 · Excelente</p>
                <p className="mt-1 text-leaf-100/80">Todas las variables están en su rango ideal.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="funciones" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
        <h2 className="text-3xl font-bold md:text-4xl">Todo lo que tu cultivo necesita</h2>
        <p className="mt-3 max-w-2xl text-muted">Pensado para estudiantes, huertas caseras y proyectos comunitarios de hidroponía.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700"><Icon size={22} /></div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <h2 className="text-3xl font-bold md:text-4xl">Cómo funciona</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="card p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-700 font-display font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="ia" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Inteligencia artificial que se explica</h2>
            <p className="mt-4 text-muted">
              El asistente de SmartPot combina cuatro técnicas y siempre te muestra por qué recomienda algo.
            </p>
          </div>
          <dl className="grid gap-4">
            {[
              ["Sistema experto", "Reglas de agronomía encadenadas: detecta estrés térmico, riesgo de hongos o bloqueo de nutrientes."],
              ["Lógica difusa", "Convierte lecturas imprecisas en un índice de salud de 0 a 100."],
              ["Aprendizaje automático", "Una regresión logística, una red neuronal y un Isolation Forest predicen ventilación, corrección de pH y lecturas atípicas."],
              ["Agente reactivo", "Traduce el diagnóstico en acciones sobre la bomba, la luz o el ventilador cuando tú lo permites."],
            ].map(([term, detail]) => (
              <div key={term} className="card p-5">
                <dt className="font-semibold text-leaf-800">{term}</dt>
                <dd className="mt-1 text-sm text-muted">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold">Seis especies listas para cultivar</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(CROP_TYPES).map(([type, crop]) => (
              <li key={type} className="card flex items-start gap-3 p-5">
                <Sprout className="mt-0.5 shrink-0 text-leaf-600" size={20} />
                <div>
                  <p className="font-semibold">{crop.label}</p>
                  <p className="text-sm text-muted">{crop.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-water-100 text-water-700">
              <Smartphone size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Instálala como una app</h2>
              <p className="mt-1 text-muted">
                SmartPot es una aplicación web progresiva: funciona en el navegador y se instala en Android, iOS o
                escritorio sin pasar por una tienda.
              </p>
              {iosHint && (
                <p className="mt-2 text-sm text-leaf-800">En iPhone: toca «Compartir» y luego «Agregar a inicio».</p>
              )}
            </div>
          </div>
          {available ? (
            <button type="button" onClick={() => void install()} className="inline-flex h-11 items-center gap-2 rounded-xl
              bg-leaf-700 px-5 font-semibold text-white hover:bg-leaf-800">
              <Download size={18} /> Instalar SmartPot
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-leaf-800">
              <Wifi size={18} /> Funciona también sin conexión
            </span>
          )}
        </div>
      </section>

      <section id="preguntas" className="scroll-mt-20 bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
          <h2 className="text-3xl font-bold md:text-4xl">Preguntas frecuentes</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map(({ question, answer }) => (
              <details key={question} className="card group p-5">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {question}
                    <ArrowRight size={18} className="shrink-0 text-leaf-600 transition-transform group-open:rotate-90" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-leaf-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center">
          <h2 className="text-3xl font-bold">Empieza hoy, es gratis</h2>
          <p className="mt-3 max-w-xl text-leaf-100/80">Crea tu cuenta, agrega tu primer cultivo y conecta tu maceta en minutos.</p>
          <Link to="/register" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-leaf-500 px-6 font-semibold
            text-leaf-950 hover:bg-leaf-300">
            Crear cuenta gratis <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
