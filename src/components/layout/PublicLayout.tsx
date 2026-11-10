import {A, useLocation} from "@solidjs/router";
import {createSignal, type JSX, Show, Suspense} from "solid-js";
import {useAuth} from "../../features/auth/AuthContext";
import {t} from "../../lib/i18n";
import {Logo} from "../brand/Logo";
import {PreferenceToggles} from "../ui/PreferenceControls";
import {PrivacySecurityModal} from "./PrivacySecurityModal";
import {SkipLink} from "./SkipLink";

const SECTIONS = [
    {href: "/#como-funciona", label: "public.howItWorks"},
    {href: "/#especies", label: "public.species"},
    {href: "/#preguntas", label: "public.faq"},
] as const;

export function PublicLayout(props: { children?: JSX.Element }) {
    const auth = useAuth();
    const location = useLocation();
    const [showLegal, setShowLegal] = createSignal(false);
    // En la landing la barra toma el verde profundo del hero para que la primera pantalla sea un solo campo de color;
    // en el ingreso y el registro va sobre la superficie clara. Nunca vidrio esmerilado.
    const dark = () => location.pathname === "/";

    return (
        <div class="flex min-h-dvh flex-col">
            <SkipLink/>
            <header class={`sticky top-0 z-30 ${dark() ? "bg-leaf-950 text-white" : "bg-card"}`}>
                <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4 md:px-6" aria-label={t("nav.main")}>
                    <A href="/" aria-label={t("nav.homeLabel")}><Logo size={32} inverse={dark()}/></A>
                    <div class="flex min-w-0 items-center gap-0 text-sm font-semibold sm:gap-1">
                        {SECTIONS.map((item) => (
                            <a href={item.href}
                               class={`hidden rounded-lg px-3 py-2 transition-colors lg:block ${dark() ? "text-leaf-100 hover:text-white" : "text-muted hover:text-ink"}`}>
                                {t(item.label)}
                            </a>
                        ))}
                        <PreferenceToggles surface={dark() ? "dark" : undefined}/>
                        <Show when={auth.authenticated} fallback={
                            <>
                                <A href="/login"
                                   class={`touch-target rounded-xl px-2 py-2 transition-colors max-[380px]:hidden sm:px-3 ${dark() ? "text-white hover:bg-leaf-900" : "text-accent-strong hover:bg-leaf-50"}`}>
                                    {t("public.signIn")}
                                </A>
                                <A href="/register"
                                   class={`touch-target rounded-xl px-3 py-2 transition-colors sm:px-4 ${dark() ? "bg-white text-leaf-950 hover:bg-leaf-100" : "bg-leaf-700 text-white hover:bg-leaf-800"}`}>
                                    {t("public.signUp")}
                                </A>
                            </>
                        }>
                            <A href="/app" class="touch-target rounded-xl bg-leaf-700 px-4 py-2 text-white transition-colors hover:bg-leaf-800">
                                {t("public.goToDashboard")}
                            </A>
                        </Show>
                    </div>
                </nav>
            </header>
            <main id="main" tabindex="-1" class="flex-1">
                {/* El ingreso y el registro llegan en trozos aparte: el cromo público se queda mientras bajan. */}
                <Suspense fallback={<div class="min-h-[60dvh]"/>}>{props.children}</Suspense>
            </main>
            {/* Un cierre de una sola línea: qué es, a dónde ir y la licencia. */}
            <footer class="bg-surface">
                <div class="mx-auto grid max-w-6xl gap-2 px-4 py-8 text-sm md:grid-cols-[1fr_auto_1fr] md:items-center md:px-6">
                    <p class="text-muted"><span translate="no" class="font-semibold text-ink">SmartPot</span> · {t("public.footerTagline")}</p>
                    <p class="flex flex-wrap gap-x-6 gap-y-1">
                        <a href="https://github.com/SmartPotTech" target="_blank" rel="noopener noreferrer"
                           class="inline-block py-1 font-medium hover:text-accent-strong">{t("public.github")}</a>
                        <button type="button" onClick={() => setShowLegal(true)}
                                class="inline-block py-1 font-medium hover:text-accent-strong text-left">
                            {t("legal.openModal")}
                        </button>
                        <A href="/login" class="inline-block py-1 font-medium hover:text-accent-strong">{t("public.signIn")}</A>
                        <A href="/register" class="inline-block py-1 font-medium hover:text-accent-strong">{t("public.signUp")}</A>
                    </p>
                    <p class="text-muted md:text-right">© {new Date().getFullYear()} SmartPot Tech · {t("public.licence")}</p>
                </div>
            </footer>
            <PrivacySecurityModal open={showLegal()} onClose={() => setShowLegal(false)}/>
        </div>
    );
}
