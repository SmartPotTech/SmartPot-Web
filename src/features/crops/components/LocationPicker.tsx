import { LocateFixed, MapPin, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Feedback";
import { ApiError } from "../../../lib/api/client";
import { virtualDeviceApi } from "../../../lib/api/services";
import type { Place } from "../../../lib/api/types";

export interface PickedLocation {
  name: string;
  latitude: number;
  longitude: number;
}

/** Elige el lugar cuyo clima seguirá el cultivo virtual: búsqueda por nombre o la ubicación del dispositivo. */
export function LocationPicker({ value, onChange }: { value: PickedLocation | null; onChange: (place: PickedLocation) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"search" | "locate" | null>(null);

  async function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setBusy("search");
    setError(null);
    try {
      setResults(await virtualDeviceApi.places(query.trim()));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "No se pudo buscar el lugar");
    } finally {
      setBusy(null);
    }
  }

  function locate() {
    if (!("geolocation" in navigator)) {
      setError("Este navegador no comparte la ubicación; busca el lugar por su nombre.");
      return;
    }
    setBusy("locate");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBusy(null);
        onChange({ name: "Mi ubicación", latitude: Math.round(position.coords.latitude * 1e4) / 1e4,
          longitude: Math.round(position.coords.longitude * 1e4) / 1e4 });
      },
      () => {
        setBusy(null);
        setError("No se pudo obtener tu ubicación; busca el lugar por su nombre.");
      },
      { timeout: 10_000, maximumAge: 600_000 },
    );
  }

  return (
    <div className="space-y-2">
      {value && (
        <p className="flex items-center gap-1.5 text-sm"><MapPin size={16} className="text-clay-500" />
          <strong>{value.name}</strong>
          <span className="text-muted">({value.latitude.toFixed(2)}, {value.longitude.toFixed(2)})</span>
        </p>
      )}
      <form onSubmit={search} className="flex flex-wrap gap-2" role="search">
        <label className="sr-only" htmlFor="place-search">Buscar ciudad o municipio</label>
        <input id="place-search" value={query} onChange={(event) => setQuery(event.target.value)}
          placeholder="Ciudad o municipio" maxLength={80}
          className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-sm" />
        <Button type="submit" size="sm" variant="secondary" icon={<Search size={14} />} loading={busy === "search"}>
          Buscar
        </Button>
        <Button type="button" size="sm" variant="ghost" icon={<LocateFixed size={14} />} loading={busy === "locate"}
          onClick={locate}>
          Usar mi ubicación
        </Button>
      </form>
      {error && <Alert tone="danger">{error}</Alert>}
      {results && (
        results.length === 0 ? <p className="text-sm text-muted">No encontramos ese lugar.</p> : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-white">
            {results.map((place) => (
              <li key={`${place.latitude},${place.longitude}`}>
                <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-surface"
                  onClick={() => {
                    onChange({ name: place.name, latitude: place.latitude, longitude: place.longitude });
                    setResults(null);
                    setQuery("");
                  }}>
                  <strong>{place.name}</strong>
                  <span className="text-muted">{[place.region, place.country].filter(Boolean).join(", ") &&
                    ` · ${[place.region, place.country].filter(Boolean).join(", ")}`}</span>
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
