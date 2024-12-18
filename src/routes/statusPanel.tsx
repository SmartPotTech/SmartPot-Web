import { useAuthContext } from "../contexts/AuthContext.tsx";
import { getCrop} from "../api/Api.tsx";
import { Crop } from "../types/ApiResponses.tsx";
import { useState, useEffect } from "react";

export default function StatusPanel() {
    const { user } = useAuthContext();
    const [crop, setCrop] = useState<Crop | null>(null);

    const fetchCrop = async () => {
        if (user) {
            try {
                const fetchedCrop = await getCrop(user);
                setCrop(fetchedCrop);
                console.log(fetchedCrop);
            } catch (error) {
                console.error("Error fetching crop or history data: ", error);
            }
        }
    };


    useEffect(() => {
        fetchCrop();
    }, [user]);

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
