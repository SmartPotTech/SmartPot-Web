import {useAuthContext} from "../contexts/AuthContext.tsx";
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
import "../assets/styles/Profile.css";

export default function Profile() {
    const {user} = useAuthContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        lastname: user?.lastname || "",
        email: "usuario@ejemplo.com",
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
        <div className="profile-page">
            <div className="content">
                {/* Header con gradiente y avatar */}
                <div className="content__cover">
                    <div className="content__bull">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className="content__avatar"></div>
                </div>

                {/* Acciones (editar/guardar) */}
                <div className="content__actions">
                    <div></div>
                    {/* Spacer */}
                    {!isEditing ? (
                        <a onClick={() => setIsEditing(true)} style={{cursor: 'pointer', color: '#00B074'}}>
                            <EditOutlined style={{marginRight: '8px'}}/>
                            <span>Editar Perfil</span>
                        </a>
                    ) : (
                        <a onClick={handleSave} style={{cursor: 'pointer', color: '#00B074'}}>
                            <SaveOutlined style={{marginRight: '8px'}}/>
                            <span>Guardar Cambios</span>
                        </a>
                    )}
                </div>

                {/* Información del usuario */}
                <div className="content__title">
                    <h1>{formData.name} {formData.lastname}</h1>
                    <span>Usuario Activo</span>
                </div>

                <div className="content__description">
                    <p>
                        Gestiona tu información personal y configuración de cuenta.
                        Mantén tus datos actualizados para una mejor experiencia.
                    </p>
                </div>

                {/* Lista de información */}
                <div className="content__list">
                    <li>
                        <UserOutlined style={{color: '#00B074', marginRight: '10px'}}/>
                        <span>
                            <strong>Nombre:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span style={{marginLeft: '10px'}}>{formData.name}</span>
                            )}
                        </span>
                    </li>

                    <li>
                        <UserOutlined style={{color: '#00B074', marginRight: '10px'}}/>
                        <span>
                            <strong>Apellido:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.lastname}
                                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span style={{marginLeft: '10px'}}>{formData.lastname}</span>
                            )}
                        </span>
                    </li>

                    <li>
                        <MailOutlined style={{color: '#2D9CDB', marginRight: '10px'}}/>
                        <span>
                            <strong>Email:</strong>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span style={{marginLeft: '10px'}}>{formData.email}</span>
                            )}
                        </span>
                    </li>

                    <li>
                        <PhoneOutlined style={{color: '#00B074', marginRight: '10px'}}/>
                        <span>
                            <strong>Teléfono:</strong>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span style={{marginLeft: '10px'}}>{formData.phone || 'No especificado'}</span>
                            )}
                        </span>
                    </li>

                    <li>
                        <EnvironmentOutlined style={{color: '#2D9CDB', marginRight: '10px'}}/>
                        <span>
                            <strong>Ubicación:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span style={{marginLeft: '10px'}}>{formData.location || 'No especificada'}</span>
                            )}
                        </span>
                    </li>

                    <li>
                        <CalendarOutlined style={{color: '#00B074', marginRight: '10px'}}/>
                        <span>
                            <strong>Miembro desde:</strong>
                            <span style={{marginLeft: '10px'}}>{formData.joinDate}</span>
                        </span>
                    </li>
                </div>

                {/* Estadísticas del usuario */}
                <div style={{
                    padding: '20px',
                    margin: '20px',
                    backgroundColor: '#F3F2F7',
                    borderRadius: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '20px'
                }}>
                    <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#00B074'}}>12</div>
                        <div style={{fontSize: '14px', color: '#666'}}>Cultivos Completados</div>
                    </div>
                    <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#2D9CDB'}}>3</div>
                        <div style={{fontSize: '14px', color: '#666'}}>Cultivos Activos</div>
                    </div>
                    <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#00B074'}}>156</div>
                        <div style={{fontSize: '14px', color: '#666'}}>Días de Uso</div>
                    </div>
                </div>

                {/* Botón de acción */}
                <div className="content__button">
                    <button className="button" onClick={() => console.log("Cambiar contraseña")}>
                        Cambiar Contraseña
                    </button>
                </div>
            </div>
        </div>
    );
}