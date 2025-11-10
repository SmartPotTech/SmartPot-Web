import "../assets/styles/sessionBar.css"
import {UserOutlined} from "@ant-design/icons";
import {Divider} from "antd";
import NotificationBell from "./NotificationBell.tsx";
import {useAuthContext} from "../contexts/AuthContext";

export default function SessionBar() {

    const {user} = useAuthContext();


    return (
        <>

            <header className="sessionBar z-20 pt-5 top-0 right-0 fixed flex items-center justify-end h-16 left-64
            md:left-20 lg:left-64 bg-[#F3F2F7ff]">

                <NotificationBell></NotificationBell>
                <Divider className="Divider" type='vertical'></Divider>

                <span className="sessionBarItem">Bienvenid@, {user?.name}</span>
                <a href="/panel"><UserOutlined className="sessionBarItem perfil"/></a>

            </header>

        </>
    )

}