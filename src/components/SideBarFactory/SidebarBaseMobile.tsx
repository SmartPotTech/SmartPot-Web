import React from "react";
import {BottomNavigation, BottomNavigationAction} from "@mui/material";
import {SidebarProps} from "./ISideBar";

import {useNavigate} from "react-router-dom";

const SidebarBaseMobile: React.FC<SidebarProps> = ({icons, labels, paths}) => {
    const [value, setValue] = React.useState(0);
    const navigate = useNavigate();

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue); // Actualiza el valor seleccionado
        navigate(paths[newValue]); // Redirige a la ruta correspondiente
    };

    return (
        <BottomNavigation sx={{
            width: '100%', "& .Mui-selected": {
                color: "#29BD8A !important",
            },
        }} value={value} onChange={handleChange}>
            {icons.map((Icon, index) => (
                <BottomNavigationAction
                    key={index}
                    label={labels[index]}
                    value={index}
                    icon={<Icon/>}
                />
            ))}

        </BottomNavigation>
    );
};

export default SidebarBaseMobile;
