import "../../styles/sessionBar.css"
import {UserOutlined} from "@ant-design/icons";
import {Divider} from "antd";
import NotificationBell from "../../../features/notifications/components/NotificationBell.tsx";
import {useAuthContext} from "../../../features/auth/contexts/AuthContext.tsx";

export default function SessionBar() {

    const {user} = useAuthContext();


    return (
        <>

            <header className="sessionBar z-20 pt-2 top-0 right-0 fixed flex items-center justify-end h-18 left-64
            md:left-20 lg:left-64 bg-[#F3F2F7ff]">

                <NotificationBell></NotificationBell>
                <Divider className="Divider" type='vertical'></Divider>
                <span className="sessionBarItem font-semibold ">👋 ¡Hola {user?.name}!</span>
                <a href="/perfil"><UserOutlined className="sessionBarItem perfil"/></a>
            </header>

        </>
    )

}