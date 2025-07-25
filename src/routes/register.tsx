import logo from "../assets/images/lechuga.png";
import React, {FormEvent, useEffect, useState} from "react";
import {useAuthContext} from "../contexts/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import Loading from "../components/Loading.tsx"

export default function Register() {
    const {register, isAuthenticated, error, loading} = useAuthContext();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        email: "",
        password: ""
    });

    useEffect(() => {
        console.log(isAuthenticated)
        if (isAuthenticated) {
            navigate("/panel")
        }
    }, [isAuthenticated]);

    const handleChange = (e: FormEvent<HTMLInputElement>) => {
        const {name, value} = e.currentTarget;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await register(formData.email, formData.password, formData.name, formData.lastname)
            .then(r => console.log(r))
            .catch(error => console.log(error));
    };

    if (loading) return (<Loading/>);

    return (
        <>
            {}
            <div id="loginCard" className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 ">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="smartpot"
                        src={logo}
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Create your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form
                        action="#"
                        method="POST"
                        className="space-y-6"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label htmlFor="name"
                                   className="block text-sm/6 font-medium text-gray-900 flex items-center justify-between">
                                Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    autoComplete="given-name"
                                    className="bg-white font-semibold p-2 block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-green-300 placeholder:text-green-400 focus:ring-2 focus:ring-inset focus:ring-green-300 sm:text-sm/6"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="lastname"
                                   className="block text-sm/6 font-medium text-gray-900 flex items-center justify-between">
                                Last Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="lastname"
                                    name="lastname"
                                    type="text"
                                    required
                                    autoComplete="family-name"
                                    className="bg-white font-semibold p-2 block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-green-300 placeholder:text-green-400 focus:ring-2 focus:ring-inset focus:ring-green-300 sm:text-sm/6"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email"
                                   className="block text-sm/6 font-medium text-gray-900 flex items-center justify-between">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="bg-white font-semibold p-2 block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-green-300 placeholder:text-green-400 focus:ring-2 focus:ring-inset focus:ring-green-300 sm:text-sm/6"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    className="bg-white font-semibold p-2 block w-full rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-green-300 placeholder:text-green-400 focus:ring-2 focus:ring-inset focus:ring-green-300 sm:text-sm/6"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <p className="mt-10 text-center text-sm/6 text-red-500">
                                {error}
                            </p>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="bg-main-colour flex w-full justify-center rounded-md px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                {loading ? ("Loading") : ("Sign up")}
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm/6 text-gray-500">
                        Do you have an account?{" "}
                        <a href="/auth/login" className="font-semibold text-green-600 hover:text-green-500">
                            Sign in to your account
                        </a>
                    </p>
                </div>
            </div>
        </>
    )
}