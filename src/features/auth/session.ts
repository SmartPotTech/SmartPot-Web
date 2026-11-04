import type {AuthResponse, User} from "../../lib/api/types";

export const CSRF_COOKIE_NAME = "smartpot_csrf";
export const CSRF_HEADER_NAME = "X-CSRF-Token";
const LEGACY_STORAGE_KEY = "smartpot.session";

// Estado en memoria fuera de Web Storage: el JWT viaja exclusivamente en una cookie HttpOnly.
let activeSession: Session | null = null;
let csrfToken: string | null = null;

export interface Session {
    expiresAt: string;
    user: User;
}

function readCsrfFromCookie(): string | null {
    if (typeof document === "undefined" || !document.cookie) return null;
    for (const part of document.cookie.split(";")) {
        const trimmed = part.trim();
        if (trimmed.startsWith(`${CSRF_COOKIE_NAME}=`)) {
            const value = decodeURIComponent(trimmed.slice(CSRF_COOKIE_NAME.length + 1)).trim();
            return value || null;
        }
    }
    return null;
}

export function currentCsrfToken(): string | null {
    return csrfToken ?? readCsrfFromCookie();
}

export function setCsrfToken(next: string | null) {
    csrfToken = next && next.trim() ? next.trim() : null;
}

export function hasSessionCookie(): boolean {
    return currentCsrfToken() !== null;
}

export function loadSession(now: number = Date.now()): Session | null {
    if (activeSession && new Date(activeSession.expiresAt).getTime() > now) {
        return activeSession;
    }
    activeSession = null;
    return null;
}

/** Guarda en memoria los metadatos públicos de la sesión; el JWT permanece en la cookie HttpOnly del navegador. */
export function saveSession(auth: AuthResponse): Session {
    purgeLegacyStorage();
    const session: Session = {expiresAt: auth.expiresAt, user: auth.user};
    activeSession = session;
    const cookieToken = readCsrfFromCookie();
    if (cookieToken) csrfToken = cookieToken;
    return session;
}

export function updateStoredUser(user: User) {
    if (activeSession) {
        activeSession = {...activeSession, user};
    }
}

export function clearSession() {
    activeSession = null;
    csrfToken = null;
    purgeLegacyStorage();
    if (typeof document !== "undefined") {
        try {
            document.cookie = `${CSRF_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
        } catch {
            // Entorno sin acceso a cookies de documento.
        }
    }
}

function purgeLegacyStorage() {
    if (typeof window === "undefined") return;
    for (const storage of [window.localStorage, window.sessionStorage]) {
        try {
            storage?.removeItem(LEGACY_STORAGE_KEY);
        } catch {
            // Almacenamiento bloqueado: nada que limpiar.
        }
    }
}
