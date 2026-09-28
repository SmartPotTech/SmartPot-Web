import type {AuthResponse, User} from "../../lib/api/types";

const KEY = "smartpot.session";

// Token vigente fuera de React: el cliente HTTP lo lee en cada petición.
let currentToken: string | null = null;

export function currentSessionToken(): string | null {
    return currentToken;
}

export interface Session {
    token: string;
    expiresAt: string;
    user: User;
}

function storages(): Storage[] {
    try {
        return [window.localStorage, window.sessionStorage];
    } catch {
        return [];
    }
}

export function loadSession(now: number = Date.now()): Session | null {
    for (const storage of storages()) {
        try {
            const raw = storage.getItem(KEY);
            if (!raw) continue;
            const session = JSON.parse(raw) as Session;
            if (session.token && new Date(session.expiresAt).getTime() > now) {
                currentToken = session.token;
                return session;
            }
            storage.removeItem(KEY);
        } catch {
            // Almacenamiento bloqueado o dato corrupto: se ignora.
        }
    }
    return null;
}

/** Con «mantener sesión» se guarda en localStorage; si no, solo dura mientras la pestaña esté abierta. */
export function saveSession(auth: AuthResponse, remember: boolean): Session {
    const session: Session = {token: auth.token, expiresAt: auth.expiresAt, user: auth.user};
    clearSession();
    currentToken = session.token;
    try {
        (remember ? window.localStorage : window.sessionStorage).setItem(KEY, JSON.stringify(session));
    } catch {
        // Sin almacenamiento la sesión vive solo en memoria.
    }
    return session;
}

export function updateStoredUser(user: User) {
    for (const storage of storages()) {
        try {
            const raw = storage.getItem(KEY);
            if (raw) storage.setItem(KEY, JSON.stringify({...JSON.parse(raw), user}));
        } catch {
            // Se ignora: el usuario en memoria ya está actualizado.
        }
    }
}

export function clearSession() {
    currentToken = null;
    for (const storage of storages()) {
        try {
            storage.removeItem(KEY);
        } catch {
            // Nada que limpiar.
        }
    }
}
