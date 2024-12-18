import { useAuthContext } from "../contexts/AuthContext";
import "../assets/styles/Profile.css";
import {useEffect, useState} from "react";
import {getCrop, getNumCrop} from "../api/Api.tsx";
import {Crop} from "../types/ApiResponses.tsx";

export default function Profile() {

    const { user, updateUser} = useAuthContext();
    const [isEditing, setIsEditing] = useState(false);
    const [crop, setCrop] = useState<Crop | null>(null);
    const [numCrop, setNumCrop] = useState<number | null>(null);


    const fetchCrop = async () => {
        if (user) {
            try {
                const fetchedCrop = await getCrop(user);
                setCrop(fetchedCrop);
                console.log(fetchedCrop);
            } catch (error) {
                console.error("Error fetching crop or history data: ", error);
            }
        }
    };

    const fetchNumCrop= async () => {
        if (user) {
            try {
                const fetchedNumCrop = await getNumCrop(user);
                setNumCrop(fetchedNumCrop);
                console.log(fetchedNumCrop);
            } catch (error) {
                console.error("Error fetching crop or history data: ", error);
            }
        }
    }

    useEffect(() => {
        fetchCrop();
        fetchNumCrop()
    }, [user]);


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
        window.location.reload();
    };

    const handleCancel = () => {
        setIsEditing(false);
        window.location.reload(); // Recarga la página completamente
    };


    return (
        <>
            <main className="mainContent">
                {isEditing ? (
                    // Formulario de edición
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
                                    style={{background: '#FF2929', color: 'white'}}
                                    onClick={handleCancel}
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
                ) : (
                    // Contenedor de las cards
                    <div className="flex gap-8 p-4" style={{marginTop: '2rem'}}>
                        {/* Primera card - Perfil */}
                        <div style={{flex: '1 1 25%'}}>
                            <div className="cd__main">
                                <div className="profile-page">
                                    <div className="content">
                                        <div className="content__cover">
                                            <div className="content__avatar"></div>
                                            <div className="content__bull">
                                                <span></span><span></span><span></span><span></span><span></span>
                                            </div>
                                        </div>
                                        <div className="content__title">
                                            <h1>{user?.name} {user?.lastname}</h1><span>Colombia</span>
                                        </div>
                                        <div className="content__description">
                                            <p>{user?.email}</p>
                                        </div>
                                        <ul className="content__list">
                                            <li><span>{numCrop}</span>Cultivos</li>
                                        </ul>
                                        <div className="content__button">
                                            <a className="button" href="#" onClick={() => setIsEditing(true)}>
                                                <div className="button__border"></div>
                                                <div className="button__bg"></div>
                                                <p className="button__text">Editar perfil</p>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Segunda card - Lechuga */}
                        <div style={{flex: '1 1 20%'}}>
                            <div className="flex bg-white rounded-lg shadow-md overflow-hidden max-w-2xl"
                                 style={{padding: "1rem"}}>
                                {/* Image container */}
                                <div className="w-1/3 relative">
                                    <img
                                        src={"src/assets/images/lechuga.png"}
                                        alt={"title"}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                {/* Content container */}
                                <div className="w-2/3 p-6">
                                    {/* Category */}
                                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                                        El estado del cultivo
                                    </p>

                                    {/* Title */}
                                    <h2 className="mt-2 text-xl font-bold text-gray-900">
                                        {crop?.status || "Cargando..."}
                                    </h2>


                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
