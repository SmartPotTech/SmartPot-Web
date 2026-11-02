import {A} from "@solidjs/router";
import {LogoMark} from "../components/brand/Logo";
import {usePageMeta} from "../hooks/usePageMeta";
import {t} from "../lib/i18n";

export function NotFoundPage() {
    usePageMeta(() => t("notFound.title"));
    return (
        <div class="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
            <LogoMark size={64}/>
            <h1 class="mt-6 text-3xl font-bold">{t("notFound.heading")}</h1>
            <p class="mt-2 text-muted">{t("notFound.body")}</p>
            <A href="/" class="mt-6 rounded-xl bg-leaf-700 px-5 py-3 font-semibold text-white hover:bg-leaf-800">{t("notFound.home")}</A>
        </div>
    );
}
