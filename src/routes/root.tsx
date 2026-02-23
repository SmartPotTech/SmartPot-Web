import {Outlet, useNavigate} from "react-router-dom";
import "../shared/styles/root.css";
import SessionBar from "../shared/components/layout/SessionBar.tsx";
import {useEffect} from "react";
import {useAuthContext} from "../features/auth/contexts/AuthContext.tsx";
import Login from "../features/auth/pages/login.tsx";
import Loading from "../shared/components/ui/Loading.tsx";
import "../shared/styles/MainContainer.css";
import {BarChartOutlined, HomeOutlined, NodeIndexOutlined, ToolOutlined, UserOutlined,} from "@ant-design/icons";
import {SidebarFactory} from "../shared/components/layout/SideBarFactory/SidebarFactory.tsx";


export default function Root() {
    const {isAuthenticated, loading} = useAuthContext();
    const navigate = useNavigate();

    const icons = [
        HomeOutlined,
        BarChartOutlined,
        NodeIndexOutlined,
        ToolOutlined,
        UserOutlined,
    ];
    const labels = [
        "Panel de inicio",
        "Datos Históricos",
        "Sensores",
        "Configuración",
        "Perfil",
    ];
    const paths = ["/panel", "/historial", "/sensores", "/config", "/perfil"];

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/auth/login");
        }
    }, [loading, isAuthenticated, navigate]);

    if (loading) return <Loading/>;

    return (
        <>
            {isAuthenticated ? (
                <div className="flex flex-col flex-1">
                    <SidebarFactory
                        title={"SmartPot 🥬"}
                        icons={icons}
                        labels={labels}
                        paths={paths}
                    />

                    <div className="flex-1 flex flex-col ml-32 md:ml-20 lg:ml-32 w-full">
                        <SessionBar/>
                        <main className="h-screen pt-14 pl-2 mr-4 md:pl-4 md:pr-2 lg:pl-6 lg:pr-2">
                            <Outlet/>
                        </main>
                    </div>
                </div>
            ) : (
                <Login/>
            )}
        </>
    );
}
