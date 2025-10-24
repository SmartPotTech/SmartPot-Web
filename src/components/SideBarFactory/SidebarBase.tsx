// SidebarBase.tsx
import React, { useState } from "react";

import {Link} from "react-router-dom";
import {SidebarProps} from "./ISideBar.ts";
import {useAuthContext} from "../../contexts/AuthContext.tsx";
import {LogoutOutlined} from "@ant-design/icons";

const SidebarBase: React.FC<SidebarProps> = ({title, icons, labels, paths}) => {

    const {logout} = useAuthContext();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    return (
        <div id="sidebar" className="sidebar font-['Merriweather_Sans',sans-serif] h-screen fixed top-0
        pt-8">
            <h1 className="title text-3xl pb-5 pl-5 font-bold
                md:text-xl md:pl-0 md:pb-3
                lg:text-3xl lg:pl-5 lg:pb-5">{title}</h1>
            <nav className="px-2">
                {icons.map((Icon, index) => {
                    const isActive = location.pathname === paths[index];
                    const isHovered = hoveredIndex === index;

                    return (
                        <Link
                            key={index}
                            to={paths[index]}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`
                                flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200
                                md:justify-center md:px-2
                                lg:justify-start lg:px-4
                                hover:bg-[#29BD8A] 
                                ${isActive && !isHovered
                                ? 'bg-[#29BD8A]/15 text-[#29BD8A] '
                                : ''
                            }
                                ${isHovered && !isActive
                                ? 'hover:bg-gray-200'
                                : ''
                            }
                                ${!isActive && !isHovered
                                ? 'hover:bg-gray-100'
                                : ''
                            }
                            `}
                        >
                            <Icon className="text-xl flex-shrink-0" />
                            <span className="md:hidden lg:inline font-medium">
                                {labels[index]}
                            </span>
                        </Link>
                    );
                })}
            </nav>
            <button className="logout left-3 absolute bottom-0 bg-white" onClick={logout}><LogoutOutlined/></button>
        </div>
    );
};

export default SidebarBase;
