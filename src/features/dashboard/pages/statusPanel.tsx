import {useAuthContext} from "../../auth/contexts/AuthContext.tsx";
import {getCrop} from "../api";
import {getHistoryFromCrop} from "../../historical-data/api";
import {Crop} from "../types";
import {History} from "../../historical-data";

import { useCallback, useEffect, useState } from "react";
import { CropCard } from "../components/CropCard.tsx";
import PlotlyChart from "../../../shared/components/PlotlyChart.tsx";
import Card from "../../../shared/components/Card.tsx";
const cultivo = "/cultivo.png";
const captura = "/captura.png";
const riego = "/riego.png";
export default function StatusPanel() {
  const { user } = useAuthContext();
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
      <div>
        <h2 className="mt-2 text-left text-2xl/9 font-bold tracking-tight text-gray-900">
          Estado actual de tu jardín
        </h2>
        <p className="mt-3 text-left font-bold tracking-tight text-gray-500">
          ¡Aquí puedes ver los parámetros clave de tu cultivo!
        </p>
      </div>
      <aside className="estado-cultivo mb-6 mt-7 p-4 rounded-lg bg-white text-green-800 flex items-center rounded-lg shadow-md p-3 gap-3 hover:shadow-lg transition-shadow duration-200">
        <div className="bg-green-100 rounded-3xl w-12 h-12 flex-shrink-0 flex items-center justify-center">
          <img src={cultivo} className="w-9 h-9 object-contain" />
        </div>
        <p className="mensaje-estado font-semibold">
          {" "}
          El estado de tu cultivo es{" "}
          <strong>{crop?.status || "(No hay estados)"}</strong>.
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
          category="pH"
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
          category="Nivel de luz"
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
          <Card
            padding="lg"
            shadow="sm"
            hover={true}
            className="flex items-center gap-5 cursor-pointer"
          >
            <div className="bg-green-800 rounded-full w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <img src={riego} className="w-11 h-11 object-contain" />
            </div>
            <div className="ml-[10%] mr-[15%] ">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Regar cultivo
              </h3>
              <p className="text-base font-bold tracking-tight text-gray-500">
                Activar sistema de riego automático
              </p>
            </div>
          </Card>
        </button>
        <button className="max-w-full max-h-full rounded-full">
          <Card
            padding="lg"
            shadow="sm"
            hover={true}
            className="flex items-center gap-5 cursor-pointer"
          >
            <div className="bg-green-800 rounded-full w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <img src={captura} className="w-11 h-11 object-contain" />
            </div>
            <div className="ml-[15%] mr-[15%] ">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Estimular cultivo
              </h3>
              <p className="text-base font-bold tracking-tight text-gray-500">
                Activar luz ultravioleta
              </p>
            </div>
          </Card>
        </button>
      </div>
      <div className="mt-4 mb-5 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <PlotlyChart history={history} measure="humidity" label="Humedad"/>
        <PlotlyChart history={history} measure="ph" label="pH" />
        <PlotlyChart
          history={history}
          measure="temperature"
          label="Temperatura"
        />
        <PlotlyChart history={history} measure="brightness" label="Brillo" />
      </div>
      <PlotlyChart history={history} measure="tds" label="TDS" />
    </div>
  );
}
