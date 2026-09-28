import type {PlacementSetting, SunExposure, WeatherCondition} from "../../../../lib/api/types";

export const WIDTH = 360;
export const HEIGHT = 220;
export const GROUND = 200;

const SKY = {
    clear: ["#7FC8F0", "#E3F2FB"],
    cloudy: ["#A9C3D1", "#E6EEF2"],
    wet: ["#6F8794", "#B9C7CE"],
    fog: ["#C4CFD3", "#E9EEF0"],
    snow: ["#C9DDE8", "#F2F7F4"],
    night: ["#06281C", "#1F6FA0"],
} satisfies Record<string, [string, string]>;

const CLOUDS: Partial<Record<WeatherCondition, number>> = {
    MOSTLY_CLEAR: 1, PARTLY_CLOUDY: 2, CLOUDY: 3, FOG: 2, DRIZZLE: 3, RAIN: 3, SNOW: 3, STORM: 3,
};

function skyFor(condition: WeatherCondition, isDay: boolean): [string, string] {
    if (!isDay) return SKY.night;
    if (condition === "CLEAR" || condition === "MOSTLY_CLEAR") return SKY.clear;
    if (condition === "PARTLY_CLOUDY" || condition === "CLOUDY") return SKY.cloudy;
    if (condition === "FOG") return SKY.fog;
    if (condition === "SNOW") return SKY.snow;
    return SKY.wet;
}

function Cloud({x, y, scale, dark}: { x: number; y: number; scale: number; dark: boolean }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${scale})`} fill={dark ? "#8FA3AE" : "#FFFFFF"}
           opacity={dark ? 0.95 : 0.92}>
            <ellipse cx="0" cy="10" rx="30" ry="14"/>
            <circle cx="-12" cy="2" r="13"/>
            <circle cx="10" cy="-2" r="17"/>
            <circle cx="26" cy="8" r="11"/>
        </g>
    );
}

function Moon({x, y, sky}: { x: number; y: number; sky: string }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            <circle r="16" fill="#FDF4DD"/>
            <circle cx="7" cy="-5" r="14" fill={sky}/>
        </g>
    );
}

/** Exterior con el clima del lugar: sol, luna, nubes, lluvia, niebla, nieve o tormenta. */
function Outdoor({id, condition, isDay}: { id: string; condition: WeatherCondition; isDay: boolean }) {
    const [top, bottom] = skyFor(condition, isDay);
    const clouds = CLOUDS[condition] ?? 0;
    const dark = condition === "RAIN" || condition === "STORM" || condition === "DRIZZLE";
    const rain = condition === "RAIN" || condition === "STORM" ? 16 : condition === "DRIZZLE" ? 8 : 0;
    const sunny = isDay && ["CLEAR", "MOSTLY_CLEAR", "PARTLY_CLOUDY"].includes(condition);
    return (
        <g data-backdrop="outdoor">
            <defs>
                <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={top}/>
                    <stop offset="1" stopColor={bottom}/>
                </linearGradient>
            </defs>
            <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-sky)`}/>
            {sunny && (
                <g className="scene-sun" transform="translate(312 36)">
                    {Array.from({length: 8}, (_, i) => (
                        <line key={i} x1="0" y1="-24" x2="0" y2="-31" stroke="#F2B632" strokeWidth="3"
                              strokeLinecap="round"
                              transform={`rotate(${i * 45})`}/>
                    ))}
                    <circle r="18" fill="#F2B632"/>
                </g>
            )}
            {!isDay && (
                <g>
                    <Moon x={312} y={34} sky={top}/>
                    {[[40, 30], [110, 18], [230, 26], [270, 60]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.4"
                                                                                         fill="#FDF4DD"/>)}
                </g>
            )}
            {clouds >= 1 && <Cloud x={250} y={40} scale={0.9} dark={dark}/>}
            {clouds >= 2 && <Cloud x={70} y={30} scale={1.1} dark={dark}/>}
            {clouds >= 3 && <Cloud x={160} y={46} scale={0.8} dark={dark}/>}
            {rain > 0 && (
                <g className="scene-rain" stroke="#2D9CDB" strokeWidth="2" strokeLinecap="round">
                    {Array.from({length: rain}, (_, i) => (
                        <line key={i} x1={20 + i * 21} y1={70 + (i % 3) * 10} x2={16 + i * 21} y2={82 + (i % 3) * 10}/>
                    ))}
                </g>
            )}
            {condition === "SNOW" && (
                <g className="scene-rain" fill="#FFFFFF">
                    {Array.from({length: 16}, (_, i) => <circle key={i} cx={16 + i * 21} cy={74 + (i % 4) * 10}
                                                                r="2.5"/>)}
                </g>
            )}
            {condition === "STORM" &&
                <path d="M120 58 L110 84 L122 84 L114 108 L136 76 L124 76 L132 58 Z" fill="#F2B632"/>}
            {condition === "FOG" && (
                <g fill="#FFFFFF" opacity="0.55">
                    <rect x="0" y="120" width={WIDTH} height="10" rx="5"/>
                    <rect x="30" y="146" width="300" height="8" rx="4"/>
                </g>
            )}
            <rect x="0" y={GROUND} width={WIDTH} height={HEIGHT - GROUND} fill="#DDF5EA"/>
        </g>
    );
}

/**
 * Interior: pared, piso y una ventana con el cielo de afuera. Con ventana soleada entra un haz de sol hasta el
 * cultivo; sin luz natural la cortina queda cerrada.
 */
