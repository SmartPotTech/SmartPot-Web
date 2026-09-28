import type { ReactNode } from "react";
import type { ActuatorType } from "../../../../lib/api/types";
import { ACTUATORS } from "../../../../lib/catalog";
import { GROUND } from "./Backdrop";

const METAL = "#5B6B63";
const IDLE = "#8FA3AE";
const WATER = "#2D9CDB";

/** Grupo de un actuador: lo anuncia con su estado y deja marcado si está encendido. */
function Actuator({ type, on, children }: { type: ActuatorType; on: boolean; children: ReactNode }) {
  const label = ACTUATORS[type].label;
  return (
    <g data-actuator={type} data-on={on}>
      <title>{`${label}: ${on ? "encendido" : "apagado"}`}</title>
      {children}
    </g>
  );
}

function Led({ x, y, on }: { x: number; y: number; on: boolean }) {
  return <circle cx={x} cy={y} r="2" fill={on ? "#00B074" : IDLE} className={on ? "scene-glow" : undefined} />;
}

/** Tubo de agua: con la bomba encendida la solución corre por dentro. */
export function Pipe({ d, flowing, width = 5 }: { d: string; flowing: boolean; width?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke="#B9C7CE" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={flowing ? "#E3F2FB" : "#F2F7F4"} strokeWidth={width - 2} strokeLinecap="round"
        strokeLinejoin="round" />
      {flowing && (
        <path d={d} className="scene-flow" fill="none" stroke={WATER} strokeWidth={width - 2.5} strokeDasharray="5 6"
          strokeLinecap="round" strokeLinejoin="round" />
      )}
    </g>
  );
}

/** Bomba sumergida en el depósito con sus tubos. */
export function WaterPump({ x, y, on, pipes, drips = [], bubbles = [] }: { x: number; y: number; on: boolean;
  pipes: string[]; drips?: [number, number][]; bubbles?: [number, number][] }) {
  return (
    <Actuator type="WATER_PUMP" on={on}>
      {pipes.map((d) => <Pipe key={d} d={d} flowing={on} />)}
      <rect x={x - 10} y={y - 7} width="20" height="14" rx="3" fill={on ? "#1F6FA0" : METAL} />
      <circle cx={x} cy={y} r="3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" className={on ? "scene-spin" : undefined} />
      <Led x={x + 6} y={y - 4} on={on} />
      {on && drips.map(([dx, dy], i) => (
        <path key={`${dx}-${dy}`} className="scene-drop" style={{ animationDelay: `${i * 0.25}s` }}
          d={`M${dx} ${dy} q3 5 0 8 q-3 -3 0 -8 Z`} fill={WATER} />
      ))}
      {on && bubbles.map(([bx, by], i) => (
        <circle key={`${bx}-${by}`} className="scene-bubble" style={{ animationDelay: `${i * 0.35}s` }} cx={bx} cy={by}
          r="2.5" fill="#FFFFFF" stroke={WATER} strokeWidth="0.8" />
      ))}
    </Actuator>
  );
}

/** Barra de luz ultravioleta colgada sobre las plantas; encendida ilumina hasta la altura indicada. */
export function GrowLight({ x, y, width, reach, on, glow }: { x: number; y: number; width: number; reach: number;
  on: boolean; glow: string }) {
  const left = x - width / 2;
  const right = x + width / 2;
  return (
    <Actuator type="UV_LIGHT" on={on}>
      <line x1={left + 10} y1="0" x2={left + 10} y2={y} stroke={METAL} strokeWidth="1.2" />
      <line x1={right - 10} y1="0" x2={right - 10} y2={y} stroke={METAL} strokeWidth="1.2" />
      {on && (
        <path className="scene-glow" d={`M${left + 4} ${y + 7} L${right - 4} ${y + 7} L${right + 22} ${reach} L${left - 22} ${reach} Z`}
          fill={`url(#${glow})`} />
      )}
      <rect x={left} y={y} width={width} height="8" rx="3" fill="#17261F" />
      {Array.from({ length: Math.floor((width - 8) / 12) }, (_, i) => (
        <circle key={i} cx={left + 10 + i * 12} cy={y + 5} r="2" fill={on ? "#FDF4DD" : IDLE} />
      ))}
    </Actuator>
  );
}

