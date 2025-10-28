import {useAuthContext} from "../contexts/AuthContext";
import {useState} from "react";
import {
    CalendarOutlined,
    EditOutlined,
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    SaveOutlined,
    UserOutlined
} from "@ant-design/icons";

export default function Profile() {
    const {user} = useAuthContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        lastname: user?.lastname || "",
        email: "juan.example@dfmakds.com",
        phone: "",
        location: "",
        joinDate: "2024-01-15"
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        console.log("Guardando cambios:", formData);
        setIsEditing(false);
    };

    return (
        <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                <div className="relative h-36 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
                    <div className="absolute -bottom-12 left-6">
                        <div
                            className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-md flex items-center justify-center">
                            <UserOutlined className="text-white text-3xl"/>
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="pt-14 px-6 pb-6">

                    {/* Botón Editar/Guardar */}
                    <div className="flex justify-end mb-4">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
                            >
                                <EditOutlined/>
                                Editar
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                            >
                                <SaveOutlined/>
                                Guardar
                            </button>
                        )}
                    </div>

                    {/* Nombre + Estado */}
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {formData.name} {formData.lastname}
                        </h1>
                        <span
                            className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
              Usuario Activo
            </span>
                    </div>

                    {/* Información */}
                    <div className="space-y-3">

                        {/* Nombre */}
                        <Item
                            label="Nombre"
                            icon={<UserOutlined className="text-emerald-600"/>}
                            isEditing={isEditing}
                            value={formData.name}
                            onChange={v => handleInputChange("name", v)}
                        />

                        {/* Apellido */}
                        <Item
                            label="Apellido"
                            icon={<UserOutlined className="text-emerald-600"/>}
                            isEditing={isEditing}
                            value={formData.lastname}
                            onChange={v => handleInputChange("lastname", v)}
                        />

                        {/* Email */}
                        <Item
                            label="Email"
                            icon={<MailOutlined className="text-cyan-600"/>}
                            isEditing={isEditing}
                            value={formData.email}
                            onChange={v => handleInputChange("email", v)}
                            type="email"
                        />

                        {/* Teléfono */}
                        <Item
                            label="Teléfono"
                            icon={<PhoneOutlined className="text-emerald-600"/>}
                            isEditing={isEditing}
                            value={formData.phone}
                            onChange={v => handleInputChange("phone", v)}
                            placeholder="Ingresa tu teléfono"
                        />

                        {/* Ubicación */}
                        <Item
                            label="Ubicación"
                            icon={<EnvironmentOutlined className="text-cyan-600"/>}
                            isEditing={isEditing}
                            value={formData.location}
                            onChange={v => handleInputChange("location", v)}
                            placeholder="Ingresa tu ubicación"
                        />


                        {/* Fecha de ingreso (no editable) */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                            <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-md">
                                <CalendarOutlined className="text-emerald-600"/>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500">Miembro desde</p>
                                <p className="font-medium text-slate-800">{formData.joinDate}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

interface ItemProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    isEditing: boolean;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
}

function Item({label, value, icon, isEditing, onChange, type = "text", placeholder}: ItemProps) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-md">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-xs text-slate-500">{label}</p>
                {isEditing ? (
                    <input
                        type={type}
                        value={value}
                        placeholder={placeholder}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                ) : (
                    <p className="font-medium text-slate-800">{value || "No especificado"}</p>
                )}
            </div>
        </div>
    );
}
