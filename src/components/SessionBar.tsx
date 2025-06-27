import "../assets/styles/sessionBar.css"
import {UserOutlined} from "@ant-design/icons";
import {Divider} from "antd";
import NotificationBell from "./NotificationBell.tsx";
import { useAuthContext } from "../contexts/AuthContext";

export default function SessionBar() {

    const { user} = useAuthContext();


    return (
        <>

            <header className="sessionBar z-20">

                <NotificationBell></NotificationBell>
                <Divider className="Divider" type='vertical'></Divider>

                <span className="sessionBarItem">Bienvenid@, {user?.name}</span>
                <UserOutlined className="sessionBarItem perfil"/>

            </header>

        </>
    )

}