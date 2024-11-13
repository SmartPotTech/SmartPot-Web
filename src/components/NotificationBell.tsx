import { BellOutlined } from "@ant-design/icons";
import { Notifications } from "../types/ApiResponses";
import { getNotifications } from "../api/Api";
import { useEffect, useState } from "react";


interface NotificationBellProps {
    user?: {
        id: string;
    } | null;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ user }) => {
    const [notifications, setNotifications] = useState<Notifications[]>([]);

    const fetchNotifications = async () => {
        if (user?.id) {
            try {
                const fetchedNotifications = await getNotifications(user);
                setNotifications(fetchedNotifications);
            } catch (e) {
                console.error("Error fetching notifications data: ", e);
            }
        }
    };

    useEffect(() => {
        if (user?.id) fetchNotifications();
    }, [user]);

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