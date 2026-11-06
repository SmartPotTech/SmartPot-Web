import {
    CloudFog,
    Droplets,
    Fan,
    FlaskConical,
    Lightbulb,
    PauseCircle,
    PlugZap,
    ServerOff,
    TestTubeDiagonal,
    WifiOff,
} from "lucide-solid";
import {createSignal, For, type JSX, onCleanup, onMount, Show} from "solid-js";
import {ACTUATORS, CROP_FORMS, CROP_TYPES, describePlacement} from "../../../lib/catalog";
import {formatMetric, timeAgo} from "../../../lib/format";
import type {Actuator, ActuatorType, Command, Crop, VirtualDevice, Weather} from "../../../lib/api/types";
import {t} from "../../../lib/i18n";
import {st} from "../../../lib/i18n/serverText";
import {isDaylight, liveStatus, runningActuators, vigorOf} from "../live";
import {CropScene} from "./scene/CropScene";

const ICONS: Record<ActuatorType, typeof Droplets> = {
    WATER_PUMP: Droplets,
    UV_LIGHT: Lightbulb,
    FAN: Fan,
    HUMIDIFIER: CloudFog,
    NUTRIENT_DOSER: FlaskConical,
    PH_DOSER: TestTubeDiagonal,
};

interface CropHeroProps {
    crop: Crop;
    actuators: Actuator[];
    commands: Command[];
    /** Solo en los virtuales: estado de la simulación (clima, conexión y actuadores del simulador). */
    simulation?: VirtualDevice | null;
    /** Clima actual del lugar del cultivo, si tiene ubicación. */
    weather?: Weather | null;
    onOpenTab: (tab: string) => void;
}

function Unlit(props: {
    icon: JSX.Element;
    title: string;
    children: JSX.Element;
    link?: { label: string; onClick: () => void };
}) {
    return (
        <div
            class="flex aspect-[36/22] w-full flex-col items-center justify-center gap-2 bg-surface px-6 text-center">
            <span
                class="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-accent">{props.icon}</span>
            <p class="font-semibold">{props.title}</p>
            <p class="max-w-sm text-sm text-muted">{props.children}</p>
            <Show when={props.link}>
                {(link) => (
                    <button type="button" onClick={() => link().onClick()}
                            class="text-sm font-semibold text-link hover:underline">
                        {link().label}
                    </button>
                )}
            </Show>
        </div>
    );
}

/**
 * La ilustración del cultivo, fija sobre todas sus secciones: su forma con la especie, su lugar (bajo techo o al
 * aire libre, con el clima y la sombra) y cada actuador encendido o apagado. Solo muestra; las órdenes se dan en
 * Control. Si el cultivo no está conectado no se dibuja.
 */
