import {Link, Outlet, useNavigate} from "react-router-dom";
import "../assets/styles/root.css"
import SessionBar from "../components/SessionBar";
import {Menu} from "antd";
import React, { useEffect } from "react";
import {BarChartOutlined, HomeOutlined} from "@ant-design/icons";
import Content from "../components/Content.tsx";
import { useAuthContext } from "../contexts/AuthContext.tsx";
import Login from "./login.tsx";
import Loading from "../components/Loading.tsx";

export default function Root() {

    const {isAuthenticated, loading} = useAuthContext();
    let navigate = useNavigate();

    const icons = [HomeOutlined, BarChartOutlined];
    const labels = ["Panel de inicio", "Datos Históricos"];
    const paths = ["/panel", "/historial"];

    const items = icons.map((icon, index) => ({
        key: String(index + 1),
        icon: React.createElement(icon),
        label: <Link to={paths[index]}>{labels[index]}</Link>,
    }));

    useEffect(() => {
        console.log(isAuthenticated)
        if (!isAuthenticated) {
            navigate("/login")
        }
    }, [isAuthenticated]);

    if (loading) return ( <Loading/> );

    return (
        <>
            {
                isAuthenticated ?
                (
                    <div className="content">
                    <div id="sidebar" className="sidebar">
                        <h1 className="title">
                            SmartPot 🥬
                        </h1>
    
                        <nav>
                            <Menu theme="light" mode="inline" defaultSelectedKeys={['1']} items={items}/>
                        </nav>
                    </div>
    
                    <SessionBar/>
    
                    <Content/>
    
                    <Outlet/>
                </div>
                )
                :
                (
                    <Login />
                )
            }

        </>
    );
}