//import React, { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext"; // Ajusta la ruta según corresponda
import { getCrop, getHistoryFromCrop } from "../api/Api"; // Ajusta la ruta según corresponda
import { Crop, History } from "../types/ApiResponses";


export default function HistoricalData() {
    const [history, setHistory] = useState<History[]>([]);
    const [crop, setCrop] = useState<Crop | null>(null);

    const { user, login } = useAuthContext();

    useEffect(() => {
        // Función de login inicial
        const loginAndFetchData = async () => {
            try {
                // Email, Password
                await login("juan.perez@example.com", "Contraseña1");
            } catch (error) {
                console.error("Error during login: ", error);
            }
        };

        loginAndFetchData();
    }, [login]);

    useEffect(() => {
        // Efecto para realizar las peticiones cuando user.id esté disponible
        const fetchCropAndHistory = async () => {
            if (user.id != undefined) {
                try {
                    const fetchedCrop = await getCrop(user);
                    setCrop(fetchedCrop);

                    const fetchedHistory = await getHistoryFromCrop(user, fetchedCrop);
                    setHistory(fetchedHistory);
                } catch (error) {
                    console.log("Error fetching crop or history data: ", error);
                }
            }
        };

        fetchCropAndHistory();
    }, [user, user.id]); // Ejecuta este efecto solo cuando user.id cambia

    return (
        <>
            <main style={{ width: "100%", height: "100%" }}>
                <div> Datos Historicos </div>

                <div className="CropData">
                    <h3>Crop</h3>
                    <p>{crop ? crop.id : "Loading..."}</p>
                    <p>{crop ? crop.status : "Loading..."}</p>
                </div>

                <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">#</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Atmosphere</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Brightness</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Humidity</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">PH</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">TDS</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Temperature</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white">
                    {history.map((e, index) => (
                        <tr key={index} className={`border-t ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                            <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.measures.atmosphere}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.measures.brightness}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.measures.humidity}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.measures.ph}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.measures.tds}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.measures.temperature}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

            </main>
        </>
    );
}
