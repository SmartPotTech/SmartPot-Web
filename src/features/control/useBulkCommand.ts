import { useState } from "react";
import { ApiError } from "../../lib/api/client";
import { commandApi } from "../../lib/api/services";
import type { ActuatorType, BulkCommandResult, CommandAction } from "../../lib/api/types";

export interface BulkOrder {
  actuatorType: ActuatorType;
  action: CommandAction;
  durationSeconds?: number | null;
  cropIds?: string[];
}

/** Envía una orden a varios cultivos y guarda el resultado para mostrarlo. */
export function useBulkCommand(onDone?: () => void) {
  const [sending, setSending] = useState<string | null>(null);
  const [result, setResult] = useState<BulkCommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(key: string, order: BulkOrder) {
    setSending(key);
    setError(null);
    try {
      setResult(await commandApi.bulk(order));
      onDone?.();
    } catch (caught) {
      setResult(null);
      setError(caught instanceof ApiError ? caught.message : "No se pudo enviar la orden");
    } finally {
      setSending(null);
    }
  }

  return { send, sending, result, error, clear: () => setResult(null) };
}
