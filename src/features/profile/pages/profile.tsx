import {useAuthContext} from "../../auth";
import {useState} from "react";
import {
    CalendarOutlined,
    EditOutlined,
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    SaveOutlined,
    UserOutlined,
} from "@ant-design/icons";

const portada = "/portada.jpg";
export default function Profile() {
    const {user} = useAuthContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        lastname: user?.lastname || "",
        email: user?.email || "juan.example@dfmakds.com",
        phone: "",
        location: "",
        joinDate: "2025-10-30",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = () => {
        console.log("Guardando cambios:", formData);
        setIsEditing(false);
    };

    return (
        <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-4xl">
                <div className="relative h-40">
                    <img
                        alt="smartpot"
                        src={portada}
                        className="relative h-40 w-full opacity-90"
                    />
                    <div className="absolute -bottom-12 left-6">
                        <div
                            className="w-30 h-30 rounded-full border-4 text-white border-white bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-md flex items-center justify-center">
                            <UserOutlined className="text-5xl"/>
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="pt-14 px-6 pb-3">
                    {/* Botón Editar/Guardar */}
                    <div className="flex justify-end m-2">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 font-semibold"
                            >
                                <EditOutlined/>
                                Editar
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 flex-1 md:flex-none px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 font-semibold"
                            >
                                <SaveOutlined/>
                                Guardar
                            </button>
                        )}
                    </div>

                    {/* Nombre + Estado */}
                    <div className="mb-6 mt-3">
                        <h1 className="text-2xl font-bold text-slate-800">
                            {formData.name} {formData.lastname}
                        </h1>
                        <span
                            className="font-bold inline-flex mt-3 items-center px-5 py-1 rounded-full text-sm font-medium bg-emerald-100 border-2 border-emerald-700 text-emerald-800">
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
                            onChange={(v) => handleInputChange("name", v)}
                        />

                        {/* Apellido */}
                        <Item
                            label="Apellido"
                            icon={<UserOutlined className="text-emerald-600"/>}
                            isEditing={isEditing}
                            value={formData.lastname}
                            onChange={(v) => handleInputChange("lastname", v)}
                        />

                        {/* Email */}
                        <Item
                            label="Email"
                            icon={<MailOutlined className="text-cyan-600"/>}
                            isEditing={isEditing}
                            value={formData.email}
                            onChange={(v) => handleInputChange("email", v)}
                            type="email"
                        />

                        {/* Teléfono */}
                        <Item
                            label="Teléfono"
                            icon={<PhoneOutlined className="text-emerald-600"/>}
                            isEditing={isEditing}
                            value={formData.phone}
                            onChange={(v) => handleInputChange("phone", v)}
                            placeholder="Ingresa tu teléfono"
                        />

                        {/* Ubicación */}
                        <Item
                            label="Ubicación"
                            icon={<EnvironmentOutlined className="text-cyan-600"/>}
                            isEditing={isEditing}
                            value={formData.location}
                            onChange={(v) => handleInputChange("location", v)}
                            placeholder="Ingresa tu ubicación"
                        />

                        {/* Fecha de ingreso (no editable) */}
                        <div className="flex items-center gap-3 p-3 rounded-full bg-slate-100">
                            <div className="w-12 h-12 flex items-center justify-center bg-emerald-200 rounded-full">
                                <CalendarOutlined className="text-emerald-600"/>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500">Miembro desde</p>
                                <p className="font-medium text-slate-800">
                                    {formData.joinDate}
                                </p>
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

function Item({
                  label,
                  value,
                  icon,
                  isEditing,
                  onChange,
                  type = "text",
                  placeholder,
              }: ItemProps) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-full bg-slate-100">
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-200 rounded-full">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-slate-500">{label}</p>
                {isEditing ? (
                    <input
                        type={type}
                        value={value}
                        placeholder={placeholder}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded-full focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                ) : (
                    <p className="font-medium text-slate-800">
                        {value || "No especificado"}
                    </p>
                )}
            </div>
        </div>
    );
}
