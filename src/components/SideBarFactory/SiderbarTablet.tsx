// SidebarTablet.tsx
//import React from "react";
import {SidebarInterface, SidebarProps} from "./ISideBar.ts";
import SidebarBase from "./SidebarBase";

export class SidebarTablet implements SidebarInterface {
    private props: SidebarProps;

    constructor(props: SidebarProps) {
        this.props = props;
    }

    render(): JSX.Element {


        return (
            <div className="sidebar-tablet">
                <SidebarBase
                    title={"🥬"}
                    icons={this.props.icons}
                    labels={[]} // Pasamos etiquetas vacías
                    paths={this.props.paths}
                />
            </div>
        );
    }
}
