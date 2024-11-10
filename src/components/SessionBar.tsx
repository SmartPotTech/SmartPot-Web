import "../assets/styles/sessionBar.css"
import {UserOutlined, BellOutlined} from "@ant-design/icons";
import {Divider} from "antd";

export default function SessionBar() {

    const notificationCount = 2;
    // THIS NEED A CONTEXT
    // CONTEXT CONTAINS:
    //  - LOGGED USER DATA
    //  - NOTIFICATIONS DATA
    //

    return (
        <>

            <header className="sessionBar">

                <div className="notification-container">
                    <BellOutlined className="notification-icon"/>
                    {notificationCount > 0 && (
                        <span className="notification-badge">{notificationCount}</span>
                    )}
                </div>
                <Divider className="Divider" type= 'vertical'></Divider>

                <span className="sessionBarItem">Bienvenid@, Dinamite</span>
                <UserOutlined className="sessionBarItem perfil"  />

            </header>

        </>
    )

}