import {A} from "@solidjs/router";
import {GitFork} from "lucide-solid";
import {type JSX, Show, Suspense} from "solid-js";
import {useAuth} from "../../features/auth/AuthContext";
import {t} from "../../lib/i18n";
import {Logo} from "../brand/Logo";
import {PreferenceToggles} from "../ui/PreferenceControls";

export function PublicLayout(props: { children?: JSX.Element }) {
    const auth = useAuth();
    return (
        <div class="flex min-h-dvh flex-col">
            <a href="#main" class="skip-link">{t("nav.skipToContent")}</a>
            <header class="sticky top-0 z-30 border-b border-line/70 bg-card/85 backdrop-blur">
                <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-4" aria-label={t("nav.main")}>
                    <A href="/" aria-label={t("nav.homeLabel")}><Logo size={34}/></A>
                    <div class="flex min-w-0 items-center gap-0 text-sm font-semibold sm:gap-2">
                        <a href="/#funciones"
                           class="hidden rounded-lg px-3 py-2 text-muted hover:text-accent-strong md:block">{t("public.features")}</a>
                        <a href="/#ia" class="hidden rounded-lg px-3 py-2 text-muted hover:text-accent-strong md:block">{t("public.ai")}</a>
                        <a href="/#preguntas"
                           class="hidden rounded-lg px-3 py-2 text-muted hover:text-accent-strong md:block">{t("public.faq")}</a>
                        <PreferenceToggles/>
                        <Show when={auth.authenticated} fallback={
                            <>
                                <A href="/login"
                                   class="touch-target rounded-xl px-2 py-2 text-accent-strong hover:bg-leaf-50 max-[380px]:hidden sm:px-3">{t("public.signIn")}</A>
                                <A href="/register"
                                   class="touch-target rounded-xl bg-leaf-700 px-3 py-2 text-white hover:bg-leaf-800 sm:px-4">{t("public.signUp")}</A>
                            </>
                        }>
                            <A href="/app" class="touch-target rounded-xl bg-leaf-700 px-4 py-2 text-white hover:bg-leaf-800">{t("public.goToDashboard")}</A>
                        </Show>
                    </div>
                </nav>
            </header>
            <main id="main" tabindex="-1" class="flex-1">
                {/* El ingreso y el registro llegan en trozos aparte: el cromo público se queda mientras bajan. */}
                <Suspense fallback={<div class="min-h-[60dvh]"/>}>{props.children}</Suspense>
            </main>
            <footer class="border-t border-line bg-leaf-950 text-leaf-100">
                <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
                    <div>
                        <Logo size={30} inverse/>
                        <p class="mt-3 text-sm text-leaf-300/80">
                            {t("public.footerTagline")}
                        </p>
                    </div>
                    <div class="text-sm">
                        <p class="font-semibold text-white">{t("public.product")}</p>
                        <ul class="mt-1 space-y-0.5 text-leaf-300/80">
                            <li><a href="/#funciones" class="inline-block py-1 hover:text-white">{t("public.features")}</a></li>
                            <li><a href="/#como-funciona" class="inline-block py-1 hover:text-white">{t("public.howItWorks")}</a></li>
                            <li><A href="/register" class="inline-block py-1 hover:text-white">{t("public.signUp")}</A></li>
                        </ul>
                    </div>
                    <div class="text-sm">
                        <p class="font-semibold text-white">{t("public.openProject")}</p>
                        <a href="https://github.com/SmartPotTech" target="_blank" rel="noopener noreferrer"
                           class="mt-2 inline-flex items-center gap-2 text-leaf-300/80 hover:text-white">
                            <GitFork size={16}/> {t("public.github")}
                        </a>
                        <p class="mt-2 text-leaf-300/80">{t("public.licence")}</p>
                    </div>
                </div>
                <p class="border-t border-white/10 py-4 text-center text-xs text-leaf-300/80">
                    © {new Date().getFullYear()} SmartPot Tech
                </p>
            </footer>
        </div>
    );
}
