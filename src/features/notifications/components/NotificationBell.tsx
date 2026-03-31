import {BellOutlined} from "@ant-design/icons";
import {Notifications} from "../types";
import {getNotifications} from "../api";
import {useEffect, useState} from "react";
import {useAuthContext} from "../../auth";

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
        <div className="relative inline-flex items-center cursor-pointer">
            <BellOutlined
                className="text-2xl text-[#2D9CDB] transition-colors duration-300 ease-in-out hover:text-[#2183b9]"
                onClick={fetchNotifications}
            />
            {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ff4d4f] text-white text-xs min-w-[15px] h-5 rounded-full flex items-center justify-center px-1">
                    {notifications.length}
                </span>
            )}
        </div>
    );
};

export default NotificationBell;
