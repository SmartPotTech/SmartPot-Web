//import React, { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext"; // Ajusta la ruta según corresponda
import { getCrop, getHistoryFromCrop } from "../api/Api"; // Ajusta la ruta según corresponda
import { Crop, History } from "../types/ApiResponses";


export default function DatosHistoricos() {
    const [history, setHistory] = useState<History[]>([]);
    const [crop, setCrop] = useState<Crop | null>(null);

    const { user, login } = useAuthContext();

    useEffect(() => {
        // Función de login inicial
        const loginAndFetchData = async () => {
            // Email, Password
            await login("juan.perez@example.com", "Contraseña1");
        };

        loginAndFetchData();
    }, []);

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
    }, [user.id]); // Ejecuta este efecto solo cuando user.id cambia

    return (
        <>
            <main style={{ width: "100%", height: "100%" }}>
                <div> Datos Historicos </div>

                <div className="CropData">
                    <h3>Crop</h3>
                    <p>{crop ? crop.id : "Loading..."}</p>
                </div>

                <table className="table CropHistory">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                            <th scope="col">Atmosphere</th>
                            <th scope="col">Brightness</th>
                            <th scope="col">Humidity</th>
                            <th scope="col">PH</th>
                            <th scope="col">TDS</th>
                            <th scope="col">Temperature</th>
                            <th scope="col">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((e, index) => (
                            <tr key={index}>
                                <th scope="row"> {index + 1} </th>
                                <td> {e.measures.atmosphere} </td>
                                <td> {e.measures.brightness} </td>
                                <td> {e.measures.humidity} </td>
                                <td> {e.measures.ph} </td>
                                <td> {e.measures.tds} </td>
                                <td> {e.measures.temperature} </td>
                                <td> {e.date} </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </>
    );
}
