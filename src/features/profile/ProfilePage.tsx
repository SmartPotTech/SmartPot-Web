import { KeyRound, LogOut, Save, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { TextField } from "../../components/ui/Field";
import { Alert } from "../../components/ui/Feedback";
import { usePageMeta } from "../../hooks/usePageMeta";
import { ApiError } from "../../lib/api/client";
import { userApi } from "../../lib/api/services";
import { formatDateTime } from "../../lib/format";
import { useAuth } from "../auth/AuthContext";
import { validateName, validatePassword } from "../auth/validation";
import { NotificationChannels } from "./NotificationChannels";

type Message = { tone: "success" | "danger"; text: string } | null;

export function ProfilePage() {
  usePageMeta("Perfil");
  const { user, updateUser, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [profileMessage, setProfileMessage] = useState<Message>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    const invalid = validateName(name, "nombre", 40) ?? validateName(lastName, "apellido", 60);
    if (invalid) {
      setProfileMessage({ tone: "danger", text: invalid });
      return;
    }
    setBusy("profile");
    try {
      updateUser(await userApi.update({ name: name.trim(), lastName: lastName.trim() }));
      setProfileMessage({ tone: "success", text: "Perfil actualizado" });
    } catch (caught) {
      setProfileMessage({ tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo guardar" });
    } finally {
      setBusy(null);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    const invalid = validatePassword(next);
    if (!current || invalid) {
      setPasswordMessage({ tone: "danger", text: invalid ?? "Escribe tu contraseña actual" });
      return;
    }
    setBusy("password");
    try {
      await userApi.changePassword(current, next);
      setCurrent("");
      setNext("");
      setPasswordMessage({ tone: "success", text: "Contraseña actualizada" });
    } catch (caught) {
      setPasswordMessage({ tone: "danger", text: caught instanceof ApiError ? caught.message : "No se pudo cambiar" });
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount() {
    setBusy("delete");
    try {
      await userApi.remove();
      signOut("Tu cuenta y todos tus datos fueron eliminados.");
    } catch {
      setBusy(null);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-sm text-muted">{user?.email} · miembro desde {formatDateTime(user?.createdAt)}</p>
      </div>

      <form onSubmit={saveProfile} className="card space-y-4 p-5" noValidate>
        <h2 className="text-lg font-semibold">Datos personales</h2>
        {profileMessage && <Alert tone={profileMessage.tone}>{profileMessage.text}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nombre" value={name} onChange={(event) => setName(event.target.value)} />
          <TextField label="Apellido" value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </div>
        <Button type="submit" icon={<Save size={16} />} loading={busy === "profile"}>Guardar</Button>
      </form>

      <NotificationChannels />

      <form onSubmit={changePassword} className="card space-y-4 p-5" noValidate>
        <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
        {passwordMessage && <Alert tone={passwordMessage.tone}>{passwordMessage.text}</Alert>}
        <TextField label="Contraseña actual" type="password" autoComplete="current-password" value={current}
          onChange={(event) => setCurrent(event.target.value)} />
        <TextField label="Nueva contraseña" type="password" autoComplete="new-password" value={next}
          hint="Mínimo 8 caracteres con mayúscula, minúscula y número" onChange={(event) => setNext(event.target.value)} />
        <Button type="submit" icon={<KeyRound size={16} />} loading={busy === "password"}>Cambiar contraseña</Button>
      </form>

      <section className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-lg font-semibold">Sesión</h2>
          <p className="text-sm text-muted">Cierra la sesión en este dispositivo.</p>
        </div>
        <Button variant="secondary" icon={<LogOut size={16} />} onClick={() => signOut()}>Cerrar sesión</Button>
      </section>

      <section className="card border-danger-500/30 p-5">
        <h2 className="text-lg font-semibold text-danger-600">Eliminar cuenta</h2>
        <p className="mt-1 text-sm text-muted">Se borran tu cuenta, tus cultivos, sus lecturas y tus alertas. No se puede deshacer.</p>
        <Button variant="danger" className="mt-4" icon={<Trash2 size={16} />} onClick={() => setConfirmDelete(true)}>
          Eliminar mi cuenta
        </Button>
      </section>

      <Dialog open={confirmDelete} title="¿Eliminar tu cuenta?" onClose={() => setConfirmDelete(false)}
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
          <Button variant="danger" loading={busy === "delete"} onClick={() => void deleteAccount()}>Sí, eliminar todo</Button>
        </>}>
        <p className="text-sm text-muted">Tus cultivos quedarán desconectados y perderás todo el historial.</p>
      </Dialog>
    </div>
  );
}
