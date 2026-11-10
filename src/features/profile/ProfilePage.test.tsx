import {render, screen, waitFor} from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {ApiError} from "../../lib/api/client";
import type {User} from "../../lib/api/types";
import {ProfilePage} from "./ProfilePage";

const INITIAL_USER: User = {
    id: "u1",
    name: "Ana",
    lastName: "Demo",
    email: "ana@example.com",
    role: "USER",
    createdAt: "2026-01-15T12:00:00Z",
};

const auth = vi.hoisted(() => ({
    user: {
        id: "u1",
        name: "Ana",
        lastName: "Demo",
        email: "ana@example.com",
        role: "USER",
        createdAt: "2026-01-15T12:00:00Z",
    },
    signOut: vi.fn(),
    updateUser: vi.fn(),
}));

const api = vi.hoisted(() => ({
    update: vi.fn(),
    changePassword: vi.fn(),
    remove: vi.fn(),
}));

vi.mock("../auth/AuthContext", () => ({
    useAuth: () => ({
        user: auth.user,
        authenticated: true,
        loading: false,
        signIn: vi.fn(),
        signOut: auth.signOut,
        updateUser: auth.updateUser,
        notice: null,
        clearNotice: vi.fn(),
    }),
}));

vi.mock("../../lib/api/services", () => ({
    userApi: api,
    cropApi: {
        list: vi.fn().mockResolvedValue([]),
    },
    connectionApi: {
        list: vi.fn().mockResolvedValue([]),
    },
    notificationApi: {
        listTelegramRecipients: vi.fn().mockResolvedValue([]),
    },
}));

// Los paneles de canales y MCP tienen sus propias pruebas; aquí se aíslan para no pedir la API.
vi.mock("./NotificationChannels", () => ({NotificationChannels: () => null}));
vi.mock("./McpConnections", () => ({McpConnections: () => null}));

function renderProfile() {
    render(() => <ProfilePage/>);
}

beforeEach(() => {
    vi.restoreAllMocks();
    auth.user = {...INITIAL_USER};
    auth.signOut.mockClear();
    auth.updateUser.mockClear();
    api.update.mockReset();
    api.changePassword.mockReset();
    api.remove.mockReset();
});

