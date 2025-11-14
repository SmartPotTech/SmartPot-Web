import {useAuthContext} from "../contexts/AuthContext.tsx";
import {getCrop, getHistoryFromCrop} from "../api/Api.tsx";
import {Crop, History} from "../types/ApiResponses.tsx";
import {useCallback, useEffect, useState} from "react";
import {CropCard} from "../components/CropCard.tsx";
import PlotlyChart from "../components/PlotlyChart.tsx";
import Card from "../components/Card.tsx";
import {FileSearchOutlined, ThunderboltFilled} from "@ant-design/icons";

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
        <div className="w-full max-w-full">
            <aside className="estado-cultivo mb-6 p-4 rounded-lg bg-green-100 text-green-800 flex items-center ">
                <div className="icono">
                </div>
                <p className="mensaje-estado">
                    El estado del cultivo de 🌱 es <strong>{crop?.status || "(No hay estados)"}</strong>.
                </p>
            </aside>
            <div className="sensors grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full mb-6">
                <CropCard
                    imageSrc="/gotas.png"
                    imageAlt="Humedad del cultivo"
                    category="Humedad"
                    title={measures?.humidity?.toString() + "%" || "Sin datos"}
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
                    title={measures?.temperature?.toString() + "Cº" || "Sin datos"}
                    isLoading={isLoading}
                />

                <CropCard
                    imageSrc="/brillo.png"
                    imageAlt="Cultivo"
                    category="Brillo"
                    title={measures?.brightness?.toString() + " LUX" || "Sin datos"}
                    isLoading={isLoading}
                />
                <CropCard
                    imageSrc="/tds.png"
                    imageAlt="Cultivo"
                    category="TDS"
                    title={measures?.tds?.toString() + " ppm" || "Sin datos"}
                    isLoading={isLoading}
                />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 p-5">
                <button className="max-w-full max-h-full">


                <Card padding="lg" shadow="sm" hover={true} className="flex items-center gap-5 cursor-pointer">
                    <div className="w-15 h-15 rounded-full bg-gradient-to-br from-[#00B074ff] to-[#29BD8A] flex items-center justify-center flex-shrink-0">
                        <ThunderboltFilled className="text-2xl text-white"/>
                    </div>
                    <div className="ml-[10%] mr-[15%] ">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Regar cultivo</h3>
                        <p className="text-sm text-gray-600">Activar sistema de riego automático</p>
                    </div>
                </Card>
                </button>
                <button className="max-w-full max-h-full">
                <Card padding="lg" shadow="sm" hover={true} className="flex items-center gap-5 cursor-pointer">
                    <div className="w-15 h-15 rounded-full bg-gradient-to-br from-[#00B074ff] to-[#29BD8A] flex items-center justify-center flex-shrink-0">
                        <FileSearchOutlined className="text-2xl text-white" />
                    </div>
                    <div className="ml-[15%] mr-[15%] ">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Tomar lecturas</h3>
                        <p className="text-sm text-gray-600">Registrar mediciones actuales</p>
                    </div>
                </Card>
                </button>

            </div>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">

                <PlotlyChart history={history} measure="humidity" label="Humedad"/>
                <PlotlyChart history={history} measure="ph" label="pH"/>
                <PlotlyChart history={history} measure="temperature" label="Temperatura"/>
                <PlotlyChart history={history} measure="brightness" label="Brillo"/>

            </div>
            <PlotlyChart history={history} measure="tds" label="TDS"/>

        </div>
    );
}
