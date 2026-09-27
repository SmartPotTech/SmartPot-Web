import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WeatherScene } from "./components/WeatherScene";

describe("escena de la maceta virtual", () => {
  it("dibuja lluvia en un día lluvioso y lo anuncia", () => {
    const { container } = render(<WeatherScene condition="RAIN" isDay label="Lluvia, de día, en Medellín" />);
    expect(screen.getByRole("img", { name: "Lluvia, de día, en Medellín" })).toBeInTheDocument();
    expect(container.querySelectorAll(".scene-rain line").length).toBeGreaterThan(10);
    expect(container.querySelector(".scene-sun")).toBeNull();
  });

  it("muestra el sol solo de día y con cielo despejado", () => {
    const { container, rerender } = render(<WeatherScene condition="CLEAR" isDay label="Despejado" />);
    expect(container.querySelector(".scene-sun")).not.toBeNull();
    rerender(<WeatherScene condition="CLEAR" isDay={false} label="Despejado de noche" />);
    expect(container.querySelector(".scene-sun")).toBeNull();
  });

  it("refleja los actuadores encendidos", () => {
    const { container } = render(<WeatherScene label="Bajo techo" active={["FAN", "WATER_PUMP"]} />);
    expect(container.querySelector(".scene-fan")).not.toBeNull();
    expect(container.querySelectorAll(".scene-rain path")).toHaveLength(3);
  });
});
