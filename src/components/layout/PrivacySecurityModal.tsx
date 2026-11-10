import {FileCode2, Lock, ShieldCheck} from "lucide-solid";
import {createSignal, Match, Switch} from "solid-js";
import {Button} from "../ui/Button";
import {Dialog} from "../ui/Dialog";
import {Badge} from "../ui/Feedback";
import {t} from "../../lib/i18n";

type Tab = "privacy" | "security" | "license";

interface PrivacySecurityModalProps {
    open: boolean;
    onClose: () => void;
}

export function PrivacySecurityModal(props: PrivacySecurityModalProps) {
    const [tab, setTab] = createSignal<Tab>("privacy");

    return (
        <Dialog
            open={props.open}
            title={t("legal.modalTitle")}
            onClose={props.onClose}
            wide
            footer={<Button onClick={props.onClose}>{t("legal.close")}</Button>}
        >
            <div class="space-y-4">
                <div class="flex border-b border-line gap-2 text-sm font-medium">
                    <button
                        type="button"
                        onClick={() => setTab("privacy")}
                        class={`flex items-center gap-1.5 border-b-2 px-3 py-2 transition-colors ${
                            tab() === "privacy"
                                ? "border-leaf-600 font-semibold text-accent"
                                : "border-transparent text-muted hover:text-ink"
                        }`}
                    >
                        <ShieldCheck size={16}/> {t("legal.tabPrivacy")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("security")}
                        class={`flex items-center gap-1.5 border-b-2 px-3 py-2 transition-colors ${
                            tab() === "security"
                                ? "border-leaf-600 font-semibold text-accent"
                                : "border-transparent text-muted hover:text-ink"
                        }`}
                    >
                        <Lock size={16}/> {t("legal.tabSecurity")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("license")}
                        class={`flex items-center gap-1.5 border-b-2 px-3 py-2 transition-colors ${
                            tab() === "license"
                                ? "border-leaf-600 font-semibold text-accent"
                                : "border-transparent text-muted hover:text-ink"
                        }`}
                    >
                        <FileCode2 size={16}/> {t("legal.tabLicense")}
                    </button>
                </div>

                <Switch>
                    <Match when={tab() === "privacy"}>
                        <div class="space-y-3 text-sm leading-relaxed text-muted">
                            <h3 class="text-base font-semibold text-ink">{t("legal.privacyTitle")}</h3>
                            <p>{t("legal.privacyBody1")}</p>
                            <p>{t("legal.privacyBody2")}</p>
                            <div class="rounded-xl border border-line bg-surface p-3 space-y-1.5">
                                <p class="text-xs font-semibold text-ink uppercase tracking-wide">
                                    TimescaleDB & PostgreSQL
                                </p>
                                <p class="text-xs">
                                    365-day retention policy · Continuous aggregates (1m/15m/1h) · Real-time views · RLS & least privilege role (smartpot_reader).
                                </p>
                            </div>
                        </div>
                    </Match>

                    <Match when={tab() === "security"}>
                        <div class="space-y-3 text-sm leading-relaxed text-muted">
                            <h3 class="text-base font-semibold text-ink">{t("legal.securityTitle")}</h3>
                            <ul class="space-y-2.5">
                                <li class="flex items-start gap-2">
                                    <Badge tone="success" class="mt-0.5 shrink-0">AES-GCM</Badge>
                                    <span>{t("legal.securityAes")}</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <Badge tone="info" class="mt-0.5 shrink-0">HttpOnly</Badge>
                                    <span>{t("legal.securityCookies")}</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <Badge tone="success" class="mt-0.5 shrink-0">TLS 8883</Badge>
                                    <span>{t("legal.securityMqtt")}</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <Badge tone="warning" class="mt-0.5 shrink-0">Ed25519</Badge>
                                    <span>{t("legal.securityEd25519")}</span>
                                </li>
                            </ul>
                        </div>
                    </Match>

                    <Match when={tab() === "license"}>
                        <div class="space-y-3 text-sm leading-relaxed text-muted">
                            <h3 class="text-base font-semibold text-ink">{t("legal.licenseTitle")}</h3>
                            <p>{t("legal.licenseBody")}</p>
                            <div class="rounded-xl border border-line bg-surface p-3 font-mono text-xs text-ink/80">
                                <p>MIT License · Copyright (c) SmartPot Tech</p>
                                <p class="mt-1">
                                    Permission is hereby granted, free of charge, to any person obtaining a copy
                                    of this software and associated documentation files, to deal in the Software
                                    without restriction, including without limitation the rights to use, copy, modify,
                                    merge, publish, distribute, sublicense, and/or sell copies...
                                </p>
                            </div>
                        </div>
                    </Match>
                </Switch>
            </div>
        </Dialog>
    );
}
