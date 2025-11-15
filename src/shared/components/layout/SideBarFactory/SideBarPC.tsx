// SidebarPC.tsx
import {SidebarInterface, SidebarProps} from "./ISideBar.ts";
import SidebarBase from "./SidebarBase.tsx";
import React from "react";

export class SidebarPC implements SidebarInterface {
    private props: SidebarProps;

    constructor(props: SidebarProps) {
        this.props = props;

    }

    render(): React.ReactElement {
        return (

            <div className="sidebar fixed left-0 top-0 z-9999 flex h-screen w-[15rem]
             flex-col pt-5 bg-white shadow-lg items-center">
                <SidebarBase {...this.props} />
            </div>
        );
    }
}