export function CropHero(props: CropHeroProps) {
    const [now, setNow] = createSignal(Date.now());

    // Los encendidos por tiempo se apagan solos: la escena se revisa cada pocos segundos.
    onMount(() => {
        const timer = setInterval(() => setNow(Date.now()), 5_000);
        onCleanup(() => clearInterval(timer));
    });

    const virtual = () => props.crop.kind === "VIRTUAL";
    const status = () => liveStatus(props.crop, props.simulation);
    const measures = () => props.crop.latestReading?.measures ?? props.simulation?.lastReading ?? undefined;
    const simulated = () => props.simulation?.active && props.simulation.mode === "WEATHER" ? props.simulation.weather : null;
    const weather = () => simulated() ?? props.weather ?? null;
    const placement = () => props.crop.placement ?? null;
    // Sin lugar definido, el cultivo virtual que sigue un clima está al aire libre; el resto se dibuja bajo techo.
    const setting = () => placement()?.setting ?? (simulated() ? "OUTDOOR" : null);
    const outdoor = () => setting() === "OUTDOOR";
    const running = () => runningActuators(props.actuators, props.commands, props.simulation?.activeActuators ?? [], now());
    const day = () => isDaylight(weather(), measures());
    const connected = () => status() === "live" || status() === "waiting";
    const species = () => `${CROP_TYPES[props.crop.type].label} ${CROP_FORMS[props.crop.form].phrase}`;
    const on = () => props.actuators.filter((actuator) => running().has(actuator.type));
    const described = () => describePlacement(placement());
    const where = () => described() ?? (outdoor() ? t("hero.outdoors") : t("hero.undefined"));
    const scenery = () => described() ?? (outdoor() ? t("hero.outdoors") : t("hero.indoors"));
    const place = () => outdoor() && weather() ? `${scenery()}, ${st(weather()!.label).toLowerCase()}` : scenery();
    const label = () => t("hero.label", {
        species: species(),
        place: place(),
        daytime: day() ? t("hero.day") : t("hero.night"),
        actuators: on().length > 0
            ? t("hero.on", {list: on().map((actuator) => ACTUATORS[actuator.type].label.toLowerCase()).join(", ")})
            : t("hero.allOff"),
    });

    return (
        <section class="card overflow-hidden" aria-label={t("hero.illustration")}>
            <div class="grid md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                <div class="relative">
                    <Show when={connected()} fallback={
                        <Show when={status() === "paused"} fallback={
                            <Show when={status() === "unavailable"} fallback={
                                <Show when={virtual()} fallback={
                                    <Unlit icon={<WifiOff size={24}/>} title={t("hero.notConnected")}
                                           link={{label: t("hero.howConnect"), onClick: () => props.onOpenTab("device")}}>
                                        {t("hero.notConnectedBody", {time: timeAgo(props.crop.device.lastSeenAt)})}
                                    </Unlit>
                                }>
                                    <Unlit icon={<PlugZap size={24}/>} title={t("hero.connecting")}>
                                        {t("hero.connectingBody")}
                                    </Unlit>
                                </Show>
                            }>
                                <Unlit icon={<ServerOff size={24}/>} title={t("hero.simUnavailable")}>
                                    {t("hero.simUnavailableBody")}
                                </Unlit>
                            </Show>
                        }>
                            <Unlit icon={<PauseCircle size={24}/>} title={t("hero.paused")}
                                   link={{label: t("hero.goSimulation"), onClick: () => props.onOpenTab("simulation")}}>
                                {t("hero.pausedBody")}
                            </Unlit>
                        </Show>
                    }>
                        <CropScene form={props.crop.form} type={props.crop.type}
                                   installed={props.actuators.map((actuator) => actuator.type)}
                                   running={running()} condition={weather()?.condition} setting={setting()}
                                   exposure={placement()?.exposure}
                                   isDay={day()} vigor={vigorOf(props.crop.health?.level)}
                                   moisture={measures()?.soilMoisture}
                                   label={label()}/>
                        <Show when={status() === "waiting"}>
                            <span
                                class="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-accent-strong shadow">
                                {t("hero.waitingFirst")}
                            </span>
                        </Show>
                    </Show>
                </div>

                <div class="space-y-4 border-t border-line p-5 md:border-l md:border-t-0">
                    <div>
                        <Show when={virtual()}>
                            <p class="text-xs font-semibold uppercase tracking-wide text-accent">{t("hero.virtualCrop")}</p>
                        </Show>
                        <p class="mt-0.5 font-display text-lg font-semibold">{species()}</p>
                        <p class="mt-1 text-sm text-muted">
                            {where().charAt(0).toUpperCase() + where().slice(1)}
                            <Show when={!placement()?.setting}>
                                {" · "}
                                <button type="button" onClick={() => props.onOpenTab("settings")}
                                        class="font-semibold text-link hover:underline">{t("hero.setPlace")}
                                </button>
                            </Show>
                        </p>
                        <Show when={connected()}>
                            <p class="mt-1 text-sm text-muted tabular-nums">
                                <Show when={weather()}>
                                    {(w) => (
                                        <>
                                            {t("hero.outside", {
                                                label: st(w().label).toLowerCase(),
                                                temperature: w().temperature.toFixed(1),
                                                humidity: Math.round(w().humidity),
                                            })}
                                            {w().precipitation > 0 && t("hero.rain", {value: w().precipitation.toFixed(1)})}
                                            {" · "}
                                        </>
                                    )}
                                </Show>
                                {day() ? t("hero.day") : t("hero.night")}
                                {measures()?.brightness != null && t("hero.light", {value: formatMetric("brightness", measures()!.brightness)})}
                                {!weather() && measures()?.temperature != null && ` · ${formatMetric("temperature", measures()!.temperature)}`}
                            </p>
                        </Show>
                        <Show when={props.simulation?.weatherError}>
                            {(err) => <p class="mt-1 text-xs text-clay-fg">{st(err())}</p>}
                        </Show>
                    </div>

                    <Show when={props.actuators.length > 0}>
                        <ul class="flex flex-wrap gap-1.5" aria-label={t("hero.actuatorStatus")}>
                            <For each={props.actuators}>
                                {(actuator) => {
                                    const Icon = ICONS[actuator.type];
                                    const active = () => connected() && running().has(actuator.type);
                                    return (
                                        <li class={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${active()
                                            ? "bg-leaf-700 font-semibold text-white" : "bg-surface text-muted"}`}>
                                            <Icon size={13} class="shrink-0"/>
                                            <span>{ACTUATORS[actuator.type].label}</span>
                                            <span
                                                class={active() ? "text-leaf-100" : "text-muted"}>· {active() ? t("hero.actuatorOn") : t("hero.actuatorOff")}</span>
                                        </li>
                                    );
                                }}
                            </For>
                        </ul>
                    </Show>
                </div>
            </div>
        </section>
    );
}
