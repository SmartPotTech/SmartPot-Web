import {Outlet, useNavigate} from "react-router-dom";
import "../assets/styles/root.css"
import SessionBar from "../components/SessionBar";
import {useEffect} from "react";
import {useAuthContext} from "../contexts/AuthContext.tsx";
import Login from "./login.tsx";
import Loading from "../components/Loading.tsx";

import {BarChartOutlined, HomeOutlined, UserOutlined} from "@ant-design/icons";
import {SidebarFactory} from "../components/SideBarFactory/SidebarFactory.tsx";


export default function Root() {

    const {isAuthenticated, loading} = useAuthContext();
    const navigate = useNavigate();

    const icons = [HomeOutlined, BarChartOutlined,UserOutlined];
    const labels = ["Panel de inicio", "Datos Históricos","Perfil"];
    const paths = ["/panel", "/historial","/perfil"];


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
                        <div className="content">
                            <SessionBar/>
                            <Outlet/>
                            <SidebarFactory title={"SmartPot 🥬"} icons={icons} labels={labels} paths={paths}/>
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