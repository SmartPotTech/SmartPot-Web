import {BellOutlined} from "@ant-design/icons";

const NotificationBell = () => {
    const notificationCount = 2;

    return (
        <div className="relative inline-block cursor-pointer">
            <BellOutlined
                className="text-2xl text-blue-500 hover:text-blue-600 transition-colors"
            />
            {notificationCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs
                      rounded-full w-5 h-5 flex items-center justify-center
                      animate-pulse">
                    {notificationCount}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;