import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/Field";
import { Alert } from "../../components/ui/Feedback";
import { usePageMeta } from "../../hooks/usePageMeta";
import { ApiError } from "../../lib/api/client";
import { authApi } from "../../lib/api/services";
import { useAuth } from "./AuthContext";
import { AuthCard } from "./AuthCard";
import { passwordStrength, validateEmail, validateName, validatePassword } from "./validation";

type Fields = "name" | "lastName" | "email" | "password";

export function RegisterPage() {
  usePageMeta("Crear cuenta", { index: true, description: "Crea tu cuenta gratis de SmartPot y conecta tu primera maceta." });
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<Fields, string>>({ name: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(form.password);

  const update = (field: Fields) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = {
      name: validateName(form.name, "nombre", 40),
      lastName: validateName(form.lastName, "apellido", 60),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setLoading(true);
    setError(null);
    try {
      signIn(await authApi.register({ ...form, email: form.email.trim() }), true);
      navigate("/app", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setErrors(caught.fields as Partial<Record<Fields, string>>);
      } else {
        setError("No pudimos crear tu cuenta");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Crea tu cuenta" subtitle="Gratis y en menos de un minuto."
      footer={<>¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-leaf-700">Ingresa</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nombre" autoComplete="given-name" value={form.name} error={errors.name} onChange={update("name")} />
          <TextField label="Apellido" autoComplete="family-name" value={form.lastName} error={errors.lastName}
            onChange={update("lastName")} />
        </div>
        <TextField label="Correo" type="email" autoComplete="email" value={form.email} error={errors.email}
          onChange={update("email")} />
        <TextField label="Contraseña" type="password" autoComplete="new-password" value={form.password}
          error={errors.password} onChange={update("password")}
          hint={form.password ? `Seguridad: ${strength.label}` : "Mínimo 8 caracteres con mayúscula, minúscula y número"} />
        <Button type="submit" size="lg" loading={loading} className="w-full">Crear cuenta</Button>
        <p className="text-center text-xs text-muted">
          Tus datos solo se usan para tu cuenta y tus cultivos. Puedes eliminarlos cuando quieras desde tu perfil.
        </p>
      </form>
    </AuthCard>
  );
}
