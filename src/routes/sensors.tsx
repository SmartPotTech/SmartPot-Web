import { useAuthContext } from "../features/auth/contexts/AuthContext.tsx";
import { getCrop } from "../features/dashboard/api/cropApi.ts";
import { getHistoryFromCrop } from "../features/historical-data/api/index.ts";
import { History } from "../features/historical-data/types";
import { useCallback, useEffect, useState } from "react";
import { CropCard } from "../features/dashboard/components/CropCard.tsx";
import { SyncOutlined, DragOutlined } from "@ant-design/icons";
export default function SensorsPanel() {
  const { user } = useAuthContext();
  const [history, setHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCrop = useCallback(async () => {
    if (user) {
      try {
        setIsLoading(true);
        const fetchedCrop = await getCrop(user);
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
    <div className="max-w-full w-screen">
      <div>
        <h2 className="mt-2 text-left text-2xl/9 font-bold tracking-tight text-gray-900">
          Sensores del jardín
        </h2>
        <p className="mt-3 text-left font-bold tracking-tight text-gray-500">
          ¡Aquí puedes ver los sensores en funcionamiento de tu cultivo!
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full mt-5">
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-5 w-full max-w-3xl">
          {}
          <div className="md:flex-1">
            <CropCard
              imageSrc="/gotas.png"
              imageAlt="Humedad del cultivo"
              category="Sensor de humedad"
              title={measures?.humidity?.toString() + "%" || "Sin datos"}
              isLoading={isLoading}
            />
          </div>
          {}
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-500 font-semibold"
              onClick={fetchCrop}
            >
              <DragOutlined />
              Calibrar
            </button>

            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 font-semibold"
              onClick={fetchCrop}
            >
              <SyncOutlined />
              Actualizar medida
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-5 w-full max-w-3xl">
          {}
          <div className="md:flex-1">
            <CropCard
              imageSrc="/ph.png"
              imageAlt="PH del cultivo"
              category="Sensor del PH"
              title={measures?.ph?.toString() || "Sin datos"}
              isLoading={isLoading}
            />
          </div>
          {}
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-500 font-semibold"
              onClick={fetchCrop}
            ><DragOutlined />
              Calibrar
            </button>

            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 font-semibold"
              onClick={fetchCrop}
            ><SyncOutlined />
              Actualizar medida
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-5 w-full max-w-3xl">
          {}
          <div className="md:flex-1">
            <CropCard
              imageSrc="/temperature.png"
              imageAlt="Temperatura del cultivo"
              category="Sensor de temperatura"
              title={measures?.temperature?.toString() + " Cº" || "Sin datos"}
              isLoading={isLoading}
            />
          </div>
          {}
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-500 font-semibold"
              onClick={fetchCrop}
            ><DragOutlined />
              Calibrar
            </button>

            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 font-semibold"
              onClick={fetchCrop}
            ><SyncOutlined />
              Actualizar medida
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-5 w-full max-w-3xl">
          {}
          <div className="md:flex-1">
            <CropCard
              imageSrc="/brillo.png"
              imageAlt="Nivel de luz del cultivo"
              category="Sensor de nivel de luz"
              title={measures?.brightness?.toString() + " LUX" || "Sin datos"}
              isLoading={isLoading}
            />
          </div>
          {}
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-500 font-semibold"
              onClick={fetchCrop}
            ><DragOutlined />
              Calibrar
            </button>

            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 font-semibold"
              onClick={fetchCrop}
            ><SyncOutlined />
              Actualizar medida
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-5 w-full max-w-3xl">
          {}
          <div className="md:flex-1">
            <CropCard
              imageSrc="/tds.png"
              imageAlt="Nivel de nutrientes del cultivo"
              category="Sensor de nivel de nutrientes"
              title={measures?.tds?.toString() + " ppm" || "Sin datos"}
              isLoading={isLoading}
            />
          </div>
          {}
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-500 font-semibold"
              onClick={fetchCrop}
            ><DragOutlined />
              Calibrar
            </button>

            <button
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 font-semibold"
              onClick={fetchCrop}
            ><SyncOutlined />
              Actualizar medida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
