import {useAuthContext} from "../contexts/AuthContext.tsx";
import {getCrop} from "../api/Api.tsx";
import {Crop} from "../types/ApiResponses.tsx";
import {useCallback, useEffect, useState} from "react";
import {CropCard} from "../components/CropCard.tsx";

export default function StatusPanel() {
    const {user} = useAuthContext();
    const [crop, setCrop] = useState<Crop | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCrop = useCallback(async () => {
        if (user) {
            try {
                setIsLoading(true);
                const fetchedCrop = await getCrop(user);
                setCrop(fetchedCrop);
                console.log(fetchedCrop);
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

    return (
        <>
            <div className="sensors inline-grid grid-cols-3 gap-4">


                <CropCard
                    imageSrc="/lechuga.png"
                    imageAlt="Cultivo"
                    category="El estado del cultivo"
                    title={crop?.status || "Sin estado"}
                    isLoading={isLoading}
                /><CropCard
                    imageSrc="/lechuga.png"
                    imageAlt="Cultivo"
                    category="El estado del cultivo"
                    title={crop?.status || "Sin estado"}
                    isLoading={isLoading}
                />
                <CropCard
                    imageSrc="/lechuga.png"
                    imageAlt="pH del cultivo"
                    category="El pH del cultivo"
                    title={crop?.status || "Sin estado"}
                    isLoading={isLoading}
                />
                <CropCard
                    imageSrc="/lechuga.png"
                    imageAlt="Humedad del cultivo"
                    category="La humedad del cultivo"
                    title={crop?.status || "Sin estado"}
                    isLoading={isLoading}
                />
                <CropCard
                    imageSrc="/lechuga.png"
                    imageAlt="Cultivo"
                    category="El estado del cultivo"
                    title={crop?.status || "Sin estado"}
                    isLoading={isLoading}
                />
                <CropCard
                    imageSrc="/lechuga.png"
                    imageAlt="Cultivo"
                    category="El estado del cultivo"
                    title={crop?.status || "Sin estado"}
                    isLoading={isLoading}
                />
            </div>
        </>
    );
}
