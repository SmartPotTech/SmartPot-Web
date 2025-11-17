// SidebarMobile.tsx
import {SidebarInterface, SidebarProps} from "./ISideBar.ts";
import SidebarBaseMobile from "./SidebarBaseMobile.tsx";
import React from "react";


export class SidebarPhone implements SidebarInterface {
    private props: SidebarProps;

    constructor(props: SidebarProps) {
        this.props = props;
    }

    render(): React.ReactElement {
        return (
            <div className="sidebar-mobile">
                <SidebarBaseMobile
                    icons={this.props.icons}
                    labels={[]}
                    paths={this.props.paths}
                    title="title"/>
            </div>
        );
    }
}
