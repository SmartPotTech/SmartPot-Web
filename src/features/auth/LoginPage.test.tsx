import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../lib/api/client";
import { authApi } from "../../lib/api/services";
import { AuthProvider } from "./AuthProvider";
import { LoginPage } from "./LoginPage";

function renderLogin() {
  const router = createMemoryRouter([
    { path: "/login", element: <LoginPage /> },
    { path: "/app", element: <p>Panel de cultivos</p> },
  ], { initialEntries: ["/login"] });
  render(<AuthProvider><RouterProvider router={router} /></AuthProvider>);
}

describe("LoginPage", () => {
  it("valida el correo antes de llamar a la API", async () => {
    const login = vi.spyOn(authApi, "login");
    renderLogin();
    await userEvent.type(screen.getByLabelText("Correo"), "no-es-correo");
    await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("El correo no es válido")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("muestra el error de credenciales de la API", async () => {
    vi.spyOn(authApi, "login").mockRejectedValue(new ApiError(401, "Correo o contraseña incorrectos"));
    renderLogin();
    await userEvent.type(screen.getByLabelText("Correo"), "ana@example.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "Incorrecta1");
    await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");
  });

  it("entra al panel con credenciales válidas", async () => {
    vi.spyOn(authApi, "login").mockResolvedValue({
      token: "jwt",
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      user: { id: "u1", name: "Ana", lastName: "Demo", email: "ana@example.com", role: "USER", createdAt: "" },
    });
    renderLogin();
    await userEvent.type(screen.getByLabelText("Correo"), "ana@example.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "Tomate2026");
    await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("Panel de cultivos")).toBeInTheDocument();
  });
});
