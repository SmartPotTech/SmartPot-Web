import type { WeatherCondition } from "../../../../lib/api/types";

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

function Cloud({ x, y, scale, dark }: { x: number; y: number; scale: number; dark: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={dark ? "#8FA3AE" : "#FFFFFF"} opacity={dark ? 0.95 : 0.92}>
      <ellipse cx="0" cy="10" rx="30" ry="14" />
      <circle cx="-12" cy="2" r="13" />
      <circle cx="10" cy="-2" r="17" />
      <circle cx="26" cy="8" r="11" />
    </g>
  );
}

function Moon({ x, y, sky }: { x: number; y: number; sky: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="16" fill="#FDF4DD" />
      <circle cx="7" cy="-5" r="14" fill={sky} />
    </g>
  );
}

/** Exterior con el clima del lugar: sol, luna, nubes, lluvia, niebla, nieve o tormenta. */
function Outdoor({ id, condition, isDay }: { id: string; condition: WeatherCondition; isDay: boolean }) {
  const [top, bottom] = skyFor(condition, isDay);
  const clouds = CLOUDS[condition] ?? 0;
  const dark = condition === "RAIN" || condition === "STORM" || condition === "DRIZZLE";
  const rain = condition === "RAIN" || condition === "STORM" ? 16 : condition === "DRIZZLE" ? 8 : 0;
  const sunny = isDay && ["CLEAR", "MOSTLY_CLEAR", "PARTLY_CLOUDY"].includes(condition);
  return (
    <g data-backdrop="outdoor">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-sky)`} />
      {sunny && (
        <g className="scene-sun" transform="translate(312 36)">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1="0" y1="-24" x2="0" y2="-31" stroke="#F2B632" strokeWidth="3" strokeLinecap="round"
              transform={`rotate(${i * 45})`} />
          ))}
          <circle r="18" fill="#F2B632" />
        </g>
      )}
      {!isDay && (
        <g>
          <Moon x={312} y={34} sky={top} />
          {[[40, 30], [110, 18], [230, 26], [270, 60]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.4" fill="#FDF4DD" />)}
        </g>
      )}
      {clouds >= 1 && <Cloud x={250} y={40} scale={0.9} dark={dark} />}
      {clouds >= 2 && <Cloud x={70} y={30} scale={1.1} dark={dark} />}
      {clouds >= 3 && <Cloud x={160} y={46} scale={0.8} dark={dark} />}
      {rain > 0 && (
        <g className="scene-rain" stroke="#2D9CDB" strokeWidth="2" strokeLinecap="round">
          {Array.from({ length: rain }, (_, i) => (
            <line key={i} x1={20 + i * 21} y1={70 + (i % 3) * 10} x2={16 + i * 21} y2={82 + (i % 3) * 10} />
          ))}
        </g>
      )}
      {condition === "SNOW" && (
        <g className="scene-rain" fill="#FFFFFF">
          {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={16 + i * 21} cy={74 + (i % 4) * 10} r="2.5" />)}
        </g>
      )}
      {condition === "STORM" && <path d="M120 58 L110 84 L122 84 L114 108 L136 76 L124 76 L132 58 Z" fill="#F2B632" />}
      {condition === "FOG" && (
        <g fill="#FFFFFF" opacity="0.55">
          <rect x="0" y="120" width={WIDTH} height="10" rx="5" />
          <rect x="30" y="146" width="300" height="8" rx="4" />
        </g>
      )}
      <rect x="0" y={GROUND} width={WIDTH} height={HEIGHT - GROUND} fill="#DDF5EA" />
    </g>
  );
}

/** Interior: pared, ventana con el cielo del momento y piso. */
function Indoor({ id, isDay }: { id: string; isDay: boolean }) {
  const wall = isDay ? ["#EEFAF4", "#DDF5EA"] : ["#0B3D2B", "#06281C"];
  const glass = isDay ? "#E3F2FB" : "#1F6FA0";
  return (
    <g data-backdrop="indoor">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wall[0]} />
          <stop offset="1" stopColor={wall[1]} />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill={`url(#${id}-wall)`} />
      <g transform="translate(282 18)">
        <rect width="62" height="54" rx="4" fill={glass} stroke={isDay ? "#D5E3DC" : "#0A5A3C"} strokeWidth="4" />
        <line x1="31" y1="0" x2="31" y2="54" stroke={isDay ? "#D5E3DC" : "#0A5A3C"} strokeWidth="3" />
        {isDay ? <circle cx="46" cy="16" r="7" fill="#F2B632" /> : <Moon x={46} y={16} sky={glass} />}
      </g>
      <rect x="0" y={GROUND} width={WIDTH} height={HEIGHT - GROUND} fill={isDay ? "#D5E3DC" : "#0A5A3C"} />
    </g>
  );
}

/** El id prefija los degradados: varias escenas en la misma página no deben compartirlos. */
export function Backdrop({ id, condition, isDay }: { id: string; condition?: WeatherCondition | null; isDay: boolean }) {
  return condition ? <Outdoor id={id} condition={condition} isDay={isDay} /> : <Indoor id={id} isDay={isDay} />;
}
