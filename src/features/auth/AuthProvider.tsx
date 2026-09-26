import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { configureApi } from "../../lib/api/client";
import type { AuthResponse, User } from "../../lib/api/types";
import { AuthContext, type AuthState } from "./AuthContext";
import { clearSession, currentSessionToken, loadSession, saveSession, updateStoredUser, type Session } from "./session";

const EXPIRED = "Tu sesión expiró. Inicia sesión de nuevo.";
let handleUnauthorized: () => void = () => undefined;

configureApi({ getToken: currentSessionToken, onUnauthorized: () => handleUnauthorized() });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [notice, setNotice] = useState<string | null>(null);

  const signOut = useCallback((reason?: string) => {
    clearSession();
    setSession(null);
    if (reason) setNotice(reason);
  }, []);

  useEffect(() => {
    handleUnauthorized = () => signOut(EXPIRED);
  }, [signOut]);

  useEffect(() => {
    if (!session) return;
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    const timer = setTimeout(() => signOut(EXPIRED), Math.max(0, Math.min(remaining, 2_000_000_000)));
    return () => clearTimeout(timer);
  }, [session, signOut]);

  const signIn = useCallback((auth: AuthResponse, remember: boolean) => {
    setSession(saveSession(auth, remember));
    setNotice(null);
  }, []);

  const updateUser = useCallback((user: User) => {
    updateStoredUser(user);
    setSession((current) => (current ? { ...current, user } : current));
  }, []);

  const value = useMemo<AuthState>(() => ({
    user: session?.user ?? null,
    token: session?.token ?? null,
    signIn,
    signOut,
    updateUser,
    notice,
    clearNotice: () => setNotice(null),
  }), [session, signIn, signOut, updateUser, notice]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
