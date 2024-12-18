import { useAuthContext } from "../contexts/AuthContext.tsx";
import { getCrop} from "../api/Api.tsx";
import { Crop } from "../types/ApiResponses.tsx";
import { useState, useEffect } from "react";

export default function StatusPanel() {
    const { user } = useAuthContext();
    const [crop, setCrop] = useState<Crop | null>(null);

    // Función para obtener el cultivo
    const fetchCrop = async () => {
        if (user) {  // Verifica que el usuario esté disponible
            try {
                const fetchedCrop = await getCrop(user);
                setCrop(fetchedCrop); // Actualiza el estado con los datos obtenidos
                console.log(fetchedCrop); // Muestra los datos en la consola para depuración
            } catch (error) {
                console.error("Error fetching crop or history data: ", error);
            }
        }
    };

    // Llama a fetchCrop cuando el componente se monta o cuando el `user` cambia
    useEffect(() => {
        fetchCrop(); // Llama a la función para obtener el cultivo
    }, [user]); // Dependencia de `user` para actualizar si cambia

    return (
        <>
            <div className="flex bg-white rounded-lg shadow-md overflow-hidden max-w-2xl"
            style={{padding: "1rem"}}>
                {/* Image container */}
                <div className="w-1/3 relative">
                    <img
                        src={"src/assets/images/lechuga.png"}
                        alt={"title"}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Content container */}
                <div className="w-2/3 p-6">
                    {/* Category */}
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                        El estado del cultivo
                    </p>

                    {/* Title */}
                    <h2 className="mt-2 text-xl font-bold text-gray-900">
                        {crop?.status || "Cargando..."}
                    </h2>


                </div>
            </div>
        </>
    );
}
