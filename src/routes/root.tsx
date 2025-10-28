import {Outlet, useNavigate} from "react-router-dom";
import "../assets/styles/root.css"
import SessionBar from "../components/SessionBar";
import {useEffect} from "react";
import {useAuthContext} from "../contexts/AuthContext.tsx";
import Login from "./login.tsx";
import Loading from "../components/Loading.tsx";
import "../assets/styles/MainContainer.css"
import {BarChartOutlined, HomeOutlined, UserOutlined} from "@ant-design/icons";
import {SidebarFactory} from "../components/SideBarFactory/SidebarFactory.tsx";


export default function Root() {

    const {isAuthenticated, loading} = useAuthContext();
    const navigate = useNavigate();

    const icons = [HomeOutlined, BarChartOutlined, UserOutlined];
    const labels = ["Panel de inicio", "Datos Históricos", "Perfil"];
    const paths = ["/panel", "/historial", "/perfil"];


    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/auth/login");
        }
    }, [loading, isAuthenticated, navigate]);


    if (loading) return (<Loading/>);

    return (
        <>
            {
                isAuthenticated ?
                    (
                        <div className="flex flex-col flex-1">
                            <SidebarFactory title={"SmartPot 🥬"} icons={icons} labels={labels} paths={paths}/>

                            <div className="flex-1 flex flex-col ml-64 md:ml-20 lg:ml-40">
                                <SessionBar/>
                                <main
                                    className=" h-screen pt-14">
                                    <Outlet/>
                                </main>
                            </div>


                        </div>
                    )
                    :
                    (
                        <Login/>
                    )
            }

        </>
    );
}