function Indoor({id, isDay, condition, exposure}: {
    id: string; isDay: boolean; condition?: WeatherCondition | null;
    exposure?: SunExposure | null
}) {
    const wall = isDay ? ["#EEFAF4", "#DDF5EA"] : ["#0B3D2B", "#06281C"];
    const [sky] = skyFor(condition ?? "MOSTLY_CLEAR", isDay);
    const frame = isDay ? "#D5E3DC" : "#0A5A3C";
    const sunny = isDay && (!condition || ["CLEAR", "MOSTLY_CLEAR", "PARTLY_CLOUDY"].includes(condition));
    const wet = condition === "RAIN" || condition === "STORM" || condition === "DRIZZLE";
    const closed = exposure === "SHADE";
    return (
        <g data-backdrop="indoor">
            <defs>
                <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={wall[0]}/>
                    <stop offset="1" stopColor={wall[1]}/>
                </linearGradient>
            </defs>
            <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-wall)`}/>
            <g transform="translate(282 18)" data-window={closed ? "closed" : "open"}>
                <rect width="62" height="54" rx="4" fill={sky} stroke={frame} strokeWidth="4"/>
                {isDay && sunny && !closed && <circle cx="46" cy="16" r="7" fill="#F2B632"/>}
                {!isDay && !closed && <Moon x={46} y={16} sky={sky}/>}
                {isDay && !sunny && !closed && <Cloud x={24} y={16} scale={0.45} dark={wet}/>}
                {wet && !closed && (
                    <g stroke="#2D9CDB" strokeWidth="1.5" strokeLinecap="round">
                        {[8, 20, 38, 50].map((x) => <line key={x} x1={x} y1={30} x2={x - 3} y2={38}/>)}
                    </g>
                )}
                <line x1="31" y1="0" x2="31" y2="54" stroke={frame} strokeWidth="3"/>
                {closed && (
                    <g data-curtain>
                        <rect x="-2" y="-2" width="66" height="58" rx="3" fill="#D9734E" opacity="0.85"/>
                        {[10, 22, 34, 46, 58].map((x) => <line key={x} x1={x} y1="-2" x2={x} y2="56" stroke="#B85A38"
                                                               strokeWidth="2"/>)}
                    </g>
                )}
            </g>
            {exposure === "FULL_SUN" && isDay && sunny && (
                <polygon data-sunbeam points="284,70 344,72 250,200 140,200" fill="#F2B632" opacity="0.14"/>
            )}
            <rect x="0" y={GROUND} width={WIDTH} height={HEIGHT - GROUND} fill={isDay ? "#D5E3DC" : "#0A5A3C"}/>
        </g>
    );
}

interface BackdropProps {
    id: string;
    /** Clima del lugar: afuera pinta el cielo; adentro, lo que se ve por la ventana. */
    condition?: WeatherCondition | null;
    isDay: boolean;
    /** Sin lugar definido, un clima conocido significa aire libre y su ausencia, interior. */
    setting?: PlacementSetting | null;
    exposure?: SunExposure | null;
}

/** El id prefija los degradados: varias escenas en la misma página no deben compartirlos. */
export function Backdrop({id, condition, isDay, setting, exposure}: BackdropProps) {
    const outdoor = setting ? setting === "OUTDOOR" : Boolean(condition);
    return outdoor
        ? <Outdoor id={id} condition={condition ?? (isDay ? "MOSTLY_CLEAR" : "CLEAR")} isDay={isDay}/>
        : <Indoor id={id} isDay={isDay} condition={condition} exposure={exposure}/>;
}

/**
 * Lo que da sombra al aire libre, encima del cultivo: una malla sobre una pérgola en media sombra, o la copa de un
 * árbol en sombra. Tiñe la escena para que se note que la planta recibe menos sol.
 */
export function Shelter({setting, exposure, isDay}: {
    setting?: PlacementSetting | null;
    exposure?: SunExposure | null; isDay: boolean
}) {
    if (setting !== "OUTDOOR" || !exposure || exposure === "FULL_SUN") return null;
    const tint = isDay ? "#06281C" : "#000000";
    if (exposure === "PARTIAL_SUN") {
        return (
            <g data-shade="PARTIAL_SUN">
                <rect x="0" y="0" width={WIDTH} height={GROUND} fill={tint} opacity="0.07"/>
                <rect x="10" y="10" width="5" height={GROUND - 10} fill="#B85A38"/>
                <rect x="345" y="10" width="5" height={GROUND - 10} fill="#B85A38"/>
                <rect x="6" y="6" width="348" height="8" rx="2" fill="#067A52" opacity="0.75"/>
                <g stroke="#0B3D2B" strokeWidth="1" opacity="0.5">
                    {Array.from({length: 34}, (_, i) => <line key={i} x1={10 + i * 10} y1="6" x2={10 + i * 10}
                                                              y2="14"/>)}
                </g>
            </g>
        );
    }
    return (
        <g data-shade="SHADE">
            <rect x="0" y="0" width={WIDTH} height={GROUND} fill={tint} opacity="0.16"/>
            <rect x="18" y="40" width="14" height={GROUND - 40} rx="3" fill="#B85A38"/>
            <g fill="#067A52">
                <circle cx="30" cy="30" r="40"/>
                <circle cx="95" cy="16" r="34"/>
                <circle cx="160" cy="6" r="30"/>
                <circle cx="220" cy="-4" r="28"/>
            </g>
            <g fill="#00B074" opacity="0.5">
                <circle cx="50" cy="20" r="18"/>
                <circle cx="120" cy="8" r="14"/>
            </g>
            <ellipse cx="180" cy={GROUND + 6} rx="170" ry="8" fill="#06281C" opacity="0.18"/>
        </g>
    );
}
