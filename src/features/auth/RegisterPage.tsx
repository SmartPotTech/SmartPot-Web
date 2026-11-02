import {A, useNavigate} from "@solidjs/router";
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
import {passwordStrength, validateEmail, validateName, validatePassword} from "./validation";

type Fields = "name" | "lastName" | "email" | "password";

export function RegisterPage() {
    usePageMeta(() => t("auth.register.title"), {index: true, description: () => t("auth.register.description")});
    const auth = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = createSignal<Record<Fields, string>>({name: "", lastName: "", email: "", password: ""});
    const [errors, setErrors] = createSignal<Partial<Record<Fields, string>>>({});
    const [error, setError] = createSignal<string | null>(null);
    const [loading, setLoading] = createSignal(false);
    const strength = () => passwordStrength(form().password);

    const update = (field: Fields) => (event: Event & { currentTarget: HTMLInputElement }) =>
        setForm((current) => ({...current, [field]: event.currentTarget.value}));

    async function submit(event: SubmitEvent) {
        event.preventDefault();
        const current = form();
        const found = {
            name: validateName(current.name, t("auth.firstNameNoun"), 40),
            lastName: validateName(current.lastName, t("auth.lastNameNoun"), 60),
            email: validateEmail(current.email),
            password: validatePassword(current.password),
        };
        setErrors(found);
        if (Object.values(found).some(Boolean)) return;
        setLoading(true);
        setError(null);
        try {
            auth.signIn(await authApi.register({...current, email: current.email.trim()}), true);
            navigate("/app", {replace: true});
        } catch (caught) {
            if (caught instanceof ApiError) {
                setError(caught.message);
                setErrors(caught.fields as Partial<Record<Fields, string>>);
            } else {
                setError(t("auth.register.failed"));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard title={t("auth.register.heading")} subtitle={t("auth.register.subtitle")}
                  footer={<>{t("auth.register.haveAccount")} <A href="/login"
                                                  class="font-semibold text-accent">{t("auth.register.signIn")}</A></>}>
            <form onSubmit={submit} class="space-y-4" noValidate>
                <Show when={error()}><Alert tone="danger">{error()}</Alert></Show>
                <div class="grid gap-4 sm:grid-cols-2">
                    <TextField label={t("auth.firstName")} autocomplete="given-name" value={form().name} error={errors().name}
                               onChange={update("name")}/>
                    <TextField label={t("auth.lastName")} autocomplete="family-name" value={form().lastName} error={errors().lastName}
                               onChange={update("lastName")}/>
                </div>
                <TextField label={t("auth.email")} type="email" autocomplete="email" value={form().email} error={errors().email}
                           onChange={update("email")}/>
                <TextField label={t("auth.password")} type="password" autocomplete="new-password" value={form().password}
                           error={errors().password} onChange={update("password")}
                           hint={form().password ? t("auth.register.strength", {label: strength().label}) : t("auth.passwordHint")}/>
                <Button type="submit" size="lg" loading={loading()} class="w-full">{t("auth.register.title")}</Button>
                <p class="text-center text-xs text-muted">
                    {t("auth.register.privacy")}
                </p>
            </form>
        </AuthCard>
    );
}
