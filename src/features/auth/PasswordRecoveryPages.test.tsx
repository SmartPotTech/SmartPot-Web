import {createMemoryHistory, MemoryRouter, Route} from "@solidjs/router";
import {fireEvent, render, screen} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {ApiError} from "../../lib/api/client";
import {authApi} from "../../lib/api/services";
import {ForgotPasswordPage, ResetPasswordPage} from "./PasswordRecoveryPages";

function renderForgot() {
    const history = createMemoryHistory();
    history.set({value: "/forgot-password"});
    render(() => (
        <MemoryRouter history={history}>
            <Route path="/forgot-password" component={ForgotPasswordPage}/>
            <Route path="/login" component={() => <p>Pantalla de ingreso</p>}/>
        </MemoryRouter>
    ));
}

function renderReset(value = "/reset-password") {
    const history = createMemoryHistory();
    history.set({value});
    render(() => (
        <MemoryRouter history={history}>
            <Route path="/reset-password" component={ResetPasswordPage}/>
            <Route path="/login" component={() => <p>Pantalla de ingreso</p>}/>
        </MemoryRouter>
    ));
}

beforeEach(() => {
    vi.restoreAllMocks();
});

describe("ForgotPasswordPage", () => {
    it("muestra el formulario y exige el correo antes de llamar a la API", async () => {
        const forgot = vi.spyOn(authApi, "forgotPassword");
        renderForgot();

        expect(screen.getByRole("heading", {name: "Recupera tu contraseña"})).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Enviar enlace"}));

        expect(await screen.findByText("El correo es obligatorio")).toBeInTheDocument();
        expect(forgot).not.toHaveBeenCalled();
    });

    it("rechaza un correo con formato inválido", async () => {
        const forgot = vi.spyOn(authApi, "forgotPassword");
        renderForgot();

        await userEvent.type(screen.getByLabelText("Correo"), "ana@");
        await userEvent.click(screen.getByRole("button", {name: "Enviar enlace"}));

        expect(await screen.findByText("El correo no es válido")).toBeInTheDocument();
        expect(forgot).not.toHaveBeenCalled();
    });

    it("envía el correo normalizado y muestra la confirmación", async () => {
        const forgot = vi.spyOn(authApi, "forgotPassword").mockResolvedValue(undefined);
        renderForgot();

        fireEvent.input(screen.getByLabelText("Correo"), {target: {value: "  ana@example.com  "}});
        await userEvent.click(screen.getByRole("button", {name: "Enviar enlace"}));

        expect(forgot).toHaveBeenCalledWith("ana@example.com");
        expect(await screen.findByText("Revisa tu correo")).toBeInTheDocument();
        expect(screen.getByText("Si hay una cuenta con ese correo, recibirás un enlace válido por 30 minutos."))
            .toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Enviar enlace"})).not.toBeInTheDocument();
    });

    it("muestra el mensaje del servidor cuando se supera el límite de intentos", async () => {
        vi.spyOn(authApi, "forgotPassword").mockRejectedValue(
            new ApiError(429, "Too many reset requests. Try again in a minute."),
        );
        renderForgot();

        await userEvent.type(screen.getByLabelText("Correo"), "ana@example.com");
        await userEvent.click(screen.getByRole("button", {name: "Enviar enlace"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("Too many reset requests. Try again in a minute.");
        expect(screen.getByRole("button", {name: "Enviar enlace"})).toBeEnabled();
    });

    it("mantiene el formulario y avisa cuando la red falla", async () => {
        vi.spyOn(authApi, "forgotPassword").mockRejectedValue(new ApiError(0, "No se pudo conectar con el servidor."));
        renderForgot();

        await userEvent.type(screen.getByLabelText("Correo"), "ana@example.com");
        await userEvent.click(screen.getByRole("button", {name: "Enviar enlace"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");
        expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    });

    it("usa el mensaje genérico ante un error inesperado", async () => {
        vi.spyOn(authApi, "forgotPassword").mockRejectedValue(new Error("boom"));
        renderForgot();

        await userEvent.type(screen.getByLabelText("Correo"), "ana@example.com");
        await userEvent.click(screen.getByRole("button", {name: "Enviar enlace"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos enviar el correo");
    });
});

describe("ResetPasswordPage", () => {
    it("avisa cuando el enlace no trae token y bloquea el envío", () => {
        const reset = vi.spyOn(authApi, "resetPassword");
        renderReset();

        expect(screen.getByRole("alert")).toHaveTextContent("El enlace de recuperación no es válido.");
        expect(screen.getByRole("button", {name: "Guardar contraseña"})).toBeDisabled();
        expect(reset).not.toHaveBeenCalled();
    });

    it("lee el token de la URL y valida la política de la nueva contraseña", async () => {
        const reset = vi.spyOn(authApi, "resetPassword");
        renderReset("/reset-password?token=tok-123");

        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "abcdefgh");
        await userEvent.type(screen.getByLabelText("Repite la contraseña"), "abcdefgh");
        await userEvent.click(screen.getByRole("button", {name: "Guardar contraseña"}));

        expect(await screen.findByText("Incluye una mayúscula, una minúscula y un número")).toBeInTheDocument();
        expect(reset).not.toHaveBeenCalled();
    });

    it("exige que la confirmación coincida con la contraseña", async () => {
        const reset = vi.spyOn(authApi, "resetPassword");
        renderReset("/reset-password?token=tok-123");

        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "Tomate2026");
        await userEvent.type(screen.getByLabelText("Repite la contraseña"), "Tomate2027");
        await userEvent.click(screen.getByRole("button", {name: "Guardar contraseña"}));

        expect(await screen.findByText("Las contraseñas no coinciden")).toBeInTheDocument();
        expect(reset).not.toHaveBeenCalled();
    });

    it("envía el token y la contraseña, y navega al ingreso", async () => {
        const reset = vi.spyOn(authApi, "resetPassword").mockResolvedValue(undefined);
        renderReset("/reset-password?token=tok-123");

        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "Tomate2026");
        await userEvent.type(screen.getByLabelText("Repite la contraseña"), "Tomate2026");
        await userEvent.click(screen.getByRole("button", {name: "Guardar contraseña"}));

        expect(reset).toHaveBeenCalledWith("tok-123", "Tomate2026");
        expect(await screen.findByText("Pantalla de ingreso")).toBeInTheDocument();
    });

    it("muestra el error del backend cuando el token venció y no navega", async () => {
        vi.spyOn(authApi, "resetPassword").mockRejectedValue(
            new ApiError(400, "The recovery token is invalid or expired."),
        );
        renderReset("/reset-password?token=tok-viejo");

        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "Tomate2026");
        await userEvent.type(screen.getByLabelText("Repite la contraseña"), "Tomate2026");
        await userEvent.click(screen.getByRole("button", {name: "Guardar contraseña"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("The recovery token is invalid or expired.");
        expect(screen.queryByText("Pantalla de ingreso")).not.toBeInTheDocument();
    });

    it("deshabilita el botón mientras la solicitud está en curso y no duplica el envío", async () => {
        let resolveReset: (() => void) | undefined;
        const pending = new Promise<void>((resolve) => {
            resolveReset = resolve;
        });
        const reset = vi.spyOn(authApi, "resetPassword").mockReturnValue(pending);
        renderReset("/reset-password?token=tok-123");

        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "Tomate2026");
        await userEvent.type(screen.getByLabelText("Repite la contraseña"), "Tomate2026");
        const button = screen.getByRole("button", {name: "Guardar contraseña"});
        await userEvent.click(button);

        expect(button).toBeDisabled();
        expect(reset).toHaveBeenCalledTimes(1);

        resolveReset?.();
        expect(await screen.findByText("Pantalla de ingreso")).toBeInTheDocument();
        expect(reset).toHaveBeenCalledTimes(1);
    });

    it("usa el mensaje genérico ante un fallo de red inesperado", async () => {
        vi.spyOn(authApi, "resetPassword").mockRejectedValue(new Error("offline"));
        renderReset("/reset-password?token=tok-123");

        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "Tomate2026");
        await userEvent.type(screen.getByLabelText("Repite la contraseña"), "Tomate2026");
        await userEvent.click(screen.getByRole("button", {name: "Guardar contraseña"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cambiar la contraseña");
    });
});
