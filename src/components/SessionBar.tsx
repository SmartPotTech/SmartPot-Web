import "../assets/styles/sessionBar.css"
import {UserOutlined} from "@ant-design/icons";
import {Divider} from "antd";
import NotificationBell from "./NotificationBell.tsx";
import { useAuthContext } from "../contexts/AuthContext";

export default function SessionBar() {

    const { user, logout } = useAuthContext();


    return (
        <>

            <header className="sessionBar">

                <NotificationBell user={user } />
                <Divider className="Divider" type='vertical'></Divider>

                <span className="sessionBarItem">Bienvenid@, {user?.name}</span>
                <UserOutlined className="sessionBarItem perfil"/>

                <button onClick={logout}> Logout </button>

            </header>

        </>
    )

}