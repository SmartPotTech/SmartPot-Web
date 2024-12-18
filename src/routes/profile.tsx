import { useAuthContext } from "../contexts/AuthContext";
import "../assets/styles/Profile.css";
import { useState } from "react";

export default function Profile() {
    const { user, updateUser } = useAuthContext();
    const [isEditing, setIsEditing] = useState(false);


    const [formValues, setFormValues] = useState({
        name: user?.name || "",
        lastname: user?.lastname || "",
        email: user?.email || "",
    });


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };


    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await updateUser(formValues);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <main className="mainContent">
            {!isEditing ? (
                <div className="cd__main">
                    <div className="profile-page">
                        <div className="content">
                            <div className="content__cover">
                                <div className="content__avatar"></div>
                                <div className="content__bull">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                            <div className="content__title">
                                <h1>{user?.name} {user?.lastname}</h1>
                                <span>Colombia</span>
                            </div>
                            <div className="content__description">
                                <p>{user?.email}</p>
                            </div>
                            <ul className="content__list">
                                <li><span>1</span>Cultivos</li>
                            </ul>
                            <div className="content__button">
                                <a
                                    className="button"
                                    href="#"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <div className="button__border"></div>
                                    <div className="button__bg"></div>
                                    <p className="button__text">Editar perfil</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center">Editar Perfil</h2>
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formValues.name}
                                onChange={handleInputChange}
                                placeholder="Tu nombre completo"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                                Apellido
                            </label>
                            <input
                                id="lastname"
                                name="lastname"
                                type="text"
                                value={formValues.lastname}
                                onChange={handleInputChange}
                                placeholder="Perez"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formValues.email}
                                onChange={handleInputChange}
                                placeholder="tu@email.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-center space-x-4 pt-4">
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ background: '#FF2929', color: 'white' }}
                                onClick={() => setIsEditing(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}
