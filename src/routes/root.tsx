import {Outlet, useNavigate} from "react-router-dom";
import "../shared/styles/root.css";
import SessionBar from "../shared/components/layout/SessionBar.tsx";
import {useEffect} from "react";
import {useAuthContext} from "../features/auth/contexts/AuthContext.tsx";
import Login from "../features/auth/pages/login.tsx";
import Loading from "../shared/components/ui/Loading.tsx";
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
                <div className="flex min-h-screen">
                    <SidebarFactory
                        title={"SmartPot 🥬"}
                        icons={icons}
                        labels={labels}
                        paths={paths}
                    />

                    {/* Content area: offset by sidebar width at each breakpoint */}
                    <div className="flex-1 flex flex-col
                        ml-0 max-[799px]:pb-16
                        min-[800px]:ml-[80px]
                        min-[1025px]:ml-[15rem]">
                        <SessionBar/>
                        <main className="pt-20 px-4 md:px-6 lg:px-8">
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
