import {A, useNavigate, useSearchParams} from "@solidjs/router";
import {createSignal, Show} from "solid-js";
import {Button} from "../../components/ui/Button";
import {Alert} from "../../components/ui/Feedback";
import {TextField} from "../../components/ui/Field";
import {usePageMeta} from "../../hooks/usePageMeta";
import {ApiError} from "../../lib/api/client";
import {authApi} from "../../lib/api/services";
import {t} from "../../lib/i18n";
import {AuthCard} from "./AuthCard";
import {validateEmail, validatePassword} from "./validation";

export function ForgotPasswordPage() {
    usePageMeta(() => t("auth.forgot.title"));
    const [email, setEmail] = createSignal("");
    const [emailError, setEmailError] = createSignal<string>();
    const [sent, setSent] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [loading, setLoading] = createSignal(false);

    async function submit(event: SubmitEvent) {
        event.preventDefault();
        const invalid = validateEmail(email());
        setEmailError(invalid);
        if (invalid) return;
        setLoading(true);
        setError(null);
        try {
            await authApi.forgotPassword(email().trim());
            setSent(true);
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : t("auth.forgot.failed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard title={t("auth.forgot.heading")} subtitle={t("auth.forgot.subtitle")}
                  footer={<A href="/login" class="font-semibold text-accent">{t("auth.forgot.back")}</A>}>
            <Show when={sent()} fallback={
                <form onSubmit={submit} class="space-y-4" noValidate>
                    <Show when={error()}><Alert tone="danger">{error()}</Alert></Show>
                    <TextField label={t("auth.email")} type="email" autocomplete="email" value={email()} error={emailError()}
                               onChange={(event) => setEmail(event.currentTarget.value)}/>
                    <Button type="submit" size="lg" loading={loading()} class="w-full">{t("auth.forgot.submit")}</Button>
                </form>
            }>
                <Alert tone="success" title={t("auth.forgot.sentTitle")}>
                    {t("auth.forgot.sentBody")}
                </Alert>
            </Show>
        </AuthCard>
    );
}

export function ResetPasswordPage() {
    usePageMeta(() => t("auth.reset.title"));
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = () => (typeof params.token === "string" ? params.token : "");
    const [password, setPassword] = createSignal("");
    const [confirm, setConfirm] = createSignal("");
    const [errors, setErrors] = createSignal<{ password?: string; confirm?: string }>({});
    const [error, setError] = createSignal<string | null>(token() ? null : t("auth.reset.invalidLink"));
    const [loading, setLoading] = createSignal(false);

    async function submit(event: SubmitEvent) {
        event.preventDefault();
        const found = {
            password: validatePassword(password()),
            confirm: password() === confirm() ? undefined : t("auth.reset.mismatch"),
        };
        setErrors(found);
        if (found.password || found.confirm || !token()) return;
        setLoading(true);
        setError(null);
        try {
            await authApi.resetPassword(token(), password());
            navigate("/login", {replace: true});
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : t("auth.reset.failed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard title={t("auth.reset.heading")}
                  footer={<A href="/forgot-password" class="font-semibold text-accent">{t("auth.reset.another")}</A>}>
            <form onSubmit={submit} class="space-y-4" noValidate>
                <Show when={error()}><Alert tone="danger">{error()}</Alert></Show>
                <TextField label={t("auth.reset.newPassword")} type="password" autocomplete="new-password" value={password()}
                           error={errors().password} onChange={(event) => setPassword(event.currentTarget.value)}/>
                <TextField label={t("auth.reset.repeat")} type="password" autocomplete="new-password" value={confirm()}
                           error={errors().confirm} onChange={(event) => setConfirm(event.currentTarget.value)}/>
                <Button type="submit" size="lg" loading={loading()} disabled={!token()} class="w-full">{t("auth.reset.submit")}</Button>
            </form>
        </AuthCard>
    );
}
