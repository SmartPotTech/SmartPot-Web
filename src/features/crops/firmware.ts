import type { DeviceCredentials } from "../../lib/api/types";

/** Bloque SMARTPOT de config.py para el firmware de la maceta. */
export function firmwareConfig(credentials: DeviceCredentials): string {
  return `SMARTPOT = {
    "crop_id": "${credentials.username}",
    "device_key": "${credentials.key ?? "<CLAVE_DEL_DISPOSITIVO>"}",
    "host": "${credentials.host}",
    "port": ${credentials.port},
    "tls": ${credentials.tls ? "True" : "False"},
    "ca_file": "ca.crt",
    "interval_seconds": 30,
}`;
}
