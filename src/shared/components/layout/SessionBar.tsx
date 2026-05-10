import {UserOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import NotificationBell from "../../../features/notifications/components/NotificationBell.tsx";
import {useAuthContext} from "../../../features/auth/contexts/AuthContext.tsx";

export default function SessionBar() {
    const {user} = useAuthContext();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-end px-4
            bg-page-background  border-gray-200">
            <NotificationBell/>

            <div className="h-8 border-l-2 border-gray-300 mx-4"/>

            <span className="font-sans inline mr-3 text-black font-semibold text-sm">
                ¡Hola {user?.name}!
            </span>

            <Link to="/perfil" title="Perfil">
                <UserOutlined
                    className="inline text-[27px] text-main-colour rounded-full align-middle"/>
            </Link>
        </header>
    );
}
