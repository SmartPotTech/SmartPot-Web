import { useAuthContext } from "../contexts/AuthContext.tsx";
import { useState } from "react";
import { EditOutlined, SaveOutlined, UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined } from "@ant-design/icons";
import "../assets/styles/Profile.css";

export default function Profile() {
    const { user } = useAuthContext();
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
                    <div></div> {/* Spacer */}
                    {!isEditing ? (
                        <a onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', color: '#00B074' }}>
                            <EditOutlined style={{ marginRight: '8px' }} />
                            <span>Editar Perfil</span>
                        </a>
                    ) : (
                        <a onClick={handleSave} style={{ cursor: 'pointer', color: '#00B074' }}>
                            <SaveOutlined style={{ marginRight: '8px' }} />
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

                {/* Lista de información - Reorganizada */}
                <div className="content__info">
                    <div className="info__item">
                        <div className="info__icon">
                            <UserOutlined style={{ color: '#00B074' }} />
                        </div>
                        <div className="info__content">
                            <strong>Nombre:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span>{formData.name}</span>
                            )}
                        </div>
                    </div>

                    <div className="info__item">
                        <div className="info__icon">
                            <UserOutlined style={{ color: '#00B074' }} />
                        </div>
                        <div className="info__content">
                            <strong>Apellido:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.lastname}
                                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span>{formData.lastname}</span>
                            )}
                        </div>
                    </div>

                    <div className="info__item">
                        <div className="info__icon">
                            <MailOutlined style={{ color: '#2D9CDB' }} />
                        </div>
                        <div className="info__content">
                            <strong>Email:</strong>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span>{formData.email}</span>
                            )}
                        </div>
                    </div>

                    <div className="info__item">
                        <div className="info__icon">
                            <PhoneOutlined style={{ color: '#00B074' }} />
                        </div>
                        <div className="info__content">
                            <strong>Teléfono:</strong>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span>{formData.phone || 'No especificado'}</span>
                            )}
                        </div>
                    </div>

                    <div className="info__item">
                        <div className="info__icon">
                            <EnvironmentOutlined style={{ color: '#2D9CDB' }} />
                        </div>
                        <div className="info__content">
                            <strong>Ubicación:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    className="info__input"
                                />
                            ) : (
                                <span>{formData.location || 'No especificada'}</span>
                            )}
                        </div>
                    </div>

                    <div className="info__item">
                        <div className="info__icon">
                            <CalendarOutlined style={{ color: '#00B074' }} />
                        </div>
                        <div className="info__content">
                            <strong>Miembro desde:</strong>
                            <span>{formData.joinDate}</span>
                        </div>
                    </div>
                </div>

                {/* Estadísticas del usuario */}
                <div className="content__stats">
                    <div className="stat__item">
                        <div className="stat__number">12</div>
                        <div className="stat__label">Cultivos Completados</div>
                    </div>
                    <div className="stat__item">
                        <div className="stat__number">3</div>
                        <div className="stat__label">Cultivos Activos</div>
                    </div>
                    <div className="stat__item">
                        <div className="stat__number">156</div>
                        <div className="stat__label">Días de Uso</div>
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