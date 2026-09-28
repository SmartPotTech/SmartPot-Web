import {type FormEvent, useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router";
import {Button} from "../../components/ui/Button";
import {TextField} from "../../components/ui/Field";
import {Alert} from "../../components/ui/Feedback";
import {usePageMeta} from "../../hooks/usePageMeta";
import {ApiError} from "../../lib/api/client";
import {authApi} from "../../lib/api/services";
import {AuthCard} from "./AuthCard";
import {validateEmail, validatePassword} from "./validation";

export function ForgotPasswordPage() {
    usePageMeta("Recuperar contraseña");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string>();
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        const invalid = validateEmail(email);
        setEmailError(invalid);
        if (invalid) return;
        setLoading(true);
        setError(null);
        try {
            await authApi.forgotPassword(email.trim());
            setSent(true);
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : "No pudimos enviar el correo");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard title="Recupera tu contraseña" subtitle="Te enviaremos un enlace para crear una nueva."
                  footer={<Link to="/login" className="font-semibold text-leaf-700">Volver a ingresar</Link>}>
            {sent ? (
                <Alert tone="success" title="Revisa tu correo">
                    Si hay una cuenta con ese correo, recibirás un enlace válido por 30 minutos.
                </Alert>
            ) : (
                <form onSubmit={submit} className="space-y-4" noValidate>
                    {error && <Alert tone="danger">{error}</Alert>}
                    <TextField label="Correo" type="email" autoComplete="email" value={email} error={emailError}
                               onChange={(event) => setEmail(event.target.value)}/>
                    <Button type="submit" size="lg" loading={loading} className="w-full">Enviar enlace</Button>
                </form>
            )}
        </AuthCard>
    );
}

export function ResetPasswordPage() {
    usePageMeta("Nueva contraseña");
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token") ?? "";
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
    const [error, setError] = useState<string | null>(token ? null : "El enlace de recuperación no es válido.");
    const [loading, setLoading] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        const found = {
            password: validatePassword(password),
            confirm: password === confirm ? undefined : "Las contraseñas no coinciden",
        };
        setErrors(found);
        if (found.password || found.confirm || !token) return;
        setLoading(true);
        setError(null);
        try {
            await authApi.resetPassword(token, password);
            navigate("/login", {replace: true});
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : "No pudimos cambiar la contraseña");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard title="Crea una nueva contraseña"
                  footer={<Link to="/forgot-password" className="font-semibold text-leaf-700">Pedir otro enlace</Link>}>
            <form onSubmit={submit} className="space-y-4" noValidate>
                {error && <Alert tone="danger">{error}</Alert>}
                <TextField label="Nueva contraseña" type="password" autoComplete="new-password" value={password}
                           error={errors.password} onChange={(event) => setPassword(event.target.value)}/>
                <TextField label="Repite la contraseña" type="password" autoComplete="new-password" value={confirm}
                           error={errors.confirm} onChange={(event) => setConfirm(event.target.value)}/>
                <Button type="submit" size="lg" loading={loading} disabled={!token} className="w-full">Guardar
                    contraseña</Button>
            </form>
        </AuthCard>
    );
}
