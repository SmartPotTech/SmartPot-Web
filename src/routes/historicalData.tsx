import {useEffect, useState} from "react";
import {useAuthContext} from "../context/AuthContext";
import {getCrop, getHistoryFromCrop} from "../api/Api";
import {Crop, History} from "../types/ApiResponses";
import D3Chart from "../components/D3Chart.tsx";

export default function HistoricalData() {
    const [history, setHistory] = useState<History[]>([]);
    const [crop, setCrop] = useState<Crop | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true); // Estado de carga
    const [loadingLogin, setLoadingLogin] = useState<boolean>(false); // Estado de carga de login

    const {user, loading} = useAuthContext();

    // Efecto que se ejecuta al montar el componente, solo si el usuario no está autenticado
    // useEffect(() => {
    //     const loginAndFetchData = async () => {
    //         if (!isAuthenticated && !loadingLogin) {
    //             setLoadingLogin(true);
    //             try {
    //                 // Email, Password (normalmente esto sería un formulario)
    //                 await login("juan.perez@example.com", "Contraseña1");
    //             } catch (error) {
    //                 console.error("Error during login: ", error);
    //             } finally {
    //                 setLoadingLogin(false);
    //             }
    //         }
    //     };
    //     loginAndFetchData();
    // }, [isAuthenticated, login, loadingLogin]);

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
            <main className="mainContent"
                  style={{width: "100%", height: "100%", backgroundColor: "#f9fafb", padding: "2rem"}}>
                <div className="mb-6 text-center">
                    <h1 className="text-4xl font-bold text-gray-900">Datos Históricos</h1>
                </div>

                <div className="CropData bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Detalles del Cultivo</h3>
                    <div className="space-y-2">
                        <p className="text-lg font-bold text-green-600">
                            Crop ID: <span className="text-xl underline">{crop ? crop.id : "Cargando..."}</span>
                        </p>
                        <p className="text-lg text-gray-600">
                            Estado: <span className="font-semibold">{crop ? crop.status : "Cargando..."}</span>
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white shadow-md rounded-lg mb-8">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Atmosfera</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Brillo</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Humedad</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">PH</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">TDS</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Temperatura</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white">
                        {history.map((e, index) => (
                            <tr key={index} className={`border-t ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                                <td className="px-6 py-4 text-gray-700">{e.measures.atmosphere}</td>
                                <td className="px-6 py-4 text-gray-700">{e.measures.brightness}</td>
                                <td className="px-6 py-4 text-gray-700">{e.measures.humidity}</td>
                                <td className="px-6 py-4 text-gray-700">{e.measures.ph}</td>
                                <td className="px-6 py-4 text-gray-700">{e.measures.tds}</td>
                                <td className="px-6 py-4 text-gray-700">{e.measures.temperature}</td>
                                <td className="px-6 py-4 text-gray-700">{e.date}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    <D3Chart history={history} measure="brightness" label="Brillo"/>
                    <D3Chart history={history} measure="humidity" label="Humedad"/>
                    <D3Chart history={history} measure="ph" label="pH"/>
                    <D3Chart history={history} measure="tds" label="TDS"/>
                    <D3Chart history={history} measure="temperature" label="Temperatura"/>
                </div>
            </main>
        </>
    );
}
