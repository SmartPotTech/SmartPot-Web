import {BellOutlined} from "@ant-design/icons";
import {Notifications} from "../types";
import {getNotifications} from "../api";
import {useEffect, useState} from "react";
import {useAuthContext} from "../../auth/contexts/AuthContext.tsx";

const NotificationBell: React.FC = () => {
    const {user} = useAuthContext();
    const [notifications, setNotifications] = useState<Notifications[]>([]);

    const fetchNotifications = async () => {
        if (user?.id && user?.authToken) {
            try {
                const fetchedNotifications = await getNotifications(user);
                setNotifications(fetchedNotifications);
            } catch (e) {
                console.error("Error fetching notifications data: ", e);
            }
        }
    };

    useEffect(() => {
            if (user?.id && user?.authToken) fetchNotifications();
        },
        [user]);

    return (
        <div className="notification-container">
            <BellOutlined
                className="notification-icon"
                onClick={fetchNotifications}
            />
            {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
            )}
        </div>
    );
};

export default NotificationBell;
