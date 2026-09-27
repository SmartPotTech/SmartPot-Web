import type { ActuatorType, WeatherCondition } from "../../../lib/api/types";

interface WeatherSceneProps {
  /** Sin condición la escena es interior (modo manual o automático). */
  condition?: WeatherCondition | null;
  isDay?: boolean;
  label: string;
  active?: ActuatorType[];
}

const SKY = {
  clear: ["#7FC8F0", "#E3F2FB"],
  cloudy: ["#A9C3D1", "#E6EEF2"],
  wet: ["#6F8794", "#B9C7CE"],
  fog: ["#C4CFD3", "#E9EEF0"],
  snow: ["#C9DDE8", "#F2F7F4"],
  night: ["#06281C", "#1F6FA0"],
  indoor: ["#EEFAF4", "#DDF5EA"],
} satisfies Record<string, [string, string]>;

const CLOUDS: Partial<Record<WeatherCondition, number>> = {
  MOSTLY_CLEAR: 1, PARTLY_CLOUDY: 2, CLOUDY: 3, FOG: 2, DRIZZLE: 3, RAIN: 3, SNOW: 3, STORM: 3,
};

function skyFor(condition: WeatherCondition | null | undefined, isDay: boolean): [string, string] {
  if (!condition) return SKY.indoor;
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

/** Ilustración ligera de la maceta y su entorno: sol, luna, nubes, lluvia, niebla, nieve o tormenta. */
export function WeatherScene({ condition, isDay = true, label, active = [] }: WeatherSceneProps) {
  const [top, bottom] = skyFor(condition, isDay);
  const clouds = condition ? CLOUDS[condition] ?? 0 : 0;
  const dark = condition === "RAIN" || condition === "STORM" || condition === "DRIZZLE";
  const rain = condition === "RAIN" || condition === "STORM" ? 14 : condition === "DRIZZLE" ? 7 : 0;
  const sunny = condition && isDay && ["CLEAR", "MOSTLY_CLEAR", "PARTLY_CLOUDY"].includes(condition);
  const watering = active.includes("WATER_PUMP");
  const lamp = active.includes("UV_LIGHT");
  const fan = active.includes("FAN");

  return (
    <svg viewBox="0 0 320 180" role="img" aria-label={label} className="weather-scene h-auto w-full rounded-xl">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#sky)" />

      {!condition && (
        <path d="M20 150 Q160 -10 300 150" fill="none" stroke="#7FDBB0" strokeWidth="3" opacity="0.7" />
      )}
      {sunny && (
        <g className="scene-sun" transform="translate(262 42)">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1="0" y1="-30" x2="0" y2="-38" stroke="#F2B632" strokeWidth="3" strokeLinecap="round"
              transform={`rotate(${i * 45})`} />
          ))}
          <circle r="22" fill="#F2B632" />
        </g>
      )}
      {condition && !isDay && (
        <g transform="translate(262 40)">
          <circle r="18" fill="#FDF4DD" />
          <circle cx="8" cy="-5" r="16" fill={top} />
          <circle cx="-60" cy="10" r="1.5" fill="#FDF4DD" />
          <circle cx="-120" cy="-10" r="1.2" fill="#FDF4DD" />
          <circle cx="-190" cy="16" r="1.5" fill="#FDF4DD" />
        </g>
      )}
      {clouds >= 1 && <Cloud x={200} y={50} scale={1} dark={dark} />}
      {clouds >= 2 && <Cloud x={90} y={38} scale={1.2} dark={dark} />}
      {clouds >= 3 && <Cloud x={150} y={62} scale={0.9} dark={dark} />}

      {rain > 0 && (
        <g className="scene-rain" stroke="#2D9CDB" strokeWidth="2" strokeLinecap="round">
          {Array.from({ length: rain }, (_, i) => (
            <line key={i} x1={40 + i * 17} y1={80 + (i % 3) * 8} x2={36 + i * 17} y2={92 + (i % 3) * 8} />
          ))}
        </g>
      )}
      {condition === "SNOW" && (
        <g className="scene-rain" fill="#FFFFFF">
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={30 + i * 19} cy={84 + (i % 4) * 9} r="2.5" />)}
        </g>
      )}
      {condition === "STORM" && (
        <path d="M150 70 L140 96 L152 96 L144 120 L166 88 L154 88 L162 70 Z" fill="#F2B632" />
      )}
      {condition === "FOG" && (
        <g fill="#FFFFFF" opacity="0.55">
          <rect x="0" y="92" width="320" height="10" rx="5" />
          <rect x="30" y="110" width="260" height="8" rx="4" />
        </g>
      )}

      {lamp && (
        <g>
          <rect x="138" y="72" width="44" height="7" rx="3" fill="#5B6B63" />
          <path d="M140 79 L180 79 L200 128 L120 128 Z" fill="#F2B632" opacity="0.28" />
        </g>
      )}
      {fan && (
        <g transform="translate(58 118)">
          <circle r="16" fill="#FFFFFF" opacity="0.85" />
          <g className="scene-fan">
            {[0, 120, 240].map((angle) => (
              <ellipse key={angle} cx="0" cy="-8" rx="4" ry="8" fill="#1F6FA0" transform={`rotate(${angle})`} />
            ))}
          </g>
        </g>
      )}

      <rect x="0" y="150" width="320" height="30" fill="#DDF5EA" />
      <g transform="translate(160 118)">
        <path d="M-6 0 C-30 -8 -34 -30 -20 -44 C-10 -28 -4 -16 -6 0 Z" fill="#00B074" />
        <path d="M6 0 C30 -10 36 -32 22 -46 C10 -30 4 -16 6 0 Z" fill="#067A52" />
        <path d="M0 2 C-4 -20 -2 -40 4 -52 C10 -40 8 -20 0 2 Z" fill="#009A64" />
        <path d="M-34 4 L34 4 L26 44 L-26 44 Z" fill="#D9734E" />
        <rect x="-38" y="0" width="76" height="10" rx="3" fill="#B85A38" />
        {watering && (
          <g className="scene-rain" fill="#2D9CDB">
            <path d="M-12 -22 q4 6 0 9 q-4 -3 0 -9 Z" />
            <path d="M10 -30 q4 6 0 9 q-4 -3 0 -9 Z" />
            <path d="M0 -14 q4 6 0 9 q-4 -3 0 -9 Z" />
          </g>
        )}
      </g>
    </svg>
  );
}
