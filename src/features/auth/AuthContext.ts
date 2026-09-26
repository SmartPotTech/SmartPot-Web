import { createContext, useContext } from "react";
import type { AuthResponse, User } from "../../lib/api/types";

export interface AuthState {
  user: User | null;
  token: string | null;
  signIn: (auth: AuthResponse, remember: boolean) => void;
  signOut: (reason?: string) => void;
  updateUser: (user: User) => void;
  notice: string | null;
  clearNotice: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
