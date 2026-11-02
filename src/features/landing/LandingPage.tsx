import {A} from "@solidjs/router";
import {
    ArrowRight,
    Bot,
    BrainCircuit,
    Download,
    FileDown,
    Gauge,
    Radio,
    ShieldCheck,
    Smartphone,
    Sprout,
    Wifi,
} from "lucide-solid";
import {For, Show} from "solid-js";
import {LogoMark} from "../../components/brand/Logo";
import {usePageMeta} from "../../hooks/usePageMeta";
import {CROP_TYPES} from "../../lib/catalog";
import {t, type TranslationKey} from "../../lib/i18n";
import {useInstallPrompt} from "../pwa/pwa";
import {FAQ} from "./faq";

const FEATURES: { icon: typeof Radio; title: TranslationKey; text: TranslationKey }[] = [
    {icon: Radio, title: "landing.feature1", text: "landing.feature1Body"},
    {icon: BrainCircuit, title: "landing.feature2", text: "landing.feature2Body"},
    {icon: Bot, title: "landing.feature3", text: "landing.feature3Body"},
    {icon: Gauge, title: "landing.feature4", text: "landing.feature4Body"},
    {icon: FileDown, title: "landing.feature5", text: "landing.feature5Body"},
    {icon: ShieldCheck, title: "landing.feature6", text: "landing.feature6Body"},
];

const STEPS: { title: TranslationKey; text: TranslationKey }[] = [
    {title: "landing.step1", text: "landing.step1Body"},
    {title: "landing.step2", text: "landing.step2Body"},
    {title: "landing.step3", text: "landing.step3Body"},
];

const AI_TECHNIQUES: [TranslationKey, TranslationKey][] = [
    ["landing.ai1", "landing.ai1Body"],
    ["landing.ai2", "landing.ai2Body"],
    ["landing.ai3", "landing.ai3Body"],
    ["landing.ai4", "landing.ai4Body"],
];

