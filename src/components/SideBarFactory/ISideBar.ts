// SidebarInterface.ts
import {JSX} from "react";

export interface SidebarProps {
    title: string;
    icons: React.ElementType[]; // Tipos de los íconos
    labels: string[];
    paths: string[];
}


export interface SidebarInterface {
    render(): JSX.Element;
}
