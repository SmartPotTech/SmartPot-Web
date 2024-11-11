import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext"; // Ajusta la ruta según corresponda
import { getCrop, getHistoryFromCrop } from "../api/Api"; // Ajusta la ruta según corresponda
import { Crop, History } from "../types/ApiResponses";

export default function HistoricalData() {
    const [history, setHistory] = useState<History[]>([]);
    const [crop, setCrop] = useState<Crop | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true); // Estado de carga
    const [loadingLogin, setLoadingLogin] = useState<boolean>(false); // Estado de carga de login

    const { user, login, isAuthenticated, loading } = useAuthContext();

    // Efecto que se ejecuta al montar el componente, solo si el usuario no está autenticado
    useEffect(() => {
        const loginAndFetchData = async () => {
            if (!isAuthenticated && !loadingLogin) {
                setLoadingLogin(true);
                try {
                    // Email, Password (normalmente esto sería un formulario)
                    await login("juan.perez@example.com", "Contraseña1");
                } catch (error) {
                    console.error("Error during login: ", error);
                } finally {
                    setLoadingLogin(false);
                }
            }
        };
        loginAndFetchData();
    }, [isAuthenticated, login, loadingLogin]);

    // Efecto para obtener datos del cultivo y su historial una vez que el usuario esté autenticado
    useEffect(() => {
        const fetchCropAndHistory = async () => {
            if (user?.id) {
                setLoadingData(true); // Activar carga de datos
                try {
                    const fetchedCrop = await getCrop(user);
                    setCrop(fetchedCrop);

                    const fetchedHistory = await getHistoryFromCrop(user, fetchedCrop);
                    setHistory(fetchedHistory);
                } catch (error) {
                    console.error("Error fetching crop or history data: ", error);
                } finally {
                    setLoadingData(false); // Finaliza la carga de datos
                }
            }
        };

        if (user?.id) {
            fetchCropAndHistory();
        }
    }, [user]); // Dependemos solo de `user` porque es lo que determina si se puede hacer la solicitud

    // Estado de carga de datos o login
    if (loading || loadingLogin || loadingData) {
        return <div>Loading...</div>; // Muestra un mensaje de carga mientras el proceso está en marcha
    }

    if (!user?.id) {
        return <div>Failed to authenticate. Please try again.</div>; // Si no se puede autenticar, muestra un mensaje
    }

    return (
        <>
            <main style={{ width: "100%", height: "100%" }}>
                <div> Datos Historicos </div>

                <div className="CropData">
                    <h3>Crop</h3>
                    <p className="text-3xl font-bold underline">{crop ? crop.id : "Loading..."}</p>
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
