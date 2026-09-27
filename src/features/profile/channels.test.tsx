import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ChannelOption } from "../../lib/api/types";
import { ChannelRow } from "./NotificationChannels";

const handlers = () => ({ onLink: vi.fn(), onRefresh: vi.fn(), onUpdate: vi.fn(), onTest: vi.fn(), onUnlink: vi.fn() });

describe("canales de notificación", () => {
  it("avisa cuando el servidor no tiene el bot configurado", () => {
    render(<ChannelRow option={{ type: "TELEGRAM", name: "Telegram", available: false }} code={null} busy={null}
      {...handlers()} />);
    expect(screen.getByText(/no tiene configurado el bot de Telegram/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("ofrece vincular y muestra el código de respaldo", async () => {
    const actions = handlers();
    render(<ChannelRow option={{ type: "TELEGRAM", name: "Telegram", available: true, handle: "@SmartPotBot" }}
      code={{ type: "TELEGRAM", code: "abc123", url: "https://t.me/SmartPotBot?start=abc123",
        expiresAt: new Date(Date.now() + 600_000).toISOString() }} busy={null} {...actions} />);

    await userEvent.click(screen.getByRole("button", { name: "Vincular Telegram" }));
    expect(actions.onLink).toHaveBeenCalled();
    expect(screen.getByText("/start abc123")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://t.me/SmartPotBot" })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("permite elegir qué avisos recibir, probar y desvincular", async () => {
    const actions = handlers();
    const option: ChannelOption = { type: "TELEGRAM", name: "Telegram", available: true, handle: "@SmartPotBot",
      link: { id: "l1", type: "TELEGRAM", displayName: "@sebas", enabled: true, events: ["ALERT", "DEVICE"] } };
    render(<ChannelRow option={option} code={null} busy={null} {...actions} />);

    expect(screen.getByText(/Vinculado a @sebas/)).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Acciones del asistente"));
    expect(actions.onUpdate).toHaveBeenCalledWith(option.link, { events: ["ALERT", "DEVICE", "AI"] });
    await userEvent.click(screen.getByLabelText("Alertas del cultivo"));
    expect(actions.onUpdate).toHaveBeenLastCalledWith(option.link, { events: ["DEVICE"] });
    await userEvent.click(screen.getByRole("switch", { name: "Recibir avisos por Telegram" }));
    expect(actions.onUpdate).toHaveBeenLastCalledWith(option.link, { enabled: false });
    await userEvent.click(screen.getByRole("button", { name: "Enviar prueba" }));
    expect(actions.onTest).toHaveBeenCalledWith(option.link);
  });
});
