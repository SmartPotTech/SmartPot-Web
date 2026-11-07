import {createMemoryHistory, MemoryRouter, Route} from "@solidjs/router";
import {fireEvent, render, screen} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {AuthResponse} from "../../lib/api/types";
import {ApiError} from "../../lib/api/client";
import {authApi} from "../../lib/api/services";
import {RegisterPage} from "./RegisterPage";

const auth = vi.hoisted(() => ({signIn: vi.fn()}));

vi.mock("./AuthContext", () => ({
    useAuth: () => ({
        user: null,
        authenticated: false,
        loading: false,
        signIn: auth.signIn,
        signOut: vi.fn(),
        updateUser: vi.fn(),
        notice: null,
        clearNotice: vi.fn(),
    }),
}));

const REGISTERED: AuthResponse = {
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    user: {id: "u1", name: "Ana", lastName: "Demo", email: "ana@example.com", role: "USER", createdAt: ""},
};

function renderRegister() {
    const history = createMemoryHistory();
    history.set({value: "/register"});
    render(() => (
        <MemoryRouter history={history}>
            <Route path="/register" component={RegisterPage}/>
            <Route path="/app" component={() => <p>Panel de cultivos</p>}/>
            <Route path="/login" component={() => <p>Pantalla de ingreso</p>}/>
        </MemoryRouter>
    ));
}

async function fillValidForm() {
    await userEvent.type(screen.getByLabelText("Nombre"), "Ana");
    await userEvent.type(screen.getByLabelText("Apellido"), "Demo");
    await userEvent.type(screen.getByLabelText("Correo"), "ana@example.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "Tomate2026");
}

beforeEach(() => {
    vi.restoreAllMocks();
    auth.signIn.mockClear();
});

describe("RegisterPage", () => {
    it("muestra los campos y el aviso de privacidad", () => {
        renderRegister();

        expect(screen.getByRole("heading", {name: "Crea tu cuenta"})).toBeInTheDocument();
        expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
        expect(screen.getByLabelText("Apellido")).toBeInTheDocument();
        expect(screen.getByLabelText("Correo")).toBeInTheDocument();
        expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
        expect(screen.getByText(/Tus datos solo se usan para tu cuenta/)).toBeInTheDocument();
    });

    it("valida todos los campos vacíos antes de llamar a la API", async () => {
        const register = vi.spyOn(authApi, "register");
        renderRegister();

        await userEvent.click(screen.getByRole("button", {name: "Crear cuenta"}));

        expect(await screen.findByText("El nombre debe tener al menos 2 caracteres")).toBeInTheDocument();
        expect(screen.getByText("El apellido debe tener al menos 2 caracteres")).toBeInTheDocument();
        expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
        expect(screen.getByText("Usa al menos 8 caracteres")).toBeInTheDocument();
        expect(register).not.toHaveBeenCalled();
        expect(auth.signIn).not.toHaveBeenCalled();
    });

    it("rechaza un correo inválido, un nombre con números y una contraseña débil", async () => {
        const register = vi.spyOn(authApi, "register");
        renderRegister();

        await userEvent.type(screen.getByLabelText("Nombre"), "R2D2");
        await userEvent.type(screen.getByLabelText("Apellido"), "Demo");
        await userEvent.type(screen.getByLabelText("Correo"), "ana@");
        await userEvent.type(screen.getByLabelText("Contraseña"), "abcdefgh");
        await userEvent.click(screen.getByRole("button", {name: "Crear cuenta"}));

        expect(await screen.findByText("El nombre solo puede tener letras y espacios")).toBeInTheDocument();
        expect(screen.getByText("El correo no es válido")).toBeInTheDocument();
        expect(screen.getByText("Incluye una mayúscula, una minúscula y un número")).toBeInTheDocument();
        expect(register).not.toHaveBeenCalled();
    });

    it("registra con el payload correcto, inicia sesión y entra al panel", async () => {
        const register = vi.spyOn(authApi, "register").mockResolvedValue(REGISTERED);
        renderRegister();

        await userEvent.type(screen.getByLabelText("Nombre"), "Ana");
        await userEvent.type(screen.getByLabelText("Apellido"), "Demo");
        fireEvent.input(screen.getByLabelText("Correo"), {target: {value: "  ana@example.com  "}});
        await userEvent.type(screen.getByLabelText("Contraseña"), "Tomate2026");
        await userEvent.click(screen.getByRole("button", {name: "Crear cuenta"}));

        expect(register).toHaveBeenCalledWith({
            name: "Ana",
            lastName: "Demo",
            email: "ana@example.com",
            password: "Tomate2026",
        });
        expect(auth.signIn).toHaveBeenCalledWith(REGISTERED);
        expect(await screen.findByText("Panel de cultivos")).toBeInTheDocument();
    });

    it("muestra el conflicto cuando el correo ya existe y no navega", async () => {
        vi.spyOn(authApi, "register").mockRejectedValue(
            new ApiError(409, "An account with this email already exists.", {
                email: "This email is already registered.",
            }),
        );
        renderRegister();

        await fillValidForm();
        await userEvent.click(screen.getByRole("button", {name: "Crear cuenta"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("An account with this email already exists.");
        expect(screen.getByText("This email is already registered.")).toBeInTheDocument();
        expect(screen.queryByText("Panel de cultivos")).not.toBeInTheDocument();
        expect(auth.signIn).not.toHaveBeenCalled();
        expect(screen.getByRole("button", {name: "Crear cuenta"})).toBeEnabled();
    });

    it("avisa cuando falla la red con un mensaje genérico", async () => {
        vi.spyOn(authApi, "register").mockRejectedValue(new ApiError(0, "No se pudo conectar con el servidor."));
        renderRegister();

        await fillValidForm();
        await userEvent.click(screen.getByRole("button", {name: "Crear cuenta"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");
        expect(screen.queryByText("Panel de cultivos")).not.toBeInTheDocument();
    });

    it("usa el mensaje genérico ante un error inesperado", async () => {
        vi.spyOn(authApi, "register").mockRejectedValue(new Error("boom"));
        renderRegister();

        await fillValidForm();
        await userEvent.click(screen.getByRole("button", {name: "Crear cuenta"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos crear tu cuenta");
    });

    it("deshabilita el botón mientras registra y no duplica el envío", async () => {
        let resolveRegister: ((value: AuthResponse) => void) | undefined;
        const pending = new Promise<AuthResponse>((resolve) => {
            resolveRegister = resolve;
        });
        const register = vi.spyOn(authApi, "register").mockReturnValue(pending);
        renderRegister();

        await fillValidForm();
        const button = screen.getByRole("button", {name: "Crear cuenta"});
        await userEvent.click(button);

        expect(button).toBeDisabled();
        expect(register).toHaveBeenCalledTimes(1);
        expect(auth.signIn).not.toHaveBeenCalled();

        resolveRegister?.(REGISTERED);
        expect(await screen.findByText("Panel de cultivos")).toBeInTheDocument();
        expect(auth.signIn).toHaveBeenCalledWith(REGISTERED);
        expect(register).toHaveBeenCalledTimes(1);
    });
});
