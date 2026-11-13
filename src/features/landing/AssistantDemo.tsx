import {createMemo, createSignal, For, Show} from "solid-js";
import {CROP_TYPES, METRICS} from "../../lib/catalog";
import {formatNumber} from "../../lib/format";
import type {CropType} from "../../lib/api/types";
import {intlLocale, t} from "../../lib/i18n";
import {
    DEMO_CONTROLS,
    type DemoMetric,
    demoOutcome,
    type DemoReading,
    demoStart,
    type DemoStatus,
    PRESETS,
    type RangeKey,
    SPECIES,
    SPECIES_RANGES,
} from "./data";

const METRIC_ORDER: DemoMetric[] = ["temperature", "ph", "tds"];
const LOCKOUT_CERTAINTY = 0.85;

const STORAGE_SPECIES_KEY = "smartpot_demo_species";
const STORAGE_READING_KEY = "smartpot_demo_reading";

// Carga la especie guardada en sessionStorage si es válida
function loadSavedSpecies(): CropType {
    if (typeof window === "undefined") return "LETTUCE";
    try {
        const saved = window.sessionStorage.getItem(STORAGE_SPECIES_KEY) as CropType | null;
        if (saved && (SPECIES as readonly string[]).includes(saved)) return saved;
    } catch {
        // Ignora restricciones de acceso a sessionStorage
    }
    return "LETTUCE";
}

// Carga la lectura guardada en sessionStorage si es válida
function loadSavedReading(sp: CropType): DemoReading {
    const fallback = demoStart(sp);
    if (typeof window === "undefined") return fallback;
    try {
        const raw = window.sessionStorage.getItem(STORAGE_READING_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (
                typeof parsed?.temperature === "number" &&
                typeof parsed?.ph === "number" &&
                typeof parsed?.tds === "number"
            ) {
                return parsed as DemoReading;
            }
        }
    } catch {
        // Ignora restricciones de acceso a sessionStorage
    }
    return fallback;
}

// Persiste especie y lectura en sessionStorage
function saveDemoState(sp: CropType, r: DemoReading) {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(STORAGE_SPECIES_KEY, sp);
        window.sessionStorage.setItem(STORAGE_READING_KEY, JSON.stringify(r));
    } catch {
        // Ignora cuotas o bloqueos
    }
}

const STATUS_CLASS: Record<DemoStatus, string> = {
    ok: "bg-leaf-50 text-accent-strong",
    low: "bg-water-100 text-link",
    high: "bg-sun-100 text-sun-fg",
};

/** Decimales con que se muestra cada control: la temperatura con uno, el pH con uno y los nutrientes enteros. */
const DECIMALS: Record<DemoMetric, number> = {temperature: 1, ph: 1, tds: 0};

export function formatRange(metric: RangeKey, [low, high]: readonly [number, number]) {
    const decimals = metric === "ph" ? 1 : 0;
    const unit = METRICS[metric].unit;
    const range = `${formatNumber(low, decimals)}–${formatNumber(high, decimals)}`;
    return unit ? `${range} ${unit}` : range;
}

/**
 * Fragmento vivo de la landing: el visitante elige una especie, mueve tres lecturas y ve el estado frente al rango real
 * de esa especie y lo que haría el agente. Todo corre en el navegador con los datos de `data.ts`; no llama a la API.
 */
