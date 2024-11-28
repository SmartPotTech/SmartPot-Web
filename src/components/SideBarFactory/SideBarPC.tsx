// SidebarPC.tsx
import { SidebarProps, SidebarInterface } from "./ISideBar.ts";
import SidebarBase from "./SidebarBase";

export class SidebarPC implements SidebarInterface {
    private props: SidebarProps;

    constructor(props: SidebarProps) {
        this.props = props;

    }

    render(): JSX.Element {
        return (
            
            <div className="sidebar-pc">
                <SidebarBase {...this.props} />
            </div>
        );
    }
}
