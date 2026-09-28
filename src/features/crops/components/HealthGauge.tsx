import {HEALTH} from "../../../lib/catalog";
import type {HealthLevel} from "../../../lib/api/types";

interface HealthGaugeProps {
    index: number | null;
    level: HealthLevel;
    label: string;
    size?: number;
}

/** Medidor semicircular del índice difuso de salud (0 a 100). */
export function HealthGauge({index, level, label, size = 160}: HealthGaugeProps) {
    const value = index === null ? 0 : Math.max(0, Math.min(100, index));
    const radius = 70;
    const circumference = Math.PI * radius;
    const color = HEALTH[level]?.color ?? HEALTH.UNKNOWN.color;
    return (
        <figure className="flex flex-col items-center"
                aria-label={`Salud ${index === null ? "sin datos" : `${Math.round(value)} de 100`}, ${label}`}>
            <svg width={size} height={size * 0.62} viewBox="0 0 180 112" aria-hidden="true">
                <path d="M20 100a70 70 0 0 1 140 0" fill="none" stroke="#E4EEE9" strokeWidth="16"
                      strokeLinecap="round"/>
                <path d="M20 100a70 70 0 0 1 140 0" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
                      strokeDasharray={`${(value / 100) * circumference} ${circumference}`}/>
                <text x="90" y="92" textAnchor="middle" className="font-display" fontSize="34" fontWeight="700"
                      fill="#17261F">
                    {index === null ? "—" : Math.round(value)}
                </text>
            </svg>
            <figcaption className="-mt-1 text-sm font-semibold" style={{color}}>{label}</figcaption>
        </figure>
    );
}
