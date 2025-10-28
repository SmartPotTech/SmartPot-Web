import {useEffect, useState} from "react";
import {useAuthContext} from "../contexts/AuthContext";
import {getCrop, getHistoryFromCrop, getHistoryFromDateRange} from "../api/Api";
import {Crop, History} from "../types/ApiResponses";
import PlotlyChart from "../components/PlotlyChart.tsx";
import "../assets/styles/MainContainer.css";
import Loading from "../components/Loading";

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {subDays, subMonths} from "date-fns";
import {DateRange, RangeKeyDict} from 'react-date-range';
import Dropdown from "../components/Dropdown";

export default function HistoricalData() {
    const [history, setHistory] = useState<History[]>([]);
    const [crop, setCrop] = useState<Crop | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true); // Estado de carga
    const [loadingLogin] = useState<boolean>(false); // Estado de carga de login
    const [toggleTable, setToggleTable] = useState<boolean>(true)

    const {user, loading} = useAuthContext();

    const [date, setDate] = useState<[{
        startDate: Date | undefined,
        endDate: Date | undefined,
        key: string
    }]>([{
        startDate: new Date(),
        endDate: subDays(new Date(), 7),
        key: 'selection'
    }]);
    const [rangeText, setRangeText] = useState("Sin rango selecionado");

    const handleDateSelect = (ranges: RangeKeyDict) => {
        const startDate = ranges.selection.startDate;
        const endDate = ranges.selection.endDate;
        if (endDate != undefined && startDate != undefined) {
            setDate(prevDate => [{...prevDate[0], startDate, endDate}]);
            console.log(date[0].startDate + "\n" + date[0].endDate);
            setRangeText(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        }
    };

    const fetchCropAndHistoryByRange = async () => {
        console.log("Trying to fetch!")
        if (user?.id) {
            setLoadingData(true); // Activar carga de datos
            try {
                if (date[0].startDate != undefined && date[0].endDate != undefined) {
                    const fetchedCrop = await getCrop(user);
                    setCrop(fetchedCrop);
                    const fetchedHistory = await getHistoryFromDateRange(
                        user,
                        fetchedCrop,
                        {
                            startDate: date[0].startDate.toISOString(),
                            endDate: date[0].endDate.toISOString()
                        }
                    );
                    setHistory(fetchedHistory);
                }
            } catch (error) {
                console.error("Error fetching crop or history data: ", error);
            } finally {
                setLoadingData(false); // Finaliza la carga de datos
            }
        }
    }

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
        return <Loading/>; // Muestra un mensaje de carga mientras el proceso está en marcha
    }

    if (!user?.id) {
        return <div>Failed to authenticate. Please try again.</div>; // Si no se puede autenticar, muestra un mensaje
    }

    return (
        <>

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

                <div className="flex content-between justify-between">
                        <span className="m-4">
                            <Dropdown buttonLabel={rangeText}>
                                <DateRange
                                    onChange={handleDateSelect}
                                    ranges={date}
                                    direction="horizontal"
                                    showPreview={true}
                                    moveRangeOnFirstSelection={true}
                                    months={2}
                                    shownDate={subMonths(new Date(), 1)}
                                    initialFocusedRange={[0, 1]}
                                    maxDate={new Date()}
                                />
                            </Dropdown>
                            <button
                                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm m-2 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                onClick={fetchCropAndHistoryByRange}
                            >
                                Filtrar
                            </button>
                        </span>
                    <span className="m-4">
                            <button
                                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm m-2 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                onClick={() => setToggleTable(!toggleTable)}
                            > {
                                toggleTable ?
                                    ("Cambiar a graficas")
                                    :
                                    ("Cambiar a tabla")
                            } </button>
                        </span>
                </div>


                {
                    toggleTable ?
                        (
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

                        )
                        :
                        (
                            <div className="overflow-auto max-w-full">
                                <PlotlyChart history={history} measure="brightness" label="Brillo"/>
                                <PlotlyChart history={history} measure="humidity" label="Humedad"/>
                                <PlotlyChart history={history} measure="ph" label="pH"/>
                                <PlotlyChart history={history} measure="tds" label="TDS"/>
                                <PlotlyChart history={history} measure="temperature" label="Temperatura"/>
                            </div>
                        )
                }

            </div>

        </>

    );

}
