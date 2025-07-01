// SidebarBase.tsx
import React from "react";
import {Menu} from "antd";
import {Link} from "react-router-dom";
import {SidebarProps} from "./ISideBar.ts";
import {useAuthContext} from "../../contexts/AuthContext.tsx";
import {LogoutOutlined} from "@ant-design/icons";

const SidebarBase: React.FC<SidebarProps> = ({title, icons, labels, paths}) => {
    const items = icons.map((Icon, index) => ({
        key: String(index + 1),
        icon: <Icon style={{fontSize: '20px',}}/>, // Crea el elemento del ícono
        label: <Link to={paths[index]}>{labels[index]}</Link>, // Link con etiqueta
    }));
    const {logout} = useAuthContext();

    return (
        <div id="sidebar" className="sidebar">
            <h1 className="title">{title}</h1>
            <nav>
                <Menu theme="light" mode="inline" defaultSelectedKeys={["1"]} items={items}/>
            </nav>
            <button className="logout" onClick={logout}><LogoutOutlined/></button>
        </div>
    );
};

export default SidebarBase;
