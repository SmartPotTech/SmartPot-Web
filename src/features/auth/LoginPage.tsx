import {type FormEvent, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router";
import {Button} from "../../components/ui/Button";
import {TextField} from "../../components/ui/Field";
import {Alert} from "../../components/ui/Feedback";
import {usePageMeta} from "../../hooks/usePageMeta";
import {ApiError} from "../../lib/api/client";
import {authApi} from "../../lib/api/services";
import {useAuth} from "./AuthContext";
import {AuthCard} from "./AuthCard";
import {validateEmail} from "./validation";

export function LoginPage() {
    usePageMeta("Ingresar", {index: true, description: "Ingresa a SmartPot para ver y controlar tus cultivos."});
    const {signIn, notice, clearNotice} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string>();
    const [loading, setLoading] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        clearNotice();
        const invalid = validateEmail(email);
        setEmailError(invalid);
        if (invalid || !password) {
            setError(invalid ? null : "Escribe tu contraseña");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            signIn(await authApi.login(email.trim(), password), remember);
            const from = (location.state as { from?: string } | null)?.from;
            navigate(from && from.startsWith("/app") ? from : "/app", {replace: true});
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : "No pudimos iniciar sesión");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard title="Ingresa a SmartPot" subtitle="Monitorea y cuida tus cultivos desde cualquier lugar."
                  footer={<>¿No tienes cuenta? <Link to="/register" className="font-semibold text-leaf-700">Créala
                      gratis</Link></>}>
            <form onSubmit={submit} className="space-y-4" noValidate>
                {notice && <Alert tone="warning">{notice}</Alert>}
                {error && <Alert tone="danger">{error}</Alert>}
                <TextField label="Correo" type="email" autoComplete="email" value={email} error={emailError}
                           onChange={(event) => setEmail(event.target.value)}/>
                <TextField label="Contraseña" type="password" autoComplete="current-password" value={password}
                           onChange={(event) => setPassword(event.target.value)}/>
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-muted">
                        <input type="checkbox" checked={remember}
                               onChange={(event) => setRemember(event.target.checked)}
                               className="h-4 w-4 accent-leaf-700"/>
                        Mantener sesión iniciada
                    </label>
                    <Link to="/forgot-password" className="font-semibold text-leaf-700">¿Olvidaste tu contraseña?</Link>
                </div>
                <Button type="submit" size="lg" loading={loading} className="w-full">Ingresar</Button>
            </form>
        </AuthCard>
    );
}