export function AssistantDemo() {
    const initialSpecies = loadSavedSpecies();
    const [species, setSpecies] = createSignal<CropType>(initialSpecies);
    const [reading, setReading] = createSignal<DemoReading>(loadSavedReading(initialSpecies));
    const outcome = createMemo(() => demoOutcome(species(), reading()));

    const choose = (next: CropType) => {
        setSpecies(next);
        const nextReading = demoStart(next);
        setReading(nextReading);
        saveDemoState(next, nextReading);
    };

    const update = (metric: DemoMetric, value: number) => {
        setReading((current) => {
            const next = {...current, [metric]: value};
            saveDemoState(species(), next);
            return next;
        });
    };

    const applyPreset = (presetId: string) => {
        const found = PRESETS.find((p) => p.id === presetId);
        if (!found) return;
        const vals = found.values(species());
        setReading((current) => {
            const next = {...current, ...vals};
            saveDemoState(species(), next);
            return next;
        });
    };

    return (
        <div id="demo" data-ui class="w-full max-w-md scroll-mt-24 rounded-[var(--radius-card)] bg-card p-5 text-ink shadow-[var(--shadow-card)] sm:p-6">
            <div class="flex items-baseline justify-between gap-3">
                <h2 class="text-lg font-semibold">{t("landing.demo.title")}</h2>
            </div>
            <p class="mt-1 text-sm text-muted">{t("landing.demo.caption")}</p>

            <fieldset class="mt-5">
                <legend class="text-sm font-medium">{t("landing.demo.species")}</legend>
                <div class="mt-2 grid grid-cols-3 gap-1.5 rounded-xl bg-surface p-1">
                    <For each={SPECIES}>
                        {(item) => (
                            <label class={`touch-target cursor-pointer rounded-lg px-2 py-1.5 text-center text-sm font-medium
                                transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-500
                                ${species() === item ? "bg-card text-ink" : "text-muted hover:text-ink"}`}>
                                <input type="radio" name="demo-species" value={item} class="sr-only"
                                       checked={species() === item} onChange={() => choose(item)}/>
                                {CROP_TYPES[item].label}
                            </label>
                        )}
                    </For>
                </div>
            </fieldset>

            <div class="mt-4">
                <p class="text-xs font-medium text-muted">{t("landing.demo.presets")}</p>
                <div class="mt-1.5 flex flex-wrap gap-1.5">
                    <For each={PRESETS}>
                        {(preset) => (
                            <button
                                type="button"
                                onClick={() => applyPreset(preset.id)}
                                class="touch-target inline-flex items-center rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-leaf-500 hover:text-ink focus-visible:outline-2 focus-visible:outline-leaf-500"
                            >
                                {t(preset.label)}
                            </button>
                        )}
                    </For>
                </div>
            </div>

            <div class="mt-5 space-y-4">
                <For each={METRIC_ORDER}>
                    {(metric) => {
                        const control = DEMO_CONTROLS[metric];
                        const id = `demo-${metric}`;
                        const status = () => outcome().status[metric];
                        const value = () => reading()[metric];
                        const shown = () => {
                            const unit = METRICS[metric].unit;
                            const number = formatNumber(value(), DECIMALS[metric]);
                            return unit ? `${number} ${unit}` : number;
                        };
                        return (
                            <div>
                                <div class="flex items-center justify-between gap-3">
                                    <label for={id} class="text-sm font-medium">{METRICS[metric].label}</label>
                                    <span class="flex items-center gap-2">
                                        <output for={id} class="font-display text-lg font-semibold tabular-nums">{shown()}</output>
                                        <span class={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[status()]}`}>
                                            {t(`landing.demo.status.${status()}`)}
                                        </span>
                                    </span>
                                </div>
                                <input id={id} type="range" min={control.min} max={control.max} step={control.step}
                                       value={value()} aria-valuetext={shown()}
                                       onInput={(event) => update(metric, Number(event.currentTarget.value))}
                                       class="demo-range mt-2 w-full"/>
                                <p class="mt-0.5 text-xs text-muted tabular-nums">
                                    {t("landing.demo.ideal", {range: formatRange(metric, SPECIES_RANGES[species()][metric])})}
                                </p>
                            </div>
                        );
                    }}
                </For>
            </div>

            <div class="mt-5 rounded-xl bg-surface p-4" aria-live="polite">
                <p class="text-sm font-semibold">{t("landing.demo.agent")}</p>
                <Show when={outcome().actions.length > 0} fallback={
                    <p class="mt-1 text-sm text-muted">{t("landing.demo.nothing")}</p>
                }>
                    <ul class="mt-1 space-y-1 text-sm">
                        <For each={outcome().actions}>{(action) => <li>{t(action.text)}</li>}</For>
                    </ul>
                </Show>
                <Show when={outcome().lockout}>
                    <div class="mt-3 text-sm">
                        <p class="font-semibold text-sun-fg">
                            {t("landing.demo.lockoutRule", {
                                certainty: LOCKOUT_CERTAINTY.toLocaleString(intlLocale(), {style: "percent"}),
                            })}
                        </p>
                        <p class="mt-0.5 text-muted">{t("landing.demo.lockoutBody")}</p>
                    </div>
                </Show>
                <Show when={outcome().lowPhNotice}>
                    <p class="mt-3 text-sm text-muted">{t("landing.demo.lowPh")}</p>
                </Show>
            </div>
            <p class="mt-3 text-xs text-muted">{t("landing.demo.footnote")}</p>
        </div>
    );
}
