// SidebarPC.tsx
import {SidebarInterface, SidebarProps} from "./ISideBar.ts";
import SidebarBase from "./SidebarBase";
import React from "react";

export class SidebarPC implements SidebarInterface {
    private props: SidebarProps;

    constructor(props: SidebarProps) {
        this.props = props;

    }

    render(): React.ReactElement {
        return (

            <div className="sidebar-pc">
                <SidebarBase {...this.props} />
            </div>
        );
    }
}
