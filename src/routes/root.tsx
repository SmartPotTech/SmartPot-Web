import { Outlet, useNavigate} from "react-router-dom";
import "../assets/styles/root.css"
import SessionBar from "../components/SessionBar";
import React, {useEffect} from "react";
import Content from "../components/Content.tsx";
import {useAuthContext} from "../contexts/AuthContext.tsx";
import Login from "./login.tsx";

import {BarChartOutlined, HomeOutlined} from "@ant-design/icons";
import {SidebarFactory} from "../components/SideBarFactory/SidebarFactory.tsx";


export default function Root() {

    const {isAuthenticated} = useAuthContext();
    let navigate = useNavigate();

    const icons = [HomeOutlined, BarChartOutlined];
    const labels = ["Panel de inicio", "Datos Históricos"];
    const paths = ["/panel", "/historial"];


    useEffect(() => {
        console.log(isAuthenticated)
        if (!isAuthenticated) {
            navigate("/login")
        }
    }, [isAuthenticated, navigate]);


    return (
        <>
            {
                isAuthenticated ?
                    (
                        <div className="content">

                            <SessionBar/>

                            <Content/>

                            <Outlet/>
                            <SidebarFactory title={"SmartPot 🥬"} icons={icons} labels={labels} paths={paths} />
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