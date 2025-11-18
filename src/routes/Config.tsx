import {useAuthContext} from "../features/auth/contexts/AuthContext.tsx";
import {getCrop} from "../features/dashboard/api/cropApi.ts";
import {getHistoryFromCrop} from "../features/historical-data/api/index.ts";
import {History} from "../features/historical-data/types";
import { useCallback, useEffect, useState } from "react";
import { CropCard } from "../features/dashboard/components/CropCard.tsx";
import { EditOutlined,SaveOutlined,MinusCircleOutlined,PlusSquareOutlined} from "@ant-design/icons";
export default function Configuration() {
  const { user } = useAuthContext();
  const [history, setHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    minimoHumedad: "",
    maximoHumedad: "",
    minimoPH: "",
    maximoPH: "",
    minimoTemperatura: "",
    maximoTemperatura: "",
    minimoBrillo: "",
    maximoBrillo: "",
    minimoTDS: "",
    maximoTDS: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Guardando cambios:", formData);
    setIsEditing(false);
  };

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
          Configuración del cultivo
        </h2>
        <p className="mt-3 text-left font-bold tracking-tight text-gray-500">
          ¡Aquí puedes ajustar los rangos de los sensores de tu cultivo!
        </p>
        <div className="flex justify-end m-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 font-semibold"
            >
              <EditOutlined /> Editar
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 font-semibold"
            >
              <SaveOutlined /> Guardar{" "}
            </button>
          )}
        </div>
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
            <Item
              label="Mínimo (%)"
              icon={<MinusCircleOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.minimoHumedad}
              onChange={(v) => handleInputChange("minimoHumedad", v)}
            />
            <Item
              label="Máximo (%)"
              icon={<PlusSquareOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.maximoHumedad}
              onChange={(v) => handleInputChange("maximoHumedad", v)}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-5 w-full max-w-3xl">
          {}
          <div className="md:flex-1">
            <CropCard
              imageSrc="/ph.png"
              imageAlt="PH del cultivo"
              category="Sensor del PH"
              title={measures?.ph?.toString() + "%" || "Sin datos"}
              isLoading={isLoading}
            />
          </div>
          {}
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            <Item
              label="Mínimo"
              icon={<MinusCircleOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.minimoPH}
              onChange={(v) => handleInputChange("minimoPH", v)}
            />
            <Item
              label="Máximo"
              icon={<PlusSquareOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.maximoPH}
              onChange={(v) => handleInputChange("maximoPH", v)}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-5 w-full max-w-3xl">
          {}
          <div className="md:flex-1">
            <CropCard
              imageSrc="/temperature.png"
              imageAlt="Temperatura del cultivo"
              category="Sensor de temperatura"
              title={measures?.temperature?.toString() + "%" || "Sin datos"}
              isLoading={isLoading}
            />
          </div>
          {}
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            <Item
              label="Mínimo (C°)"
              icon={<MinusCircleOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.minimoTemperatura}
              onChange={(v) => handleInputChange("minimoTemperatura", v)}
            />
            <Item
              label="Máximo (C°)"
              icon={<PlusSquareOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.maximoTemperatura}
              onChange={(v) => handleInputChange("maximoTemperatura", v)}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-5 w-full max-w-3xl">
          {}
          <div className="md:flex-1">
            <CropCard
              imageSrc="/brillo.png"
              imageAlt="Nivel de luz del cultivo"
              category="Sensor de nivel de luz"
              title={measures?.brightness?.toString() + "%" || "Sin datos"}
              isLoading={isLoading}
            />
          </div>
          {}
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            <Item
              label="Mínimo (Lux)"
              icon={<MinusCircleOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.minimoBrillo}
              onChange={(v) => handleInputChange("minimoBrillo", v)}
            />
            <Item
              label="Máximo (Lux)"
              icon={<PlusSquareOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.maximoBrillo}
              onChange={(v) => handleInputChange("maximoBrillo", v)}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 p-5 w-full max-w-3xl">
          {}
          <div className="md:flex-1">
            <CropCard
              imageSrc="/tds.png"
              imageAlt="Nivel de nutrientes del cultivo"
              category="Sensor de nivel de nutrientes"
              title={measures?.tds?.toString() + "%" || "Sin datos"}
              isLoading={isLoading}
            />
          </div>
          {}
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            <Item
              label="Mínimo (ppm)"
              icon={<MinusCircleOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.minimoTDS}
              onChange={(v) => handleInputChange("minimoTDS", v)}
            />
            <Item
              label="Máximo (ppm)"
              icon={<PlusSquareOutlined className="text-emerald-600" />}
              isEditing={isEditing}
              value={formData.maximoTDS}
              onChange={(v) => handleInputChange("maximoTDS", v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
interface ItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

function Item({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  placeholder,
}: ItemProps) {
  return (
    <div className="w-full flex items-center gap-5 p-4 rounded-3xl bg-white">
      <div className="flex-1">
        <p className="text-base font-bold text-white-500">{label}</p>
        {isEditing ? (
          <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-emerald-500 outline-none text-base"
          />
        ) : (
          <p className="font-medium text-slate-800">
            {value || "No especificado"}
          </p>
        )}
      </div>
    </div>
  );
}
