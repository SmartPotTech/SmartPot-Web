import {A, useLocation, useNavigate} from "@solidjs/router";
import {createSignal, Show} from "solid-js";
import {Button} from "../../components/ui/Button";
import {Alert} from "../../components/ui/Feedback";
import {TextField} from "../../components/ui/Field";
import {usePageMeta} from "../../hooks/usePageMeta";
import {ApiError} from "../../lib/api/client";
import {authApi} from "../../lib/api/services";
import {t} from "../../lib/i18n";
import {AuthCard} from "./AuthCard";
import {useAuth} from "./AuthContext";
import {validateEmail} from "./validation";

export function LoginPage() {
    usePageMeta(() => t("auth.login.title"), {index: false, description: () => t("auth.login.description")});
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation<{ from?: string }>();
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [remember, setRemember] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);
    const [emailError, setEmailError] = createSignal<string>();
    const [loading, setLoading] = createSignal(false);

    async function submit(event: SubmitEvent) {
        event.preventDefault();
        auth.clearNotice();
        const invalid = validateEmail(email());
        setEmailError(invalid);
        if (invalid || !password()) {
            setError(invalid ? null : t("auth.login.passwordRequired"));
            return;
        }
        setLoading(true);
        setError(null);
        try {
            auth.signIn(await authApi.login(email().trim(), password(), remember()));
            const from = location.state?.from;
            navigate(from && from.startsWith("/app") ? from : "/app", {replace: true});
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : t("auth.login.failed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard title={t("auth.login.heading")} subtitle={t("auth.login.subtitle")}
                  footer={<>{t("auth.login.noAccount")} <A href="/register"
                                                              class="font-semibold text-accent">{t("auth.login.createFree")}</A></>}>
            <form onSubmit={submit} class="space-y-4" noValidate>
                <Show when={auth.notice}><Alert tone="warning">{t(auth.notice!)}</Alert></Show>
                <Show when={error()}><Alert tone="danger">{error()}</Alert></Show>
                <TextField label={t("auth.email")} type="email" autocomplete="email" value={email()} error={emailError()}
                           onChange={(event) => setEmail(event.currentTarget.value)}/>
                <TextField label={t("auth.password")} type="password" autocomplete="current-password" value={password()}
                           onChange={(event) => setPassword(event.currentTarget.value)}/>
                <div class="flex items-center justify-between text-sm">
                    <label class="flex items-center gap-2 text-muted">
                        <input type="checkbox" checked={remember()}
                               onChange={(event) => setRemember(event.currentTarget.checked)}
                               class="h-4 w-4 accent-leaf-700"/>
                        {t("auth.login.remember")}
                    </label>
                    <A href="/forgot-password" class="font-semibold text-accent">{t("auth.login.forgot")}</A>
                </div>
                <Button type="submit" size="lg" loading={loading()} class="w-full">{t("auth.login.submit")}</Button>
            </form>
        </AuthCard>
    );
}
