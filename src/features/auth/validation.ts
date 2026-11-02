import {t, type TranslationKey} from "../../lib/i18n";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERSON_NAME = /^\p{L}[\p{L} '-]*$/u;

export function validateEmail(value: string): string | undefined {
    if (!value.trim()) return t("validation.emailRequired");
    if (!EMAIL.test(value.trim())) return t("validation.emailInvalid");
    return undefined;
}

export function validatePassword(value: string): string | undefined {
    if (value.length < 8) return t("validation.passwordShort");
    if (new TextEncoder().encode(value).length > 72) return t("validation.passwordLong");
    if (!/[A-ZÁÉÍÓÚÑ]/.test(value) || !/[a-záéíóúñ]/.test(value) || !/\d/.test(value)) {
        return t("validation.passwordMix");
    }
    return undefined;
}

export function validateName(value: string, label: string, max: number): string | undefined {
    const trimmed = value.trim();
    if (trimmed.length < 2) return t("validation.nameMin", {label});
    if (trimmed.length > max) return t("validation.nameMax", {label, max});
    if (!PERSON_NAME.test(trimmed)) return t("validation.nameChars", {label});
    return undefined;
}

export function passwordStrength(value: string): { score: number; label: string } {
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return {score, label: t(`strength.${Math.min(score, 5)}` as TranslationKey)};
}
