// SidebarMobile.tsx
import {SidebarInterface, SidebarProps} from "./ISideBar";
import SidebarBaseMobile from "./SidebarBaseMobile.tsx";


export class SidebarPhone implements SidebarInterface {
    private props: SidebarProps;

    constructor(props: SidebarProps) {
        this.props = props;
    }

    render(): JSX.Element {
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