describe("ProfilePage", () => {
    it("muestra los datos de la sesión", () => {
        renderProfile();

        expect(screen.getByRole("heading", {name: "Perfil"})).toBeInTheDocument();
        expect(screen.getByText(/ana@example\.com · miembro desde/)).toBeInTheDocument();
        expect(screen.getByRole("heading", {name: "Datos personales"})).toBeInTheDocument();
        expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
        expect(screen.getByLabelText("Apellido")).toHaveValue("Demo");
    });

    it("actualiza nombre y apellido, refresca la sesión y confirma el cambio", async () => {
        const updated: User = {...INITIAL_USER, name: "Ana María", lastName: "López"};
        api.update.mockResolvedValue(updated);
        renderProfile();

        await userEvent.clear(screen.getByLabelText("Nombre"));
        await userEvent.type(screen.getByLabelText("Nombre"), "Ana María");
        await userEvent.clear(screen.getByLabelText("Apellido"));
        await userEvent.type(screen.getByLabelText("Apellido"), "López");
        await userEvent.click(screen.getByRole("button", {name: "Guardar"}));

        await waitFor(() => expect(api.update).toHaveBeenCalledWith({
            name: "Ana María",
            lastName: "López",
        }));
        expect(auth.updateUser).toHaveBeenCalledWith(updated);
        expect(await screen.findByText("Perfil actualizado")).toBeInTheDocument();
    });

    it("no guarda el perfil si un nombre no es válido", async () => {
        renderProfile();

        await userEvent.clear(screen.getByLabelText("Nombre"));
        await userEvent.type(screen.getByLabelText("Nombre"), "R2D2");
        await userEvent.click(screen.getByRole("button", {name: "Guardar"}));

        expect(await screen.findByText("El nombre solo puede tener letras y espacios")).toBeInTheDocument();
        expect(api.update).not.toHaveBeenCalled();
        expect(auth.updateUser).not.toHaveBeenCalled();
    });

    it("muestra el error del servidor al guardar el perfil", async () => {
        api.update.mockRejectedValue(new ApiError(400, "Invalid profile data."));
        renderProfile();

        await userEvent.click(screen.getByRole("button", {name: "Guardar"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("Invalid profile data.");
        expect(auth.updateUser).not.toHaveBeenCalled();
    });

    it("cambia la contraseña con el payload correcto y limpia el formulario", async () => {
        api.changePassword.mockResolvedValue(undefined);
        renderProfile();

        await userEvent.type(screen.getByLabelText("Contraseña actual"), "Actual2026");
        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "NuevaClave2026");
        await userEvent.click(screen.getByRole("button", {name: "Cambiar contraseña"}));

        await waitFor(() => expect(api.changePassword).toHaveBeenCalledWith("Actual2026", "NuevaClave2026"));
        expect(await screen.findByText("Contraseña actualizada")).toBeInTheDocument();
        expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
        expect(screen.getByLabelText("Nueva contraseña")).toHaveValue("");
    });

    it("muestra el error cuando la contraseña actual es incorrecta", async () => {
        api.changePassword.mockRejectedValue(new ApiError(400, "Current password is incorrect."));
        renderProfile();

        await userEvent.type(screen.getByLabelText("Contraseña actual"), "Incorrecta2026");
        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "NuevaClave2026");
        await userEvent.click(screen.getByRole("button", {name: "Cambiar contraseña"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("Current password is incorrect.");
        expect(screen.getByLabelText("Nueva contraseña")).toHaveValue("NuevaClave2026");
    });

    it("valida localmente la nueva contraseña antes de llamar a la API", async () => {
        renderProfile();

        await userEvent.type(screen.getByLabelText("Contraseña actual"), "Actual2026");
        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "sinmayuscula");
        await userEvent.click(screen.getByRole("button", {name: "Cambiar contraseña"}));

        expect(await screen.findByText("Incluye una mayúscula, una minúscula y un número")).toBeInTheDocument();
        expect(api.changePassword).not.toHaveBeenCalled();
    });

    it("exige la contraseña actual antes de cambiarla", async () => {
        renderProfile();

        await userEvent.type(screen.getByLabelText("Nueva contraseña"), "NuevaClave2026");
        await userEvent.click(screen.getByRole("button", {name: "Cambiar contraseña"}));

        expect(await screen.findByText("Escribe tu contraseña actual")).toBeInTheDocument();
        expect(api.changePassword).not.toHaveBeenCalled();
    });

    it("cancelar la eliminación no llama a la API", async () => {
        renderProfile();

        await userEvent.click(screen.getByRole("button", {name: "Eliminar mi cuenta"}));
        expect(screen.getByText("¿Eliminar tu cuenta?")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Cancelar", hidden: true}));

        expect(api.remove).not.toHaveBeenCalled();
        expect(auth.signOut).not.toHaveBeenCalled();
        expect(screen.queryByText("Tus cultivos quedarán desconectados y perderás todo el historial."))
            .not.toBeInTheDocument();
    });

    it("confirmar la eliminación borra la cuenta y cierra la sesión", async () => {
        api.remove.mockResolvedValue(undefined);
        renderProfile();

        await userEvent.click(screen.getByRole("button", {name: "Eliminar mi cuenta"}));
        await userEvent.click(screen.getByRole("button", {name: "Sí, eliminar todo", hidden: true}));

        await waitFor(() => expect(api.remove).toHaveBeenCalledTimes(1));
        expect(auth.signOut).toHaveBeenCalledWith("auth.accountDeleted");
    });

    it("muestra el error del backend si no se puede eliminar la cuenta", async () => {
        api.remove.mockRejectedValue(new ApiError(500, "The account could not be deleted."));
        renderProfile();

        await userEvent.click(screen.getByRole("button", {name: "Eliminar mi cuenta"}));
        await userEvent.click(screen.getByRole("button", {name: "Sí, eliminar todo", hidden: true}));

        expect(await screen.findByRole("alert")).toHaveTextContent("The account could not be deleted.");
        expect(auth.signOut).not.toHaveBeenCalled();
        expect(screen.queryByText("¿Eliminar tu cuenta?")).not.toBeInTheDocument();
    });
});
