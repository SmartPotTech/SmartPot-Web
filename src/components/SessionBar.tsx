import "../assets/styles/sessionBar.css"
import {UserOutlined} from "@ant-design/icons";
import {Divider} from "antd";
import { useAuthContext } from "../context/AuthContext";
import NotificationBell from "./NotificationBell.tsx";


export default function SessionBar() {

    const { user } = useAuthContext();


    return (
        <>

            <header className="sessionBar">

                <NotificationBell user={user } />
                <Divider className="Divider" type='vertical'></Divider>

                <span className="sessionBarItem">Bienvenid@, {user?.name}</span>
                <UserOutlined className="sessionBarItem perfil"/>

            </header>

        </>
    )

}