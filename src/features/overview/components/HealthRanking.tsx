import {HeartPulse, WifiOff} from "lucide-react";
import {Link} from "react-router";
import {HEALTH} from "../../../lib/catalog";
import type {Crop} from "../../../lib/api/types";

/** Salud de cada cultivo, del que más atención necesita al que menos. */
export function HealthRanking({crops}: { crops: Crop[] }) {
    const ranked = [...crops].sort((a, b) => (a.health?.index ?? 101) - (b.health?.index ?? 101));
    return (
        <section className="card p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
                <HeartPulse size={18} className="text-leaf-700"/> Salud por cultivo
            </h2>
            <p className="text-sm text-muted">Primero los que más atención necesitan.</p>
            <ul className="mt-4 space-y-3">
                {ranked.map((crop) => {
                    const health = crop.health;
                    const color = health ? HEALTH[health.level]?.color : undefined;
                    return (
                        <li key={crop.id}>
                            <Link to={`/app/crops/${crop.id}`} className="group block rounded-xl p-1 hover:bg-leaf-50">
                                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2 font-medium">
                    <span className="truncate group-hover:text-leaf-800">{crop.name}</span>
                      {!crop.device.online &&
                          <WifiOff size={14} className="shrink-0 text-muted" aria-label="Desconectada"/>}
                  </span>
                                    <span className="shrink-0 text-muted">
                    {health ? <><span
                        className="font-semibold text-ink">{Math.round(health.index)}</span> · {health.label}</> : "Sin evaluar"}
                  </span>
                                </div>
                                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface" role="meter"
                                     aria-valuemin={0}
                                     aria-valuemax={100} aria-valuenow={health ? Math.round(health.index) : 0}
                                     aria-label={`Salud de ${crop.name}`}>
                                    <div className="h-full rounded-full"
                                         style={{width: `${health?.index ?? 0}%`, backgroundColor: color}}/>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
