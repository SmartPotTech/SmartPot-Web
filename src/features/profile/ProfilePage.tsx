import {KeyRound, LogOut, Save, Trash2} from "lucide-solid";
import {createSignal, Show} from "solid-js";
import {Button} from "../../components/ui/Button";
import {Dialog} from "../../components/ui/Dialog";
import {PreferenceSelectors} from "../../components/ui/PreferenceControls";
import {TextField} from "../../components/ui/Field";
import {Alert} from "../../components/ui/Feedback";
import {usePageMeta} from "../../hooks/usePageMeta";
import {ApiError} from "../../lib/api/client";
import {userApi} from "../../lib/api/services";
import {formatDateTime} from "../../lib/format";
import {t} from "../../lib/i18n";
import {useAuth} from "../auth/AuthContext";
import {validateName, validatePassword} from "../auth/validation";
import {McpConnections} from "./McpConnections";
import {NotificationChannels} from "./NotificationChannels";

type Message = { tone: "success" | "danger"; text: string } | null;

export function ProfilePage() {
    usePageMeta(() => t("profile.title"));
    const auth = useAuth();
    const [name, setName] = createSignal(auth.user?.name ?? "");
    const [lastName, setLastName] = createSignal(auth.user?.lastName ?? "");
    const [profileMessage, setProfileMessage] = createSignal<Message>(null);
    const [current, setCurrent] = createSignal("");
    const [next, setNext] = createSignal("");
    const [passwordMessage, setPasswordMessage] = createSignal<Message>(null);
    const [busy, setBusy] = createSignal<string | null>(null);
    const [confirmDelete, setConfirmDelete] = createSignal(false);

    async function saveProfile(event: SubmitEvent) {
        event.preventDefault();
        const invalid = validateName(name(), t("auth.firstNameNoun"), 40) ?? validateName(lastName(), t("auth.lastNameNoun"), 60);
        if (invalid) {
            setProfileMessage({tone: "danger", text: invalid});
            return;
        }
        setBusy("profile");
        try {
            auth.updateUser(await userApi.update({name: name().trim(), lastName: lastName().trim()}));
            setProfileMessage({tone: "success", text: t("profile.updated")});
        } catch (caught) {
            setProfileMessage({
                tone: "danger",
                text: caught instanceof ApiError ? caught.message : t("profile.saveFailed"),
            });
        } finally {
            setBusy(null);
        }
    }

    async function changePassword(event: SubmitEvent) {
        event.preventDefault();
        const invalid = validatePassword(next());
        if (!current() || invalid) {
            setPasswordMessage({tone: "danger", text: invalid ?? t("profile.currentRequired")});
            return;
        }
        setBusy("password");
        try {
            await userApi.changePassword(current(), next());
            setCurrent("");
            setNext("");
            setPasswordMessage({tone: "success", text: t("profile.passwordUpdated")});
        } catch (caught) {
            setPasswordMessage({
                tone: "danger",
                text: caught instanceof ApiError ? caught.message : t("profile.changeFailed"),
            });
        } finally {
            setBusy(null);
        }
    }

    async function deleteAccount() {
        setBusy("delete");
        try {
            await userApi.remove();
            auth.signOut("auth.accountDeleted");
        } catch {
            setBusy(null);
            setConfirmDelete(false);
        }
    }

    return (
        <div class="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 class="text-3xl font-bold">{t("profile.title")}</h1>
                <p class="text-sm text-muted">{t("profile.memberSince", {email: auth.user?.email ?? "", date: formatDateTime(auth.user?.createdAt)})}</p>
            </div>

            <form onSubmit={saveProfile} class="card space-y-4 p-5" noValidate>
                <h2 class="text-lg font-semibold">{t("profile.personalData")}</h2>
                <Show when={profileMessage()}>
                    {(msg) => <Alert tone={msg().tone}>{msg().text}</Alert>}
                </Show>
                <div class="grid gap-4 sm:grid-cols-2">
                    <TextField label={t("auth.firstName")} value={name()}
                               onChange={(event) => setName(event.currentTarget.value)}/>
                    <TextField label={t("auth.lastName")} value={lastName()}
                               onChange={(event) => setLastName(event.currentTarget.value)}/>
                </div>
                <Button type="submit" icon={<Save size={16}/>} loading={busy() === "profile"}>{t("common.save")}</Button>
            </form>

            <section class="card space-y-4 p-5" aria-labelledby="preferences-title">
                <div>
                    <h2 id="preferences-title" class="text-lg font-semibold">{t("profile.preferences")}</h2>
                    <p class="text-sm text-muted">{t("profile.preferencesHint")}</p>
                </div>
                <PreferenceSelectors/>
            </section>

            <NotificationChannels/>

            <McpConnections/>

            <form onSubmit={changePassword} class="card space-y-4 p-5" noValidate>
                <h2 class="text-lg font-semibold">{t("profile.changePassword")}</h2>
                <Show when={passwordMessage()}>
                    {(msg) => <Alert tone={msg().tone}>{msg().text}</Alert>}
                </Show>
                <TextField label={t("profile.currentPassword")} type="password" autocomplete="current-password" value={current()}
                           onChange={(event) => setCurrent(event.currentTarget.value)}/>
                <TextField label={t("profile.newPassword")} type="password" autocomplete="new-password" value={next()}
                           hint={t("auth.passwordHint")}
                           onChange={(event) => setNext(event.currentTarget.value)}/>
                <Button type="submit" icon={<KeyRound size={16}/>} loading={busy() === "password"}>{t("profile.changePassword")}</Button>
            </form>

            <section class="card flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                    <h2 class="text-lg font-semibold">{t("profile.session")}</h2>
                    <p class="text-sm text-muted">{t("profile.sessionHint")}</p>
                </div>
                <Button variant="secondary" icon={<LogOut size={16}/>} onClick={() => auth.signOut()}>{t("nav.signOut")}</Button>
            </section>

            <section class="card border-danger-500/30 p-5">
                <h2 class="text-lg font-semibold text-danger-fg">{t("profile.deleteAccount")}</h2>
                <p class="mt-1 text-sm text-muted">{t("profile.deleteHint")}</p>
                <Button variant="danger" class="mt-4" icon={<Trash2 size={16}/>}
                        onClick={() => setConfirmDelete(true)}>
                    {t("profile.deleteMine")}
                </Button>
            </section>

            <Dialog open={confirmDelete()} title={t("profile.deleteTitle")} onClose={() => setConfirmDelete(false)}
                    footer={<>
                        <Button variant="secondary" onClick={() => setConfirmDelete(false)}>{t("common.cancel")}</Button>
                        <Button variant="danger" loading={busy() === "delete"} onClick={() => void deleteAccount()}>{t("profile.deleteConfirm")}</Button>
                    </>}>
                <p class="text-sm text-muted">{t("profile.deleteBody")}</p>
            </Dialog>
        </div>
    );
}