/** Ventilador de pie; encendido gira y empuja aire hacia las plantas. */
export function Fan({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <Actuator type="FAN" on={on}>
      <line x1={x} y1={y + 16} x2={x} y2={GROUND} stroke={METAL} strokeWidth="3" />
      <rect x={x - 12} y={GROUND - 4} width="24" height="4" rx="2" fill={METAL} />
      {on && (
        <g className="scene-flow" fill="none" stroke={WATER} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="8 7">
          <path d={`M${x + 22} ${y - 8} q18 -6 36 0`} />
          <path d={`M${x + 24} ${y} q20 6 42 0`} />
          <path d={`M${x + 22} ${y + 8} q18 6 36 0`} />
        </g>
      )}
      <circle cx={x} cy={y} r="17" fill="#FFFFFF" stroke="#B9C7CE" strokeWidth="2" />
      <g className={on ? "scene-spin" : undefined}>
        {[0, 120, 240].map((angle) => (
          <ellipse key={angle} cx={x} cy={y - 7} rx="4" ry="8" fill={on ? "#1F6FA0" : IDLE}
            transform={`rotate(${angle} ${x} ${y})`} />
        ))}
      </g>
      <circle cx={x} cy={y} r="2.5" fill={METAL} />
    </Actuator>
  );
}

/** Humidificador en el piso; encendido suelta bruma. */
export function Humidifier({ x, on }: { x: number; on: boolean }) {
  const top = GROUND - 34;
  return (
    <Actuator type="HUMIDIFIER" on={on}>
      {on && [0, 1, 2].map((i) => (
        <circle key={i} className="scene-mist" style={{ animationDelay: `${i * 0.6}s` }} cx={x + (i - 1) * 4} cy={top - 6}
          r={6 + i} fill="#FFFFFF" stroke="#E3F2FB" />
      ))}
      <rect x={x - 13} y={top} width="26" height="34" rx="8" fill="#FFFFFF" stroke="#B9C7CE" strokeWidth="2" />
      <rect x={x - 7} y={top + 12} width="14" height="14" rx="3" fill={on ? "#E3F2FB" : "#F2F7F4"} />
      <rect x={x - 7} y={top + 19} width="14" height="7" rx="2" fill={WATER} opacity="0.6" />
      <rect x={x - 4} y={top - 4} width="8" height="5" rx="2" fill={METAL} />
      <Led x={x + 7} y={top + 6} on={on} />
    </Actuator>
  );
}

/** Frasco dosificador: encendido deja caer gotas en la solución. */
export function Doser({ type, x, y, on, dropY }: { type: "NUTRIENT_DOSER" | "PH_DOSER"; x: number; y: number;
  on: boolean; dropY: number }) {
  const liquid = type === "PH_DOSER" ? "#1F6FA0" : "#00B074";
  return (
    <Actuator type={type} on={on}>
      <rect x={x - 3} y={y - 30} width="6" height="5" rx="1" fill={METAL} />
      <rect x={x - 8} y={y - 26} width="16" height="26" rx="4" fill="#FFFFFF" stroke="#B9C7CE" strokeWidth="1.5" />
      <rect x={x - 6} y={y - 16} width="12" height="14" rx="3" fill={liquid} opacity={on ? 1 : 0.7} />
      <text x={x} y={y - 6} textAnchor="middle" fontSize="7" fontWeight="700" fill="#FFFFFF">
        {type === "PH_DOSER" ? "pH" : "N"}
      </text>
      <Led x={x} y={y - 21} on={on} />
      {on && [0, 1].map((i) => (
        <path key={i} className="scene-drop" style={{ animationDelay: `${i * 0.4}s` }}
          d={`M${x} ${dropY} q2.5 4 0 6.5 q-2.5 -2.5 0 -6.5 Z`} fill={liquid} />
      ))}
    </Actuator>
  );
}
