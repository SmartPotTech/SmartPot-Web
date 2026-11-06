import {createEffect, createSignal, type JSX, onCleanup} from "solid-js";
import {clearApiCache, configureApi} from "../../lib/api/client";
import {authApi} from "../../lib/api/services";
import type {TranslationKey} from "../../lib/i18n";
import type {AuthResponse, User} from "../../lib/api/types";
import {AuthContext, type AuthState} from "./AuthContext";
import {
    clearSession,
    currentCsrfToken,
    hasSessionCookie,
    loadSession,
    saveSession,
    type Session,
    setCsrfToken,
    updateStoredUser,
} from "./session";

const EXPIRED: TranslationKey = "auth.sessionExpired";
let handleUnauthorized: () => void = () => undefined;

configureApi({
    getCsrfToken: currentCsrfToken,
    setCsrfToken,
    onUnauthorized: () => handleUnauthorized(),
});

type AuthBroadcast = { type: "signOut" } | { type: "signIn"; auth: AuthResponse } | { type: "userUpdated"; user: User };

export function AuthProvider(props: { children: JSX.Element }) {
    const initial = loadSession();
    const [session, setSession] = createSignal<Session | null>(initial);
    const [loading, setLoading] = createSignal(!initial && hasSessionCookie());
    const [notice, setNotice] = createSignal<TranslationKey | null>(null);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("smartpot.auth") : null;

    const applySignOut = (reason?: TranslationKey, notifyServer = true) => {
        clearSession();
        clearApiCache();
        setSession(null);
        setLoading(false);
        if (reason) setNotice(reason);
        if (notifyServer) {
            void authApi.logout().catch(() => undefined);
        }
    };

    const broadcastSignOut = () => channel?.postMessage({type: "signOut"} satisfies AuthBroadcast);

    const signOut = (reason?: TranslationKey) => {
        applySignOut(reason, true);
        broadcastSignOut();
    };

    // Un 401 también cierra la sesión en las demás pestañas; la cookie ya no sirve y deben volver al ingreso.
    handleUnauthorized = () => {
        applySignOut(EXPIRED, false);
        broadcastSignOut();
    };
    configureApi({
        getCsrfToken: currentCsrfToken,
        setCsrfToken,
        getCacheScope: () => session()?.user.id ?? null,
        onUnauthorized: () => handleUnauthorized(),
    });

    if (channel) {
        const onMessage = (event: MessageEvent<AuthBroadcast>) => {
            const msg = event.data;
            if (!msg) return;
            if (msg.type === "signOut") {
                applySignOut(undefined, false);
            } else if (msg.type === "signIn") {
                clearApiCache();
                setSession(saveSession(msg.auth));
                setLoading(false);
                setNotice(null);
            } else if (msg.type === "userUpdated") {
                updateStoredUser(msg.user);
                setSession((current) => (current ? {...current, user: msg.user} : current));
            }
        };
        channel.addEventListener("message", onMessage);
        onCleanup(() => {
            channel.removeEventListener("message", onMessage);
            channel.close();
        });
    }

    if (!initial && hasSessionCookie()) {
        void authApi.session()
            .then((auth) => {
                setSession(saveSession(auth));
            })
            .catch(() => {
                clearSession();
                setSession(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    createEffect(() => {
        const current = session();
        if (!current) return;
        const remaining = new Date(current.expiresAt).getTime() - Date.now();
        const timer = setTimeout(() => signOut(EXPIRED), Math.max(0, Math.min(remaining, 2_000_000_000)));
        onCleanup(() => clearTimeout(timer));
    });

    const signIn = (auth: AuthResponse) => {
        clearApiCache();
        setSession(saveSession(auth));
        setLoading(false);
        setNotice(null);
        channel?.postMessage({type: "signIn", auth} satisfies AuthBroadcast);
    };

    const updateUser = (user: User) => {
        updateStoredUser(user);
        setSession((current) => (current ? {...current, user} : current));
        channel?.postMessage({type: "userUpdated", user} satisfies AuthBroadcast);
    };

    const value: AuthState = {
        get user() {
            return session()?.user ?? null;
        },
        get authenticated() {
            return session() !== null;
        },
        get loading() {
            return loading();
        },
        signIn,
        signOut,
        updateUser,
        get notice() {
            return notice();
        },
        clearNotice: () => setNotice(null),
    };

    return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}
