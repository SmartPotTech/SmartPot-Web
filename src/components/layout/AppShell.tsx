import {A, useLocation} from "@solidjs/router";
import {
    Bell,
    Download,
    GraduationCap,
    LayoutDashboard,
    ListChecks,
    LogOut,
    SlidersHorizontal,
    Sprout,
    UserRound,
    WifiOff,
} from "lucide-solid";
import {For, type JSX, Show} from "solid-js";
import {useAuth} from "../../features/auth/AuthContext";
import {useInstallPrompt} from "../../features/pwa/pwa";
import {useOnlineStatus} from "../../hooks/useOnlineStatus";
import {useResource} from "../../hooks/useResource";
import {notificationApi} from "../../lib/api/services";
import {t, type TranslationKey} from "../../lib/i18n";
import {Logo} from "../brand/Logo";
import {PreferenceToggles} from "../ui/PreferenceControls";

const NAV: { to: string; label: TranslationKey; icon: typeof Bell; end: boolean; mobile: boolean }[] = [
    {to: "/app", label: "nav.dashboard", icon: LayoutDashboard, end: true, mobile: true},
    {to: "/app/crops", label: "nav.crops", icon: Sprout, end: false, mobile: true},
    {to: "/app/control", label: "nav.control", icon: SlidersHorizontal, end: false, mobile: true},
    {to: "/app/actions", label: "nav.actions", icon: ListChecks, end: false, mobile: true},
    {to: "/app/learning", label: "nav.learning", icon: GraduationCap, end: false, mobile: false},
    {to: "/app/notifications", label: "nav.alerts", icon: Bell, end: false, mobile: true},
];
// La barra inferior del móvil tiene cinco lugares; Aprendizaje se abre desde el asistente de cada cultivo.
const MOBILE_NAV = NAV.filter((item) => item.mobile);

function initials(name?: string, lastName?: string): string {
    return `${name?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "SP";
}

export function AppShell(props: { children?: JSX.Element }) {
    const auth = useAuth();
    const location = useLocation();
    const online = useOnlineStatus();
    const installPrompt = useInstallPrompt();
    const unread = useResource(() => notificationApi.unreadCount(), [], 60_000);
    const count = () => unread.data?.unread ?? 0;

    const isActive = (to: string, end?: boolean) =>
        end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(`${to}/`);

    return (
        <div class="min-h-dvh md:grid md:grid-cols-[16rem_1fr]">
            <aside class="sticky top-0 hidden h-dvh flex-col bg-leaf-900 px-4 py-5 text-leaf-100 dark:bg-leaf-950 md:flex">
                <div aria-hidden="true"
                     class="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-leaf-950/80 to-transparent"/>
                <A href="/app" aria-label={t("nav.dashboardLabel")} class="relative px-1"><Logo size={34} inverse/></A>
                <nav class="relative mt-9 flex flex-1 flex-col gap-1" aria-label={t("nav.app")}>
                    <For each={NAV}>
                        {({to, label, icon: Icon, end}) => (
                            <A href={to} end={end}
                               class={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors
                ${isActive(to, end) ? "bg-leaf-700 text-white shadow-[inset_3px_0_0_var(--color-leaf-300)]"
                                   : "text-leaf-100/80 hover:bg-leaf-800 hover:text-white"}`}>
                                <Icon size={18}/>
                                {t(label)}
                                <Show when={to === "/app/notifications" && count() > 0}>
                                    <span class="ml-auto rounded-full bg-sun-500 px-2 text-xs font-bold text-leaf-950">
                                        {count()}
                                    </span>
                                </Show>
                            </A>
                        )}
                    </For>
                </nav>
                <Show when={installPrompt.available}>
                    <button type="button" onClick={() => void installPrompt.install()}
                            class="relative mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-leaf-300 hover:bg-leaf-800">
                        <Download size={18}/> {t("nav.installApp")}
                    </button>
                </Show>
                <div class="relative border-t border-leaf-800 pt-4">
                    <A href="/app/profile" class={`flex items-center gap-3 rounded-xl p-2 transition-colors
            ${isActive("/app/profile") ? "bg-leaf-800" : "hover:bg-leaf-800"}`}>
                        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-500 text-sm font-bold text-leaf-950">
                            {initials(auth.user?.name, auth.user?.lastName)}
                        </span>
                        <span class="min-w-0">
                            <span class="block truncate text-sm font-semibold text-white">{auth.user?.name} {auth.user?.lastName}</span>
                            <span class="block truncate text-xs text-leaf-300">{auth.user?.email}</span>
                        </span>
                    </A>
                    <div class="mt-2 flex min-w-0 items-center justify-between gap-1">
                        <button type="button" onClick={() => auth.signOut()}
                                class="touch-target flex min-w-0 items-center gap-2 px-2 py-2 text-sm font-semibold text-leaf-300 hover:text-white">
                            <LogOut size={16} class="shrink-0"/> <span class="truncate">{t("nav.signOut")}</span>
                        </button>
                        <PreferenceToggles surface="dark"/>
                    </div>
                </div>
            </aside>

            <div class="flex min-h-dvh min-w-0 flex-col bg-linear-to-b from-leaf-50 to-page to-40% pb-20 md:pb-0">
                <header class="sticky top-0 z-20 flex h-14 items-center justify-between bg-leaf-900 px-4 text-white md:hidden">
                    <A href="/app" aria-label={t("nav.dashboardLabel")}><Logo size={28} inverse/></A>
                    <div class="flex min-w-0 items-center">
                        <PreferenceToggles surface="dark"/>
                        <Show when={installPrompt.available}>
                            <button type="button" onClick={() => void installPrompt.install()} aria-label={t("nav.installApp")}
                                    class="touch-target rounded-lg p-2 text-leaf-300 hover:bg-leaf-800"><Download size={20}/>
                            </button>
                        </Show>
                        <A href="/app/profile" aria-label={t("nav.myProfile")}
                           class="touch-target rounded-lg p-2 text-leaf-100 hover:bg-leaf-800">
                            <UserRound size={20}/>
                        </A>
                    </div>
                </header>
                <Show when={!online()}>
                    <div class="flex items-center justify-center gap-2 bg-sun-100 px-4 py-2 text-sm font-medium text-sun-fg">
                        <WifiOff size={16}/> {t("shell.offline")}
                    </div>
                </Show>
                <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">
                    {props.children}
                </main>
            </div>

            <nav class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 bg-leaf-900 pb-[env(safe-area-inset-bottom)] md:hidden"
                 aria-label={t("nav.app")}>
                <For each={MOBILE_NAV}>
                    {({to, label, icon: Icon, end}) => (
                        <A href={to} end={end}
                           class={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold
              ${isActive(to, end) ? "text-white" : "text-leaf-300/80"}`}>
                            <span class={`flex h-7 w-12 items-center justify-center rounded-full transition-colors
                  ${isActive(to, end) ? "bg-leaf-700" : ""}`}>
                                <Icon size={19}/>
                            </span>
                            {t(label)}
                            <Show when={to === "/app/notifications" && count() > 0}>
                                <span class="absolute right-[26%] top-1.5 h-2.5 w-2.5 rounded-full bg-sun-500 ring-2 ring-leaf-900"/>
                            </Show>
                        </A>
                    )}
                </For>
            </nav>
        </div>
    );
}