export function LandingPage() {
    usePageMeta("", {index: true, description: () => t("landing.description")});
    const installPrompt = useInstallPrompt();

    return (
        <>
            <section class="relative overflow-hidden bg-leaf-950 text-white">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(0,176,116,0.35),transparent_55%)]"/>
                <div class="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
                    <div>
                        <p class="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold
              text-leaf-300">
                            <Sprout size={14}/> {t("landing.badge")}
                        </p>
                        <h1 class="mt-5 text-4xl font-bold leading-tight md:text-6xl">
                            {t("landing.heroTitle")}<span class="text-leaf-500">{t("landing.heroAccent")}</span>
                        </h1>
                        <p class="mt-5 max-w-xl text-lg text-leaf-100/85">
                            {t("landing.heroBody")}
                        </p>
                        <div class="mt-8 flex flex-wrap gap-3">
                            <A href="/register" class="inline-flex h-12 items-center gap-2 rounded-xl bg-leaf-500 px-6 font-semibold
                text-leaf-950 hover:bg-leaf-300">
                                {t("landing.ctaCreate")} <ArrowRight size={18}/>
                            </A>
                            <A href="/login" class="inline-flex h-12 items-center rounded-xl border border-white/25 px-6 font-semibold
                hover:bg-white/10">
                                {t("landing.ctaHaveAccount")}
                            </A>
                        </div>
                    </div>
                    <div class="mx-auto w-full max-w-sm">
                        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div class="flex items-center gap-3">
                                <LogoMark size={44}/>
                                <div>
                                    <p class="font-display text-lg font-semibold">{t("landing.demoName")}</p>
                                    <p class="text-sm text-leaf-300">{t("landing.demoStatus")}</p>
                                </div>
                            </div>
                            <div class="mt-6 grid grid-cols-2 gap-3 text-sm">
                                <For each={[[t("landing.demoTemperature"), t("landing.demoTemperatureValue")], [t("landing.demoSubstrate"), "68 %"], ["pH", t("landing.demoPhValue")], [t("landing.demoNutrients"), "712 ppm"]] as const}>
                                    {([k, v]) => (
                                        <div class="rounded-2xl bg-white/5 p-3">
                                            <p class="text-leaf-300/80">{k}</p>
                                            <p class="mt-1 text-lg font-semibold">{v}</p>
                                        </div>
                                    )}
                                </For>
                            </div>
                            <div class="mt-4 rounded-2xl bg-leaf-500/15 p-3 text-sm">
                                <p class="font-semibold text-leaf-300">{t("landing.demoHealth")}</p>
                                <p class="mt-1 text-leaf-100/80">{t("landing.demoHealthBody")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="funciones" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
                <h2 class="text-3xl font-bold md:text-4xl">{t("landing.featuresTitle")}</h2>
                <p class="mt-3 max-w-2xl text-muted">{t("landing.featuresBody")}</p>
                <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <For each={FEATURES}>
                        {({icon: Icon, title, text}) => (
                            <article class="card p-6">
                                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-50 text-accent">
                                    <Icon size={22}/>
                                </div>
                                <h3 class="mt-4 text-lg font-semibold">{t(title)}</h3>
                                <p class="mt-2 text-sm leading-relaxed text-muted">{t(text)}</p>
                            </article>
                        )}
                    </For>
                </div>
            </section>

            <section id="como-funciona" class="scroll-mt-20 bg-surface">
                <div class="mx-auto max-w-6xl px-4 py-16 md:py-20">
                    <h2 class="text-3xl font-bold md:text-4xl">{t("landing.howTitle")}</h2>
                    <ol class="mt-10 grid gap-5 md:grid-cols-3">
                        <For each={STEPS}>
                            {(step, index) => (
                                <li class="card p-6">
                                    <span class="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-700 font-display font-bold text-white">
                                        {index() + 1}
                                    </span>
                                    <h3 class="mt-4 text-lg font-semibold">{t(step.title)}</h3>
                                    <p class="mt-2 text-sm text-muted">{t(step.text)}</p>
                                </li>
                            )}
                        </For>
                    </ol>
                </div>
            </section>

            <section id="ia" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20">
                <div class="grid gap-10 md:grid-cols-2 md:items-center">
                    <div>
                        <h2 class="text-3xl font-bold md:text-4xl">{t("landing.aiTitle")}</h2>
                        <p class="mt-4 text-muted">
                            {t("landing.aiBody")}
                        </p>
                    </div>
                    <dl class="grid gap-4">
                        <For each={AI_TECHNIQUES}>
                            {([term, detail]) => (
                                <div class="card p-5">
                                    <dt class="font-semibold text-accent-strong">{t(term)}</dt>
                                    <dd class="mt-1 text-sm text-muted">{t(detail)}</dd>
                                </div>
                            )}
                        </For>
                    </dl>
                </div>
            </section>

            <section class="bg-surface">
                <div class="mx-auto max-w-6xl px-4 py-16">
                    <h2 class="text-3xl font-bold">{t("landing.speciesTitle")}</h2>
                    <ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <For each={Object.entries(CROP_TYPES)}>
                            {([, crop]) => (
                                <li class="card flex items-start gap-3 p-5">
                                    <Sprout class="mt-0.5 shrink-0 text-leaf-600" size={20}/>
                                    <div>
                                        <p class="font-semibold">{crop.label}</p>
                                        <p class="text-sm text-muted">{crop.hint}</p>
                                    </div>
                                </li>
                            )}
                        </For>
                    </ul>
                </div>
            </section>

            <section class="mx-auto max-w-6xl px-4 py-16">
                <div class="card flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
                    <div class="flex items-start gap-4">
                        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-water-100 text-link">
                            <Smartphone size={24}/>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold">{t("landing.installTitle")}</h2>
                            <p class="mt-1 text-muted">
                                {t("landing.installBody")}
                            </p>
                            <Show when={installPrompt.iosHint}>
                                <p class="mt-2 text-sm text-accent-strong">{t("landing.iosHint")}</p>
                            </Show>
                        </div>
                    </div>
                    <Show when={installPrompt.available} fallback={
                        <span class="inline-flex items-center gap-2 text-sm font-semibold text-accent-strong">
                            <Wifi size={18}/> {t("landing.offline")}
                        </span>
                    }>
                        <button type="button" onClick={() => void installPrompt.install()} class="inline-flex h-11 items-center gap-2 rounded-xl
              bg-leaf-700 px-5 font-semibold text-white hover:bg-leaf-800">
                            <Download size={18}/> {t("landing.install")}
                        </button>
                    </Show>
                </div>
            </section>

            <section id="preguntas" class="scroll-mt-20 bg-surface">
                <div class="mx-auto max-w-3xl px-4 py-16 md:py-20">
                    <h2 class="text-3xl font-bold md:text-4xl">{t("landing.faqTitle")}</h2>
                    <div class="mt-8 space-y-3">
                        <For each={FAQ}>
                            {(item) => (
                                <details class="card group">
                                    <summary class="block cursor-pointer list-none p-5 font-semibold marker:hidden">
                                        <span class="flex items-center justify-between gap-4">
                                            {t(item.question)}
                                            <ArrowRight size={18}
                                                        class="shrink-0 text-leaf-600 transition-transform group-open:rotate-90"/>
                                        </span>
                                    </summary>
                                    <p class="-mt-2 px-5 pb-5 text-sm leading-relaxed text-muted">{t(item.answer)}</p>
                                </details>
                            )}
                        </For>
                    </div>
                </div>
            </section>

            <section class="bg-leaf-900 text-white">
                <div class="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center">
                    <h2 class="text-3xl font-bold">{t("landing.finalTitle")}</h2>
                    <p class="mt-3 max-w-xl text-leaf-100/80">{t("landing.finalBody")}</p>
                    <A href="/register" class="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-leaf-500 px-6 font-semibold
            text-leaf-950 hover:bg-leaf-300">
                        {t("landing.ctaCreate")} <ArrowRight size={18}/>
                    </A>
                </div>
            </section>
        </>
    );
}
