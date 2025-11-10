import {useAuthContext} from "../contexts/AuthContext.tsx";
import {getCrop, getHistoryFromCrop} from "../api/Api.tsx";
import {Crop, History} from "../types/ApiResponses.tsx";
import {useCallback, useEffect, useState} from "react";
import {CropCard} from "../components/CropCard.tsx";
import PlotlyChart from "../components/PlotlyChart.tsx";

export default function StatusPanel() {
    const {user} = useAuthContext();
    const [history, setHistory] = useState<History[]>([]);
    const [crop, setCrop] = useState<Crop | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchCrop = useCallback(async () => {
        if (user) {
            try {
                setIsLoading(true);
                const fetchedCrop = await getCrop(user);
                setCrop(fetchedCrop);
                const fetchedHistory = await getHistoryFromCrop(user, fetchedCrop);
                setHistory(fetchedHistory);
                
            } catch (error) {
                console.error("Error fetching crop or history data: ", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [user]);


    useEffect(() => {
        fetchCrop();
    }, [fetchCrop]);

    // Obtener el último registro del historial
    const lastHistory = history.length > 0 ? history[history.length - 1] : null;
    const measures = lastHistory?.measures;

    return (
        <>
            <aside className="estado-cultivo mb-6 p-4 rounded-lg bg-green-100 text-green-800 flex items-center">
                <div className="icono">
                </div>
                <p className="mensaje-estado">
                    El estado del cultivo de 🌱 es {crop?.status || "(No hay estados)"} <strong>óptimo</strong>.
                </p>
            </aside>
            <div className="sensors inline-grid grid-cols-5 gap-4">
                <CropCard
                    imageSrc="/gotas.png"
                    imageAlt="Humedad del cultivo"
                    category="Humedad"
                    title={measures?.humidity?.toString() +"%" || "Sin datos"}
                    isLoading={isLoading}
                />

                <CropCard
                    imageSrc="/ph.png"
                    imageAlt="pH del cultivo"
                    category="El pH del cultivo"
                    title={measures?.ph?.toString() || "Sin datos"}
                    isLoading={isLoading}
                />
                <CropCard
                    imageSrc="/temperature.png"
                    imageAlt="Cultivo"
                    category="Temperatura"
                    title={measures?.temperature?.toString() +"Cº"|| "Sin datos"}
                    isLoading={isLoading}
                />

                <CropCard
                    imageSrc="/brillo.png"
                    imageAlt="Cultivo"
                    category="Brillo"
                    title={measures?.brightness?.toString() +" LUX"|| "Sin datos"}
                    isLoading={isLoading}
                />
                <CropCard
                    imageSrc="/tds.png"
                    imageAlt="Cultivo"
                    category="TDS"
                    title={measures?.tds?.toString()+" ppm" || "Sin datos"}
                    isLoading={isLoading}
                />

            </div>
            <div className="mt-4 inline-grid grid-cols-2  max-w-full">
                <PlotlyChart history={history} measure="brightness" label="Brillo"/>
                <PlotlyChart history={history} measure="humidity" label="Humedad"/>
                <PlotlyChart history={history} measure="ph" label="pH"/>
                <PlotlyChart history={history} measure="tds" label="TDS"/>
                <PlotlyChart history={history} measure="temperature" label="Temperatura"/>
            </div>

        </>
    );
}
