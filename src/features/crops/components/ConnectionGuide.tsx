import { Check, Copy, Cpu, Download, ExternalLink, MonitorPlay } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Alert } from "../../../components/ui/Feedback";
import type { DeviceCredentials } from "../../../lib/api/types";
import { FIRMWARE_REPO, WOKWI_PROJECT, firmwareConfig, type FirmwareTarget } from "../firmware";
import { CredentialsView } from "./CredentialsView";

const TARGETS: { id: FirmwareTarget; label: string; hint: string; icon: typeof Cpu }[] = [
  { id: "esp32", label: "ESP32 físico", hint: "Tu placa con sus sensores y actuadores", icon: Cpu },
  { id: "wokwi", label: "Simulado en Wokwi", hint: "El mismo firmware en un ESP32 del navegador", icon: MonitorPlay },
];

/** Pines del circuito, los mismos del proyecto de Wokwi. */
const PINS = [
  ["DHT22 (temperatura y humedad)", "GPIO 15"],
  ["Luz", "GPIO 34"],
  ["pH", "GPIO 35"],
  ["TDS (nutrientes)", "GPIO 32"],
  ["Humedad del sustrato", "GPIO 33"],
  ["Bomba de agua", "GPIO 19"],
  ["Luz ultravioleta", "GPIO 18"],
  ["Ventilador", "GPIO 5"],
  ["Pantalla LCD I2C", "SCL 16 · SDA 17"],
];

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-sm font-bold text-white">
        {number}
      </span>
      <div className="min-w-0 flex-1 space-y-2 text-sm">
        <p className="font-semibold text-ink">{title}</p>
        {children}
      </div>
    </li>
  );
}

function ConfigBlock({ credentials, target }: { credentials: DeviceCredentials; target: FirmwareTarget }) {
  const [copied, setCopied] = useState(false);
  const config = firmwareConfig(credentials, target);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-leaf-950 p-3 pr-10 text-xs text-leaf-100">{config}</pre>
      <button type="button" aria-label="Copiar config.py"
        className="absolute right-2 top-2 rounded p-1 text-leaf-100/80 hover:text-white"
        onClick={async () => {
          await navigator.clipboard?.writeText(config);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-water-700 hover:underline">
      {children} <ExternalLink size={13} />
    </a>
  );
}

/**
 * Guía para conectar un cultivo real: un ESP32 físico o el mismo firmware simulado en Wokwi. Los dos usan la
 * cuenta MQTT del cultivo; lo simulado en Wokwi también es un cultivo real, distinto de un cultivo virtual.
 */
export function ConnectionGuide({ credentials }: { credentials: DeviceCredentials }) {
  const [target, setTarget] = useState<FirmwareTarget>("esp32");
  return (
    <div className="space-y-5">
      <CredentialsView credentials={credentials} />

      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Dónde corre el firmware">
        {TARGETS.map(({ id, label, hint, icon: Icon }) => (
          <button key={id} type="button" role="radio" aria-checked={target === id} onClick={() => setTarget(id)}
            className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${target === id
              ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-600/30" : "border-line bg-white hover:bg-surface"}`}>
            <Icon size={20} className="mt-0.5 shrink-0 text-leaf-700" />
            <span>
              <span className="block font-semibold">{label}</span>
              <span className="block text-xs text-muted">{hint}</span>
            </span>
          </button>
        ))}
      </div>

      {target === "esp32" ? (
        <ol className="space-y-4">
          <Step number={1} title="Arma el circuito">
            <ul className="grid gap-x-4 gap-y-1 text-muted sm:grid-cols-2">
              {PINS.map(([part, pin]) => (
                <li key={part} className="flex justify-between gap-2 border-b border-line/70 py-0.5">
                  <span>{part}</span><span className="font-medium text-ink">{pin}</span>
                </li>
              ))}
            </ul>
          </Step>
          <Step number={2} title="Graba MicroPython y el firmware">
            <p className="text-muted">
              Instala MicroPython 1.23 en el ESP32 y copia la carpeta <code>fs/</code> del <Link href={FIRMWARE_REPO}>firmware
              de SmartPot</Link> con <code>mpremote</code>.
            </p>
          </Step>
          <Step number={3} title="Crea config.py con tu red y este cultivo">
            <ConfigBlock credentials={credentials} target="esp32" />
            {credentials.tls && (
              <a href="/ca.crt" download className="inline-flex items-center gap-1.5 font-semibold text-leaf-700">
                <Download size={14} /> Descargar ca.crt (certificado del broker)
              </a>
            )}
          </Step>
          <Step number={4} title="Enciende la placa">
            <p className="text-muted">En unos segundos el cultivo aparece <strong className="text-ink">En línea</strong> y
              llegan las lecturas; la pantalla LCD muestra los mismos valores.</p>
          </Step>
        </ol>
      ) : (
        <ol className="space-y-4">
          <Step number={1} title="Abre el proyecto de Wokwi">
            <p className="text-muted">
              <Link href={WOKWI_PROJECT}>Proyecto SmartPot en Wokwi</Link>: el ESP32, los sensores y los actuadores ya
              están conectados. Guarda una copia en tu cuenta de Wokwi.
            </p>
          </Step>
          <Step number={2} title="Pega config.py y ca.crt">
            <ConfigBlock credentials={credentials} target="wokwi" />
            {credentials.tls && (
              <a href="/ca.crt" download className="inline-flex items-center gap-1.5 font-semibold text-leaf-700">
                <Download size={14} /> Descargar ca.crt (certificado del broker)
              </a>
            )}
          </Step>
          <Step number={3} title="Ejecuta la simulación">
            <p className="text-muted">La red <code>Wokwi-GUEST</code> tiene salida a Internet: mueve los sensores del circuito
              y mira cómo cambian las lecturas y cómo reaccionan los actuadores.</p>
          </Step>
        </ol>
      )}
      {target === "wokwi" && (
        <Alert tone="warning">
          Deja tu copia del proyecto como privada: quien vea <code>config.py</code> puede publicar como tu cultivo. Si se
          filtra, genera una nueva clave.
        </Alert>
      )}
    </div>
  );
}
