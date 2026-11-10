import type {DeviceCredentials} from "../../lib/api/types";
import {t} from "../../lib/i18n";

/** Dónde corre el firmware y con qué runtime. */
export type FirmwareTarget = "rust" | "python" | "wokwi" | "esp32";

/** Firmware principal canónico en Rust (Embassy no_std) para placa física. */
export const FIRMWARE_RUST_REPO = "https://github.com/SmartPotTech/SmartPot-IoT";

/** Firmware alternativo en MicroPython para prototipado rápido o simulación Wokwi. */
export const FIRMWARE_PYTHON_REPO = "https://github.com/SmartPotTech/SmartPot-IoT-Python";

/** Alias histórico para retrocompatibilidad con importadores existentes. */
export const FIRMWARE_REPO = FIRMWARE_PYTHON_REPO;

export const WOKWI_PROJECT = "https://wokwi.com/projects/408863167711709185";

/** Ruta pública de la CA que firma el certificado del broker. */
export const BROKER_CA_PATH = "/ca.crt";

/**
 * config.json del firmware, común a MicroPython y Rust: la red WiFi, el bloque SMARTPOT del cultivo y la CA del
 * broker en BROKER (texto PEM, porque Wokwi no admite archivos .crt).
 */
export function firmwareConfig(
    credentials: DeviceCredentials,
    target: FirmwareTarget = "rust",
    caCertificate?: string,
): string {
    const wifi = target === "wokwi"
        ? {ssid: "Wokwi-GUEST", password: ""}
        : {ssid: t("firmware.networkName"), password: t("firmware.networkPassword")};
    const ca = credentials.tls ? (caCertificate?.trim() || t("firmware.ca")) : "";
    return JSON.stringify({
        WIFI: wifi,
        SMARTPOT: {
            crop_id: credentials.username,
            device_key: credentials.key ?? t("firmware.deviceKey"),
            host: credentials.host,
            port: credentials.port,
            tls: credentials.tls,
            interval_seconds: 30,
        },
        BROKER: {CA_CRT: ca},
    }, null, 2);
}
