import "../assets/styles/sessionBar.css"
import {BellOutlined, UserOutlined} from "@ant-design/icons";
import {Divider} from "antd";
import { useAuthContext } from "../context/AuthContext";
import { Notifications } from "../types/ApiResponses";
import { getNotifications } from "../api/Api";
import { useEffect, useState } from "react";

export default function SessionBar() {

    const { user } = useAuthContext();
    const [notifications, setNotifications] = useState<Notifications[]>([]);

    // TODO: Porbar si se actualizan las notificaciones en tiempo real
    const fetchNotifications = async () => {
        if (user?.id) {
            try {
                const fetchedNotifications = await getNotifications(user);
                setNotifications(fetchedNotifications)
            } catch (e) {
                console.error("Error fetching notifications data: ", e);
            }
        }
    }
    useEffect( () => {
        if(user?.id) fetchNotifications();
    }, [user]);

    return (
        <>

            <header className="sessionBar">

                <div className="notification-container">
                    <BellOutlined 
                        className="notification-icon"
                        onClick={fetchNotifications}
                    />
                    {notifications.length > 0 && (
                        <span className="notification-badge">{notifications.length}</span>
                    )}
                </div>
                <Divider className="Divider" type='vertical'></Divider>

                <span className="sessionBarItem">Bienvenid@, {user?.name}</span>
                <UserOutlined className="sessionBarItem perfil"/>

            </header>

        </>
    )

}