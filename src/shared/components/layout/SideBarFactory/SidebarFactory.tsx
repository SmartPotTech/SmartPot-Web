// SidebarFactory.tsx
import React, {useEffect, useState} from "react";
import {SidebarProps} from "./ISideBar.ts";
import {SidebarPC} from "./SideBarPC.tsx";
import {SidebarTablet} from "./SiderbarTablet.tsx";
import {SidebarPhone} from "./SidebarPhone.tsx";

export const SidebarFactory: React.FC<SidebarProps> = (props) => {
    const getSidebarInstance = (): React.ReactElement => {

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [screenWidth, setScreenWidth] = useState(window.innerWidth);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            const handleResize = () => setScreenWidth(window.innerWidth);
            window.addEventListener("resize", handleResize);

            return () => window.removeEventListener("resize", handleResize);
        }, []);

        if (screenWidth > 1024) {
            const sidebarPC = new SidebarPC(props);
            return sidebarPC.render();
        } else if (screenWidth >= 800 && screenWidth <= 1024) {
            const sidebarTablet = new SidebarTablet(props);
            return sidebarTablet.render();
        } else {
            const sidebarPhone = new SidebarPhone(props);
            return sidebarPhone.render();
        }

        throw new Error("Unexpected screen width");
    };

    return getSidebarInstance();
};
