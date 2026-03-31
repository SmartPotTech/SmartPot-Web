import { UserOutlined } from "@ant-design/icons";
import NotificationBell from "../../../features/notifications/components/NotificationBell.tsx";
import { useAuthContext } from "../../../features/auth/contexts/AuthContext.tsx";

export default function SessionBar() {

    const { user } = useAuthContext();

    return (
        <header className="z-20 top-0 right-0 fixed flex items-center justify-end h-16 px-4
            left-0 max-[799px]:w-full
            min-[800px]:left-[80px]
            min-[1025px]:left-[15rem]
            bg-[#F3F2F7]">

            <NotificationBell />

            {/* Divider vertical */}
            <div className="h-[30px] border-l-[3px] border-[#cfcdd6] ml-[30px] mr-2.5" />

            <span className="font-['Helvetica',serif] inline ml-2.5 mr-2.5 text-black font-semibold">
                👋 ¡Hola {user?.name}!
            </span>

            <a href="/perfil">
                <UserOutlined className="inline ml-2.5 mr-2.5 pr-[15px] text-[27px] text-[#00B074] rounded-full align-middle" />
            </a>
        </header>
    )
}