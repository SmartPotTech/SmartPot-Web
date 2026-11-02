import {createContext, useContext} from "solid-js";
import type {AuthResponse, User} from "../../lib/api/types";
import type {TranslationKey} from "../../lib/i18n";

export interface AuthState {
    readonly user: User | null;
    readonly token: string | null;
    signIn: (auth: AuthResponse, remember: boolean) => void;
    signOut: (reason?: TranslationKey) => void;
    updateUser: (user: User) => void;
    readonly notice: TranslationKey | null;
    clearNotice: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
}
