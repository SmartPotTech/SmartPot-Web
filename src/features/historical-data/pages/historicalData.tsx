import {useEffect, useState} from "react";
import {useAuthContext} from "../../auth";
import {getHistoryFromCrop, getHistoryFromDateRange} from "../api";
import {Crop, getCrop} from "../../dashboard";
import {History} from "../types";
import PlotlyChart from "../../../shared/components/PlotlyChart.tsx";
import "../../../shared/styles/MainContainer.css";
import Loading from "../../../shared/components/ui/Loading.tsx";
import Card from "../../../shared/components/Card.tsx";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {subDays, subMonths} from "date-fns";
import {DateRange, RangeKeyDict} from "react-date-range";
import Dropdown from "../../../shared/components/ui/Dropdown.tsx";

const cultivo = "/idcultivo.png";
const estado = "/estado.png";

export default function HistoricalData() {
    const [history, setHistory] = useState<History[]>([]);
    const [crop, setCrop] = useState<Crop | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true); // Estado de carga
    const [loadingLogin] = useState<boolean>(false); // Estado de carga de login
    const [toggleTable, setToggleTable] = useState<boolean>(true);

    const {user, loading} = useAuthContext();

    const [date, setDate] = useState<
        [
            {
                startDate: Date | undefined;
                endDate: Date | undefined;
                key: string;
            }
        ]
    >([
        {
            startDate: new Date(),
            endDate: subDays(new Date(), 7),
            key: "selection",
        },
    ]);
    const [rangeText, setRangeText] = useState("Seleccione un rango");

    const handleDateSelect = (ranges: RangeKeyDict) => {
        const startDate = ranges.selection.startDate;
        const endDate = ranges.selection.endDate;
        if (endDate != undefined && startDate != undefined) {
            setDate((prevDate) => [{...prevDate[0], startDate, endDate}]);
            console.log(date[0].startDate + "\n" + date[0].endDate);
            setRangeText(
                `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            );
        }
    };

    const fetchCropAndHistoryByRange = async () => {
        console.log("Trying to fetch!");
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
                            endDate: date[0].endDate.toISOString(),
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
    };

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
        <div className="max-w-full w-screen">
            <div className="mb-6 text-center">
                <h2 className="mt-2 text-left text-2xl/9 font-bold tracking-tight text-gray-900">
                    Datos históricos
                </h2>{" "}
                <p className="mt-3 text-left font-bold tracking-tight text-gray-500">
                    ¡Aquí puedes ver a detalle el registro histótico de tu cultivo!
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 p-5">
                <Card
                    padding="lg"
                    shadow="sm"
                    hover={true}
                    className="flex items-center gap-5 cursor-pointer"
                >
                    <div className="bg-green-800 rounded-full w-16 h-16 flex-shrink-0 flex items-center justify-center">
                        <img src={cultivo} className="w-11 h-11 object-contain"/>
                    </div>
                    <div className="ml-[10%] mr-[15%] ">
                        <h3 className="text-lg font-bold text-green-600">
                            {" "}
                            <span className="text-xl underline">
                {crop ? crop.id : "Cargando..."}
              </span>
                        </h3>
                        <p className="text-base font-bold tracking-tight text-gray-500">
                            Crop ID
                        </p>
                    </div>
                </Card>
                <Card
                    padding="lg"
                    shadow="sm"
                    hover={true}
                    className="flex items-center gap-5 cursor-pointer"
                >
                    <div className="bg-green-800 rounded-full w-16 h-16 flex-shrink-0 flex items-center justify-center">
                        <img src={estado} className="w-11 h-11 object-contain"/>
                    </div>
                    <div className="ml-[10%] mr-[15%] ">
                        <h3 className="text-lg font-bold text-green-600">
                            {" "}
                            <span className="font-semibold">
                {crop ? crop.status : "Cargando..."}
              </span>
                        </h3>
                        <p className="text-base font-bold tracking-tight text-gray-500">
                            Estado
                        </p>
                    </div>
                </Card>
            </div>

            <div className="bg-white shadow-md rounded-lg mb-8 p-4 ">
                <div className="flex content-between justify-between max-w-full ">
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
                className="inline-flex ml-5 font-bold items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-800 rounded-lg transition-colors font-medium"
                onClick={fetchCropAndHistoryByRange}
            >
              Filtrar
            </button>
          </span>
                    <span className="m-4">
            <button
                className="inline-flex font-bold items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 outline-2 outline-offset-0 outline-emerald-600 hover:text-emerald-100 hover:bg-emerald-700 rounded-lg transition-colors font-medium"
                onClick={() => setToggleTable(!toggleTable)}
            >
              {" "}
                {toggleTable ? "Vista de gráficas" : "Vista de tabla"}{" "}
            </button>
          </span>
                </div>

                {toggleTable ? (
                    <div className="overflow-x-auto rounded-2x1">
                        <table className="min-w-full table-auto border-collapse text-sm rounded-2x1">
                            <thead className="bg-green-800">
                            <tr>
                                <th className="px-6 py-4 text-center text-base font-semibold text-white">
                                    #
                                </th>
                                <th className="px-6 py-4 text-center text-base font-semibold text-white">
                                    Atmósfera
                                </th>
                                <th className="px-6 py-4 text-center text-base font-semibold text-white">
                                    Brillo
                                </th>
                                <th className="px-6 py-4 text-center text-base font-semibold text-white">
                                    Humedad
                                </th>
                                <th className="px-6 py-4 text-center text-base font-semibold text-white">
                                    PH
                                </th>
                                <th className="px-6 py-4 text-center text-base font-semibold text-white">
                                    TDS
                                </th>
                                <th className="px-6 py-4 text-center text-base font-semibold text-white">
                                    Temperatura
                                </th>
                                <th className="px-6 py-4 text-center text-base font-semibold text-white">
                                    Fecha
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white">
                            {history.map((e, index) => (
                                <tr
                                    key={index}
                                    className={`border-t ${
                                        index % 2 === 0 ? "bg-gray-50" : ""
                                    }`}
                                >
                                    <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {e.measures.atmosphere}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {e.measures.brightness}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {e.measures.humidity}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{e.measures.ph}</td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {e.measures.tds}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">
                                        {e.measures.temperature}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{e.date}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>

            {!toggleTable && (
                <>
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                        <PlotlyChart
                            history={history}
                            measure="brightness"
                            label="Brillo"
                        />
                        <PlotlyChart history={history} measure="humidity" label="Humedad"/>
                        <PlotlyChart history={history} measure="ph" label="pH"/>
                        <PlotlyChart history={history} measure="tds" label="TDS"/>
                    </div>
                    <div className="mt-4 w-full">
                        <PlotlyChart
                            history={history}
                            measure="temperature"
                            label="Temperatura"
                        />
                    </div>
                </>
            )}
        </div>
    );
}
